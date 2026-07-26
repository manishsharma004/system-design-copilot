/** @type {(...paragraphs: string[]) => string} */
const teachingBody = (...paragraphs) => paragraphs.join('\n\n');

/** @type {Record<string, import('../lessonDeepKnowledge.js').LessonDeepKnowledge>} */
export const aiAdvancedDeepKnowledge = {
  'transformers-attention-lab/attention-from-scratch': {
    insights: [
      {
        heading: 'Attention as content-addressable mixing',
        body: teachingBody(
          `Scaled dot-product attention is a soft lookup: each query asks which keys match, and the matching keys decide how to blend values. For a sequence of length n and head dimension d_k, Q, K, and V are matrices of shape (n, d_k). The score matrix S = Q K^T has shape (n, n); entry (i, j) is the compatibility of destination i with source j. Softmax over each row turns those scores into a probability distribution, and the output row is that distribution times V. Geometrically this is a soft nearest-neighbor retrieve-and-blend over positions, not a fixed local window like a convolution.`,
          `That view explains both power and cost. Because every position can attend to every other position, information can jump across the whole sequence in one layer—useful for long-range dependencies and copy-style tasks. The price is O(n² d_k) compute and O(n²) attention storage for the dense score matrix. When you implement attention from scratch, treat the math contract Attention(Q, K, V) = softmax(Q K^T / sqrt(d_k)) V as a unit-testable API: fixed tiny tensors with hand-computed weights catch transpose bugs faster than waiting for end-to-end loss to look wrong.`
        )
      },
      {
        heading: 'Why divide by sqrt(d_k)',
        body: teachingBody(
          `If query and key components are roughly independent with unit variance, a raw dot product has variance about d_k. As width grows, logits become large in magnitude, softmax saturates toward a one-hot, and gradients through the softmax become tiny. Dividing by sqrt(d_k)—exactly as in Attention Is All You Need—keeps typical logits O(1) so the distribution stays soft enough to learn. A lab that works at d_k = 16 and collapses at d_k = 256 is often missing this scale, not "bad learning rate."`,
          `Scaling is necessary but not sufficient for numerical health. Always subtract the per-row maximum before exp in softmax so large positive scores do not overflow. Mixed precision can still amplify score explosions if Q/K norms drift; monitoring score variance, softmax entropy, and gradient norms while you widen the head is a practical correctness check. Interview answers should name both the variance argument and the gradient/saturation consequence, not only "the paper divides by sqrt(d_k)."`
        )
      },
      {
        heading: 'Masks, shapes, and debugging order',
        body: teachingBody(
          `Illegal positions—padding or future tokens—must be removed before softmax, usually by adding a large negative constant (for example -1e9) to forbidden logits. Masking after softmax and renormalizing is a different, usually wrong, operation. Boolean keep-masks broadcast carefully: a causal lower-triangular pattern of shape (1, 1, n, n) or (batch, heads, n, n) must align with the score tensor. Off-by-one triangular bugs create silent train/serve mismatches that look like "great teacher-forced loss" and broken generation.`,
          `Debug in layers. First verify Q/K/V shapes and that scores are (batch, heads, n, n). Then assert known outputs on a 2×2 hand example. Then inspect attention maps on a synthetic copy or alignment task where the correct focus position is obvious. Only after shapes and focus look right should you chase optimizer or dataset issues. Attention maps are a teaching and debugging lens; they are not a substitute for task metrics, but they catch broken projections long before a full language-model train finishes.`
        )
      },
      {
        heading: 'Complexity and what weights mean',
        body: teachingBody(
          `Standard self-attention is quadratic in sequence length. Doubling context roughly quadruples attention FLOPs and memory for the score matrix, which is why long-context systems invest in sparsity, chunking, linearized attention, or KV-cache engineering rather than naive full attention everywhere. For lab-scale sequences the quadratic cost is fine; for production context windows it is a first-class capacity constraint.`,
          `Attention weights are not guaranteed linguistic "explanations," but on synthetic tasks they are a strong implementation check: a model that should copy a marked token ought to put mass on that source index at the decode step. Averaging heads can hide specialists, so inspect per-head maps when multi-head enters the picture. Treat weight visualization as evidence about information flow under a known task structure, not as proof of human-interpretable reasoning in deep stacks.`
        )
      }
    ],
    references: [
      {
        title: 'Attention Is All You Need',
        url: 'https://arxiv.org/abs/1706.03762',
        source: 'arXiv',
        note: 'Original transformer paper defining scaled dot-product attention, multi-head attention, and the sqrt(d_k) scaling.'
      },
      {
        title: 'The Illustrated Transformer',
        url: 'https://jalammar.github.io/illustrated-transformer/',
        source: 'Jay Alammar',
        note: 'Visual walkthrough of Q/K/V projections, score matrices, and residual block structure.'
      },
      {
        title: 'Formal Algorithms for Transformers',
        url: 'https://arxiv.org/abs/2207.09238',
        source: 'arXiv',
        note: 'Precise pseudocode for attention variants useful when checking shape contracts and mask placement.'
      }
    ]
  },

  'transformers-attention-lab/multi-head-and-blocks': {
    insights: [
      {
        heading: 'Heads as parallel subspaces',
        body: teachingBody(
          `Multi-head attention splits the model width into h heads of dimension d_k = d_model / h (or a configured head size), runs attention independently in each subspace, concatenates the head outputs, and projects back to d_model. The point is not "more attention" in the abstract; it is allowing different heads to specialize on different relations—adjacency, copying, syntax-like links—without forcing a single similarity metric to capture all of them. With fixed d_model, more heads means narrower heads; with fixed d_k, more heads means a wider model.`,
          `Specialization is a hypothesis you should test. Log per-head entropy, run head ablations, and see whether half the heads are dead weight on your task. Redundant heads waste compute and complicate distillation later. In interview settings, explain the reshape path clearly: (batch, n, d_model) → (batch, n, h, d_k) → (batch, h, n, d_k) for attention, then the inverse concat/project. Shape bugs here are as common as math bugs in single-head attention.`
        )
      },
      {
        heading: 'Residual streams and norm placement',
        body: teachingBody(
          `A transformer block is usually attention mixing plus a position-wise MLP, each wrapped in a residual connection. Residuals keep a highway for gradients and for the identity signal so depth can add refinements instead of forcing every layer to re-encode the whole representation. Layer normalization stabilizes activation scale across depth; where you put the norm matters. Post-norm (norm after residual) matches the original paper; pre-norm (norm before sublayers, residual add after) often trains more stably in deep stacks and is common in modern practice.`,
          `When a toy stack goes unstable as you deepen it, try pre-norm before only blaming the learning rate. Residuals and norms are architecture choices with optimization consequences, not cosmetic wrappers. Also keep the residual dtype and scale in mind under mixed precision: a deep residual stream can accumulate large magnitudes if unconstrained. For labs, assert that a zero-initialized output projection leaves the residual path as identity at init so early training does not destroy the input representation.`
        )
      },
      {
        heading: 'MLP capacity between mixing steps',
        body: teachingBody(
          `Attention redistributes information across positions; the feed-forward network applies the same nonlinear transform independently at each position. Typical width is 4× d_model with a GELU or ReLU nonlinearity. Much of a transformer's parameter count and a large share of FLOPs live in these MLPs. Intuitively, attention decides who talks to whom; MLPs decide how each position transforms the mixed message. Removing or shrinking MLPs often hurts more than dropping a few attention heads on many tasks.`,
          `Capacity planning is a trade among depth, width, and head count under a memory/latency budget. More depth increases serial compute and can need norm/residual care; more width increases matmul cost and activation memory; more heads at fixed d_model thins each head. For teaching models, prefer configurations you can fully unit-test: known shapes, residual identity checks, and a small grammar or copy task where head ablation has a readable story.`
        )
      },
      {
        heading: 'Growing capacity without cargo culting',
        body: teachingBody(
          `If the task needs diverse relation types at similar compute, increasing head count at fixed d_model can help until heads become too narrow to be useful. If representations are underpowered, widen d_model or the MLP. If compositionality or hierarchical structure seems missing, add depth—but only with a stable block design. Measure with task metrics and ablations, not with the assumption that every head or layer is sacred.`,
          `Production systems later prune, distill, or fuse heads; lab habits of measuring head usefulness transfer directly. Document what heads appear to do on your synthetic tasks even if those interpretations will not survive at LLM scale. The engineering skill is knowing which knob to turn when loss plateaus, not memorizing a single "best" depth/width/head recipe.`
        )
      }
    ],
    references: [
      {
        title: 'Attention Is All You Need',
        url: 'https://arxiv.org/abs/1706.03762',
        source: 'arXiv',
        note: 'Defines multi-head attention and the encoder/decoder block stack used throughout modern transformers.'
      },
      {
        title: 'On Layer Normalization in the Transformer Architecture',
        url: 'https://arxiv.org/abs/2002.04745',
        source: 'arXiv',
        note: 'Analyzes pre-norm vs post-norm training dynamics relevant when deepening residual stacks.'
      },
      {
        title: 'The Annotated Transformer',
        url: 'https://nlp.seas.harvard.edu/annotated-transformer/',
        source: 'Harvard NLP',
        note: 'Line-by-line implementation notes for attention heads, residuals, and feed-forward sublayers.'
      }
    ]
  },

  'transformers-attention-lab/positional-encoding-and-causal-mask': {
    insights: [
      {
        heading: 'Permutation equivariance without positions',
        body: teachingBody(
          `Pure attention over a bag of token embeddings is permutation-equivariant: shuffling the input order shuffles the output the same way, because scores depend only on content. Language, code, and many algorithms are order-sensitive, so the model needs a positional signal. Absolute sinusoidal encodings add a deterministic vector PE(pos) to each embedding; learned absolute embeddings do the same with parameters; relative and rotary schemes inject position into Q/K interactions so distance structure is built into attention scores.`,
          `Pedagogy should prove need before debating formulas. On a bag-of-words sentiment toy, removing positions may barely hurt; on reverse-string or order-sensitive copy tasks, accuracy collapses. Use that gap to justify positional encodings, then compare absolute sinusoids versus relative/RoPE-style approaches on extrapolation: absolute learned embeddings often struggle past training lengths, while relative/rotary designs are built to generalize more gracefully—with more implementation complexity.`
        )
      },
      {
        heading: 'Sinusoidal structure and RoPE intuition',
        body: teachingBody(
          `The original transformer uses fixed sin/cos functions of different frequencies across dimensions so each position gets a unique pattern and offset relationships are linearly decodable for many distances. You do not need to memorize every frequency formula in an interview, but you should explain that absolute PE is added (or concatenated) before layers and that the model must learn to use it. Plotting a few PE dimensions versus position makes the multi-scale wave structure obvious in a notebook.`,
          `Rotary position embeddings (RoPE) rotate pairs of Q/K dimensions by an angle depending on position so that relative offset affects the dot product. That couples position with attention scores rather than only with the residual stream. For lab work, a minimal RoPE-style rotation on 2D pairs is enough to contrast with absolute addition. Discuss the product trade-off: absolute PE is simple; relative/rotary methods improve length extrapolation and are common in modern LLMs, but mask and cache code must stay consistent with the chosen scheme.`
        )
      },
      {
        heading: 'Causal masks enforce autoregressive factorization',
        body: teachingBody(
          `Language modeling assumes p(x_t | x_<t). Self-attention must therefore prevent position i from attending to j > i. The causal mask is a lower-triangular keep pattern (or upper-triangular forbid pattern, depending on convention): illegal logits get large negative values before softmax. Teacher forcing still feeds the full sequence in parallel, but each position only mixes past context—so training can be batched while respecting the autoregressive dependency.`,
          `Future leakage is a classic silent bug: offline perplexity looks amazing because the model cheats with future tokens, then stepwise decoding fails to match. Unit-test that for every i, weights on j > i are ~0; visualize the allowed triangle; compare teacher-forced metrics against true greedy/sampled decode. Padding masks compose with causal masks: a position may be causal-legal yet still padded content that should not receive mass. Apply both in logit space before softmax.`
        )
      },
      {
        heading: 'Train/serve mask consistency and KV cache',
        body: teachingBody(
          `Generation caches keys and values for past tokens so each new step attends to history without recomputing the whole sequence. The causal structure remains: the new query attends to cached K/V plus its own. Off-by-one errors in cache indexing or in the triangular mask produce subtle mismatches between training and serving. Labs that materialize growing KV arrays for a few decode steps build intuition for why cache layout, dtype, and memory bandwidth dominate LLM inference cost.`,
          `When positions use RoPE, cached K entries must remain consistent with the positions they were computed at; re-rotating incorrectly on read is another serve bug class. Document the position index space (0-based, including special tokens) alongside the mask tests. The operational lesson: positional encoding and causal masking are not "preprocessing fluff"—they are part of the model contract that must match between training graphs and decode kernels.`
        )
      }
    ],
    references: [
      {
        title: 'Attention Is All You Need',
        url: 'https://arxiv.org/abs/1706.03762',
        source: 'arXiv',
        note: 'Introduces sinusoidal positional encodings and the masked decoder attention used for autoregressive generation.'
      },
      {
        title: 'RoFormer: Enhanced Transformer with Rotary Position Embedding',
        url: 'https://arxiv.org/abs/2104.09864',
        source: 'arXiv',
        note: 'Primary reference for rotary position embeddings used in many modern LLMs.'
      },
      {
        title: 'Train Short, Test Long: Attention with Linear Biases Enables Input Length Extrapolation',
        url: 'https://arxiv.org/abs/2108.12409',
        source: 'arXiv',
        note: 'ALiBi paper offering another relative-bias approach to length extrapolation beyond absolute embeddings.'
      }
    ]
  },

  'llm-retrieval-lab/tokenization-workshop': {
    insights: [
      {
        heading: 'Tokenization as learned compression',
        body: teachingBody(
          `Tokenizers turn raw text into integer IDs the model was trained to consume. Subword algorithms—BPE, WordPiece, Unigram—balance vocabulary size against sequence length by keeping frequent chunks intact and splitting rare strings. That is lossy compression with a model-specific codebook: the "same" sentence can become very different ID sequences under different tokenizers, and those IDs are not interchangeable across model families.`,
          `Special tokens, normalization (Unicode, lowercasing, space markers), and pre-tokenization rules are part of the contract. Hand-editing token IDs without understanding BOS/EOS, padding, or mask tokens corrupts inputs silently. In RAG and agents, count tokens with the same tokenizer the model uses; character or whitespace heuristics drift from billed context and truncate mid-subword in surprising ways.`
        )
      },
      {
        heading: 'Fertility drives cost and fairness',
        body: teachingBody(
          `Fertility—tokens per word or per character—determines how fast you burn context length and money. Code with long identifiers, JSON, and some non-English scripts often tokenize poorly under general English-centric vocabularies, so a fixed character budget becomes an unfair or inefficient token budget. Measure fertility on your real corpora (code vs prose vs languages) before blaming the model for "short" context.`,
          `Product limits should follow tokens, not characters, and may need language-aware or domain-aware policy. A code-oriented tokenizer or light preprocessing (normalizing identifiers, stripping inert boilerplate) can fit more useful signal per window than blindly buying a longer context. Interview answers that connect tokenization to latency, cost, and multilingual equity score higher than answers that treat tokenizers as an opaque library call.`
        )
      },
      {
        heading: 'Domain mismatch and vocab strategy',
        body: teachingBody(
          `Medical notes, legalese, log lines, and programming languages expose domain mismatch: pieces that should be atomic split into many tokens, while irrelevant common words occupy vocab slots. Options include continuing tokenizer training / adding vocab for a domain (with embedding resize and continued model training), choosing a model whose tokenizer already fits the domain, or accepting higher fertility and budgeting for it. There is no free lunch—new tokens need learned embeddings.`,
          `When evaluating tokenizer changes, track not only compression but downstream retrieval and generation quality. A more compact tokenization that destroys meaningful boundaries can hurt. Round-trip encode/decode fidelity, unknown-token rates, and fertility by slice are the basic dashboard. Never assume two "open" models share tokenization even if both claim similar parameter counts.`
        )
      },
      {
        heading: 'Debugging tokenization in systems',
        body: teachingBody(
          `Many "model bugs" are tokenizer bugs: truncated prompts, split markers that break tool formats, whitespace-sensitive chat templates, or mismatched pad/eos handling between training and inference. Log the tokenized prompt in staging (IDs and decoded pieces) when outputs look inexplicable. For constrained formats (JSON tools, SQL), verify that structural characters are single tokens or at least stably tokenized so constrained decoding remains feasible.`,
          `In interviews and design docs, state which tokenizer version ships with the model, how context limits are enforced, and how user-visible character limits map to tokens. Tokenization is the first stage of every LLM system; treating it as infrastructure with metrics prevents expensive misdiagnosis further down the stack.`
        )
      }
    ],
    references: [
      {
        title: 'Neural Machine Translation of Rare Words with Subword Units',
        url: 'https://arxiv.org/abs/1508.07909',
        source: 'arXiv',
        note: 'Foundational BPE subword paper underlying many modern tokenizers.'
      },
      {
        title: 'Hugging Face Tokenizers documentation',
        url: 'https://huggingface.co/docs/tokenizers/index',
        source: 'Hugging Face',
        note: 'Practical reference for BPE, WordPiece, Unigram pipelines, normalization, and encoding APIs.'
      },
      {
        title: 'SentencePiece: A simple and language independent subword tokenizer',
        url: 'https://arxiv.org/abs/1808.06226',
        source: 'arXiv',
        note: 'Widely used Unigram/BPE toolkit especially common in multilingual settings.'
      }
    ]
  },

  'llm-retrieval-lab/embeddings-and-similarity-lab': {
    insights: [
      {
        heading: 'Geometry depends on the metric contract',
        body: teachingBody(
          `Dense embeddings place text in a vector space where nearby points should be semantically related for your task. Cosine similarity cares about angle; dot product cares about angle and magnitude; Euclidean distance is another geometry again. If you L2-normalize vectors, cosine similarity and inner product agree. If you do not normalize but your ANN index assumes inner product, offline cosine experiments will not match online ranking.`,
          `Standardize the contract: train or evaluate with the same similarity the index uses, document normalization in the index config, and freeze that choice across offline eval, online retrieval, and re-ranking. Metric mismatch is one of the highest-frequency reasons "embedding improvements" disappear in production. For hybrid search, keep dense scores calibrated or fused carefully with BM25 so one channel does not dominate by raw scale.`
        )
      },
      {
        heading: 'Hard negatives sharpen the boundary',
        body: teachingBody(
          `Random in-batch negatives are often too easy: the model only learns coarse topical separation. Hard negatives—near neighbors that are wrong for the query, such as refund shipping delays versus refund payment failures in an FAQ—force the embedding space to separate confusable intents. Mine them from a current index (top-k wrong documents), review for label noise, and retrain or fine-tune with those pairs.`,
          `Error analysis should feed the next mining round. If the same confusion class keeps winning, add targeted pairs or fix chunking so documents are not mixing intents. Easy-pair loss curves can look healthy while retrieval@k stays flat; always judge embeddings with retrieval metrics on a labeled query set, not only with intrinsic similarity on hand-picked examples.`
        )
      },
      {
        heading: 'Intrinsic scores need extrinsic eval',
        body: teachingBody(
          `A high cosine between two sentences is meaningless if your task is FAQ retrieval, code search, or entity-heavy support tickets. Build golden queries with relevant document IDs and report recall@k, MRR, or nDCG. Slice by query type: navigational, conceptual, long-tail, adversarial paraphrases. Domain fine-tuning of a smaller embedding model often beats a larger general model on niche corpora when the eval matches production queries.`,
          `Watch for train/eval leakage in embedding experiments too: queries paraphrased from the same template, or documents duplicated across splits, inflate metrics. When chunking changes, re-embed and re-eval; comparing scores across incompatible chunk inventories is not an A/B. The lab habit is closed-loop: change representation → rebuild index → measure retrieval → mine new hard negatives.`
        )
      },
      {
        heading: 'Operational properties of embedding spaces',
        body: teachingBody(
          `Embedding dimension, quantization, and ANN parameters (HNSW M/ef, IVF lists, etc.) trade recall for latency and memory. Dimensionality reduction or int8/PQ compression can be fine if you re-validate recall@k. Version embeddings with model ID and chunking config; mixing vectors from two models in one index is undefined geometry. Schedule re-embeds when the encoder changes, and dual-read during migrations.`,
          `Also monitor query embedding drift and empty-result rates. Sudden shifts may mean tokenizer/model skew between services, not "users changed." Treat the embedding service as a versioned contract: input text normalization, max tokens, similarity metric, and vector dim are as important as the neural weights.`
        )
      }
    ],
    references: [
      {
        title: 'Sentence-BERT: Sentence Embeddings using Siamese BERT-Networks',
        url: 'https://arxiv.org/abs/1908.10084',
        source: 'arXiv',
        note: 'Core method paper for efficient sentence embeddings widely used in retrieval systems.'
      },
      {
        title: 'Dense Passage Retrieval for Open-Domain Question Answering',
        url: 'https://arxiv.org/abs/2004.04906',
        source: 'arXiv',
        note: 'DPR framework showing dual-encoder training and retrieval evaluation for QA.'
      },
      {
        title: 'scikit-learn: Cosine similarity',
        url: 'https://scikit-learn.org/stable/modules/metrics.html#cosine-similarity',
        source: 'scikit-learn',
        note: 'Concise definition of cosine similarity and related pairwise metrics used in labs and baselines.'
      }
    ]
  },

  'llm-retrieval-lab/rag-evaluation-workshop': {
    insights: [
      {
        heading: 'Retrieval quality is the ceiling',
        body: teachingBody(
          `RAG systems have at least two stages: retrieve evidence, then generate an answer conditioned on that evidence. If the right chunks never enter the context window, no prompt tweak can ground the answer in them. Measure recall@k, precision@k, and nDCG on a labeled retrieval set before spending weeks on prompt wording. Component metrics turn "the bot is wrong" into "chunking misses section headers" or "hybrid fusion under-weights BM25."`,
          `End-to-end scores alone conflate failures. An LLM-as-judge helpfulness number can stay flat while you fix retrieval, or look good while the model hallucinates fluently past weak evidence. Always keep a retrieval dashboard next to answer quality. The practical rule: raise the retrieval ceiling first, then tune generation under the constraint of real top-k context.`
        )
      },
      {
        heading: 'Faithfulness versus fluency',
        body: teachingBody(
          `Users punish confident fabrication more than short refusals. Faithfulness/groundedness checks ask whether claims in the answer are supported by retrieved snippets—via NLI-style models, citation coverage, or LLM-as-judge protocols that only see the evidence. Helpfulness without faithfulness rewards eloquent lies. Make groundedness a release gate alongside latency and cost.`,
          `Design failure modes deliberately: refuse when evidence is weak, ask a clarifying question when the query is ambiguous, or cite snippets so users can verify. Adversarial and out-of-corpus queries belong in the golden set. A demo that answers everything from parametric memory is not a RAG success; it is an untested hallucination path.`
        )
      },
      {
        heading: 'Golden sets need coverage, not vanity',
        body: teachingBody(
          `A useful eval set covers navigational lookups, conceptual how-to questions, multi-hop needs, near-duplicate FAQs, and adversarial paraphrases. Include cases where the correct answer is "not in corpus." Size matters less than diversity and label quality: fifty well-labeled queries with document IDs beat five hundred noisy ones. Version the set with corpus snapshots so you know whether a regression is model or data.`,
          `Attribute failures: retrieval miss, correctly retrieved but poorly ranked, context truncated, prompt ignores citation, or generator invents unsupported detail. Attribution drives the backlog—chunk size, hybrid search, re-ranker, or generation policy. Without attribution, teams thrash on the wrong stage.`
        )
      },
      {
        heading: 'Online feedback closes the loop',
        body: teachingBody(
          `Offline golden sets lag product reality. Log retrieval IDs, clicked citations, explicit thumbs, and downstream task success (ticket resolved, checkout completed). Use them to sample hard queries for human labeling, not as unconstrained automatic training labels without review. Canary new chunking or embedding versions on traffic slices with paired retrieval and groundedness metrics.`,
          `RAG evaluation is a product discipline: own the metrics, the failure taxonomy, and the gates. Interview-ready answers separate recall@k from answer correctness, name faithfulness checks, and describe how production logs refresh the eval set. That story is more credible than claiming a single BLEU-like number for the whole system.`
        )
      }
    ],
    references: [
      {
        title: 'Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks',
        url: 'https://arxiv.org/abs/2005.11401',
        source: 'arXiv',
        note: 'Original RAG paper framing retrieval-conditioned generation for knowledge-intensive tasks.'
      },
      {
        title: 'RAGAS: Automated Evaluation of Retrieval Augmented Generation',
        url: 'https://arxiv.org/abs/2309.15217',
        source: 'arXiv',
        note: 'Practical metrics framing for faithfulness, answer relevance, and context quality in RAG systems.'
      },
      {
        title: 'Measuring Attribution in Natural Language Generation',
        url: 'https://arxiv.org/abs/2112.12870',
        source: 'arXiv',
        note: 'Research foundation for attributing generated claims to evidence—core to groundedness evaluation.'
      }
    ]
  },

  'ml-production-lab/leakage-safe-pipelines': {
    insights: [
      {
        heading: 'Leakage makes offline metrics liars',
        body: teachingBody(
          `Data leakage lets the model see information at training or validation time that would not be available at honest prediction time. Classic forms include label leakage (features that are proxies for the target), time-travel features (values filled only after the event), and group leakage (same customer, patient, or session in both train and test). The symptom is stellar offline AUC that collapses in a shadow deploy. Treat leakage as a release-blocking defect, not a modeling footnote.`,
          `The mental model is a prediction-time contract: for each row, define the timestamp and entity state that would be visible to a production service. Any feature whose provenance violates that contract is illegal. ETL convenience fields—next_month_ticket_count, settlement_status_final, post-hoc fraud_queue_flag—are frequent offenders because warehouses join history for analytics, not for point-in-time serving.`
        )
      },
      {
        heading: 'Point-in-time joins and entity splits',
        body: teachingBody(
          `Point-in-time correct feature joins ensure that for prediction time t, only events strictly before t (or before t minus a policy lag) contribute. Feature stores and as-of join logic exist to enforce this; notebooks that merge full history on entity ID do not. Unit-test a few entities with known event timelines: a feature computed "as of Tuesday" must ignore Wednesday's payment.`,
          `Split by the generalization unit you will see in production. If the service scores new customers, random ticket-level splits leak writing style and history across folds—use GroupKFold or hash assignment on customer_id. Time-based splits catch temporal leakage and concept shift; nested CV keeps hyperparameter search from overfitting the test fold. Stratifying labels alone does not fix entity leakage.`
        )
      },
      {
        heading: 'Target proxies and silent channels',
        body: teachingBody(
          `Some features are not the label but are causally downstream of it: chargebacks after fraud, cancellation reason codes after churn, clinician notes written after diagnosis. Others encode operational reactions to the label. Correlation with the target is a red flag, not a victory. Ablation and time-shift tests help: if shifting a feature later in time destroys performance, it may have been leaking future information.`,
          `Also watch preprocessing leakage: fitting scalers, imputers, or target encoders on the full dataset before splitting, or using rare-category statistics computed with test rows. sklearn Pipelines with ColumnTransformer inside cross-validation folds exist specifically so fitting happens only on training folds. A leakage audit checklist belongs in CI for training jobs: schema checks, timestamp asserts, group split enforcement, and forbidden-column denylists.`
        )
      },
      {
        heading: 'When metrics drop after fixing leakage',
        body: teachingBody(
          `Honest pipelines often look worse offline. That is success: you removed fantasy performance. Recalibrate stakeholder expectations, compare to a simple baseline under the same honest split, and invest in features that are legally available at serve time. Shadow traffic and delayed-label evaluation validate that the new offline number predicts reality.`,
          `Document the prediction-time contract next to the model card: entity keys, cutoff rules, feature versions, and split policy. Future contributors should not reintroduce next_month_* columns because an analyst dashboard exposed them. Leakage safety is a property of the pipeline and culture, not a one-time notebook cleanup.`
        )
      }
    ],
    references: [
      {
        title: 'scikit-learn: Cross-validation estimators and Pipelines',
        url: 'https://scikit-learn.org/stable/modules/cross_validation.html',
        source: 'scikit-learn',
        note: 'Authoritative guidance on fitting preprocessing only within training folds to avoid leakage.'
      },
      {
        title: 'scikit-learn: GroupKFold',
        url: 'https://scikit-learn.org/stable/modules/generated/sklearn.model_selection.GroupKFold.html',
        source: 'scikit-learn',
        note: 'API for entity-aware splits that keep related samples out of both train and test.'
      },
      {
        title: 'Feature Store design and point-in-time correctness',
        url: 'https://www.tecton.ai/blog/feature-store/',
        source: 'Tecton',
        note: 'Practical discussion of point-in-time joins and training/serving consistency for features.'
      }
    ]
  },

  'ml-production-lab/drift-and-monitoring-lab': {
    insights: [
      {
        heading: 'Three drifts, three responses',
        body: teachingBody(
          `Data drift is a change in input distribution P(X). Prediction drift is a change in model output distribution P(Ŷ) or score histograms. Concept drift is a change in P(Y|X)—the meaning of features relative to labels. They are not interchangeable. A UI redesign can shift clicks (data drift) while the ranking function remains fine; a policy change can keep features stable while labels flip meaning (concept drift). Detectors and playbooks must distinguish these cases.`,
          `Population Stability Index, KS tests, and embedding-distance monitors catch input and prediction shifts. Outcome proxies—CTR, conversion, chargeback rate—with sufficient delay catch concept issues. Blind auto-retrain on PSI alone creates thrash: you may fit a transient campaign spike or amplify bias. Require evidence that the mapping to outcomes degraded, or that a known schema/policy change landed, before heavy retrain.`
        )
      },
      {
        heading: 'Slices beat global averages',
        body: teachingBody(
          `Global AUC or MAE can hold while a critical slice collapses: new users, one country, mobile clients, a single SKU category. Product launches and embedding refreshes often harm a localized cohort first. Monitor slices with dedicated thresholds and volume floors so noisy tiny segments do not page you constantly while still catching concentrated harm.`,
          `Choose slices from business risk and known change surfaces, not from every categorical column. Pair with ownership: who gets paged, what dashboard they open, and whether the first action is investigate, mitigate (fallback), retrain, or rollback. Slice alerts without playbooks become ignored noise.`
        )
      },
      {
        heading: 'Label delay and proxy metrics',
        body: teachingBody(
          `Many labels arrive late—fraud weeks later, credit default months later, long-term retention even later. You cannot wait for perfect labels to know the model is broken today. Use leading proxies that historically correlate with the delayed label, plus human review samples, while being explicit about proxy risk. Short-term CTR is not long-term satisfaction; treat proxy moves as hypotheses.`,
          `For delayed labels, maintain a maturation window in evaluation: compare predictions only against labels that have had time to settle, and track performance by cohort age. Shadow modes and champion/challenger setups help validate a retrain before cutover when labels are slow. Document the delay so on-call does not expect same-day ground truth that cannot exist.`
        )
      },
      {
        heading: 'Alerts must map to actions',
        body: teachingBody(
          `Every monitor should answer: what changed, how bad, who acts, and what the allowed actions are. Investigate means check schema, upstream ETL, and traffic composition. Retrain means a controlled pipeline with honest splits and approval. Rollback means revert model or feature version under the serving contract. If an alert has no action, delete or demote it.`,
          `Good lab practice is to simulate a drift event—feature mean shift, score inflation, slice failure—and walk the playbook on a toy dashboard. Production ML reliability is operational design: detectors, slices, proxies, and decisions wired together, not a single KS p-value printed in a notebook.`
        )
      }
    ],
    references: [
      {
        title: 'Dataset Shift in Machine Learning',
        url: 'https://mitpress.mit.edu/9780262170055/dataset-shift-in-machine-learning/',
        source: 'MIT Press',
        note: 'Book-length treatment of covariate shift, concept drift, and related dataset shift formalisms.'
      },
      {
        title: 'Evidently / data drift documentation',
        url: 'https://docs.evidentlyai.com/user-guide/data-drift/',
        source: 'Evidently AI',
        note: 'Practical metrics and workflows for detecting and reporting data and prediction drift.'
      },
      {
        title: 'Google ML Rules — Monitor and maintain',
        url: 'https://developers.google.com/machine-learning/guides/rules-of-ml',
        source: 'Google Developers',
        note: 'Engineering rules of thumb for production ML monitoring, ownership, and iteration discipline.'
      }
    ]
  },

  'ml-production-lab/serving-contracts-lab': {
    insights: [
      {
        heading: 'A model without a contract is a notebook',
        body: teachingBody(
          `Serving contracts specify what clients may send, what they receive, how fast, how wrong it can be, and what happens when dependencies fail. Schemas for features and responses, latency/availability SLOs, score semantics (calibrated probability vs rank vs logit), version identifiers, and fallback behavior belong in the contract. Without them, every deploy is a negotiation by outage.`,
          `Write the contract so a client engineer can integrate without reading training code. Include units, value ranges, missing-feature policy, and whether higher scores are better. If marketing interprets a 0.7 score as "70% probability" but the model emits an uncalibrated margin, you have a product bug even when the ranking quality is fine.`
        )
      },
      {
        heading: 'Schema evolution and train/serve parity',
        body: teachingBody(
          `Feature schemas should evolve with compatibility rules: additive optional fields, explicit versions, and logging of unknown keys. Silent drops of new client fields create invisible training-serving skew—the model never sees the feature online that analysts see offline. Breaking changes require a version bump, dual publish, or coordinated rollout, not a quiet rename.`,
          `Parity checks compare training-time feature vectors to online materialization for the same entity and timestamp. Thresholded diffs on critical features catch ETL drift early. The serving contract should name the feature producer (client, feature store, join job) and the model consumer version so skew has an owner.`
        )
      },
      {
        heading: 'SLOs, degradation, and fallbacks',
        body: teachingBody(
          `Personalization that hard-fails the homepage when the feature store times out is usually worse than a product-approved fallback: cached scores, popular lists, or last-known rankings within latency SLO. Degradation must be explicit, metered, and reversible. Emit a degradation metric and customer-visible quality loss estimate so reliability work is prioritized with data.`,
          `Latency SLOs drive batching, caching, model size, and hardware choices. A contract that promises p95 50 ms cannot casually pull a 200 ms LLM call without an async redesign. Timeouts, bulkheads, and default responses are part of the model product, not only the platform team's concerns.`
        )
      },
      {
        heading: 'Versioning enables shadow, canary, rollback',
        body: teachingBody(
          `Immutable model versions with pinned feature schemas make shadow traffic, canaries, and rollbacks possible. Publish model_id in responses (or logs) so errors can be attributed. Canary on slices that matter; compare not only aggregate AUC proxies but contract-level error budgets—timeouts, schema failures, fallback rates. Roll back on contract breach even if a vanity offline metric improved.`,
          `Clients should pin to compatible contract versions or negotiate ranges. The anti-pattern is "always call /predict" with undocumented shifting semantics. Serving-contract labs should practice a schema-additive change, a canary, a forced dependency failure hitting fallback, and a rollback—each with the metrics you would show in an incident review.`
        )
      }
    ],
    references: [
      {
        title: 'Hidden Technical Debt in Machine Learning Systems',
        url: 'https://papers.nips.cc/paper/2015/hash/86df7dcfd896faf2674f757a76b83c41-Abstract.html',
        source: 'NeurIPS',
        note: 'Classic paper on entanglement, feedback loops, and infrastructure debt around deployed models.'
      },
      {
        title: 'Semantically Versioned ML Models',
        url: 'https://www.tensorflow.org/tfx/guide/versioning',
        source: 'TensorFlow Extended',
        note: 'Practical guidance on model artifacts, pipelines, and versioned deployments in production ML.'
      },
      {
        title: 'SRE Book — Service Level Objectives',
        url: 'https://sre.google/sre-book/service-level-objectives/',
        source: 'Google SRE Book',
        note: 'Framework for SLIs/SLOs/error budgets that applies cleanly to model serving reliability.'
      }
    ]
  }
};
