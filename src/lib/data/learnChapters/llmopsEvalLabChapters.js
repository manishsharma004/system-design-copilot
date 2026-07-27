const chapters = {
  "llmops-eval-lab/llm-evaluation-harness": {
    title: "Chapter: LLM evaluation harnesses that catch regressions",
    readingTime: "70-85 min",
    premise:
      "LLM products need repeatable evaluation, not demo confidence. This chapter covers harness design, golden datasets, graders, human calibration, regression reports, and CI gates.",
    parts: [
      {
        id: "eval-as-system",
        heading: "An LLM evaluation harness is a product subsystem",
        paragraphs: [
          "An LLM feature changes whenever prompts, model versions, retrieval indexes, tools, policies, or routing logic change. A harness gives the team a repeatable way to ask whether the change improved or harmed behavior. It is not a notebook of favorite prompts. It is a versioned subsystem that runs fixed and evolving test cases, records outputs, applies graders, and reports regressions by slice.",
          "The harness should reflect the product's tasks. A support assistant needs correctness, citation quality, escalation behavior, tone, and policy compliance. A coding agent needs build success, patch quality, tool-use discipline, and test evidence. A data analyst assistant needs SQL validity, chart interpretation, and refusal to invent data. Generic `helpfulness` is rarely enough.",
          "A useful harness separates data, execution, grading, and gate policy. Data defines cases and tags. Execution defines prompt, model, tools, retrieval, and environment. Grading computes metrics. Gate policy decides which failures block release, warn reviewers, or create follow-up work. This separation keeps evaluation maintainable as the product grows."
        ],
        keyTerms: [
          {
            term: "evaluation harness",
            definition:
              "A repeatable system for running LLM tasks, collecting outputs, grading behavior, and reporting quality changes."
          },
          {
            term: "slice",
            definition:
              "A meaningful subset of cases such as language, product area, risk tier, task type, or adversarial category."
          },
          {
            term: "gate policy",
            definition:
              "Rules that decide whether evaluation results block, warn, or allow a release."
          }
        ],
        checkYourself: [
          {
            prompt: "Why should grading be separated from gate policy?",
            reveal:
              "Metrics describe behavior; policy decides risk tolerance. Separating them lets teams change thresholds or release rules without rewriting graders."
          }
        ],
        callout: {
          tone: "interview",
          body:
            "Describe eval as code plus data plus reports plus release policy. That signals operational maturity."
        }
      },
      {
        id: "goldens-and-tags",
        heading: "Golden datasets make quality claims reproducible",
        paragraphs: [
          "A golden dataset contains curated inputs with expected behavior. For LLM systems, expected behavior may be a reference answer, required facts, forbidden claims, tool-call sequence, citation requirements, JSON schema, or rubric. Each case should have an id, owner, source, tags, and version history. Without these details, a passing score is difficult to trust or reproduce.",
          "Tags are not decoration. They let the team find regressions that aggregate metrics hide. A prompt rewrite may improve English billing questions while harming German account-recovery questions. A model swap may improve short answers while breaking long-context citation tasks. Evaluation reports should show per-slice deltas so teams know what changed and who is affected.",
          "Goldens should evolve from real usage. Production incidents, user feedback, red-team findings, policy changes, and new product launches should add or update cases. The set needs review because stale expectations can become harmful. A harness that preserves outdated policy is worse than no harness because it gives false confidence."
        ],
        keyTerms: [
          {
            term: "golden dataset",
            definition:
              "A curated, versioned set of evaluation cases with expected behavior and metadata."
          },
          {
            term: "rubric",
            definition:
              "A structured description of criteria used to judge an output."
          },
          {
            term: "regression",
            definition:
              "A behavior or metric that worsens relative to a baseline version."
          }
        ],
        checkYourself: [
          {
            prompt: "What metadata should a golden case include?",
            reveal:
              "At minimum: id, input, expected behavior or rubric, tags, source, owner, version, and any required context or tool state."
          }
        ],
        callout: {
          tone: "tip",
          body:
            "Add cases from incidents immediately. That turns production pain into future protection."
        }
      },
      {
        id: "grader-types",
        heading: "Graders should match what can be checked",
        paragraphs: [
          "Some LLM behaviors are objectively checkable. JSON can be parsed against a schema. A tool call can be compared with expected arguments. A citation id can be verified against retrieved context. A SQL query can be executed on a fixture. These executable checks are strong because they are deterministic and explainable.",
          "Other behaviors need judgment. Relevance, completeness, style, and helpfulness may require human review or LLM-as-judge grading. Judge models can scale evaluation, but they carry biases, verbosity preferences, and sensitivity to rubric wording. They should be calibrated against human annotations, especially for launch gates or high-risk domains.",
          "The best harness mixes graders. Use deterministic checks where possible, model judges where rubrics are clear, and human review for ambiguous or safety-critical slices. Pairwise comparisons can be more reliable than absolute scores because judges often agree more on which answer is better than on whether an answer deserves 4.2 out of 5."
        ],
        keyTerms: [
          {
            term: "deterministic grader",
            definition:
              "A grader that produces the same result from rules, parsing, execution, or exact checks."
          },
          {
            term: "judge model",
            definition:
              "An LLM used to evaluate another model's output according to a rubric."
          },
          {
            term: "pairwise preference",
            definition:
              "A comparison that asks which of two outputs is better under a rubric."
          }
        ],
        checkYourself: [
          {
            prompt: "When should you prefer executable graders over LLM judges?",
            reveal:
              "When correctness can be checked by schema validation, code execution, citation lookup, tool state, exact facts, or other deterministic evidence."
          }
        ],
        callout: {
          tone: "warning",
          body:
            "A judge score is not objective truth. Calibrate it, inspect disagreements, and keep humans in the loop for high-risk slices."
        }
      },
      {
        id: "offline-online",
        heading: "Offline eval catches regressions; online eval catches reality",
        paragraphs: [
          "Offline evaluation runs fixed cases in a controlled environment. It is fast, cheap, reproducible, and appropriate for CI. It catches prompt regressions, retrieval changes, formatting breaks, and obvious model-quality shifts before release. Its weakness is coverage: no finite golden set perfectly represents live users.",
          "Online evaluation measures production behavior. It can track task completion, escalation rate, thumbs down, edit distance, retention, conversion, human override, or incident rate. These metrics reflect real users but are noisy, delayed, and confounded by product changes. A model can pass offline tests and still underperform online because live traffic changed or latency affected behavior.",
          "Mature teams use both. Offline gates protect the mainline from known regressions. Shadow deployments and canaries measure production distribution before broad rollout. Online metrics and review samples feed new golden cases. The loop is continuous: goldens protect against known failures, and production teaches the harness what it does not yet know."
        ],
        keyTerms: [
          {
            term: "offline evaluation",
            definition:
              "Evaluation on fixed cases outside live user impact, often used in development and CI."
          },
          {
            term: "online evaluation",
            definition:
              "Evaluation using live or shadow production traffic and product outcome metrics."
          },
          {
            term: "canary",
            definition:
              "A limited rollout that exposes a small traffic slice to a candidate change."
          }
        ],
        checkYourself: [
          {
            prompt: "Why can an offline pass still require a canary?",
            reveal:
              "Offline cases may not cover live distribution, latency effects, user behavior, or rare interactions. A canary measures reality with limited blast radius."
          }
        ],
        callout: {
          tone: "interview",
          body:
            "Answer with a two-track loop: offline regression gates before ship, online monitoring and sampling after ship."
        }
      },
      {
        id: "reports-and-ci",
        heading: "Evaluation reports should point to decisions",
        paragraphs: [
          "A good eval report is not a wall of averages. It shows baseline versus candidate, confidence or sample counts, slice deltas, top regressions, exemplar outputs, grader failures, cost and latency changes, and gate status. Reviewers should be able to answer what changed, whether it matters, and what action to take.",
          "CI integration should be risk-tiered. Low-risk copy changes may require a smoke set. Prompt rewrites, model swaps, tool changes, and retrieval index changes should run broader suites. High-risk actions such as payments, medical advice, legal claims, or account changes need stricter gates and human review. One threshold for everything either blocks too much or misses important failures.",
          "Evaluation artifacts should be stored. Inputs, outputs, traces, grader versions, model versions, prompts, and metrics need to be reproducible. When a release causes a production issue, the team should compare the candidate's pre-ship report with the incident case and decide whether the harness missed coverage, a grader failed, or the release ignored evidence."
        ],
        keyTerms: [
          {
            term: "eval report",
            definition:
              "A structured summary of evaluation results, regressions, examples, and release decisions."
          },
          {
            term: "risk tier",
            definition:
              "A classification of product behavior by potential harm or business impact used to choose gate strictness."
          },
          {
            term: "artifact retention",
            definition:
              "Storing evaluation inputs, outputs, traces, versions, and metrics for later audit or debugging."
          }
        ],
        checkYourself: [
          {
            prompt: "What should a reviewer learn from an eval report in two minutes?",
            reveal:
              "Whether the candidate passed gates, which slices moved, what examples regressed, and whether cost or latency changed enough to affect release."
          }
        ],
        callout: {
          tone: "tip",
          body:
            "Reports should make decisions easier. If reviewers still need to rerun notebooks manually, the harness is not finished."
        }
      }
    ],
    wrapUp: {
      takeaways: [
        "LLM evaluation harnesses are versioned systems for detecting task-specific regressions.",
        "Golden datasets need metadata, tags, owners, and maintenance from real incidents.",
        "Graders should combine deterministic checks, calibrated judge models, and human review.",
        "Offline and online evaluation answer different questions and should feed each other.",
        "Reports and CI gates should be risk-tiered and decision-oriented."
      ],
      nextSteps: [
        "Define ten golden cases for one LLM feature with tags and rubrics.",
        "Separate deterministic graders from judge-model graders in a harness design.",
        "Sketch a release report showing slice regressions and gate status."
      ]
    }
  },
  "llmops-eval-lab/cost-latency-and-observability": {
    title: "Chapter: Cost, latency, and observability for LLM features",
    readingTime: "70-85 min",
    premise:
      "LLM systems are constrained by tokens, prefill, decode, batching, cache memory, provider behavior, and traceability. This chapter explains how to measure and optimize cost and latency without losing quality.",
    parts: [
      {
        id: "token-economics",
        heading: "LLM cost begins with token flow",
        paragraphs: [
          "Most LLM costs are driven by input tokens, output tokens, model choice, and sometimes tool or retrieval work. A feature that appends full conversation history, ten retrieved chunks, verbose tool schemas, and long instructions can become expensive before the model writes a single answer. Token budgeting is therefore a product architecture decision.",
          "Input and output tokens have different operational profiles. Input tokens are processed during prefill, often with high parallelism across the prompt. Output tokens are generated autoregressively during decode, one step at a time. Pricing may also differ between input and output tokens. A short prompt with very long output can be decode-heavy; a huge RAG prompt with short answer can be prefill-heavy.",
          "Cost dashboards should show tokens by section: system prompt, history, retrieval context, tool schema, user input, and output. This makes optimization concrete. You can compress history, reduce chunk count, trim schemas, cache shared prefixes, choose a smaller model for easy tasks, or route only difficult cases to an expensive model."
        ],
        keyTerms: [
          {
            term: "input tokens",
            definition:
              "Tokens supplied to the model as prompt, context, messages, tool definitions, or retrieved evidence."
          },
          {
            term: "output tokens",
            definition:
              "Tokens generated by the model in the response."
          },
          {
            term: "model routing",
            definition:
              "Choosing among models or providers based on task difficulty, cost, latency, or policy."
          }
        ],
        checkYourself: [
          {
            prompt: "Why break token counts down by prompt section?",
            reveal:
              "Section-level counts reveal which part of the system drives cost and latency, enabling targeted optimization instead of blind prompt trimming."
          }
        ],
        callout: {
          tone: "tip",
          body:
            "Measure tokens before optimizing models. Many expensive LLM systems are prompt assembly problems."
        }
      },
      {
        id: "prefill-vs-decode",
        heading: "Prefill latency and decode latency are different bottlenecks",
        paragraphs: [
          "Prefill is the phase where the model processes the prompt and builds internal state, including KV-cache for decoder models. It can parallelize over prompt tokens, but attention over long prompts and memory allocation still cost time. RAG-heavy requests, long chat histories, and large tool schemas often show high prefill latency.",
          "Decode is the phase where the model generates new tokens one by one. Each new token reads previous cache, computes logits, samples or selects a token, and appends to the sequence. Decode latency is often reported as time to first token and tokens per second. It is sensitive to model size, cache bandwidth, batching, sampling settings, and output length.",
          "Separating prefill from decode prevents wrong optimizations. If users wait a long time before the first token, reduce prompt length, improve prefix caching, or use faster prefill hardware and batching. If tokens stream slowly after generation starts, inspect decode batching, model size, KV-cache memory bandwidth, and output length controls. Total latency hides these different causes."
        ],
        keyTerms: [
          {
            term: "prefill latency",
            definition:
              "Time spent processing the prompt before generation begins."
          },
          {
            term: "decode latency",
            definition:
              "Time spent generating response tokens autoregressively after prefill."
          },
          {
            term: "time to first token",
            definition:
              "The elapsed time from request start until the first generated token is available."
          }
        ],
        checkYourself: [
          {
            prompt: "A RAG answer has slow first token but fast streaming afterward. Where do you look first?",
            reveal:
              "Look at prefill drivers: prompt length, retrieved context size, tool schemas, prefix caching, and prompt batching."
          }
        ],
        callout: {
          tone: "interview",
          body:
            "Always distinguish prefill from decode in LLM latency answers. It is one of the clearest signs of serving literacy."
        }
      },
      {
        id: "batching-cache",
        heading: "Batching and KV-cache shape throughput",
        paragraphs: [
          "Serving systems batch requests to improve accelerator utilization. Prefill batching groups prompt processing; decode batching groups one-token steps across active requests. Continuous batching can add and remove requests dynamically as sequences finish. This improves throughput but complicates fairness, tail latency, and memory scheduling.",
          "KV-cache memory grows with layers, batch, sequence length, heads, head dimension, and precision. Long prompts and long generations can crowd out other requests. Techniques such as paged attention manage cache blocks more efficiently, while grouped-query attention reduces key-value head count. Cache quantization can reduce memory at potential quality or speed tradeoffs.",
          "Prefix caching reuses computation for shared prompt prefixes such as system instructions or common tool schemas. It is powerful when many requests share identical prefixes, but brittle if tiny formatting differences prevent cache hits. Observability should track cache hit rate, cache memory, batch size, queue time, and per-request sequence length."
        ],
        keyTerms: [
          {
            term: "continuous batching",
            definition:
              "A serving strategy that dynamically batches active generation requests token by token."
          },
          {
            term: "KV-cache memory",
            definition:
              "Memory used to store decoder keys and values for previous tokens across layers."
          },
          {
            term: "prefix cache hit",
            definition:
              "Reuse of cached computation for an identical prompt prefix."
          }
        ],
        checkYourself: [
          {
            prompt: "Why can long contexts reduce throughput even with the same model?",
            reveal:
              "They increase prefill work and KV-cache memory, limiting batching capacity and increasing memory bandwidth pressure during decode."
          }
        ],
        callout: {
          tone: "warning",
          body:
            "A larger context window can become a capacity problem if requests fill it casually."
        }
      },
      {
        id: "observability-traces",
        heading: "LLM observability needs traces, not just logs",
        paragraphs: [
          "An LLM request can involve prompt assembly, retrieval, reranking, tool calls, model invocation, streaming, guardrails, and postprocessing. A flat log line cannot explain where time, cost, or quality changed. A trace records spans for each stage with inputs, outputs, metadata, and timing. It lets engineers diagnose whether a slow request came from retrieval, model prefill, decode, a tool, or a guardrail.",
          "Quality observability should connect traces to evaluation. Store prompt version, model version, retrieval ids, context length, output, citations, refusal reason, safety classifier result, and user feedback when allowed. Redact sensitive fields and control access. The goal is reproducibility without turning observability into a privacy leak.",
          "Dashboards should show distributions, not only averages. Track p50, p95, and p99 latency; tokens per request; time to first token; tokens per second; cost per successful task; error and fallback rates; cache hit rate; and quality slices. Spikes in p99 or cost per task often reveal issues that average latency hides."
        ],
        keyTerms: [
          {
            term: "trace",
            definition:
              "A structured record of request spans, timing, versions, inputs, outputs, and metadata across system stages."
          },
          {
            term: "span",
            definition:
              "One timed operation within a trace, such as retrieval, reranking, model call, or tool execution."
          },
          {
            term: "cost per successful task",
            definition:
              "Total LLM and system cost divided by tasks completed to an acceptable quality bar."
          }
        ],
        checkYourself: [
          {
            prompt: "Why is cost per request weaker than cost per successful task?",
            reveal:
              "Cheap failed requests may require retries or human escalation. The product cares about reliable task completion, not only request price."
          }
        ],
        callout: {
          tone: "tip",
          body:
            "Trace every stage that can change answer quality: retrieval, prompt build, model, tools, guardrails, and postprocessing."
        }
      },
      {
        id: "optimization-with-quality",
        heading: "Cost and latency optimization must preserve quality gates",
        paragraphs: [
          "Common optimizations include shorter prompts, fewer retrieved chunks, smaller models, caching, speculative decoding, quantization, distillation, routing, and stricter output limits. Each can help, and each can harm quality. Fewer chunks may reduce context recall. Smaller models may fail edge cases. Quantization may affect reasoning or tool-call reliability. Optimization needs eval gates.",
          "Route by difficulty when possible. Simple classification, summarization, or formatting tasks may use cheaper models. Ambiguous, high-risk, or tool-heavy tasks may require stronger models. A router itself needs evaluation because wrong routing can be a hidden quality regression. Confidence thresholds, input features, and fallback rules should be observable.",
          "The right metric is often a frontier: quality versus latency versus cost. A launch review should compare candidate configurations on the same golden set and production-like traffic. Choose the cheapest and fastest configuration that satisfies quality and risk requirements, not the single best score at any price or the cheapest model regardless of failures."
        ],
        keyTerms: [
          {
            term: "speculative decoding",
            definition:
              "A generation technique where a smaller draft model proposes tokens that a larger model verifies to improve speed."
          },
          {
            term: "quantization",
            definition:
              "Representing model weights or cache values with lower precision to reduce memory or improve speed."
          },
          {
            term: "quality-cost frontier",
            definition:
              "A comparison of configurations by task quality, latency, and cost tradeoffs."
          }
        ],
        checkYourself: [
          {
            prompt: "Why should prompt compression be evaluated with context recall?",
            reveal:
              "Compression can remove evidence needed for faithful answers. Context recall verifies that essential information still reaches the model."
          }
        ],
        callout: {
          tone: "interview",
          body:
            "Present optimization as constrained search: meet quality and safety gates, then minimize cost and latency."
        }
      }
    ],
    wrapUp: {
      takeaways: [
        "LLM cost is driven by token flow, model choice, tools, retrieval, and retries.",
        "Prefill and decode latency have different causes and fixes.",
        "Batching, KV-cache, and prefix caching shape throughput and memory capacity.",
        "Traces connect cost, latency, versions, retrieval, tools, guardrails, and quality.",
        "Optimization must be gated by task quality, faithfulness, and safety metrics."
      ],
      nextSteps: [
        "Instrument a trace schema with prompt, retrieval, model, tool, and guardrail spans.",
        "Break one request's latency into prefill, time to first token, and decode throughput.",
        "Compare two model-routing policies on quality, latency, and cost."
      ]
    }
  },
  "llmops-eval-lab/shipping-gates-and-guardrails": {
    title: "Chapter: Shipping gates, guardrails, and incident response",
    readingTime: "70-85 min",
    premise:
      "LLM features ship safely when evaluation gates, runtime guardrails, fallbacks, and incident response are designed together. This chapter covers risk tiers, policy checks, structured outputs, human escalation, and post-launch learning.",
    parts: [
      {
        id: "risk-tiered-shipping",
        heading: "Shipping gates should match the risk of the feature",
        paragraphs: [
          "Not every LLM feature needs the same release process. A brainstorming helper, a support answer generator, a refund-issuing agent, and a medical triage assistant carry different risk. Gate strictness should follow possible harm, reversibility, automation level, user population, and regulatory exposure. Overly strict gates slow harmless changes; weak gates endanger high-impact workflows.",
          "A risk tier defines required evidence. Low-risk features may require smoke tests and basic safety checks. Medium-risk features may require golden-set quality, citation checks, latency budgets, and canary monitoring. High-risk features may require human approval, adversarial testing, policy signoff, audit logs, rollback plans, and ongoing review. The point is not bureaucracy; it is proportional control.",
          "Gate criteria should be explicit before the release. If the team debates thresholds after seeing results, incentives drift toward rationalizing launch. A release checklist should state required eval suites, pass thresholds, known exceptions, approvers, rollback triggers, and monitoring windows. That converts subjective confidence into reviewable evidence."
        ],
        keyTerms: [
          {
            term: "risk tier",
            definition:
              "A category that determines release evidence and controls based on possible impact."
          },
          {
            term: "release gate",
            definition:
              "A required check or approval that must pass before shipping a change."
          },
          {
            term: "rollback trigger",
            definition:
              "A predefined condition that causes a release to be reverted or disabled."
          }
        ],
        checkYourself: [
          {
            prompt: "Why define gates before seeing candidate results?",
            reveal:
              "Predefined gates reduce motivated reasoning and make release decisions consistent, auditable, and risk-aligned."
          }
        ],
        callout: {
          tone: "interview",
          body:
            "Tie gates to harm and reversibility. A read-only assistant and a money-moving agent should not ship under the same policy."
        }
      },
      {
        id: "guardrail-layers",
        heading: "Guardrails are layered controls, not one magic classifier",
        paragraphs: [
          "Runtime guardrails can appear before, during, and after generation. Input checks detect unsupported requests, prompt injection, policy-sensitive topics, or malicious payloads. Retrieval filters enforce permissions and source scope. Tool guards restrict actions and arguments. Output checks validate schema, citations, safety policy, secrets, and tone. Human escalation handles cases automation should not decide.",
          "No single guardrail catches everything. A classifier may miss a novel attack. A regex may overblock harmless text. A model may produce valid JSON with unsafe content. Layering controls reduces reliance on any one detector and creates defense in depth. The product should also have safe defaults when guardrails disagree or fail.",
          "Guardrails must be evaluated like models. Track false positives, false negatives, bypasses, latency, user impact, and slice behavior. A guardrail that blocks 20 percent of legitimate users is a product defect. A guardrail that silently fails open during dependency outages is a safety defect. Observability and tests are as important as the guardrail logic."
        ],
        keyTerms: [
          {
            term: "guardrail",
            definition:
              "A runtime control that constrains, validates, blocks, routes, or monitors AI system behavior."
          },
          {
            term: "defense in depth",
            definition:
              "Using multiple independent layers of protection so one failure does not remove all control."
          },
          {
            term: "fail closed",
            definition:
              "A failure mode that blocks or escalates rather than allowing unsafe action when safety checks are unavailable."
          }
        ],
        checkYourself: [
          {
            prompt: "Why can guardrails harm product quality?",
            reveal:
              "False positives, latency, confusing refusals, and overbroad policies can block legitimate users or degrade task completion."
          }
        ],
        callout: {
          tone: "warning",
          body:
            "Guardrails are production systems. They need metrics, owners, tests, fallback behavior, and incident review."
        }
      },
      {
        id: "structured-output-tools",
        heading: "Structured outputs and tool permissions reduce ambiguity",
        paragraphs: [
          "Many LLM incidents come from ambiguous free-form output. If downstream code expects JSON, validate JSON schema before acting. If an answer needs citations, require source ids and verify they support claims. If a tool changes state, constrain allowed arguments, require confirmation, and log the action. Structure turns some model behavior into checkable contracts.",
          "Tool use expands the blast radius of LLM errors. A chat answer can be wrong; a tool call can send an email, issue a refund, delete data, or change permissions. Tool policies should define which tools are available for which intents, what arguments are allowed, which calls require user confirmation, and which calls require human approval. The model should not be the sole authority on whether an action is safe.",
          "Structured output does not eliminate reasoning failures. A model can produce valid JSON with the wrong value or cite a source that does not support the claim. Therefore schema validation should be paired with semantic checks, retrieval verification, and action-specific policies. The more irreversible the action, the more independent verification it deserves."
        ],
        keyTerms: [
          {
            term: "structured output",
            definition:
              "A constrained response format such as JSON, tool arguments, or typed fields."
          },
          {
            term: "tool permission",
            definition:
              "A policy controlling which tools can be called, with what arguments, and under what approvals."
          },
          {
            term: "semantic validation",
            definition:
              "Checking whether a structured value is correct and supported, not merely well-formed."
          }
        ],
        checkYourself: [
          {
            prompt: "Why is JSON schema validation not enough for a refund agent?",
            reveal:
              "The JSON may be well-formed while the refund amount, eligibility, account id, or approval state is wrong. Action semantics need independent checks."
          }
        ],
        callout: {
          tone: "interview",
          body:
            "For agents, separate generation permission from execution permission. The model can propose; policy decides whether to act."
        }
      },
      {
        id: "fallbacks-and-human-review",
        heading: "Fallback and escalation paths are part of safe automation",
        paragraphs: [
          "A system should know what to do when confidence is low, evidence is missing, policy is ambiguous, or guardrails fail. Options include asking a clarifying question, refusing, routing to human review, using a simpler deterministic rule, narrowing scope, or disabling an action. The fallback should be designed before launch rather than improvised in exception handling.",
          "Human review is most valuable when reviewers receive the right context: user request, retrieved evidence, model answer, tool proposal, guardrail results, policy references, and uncertainty reason. Reviewers should not be asked to reverse-engineer the model's hidden state. Their decisions should feed back into evaluation datasets and policy updates.",
          "Escalation criteria should be measurable. Examples include high-risk intent, low retrieval confidence, conflicting sources, missing permission, failed schema validation, sensitive user group, high dollar amount, or repeated user correction. If everything escalates, automation adds little value. If nothing escalates, the system is pretending uncertainty does not exist."
        ],
        keyTerms: [
          {
            term: "escalation",
            definition:
              "Routing a case to a safer workflow such as human review or higher-assurance processing."
          },
          {
            term: "clarifying question",
            definition:
              "A response that requests missing information rather than guessing."
          },
          {
            term: "uncertainty reason",
            definition:
              "Structured metadata explaining why the system lacks confidence or permission to proceed."
          }
        ],
        checkYourself: [
          {
            prompt: "What makes human review effective rather than symbolic?",
            reveal:
              "Reviewers need the evidence, model proposal, policy context, guardrail outputs, and clear decision criteria, and their decisions must improve future evals."
          }
        ],
        callout: {
          tone: "tip",
          body:
            "Fallbacks should preserve user trust: be specific about missing evidence, unsupported actions, or required review."
        }
      },
      {
        id: "incidents-and-learning",
        heading: "Incidents should improve gates, guardrails, and datasets",
        paragraphs: [
          "LLM incidents can involve hallucinated facts, unsafe advice, policy bypass, prompt injection, data exposure, tool misuse, runaway cost, or degraded latency. Incident response needs the same basics as other production systems: detection, severity, ownership, containment, communication, root-cause analysis, remediation, and follow-up. LLM-specific traces make this possible.",
          "A postmortem should identify which layer failed. Did retrieval return the wrong source? Did the prompt allow unsupported claims? Did a guardrail miss the case? Did a tool policy allow an unsafe argument? Did monitoring fail to alert? Did the eval harness lack a representative golden? The answer determines whether to fix data, prompt, model, tool policy, guardrail, or gate.",
          "The final step is learning. Add the incident to goldens or red-team suites, update guardrail tests, revise release gates, adjust monitoring, and document the new failure mode. Without this loop, teams repeatedly rediscover the same class of failure. A mature LLMOps program treats incidents as expensive training data for the whole system."
        ],
        keyTerms: [
          {
            term: "postmortem",
            definition:
              "A structured review of an incident's impact, causes, response, and prevention actions."
          },
          {
            term: "containment",
            definition:
              "Immediate action to limit incident impact, such as rollback, disabling tools, or narrowing traffic."
          },
          {
            term: "red-team suite",
            definition:
              "A set of adversarial or high-risk tests designed to probe known failure modes."
          }
        ],
        checkYourself: [
          {
            prompt: "What should happen to a production incident case after remediation?",
            reveal:
              "It should become an evaluation or guardrail test so future releases are checked against the discovered failure mode."
          }
        ],
        callout: {
          tone: "interview",
          body:
            "Close the loop: incident -> trace analysis -> root cause -> fix -> golden or guardrail test -> updated gate."
        }
      }
    ],
    wrapUp: {
      takeaways: [
        "Shipping gates should be proportional to feature risk, automation level, and reversibility.",
        "Guardrails need layered controls across input, retrieval, tools, output, and escalation.",
        "Structured outputs and tool policies make some behavior checkable but do not replace semantic validation.",
        "Fallbacks and human review are designed safety paths, not afterthoughts.",
        "Incidents should update traces, goldens, guardrail tests, monitoring, and release gates."
      ],
      nextSteps: [
        "Write a risk-tiered release checklist for an LLM support assistant.",
        "Design guardrail metrics for false positives, false negatives, latency, and bypasses.",
        "Turn a hypothetical tool-misuse incident into a golden case and gate."
      ]
    }
  }
};

/** @type {Record<string, import('../learnChapters.js').LessonLearnChapter>} */
export const llmopsEvalLabChapters = JSON.parse(JSON.stringify(chapters));
