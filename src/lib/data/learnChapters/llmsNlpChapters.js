/** @type {Record<string, import('../learnChapters.js').LessonLearnChapter>} */
export const llmsNlpChapters = {
  "llms-and-nlp/llm-fundamentals": {
    "title": "Chapter: LLM fundamentals",
    "readingTime": "55-70 min",
    "premise": "Pre-training objectives, tokenization, context windows, and the emergent capabilities that appear at scale. This Learn chapter expands the short lesson summary into a full study unit you can read continuously, with interactive checks and selection-based AI search when a phrase needs a second opinion.",
    "parts": [
      {
        "id": "orientation",
        "heading": "Why this chapter exists",
        "paragraphs": [
          "By mid-2026, shipping LLM features means choosing among frontier APIs, open-weight engines, and reasoning-optimized models—then controlling structured outputs, multimodal inputs, cost/latency SLOs, and provider deprecation risk. Interviewers expect systems thinking, not only next-token intuition.",
          "This chapter treats \"LLM fundamentals\" as a readable study unit: intuition first, then the mechanics you must be able to explain, then the failure modes that show up in interviews and production, and finally how to talk about the topic under time pressure.",
          "Read it like a book chapter. When a phrase is unclear, select it inside the Learn reader and use Search with AI to open Google, Perplexity, or DuckDuckGo without abandoning the chapter."
        ],
        "callout": {
          "tone": "tip",
          "body": "Target reading time is paced for depth, not skimming. Pause at each Check yourself prompt and answer out loud before revealing the guide answer."
        }
      },
      {
        "id": "pretraining-adaptation-and-alignment-stages",
        "heading": "Pretraining, adaptation, and alignment stages",
        "paragraphs": [
          "Modern LLMs usually begin with self-supervised next-token (or related) pretraining on massive corpora. This stage learns broadly useful representations and generators. Supervised fine-tuning (SFT) on instruction-response pairs teaches formats and task following. Preference optimization / RLHF further aligns outputs with human or AI raters. Emergent-looking skills often track scale and data mixture rather than magic. For product work, know which stage owns which failure: pretraining gaps cause knowledge holes; SFT gaps cause instruction failures; alignment gaps cause tone/safety issues. Also track evaluation contamination: public benchmarks may be partially memorized.",
          "Hold these points explicitly while you study. Restate each one without looking at the list — recognition is not the interview bar; recall is.",
          "• Separate pretraining, SFT, and preference stages in explanations.",
          "• Map failures to the stage that most likely caused them.",
          "• Treat benchmark scores with contamination skepticism.",
          "Production lens — Autoregressive LMs model P(token | context): Decoder-only LLMs are next-token predictors trained on massive corpora; emergent abilities (reasoning, instruction following) appear at scale but are not guaranteed by architecture alone. Tokenization (BPE, SentencePiece) affects multilingual behavior, math, and code because the model never sees characters—only subword IDs. Context window limits bound in-context memory regardless of apparent fluency."
        ],
        "keyTerms": [
          {
            "term": "Separate pretraining, SFT, and preference stages",
            "definition": "Separate pretraining, SFT, and preference stages in explanations."
          },
          {
            "term": "Map failures to the stage that",
            "definition": "Map failures to the stage that most likely caused them."
          },
          {
            "term": "Treat benchmark scores with contamination ske…",
            "definition": "Treat benchmark scores with contamination skepticism."
          }
        ],
        "checkYourself": [
          {
            "prompt": "Can explain pretraining vs SFT vs preference alignment.",
            "reveal": "Decoder-only LLMs are next-token predictors trained on massive corpora; emergent abilities (reasoning, instruction following) appear at scale but are not guaranteed by architecture alone. Tokenization (BPE, SentencePiece) affects multilingual behavior, math, and code because the model never sees characters—only subword IDs. Context window limits bound in-context memory regardless of apparent fluency."
          }
        ]
      },
      {
        "id": "tokenization-without-proprietary-tokenizers",
        "heading": "Tokenization without proprietary tokenizers",
        "paragraphs": [
          "Models do not see characters directly; they see token IDs from a vocabulary built by algorithms like BPE. Rare words shatter into pieces; spaces and punctuation become tokens; code and numbers often tokenize awkwardly. Token count drives cost and latency. In this browser lab we cannot ship tiktoken, so we implement educational tokenizers: whitespace, character, and a tiny BPE-like merger on a mini corpus. The point is to feel how vocabulary choices change sequence length and how \"GPT-4's\" might split differently than \"transformer\". Production systems still must count with the real model tokenizer before estimating cost.",
          "Hold these points explicitly while you study. Restate each one without looking at the list — recognition is not the interview bar; recall is.",
          "• Token count is the currency of context and cost.",
          "• Subword schemes trade vocab size for sequence length.",
          "• Prototype tokenizer behavior even when APIs are unavailable.",
          "Production lens — Training stages: pretrain → SFT → RLHF/DPO: Pretraining learns language and world knowledge; supervised fine-tuning aligns format and instruction following; preference optimization (RLHF, DPO, ORPO) shapes helpfulness and safety. Each stage uses different data and loss functions. Production LLM systems are rarely \"just the base model\"—deployment quality depends heavily on post-training."
        ],
        "keyTerms": [
          {
            "term": "Token count is the currency of",
            "definition": "Token count is the currency of context and cost."
          },
          {
            "term": "Subword schemes trade vocab size for",
            "definition": "Subword schemes trade vocab size for sequence length."
          },
          {
            "term": "Prototype tokenizer behavior even when APIs",
            "definition": "Prototype tokenizer behavior even when APIs are unavailable."
          }
        ],
        "workedExample": {
          "title": "Compare whitespace, char, and toy BPE counts",
          "body": "Narrate what each shape and step is doing. If you only recognize the API call, you do not own the idea yet — rewrite the example from memory after one pass.",
          "code": "from collections import Counter\n\ndef whitespace_tokenize(text):\n    return text.split()\n\ndef char_tokenize(text):\n    return list(text)\n\ndef toy_bpe_tokenize(text, merges):\n    tokens = list(text)\n    for a, b in merges:\n        i = 0\n        out = []\n        while i < len(tokens):\n            if i + 1 < len(tokens) and tokens[i] == a and tokens[i+1] == b:\n                out.append(a + b); i += 2\n            else:\n                out.append(tokens[i]); i += 1\n        tokens = out\n    return tokens\n\ntext = \"transformers transform text\"\nmerges = [(\"t\",\"r\"), (\"tr\",\"a\"), (\"a\",\"n\")]\nfor name, toks in {\n    \"ws\": whitespace_tokenize(text),\n    \"char\": char_tokenize(text),\n    \"toy\": toy_bpe_tokenize(text, merges),\n}.items():\n    print(name, len(toks), toks[:12])",
          "language": "python"
        },
        "checkYourself": [
          {
            "prompt": "Can reason about tokenization impact on cost/context.",
            "reveal": "Pretraining learns language and world knowledge; supervised fine-tuning aligns format and instruction following; preference optimization (RLHF, DPO, ORPO) shapes helpfulness and safety. Each stage uses different data and loss functions. Production LLM systems are rarely \"just the base model\"—deployment quality depends heavily on post-training."
          }
        ]
      },
      {
        "id": "context-windows-and-information-loss",
        "heading": "Context windows and information loss",
        "paragraphs": [
          "The context window is the model's working memory for a request. Stuff it with retrieved docs, chat history, tools results, and instructions—and something falls off. Longest-first or importance-aware truncation policies matter. Position effects (lost-in-the-middle) mean buried facts may be ignored. Summarization memory and RAG exist because unbounded chat history is not free. Architect systems so critical constraints (safety policy, schema, user locale) stay in privileged prompt segments that are hard to truncate away. Measure failure under max-context stress tests, not only happy-path short prompts.",
          "Hold these points explicitly while you study. Restate each one without looking at the list — recognition is not the interview bar; recall is.",
          "• Treat context as a scarce, structured resource.",
          "• Protect system constraints from truncation.",
          "• Stress-test long prompts for middle-loss failures.",
          "Production lens — Autoregressive LMs model P(token | context): Decoder-only LLMs are next-token predictors trained on massive corpora; emergent abilities (reasoning, instruction following) appear at scale but are not guaranteed by architecture alone. Tokenization (BPE, SentencePiece) affects multilingual behavior, math, and code because the model never sees characters—only subword IDs. Context window limits bound in-context memory regardless of apparent fluency."
        ],
        "keyTerms": [
          {
            "term": "Treat context as a scarce, structured",
            "definition": "Treat context as a scarce, structured resource."
          },
          {
            "term": "Protect system constraints from truncation.",
            "definition": "Protect system constraints from truncation."
          },
          {
            "term": "Stress-test long prompts for middle-loss fail…",
            "definition": "Stress-test long prompts for middle-loss failures."
          }
        ],
        "checkYourself": [
          {
            "prompt": "Knows context truncation failure modes.",
            "reveal": "Explain the idea in two sentences, name one metric or invariant you would watch, and state one mistake juniors make. Then connect it back to context windows and information loss."
          }
        ]
      },
      {
        "id": "capabilities-hallucinations-and-verification",
        "heading": "Capabilities, hallucinations, and verification",
        "paragraphs": [
          "LLMs are strong at stylistic transformation, drafting, and pattern-rich reasoning—and weak as sole sources of truth. Hallucination is not a rare bug; it is the default of a generative prior when evidence is missing. Mitigation is architectural: retrieval grounding, tool use for calculators/databases, citation requirements, constrained decoding, and human review for high stakes. Arithmetic and exact long-number copying remain failure-prone without tools. Consistency across temperature samples is a useful probe: unstable answers signal uncertainty even if each answer sounds confident.",
          "Hold these points explicitly while you study. Restate each one without looking at the list — recognition is not the interview bar; recall is.",
          "• Design verification paths for factual claims.",
          "• Use tools for exact computation and lookups.",
          "• Probe consistency, not only single-sample eloquence.",
          "Production lens — Training stages: pretrain → SFT → RLHF/DPO: Pretraining learns language and world knowledge; supervised fine-tuning aligns format and instruction following; preference optimization (RLHF, DPO, ORPO) shapes helpfulness and safety. Each stage uses different data and loss functions. Production LLM systems are rarely \"just the base model\"—deployment quality depends heavily on post-training."
        ],
        "keyTerms": [
          {
            "term": "Design verification paths for factual claims.",
            "definition": "Design verification paths for factual claims."
          },
          {
            "term": "Use tools for exact computation and",
            "definition": "Use tools for exact computation and lookups."
          },
          {
            "term": "Probe consistency, not only single-sample elo…",
            "definition": "Probe consistency, not only single-sample eloquence."
          }
        ],
        "workedExample": {
          "title": "Offline consistency probe with a mocked generator",
          "body": "Narrate what each shape and step is doing. If you only recognize the API call, you do not own the idea yet — rewrite the example from memory after one pass.",
          "code": "import numpy as np\n\ndef mock_llm(prompt, temperature, seed):\n    rng = np.random.default_rng(seed)\n    base = 42 if \"14*3\" in prompt else 0\n    noise = rng.normal(scale=temperature * 5)\n    return str(int(round(base + noise)))\n\nprompt = \"Compute 14*3\"\nsamples = [mock_llm(prompt, temperature=0.9, seed=i) for i in range(10)]\nprint(samples, \"unique\", len(set(samples)))",
          "language": "python"
        },
        "checkYourself": [
          {
            "prompt": "Designs verification for hallucination-prone tasks.",
            "reveal": "Explain the idea in two sentences, name one metric or invariant you would watch, and state one mistake juniors make. Then connect it back to capabilities, hallucinations, and verification."
          }
        ]
      },
      {
        "id": "product-metrics-for-llm-features",
        "heading": "Product metrics for LLM features",
        "paragraphs": [
          "Ship LLM features with task metrics: exact match / F1 for extraction, rubrics or LLM-as-judge for open ends, groundedness for RAG, and latency/cost budgets. Track refusal quality and safety violations as first-class. Shadow deploy new prompts/models before full traffic. Log prompts carefully with privacy redaction. The fundamentals lesson ends where platform engineering begins: version prompts like code, and never equate \"demo magic\" with evaluated reliability.",
          "Hold these points explicitly while you study. Restate each one without looking at the list — recognition is not the interview bar; recall is.",
          "• Define task metrics before prompt polishing.",
          "• Version prompts and models together.",
          "• Include cost/latency in acceptance criteria.",
          "Production lens — Autoregressive LMs model P(token | context): Decoder-only LLMs are next-token predictors trained on massive corpora; emergent abilities (reasoning, instruction following) appear at scale but are not guaranteed by architecture alone. Tokenization (BPE, SentencePiece) affects multilingual behavior, math, and code because the model never sees characters—only subword IDs. Context window limits bound in-context memory regardless of apparent fluency."
        ],
        "keyTerms": [
          {
            "term": "Define task metrics before prompt polishing.",
            "definition": "Define task metrics before prompt polishing."
          },
          {
            "term": "Version prompts and models together.",
            "definition": "Version prompts and models together."
          },
          {
            "term": "Include cost/latency in acceptance criteria.",
            "definition": "Include cost/latency in acceptance criteria."
          }
        ],
        "checkYourself": [
          {
            "prompt": "Defines offline metrics for an LLM feature.",
            "reveal": "Explain the idea in two sentences, name one metric or invariant you would watch, and state one mistake juniors make. Then connect it back to product metrics for llm features."
          }
        ]
      },
      {
        "id": "frontier-apis-open-weight-engines-and-reasoning-models-in-2026",
        "heading": "Frontier APIs, open-weight engines, and reasoning models in 2026",
        "paragraphs": [
          "The practical model landscape now splits along operational axes, not just parameter counts. Frontier hosted models still lead on hard reasoning, tool use, and multimodal fluency when you need rapid product iteration without owning GPUs. Open-weight models (Llama-class, Mistral-class, Qwen-class, and peers) win when you need data residency, predictable unit economics at high volume, deep customization, or air-gapped deployment—usually behind an inference stack that exposes an OpenAI-compatible API. Separately, reasoning or extended-thinking models allocate extra test-time compute: they produce longer internal traces before answering, which can raise accuracy on math, planning, and multi-step tools while blowing up latency and token bills. Classic chat models remain better for low-latency classification, extraction, and drafting when you already constrain the task. Multimodal inputs (images, PDFs, sometimes audio) are mainstream product requirements; treat pixels and pages as untrusted content with the same injection risks as web text. Structured output modes—JSON schema / constrained decoding—are no longer optional polish: they are how you keep parsers deterministic. Finally, provider deprecation is an ops risk: model IDs disappear, defaults change, and silent quality shifts break evals. Pin aliases, keep golden prompts, and design a two-provider escape hatch before traffic depends on one SKU.",
          "Hold these points explicitly while you study. Restate each one without looking at the list — recognition is not the interview bar; recall is.",
          "• Choose frontier vs open-weight by residency, cost curve, customization, and ops ownership—not brand loyalty.",
          "• Treat reasoning/extended-thinking models as a latency/cost dial distinct from classic chat models.",
          "• Require schema-constrained outputs for machine-consumed responses; pin model aliases against deprecation.",
          "• Multimodal bytes are untrusted inputs; apply the same injection and PII controls as text.",
          "Production lens — Training stages: pretrain → SFT → RLHF/DPO: Pretraining learns language and world knowledge; supervised fine-tuning aligns format and instruction following; preference optimization (RLHF, DPO, ORPO) shapes helpfulness and safety. Each stage uses different data and loss functions. Production LLM systems are rarely \"just the base model\"—deployment quality depends heavily on post-training."
        ],
        "keyTerms": [
          {
            "term": "Choose frontier vs open-weight by residency,",
            "definition": "Choose frontier vs open-weight by residency, cost curve, customization, and ops ownership—not brand loyalty."
          },
          {
            "term": "Treat reasoning/extended-thinking models as a…",
            "definition": "Treat reasoning/extended-thinking models as a latency/cost dial distinct from classic chat models."
          },
          {
            "term": "Require schema-constrained outputs for machin…",
            "definition": "Require schema-constrained outputs for machine-consumed responses; pin model aliases against deprecation."
          },
          {
            "term": "Multimodal bytes are untrusted inputs; apply",
            "definition": "Multimodal bytes are untrusted inputs; apply the same injection and PII controls as text."
          }
        ],
        "workedExample": {
          "title": "Toy cost/latency scorecard for model routing",
          "body": "Narrate what each shape and step is doing. If you only recognize the API call, you do not own the idea yet — rewrite the example from memory after one pass.",
          "code": "import pandas as pd\n\nrows = [\n    {'model': 'frontier_chat', 'mode': 'chat', 'cost_per_1k': 0.008, 'p95_ms': 900, 'schema_ok': 0.96},\n    {'model': 'frontier_reason', 'mode': 'reason', 'cost_per_1k': 0.04, 'p95_ms': 4500, 'schema_ok': 0.98},\n    {'model': 'openweight_chat', 'mode': 'chat', 'cost_per_1k': 0.0015, 'p95_ms': 700, 'schema_ok': 0.93},\n]\ndf = pd.DataFrame(rows)\ndf['utility'] = df['schema_ok'] / (df['cost_per_1k'] * (df['p95_ms'] / 1000))\nprint(df.sort_values('utility', ascending=False).round(3).to_string(index=False))",
          "language": "python"
        },
        "checkYourself": [
          {
            "prompt": "Can contrast frontier APIs vs self-hosted open-weight serving for a concrete product constraint.",
            "reveal": "Explain the idea in two sentences, name one metric or invariant you would watch, and state one mistake juniors make. Then connect it back to frontier apis, open-weight engines, and reasoning models in 2026."
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
          "Most interview answers fail not because the definition is wrong, but because the candidate never names how the approach breaks. Use this section as a trap checklist for llm fundamentals.",
          "Trap: Trusting fluent answers as factual. A strong answer preempts it — say what you would monitor, what fallback you would keep, or what simpler baseline you would try first.",
          "Trap: Ignoring token costs in product architecture. A strong answer preempts it — say what you would monitor, what fallback you would keep, or what simpler baseline you would try first.",
          "Trap: Treating LLMs as deterministic functions. A strong answer preempts it — say what you would monitor, what fallback you would keep, or what simpler baseline you would try first.",
          "Trap: No eval harness before prompt iteration. A strong answer preempts it — say what you would monitor, what fallback you would keep, or what simpler baseline you would try first.",
          "Trap: Defaulting every task to a reasoning model and missing latency budgets. A strong answer preempts it — say what you would monitor, what fallback you would keep, or what simpler baseline you would try first.",
          "Trap: Assuming open-weight deployment is free because weights are downloadable. A strong answer preempts it — say what you would monitor, what fallback you would keep, or what simpler baseline you would try first.",
          "Trap: Shipping without a pinned model alias and a golden eval for silent provider changes. A strong answer preempts it — say what you would monitor, what fallback you would keep, or what simpler baseline you would try first."
        ],
        "callout": {
          "tone": "warning",
          "body": "If you cannot name a failure mode, you do not yet understand the technique well enough to ship or defend it."
        },
        "checkYourself": [
          {
            "prompt": "Pick the most dangerous pitfall for LLM fundamentals and explain how you would detect it in production or on a whiteboard.",
            "reveal": "Start with: \"Trusting fluent answers as factual.\" Then add a detection signal (metric, test, or review question) and a mitigation."
          }
        ]
      },
      {
        "id": "deeper-lens",
        "heading": "A deeper production lens",
        "paragraphs": [
          "Autoregressive LMs model P(token | context). Decoder-only LLMs are next-token predictors trained on massive corpora; emergent abilities (reasoning, instruction following) appear at scale but are not guaranteed by architecture alone. Tokenization (BPE, SentencePiece) affects multilingual behavior, math, and code because the model never sees characters—only subword IDs. Context window limits bound in-context memory regardless of apparent fluency.",
          "Training stages: pretrain → SFT → RLHF/DPO. Pretraining learns language and world knowledge; supervised fine-tuning aligns format and instruction following; preference optimization (RLHF, DPO, ORPO) shapes helpfulness and safety. Each stage uses different data and loss functions. Production LLM systems are rarely \"just the base model\"—deployment quality depends heavily on post-training."
        ],
        "keyTerms": [
          {
            "term": "Autoregressive LMs model P(token | context)",
            "definition": "Decoder-only LLMs are next-token predictors trained on massive corpora; emergent abilities (reasoning, instruction following) appear at scale but are not guaranteed by architecture alone. Tokenization (BPE, SentencePiece…"
          },
          {
            "term": "Training stages: pretrain → SFT → RLHF/DPO",
            "definition": "Pretraining learns language and world knowledge; supervised fine-tuning aligns format and instruction following; preference optimization (RLHF, DPO, ORPO) shapes helpfulness and safety. Each stage uses different data and…"
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
          "You should now be able to teach llm fundamentals as a story: what problem it solves, how the mechanism works, which assumptions it depends on, and how you would know it failed.",
          "Close the loop by writing a 90-second spoken answer out loud. If you freeze on definitions, return to the orientation and the first technical part. If you freeze on trade-offs, return to failure modes.",
          "Practice prompts from this lesson: How does RLHF differ from supervised fine-tuning? | What causes hallucination and how would you mitigate it? | Explain context window size vs inference cost."
        ],
        "checkYourself": [
          {
            "prompt": "Give a 90-second spoken overview of LLM fundamentals as if starting an interview answer.",
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
        "Can explain pretraining vs SFT vs preference alignment.",
        "Can reason about tokenization impact on cost/context.",
        "Knows context truncation failure modes.",
        "Designs verification for hallucination-prone tasks.",
        "Defines offline metrics for an LLM feature."
      ],
      "nextSteps": [
        "Return to the lesson page and attempt the practice / topic lab with this chapter still open if needed.",
        "Revisit any Check yourself prompts you could not answer out loud.",
        "Optional deeper reading: Language Models are Few-Shot Learners (GPT-3) (arXiv) — https://arxiv.org/abs/2005.14165",
        "Optional deeper reading: Hugging Face — Large Language Models course (Hugging Face) — https://huggingface.co/learn/nlp-course/chapter1/1"
      ]
    }
  },
  "llms-and-nlp/fine-tuning-techniques": {
    "title": "Chapter: Fine-tuning and adaptation",
    "readingTime": "55-70 min",
    "premise": "Full fine-tuning, LoRA, QLoRA, PEFT, and instruction tuning to adapt foundation models to specific domains and tasks. This Learn chapter expands the short lesson summary into a full study unit you can read continuously, with interactive checks and selection-based AI search when a phrase needs a second opinion.",
    "parts": [
      {
        "id": "orientation",
        "heading": "Why this chapter exists",
        "paragraphs": [
          "Adaptation in 2026 is a ladder—prompting, RAG, LoRA/QLoRA, continued pretraining, then preference optimization—not a single fine-tune button. Choosing the wrong rung wastes GPU budget and can regress safety or general instruction following.",
          "This chapter treats \"Fine-tuning and adaptation\" as a readable study unit: intuition first, then the mechanics you must be able to explain, then the failure modes that show up in interviews and production, and finally how to talk about the topic under time pressure.",
          "Read it like a book chapter. When a phrase is unclear, select it inside the Learn reader and use Search with AI to open Google, Perplexity, or DuckDuckGo without abandoning the chapter."
        ],
        "callout": {
          "tone": "tip",
          "body": "Target reading time is paced for depth, not skimming. Pause at each Check yourself prompt and answer out loud before revealing the guide answer."
        }
      },
      {
        "id": "when-fine-tuning-beats-prompting",
        "heading": "When fine-tuning beats prompting",
        "paragraphs": [
          "Prompting is the right first lever: cheaper iteration, no training stack. Fine-tune when you need consistent schemas, domain jargon, latency/cost reduction via smaller specialized models, or behaviors hard to specify in prompts. Also consider data readiness: if you lack representative labeled pairs, fix data before training. A common failure is fine-tuning on narrow tickets and destroying general instruction following (catastrophic forgetting). Mix replay data or keep a strong base via adapters. Decide success metrics before training: exact-match JSON validity, win rate vs prompt baseline, and safety regression tests.",
          "Hold these points explicitly while you study. Restate each one without looking at the list — recognition is not the interview bar; recall is.",
          "• Exhaust prompt baselines before training.",
          "• Define regression suites covering general + domain tasks.",
          "• Plan for forgetting with replay or PEFT constraints.",
          "Production lens — Full fine-tuning vs PEFT is a memory and catastrophic-forgetting trade-off: Full fine-tuning updates all weights and risks overwriting general capabilities on small domain datasets. Parameter-efficient methods (LoRA, adapters, prefix tuning) train low-rank or small injected modules, reducing VRAM and enabling multi-tenant serving. LoRA merges into base weights at inference with zero latency overhead—a major production advantage."
        ],
        "keyTerms": [
          {
            "term": "Exhaust prompt baselines before training.",
            "definition": "Exhaust prompt baselines before training."
          },
          {
            "term": "Define regression suites covering general +",
            "definition": "Define regression suites covering general + domain tasks."
          },
          {
            "term": "Plan for forgetting with replay or",
            "definition": "Plan for forgetting with replay or PEFT constraints."
          }
        ],
        "checkYourself": [
          {
            "prompt": "Can decide prompting vs fine-tuning vs RAG.",
            "reveal": "Full fine-tuning updates all weights and risks overwriting general capabilities on small domain datasets. Parameter-efficient methods (LoRA, adapters, prefix tuning) train low-rank or small injected modules, reducing VRAM and enabling multi-tenant serving. LoRA merges into base weights at inference with zero latency overhead—a major production advantage."
          }
        ]
      },
      {
        "id": "lora-as-low-rank-surgery-on-weight-matrices",
        "heading": "LoRA as low-rank surgery on weight matrices",
        "paragraphs": [
          "LoRA freezes the base weight W and learns a low-rank update BA where A is rank-by-in and B is out-by-rank (shapes vary by convention). At init, B=0 so the adapter starts as a no-op. Trainable parameter count becomes roughly rank*(in+out) per adapted matrix—often <<1% of full fine-tuning. QLoRA combines quantization of the base with LoRA for memory savings. In this course we implement LoRA math in NumPy/sklearn-free NumPy to show parameter reduction and forward composition y = xW + scale * x A^T B^T without shipping torch/peft.",
          "Hold these points explicitly while you study. Restate each one without looking at the list — recognition is not the interview bar; recall is.",
          "• LoRA is a low-rank delta on linear maps.",
          "• Zero-init on B preserves base behavior at start.",
          "• Rank and target modules are primary knobs.",
          "Production lens — Data quality dominates hyperparameter tuning for alignment: A few thousand well-curated instruction examples often outperform noisy millions. Format consistency, deduplication, and rejection of hallucinated or toxic pairs matter more than epoch count. For domain adaptation, continued pretraining on in-domain text before instruction tuning frequently beats SFT alone on knowledge-heavy tasks."
        ],
        "keyTerms": [
          {
            "term": "LoRA is a low-rank delta on",
            "definition": "LoRA is a low-rank delta on linear maps."
          },
          {
            "term": "Zero-init on B preserves base behavior",
            "definition": "Zero-init on B preserves base behavior at start."
          },
          {
            "term": "Rank and target modules are primary",
            "definition": "Rank and target modules are primary knobs."
          }
        ],
        "workedExample": {
          "title": "LoRA parameter count vs full fine-tune",
          "body": "Narrate what each shape and step is doing. If you only recognize the API call, you do not own the idea yet — rewrite the example from memory after one pass.",
          "code": "import numpy as np\n\nin_f = out_f = 768\nrank = 8\nfull = in_f * out_f\nlora = rank * (in_f + out_f)\nprint(\"full\", full, \"lora\", lora, \"pct\", round(100 * lora / full, 3))\n\nrng = np.random.default_rng(0)\nW = rng.normal(size=(in_f, out_f)) * 0.02\nA = rng.normal(size=(rank, in_f)) * 0.01\nB = np.zeros((out_f, rank))\nx = rng.normal(size=(4, in_f))\ny = x @ W + (x @ A.T) @ B.T\nprint(y.shape, \"delta_norm\", np.linalg.norm((x @ A.T) @ B.T))",
          "language": "python"
        },
        "checkYourself": [
          {
            "prompt": "Can explain LoRA forward pass and param counts.",
            "reveal": "A few thousand well-curated instruction examples often outperform noisy millions. Format consistency, deduplication, and rejection of hallucinated or toxic pairs matter more than epoch count. For domain adaptation, continued pretraining on in-domain text before instruction tuning frequently beats SFT alone on knowledge-heavy tasks."
          }
        ]
      },
      {
        "id": "instruction-data-preparation-and-quality-filters",
        "heading": "Instruction data preparation and quality filters",
        "paragraphs": [
          "Data quality dominates PEFT rank. Convert raw logs into role-structured messages, filter toxic/PII content, drop unresolved or low-effort answers, balance intents, and split by user/time to avoid leakage. Deduplicate near-copies that inflate metrics. For classification-style adaptation, sklearn metrics on held-out labels still help; for open generation, use rubrics and pairwise preferences. Keep a gold eval set untouched by filtering experiments. Document lineage: which raw dump produced which JSONL version.",
          "Hold these points explicitly while you study. Restate each one without looking at the list — recognition is not the interview bar; recall is.",
          "• Filter ruthlessly; small clean > large dirty.",
          "• Split to prevent user/time leakage.",
          "• Version datasets like code artifacts.",
          "Production lens — Full fine-tuning vs PEFT is a memory and catastrophic-forgetting trade-off: Full fine-tuning updates all weights and risks overwriting general capabilities on small domain datasets. Parameter-efficient methods (LoRA, adapters, prefix tuning) train low-rank or small injected modules, reducing VRAM and enabling multi-tenant serving. LoRA merges into base weights at inference with zero latency overhead—a major production advantage."
        ],
        "keyTerms": [
          {
            "term": "Filter ruthlessly; small clean > large",
            "definition": "Filter ruthlessly; small clean > large dirty."
          },
          {
            "term": "Split to prevent user/time leakage.",
            "definition": "Split to prevent user/time leakage."
          },
          {
            "term": "Version datasets like code artifacts.",
            "definition": "Version datasets like code artifacts."
          }
        ],
        "workedExample": {
          "title": "Filter and split instruction JSON records",
          "body": "Narrate what each shape and step is doing. If you only recognize the API call, you do not own the idea yet — rewrite the example from memory after one pass.",
          "code": "import random\n\nraw = [\n    {\"user\": \"Where is order 1?\", \"assistant\": \"It shipped Monday; tracking shows Wednesday delivery.\", \"ok\": True},\n    {\"user\": \"Return?\", \"assistant\": \"Start a return in order history.\", \"ok\": True},\n    {\"user\": \"Angry!!!\", \"assistant\": \"Ok\", \"ok\": False},\n]\n\ndef to_messages(r):\n    return {\n        \"messages\": [\n            {\"role\": \"system\", \"content\": \"Helpful support agent.\"},\n            {\"role\": \"user\", \"content\": r[\"user\"]},\n            {\"role\": \"assistant\", \"content\": r[\"assistant\"]},\n        ]\n    }\n\nfiltered = [to_messages(r) for r in raw if r[\"ok\"] and len(r[\"assistant\"]) >= 10]\nrandom.seed(0); random.shuffle(filtered)\ncut = max(1, int(0.8 * len(filtered)))\nprint(\"train\", len(filtered[:cut]), \"eval\", len(filtered[cut:]) or 0)",
          "language": "python"
        },
        "checkYourself": [
          {
            "prompt": "Can prepare filtered instruction datasets with clean splits.",
            "reveal": "Explain the idea in two sentences, name one metric or invariant you would watch, and state one mistake juniors make. Then connect it back to instruction data preparation and quality filters."
          }
        ]
      },
      {
        "id": "evaluation-online-and-offline-gates",
        "heading": "Evaluation: online and offline gates",
        "paragraphs": [
          "Offline gates should catch schema breaks, toxicity spikes, and task regressions before deploy. Combine automatic checks (JSON schema validity rate, keyword constraints) with human or LLM-judge samples. Online gates use shadow traffic and interleaving. Monitor for prompt distribution shift: fine-tunes can overfit yesterday's ticket phrasing. Keep a kill switch to revert to the prompt-only or previous adapter. Parameter-efficient adapters help here because swapping a small weight file is operationally easier than replacing a full model.",
          "Hold these points explicitly while you study. Restate each one without looking at the list — recognition is not the interview bar; recall is.",
          "• Automate schema/safety gates in CI.",
          "• Shadow deploy adapters before full cutover.",
          "• Keep instant rollback paths.",
          "Production lens — Data quality dominates hyperparameter tuning for alignment: A few thousand well-curated instruction examples often outperform noisy millions. Format consistency, deduplication, and rejection of hallucinated or toxic pairs matter more than epoch count. For domain adaptation, continued pretraining on in-domain text before instruction tuning frequently beats SFT alone on knowledge-heavy tasks."
        ],
        "keyTerms": [
          {
            "term": "Automate schema/safety gates in CI.",
            "definition": "Automate schema/safety gates in CI."
          },
          {
            "term": "Shadow deploy adapters before full cutover.",
            "definition": "Shadow deploy adapters before full cutover."
          },
          {
            "term": "Keep instant rollback paths.",
            "definition": "Keep instant rollback paths."
          }
        ],
        "checkYourself": [
          {
            "prompt": "Defines regression gates before training.",
            "reveal": "Explain the idea in two sentences, name one metric or invariant you would watch, and state one mistake juniors make. Then connect it back to evaluation: online and offline gates."
          }
        ]
      },
      {
        "id": "choosing-full-ft-vs-peft-vs-rag",
        "heading": "Choosing full FT vs PEFT vs RAG",
        "paragraphs": [
          "RAG updates knowledge without weight edits; fine-tuning changes behavior and style. Full fine-tuning maximizes flexibility at high cost and risk; LoRA is usually the default adaptation tool; continued pretraining on domain text is for distribution shift in language itself. Many systems combine RAG + light PEFT. Interview answers should present a decision tree: volatile facts -> RAG; stable style/format -> PEFT; greenfield domain language -> maybe continued pretrain + SFT. Always price the maintenance burden of training jobs versus retrieval infra.",
          "Hold these points explicitly while you study. Restate each one without looking at the list — recognition is not the interview bar; recall is.",
          "• Use RAG for mutable knowledge, PEFT for stable behavior.",
          "• Default to LoRA before full fine-tuning.",
          "• Combine techniques when problems are multi-part.",
          "Production lens — Full fine-tuning vs PEFT is a memory and catastrophic-forgetting trade-off: Full fine-tuning updates all weights and risks overwriting general capabilities on small domain datasets. Parameter-efficient methods (LoRA, adapters, prefix tuning) train low-rank or small injected modules, reducing VRAM and enabling multi-tenant serving. LoRA merges into base weights at inference with zero latency overhead—a major production advantage."
        ],
        "keyTerms": [
          {
            "term": "Use RAG for mutable knowledge, PEFT",
            "definition": "Use RAG for mutable knowledge, PEFT for stable behavior."
          },
          {
            "term": "Default to LoRA before full fine-tuning.",
            "definition": "Default to LoRA before full fine-tuning."
          },
          {
            "term": "Combine techniques when problems are multi-part.",
            "definition": "Combine techniques when problems are multi-part."
          }
        ],
        "checkYourself": [
          {
            "prompt": "Plans rollback for adapter deploys.",
            "reveal": "Explain the idea in two sentences, name one metric or invariant you would watch, and state one mistake juniors make. Then connect it back to choosing full ft vs peft vs rag."
          }
        ]
      },
      {
        "id": "the-adaptation-ladder-prompt-rag-lora-continued-pretraining-preferences",
        "heading": "The adaptation ladder: prompt, RAG, LoRA, continued pretraining, preferences",
        "paragraphs": [
          "Treat specialization as an escalation path with explicit exit criteria. Start with prompts and tools: cheapest to iterate, easiest to roll back. Move to RAG when the failure is missing or stale private knowledge rather than style or schema adherence. Reach for LoRA/QLoRA when you need consistent formats, domain tone, or latency wins from a smaller specialized model and you already have clean instruction pairs. Continued pretraining (domain-adaptive pretraining on raw corpora) is a heavier step for language/distribution shift—legal, biomedical, or multilingual corpora—before instruction tuning; it is not a substitute for retrieval of facts that change weekly. Preference optimization (DPO-style and relatives) sits after supervised fine-tuning: given preferred vs rejected responses, the model learns a ranking signal without a full RLHF stack. Conceptually, you are shaping the policy toward human (or AI) preferences on pairwise data; you still need SFT competence first, and you must watch for reward hacking on verbosity or sycophancy. Synthetic data can multiply volume, but quality risks dominate: teacher-model biases, duplicated templates, contaminated evals, and fluent nonsense. Filter with rubrics, dedupe embeddings, hold out human gold sets, and always measure regressions on general assistants plus safety suites—not only the domain win rate.",
          "Hold these points explicitly while you study. Restate each one without looking at the list — recognition is not the interview bar; recall is.",
          "• Escalate prompt → RAG → PEFT → continued pretraining only when the prior rung fails measured gates.",
          "• DPO-style preference optimization is pairwise policy shaping after SFT, not a magic alignment layer.",
          "• Synthetic data needs dedupe, rubrics, and untouched human gold evals to avoid self-congratulation.",
          "• Track catastrophic forgetting and safety regressions whenever you train adapters.",
          "Production lens — Data quality dominates hyperparameter tuning for alignment: A few thousand well-curated instruction examples often outperform noisy millions. Format consistency, deduplication, and rejection of hallucinated or toxic pairs matter more than epoch count. For domain adaptation, continued pretraining on in-domain text before instruction tuning frequently beats SFT alone on knowledge-heavy tasks."
        ],
        "keyTerms": [
          {
            "term": "Escalate prompt → RAG → PEFT",
            "definition": "Escalate prompt → RAG → PEFT → continued pretraining only when the prior rung fails measured gates."
          },
          {
            "term": "DPO-style preference optimization is pairwise…",
            "definition": "DPO-style preference optimization is pairwise policy shaping after SFT, not a magic alignment layer."
          },
          {
            "term": "Synthetic data needs dedupe, rubrics, and",
            "definition": "Synthetic data needs dedupe, rubrics, and untouched human gold evals to avoid self-congratulation."
          },
          {
            "term": "Track catastrophic forgetting and safety regr…",
            "definition": "Track catastrophic forgetting and safety regressions whenever you train adapters."
          }
        ],
        "workedExample": {
          "title": "Gate the adaptation ladder with offline scores",
          "body": "Narrate what each shape and step is doing. If you only recognize the API call, you do not own the idea yet — rewrite the example from memory after one pass.",
          "code": "def choose_rung(prompt_score, rag_recall, peft_gain, data_rows):\n    if prompt_score >= 0.9:\n        return 'ship_prompt'\n    if rag_recall is not None and rag_recall < 0.7:\n        return 'fix_retrieval_before_training'\n    if data_rows < 500:\n        return 'collect_data_or_stay_on_rag'\n    if peft_gain >= 0.05:\n        return 'train_lora'\n    return 'prefer_rag_or_prompt_iteration'\n\nprint(choose_rung(0.72, 0.55, 0.0, 200))\nprint(choose_rung(0.72, 0.88, 0.08, 2000))",
          "language": "python"
        },
        "checkYourself": [
          {
            "prompt": "Can explain when RAG is preferable to LoRA for rapidly changing facts.",
            "reveal": "Explain the idea in two sentences, name one metric or invariant you would watch, and state one mistake juniors make. Then connect it back to the adaptation ladder: prompt, rag, lora, continued pretraining, preferences."
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
          "Most interview answers fail not because the definition is wrong, but because the candidate never names how the approach breaks. Use this section as a trap checklist for fine-tuning and adaptation.",
          "Trap: Fine-tuning on messy logs without filters. A strong answer preempts it — say what you would monitor, what fallback you would keep, or what simpler baseline you would try first.",
          "Trap: No general-capability regression tests. A strong answer preempts it — say what you would monitor, what fallback you would keep, or what simpler baseline you would try first.",
          "Trap: Updating facts via weights instead of retrieval. A strong answer preempts it — say what you would monitor, what fallback you would keep, or what simpler baseline you would try first.",
          "Trap: Full FT when LoRA would suffice. A strong answer preempts it — say what you would monitor, what fallback you would keep, or what simpler baseline you would try first.",
          "Trap: Fine-tuning to paper over a broken retrieval stack. A strong answer preempts it — say what you would monitor, what fallback you would keep, or what simpler baseline you would try first.",
          "Trap: Training on synthetic data that duplicates the eval set. A strong answer preempts it — say what you would monitor, what fallback you would keep, or what simpler baseline you would try first.",
          "Trap: Skipping general-capability and safety regressions after preference optimization. A strong answer preempts it — say what you would monitor, what fallback you would keep, or what simpler baseline you would try first."
        ],
        "callout": {
          "tone": "warning",
          "body": "If you cannot name a failure mode, you do not yet understand the technique well enough to ship or defend it."
        },
        "checkYourself": [
          {
            "prompt": "Pick the most dangerous pitfall for Fine-tuning and adaptation and explain how you would detect it in production or on a whiteboard.",
            "reveal": "Start with: \"Fine-tuning on messy logs without filters.\" Then add a detection signal (metric, test, or review question) and a mitigation."
          }
        ]
      },
      {
        "id": "deeper-lens",
        "heading": "A deeper production lens",
        "paragraphs": [
          "Full fine-tuning vs PEFT is a memory and catastrophic-forgetting trade-off. Full fine-tuning updates all weights and risks overwriting general capabilities on small domain datasets. Parameter-efficient methods (LoRA, adapters, prefix tuning) train low-rank or small injected modules, reducing VRAM and enabling multi-tenant serving. LoRA merges into base weights at inference with zero latency overhead—a major production advantage.",
          "Data quality dominates hyperparameter tuning for alignment. A few thousand well-curated instruction examples often outperform noisy millions. Format consistency, deduplication, and rejection of hallucinated or toxic pairs matter more than epoch count. For domain adaptation, continued pretraining on in-domain text before instruction tuning frequently beats SFT alone on knowledge-heavy tasks."
        ],
        "keyTerms": [
          {
            "term": "Full fine-tuning vs PEFT is a memory and catastrophic-forgetting trade-off",
            "definition": "Full fine-tuning updates all weights and risks overwriting general capabilities on small domain datasets. Parameter-efficient methods (LoRA, adapters, prefix tuning) train low-rank or small injected modules, reducing VRA…"
          },
          {
            "term": "Data quality dominates hyperparameter tuning for alignment",
            "definition": "A few thousand well-curated instruction examples often outperform noisy millions. Format consistency, deduplication, and rejection of hallucinated or toxic pairs matter more than epoch count. For domain adaptation, conti…"
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
          "You should now be able to teach fine-tuning and adaptation as a story: what problem it solves, how the mechanism works, which assumptions it depends on, and how you would know it failed.",
          "Close the loop by writing a 90-second spoken answer out loud. If you freeze on definitions, return to the orientation and the first technical part. If you freeze on trade-offs, return to failure modes.",
          "Practice prompts from this lesson: Explain how LoRA achieves parameter efficiency. | How would you prepare instruction data for support agents? | What is catastrophic forgetting and how do you reduce it?"
        ],
        "checkYourself": [
          {
            "prompt": "Give a 90-second spoken overview of Fine-tuning and adaptation as if starting an interview answer.",
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
        "Can decide prompting vs fine-tuning vs RAG.",
        "Can explain LoRA forward pass and param counts.",
        "Can prepare filtered instruction datasets with clean splits.",
        "Defines regression gates before training.",
        "Plans rollback for adapter deploys."
      ],
      "nextSteps": [
        "Return to the lesson page and attempt the practice / topic lab with this chapter still open if needed.",
        "Revisit any Check yourself prompts you could not answer out loud.",
        "Optional deeper reading: LoRA: Low-Rank Adaptation of Large Language Models (arXiv) — https://arxiv.org/abs/2106.09685",
        "Optional deeper reading: Hugging Face PEFT documentation (Hugging Face) — https://huggingface.co/docs/peft/index"
      ]
    }
  },
  "llms-and-nlp/embeddings-and-vector-search": {
    "title": "Chapter: Embeddings and vector search",
    "readingTime": "55-70 min",
    "premise": "Text embeddings, vector databases, similarity search, and hybrid retrieval for powering semantic search and RAG systems. This Learn chapter expands the short lesson summary into a full study unit you can read continuously, with interactive checks and selection-based AI search when a phrase needs a second opinion.",
    "parts": [
      {
        "id": "orientation",
        "heading": "Why this chapter exists",
        "paragraphs": [
          "Production retrieval in 2026 is hybrid by default: BM25 for exact tokens, dense vectors for paraphrase, cross-encoders for precision, and an explicit migration playbook when embedding models change. Dimensionality and Matryoshka-style truncations are cost levers, not afterthoughts.",
          "This chapter treats \"Embeddings and vector search\" as a readable study unit: intuition first, then the mechanics you must be able to explain, then the failure modes that show up in interviews and production, and finally how to talk about the topic under time pressure.",
          "Read it like a book chapter. When a phrase is unclear, select it inside the Learn reader and use Search with AI to open Google, Perplexity, or DuckDuckGo without abandoning the chapter."
        ],
        "callout": {
          "tone": "tip",
          "body": "Target reading time is paced for depth, not skimming. Pause at each Check yourself prompt and answer out loud before revealing the guide answer."
        }
      },
      {
        "id": "embedding-spaces-and-cosine-geometry",
        "heading": "Embedding spaces and cosine geometry",
        "paragraphs": [
          "Embedding models map text to dense vectors so semantic nearness becomes geometric nearness. Cosine similarity divides a dot product by vector norms, focusing on angle. Dot product alone prefers longer vectors; L2 distance ranks differently if norms vary. Normalize embeddings when your index assumes cosine. Domain mismatch hurts: a general MiniLM-like space may scramble legal citations. Evaluate with retrieval metrics (Recall@k, MRR, nDCG) on labeled query-document pairs. In-browser we mock embeddings with hashing/projection or bag-of-words vectors, but the ranking math is identical to production cosine search.",
          "Hold these points explicitly while you study. Restate each one without looking at the list — recognition is not the interview bar; recall is.",
          "• Know whether your index expects cosine, IP, or L2.",
          "• Evaluate embeddings with labeled retrieval sets.",
          "• Watch domain shift between embedder and corpus.",
          "Production lens — Embedding geometry depends on training objective: Contrastive models (sentence-transformers) optimize relative similarity; generative LLM hidden states are not automatically good retrieval vectors. Normalization, pooling strategy (mean vs CLS), and asymmetric queries (E5 query/passage prefixes) materially affect recall. Always evaluate embeddings on your domain—MTEB leaderboard rankings do not guarantee production performance."
        ],
        "keyTerms": [
          {
            "term": "Know whether your index expects cosine,",
            "definition": "Know whether your index expects cosine, IP, or L2."
          },
          {
            "term": "Evaluate embeddings with labeled retrieval sets.",
            "definition": "Evaluate embeddings with labeled retrieval sets."
          },
          {
            "term": "Watch domain shift between embedder and",
            "definition": "Watch domain shift between embedder and corpus."
          }
        ],
        "workedExample": {
          "title": "Cosine ranking with bag-of-words embeddings",
          "body": "Narrate what each shape and step is doing. If you only recognize the API call, you do not own the idea yet — rewrite the example from memory after one pass.",
          "code": "import numpy as np\n\nvocab = [\"machine\",\"learning\",\"neural\",\"network\",\"data\",\"model\",\"python\",\"api\",\"cloud\",\"deploy\"]\n\ndef embed(text):\n    words = set(text.lower().split())\n    v = np.array([1.0 if w in words else 0.0 for w in vocab])\n    n = np.linalg.norm(v)\n    return v / n if n else v\n\ndocs = [\n    \"machine learning model deploy cloud\",\n    \"python api network data\",\n    \"best pizza recipe\",\n]\nq = embed(\"deploy learning model\")\nfor d in docs:\n    e = embed(d)\n    print(round(float(q @ e), 3), d)",
          "language": "python"
        },
        "checkYourself": [
          {
            "prompt": "Can implement cosine top-k retrieval in NumPy.",
            "reveal": "Contrastive models (sentence-transformers) optimize relative similarity; generative LLM hidden states are not automatically good retrieval vectors. Normalization, pooling strategy (mean vs CLS), and asymmetric queries (E5 query/passage prefixes) materially affect recall. Always evaluate embeddings on your domain—MTEB leaderboard rankings do not guarantee production performance."
          }
        ]
      },
      {
        "id": "indexes-exact-ivf-hnsw-intuition",
        "heading": "Indexes: exact, IVF, HNSW intuition",
        "paragraphs": [
          "Exact search scans all vectors—fine to thousands, painful at hundreds of millions. ANN indexes trade a little recall for large speedups. IVF clusters vectors and searches a subset of lists; HNSW builds a navigable graph. Parameters (nprobe, efSearch, M) move you along a recall-latency curve. Memory layout, dimensionality, and quantization (PQ) matter as much as algorithm name. Metadata filters (tenant_id, time) change feasible indexes; prefilters vs postfilters have different recall semantics. Always measure on your embedding distribution, not only synthetic Gaussian blobs.",
          "Hold these points explicitly while you study. Restate each one without looking at the list — recognition is not the interview bar; recall is.",
          "• ANN is a recall/latency/memory tradeoff surface.",
          "• Tune index params with offline recall curves.",
          "• Metadata filters belong in the retrieval design, not as afterthoughts.",
          "Production lens — ANN indexes trade recall for speed at scale: Exact brute-force search works for small corpora; HNSW, IVF, and product quantization enable billion-scale retrieval with tunable recall/latency knobs. Metadata filtering combined with vector search requires indexes that support pre-filtering or post-filtering strategies—each has different recall characteristics under skewed filters."
        ],
        "keyTerms": [
          {
            "term": "ANN is a recall/latency/memory tradeoff surface.",
            "definition": "ANN is a recall/latency/memory tradeoff surface."
          },
          {
            "term": "Tune index params with offline recall",
            "definition": "Tune index params with offline recall curves."
          },
          {
            "term": "Metadata filters belong in the retrieval",
            "definition": "Metadata filters belong in the retrieval design, not as afterthoughts."
          }
        ],
        "checkYourself": [
          {
            "prompt": "Can explain ANN recall/latency tradeoffs.",
            "reveal": "Exact brute-force search works for small corpora; HNSW, IVF, and product quantization enable billion-scale retrieval with tunable recall/latency knobs. Metadata filtering combined with vector search requires indexes that support pre-filtering or post-filtering strategies—each has different recall characteristics under skewed filters."
          }
        ]
      },
      {
        "id": "hybrid-retrieval-and-reranking",
        "heading": "Hybrid retrieval and reranking",
        "paragraphs": [
          "Lexical methods (BM25) excel at exact identifiers, error codes, and rare proper nouns that embeddings blur. Hybrid systems retrieve from both lexical and vector indexes then fuse (RRF or weighted scores). Cross-encoder rerankers score query-document pairs more accurately at higher latency—use on a shortlist. Chunking determines what a \"document\" is: too large and retrieval is coarse; too small and context fragments. Overlap helps boundary issues but multiplies storage. For tables/code, specialized splitters beat naive character windows.",
          "Hold these points explicitly while you study. Restate each one without looking at the list — recognition is not the interview bar; recall is.",
          "• Hybrid helps when exact tokens matter.",
          "• Rerankers improve precision on small candidate sets.",
          "• Chunking is a first-class retrieval hyperparameter.",
          "Production lens — Embedding geometry depends on training objective: Contrastive models (sentence-transformers) optimize relative similarity; generative LLM hidden states are not automatically good retrieval vectors. Normalization, pooling strategy (mean vs CLS), and asymmetric queries (E5 query/passage prefixes) materially affect recall. Always evaluate embeddings on your domain—MTEB leaderboard rankings do not guarantee production performance."
        ],
        "keyTerms": [
          {
            "term": "Hybrid helps when exact tokens matter.",
            "definition": "Hybrid helps when exact tokens matter."
          },
          {
            "term": "Rerankers improve precision on small candidate",
            "definition": "Rerankers improve precision on small candidate sets."
          },
          {
            "term": "Chunking is a first-class retrieval hyperpara…",
            "definition": "Chunking is a first-class retrieval hyperparameter."
          }
        ],
        "workedExample": {
          "title": "Reciprocal rank fusion toy example",
          "body": "Narrate what each shape and step is doing. If you only recognize the API call, you do not own the idea yet — rewrite the example from memory after one pass.",
          "code": "def rrf(rank_lists, k=60):\n    scores = {}\n    for ranks in rank_lists:\n        for rank, doc_id in enumerate(ranks, start=1):\n            scores[doc_id] = scores.get(doc_id, 0.0) + 1.0 / (k + rank)\n    return sorted(scores.items(), key=lambda x: -x[1])\n\nvector_ranks = [\"d2\", \"d1\", \"d3\"]\nbm25_ranks = [\"d3\", \"d2\", \"d4\"]\nprint(rrf([vector_ranks, bm25_ranks])[:3])",
          "language": "python"
        },
        "checkYourself": [
          {
            "prompt": "Knows when to add BM25 hybrid retrieval.",
            "reveal": "Explain the idea in two sentences, name one metric or invariant you would watch, and state one mistake juniors make. Then connect it back to hybrid retrieval and reranking."
          }
        ]
      },
      {
        "id": "evaluation-and-failure-analysis-for-search",
        "heading": "Evaluation and failure analysis for search",
        "paragraphs": [
          "Build a golden set of queries with relevant chunk IDs. Report Recall@k and analyze misses: wrong chunk size, embedding domain gap, synonym issues, or filter bugs. Slice by query type (how-to, code error, policy). Online, track CTR, reformulation rate, and downstream grounded answer usefulness—not only retrieval score. Be careful with synthetic queries generated by LLMs; they can overfit your current chunker. Change one variable at a time when iterating chunk sizes.",
          "Hold these points explicitly while you study. Restate each one without looking at the list — recognition is not the interview bar; recall is.",
          "• Maintain a labeled retrieval evaluation set.",
          "• Analyze misses by failure mode slices.",
          "• Connect retrieval metrics to downstream task metrics.",
          "Production lens — ANN indexes trade recall for speed at scale: Exact brute-force search works for small corpora; HNSW, IVF, and product quantization enable billion-scale retrieval with tunable recall/latency knobs. Metadata filtering combined with vector search requires indexes that support pre-filtering or post-filtering strategies—each has different recall characteristics under skewed filters."
        ],
        "keyTerms": [
          {
            "term": "Maintain a labeled retrieval evaluation set.",
            "definition": "Maintain a labeled retrieval evaluation set."
          },
          {
            "term": "Analyze misses by failure mode slices.",
            "definition": "Analyze misses by failure mode slices."
          },
          {
            "term": "Connect retrieval metrics to downstream task",
            "definition": "Connect retrieval metrics to downstream task metrics."
          }
        ],
        "checkYourself": [
          {
            "prompt": "Can design chunking for a doc type.",
            "reveal": "Explain the idea in two sentences, name one metric or invariant you would watch, and state one mistake juniors make. Then connect it back to evaluation and failure analysis for search."
          }
        ]
      },
      {
        "id": "operational-concerns-versioning-and-drift",
        "heading": "Operational concerns: versioning and drift",
        "paragraphs": [
          "Embedding model upgrades reshuffle the space—reindex or maintain dual indexes during migration. Document chunker version alongside embedding model version in each vector metadata record. Monitor embedding norm distributions and nearest-neighbor self-consistency on canary docs. Multitenancy needs hard filters to prevent cross-tenant leakage. These ops details are where semantic search systems usually fail in production even when the demo looked magical.",
          "Hold these points explicitly while you study. Restate each one without looking at the list — recognition is not the interview bar; recall is.",
          "• Version embedder + chunker + index together.",
          "• Plan reembedding migrations explicitly.",
          "• Enforce tenant isolation in filters.",
          "Production lens — Embedding geometry depends on training objective: Contrastive models (sentence-transformers) optimize relative similarity; generative LLM hidden states are not automatically good retrieval vectors. Normalization, pooling strategy (mean vs CLS), and asymmetric queries (E5 query/passage prefixes) materially affect recall. Always evaluate embeddings on your domain—MTEB leaderboard rankings do not guarantee production performance."
        ],
        "keyTerms": [
          {
            "term": "Version embedder + chunker + index",
            "definition": "Version embedder + chunker + index together."
          },
          {
            "term": "Plan reembedding migrations explicitly.",
            "definition": "Plan reembedding migrations explicitly."
          },
          {
            "term": "Enforce tenant isolation in filters.",
            "definition": "Enforce tenant isolation in filters."
          }
        ],
        "checkYourself": [
          {
            "prompt": "Versions embeddings and indexes as a unit.",
            "reveal": "Explain the idea in two sentences, name one metric or invariant you would watch, and state one mistake juniors make. Then connect it back to operational concerns: versioning and drift."
          }
        ]
      },
      {
        "id": "hybrid-search-rerankers-matryoshka-tradeoffs-and-embedding-migrations",
        "heading": "Hybrid search, rerankers, Matryoshka tradeoffs, and embedding migrations",
        "paragraphs": [
          "Dense retrieval alone still blurs SKUs, error codes, and rare proper nouns; BM25 (and other lexical indexes) still win on exactness. A 2026-default stack retrieves a union or fused shortlist from lexical and dense indexes—often via reciprocal rank fusion—then applies a cross-encoder reranker that scores full query-document pairs for precision. Rerankers are slower and usually limited to top 20–100 candidates; they are not a replacement for first-stage recall. Matryoshka Representation Learning and similar embedding designs let you train (or select) vectors that remain useful when truncated to fewer dimensions: store 768-d, serve 256-d for cheap ANN, and only use full width for hard queries. The tradeoff is recall vs memory/latency; measure on your corpus, not vendor slides. Embedding model migration is a release, not a config flip: dual-write or dual-read indexes, backfill by tenant/shard, compare recall@k and downstream groundedness on a frozen golden set, then cut traffic with a kill switch. Version embedder id, chunker id, and index build id in every vector’s metadata so you can explain why yesterday’s neighbors moved. Without that playbook, “we upgraded the embedder” becomes a silent relevance regression.",
          "Hold these points explicitly while you study. Restate each one without looking at the list — recognition is not the interview bar; recall is.",
          "• Hybrid first-stage (BM25 + dense) plus cross-encoder rerank is the common production pattern.",
          "• Matryoshka-style shorter vectors trade recall for memory and QPS—validate on your queries.",
          "• Treat embedding upgrades as migrations with dual indexes, golden recall, and metadata versioning.",
          "• Rerankers improve precision on shortlists; they cannot fix catastrophic first-stage misses.",
          "Production lens — ANN indexes trade recall for speed at scale: Exact brute-force search works for small corpora; HNSW, IVF, and product quantization enable billion-scale retrieval with tunable recall/latency knobs. Metadata filtering combined with vector search requires indexes that support pre-filtering or post-filtering strategies—each has different recall characteristics under skewed filters."
        ],
        "keyTerms": [
          {
            "term": "Hybrid first-stage (BM25 + dense) plus",
            "definition": "Hybrid first-stage (BM25 + dense) plus cross-encoder rerank is the common production pattern."
          },
          {
            "term": "Matryoshka-style shorter vectors trade recall…",
            "definition": "Matryoshka-style shorter vectors trade recall for memory and QPS—validate on your queries."
          },
          {
            "term": "Treat embedding upgrades as migrations with",
            "definition": "Treat embedding upgrades as migrations with dual indexes, golden recall, and metadata versioning."
          },
          {
            "term": "Rerankers improve precision on shortlists; they",
            "definition": "Rerankers improve precision on shortlists; they cannot fix catastrophic first-stage misses."
          }
        ],
        "workedExample": {
          "title": "Simulate Matryoshka truncation vs recall proxy",
          "body": "Narrate what each shape and step is doing. If you only recognize the API call, you do not own the idea yet — rewrite the example from memory after one pass.",
          "code": "import numpy as np\n\nrng = np.random.default_rng(0)\ndocs = rng.normal(size=(200, 128))\ndocs /= np.linalg.norm(docs, axis=1, keepdims=True)\nq = docs[0].copy()\n\ndef recall_at_k(mat, query, truth=0, k=10):\n    scores = mat @ query\n    top = np.argsort(-scores)[:k]\n    return float(truth in top)\n\nfor d in [128, 64, 32, 16]:\n    m = docs[:, :d]\n    m = m / np.linalg.norm(m, axis=1, keepdims=True)\n    qq = q[:d] / np.linalg.norm(q[:d])\n    print(d, recall_at_k(m, qq))",
          "language": "python"
        },
        "checkYourself": [
          {
            "prompt": "Can design BM25 + dense fusion with a cross-encoder rerank stage.",
            "reveal": "Explain the idea in two sentences, name one metric or invariant you would watch, and state one mistake juniors make. Then connect it back to hybrid search, rerankers, matryoshka tradeoffs, and embedding migrations."
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
          "Most interview answers fail not because the definition is wrong, but because the candidate never names how the approach breaks. Use this section as a trap checklist for embeddings and vector search.",
          "Trap: Using cosine math on unnormalized vectors meant for IP search. A strong answer preempts it — say what you would monitor, what fallback you would keep, or what simpler baseline you would try first.",
          "Trap: Chunking only by characters without structure. A strong answer preempts it — say what you would monitor, what fallback you would keep, or what simpler baseline you would try first.",
          "Trap: No labeled retrieval eval set. A strong answer preempts it — say what you would monitor, what fallback you would keep, or what simpler baseline you would try first.",
          "Trap: Changing embedding models without reindexing plans. A strong answer preempts it — say what you would monitor, what fallback you would keep, or what simpler baseline you would try first.",
          "Trap: Reranking a candidate set that already missed the relevant chunk. A strong answer preempts it — say what you would monitor, what fallback you would keep, or what simpler baseline you would try first.",
          "Trap: Cutting embedding dimensions in production without measuring recall. A strong answer preempts it — say what you would monitor, what fallback you would keep, or what simpler baseline you would try first.",
          "Trap: Replacing an embedder in place without dual-index backfill. A strong answer preempts it — say what you would monitor, what fallback you would keep, or what simpler baseline you would try first."
        ],
        "callout": {
          "tone": "warning",
          "body": "If you cannot name a failure mode, you do not yet understand the technique well enough to ship or defend it."
        },
        "checkYourself": [
          {
            "prompt": "Pick the most dangerous pitfall for Embeddings and vector search and explain how you would detect it in production or on a whiteboard.",
            "reveal": "Start with: \"Using cosine math on unnormalized vectors meant for IP search.\" Then add a detection signal (metric, test, or review question) and a mitigation."
          }
        ]
      },
      {
        "id": "deeper-lens",
        "heading": "A deeper production lens",
        "paragraphs": [
          "Embedding geometry depends on training objective. Contrastive models (sentence-transformers) optimize relative similarity; generative LLM hidden states are not automatically good retrieval vectors. Normalization, pooling strategy (mean vs CLS), and asymmetric queries (E5 query/passage prefixes) materially affect recall. Always evaluate embeddings on your domain—MTEB leaderboard rankings do not guarantee production performance.",
          "ANN indexes trade recall for speed at scale. Exact brute-force search works for small corpora; HNSW, IVF, and product quantization enable billion-scale retrieval with tunable recall/latency knobs. Metadata filtering combined with vector search requires indexes that support pre-filtering or post-filtering strategies—each has different recall characteristics under skewed filters."
        ],
        "keyTerms": [
          {
            "term": "Embedding geometry depends on training objective",
            "definition": "Contrastive models (sentence-transformers) optimize relative similarity; generative LLM hidden states are not automatically good retrieval vectors. Normalization, pooling strategy (mean vs CLS), and asymmetric queries (E…"
          },
          {
            "term": "ANN indexes trade recall for speed at scale",
            "definition": "Exact brute-force search works for small corpora; HNSW, IVF, and product quantization enable billion-scale retrieval with tunable recall/latency knobs. Metadata filtering combined with vector search requires indexes that…"
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
          "You should now be able to teach embeddings and vector search as a story: what problem it solves, how the mechanism works, which assumptions it depends on, and how you would know it failed.",
          "Close the loop by writing a 90-second spoken answer out loud. If you freeze on definitions, return to the orientation and the first technical part. If you freeze on trade-offs, return to failure modes.",
          "Practice prompts from this lesson: Design semantic search for a legal corpus. | Compare HNSW and IVF at a high level. | When does hybrid beat pure vector search?"
        ],
        "checkYourself": [
          {
            "prompt": "Give a 90-second spoken overview of Embeddings and vector search as if starting an interview answer.",
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
        "Can implement cosine top-k retrieval in NumPy.",
        "Can explain ANN recall/latency tradeoffs.",
        "Knows when to add BM25 hybrid retrieval.",
        "Can design chunking for a doc type.",
        "Versions embeddings and indexes as a unit."
      ],
      "nextSteps": [
        "Return to the lesson page and attempt the practice / topic lab with this chapter still open if needed.",
        "Revisit any Check yourself prompts you could not answer out loud.",
        "Optional deeper reading: Sentence-BERT: Sentence Embeddings using Siamese BERT-Networks (arXiv) — https://arxiv.org/abs/1908.10084",
        "Optional deeper reading: FAISS: A library for efficient similarity search (Meta AI) — https://github.com/facebookresearch/faiss/wiki"
      ]
    }
  }
};
