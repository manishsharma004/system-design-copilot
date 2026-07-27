/** @type {Record<string, import('../learnChapters.js').LessonLearnChapter>} */
export const transformersAttentionLabChapters = {
  "transformers-attention-lab/attention-from-scratch": {
    "title": "Chapter: Scaled dot-product attention from scratch",
    "readingTime": "60-75 min",
    "premise": "Implement queries, keys, values, scaling, softmax, and masks to compute attention outputs with NumPy. This Learn chapter expands the short lesson summary into a full study unit you can read continuously, with interactive checks and selection-based AI search when a phrase needs a second opinion.",
    "parts": [
      {
        "id": "orientation",
        "heading": "Why this chapter exists",
        "paragraphs": [
          "Attention is the core primitive behind transformers. If you can compute a tiny attention pass by hand and in NumPy, interview discussions about LLMs stop being buzzwords and become shape-checked algorithms.",
          "This chapter treats \"Scaled dot-product attention from scratch\" as a readable study unit: intuition first, then the mechanics you must be able to explain, then the failure modes that show up in interviews and production, and finally how to talk about the topic under time pressure.",
          "Read it like a book chapter. When a phrase is unclear, select it inside the Learn reader and use Search with AI to open Google, Perplexity, or DuckDuckGo without abandoning the chapter."
        ],
        "callout": {
          "tone": "tip",
          "body": "Target reading time is paced for depth, not skimming. Pause at each Check yourself prompt and answer out loud before revealing the guide answer."
        }
      },
      {
        "id": "attention-redistributes-information-across-positions",
        "heading": "Attention redistributes information across positions",
        "paragraphs": [
          "Attention answers a simple question for every position: given what I am looking for, which other positions should I read, and how much? In transformers, each token produces three vectors: a query (what I need), keys (what each position offers), and values (the content to mix). Suppose we have three tokens with embedding dimension 4. Queries Q have shape (3, 4), keys K have shape (3, 4), and values V have shape (3, 4). The similarity matrix is scores = Q @ K.T with shape (3, 3). Entry (i, j) is how well query i matches key j. If row 0 of scores is [2.0, 0.1, -1.0], token 0 strongly prefers token 0, weakly considers token 1, and almost ignores token 2. Softmax turns those scores into weights that sum to 1, then the output for token 0 is a weighted sum of value rows. That is content-based routing: the network learns which contexts matter instead of relying only on fixed local windows like convolutions. Geometrically, each query is a probe in key space; the softmax is a soft nearest-neighbor lookup; the values are what get retrieved and blended.",
          "Hold these points explicitly while you study. Restate each one without looking at the list — recognition is not the interview bar; recall is.",
          "• Queries ask; keys advertise; values carry the payload that gets mixed.",
          "• Score matrices have shape (sequence_length, sequence_length) for one head and one example.",
          "• Softmax weights are a probability distribution over source positions for each destination.",
          "Production lens — Attention as content-addressable mixing: Scaled dot-product attention is a soft lookup: each query asks which keys match, and the matching keys decide how to blend values. For a sequence of length n and head dimension d_k, Q, K, and V are matrices of shape (n, d_k). The score matrix S = Q K^T has shape (n, n); entry (i, j) is the compatibility of destination i with source j. Softmax over each row turns those scores into a probability distribution, and the output row is that distribution times V. Geometrically this is a soft nearest-neighbor retrieve-and-blend over positions, not a fixed local window like a convolution.\n\nThat view explains both power and cost. Because every position can attend to every other position, information can jump across the whole sequence in one layer—useful for long-range dependencies and copy-style tasks. The price is O(n² d_k) compute and O(n²) attention storage for the dense score matrix. When you implement attention from scratch, treat the math contract Attention(Q, K, V) = softmax(Q K^T / sqrt(d_k)) V as a unit-testable API: fixed tiny tensors with hand-computed weights catch transpose bugs faster than waiting for end-to-end loss to look wrong."
        ],
        "keyTerms": [
          {
            "term": "Queries ask; keys advertise; values carry",
            "definition": "Queries ask; keys advertise; values carry the payload that gets mixed."
          },
          {
            "term": "Score matrices have shape (sequence_length, s…",
            "definition": "Score matrices have shape (sequence_length, sequence_length) for one head and one example."
          },
          {
            "term": "Softmax weights are a probability distribution",
            "definition": "Softmax weights are a probability distribution over source positions for each destination."
          }
        ],
        "workedExample": {
          "title": "Tiny attention without scaling",
          "body": "Narrate what each shape and step is doing. If you only recognize the API call, you do not own the idea yet — rewrite the example from memory after one pass.",
          "code": "import numpy as np\n\nrng = np.random.default_rng(0)\nseq_len, d = 3, 4\nQ = rng.normal(size=(seq_len, d))\nK = rng.normal(size=(seq_len, d))\nV = rng.normal(size=(seq_len, d))\nscores = Q @ K.T\nweights = np.exp(scores - scores.max(axis=1, keepdims=True))\nweights = weights / weights.sum(axis=1, keepdims=True)\nout = weights @ V\nprint('scores:\\n', scores.round(3))\nprint('weights:\\n', weights.round(3))\nprint('output shape:', out.shape)",
          "language": "python"
        },
        "checkYourself": [
          {
            "prompt": "Can write softmax-stable scaled dot-product attention in NumPy.",
            "reveal": "Scaled dot-product attention is a soft lookup: each query asks which keys match, and the matching keys decide how to blend values. For a sequence of length n and head dimension d_k, Q, K, and V are matrices of shape (n, d_k). The score matrix S = Q K^T has shape (n, n); entry (i, j) is the compatibility of destination i with source j. Softmax over each row turns those scores into a probability distribution, and the output row is that distribution times V. Geometrically this is a soft nearest-neighbor retrieve-and-blend over positions, not a fixed local window like a convolution.\n\nThat view explains both power and cost. Because every position can attend to every other position, information can jump across the whole sequence in one layer—useful for long-range dependencies and copy-style tasks. The price is O(n² d_k) compute and O(n²) attention storage for the dense score matrix. When you implement attention from scratch, treat the math contract Attention(Q, K, V) = softmax(Q K^T / sqrt(d_k)) V as a unit-testable API: fixed tiny tensors with hand-computed weights catch transpose bugs faster than waiting for end-to-end loss to look wrong."
          }
        ]
      },
      {
        "id": "scaling-by-sqrt-d-k-keeps-softmax-in-a-useful-range",
        "heading": "Scaling by sqrt(d_k) keeps softmax in a useful range",
        "paragraphs": [
          "Dot products grow with dimension. If each component of q and k is roughly unit-variance, q · k has variance about d_k. For d_k = 64, raw scores can easily reach tens. Softmax of large magnitudes saturates: one weight becomes almost 1 and the rest almost 0, and the gradient through softmax becomes tiny. Scaling divides scores by sqrt(d_k) so typical logits stay O(1). Numerically: if scores are [8, 2, 1], softmax is dominated by 8. After dividing by 8 (sqrt of 64), scores become [1.0, 0.25, 0.125], and the distribution is softer. Interview answers should mention both numerical stability and gradient health. Implementations usually compute softmax(QK^T / sqrt(d_k))V. Always subtract the row max before exp for stability; scaling alone does not prevent overflow if scores are still large. When d_k is small, scaling changes less; when d_k is large, it is essential.",
          "Hold these points explicitly while you study. Restate each one without looking at the list — recognition is not the interview bar; recall is.",
          "• Divide attention logits by sqrt(d_k) before softmax.",
          "• Saturation makes attention nearly hard argmax and slows learning.",
          "• Stable softmax subtracts the per-row maximum before the exponential.",
          "Production lens — Why divide by sqrt(d_k): If query and key components are roughly independent with unit variance, a raw dot product has variance about d_k. As width grows, logits become large in magnitude, softmax saturates toward a one-hot, and gradients through the softmax become tiny. Dividing by sqrt(d_k)—exactly as in Attention Is All You Need—keeps typical logits O(1) so the distribution stays soft enough to learn. A lab that works at d_k = 16 and collapses at d_k = 256 is often missing this scale, not \"bad learning rate.\"\n\nScaling is necessary but not sufficient for numerical health. Always subtract the per-row maximum before exp in softmax so large positive scores do not overflow. Mixed precision can still amplify score explosions if Q/K norms drift; monitoring score variance, softmax entropy, and gradient norms while you widen the head is a practical correctness check. Interview answers should name both the variance argument and the gradient/saturation consequence, not only \"the paper divides by sqrt(d_k).\""
        ],
        "keyTerms": [
          {
            "term": "Divide attention logits by sqrt(d_k) before",
            "definition": "Divide attention logits by sqrt(d_k) before softmax."
          },
          {
            "term": "Saturation makes attention nearly hard argmax",
            "definition": "Saturation makes attention nearly hard argmax and slows learning."
          },
          {
            "term": "Stable softmax subtracts the per-row maximum",
            "definition": "Stable softmax subtracts the per-row maximum before the exponential."
          }
        ],
        "workedExample": {
          "title": "See scaling change softmax sharpness",
          "body": "Narrate what each shape and step is doing. If you only recognize the API call, you do not own the idea yet — rewrite the example from memory after one pass.",
          "code": "import numpy as np\n\ndef softmax(x, axis=-1):\n    x = x - np.max(x, axis=axis, keepdims=True)\n    e = np.exp(x)\n    return e / e.sum(axis=axis, keepdims=True)\n\nd_k = 64\nraw = np.array([[8.0, 2.0, 1.0]])\nprint('raw softmax:', softmax(raw).round(4))\nprint('scaled softmax:', softmax(raw / np.sqrt(d_k)).round(4))",
          "language": "python"
        },
        "checkYourself": [
          {
            "prompt": "Can explain why dividing by sqrt(d_k) matters for large head dimensions.",
            "reveal": "If query and key components are roughly independent with unit variance, a raw dot product has variance about d_k. As width grows, logits become large in magnitude, softmax saturates toward a one-hot, and gradients through the softmax become tiny. Dividing by sqrt(d_k)—exactly as in Attention Is All You Need—keeps typical logits O(1) so the distribution stays soft enough to learn. A lab that works at d_k = 16 and collapses at d_k = 256 is often missing this scale, not \"bad learning rate.\"\n\nScaling is necessary but not sufficient for numerical health. Always subtract the per-row maximum before exp in softmax so large positive scores do not overflow. Mixed precision can still amplify score explosions if Q/K norms drift; monitoring score variance, softmax entropy, and gradient norms while you widen the head is a practical correctness check. Interview answers should name both the variance argument and the gradient/saturation consequence, not only \"the paper divides by sqrt(d_k).\""
          }
        ]
      },
      {
        "id": "masks-tell-attention-which-positions-are-illegal",
        "heading": "Masks tell attention which positions are illegal",
        "paragraphs": [
          "Not every position should be visible. Padding tokens must not receive mass. In causal language modeling, position i must not see future tokens j > i. The standard trick is to add a large negative number, often -1e9, to masked logits before softmax so those weights become ~0. Example: scores row [1.2, 0.4, 2.0] with causal mask allowing only the first two positions becomes [1.2, 0.4, -1e9]. After softmax the third weight is approximately 0. Boolean masks are easier to reason about: True means keep, False means mask. Broadcasting matters in batches: a mask of shape (batch, 1, seq, seq) can apply the same pattern to every head. In interviews, distinguish padding masks (content-dependent length) from causal masks (architecture/task constraint). Also note that masking after softmax and renormalizing is different from masking logits; logit masking is the usual correct approach.",
          "Hold these points explicitly while you study. Restate each one without looking at the list — recognition is not the interview bar; recall is.",
          "• Add large negatives to forbidden logits before softmax.",
          "• Causal masks are lower-triangular for autoregressive decoding.",
          "• Padding masks prevent empty positions from polluting context.",
          "Production lens — Masks, shapes, and debugging order: Illegal positions—padding or future tokens—must be removed before softmax, usually by adding a large negative constant (for example -1e9) to forbidden logits. Masking after softmax and renormalizing is a different, usually wrong, operation. Boolean keep-masks broadcast carefully: a causal lower-triangular pattern of shape (1, 1, n, n) or (batch, heads, n, n) must align with the score tensor. Off-by-one triangular bugs create silent train/serve mismatches that look like \"great teacher-forced loss\" and broken generation.\n\nDebug in layers. First verify Q/K/V shapes and that scores are (batch, heads, n, n). Then assert known outputs on a 2×2 hand example. Then inspect attention maps on a synthetic copy or alignment task where the correct focus position is obvious. Only after shapes and focus look right should you chase optimizer or dataset issues. Attention maps are a teaching and debugging lens; they are not a substitute for task metrics, but they catch broken projections long before a full language-model train finishes."
        ],
        "keyTerms": [
          {
            "term": "Add large negatives to forbidden logits",
            "definition": "Add large negatives to forbidden logits before softmax."
          },
          {
            "term": "Causal masks are lower-triangular for autoreg…",
            "definition": "Causal masks are lower-triangular for autoregressive decoding."
          },
          {
            "term": "Padding masks prevent empty positions from",
            "definition": "Padding masks prevent empty positions from polluting context."
          }
        ],
        "workedExample": {
          "title": "Apply a causal mask before softmax",
          "body": "Narrate what each shape and step is doing. If you only recognize the API call, you do not own the idea yet — rewrite the example from memory after one pass.",
          "code": "import numpy as np\n\ndef softmax(x, axis=-1):\n    x = x - np.max(x, axis=axis, keepdims=True)\n    e = np.exp(x)\n    return e / e.sum(axis=axis, keepdims=True)\n\nscores = np.array([[1.2, 0.4, 2.0], [0.1, 1.5, 0.3], [0.2, 0.2, 0.9]])\ncausal = np.tril(np.ones_like(scores)).astype(bool)\nmasked = np.where(causal, scores, -1e9)\nprint('masked scores:\\n', masked)\nprint('causal weights:\\n', softmax(masked).round(3))",
          "language": "python"
        },
        "checkYourself": [
          {
            "prompt": "Can apply causal or padding masks via large negative logits.",
            "reveal": "Illegal positions—padding or future tokens—must be removed before softmax, usually by adding a large negative constant (for example -1e9) to forbidden logits. Masking after softmax and renormalizing is a different, usually wrong, operation. Boolean keep-masks broadcast carefully: a causal lower-triangular pattern of shape (1, 1, n, n) or (batch, heads, n, n) must align with the score tensor. Off-by-one triangular bugs create silent train/serve mismatches that look like \"great teacher-forced loss\" and broken generation.\n\nDebug in layers. First verify Q/K/V shapes and that scores are (batch, heads, n, n). Then assert known outputs on a 2×2 hand example. Then inspect attention maps on a synthetic copy or alignment task where the correct focus position is obvious. Only after shapes and focus look right should you chase optimizer or dataset issues. Attention maps are a teaching and debugging lens; they are not a substitute for task metrics, but they catch broken projections long before a full language-model train finishes."
          }
        ]
      },
      {
        "id": "implement-scaled-dot-product-attention-as-one-function",
        "heading": "Implement scaled dot-product attention as one function",
        "paragraphs": [
          "A clean implementation makes shapes explicit. Inputs Q, K, V each have shape (seq, d_k) for a single head, or (batch, heads, seq, d_k) in production code. Compute scores = Q @ K.swapaxes(-1, -2) / sqrt(d_k). Apply mask if provided. Softmax over the last axis. Multiply by V. Work a numeric example: Q = [[1, 0], [0, 1]], K = [[1, 0], [1, 1]], V = [[2, 0], [0, 3]], d_k = 2. Scores before scale are [[1, 1], [0, 1]]. After /sqrt(2) they are about [[0.707, 0.707], [0, 0.707]]. Softmax on row 0 is equal weights [0.5, 0.5], so output row 0 is 0.5*[2,0] + 0.5*[0,3] = [1.0, 1.5]. This is the calculation interviewers expect you to do on a whiteboard without a framework. Returning weights alongside outputs makes debugging and visualization much easier during study.",
          "Hold these points explicitly while you study. Restate each one without looking at the list — recognition is not the interview bar; recall is.",
          "• Keep the last two axes as (seq_q, seq_k) for scores and (seq_k, d_v) for values.",
          "• Return both context vectors and attention weights when debugging.",
          "• Unit-test masking by checking that forbidden positions have near-zero weight.",
          "Production lens — Complexity and what weights mean: Standard self-attention is quadratic in sequence length. Doubling context roughly quadruples attention FLOPs and memory for the score matrix, which is why long-context systems invest in sparsity, chunking, linearized attention, or KV-cache engineering rather than naive full attention everywhere. For lab-scale sequences the quadratic cost is fine; for production context windows it is a first-class capacity constraint.\n\nAttention weights are not guaranteed linguistic \"explanations,\" but on synthetic tasks they are a strong implementation check: a model that should copy a marked token ought to put mass on that source index at the decode step. Averaging heads can hide specialists, so inspect per-head maps when multi-head enters the picture. Treat weight visualization as evidence about information flow under a known task structure, not as proof of human-interpretable reasoning in deep stacks."
        ],
        "keyTerms": [
          {
            "term": "Keep the last two axes as",
            "definition": "Keep the last two axes as (seq_q, seq_k) for scores and (seq_k, d_v) for values."
          },
          {
            "term": "Return both context vectors and attention",
            "definition": "Return both context vectors and attention weights when debugging."
          },
          {
            "term": "Unit-test masking by checking that forbidden",
            "definition": "Unit-test masking by checking that forbidden positions have near-zero weight."
          }
        ],
        "workedExample": {
          "title": "Reference scaled dot-product attention",
          "body": "Narrate what each shape and step is doing. If you only recognize the API call, you do not own the idea yet — rewrite the example from memory after one pass.",
          "code": "import numpy as np\n\ndef scaled_dot_product_attention(Q, K, V, mask=None):\n    d_k = Q.shape[-1]\n    scores = Q @ np.swapaxes(K, -1, -2) / np.sqrt(d_k)\n    if mask is not None:\n        scores = np.where(mask, scores, -1e9)\n    scores = scores - scores.max(axis=-1, keepdims=True)\n    weights = np.exp(scores)\n    weights = weights / weights.sum(axis=-1, keepdims=True)\n    return weights @ V, weights\n\nQ = np.array([[1.0, 0.0], [0.0, 1.0]])\nK = np.array([[1.0, 0.0], [1.0, 1.0]])\nV = np.array([[2.0, 0.0], [0.0, 3.0]])\nout, wts = scaled_dot_product_attention(Q, K, V)\nprint('weights:\\n', wts.round(3))\nprint('output:\\n', out.round(3))",
          "language": "python"
        },
        "checkYourself": [
          {
            "prompt": "Can compute a tiny attention example by hand with correct shapes.",
            "reveal": "Standard self-attention is quadratic in sequence length. Doubling context roughly quadruples attention FLOPs and memory for the score matrix, which is why long-context systems invest in sparsity, chunking, linearized attention, or KV-cache engineering rather than naive full attention everywhere. For lab-scale sequences the quadratic cost is fine; for production context windows it is a first-class capacity constraint.\n\nAttention weights are not guaranteed linguistic \"explanations,\" but on synthetic tasks they are a strong implementation check: a model that should copy a marked token ought to put mass on that source index at the decode step. Averaging heads can hide specialists, so inspect per-head maps when multi-head enters the picture. Treat weight visualization as evidence about information flow under a known task structure, not as proof of human-interpretable reasoning in deep stacks."
          }
        ]
      },
      {
        "id": "batch-and-head-dimensions-are-just-leading-axes",
        "heading": "Batch and head dimensions are just leading axes",
        "paragraphs": [
          "Production attention rarely uses rank-2 matrices. A common layout is (batch, num_heads, seq, d_k). Matrix multiply still happens on the last two axes. If batch=2, heads=3, seq=5, d_k=8, then scores have shape (2, 3, 5, 5) and each head learns a different routing pattern. Thinking in leading axes prevents bugs: transpose or reshape tokens into heads before attention, then merge heads after. For interviews, say that multi-head attention runs several attention operations in parallel with smaller d_k, then concatenates. The single-head math you just implemented is the core; heads are copies with different projections. When debugging, flatten to one head first, verify weights and masks, then restore the full tensor layout. Shape assertions in tests catch silent broadcast bugs that can look like training instability.",
          "Hold these points explicitly while you study. Restate each one without looking at the list — recognition is not the interview bar; recall is.",
          "• Treat (batch, heads) as a broadcastable batch over attention matmuls.",
          "• Verify seq_q by seq_k score shapes before multiplying by V.",
          "• Debug one head on one example before trusting multi-head code.",
          "Production lens — Attention as content-addressable mixing: Scaled dot-product attention is a soft lookup: each query asks which keys match, and the matching keys decide how to blend values. For a sequence of length n and head dimension d_k, Q, K, and V are matrices of shape (n, d_k). The score matrix S = Q K^T has shape (n, n); entry (i, j) is the compatibility of destination i with source j. Softmax over each row turns those scores into a probability distribution, and the output row is that distribution times V. Geometrically this is a soft nearest-neighbor retrieve-and-blend over positions, not a fixed local window like a convolution.\n\nThat view explains both power and cost. Because every position can attend to every other position, information can jump across the whole sequence in one layer—useful for long-range dependencies and copy-style tasks. The price is O(n² d_k) compute and O(n²) attention storage for the dense score matrix. When you implement attention from scratch, treat the math contract Attention(Q, K, V) = softmax(Q K^T / sqrt(d_k)) V as a unit-testable API: fixed tiny tensors with hand-computed weights catch transpose bugs faster than waiting for end-to-end loss to look wrong."
        ],
        "keyTerms": [
          {
            "term": "Treat (batch, heads) as a broadcastable",
            "definition": "Treat (batch, heads) as a broadcastable batch over attention matmuls."
          },
          {
            "term": "Verify seq_q by seq_k score shapes",
            "definition": "Verify seq_q by seq_k score shapes before multiplying by V."
          },
          {
            "term": "Debug one head on one example",
            "definition": "Debug one head on one example before trusting multi-head code."
          }
        ],
        "workedExample": {
          "title": "Shape-check batched multi-head scores",
          "body": "Narrate what each shape and step is doing. If you only recognize the API call, you do not own the idea yet — rewrite the example from memory after one pass.",
          "code": "import numpy as np\n\nrng = np.random.default_rng(1)\nbatch, heads, seq, d_k = 2, 3, 5, 8\nQ = rng.normal(size=(batch, heads, seq, d_k))\nK = rng.normal(size=(batch, heads, seq, d_k))\nV = rng.normal(size=(batch, heads, seq, d_k))\nscores = Q @ np.swapaxes(K, -1, -2) / np.sqrt(d_k)\nweights = np.exp(scores - scores.max(axis=-1, keepdims=True))\nweights = weights / weights.sum(axis=-1, keepdims=True)\nout = weights @ V\nprint('scores shape:', scores.shape)\nprint('out shape:', out.shape)\nprint('row sums ok:', np.allclose(weights.sum(axis=-1), 1.0))",
          "language": "python"
        },
        "checkYourself": [
          {
            "prompt": "Can describe attention cost as quadratic in sequence length.",
            "reveal": "Explain the idea in two sentences, name one metric or invariant you would watch, and state one mistake juniors make. Then connect it back to batch and head dimensions are just leading axes."
          }
        ]
      },
      {
        "id": "what-interviewers-probe-about-attention",
        "heading": "What interviewers probe about attention",
        "paragraphs": [
          "Expect questions that connect formula to failure modes. Why scale? Softmax saturation. Why masks? Illegal context. Why values separate from keys? Matching can use one space while the mixed content lives in another. Why can attention be quadratic? Every query compares to every key, so cost is O(seq^2 * d). That motivates efficient attention variants, chunking long documents, and caching keys/values during decoding. Also be ready to compute a 2x2 or 3x3 example by hand, including softmax normalization and the final weighted sum. If you can narrate shapes, scaling, masking, and one numeric pass, you demonstrate real understanding rather than library familiarity. Strong answers also mention that attention is permutation-equivariant without positional information, which is why positional encodings appear later in the stack.",
          "Hold these points explicitly while you study. Restate each one without looking at the list — recognition is not the interview bar; recall is.",
          "• Connect O(n^2) attention cost to sequence length limits.",
          "• Separate matching space (Q/K) from content space (V) in explanations.",
          "• Practice one fully numeric forward pass for a tiny sequence.",
          "Production lens — Why divide by sqrt(d_k): If query and key components are roughly independent with unit variance, a raw dot product has variance about d_k. As width grows, logits become large in magnitude, softmax saturates toward a one-hot, and gradients through the softmax become tiny. Dividing by sqrt(d_k)—exactly as in Attention Is All You Need—keeps typical logits O(1) so the distribution stays soft enough to learn. A lab that works at d_k = 16 and collapses at d_k = 256 is often missing this scale, not \"bad learning rate.\"\n\nScaling is necessary but not sufficient for numerical health. Always subtract the per-row maximum before exp in softmax so large positive scores do not overflow. Mixed precision can still amplify score explosions if Q/K norms drift; monitoring score variance, softmax entropy, and gradient norms while you widen the head is a practical correctness check. Interview answers should name both the variance argument and the gradient/saturation consequence, not only \"the paper divides by sqrt(d_k).\""
        ],
        "keyTerms": [
          {
            "term": "Connect O(n^2) attention cost to sequence",
            "definition": "Connect O(n^2) attention cost to sequence length limits."
          },
          {
            "term": "Separate matching space (Q/K) from content",
            "definition": "Separate matching space (Q/K) from content space (V) in explanations."
          },
          {
            "term": "Practice one fully numeric forward pass",
            "definition": "Practice one fully numeric forward pass for a tiny sequence."
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
          "Most interview answers fail not because the definition is wrong, but because the candidate never names how the approach breaks. Use this section as a trap checklist for scaled dot-product attention from scratch.",
          "Trap: Forgetting to scale logits and ending up with near one-hot attention. A strong answer preempts it — say what you would monitor, what fallback you would keep, or what simpler baseline you would try first.",
          "Trap: Masking after softmax without understanding renormalization effects. A strong answer preempts it — say what you would monitor, what fallback you would keep, or what simpler baseline you would try first.",
          "Trap: Mixing up axes so scores become (d, d) instead of (seq, seq). A strong answer preempts it — say what you would monitor, what fallback you would keep, or what simpler baseline you would try first.",
          "Trap: Using the same tensor for Q, K, and V without saying that is a special case. A strong answer preempts it — say what you would monitor, what fallback you would keep, or what simpler baseline you would try first.",
          "Trap: Ignoring numerical stability when exponentiating large scores. A strong answer preempts it — say what you would monitor, what fallback you would keep, or what simpler baseline you would try first."
        ],
        "callout": {
          "tone": "warning",
          "body": "If you cannot name a failure mode, you do not yet understand the technique well enough to ship or defend it."
        },
        "checkYourself": [
          {
            "prompt": "Pick the most dangerous pitfall for Scaled dot-product attention from scratch and explain how you would detect it in production or on a whiteboard.",
            "reveal": "Start with: \"Forgetting to scale logits and ending up with near one-hot attention.\" Then add a detection signal (metric, test, or review question) and a mitigation."
          }
        ]
      },
      {
        "id": "deeper-lens",
        "heading": "A deeper production lens",
        "paragraphs": [
          "Attention as content-addressable mixing. Scaled dot-product attention is a soft lookup: each query asks which keys match, and the matching keys decide how to blend values. For a sequence of length n and head dimension d_k, Q, K, and V are matrices of shape (n, d_k). The score matrix S = Q K^T has shape (n, n); entry (i, j) is the compatibility of destination i with source j. Softmax over each row turns those scores into a probability distribution, and the output row is that distribution times V. Geometrically this is a soft nearest-neighbor retrieve-and-blend over positions, not a fixed local window like a convolution.\n\nThat view explains both power and cost. Because every position can attend to every other position, information can jump across the whole sequence in one layer—useful for long-range dependencies and copy-style tasks. The price is O(n² d_k) compute and O(n²) attention storage for the dense score matrix. When you implement attention from scratch, treat the math contract Attention(Q, K, V) = softmax(Q K^T / sqrt(d_k)) V as a unit-testable API: fixed tiny tensors with hand-computed weights catch transpose bugs faster than waiting for end-to-end loss to look wrong.",
          "Why divide by sqrt(d_k). If query and key components are roughly independent with unit variance, a raw dot product has variance about d_k. As width grows, logits become large in magnitude, softmax saturates toward a one-hot, and gradients through the softmax become tiny. Dividing by sqrt(d_k)—exactly as in Attention Is All You Need—keeps typical logits O(1) so the distribution stays soft enough to learn. A lab that works at d_k = 16 and collapses at d_k = 256 is often missing this scale, not \"bad learning rate.\"\n\nScaling is necessary but not sufficient for numerical health. Always subtract the per-row maximum before exp in softmax so large positive scores do not overflow. Mixed precision can still amplify score explosions if Q/K norms drift; monitoring score variance, softmax entropy, and gradient norms while you widen the head is a practical correctness check. Interview answers should name both the variance argument and the gradient/saturation consequence, not only \"the paper divides by sqrt(d_k).\"",
          "Masks, shapes, and debugging order. Illegal positions—padding or future tokens—must be removed before softmax, usually by adding a large negative constant (for example -1e9) to forbidden logits. Masking after softmax and renormalizing is a different, usually wrong, operation. Boolean keep-masks broadcast carefully: a causal lower-triangular pattern of shape (1, 1, n, n) or (batch, heads, n, n) must align with the score tensor. Off-by-one triangular bugs create silent train/serve mismatches that look like \"great teacher-forced loss\" and broken generation.\n\nDebug in layers. First verify Q/K/V shapes and that scores are (batch, heads, n, n). Then assert known outputs on a 2×2 hand example. Then inspect attention maps on a synthetic copy or alignment task where the correct focus position is obvious. Only after shapes and focus look right should you chase optimizer or dataset issues. Attention maps are a teaching and debugging lens; they are not a substitute for task metrics, but they catch broken projections long before a full language-model train finishes.",
          "Complexity and what weights mean. Standard self-attention is quadratic in sequence length. Doubling context roughly quadruples attention FLOPs and memory for the score matrix, which is why long-context systems invest in sparsity, chunking, linearized attention, or KV-cache engineering rather than naive full attention everywhere. For lab-scale sequences the quadratic cost is fine; for production context windows it is a first-class capacity constraint.\n\nAttention weights are not guaranteed linguistic \"explanations,\" but on synthetic tasks they are a strong implementation check: a model that should copy a marked token ought to put mass on that source index at the decode step. Averaging heads can hide specialists, so inspect per-head maps when multi-head enters the picture. Treat weight visualization as evidence about information flow under a known task structure, not as proof of human-interpretable reasoning in deep stacks."
        ],
        "keyTerms": [
          {
            "term": "Attention as content-addressable mixing",
            "definition": "Scaled dot-product attention is a soft lookup: each query asks which keys match, and the matching keys decide how to blend values. For a sequence of length n and head dimension d_k, Q, K, and V are matrices of shape (n, …"
          },
          {
            "term": "Why divide by sqrt(d_k)",
            "definition": "If query and key components are roughly independent with unit variance, a raw dot product has variance about d_k. As width grows, logits become large in magnitude, softmax saturates toward a one-hot, and gradients throug…"
          },
          {
            "term": "Masks, shapes, and debugging order",
            "definition": "Illegal positions—padding or future tokens—must be removed before softmax, usually by adding a large negative constant (for example -1e9) to forbidden logits. Masking after softmax and renormalizing is a different, usual…"
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
          "You should now be able to teach scaled dot-product attention from scratch as a story: what problem it solves, how the mechanism works, which assumptions it depends on, and how you would know it failed.",
          "Close the loop by writing a 90-second spoken answer out loud. If you freeze on definitions, return to the orientation and the first technical part. If you freeze on trade-offs, return to failure modes.",
          "Practice prompts from this lesson: Walk through the formula for scaled dot-product attention and the shapes at each step. | Why do we divide by sqrt(d_k)? | How do causal masks and padding masks differ?"
        ],
        "checkYourself": [
          {
            "prompt": "Give a 90-second spoken overview of Scaled dot-product attention from scratch as if starting an interview answer.",
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
        "Can write softmax-stable scaled dot-product attention in NumPy.",
        "Can explain why dividing by sqrt(d_k) matters for large head dimensions.",
        "Can apply causal or padding masks via large negative logits.",
        "Can compute a tiny attention example by hand with correct shapes.",
        "Can describe attention cost as quadratic in sequence length."
      ],
      "nextSteps": [
        "Return to the lesson page and attempt the practice / topic lab with this chapter still open if needed.",
        "Revisit any Check yourself prompts you could not answer out loud.",
        "Optional deeper reading: Attention Is All You Need (arXiv) — https://arxiv.org/abs/1706.03762",
        "Optional deeper reading: The Illustrated Transformer (Jay Alammar) — https://jalammar.github.io/illustrated-transformer/"
      ]
    }
  },
  "transformers-attention-lab/multi-head-and-blocks": {
    "title": "Chapter: Multi-head attention and transformer blocks",
    "readingTime": "60-75 min",
    "premise": "Project Q/K/V into multiple heads, merge outputs, and assemble residual attention plus feed-forward blocks with correct shapes. This Learn chapter expands the short lesson summary into a full study unit you can read continuously, with interactive checks and selection-based AI search when a phrase needs a second opinion.",
    "parts": [
      {
        "id": "orientation",
        "heading": "Why this chapter exists",
        "paragraphs": [
          "Real transformers are stacks of multi-head attention and feed-forward sublayers with residuals and normalization. Shape fluency here is what lets you debug dimension mismatches and explain parameter counts in interviews.",
          "This chapter treats \"Multi-head attention and transformer blocks\" as a readable study unit: intuition first, then the mechanics you must be able to explain, then the failure modes that show up in interviews and production, and finally how to talk about the topic under time pressure.",
          "Read it like a book chapter. When a phrase is unclear, select it inside the Learn reader and use Search with AI to open Google, Perplexity, or DuckDuckGo without abandoning the chapter."
        ],
        "callout": {
          "tone": "tip",
          "body": "Target reading time is paced for depth, not skimming. Pause at each Check yourself prompt and answer out loud before revealing the guide answer."
        }
      },
      {
        "id": "multi-head-attention-learns-several-routing-patterns",
        "heading": "Multi-head attention learns several routing patterns",
        "paragraphs": [
          "A single attention head uses one projection into query/key/value space. That can bottleneck representation: one head might specialize in local syntax while another tracks long-range coreference, but only if they have separate parameters. Multi-head attention splits the model dimension d_model into h heads of width d_k = d_model / h. For d_model=512 and h=8, each head uses d_k=64. Input X of shape (seq, 512) is projected to Q, K, V each of shape (seq, 512), then reshaped to (h, seq, d_k) or (seq, h, d_k) depending on convention. Each head runs scaled dot-product attention independently. Outputs are concatenated back to (seq, 512) and passed through an output projection W_O. Interview intuition: heads are parallel soft lookups with different learned similarity metrics, not just repeated computation.",
          "Hold these points explicitly while you study. Restate each one without looking at the list — recognition is not the interview bar; recall is.",
          "• Head dimension is usually d_model / num_heads.",
          "• Concatenate head outputs before the final output projection.",
          "• Different heads can attend to different dependency types.",
          "Production lens — Heads as parallel subspaces: Multi-head attention splits the model width into h heads of dimension d_k = d_model / h (or a configured head size), runs attention independently in each subspace, concatenates the head outputs, and projects back to d_model. The point is not \"more attention\" in the abstract; it is allowing different heads to specialize on different relations—adjacency, copying, syntax-like links—without forcing a single similarity metric to capture all of them. With fixed d_model, more heads means narrower heads; with fixed d_k, more heads means a wider model.\n\nSpecialization is a hypothesis you should test. Log per-head entropy, run head ablations, and see whether half the heads are dead weight on your task. Redundant heads waste compute and complicate distillation later. In interview settings, explain the reshape path clearly: (batch, n, d_model) → (batch, n, h, d_k) → (batch, h, n, d_k) for attention, then the inverse concat/project. Shape bugs here are as common as math bugs in single-head attention."
        ],
        "keyTerms": [
          {
            "term": "Head dimension is usually d_model /",
            "definition": "Head dimension is usually d_model / num_heads."
          },
          {
            "term": "Concatenate head outputs before the final",
            "definition": "Concatenate head outputs before the final output projection."
          },
          {
            "term": "Different heads can attend to different",
            "definition": "Different heads can attend to different dependency types."
          }
        ],
        "workedExample": {
          "title": "Split and merge heads with reshape",
          "body": "Narrate what each shape and step is doing. If you only recognize the API call, you do not own the idea yet — rewrite the example from memory after one pass.",
          "code": "import numpy as np\n\nrng = np.random.default_rng(0)\nseq, d_model, heads = 5, 32, 4\nd_k = d_model // heads\nX = rng.normal(size=(seq, d_model))\nW_QKV = rng.normal(size=(d_model, 3 * d_model))\nqkv = X @ W_QKV\nQ, K, V = np.split(qkv, 3, axis=1)\n\ndef split_heads(t):\n    return t.reshape(seq, heads, d_k).transpose(1, 0, 2)\n\nQh, Kh, Vh = split_heads(Q), split_heads(K), split_heads(V)\nprint('per-head Q shape:', Qh.shape)\nscores = Qh @ np.swapaxes(Kh, -1, -2) / np.sqrt(d_k)\nprint('scores shape:', scores.shape)",
          "language": "python"
        },
        "checkYourself": [
          {
            "prompt": "Can reshape Q/K/V into heads and merge them again correctly.",
            "reveal": "Multi-head attention splits the model width into h heads of dimension d_k = d_model / h (or a configured head size), runs attention independently in each subspace, concatenates the head outputs, and projects back to d_model. The point is not \"more attention\" in the abstract; it is allowing different heads to specialize on different relations—adjacency, copying, syntax-like links—without forcing a single similarity metric to capture all of them. With fixed d_model, more heads means narrower heads; with fixed d_k, more heads means a wider model.\n\nSpecialization is a hypothesis you should test. Log per-head entropy, run head ablations, and see whether half the heads are dead weight on your task. Redundant heads waste compute and complicate distillation later. In interview settings, explain the reshape path clearly: (batch, n, d_model) → (batch, n, h, d_k) → (batch, h, n, d_k) for attention, then the inverse concat/project. Shape bugs here are as common as math bugs in single-head attention."
          }
        ]
      },
      {
        "id": "projections-are-ordinary-linear-maps",
        "heading": "Projections are ordinary linear maps",
        "paragraphs": [
          "The matrices W_Q, W_K, W_V, and W_O are dense linear layers. If X is (seq, d_model), then Q = X @ W_Q with W_Q shape (d_model, d_model) for the combined projection, or (d_model, d_k) per head. Parameter counting is a common interview prompt. For one attention sublayer with shared d_model across Q/K/V/O and no biases, parameters are about 4 * d_model^2. With d_model=768 that is roughly 2.36 million parameters just for attention projections in one layer. Biases and norms add more. When people say a 12-layer model, they mean this block repeats, so multiply carefully. From-scratch NumPy versions help you see that 'multi-head' is reshape bookkeeping plus independent attention calls, not a mysterious new operator.",
          "Hold these points explicitly while you study. Restate each one without looking at the list — recognition is not the interview bar; recall is.",
          "• Count 4*d_model^2 for Q/K/V/O when dimensions match and biases are ignored.",
          "• Bias terms and layer norms add smaller but real parameter counts.",
          "• Reshape errors are the most common from-scratch multi-head bugs.",
          "Production lens — Residual streams and norm placement: A transformer block is usually attention mixing plus a position-wise MLP, each wrapped in a residual connection. Residuals keep a highway for gradients and for the identity signal so depth can add refinements instead of forcing every layer to re-encode the whole representation. Layer normalization stabilizes activation scale across depth; where you put the norm matters. Post-norm (norm after residual) matches the original paper; pre-norm (norm before sublayers, residual add after) often trains more stably in deep stacks and is common in modern practice.\n\nWhen a toy stack goes unstable as you deepen it, try pre-norm before only blaming the learning rate. Residuals and norms are architecture choices with optimization consequences, not cosmetic wrappers. Also keep the residual dtype and scale in mind under mixed precision: a deep residual stream can accumulate large magnitudes if unconstrained. For labs, assert that a zero-initialized output projection leaves the residual path as identity at init so early training does not destroy the input representation."
        ],
        "keyTerms": [
          {
            "term": "Count 4*d_model^2 for Q/K/V/O when dimensions",
            "definition": "Count 4*d_model^2 for Q/K/V/O when dimensions match and biases are ignored."
          },
          {
            "term": "Bias terms and layer norms add",
            "definition": "Bias terms and layer norms add smaller but real parameter counts."
          },
          {
            "term": "Reshape errors are the most common",
            "definition": "Reshape errors are the most common from-scratch multi-head bugs."
          }
        ],
        "workedExample": {
          "title": "Count attention projection parameters",
          "body": "Narrate what each shape and step is doing. If you only recognize the API call, you do not own the idea yet — rewrite the example from memory after one pass.",
          "code": "import numpy as np\n\nd_model, heads = 768, 12\nd_k = d_model // heads\nparams_qkv_o = 4 * d_model * d_model\nparams_with_bias = params_qkv_o + 4 * d_model\nprint('d_k:', d_k)\nprint('QKV+O weights:', params_qkv_o)\nprint('with biases:', params_with_bias)",
          "language": "python"
        },
        "checkYourself": [
          {
            "prompt": "Can estimate attention projection parameter counts.",
            "reveal": "A transformer block is usually attention mixing plus a position-wise MLP, each wrapped in a residual connection. Residuals keep a highway for gradients and for the identity signal so depth can add refinements instead of forcing every layer to re-encode the whole representation. Layer normalization stabilizes activation scale across depth; where you put the norm matters. Post-norm (norm after residual) matches the original paper; pre-norm (norm before sublayers, residual add after) often trains more stably in deep stacks and is common in modern practice.\n\nWhen a toy stack goes unstable as you deepen it, try pre-norm before only blaming the learning rate. Residuals and norms are architecture choices with optimization consequences, not cosmetic wrappers. Also keep the residual dtype and scale in mind under mixed precision: a deep residual stream can accumulate large magnitudes if unconstrained. For labs, assert that a zero-initialized output projection leaves the residual path as identity at init so early training does not destroy the input representation."
          }
        ]
      },
      {
        "id": "residual-connections-stabilize-deep-stacks",
        "heading": "Residual connections stabilize deep stacks",
        "paragraphs": [
          "A transformer block typically computes x = x + Attention(LayerNorm(x)) or Attention then norm, depending on pre-norm vs post-norm. The residual means the block predicts an update, not an entirely new representation. Numerically, if attention output is near zero early in training, the residual still preserves the input signal so gradients can flow. Example: input vector [1, 2, 3], attention delta [0.1, -0.2, 0.0], residual result [1.1, 1.8, 3.0]. Without residuals, stacking many nonlinear layers often degrades signal. In interviews, connect residuals to ResNet intuition and to optimization: identity paths keep deep networks trainable. Also note shape constraints: attention output must match d_model so addition is valid.",
          "Hold these points explicitly while you study. Restate each one without looking at the list — recognition is not the interview bar; recall is.",
          "• Residuals require matching shapes between branch output and block input.",
          "• Pre-norm architectures normalize before sublayers; post-norm normalizes after adding.",
          "• Residuals help gradient flow through deep transformer stacks.",
          "Production lens — MLP capacity between mixing steps: Attention redistributes information across positions; the feed-forward network applies the same nonlinear transform independently at each position. Typical width is 4× d_model with a GELU or ReLU nonlinearity. Much of a transformer's parameter count and a large share of FLOPs live in these MLPs. Intuitively, attention decides who talks to whom; MLPs decide how each position transforms the mixed message. Removing or shrinking MLPs often hurts more than dropping a few attention heads on many tasks.\n\nCapacity planning is a trade among depth, width, and head count under a memory/latency budget. More depth increases serial compute and can need norm/residual care; more width increases matmul cost and activation memory; more heads at fixed d_model thins each head. For teaching models, prefer configurations you can fully unit-test: known shapes, residual identity checks, and a small grammar or copy task where head ablation has a readable story."
        ],
        "keyTerms": [
          {
            "term": "Residuals require matching shapes between branch",
            "definition": "Residuals require matching shapes between branch output and block input."
          },
          {
            "term": "Pre-norm architectures normalize before subla…",
            "definition": "Pre-norm architectures normalize before sublayers; post-norm normalizes after adding."
          },
          {
            "term": "Residuals help gradient flow through deep",
            "definition": "Residuals help gradient flow through deep transformer stacks."
          }
        ],
        "workedExample": {
          "title": "Residual attention update on toy vectors",
          "body": "Narrate what each shape and step is doing. If you only recognize the API call, you do not own the idea yet — rewrite the example from memory after one pass.",
          "code": "import numpy as np\n\nx = np.array([[1.0, 2.0, 3.0, 4.0]])\nattn_out = np.array([[0.1, -0.2, 0.0, 0.3]])\ny = x + attn_out\nprint('input:', x)\nprint('attn delta:', attn_out)\nprint('residual:', y)",
          "language": "python"
        },
        "checkYourself": [
          {
            "prompt": "Can explain residual connections inside transformer blocks.",
            "reveal": "Attention redistributes information across positions; the feed-forward network applies the same nonlinear transform independently at each position. Typical width is 4× d_model with a GELU or ReLU nonlinearity. Much of a transformer's parameter count and a large share of FLOPs live in these MLPs. Intuitively, attention decides who talks to whom; MLPs decide how each position transforms the mixed message. Removing or shrinking MLPs often hurts more than dropping a few attention heads on many tasks.\n\nCapacity planning is a trade among depth, width, and head count under a memory/latency budget. More depth increases serial compute and can need norm/residual care; more width increases matmul cost and activation memory; more heads at fixed d_model thins each head. For teaching models, prefer configurations you can fully unit-test: known shapes, residual identity checks, and a small grammar or copy task where head ablation has a readable story."
          }
        ]
      },
      {
        "id": "the-feed-forward-network-expands-then-contracts",
        "heading": "The feed-forward network expands then contracts",
        "paragraphs": [
          "After attention mixes information across tokens, a position-wise feed-forward network (FFN) transforms each token independently. The common pattern is Linear(d_model -> d_ff), activation (ReLU or GELU), Linear(d_ff -> d_model), often with d_ff = 4 * d_model. For one token of size 512, expand to 2048, apply ReLU, then project back to 512. This is where much of the parameter count lives: 2 * d_model * d_ff weights per layer. Conceptually, attention moves information between positions; the FFN processes features at each position. A tiny numeric pass: token [1, -1], W1 = [[1, 2], [0, 1], [1, 0]] wait shapes must match. Prefer clear shapes: x (1, 4), W1 (4, 8), b1 (8,), W2 (8, 4). Always validate that FFN(x).shape == x.shape before residual add.",
          "Hold these points explicitly while you study. Restate each one without looking at the list — recognition is not the interview bar; recall is.",
          "• FFN is applied identically and independently at every sequence position.",
          "• Expansion ratio of 4x is common but not mandatory.",
          "• FFN parameters often dominate attention parameters in wide models.",
          "Production lens — Growing capacity without cargo culting: If the task needs diverse relation types at similar compute, increasing head count at fixed d_model can help until heads become too narrow to be useful. If representations are underpowered, widen d_model or the MLP. If compositionality or hierarchical structure seems missing, add depth—but only with a stable block design. Measure with task metrics and ablations, not with the assumption that every head or layer is sacred.\n\nProduction systems later prune, distill, or fuse heads; lab habits of measuring head usefulness transfer directly. Document what heads appear to do on your synthetic tasks even if those interpretations will not survive at LLM scale. The engineering skill is knowing which knob to turn when loss plateaus, not memorizing a single \"best\" depth/width/head recipe."
        ],
        "keyTerms": [
          {
            "term": "FFN is applied identically and independently",
            "definition": "FFN is applied identically and independently at every sequence position."
          },
          {
            "term": "Expansion ratio of 4x is common",
            "definition": "Expansion ratio of 4x is common but not mandatory."
          },
          {
            "term": "FFN parameters often dominate attention param…",
            "definition": "FFN parameters often dominate attention parameters in wide models."
          }
        ],
        "workedExample": {
          "title": "Position-wise FFN forward pass",
          "body": "Narrate what each shape and step is doing. If you only recognize the API call, you do not own the idea yet — rewrite the example from memory after one pass.",
          "code": "import numpy as np\n\nrng = np.random.default_rng(3)\nseq, d_model, d_ff = 5, 16, 64\nx = rng.normal(size=(seq, d_model))\nW1 = rng.normal(size=(d_model, d_ff))\nb1 = rng.normal(size=(d_ff,))\nW2 = rng.normal(size=(d_ff, d_model))\nb2 = rng.normal(size=(d_model,))\nhidden = np.maximum(0, x @ W1 + b1)\nout = hidden @ W2 + b2\nprint('hidden shape:', hidden.shape)\nprint('ffn out shape:', out.shape)\nprint('residual-ready:', out.shape == x.shape)",
          "language": "python"
        },
        "checkYourself": [
          {
            "prompt": "Can implement a position-wise FFN with expansion and projection back.",
            "reveal": "If the task needs diverse relation types at similar compute, increasing head count at fixed d_model can help until heads become too narrow to be useful. If representations are underpowered, widen d_model or the MLP. If compositionality or hierarchical structure seems missing, add depth—but only with a stable block design. Measure with task metrics and ablations, not with the assumption that every head or layer is sacred.\n\nProduction systems later prune, distill, or fuse heads; lab habits of measuring head usefulness transfer directly. Document what heads appear to do on your synthetic tasks even if those interpretations will not survive at LLM scale. The engineering skill is knowing which knob to turn when loss plateaus, not memorizing a single \"best\" depth/width/head recipe."
          }
        ]
      },
      {
        "id": "assemble-one-transformer-block-from-parts",
        "heading": "Assemble one transformer block from parts",
        "paragraphs": [
          "Put the pieces together for one pre-norm style block in NumPy: normalize, multi-head attention, residual; normalize, FFN, residual. Layer norm for a vector x subtracts mean and divides by standard deviation across features, then applies gain and bias. For study, even a simple feature-wise standardize is enough to see the structure. Shapes through the block should remain (seq, d_model). A practical debugging checklist: (1) Q/K/V projection width divisible by heads, (2) attention weights sum to 1 on the key axis, (3) merged heads restore d_model, (4) FFN returns d_model, (5) residuals add tensors of equal shape. Interviewers like candidates who debug with shapes before diving into training hyperparameters.",
          "Hold these points explicitly while you study. Restate each one without looking at the list — recognition is not the interview bar; recall is.",
          "• Keep (seq, d_model) invariant across the full block.",
          "• Validate attention weight normalization per head.",
          "• Treat layer norm scale/bias as learned parameters in real models.",
          "Production lens — Heads as parallel subspaces: Multi-head attention splits the model width into h heads of dimension d_k = d_model / h (or a configured head size), runs attention independently in each subspace, concatenates the head outputs, and projects back to d_model. The point is not \"more attention\" in the abstract; it is allowing different heads to specialize on different relations—adjacency, copying, syntax-like links—without forcing a single similarity metric to capture all of them. With fixed d_model, more heads means narrower heads; with fixed d_k, more heads means a wider model.\n\nSpecialization is a hypothesis you should test. Log per-head entropy, run head ablations, and see whether half the heads are dead weight on your task. Redundant heads waste compute and complicate distillation later. In interview settings, explain the reshape path clearly: (batch, n, d_model) → (batch, n, h, d_k) → (batch, h, n, d_k) for attention, then the inverse concat/project. Shape bugs here are as common as math bugs in single-head attention."
        ],
        "keyTerms": [
          {
            "term": "Keep (seq, d_model) invariant across the",
            "definition": "Keep (seq, d_model) invariant across the full block."
          },
          {
            "term": "Validate attention weight normalization per h…",
            "definition": "Validate attention weight normalization per head."
          },
          {
            "term": "Treat layer norm scale/bias as learned",
            "definition": "Treat layer norm scale/bias as learned parameters in real models."
          }
        ],
        "workedExample": {
          "title": "One-block shape skeleton",
          "body": "Narrate what each shape and step is doing. If you only recognize the API call, you do not own the idea yet — rewrite the example from memory after one pass.",
          "code": "import numpy as np\n\ndef layer_norm(x, eps=1e-5):\n    mu = x.mean(axis=-1, keepdims=True)\n    var = x.var(axis=-1, keepdims=True)\n    return (x - mu) / np.sqrt(var + eps)\n\ndef softmax(a, axis=-1):\n    a = a - a.max(axis=axis, keepdims=True)\n    e = np.exp(a)\n    return e / e.sum(axis=axis, keepdims=True)\n\nrng = np.random.default_rng(4)\nseq, d_model, heads = 6, 32, 4\nd_k = d_model // heads\nx = rng.normal(size=(seq, d_model))\nW_qkv = rng.normal(size=(d_model, 3 * d_model))\nW_o = rng.normal(size=(d_model, d_model))\nW1 = rng.normal(size=(d_model, 4 * d_model))\nW2 = rng.normal(size=(4 * d_model, d_model))\n\nh = layer_norm(x)\nqkv = h @ W_qkv\nQ, K, V = [t.reshape(seq, heads, d_k).transpose(1, 0, 2) for t in np.split(qkv, 3, axis=1)]\nw = softmax(Q @ np.swapaxes(K, -1, -2) / np.sqrt(d_k), axis=-1)\nattn = (w @ V).transpose(1, 0, 2).reshape(seq, d_model) @ W_o\nx = x + attn\nx = x + (np.maximum(0, layer_norm(x) @ W1) @ W2)\nprint('block output shape:', x.shape)",
          "language": "python"
        },
        "checkYourself": [
          {
            "prompt": "Can assemble one NumPy transformer block while preserving (seq, d_model).",
            "reveal": "Explain the idea in two sentences, name one metric or invariant you would watch, and state one mistake juniors make. Then connect it back to assemble one transformer block from parts."
          }
        ]
      },
      {
        "id": "interview-stories-that-score-well",
        "heading": "Interview stories that score well",
        "paragraphs": [
          "When asked how a transformer block works, narrate information flow: tokens enter as embeddings; attention lets each position gather from others; residuals preserve identity; FFN rewrites features; stacking blocks builds hierarchical representations. Mention compute: attention is O(seq^2 * d_model) while FFN is O(seq * d_model * d_ff). For long sequences, attention dominates; for wide FFNs, matmul width dominates. Also explain why multi-head helps: capacity to attend to multiple relations at once, similar in spirit to multiple filters in a CNN layer. If the interviewer goes deeper, discuss pre-norm training stability or why output projection mixes head-specific subspaces back together. Concrete shapes and one numeric residual example beat vague metaphors.",
          "Hold these points explicitly while you study. Restate each one without looking at the list — recognition is not the interview bar; recall is.",
          "• Separate cross-position mixing (attention) from per-position transform (FFN).",
          "• Compare attention and FFN asymptotic costs.",
          "• Use multi-head as multiple learned relation detectors.",
          "Production lens — Residual streams and norm placement: A transformer block is usually attention mixing plus a position-wise MLP, each wrapped in a residual connection. Residuals keep a highway for gradients and for the identity signal so depth can add refinements instead of forcing every layer to re-encode the whole representation. Layer normalization stabilizes activation scale across depth; where you put the norm matters. Post-norm (norm after residual) matches the original paper; pre-norm (norm before sublayers, residual add after) often trains more stably in deep stacks and is common in modern practice.\n\nWhen a toy stack goes unstable as you deepen it, try pre-norm before only blaming the learning rate. Residuals and norms are architecture choices with optimization consequences, not cosmetic wrappers. Also keep the residual dtype and scale in mind under mixed precision: a deep residual stream can accumulate large magnitudes if unconstrained. For labs, assert that a zero-initialized output projection leaves the residual path as identity at init so early training does not destroy the input representation."
        ],
        "keyTerms": [
          {
            "term": "Separate cross-position mixing (attention) fr…",
            "definition": "Separate cross-position mixing (attention) from per-position transform (FFN)."
          },
          {
            "term": "Compare attention and FFN asymptotic costs.",
            "definition": "Compare attention and FFN asymptotic costs."
          },
          {
            "term": "Use multi-head as multiple learned relation",
            "definition": "Use multi-head as multiple learned relation detectors."
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
          "Most interview answers fail not because the definition is wrong, but because the candidate never names how the approach breaks. Use this section as a trap checklist for multi-head attention and transformer blocks.",
          "Trap: Using a head dimension that does not divide d_model evenly. A strong answer preempts it — say what you would monitor, what fallback you would keep, or what simpler baseline you would try first.",
          "Trap: Forgetting the output projection after concatenating heads. A strong answer preempts it — say what you would monitor, what fallback you would keep, or what simpler baseline you would try first.",
          "Trap: Adding residual tensors with mismatched shapes. A strong answer preempts it — say what you would monitor, what fallback you would keep, or what simpler baseline you would try first.",
          "Trap: Applying FFN across the sequence axis instead of the feature axis. A strong answer preempts it — say what you would monitor, what fallback you would keep, or what simpler baseline you would try first.",
          "Trap: Confusing parameter count of attention with parameter count of FFN. A strong answer preempts it — say what you would monitor, what fallback you would keep, or what simpler baseline you would try first."
        ],
        "callout": {
          "tone": "warning",
          "body": "If you cannot name a failure mode, you do not yet understand the technique well enough to ship or defend it."
        },
        "checkYourself": [
          {
            "prompt": "Pick the most dangerous pitfall for Multi-head attention and transformer blocks and explain how you would detect it in production or on a whiteboard.",
            "reveal": "Start with: \"Using a head dimension that does not divide d_model evenly.\" Then add a detection signal (metric, test, or review question) and a mitigation."
          }
        ]
      },
      {
        "id": "deeper-lens",
        "heading": "A deeper production lens",
        "paragraphs": [
          "Heads as parallel subspaces. Multi-head attention splits the model width into h heads of dimension d_k = d_model / h (or a configured head size), runs attention independently in each subspace, concatenates the head outputs, and projects back to d_model. The point is not \"more attention\" in the abstract; it is allowing different heads to specialize on different relations—adjacency, copying, syntax-like links—without forcing a single similarity metric to capture all of them. With fixed d_model, more heads means narrower heads; with fixed d_k, more heads means a wider model.\n\nSpecialization is a hypothesis you should test. Log per-head entropy, run head ablations, and see whether half the heads are dead weight on your task. Redundant heads waste compute and complicate distillation later. In interview settings, explain the reshape path clearly: (batch, n, d_model) → (batch, n, h, d_k) → (batch, h, n, d_k) for attention, then the inverse concat/project. Shape bugs here are as common as math bugs in single-head attention.",
          "Residual streams and norm placement. A transformer block is usually attention mixing plus a position-wise MLP, each wrapped in a residual connection. Residuals keep a highway for gradients and for the identity signal so depth can add refinements instead of forcing every layer to re-encode the whole representation. Layer normalization stabilizes activation scale across depth; where you put the norm matters. Post-norm (norm after residual) matches the original paper; pre-norm (norm before sublayers, residual add after) often trains more stably in deep stacks and is common in modern practice.\n\nWhen a toy stack goes unstable as you deepen it, try pre-norm before only blaming the learning rate. Residuals and norms are architecture choices with optimization consequences, not cosmetic wrappers. Also keep the residual dtype and scale in mind under mixed precision: a deep residual stream can accumulate large magnitudes if unconstrained. For labs, assert that a zero-initialized output projection leaves the residual path as identity at init so early training does not destroy the input representation.",
          "MLP capacity between mixing steps. Attention redistributes information across positions; the feed-forward network applies the same nonlinear transform independently at each position. Typical width is 4× d_model with a GELU or ReLU nonlinearity. Much of a transformer's parameter count and a large share of FLOPs live in these MLPs. Intuitively, attention decides who talks to whom; MLPs decide how each position transforms the mixed message. Removing or shrinking MLPs often hurts more than dropping a few attention heads on many tasks.\n\nCapacity planning is a trade among depth, width, and head count under a memory/latency budget. More depth increases serial compute and can need norm/residual care; more width increases matmul cost and activation memory; more heads at fixed d_model thins each head. For teaching models, prefer configurations you can fully unit-test: known shapes, residual identity checks, and a small grammar or copy task where head ablation has a readable story.",
          "Growing capacity without cargo culting. If the task needs diverse relation types at similar compute, increasing head count at fixed d_model can help until heads become too narrow to be useful. If representations are underpowered, widen d_model or the MLP. If compositionality or hierarchical structure seems missing, add depth—but only with a stable block design. Measure with task metrics and ablations, not with the assumption that every head or layer is sacred.\n\nProduction systems later prune, distill, or fuse heads; lab habits of measuring head usefulness transfer directly. Document what heads appear to do on your synthetic tasks even if those interpretations will not survive at LLM scale. The engineering skill is knowing which knob to turn when loss plateaus, not memorizing a single \"best\" depth/width/head recipe."
        ],
        "keyTerms": [
          {
            "term": "Heads as parallel subspaces",
            "definition": "Multi-head attention splits the model width into h heads of dimension d_k = d_model / h (or a configured head size), runs attention independently in each subspace, concatenates the head outputs, and projects back to d_mo…"
          },
          {
            "term": "Residual streams and norm placement",
            "definition": "A transformer block is usually attention mixing plus a position-wise MLP, each wrapped in a residual connection. Residuals keep a highway for gradients and for the identity signal so depth can add refinements instead of …"
          },
          {
            "term": "MLP capacity between mixing steps",
            "definition": "Attention redistributes information across positions; the feed-forward network applies the same nonlinear transform independently at each position. Typical width is 4× d_model with a GELU or ReLU nonlinearity. Much of a …"
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
          "You should now be able to teach multi-head attention and transformer blocks as a story: what problem it solves, how the mechanism works, which assumptions it depends on, and how you would know it failed.",
          "Close the loop by writing a 90-second spoken answer out loud. If you freeze on definitions, return to the orientation and the first technical part. If you freeze on trade-offs, return to failure modes.",
          "Practice prompts from this lesson: Why use multiple attention heads instead of one wider head? | What are the shapes through multi-head attention for a given d_model and h? | Where do most parameters live in a typical transformer block?"
        ],
        "checkYourself": [
          {
            "prompt": "Give a 90-second spoken overview of Multi-head attention and transformer blocks as if starting an interview answer.",
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
        "Can reshape Q/K/V into heads and merge them again correctly.",
        "Can estimate attention projection parameter counts.",
        "Can explain residual connections inside transformer blocks.",
        "Can implement a position-wise FFN with expansion and projection back.",
        "Can assemble one NumPy transformer block while preserving (seq, d_model)."
      ],
      "nextSteps": [
        "Return to the lesson page and attempt the practice / topic lab with this chapter still open if needed.",
        "Revisit any Check yourself prompts you could not answer out loud.",
        "Optional deeper reading: Attention Is All You Need (arXiv) — https://arxiv.org/abs/1706.03762",
        "Optional deeper reading: On Layer Normalization in the Transformer Architecture (arXiv) — https://arxiv.org/abs/2002.04745"
      ]
    }
  },
  "transformers-attention-lab/positional-encoding-and-causal-mask": {
    "title": "Chapter: Positional encoding, causal masks, and KV-cache intuition",
    "readingTime": "55-70 min",
    "premise": "Add sin/cos positional encodings, enforce causal attention, and model KV-cache growth with arrays for autoregressive decoding intuition. This Learn chapter expands the short lesson summary into a full study unit you can read continuously, with interactive checks and selection-based AI search when a phrase needs a second opinion.",
    "parts": [
      {
        "id": "orientation",
        "heading": "Why this chapter exists",
        "paragraphs": [
          "Self-attention is permutation-equivariant without position signals, and causal decoding needs both future masking and cached keys/values. These details separate people who can discuss LLM inference from people who only know the training diagram.",
          "This chapter treats \"Positional encoding, causal masks, and KV-cache intuition\" as a readable study unit: intuition first, then the mechanics you must be able to explain, then the failure modes that show up in interviews and production, and finally how to talk about the topic under time pressure.",
          "Read it like a book chapter. When a phrase is unclear, select it inside the Learn reader and use Search with AI to open Google, Perplexity, or DuckDuckGo without abandoning the chapter."
        ],
        "callout": {
          "tone": "tip",
          "body": "Target reading time is paced for depth, not skimming. Pause at each Check yourself prompt and answer out loud before revealing the guide answer."
        }
      },
      {
        "id": "attention-alone-does-not-know-order",
        "heading": "Attention alone does not know order",
        "paragraphs": [
          "If you shuffle the token embeddings before a stack of pure attention and FFN layers without position information, the set of pairwise interactions is the same up to permutation. The model can learn content relationships but not 'first', 'before', or 'adjacent' unless order is injected. Positional encodings add a position-dependent vector to each token embedding. Absolute sin/cos encodings assign a fixed vector pe[pos] for each index. Relative schemes encode distances between tokens. In interview terms: embeddings carry what; positional encodings carry where. A quick mental test: without positions, the sentences 'dog bites man' and 'man bites dog' are harder to distinguish from bag-of-vectors attention alone because the same words appear.",
          "Hold these points explicitly while you study. Restate each one without looking at the list — recognition is not the interview bar; recall is.",
          "• Self-attention mixes values based on content similarity, not index order.",
          "• Positional signals restore order sensitivity.",
          "• Absolute and relative position methods solve the same core problem differently.",
          "Production lens — Permutation equivariance without positions: Pure attention over a bag of token embeddings is permutation-equivariant: shuffling the input order shuffles the output the same way, because scores depend only on content. Language, code, and many algorithms are order-sensitive, so the model needs a positional signal. Absolute sinusoidal encodings add a deterministic vector PE(pos) to each embedding; learned absolute embeddings do the same with parameters; relative and rotary schemes inject position into Q/K interactions so distance structure is built into attention scores.\n\nPedagogy should prove need before debating formulas. On a bag-of-words sentiment toy, removing positions may barely hurt; on reverse-string or order-sensitive copy tasks, accuracy collapses. Use that gap to justify positional encodings, then compare absolute sinusoids versus relative/RoPE-style approaches on extrapolation: absolute learned embeddings often struggle past training lengths, while relative/rotary designs are built to generalize more gracefully—with more implementation complexity."
        ],
        "keyTerms": [
          {
            "term": "Self-attention mixes values based on content",
            "definition": "Self-attention mixes values based on content similarity, not index order."
          },
          {
            "term": "Positional signals restore order sensitivity.",
            "definition": "Positional signals restore order sensitivity."
          },
          {
            "term": "Absolute and relative position methods solve",
            "definition": "Absolute and relative position methods solve the same core problem differently."
          }
        ],
        "workedExample": {
          "title": "Same bag of embeddings, different meanings",
          "body": "Narrate what each shape and step is doing. If you only recognize the API call, you do not own the idea yet — rewrite the example from memory after one pass.",
          "code": "import numpy as np\n\nemb = {\n    'man': np.array([1.0, 0.0, 0.2]),\n    'bites': np.array([0.0, 1.0, 0.1]),\n    'dog': np.array([0.2, 0.0, 1.0]),\n}\ns1 = np.stack([emb['dog'], emb['bites'], emb['man']])\ns2 = np.stack([emb['man'], emb['bites'], emb['dog']])\nprint('mean pooling identical?', np.allclose(s1.mean(0), s2.mean(0)))\nprint('order differs:\\n', s1, '\\n', s2)",
          "language": "python"
        },
        "checkYourself": [
          {
            "prompt": "Can explain why transformers need positional information.",
            "reveal": "Pure attention over a bag of token embeddings is permutation-equivariant: shuffling the input order shuffles the output the same way, because scores depend only on content. Language, code, and many algorithms are order-sensitive, so the model needs a positional signal. Absolute sinusoidal encodings add a deterministic vector PE(pos) to each embedding; learned absolute embeddings do the same with parameters; relative and rotary schemes inject position into Q/K interactions so distance structure is built into attention scores.\n\nPedagogy should prove need before debating formulas. On a bag-of-words sentiment toy, removing positions may barely hurt; on reverse-string or order-sensitive copy tasks, accuracy collapses. Use that gap to justify positional encodings, then compare absolute sinusoids versus relative/RoPE-style approaches on extrapolation: absolute learned embeddings often struggle past training lengths, while relative/rotary designs are built to generalize more gracefully—with more implementation complexity."
          }
        ]
      },
      {
        "id": "sin-cos-positional-encodings-use-frequency-bands",
        "heading": "Sin/cos positional encodings use frequency bands",
        "paragraphs": [
          "The original transformer uses pe[pos, 2i] = sin(pos / 10000^(2i/d)) and pe[pos, 2i+1] = cos(pos / 10000^(2i/d)). Low dimensions vary slowly across positions; high dimensions oscillate quickly. That gives each position a unique pattern and lets linear layers learn to attend by relative offsets because sin/cos shifts can be expressed with linear transforms. Example for d=4 and pos=0..3: dimension 0 is a slow sine, dimension 1 the matching cosine, dimensions 2-3 a faster pair. You add pe to token embeddings before the first block: X = token_embed + pe[:seq]. In NumPy, build a (max_len, d_model) table once and slice it. Interview tip: mention deterministic, non-learned absolute encodings as the classic baseline, then note learned positional embeddings and rotary embeddings as modern alternatives.",
          "Hold these points explicitly while you study. Restate each one without looking at the list — recognition is not the interview bar; recall is.",
          "• Even dimensions use sine; odd dimensions use cosine in the classic formula.",
          "• Wavelengths grow geometrically with dimension index.",
          "• Add positional encodings to embeddings before transformer blocks.",
          "Production lens — Sinusoidal structure and RoPE intuition: The original transformer uses fixed sin/cos functions of different frequencies across dimensions so each position gets a unique pattern and offset relationships are linearly decodable for many distances. You do not need to memorize every frequency formula in an interview, but you should explain that absolute PE is added (or concatenated) before layers and that the model must learn to use it. Plotting a few PE dimensions versus position makes the multi-scale wave structure obvious in a notebook.\n\nRotary position embeddings (RoPE) rotate pairs of Q/K dimensions by an angle depending on position so that relative offset affects the dot product. That couples position with attention scores rather than only with the residual stream. For lab work, a minimal RoPE-style rotation on 2D pairs is enough to contrast with absolute addition. Discuss the product trade-off: absolute PE is simple; relative/rotary methods improve length extrapolation and are common in modern LLMs, but mask and cache code must stay consistent with the chosen scheme."
        ],
        "keyTerms": [
          {
            "term": "Even dimensions use sine; odd dimensions",
            "definition": "Even dimensions use sine; odd dimensions use cosine in the classic formula."
          },
          {
            "term": "Wavelengths grow geometrically with dimension…",
            "definition": "Wavelengths grow geometrically with dimension index."
          },
          {
            "term": "Add positional encodings to embeddings before",
            "definition": "Add positional encodings to embeddings before transformer blocks."
          }
        ],
        "workedExample": {
          "title": "Build sin/cos positional encodings",
          "body": "Narrate what each shape and step is doing. If you only recognize the API call, you do not own the idea yet — rewrite the example from memory after one pass.",
          "code": "import numpy as np\n\ndef sinusoidal_positional_encoding(max_len, d_model, base=10000.0):\n    pe = np.zeros((max_len, d_model))\n    position = np.arange(max_len)[:, None]\n    i = np.arange(0, d_model, 2)\n    denom = base ** (i / d_model)\n    pe[:, 0::2] = np.sin(position / denom)\n    pe[:, 1::2] = np.cos(position / denom)\n    return pe\n\npe = sinusoidal_positional_encoding(8, 4)\nprint(pe.round(3))",
          "language": "python"
        },
        "checkYourself": [
          {
            "prompt": "Can implement sin/cos positional encodings in NumPy.",
            "reveal": "The original transformer uses fixed sin/cos functions of different frequencies across dimensions so each position gets a unique pattern and offset relationships are linearly decodable for many distances. You do not need to memorize every frequency formula in an interview, but you should explain that absolute PE is added (or concatenated) before layers and that the model must learn to use it. Plotting a few PE dimensions versus position makes the multi-scale wave structure obvious in a notebook.\n\nRotary position embeddings (RoPE) rotate pairs of Q/K dimensions by an angle depending on position so that relative offset affects the dot product. That couples position with attention scores rather than only with the residual stream. For lab work, a minimal RoPE-style rotation on 2D pairs is enough to contrast with absolute addition. Discuss the product trade-off: absolute PE is simple; relative/rotary methods improve length extrapolation and are common in modern LLMs, but mask and cache code must stay consistent with the chosen scheme."
          }
        ]
      },
      {
        "id": "causal-masks-enforce-left-to-right-generation",
        "heading": "Causal masks enforce left-to-right generation",
        "paragraphs": [
          "Language-model training predicts the next token from previous tokens. If attention at position i can read position i+1, the model can cheat by looking at the answer. A causal mask sets scores for keys j > i to a large negative before softmax. For seq=4, the allowed pattern is lower triangular ones: position 0 sees [1,0,0,0], position 2 sees [1,1,1,0]. Teacher forcing still feeds the true previous tokens during training, but the mask prevents future leakage inside the sequence. At inference, you generate one token at a time; the mask (or incremental decoding) ensures each new query only sees past keys. Always test that the upper triangle of attention weights is ~0.",
          "Hold these points explicitly while you study. Restate each one without looking at the list — recognition is not the interview bar; recall is.",
          "• Causal masking is required for autoregressive next-token prediction.",
          "• Lower-triangular boolean masks are the usual representation.",
          "• Training with teacher forcing still needs future masking inside the sequence.",
          "Production lens — Causal masks enforce autoregressive factorization: Language modeling assumes p(x_t | x_<t). Self-attention must therefore prevent position i from attending to j > i. The causal mask is a lower-triangular keep pattern (or upper-triangular forbid pattern, depending on convention): illegal logits get large negative values before softmax. Teacher forcing still feeds the full sequence in parallel, but each position only mixes past context—so training can be batched while respecting the autoregressive dependency.\n\nFuture leakage is a classic silent bug: offline perplexity looks amazing because the model cheats with future tokens, then stepwise decoding fails to match. Unit-test that for every i, weights on j > i are ~0; visualize the allowed triangle; compare teacher-forced metrics against true greedy/sampled decode. Padding masks compose with causal masks: a position may be causal-legal yet still padded content that should not receive mass. Apply both in logit space before softmax."
        ],
        "keyTerms": [
          {
            "term": "Causal masking is required for autoregressive",
            "definition": "Causal masking is required for autoregressive next-token prediction."
          },
          {
            "term": "Lower-triangular boolean masks are the usual",
            "definition": "Lower-triangular boolean masks are the usual representation."
          },
          {
            "term": "Training with teacher forcing still needs",
            "definition": "Training with teacher forcing still needs future masking inside the sequence."
          }
        ],
        "workedExample": {
          "title": "Verify causal weights ignore the future",
          "body": "Narrate what each shape and step is doing. If you only recognize the API call, you do not own the idea yet — rewrite the example from memory after one pass.",
          "code": "import numpy as np\n\ndef softmax(x, axis=-1):\n    x = x - x.max(axis=axis, keepdims=True)\n    e = np.exp(x)\n    return e / e.sum(axis=axis, keepdims=True)\n\nrng = np.random.default_rng(0)\nseq, d = 4, 8\nQ = rng.normal(size=(seq, d))\nK = rng.normal(size=(seq, d))\nscores = Q @ K.T / np.sqrt(d)\nmask = np.tril(np.ones((seq, seq), dtype=bool))\nweights = softmax(np.where(mask, scores, -1e9))\nprint(weights.round(3))\nprint('future mass:', float(np.triu(weights, 1).sum()))",
          "language": "python"
        },
        "checkYourself": [
          {
            "prompt": "Can build and validate a causal attention mask.",
            "reveal": "Language modeling assumes p(x_t | x_<t). Self-attention must therefore prevent position i from attending to j > i. The causal mask is a lower-triangular keep pattern (or upper-triangular forbid pattern, depending on convention): illegal logits get large negative values before softmax. Teacher forcing still feeds the full sequence in parallel, but each position only mixes past context—so training can be batched while respecting the autoregressive dependency.\n\nFuture leakage is a classic silent bug: offline perplexity looks amazing because the model cheats with future tokens, then stepwise decoding fails to match. Unit-test that for every i, weights on j > i are ~0; visualize the allowed triangle; compare teacher-forced metrics against true greedy/sampled decode. Padding masks compose with causal masks: a position may be causal-legal yet still padded content that should not receive mass. Apply both in logit space before softmax."
          }
        ]
      },
      {
        "id": "kv-cache-intuition-with-growing-arrays",
        "heading": "KV-cache intuition with growing arrays",
        "paragraphs": [
          "During autoregressive decoding, recomputing keys and values for all past tokens at every step wastes work. A KV cache stores the K and V tensors produced so far. At step t, you compute Q/K/V only for the new token, append the new K/V to the cache, and attend with Q_t against all cached keys. Shapes: after t tokens with one head, cached K has shape (t, d_k). The attention score vector has length t. This is why first-token latency (prefill) and per-token latency (decode) differ: prefill processes a prompt in parallel; decode repeatedly does small incremental steps with growing cache. In NumPy, you can simulate this with a list or preallocated array and a length counter. Interviewers love hearing that cache memory scales with layers * heads * seq * d_k.",
          "Hold these points explicitly while you study. Restate each one without looking at the list — recognition is not the interview bar; recall is.",
          "• Prefill computes K/V for the whole prompt once.",
          "• Decode appends one K/V row per new token per layer/head.",
          "• Cache size grows linearly with sequence length and number of layers.",
          "Production lens — Train/serve mask consistency and KV cache: Generation caches keys and values for past tokens so each new step attends to history without recomputing the whole sequence. The causal structure remains: the new query attends to cached K/V plus its own. Off-by-one errors in cache indexing or in the triangular mask produce subtle mismatches between training and serving. Labs that materialize growing KV arrays for a few decode steps build intuition for why cache layout, dtype, and memory bandwidth dominate LLM inference cost.\n\nWhen positions use RoPE, cached K entries must remain consistent with the positions they were computed at; re-rotating incorrectly on read is another serve bug class. Document the position index space (0-based, including special tokens) alongside the mask tests. The operational lesson: positional encoding and causal masking are not \"preprocessing fluff\"—they are part of the model contract that must match between training graphs and decode kernels."
        ],
        "keyTerms": [
          {
            "term": "Prefill computes K/V for the whole",
            "definition": "Prefill computes K/V for the whole prompt once."
          },
          {
            "term": "Decode appends one K/V row per",
            "definition": "Decode appends one K/V row per new token per layer/head."
          },
          {
            "term": "Cache size grows linearly with sequence",
            "definition": "Cache size grows linearly with sequence length and number of layers."
          }
        ],
        "workedExample": {
          "title": "Simulate a one-head KV cache decode loop",
          "body": "Narrate what each shape and step is doing. If you only recognize the API call, you do not own the idea yet — rewrite the example from memory after one pass.",
          "code": "import numpy as np\n\ndef softmax(x):\n    x = x - x.max()\n    e = np.exp(x)\n    return e / e.sum()\n\nrng = np.random.default_rng(1)\nd_k = 4\nprompt = rng.normal(size=(3, d_k))\ncache_k = prompt.copy()\ncache_v = prompt.copy()\nprint('prefill cache', cache_k.shape)\nfor step in range(3):\n    q = rng.normal(size=(d_k,))\n    k = rng.normal(size=(d_k,))\n    v = rng.normal(size=(d_k,))\n    cache_k = np.vstack([cache_k, k])\n    cache_v = np.vstack([cache_v, v])\n    weights = softmax(cache_k @ q / np.sqrt(d_k))\n    out = weights @ cache_v\n    print(f'decode step {step}: cache={cache_k.shape[0]} out={out.round(3)}')",
          "language": "python"
        },
        "checkYourself": [
          {
            "prompt": "Can describe KV-cache growth during autoregressive decoding.",
            "reveal": "Generation caches keys and values for past tokens so each new step attends to history without recomputing the whole sequence. The causal structure remains: the new query attends to cached K/V plus its own. Off-by-one errors in cache indexing or in the triangular mask produce subtle mismatches between training and serving. Labs that materialize growing KV arrays for a few decode steps build intuition for why cache layout, dtype, and memory bandwidth dominate LLM inference cost.\n\nWhen positions use RoPE, cached K entries must remain consistent with the positions they were computed at; re-rotating incorrectly on read is another serve bug class. Document the position index space (0-based, including special tokens) alongside the mask tests. The operational lesson: positional encoding and causal masking are not \"preprocessing fluff\"—they are part of the model contract that must match between training graphs and decode kernels."
          }
        ]
      },
      {
        "id": "combine-positions-causality-and-caching-in-one-story",
        "heading": "Combine positions, causality, and caching in one story",
        "paragraphs": [
          "A strong interview narrative for decoder-only transformers: tokenize text into ids; embed tokens; add positional encodings; run N blocks of causal multi-head attention and FFN; project to vocabulary logits; softmax for next-token distribution. At inference, prefill the prompt through the stack while filling KV caches, then decode token by token using cached keys/values and the newest query. Positional encodings must stay consistent with absolute indices or relative scheme as the sequence grows. Causal masks during training match the information available at decode time. If positions are wrong, the model may still run but generalize poorly to longer contexts. If the cache is skipped, decode becomes dramatically slower. If the mask is wrong, training leaks future tokens and reported perplexity becomes dishonest.",
          "Hold these points explicitly while you study. Restate each one without looking at the list — recognition is not the interview bar; recall is.",
          "• Training masks and decode-time information flow should match.",
          "• Position indices continue increasing as generated tokens append.",
          "• KV caching is an inference optimization, not a change to model math.",
          "Production lens — Permutation equivariance without positions: Pure attention over a bag of token embeddings is permutation-equivariant: shuffling the input order shuffles the output the same way, because scores depend only on content. Language, code, and many algorithms are order-sensitive, so the model needs a positional signal. Absolute sinusoidal encodings add a deterministic vector PE(pos) to each embedding; learned absolute embeddings do the same with parameters; relative and rotary schemes inject position into Q/K interactions so distance structure is built into attention scores.\n\nPedagogy should prove need before debating formulas. On a bag-of-words sentiment toy, removing positions may barely hurt; on reverse-string or order-sensitive copy tasks, accuracy collapses. Use that gap to justify positional encodings, then compare absolute sinusoids versus relative/RoPE-style approaches on extrapolation: absolute learned embeddings often struggle past training lengths, while relative/rotary designs are built to generalize more gracefully—with more implementation complexity."
        ],
        "keyTerms": [
          {
            "term": "Training masks and decode-time information flow",
            "definition": "Training masks and decode-time information flow should match."
          },
          {
            "term": "Position indices continue increasing as gener…",
            "definition": "Position indices continue increasing as generated tokens append."
          },
          {
            "term": "KV caching is an inference optimization,",
            "definition": "KV caching is an inference optimization, not a change to model math."
          }
        ],
        "workedExample": {
          "title": "Position-aware embeddings plus causal scores",
          "body": "Narrate what each shape and step is doing. If you only recognize the API call, you do not own the idea yet — rewrite the example from memory after one pass.",
          "code": "import numpy as np\n\ndef sinusoidal_positional_encoding(max_len, d_model, base=10000.0):\n    pe = np.zeros((max_len, d_model))\n    pos = np.arange(max_len)[:, None]\n    i = np.arange(0, d_model, 2)\n    denom = base ** (i / d_model)\n    pe[:, 0::2] = np.sin(pos / denom)\n    pe[:, 1::2] = np.cos(pos / denom)\n    return pe\n\nrng = np.random.default_rng(2)\ntok = rng.normal(size=(5, 8))\nx = tok + sinusoidal_positional_encoding(5, 8)\nscores = x @ x.T / np.sqrt(8)\nmask = np.tril(np.ones((5, 5), dtype=bool))\nscores = np.where(mask, scores, -1e9)\nprint('position-aware causal logits:\\n', scores.round(2))",
          "language": "python"
        },
        "checkYourself": [
          {
            "prompt": "Can connect training-time masks to inference-time information flow.",
            "reveal": "Explain the idea in two sentences, name one metric or invariant you would watch, and state one mistake juniors make. Then connect it back to combine positions, causality, and caching in one story."
          }
        ]
      },
      {
        "id": "failure-modes-to-mention-under-pressure",
        "heading": "Failure modes to mention under pressure",
        "paragraphs": [
          "Common bugs: off-by-one in causal masks allowing the current training target to see itself incorrectly depending on label alignment; reusing position 0 for every decoded token; growing a KV cache but forgetting to slice to valid length when using preallocated buffers; mixing training-time bidirectional attention with decode-time causal expectations. Long-context issues also matter: sin/cos absolute encodings can extrapolate poorly far beyond training lengths, which is one reason relative or rotary schemes became popular. For product systems, memory is often the decode bottleneck: large batch size times long cache times many layers can exceed GPU memory even when FLOPs look fine. Show that you can reason about both correctness and systems constraints.",
          "Hold these points explicitly while you study. Restate each one without looking at the list — recognition is not the interview bar; recall is.",
          "• Check mask triangles with explicit unit tests.",
          "• Track absolute positions across prefill and decode.",
          "• Estimate KV-cache memory before promising long-context features.",
          "Production lens — Sinusoidal structure and RoPE intuition: The original transformer uses fixed sin/cos functions of different frequencies across dimensions so each position gets a unique pattern and offset relationships are linearly decodable for many distances. You do not need to memorize every frequency formula in an interview, but you should explain that absolute PE is added (or concatenated) before layers and that the model must learn to use it. Plotting a few PE dimensions versus position makes the multi-scale wave structure obvious in a notebook.\n\nRotary position embeddings (RoPE) rotate pairs of Q/K dimensions by an angle depending on position so that relative offset affects the dot product. That couples position with attention scores rather than only with the residual stream. For lab work, a minimal RoPE-style rotation on 2D pairs is enough to contrast with absolute addition. Discuss the product trade-off: absolute PE is simple; relative/rotary methods improve length extrapolation and are common in modern LLMs, but mask and cache code must stay consistent with the chosen scheme."
        ],
        "keyTerms": [
          {
            "term": "Check mask triangles with explicit unit",
            "definition": "Check mask triangles with explicit unit tests."
          },
          {
            "term": "Track absolute positions across prefill and",
            "definition": "Track absolute positions across prefill and decode."
          },
          {
            "term": "Estimate KV-cache memory before promising lon…",
            "definition": "Estimate KV-cache memory before promising long-context features."
          }
        ]
      },
      {
        "id": "long-context-serving-and-kv-cache-industry-constraints",
        "heading": "Long-context serving and KV-cache industry constraints",
        "paragraphs": [
          "Lab exercises that append to a NumPy KV cache foreshadow the dominant inference cost center in industry: long-context serving. As prompts grow to tens or hundreds of thousands of tokens, KV-cache memory and memory-bandwidth dominate GPU choice more than raw FLOPs. Prefill of a huge prompt is compute-heavy and spikes TTFT; subsequent decode is memory-bound as every new token attends over the cached keys/values. Systems mitigate with paged KV caches, prefix caching for shared system prompts, sliding/attention-window variants, and speculative decoding—but the positional encoding story also evolves: RoPE scaling, YaRN-style extrapolations, and learned long-context adaptations attempt to keep attention meaningful beyond training lengths. Causal masks remain mandatory for autoregressive correctness; chunked prefill still respects causality. When you explain a production incident—“OOM after context doubled”—tie it back to 2 × layers × batch × heads × seq × head_dim storage for K and V. Interviewers in 2026 expect you to connect the textbook causal mask to the ops reality that concurrency limits fall as context rises, and that product features dumping full PDFs into the window are capacity decisions, not free UX wins.",
          "Hold these points explicitly while you study. Restate each one without looking at the list — recognition is not the interview bar; recall is.",
          "• KV-cache memory scales with sequence length and concurrency; long context reduces batch size.",
          "• Prefill TTFT and decode TPS degrade differently as windows grow.",
          "• Prefix caching and paged KV are standard engine mitigations; positional extrapolation has limits.",
          "• Product context budgets are capacity controls tied to causal decoding physics.",
          "Production lens — Causal masks enforce autoregressive factorization: Language modeling assumes p(x_t | x_<t). Self-attention must therefore prevent position i from attending to j > i. The causal mask is a lower-triangular keep pattern (or upper-triangular forbid pattern, depending on convention): illegal logits get large negative values before softmax. Teacher forcing still feeds the full sequence in parallel, but each position only mixes past context—so training can be batched while respecting the autoregressive dependency.\n\nFuture leakage is a classic silent bug: offline perplexity looks amazing because the model cheats with future tokens, then stepwise decoding fails to match. Unit-test that for every i, weights on j > i are ~0; visualize the allowed triangle; compare teacher-forced metrics against true greedy/sampled decode. Padding masks compose with causal masks: a position may be causal-legal yet still padded content that should not receive mass. Apply both in logit space before softmax."
        ],
        "keyTerms": [
          {
            "term": "KV-cache memory scales with sequence length",
            "definition": "KV-cache memory scales with sequence length and concurrency; long context reduces batch size."
          },
          {
            "term": "Prefill TTFT and decode TPS degrade",
            "definition": "Prefill TTFT and decode TPS degrade differently as windows grow."
          },
          {
            "term": "Prefix caching and paged KV are",
            "definition": "Prefix caching and paged KV are standard engine mitigations; positional extrapolation has limits."
          },
          {
            "term": "Product context budgets are capacity controls",
            "definition": "Product context budgets are capacity controls tied to causal decoding physics."
          }
        ],
        "workedExample": {
          "title": "Concurrency vs context under a KV memory budget",
          "body": "Narrate what each shape and step is doing. If you only recognize the API call, you do not own the idea yet — rewrite the example from memory after one pass.",
          "code": "def max_batch(layers, heads, head_dim, seq, budget_gb, bytes_per=2):\n    per = 2 * layers * heads * seq * head_dim * bytes_per / (1024 ** 3)\n    return int(budget_gb // per)\n\nfor seq in [4096, 16384, 65536]:\n    print(seq, max_batch(32, 32, 128, seq, budget_gb=40))",
          "language": "python"
        },
        "callout": {
          "tone": "interview",
          "body": "Interview framing: define the term, give a tiny example, say when you would not use it, and name the metric that proves it worked."
        }
      },
      {
        "id": "failure-modes",
        "heading": "Failure modes and anti-patterns",
        "paragraphs": [
          "Most interview answers fail not because the definition is wrong, but because the candidate never names how the approach breaks. Use this section as a trap checklist for positional encoding, causal masks, and kv-cache intuition.",
          "Trap: Assuming attention knows token order without positional signals. A strong answer preempts it — say what you would monitor, what fallback you would keep, or what simpler baseline you would try first.",
          "Trap: Using a bidirectional mask for next-token language modeling. A strong answer preempts it — say what you would monitor, what fallback you would keep, or what simpler baseline you would try first.",
          "Trap: Recomputing full-sequence K/V on every decode step without discussing cost. A strong answer preempts it — say what you would monitor, what fallback you would keep, or what simpler baseline you would try first.",
          "Trap: Letting position indices reset incorrectly during generation. A strong answer preempts it — say what you would monitor, what fallback you would keep, or what simpler baseline you would try first.",
          "Trap: Ignoring KV-cache memory as a production constraint. A strong answer preempts it — say what you would monitor, what fallback you would keep, or what simpler baseline you would try first."
        ],
        "callout": {
          "tone": "warning",
          "body": "If you cannot name a failure mode, you do not yet understand the technique well enough to ship or defend it."
        },
        "checkYourself": [
          {
            "prompt": "Pick the most dangerous pitfall for Positional encoding, causal masks, and KV-cache intuition and explain how you would detect it in production or on a whiteboard.",
            "reveal": "Start with: \"Assuming attention knows token order without positional signals.\" Then add a detection signal (metric, test, or review question) and a mitigation."
          }
        ]
      },
      {
        "id": "deeper-lens",
        "heading": "A deeper production lens",
        "paragraphs": [
          "Permutation equivariance without positions. Pure attention over a bag of token embeddings is permutation-equivariant: shuffling the input order shuffles the output the same way, because scores depend only on content. Language, code, and many algorithms are order-sensitive, so the model needs a positional signal. Absolute sinusoidal encodings add a deterministic vector PE(pos) to each embedding; learned absolute embeddings do the same with parameters; relative and rotary schemes inject position into Q/K interactions so distance structure is built into attention scores.\n\nPedagogy should prove need before debating formulas. On a bag-of-words sentiment toy, removing positions may barely hurt; on reverse-string or order-sensitive copy tasks, accuracy collapses. Use that gap to justify positional encodings, then compare absolute sinusoids versus relative/RoPE-style approaches on extrapolation: absolute learned embeddings often struggle past training lengths, while relative/rotary designs are built to generalize more gracefully—with more implementation complexity.",
          "Sinusoidal structure and RoPE intuition. The original transformer uses fixed sin/cos functions of different frequencies across dimensions so each position gets a unique pattern and offset relationships are linearly decodable for many distances. You do not need to memorize every frequency formula in an interview, but you should explain that absolute PE is added (or concatenated) before layers and that the model must learn to use it. Plotting a few PE dimensions versus position makes the multi-scale wave structure obvious in a notebook.\n\nRotary position embeddings (RoPE) rotate pairs of Q/K dimensions by an angle depending on position so that relative offset affects the dot product. That couples position with attention scores rather than only with the residual stream. For lab work, a minimal RoPE-style rotation on 2D pairs is enough to contrast with absolute addition. Discuss the product trade-off: absolute PE is simple; relative/rotary methods improve length extrapolation and are common in modern LLMs, but mask and cache code must stay consistent with the chosen scheme.",
          "Causal masks enforce autoregressive factorization. Language modeling assumes p(x_t | x_<t). Self-attention must therefore prevent position i from attending to j > i. The causal mask is a lower-triangular keep pattern (or upper-triangular forbid pattern, depending on convention): illegal logits get large negative values before softmax. Teacher forcing still feeds the full sequence in parallel, but each position only mixes past context—so training can be batched while respecting the autoregressive dependency.\n\nFuture leakage is a classic silent bug: offline perplexity looks amazing because the model cheats with future tokens, then stepwise decoding fails to match. Unit-test that for every i, weights on j > i are ~0; visualize the allowed triangle; compare teacher-forced metrics against true greedy/sampled decode. Padding masks compose with causal masks: a position may be causal-legal yet still padded content that should not receive mass. Apply both in logit space before softmax.",
          "Train/serve mask consistency and KV cache. Generation caches keys and values for past tokens so each new step attends to history without recomputing the whole sequence. The causal structure remains: the new query attends to cached K/V plus its own. Off-by-one errors in cache indexing or in the triangular mask produce subtle mismatches between training and serving. Labs that materialize growing KV arrays for a few decode steps build intuition for why cache layout, dtype, and memory bandwidth dominate LLM inference cost.\n\nWhen positions use RoPE, cached K entries must remain consistent with the positions they were computed at; re-rotating incorrectly on read is another serve bug class. Document the position index space (0-based, including special tokens) alongside the mask tests. The operational lesson: positional encoding and causal masking are not \"preprocessing fluff\"—they are part of the model contract that must match between training graphs and decode kernels."
        ],
        "keyTerms": [
          {
            "term": "Permutation equivariance without positions",
            "definition": "Pure attention over a bag of token embeddings is permutation-equivariant: shuffling the input order shuffles the output the same way, because scores depend only on content. Language, code, and many algorithms are order-s…"
          },
          {
            "term": "Sinusoidal structure and RoPE intuition",
            "definition": "The original transformer uses fixed sin/cos functions of different frequencies across dimensions so each position gets a unique pattern and offset relationships are linearly decodable for many distances. You do not need …"
          },
          {
            "term": "Causal masks enforce autoregressive factorization",
            "definition": "Language modeling assumes p(x_t | x_<t). Self-attention must therefore prevent position i from attending to j > i. The causal mask is a lower-triangular keep pattern (or upper-triangular forbid pattern, depending on conv…"
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
          "You should now be able to teach positional encoding, causal masks, and kv-cache intuition as a story: what problem it solves, how the mechanism works, which assumptions it depends on, and how you would know it failed.",
          "Close the loop by writing a 90-second spoken answer out loud. If you freeze on definitions, return to the orientation and the first technical part. If you freeze on trade-offs, return to failure modes.",
          "Practice prompts from this lesson: Why are positional encodings necessary in transformers? | How does a causal mask differ from a padding mask? | Explain KV caching and why it speeds up decoding."
        ],
        "checkYourself": [
          {
            "prompt": "Give a 90-second spoken overview of Positional encoding, causal masks, and KV-cache intuition as if starting an interview answer.",
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
        "Can explain why transformers need positional information.",
        "Can implement sin/cos positional encodings in NumPy.",
        "Can build and validate a causal attention mask.",
        "Can describe KV-cache growth during autoregressive decoding.",
        "Can connect training-time masks to inference-time information flow."
      ],
      "nextSteps": [
        "Return to the lesson page and attempt the practice / topic lab with this chapter still open if needed.",
        "Revisit any Check yourself prompts you could not answer out loud.",
        "Optional deeper reading: Attention Is All You Need (arXiv) — https://arxiv.org/abs/1706.03762",
        "Optional deeper reading: RoFormer: Enhanced Transformer with Rotary Position Embedding (arXiv) — https://arxiv.org/abs/2104.09864"
      ]
    }
  }
};
