const chapters = {
  "llm-retrieval-lab/tokenization-workshop": {
    title: "Chapter: Tokenization workshop",
    readingTime: "65-80 min",
    premise:
      "Tokenization is the contract between text and model inputs. This chapter explains whitespace, character, and subword tokenization, vocabulary tradeoffs, special tokens, context budgeting, and production pitfalls.",
    parts: [
      {
        id: "text-becomes-ids",
        heading: "Models consume token ids, not raw text",
        paragraphs: [
          "An LLM does not directly read a string. A tokenizer normalizes text, splits it into pieces, maps those pieces to integer ids, and often adds special tokens. Those ids index embedding rows inside the model. If the tokenizer changes, the same visible sentence can become a different id sequence with different length and meaning to the model.",
          "Whitespace tokenization is easy to understand but brittle. It treats spaces as boundaries and often mishandles punctuation, casing, contractions, code, and languages without whitespace word boundaries. Character tokenization has excellent coverage because almost any string can be represented, but it creates long sequences and forces the model to learn larger patterns from very small units.",
          "Subword tokenization sits between these extremes. Frequent words or fragments stay compact, while rare words break into reusable pieces. Byte-pair encoding, WordPiece, and Unigram tokenizers differ in training method, but all balance vocabulary size against sequence length and coverage. The practical lesson is to measure tokenized length on real inputs, not to guess from characters or words."
        ],
        keyTerms: [
          {
            term: "token id",
            definition:
              "An integer representing a tokenizer vocabulary entry consumed by a model."
          },
          {
            term: "subword tokenization",
            definition:
              "A tokenization strategy that represents text with frequent words or fragments and splits rarer strings into smaller pieces."
          },
          {
            term: "vocabulary",
            definition:
              "The fixed set of token pieces a tokenizer can map directly to ids."
          }
        ],
        checkYourself: [
          {
            prompt: "Why should an app count tokens with the model's tokenizer?",
            reveal:
              "Characters and words do not map reliably to token ids. Billing, context limits, truncation, and prompt layout depend on the tokenizer actually used by the model."
          }
        ],
        callout: {
          tone: "tip",
          body:
            "Tokenization is model-specific. Token ids from one model family are not portable input to another unless the tokenizer contract matches."
        }
      },
      {
        id: "vocab-tradeoffs",
        heading: "Vocabulary size trades memory for shorter sequences",
        paragraphs: [
          "A larger vocabulary can represent common strings in fewer tokens, reducing context length and attention cost. It also increases the embedding table and final output projection size. With a 100,000-token vocabulary and 4,096-dimensional embeddings, the embedding matrix alone contains hundreds of millions of parameters if not tied or compressed. Tokenizer design is therefore both an NLP choice and a systems choice.",
          "A smaller vocabulary improves coverage efficiency for rare variants because pieces are reused more often, but sequences get longer. Longer sequences increase attention cost, prefill latency, and context pressure. Some domains are especially sensitive: code identifiers, JSON, chemical names, log lines, and non-English scripts can tokenize into many pieces under a general-purpose vocabulary.",
          "Token fertility measures how many tokens a tokenizer produces per word, character, or byte for a domain. High fertility means users burn context faster and pay more for the same visible text. Before blaming a model for poor long-document performance, inspect tokenizer fertility, truncation behavior, and whether important structure is being split or dropped."
        ],
        keyTerms: [
          {
            term: "embedding table",
            definition:
              "The matrix that maps token ids to learned vectors used as model input representations."
          },
          {
            term: "token fertility",
            definition:
              "The number of tokens produced per word, character, byte, or domain unit."
          },
          {
            term: "context pressure",
            definition:
              "The constraint created when useful information competes for limited model context tokens."
          }
        ],
        checkYourself: [
          {
            prompt: "Why can a larger vocabulary reduce latency but increase parameters?",
            reveal:
              "It can shorten sequences, reducing attention work, but each vocabulary entry needs embedding and often output-projection parameters."
          }
        ],
        callout: {
          tone: "interview",
          body:
            "Connect vocabulary size to three things: sequence length, embedding parameters, and domain fairness or efficiency."
        }
      },
      {
        id: "merges-and-bytes",
        heading: "BPE-style merges learn reusable text chunks",
        paragraphs: [
          "Byte-pair encoding begins with small units such as bytes or characters and repeatedly merges frequent adjacent pairs. If `t` followed by `h` appears often, a merge can create `th`; if `th` followed by `e` appears often, another merge can create `the`. The final vocabulary captures common chunks while still being able to represent uncommon strings through smaller pieces.",
          "Byte-level tokenizers avoid unknown characters by starting from bytes. That is useful for arbitrary web text, code, and multilingual inputs, but it can produce unintuitive token boundaries. Many tokenizers also encode spaces as part of tokens or special markers, so `word` and ` word` may be different vocabulary entries. This is why hand-editing token strings is error-prone.",
          "Tokenizer training data shapes model behavior. A tokenizer trained mostly on English prose may split code or underrepresented languages inefficiently. A tokenizer trained with code and structured data may preserve identifiers or syntax better. The model later learns from these pieces, so tokenization affects both cost and learnability."
        ],
        keyTerms: [
          {
            term: "BPE",
            definition:
              "Byte-pair encoding, a subword method that iteratively merges frequent adjacent units."
          },
          {
            term: "byte-level tokenizer",
            definition:
              "A tokenizer that starts from bytes so arbitrary Unicode text can be represented."
          },
          {
            term: "merge rule",
            definition:
              "A learned rule that combines adjacent token pieces into a larger piece."
          }
        ],
        checkYourself: [
          {
            prompt: "Why do some tokenizers treat leading spaces as part of a token?",
            reveal:
              "Space handling is part of the learned tokenization scheme. Encoding spaces with tokens helps preserve word boundaries but makes surface strings context-dependent."
          }
        ],
        callout: {
          tone: "warning",
          body:
            "Do not assume token boundaries align with words. UI highlighting, truncation, and log redaction must account for subword boundaries."
        }
      },
      {
        id: "special-tokens",
        heading: "Special tokens carry control information",
        paragraphs: [
          "Tokenizers reserve ids for control roles such as beginning of sequence, end of sequence, padding, unknown, separator, mask, user message, assistant message, tool call, or system instruction. These tokens are not ordinary text. They tell the model and runtime how to frame the sequence. Missing or misplaced special tokens can change behavior even when the visible prompt looks right.",
          "Chat templates are tokenizer-adjacent contracts. A conversation may be serialized with role markers, separators, tool schemas, and generation prompts. Two models can accept the same natural-language messages but require different template tokens. If an application migrates models without updating chat formatting, quality and safety can regress silently.",
          "Padding and attention masks also depend on tokenization. Batch inputs often need equal length, so shorter sequences are padded. The model should not attend to padding tokens as if they were content. Correct masks ensure padding exists for tensor shape, not for meaning. Special tokens and masks together define the legal structure of the sequence."
        ],
        keyTerms: [
          {
            term: "special token",
            definition:
              "A reserved token id used for control structure rather than ordinary text content."
          },
          {
            term: "chat template",
            definition:
              "A model-specific serialization format for messages, roles, tools, and generation prompts."
          },
          {
            term: "padding token",
            definition:
              "A token used to make sequences in a batch the same length."
          }
        ],
        checkYourself: [
          {
            prompt: "Why is a chat template part of model compatibility?",
            reveal:
              "The model was trained to interpret role and boundary tokens in a specific serialized format. Changing the template changes the actual input sequence."
          }
        ],
        callout: {
          tone: "interview",
          body:
            "Mention special tokens when discussing prompt migration, tool calling, padding masks, and model swaps."
        }
      },
      {
        id: "truncation-and-safety",
        heading: "Token budgeting is a reliability and safety practice",
        paragraphs: [
          "Applications often assemble prompts from system instructions, user input, conversation history, retrieved context, tool results, and output budget. If the total exceeds the context window, something must be truncated or summarized. The truncation policy can decide whether the model keeps safety instructions, recent user intent, citations, or stale history. That is a product and safety decision, not merely a utility function.",
          "Unsafe truncation can remove delimiters, cut JSON in the middle, drop citation metadata, or omit the policy that tells the model how to answer. It can also truncate in the middle of a subword if developers use character slicing before tokenization. A robust system budgets sections explicitly and validates that required parts survive.",
          "The best token budget is usually smaller than the maximum window. Shorter prompts reduce latency, cost, and distraction. Retrieval should choose high-value chunks; history should be summarized with known limitations; tools should return structured compact outputs. Tokenization is where product quality meets systems efficiency."
        ],
        keyTerms: [
          {
            term: "token budget",
            definition:
              "An allocation of available context tokens across prompt sections and expected output."
          },
          {
            term: "truncation policy",
            definition:
              "Rules that decide what content is dropped, summarized, or retained when inputs exceed context limits."
          },
          {
            term: "context window",
            definition:
              "The maximum number of tokens a model can process in one request, including prompt and output."
          }
        ],
        checkYourself: [
          {
            prompt: "What prompt section should almost never be dropped by naive truncation?",
            reveal:
              "System and safety instructions, required schemas, and current user intent should be protected by explicit budgeting rather than dropped accidentally."
          }
        ],
        callout: {
          tone: "warning",
          body:
            "Character limits are not token limits. Tokenize before enforcing context budgets and validate that required boundaries remain intact."
        }
      }
    ],
    wrapUp: {
      takeaways: [
        "Tokenizers map text to model-specific token ids and are part of the model contract.",
        "Vocabulary size trades parameter memory against sequence length and domain fertility.",
        "BPE-style merges create reusable subword chunks but do not align perfectly with words.",
        "Special tokens and chat templates control sequence structure.",
        "Token budgeting and truncation policies affect cost, latency, quality, and safety."
      ],
      nextSteps: [
        "Measure token fertility for prose, code, and JSON inputs.",
        "Write a prompt budget that reserves space for system instructions, retrieval context, and output.",
        "Explain why model migration requires tokenizer and chat-template checks."
      ]
    }
  },
  "llm-retrieval-lab/embeddings-and-similarity-lab": {
    title: "Chapter: Embeddings and similarity lab",
    readingTime: "65-80 min",
    premise:
      "Embeddings turn items into vectors so retrieval can compare meaning, not just keywords. This chapter covers vector spaces, similarity metrics, normalization, indexing, chunking, and evaluation.",
    parts: [
      {
        id: "embedding-intuition",
        heading: "Embeddings place related items near one another",
        paragraphs: [
          "An embedding model maps text, images, users, products, or other objects into dense vectors. The training objective encourages related items to have similar vectors and unrelated items to be farther apart. For retrieval, a query and documents are embedded into the same space, and nearest neighbors become candidate context for the LLM.",
          "Similarity is learned, not universal. An embedding trained for general semantic search may place `reset my password` near `account recovery`, while a code embedding may emphasize API signatures and identifiers. A product catalog embedding may need attributes, brands, and compatibility. The vector space reflects the model, training data, and input formatting.",
          "Embeddings are useful because they support fuzzy matching. A document can be retrieved even when it does not share exact words with the query. They are risky because fuzzy matching can retrieve plausible but wrong context. Good retrieval systems combine embedding quality with chunking, metadata filters, reranking, and evaluation."
        ],
        keyTerms: [
          {
            term: "embedding",
            definition:
              "A dense vector representation learned so related objects are near one another under a similarity metric."
          },
          {
            term: "nearest neighbor",
            definition:
              "An item whose vector is among the closest to a query vector."
          },
          {
            term: "semantic search",
            definition:
              "Retrieval based on meaning-like vector similarity rather than exact keyword overlap alone."
          }
        ],
        checkYourself: [
          {
            prompt: "Why can embeddings retrieve documents with no shared keywords?",
            reveal:
              "The embedding model learns vector similarity from patterns in training data, so related meanings can be near each other even when surface words differ."
          }
        ],
        callout: {
          tone: "tip",
          body:
            "Always ask what the embedding model was optimized for. Similarity is task-shaped, not a law of nature."
        }
      },
      {
        id: "similarity-metrics",
        heading: "Cosine, dot product, and Euclidean distance encode different comparisons",
        paragraphs: [
          "Cosine similarity compares vector direction and ignores magnitude after normalization. It is common for text embeddings because direction often represents semantic content. Dot product includes magnitude, which can matter if the model encodes confidence, popularity, or norm-based information. Euclidean distance measures straight-line distance and can behave similarly to cosine when vectors are normalized.",
          "Normalization changes retrieval. If all vectors are L2-normalized, dot product and cosine ranking are equivalent. If vectors are not normalized, high-norm documents may dominate dot-product search. That can be useful or harmful depending on how the embedding model uses norms. The retrieval stack should match the metric recommended for the embedding model and index type.",
          "Similarity scores are not calibrated probabilities. A cosine score of 0.82 in one embedding model is not comparable to 0.82 in another, and score distributions can vary by query type. Thresholds should be chosen through evaluation on real queries. For RAG, the question is not whether a score looks high; it is whether retrieved chunks contain answerable, faithful context."
        ],
        keyTerms: [
          {
            term: "cosine similarity",
            definition:
              "The normalized dot product measuring angle similarity between vectors."
          },
          {
            term: "L2 normalization",
            definition:
              "Scaling a vector so its Euclidean norm equals one."
          },
          {
            term: "similarity threshold",
            definition:
              "A cutoff used to accept or reject retrieved items based on score."
          }
        ],
        checkYourself: [
          {
            prompt: "When are dot product and cosine rankings equivalent?",
            reveal:
              "When all compared vectors are L2-normalized, dot product equals cosine similarity."
          }
        ],
        callout: {
          tone: "interview",
          body:
            "Do not quote a universal cosine threshold. Explain that thresholds are model, corpus, and query-distribution specific."
        }
      },
      {
        id: "chunking",
        heading: "Chunking decides what a retrieved vector can actually answer",
        paragraphs: [
          "Documents must often be split before embedding because models and vector indexes work on bounded pieces. Chunk too small and the retrieved text lacks enough context to answer. Chunk too large and unrelated topics share one vector, reducing precision and wasting prompt tokens. The right chunk size depends on document structure, answer granularity, and model context budget.",
          "Structure-aware chunking usually beats blind character windows. Headings, sections, paragraphs, tables, code blocks, and metadata boundaries carry meaning. Overlap can preserve continuity across boundaries, but too much overlap duplicates context and crowds out other evidence. Metadata such as product, version, date, permission, and source quality can be as important as the text itself.",
          "A chunk is both a retrieval unit and a prompt unit. It should include enough provenance for citations and enough surrounding context for faithful generation. If a chunk says `it is deprecated` without the preceding feature name, retrieval may succeed but the LLM cannot answer safely. Retrieval quality begins before the vector database: it begins with document preparation."
        ],
        keyTerms: [
          {
            term: "chunk",
            definition:
              "A bounded text or document segment embedded and retrieved as a unit."
          },
          {
            term: "overlap",
            definition:
              "Repeated content between adjacent chunks used to preserve context across boundaries."
          },
          {
            term: "metadata filter",
            definition:
              "A retrieval constraint based on structured fields such as product, date, tenant, or permissions."
          }
        ],
        checkYourself: [
          {
            prompt: "Why can a high-similarity chunk still be unusable?",
            reveal:
              "It may lack the surrounding facts, provenance, permissions, or answer-specific detail needed for a faithful response."
          }
        ],
        callout: {
          tone: "warning",
          body:
            "Bad chunking cannot be fully repaired by a better vector index. The retriever can only return the units you created."
        }
      },
      {
        id: "indexing-and-ann",
        heading: "Vector indexes trade exactness for speed and scale",
        paragraphs: [
          "Exact nearest-neighbor search compares the query against every vector. That is simple and accurate, but expensive for large corpora. Approximate nearest-neighbor indexes organize vectors so search can inspect a promising subset quickly. Common families include graph-based methods, inverted file indexes, and product quantization. Each has tuning knobs that trade recall, latency, memory, and build time.",
          "Index configuration should be evaluated with retrieval metrics, not only request latency. A faster index that misses the right document lowers answer quality. A slower exact search may be acceptable for small corpora or offline evaluation. Production systems often use approximate retrieval for candidates and a cross-encoder or LLM reranker for final ordering.",
          "Indexes also have operational concerns. New documents must be embedded and inserted, deleted documents must disappear, permissions must be enforced, and embedding model upgrades may require reindexing. If old and new embeddings share an index without versioning, similarity becomes incoherent. Treat the embedding model, preprocessing, chunking, and index as one versioned retrieval artifact."
        ],
        keyTerms: [
          {
            term: "ANN",
            definition:
              "Approximate nearest-neighbor search, which finds likely nearest vectors faster than exhaustive comparison."
          },
          {
            term: "recall at k",
            definition:
              "The fraction of relevant items retrieved within the top k results."
          },
          {
            term: "reranker",
            definition:
              "A second-stage model that reorders retrieved candidates using richer query-document interaction."
          }
        ],
        checkYourself: [
          {
            prompt: "Why evaluate ANN recall before celebrating lower latency?",
            reveal:
              "Lower latency is harmful if the index stops returning relevant evidence. Retrieval quality must remain high enough for the RAG task."
          }
        ],
        callout: {
          tone: "tip",
          body:
            "Version embeddings, chunking, and index parameters together. Mixed retrieval artifacts make similarity scores hard to interpret."
        }
      },
      {
        id: "retrieval-evaluation",
        heading: "Embedding labs need retrieval evaluation, not just pretty neighbors",
        paragraphs: [
          "A nearest-neighbor demo is useful, but production retrieval needs a test set. For each query, store relevant document ids or answer-bearing chunks. Then measure recall at k, precision at k, mean reciprocal rank, and failure slices. If the right chunk usually appears at rank 12 and the prompt includes only top 5, answer generation will struggle no matter how good the LLM is.",
          "Qualitative inspection remains valuable. Look at false neighbors, duplicates, stale documents, and chunks that match query wording but not intent. Compare lexical search, embedding search, hybrid retrieval, and reranking. Some failures are fixed by better chunking or metadata filters rather than by changing embedding models.",
          "The strongest retrieval systems are instrumented. Log query text, rewritten query, filters, candidate ids, scores, reranked ids, final context ids, and answer citations. These logs let teams reproduce bad answers, grow golden sets, and determine whether the failure came from retrieval, ranking, prompt construction, or generation."
        ],
        keyTerms: [
          {
            term: "MRR",
            definition:
              "Mean reciprocal rank, a metric that rewards placing the first relevant result near the top."
          },
          {
            term: "answer-bearing chunk",
            definition:
              "A retrieved unit that contains the evidence needed to answer a query."
          },
          {
            term: "retrieval trace",
            definition:
              "Logged retrieval inputs, filters, candidates, scores, and selected context for debugging."
          }
        ],
        checkYourself: [
          {
            prompt: "What should you inspect when answers are wrong despite plausible retrieved text?",
            reveal:
              "Inspect whether the retrieved chunks contain the actual answer, whether ranking placed them in context, and whether prompt construction preserved the evidence."
          }
        ],
        callout: {
          tone: "interview",
          body:
            "Separate retrieval failure from generation failure. Good RAG debugging starts with the context actually supplied to the model."
        }
      }
    ],
    wrapUp: {
      takeaways: [
        "Embeddings map items into learned vector spaces where similarity is task-shaped.",
        "Cosine, dot product, and Euclidean metrics behave differently unless vectors are normalized.",
        "Chunking and metadata decide what retrieval units can answer.",
        "ANN indexes trade recall, latency, memory, and operational complexity.",
        "Retrieval evaluation needs query-to-relevant-context goldens and traces, not only visual demos."
      ],
      nextSteps: [
        "Measure recall at k for a small query-to-document golden set.",
        "Compare fixed-size chunking with heading-aware chunking on one document.",
        "Log a retrieval trace and classify a failure as chunking, filtering, ranking, or generation."
      ]
    }
  },
  "llm-retrieval-lab/rag-evaluation-workshop": {
    title: "Chapter: RAG evaluation workshop",
    readingTime: "70-85 min",
    premise:
      "RAG quality depends on retrieval, context assembly, generation, and grounding. This chapter covers golden sets, context recall and precision, faithfulness, hybrid retrieval with reciprocal rank fusion, and release-ready evaluation loops.",
    parts: [
      {
        id: "rag-eval-scope",
        heading: "RAG evaluation must separate pipeline stages",
        paragraphs: [
          "A RAG answer can fail for several reasons. The query may be rewritten badly, retrieval may miss evidence, ranking may bury the right chunk, context assembly may truncate the source, the generator may ignore evidence, or the answer may hallucinate beyond the context. A single thumbs-up score cannot tell you which subsystem to fix.",
          "Stage-aware evaluation starts by saving traces. For each query, record rewritten query, filters, retrieved ids, scores, selected context, final answer, citations, latency, and model version. Then evaluate retrieval before generation and generation against supplied context. This prevents the common confusion where a model is blamed for hallucination when it never received the right document.",
          "The workshop goal is to build an evaluation harness that can run before release. It should compare prompt changes, embedding model upgrades, chunking changes, index parameters, rerankers, and model swaps against the same golden set. RAG is a system, so the eval needs system observability."
        ],
        keyTerms: [
          {
            term: "RAG trace",
            definition:
              "A record of retrieval, context assembly, generation, citations, and metadata for one RAG request."
          },
          {
            term: "stage-aware evaluation",
            definition:
              "Evaluation that scores retrieval, context quality, grounding, and answer quality separately."
          },
          {
            term: "grounding",
            definition:
              "The degree to which an answer is supported by supplied evidence."
          }
        ],
        checkYourself: [
          {
            prompt: "Why is it dangerous to evaluate only the final answer?",
            reveal:
              "Final-answer scores hide whether failures come from retrieval, ranking, context truncation, generation, or citation behavior, making fixes guessy."
          }
        ],
        callout: {
          tone: "tip",
          body:
            "Debug RAG from left to right: query, filters, candidates, selected context, answer, citations."
        }
      },
      {
        id: "golden-sets",
        heading: "Golden sets turn production questions into repeatable tests",
        paragraphs: [
          "A RAG golden set contains user-like queries plus expected evidence and answer criteria. For each item, store query text, relevant document or chunk ids, reference answer or rubric, required citations, tags, and known edge cases. Good tags include product area, language, freshness, permission boundary, adversarial prompt, and answer type. The set should include both answerable and unanswerable questions.",
          "Goldens should be grown from real incidents, search logs, support tickets, expert-written scenarios, and adversarial probes. They need owners and review because product policy and documents change. If a source document is updated, the relevant chunk ids or reference answer may need a new version. Stale goldens can block good releases or pass bad ones.",
          "A small high-quality golden set beats a large ambiguous one. Each example should make expected behavior clear enough that a human or grader can judge consistently. For regulated or high-impact domains, double annotation and adjudication improve reliability. For fast-moving products, a tiered set can separate smoke tests, release gates, and deeper nightly evaluation."
        ],
        keyTerms: [
          {
            term: "golden set",
            definition:
              "A curated, versioned evaluation dataset with expected evidence and answer criteria."
          },
          {
            term: "reference answer",
            definition:
              "An expected answer or rubric used to judge generated responses."
          },
          {
            term: "unanswerable query",
            definition:
              "A query for which the system should abstain or ask for clarification because evidence is missing."
          }
        ],
        checkYourself: [
          {
            prompt: "Why include unanswerable questions in a RAG golden set?",
            reveal:
              "They test whether the system abstains or asks for clarification instead of fabricating answers when retrieval lacks evidence."
          }
        ],
        callout: {
          tone: "interview",
          body:
            "Describe goldens as versioned artifacts with query, relevant context ids, expected behavior, tags, and owners."
        }
      },
      {
        id: "context-metrics",
        heading: "Context recall and precision measure evidence quality",
        paragraphs: [
          "Context recall asks whether the supplied context contains the evidence needed to answer. If the golden says chunks A and B are relevant and the prompt includes only A, recall may be partial. If neither appears, generation is unlikely to be faithful. Low context recall points to retrieval, filters, chunking, indexing, or top-k budget problems.",
          "Context precision asks whether supplied context is mostly useful rather than clutter. A prompt that includes the right chunk plus nine irrelevant chunks may have high recall but poor precision. Irrelevant context wastes tokens and can distract the model into mixing facts. Precision matters more as context windows get crowded or when documents contain conflicting policy versions.",
          "These metrics should be computed before judging the answer. A faithful answer is hard if the evidence is absent; an unfaithful answer is especially concerning when the evidence was present. Stage metrics create useful diagnosis. Retrieval teams optimize recall and precision; prompt and generation teams optimize how well the answer uses the selected context."
        ],
        keyTerms: [
          {
            term: "context recall",
            definition:
              "The fraction of required evidence retrieved or included in the prompt context."
          },
          {
            term: "context precision",
            definition:
              "The fraction of supplied context that is relevant to the query."
          },
          {
            term: "top-k",
            definition:
              "The number of highest-ranked retrieved items passed to a later stage."
          }
        ],
        checkYourself: [
          {
            prompt: "What does high recall but low precision suggest?",
            reveal:
              "The system finds the needed evidence but includes too much irrelevant context, so ranking, filtering, reranking, or context budgeting may need work."
          }
        ],
        callout: {
          tone: "tip",
          body:
            "Measure context quality before answer quality. It tells you whether generation had a fair chance."
        }
      },
      {
        id: "faithfulness-answer-quality",
        heading: "Faithfulness is support by context, not generic helpfulness",
        paragraphs: [
          "Faithfulness measures whether answer claims are supported by the supplied context. An answer can be fluent, relevant, and still unfaithful if it invents details. It can also be faithful but incomplete if it cites only part of the policy. RAG evaluation should distinguish faithfulness, answer relevance, completeness, citation correctness, and abstention behavior.",
          "Automated graders can help, but they need careful rubrics. A grader may prefer verbose answers, miss subtle contradictions, or accept unsupported paraphrases. Stronger checks decompose answers into claims and verify each claim against retrieved context, citation ids, or structured facts. Human review remains important for high-risk slices and for calibrating LLM-as-judge scores.",
          "Faithfulness also depends on prompt design. The model should be instructed to answer only from context, cite sources, say when evidence is insufficient, and avoid merging conflicting versions. The evaluation harness should test those instructions directly. If the model fails only when documents conflict, add conflict cases to goldens rather than relying on average scores."
        ],
        keyTerms: [
          {
            term: "faithfulness",
            definition:
              "The degree to which answer claims are supported by the provided context."
          },
          {
            term: "citation correctness",
            definition:
              "Whether citations point to sources that actually support the claims they accompany."
          },
          {
            term: "LLM-as-judge",
            definition:
              "Using an LLM to grade outputs according to a rubric or comparison task."
          }
        ],
        checkYourself: [
          {
            prompt: "Can an answer be relevant but unfaithful?",
            reveal:
              "Yes. It may address the question but include claims that are not supported by the retrieved context."
          }
        ],
        callout: {
          tone: "warning",
          body:
            "Do not let a generic helpfulness judge stand in for grounding. Faithfulness must reference supplied evidence."
        }
      },
      {
        id: "hybrid-rrf",
        heading: "Hybrid retrieval and RRF improve candidate coverage",
        paragraphs: [
          "Dense embeddings capture semantic similarity, while lexical methods such as BM25 capture exact terms, names, identifiers, and rare phrases. Many RAG systems use both because each fails differently. Embeddings may miss exact error codes; lexical search may miss paraphrases. Hybrid retrieval gathers candidates from both channels before reranking or fusion.",
          "Reciprocal rank fusion, or RRF, combines ranked lists without requiring comparable raw scores. For each candidate, it sums terms like `1 / (k + rank)` across lists, where `k` dampens the impact of top ranks. A document that appears reasonably high in both dense and lexical results can outrank a document that appears only in one list. RRF is simple, robust, and useful when score scales differ.",
          "Hybrid systems still need evaluation. More candidates can improve recall but also increase latency and precision burden. Rerankers can refine the candidate list using richer query-document interactions, but they add cost. A release gate should compare dense-only, lexical-only, hybrid RRF, and hybrid-plus-reranker on the same golden set, including exact-match-heavy queries and paraphrase-heavy queries."
        ],
        keyTerms: [
          {
            term: "hybrid retrieval",
            definition:
              "Combining lexical and dense vector retrieval to improve candidate coverage."
          },
          {
            term: "BM25",
            definition:
              "A lexical ranking method based on term frequency, inverse document frequency, and document-length normalization."
          },
          {
            term: "RRF",
            definition:
              "Reciprocal rank fusion, a method for combining ranked lists by summing reciprocal rank scores."
          }
        ],
        checkYourself: [
          {
            prompt: "Why is RRF useful when combining BM25 and vector search?",
            reveal:
              "It uses ranks rather than raw scores, so it can combine lists whose scoring scales are not directly comparable."
          }
        ],
        callout: {
          tone: "interview",
          body:
            "For RAG retrieval, propose hybrid search plus RRF when queries mix paraphrases with exact identifiers, errors, names, or policy terms."
        }
      }
    ],
    wrapUp: {
      takeaways: [
        "RAG evaluation should score retrieval, context assembly, grounding, and answer behavior separately.",
        "Golden sets need expected evidence ids, answer rubrics, tags, owners, and versioning.",
        "Context recall and precision diagnose whether the model received useful evidence.",
        "Faithfulness measures support by supplied context, not generic helpfulness.",
        "Hybrid retrieval with RRF combines lexical and dense strengths when raw scores are not comparable."
      ],
      nextSteps: [
        "Create ten RAG goldens with relevant chunk ids and answer rubrics.",
        "Compute context recall and precision for dense-only and hybrid retrieval.",
        "Add an unanswerable-query gate that checks abstention and citation behavior."
      ]
    }
  }
};

/** @type {Record<string, import('../learnChapters.js').LessonLearnChapter>} */
export const llmRetrievalLabChapters = JSON.parse(JSON.stringify(chapters));
