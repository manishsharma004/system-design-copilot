/** @type {Record<string, import('../learnChapters.js').LessonLearnChapter>} */
export const llmsNlpChapters = {
  "llms-and-nlp/llm-fundamentals": {
    "title": "Chapter: LLM fundamentals",
    "readingTime": "65-80 min",
    "premise": "A production-minded explanation of how large language models tokenize text, use context, learn through pretraining and post-training, fail through hallucination, and turn sampling choices into cost and reliability tradeoffs.",
    "parts": [
      {
        "id": "tokens-are-the-interface",
        "heading": "Tokens are the model's real input",
        "paragraphs": [
          "A language model does not read characters, words, or sentences in the way a person does. It receives a sequence of integer token IDs produced by a tokenizer, usually a byte-pair, unigram, or related subword scheme. That detail sounds mechanical until you debug a multilingual product, a code assistant, or a cost spike. A common English word may be one token, a rare medical term may be split into many, and a short emoji or punctuation-heavy code fragment may consume more budget than its visual length suggests.",
          "Tokenization also explains why models can be surprisingly strong at some strings and brittle at others. The model learns statistical patterns over token IDs, so tokens that appear often in training have richer learned associations than rare fragments. Numbers, identifiers, whitespace, and casing can all change the sequence the model sees. When an interviewer asks why an LLM struggles to copy long serial numbers or reason over exact code indentation, tokenization is one of the first mechanisms to mention.",
          "In production, token count is not an abstract measure; it is the unit of context, latency, and price. Every system prompt, retrieved passage, chat turn, tool result, and output token competes for the same window and the same bill. Before promising that a workflow can summarize hundreds of documents or keep years of chat memory, estimate tokens with the model's actual tokenizer. Educational approximations are fine for learning, but pricing and truncation policies must use the tokenizer used by the deployed model.",
          "A practical habit is to treat tokenization as part of input validation. Log token distributions by route, language, and document type; watch for long-tail outliers; and reject or summarize pathological inputs before they trigger expensive calls. This turns tokenization from trivia into an operational control surface."
        ],
        "keyTerms": [
          {
            "term": "Subword tokenizer",
            "definition": "A tokenizer that represents text as reusable pieces smaller than or sometimes equal to words, improving coverage while changing sequence length."
          },
          {
            "term": "Token budget",
            "definition": "The total number of input and output tokens a request can use before hitting context, latency, or cost limits."
          },
          {
            "term": "Vocabulary",
            "definition": "The fixed set of token IDs the model can receive or emit after tokenization."
          }
        ],
        "checkYourself": [
          {
            "prompt": "Why can a short-looking string be expensive or error-prone for an LLM?",
            "reveal": "Because visible length is not token length. Rare terms, numbers, code, punctuation, and multilingual text may split into many tokens, increasing cost and changing what patterns the model has learned."
          },
          {
            "prompt": "What should you use for production token estimates?",
            "reveal": "Use the deployed model's real tokenizer, not whitespace or character counts."
          }
        ],
        "callout": {
          "tone": "interview",
          "body": "Strong interview answers connect tokenization to user-visible behavior: context limits, cost, multilingual quality, code handling, and exact-copy failures."
        }
      },
      {
        "id": "context-window-as-working-memory",
        "heading": "Context windows are scarce working memory",
        "paragraphs": [
          "The context window is the maximum sequence of tokens the model can condition on for one request. It includes the hidden or system instructions, user messages, examples, retrieved documents, tool outputs, and prior conversation turns. A larger window can reduce the need for aggressive summarization, but it does not create permanent memory. Anything outside the current request is invisible unless you retrieve, summarize, or otherwise reinsert it.",
          "Long context introduces its own reliability issues. Models may underuse facts buried in the middle, over-attend to recent or prominent passages, or become distracted by redundant context. Simply stuffing more pages into the prompt can lower precision even when it raises recall. Good context assembly orders evidence intentionally, keeps source IDs attached, removes duplicates, and reserves space for the answer.",
          "Truncation policy is an architecture decision. If a support bot keeps appending chat turns until it hits the limit, the oldest constraints, consent statements, or customer facts may disappear. Production systems usually separate durable policy, recent conversation, retrieved knowledge, and compact memory summaries, then assign each a budget. Critical instructions should live in high-priority segments that are hard to drop.",
          "Cost grows with context, and latency often grows with both prompt and output length. The cheapest reliable system is rarely the one with the largest possible context; it is the one that retrieves and packs the smallest sufficient evidence. Measure accuracy at short, normal, and max-context cases, because many demos fail only after real users accumulate history."
        ],
        "keyTerms": [
          {
            "term": "Context window",
            "definition": "The maximum number of tokens a model can consider in a single request, including prompt, tools, retrieval, history, and output allowance."
          },
          {
            "term": "Lost-in-the-middle",
            "definition": "A failure mode where models ignore or underweight important facts placed deep inside long context."
          },
          {
            "term": "Context packing",
            "definition": "The process of selecting, ordering, and trimming prompt material to fit a token budget while preserving evidence and instructions."
          }
        ],
        "checkYourself": [
          {
            "prompt": "Why can a larger context window still make answers worse?",
            "reveal": "More context can add distraction, duplicates, conflicting facts, and position effects; retrieval and packing quality still matter."
          },
          {
            "prompt": "What prompt segments deserve protection from truncation?",
            "reveal": "Safety policy, output contracts, user-specific constraints, source metadata, and the most relevant evidence should be protected."
          }
        ],
        "callout": {
          "tone": "warning",
          "body": "Do not sell long context as memory. It is request-local working memory with cost, position, and truncation failure modes."
        }
      },
      {
        "id": "pretraining-sft-and-preference-alignment",
        "heading": "Pretraining, SFT, and RLHF are different stages",
        "paragraphs": [
          "Most modern LLMs start with large-scale self-supervised pretraining. The model learns to predict tokens from broad mixtures of web text, books, code, academic material, and curated corpora. This stage teaches grammar, facts, styles, and latent skills, but the raw pretrained model is not necessarily a helpful assistant. It may continue text, imitate toxic sources, or ignore instructions because next-token prediction is not the same as cooperative task completion.",
          "Supervised fine-tuning, often called SFT, turns the base model toward instruction following. Training examples are formatted as prompts and ideal responses, so the model learns role behavior, answer style, refusal patterns, and common task formats. SFT is where many assistant conventions appear: concise answers, step lists, tool-call schemas, and conversational tone. Poor SFT data can make a model verbose, brittle, or overconfident even if the base model is strong.",
          "Preference alignment, including RLHF and direct preference optimization variants, adds another signal: among multiple candidate responses, which one is preferred. This can improve helpfulness, harmlessness, and conversational judgment, but it can also teach superficial reward patterns such as excessive politeness, sycophancy, or refusal overreach. Alignment methods shape behavior; they do not install a database of truth.",
          "A useful debugging frame is to map failures to likely stages. Missing domain knowledge may call for retrieval or continued pretraining, bad formatting may call for SFT or prompting, and unsafe or unhelpful behavior may point to preference data and policy tuning. The stages interact, but naming them keeps a design discussion concrete."
        ],
        "keyTerms": [
          {
            "term": "Pretraining",
            "definition": "Large-scale self-supervised training that teaches broad language patterns and knowledge through token prediction or related objectives."
          },
          {
            "term": "Supervised fine-tuning",
            "definition": "Training on instruction-response examples to teach task following, formats, and assistant behavior."
          },
          {
            "term": "RLHF",
            "definition": "Reinforcement learning from human feedback, a preference-based alignment method that rewards responses humans or trained raters prefer."
          }
        ],
        "checkYourself": [
          {
            "prompt": "Which stage most directly teaches an assistant to follow a JSON response format?",
            "reveal": "SFT often teaches formats, though prompting and constrained decoding should still enforce the contract at runtime."
          },
          {
            "prompt": "Why does RLHF not eliminate hallucination?",
            "reveal": "It shapes preferred behavior, but the model is still generating from learned patterns and may invent unsupported content without evidence or tools."
          }
        ]
      },
      {
        "id": "hallucination-and-verification",
        "heading": "Hallucination is a system problem, not just a model flaw",
        "paragraphs": [
          "A hallucination is an unsupported or false claim produced with fluent confidence. It occurs because the model is optimized to generate plausible continuations, not to maintain a verified belief database. When evidence is missing, ambiguous, stale, or hidden outside the context window, the model may still produce a convincing answer. Better models reduce the rate, but they do not change the need for verification in high-stakes workflows.",
          "Mitigation starts by separating tasks that need creativity from tasks that need truth. Drafting marketing copy can tolerate variation; medical advice, legal summaries, billing actions, and security decisions require evidence, tools, or human review. Retrieval grounds claims in documents, calculators handle arithmetic, databases answer exact state, and validators enforce schemas. The LLM should be an orchestrated component, not the sole authority.",
          "Good systems also teach the model when to refuse or ask clarifying questions. If retrieved evidence is weak, conflicting, or absent, the correct answer may be \"I do not have enough information.\" That behavior has to be evaluated, because models often prefer completion over abstention. Citation checks, quote verification, and answer-against-context judges can catch many unsupported claims before users see them.",
          "For interviews, avoid saying hallucinations are solved by lower temperature. Lower temperature reduces sampling variability, but a deterministic wrong answer is still wrong. The stronger answer is architectural: constrain the task, retrieve evidence, call tools for exact facts, validate outputs, measure groundedness, and define a fallback path."
        ],
        "keyTerms": [
          {
            "term": "Hallucination",
            "definition": "A generated claim that is unsupported by the provided evidence or false relative to the task's ground truth."
          },
          {
            "term": "Grounding",
            "definition": "Constraining answers to explicit evidence such as retrieved documents, database records, or tool outputs."
          },
          {
            "term": "Abstention",
            "definition": "A system behavior where the model refuses or asks for clarification when confidence or evidence is insufficient."
          }
        ],
        "checkYourself": [
          {
            "prompt": "Why is a deterministic hallucination still dangerous?",
            "reveal": "Lower randomness can make the same false claim repeat reliably; verification and grounding are still required."
          },
          {
            "prompt": "Name three non-prompt mitigations for hallucination.",
            "reveal": "Retrieval, tool use, schema validation, citation verification, human review, and groundedness evaluation are all valid examples."
          }
        ],
        "callout": {
          "tone": "warning",
          "body": "A fluent answer is not evidence. Production LLM features need explicit sources of truth and checks that claims stay inside them."
        }
      },
      {
        "id": "sampling-temperature-and-output-control",
        "heading": "Temperature controls variation, not correctness",
        "paragraphs": [
          "At generation time, the model produces a distribution over possible next tokens. Decoding parameters decide how to sample from that distribution. Temperature rescales probabilities: lower values concentrate on likely tokens, while higher values increase diversity and surprise. Top-p and top-k further restrict the candidate set. These knobs change style and variability, but they do not add missing knowledge or guarantee reasoning.",
          "The right setting depends on the task. Extraction, classification, code transformations, and JSON generation usually want low temperature, strict schemas, and retries on validation failure. Brainstorming, naming, teaching examples, and creative drafting may benefit from higher temperature and multiple candidates. A product can route different tasks to different decoding profiles rather than pretending one global setting fits all features.",
          "Structured outputs deserve special treatment. If downstream code consumes the result, use JSON schema, function/tool calling, grammar constraints, or a strict parser with a repair loop. Sampling alone cannot promise valid JSON, valid enum values, or safe tool arguments. Output validation should be visible in code and covered by tests.",
          "Temperature also affects evaluation design. If the model is allowed to vary, run multiple samples or fix seeds where the provider supports it. A prompt that passes once at temperature 0.8 may fail under the next sample. Reliability claims should specify decoding settings, model version, and validation rules."
        ],
        "keyTerms": [
          {
            "term": "Temperature",
            "definition": "A decoding parameter that controls how sharply or broadly the model samples from next-token probabilities."
          },
          {
            "term": "Top-p",
            "definition": "Nucleus sampling that limits generation to the smallest set of tokens whose cumulative probability exceeds a threshold."
          },
          {
            "term": "Constrained decoding",
            "definition": "A generation approach that restricts tokens so outputs follow a grammar, schema, or tool-call structure."
          }
        ],
        "checkYourself": [
          {
            "prompt": "Which tasks usually need low temperature?",
            "reveal": "Extraction, classification, deterministic transformations, structured JSON, and safety-sensitive workflows usually need low temperature and validation."
          },
          {
            "prompt": "Why is schema validation still needed with low temperature?",
            "reveal": "Low temperature reduces variety but does not guarantee parseable or semantically valid output."
          }
        ],
        "callout": {
          "tone": "interview",
          "body": "A concise answer: temperature is a diversity knob, not a truth knob. Pair it with task-specific validation and metrics."
        }
      },
      {
        "id": "cost-latency-and-operating-models",
        "heading": "Cost and latency shape model architecture",
        "paragraphs": [
          "LLM cost is usually a function of input tokens, output tokens, model tier, cached-prefix discounts, and sometimes reasoning effort or tool calls. Latency follows similar drivers: prompt length, generated length, queueing, model size, region, and the number of serial steps. A feature that looks cheap in a demo can become expensive when every request includes a long policy prompt, ten retrieved chunks, chat history, and a verbose answer.",
          "Production systems often use model routing. A small model can classify intent, check whether retrieval is needed, or draft low-risk responses; a stronger model handles complex reasoning or user-visible final answers. Some products use open-weight models for steady high-volume tasks and hosted frontier models for difficult cases. Routing should be justified with evals, not vibes, because a cheap wrong answer can cost more than an expensive correct one.",
          "Prompt caching and context reuse change the economics. Stable system instructions, tool schemas, and policy blocks can be arranged as a consistent prefix so providers or local servers can reuse computation. This rewards disciplined prompt templates over ad hoc string assembly. It also creates a reason to version prompts, because a small change to the prefix can invalidate cache behavior and shift costs.",
          "The operating view ties the chapter together: tokens define the interface, context defines working memory, training stages define behavior, decoding defines variation, and evaluation defines whether the system is trustworthy. A good LLM design answer always includes quality, latency, cost, privacy, and rollback, because model choice alone is not an architecture."
        ],
        "keyTerms": [
          {
            "term": "Model routing",
            "definition": "Selecting different models or decoding profiles per request based on task type, risk, latency, and cost."
          },
          {
            "term": "Prompt caching",
            "definition": "Reusing computation for stable prompt prefixes to reduce latency or token cost where providers or servers support it."
          },
          {
            "term": "Quality per dollar",
            "definition": "A practical metric that compares task success against total model and infrastructure cost."
          }
        ],
        "checkYourself": [
          {
            "prompt": "What should be logged to understand LLM cost?",
            "reveal": "Input tokens, output tokens, model ID, cache hit status, route, tool calls, latency, and validation outcome."
          },
          {
            "prompt": "Why might a smaller model be part of a high-quality system?",
            "reveal": "It can handle routing, filtering, simple extraction, or low-risk tasks cheaply while reserving stronger models for hard cases."
          }
        ]
      }
    ],
    "wrapUp": {
      "takeaways": [
        "Tokenization determines the model's real input length, behavior, cost, and context pressure.",
        "Context windows are request-local working memory that require packing, prioritization, and truncation policy.",
        "Pretraining, SFT, and RLHF or preference optimization solve different behavior problems.",
        "Hallucination mitigation is architectural: evidence, tools, validation, abstention, and evaluation.",
        "Temperature changes diversity, while cost and latency require routing, caching, and explicit budgets."
      ],
      "nextSteps": [
        "Explain LLM fundamentals out loud using the sequence: tokens, context, training stages, decoding, verification, cost.",
        "Review one LLM feature you use and identify where hallucination, truncation, or token-cost failures could appear."
      ]
    }
  },
  "llms-and-nlp/fine-tuning-techniques": {
    "title": "Chapter: Fine-tuning techniques",
    "readingTime": "65-80 min",
    "premise": "A long-form guide to choosing between full fine-tuning, LoRA, QLoRA, adapters, retrieval, prompting, and no training at all, with emphasis on data quality and regression control.",
    "parts": [
      {
        "id": "fine-tuning-changes-behavior-not-facts",
        "heading": "Fine-tuning changes behavior more reliably than facts",
        "paragraphs": [
          "Fine-tuning is the process of updating a model with additional training so it performs better on a target distribution. That target may be a domain style, a response format, a task family, or a language variant. It is tempting to describe fine-tuning as adding knowledge, but that framing causes bad designs. Weights are a poor place for facts that change weekly, require citations, or differ by tenant.",
          "The best first question is not \"How do we fine-tune?\" but \"What failure are we trying to fix?\" If the model lacks access to current policy documents, retrieval is usually the right lever. If it ignores a stable output contract after strong prompting, fine-tuning may help. If it uses the wrong tone for thousands of support replies, supervised examples can teach style. If it cannot reason over a private database, tool use may be better than training.",
          "Fine-tuning also creates maintenance obligations. You need a dataset, a training recipe, evaluation gates, rollback, model storage, and monitoring for regressions. A prompt can be edited in minutes; a training run may take days to curate, run, review, and deploy. That cost can be worthwhile, but only after the baseline is measured.",
          "For interviews, present fine-tuning as one rung on an adaptation ladder. Start with prompt and schema, add retrieval for mutable knowledge, use tools for exact actions, then consider PEFT or full fine-tuning for stable behavior. This shows judgment rather than enthusiasm for training as a default."
        ],
        "keyTerms": [
          {
            "term": "Fine-tuning",
            "definition": "Additional training that updates model parameters or attached modules to improve behavior on a target task or distribution."
          },
          {
            "term": "Adaptation ladder",
            "definition": "A sequence of increasingly expensive techniques: prompting, retrieval, tools, PEFT, full fine-tuning, continued pretraining, and preference optimization."
          },
          {
            "term": "Mutable knowledge",
            "definition": "Facts that change over time or vary by user, tenant, policy version, or source system."
          }
        ],
        "checkYourself": [
          {
            "prompt": "When should you not fine-tune for knowledge?",
            "reveal": "When facts change often, need citations, depend on permissions, or live in source systems better handled by retrieval or tools."
          },
          {
            "prompt": "What baseline should exist before training?",
            "reveal": "A prompt/RAG/tool baseline with task metrics, cost, latency, and representative failure cases."
          }
        ],
        "callout": {
          "tone": "interview",
          "body": "A strong answer says what fine-tuning is for, then names the cases where retrieval, prompting, or tools are better."
        }
      },
      {
        "id": "full-fine-tuning",
        "heading": "Full fine-tuning updates everything",
        "paragraphs": [
          "Full fine-tuning updates all or most model weights. It gives the optimizer maximum freedom to adapt representations, style, and task behavior, which can be useful for large, stable, high-value domains. It also requires the most memory, careful learning rates, and the strongest regression suite. With small or narrow datasets, full fine-tuning can overwrite general capabilities the base model already had.",
          "The practical risks are not limited to GPU cost. A full fine-tune can change refusal behavior, instruction following, language coverage, and tool-call habits in ways that are hard to isolate. If the training data overrepresents one customer segment, the deployed model may become worse for everyone else. If examples contain hidden PII, licensing issues, or hallucinated assistant responses, those defects become training signal.",
          "Full fine-tuning is most defensible when the dataset is large, clean, stable, and strategically important. Examples include adapting an open-weight model to a regulated in-house writing style, a specialized codebase, or a domain where deployment must be self-hosted. Even then, many teams start with PEFT to test signal before committing to an all-weights run.",
          "Evaluation should compare full fine-tuning against the cheapest adequate alternative. Report task quality, general capability retention, safety behavior, latency, serving cost, and rollback complexity. The winning model is not the one with the highest domain score if it silently breaks general interactions."
        ],
        "keyTerms": [
          {
            "term": "Full fine-tuning",
            "definition": "Training that updates all or most model weights instead of small adapter modules."
          },
          {
            "term": "Catastrophic forgetting",
            "definition": "A regression where training on a narrow distribution damages previously learned general capabilities."
          },
          {
            "term": "Regression suite",
            "definition": "A fixed set of tests that must remain healthy when a model, prompt, dataset, or adapter changes."
          }
        ],
        "checkYourself": [
          {
            "prompt": "Why is full fine-tuning risky on a small dataset?",
            "reveal": "The model can overfit narrow examples and forget or distort general instruction-following and safety behavior."
          },
          {
            "prompt": "What must be evaluated besides domain accuracy?",
            "reveal": "General ability, safety, formatting, latency, cost, privacy, and rollback."
          }
        ],
        "callout": {
          "tone": "warning",
          "body": "Full fine-tuning is powerful but blunt. Without clean data and broad regressions, it can make a model feel specialized by making it less generally useful."
        }
      },
      {
        "id": "lora-qlora-and-adapters",
        "heading": "LoRA, QLoRA, and adapters make adaptation cheaper",
        "paragraphs": [
          "Parameter-efficient fine-tuning, or PEFT, changes a small number of trainable parameters while leaving the base model mostly frozen. LoRA is the most common example: it learns low-rank update matrices for selected linear layers, often attention or MLP projections. At inference, the LoRA weights may be merged into the base weights or loaded as separate adapters. The result is a much smaller training footprint than full fine-tuning.",
          "QLoRA adds memory savings by keeping the base model quantized during training while learning LoRA adapters. This makes adaptation possible on smaller GPU budgets, though quantization choices and optimizer settings still matter. Classic adapters insert small learned modules between layers; prefix and prompt tuning learn continuous vectors that steer the model. The family resemblance is that all of them constrain the amount of trainable change.",
          "The tradeoff is capacity. A low-rank adapter may not be enough for deep domain shift, new languages, or tasks that require broad internal representation changes. Rank, target modules, training examples, and base-model choice all interact. PEFT is not a magic patch for bad data; it simply makes the experiment cheaper and more reversible.",
          "Operationally, adapters are attractive because they can be versioned, swapped, and served per tenant or product line. That flexibility needs discipline: track base model hash, adapter version, tokenizer, training data version, and eval report together. An adapter without its base model and dataset lineage is not reproducible."
        ],
        "keyTerms": [
          {
            "term": "LoRA",
            "definition": "Low-Rank Adaptation, a PEFT method that learns low-rank weight deltas for selected model matrices."
          },
          {
            "term": "QLoRA",
            "definition": "A memory-efficient approach that trains LoRA adapters while keeping the frozen base model quantized."
          },
          {
            "term": "Adapter",
            "definition": "A small trainable module attached to a frozen base model to specialize behavior without updating every weight."
          }
        ],
        "checkYourself": [
          {
            "prompt": "Why does LoRA reduce training cost?",
            "reveal": "It trains small low-rank update matrices instead of every parameter in the base model."
          },
          {
            "prompt": "What metadata belongs with an adapter release?",
            "reveal": "Base model, tokenizer, adapter version, target modules, rank, training data, eval results, and deployment config."
          }
        ]
      },
      {
        "id": "data-quality-dominates",
        "heading": "Data quality dominates the training recipe",
        "paragraphs": [
          "Fine-tuning quality is usually bounded by data quality before it is bounded by clever hyperparameters. A few thousand clean, representative instruction examples can beat millions of noisy chat logs. Good data contains the task distribution you want, the format you expect, the refusal behavior you need, and the edge cases users actually hit. Bad data teaches shortcuts, copied mistakes, and inconsistent style.",
          "Curation starts with provenance and filtering. Remove secrets, PII, unresolved tickets, abusive content, duplicate templates, hallucinated answers, and records whose desired response is unclear. Normalize role structure so system, user, assistant, and tool messages are not blended. Split by user, account, time, or document family to prevent leakage from train into eval.",
          "Synthetic data can help, but only if treated as suspect until proven useful. A stronger teacher model may generate examples that cover rare cases, but it can also inject its own biases, create repetitive phrasing, or accidentally mirror the evaluation set. Human review, deduplication, rubrics, and adversarial examples are more valuable than sheer volume.",
          "Data should be versioned like code. Store dataset manifests, filtering rules, licenses, annotator guidelines, and eval-set membership. When a model improves, you need to know whether the cause was better examples, a new base model, a different rank, or leakage. Without lineage, fine-tuning becomes folklore."
        ],
        "keyTerms": [
          {
            "term": "Instruction dataset",
            "definition": "A set of role-structured examples that pair user tasks with desired assistant responses or tool behavior."
          },
          {
            "term": "Data leakage",
            "definition": "Contamination where evaluation examples or near-duplicates appear in training, inflating measured quality."
          },
          {
            "term": "Dataset lineage",
            "definition": "The recorded origin, filtering, transformation, and version history of training and evaluation data."
          }
        ],
        "checkYourself": [
          {
            "prompt": "Why can small clean data beat large noisy data?",
            "reveal": "Fine-tuning amplifies the training signal; noisy examples teach inconsistent formats, wrong answers, and unwanted behavior."
          },
          {
            "prompt": "How do you reduce leakage?",
            "reveal": "Split by stable units such as user, account, document, or time; deduplicate near-copies; and keep golden eval sets separate."
          }
        ],
        "callout": {
          "tone": "warning",
          "body": "If the dataset is a pile of logs, the model will learn the pile: ambiguity, policy violations, stale answers, and all."
        }
      },
      {
        "id": "evaluation-and-deployment-gates",
        "heading": "Evaluation gates decide whether training helped",
        "paragraphs": [
          "A fine-tuned model should beat a baseline on a frozen evaluation set before it receives traffic. The baseline may be prompt-only, RAG, a smaller model, an older adapter, or a full model. Use task-specific metrics: JSON validity, exact match, semantic rubric scores, pairwise preference, refusal correctness, and human review for ambiguous cases. Open-ended generation still needs measurable expectations.",
          "Regression coverage is as important as target-task gain. Include general instruction following, safety prompts, multilingual slices, long-context cases, tool-call schemas, and examples unrelated to the domain. If the model improves support-ticket tone but becomes worse at refusing unsafe requests, the release is not a win. Adapter-based deployments make rollback easier, but rollback still requires monitoring and a known-good version.",
          "Online deployment should be staged. Shadow traffic can compare outputs without exposing users; canaries can send a small percentage of traffic to the new adapter; interleaving can support human preference collection. Watch latency, token length, parse failures, escalation rate, refusal rate, and complaint categories. A model that writes longer answers may look better to judges while increasing cost and user frustration.",
          "The release artifact should include the model or adapter, config, prompt templates, eval report, known failure modes, and rollback command. Fine-tuning is not complete when training finishes; it is complete when the system can be operated, measured, and reversed."
        ],
        "keyTerms": [
          {
            "term": "Shadow deployment",
            "definition": "Running a new model on real inputs without exposing its outputs to users, so quality can be compared safely."
          },
          {
            "term": "Canary",
            "definition": "A limited production rollout that sends a small slice of traffic to a new version while monitoring risk."
          },
          {
            "term": "Rollback",
            "definition": "A planned path to return to a previous prompt, adapter, or model when metrics or safety checks fail."
          }
        ],
        "checkYourself": [
          {
            "prompt": "What does a fine-tune need to beat?",
            "reveal": "The best practical baseline, not an imaginary unprompted model."
          },
          {
            "prompt": "Name two online metrics for a support-agent fine-tune.",
            "reveal": "Escalation rate, user satisfaction, handle time, refusal correctness, parse failures, latency, cost, and complaint categories are useful examples."
          }
        ],
        "callout": {
          "tone": "interview",
          "body": "Say how you would prove the fine-tune helped: frozen evals, regression slices, staged rollout, and rollback."
        }
      },
      {
        "id": "choosing-the-right-technique",
        "heading": "Choose the least invasive technique that meets the goal",
        "paragraphs": [
          "The decision tree is simple but easy to ignore. If the failure is missing current knowledge, use retrieval. If the failure is exact computation or private state, call a tool. If the failure is inconsistent formatting, try prompting, schemas, examples, and validators first. If the behavior is stable, frequent, and costly to prompt every time, PEFT may be justified. Full fine-tuning is for cases where smaller interventions cannot express the needed adaptation.",
          "Continued pretraining is another option, but it solves a different problem. It exposes the model to raw in-domain text so the language distribution becomes more familiar before instruction tuning. That may help with biomedical, legal, code, or low-resource language corpora. It does not replace supervised examples for task behavior or retrieval for changing facts.",
          "Preference optimization belongs after the model can already perform the task. Pairwise preferred and rejected responses can shape tone, helpfulness, concision, and refusal judgment. If base task accuracy is weak, preference tuning may reward surface style while leaving wrong answers intact. The dataset still needs careful review because preference labels encode product values.",
          "A conservative engineering posture is to train only when the expected benefit survives the full lifecycle cost. That cost includes data work, compute, evaluation, deployment, incident response, and future migrations. The best fine-tuning answer often ends with a smaller, safer system than the one you first imagined."
        ],
        "keyTerms": [
          {
            "term": "Continued pretraining",
            "definition": "Additional self-supervised training on raw domain text before or alongside instruction tuning."
          },
          {
            "term": "Preference optimization",
            "definition": "Training on preferred versus rejected responses to shape behavior after supervised competence exists."
          },
          {
            "term": "Least invasive technique",
            "definition": "The simplest adaptation method that meets quality, cost, latency, and safety requirements."
          }
        ],
        "checkYourself": [
          {
            "prompt": "When is continued pretraining more plausible than SFT alone?",
            "reveal": "When the model has a broad domain-language distribution gap, such as specialized legal, biomedical, code, or low-resource language text."
          },
          {
            "prompt": "Why should preference optimization follow task competence?",
            "reveal": "It ranks behaviors; it cannot reliably create missing task ability from weak or incorrect responses."
          }
        ]
      }
    ],
    "wrapUp": {
      "takeaways": [
        "Fine-tuning is best for stable behavior and formats, not fast-changing facts that need retrieval or tools.",
        "Full fine-tuning offers capacity but raises memory, regression, safety, and rollback risk.",
        "LoRA, QLoRA, and adapters make specialization cheaper, modular, and easier to operate.",
        "Clean data, leakage control, and lineage usually matter more than small hyperparameter tweaks.",
        "Deploy fine-tunes only behind frozen evals, regression suites, staged rollout, and rollback."
      ],
      "nextSteps": [
        "For any proposed fine-tune, write the failure statement and the baseline it must beat.",
        "Sketch a release checklist that includes data lineage, eval slices, adapter metadata, and rollback."
      ]
    }
  },
  "llms-and-nlp/embeddings-and-vector-search": {
    "title": "Chapter: Embeddings and vector search",
    "readingTime": "65-80 min",
    "premise": "A production-oriented chapter on dense representations, cosine versus dot product, ANN and HNSW indexes, chunking effects, hybrid sparse+dense retrieval, and evaluation for semantic search and RAG.",
    "parts": [
      {
        "id": "embeddings-map-meaning-to-geometry",
        "heading": "Embeddings map text into useful geometry",
        "paragraphs": [
          "An embedding model converts text, images, code, or other inputs into vectors so similarity can be computed with math. For text search, the hope is that related meanings occupy nearby regions even when the words differ. A query about \"canceling an account\" should find a document about \"closing a subscription\" because the embedding model learned paraphrase relationships. This is the core value dense retrieval adds beyond keyword matching.",
          "The geometry is learned, not universal. A model trained for short sentence similarity may not understand source code, legal clauses, product SKUs, or multilingual support tickets equally well. Some models are symmetric, where query and document are embedded the same way; others are asymmetric and expect prefixes or different encoders for questions and passages. Using the wrong convention can quietly damage recall.",
          "Embeddings also compress information. A paragraph becomes a fixed-length vector, so details compete for representation. Long, mixed-topic chunks can blur separate ideas; tiny fragments can lose context. This is why embedding quality and chunking strategy cannot be evaluated separately. The vector represents the text unit you feed it, not the document you wish it represented.",
          "A production team should treat an embedder as a versioned model with domain-specific evaluation. Leaderboards are useful for discovery, but labeled query-document pairs from your corpus decide whether the embedding space works for your users. Measure before and after every embedder, chunker, or normalization change."
        ],
        "keyTerms": [
          {
            "term": "Embedding",
            "definition": "A numeric vector representation intended to preserve useful similarity relationships for retrieval or comparison."
          },
          {
            "term": "Dense retrieval",
            "definition": "Retrieval that ranks documents by vector similarity rather than exact keyword overlap."
          },
          {
            "term": "Asymmetric embedding",
            "definition": "An embedding setup where queries and documents use different prompts, prefixes, or encoders."
          }
        ],
        "checkYourself": [
          {
            "prompt": "Why do embeddings help paraphrase search?",
            "reveal": "They place semantically related text near each other even when exact words differ."
          },
          {
            "prompt": "Why can a leaderboard model fail in your product?",
            "reveal": "Domain language, query types, document structure, and chunking may differ from benchmark data."
          }
        ],
        "callout": {
          "tone": "interview",
          "body": "Define embeddings as learned geometry, then immediately mention domain evaluation. That prevents the answer from sounding magical."
        }
      },
      {
        "id": "cosine-dot-and-normalization",
        "heading": "Cosine and dot product answer different questions",
        "paragraphs": [
          "Cosine similarity measures the angle between vectors by dividing their dot product by both vector norms. It asks whether two vectors point in a similar direction, largely ignoring magnitude. Dot product, also called inner product, combines direction and magnitude. If vector norms vary meaningfully, dot product can prefer high-norm vectors even when their angle is less aligned.",
          "Many retrieval stacks make cosine search equivalent to dot product by normalizing all vectors to unit length. After normalization, the dot product of two vectors is their cosine similarity. This is convenient because vector databases and ANN libraries often optimize inner-product search. The danger is mismatch: if your index assumes normalized vectors and your ingestion path forgets to normalize, rankings can drift badly.",
          "Euclidean distance is another option, but it also interacts with norms. For unit-normalized vectors, cosine, dot product, and L2 distance are closely related rankings. For unnormalized vectors, they can disagree. That disagreement is not a minor implementation detail; it changes which chunks enter the LLM context and which facts users see.",
          "The safest practice is to document the metric at every layer: embedding model recommendation, ingestion transform, index configuration, query transform, and evaluation code. Add simple checks for norm distribution and a known-neighbor canary set. If a deployment suddenly returns irrelevant high-norm chunks, the bug may be metric mismatch rather than model quality."
        ],
        "keyTerms": [
          {
            "term": "Cosine similarity",
            "definition": "The normalized dot product of two vectors, measuring angular similarity independent of vector length."
          },
          {
            "term": "Dot product",
            "definition": "A similarity score that combines vector direction and magnitude unless vectors are normalized."
          },
          {
            "term": "Unit normalization",
            "definition": "Scaling vectors so their L2 norm equals one, often making inner product equivalent to cosine similarity."
          }
        ],
        "checkYourself": [
          {
            "prompt": "When are cosine and dot product rankings equivalent?",
            "reveal": "When all compared vectors are normalized to unit length."
          },
          {
            "prompt": "What simple metric should you monitor after embedding ingestion?",
            "reveal": "Vector norm distribution, along with known-neighbor retrieval checks."
          }
        ],
        "callout": {
          "tone": "warning",
          "body": "Metric mismatch is a silent relevance bug. The system still returns results, just the wrong ones."
        }
      },
      {
        "id": "ann-and-hnsw-at-scale",
        "heading": "ANN and HNSW trade exactness for speed",
        "paragraphs": [
          "Exact vector search compares a query against every vector. That is understandable and often sufficient for small corpora, but it becomes expensive as collections reach millions or billions of chunks. Approximate nearest neighbor search, or ANN, builds an index that returns very close neighbors much faster while accepting that it may miss the exact best vector. The engineering question becomes how much recall you can trade for latency and memory savings.",
          "HNSW, hierarchical navigable small world graphs, is one of the dominant ANN structures. It organizes vectors into a multi-layer graph where search jumps through long-range links at upper layers and refines through dense links near the bottom. Parameters such as construction connectivity and search breadth control the recall-latency-memory curve. Higher recall usually costs more memory, build time, or query work.",
          "ANN choices interact with filters. A tenant, ACL, language, freshness, or product-version filter can shrink the valid candidate set. If the index retrieves globally then filters after the fact, the relevant allowed chunk may never appear in the shortlist. Prefiltering, partitioned indexes, or filter-aware ANN support become correctness requirements in multitenant systems.",
          "Evaluation should compare ANN results to an exact-search baseline on a sample. Report Recall@k, latency percentiles, memory footprint, build time, and filtered-query slices. Tuning an ANN index on synthetic random vectors is weak evidence; tune on your actual embedding distribution and query workload."
        ],
        "keyTerms": [
          {
            "term": "ANN",
            "definition": "Approximate nearest neighbor search, which returns near neighbors faster than exact search by accepting tunable recall loss."
          },
          {
            "term": "HNSW",
            "definition": "A graph-based ANN index that uses hierarchical navigable links to search high-dimensional vectors efficiently."
          },
          {
            "term": "Recall@k",
            "definition": "The fraction of relevant items found within the top k retrieved results."
          }
        ],
        "checkYourself": [
          {
            "prompt": "Why not run a cross-encoder or exact scan over every document?",
            "reveal": "At large scale it is too slow or expensive; ANN and staged retrieval create feasible candidate sets."
          },
          {
            "prompt": "Why do filters complicate ANN?",
            "reveal": "Post-filtering can remove retrieved candidates and leave out relevant allowed documents that were never searched under the filter."
          }
        ]
      },
      {
        "id": "chunking-changes-the-search-problem",
        "heading": "Chunking changes what the index can find",
        "paragraphs": [
          "A vector index searches units, not documents. If you embed entire manuals, the vector may be too broad to match a specific troubleshooting step. If you embed tiny sentences, the vector may match a phrase but lack enough context for generation. Chunking defines the retrieval object, so it directly shapes recall, precision, cost, and answer quality.",
          "Structure-aware chunking usually beats blind character windows. Headings, sections, paragraphs, functions, tables, and list boundaries often carry meaning. Overlap can catch boundary-spanning answers, but it increases storage and duplicate retrieval. For code, split by functions and classes; for policy docs, preserve section hierarchy; for tables, include headers so cells remain interpretable.",
          "Parent-child chunking solves a common tension. You retrieve small child chunks for precise matching, then expand to a parent section for generation context. Hierarchical retrieval can climb from paragraph to section to document, letting the system include enough evidence without losing first-stage precision. This is especially useful in RAG systems where answer synthesis needs more context than the best-matching sentence.",
          "Every chunk should carry metadata: source ID, section title, hierarchy path, timestamps, permissions, language, chunker version, and embedder version. When retrieval fails, metadata lets you determine whether the issue was parsing, chunking, indexing, filtering, or ranking. Without it, search debugging becomes guesswork."
        ],
        "keyTerms": [
          {
            "term": "Chunk",
            "definition": "The text unit embedded and indexed for retrieval, such as a paragraph, section, code block, or table fragment."
          },
          {
            "term": "Parent-child chunking",
            "definition": "A strategy that retrieves small precise child chunks and expands to larger parent context for generation."
          },
          {
            "term": "Chunker version",
            "definition": "A recorded identifier for the splitting logic used to create indexed chunks."
          }
        ],
        "checkYourself": [
          {
            "prompt": "Why can small chunks improve recall but hurt generation?",
            "reveal": "They match precise phrases but may omit surrounding context needed to answer faithfully."
          },
          {
            "prompt": "What metadata helps debug chunking changes?",
            "reveal": "Source, hierarchy path, timestamps, permissions, chunker version, embedder version, and document type."
          }
        ],
        "callout": {
          "tone": "interview",
          "body": "When asked about vector search, mention chunking before vendor choice. Retrieval quality often moves more from chunk design than database selection."
        }
      },
      {
        "id": "hybrid-sparse-and-dense-retrieval",
        "heading": "Hybrid sparse+dense retrieval covers more query types",
        "paragraphs": [
          "Dense vectors are strong for paraphrase, but they often blur exact identifiers. Error codes, API names, statute numbers, SKUs, log messages, and proper nouns may be decisive even when their semantic neighborhood is broad. Sparse retrieval methods such as BM25 remain excellent at exact token matching and term rarity. Production search often needs both.",
          "Hybrid retrieval runs sparse and dense searches in parallel, then combines the ranked lists. Reciprocal Rank Fusion is popular because it uses ranks rather than incompatible raw scores. BM25 scores are unbounded and cosine scores are bounded; directly averaging them is fragile. RRF with k=60 is a robust default: each document receives a contribution of 1/(k + rank) from every list where it appears.",
          "Hybrid search improves first-stage recall, but it does not solve final precision by itself. A cross-encoder reranker can score each query-document pair jointly after the shortlist is small enough. The usual funnel is sparse top 50-100 plus dense top 50-100, RRF fusion, optional deduplication, cross-encoder rerank on roughly the top 30-50, then top 5-10 passages for the LLM.",
          "The important production idea is staged computation. Fast indexes cast a wide net; rank fusion preserves complementary signals; rerankers spend expensive attention only where it matters. If the right document never appears in the first-stage shortlist, a reranker cannot recover it. Measure recall before blaming generation."
        ],
        "keyTerms": [
          {
            "term": "BM25",
            "definition": "A lexical ranking function that scores documents using term frequency, inverse document frequency, and document length normalization."
          },
          {
            "term": "Reciprocal Rank Fusion",
            "definition": "A rank-fusion method that combines multiple result lists by summing 1/(k + rank), commonly with k=60."
          },
          {
            "term": "Cross-encoder reranker",
            "definition": "A model that scores a query and candidate document together, improving precision on a small shortlist."
          }
        ],
        "checkYourself": [
          {
            "prompt": "Why is RRF useful for BM25 plus dense search?",
            "reveal": "It fuses ranks instead of incompatible score scales, so BM25 and cosine scores do not need brittle normalization."
          },
          {
            "prompt": "What can a reranker not fix?",
            "reveal": "It cannot recover a relevant document that first-stage retrieval failed to include in its candidate set."
          }
        ],
        "callout": {
          "tone": "warning",
          "body": "Dense-only retrieval often fails on the queries users care about most: codes, names, IDs, and exact phrases."
        }
      },
      {
        "id": "evaluation-versioning-and-migration",
        "heading": "Evaluate and version the whole retrieval stack",
        "paragraphs": [
          "Vector search quality should be measured with labeled query-document pairs. Recall@k tells whether relevant chunks appear in the candidate set; MRR and nDCG tell whether they appear high enough to be useful. Slice metrics by query type: exact identifier, conceptual how-to, troubleshooting, policy, multilingual, and long-tail terms. A single aggregate score can hide the slice your customers actually use.",
          "Embedding migrations are releases, not configuration edits. A new embedder changes the vector space, so old vectors and new query vectors may not be comparable. Reindex or dual-index, backfill by shard or tenant, compare old and new retrieval on a frozen golden set, then cut traffic gradually. Store embedder ID, dimension, normalization, chunker version, and index build ID in metadata.",
          "Operational monitoring should include empty-result rate, low-score rate, top-click position, query reformulation, latency, index freshness, and permission-filter behavior. For RAG, connect retrieval metrics to answer metrics: faithfulness, citation validity, and user correction rate. A search system can have high click-through but still feed a generator stale or unauthorized context if filters are wrong.",
          "The mature view is that embeddings, chunking, ANN settings, sparse retrieval, fusion, reranking, and prompt packing form one retrieval product. Changing any layer changes user-visible answers. Version and evaluate them together, or you will not know why relevance moved."
        ],
        "keyTerms": [
          {
            "term": "nDCG",
            "definition": "Normalized discounted cumulative gain, a ranking metric that rewards placing more relevant documents higher in the results."
          },
          {
            "term": "Dual index",
            "definition": "Running old and new indexes side by side during an embedding or chunking migration."
          },
          {
            "term": "Golden set",
            "definition": "A stable set of representative queries and expected relevant documents used to compare retrieval changes."
          }
        ],
        "checkYourself": [
          {
            "prompt": "Why must embedding upgrades usually reindex documents?",
            "reveal": "A new embedder creates a different vector space, so old document vectors are not reliably comparable to new query vectors."
          },
          {
            "prompt": "Name three retrieval monitoring signals.",
            "reveal": "Empty-result rate, low top-score rate, Recall@k on canaries, click position, reformulation rate, latency, freshness, and filter failures are examples."
          }
        ]
      }
    ],
    "wrapUp": {
      "takeaways": [
        "Embeddings create learned geometry that must be evaluated on the product's own corpus and query types.",
        "Cosine, dot product, and normalization choices must match across embedding, indexing, querying, and evaluation.",
        "ANN and HNSW provide scale by trading exactness for tunable recall, latency, and memory.",
        "Chunking, hierarchy, and metadata define what retrieval can find and what generation can cite.",
        "Hybrid BM25+dense retrieval with RRF k=60 and reranking is a strong production default for mixed query workloads."
      ],
      "nextSteps": [
        {
          "label": "Practice vector search in the Python lab",
          "href": "/module/llms-and-nlp/lesson/embeddings-and-vector-search#ml-practice-lab"
        },
        {
          "label": "Continue to the RAG systems Learn chapter",
          "href": "/module/prompt-engineering-and-rag/lesson/rag-systems?learn=1"
        },
        "Document metric, normalization, chunker version, embedder version, and index build ID for any search release."
      ]
    }
  }
};
