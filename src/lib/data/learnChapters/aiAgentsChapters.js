/** @type {Record<string, import('../learnChapters.js').LessonLearnChapter>} */
export const aiAgentsChapters = {
  "ai-agents/agent-fundamentals": {
    "title": "Chapter: Agent architectures and patterns",
    "readingTime": "55-70 min",
    "premise": "ReAct, plan-and-execute, reflection, and multi-agent patterns for building autonomous AI systems. This Learn chapter expands the short lesson summary into a full study unit you can read continuously, with interactive checks and selection-based AI search when a phrase needs a second opinion.",
    "parts": [
      {
        "id": "orientation",
        "heading": "Why this chapter exists",
        "paragraphs": [
          "Agents are optional autonomy. In 2026 interviews, strong candidates explain when deterministic workflows beat agents, how approval gates bound risk, and why multi-agent coordination is a cost center unless specialization truly pays.",
          "This chapter treats \"Agent architectures and patterns\" as a readable study unit: intuition first, then the mechanics you must be able to explain, then the failure modes that show up in interviews and production, and finally how to talk about the topic under time pressure.",
          "Read it like a book chapter. When a phrase is unclear, select it inside the Learn reader and use Search with AI to open Google, Perplexity, or DuckDuckGo without abandoning the chapter."
        ],
        "callout": {
          "tone": "tip",
          "body": "Target reading time is paced for depth, not skimming. Pause at each Check yourself prompt and answer out loud before revealing the guide answer."
        }
      },
      {
        "id": "the-agent-loop-as-a-state-machine",
        "heading": "The agent loop as a state machine",
        "paragraphs": [
          "An agent maintains state: goal, memory/scratchpad, tool results, and step count. Each iteration, a policy (often an LLM) chooses an action: call a tool, ask the user, or finish. Observations update state. This is closer to a controller than to a single prompt. Draw states and transitions explicitly: Init -> Plan -> Tool -> Integrate -> Done/Fail. Caps on steps and wall-clock time are part of the design, not ops afterthoughts. In-browser we simulate the loop with mocked tools and deterministic policies so you can test control flow without APIs. Autonomy without observability is just an unattended script with a language model attached.",
          "Hold these points explicitly while you study. Restate each one without looking at the list — recognition is not the interview bar; recall is.",
          "• Model agents as state machines with explicit budgets.",
          "• Separate policy choice from tool execution.",
          "• Define Done/Fail terminal conditions up front.",
          "Production lens — Agents are budgeted control loops over contracts: The durable abstraction is observe → plan/act → update memory until a stop condition—not unbounded autonomy. Mid-2026 systems encode stop conditions as hard budgets (steps, tokens, wall-clock), structured outputs, and human handoff. ReAct-style interleaving still helps tool selection, but production reliability comes from contracts around tools and state more than from longer chain-of-thought.\n\nPrefer deterministic workflows when the path is known (form submit, ETL, fixed approval chain). Reserve agents for ambiguous multi-step work where branching depends on observations. Teams that “agentify” CRUD create cost and failure modes without upside. Architecture reviews should start from the task graph and privilege set, then decide whether an LLM loop belongs at all."
        ],
        "keyTerms": [
          {
            "term": "Model agents as state machines with",
            "definition": "Model agents as state machines with explicit budgets."
          },
          {
            "term": "Separate policy choice from tool execution.",
            "definition": "Separate policy choice from tool execution."
          },
          {
            "term": "Define Done/Fail terminal conditions up front.",
            "definition": "Define Done/Fail terminal conditions up front."
          }
        ],
        "workedExample": {
          "title": "Toy ReAct-style loop with mocked tools",
          "body": "Narrate what each shape and step is doing. If you only recognize the API call, you do not own the idea yet — rewrite the example from memory after one pass.",
          "code": "def search(q):\n    return \"Weather API says 72F sunny\" if \"weather\" in q.lower() else \"No results\"\n\ntools = {\"search\": search}\n\ndef agent(goal, max_steps=3):\n    scratch = []\n    for step in range(max_steps):\n        # naive policy: search once then finish\n        if not scratch:\n            obs = tools[\"search\"](goal)\n            scratch.append(obs)\n            continue\n        return {\"final\": scratch[-1], \"steps\": step+1}\n    return {\"final\": \"budget exceeded\", \"steps\": max_steps}\n\nprint(agent(\"What is the weather in Austin?\"))",
          "language": "python"
        },
        "checkYourself": [
          {
            "prompt": "Can draw an agent state machine with budgets.",
            "reveal": "The durable abstraction is observe → plan/act → update memory until a stop condition—not unbounded autonomy. Mid-2026 systems encode stop conditions as hard budgets (steps, tokens, wall-clock), structured outputs, and human handoff. ReAct-style interleaving still helps tool selection, but production reliability comes from contracts around tools and state more than from longer chain-of-thought.\n\nPrefer deterministic workflows when the path is known (form submit, ETL, fixed approval chain). Reserve agents for ambiguous multi-step work where branching depends on observations. Teams that “agentify” CRUD create cost and failure modes without upside. Architecture reviews should start from the task graph and privilege set, then decide whether an LLM loop belongs at all."
          }
        ]
      },
      {
        "id": "planning-styles-react-plan-then-execute-multi-agent",
        "heading": "Planning styles: ReAct, plan-then-execute, multi-agent",
        "paragraphs": [
          "ReAct interleaves thoughts and actions—flexible but can wander. Plan-then-execute drafts steps first—more inspectable, less adaptive mid-flight. Multi-agent systems split roles (researcher, coder, critic) at the cost of coordination complexity and cascading errors. Choose the simplest loop that meets reliability targets. For many enterprise tasks, a structured workflow with LLM steps beats a free-form autonomous agent. Autonomy is a dial, not a badge of honor. Write the stop conditions before the clever planning prompts; most incidents are loops and overspend.",
          "Hold these points explicitly while you study. Restate each one without looking at the list — recognition is not the interview bar; recall is.",
          "• Prefer structured workflows when steps are known.",
          "• Use free-form agents when tool paths are highly variable.",
          "• Multi-agent needs protocols and shared critique criteria.",
          "Production lens — MCP and shared tool protocols reduce glue—and clarify trust boundaries: The Model Context Protocol (MCP) standardizes how hosts discover tools/resources and exchange context with servers. Whether you adopt MCP or an internal equivalent, the industry direction is clear: typed tool surfaces, negotiated capabilities, and explicit client/server boundaries beat one-off adapters per model vendor. Shared protocols make authz, logging, and least privilege enforceable in one place.\n\nProtocol adoption does not remove threat models. Tool servers still need authentication, scoped credentials, and output sanitation against indirect injection. Multi-agent designs (planner/worker/critic) should pass typed artifacts, not free-form telepathy, and must attribute costs per agent role. Eval on trajectories—success, steps, policy violations—belongs in the same harness as chat quality."
        ],
        "keyTerms": [
          {
            "term": "Prefer structured workflows when steps are",
            "definition": "Prefer structured workflows when steps are known."
          },
          {
            "term": "Use free-form agents when tool paths",
            "definition": "Use free-form agents when tool paths are highly variable."
          },
          {
            "term": "Multi-agent needs protocols and shared critique",
            "definition": "Multi-agent needs protocols and shared critique criteria."
          }
        ],
        "checkYourself": [
          {
            "prompt": "Chooses ReAct vs workflow deliberately.",
            "reveal": "The Model Context Protocol (MCP) standardizes how hosts discover tools/resources and exchange context with servers. Whether you adopt MCP or an internal equivalent, the industry direction is clear: typed tool surfaces, negotiated capabilities, and explicit client/server boundaries beat one-off adapters per model vendor. Shared protocols make authz, logging, and least privilege enforceable in one place.\n\nProtocol adoption does not remove threat models. Tool servers still need authentication, scoped credentials, and output sanitation against indirect injection. Multi-agent designs (planner/worker/critic) should pass typed artifacts, not free-form telepathy, and must attribute costs per agent role. Eval on trajectories—success, steps, policy violations—belongs in the same harness as chat quality."
          }
        ]
      },
      {
        "id": "memory-scratchpads-episodic-logs-and-retrieval",
        "heading": "Memory: scratchpads, episodic logs, and retrieval",
        "paragraphs": [
          "Short-term scratchpads hold intermediate tool outputs for the current task. Long-term memory stores user prefs or prior tickets via databases/vector stores—with privacy controls. Summarize aggressively; dumping full histories blows context. Memory write policies matter: what is allowed to persist? Incorrect memories cause confident future mistakes. Test memory poisoning attacks (malicious content that gets stored and later trusted). Scratchpad contents should be structured (JSON) so later steps do not re-parse messy prose.",
          "Hold these points explicitly while you study. Restate each one without looking at the list — recognition is not the interview bar; recall is.",
          "• Distinguish working memory from durable memory.",
          "• Summarize before persisting.",
          "• Threat-model memory poisoning.",
          "Production lens — Memory policy is a privacy and correctness feature: Short-term context, session scratchpads, and long-term stores (vector or structured) each need write/forget policies. Unbounded memory causes drift, cross-session leakage, and prompt-injection persistence. Store what improves task success; expire or redact what creates compliance risk. Reflection-style summaries help long tasks but must be treated as untrusted text when fed back as instructions.\n\nConnect agent fundamentals to serving and governance: tool privileges appear in the AI system inventory; trajectory logs feed eval; budgets protect unit economics. Strong mid-2026 answers mention MCP-style contracts, trajectory eval, and dual-control writes in the same breath as ReAct."
        ],
        "keyTerms": [
          {
            "term": "Distinguish working memory from durable memory.",
            "definition": "Distinguish working memory from durable memory."
          },
          {
            "term": "Summarize before persisting.",
            "definition": "Summarize before persisting."
          },
          {
            "term": "Threat-model memory poisoning.",
            "definition": "Threat-model memory poisoning."
          }
        ],
        "checkYourself": [
          {
            "prompt": "Separates working vs durable memory.",
            "reveal": "Short-term context, session scratchpads, and long-term stores (vector or structured) each need write/forget policies. Unbounded memory causes drift, cross-session leakage, and prompt-injection persistence. Store what improves task success; expire or redact what creates compliance risk. Reflection-style summaries help long tasks but must be treated as untrusted text when fed back as instructions.\n\nConnect agent fundamentals to serving and governance: tool privileges appear in the AI system inventory; trajectory logs feed eval; budgets protect unit economics. Strong mid-2026 answers mention MCP-style contracts, trajectory eval, and dual-control writes in the same breath as ReAct."
          }
        ]
      },
      {
        "id": "reliability-budgets-idempotency-human-checkpoints",
        "heading": "Reliability: budgets, idempotency, human checkpoints",
        "paragraphs": [
          "Cap tool calls, tokens, and dollars per request. Make side-effecting tools idempotent or require confirmation. Insert human-in-the-loop approvals for irreversible actions (refunds, emails outbound, production deploys). Provide transcripts for audit. An agent that cannot explain which tools it called is not shippable in regulated contexts. Prefer confirming irreversible actions even when the model is 'sure'.",
          "Hold these points explicitly while you study. Restate each one without looking at the list — recognition is not the interview bar; recall is.",
          "• Budget steps/tokens/cost per run.",
          "• Approve irreversible tools explicitly.",
          "• Retain auditable transcripts.",
          "Production lens — Agents are budgeted control loops over contracts: The durable abstraction is observe → plan/act → update memory until a stop condition—not unbounded autonomy. Mid-2026 systems encode stop conditions as hard budgets (steps, tokens, wall-clock), structured outputs, and human handoff. ReAct-style interleaving still helps tool selection, but production reliability comes from contracts around tools and state more than from longer chain-of-thought.\n\nPrefer deterministic workflows when the path is known (form submit, ETL, fixed approval chain). Reserve agents for ambiguous multi-step work where branching depends on observations. Teams that “agentify” CRUD create cost and failure modes without upside. Architecture reviews should start from the task graph and privilege set, then decide whether an LLM loop belongs at all."
        ],
        "keyTerms": [
          {
            "term": "Budget steps/tokens/cost per run.",
            "definition": "Budget steps/tokens/cost per run."
          },
          {
            "term": "Approve irreversible tools explicitly.",
            "definition": "Approve irreversible tools explicitly."
          },
          {
            "term": "Retain auditable transcripts.",
            "definition": "Retain auditable transcripts."
          }
        ],
        "workedExample": {
          "title": "Enforce a step/cost budget",
          "body": "Narrate what each shape and step is doing. If you only recognize the API call, you do not own the idea yet — rewrite the example from memory after one pass.",
          "code": "def run_with_budget(actions, max_cost=3.0):\n    cost = 0.0\n    log = []\n    for name, action_cost in actions:\n        if cost + action_cost > max_cost:\n            log.append((\"stop\", name, cost))\n            break\n        cost += action_cost\n        log.append((\"run\", name, cost))\n    return log\n\nprint(run_with_budget([(\"search\", 1.0), (\"search\", 1.0), (\"email\", 2.0), (\"done\", 0.0)]))",
          "language": "python"
        },
        "checkYourself": [
          {
            "prompt": "Requires approval for irreversible tools.",
            "reveal": "Explain the idea in two sentences, name one metric or invariant you would watch, and state one mistake juniors make. Then connect it back to reliability: budgets, idempotency, human checkpoints."
          }
        ]
      },
      {
        "id": "evaluation-of-agent-behavior",
        "heading": "Evaluation of agent behavior",
        "paragraphs": [
          "Evaluate task success, unnecessary tool calls, harmful actions blocked, and average cost. Use scripted environments with mocked tools for CI. Measure trajectory length and whether the agent stops appropriately. Offline suites beat vibe checks. Compare against a non-agent baseline workflow—agents must earn their complexity. Compare agent pass rates to a scripted workflow baseline every time you add tools.",
          "Hold these points explicitly while you study. Restate each one without looking at the list — recognition is not the interview bar; recall is.",
          "• Score success, safety, and cost together.",
          "• Mock tool environments for CI.",
          "• Baseline against simpler workflows.",
          "Production lens — MCP and shared tool protocols reduce glue—and clarify trust boundaries: The Model Context Protocol (MCP) standardizes how hosts discover tools/resources and exchange context with servers. Whether you adopt MCP or an internal equivalent, the industry direction is clear: typed tool surfaces, negotiated capabilities, and explicit client/server boundaries beat one-off adapters per model vendor. Shared protocols make authz, logging, and least privilege enforceable in one place.\n\nProtocol adoption does not remove threat models. Tool servers still need authentication, scoped credentials, and output sanitation against indirect injection. Multi-agent designs (planner/worker/critic) should pass typed artifacts, not free-form telepathy, and must attribute costs per agent role. Eval on trajectories—success, steps, policy violations—belongs in the same harness as chat quality."
        ],
        "keyTerms": [
          {
            "term": "Score success, safety, and cost together.",
            "definition": "Score success, safety, and cost together."
          },
          {
            "term": "Mock tool environments for CI.",
            "definition": "Mock tool environments for CI."
          },
          {
            "term": "Baseline against simpler workflows.",
            "definition": "Baseline against simpler workflows."
          }
        ],
        "checkYourself": [
          {
            "prompt": "Evaluates trajectories, not only final text.",
            "reveal": "Explain the idea in two sentences, name one metric or invariant you would watch, and state one mistake juniors make. Then connect it back to evaluation of agent behavior."
          }
        ]
      },
      {
        "id": "when-not-to-use-agents-workflows-approvals-and-multi-agent-cost",
        "heading": "When not to use agents: workflows, approvals, and multi-agent cost",
        "paragraphs": [
          "An agent earns its complexity only when the next action truly depends on model judgment under uncertainty. If the steps are known—authenticate, fetch account, compute refund eligibility, write ledger, notify—implement a deterministic workflow or explicit state machine with typed inputs. Autonomous loops (LLM chooses tools until a stop condition) add nondeterminism, spend variance, and failure modes that are hard to replay. Prefer workflow graphs with LLM nodes at narrow judgment points (classify intent, draft message) rather than letting the model own the whole control plane. Human approval gates belong before irreversible side effects: payments, emails to customers, production config changes, deleting data. Make approvals first-class states with timeouts and audit logs, not a prompt suggestion the model can ignore. Multi-agent designs (researcher/writer/reviewer, or planner/executor) help when specialization or independent verification reduces error enough to pay for coordination: extra tokens, race conditions, shared-memory bugs, and blame diffusion. If one well-tooled agent with a checklist outperforms a committee in your evals, ship the simpler system. Interview signal: say “we tried an agent and reverted to a workflow after measuring loop spend and flake rate,” not only “agents are the future.”",
          "Hold these points explicitly while you study. Restate each one without looking at the list — recognition is not the interview bar; recall is.",
          "• Default to deterministic workflows; add autonomy only at uncertain decision points.",
          "• Use explicit graphs with budgets and stop conditions rather than unbounded loops.",
          "• Require human approval states before destructive or externally visible actions.",
          "• Adopt multi-agent designs only when specialization/verification beats coordination cost on evals.",
          "Production lens — Memory policy is a privacy and correctness feature: Short-term context, session scratchpads, and long-term stores (vector or structured) each need write/forget policies. Unbounded memory causes drift, cross-session leakage, and prompt-injection persistence. Store what improves task success; expire or redact what creates compliance risk. Reflection-style summaries help long tasks but must be treated as untrusted text when fed back as instructions.\n\nConnect agent fundamentals to serving and governance: tool privileges appear in the AI system inventory; trajectory logs feed eval; budgets protect unit economics. Strong mid-2026 answers mention MCP-style contracts, trajectory eval, and dual-control writes in the same breath as ReAct."
        ],
        "keyTerms": [
          {
            "term": "Default to deterministic workflows; add autonomy",
            "definition": "Default to deterministic workflows; add autonomy only at uncertain decision points."
          },
          {
            "term": "Use explicit graphs with budgets and",
            "definition": "Use explicit graphs with budgets and stop conditions rather than unbounded loops."
          },
          {
            "term": "Require human approval states before destructive",
            "definition": "Require human approval states before destructive or externally visible actions."
          },
          {
            "term": "Adopt multi-agent designs only when specializ…",
            "definition": "Adopt multi-agent designs only when specialization/verification beats coordination cost on evals."
          }
        ],
        "workedExample": {
          "title": "Workflow vs autonomous loop cost sketch",
          "body": "Narrate what each shape and step is doing. If you only recognize the API call, you do not own the idea yet — rewrite the example from memory after one pass.",
          "code": "def workflow_cost(steps, tokens_per_step=300, price=0.01):\n    return steps * tokens_per_step / 1000.0 * price\n\ndef agent_cost(max_loops, tokens_per_loop=1200, price=0.01, stop_at=None):\n    loops = stop_at if stop_at is not None else max_loops\n    return loops * tokens_per_loop / 1000.0 * price\n\nprint(\"workflow\", round(workflow_cost(4), 4))\nprint(\"agent_avg\", round(agent_cost(8, stop_at=5), 4))\nprint(\"agent_worst\", round(agent_cost(8), 4))",
          "language": "python"
        },
        "checkYourself": [
          {
            "prompt": "Can name three product flows that should stay deterministic.",
            "reveal": "Explain the idea in two sentences, name one metric or invariant you would watch, and state one mistake juniors make. Then connect it back to when not to use agents: workflows, approvals, and multi-agent cost."
          }
        ],
        "callout": {
          "tone": "interview",
          "body": "Interview framing: define the term, give a tiny example, say when you would not use it, and name the metric that proves it worked."
        }
      },
      {
        "id": "failure-modes",
        "heading": "Failure modes and anti-patterns",
        "paragraphs": [
          "Most interview answers fail not because the definition is wrong, but because the candidate never names how the approach breaks. Use this section as a trap checklist for agent architectures and patterns.",
          "Trap: Unlimited loops without budgets. A strong answer preempts it — say what you would monitor, what fallback you would keep, or what simpler baseline you would try first.",
          "Trap: Side-effecting tools without idempotency/approvals. A strong answer preempts it — say what you would monitor, what fallback you would keep, or what simpler baseline you would try first.",
          "Trap: Persisting untrusted content into memory. A strong answer preempts it — say what you would monitor, what fallback you would keep, or what simpler baseline you would try first.",
          "Trap: No comparison to a simpler non-agent flow. A strong answer preempts it — say what you would monitor, what fallback you would keep, or what simpler baseline you would try first.",
          "Trap: Wrapping a fixed ETL-like process in an autonomous agent loop. A strong answer preempts it — say what you would monitor, what fallback you would keep, or what simpler baseline you would try first.",
          "Trap: Letting the model self-approve refunds or emails. A strong answer preempts it — say what you would monitor, what fallback you would keep, or what simpler baseline you would try first.",
          "Trap: Adding agents for resume keywords without eval proof. A strong answer preempts it — say what you would monitor, what fallback you would keep, or what simpler baseline you would try first."
        ],
        "callout": {
          "tone": "warning",
          "body": "If you cannot name a failure mode, you do not yet understand the technique well enough to ship or defend it."
        },
        "checkYourself": [
          {
            "prompt": "Pick the most dangerous pitfall for Agent architectures and patterns and explain how you would detect it in production or on a whiteboard.",
            "reveal": "Start with: \"Unlimited loops without budgets.\" Then add a detection signal (metric, test, or review question) and a mitigation."
          }
        ]
      },
      {
        "id": "deeper-lens",
        "heading": "A deeper production lens",
        "paragraphs": [
          "Agents are budgeted control loops over contracts. The durable abstraction is observe → plan/act → update memory until a stop condition—not unbounded autonomy. Mid-2026 systems encode stop conditions as hard budgets (steps, tokens, wall-clock), structured outputs, and human handoff. ReAct-style interleaving still helps tool selection, but production reliability comes from contracts around tools and state more than from longer chain-of-thought.\n\nPrefer deterministic workflows when the path is known (form submit, ETL, fixed approval chain). Reserve agents for ambiguous multi-step work where branching depends on observations. Teams that “agentify” CRUD create cost and failure modes without upside. Architecture reviews should start from the task graph and privilege set, then decide whether an LLM loop belongs at all.",
          "MCP and shared tool protocols reduce glue—and clarify trust boundaries. The Model Context Protocol (MCP) standardizes how hosts discover tools/resources and exchange context with servers. Whether you adopt MCP or an internal equivalent, the industry direction is clear: typed tool surfaces, negotiated capabilities, and explicit client/server boundaries beat one-off adapters per model vendor. Shared protocols make authz, logging, and least privilege enforceable in one place.\n\nProtocol adoption does not remove threat models. Tool servers still need authentication, scoped credentials, and output sanitation against indirect injection. Multi-agent designs (planner/worker/critic) should pass typed artifacts, not free-form telepathy, and must attribute costs per agent role. Eval on trajectories—success, steps, policy violations—belongs in the same harness as chat quality.",
          "Memory policy is a privacy and correctness feature. Short-term context, session scratchpads, and long-term stores (vector or structured) each need write/forget policies. Unbounded memory causes drift, cross-session leakage, and prompt-injection persistence. Store what improves task success; expire or redact what creates compliance risk. Reflection-style summaries help long tasks but must be treated as untrusted text when fed back as instructions.\n\nConnect agent fundamentals to serving and governance: tool privileges appear in the AI system inventory; trajectory logs feed eval; budgets protect unit economics. Strong mid-2026 answers mention MCP-style contracts, trajectory eval, and dual-control writes in the same breath as ReAct."
        ],
        "keyTerms": [
          {
            "term": "Agents are budgeted control loops over contracts",
            "definition": "The durable abstraction is observe → plan/act → update memory until a stop condition—not unbounded autonomy. Mid-2026 systems encode stop conditions as hard budgets (steps, tokens, wall-clock), structured outputs, and hu…"
          },
          {
            "term": "MCP and shared tool protocols reduce glue—and clarify trust boundaries",
            "definition": "The Model Context Protocol (MCP) standardizes how hosts discover tools/resources and exchange context with servers. Whether you adopt MCP or an internal equivalent, the industry direction is clear: typed tool surfaces, n…"
          },
          {
            "term": "Memory policy is a privacy and correctness feature",
            "definition": "Short-term context, session scratchpads, and long-term stores (vector or structured) each need write/forget policies. Unbounded memory causes drift, cross-session leakage, and prompt-injection persistence. Store what imp…"
          }
        ],
        "callout": {
          "tone": "tip",
          "body": "These notes stretch past the primer. Reach for them when the interviewer asks what you would worry about at scale."
        }
      },
      {
        "id": "synthesis",
        "heading": "Putting it together",
        "paragraphs": [
          "You should now be able to teach agent architectures and patterns as a story: what problem it solves, how the mechanism works, which assumptions it depends on, and how you would know it failed.",
          "Close the loop by writing a 90-second spoken answer out loud. If you freeze on definitions, return to the orientation and the first technical part. If you freeze on trade-offs, return to failure modes.",
          "Practice prompts from this lesson: When is an agent worse than a fixed workflow? | How do you prevent infinite tool-calling loops? | Design memory for a support agent with PII constraints."
        ],
        "checkYourself": [
          {
            "prompt": "Give a 90-second spoken overview of Agent architectures and patterns as if starting an interview answer.",
            "reveal": "Structure: (1) one-sentence definition, (2) one concrete example, (3) one trade-off or limitation, (4) one metric or validation step. Keep jargon only where it earns precision."
          }
        ],
        "callout": {
          "tone": "interview",
          "body": "Strong candidates narrate decisions. Weak candidates list buzzwords. Prefer a small correct example over a broad incomplete taxonomy."
        }
      }
    ],
    "wrapUp": {
      "takeaways": [
        "Can draw an agent state machine with budgets.",
        "Chooses ReAct vs workflow deliberately.",
        "Separates working vs durable memory.",
        "Requires approval for irreversible tools.",
        "Evaluates trajectories, not only final text."
      ],
      "nextSteps": [
        "Return to the lesson page and attempt the practice / topic lab with this chapter still open if needed.",
        "Revisit any Check yourself prompts you could not answer out loud.",
        "Optional deeper reading: Model Context Protocol specification (MCP) — https://modelcontextprotocol.io/specification/2025-11-25/",
        "Optional deeper reading: ReAct: Synergizing Reasoning and Acting in Language Models (arXiv) — https://arxiv.org/abs/2210.03629"
      ]
    }
  },
  "ai-agents/tool-use-and-function-calling": {
    "title": "Chapter: Tool use and function calling",
    "readingTime": "55-70 min",
    "premise": "Designing tool interfaces, function schemas, error handling, and safety guardrails for agents that interact with external systems. This Learn chapter expands the short lesson summary into a full study unit you can read continuously, with interactive checks and selection-based AI search when a phrase needs a second opinion.",
    "parts": [
      {
        "id": "orientation",
        "heading": "Why this chapter exists",
        "paragraphs": [
          "Tool use is production API design under adversarial inputs: typed contracts, idempotency, least privilege, destructive confirmations, discoverable catalogs (MCP-style), and offline contract tests that do not need a live model.",
          "This chapter treats \"Tool use and function calling\" as a readable study unit: intuition first, then the mechanics you must be able to explain, then the failure modes that show up in interviews and production, and finally how to talk about the topic under time pressure.",
          "Read it like a book chapter. When a phrase is unclear, select it inside the Learn reader and use Search with AI to open Google, Perplexity, or DuckDuckGo without abandoning the chapter."
        ],
        "callout": {
          "tone": "tip",
          "body": "Target reading time is paced for depth, not skimming. Pause at each Check yourself prompt and answer out loud before revealing the guide answer."
        }
      },
      {
        "id": "schemas-as-contracts",
        "heading": "Schemas as contracts",
        "paragraphs": [
          "Function calling exposes JSON schemas describing tools: name, description, parameters, required fields, enums. Good descriptions improve routing; ambiguous names cause misfires. Keep tools small and composable. Prefer returning structured data over prose. Version schemas and reject unknown fields. In-browser we practice schema validation and dispatch tables without live model APIs. Tool descriptions are UX copy for the model; ambiguous verbs are routing bugs waiting to happen. Tool descriptions are UX copy for the model; ambiguous verbs are routing bugs waiting to happen.",
          "Hold these points explicitly while you study. Restate each one without looking at the list — recognition is not the interview bar; recall is.",
          "• Write schemas for machines and for model routing clarity.",
          "• Keep tools narrowly scoped.",
          "• Version and validate strictly.",
          "Production lens — Schema design is API design: Tool descriptions, parameter types, and required fields directly affect call accuracy. Ambiguous names (\"search\" vs \"search_products\") and overly nested JSON schemas increase malformed calls. Provide enums, examples, and error messages surfaced back to the model for self-correction. Idempotent tools and timeouts prevent runaway agent loops from causing side effects."
        ],
        "keyTerms": [
          {
            "term": "Write schemas for machines and for",
            "definition": "Write schemas for machines and for model routing clarity."
          },
          {
            "term": "Keep tools narrowly scoped.",
            "definition": "Keep tools narrowly scoped."
          },
          {
            "term": "Version and validate strictly.",
            "definition": "Version and validate strictly."
          }
        ],
        "workedExample": {
          "title": "Dispatch a validated tool call",
          "body": "Narrate what each shape and step is doing. If you only recognize the API call, you do not own the idea yet — rewrite the example from memory after one pass.",
          "code": "import json\n\nSCHEMAS = {\n    \"get_weather\": {\"required\": [\"city\"], \"properties\": {\"city\": str, \"units\": str}},\n}\n\ndef validate_call(name, args):\n    schema = SCHEMAS[name]\n    if not set(schema[\"required\"]).issubset(args):\n        raise ValueError(\"missing required\")\n    return args\n\ndef get_weather(city, units=\"metric\"):\n    return {\"city\": city, \"temp\": 22, \"units\": units}\n\ndispatch = {\"get_weather\": get_weather}\nargs = validate_call(\"get_weather\", {\"city\": \"Austin\"})\nprint(dispatch[\"get_weather\"](**args))",
          "language": "python"
        },
        "checkYourself": [
          {
            "prompt": "Can write a clear JSON tool schema.",
            "reveal": "Tool descriptions, parameter types, and required fields directly affect call accuracy. Ambiguous names (\"search\" vs \"search_products\") and overly nested JSON schemas increase malformed calls. Provide enums, examples, and error messages surfaced back to the model for self-correction. Idempotent tools and timeouts prevent runaway agent loops from causing side effects."
          }
        ]
      },
      {
        "id": "argument-validation-and-normalization",
        "heading": "Argument validation and normalization",
        "paragraphs": [
          "Models emit almost-correct JSON: wrong types, extra keys, ISO dates with junk, city names with whitespace. Normalize (strip, casefold enums) then validate. On failure, return errors the policy can use for a single retry. Do not re-prompt endlessly. For numbers and IDs, prefer explicit formats and examples in the schema description. Unit-test validators with a corpus of messy model outputs captured from staging. Normalize enums and identifiers before privilege checks so casefolding cannot bypass allowlists. Normalize enums and identifiers before privilege checks so casefolding cannot bypass allowlists.",
          "Hold these points explicitly while you study. Restate each one without looking at the list — recognition is not the interview bar; recall is.",
          "• Normalize then validate; fail closed.",
          "• One retry with error context is usually enough.",
          "• Save messy outputs as regression fixtures.",
          "Production lens — Parallel vs sequential tool calls trade latency for correctness: Independent reads can be parallelized; writes often need ordering and confirmation. Some APIs expose parallel function calling natively; others require explicit orchestration. Validate tool outputs before feeding them back—models treat JSON as ground truth even when the tool returned partial errors."
        ],
        "keyTerms": [
          {
            "term": "Normalize then validate; fail closed.",
            "definition": "Normalize then validate; fail closed."
          },
          {
            "term": "One retry with error context is",
            "definition": "One retry with error context is usually enough."
          },
          {
            "term": "Save messy outputs as regression fixtures.",
            "definition": "Save messy outputs as regression fixtures."
          }
        ],
        "checkYourself": [
          {
            "prompt": "Validates/normalizes arguments before dispatch.",
            "reveal": "Independent reads can be parallelized; writes often need ordering and confirmation. Some APIs expose parallel function calling natively; others require explicit orchestration. Validate tool outputs before feeding them back—models treat JSON as ground truth even when the tool returned partial errors."
          }
        ]
      },
      {
        "id": "permissions-and-side-effects",
        "heading": "Permissions and side effects",
        "paragraphs": [
          "Read-only tools differ from mutators. Gate mutators by role, risk score, and confirmation. Provide dry-run modes. Audit logs should include who/what/when/why (prompt hash). Sandbox network tools with egress allowlists. Least privilege applies to agents as much as to microservices. Side-effecting tools deserve the same review rigor as public HTTP mutating endpoints. Side-effecting tools deserve the same review rigor as public HTTP mutating endpoints.",
          "Hold these points explicitly while you study. Restate each one without looking at the list — recognition is not the interview bar; recall is.",
          "• Separate read vs write tool tiers.",
          "• Dry-run and confirm high-impact actions.",
          "• Audit tool invocations thoroughly.",
          "Production lens — Schema design is API design: Tool descriptions, parameter types, and required fields directly affect call accuracy. Ambiguous names (\"search\" vs \"search_products\") and overly nested JSON schemas increase malformed calls. Provide enums, examples, and error messages surfaced back to the model for self-correction. Idempotent tools and timeouts prevent runaway agent loops from causing side effects."
        ],
        "keyTerms": [
          {
            "term": "Separate read vs write tool tiers.",
            "definition": "Separate read vs write tool tiers."
          },
          {
            "term": "Dry-run and confirm high-impact actions.",
            "definition": "Dry-run and confirm high-impact actions."
          },
          {
            "term": "Audit tool invocations thoroughly.",
            "definition": "Audit tool invocations thoroughly."
          }
        ],
        "checkYourself": [
          {
            "prompt": "Gates side-effecting tools.",
            "reveal": "Explain the idea in two sentences, name one metric or invariant you would watch, and state one mistake juniors make. Then connect it back to permissions and side effects."
          }
        ]
      },
      {
        "id": "routing-who-chooses-the-tool",
        "heading": "Routing: who chooses the tool?",
        "paragraphs": [
          "The model may choose tools via function-calling APIs, or a router classifier/rules engine may choose first. Hybrid approaches constrain the candidate tool set by intent. Fewer tools improve routing accuracy. Measure tool precision/ recall on labeled transcripts. Confusion between similarly named tools is common—rename ruthlessly. Capture production argument failures into fixtures; they are better than synthetic fuzz for validators. Capture production argument failures into fixtures; they are better than synthetic fuzz for validators.",
          "Hold these points explicitly while you study. Restate each one without looking at the list — recognition is not the interview bar; recall is.",
          "• Limit candidate tools per intent when possible.",
          "• Measure routing precision/recall.",
          "• Rename overlapping tools.",
          "Production lens — Parallel vs sequential tool calls trade latency for correctness: Independent reads can be parallelized; writes often need ordering and confirmation. Some APIs expose parallel function calling natively; others require explicit orchestration. Validate tool outputs before feeding them back—models treat JSON as ground truth even when the tool returned partial errors."
        ],
        "keyTerms": [
          {
            "term": "Limit candidate tools per intent when",
            "definition": "Limit candidate tools per intent when possible."
          },
          {
            "term": "Measure routing precision/recall.",
            "definition": "Measure routing precision/recall."
          },
          {
            "term": "Rename overlapping tools.",
            "definition": "Rename overlapping tools."
          }
        ],
        "workedExample": {
          "title": "Simple intent->tool router",
          "body": "Narrate what each shape and step is doing. If you only recognize the API call, you do not own the idea yet — rewrite the example from memory after one pass.",
          "code": "RULES = [\n    ((\"weather\", \"temperature\"), \"get_weather\"),\n    ((\"refund\", \"chargeback\"), \"create_refund\"),\n    ((\"password\", \"reset\"), \"start_password_reset\"),\n]\n\ndef route(utterance):\n    u = utterance.lower()\n    for keys, tool in RULES:\n        if any(k in u for k in keys):\n            return tool\n    return None\n\nfor s in [\"Need a refund for chargeback\", \"weather please\", \"hello\"]:\n    print(s, \"->\", route(s))",
          "language": "python"
        },
        "checkYourself": [
          {
            "prompt": "Measures routing quality.",
            "reveal": "Explain the idea in two sentences, name one metric or invariant you would watch, and state one mistake juniors make. Then connect it back to routing: who chooses the tool?."
          }
        ]
      },
      {
        "id": "testing-tools-without-the-model",
        "heading": "Testing tools without the model",
        "paragraphs": [
          "Treat each tool as an ordinary function with contract tests. Mock downstream HTTP. For the agent policy, feed recorded tool-call JSON fixtures through validation + dispatch. Only later run expensive live model tests. This split keeps CI fast and deterministic—critical for Pyodide-style offline teaching and for production engineering. When two tools overlap, delete or rename—do not hope the model disambiguates forever.",
          "Hold these points explicitly while you study. Restate each one without looking at the list — recognition is not the interview bar; recall is.",
          "• Contract-test tools independently.",
          "• Fixture-test validation+dispatch paths.",
          "• Reserve live model tests for thin top-level suites.",
          "Production lens — Schema design is API design: Tool descriptions, parameter types, and required fields directly affect call accuracy. Ambiguous names (\"search\" vs \"search_products\") and overly nested JSON schemas increase malformed calls. Provide enums, examples, and error messages surfaced back to the model for self-correction. Idempotent tools and timeouts prevent runaway agent loops from causing side effects."
        ],
        "keyTerms": [
          {
            "term": "Contract-test tools independently.",
            "definition": "Contract-test tools independently."
          },
          {
            "term": "Fixture-test validation+dispatch paths.",
            "definition": "Fixture-test validation+dispatch paths."
          },
          {
            "term": "Reserve live model tests for thin",
            "definition": "Reserve live model tests for thin top-level suites."
          }
        ],
        "checkYourself": [
          {
            "prompt": "Tests tools without live LLM calls.",
            "reveal": "Explain the idea in two sentences, name one metric or invariant you would watch, and state one mistake juniors make. Then connect it back to testing tools without the model."
          }
        ]
      },
      {
        "id": "typed-tool-contracts-idempotency-least-privilege-and-mcp-style-discovery",
        "heading": "Typed tool contracts, idempotency, least privilege, and MCP-style discovery",
        "paragraphs": [
          "Treat each tool as a public API the model can call under injection pressure. Specify JSON Schema (or equivalent) for arguments, reject unknown fields, coerce types carefully, and keep server-side authorization that ignores any “user is admin” string the model invents. Idempotency keys on mutating tools stop double refunds when the agent retries after a timeout; store request hash → result for a TTL. Least privilege means separate credentials per tool class: read-only CRM search must not share a token with wire-transfer. Destructive tools (delete, pay, page on-call) should require a confirmation artifact—second model check, human approval, or dual-control flag—before execution. MCP-style tool discovery is the emerging contract pattern: hosts list tools/resources from servers at session start, each with name, description, and schema, then invoke by stable name. Teaching point: whether or not you use MCP, your agent runtime needs a catalog, schemas, and permission scopes that can be audited. Offline contract tests bind sample argument objects to validators and stubbed side effects in CI; do not wait for an LLM to exercise refunds. Log tool name, latency, error class, and idempotency key for every call.",
          "Hold these points explicitly while you study. Restate each one without looking at the list — recognition is not the interview bar; recall is.",
          "• Schemas + server-side auth are mandatory; the model is not a security boundary.",
          "• Idempotency keys make retries safe for payments and writes.",
          "• Separate privileges and confirm destructive tools explicitly.",
          "• Discoverable tool catalogs (MCP-style) plus offline contract tests keep systems evolvable.",
          "Production lens — Parallel vs sequential tool calls trade latency for correctness: Independent reads can be parallelized; writes often need ordering and confirmation. Some APIs expose parallel function calling natively; others require explicit orchestration. Validate tool outputs before feeding them back—models treat JSON as ground truth even when the tool returned partial errors."
        ],
        "keyTerms": [
          {
            "term": "Schemas + server-side auth are mandatory;",
            "definition": "Schemas + server-side auth are mandatory; the model is not a security boundary."
          },
          {
            "term": "Idempotency keys make retries safe for",
            "definition": "Idempotency keys make retries safe for payments and writes."
          },
          {
            "term": "Separate privileges and confirm destructive t…",
            "definition": "Separate privileges and confirm destructive tools explicitly."
          },
          {
            "term": "Discoverable tool catalogs (MCP-style) plus o…",
            "definition": "Discoverable tool catalogs (MCP-style) plus offline contract tests keep systems evolvable."
          }
        ],
        "workedExample": {
          "title": "Idempotent tool execution with a schema check",
          "body": "Narrate what each shape and step is doing. If you only recognize the API call, you do not own the idea yet — rewrite the example from memory after one pass.",
          "code": "STORE = {}\n\ndef validate_refund(args):\n    if not isinstance(args.get('amount_cents'), int) or args['amount_cents'] <= 0:\n        raise ValueError('amount')\n    if 'account_id' not in args:\n        raise ValueError('account')\n    return args\n\ndef refund(args, idem_key):\n    if idem_key in STORE:\n        return STORE[idem_key]\n    args = validate_refund(args)\n    result = {'status': 'ok', 'amount_cents': args['amount_cents']}\n    STORE[idem_key] = result\n    return result\n\nprint(refund({'account_id': 'A1', 'amount_cents': 500}, 'k1'))\nprint(refund({'account_id': 'A1', 'amount_cents': 500}, 'k1'))",
          "language": "python"
        },
        "checkYourself": [
          {
            "prompt": "Defines schemas, authz, and idempotency for every mutating tool.",
            "reveal": "Explain the idea in two sentences, name one metric or invariant you would watch, and state one mistake juniors make. Then connect it back to typed tool contracts, idempotency, least privilege, and mcp-style discovery."
          }
        ],
        "callout": {
          "tone": "interview",
          "body": "Interview framing: define the term, give a tiny example, say when you would not use it, and name the metric that proves it worked."
        }
      },
      {
        "id": "failure-modes",
        "heading": "Failure modes and anti-patterns",
        "paragraphs": [
          "Most interview answers fail not because the definition is wrong, but because the candidate never names how the approach breaks. Use this section as a trap checklist for tool use and function calling.",
          "Trap: Giant multipurpose tools. A strong answer preempts it — say what you would monitor, what fallback you would keep, or what simpler baseline you would try first.",
          "Trap: Trusting model JSON without validation. A strong answer preempts it — say what you would monitor, what fallback you would keep, or what simpler baseline you would try first.",
          "Trap: Write tools exposed to all users. A strong answer preempts it — say what you would monitor, what fallback you would keep, or what simpler baseline you would try first.",
          "Trap: Only end-to-end live tests, no contract tests. A strong answer preempts it — say what you would monitor, what fallback you would keep, or what simpler baseline you would try first.",
          "Trap: Trusting model-provided role or account ids without authz checks. A strong answer preempts it — say what you would monitor, what fallback you would keep, or what simpler baseline you would try first.",
          "Trap: Retrying payments without idempotency keys. A strong answer preempts it — say what you would monitor, what fallback you would keep, or what simpler baseline you would try first.",
          "Trap: Only testing tools through flaky full-agent transcripts. A strong answer preempts it — say what you would monitor, what fallback you would keep, or what simpler baseline you would try first."
        ],
        "callout": {
          "tone": "warning",
          "body": "If you cannot name a failure mode, you do not yet understand the technique well enough to ship or defend it."
        },
        "checkYourself": [
          {
            "prompt": "Pick the most dangerous pitfall for Tool use and function calling and explain how you would detect it in production or on a whiteboard.",
            "reveal": "Start with: \"Giant multipurpose tools.\" Then add a detection signal (metric, test, or review question) and a mitigation."
          }
        ]
      },
      {
        "id": "deeper-lens",
        "heading": "A deeper production lens",
        "paragraphs": [
          "Schema design is API design. Tool descriptions, parameter types, and required fields directly affect call accuracy. Ambiguous names (\"search\" vs \"search_products\") and overly nested JSON schemas increase malformed calls. Provide enums, examples, and error messages surfaced back to the model for self-correction. Idempotent tools and timeouts prevent runaway agent loops from causing side effects.",
          "Parallel vs sequential tool calls trade latency for correctness. Independent reads can be parallelized; writes often need ordering and confirmation. Some APIs expose parallel function calling natively; others require explicit orchestration. Validate tool outputs before feeding them back—models treat JSON as ground truth even when the tool returned partial errors."
        ],
        "keyTerms": [
          {
            "term": "Schema design is API design",
            "definition": "Tool descriptions, parameter types, and required fields directly affect call accuracy. Ambiguous names (\"search\" vs \"search_products\") and overly nested JSON schemas increase malformed calls. Provide enums, examples, and…"
          },
          {
            "term": "Parallel vs sequential tool calls trade latency for correctness",
            "definition": "Independent reads can be parallelized; writes often need ordering and confirmation. Some APIs expose parallel function calling natively; others require explicit orchestration. Validate tool outputs before feeding them ba…"
          }
        ],
        "callout": {
          "tone": "tip",
          "body": "These notes stretch past the primer. Reach for them when the interviewer asks what you would worry about at scale."
        }
      },
      {
        "id": "synthesis",
        "heading": "Putting it together",
        "paragraphs": [
          "You should now be able to teach tool use and function calling as a story: what problem it solves, how the mechanism works, which assumptions it depends on, and how you would know it failed.",
          "Close the loop by writing a 90-second spoken answer out loud. If you freeze on definitions, return to the orientation and the first technical part. If you freeze on trade-offs, return to failure modes.",
          "Practice prompts from this lesson: Design tools for a banking support agent. | How do you validate model-produced arguments? | How do you prevent unauthorized refunds?"
        ],
        "checkYourself": [
          {
            "prompt": "Give a 90-second spoken overview of Tool use and function calling as if starting an interview answer.",
            "reveal": "Structure: (1) one-sentence definition, (2) one concrete example, (3) one trade-off or limitation, (4) one metric or validation step. Keep jargon only where it earns precision."
          }
        ],
        "callout": {
          "tone": "interview",
          "body": "Strong candidates narrate decisions. Weak candidates list buzzwords. Prefer a small correct example over a broad incomplete taxonomy."
        }
      }
    ],
    "wrapUp": {
      "takeaways": [
        "Can write a clear JSON tool schema.",
        "Validates/normalizes arguments before dispatch.",
        "Gates side-effecting tools.",
        "Measures routing quality.",
        "Tests tools without live LLM calls."
      ],
      "nextSteps": [
        "Return to the lesson page and attempt the practice / topic lab with this chapter still open if needed.",
        "Revisit any Check yourself prompts you could not answer out loud.",
        "Optional deeper reading: OpenAI Function Calling Guide (OpenAI) — https://platform.openai.com/docs/guides/function-calling",
        "Optional deeper reading: Toolformer: Language Models Can Teach Themselves to Use Tools (arXiv) — https://arxiv.org/abs/2302.04761"
      ]
    }
  },
  "ai-agents/agent-evaluation-and-safety": {
    "title": "Chapter: Agent evaluation and safety",
    "readingTime": "55-70 min",
    "premise": "Benchmarking agent performance, measuring reliability, and implementing safety controls for production deployment. This Learn chapter expands the short lesson summary into a full study unit you can read continuously, with interactive checks and selection-based AI search when a phrase needs a second opinion.",
    "parts": [
      {
        "id": "orientation",
        "heading": "Why this chapter exists",
        "paragraphs": [
          "Agent quality is trajectory quality: tool-call correctness, injection resistance, and cost/loop budgets as SLOs—not only a final answer rubric. Mid-2026 teams that skip these ship demos that fail under adversarial or long-running use.",
          "This chapter treats \"Agent evaluation and safety\" as a readable study unit: intuition first, then the mechanics you must be able to explain, then the failure modes that show up in interviews and production, and finally how to talk about the topic under time pressure.",
          "Read it like a book chapter. When a phrase is unclear, select it inside the Learn reader and use Search with AI to open Google, Perplexity, or DuckDuckGo without abandoning the chapter."
        ],
        "callout": {
          "tone": "tip",
          "body": "Target reading time is paced for depth, not skimming. Pause at each Check yourself prompt and answer out loud before revealing the guide answer."
        }
      },
      {
        "id": "define-success-without-vibes",
        "heading": "Define success without vibes",
        "paragraphs": [
          "Write task specs: initial state, allowed tools, success predicate, forbidden actions. Example: \"cancel order 123 if it has not shipped; never email the user.\" Score binary success, policy violations, step efficiency, and cost. Ambiguous goals produce ambiguous evals. Convert product aspirations into predicates you can compute on trajectories. Safety metrics must be computed on trajectories, because the final answer can look fine after a dangerous tool call. Safety metrics must be computed on trajectories, because the final answer can look fine after a dangerous tool call.",
          "Hold these points explicitly while you study. Restate each one without looking at the list — recognition is not the interview bar; recall is.",
          "• Success predicates must be machine-checkable when possible.",
          "• Track violations separately from success.",
          "• Include efficiency/cost, not only pass rate.",
          "Production lens — Trajectory evaluation beats single-turn benchmarks: Agents fail across multi-step runs—wrong tool order, loops, partial task completion. Eval suites (WebArena, SWE-bench, custom task graphs) measure success rate, steps to completion, and cost. Human rubrics plus LLM-as-judge need calibration; always anchor with executable checks (did the DB row change? did tests pass?)."
        ],
        "keyTerms": [
          {
            "term": "Success predicates must be machine-checkable …",
            "definition": "Success predicates must be machine-checkable when possible."
          },
          {
            "term": "Track violations separately from success.",
            "definition": "Track violations separately from success."
          },
          {
            "term": "Include efficiency/cost, not only pass rate.",
            "definition": "Include efficiency/cost, not only pass rate."
          }
        ],
        "workedExample": {
          "title": "Score a trajectory against rules",
          "body": "Narrate what each shape and step is doing. If you only recognize the API call, you do not own the idea yet — rewrite the example from memory after one pass.",
          "code": "def score(trajectory, forbidden_tools, must_call):\n    tools = [e[\"tool\"] for e in trajectory if e[\"type\"] == \"tool\"]\n    success = must_call in tools and \"finish\" in tools\n    violations = [t for t in tools if t in forbidden_tools]\n    return {\"success\": success, \"violations\": violations, \"steps\": len(tools)}\n\ntraj = [\n    {\"type\": \"tool\", \"tool\": \"get_order\"},\n    {\"type\": \"tool\", \"tool\": \"cancel_order\"},\n    {\"type\": \"tool\", \"tool\": \"finish\"},\n]\nprint(score(traj, forbidden_tools={\"email_user\"}, must_call=\"cancel_order\"))",
          "language": "python"
        },
        "checkYourself": [
          {
            "prompt": "Writes machine-checkable success/violation metrics.",
            "reveal": "Agents fail across multi-step runs—wrong tool order, loops, partial task completion. Eval suites (WebArena, SWE-bench, custom task graphs) measure success rate, steps to completion, and cost. Human rubrics plus LLM-as-judge need calibration; always anchor with executable checks (did the DB row change? did tests pass?)."
          }
        ]
      },
      {
        "id": "offline-simulators-and-golden-trajectories",
        "heading": "Offline simulators and golden trajectories",
        "paragraphs": [
          "Build mocked environments that return deterministic tool outputs. Store golden trajectories for regression. Mutate environments to test recovery (tool errors, empty search). CI runs the agent policy against the simulator. This is the only scalable way to catch loops and illegal calls before production. LLM-as-judge can rate free-form answers but should not be the only gate for safety-critical actions. Simulators should include hostile documents that attempt indirect injection through search results. Simulators should include hostile documents that attempt indirect injection through search results.",
          "Hold these points explicitly while you study. Restate each one without looking at the list — recognition is not the interview bar; recall is.",
          "• Invest in deterministic tool simulators.",
          "• Golden + adversarial environment variants.",
          "• Do not rely solely on LLM judges for safety.",
          "Production lens — Sandboxing and least-privilege are non-negotiable: Agents with shell, browser, or payment tools require OS-level sandboxes, scoped credentials, and approval gates for irreversible actions. Prompt-level safety does not stop a determined jailbreak from exfiltrating secrets via tool channels. Red-team for indirect injection via tool return payloads and cross-session memory poisoning."
        ],
        "keyTerms": [
          {
            "term": "Invest in deterministic tool simulators.",
            "definition": "Invest in deterministic tool simulators."
          },
          {
            "term": "Golden + adversarial environment variants.",
            "definition": "Golden + adversarial environment variants."
          },
          {
            "term": "Do not rely solely on LLM",
            "definition": "Do not rely solely on LLM judges for safety."
          }
        ],
        "checkYourself": [
          {
            "prompt": "Runs simulator-based CI for agents.",
            "reveal": "Agents with shell, browser, or payment tools require OS-level sandboxes, scoped credentials, and approval gates for irreversible actions. Prompt-level safety does not stop a determined jailbreak from exfiltrating secrets via tool channels. Red-team for indirect injection via tool return payloads and cross-session memory poisoning."
          }
        ]
      },
      {
        "id": "safety-policies-and-runtime-enforcement",
        "heading": "Safety policies and runtime enforcement",
        "paragraphs": [
          "Policies belong both in prompts and in code. Code must enforce allowlists, rate limits, PII redaction, and human approvals even if the model agrees to break rules. Defense in depth: prompt policy, static tool gates, runtime monitors, and post-hoc audit. For jailbreaks aiming at tool abuse, assume prompt-only defenses fail. Budget monitors belong in the runtime path, not only in offline scoring notebooks. Budget monitors belong in the runtime path, not only in offline scoring notebooks.",
          "Hold these points explicitly while you study. Restate each one without looking at the list — recognition is not the interview bar; recall is.",
          "• Enforce safety in code paths, not only prompts.",
          "• Rate-limit and allowlist tools.",
          "• Assume adversarial users exist.",
          "Production lens — Trajectory evaluation beats single-turn benchmarks: Agents fail across multi-step runs—wrong tool order, loops, partial task completion. Eval suites (WebArena, SWE-bench, custom task graphs) measure success rate, steps to completion, and cost. Human rubrics plus LLM-as-judge need calibration; always anchor with executable checks (did the DB row change? did tests pass?)."
        ],
        "keyTerms": [
          {
            "term": "Enforce safety in code paths, not",
            "definition": "Enforce safety in code paths, not only prompts."
          },
          {
            "term": "Rate-limit and allowlist tools.",
            "definition": "Rate-limit and allowlist tools."
          },
          {
            "term": "Assume adversarial users exist.",
            "definition": "Assume adversarial users exist."
          }
        ],
        "checkYourself": [
          {
            "prompt": "Enforces safety in code allowlists.",
            "reveal": "Explain the idea in two sentences, name one metric or invariant you would watch, and state one mistake juniors make. Then connect it back to safety policies and runtime enforcement."
          }
        ]
      },
      {
        "id": "red-teaming-agents",
        "heading": "Red teaming agents",
        "paragraphs": [
          "Attack goals: exfiltrate secrets, escalate privileges, trigger spamful emails, poison memory, or cause infinite spend. Include indirect injection via retrieved documents. Score whether guards blocked the action. Schedule periodic red teams as models/prompts change. Track coverage of attack classes like you track code coverage. Launch gates need numeric thresholds and a named approver; vibes do not satisfy audits. Launch gates need numeric thresholds and a named approver; vibes do not satisfy audits.",
          "Hold these points explicitly while you study. Restate each one without looking at the list — recognition is not the interview bar; recall is.",
          "• Include indirect injection via tools/docs.",
          "• Measure block rate by attack class.",
          "• Re-run red teams on every major prompt/model change.",
          "Production lens — Sandboxing and least-privilege are non-negotiable: Agents with shell, browser, or payment tools require OS-level sandboxes, scoped credentials, and approval gates for irreversible actions. Prompt-level safety does not stop a determined jailbreak from exfiltrating secrets via tool channels. Red-team for indirect injection via tool return payloads and cross-session memory poisoning."
        ],
        "keyTerms": [
          {
            "term": "Include indirect injection via tools/docs.",
            "definition": "Include indirect injection via tools/docs."
          },
          {
            "term": "Measure block rate by attack class.",
            "definition": "Measure block rate by attack class."
          },
          {
            "term": "Re-run red teams on every major",
            "definition": "Re-run red teams on every major prompt/model change."
          }
        ],
        "workedExample": {
          "title": "Heuristic runtime monitor for spend/loops",
          "body": "Narrate what each shape and step is doing. If you only recognize the API call, you do not own the idea yet — rewrite the example from memory after one pass.",
          "code": "def monitor(events, max_steps=5, max_cost=3.0):\n    cost = 0.0\n    steps = 0\n    alerts = []\n    for e in events:\n        if e[\"type\"] == \"tool\":\n            steps += 1\n            cost += e.get(\"cost\", 1.0)\n            if steps > max_steps:\n                alerts.append(\"loop\")\n            if cost > max_cost:\n                alerts.append(\"spend\")\n    return list(dict.fromkeys(alerts))\n\nprint(monitor([\n    {\"type\": \"tool\", \"cost\": 1},\n    {\"type\": \"tool\", \"cost\": 1},\n    {\"type\": \"tool\", \"cost\": 1},\n    {\"type\": \"tool\", \"cost\": 1},\n]))",
          "language": "python"
        },
        "checkYourself": [
          {
            "prompt": "Red-teams direct and indirect injection.",
            "reveal": "Explain the idea in two sentences, name one metric or invariant you would watch, and state one mistake juniors make. Then connect it back to red teaming agents."
          }
        ]
      },
      {
        "id": "shipping-gates-and-incident-response",
        "heading": "Shipping gates and incident response",
        "paragraphs": [
          "Define launch gates: offline success threshold, zero high-severity violations on red team, latency/cost budgets, and kill switches. Write runbooks for runaway agents (disable tools, force human-only mode). Store transcripts for forensics with privacy controls. Safety is an ongoing operations practice layered on evaluation engineering. After incidents, add a regression case before re-enabling the tool.",
          "Hold these points explicitly while you study. Restate each one without looking at the list — recognition is not the interview bar; recall is.",
          "• Codify launch gates with numeric thresholds.",
          "• Have kill switches and runbooks.",
          "• Retain forensic transcripts responsibly.",
          "Production lens — Trajectory evaluation beats single-turn benchmarks: Agents fail across multi-step runs—wrong tool order, loops, partial task completion. Eval suites (WebArena, SWE-bench, custom task graphs) measure success rate, steps to completion, and cost. Human rubrics plus LLM-as-judge need calibration; always anchor with executable checks (did the DB row change? did tests pass?)."
        ],
        "keyTerms": [
          {
            "term": "Codify launch gates with numeric thresholds.",
            "definition": "Codify launch gates with numeric thresholds."
          },
          {
            "term": "Have kill switches and runbooks.",
            "definition": "Have kill switches and runbooks."
          },
          {
            "term": "Retain forensic transcripts responsibly.",
            "definition": "Retain forensic transcripts responsibly."
          }
        ],
        "checkYourself": [
          {
            "prompt": "Defines kill switches and runbooks.",
            "reveal": "Explain the idea in two sentences, name one metric or invariant you would watch, and state one mistake juniors make. Then connect it back to shipping gates and incident response."
          }
        ]
      },
      {
        "id": "trajectory-eval-tool-correctness-injection-red-teams-and-loop-slos",
        "heading": "Trajectory eval, tool correctness, injection red teams, and loop SLOs",
        "paragraphs": [
          "Evaluate agents as paths, not endpoints. A trajectory record includes messages, tool names, arguments, observations, latencies, and stop reasons. Score tool-call correctness separately from natural-language quality: wrong tool, missing required arg, hallucinated id, or skipped confirmation is a fail even if the final sentence looks helpful. Build golden trajectories for happy paths and for forced recovery (tool 500, empty search). LLM-as-judge can grade open-ended steps but needs blinded rubrics, spot-checked human agreement, and awareness of verbosity bias. Injection red teams are mandatory: direct (“ignore policies”), indirect (poisoned retrieved docs, malicious PDF text, tool-returned HTML), and confused-deputy cases where the model is tricked into calling privileged tools. Measure attack success rate and time-to-detect. Cost and loop budgets are first-class SLOs alongside task success: max tool calls, max tokens, max wall time, max spend per session; breach should stop the agent with a safe user message. Online, monitor tool error rate, repeat-tool thrash, approval bypass attempts, and spend per successful task. Ship gates: offline suite green, red-team below threshold, budgets enforced in the runtime—not only documented in a wiki.",
          "Hold these points explicitly while you study. Restate each one without looking at the list — recognition is not the interview bar; recall is.",
          "• Score trajectories and tool-call correctness, not only final answers.",
          "• Red-team direct and indirect injection, including tool-returned content.",
          "• Treat max loops/tokens/spend as SLOs enforced in the runtime.",
          "• Combine golden trajectories, judges with human calibration, and online thrash metrics.",
          "Production lens — Sandboxing and least-privilege are non-negotiable: Agents with shell, browser, or payment tools require OS-level sandboxes, scoped credentials, and approval gates for irreversible actions. Prompt-level safety does not stop a determined jailbreak from exfiltrating secrets via tool channels. Red-team for indirect injection via tool return payloads and cross-session memory poisoning."
        ],
        "keyTerms": [
          {
            "term": "Score trajectories and tool-call correctness,…",
            "definition": "Score trajectories and tool-call correctness, not only final answers."
          },
          {
            "term": "Red-team direct and indirect injection, inclu…",
            "definition": "Red-team direct and indirect injection, including tool-returned content."
          },
          {
            "term": "Treat max loops/tokens/spend as SLOs enforced",
            "definition": "Treat max loops/tokens/spend as SLOs enforced in the runtime."
          },
          {
            "term": "Combine golden trajectories, judges with human",
            "definition": "Combine golden trajectories, judges with human calibration, and online thrash metrics."
          }
        ],
        "workedExample": {
          "title": "Score tool-call correctness on a trajectory",
          "body": "Narrate what each shape and step is doing. If you only recognize the API call, you do not own the idea yet — rewrite the example from memory after one pass.",
          "code": "def tool_score(trajectory, expected_calls):\n    got = [(t['name'], tuple(sorted(t['args'].items()))) for t in trajectory if t['type'] == 'tool']\n    exp = [(n, tuple(sorted(a.items()))) for n, a in expected_calls]\n    return got == exp\n\ntraj = [\n    {'type': 'tool', 'name': 'search', 'args': {'q': 'invoice 9'}},\n    {'type': 'tool', 'name': 'refund', 'args': {'id': '9', 'cents': 500}},\n]\nprint(tool_score(traj, [('search', {'q': 'invoice 9'}), ('refund', {'id': '9', 'cents': 500})]))\nprint(tool_score(traj, [('refund', {'id': '9', 'cents': 500})]))",
          "language": "python"
        },
        "checkYourself": [
          {
            "prompt": "Maintains golden trajectories with expected tool calls.",
            "reveal": "Explain the idea in two sentences, name one metric or invariant you would watch, and state one mistake juniors make. Then connect it back to trajectory eval, tool correctness, injection red teams, and loop slos."
          }
        ],
        "callout": {
          "tone": "interview",
          "body": "Interview framing: define the term, give a tiny example, say when you would not use it, and name the metric that proves it worked."
        }
      },
      {
        "id": "failure-modes",
        "heading": "Failure modes and anti-patterns",
        "paragraphs": [
          "Most interview answers fail not because the definition is wrong, but because the candidate never names how the approach breaks. Use this section as a trap checklist for agent evaluation and safety.",
          "Trap: Demo transcripts as evaluation. A strong answer preempts it — say what you would monitor, what fallback you would keep, or what simpler baseline you would try first.",
          "Trap: Prompt-only safety for write tools. A strong answer preempts it — say what you would monitor, what fallback you would keep, or what simpler baseline you would try first.",
          "Trap: No cost/loop monitors at runtime. A strong answer preempts it — say what you would monitor, what fallback you would keep, or what simpler baseline you would try first.",
          "Trap: No incident plan for runaway actions. A strong answer preempts it — say what you would monitor, what fallback you would keep, or what simpler baseline you would try first.",
          "Trap: Judging only the final message while tools did the wrong thing. A strong answer preempts it — say what you would monitor, what fallback you would keep, or what simpler baseline you would try first.",
          "Trap: No budget → infinite retry loops in production. A strong answer preempts it — say what you would monitor, what fallback you would keep, or what simpler baseline you would try first.",
          "Trap: Red-teaming only the system prompt and ignoring indirect injection. A strong answer preempts it — say what you would monitor, what fallback you would keep, or what simpler baseline you would try first."
        ],
        "callout": {
          "tone": "warning",
          "body": "If you cannot name a failure mode, you do not yet understand the technique well enough to ship or defend it."
        },
        "checkYourself": [
          {
            "prompt": "Pick the most dangerous pitfall for Agent evaluation and safety and explain how you would detect it in production or on a whiteboard.",
            "reveal": "Start with: \"Demo transcripts as evaluation.\" Then add a detection signal (metric, test, or review question) and a mitigation."
          }
        ]
      },
      {
        "id": "deeper-lens",
        "heading": "A deeper production lens",
        "paragraphs": [
          "Trajectory evaluation beats single-turn benchmarks. Agents fail across multi-step runs—wrong tool order, loops, partial task completion. Eval suites (WebArena, SWE-bench, custom task graphs) measure success rate, steps to completion, and cost. Human rubrics plus LLM-as-judge need calibration; always anchor with executable checks (did the DB row change? did tests pass?).",
          "Sandboxing and least-privilege are non-negotiable. Agents with shell, browser, or payment tools require OS-level sandboxes, scoped credentials, and approval gates for irreversible actions. Prompt-level safety does not stop a determined jailbreak from exfiltrating secrets via tool channels. Red-team for indirect injection via tool return payloads and cross-session memory poisoning."
        ],
        "keyTerms": [
          {
            "term": "Trajectory evaluation beats single-turn benchmarks",
            "definition": "Agents fail across multi-step runs—wrong tool order, loops, partial task completion. Eval suites (WebArena, SWE-bench, custom task graphs) measure success rate, steps to completion, and cost. Human rubrics plus LLM-as-ju…"
          },
          {
            "term": "Sandboxing and least-privilege are non-negotiable",
            "definition": "Agents with shell, browser, or payment tools require OS-level sandboxes, scoped credentials, and approval gates for irreversible actions. Prompt-level safety does not stop a determined jailbreak from exfiltrating secrets…"
          }
        ],
        "callout": {
          "tone": "tip",
          "body": "These notes stretch past the primer. Reach for them when the interviewer asks what you would worry about at scale."
        }
      },
      {
        "id": "synthesis",
        "heading": "Putting it together",
        "paragraphs": [
          "You should now be able to teach agent evaluation and safety as a story: what problem it solves, how the mechanism works, which assumptions it depends on, and how you would know it failed.",
          "Close the loop by writing a 90-second spoken answer out loud. If you freeze on definitions, return to the orientation and the first technical part. If you freeze on trade-offs, return to failure modes.",
          "Practice prompts from this lesson: How would you evaluate an agent that can issue refunds? | What belongs in an agent simulator for CI? | How do you stop infinite tool loops in production?"
        ],
        "checkYourself": [
          {
            "prompt": "Give a 90-second spoken overview of Agent evaluation and safety as if starting an interview answer.",
            "reveal": "Structure: (1) one-sentence definition, (2) one concrete example, (3) one trade-off or limitation, (4) one metric or validation step. Keep jargon only where it earns precision."
          }
        ],
        "callout": {
          "tone": "interview",
          "body": "Strong candidates narrate decisions. Weak candidates list buzzwords. Prefer a small correct example over a broad incomplete taxonomy."
        }
      }
    ],
    "wrapUp": {
      "takeaways": [
        "Writes machine-checkable success/violation metrics.",
        "Runs simulator-based CI for agents.",
        "Enforces safety in code allowlists.",
        "Red-teams direct and indirect injection.",
        "Defines kill switches and runbooks."
      ],
      "nextSteps": [
        "Return to the lesson page and attempt the practice / topic lab with this chapter still open if needed.",
        "Revisit any Check yourself prompts you could not answer out loud.",
        "Optional deeper reading: WebArena: A Realistic Web Environment for Building Autonomous Agents (arXiv) — https://arxiv.org/abs/2307.13854",
        "Optional deeper reading: OWASP Top 10 for Large Language Model Applications (OWASP) — https://owasp.org/www-project-top-10-for-large-language-model-applications/"
      ]
    }
  }
};
