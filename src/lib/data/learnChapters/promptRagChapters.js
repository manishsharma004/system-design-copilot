/** @type {Record<string, import('../learnChapters.js').LessonLearnChapter>} */
export const promptRagChapters = {
  "prompt-engineering-and-rag/prompt-engineering": {
    "title": "Chapter: Prompt engineering",
    "readingTime": "55-70 min",
    "premise": "Zero-shot, few-shot, chain-of-thought, and structured prompting techniques for reliable LLM outputs. This Learn chapter expands the short lesson summary into a full study unit you can read continuously, with interactive checks and selection-based AI search when a phrase needs a second opinion.",
    "parts": [
      {
        "id": "orientation",
        "heading": "Why this chapter exists",
        "paragraphs": [
          "Prompting in 2026 is an engineering discipline: role separation, cache-aware prompt layouts, schema-enforced outputs, and eval-driven iteration. Long chain-of-thought prompting is not the same control surface as built-in reasoning/extended-thinking models.",
          "This chapter treats \"Prompt engineering\" as a readable study unit: intuition first, then the mechanics you must be able to explain, then the failure modes that show up in interviews and production, and finally how to talk about the topic under time pressure.",
          "Read it like a book chapter. When a phrase is unclear, select it inside the Learn reader and use Search with AI to open Google, Perplexity, or DuckDuckGo without abandoning the chapter."
        ],
        "callout": {
          "tone": "tip",
          "body": "Target reading time is paced for depth, not skimming. Pause at each Check yourself prompt and answer out loud before revealing the guide answer."
        }
      },
      {
        "id": "zero-shot-few-shot-and-chain-of-thought-as-templates",
        "heading": "Zero-shot, few-shot, and chain-of-thought as templates",
        "paragraphs": [
          "A prompt is a program with fuzzy semantics. Zero-shot states the task and output contract. Few-shot adds examples that teach format and edge handling more reliably than adjectives like \"be careful\". Chain-of-thought asks for intermediate reasoning before the final answer—helpful on multi-step tasks, costlier in tokens, and not always desirable in user-visible chat. Prefer writing prompts as versioned templates with variables (system policy, user content, retrieved context) rather than concatenated strings scattered in code. In this lab we render and evaluate templates offline with NumPy/sklearn-free Python—no OpenAI calls required.",
          "Hold these points explicitly while you study. Restate each one without looking at the list — recognition is not the interview bar; recall is.",
          "• Treat prompts as versioned templates with explicit variables.",
          "• Few-shot examples often beat long prose instructions.",
          "• CoT trades tokens/latency for harder reasoning tasks.",
          "Production lens — Structure beats clever wording: Clear role assignment, delimited inputs, explicit output schemas (JSON mode, tool schemas), and few-shot exemplars outperform adjective stuffing (\"be very careful\"). Chain-of-thought helps reasoning tasks but increases latency and tokens; self-consistency trades compute for accuracy. Temperature and top-p affect creativity vs determinism—near-zero temperature for extraction, higher for brainstorming."
        ],
        "keyTerms": [
          {
            "term": "Treat prompts as versioned templates with",
            "definition": "Treat prompts as versioned templates with explicit variables."
          },
          {
            "term": "Few-shot examples often beat long prose",
            "definition": "Few-shot examples often beat long prose instructions."
          },
          {
            "term": "CoT trades tokens/latency for harder reasoning",
            "definition": "CoT trades tokens/latency for harder reasoning tasks."
          }
        ],
        "workedExample": {
          "title": "Render prompt templates with variables",
          "body": "Narrate what each shape and step is doing. If you only recognize the API call, you do not own the idea yet — rewrite the example from memory after one pass.",
          "code": "def render(template, **vars):\n    out = template\n    for k, v in vars.items():\n        out = out.replace(\"{{\" + k + \"}}\", str(v))\n    return out\n\nfew = \"\"\"Classify sentiment as positive|negative|neutral.\nText: \"Broke quickly\" -> negative\nText: \"Love it\" -> positive\nText: \"{{text}}\" ->\"\"\"\nprint(render(few, text=\"Battery lasts forever\"))",
          "language": "python"
        },
        "checkYourself": [
          {
            "prompt": "Can write zero/few/CoT templates for one task.",
            "reveal": "Clear role assignment, delimited inputs, explicit output schemas (JSON mode, tool schemas), and few-shot exemplars outperform adjective stuffing (\"be very careful\"). Chain-of-thought helps reasoning tasks but increases latency and tokens; self-consistency trades compute for accuracy. Temperature and top-p affect creativity vs determinism—near-zero temperature for extraction, higher for brainstorming."
          }
        ]
      },
      {
        "id": "structured-outputs-and-schema-validation",
        "heading": "Structured outputs and schema validation",
        "paragraphs": [
          "Downstream code needs parseable objects, not essays. Specify JSON schemas, enumerations, and required fields. Validate with a strict parser; on failure, retry with the error message as feedback or fall back to a safe default. Constrained decoding helps in some stacks, but validation remains mandatory. Keep schemas small; giant optional fields encourage hallucination. For enums, list allowed values in the prompt and reject unknowns. Unit-test your validator independently from the model.",
          "Hold these points explicitly while you study. Restate each one without looking at the list — recognition is not the interview bar; recall is.",
          "• Schema + validator + retry is the production pattern.",
          "• Small strict schemas beat sprawling optional blobs.",
          "• Test validators with malicious/malformed strings.",
          "Production lens — Prompt injection is an architectural problem: Untrusted content in prompts (user uploads, web pages, email bodies) can override system instructions. Mitigations include instruction hierarchy, output validation, tool permission boundaries, and separating control plane from data plane—not better adjectives in the system prompt. Security-aware prompt design treats the model as a probabilistic executor, not a policy engine."
        ],
        "keyTerms": [
          {
            "term": "Schema + validator + retry is",
            "definition": "Schema + validator + retry is the production pattern."
          },
          {
            "term": "Small strict schemas beat sprawling optional",
            "definition": "Small strict schemas beat sprawling optional blobs."
          },
          {
            "term": "Test validators with malicious/malformed stri…",
            "definition": "Test validators with malicious/malformed strings."
          }
        ],
        "workedExample": {
          "title": "Validate a minimal action-item JSON object",
          "body": "Narrate what each shape and step is doing. If you only recognize the API call, you do not own the idea yet — rewrite the example from memory after one pass.",
          "code": "import json\n\nREQUIRED = {\"assignee\", \"task\", \"priority\"}\nALLOWED_PRIORITY = {\"low\", \"medium\", \"high\"}\n\ndef validate_action_item(raw):\n    try:\n        obj = json.loads(raw)\n    except json.JSONDecodeError as e:\n        return False, f\"json: {e}\"\n    if not REQUIRED.issubset(obj):\n        return False, \"missing keys\"\n    if obj[\"priority\"] not in ALLOWED_PRIORITY:\n        return False, \"bad priority\"\n    return True, obj\n\nprint(validate_action_item('{\"assignee\":\"A\",\"task\":\"Write tests\",\"priority\":\"high\"}'))\nprint(validate_action_item('{\"assignee\":\"A\"}'))",
          "language": "python"
        },
        "checkYourself": [
          {
            "prompt": "Validates structured outputs with schemas.",
            "reveal": "Untrusted content in prompts (user uploads, web pages, email bodies) can override system instructions. Mitigations include instruction hierarchy, output validation, tool permission boundaries, and separating control plane from data plane—not better adjectives in the system prompt. Security-aware prompt design treats the model as a probabilistic executor, not a policy engine."
          }
        ]
      },
      {
        "id": "evaluation-loops-for-prompts",
        "heading": "Evaluation loops for prompts",
        "paragraphs": [
          "Prompt changes need datasets: inputs, expected properties, and scorers. Scorers may be exact match, regex, JSON validity, or rubric classifiers. Hold out a regression suite that must stay green. Log failures into new cases. A/B tests in production measure user outcomes, but offline suites catch obvious breaks in seconds. Avoid editing prompts while staring only at one cherry-picked example—that overfits your intuition. Track token cost alongside quality; a 5% quality win that triples tokens may be a net loss.",
          "Hold these points explicitly while you study. Restate each one without looking at the list — recognition is not the interview bar; recall is.",
          "• Build a prompt regression dataset early.",
          "• Score with automatic checks before human review.",
          "• Optimize quality per dollar/latency, not quality alone.",
          "Production lens — Structure beats clever wording: Clear role assignment, delimited inputs, explicit output schemas (JSON mode, tool schemas), and few-shot exemplars outperform adjective stuffing (\"be very careful\"). Chain-of-thought helps reasoning tasks but increases latency and tokens; self-consistency trades compute for accuracy. Temperature and top-p affect creativity vs determinism—near-zero temperature for extraction, higher for brainstorming."
        ],
        "keyTerms": [
          {
            "term": "Build a prompt regression dataset early.",
            "definition": "Build a prompt regression dataset early."
          },
          {
            "term": "Score with automatic checks before human",
            "definition": "Score with automatic checks before human review."
          },
          {
            "term": "Optimize quality per dollar/latency, not quality",
            "definition": "Optimize quality per dollar/latency, not quality alone."
          }
        ],
        "checkYourself": [
          {
            "prompt": "Maintains a prompt regression suite.",
            "reveal": "Explain the idea in two sentences, name one metric or invariant you would watch, and state one mistake juniors make. Then connect it back to evaluation loops for prompts."
          }
        ]
      },
      {
        "id": "security-injection-and-untrusted-content",
        "heading": "Security: injection and untrusted content",
        "paragraphs": [
          "User text and retrieved documents are untrusted. Prompt injection tries to override system instructions (\"ignore previous rules\"). Defenses include clear privilege boundaries, not executing tool calls from untrusted segments without policy checks, sanitizing HTML, and instructing the model to treat docs as data. Never put secrets in prompts that users can exfiltrate. Red-team with adversarial strings in your eval set. Frameworks do not erase this threat model; they only organize it.",
          "Hold these points explicitly while you study. Restate each one without looking at the list — recognition is not the interview bar; recall is.",
          "• Untrusted content is data, not instructions.",
          "• Gate tool execution with policy checks.",
          "• Include injection cases in offline evals.",
          "Production lens — Prompt injection is an architectural problem: Untrusted content in prompts (user uploads, web pages, email bodies) can override system instructions. Mitigations include instruction hierarchy, output validation, tool permission boundaries, and separating control plane from data plane—not better adjectives in the system prompt. Security-aware prompt design treats the model as a probabilistic executor, not a policy engine."
        ],
        "keyTerms": [
          {
            "term": "Untrusted content is data, not instructions.",
            "definition": "Untrusted content is data, not instructions."
          },
          {
            "term": "Gate tool execution with policy checks.",
            "definition": "Gate tool execution with policy checks."
          },
          {
            "term": "Include injection cases in offline evals.",
            "definition": "Include injection cases in offline evals."
          }
        ],
        "checkYourself": [
          {
            "prompt": "Understands injection threat model.",
            "reveal": "Explain the idea in two sentences, name one metric or invariant you would watch, and state one mistake juniors make. Then connect it back to security: injection and untrusted content."
          }
        ]
      },
      {
        "id": "choosing-techniques-under-product-constraints",
        "heading": "Choosing techniques under product constraints",
        "paragraphs": [
          "Support bots, extraction pipelines, and creative writers need different prompt styles. High-stakes extraction wants strict schemas and low temperature. Creative ideation tolerates higher entropy. Multilingual users need explicit language policies. When prompts become sprawling, consider fine-tuning or specialized models. Interview answers should propose a technique ladder: clarify contract -> add examples -> add reasoning/tools -> consider training.",
          "Hold these points explicitly while you study. Restate each one without looking at the list — recognition is not the interview bar; recall is.",
          "• Match temperature and technique to task risk.",
          "• Escalate from prompting to training when contracts stabilize.",
          "• Document the chosen ladder for each feature.",
          "Production lens — Structure beats clever wording: Clear role assignment, delimited inputs, explicit output schemas (JSON mode, tool schemas), and few-shot exemplars outperform adjective stuffing (\"be very careful\"). Chain-of-thought helps reasoning tasks but increases latency and tokens; self-consistency trades compute for accuracy. Temperature and top-p affect creativity vs determinism—near-zero temperature for extraction, higher for brainstorming."
        ],
        "keyTerms": [
          {
            "term": "Match temperature and technique to task",
            "definition": "Match temperature and technique to task risk."
          },
          {
            "term": "Escalate from prompting to training when",
            "definition": "Escalate from prompting to training when contracts stabilize."
          },
          {
            "term": "Document the chosen ladder for each",
            "definition": "Document the chosen ladder for each feature."
          }
        ],
        "workedExample": {
          "title": "Offline prompt-technique harness with a mock classifier",
          "body": "Narrate what each shape and step is doing. If you only recognize the API call, you do not own the idea yet — rewrite the example from memory after one pass.",
          "code": "def mock_classify(prompt):\n    p = prompt.lower()\n    if \"broke\" in p or \"terrible\" in p:\n        return \"negative\"\n    if \"love\" in p or \"forever\" in p:\n        return \"positive\"\n    return \"neutral\"\n\ndef build_zero_shot(text):\n    return f\"Classify positive/negative/neutral:\\n{text}\\nLabel:\"\n\ncases = [\"Broke after one day\", \"Battery lasts forever\", \"It is fine\"]\nfor t in cases:\n    print(t, \"->\", mock_classify(build_zero_shot(t)))",
          "language": "python"
        },
        "checkYourself": [
          {
            "prompt": "Tracks cost/latency with quality.",
            "reveal": "Explain the idea in two sentences, name one metric or invariant you would watch, and state one mistake juniors make. Then connect it back to choosing techniques under product constraints."
          }
        ]
      },
      {
        "id": "roles-prompt-caching-structured-outputs-and-eval-driven-iteration",
        "heading": "Roles, prompt caching, structured outputs, and eval-driven iteration",
        "paragraphs": [
          "Modern APIs expose distinct message roles—system, developer/policy, and user—and sometimes tool results as their own channels. Put durable policy, safety, and output contracts in the highest-privilege roles; put untrusted user and retrieved content in lower-privilege roles and never let retrieved HTML silently become system instructions. Prompt caching / prefix caching changes economics: stable prefixes (policies, long tool schemas, large static manuals) can be reused across requests so you pay full price mainly for the dynamic suffix. That pushes you to structure prompts with a large immutable head and a thin per-request tail—opposite of constantly rewriting the entire system prompt. Structured output enforcement (JSON schema, constrained decoding, or grammar-guided generation) should be the default for machine-consumed answers; free-form prose is for humans. Iterate prompts like code: golden sets, slice metrics (language, tenant, document type), shadow traffic, and change budgets. Important distinction for interviews: asking a classic chat model to “think step by step” in the visible prompt is not identical to routing to a reasoning model that spends hidden test-time compute. Visible CoT can help some tasks but leaks process text, adds tokens, and is a weaker, less controllable knob than provider reasoning modes with explicit effort settings. Choose the mechanism that matches your latency, audit, and accuracy needs.",
          "Hold these points explicitly while you study. Restate each one without looking at the list — recognition is not the interview bar; recall is.",
          "• Separate system/developer policy from untrusted user and retrieved content.",
          "• Design cache-friendly stable prefixes to cut repeated token spend.",
          "• Enforce schemas for machine-parsed outputs; evaluate prompts with golden sets.",
          "• Do not conflate long visible CoT prompting with built-in reasoning/extended-thinking models.",
          "Production lens — Prompt injection is an architectural problem: Untrusted content in prompts (user uploads, web pages, email bodies) can override system instructions. Mitigations include instruction hierarchy, output validation, tool permission boundaries, and separating control plane from data plane—not better adjectives in the system prompt. Security-aware prompt design treats the model as a probabilistic executor, not a policy engine."
        ],
        "keyTerms": [
          {
            "term": "Separate system/developer policy from untrust…",
            "definition": "Separate system/developer policy from untrusted user and retrieved content."
          },
          {
            "term": "Design cache-friendly stable prefixes to cut",
            "definition": "Design cache-friendly stable prefixes to cut repeated token spend."
          },
          {
            "term": "Enforce schemas for machine-parsed outputs; e…",
            "definition": "Enforce schemas for machine-parsed outputs; evaluate prompts with golden sets."
          },
          {
            "term": "Do not conflate long visible CoT",
            "definition": "Do not conflate long visible CoT prompting with built-in reasoning/extended-thinking models."
          }
        ],
        "workedExample": {
          "title": "Estimate prompt-cache savings on a stable prefix",
          "body": "Narrate what each shape and step is doing. If you only recognize the API call, you do not own the idea yet — rewrite the example from memory after one pass.",
          "code": "def monthly_cost(requests, prefix_tokens, suffix_tokens, price_per_1k, cache_hit_rate, cached_price_factor=0.1):\n    full = (prefix_tokens + suffix_tokens) / 1000.0 * price_per_1k\n    cached = (prefix_tokens / 1000.0 * price_per_1k * cached_price_factor) + (suffix_tokens / 1000.0 * price_per_1k)\n    per_req = (1 - cache_hit_rate) * full + cache_hit_rate * cached\n    return round(per_req * requests, 2)\n\nprint(\"no cache\", monthly_cost(200_000, 2500, 400, 0.01, 0.0))\nprint(\"with cache\", monthly_cost(200_000, 2500, 400, 0.01, 0.85))",
          "language": "python"
        },
        "checkYourself": [
          {
            "prompt": "Structures prompts for privilege separation and cache-friendly prefixes.",
            "reveal": "Explain the idea in two sentences, name one metric or invariant you would watch, and state one mistake juniors make. Then connect it back to roles, prompt caching, structured outputs, and eval-driven iteration."
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
          "Most interview answers fail not because the definition is wrong, but because the candidate never names how the approach breaks. Use this section as a trap checklist for prompt engineering.",
          "Trap: Editing prompts against a single example. A strong answer preempts it — say what you would monitor, what fallback you would keep, or what simpler baseline you would try first.",
          "Trap: No JSON validation before downstream use. A strong answer preempts it — say what you would monitor, what fallback you would keep, or what simpler baseline you would try first.",
          "Trap: Putting secrets in user-visible prompt layers. A strong answer preempts it — say what you would monitor, what fallback you would keep, or what simpler baseline you would try first.",
          "Trap: Assuming frameworks prevent injection. A strong answer preempts it — say what you would monitor, what fallback you would keep, or what simpler baseline you would try first.",
          "Trap: Putting retrieved documents into the system role. A strong answer preempts it — say what you would monitor, what fallback you would keep, or what simpler baseline you would try first.",
          "Trap: Rewriting the entire prompt every request and defeating prefix caches. A strong answer preempts it — say what you would monitor, what fallback you would keep, or what simpler baseline you would try first.",
          "Trap: Assuming \"think step by step\" equals a reasoning-model product tier. A strong answer preempts it — say what you would monitor, what fallback you would keep, or what simpler baseline you would try first."
        ],
        "callout": {
          "tone": "warning",
          "body": "If you cannot name a failure mode, you do not yet understand the technique well enough to ship or defend it."
        },
        "checkYourself": [
          {
            "prompt": "Pick the most dangerous pitfall for Prompt engineering and explain how you would detect it in production or on a whiteboard.",
            "reveal": "Start with: \"Editing prompts against a single example.\" Then add a detection signal (metric, test, or review question) and a mitigation."
          }
        ]
      },
      {
        "id": "deeper-lens",
        "heading": "A deeper production lens",
        "paragraphs": [
          "Structure beats clever wording. Clear role assignment, delimited inputs, explicit output schemas (JSON mode, tool schemas), and few-shot exemplars outperform adjective stuffing (\"be very careful\"). Chain-of-thought helps reasoning tasks but increases latency and tokens; self-consistency trades compute for accuracy. Temperature and top-p affect creativity vs determinism—near-zero temperature for extraction, higher for brainstorming.",
          "Prompt injection is an architectural problem. Untrusted content in prompts (user uploads, web pages, email bodies) can override system instructions. Mitigations include instruction hierarchy, output validation, tool permission boundaries, and separating control plane from data plane—not better adjectives in the system prompt. Security-aware prompt design treats the model as a probabilistic executor, not a policy engine."
        ],
        "keyTerms": [
          {
            "term": "Structure beats clever wording",
            "definition": "Clear role assignment, delimited inputs, explicit output schemas (JSON mode, tool schemas), and few-shot exemplars outperform adjective stuffing (\"be very careful\"). Chain-of-thought helps reasoning tasks but increases l…"
          },
          {
            "term": "Prompt injection is an architectural problem",
            "definition": "Untrusted content in prompts (user uploads, web pages, email bodies) can override system instructions. Mitigations include instruction hierarchy, output validation, tool permission boundaries, and separating control plan…"
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
          "You should now be able to teach prompt engineering as a story: what problem it solves, how the mechanism works, which assumptions it depends on, and how you would know it failed.",
          "Close the loop by writing a 90-second spoken answer out loud. If you freeze on definitions, return to the orientation and the first technical part. If you freeze on trade-offs, return to failure modes.",
          "Practice prompts from this lesson: How does CoT help and what does it cost? | Design prompts for structured email extraction. | How do you defend against prompt injection?"
        ],
        "checkYourself": [
          {
            "prompt": "Give a 90-second spoken overview of Prompt engineering as if starting an interview answer.",
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
        "Can write zero/few/CoT templates for one task.",
        "Validates structured outputs with schemas.",
        "Maintains a prompt regression suite.",
        "Understands injection threat model.",
        "Tracks cost/latency with quality."
      ],
      "nextSteps": [
        "Return to the lesson page and attempt the practice / topic lab with this chapter still open if needed.",
        "Revisit any Check yourself prompts you could not answer out loud.",
        "Optional deeper reading: OpenAI Prompt Engineering Guide (OpenAI) — https://platform.openai.com/docs/guides/prompt-engineering",
        "Optional deeper reading: Chain-of-Thought Prompting Elicits Reasoning in Large Language Models (arXiv) — https://arxiv.org/abs/2201.11903"
      ]
    }
  },
  "prompt-engineering-and-rag/rag-systems": {
    "title": "Chapter: Retrieval-augmented generation",
    "readingTime": "60-75 min",
    "premise": "End-to-end RAG architecture: document ingestion, chunking, retrieval, context assembly, and grounded generation. This Learn chapter expands the short lesson summary into a full study unit you can read continuously, with interactive checks and selection-based AI search when a phrase needs a second opinion.",
    "parts": [
      {
        "id": "orientation",
        "heading": "Why this chapter exists",
        "paragraphs": [
          "Production RAG in 2026 is a staged system—ingest, chunk+metadata, hybrid retrieve, rerank, generate, cite/refuse—with failure attribution, optional graph augmentation, and hard multi-tenant ACL filters. Demos that skip these stages do not survive enterprise reviews.",
          "This chapter treats \"Retrieval-augmented generation\" as a readable study unit: intuition first, then the mechanics you must be able to explain, then the failure modes that show up in interviews and production, and finally how to talk about the topic under time pressure.",
          "Read it like a book chapter. When a phrase is unclear, select it inside the Learn reader and use Search with AI to open Google, Perplexity, or DuckDuckGo without abandoning the chapter."
        ],
        "callout": {
          "tone": "tip",
          "body": "Target reading time is paced for depth, not skimming. Pause at each Check yourself prompt and answer out loud before revealing the guide answer."
        }
      },
      {
        "id": "end-to-end-rag-data-path",
        "heading": "End-to-end RAG data path",
        "paragraphs": [
          "Documents are ingested, cleaned, chunked, embedded, and indexed. At query time you embed the query (or rewrite it), retrieve top-k chunks, optionally rerank, assemble a prompt with citations, and generate an answer constrained to the evidence. Failures occur at every stage: bad PDF parsing, awkward chunks, weak embeddings, wrong k, prompt packing that truncates the best passage, or a generator that ignores context. Draw the sequence diagram before picking frameworks. Offline, we simulate retrieval with NumPy cosine search and template rendering. Retrieval quality compounds: a 10 percent miss at retrieval often becomes an unrecoverable hallucination later, so invest measurement there first.",
          "Hold these points explicitly while you study. Restate each one without looking at the list — recognition is not the interview bar; recall is.",
          "• Diagram ingest vs query paths separately.",
          "• Measure each stage with its own metrics.",
          "• Assume the generator will ignore weak context.",
          "Production lens — Hybrid retrieval plus reranking is the 2026 baseline: Pure dense retrieval still misses exact identifiers; pure lexical retrieval still misses paraphrase. Production RAG stacks typically fuse BM25 (or similar) with dense embeddings, then apply a cross-encoder or late-interaction reranker inside a tight top-k before generation. Metadata filters (tenant, ACL, freshness) are part of relevance—not an afterthought bolted on in the prompt.\n\nChunking remains a top lever: structure-aware splits by headings/functions, overlap for boundary answers, and parent-document expansion when small chunks retrieve but large context is needed for generation. Measure recall@k and nDCG on a labeled set before investing in multi-agent orchestration; agentic RAG cannot fetch evidence that indexing never made findable."
        ],
        "keyTerms": [
          {
            "term": "Diagram ingest vs query paths separately.",
            "definition": "Diagram ingest vs query paths separately."
          },
          {
            "term": "Measure each stage with its own",
            "definition": "Measure each stage with its own metrics."
          },
          {
            "term": "Assume the generator will ignore weak",
            "definition": "Assume the generator will ignore weak context."
          }
        ],
        "workedExample": {
          "title": "Minimal retrieve-then-generate template",
          "body": "Narrate what each shape and step is doing. If you only recognize the API call, you do not own the idea yet — rewrite the example from memory after one pass.",
          "code": "import numpy as np\n\ndef embed(text, dim=8, seed=0):\n    rng = np.random.default_rng(abs(hash(text)) % (2**32))\n    v = rng.normal(size=dim)\n    return v / (np.linalg.norm(v) + 1e-9)\n\nchunks = [\"reset password via email link\", \"pricing is usage based\", \"office closed on holidays\"]\nE = np.stack([embed(c) for c in chunks])\nq = embed(\"how do I reset my password\")\nscores = E @ q\ntop = int(scores.argmax())\nprompt = f\"Answer using context.\\nContext: {chunks[top]}\\nQuestion: how do I reset my password\\nAnswer:\"\nprint(scores.round(3), prompt)",
          "language": "python"
        },
        "checkYourself": [
          {
            "prompt": "Can describe ingest and query paths end to end.",
            "reveal": "Pure dense retrieval still misses exact identifiers; pure lexical retrieval still misses paraphrase. Production RAG stacks typically fuse BM25 (or similar) with dense embeddings, then apply a cross-encoder or late-interaction reranker inside a tight top-k before generation. Metadata filters (tenant, ACL, freshness) are part of relevance—not an afterthought bolted on in the prompt.\n\nChunking remains a top lever: structure-aware splits by headings/functions, overlap for boundary answers, and parent-document expansion when small chunks retrieve but large context is needed for generation. Measure recall@k and nDCG on a labeled set before investing in multi-agent orchestration; agentic RAG cannot fetch evidence that indexing never made findable."
          }
        ]
      },
      {
        "id": "chunking-and-metadata-design",
        "heading": "Chunking and metadata design",
        "paragraphs": [
          "Chunk boundaries should respect headings, code blocks, and table rows when possible. Store metadata: source URL, section title, product version, timestamps, ACL tags. Retrieval filters on metadata prevent obsolete or unauthorized text from entering the prompt. Parent-child or small-to-big strategies retrieve small precise chunks then expand to surrounding context for generation. Deduplicate near-identical chunks from mirrored docs. Rechunking is a migration— version it. Context packing is an optimization problem under a token budget; treat it like capacity planning, not string concatenation.",
          "Hold these points explicitly while you study. Restate each one without looking at the list — recognition is not the interview bar; recall is.",
          "• Metadata filters are part of correctness, not extras.",
          "• Structure-aware chunking beats blind windows for manuals.",
          "• Version chunkers like model weights.",
          "Production lens — Evaluation-first RAG beats prompt-first RAG: Frameworks like RAGAS popularized faithfulness, answer relevance, and context precision/recall-style metrics that separate retrieval faults from generator faults. Pair them with classical IR metrics and citation checks. Promote chunker/index/embedding changes only when those gates hold. Online, log retrieved IDs and user corrections to refresh hard cases.\n\nGrounding policy is product design: refuse or clarify when evidence is weak; require quote-backed claims for high-risk domains. Long-context models reduce some chunk pressure but do not remove the need for retrieval quality, ACLs, or eval—context stuffing raises cost and can still drown the needle. Interview answers should name hybrid search, rerank, and faithfulness gates as a coherent system."
        ],
        "keyTerms": [
          {
            "term": "Metadata filters are part of correctness,",
            "definition": "Metadata filters are part of correctness, not extras."
          },
          {
            "term": "Structure-aware chunking beats blind windows for",
            "definition": "Structure-aware chunking beats blind windows for manuals."
          },
          {
            "term": "Version chunkers like model weights.",
            "definition": "Version chunkers like model weights."
          }
        ],
        "checkYourself": [
          {
            "prompt": "Designs chunks with metadata/ACLs.",
            "reveal": "Frameworks like RAGAS popularized faithfulness, answer relevance, and context precision/recall-style metrics that separate retrieval faults from generator faults. Pair them with classical IR metrics and citation checks. Promote chunker/index/embedding changes only when those gates hold. Online, log retrieved IDs and user corrections to refresh hard cases.\n\nGrounding policy is product design: refuse or clarify when evidence is weak; require quote-backed claims for high-risk domains. Long-context models reduce some chunk pressure but do not remove the need for retrieval quality, ACLs, or eval—context stuffing raises cost and can still drown the needle. Interview answers should name hybrid search, rerank, and faithfulness gates as a coherent system."
          }
        ]
      },
      {
        "id": "context-assembly-citations-and-refusal",
        "heading": "Context assembly, citations, and refusal",
        "paragraphs": [
          "Pack chunks with clear separators and source IDs. Instruct the model to cite IDs and to refuse when context is insufficient. Cap each chunk length so one verbose hit cannot crowd out others. Order can matter; put highly relevant or policy text where your model attends reliably. After generation, verify citations point to real IDs and that quoted spans exist (string contains checks). These deterministic postchecks catch many fluent lies.",
          "Hold these points explicitly while you study. Restate each one without looking at the list — recognition is not the interview bar; recall is.",
          "• Citations need machine-checkable IDs.",
          "• Refuse when retrieval confidence is low.",
          "• Post-validate quotes against retrieved text.",
          "Production lens — Agentic RAG needs budgets and slice-specific justification: Query decomposition, iterative retrieve-and-verify, and tool-using research loops help multi-hop questions. They also multiply latency and tokens. Gate agentic paths to slices where single-shot hybrid RAG fails offline, and enforce step/token budgets with degrade to single-pass retrieval. Without slice metrics, teams pay agent costs on navigational FAQs.\n\nAccess control must apply at retrieval time. Vector indexes without document-level auth create cross-tenant leaks that no generator policy can ethically “average away.” Treat index builds, embedding model versions, and ACL fields as release artifacts subject to the same canary discipline as prompts."
        ],
        "keyTerms": [
          {
            "term": "Citations need machine-checkable IDs.",
            "definition": "Citations need machine-checkable IDs."
          },
          {
            "term": "Refuse when retrieval confidence is low.",
            "definition": "Refuse when retrieval confidence is low."
          },
          {
            "term": "Post-validate quotes against retrieved text.",
            "definition": "Post-validate quotes against retrieved text."
          }
        ],
        "checkYourself": [
          {
            "prompt": "Assembles prompts with citation contracts.",
            "reveal": "Query decomposition, iterative retrieve-and-verify, and tool-using research loops help multi-hop questions. They also multiply latency and tokens. Gate agentic paths to slices where single-shot hybrid RAG fails offline, and enforce step/token budgets with degrade to single-pass retrieval. Without slice metrics, teams pay agent costs on navigational FAQs.\n\nAccess control must apply at retrieval time. Vector indexes without document-level auth create cross-tenant leaks that no generator policy can ethically “average away.” Treat index builds, embedding model versions, and ACL fields as release artifacts subject to the same canary discipline as prompts."
          }
        ]
      },
      {
        "id": "rag-evaluation-retrieval-and-answer-quality",
        "heading": "RAG evaluation: retrieval and answer quality",
        "paragraphs": [
          "Evaluate retrieval with Recall@k / nDCG on labeled queries. Evaluate answers with groundedness, correctness vs references, and citation accuracy. Faithfulness metrics detect unsupported claims. Create adversarial queries that target obsolete policies. When changing embeddings or prompts, run the suite. Online metrics include thumbs-down reasons and escalate-to-human rates. Do not optimize only generator eloquence.",
          "Hold these points explicitly while you study. Restate each one without looking at the list — recognition is not the interview bar; recall is.",
          "• Split retrieval metrics from answer metrics.",
          "• Include adversarial and obsolete-doc queries.",
          "• Track citation validity automatically.",
          "Production lens — Hybrid retrieval plus reranking is the 2026 baseline: Pure dense retrieval still misses exact identifiers; pure lexical retrieval still misses paraphrase. Production RAG stacks typically fuse BM25 (or similar) with dense embeddings, then apply a cross-encoder or late-interaction reranker inside a tight top-k before generation. Metadata filters (tenant, ACL, freshness) are part of relevance—not an afterthought bolted on in the prompt.\n\nChunking remains a top lever: structure-aware splits by headings/functions, overlap for boundary answers, and parent-document expansion when small chunks retrieve but large context is needed for generation. Measure recall@k and nDCG on a labeled set before investing in multi-agent orchestration; agentic RAG cannot fetch evidence that indexing never made findable."
        ],
        "keyTerms": [
          {
            "term": "Split retrieval metrics from answer metrics.",
            "definition": "Split retrieval metrics from answer metrics."
          },
          {
            "term": "Include adversarial and obsolete-doc queries.",
            "definition": "Include adversarial and obsolete-doc queries."
          },
          {
            "term": "Track citation validity automatically.",
            "definition": "Track citation validity automatically."
          }
        ],
        "workedExample": {
          "title": "Faithfulness check via unsupported token heuristic",
          "body": "Narrate what each shape and step is doing. If you only recognize the API call, you do not own the idea yet — rewrite the example from memory after one pass.",
          "code": "def unsupported_claims(answer, contexts):\n    # toy: flag answer sentences whose words mostly missing from context bag\n    ctx = set(\" \".join(contexts).lower().split())\n    bad = []\n    for sent in answer.split(\".\"):\n        words = [w for w in sent.lower().split() if w.isalpha()]\n        if not words:\n            continue\n        overlap = sum(w in ctx for w in words) / len(words)\n        if overlap < 0.3:\n            bad.append(sent.strip())\n    return bad\n\nprint(unsupported_claims(\n    \"Reset via email. Also we refund all purchases always.\",\n    [\"reset password via email link\"],\n))",
          "language": "python"
        },
        "checkYourself": [
          {
            "prompt": "Evaluates retrieval and groundedness separately.",
            "reveal": "Explain the idea in two sentences, name one metric or invariant you would watch, and state one mistake juniors make. Then connect it back to rag evaluation: retrieval and answer quality."
          }
        ]
      },
      {
        "id": "operating-rag-in-production",
        "heading": "Operating RAG in production",
        "paragraphs": [
          "Freshness SLAs decide crawl/reindex frequency. Multitenant corpora need hard ACL filters before top-k. Cache frequent queries cautiously—stale caches violate freshness. Observe empty-retrieval rates and average similarity of top-1. When the generator cites missing IDs, alert. Frameworks (LangChain/LlamaIndex-style) accelerate glue but do not replace retrieval science; keep your core ranking/eval code inspectable and tested without the framework.",
          "Hold these points explicitly while you study. Restate each one without looking at the list — recognition is not the interview bar; recall is.",
          "• Define freshness and ACL requirements explicitly.",
          "• Monitor empty/low-score retrieval rates.",
          "• Keep core RAG logic unit-testable outside frameworks.",
          "Production lens — Evaluation-first RAG beats prompt-first RAG: Frameworks like RAGAS popularized faithfulness, answer relevance, and context precision/recall-style metrics that separate retrieval faults from generator faults. Pair them with classical IR metrics and citation checks. Promote chunker/index/embedding changes only when those gates hold. Online, log retrieved IDs and user corrections to refresh hard cases.\n\nGrounding policy is product design: refuse or clarify when evidence is weak; require quote-backed claims for high-risk domains. Long-context models reduce some chunk pressure but do not remove the need for retrieval quality, ACLs, or eval—context stuffing raises cost and can still drown the needle. Interview answers should name hybrid search, rerank, and faithfulness gates as a coherent system."
        ],
        "keyTerms": [
          {
            "term": "Define freshness and ACL requirements explici…",
            "definition": "Define freshness and ACL requirements explicitly."
          },
          {
            "term": "Monitor empty/low-score retrieval rates.",
            "definition": "Monitor empty/low-score retrieval rates."
          },
          {
            "term": "Keep core RAG logic unit-testable outside",
            "definition": "Keep core RAG logic unit-testable outside frameworks."
          }
        ],
        "checkYourself": [
          {
            "prompt": "Monitors freshness and empty retrieval.",
            "reveal": "Explain the idea in two sentences, name one metric or invariant you would watch, and state one mistake juniors make. Then connect it back to operating rag in production."
          }
        ]
      },
      {
        "id": "production-rag-stacks-graphrag-paths-failure-attribution-and-tenant-acls",
        "heading": "Production RAG stacks, GraphRAG paths, failure attribution, and tenant ACLs",
        "paragraphs": [
          "A durable RAG architecture is a pipeline with owned stages. Ingest normalizes source systems, strips boilerplate, and records provenance. Chunking emits passages plus metadata (source, section, timestamps, access labels, language). Hybrid retrieval pulls lexical and dense candidates; a reranker tightens precision; generation must cite evidence or refuse when support is weak. GraphRAG and knowledge-graph patterns are an optional advanced path: extract entities/relations, retrieve subgraphs for multi-hop questions (“which vendor shares a parent with X?”), then verbalize graph context into the prompt. Use graphs when relationships matter more than passage similarity; do not add graph ETL for FAQ lookup. Failure attribution is how you debug: label misses as parse/chunk, retrieve, rerank, context packing, or generation/faithfulness—then fix the guilty stage. Multi-tenant ACL filtering is non-negotiable: filters must run as prefilters (or cryptographically equivalent constrained retrieval) so vectors from Tenant A never enter Tenant B’s shortlist. Post-filtering after ANN can leak via scores or side channels if misimplemented; prefer index partitioning or mandatory metadata predicates enforced in the retrieval engine. Log chunk ids used, not raw documents, and keep delete/reindex paths for retention law.",
          "Hold these points explicitly while you study. Restate each one without looking at the list — recognition is not the interview bar; recall is.",
          "• Own the full stack: ingest → chunk/metadata → hybrid retrieve → rerank → generate → cite/refuse.",
          "• Treat GraphRAG as an optional multi-hop path, not the default for every corpus.",
          "• Attribute quality failures to a stage before changing prompts or models.",
          "• Enforce tenant ACLs inside retrieval, not only in the final prompt assembly.",
          "Production lens — Agentic RAG needs budgets and slice-specific justification: Query decomposition, iterative retrieve-and-verify, and tool-using research loops help multi-hop questions. They also multiply latency and tokens. Gate agentic paths to slices where single-shot hybrid RAG fails offline, and enforce step/token budgets with degrade to single-pass retrieval. Without slice metrics, teams pay agent costs on navigational FAQs.\n\nAccess control must apply at retrieval time. Vector indexes without document-level auth create cross-tenant leaks that no generator policy can ethically “average away.” Treat index builds, embedding model versions, and ACL fields as release artifacts subject to the same canary discipline as prompts."
        ],
        "keyTerms": [
          {
            "term": "Own the full stack: ingest →",
            "definition": "Own the full stack: ingest → chunk/metadata → hybrid retrieve → rerank → generate → cite/refuse."
          },
          {
            "term": "Treat GraphRAG as an optional multi-hop",
            "definition": "Treat GraphRAG as an optional multi-hop path, not the default for every corpus."
          },
          {
            "term": "Attribute quality failures to a stage",
            "definition": "Attribute quality failures to a stage before changing prompts or models."
          },
          {
            "term": "Enforce tenant ACLs inside retrieval, not",
            "definition": "Enforce tenant ACLs inside retrieval, not only in the final prompt assembly."
          }
        ],
        "workedExample": {
          "title": "Attribute RAG failures to pipeline stages",
          "body": "Narrate what each shape and step is doing. If you only recognize the API call, you do not own the idea yet — rewrite the example from memory after one pass.",
          "code": "def attribute(case):\n    if case['relevant_in_index'] is False:\n        return 'ingest_or_chunk'\n    if case['recall_at_k'] < 1.0:\n        return 'retrieve'\n    if case['relevant_in_rerank_top'] is False:\n        return 'rerank'\n    if case['cited_support'] is False:\n        return 'generate_or_prompt'\n    return 'ok'\n\ncases = [\n    {'relevant_in_index': False, 'recall_at_k': 0.0, 'relevant_in_rerank_top': False, 'cited_support': False},\n    {'relevant_in_index': True, 'recall_at_k': 0.0, 'relevant_in_rerank_top': False, 'cited_support': False},\n    {'relevant_in_index': True, 'recall_at_k': 1.0, 'relevant_in_rerank_top': True, 'cited_support': False},\n]\nprint([attribute(c) for c in cases])",
          "language": "python"
        },
        "checkYourself": [
          {
            "prompt": "Can draw the production RAG stage diagram including cite/refuse.",
            "reveal": "Explain the idea in two sentences, name one metric or invariant you would watch, and state one mistake juniors make. Then connect it back to production rag stacks, graphrag paths, failure attribution, and tenant acls."
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
          "Most interview answers fail not because the definition is wrong, but because the candidate never names how the approach breaks. Use this section as a trap checklist for retrieval-augmented generation.",
          "Trap: Huge undifferentiated chunks. A strong answer preempts it — say what you would monitor, what fallback you would keep, or what simpler baseline you would try first.",
          "Trap: No citation validation. A strong answer preempts it — say what you would monitor, what fallback you would keep, or what simpler baseline you would try first.",
          "Trap: Evaluating only answer style. A strong answer preempts it — say what you would monitor, what fallback you would keep, or what simpler baseline you would try first.",
          "Trap: Framework spaghetti without metrics. A strong answer preempts it — say what you would monitor, what fallback you would keep, or what simpler baseline you would try first.",
          "Trap: Prompt-tuning a generator when recall@k is the real failure. A strong answer preempts it — say what you would monitor, what fallback you would keep, or what simpler baseline you would try first.",
          "Trap: Adding a knowledge graph before hybrid retrieval is solid. A strong answer preempts it — say what you would monitor, what fallback you would keep, or what simpler baseline you would try first.",
          "Trap: Applying tenant filters only after fetching foreign vectors into memory. A strong answer preempts it — say what you would monitor, what fallback you would keep, or what simpler baseline you would try first."
        ],
        "callout": {
          "tone": "warning",
          "body": "If you cannot name a failure mode, you do not yet understand the technique well enough to ship or defend it."
        },
        "checkYourself": [
          {
            "prompt": "Pick the most dangerous pitfall for Retrieval-augmented generation and explain how you would detect it in production or on a whiteboard.",
            "reveal": "Start with: \"Huge undifferentiated chunks.\" Then add a detection signal (metric, test, or review question) and a mitigation."
          }
        ]
      },
      {
        "id": "deeper-lens",
        "heading": "A deeper production lens",
        "paragraphs": [
          "Hybrid retrieval plus reranking is the 2026 baseline. Pure dense retrieval still misses exact identifiers; pure lexical retrieval still misses paraphrase. Production RAG stacks typically fuse BM25 (or similar) with dense embeddings, then apply a cross-encoder or late-interaction reranker inside a tight top-k before generation. Metadata filters (tenant, ACL, freshness) are part of relevance—not an afterthought bolted on in the prompt.\n\nChunking remains a top lever: structure-aware splits by headings/functions, overlap for boundary answers, and parent-document expansion when small chunks retrieve but large context is needed for generation. Measure recall@k and nDCG on a labeled set before investing in multi-agent orchestration; agentic RAG cannot fetch evidence that indexing never made findable.",
          "Evaluation-first RAG beats prompt-first RAG. Frameworks like RAGAS popularized faithfulness, answer relevance, and context precision/recall-style metrics that separate retrieval faults from generator faults. Pair them with classical IR metrics and citation checks. Promote chunker/index/embedding changes only when those gates hold. Online, log retrieved IDs and user corrections to refresh hard cases.\n\nGrounding policy is product design: refuse or clarify when evidence is weak; require quote-backed claims for high-risk domains. Long-context models reduce some chunk pressure but do not remove the need for retrieval quality, ACLs, or eval—context stuffing raises cost and can still drown the needle. Interview answers should name hybrid search, rerank, and faithfulness gates as a coherent system.",
          "Agentic RAG needs budgets and slice-specific justification. Query decomposition, iterative retrieve-and-verify, and tool-using research loops help multi-hop questions. They also multiply latency and tokens. Gate agentic paths to slices where single-shot hybrid RAG fails offline, and enforce step/token budgets with degrade to single-pass retrieval. Without slice metrics, teams pay agent costs on navigational FAQs.\n\nAccess control must apply at retrieval time. Vector indexes without document-level auth create cross-tenant leaks that no generator policy can ethically “average away.” Treat index builds, embedding model versions, and ACL fields as release artifacts subject to the same canary discipline as prompts."
        ],
        "keyTerms": [
          {
            "term": "Hybrid retrieval plus reranking is the 2026 baseline",
            "definition": "Pure dense retrieval still misses exact identifiers; pure lexical retrieval still misses paraphrase. Production RAG stacks typically fuse BM25 (or similar) with dense embeddings, then apply a cross-encoder or late-intera…"
          },
          {
            "term": "Evaluation-first RAG beats prompt-first RAG",
            "definition": "Frameworks like RAGAS popularized faithfulness, answer relevance, and context precision/recall-style metrics that separate retrieval faults from generator faults. Pair them with classical IR metrics and citation checks. …"
          },
          {
            "term": "Agentic RAG needs budgets and slice-specific justification",
            "definition": "Query decomposition, iterative retrieve-and-verify, and tool-using research loops help multi-hop questions. They also multiply latency and tokens. Gate agentic paths to slices where single-shot hybrid RAG fails offline, …"
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
          "You should now be able to teach retrieval-augmented generation as a story: what problem it solves, how the mechanism works, which assumptions it depends on, and how you would know it failed.",
          "Close the loop by writing a 90-second spoken answer out loud. If you freeze on definitions, return to the orientation and the first technical part. If you freeze on trade-offs, return to failure modes.",
          "Practice prompts from this lesson: How would you evaluate a RAG system before launch? | What chunking strategy fits API reference docs? | How do you prevent cross-tenant document leakage?"
        ],
        "checkYourself": [
          {
            "prompt": "Give a 90-second spoken overview of Retrieval-augmented generation as if starting an interview answer.",
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
        "Can describe ingest and query paths end to end.",
        "Designs chunks with metadata/ACLs.",
        "Assembles prompts with citation contracts.",
        "Evaluates retrieval and groundedness separately.",
        "Monitors freshness and empty retrieval."
      ],
      "nextSteps": [
        "Return to the lesson page and attempt the practice / topic lab with this chapter still open if needed.",
        "Revisit any Check yourself prompts you could not answer out loud.",
        "Optional deeper reading: Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks (arXiv) — https://arxiv.org/abs/2005.11401",
        "Optional deeper reading: RAGAS documentation (RAGAS) — https://docs.ragas.io/en/stable/"
      ]
    }
  },
  "prompt-engineering-and-rag/building-with-frameworks": {
    "title": "Chapter: Building with LLM frameworks",
    "readingTime": "55-70 min",
    "premise": "LangChain, LlamaIndex, Haystack, and other orchestration frameworks for composing LLM-powered applications. This Learn chapter expands the short lesson summary into a full study unit you can read continuously, with interactive checks and selection-based AI search when a phrase needs a second opinion.",
    "parts": [
      {
        "id": "orientation",
        "heading": "Why this chapter exists",
        "paragraphs": [
          "Framework gravity is strong in 2026, but durable LLM apps keep orchestration thin, state explicit (LangGraph-style), business logic in testable pure functions, and tool/context wiring behind clear contracts—MCP-style—rather than a single mega-framework.",
          "This chapter treats \"Building with LLM frameworks\" as a readable study unit: intuition first, then the mechanics you must be able to explain, then the failure modes that show up in interviews and production, and finally how to talk about the topic under time pressure.",
          "Read it like a book chapter. When a phrase is unclear, select it inside the Learn reader and use Search with AI to open Google, Perplexity, or DuckDuckGo without abandoning the chapter."
        ],
        "callout": {
          "tone": "tip",
          "body": "Target reading time is paced for depth, not skimming. Pause at each Check yourself prompt and answer out loud before revealing the guide answer."
        }
      },
      {
        "id": "composable-patterns-underneath-frameworks",
        "heading": "Composable patterns underneath frameworks",
        "paragraphs": [
          "Most LLM frameworks offer chains/pipelines: prompt template -> model -> parser -> tool -> model. The durable skill is designing pure functions around side effects. Keep retrieval, prompting, parsing, and tool execution as separate units with typed inputs/outputs. That lets you unit-test without network calls by injecting mocks. If your app can only be tested through a live vendor API, the framework is driving you—not the reverse. Framework abstractions age quickly; your typed step boundaries and tests are what survive dependency upgrades. Framework abstractions age quickly; your typed step boundaries and tests are what survive dependency upgrades.",
          "Hold these points explicitly while you study. Restate each one without looking at the list — recognition is not the interview bar; recall is.",
          "• Separate pure transforms from IO boundaries.",
          "• Dependency-inject model/tool clients for tests.",
          "• Prefer small composable steps over mega-chains.",
          "Production lens — Frameworks orchestrate; they do not replace system design: LangChain, LlamaIndex, and Haystack provide retrievers, memory, agents, and eval hooks—but production concerns (auth, rate limits, observability, cost caps) live outside the framework. Prefer composable primitives over deep abstraction chains that obscure data flow. Version your prompts and index schemas as first-class artifacts in CI."
        ],
        "keyTerms": [
          {
            "term": "Separate pure transforms from IO boundaries.",
            "definition": "Separate pure transforms from IO boundaries."
          },
          {
            "term": "Dependency-inject model/tool clients for tests.",
            "definition": "Dependency-inject model/tool clients for tests."
          },
          {
            "term": "Prefer small composable steps over mega-chains.",
            "definition": "Prefer small composable steps over mega-chains."
          }
        ],
        "workedExample": {
          "title": "Pure prompt chain with injectable model",
          "body": "Narrate what each shape and step is doing. If you only recognize the API call, you do not own the idea yet — rewrite the example from memory after one pass.",
          "code": "def extract_city(user_text, model):\n    prompt = f\"Extract city name only.\\nUser: {user_text}\\nCity:\"\n    return model(prompt).strip()\n\ndef mock_model(prompt):\n    return \"Paris\"\n\nprint(extract_city(\"Weather in Paris tomorrow?\", mock_model))",
          "language": "python"
        },
        "checkYourself": [
          {
            "prompt": "Can sketch a chain as testable pure steps.",
            "reveal": "LangChain, LlamaIndex, and Haystack provide retrievers, memory, agents, and eval hooks—but production concerns (auth, rate limits, observability, cost caps) live outside the framework. Prefer composable primitives over deep abstraction chains that obscure data flow. Version your prompts and index schemas as first-class artifacts in CI."
          }
        ]
      },
      {
        "id": "tool-wiring-and-failure-handling",
        "heading": "Tool wiring and failure handling",
        "paragraphs": [
          "Tools fail: timeouts, 429s, schema mismatches. Build retries with jitter for transient errors, circuit breakers for outages, and user-safe messages for permanent failures. Idempotency keys matter for tools with side effects. Frameworks may offer abstractions; you still choose policies. Log tool name, latency, and error class. Never blindly loop an agent forever on tool exceptions—cap steps. Prefer explicit retries and timeouts at the tool client layer so behavior is visible in code review. Prefer explicit retries and timeouts at the tool client layer so behavior is visible in code review.",
          "Hold these points explicitly while you study. Restate each one without looking at the list — recognition is not the interview bar; recall is.",
          "• Classify transient vs permanent tool errors.",
          "• Cap retries and agent steps.",
          "• Idempotency for side-effecting tools.",
          "Production lens — Async streaming and batching affect UX and unit economics: Streaming tokens improves perceived latency; parallel retrieval and speculative generation reduce wall-clock time. Framework callbacks/tracers (LangSmith, Phoenix, OpenTelemetry) should be wired from day one to debug retrieval misses and tool loops. Caching embeddings and LLM responses with invalidation tied to corpus updates saves significant cost at scale."
        ],
        "keyTerms": [
          {
            "term": "Classify transient vs permanent tool errors.",
            "definition": "Classify transient vs permanent tool errors."
          },
          {
            "term": "Cap retries and agent steps.",
            "definition": "Cap retries and agent steps."
          },
          {
            "term": "Idempotency for side-effecting tools.",
            "definition": "Idempotency for side-effecting tools."
          }
        ],
        "checkYourself": [
          {
            "prompt": "Defines tool retry/idempotency policies.",
            "reveal": "Streaming tokens improves perceived latency; parallel retrieval and speculative generation reduce wall-clock time. Framework callbacks/tracers (LangSmith, Phoenix, OpenTelemetry) should be wired from day one to debug retrieval misses and tool loops. Caching embeddings and LLM responses with invalidation tied to corpus updates saves significant cost at scale."
          }
        ]
      },
      {
        "id": "prompt-injection-defenses-in-assembled-apps",
        "heading": "Prompt injection defenses in assembled apps",
        "paragraphs": [
          "Framework defaults rarely equal a threat model. Delimit untrusted content, disable dangerous tools for untrusted sessions, and run output filters. Prefer allowlists for outbound URLs/domains tools may hit. Add eval cases that attempt to exfiltrate system prompts or escalate privileges. Security reviews should read the assembled prompt and tool list, not only the happy-path notebook. A thin adapter around vendors lets you swap models without rewriting business logic.",
          "Hold these points explicitly while you study. Restate each one without looking at the list — recognition is not the interview bar; recall is.",
          "• Allowlist tools by user trust tier.",
          "• Delimiter + policy language for untrusted docs.",
          "• Red-team the assembled application, not only prompts.",
          "Production lens — Frameworks orchestrate; they do not replace system design: LangChain, LlamaIndex, and Haystack provide retrievers, memory, agents, and eval hooks—but production concerns (auth, rate limits, observability, cost caps) live outside the framework. Prefer composable primitives over deep abstraction chains that obscure data flow. Version your prompts and index schemas as first-class artifacts in CI."
        ],
        "keyTerms": [
          {
            "term": "Allowlist tools by user trust tier.",
            "definition": "Allowlist tools by user trust tier."
          },
          {
            "term": "Delimiter + policy language for untrusted",
            "definition": "Delimiter + policy language for untrusted docs."
          },
          {
            "term": "Red-team the assembled application, not only",
            "definition": "Red-team the assembled application, not only prompts."
          }
        ],
        "checkYourself": [
          {
            "prompt": "Applies injection defenses in assembled apps.",
            "reveal": "Explain the idea in two sentences, name one metric or invariant you would watch, and state one mistake juniors make. Then connect it back to prompt injection defenses in assembled apps."
          }
        ]
      },
      {
        "id": "observability-for-chains",
        "heading": "Observability for chains",
        "paragraphs": [
          "Trace each step: retrieval hits, prompt hash, model latency, parse success, tool calls. Correlate with a request ID. Without traces, \"the bot was weird\" is unactionable. Sample raw prompts carefully under privacy rules. Build dashboards for parse-fail rate and tool-error rate—these often degrade before user NPS does. Keep a 'framework-free' reference implementation of the critical path for debugging and teaching.",
          "Hold these points explicitly while you study. Restate each one without looking at the list — recognition is not the interview bar; recall is.",
          "• Trace structured steps with request IDs.",
          "• Dashboard parse and tool failure rates.",
          "• Privacy-screen prompt logs.",
          "Production lens — Async streaming and batching affect UX and unit economics: Streaming tokens improves perceived latency; parallel retrieval and speculative generation reduce wall-clock time. Framework callbacks/tracers (LangSmith, Phoenix, OpenTelemetry) should be wired from day one to debug retrieval misses and tool loops. Caching embeddings and LLM responses with invalidation tied to corpus updates saves significant cost at scale."
        ],
        "keyTerms": [
          {
            "term": "Trace structured steps with request IDs.",
            "definition": "Trace structured steps with request IDs."
          },
          {
            "term": "Dashboard parse and tool failure rates.",
            "definition": "Dashboard parse and tool failure rates."
          },
          {
            "term": "Privacy-screen prompt logs.",
            "definition": "Privacy-screen prompt logs."
          }
        ],
        "workedExample": {
          "title": "Compute chain health metrics from event logs",
          "body": "Narrate what each shape and step is doing. If you only recognize the API call, you do not own the idea yet — rewrite the example from memory after one pass.",
          "code": "events = [\n    {\"step\": \"parse\", \"ok\": True},\n    {\"step\": \"parse\", \"ok\": False},\n    {\"step\": \"tool\", \"ok\": True},\n    {\"step\": \"tool\", \"ok\": False},\n    {\"step\": \"tool\", \"ok\": False},\n]\n\ndef rate(step):\n    rows = [e for e in events if e[\"step\"] == step]\n    return sum(e[\"ok\"] for e in rows) / len(rows)\n\nprint(\"parse_ok\", rate(\"parse\"), \"tool_ok\", rate(\"tool\"))",
          "language": "python"
        },
        "checkYourself": [
          {
            "prompt": "Traces step-level metrics.",
            "reveal": "Explain the idea in two sentences, name one metric or invariant you would watch, and state one mistake juniors make. Then connect it back to observability for chains."
          }
        ]
      },
      {
        "id": "when-to-avoid-heavy-frameworks",
        "heading": "When to avoid heavy frameworks",
        "paragraphs": [
          "If your app is one prompt and one parse, a few functions may beat a large dependency. Frameworks shine with complex branching, many tools, or multi-vendor model routing. They cost upgrades, abstractions, and harder debugging. Choose deliberately. Interview answer: describe your core pipeline in plain architecture first, then say which library maps to each box—or why none is needed. Complexity budgets matter: every new chain node needs a metric and an owner.",
          "Hold these points explicitly while you study. Restate each one without looking at the list — recognition is not the interview bar; recall is.",
          "• Start with architecture boxes before library choice.",
          "• Minimize dependencies for simple pipelines.",
          "• Justify frameworks with complexity they remove.",
          "Production lens — Frameworks orchestrate; they do not replace system design: LangChain, LlamaIndex, and Haystack provide retrievers, memory, agents, and eval hooks—but production concerns (auth, rate limits, observability, cost caps) live outside the framework. Prefer composable primitives over deep abstraction chains that obscure data flow. Version your prompts and index schemas as first-class artifacts in CI."
        ],
        "keyTerms": [
          {
            "term": "Start with architecture boxes before library",
            "definition": "Start with architecture boxes before library choice."
          },
          {
            "term": "Minimize dependencies for simple pipelines.",
            "definition": "Minimize dependencies for simple pipelines."
          },
          {
            "term": "Justify frameworks with complexity they remove.",
            "definition": "Justify frameworks with complexity they remove."
          }
        ],
        "checkYourself": [
          {
            "prompt": "Knows when not to use a heavy framework.",
            "reveal": "Explain the idea in two sentences, name one metric or invariant you would watch, and state one mistake juniors make. Then connect it back to when to avoid heavy frameworks."
          }
        ]
      },
      {
        "id": "thin-orchestration-explicit-graphs-pure-functions-and-mcp-style-contracts",
        "heading": "Thin orchestration, explicit graphs, pure functions, and MCP-style contracts",
        "paragraphs": [
          "Heavy frameworks accelerate demos; they also hide control flow, freeze dependency versions, and make unit tests awkward. Prefer thin orchestration: your code owns the graph of steps, retries, and budgets; libraries provide model clients, vector I/O, and tracers. LangGraph-style explicit state machines (and similar graph runners) are popular because nodes are named, edges are reviewable, and persistence/checkpointing maps to durable workflows—closer to Temporal-style thinking than to an unbounded “agent loop” string. Keep nodes as wrappers around pure functions: `retrieve(query, tenant) -> chunks`, `rerank(query, chunks) -> chunks`, `draft(prompt) -> text`, `validate(text, schema) -> result`. Pure functions are what you property-test in CI without spinning a model. Model Context Protocol (MCP) emerged as a contract idea for exposing tools and contextual resources to assistants: a host discovers typed capabilities (tools/resources/prompts) from servers over a standard session, rather than hard-coding one vendor’s plugin format. Teach the contract—discovery, schemas, permissions, transport—without requiring any particular SDK in this course. If you can swap MCP servers or plain HTTPS tools behind the same interface, you avoided framework lock-in. Choose a heavy framework only when it deletes complexity you measured; otherwise a few modules plus traces will outlive the fashion cycle.",
          "Hold these points explicitly while you study. Restate each one without looking at the list — recognition is not the interview bar; recall is.",
          "• Default to thin orchestration; justify heavy frameworks with concrete complexity they remove.",
          "• Prefer explicit state-machine graphs over opaque chain classes for multi-step apps.",
          "• Keep business logic in pure, testable functions behind I/O adapters.",
          "• Treat MCP as a tool/context contract (discover, schema, authorize)—not a mandatory library.",
          "Production lens — Async streaming and batching affect UX and unit economics: Streaming tokens improves perceived latency; parallel retrieval and speculative generation reduce wall-clock time. Framework callbacks/tracers (LangSmith, Phoenix, OpenTelemetry) should be wired from day one to debug retrieval misses and tool loops. Caching embeddings and LLM responses with invalidation tied to corpus updates saves significant cost at scale."
        ],
        "keyTerms": [
          {
            "term": "Default to thin orchestration; justify heavy",
            "definition": "Default to thin orchestration; justify heavy frameworks with concrete complexity they remove."
          },
          {
            "term": "Prefer explicit state-machine graphs over opaque",
            "definition": "Prefer explicit state-machine graphs over opaque chain classes for multi-step apps."
          },
          {
            "term": "Keep business logic in pure, testable",
            "definition": "Keep business logic in pure, testable functions behind I/O adapters."
          },
          {
            "term": "Treat MCP as a tool/context contract",
            "definition": "Treat MCP as a tool/context contract (discover, schema, authorize)—not a mandatory library."
          }
        ],
        "workedExample": {
          "title": "Pure pipeline steps with a tiny explicit graph",
          "body": "Narrate what each shape and step is doing. If you only recognize the API call, you do not own the idea yet — rewrite the example from memory after one pass.",
          "code": "def retrieve(q):\n    return [c for c in ['alpha kv cache', 'beta dropout'] if any(w in c for w in q.split())]\n\ndef answer(q, ctx):\n    return ctx[0] if ctx else 'refuse'\n\nGRAPH = ['retrieve', 'answer']\nstate = {\"q\": \"kv cache\"}\nfor node in GRAPH:\n    if node == 'retrieve':\n        state['ctx'] = retrieve(state['q'])\n    else:\n        state['out'] = answer(state['q'], state['ctx'])\nprint(state)",
          "language": "python"
        },
        "checkYourself": [
          {
            "prompt": "Can sketch an explicit state graph for a RAG+tools app without a framework.",
            "reveal": "Explain the idea in two sentences, name one metric or invariant you would watch, and state one mistake juniors make. Then connect it back to thin orchestration, explicit graphs, pure functions, and mcp-style contracts."
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
          "Most interview answers fail not because the definition is wrong, but because the candidate never names how the approach breaks. Use this section as a trap checklist for building with llm frameworks.",
          "Trap: Business logic inseparable from framework objects. A strong answer preempts it — say what you would monitor, what fallback you would keep, or what simpler baseline you would try first.",
          "Trap: Unlimited agent/tool loops. A strong answer preempts it — say what you would monitor, what fallback you would keep, or what simpler baseline you would try first.",
          "Trap: No traces, only final answers logged. A strong answer preempts it — say what you would monitor, what fallback you would keep, or what simpler baseline you would try first.",
          "Trap: Security review skipped because 'we use a framework'. A strong answer preempts it — say what you would monitor, what fallback you would keep, or what simpler baseline you would try first.",
          "Trap: Business rules living only inside framework-specific runnable objects. A strong answer preempts it — say what you would monitor, what fallback you would keep, or what simpler baseline you would try first.",
          "Trap: Adopting a mega-framework for a one-prompt feature. A strong answer preempts it — say what you would monitor, what fallback you would keep, or what simpler baseline you would try first.",
          "Trap: Hard-wiring a single vendor plugin format with no tool contract layer. A strong answer preempts it — say what you would monitor, what fallback you would keep, or what simpler baseline you would try first."
        ],
        "callout": {
          "tone": "warning",
          "body": "If you cannot name a failure mode, you do not yet understand the technique well enough to ship or defend it."
        },
        "checkYourself": [
          {
            "prompt": "Pick the most dangerous pitfall for Building with LLM frameworks and explain how you would detect it in production or on a whiteboard.",
            "reveal": "Start with: \"Business logic inseparable from framework objects.\" Then add a detection signal (metric, test, or review question) and a mitigation."
          }
        ]
      },
      {
        "id": "deeper-lens",
        "heading": "A deeper production lens",
        "paragraphs": [
          "Frameworks orchestrate; they do not replace system design. LangChain, LlamaIndex, and Haystack provide retrievers, memory, agents, and eval hooks—but production concerns (auth, rate limits, observability, cost caps) live outside the framework. Prefer composable primitives over deep abstraction chains that obscure data flow. Version your prompts and index schemas as first-class artifacts in CI.",
          "Async streaming and batching affect UX and unit economics. Streaming tokens improves perceived latency; parallel retrieval and speculative generation reduce wall-clock time. Framework callbacks/tracers (LangSmith, Phoenix, OpenTelemetry) should be wired from day one to debug retrieval misses and tool loops. Caching embeddings and LLM responses with invalidation tied to corpus updates saves significant cost at scale."
        ],
        "keyTerms": [
          {
            "term": "Frameworks orchestrate; they do not replace system design",
            "definition": "LangChain, LlamaIndex, and Haystack provide retrievers, memory, agents, and eval hooks—but production concerns (auth, rate limits, observability, cost caps) live outside the framework. Prefer composable primitives over d…"
          },
          {
            "term": "Async streaming and batching affect UX and unit economics",
            "definition": "Streaming tokens improves perceived latency; parallel retrieval and speculative generation reduce wall-clock time. Framework callbacks/tracers (LangSmith, Phoenix, OpenTelemetry) should be wired from day one to debug ret…"
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
          "You should now be able to teach building with llm frameworks as a story: what problem it solves, how the mechanism works, which assumptions it depends on, and how you would know it failed.",
          "Close the loop by writing a 90-second spoken answer out loud. If you freeze on definitions, return to the orientation and the first technical part. If you freeze on trade-offs, return to failure modes.",
          "Practice prompts from this lesson: How would you structure a testable RAG+tools app? | What observability fields belong on each chain step? | How do you prevent tool abuse from injected prompts?"
        ],
        "checkYourself": [
          {
            "prompt": "Give a 90-second spoken overview of Building with LLM frameworks as if starting an interview answer.",
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
        "Can sketch a chain as testable pure steps.",
        "Defines tool retry/idempotency policies.",
        "Applies injection defenses in assembled apps.",
        "Traces step-level metrics.",
        "Knows when not to use a heavy framework."
      ],
      "nextSteps": [
        "Return to the lesson page and attempt the practice / topic lab with this chapter still open if needed.",
        "Revisit any Check yourself prompts you could not answer out loud.",
        "Optional deeper reading: LlamaIndex documentation (LlamaIndex) — https://docs.llamaindex.ai/en/stable/",
        "Optional deeper reading: LangGraph — Build resilient language agents (LangChain) — https://langchain-ai.github.io/langgraph/"
      ]
    }
  }
};
