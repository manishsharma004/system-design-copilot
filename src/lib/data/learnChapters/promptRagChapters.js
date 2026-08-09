/** @type {Record<string, import('../learnChapters.js').LessonLearnChapter>} */
export const promptRagChapters = {
  "prompt-engineering-and-rag/prompt-engineering": {
    "title": "Chapter: Prompt engineering",
    "readingTime": "65-80 min",
    "premise": "A long-form chapter on designing prompts as tested interfaces: role hierarchy, few-shot examples, structured outputs, JSON schema validation, decoding controls, evaluation, and failure modes.",
    "parts": [
      {
        "id": "prompts-as-interfaces",
        "heading": "Prompts are interfaces, not magic wording",
        "paragraphs": [
          "A prompt is the interface between product intent and a probabilistic model. It defines roles, task instructions, input data, examples, tools, and output contracts. The goal is not to discover a perfect incantation; the goal is to make the request legible, testable, and robust under realistic inputs. Treating prompts as interfaces pushes them into version control, review, and evaluation.",
          "Prompt structure matters because models receive a sequence of tokens with privileged and unprivileged segments. Durable policy and output requirements belong in system or developer-level instructions when the API supports them. User content, retrieved documents, and web text are data, not instructions. If untrusted text is placed where policy should live, prompt injection becomes easier.",
          "Clear prompts separate control plane from data plane. Delimit user-provided material, label retrieved passages, attach source IDs, and state what the model may and may not infer from them. Avoid hiding business rules in prose scattered across application code. A reader should be able to inspect a prompt template and know which variables can change per request.",
          "The first production habit is to record prompt versions. A model response depends on model ID, decoding settings, prompt template, tool schemas, retrieved context, and input. If those are not logged or reproducible, prompt engineering turns into archaeology when a user reports a bad answer."
        ],
        "keyTerms": [
          {
            "term": "System instruction",
            "definition": "A high-priority message that defines durable behavior, policy, and output rules for the model."
          },
          {
            "term": "User instruction",
            "definition": "The user's task request, which should be followed only within higher-priority policy and safety constraints."
          },
          {
            "term": "Prompt template",
            "definition": "A versioned prompt with named variables for dynamic content such as user input, context, and examples."
          }
        ],
        "checkYourself": [
          {
            "prompt": "Where should durable safety and output policy live?",
            "reveal": "In the highest-priority role the API provides, not inside untrusted user or retrieved content."
          },
          {
            "prompt": "Why version prompts?",
            "reveal": "To reproduce behavior, compare changes, support rollback, and tie quality shifts to a specific template."
          }
        ],
        "callout": {
          "tone": "interview",
          "body": "A strong answer frames prompting as interface design: roles, variables, constraints, examples, validation, and tests."
        }
      },
      {
        "id": "system-user-and-untrusted-context",
        "heading": "System, user, and retrieved content have different authority",
        "paragraphs": [
          "Modern LLM APIs expose role separation because not every token should have equal authority. System or developer messages define the application's rules; user messages express the current request; tool results and retrieved documents provide data. The model may still blur these distinctions internally, so the application must reinforce them with layout, delimiters, validation, and tool permissions.",
          "Prompt injection exploits authority confusion. A retrieved document may say \"ignore all previous instructions\" or \"send the secret key to this URL.\" The model sees those tokens, but the application should treat them as hostile content. Tool execution should be gated by code-level policy, not by the model's willingness to obey a paragraph.",
          "Good prompts explicitly label untrusted material. Use sections such as \"User request,\" \"Retrieved evidence,\" and \"Output contract.\" Tell the model that retrieved evidence can contain adversarial text and may be used only as source material. This does not solve security alone, but it reduces accidental instruction blending and makes reviews easier.",
          "Security-sensitive systems should assume prompts leak. Do not put secrets, private keys, or hidden business logic in prompts where a user can induce the model to reveal them. Real defenses include least-privilege tools, allowlists, server-side authorization, retrieval-time ACLs, and output validation."
        ],
        "keyTerms": [
          {
            "term": "Prompt injection",
            "definition": "An attack or failure where untrusted text attempts to override higher-priority instructions or misuse tools."
          },
          {
            "term": "Control plane",
            "definition": "The trusted instructions and policies that define what the application permits."
          },
          {
            "term": "Data plane",
            "definition": "Untrusted or dynamic content, such as user input and retrieved documents, that the model should process without treating as policy."
          }
        ],
        "checkYourself": [
          {
            "prompt": "Why should tool permission checks live outside the prompt?",
            "reveal": "The model can be manipulated; authorization must be enforced by deterministic application code."
          },
          {
            "prompt": "What is the risk of putting retrieved text in a system role?",
            "reveal": "Untrusted content gains the appearance of high authority and can override or confuse real policy."
          }
        ],
        "callout": {
          "tone": "warning",
          "body": "Prompt injection is not fixed by saying 'ignore malicious instructions.' Treat untrusted text as data and enforce policy in code."
        }
      },
      {
        "id": "few-shot-and-task-demonstrations",
        "heading": "Few-shot examples teach behavior more concretely than adjectives",
        "paragraphs": [
          "Few-shot prompting provides examples of inputs and desired outputs inside the prompt. It is effective because examples demonstrate boundaries, format, edge cases, and tone in a way vague instructions cannot. \"Be concise\" means different things to different models and tasks; two concise examples define the expectation more precisely.",
          "Examples should be representative, minimal, and diverse. Include normal cases, edge cases, and at least one negative or refusal case when the task requires it. For extraction, show missing fields and enum values. For classification, include confusing boundary examples. For RAG, show an answer that refuses because evidence is absent.",
          "The cost is prompt length and possible overfitting to examples. Too many examples can crowd out user input or retrieved evidence. Examples that contain stale policies or rare wording can steer the model in unwanted directions. Maintain examples like tests: review them, version them, and remove ones that no longer represent product behavior.",
          "Few-shot prompting also interacts with temperature and schema. For deterministic tasks, examples plus low temperature plus validation is stronger than examples alone. For creative tasks, examples can set style while still allowing variation. The right prompt design depends on whether the output is consumed by humans, code, or another model step."
        ],
        "keyTerms": [
          {
            "term": "Few-shot prompting",
            "definition": "Including a small number of input-output examples in the prompt to demonstrate desired behavior."
          },
          {
            "term": "Boundary example",
            "definition": "An example near a decision boundary that teaches how to handle ambiguous or edge cases."
          },
          {
            "term": "Refusal example",
            "definition": "An example showing when the model should decline or ask for clarification instead of answering."
          }
        ],
        "checkYourself": [
          {
            "prompt": "Why can examples beat prose instructions?",
            "reveal": "They demonstrate exact format and edge handling rather than relying on ambiguous adjectives."
          },
          {
            "prompt": "What is one downside of few-shot prompting?",
            "reveal": "It consumes context and can steer behavior too strongly if examples are stale, biased, or unrepresentative."
          }
        ]
      },
      {
        "id": "structured-outputs-json-schema-and-validation",
        "heading": "Structured outputs need contracts and validators",
        "paragraphs": [
          "When software consumes a model response, free-form prose is a liability. The prompt should define a schema, allowed enum values, required fields, and how to represent uncertainty or missing data. API features such as JSON mode, function calling, tool schemas, constrained decoding, or grammar-guided generation can improve compliance. They still do not remove the need for validation.",
          "A robust structured-output loop has four parts: ask for the schema, parse strictly, validate semantics, and retry or fail safely. Parsing catches malformed JSON; schema validation catches missing fields and wrong types; semantic validation catches invalid dates, impossible totals, unsupported citations, or unsafe tool arguments. The retry prompt should include the validation error, not a vague request to \"try again.\"",
          "Keep schemas as small as the task allows. Deeply nested objects with many optional fields invite hallucination and make partial correctness hard to reason about. If a workflow needs multiple objects, split it into steps with separate validators. This is especially important for tool calls, where a malformed argument can trigger expensive or dangerous side effects.",
          "Structured prompting should be tested without live model calls where possible. Unit-test parsers against malformed strings, extra keys, prompt-injection text, invalid enums, and empty outputs. Integration tests can then measure how often the model satisfies the contract under realistic cases. Reliability comes from the contract and validator together, not the prompt alone."
        ],
        "keyTerms": [
          {
            "term": "JSON schema",
            "definition": "A formal description of expected JSON fields, types, required values, and constraints."
          },
          {
            "term": "Semantic validation",
            "definition": "Checks that parsed values make sense for the business rule, not just that they match a type."
          },
          {
            "term": "Repair loop",
            "definition": "A retry process that asks the model to fix output using specific validation errors."
          }
        ],
        "checkYourself": [
          {
            "prompt": "What are the layers of structured-output validation?",
            "reveal": "Strict parse, schema validation, semantic validation, then retry or safe fallback."
          },
          {
            "prompt": "Why avoid giant optional schemas?",
            "reveal": "They increase ambiguity, hallucinated fields, and downstream complexity."
          }
        ],
        "callout": {
          "tone": "warning",
          "body": "Never let machine-consumed model output bypass parsing and validation because a prompt said 'return valid JSON.'"
        }
      },
      {
        "id": "evaluation-and-failure-modes",
        "heading": "Prompt changes need evaluation, not taste tests",
        "paragraphs": [
          "Prompt engineering without an eval set is editing by anecdote. A single impressive example can hide failures on language, length, adversarial inputs, edge cases, and malformed user requests. Build a golden set of representative cases with expected properties before iterating heavily. The set can include exact answers, regex checks, schema validity, rubric scores, citation checks, and human review labels.",
          "Failure modes are predictable. The model may ignore a low-priority instruction, overfit to examples, return invalid JSON, reveal hidden prompt content, follow injected document instructions, cite nonexistent sources, answer when it should refuse, or spend too many tokens. Each failure deserves a metric or test. A prompt is not reliable because it sounds clear to its author.",
          "Evaluate by slice, not only aggregate score. Separate short and long inputs, English and non-English, mobile and desktop flows, high-risk and low-risk intents, empty context and rich context. Prompt changes often improve the common case while damaging a rare but important slice. Keep old prompt versions so regressions can be reproduced.",
          "Finally, track cost and latency. A prompt that adds long examples, hidden reasoning instructions, and verbose output may improve a rubric while failing product economics. Quality per dollar and quality per second are legitimate acceptance criteria for prompt work."
        ],
        "keyTerms": [
          {
            "term": "Golden set",
            "definition": "A stable collection of representative inputs and expected checks used to compare prompt versions."
          },
          {
            "term": "Slice metric",
            "definition": "A metric computed on a meaningful subset of cases, such as language, risk level, or document type."
          },
          {
            "term": "Prompt regression",
            "definition": "A quality, safety, cost, or latency decline caused by a prompt change."
          }
        ],
        "checkYourself": [
          {
            "prompt": "Why is one hand-picked example not enough?",
            "reveal": "It cannot reveal regressions across realistic slices, adversarial cases, or cost and latency constraints."
          },
          {
            "prompt": "Name three prompt failure modes.",
            "reveal": "Invalid JSON, prompt injection, ignored instructions, unsupported citations, overlong answers, wrong refusal behavior, and example overfitting are examples."
          }
        ],
        "callout": {
          "tone": "interview",
          "body": "When asked how you improve a prompt, start with the eval harness, not with clever wording."
        }
      },
      {
        "id": "operating-prompts-in-production",
        "heading": "Production prompts need ownership and change control",
        "paragraphs": [
          "Prompts are product artifacts. They deserve owners, reviews, changelogs, rollback, and release notes. A prompt can change legal posture, safety behavior, cost, latency, and user trust as much as application code can. Store templates near tests or in a prompt registry that preserves versions and associated eval results.",
          "A prompt registry is useful when many services, models, or teams share templates. It can record model compatibility, variables, schema, example set, approved use cases, and deployment status. The registry should not become a place where business logic hides from code review. The application still needs typed interfaces and explicit validation around model calls.",
          "Observability closes the loop. Log prompt version, model ID, token counts, validation result, retry count, refusal reason, and selected examples or retrieved IDs. Redact private content and avoid storing secrets. Without these fields, incidents become impossible to triage because every layer looks like \"the model was weird.\"",
          "The mature prompt-engineering workflow is iterative but disciplined: define the task, design the interface, add examples where they teach, enforce structure where code consumes output, evaluate across slices, ship behind monitoring, and roll back when metrics move the wrong way."
        ],
        "keyTerms": [
          {
            "term": "Prompt registry",
            "definition": "A system or repository that stores prompt templates, versions, metadata, approvals, and evaluation results."
          },
          {
            "term": "Prompt owner",
            "definition": "The person or team accountable for a prompt's behavior, tests, and release decisions."
          },
          {
            "term": "Prompt observability",
            "definition": "Logging and tracing that connects model outputs to prompt version, model version, context, validation, and cost."
          }
        ],
        "checkYourself": [
          {
            "prompt": "What should a prompt registry record?",
            "reveal": "Template version, variables, schemas, examples, model compatibility, eval results, approvals, and deployment status."
          },
          {
            "prompt": "Why log prompt version with failures?",
            "reveal": "It enables reproduction, rollback, and comparison across prompt releases."
          }
        ]
      }
    ],
    "wrapUp": {
      "takeaways": [
        "Prompts are versioned interfaces with roles, variables, examples, constraints, and output contracts.",
        "System, user, tool, and retrieved content have different authority and must be separated for safety.",
        "Few-shot examples teach concrete behavior but consume context and need maintenance.",
        "Structured outputs require schemas, strict parsing, semantic validation, and safe repair or fallback.",
        "Prompt work should be evaluated by slices with cost, latency, safety, and rollback in view."
      ],
      "nextSteps": [
        "Take one prompt and rewrite it as a template with named variables, authority-separated sections, and a validation plan.",
        "Create five golden cases that would catch injection, invalid JSON, over-refusal, and cost regressions."
      ]
    }
  },
  "prompt-engineering-and-rag/rag-systems": {
    "title": "Chapter: RAG systems",
    "readingTime": "75-90 min",
    "premise": "A researched 2026 production-RAG chapter covering hierarchical and parent-child chunking, hybrid BM25+dense retrieval with RRF k=60, cross-encoder rerank funnels, RAGAS metrics, and golden-set evaluation.",
    "parts": [
      {
        "id": "rag-is-a-pipeline",
        "heading": "RAG is a pipeline, not a prompt trick",
        "paragraphs": [
          "Retrieval-augmented generation connects a generator to external evidence at request time. The basic flow is ingest documents, parse and clean them, chunk them, attach metadata, embed and index them, retrieve candidates for a user query, rerank and pack context, then ask the model to answer with citations or refusal. Every stage can fail independently. Treating RAG as \"put docs in the prompt\" hides the work that determines reliability.",
          "The reason RAG exists is that model weights are not the right storage layer for changing, private, permissioned, or citation-required facts. Retrieval can reflect current documents, enforce access control, and expose sources. The generator then turns evidence into a user-facing answer. If retrieval misses the evidence, the generator is being asked to improvise.",
          "A production design separates ingest-time and query-time paths. Ingest handles parsing PDFs, HTML, markdown, tickets, tables, code, and metadata. Query time handles rewriting, retrieval, filtering, reranking, context assembly, generation, and postchecks. This separation lets teams debug whether an answer failed because a document was never indexed, retrieved poorly, packed incorrectly, or ignored by the model.",
          "The strongest RAG answers include refusal policy. When evidence is absent, contradictory, stale, or unauthorized, the system should say so or ask a clarifying question. RAG improves grounding only when the application gives the model a reason and a mechanism to stay inside retrieved evidence."
        ],
        "keyTerms": [
          {
            "term": "RAG",
            "definition": "Retrieval-augmented generation, a pattern where external evidence is retrieved and supplied to a generator at answer time."
          },
          {
            "term": "Ingest path",
            "definition": "The offline or background pipeline that parses, chunks, enriches, embeds, and indexes source documents."
          },
          {
            "term": "Query path",
            "definition": "The online pipeline that retrieves, reranks, packs context, generates, cites, and validates an answer."
          }
        ],
        "checkYourself": [
          {
            "prompt": "Why is RAG preferable to fine-tuning for changing policies?",
            "reveal": "Retrieval can update, cite, and permission documents without retraining weights."
          },
          {
            "prompt": "Name four RAG pipeline stages.",
            "reveal": "Ingest, parse, chunk, metadata, embed, index, retrieve, filter, rerank, pack, generate, cite, validate, and monitor are valid stages."
          }
        ],
        "callout": {
          "tone": "interview",
          "body": "Draw the pipeline before naming tools. Interviewers want failure attribution, not a library list."
        },
        "mermaid": {
          "title": "RAG ingest and query paths",
          "caption": "Debug ingest vs query failures separately.",
          "code": "flowchart LR\n  subgraph ingest [Ingest]\n    Docs[Documents] --> Parse --> Chunk --> Embed --> Index\n  end\n  subgraph query [Query]\n    Q[Question] --> Retrieve --> Rerank --> Pack --> Generate\n  end\n  Index --> Retrieve"
        }
      },
      {
        "id": "hierarchical-parent-child-chunking",
        "heading": "Hierarchical and parent-child chunking preserve both precision and context",
        "paragraphs": [
          "Chunking is one of the highest-leverage RAG decisions. A chunk is the unit retrieved by the search system, but it is also the evidence unit shown to the model. Large chunks preserve context but retrieve imprecisely; small chunks retrieve precisely but may not contain enough surrounding explanation. Blind 500-token windows are easy, but they often cut through headings, tables, code, and lists that carry meaning.",
          "Production RAG in 2026 often uses hierarchical or parent-child chunking. Child chunks are small passages optimized for retrieval, while parent chunks represent surrounding sections, pages, functions, or document nodes. The retriever matches child chunks, then the context assembler expands to parent text or neighboring siblings for generation. This balances first-stage precision with answer-time completeness.",
          "Hierarchy also supports better evaluation and debugging. If a child chunk retrieves but the answer needs the parent section, the system can log both IDs and measure whether expansion helped. If a parent is too broad, context precision falls; if children are too tiny, context recall and faithfulness suffer. Metadata should include document path, parent ID, child ID, section heading, timestamps, ACL labels, and chunker version.",
          "Chunking must be tuned by corpus type. API docs need function signatures and examples kept together; policies need section numbers and exceptions; tables need headers repeated; tickets need conversation turns and resolution status. The right chunking strategy is the one that improves retrieval and grounded answers on a golden set, not the one with a fashionable token size."
        ],
        "keyTerms": [
          {
            "term": "Parent-child chunking",
            "definition": "Retrieving small child chunks and expanding to larger parent context for answer generation."
          },
          {
            "term": "Hierarchical retrieval",
            "definition": "Retrieval that uses document structure such as sections, pages, headings, or graph nodes across multiple levels."
          },
          {
            "term": "Context expansion",
            "definition": "Adding parent, sibling, or neighboring text around a retrieved chunk before generation."
          }
        ],
        "checkYourself": [
          {
            "prompt": "Why retrieve child chunks but generate with parent context?",
            "reveal": "Child chunks improve precise matching; parent context supplies enough surrounding evidence for faithful answers."
          },
          {
            "prompt": "What chunk metadata is essential for production RAG?",
            "reveal": "Source, parent ID, child ID, hierarchy path, timestamps, permissions, document type, embedder version, and chunker version."
          }
        ],
        "callout": {
          "tone": "warning",
          "body": "Chunking is not preprocessing trivia. Bad chunks can make the correct answer unretrievable before the model ever runs."
        }
      },
      {
        "id": "hybrid-retrieval-rrf-and-rerank-funnel",
        "heading": "Hybrid BM25+dense retrieval with RRF k=60 is the 2026 baseline",
        "paragraphs": [
          "Dense retrieval finds paraphrases; BM25 finds exact terms. Real production traffic contains both. A customer may ask conceptually about account closure, then ask for error code E11000, product SKU A17-B, or a statute number. Dense-only retrieval can miss exact identifiers; keyword-only retrieval can miss semantic matches. Hybrid retrieval runs both branches and preserves their complementary strengths.",
          "Reciprocal Rank Fusion is the common first fusion step because it avoids score normalization. BM25 scores and cosine similarities live on different scales, so averaging them directly is brittle. RRF converts each rank into 1/(k + rank) and sums contributions across lists. The conventional default k=60 is robust enough to start with; tune it only after you have enough labeled queries to avoid chasing noise.",
          "The production funnel is staged. Retrieve top 50-100 candidates from BM25 and top 50-100 from dense ANN, fuse with RRF k=60, deduplicate near-identical chunks, then send a shortlist, often top 30-50, to a cross-encoder reranker. The cross-encoder sees the query and candidate together, so it can judge relevance more precisely than separate embeddings. After reranking, pass the top 5-10 passages to the LLM with source metadata.",
          "This funnel makes latency affordable. Sparse and dense retrieval are fast and parallelizable; reranking is slower but limited to a shortlist; generation usually dominates total latency. The key invariant is first-stage recall. If the relevant evidence is not in the fused candidate set, no reranker or prompt can reliably recover it."
        ],
        "keyTerms": [
          {
            "term": "Hybrid retrieval",
            "definition": "Combining sparse lexical retrieval such as BM25 with dense vector retrieval for broader recall."
          },
          {
            "term": "RRF k=60",
            "definition": "A common Reciprocal Rank Fusion setting where each rank contributes 1/(60 + rank) to the fused score."
          },
          {
            "term": "Rerank funnel",
            "definition": "A staged retrieval design where cheap retrievers produce candidates and an expensive reranker improves precision on a shortlist."
          }
        ],
        "checkYourself": [
          {
            "prompt": "Why does RRF fit BM25 plus dense retrieval?",
            "reveal": "It fuses ranks instead of incompatible raw scores, making the combination robust with little tuning."
          },
          {
            "prompt": "Where does a cross-encoder belong in the funnel?",
            "reveal": "After first-stage retrieval and fusion, on a small candidate set, before final context packing."
          }
        ],
        "callout": {
          "tone": "interview",
          "body": "The 2026 production answer: BM25 plus dense, RRF k=60, cross-encoder rerank, top passages with citations, then grounded generation."
        }
      },
      {
        "id": "context-assembly-citations-and-faithfulness",
        "heading": "Context assembly turns retrieval into grounded answers",
        "paragraphs": [
          "After reranking, the system still has to assemble prompt context. This means choosing how many passages to include, ordering them, trimming them, preserving source IDs, and avoiding duplicates. The top passage is not always sufficient; multiple passages may be needed for comparison, policy exceptions, or multi-hop answers. But too much context can bury evidence and raise cost.",
          "Citations should be machine-checkable. Each passage needs an ID, title, source, and ideally a span or quote boundary. The prompt should require citations for factual claims and instruct refusal when the answer cannot be supported. After generation, deterministic checks can verify that cited IDs exist and quoted text appears in retrieved context. These checks catch many confident but unsupported answers.",
          "Faithfulness is different from correctness. An answer can faithfully summarize a stale document and still be wrong relative to current policy. Conversely, a model may know a correct fact from pretraining but fail the RAG contract because the retrieved context did not support it. Production systems need both source freshness and groundedness checks.",
          "Context assembly should enforce permission and freshness before generation. Tenant ACLs, document-level auth, product version, region, and effective dates belong in retrieval filters and metadata constraints. A prompt that says \"do not use unauthorized documents\" is not a substitute for preventing those documents from entering the context window."
        ],
        "keyTerms": [
          {
            "term": "Faithfulness",
            "definition": "The degree to which a generated answer is supported by the retrieved context it was given."
          },
          {
            "term": "Citation validation",
            "definition": "Post-generation checks that cited source IDs and quoted spans actually exist in retrieved evidence."
          },
          {
            "term": "Context precision",
            "definition": "A measure of whether retrieved chunks are relevant and ranked usefully for the question."
          }
        ],
        "checkYourself": [
          {
            "prompt": "Why is a faithful answer not always correct?",
            "reveal": "It may be grounded in stale, unauthorized, or otherwise wrong context."
          },
          {
            "prompt": "What should happen when evidence is insufficient?",
            "reveal": "The system should refuse, ask a clarifying question, or route to a fallback rather than inventing."
          }
        ],
        "callout": {
          "tone": "warning",
          "body": "Never rely on the generator to ignore unauthorized context. Keep forbidden documents out of retrieval and packing."
        }
      },
      {
        "id": "ragas-golden-sets-and-evaluation",
        "heading": "RAGAS metrics and golden sets separate retrieval from generation failures",
        "paragraphs": [
          "A RAG evaluation harness should diagnose stages. Classical IR metrics such as Recall@k, MRR, and nDCG measure whether retrieval found and ranked relevant chunks. RAGAS-style metrics add answer-level checks: context precision, context recall, faithfulness, and answer relevancy. Together, they help distinguish \"we did not retrieve the right evidence\" from \"we retrieved it but the model ignored or distorted it.\"",
          "Context recall asks whether retrieved context covers the information needed to answer, often using a reference answer or ground truth. Context precision asks whether retrieved chunks are useful and ranked well rather than noisy. Faithfulness checks whether generated claims are supported by retrieved context. Answer relevancy checks whether the response addresses the user's question. These metrics are not perfect, but they provide repeatable signals for release decisions.",
          "Golden sets should be small enough to maintain and large enough to represent risk. A practical starting range is 50-200 curated question-answer or question-evidence cases, sliced by query type, document type, tenant, freshness, language, and difficulty. Add production failures as hard cases. Do not let synthetic query generation contaminate the eval set with examples too similar to training or tuning data.",
          "Run the golden set for every change to parser, chunker, embedder, ANN settings, BM25 config, RRF parameters, reranker, prompt, model, or context-packing policy. Compare both aggregate and slice scores, and inspect disagreements. A RAG system without frozen evals will keep improving anecdotes while regressing production behavior."
        ],
        "keyTerms": [
          {
            "term": "Context recall",
            "definition": "A RAG evaluation metric for whether retrieved context covers the information needed to answer correctly."
          },
          {
            "term": "Answer relevancy",
            "definition": "A metric for whether the generated answer addresses the user's question rather than a nearby topic."
          },
          {
            "term": "Golden set 50-200",
            "definition": "A maintainable production evaluation set of roughly 50 to 200 curated cases covering important slices and failures."
          }
        ],
        "checkYourself": [
          {
            "prompt": "Which metrics indicate retrieval failure?",
            "reveal": "Recall@k, nDCG, context recall, and context precision often point to retrieval or ranking issues."
          },
          {
            "prompt": "Which metric catches unsupported generation?",
            "reveal": "Faithfulness catches claims not supported by retrieved context."
          }
        ],
        "callout": {
          "tone": "interview",
          "body": "Use RAGAS terms precisely: context recall and precision for retrieval quality, faithfulness for grounding, answer relevancy for response focus."
        }
      },
      {
        "id": "operations-security-and-failure-attribution",
        "heading": "Operate RAG with security, freshness, and failure attribution",
        "paragraphs": [
          "RAG operations include freshness SLAs, delete propagation, reindex jobs, embedding migrations, index build health, and source-system permissions. If a policy changes at noon, users need to know when the RAG system reflects it. If a customer loses access to a document, vectors and caches must respect that change. RAG inherits the obligations of every source system it reads.",
          "Security failures are especially serious because vector search can obscure provenance. Enforce ACLs at retrieval time through mandatory metadata filters, partitioned indexes, or equivalent controls. Do not retrieve a global top-k and hope the prompt or generator will ignore forbidden chunks. Log retrieved IDs and permission predicates so audits can prove what evidence was available.",
          "Failure attribution should be part of every incident review. Label failures as parse, chunk, metadata, index, retrieve, rerank, pack, generate, cite, freshness, or ACL. Then fix the guilty stage. Prompt edits are cheap but often wrong when the actual issue is missing chunks, stale indexes, or a first-stage recall drop.",
          "The mature production stance is boring in the best way: version each stage, evaluate changes on a golden set, monitor live slices, keep rollback paths, and make the system refuse when evidence is weak. RAG is valuable because it exposes evidence; operate it so that evidence remains current, authorized, and measurable."
        ],
        "keyTerms": [
          {
            "term": "Freshness SLA",
            "definition": "A commitment for how quickly source changes appear in retrieval results and generated answers."
          },
          {
            "term": "Retrieval-time ACL",
            "definition": "Access-control enforcement before or during retrieval so unauthorized documents never enter the candidate set."
          },
          {
            "term": "Failure attribution",
            "definition": "Classifying a RAG error by the pipeline stage responsible so the fix targets the real cause."
          }
        ],
        "checkYourself": [
          {
            "prompt": "Why are prompt-only ACLs unacceptable?",
            "reveal": "Unauthorized chunks may already be exposed to the model or leak through outputs, scores, logs, or side effects."
          },
          {
            "prompt": "What should you do before changing the generator prompt after a bad answer?",
            "reveal": "Attribute the failure across parse, chunk, retrieve, rerank, pack, generate, citation, freshness, and ACL stages."
          }
        ],
        "callout": {
          "tone": "warning",
          "body": "Most RAG incidents are pipeline incidents. Changing the final prompt is often a distraction until retrieval and evidence are measured."
        }
      }
    ],
    "wrapUp": {
      "takeaways": [
        "RAG is an ingest and query pipeline with independent failure modes, not just documents pasted into a prompt.",
        "Hierarchical and parent-child chunking balance retrieval precision with generation context.",
        "A production 2026 retrieval funnel uses BM25+dense, RRF k=60, deduplication, and cross-encoder reranking.",
        "RAGAS context recall, context precision, faithfulness, and answer relevancy separate retrieval and generation quality.",
        "Golden sets of 50-200 curated cases, ACL enforcement, freshness, and failure attribution are core operating practices."
      ],
      "nextSteps": [
        {
          "label": "Run the RAG retrieval exercise in the Python lab",
          "href": "/module/prompt-engineering-and-rag/lesson/rag-systems#ml-practice-lab"
        },
        {
          "label": "Review data pipelines before scaling RAG ingest",
          "href": "/module/data-engineering-for-ml/lesson/data-pipelines-at-scale?learn=1"
        },
        {
          "label": "Open interview practice: sketch golden-set metrics",
          "href": "/module/prompt-engineering-and-rag/lesson/rag-systems#practice-lab"
        }
      ]
    }
  },
  "prompt-engineering-and-rag/building-with-frameworks": {
    "title": "Chapter: Building with frameworks",
    "readingTime": "65-80 min",
    "premise": "A practical chapter on when LangChain, LlamaIndex, and similar frameworks help, when plain HTTP is better, and how to keep observability, prompt registries, and testable boundaries in control.",
    "parts": [
      {
        "id": "frameworks-package-patterns",
        "heading": "Frameworks package patterns, not product judgment",
        "paragraphs": [
          "LLM frameworks such as LangChain and LlamaIndex collect common building blocks: model clients, prompt templates, retrievers, parsers, tools, memory, agents, evaluators, and tracing integrations. They can speed up prototypes because many tedious adapters already exist. They can also hide data flow behind abstractions that are hard to debug when the product leaves the notebook stage.",
          "The right mental model is that frameworks package patterns. They do not decide your safety policy, data model, latency budget, auth rules, evaluation gates, or rollback strategy. If a chain retrieves unauthorized documents or loops on a tool, the incident belongs to your architecture even if the framework made it easy to wire.",
          "Use frameworks when they remove real complexity: many document loaders, multiple retrievers, graph workflows, provider routing, tracing, or evaluation integrations. Avoid them when the feature is one prompt, one HTTP call, and one parser. A small module with explicit types may be cheaper to maintain than a dependency whose abstractions change every quarter.",
          "In interviews, start by drawing the product pipeline in plain terms. Then map a framework to specific boxes only where it helps. That answer shows you can use tools without surrendering architecture to them."
        ],
        "keyTerms": [
          {
            "term": "LLM framework",
            "definition": "A library that provides reusable abstractions for prompts, model calls, retrieval, tools, agents, evaluation, or tracing."
          },
          {
            "term": "Abstraction cost",
            "definition": "The debugging, upgrade, performance, and learning overhead introduced by a framework layer."
          },
          {
            "term": "Plain pipeline",
            "definition": "A design described as explicit steps and contracts before choosing any framework."
          }
        ],
        "checkYourself": [
          {
            "prompt": "When does a framework earn its weight?",
            "reveal": "When it removes measured complexity such as loaders, retrievers, tracing, graph workflows, provider routing, or eval integrations."
          },
          {
            "prompt": "What should you draw before naming LangChain or LlamaIndex?",
            "reveal": "The product's data flow: inputs, retrieval, prompt assembly, model call, parsing, tools, validation, monitoring, and rollback."
          }
        ],
        "callout": {
          "tone": "interview",
          "body": "Say what the framework owns and what your application still owns. That distinction is the senior-engineering signal."
        }
      },
      {
        "id": "langchain-and-llamaindex-tradeoffs",
        "heading": "LangChain and LlamaIndex optimize for different centers of gravity",
        "paragraphs": [
          "LangChain grew around composable chains, tools, agents, model integrations, and graph-style orchestration. Its ecosystem is useful when an application needs branching workflows, tool calls, multiple providers, or tracing through chain steps. The tradeoff is that deep runnable compositions can become difficult to inspect unless the team keeps boundaries explicit.",
          "LlamaIndex grew around data connectors, document ingestion, indexing, retrieval, and RAG workflows. It is often attractive when the hardest part is getting varied corpora into searchable structures and experimenting with retrievers. The tradeoff is similar: if business rules become embedded in index or query-engine objects, tests and reviews can become framework-specific.",
          "Neither choice eliminates the need for clean interfaces. Define your own types for documents, chunks, retrieval results, citations, tool requests, and parsed outputs. Wrap framework objects at the edges so the core application can be tested without a live provider or vector database. Dependency injection is not ceremony; it is what lets you swap models, frameworks, or vendors later.",
          "A practical evaluation is to build one critical path twice: once with the framework and once as a thin plain implementation. If the framework version is shorter, more observable, and easier to test, keep it. If the plain version is clearer and has fewer moving parts, the framework may not be earning its keep."
        ],
        "keyTerms": [
          {
            "term": "LangChain",
            "definition": "An LLM application framework known for chains, tools, agents, graph workflows, integrations, and tracing ecosystem."
          },
          {
            "term": "LlamaIndex",
            "definition": "A framework focused on data connectors, indexing, retrieval, and RAG-centric workflows."
          },
          {
            "term": "Dependency injection",
            "definition": "Passing clients or implementations into code so tests can use mocks and production can swap providers."
          }
        ],
        "checkYourself": [
          {
            "prompt": "What is a common LangChain strength?",
            "reveal": "Composable workflows, tools, agents, provider integrations, graph orchestration, and tracing."
          },
          {
            "prompt": "What is a common LlamaIndex strength?",
            "reveal": "Document ingestion, indexes, retrievers, and RAG workflow experimentation."
          }
        ],
        "callout": {
          "tone": "warning",
          "body": "Framework-specific business logic is lock-in. Keep product rules in your own testable layer."
        }
      },
      {
        "id": "when-plain-http-is-better",
        "heading": "Plain HTTP and small modules are often enough",
        "paragraphs": [
          "Many production LLM features are simple: build a prompt, call a model endpoint, parse JSON, validate, and return. For that shape, a direct HTTP client plus a few utility functions may be clearer than a chain framework. Fewer dependencies mean fewer upgrade surprises, smaller bundles, and easier debugging.",
          "Plain HTTP is especially compelling when the provider API already exposes the needed primitives: structured outputs, tool schemas, streaming, batch calls, caching, and usage metadata. Wrapping those primitives in a framework can obscure provider-specific features you actually need. A thin adapter can normalize the few differences your application cares about without importing a full orchestration layer.",
          "The danger of plain code is accidental sprawl. If every team writes its own retry logic, prompt renderer, schema validator, and tracing format, the system becomes inconsistent. The middle path is small shared modules for model clients, prompt rendering, validation, telemetry, and error handling. Keep them boring and documented.",
          "The decision should be revisited as complexity grows. A product may start with plain HTTP, then adopt a graph runner when workflows branch and need checkpoints. Another product may prototype with a framework, then retire it when the stable path is only two steps. Framework choice is not identity; it is an implementation detail that should follow the shape of the system."
        ],
        "keyTerms": [
          {
            "term": "Plain HTTP",
            "definition": "Calling model or retrieval APIs directly through small application-owned clients rather than a large orchestration framework."
          },
          {
            "term": "Thin adapter",
            "definition": "A minimal wrapper that normalizes provider calls while preserving explicit application control."
          },
          {
            "term": "Shared module",
            "definition": "A small internal utility for common concerns such as retries, validation, prompt rendering, or telemetry."
          }
        ],
        "checkYourself": [
          {
            "prompt": "When is plain HTTP attractive?",
            "reveal": "When the workflow is simple, provider primitives are sufficient, and framework abstractions would add more complexity than they remove."
          },
          {
            "prompt": "What must plain implementations avoid?",
            "reveal": "Inconsistent retries, validation, tracing, prompt rendering, and error handling across teams."
          }
        ],
        "callout": {
          "tone": "interview",
          "body": "It is acceptable to say 'no framework' if you can explain the interfaces, retries, validation, tracing, and future migration path."
        }
      },
      {
        "id": "observability-and-debuggability",
        "heading": "Observability is the difference between demos and operations",
        "paragraphs": [
          "LLM applications fail across many steps: retrieval, prompt rendering, model latency, tool calls, parsing, validation, safety checks, and user feedback. Final answers alone do not explain which step broke. Observability means tracing each step with a request ID, timestamps, inputs or redacted references, outputs or hashes, token counts, cost, model ID, prompt version, retrieved IDs, tool calls, and validation results.",
          "Framework tracers can help if they are wired deliberately. LangSmith, OpenTelemetry-based traces, Phoenix, custom logs, or vendor dashboards all serve the same purpose: make the chain inspectable. The tool matters less than the discipline of structured events. A framework callback that logs everything except chunk IDs and prompt version will still leave RAG failures mysterious.",
          "Privacy controls must be part of observability. Prompt logs can contain customer data, secrets, health details, or proprietary documents. Store IDs and hashes when raw text is unnecessary, redact sensitive fields, and limit access to traces. Debuggability should not become a data leak.",
          "Useful dashboards include parse-failure rate, retry rate, tool-error rate, empty-retrieval rate, low-confidence retrieval, citation-invalid rate, refusal rate, p95 latency, cost per successful task, and quality metrics from eval runs. These are the signals that tell you whether a framework is helping or hiding problems."
        ],
        "keyTerms": [
          {
            "term": "LLM trace",
            "definition": "A structured record of each model, retrieval, tool, validation, and parsing step in a request."
          },
          {
            "term": "Prompt hash",
            "definition": "A privacy-preserving identifier for the rendered prompt or template version used in a request."
          },
          {
            "term": "Cost per successful task",
            "definition": "Total model and infrastructure cost divided by requests that pass quality and validation criteria."
          }
        ],
        "checkYourself": [
          {
            "prompt": "What fields help debug a RAG answer?",
            "reveal": "Prompt version, model ID, query, retrieved chunk IDs, scores, rerank order, context IDs, citations, validation results, latency, and cost."
          },
          {
            "prompt": "Why not log every raw prompt forever?",
            "reveal": "Prompts may contain private or sensitive data; use redaction, access controls, hashes, and retention limits."
          }
        ],
        "callout": {
          "tone": "warning",
          "body": "If you cannot trace a bad answer to a step, your framework has become an opacity layer."
        }
      },
      {
        "id": "prompt-registries-and-release-control",
        "heading": "Prompt registries and release control keep teams aligned",
        "paragraphs": [
          "As LLM systems grow, prompts multiply across services, agents, languages, and experiments. A prompt registry records templates, variables, schemas, examples, owners, model compatibility, eval results, and deployment status. It creates a shared source of truth for what prompt is live and why. This is especially useful when prompts are edited by product, safety, and engineering together.",
          "A registry is not a substitute for code review or tests. The application still needs typed prompt variables, schema validators, and a release process that runs golden sets before promotion. Prompt changes should have changelogs and rollback. Treat a prompt release like a config release with safety consequences.",
          "Framework integrations can make prompt registries convenient, but avoid making prompts executable mystery objects. A prompt should be inspectable as text plus metadata. If only a framework runtime can tell what was sent to the model, debugging and compliance suffer. Prefer transparent templates and explicit rendering.",
          "Release control also applies to tools and retrievers. A prompt that assumes a tool schema, index shape, or citation format must be versioned with those dependencies. Otherwise a harmless-looking wording change can break parsing, cache behavior, or retrieval grounding."
        ],
        "keyTerms": [
          {
            "term": "Prompt registry",
            "definition": "A versioned catalog of prompt templates, metadata, owners, schemas, evals, and deployment state."
          },
          {
            "term": "Prompt promotion",
            "definition": "Moving a prompt version from draft or experiment to production after review and evaluation."
          },
          {
            "term": "Template dependency",
            "definition": "A model, tool schema, retriever output, parser, or context format that a prompt assumes."
          }
        ],
        "checkYourself": [
          {
            "prompt": "What belongs in a prompt registry entry?",
            "reveal": "Template, variables, owner, schema, examples, model compatibility, eval report, status, dependencies, and changelog."
          },
          {
            "prompt": "Why version prompts with tool schemas?",
            "reveal": "The prompt may instruct arguments or parsing that only work with a specific schema version."
          }
        ],
        "callout": {
          "tone": "interview",
          "body": "Mention prompt registries when the system has multiple teams, prompts, models, or release environments. For one prompt, a file plus tests may be enough."
        }
      },
      {
        "id": "testing-and-evolution",
        "heading": "Keep the system testable as it evolves",
        "paragraphs": [
          "The core defense against framework churn is testable boundaries. Define functions such as retrieve, rerank, renderPrompt, callModel, parseOutput, validate, and executeTool with explicit inputs and outputs. In unit tests, replace model and tool clients with fakes. In integration tests, run a small golden set against real services. This lets the team upgrade frameworks without rewriting product logic.",
          "Agents and graph workflows need even stricter budgets. Cap steps, tokens, retries, tool calls, and wall-clock time. Persist state when workflows may resume, and make transitions explicit enough to review. Opaque infinite loops are not autonomy; they are an incident waiting for a 429 storm or a bad tool argument.",
          "Frameworks should be evaluated periodically. Ask whether they still reduce code, improve observability, and simplify tests. If most code is now adapters around the framework, consider flattening the critical path. If requirements grew into branching workflows with persistence and tracing, consider adopting a graph-oriented layer deliberately.",
          "A healthy LLM architecture can change providers, prompts, retrievers, and orchestration libraries without changing the product contract. That flexibility comes from small interfaces, golden tests, prompt/version metadata, and traces. Frameworks are useful when they support those properties; they are harmful when they obscure them."
        ],
        "keyTerms": [
          {
            "term": "Fake model",
            "definition": "A deterministic test double that returns controlled responses instead of calling a live LLM provider."
          },
          {
            "term": "Step budget",
            "definition": "A limit on agent or workflow iterations, tool calls, tokens, retries, or elapsed time."
          },
          {
            "term": "Framework churn",
            "definition": "Maintenance cost caused by rapidly changing framework APIs, abstractions, or dependency versions."
          }
        ],
        "checkYourself": [
          {
            "prompt": "Which boundaries make LLM apps testable?",
            "reveal": "Retrieval, reranking, prompt rendering, model calls, parsing, validation, and tool execution should have explicit interfaces."
          },
          {
            "prompt": "What budgets should an agentic workflow enforce?",
            "reveal": "Step count, token count, retries, tool calls, cost, and wall-clock time."
          }
        ],
        "callout": {
          "tone": "warning",
          "body": "An agent loop without budgets and traces is not a product architecture; it is unbounded control flow."
        }
      }
    ],
    "wrapUp": {
      "takeaways": [
        "Frameworks accelerate common patterns but do not own product judgment, safety, evaluation, or rollback.",
        "LangChain is often strongest for orchestration and tools; LlamaIndex is often strongest for ingestion, indexing, and RAG workflows.",
        "Plain HTTP plus small shared modules can be the best design for simple prompt-parse features.",
        "Observability should trace prompt versions, retrieved IDs, tool calls, validation, cost, and latency with privacy controls.",
        "Prompt registries, testable boundaries, fake clients, golden sets, and step budgets keep framework-based systems operable."
      ],
      "nextSteps": [
        "Choose one LLM feature and decide whether framework, thin adapter, or plain HTTP best matches its actual complexity.",
        "Write a test plan that uses fake model clients for unit tests and a golden set for integration tests."
      ]
    }
  }
};
