/**
 * Advanced interactive AI/ML learning expansion modules.
 *
 * Lessons teach transformers, retrieval/LLM systems, and production ML with
 * runnable Pyodide-safe exercises using NumPy, scikit-learn, and matplotlib.
 */
const code = (lines) => lines.join('\n');

export const rawAiAdvancedLearningModules = [
  {
    slug: 'transformers-attention-lab',
    title: 'Transformers and attention lab',
    summary:
      'Implement scaled dot-product attention, multi-head blocks, positional encodings, and causal masks with NumPy to build interview-ready transformer intuition.',
    objectives: [
      'Derive and implement scaled dot-product attention with softmax and masks',
      'Assemble multi-head attention and residual feed-forward blocks with correct shapes',
      'Use sin/cos positional encodings and causal masks, and reason about KV-cache arrays'
    ],
    lessons: [
      {
        slug: 'attention-from-scratch',
        title: 'Scaled dot-product attention from scratch',
        summary:
          'Implement queries, keys, values, scaling, softmax, and masks to compute attention outputs with NumPy.',
        duration: '60-75 min',
        whyItMatters:
          'Attention is the core primitive behind transformers. If you can compute a tiny attention pass by hand and in NumPy, interview discussions about LLMs stop being buzzwords and become shape-checked algorithms.',
        sections: [
          {
            heading: 'Attention redistributes information across positions',
            body:
              'Attention answers a simple question for every position: given what I am looking for, which other positions should I read, and how much? In transformers, each token produces three vectors: a query (what I need), keys (what each position offers), and values (the content to mix). Suppose we have three tokens with embedding dimension 4. Queries Q have shape (3, 4), keys K have shape (3, 4), and values V have shape (3, 4). The similarity matrix is scores = Q @ K.T with shape (3, 3). Entry (i, j) is how well query i matches key j. If row 0 of scores is [2.0, 0.1, -1.0], token 0 strongly prefers token 0, weakly considers token 1, and almost ignores token 2. Softmax turns those scores into weights that sum to 1, then the output for token 0 is a weighted sum of value rows. That is content-based routing: the network learns which contexts matter instead of relying only on fixed local windows like convolutions. Geometrically, each query is a probe in key space; the softmax is a soft nearest-neighbor lookup; the values are what get retrieved and blended.',
            bullets: [
              'Queries ask; keys advertise; values carry the payload that gets mixed.',
              'Score matrices have shape (sequence_length, sequence_length) for one head and one example.',
              'Softmax weights are a probability distribution over source positions for each destination.'
            ],
            codeExample: {
              title: 'Tiny attention without scaling',
              language: 'python',
              code: code([
                'import numpy as np',
                '',
                'rng = np.random.default_rng(0)',
                'seq_len, d = 3, 4',
                'Q = rng.normal(size=(seq_len, d))',
                'K = rng.normal(size=(seq_len, d))',
                'V = rng.normal(size=(seq_len, d))',
                'scores = Q @ K.T',
                'weights = np.exp(scores - scores.max(axis=1, keepdims=True))',
                'weights = weights / weights.sum(axis=1, keepdims=True)',
                'out = weights @ V',
                'print(\'scores:\\n\', scores.round(3))',
                'print(\'weights:\\n\', weights.round(3))',
                'print(\'output shape:\', out.shape)'
              ])
            }
          },
          {
            heading: 'Scaling by sqrt(d_k) keeps softmax in a useful range',
            body:
              'Dot products grow with dimension. If each component of q and k is roughly unit-variance, q · k has variance about d_k. For d_k = 64, raw scores can easily reach tens. Softmax of large magnitudes saturates: one weight becomes almost 1 and the rest almost 0, and the gradient through softmax becomes tiny. Scaling divides scores by sqrt(d_k) so typical logits stay O(1). Numerically: if scores are [8, 2, 1], softmax is dominated by 8. After dividing by 8 (sqrt of 64), scores become [1.0, 0.25, 0.125], and the distribution is softer. Interview answers should mention both numerical stability and gradient health. Implementations usually compute softmax(QK^T / sqrt(d_k))V. Always subtract the row max before exp for stability; scaling alone does not prevent overflow if scores are still large. When d_k is small, scaling changes less; when d_k is large, it is essential.',
            bullets: [
              'Divide attention logits by sqrt(d_k) before softmax.',
              'Saturation makes attention nearly hard argmax and slows learning.',
              'Stable softmax subtracts the per-row maximum before the exponential.'
            ],
            codeExample: {
              title: 'See scaling change softmax sharpness',
              language: 'python',
              code: code([
                'import numpy as np',
                '',
                'def softmax(x, axis=-1):',
                '    x = x - np.max(x, axis=axis, keepdims=True)',
                '    e = np.exp(x)',
                '    return e / e.sum(axis=axis, keepdims=True)',
                '',
                'd_k = 64',
                'raw = np.array([[8.0, 2.0, 1.0]])',
                'print(\'raw softmax:\', softmax(raw).round(4))',
                'print(\'scaled softmax:\', softmax(raw / np.sqrt(d_k)).round(4))'
              ])
            }
          },
          {
            heading: 'Masks tell attention which positions are illegal',
            body:
              'Not every position should be visible. Padding tokens must not receive mass. In causal language modeling, position i must not see future tokens j > i. The standard trick is to add a large negative number, often -1e9, to masked logits before softmax so those weights become ~0. Example: scores row [1.2, 0.4, 2.0] with causal mask allowing only the first two positions becomes [1.2, 0.4, -1e9]. After softmax the third weight is approximately 0. Boolean masks are easier to reason about: True means keep, False means mask. Broadcasting matters in batches: a mask of shape (batch, 1, seq, seq) can apply the same pattern to every head. In interviews, distinguish padding masks (content-dependent length) from causal masks (architecture/task constraint). Also note that masking after softmax and renormalizing is different from masking logits; logit masking is the usual correct approach.',
            bullets: [
              'Add large negatives to forbidden logits before softmax.',
              'Causal masks are lower-triangular for autoregressive decoding.',
              'Padding masks prevent empty positions from polluting context.'
            ],
            codeExample: {
              title: 'Apply a causal mask before softmax',
              language: 'python',
              code: code([
                'import numpy as np',
                '',
                'def softmax(x, axis=-1):',
                '    x = x - np.max(x, axis=axis, keepdims=True)',
                '    e = np.exp(x)',
                '    return e / e.sum(axis=axis, keepdims=True)',
                '',
                'scores = np.array([[1.2, 0.4, 2.0], [0.1, 1.5, 0.3], [0.2, 0.2, 0.9]])',
                'causal = np.tril(np.ones_like(scores)).astype(bool)',
                'masked = np.where(causal, scores, -1e9)',
                'print(\'masked scores:\\n\', masked)',
                'print(\'causal weights:\\n\', softmax(masked).round(3))'
              ])
            }
          },
          {
            heading: 'Implement scaled dot-product attention as one function',
            body:
              'A clean implementation makes shapes explicit. Inputs Q, K, V each have shape (seq, d_k) for a single head, or (batch, heads, seq, d_k) in production code. Compute scores = Q @ K.swapaxes(-1, -2) / sqrt(d_k). Apply mask if provided. Softmax over the last axis. Multiply by V. Work a numeric example: Q = [[1, 0], [0, 1]], K = [[1, 0], [1, 1]], V = [[2, 0], [0, 3]], d_k = 2. Scores before scale are [[1, 1], [0, 1]]. After /sqrt(2) they are about [[0.707, 0.707], [0, 0.707]]. Softmax on row 0 is equal weights [0.5, 0.5], so output row 0 is 0.5*[2,0] + 0.5*[0,3] = [1.0, 1.5]. This is the calculation interviewers expect you to do on a whiteboard without a framework. Returning weights alongside outputs makes debugging and visualization much easier during study.',
            bullets: [
              'Keep the last two axes as (seq_q, seq_k) for scores and (seq_k, d_v) for values.',
              'Return both context vectors and attention weights when debugging.',
              'Unit-test masking by checking that forbidden positions have near-zero weight.'
            ],
            codeExample: {
              title: 'Reference scaled dot-product attention',
              language: 'python',
              code: code([
                'import numpy as np',
                '',
                'def scaled_dot_product_attention(Q, K, V, mask=None):',
                '    d_k = Q.shape[-1]',
                '    scores = Q @ np.swapaxes(K, -1, -2) / np.sqrt(d_k)',
                '    if mask is not None:',
                '        scores = np.where(mask, scores, -1e9)',
                '    scores = scores - scores.max(axis=-1, keepdims=True)',
                '    weights = np.exp(scores)',
                '    weights = weights / weights.sum(axis=-1, keepdims=True)',
                '    return weights @ V, weights',
                '',
                'Q = np.array([[1.0, 0.0], [0.0, 1.0]])',
                'K = np.array([[1.0, 0.0], [1.0, 1.0]])',
                'V = np.array([[2.0, 0.0], [0.0, 3.0]])',
                'out, wts = scaled_dot_product_attention(Q, K, V)',
                'print(\'weights:\\n\', wts.round(3))',
                'print(\'output:\\n\', out.round(3))'
              ])
            }
          },
          {
            heading: 'Batch and head dimensions are just leading axes',
            body:
              'Production attention rarely uses rank-2 matrices. A common layout is (batch, num_heads, seq, d_k). Matrix multiply still happens on the last two axes. If batch=2, heads=3, seq=5, d_k=8, then scores have shape (2, 3, 5, 5) and each head learns a different routing pattern. Thinking in leading axes prevents bugs: transpose or reshape tokens into heads before attention, then merge heads after. For interviews, say that multi-head attention runs several attention operations in parallel with smaller d_k, then concatenates. The single-head math you just implemented is the core; heads are copies with different projections. When debugging, flatten to one head first, verify weights and masks, then restore the full tensor layout. Shape assertions in tests catch silent broadcast bugs that can look like training instability.',
            bullets: [
              'Treat (batch, heads) as a broadcastable batch over attention matmuls.',
              'Verify seq_q by seq_k score shapes before multiplying by V.',
              'Debug one head on one example before trusting multi-head code.'
            ],
            codeExample: {
              title: 'Shape-check batched multi-head scores',
              language: 'python',
              code: code([
                'import numpy as np',
                '',
                'rng = np.random.default_rng(1)',
                'batch, heads, seq, d_k = 2, 3, 5, 8',
                'Q = rng.normal(size=(batch, heads, seq, d_k))',
                'K = rng.normal(size=(batch, heads, seq, d_k))',
                'V = rng.normal(size=(batch, heads, seq, d_k))',
                'scores = Q @ np.swapaxes(K, -1, -2) / np.sqrt(d_k)',
                'weights = np.exp(scores - scores.max(axis=-1, keepdims=True))',
                'weights = weights / weights.sum(axis=-1, keepdims=True)',
                'out = weights @ V',
                'print(\'scores shape:\', scores.shape)',
                'print(\'out shape:\', out.shape)',
                'print(\'row sums ok:\', np.allclose(weights.sum(axis=-1), 1.0))'
              ])
            }
          },
          {
            heading: 'What interviewers probe about attention',
            body:
              'Expect questions that connect formula to failure modes. Why scale? Softmax saturation. Why masks? Illegal context. Why values separate from keys? Matching can use one space while the mixed content lives in another. Why can attention be quadratic? Every query compares to every key, so cost is O(seq^2 * d). That motivates efficient attention variants, chunking long documents, and caching keys/values during decoding. Also be ready to compute a 2x2 or 3x3 example by hand, including softmax normalization and the final weighted sum. If you can narrate shapes, scaling, masking, and one numeric pass, you demonstrate real understanding rather than library familiarity. Strong answers also mention that attention is permutation-equivariant without positional information, which is why positional encodings appear later in the stack.',
            bullets: [
              'Connect O(n^2) attention cost to sequence length limits.',
              'Separate matching space (Q/K) from content space (V) in explanations.',
              'Practice one fully numeric forward pass for a tiny sequence.'
            ]
          }
        ],
        checklist: [
          'Can write softmax-stable scaled dot-product attention in NumPy.',
          'Can explain why dividing by sqrt(d_k) matters for large head dimensions.',
          'Can apply causal or padding masks via large negative logits.',
          'Can compute a tiny attention example by hand with correct shapes.',
          'Can describe attention cost as quadratic in sequence length.'
        ],
        pitfalls: [
          'Forgetting to scale logits and ending up with near one-hot attention.',
          'Masking after softmax without understanding renormalization effects.',
          'Mixing up axes so scores become (d, d) instead of (seq, seq).',
          'Using the same tensor for Q, K, and V without saying that is a special case.',
          'Ignoring numerical stability when exponentiating large scores.'
        ],
        interviewPrompts: [
          'Walk through the formula for scaled dot-product attention and the shapes at each step.',
          'Why do we divide by sqrt(d_k)?',
          'How do causal masks and padding masks differ?',
          'What does a single row of the attention weight matrix represent?',
          'Why is vanilla attention expensive for long sequences?'
        ],
        exercises: [
          {
            id: 'implement-sdpa',
            title: 'Implement scaled dot-product attention',
            difficulty: 'beginner',
            type: 'coding',
            description:
              'Fill in scaled_dot_product_attention so it returns context outputs and attention weights for a small Q/K/V example, with optional boolean mask.',
            starterCode: code([
              'import numpy as np',
              '',
              'def scaled_dot_product_attention(Q, K, V, mask=None):',
              '    # TODO: compute scaled scores, apply mask with -1e9, softmax, multiply by V.',
              '    # Return (output, weights).',
              '    return None, None',
              '',
              'Q = np.array([[1.0, 0.0], [0.0, 1.0]])',
              'K = np.array([[1.0, 0.0], [1.0, 1.0]])',
              'V = np.array([[2.0, 0.0], [0.0, 3.0]])',
              'mask = np.array([[True, False], [True, True]])',
              'out, wts = scaled_dot_product_attention(Q, K, V, mask=mask)',
              'if out is None:',
              '    print(\'TODO: implement attention\')',
              'else:',
              '    print(\'weights:\\n\', np.round(wts, 3))',
              '    print(\'output:\\n\', np.round(out, 3))'
            ]),
            solution: code([
              'import numpy as np',
              '',
              'def scaled_dot_product_attention(Q, K, V, mask=None):',
              '    d_k = Q.shape[-1]',
              '    scores = Q @ K.T / np.sqrt(d_k)',
              '    if mask is not None:',
              '        scores = np.where(mask, scores, -1e9)',
              '    scores = scores - scores.max(axis=-1, keepdims=True)',
              '    weights = np.exp(scores)',
              '    weights = weights / weights.sum(axis=-1, keepdims=True)',
              '    return weights @ V, weights',
              '',
              'Q = np.array([[1.0, 0.0], [0.0, 1.0]])',
              'K = np.array([[1.0, 0.0], [1.0, 1.0]])',
              'V = np.array([[2.0, 0.0], [0.0, 3.0]])',
              'mask = np.array([[True, False], [True, True]])',
              'out, wts = scaled_dot_product_attention(Q, K, V, mask=mask)',
              'print(\'weights:\\n\', np.round(wts, 3))',
              'print(\'output:\\n\', np.round(out, 3))'
            ]),
            hints: [
              'scores = Q @ K.T / sqrt(d_k).',
              'Use np.where(mask, scores, -1e9) before softmax.',
              'Softmax over the last axis, then multiply weights @ V.'
            ],
            expectedOutput:
              'Printed attention weights with a near-zero top-right entry due to the mask, plus the resulting 2x2 output matrix.'
          },
          {
            id: 'compare-scaled-unscaled',
            title: 'Compare scaled vs unscaled attention sharpness',
            difficulty: 'intermediate',
            type: 'coding',
            description:
              'Generate random Q/K with large d_k and show that unscaled softmax is sharper (higher max weight) than scaled softmax.',
            starterCode: code([
              'import numpy as np',
              '',
              'rng = np.random.default_rng(2)',
              'seq, d_k = 6, 64',
              'Q = rng.normal(size=(seq, d_k))',
              'K = rng.normal(size=(seq, d_k))',
              '',
              'def row_softmax(scores):',
              '    scores = scores - scores.max(axis=1, keepdims=True)',
              '    e = np.exp(scores)',
              '    return e / e.sum(axis=1, keepdims=True)',
              '',
              '# TODO: compute unscaled and scaled attention weight matrices.',
              'w_unscaled = None',
              'w_scaled = None',
              '',
              'if w_unscaled is None:',
              '    print(\'TODO: compare scaled and unscaled softmax\')',
              'else:',
              '    print(\'mean max weight unscaled:\', round(w_unscaled.max(axis=1).mean(), 4))',
              '    print(\'mean max weight scaled:\', round(w_scaled.max(axis=1).mean(), 4))'
            ]),
            solution: code([
              'import numpy as np',
              '',
              'rng = np.random.default_rng(2)',
              'seq, d_k = 6, 64',
              'Q = rng.normal(size=(seq, d_k))',
              'K = rng.normal(size=(seq, d_k))',
              '',
              'def row_softmax(scores):',
              '    scores = scores - scores.max(axis=1, keepdims=True)',
              '    e = np.exp(scores)',
              '    return e / e.sum(axis=1, keepdims=True)',
              '',
              'scores = Q @ K.T',
              'w_unscaled = row_softmax(scores)',
              'w_scaled = row_softmax(scores / np.sqrt(d_k))',
              'print(\'mean max weight unscaled:\', round(w_unscaled.max(axis=1).mean(), 4))',
              'print(\'mean max weight scaled:\', round(w_scaled.max(axis=1).mean(), 4))'
            ]),
            hints: [
              'Unscaled scores = Q @ K.T.',
              'Scaled scores divide by sqrt(d_k).',
              'Compare the mean of each row\'s maximum weight.'
            ],
            expectedOutput:
              'Two printed averages where the unscaled mean max weight is larger (sharper) than the scaled one.'
          },
          {
            id: 'attention-design-tradeoffs',
            title: 'Design attention for a product constraint',
            difficulty: 'intermediate',
            type: 'design',
            description:
              'Choose masking and complexity tradeoffs for a support-ticket summarizer that may include padded batching.',
            promptQuestions: [
              'When would you use padding masks vs causal masks in this product?',
              'How would sequence length limits affect architecture or chunking choices?',
              'What tests would prove illegal positions never receive attention mass?',
              'How would you explain O(n^2) cost to a product partner?'
            ]
          }
        ],
        diagram: null,
        related: [
          'multi-head-and-blocks',
          'positional-encoding-and-causal-mask'
        ]
      },
      {
        slug: 'multi-head-and-blocks',
        title: 'Multi-head attention and transformer blocks',
        summary:
          'Project Q/K/V into multiple heads, merge outputs, and assemble residual attention plus feed-forward blocks with correct shapes.',
        duration: '60-75 min',
        whyItMatters:
          'Real transformers are stacks of multi-head attention and feed-forward sublayers with residuals and normalization. Shape fluency here is what lets you debug dimension mismatches and explain parameter counts in interviews.',
        sections: [
          {
            heading: 'Multi-head attention learns several routing patterns',
            body:
              'A single attention head uses one projection into query/key/value space. That can bottleneck representation: one head might specialize in local syntax while another tracks long-range coreference, but only if they have separate parameters. Multi-head attention splits the model dimension d_model into h heads of width d_k = d_model / h. For d_model=512 and h=8, each head uses d_k=64. Input X of shape (seq, 512) is projected to Q, K, V each of shape (seq, 512), then reshaped to (h, seq, d_k) or (seq, h, d_k) depending on convention. Each head runs scaled dot-product attention independently. Outputs are concatenated back to (seq, 512) and passed through an output projection W_O. Interview intuition: heads are parallel soft lookups with different learned similarity metrics, not just repeated computation.',
            bullets: [
              'Head dimension is usually d_model / num_heads.',
              'Concatenate head outputs before the final output projection.',
              'Different heads can attend to different dependency types.'
            ],
            codeExample: {
              title: 'Split and merge heads with reshape',
              language: 'python',
              code: code([
                'import numpy as np',
                '',
                'rng = np.random.default_rng(0)',
                'seq, d_model, heads = 5, 32, 4',
                'd_k = d_model // heads',
                'X = rng.normal(size=(seq, d_model))',
                'W_QKV = rng.normal(size=(d_model, 3 * d_model))',
                'qkv = X @ W_QKV',
                'Q, K, V = np.split(qkv, 3, axis=1)',
                '',
                'def split_heads(t):',
                '    return t.reshape(seq, heads, d_k).transpose(1, 0, 2)',
                '',
                'Qh, Kh, Vh = split_heads(Q), split_heads(K), split_heads(V)',
                'print(\'per-head Q shape:\', Qh.shape)',
                'scores = Qh @ np.swapaxes(Kh, -1, -2) / np.sqrt(d_k)',
                'print(\'scores shape:\', scores.shape)'
              ])
            }
          },
          {
            heading: 'Projections are ordinary linear maps',
            body:
              'The matrices W_Q, W_K, W_V, and W_O are dense linear layers. If X is (seq, d_model), then Q = X @ W_Q with W_Q shape (d_model, d_model) for the combined projection, or (d_model, d_k) per head. Parameter counting is a common interview prompt. For one attention sublayer with shared d_model across Q/K/V/O and no biases, parameters are about 4 * d_model^2. With d_model=768 that is roughly 2.36 million parameters just for attention projections in one layer. Biases and norms add more. When people say a 12-layer model, they mean this block repeats, so multiply carefully. From-scratch NumPy versions help you see that \'multi-head\' is reshape bookkeeping plus independent attention calls, not a mysterious new operator.',
            bullets: [
              'Count 4*d_model^2 for Q/K/V/O when dimensions match and biases are ignored.',
              'Bias terms and layer norms add smaller but real parameter counts.',
              'Reshape errors are the most common from-scratch multi-head bugs.'
            ],
            codeExample: {
              title: 'Count attention projection parameters',
              language: 'python',
              code: code([
                'import numpy as np',
                '',
                'd_model, heads = 768, 12',
                'd_k = d_model // heads',
                'params_qkv_o = 4 * d_model * d_model',
                'params_with_bias = params_qkv_o + 4 * d_model',
                'print(\'d_k:\', d_k)',
                'print(\'QKV+O weights:\', params_qkv_o)',
                'print(\'with biases:\', params_with_bias)'
              ])
            }
          },
          {
            heading: 'Residual connections stabilize deep stacks',
            body:
              'A transformer block typically computes x = x + Attention(LayerNorm(x)) or Attention then norm, depending on pre-norm vs post-norm. The residual means the block predicts an update, not an entirely new representation. Numerically, if attention output is near zero early in training, the residual still preserves the input signal so gradients can flow. Example: input vector [1, 2, 3], attention delta [0.1, -0.2, 0.0], residual result [1.1, 1.8, 3.0]. Without residuals, stacking many nonlinear layers often degrades signal. In interviews, connect residuals to ResNet intuition and to optimization: identity paths keep deep networks trainable. Also note shape constraints: attention output must match d_model so addition is valid.',
            bullets: [
              'Residuals require matching shapes between branch output and block input.',
              'Pre-norm architectures normalize before sublayers; post-norm normalizes after adding.',
              'Residuals help gradient flow through deep transformer stacks.'
            ],
            codeExample: {
              title: 'Residual attention update on toy vectors',
              language: 'python',
              code: code([
                'import numpy as np',
                '',
                'x = np.array([[1.0, 2.0, 3.0, 4.0]])',
                'attn_out = np.array([[0.1, -0.2, 0.0, 0.3]])',
                'y = x + attn_out',
                'print(\'input:\', x)',
                'print(\'attn delta:\', attn_out)',
                'print(\'residual:\', y)'
              ])
            }
          },
          {
            heading: 'The feed-forward network expands then contracts',
            body:
              'After attention mixes information across tokens, a position-wise feed-forward network (FFN) transforms each token independently. The common pattern is Linear(d_model -> d_ff), activation (ReLU or GELU), Linear(d_ff -> d_model), often with d_ff = 4 * d_model. For one token of size 512, expand to 2048, apply ReLU, then project back to 512. This is where much of the parameter count lives: 2 * d_model * d_ff weights per layer. Conceptually, attention moves information between positions; the FFN processes features at each position. A tiny numeric pass: token [1, -1], W1 = [[1, 2], [0, 1], [1, 0]] wait shapes must match. Prefer clear shapes: x (1, 4), W1 (4, 8), b1 (8,), W2 (8, 4). Always validate that FFN(x).shape == x.shape before residual add.',
            bullets: [
              'FFN is applied identically and independently at every sequence position.',
              'Expansion ratio of 4x is common but not mandatory.',
              'FFN parameters often dominate attention parameters in wide models.'
            ],
            codeExample: {
              title: 'Position-wise FFN forward pass',
              language: 'python',
              code: code([
                'import numpy as np',
                '',
                'rng = np.random.default_rng(3)',
                'seq, d_model, d_ff = 5, 16, 64',
                'x = rng.normal(size=(seq, d_model))',
                'W1 = rng.normal(size=(d_model, d_ff))',
                'b1 = rng.normal(size=(d_ff,))',
                'W2 = rng.normal(size=(d_ff, d_model))',
                'b2 = rng.normal(size=(d_model,))',
                'hidden = np.maximum(0, x @ W1 + b1)',
                'out = hidden @ W2 + b2',
                'print(\'hidden shape:\', hidden.shape)',
                'print(\'ffn out shape:\', out.shape)',
                'print(\'residual-ready:\', out.shape == x.shape)'
              ])
            }
          },
          {
            heading: 'Assemble one transformer block from parts',
            body:
              'Put the pieces together for one pre-norm style block in NumPy: normalize, multi-head attention, residual; normalize, FFN, residual. Layer norm for a vector x subtracts mean and divides by standard deviation across features, then applies gain and bias. For study, even a simple feature-wise standardize is enough to see the structure. Shapes through the block should remain (seq, d_model). A practical debugging checklist: (1) Q/K/V projection width divisible by heads, (2) attention weights sum to 1 on the key axis, (3) merged heads restore d_model, (4) FFN returns d_model, (5) residuals add tensors of equal shape. Interviewers like candidates who debug with shapes before diving into training hyperparameters.',
            bullets: [
              'Keep (seq, d_model) invariant across the full block.',
              'Validate attention weight normalization per head.',
              'Treat layer norm scale/bias as learned parameters in real models.'
            ],
            codeExample: {
              title: 'One-block shape skeleton',
              language: 'python',
              code: code([
                'import numpy as np',
                '',
                'def layer_norm(x, eps=1e-5):',
                '    mu = x.mean(axis=-1, keepdims=True)',
                '    var = x.var(axis=-1, keepdims=True)',
                '    return (x - mu) / np.sqrt(var + eps)',
                '',
                'def softmax(a, axis=-1):',
                '    a = a - a.max(axis=axis, keepdims=True)',
                '    e = np.exp(a)',
                '    return e / e.sum(axis=axis, keepdims=True)',
                '',
                'rng = np.random.default_rng(4)',
                'seq, d_model, heads = 6, 32, 4',
                'd_k = d_model // heads',
                'x = rng.normal(size=(seq, d_model))',
                'W_qkv = rng.normal(size=(d_model, 3 * d_model))',
                'W_o = rng.normal(size=(d_model, d_model))',
                'W1 = rng.normal(size=(d_model, 4 * d_model))',
                'W2 = rng.normal(size=(4 * d_model, d_model))',
                '',
                'h = layer_norm(x)',
                'qkv = h @ W_qkv',
                'Q, K, V = [t.reshape(seq, heads, d_k).transpose(1, 0, 2) for t in np.split(qkv, 3, axis=1)]',
                'w = softmax(Q @ np.swapaxes(K, -1, -2) / np.sqrt(d_k), axis=-1)',
                'attn = (w @ V).transpose(1, 0, 2).reshape(seq, d_model) @ W_o',
                'x = x + attn',
                'x = x + (np.maximum(0, layer_norm(x) @ W1) @ W2)',
                'print(\'block output shape:\', x.shape)'
              ])
            }
          },
          {
            heading: 'Interview stories that score well',
            body:
              'When asked how a transformer block works, narrate information flow: tokens enter as embeddings; attention lets each position gather from others; residuals preserve identity; FFN rewrites features; stacking blocks builds hierarchical representations. Mention compute: attention is O(seq^2 * d_model) while FFN is O(seq * d_model * d_ff). For long sequences, attention dominates; for wide FFNs, matmul width dominates. Also explain why multi-head helps: capacity to attend to multiple relations at once, similar in spirit to multiple filters in a CNN layer. If the interviewer goes deeper, discuss pre-norm training stability or why output projection mixes head-specific subspaces back together. Concrete shapes and one numeric residual example beat vague metaphors.',
            bullets: [
              'Separate cross-position mixing (attention) from per-position transform (FFN).',
              'Compare attention and FFN asymptotic costs.',
              'Use multi-head as multiple learned relation detectors.'
            ]
          }
        ],
        checklist: [
          'Can reshape Q/K/V into heads and merge them again correctly.',
          'Can estimate attention projection parameter counts.',
          'Can explain residual connections inside transformer blocks.',
          'Can implement a position-wise FFN with expansion and projection back.',
          'Can assemble one NumPy transformer block while preserving (seq, d_model).'
        ],
        pitfalls: [
          'Using a head dimension that does not divide d_model evenly.',
          'Forgetting the output projection after concatenating heads.',
          'Adding residual tensors with mismatched shapes.',
          'Applying FFN across the sequence axis instead of the feature axis.',
          'Confusing parameter count of attention with parameter count of FFN.'
        ],
        interviewPrompts: [
          'Why use multiple attention heads instead of one wider head?',
          'What are the shapes through multi-head attention for a given d_model and h?',
          'Where do most parameters live in a typical transformer block?',
          'How do residual connections help deep transformers train?',
          'Contrast the computational cost of attention vs the feed-forward network.'
        ],
        exercises: [
          {
            id: 'split-merge-heads',
            title: 'Split and merge attention heads',
            difficulty: 'beginner',
            type: 'coding',
            description:
              'Implement split_heads and merge_heads helpers and verify round-trip reshaping for a toy tensor.',
            starterCode: code([
              'import numpy as np',
              '',
              'seq, d_model, heads = 5, 32, 4',
              'd_k = d_model // heads',
              'rng = np.random.default_rng(5)',
              'x = rng.normal(size=(seq, d_model))',
              '',
              'def split_heads(t):',
              '    # TODO: return shape (heads, seq, d_k)',
              '    return None',
              '',
              'def merge_heads(t):',
              '    # TODO: from (heads, seq, d_k) back to (seq, d_model)',
              '    return None',
              '',
              'h = split_heads(x)',
              'if h is None:',
              '    print(\'TODO: implement split/merge\')',
              'else:',
              '    y = merge_heads(h)',
              '    print(\'split shape:\', h.shape)',
              '    print(\'roundtrip ok:\', np.allclose(x, y))'
            ]),
            solution: code([
              'import numpy as np',
              '',
              'seq, d_model, heads = 5, 32, 4',
              'd_k = d_model // heads',
              'rng = np.random.default_rng(5)',
              'x = rng.normal(size=(seq, d_model))',
              '',
              'def split_heads(t):',
              '    return t.reshape(seq, heads, d_k).transpose(1, 0, 2)',
              '',
              'def merge_heads(t):',
              '    return t.transpose(1, 0, 2).reshape(seq, d_model)',
              '',
              'h = split_heads(x)',
              'y = merge_heads(h)',
              'print(\'split shape:\', h.shape)',
              'print(\'roundtrip ok:\', np.allclose(x, y))'
            ]),
            hints: [
              'Reshape to (seq, heads, d_k) then transpose to (heads, seq, d_k).',
              'Merge by reversing the transpose and reshaping to (seq, d_model).',
              'Use np.allclose to verify the round trip.'
            ],
            expectedOutput:
              'Printed split shape (4, 5, 8) and roundtrip ok: True.'
          },
          {
            id: 'transformer-block-shapes',
            title: 'Build a residual attention + FFN block',
            difficulty: 'intermediate',
            type: 'coding',
            description:
              'Complete a tiny pre-norm transformer block that keeps shape (seq, d_model) and prints output stats.',
            starterCode: code([
              'import numpy as np',
              '',
              'def layer_norm(x, eps=1e-5):',
              '    mu = x.mean(axis=-1, keepdims=True)',
              '    var = x.var(axis=-1, keepdims=True)',
              '    return (x - mu) / np.sqrt(var + eps)',
              '',
              'def softmax(a, axis=-1):',
              '    a = a - a.max(axis=axis, keepdims=True)',
              '    e = np.exp(a)',
              '    return e / e.sum(axis=axis, keepdims=True)',
              '',
              'rng = np.random.default_rng(6)',
              'seq, d_model, heads = 6, 32, 4',
              'd_k = d_model // heads',
              'x = rng.normal(size=(seq, d_model))',
              'W_qkv = rng.normal(size=(d_model, 3 * d_model))',
              'W_o = rng.normal(size=(d_model, d_model))',
              'W1 = rng.normal(size=(d_model, 4 * d_model))',
              'W2 = rng.normal(size=(4 * d_model, d_model))',
              '',
              '# TODO: pre-norm attention with residual, then pre-norm FFN with residual.',
              'out = None',
              'if out is None:',
              '    print(\'TODO: assemble the block\')',
              'else:',
              '    print(\'shape:\', out.shape)',
              '    print(\'mean:\', round(float(out.mean()), 4), \'std:\', round(float(out.std()), 4))'
            ]),
            solution: code([
              'import numpy as np',
              '',
              'def layer_norm(x, eps=1e-5):',
              '    mu = x.mean(axis=-1, keepdims=True)',
              '    var = x.var(axis=-1, keepdims=True)',
              '    return (x - mu) / np.sqrt(var + eps)',
              '',
              'def softmax(a, axis=-1):',
              '    a = a - a.max(axis=axis, keepdims=True)',
              '    e = np.exp(a)',
              '    return e / e.sum(axis=axis, keepdims=True)',
              '',
              'rng = np.random.default_rng(6)',
              'seq, d_model, heads = 6, 32, 4',
              'd_k = d_model // heads',
              'x = rng.normal(size=(seq, d_model))',
              'W_qkv = rng.normal(size=(d_model, 3 * d_model))',
              'W_o = rng.normal(size=(d_model, d_model))',
              'W1 = rng.normal(size=(d_model, 4 * d_model))',
              'W2 = rng.normal(size=(4 * d_model, d_model))',
              '',
              'h = layer_norm(x)',
              'Q, K, V = [t.reshape(seq, heads, d_k).transpose(1, 0, 2) for t in np.split(h @ W_qkv, 3, axis=1)]',
              'w = softmax(Q @ np.swapaxes(K, -1, -2) / np.sqrt(d_k), axis=-1)',
              'attn = (w @ V).transpose(1, 0, 2).reshape(seq, d_model) @ W_o',
              'x = x + attn',
              'out = x + (np.maximum(0, layer_norm(x) @ W1) @ W2)',
              'print(\'shape:\', out.shape)',
              'print(\'mean:\', round(float(out.mean()), 4), \'std:\', round(float(out.std()), 4))'
            ]),
            hints: [
              'Split Q/K/V after a combined projection, then run attention per head.',
              'Merge heads before W_o and add the residual.',
              'FFN uses ReLU between the two linear maps.'
            ],
            expectedOutput:
              'Printed block output shape (6, 32) with mean/std summary statistics.'
          },
          {
            id: 'block-design-latency',
            title: 'Design a block for latency constraints',
            difficulty: 'intermediate',
            type: 'design',
            description:
              'Choose head count and FFN width for a low-latency ranking model with short sequences.',
            promptQuestions: [
              'How would you trade num_heads vs d_k under a fixed d_model?',
              'When does reducing d_ff help more than reducing heads?',
              'What shape assertions would you require in CI for block modules?',
              'Which metrics would convince you a smaller block is good enough?'
            ]
          }
        ],
        diagram: null,
        related: [
          'attention-from-scratch',
          'positional-encoding-and-causal-mask'
        ]
      },
      {
        slug: 'positional-encoding-and-causal-mask',
        title: 'Positional encoding, causal masks, and KV-cache intuition',
        summary:
          'Add sin/cos positional encodings, enforce causal attention, and model KV-cache growth with arrays for autoregressive decoding intuition.',
        duration: '55-70 min',
        whyItMatters:
          'Self-attention is permutation-equivariant without position signals, and causal decoding needs both future masking and cached keys/values. These details separate people who can discuss LLM inference from people who only know the training diagram.',
        sections: [
          {
            heading: 'Attention alone does not know order',
            body:
              'If you shuffle the token embeddings before a stack of pure attention and FFN layers without position information, the set of pairwise interactions is the same up to permutation. The model can learn content relationships but not \'first\', \'before\', or \'adjacent\' unless order is injected. Positional encodings add a position-dependent vector to each token embedding. Absolute sin/cos encodings assign a fixed vector pe[pos] for each index. Relative schemes encode distances between tokens. In interview terms: embeddings carry what; positional encodings carry where. A quick mental test: without positions, the sentences \'dog bites man\' and \'man bites dog\' are harder to distinguish from bag-of-vectors attention alone because the same words appear.',
            bullets: [
              'Self-attention mixes values based on content similarity, not index order.',
              'Positional signals restore order sensitivity.',
              'Absolute and relative position methods solve the same core problem differently.'
            ],
            codeExample: {
              title: 'Same bag of embeddings, different meanings',
              language: 'python',
              code: code([
                'import numpy as np',
                '',
                'emb = {',
                '    \'man\': np.array([1.0, 0.0, 0.2]),',
                '    \'bites\': np.array([0.0, 1.0, 0.1]),',
                '    \'dog\': np.array([0.2, 0.0, 1.0]),',
                '}',
                's1 = np.stack([emb[\'dog\'], emb[\'bites\'], emb[\'man\']])',
                's2 = np.stack([emb[\'man\'], emb[\'bites\'], emb[\'dog\']])',
                'print(\'mean pooling identical?\', np.allclose(s1.mean(0), s2.mean(0)))',
                'print(\'order differs:\\n\', s1, \'\\n\', s2)'
              ])
            }
          },
          {
            heading: 'Sin/cos positional encodings use frequency bands',
            body:
              'The original transformer uses pe[pos, 2i] = sin(pos / 10000^(2i/d)) and pe[pos, 2i+1] = cos(pos / 10000^(2i/d)). Low dimensions vary slowly across positions; high dimensions oscillate quickly. That gives each position a unique pattern and lets linear layers learn to attend by relative offsets because sin/cos shifts can be expressed with linear transforms. Example for d=4 and pos=0..3: dimension 0 is a slow sine, dimension 1 the matching cosine, dimensions 2-3 a faster pair. You add pe to token embeddings before the first block: X = token_embed + pe[:seq]. In NumPy, build a (max_len, d_model) table once and slice it. Interview tip: mention deterministic, non-learned absolute encodings as the classic baseline, then note learned positional embeddings and rotary embeddings as modern alternatives.',
            bullets: [
              'Even dimensions use sine; odd dimensions use cosine in the classic formula.',
              'Wavelengths grow geometrically with dimension index.',
              'Add positional encodings to embeddings before transformer blocks.'
            ],
            codeExample: {
              title: 'Build sin/cos positional encodings',
              language: 'python',
              code: code([
                'import numpy as np',
                '',
                'def sinusoidal_positional_encoding(max_len, d_model, base=10000.0):',
                '    pe = np.zeros((max_len, d_model))',
                '    position = np.arange(max_len)[:, None]',
                '    i = np.arange(0, d_model, 2)',
                '    denom = base ** (i / d_model)',
                '    pe[:, 0::2] = np.sin(position / denom)',
                '    pe[:, 1::2] = np.cos(position / denom)',
                '    return pe',
                '',
                'pe = sinusoidal_positional_encoding(8, 4)',
                'print(pe.round(3))'
              ])
            }
          },
          {
            heading: 'Causal masks enforce left-to-right generation',
            body:
              'Language-model training predicts the next token from previous tokens. If attention at position i can read position i+1, the model can cheat by looking at the answer. A causal mask sets scores for keys j > i to a large negative before softmax. For seq=4, the allowed pattern is lower triangular ones: position 0 sees [1,0,0,0], position 2 sees [1,1,1,0]. Teacher forcing still feeds the true previous tokens during training, but the mask prevents future leakage inside the sequence. At inference, you generate one token at a time; the mask (or incremental decoding) ensures each new query only sees past keys. Always test that the upper triangle of attention weights is ~0.',
            bullets: [
              'Causal masking is required for autoregressive next-token prediction.',
              'Lower-triangular boolean masks are the usual representation.',
              'Training with teacher forcing still needs future masking inside the sequence.'
            ],
            codeExample: {
              title: 'Verify causal weights ignore the future',
              language: 'python',
              code: code([
                'import numpy as np',
                '',
                'def softmax(x, axis=-1):',
                '    x = x - x.max(axis=axis, keepdims=True)',
                '    e = np.exp(x)',
                '    return e / e.sum(axis=axis, keepdims=True)',
                '',
                'rng = np.random.default_rng(0)',
                'seq, d = 4, 8',
                'Q = rng.normal(size=(seq, d))',
                'K = rng.normal(size=(seq, d))',
                'scores = Q @ K.T / np.sqrt(d)',
                'mask = np.tril(np.ones((seq, seq), dtype=bool))',
                'weights = softmax(np.where(mask, scores, -1e9))',
                'print(weights.round(3))',
                'print(\'future mass:\', float(np.triu(weights, 1).sum()))'
              ])
            }
          },
          {
            heading: 'KV-cache intuition with growing arrays',
            body:
              'During autoregressive decoding, recomputing keys and values for all past tokens at every step wastes work. A KV cache stores the K and V tensors produced so far. At step t, you compute Q/K/V only for the new token, append the new K/V to the cache, and attend with Q_t against all cached keys. Shapes: after t tokens with one head, cached K has shape (t, d_k). The attention score vector has length t. This is why first-token latency (prefill) and per-token latency (decode) differ: prefill processes a prompt in parallel; decode repeatedly does small incremental steps with growing cache. In NumPy, you can simulate this with a list or preallocated array and a length counter. Interviewers love hearing that cache memory scales with layers * heads * seq * d_k.',
            bullets: [
              'Prefill computes K/V for the whole prompt once.',
              'Decode appends one K/V row per new token per layer/head.',
              'Cache size grows linearly with sequence length and number of layers.'
            ],
            codeExample: {
              title: 'Simulate a one-head KV cache decode loop',
              language: 'python',
              code: code([
                'import numpy as np',
                '',
                'def softmax(x):',
                '    x = x - x.max()',
                '    e = np.exp(x)',
                '    return e / e.sum()',
                '',
                'rng = np.random.default_rng(1)',
                'd_k = 4',
                'prompt = rng.normal(size=(3, d_k))',
                'cache_k = prompt.copy()',
                'cache_v = prompt.copy()',
                'print(\'prefill cache\', cache_k.shape)',
                'for step in range(3):',
                '    q = rng.normal(size=(d_k,))',
                '    k = rng.normal(size=(d_k,))',
                '    v = rng.normal(size=(d_k,))',
                '    cache_k = np.vstack([cache_k, k])',
                '    cache_v = np.vstack([cache_v, v])',
                '    weights = softmax(cache_k @ q / np.sqrt(d_k))',
                '    out = weights @ cache_v',
                '    print(f\'decode step {step}: cache={cache_k.shape[0]} out={out.round(3)}\')'
              ])
            }
          },
          {
            heading: 'Combine positions, causality, and caching in one story',
            body:
              'A strong interview narrative for decoder-only transformers: tokenize text into ids; embed tokens; add positional encodings; run N blocks of causal multi-head attention and FFN; project to vocabulary logits; softmax for next-token distribution. At inference, prefill the prompt through the stack while filling KV caches, then decode token by token using cached keys/values and the newest query. Positional encodings must stay consistent with absolute indices or relative scheme as the sequence grows. Causal masks during training match the information available at decode time. If positions are wrong, the model may still run but generalize poorly to longer contexts. If the cache is skipped, decode becomes dramatically slower. If the mask is wrong, training leaks future tokens and reported perplexity becomes dishonest.',
            bullets: [
              'Training masks and decode-time information flow should match.',
              'Position indices continue increasing as generated tokens append.',
              'KV caching is an inference optimization, not a change to model math.'
            ],
            codeExample: {
              title: 'Position-aware embeddings plus causal scores',
              language: 'python',
              code: code([
                'import numpy as np',
                '',
                'def sinusoidal_positional_encoding(max_len, d_model, base=10000.0):',
                '    pe = np.zeros((max_len, d_model))',
                '    pos = np.arange(max_len)[:, None]',
                '    i = np.arange(0, d_model, 2)',
                '    denom = base ** (i / d_model)',
                '    pe[:, 0::2] = np.sin(pos / denom)',
                '    pe[:, 1::2] = np.cos(pos / denom)',
                '    return pe',
                '',
                'rng = np.random.default_rng(2)',
                'tok = rng.normal(size=(5, 8))',
                'x = tok + sinusoidal_positional_encoding(5, 8)',
                'scores = x @ x.T / np.sqrt(8)',
                'mask = np.tril(np.ones((5, 5), dtype=bool))',
                'scores = np.where(mask, scores, -1e9)',
                'print(\'position-aware causal logits:\\n\', scores.round(2))'
              ])
            }
          },
          {
            heading: 'Failure modes to mention under pressure',
            body:
              'Common bugs: off-by-one in causal masks allowing the current training target to see itself incorrectly depending on label alignment; reusing position 0 for every decoded token; growing a KV cache but forgetting to slice to valid length when using preallocated buffers; mixing training-time bidirectional attention with decode-time causal expectations. Long-context issues also matter: sin/cos absolute encodings can extrapolate poorly far beyond training lengths, which is one reason relative or rotary schemes became popular. For product systems, memory is often the decode bottleneck: large batch size times long cache times many layers can exceed GPU memory even when FLOPs look fine. Show that you can reason about both correctness and systems constraints.',
            bullets: [
              'Check mask triangles with explicit unit tests.',
              'Track absolute positions across prefill and decode.',
              'Estimate KV-cache memory before promising long-context features.'
            ]
          }
        ],
        checklist: [
          'Can explain why transformers need positional information.',
          'Can implement sin/cos positional encodings in NumPy.',
          'Can build and validate a causal attention mask.',
          'Can describe KV-cache growth during autoregressive decoding.',
          'Can connect training-time masks to inference-time information flow.'
        ],
        pitfalls: [
          'Assuming attention knows token order without positional signals.',
          'Using a bidirectional mask for next-token language modeling.',
          'Recomputing full-sequence K/V on every decode step without discussing cost.',
          'Letting position indices reset incorrectly during generation.',
          'Ignoring KV-cache memory as a production constraint.'
        ],
        interviewPrompts: [
          'Why are positional encodings necessary in transformers?',
          'How does a causal mask differ from a padding mask?',
          'Explain KV caching and why it speeds up decoding.',
          'How do sin and cos frequencies vary across dimensions?',
          'What goes wrong if training is bidirectional but serving is causal?'
        ],
        exercises: [
          {
            id: 'build-sinusoidal-pe',
            title: 'Implement sinusoidal positional encodings',
            difficulty: 'beginner',
            type: 'coding',
            description:
              'Write sinusoidal_positional_encoding(max_len, d_model) and print a small table plus a uniqueness check.',
            starterCode: code([
              'import numpy as np',
              '',
              'def sinusoidal_positional_encoding(max_len, d_model, base=10000.0):',
              '    # TODO: fill pe[pos, 2i] = sin(...), pe[pos, 2i+1] = cos(...)',
              '    return None',
              '',
              'pe = sinusoidal_positional_encoding(6, 4)',
              'if pe is None:',
              '    print(\'TODO: implement positional encoding\')',
              'else:',
              '    print(pe.round(3))',
              '    dists = np.linalg.norm(pe[:, None, :] - pe[None, :, :], axis=-1)',
              '    print(\'min off-diagonal distance:\', round(float(dists[~np.eye(6, dtype=bool)].min()), 4))'
            ]),
            solution: code([
              'import numpy as np',
              '',
              'def sinusoidal_positional_encoding(max_len, d_model, base=10000.0):',
              '    pe = np.zeros((max_len, d_model))',
              '    position = np.arange(max_len)[:, None]',
              '    i = np.arange(0, d_model, 2)',
              '    denom = base ** (i / d_model)',
              '    pe[:, 0::2] = np.sin(position / denom)',
              '    pe[:, 1::2] = np.cos(position / denom)',
              '    return pe',
              '',
              'pe = sinusoidal_positional_encoding(6, 4)',
              'print(pe.round(3))',
              'dists = np.linalg.norm(pe[:, None, :] - pe[None, :, :], axis=-1)',
              'print(\'min off-diagonal distance:\', round(float(dists[~np.eye(6, dtype=bool)].min()), 4))'
            ]),
            hints: [
              'Create a zero matrix of shape (max_len, d_model).',
              'Use position / 10000^(i/d_model) inside sin/cos.',
              'Assign even columns with sin and odd columns with cos.'
            ],
            expectedOutput:
              'A printed 6x4 encoding table and a positive min off-diagonal distance.'
          },
          {
            id: 'kv-cache-decode-sim',
            title: 'Simulate KV-cache decoding',
            difficulty: 'intermediate',
            type: 'coding',
            description:
              'Maintain rolling K/V caches while decoding new tokens and print cache lengths plus attention output norms.',
            starterCode: code([
              'import numpy as np',
              '',
              'def softmax(x):',
              '    x = x - np.max(x)',
              '    e = np.exp(x)',
              '    return e / e.sum()',
              '',
              'rng = np.random.default_rng(7)',
              'd_k = 8',
              'cache_k = rng.normal(size=(2, d_k))  # prompt prefill',
              'cache_v = rng.normal(size=(2, d_k))',
              '',
              '# TODO: for 4 decode steps, append new k/v and compute attention output for a new q.',
              'print(\'TODO: simulate decode with KV cache\')'
            ]),
            solution: code([
              'import numpy as np',
              '',
              'def softmax(x):',
              '    x = x - np.max(x)',
              '    e = np.exp(x)',
              '    return e / e.sum()',
              '',
              'rng = np.random.default_rng(7)',
              'd_k = 8',
              'cache_k = rng.normal(size=(2, d_k))',
              'cache_v = rng.normal(size=(2, d_k))',
              '',
              'for step in range(4):',
              '    q = rng.normal(size=(d_k,))',
              '    k = rng.normal(size=(d_k,))',
              '    v = rng.normal(size=(d_k,))',
              '    cache_k = np.vstack([cache_k, k])',
              '    cache_v = np.vstack([cache_v, v])',
              '    weights = softmax(cache_k @ q / np.sqrt(d_k))',
              '    out = weights @ cache_v',
              '    print(f\'step {step}: cache_len={cache_k.shape[0]} out_norm={round(float(np.linalg.norm(out)), 4)}\')'
            ]),
            hints: [
              'Append the new key/value rows before attending.',
              'Scores are cache_k @ q / sqrt(d_k).',
              'Print cache length after each step so growth is visible.'
            ],
            expectedOutput:
              'Four decode lines with cache_len growing from 3 to 6 and output norms.'
          },
          {
            id: 'long-context-inference-design',
            title: 'Design long-context decode constraints',
            difficulty: 'advanced',
            type: 'design',
            description:
              'Plan KV-cache memory and masking for a chatbot with 8k context.',
            promptQuestions: [
              'How would you estimate KV-cache memory for layers, heads, and d_k?',
              'What happens to latency as the cache grows during a long session?',
              'Which position encoding issues appear when users exceed training length?',
              'What safeguards stop future-token leakage in both training and eval?'
            ]
          }
        ],
        diagram: null,
        related: [
          'attention-from-scratch',
          'multi-head-and-blocks'
        ]
      }
    ]
  },
  {
    slug: 'llm-retrieval-lab',
    title: 'LLM systems and retrieval lab',
    summary:
      'Practice tokenization, embedding similarity, and RAG evaluation with pure Python/NumPy/sklearn tools that run in Pyodide.',
    objectives: [
      'Compare whitespace, character, and BPE-like tokenization without external tokenizer libraries',
      'Build bag-of-words/hashing embeddings and top-k cosine retrieval',
      'Evaluate RAG pipelines with chunking, recall@k, MRR, and grounded overlap checks'
    ],
    lessons: [
      {
        slug: 'tokenization-workshop',
        title: 'Tokenization workshop',
        summary:
          'Compare whitespace, character, and BPE-like merge tokenization using pure Python and NumPy—no tiktoken or external tokenizer libraries.',
        duration: '55-70 min',
        whyItMatters:
          'Tokenization defines the atomic units an LLM sees. Interview answers about vocabulary size, rare words, multilingual text, and sequence length all depend on understanding how text becomes token ids.',
        sections: [
          {
            heading: 'Models never see raw characters unless you choose that',
            body:
              'A tokenizer converts a string into a sequence of integer ids from a fixed vocabulary. Whitespace splitting is the simplest word-ish baseline: \'Transformers attend carefully\' becomes three tokens. It fails on punctuation (\'carefully.\' vs \'carefully\'), casing, and languages without spaces. Character tokenization turns the same sentence into one token per character, which makes rare words easy to represent but creates long sequences and forces the model to learn spelling from scratch. Subword methods sit in between: common words stay intact, rare words break into pieces. In interviews, state the tradeoff clearly: shorter sequences vs flexible open-vocabulary coverage vs implementation complexity. Always measure sequence length after tokenization because that length drives attention cost.',
            bullets: [
              'Whitespace tokenizers are brittle around punctuation and morphology.',
              'Character tokenizers maximize coverage but lengthen sequences.',
              'Subword tokenizers balance frequency and generalization.'
            ],
            codeExample: {
              title: 'Whitespace vs character tokenization',
              language: 'python',
              code: code([
                'text = \'Transformers attend carefully.\'',
                'ws = text.lower().replace(\'.\', \' .\').split()',
                'chars = list(text.lower())',
                'print(\'whitespace:\', ws)',
                'print(\'char count:\', len(chars))',
                'print(\'chars head:\', chars[:12])'
              ])
            }
          },
          {
            heading: 'Vocabulary size sets a compression vs learning tradeoff',
            body:
              'Suppose your corpus has 50,000 distinct whitespace words. A word vocabulary of 50k can represent frequent terms in one id, but unseen words become UNK. A character vocabulary might be under 100 symbols for English lowercase plus punctuation, so nothing is unknown, yet a 100-word sentence may become hundreds of tokens and hit context limits sooner. Subword vocabularies commonly land between a few thousand and about 100k ids. Larger vocabularies usually shorten sequences and can improve quality, but they grow embedding matrices: vocab_size * d_model parameters. For d_model=768 and vocab=50,000, embeddings alone are about 38.4 million parameters. That is why tokenizer choice is both an NLP decision and a systems decision. Interview answers should connect vocab size to memory, latency, and rare-word behavior together.',
            bullets: [
              'Embedding tables scale with vocabulary size times embedding dimension.',
              'Unknown tokens are a symptom of too little coverage or domain shift.',
              'Sequence length after tokenization drives attention cost.'
            ],
            codeExample: {
              title: 'Estimate embedding table size',
              language: 'python',
              code: code([
                'def embedding_params(vocab_size, d_model):',
                '    return vocab_size * d_model',
                '',
                'for vocab in [100, 8000, 50000]:',
                '    print(vocab, \'->\', embedding_params(vocab, 768), \'params\')'
              ])
            }
          },
          {
            heading: 'BPE-like merges learn frequent pairs',
            body:
              'Byte Pair Encoding style training starts from characters (or bytes) and repeatedly merges the most frequent adjacent pair into a new symbol. Example corpus: low, low, low, lower, newer, newer. Initial tokens are characters. The pair (\'l\',\'o\') may be frequent, merge to \'lo\'; then (\'lo\',\'w\') to \'low\'. Over many merges you learn subwords like \'er\' and whole words like \'low\'. Encoding a new word applies the learned merges in order. This is not the full industrial tokenizer pipeline, but it teaches the core interview idea: merges compress frequent patterns while leaving a path to compose rare words. Implement pair counting with Python dictionaries and strings; NumPy is optional for frequency histograms. Keep merges ordered because encoding depends on that order.',
            bullets: [
              'BPE training greedily merges the most frequent adjacent pair.',
              'Encoding applies merges deterministically to a base symbol sequence.',
              'Word-boundary markers are often used in production BPE variants.'
            ],
            codeExample: {
              title: 'Count adjacent pairs in a toy corpus',
              language: 'python',
              code: code([
                'from collections import Counter',
                '',
                'corpus = [\'l o w\', \'l o w\', \'l o w e r\', \'n e w e r\', \'n e w e r\']',
                'pair_counts = Counter()',
                'for sent in corpus:',
                '    syms = sent.split()',
                '    for a, b in zip(syms, syms[1:]):',
                '        pair_counts[(a, b)] += 1',
                'print(pair_counts.most_common(5))'
              ])
            }
          },
          {
            heading: 'Implement a tiny trainable merger',
            body:
              'A minimal workshop implementation keeps each word as a list of symbols. For a fixed number of merges: count neighboring pairs across the corpus, pick the best pair, replace adjacent occurrences with a single joined symbol, and record the merge. After training, vocabulary is base characters plus merge products. To encode, start from characters and apply merges in the learned order when both parts are adjacent. Example: after learning (\'e\',\'r\')->\'er\' and (\'l\',\'o\')->\'lo\', the word \'lower\' can become [\'lo\',\'w\',\'er\']. This is enough to discuss tokenization bugs such as inconsistent normalization, accidental merges across spaces, and why special tokens like PAD/BOS/EOS are reserved outside merge learning. Unit tests should freeze merge order and expected encodings for a golden corpus.',
            bullets: [
              'Store merges as an ordered list; order matters for encoding.',
              'Operate inside word boundaries unless you intentionally tokenize bytes globally.',
              'Reserve special tokens so merges cannot collide with control ids.'
            ],
            codeExample: {
              title: 'Perform one greedy BPE merge step',
              language: 'python',
              code: code([
                'from collections import Counter',
                '',
                'def get_stats(words):',
                '    stats = Counter()',
                '    for syms in words:',
                '        for a, b in zip(syms, syms[1:]):',
                '            stats[(a, b)] += 1',
                '    return stats',
                '',
                'def merge_pair(words, pair):',
                '    a, b = pair',
                '    merged = a + b',
                '    out = []',
                '    for syms in words:',
                '        row, i = [], 0',
                '        while i < len(syms):',
                '            if i < len(syms) - 1 and syms[i] == a and syms[i + 1] == b:',
                '                row.append(merged); i += 2',
                '            else:',
                '                row.append(syms[i]); i += 1',
                '        out.append(row)',
                '    return out',
                '',
                'words = [list(w) for w in [\'low\', \'low\', \'lower\', \'newer\', \'newer\']]',
                'pair, _ = get_stats(words).most_common(1)[0]',
                'words2 = merge_pair(words, pair)',
                'print(\'merged pair:\', pair)',
                'print(words2)'
              ])
            }
          },
          {
            heading: 'Evaluate tokenizers with length and fertility',
            body:
              'Tokenizer quality is not only linguistic elegance. Measure tokens per word (fertility), sequence length distributions, and unknown rates on held-out domain text. If a legal document averages 2.5 tokens/word with a general English tokenizer but 1.3 with a domain-adapted one, attention cost and latency change materially. Also inspect splits for names, numbers, and code. A tokenizer that breaks every digit separately may hurt arithmetic; one that over-merges code operators may hurt programming models. For this lab, compare whitespace, character, and a few BPE merges on the same sentences and report token counts. Interviewers appreciate candidates who connect tokenization metrics to cost and quality rather than treating tokenizers as black boxes. Keep a small dashboard of fertility by domain in real systems.',
            bullets: [
              'Fertility = tokens / words is a practical comparison metric.',
              'Domain mismatch shows up as longer sequences and odd splits.',
              'Numbers, names, and code deserve explicit tokenizer spot checks.'
            ],
            codeExample: {
              title: 'Compare fertility across tokenizers',
              language: 'python',
              code: code([
                'text = \'newer lower transformers attend carefully\'',
                'words = text.split()',
                'ws_tokens = words',
                'char_tokens = list(text.replace(\' \', \'\'))',
                'bpe_tokens = [\'new\', \'er\', \'low\', \'er\', \'transform\', \'ers\', \'attend\', \'care\', \'fully\']',
                'for name, toks in [(\'whitespace\', ws_tokens), (\'char\', char_tokens), (\'bpe-ish\', bpe_tokens)]:',
                '    print(name, \'tokens\', len(toks), \'fertility\', round(len(toks) / len(words), 3))'
              ])
            }
          },
          {
            heading: 'Interview talking points that sound senior',
            body:
              'Be ready to explain why LLMs use subwords, how vocabulary size affects embedding parameters, and what happens with multilingual text when a tokenizer was trained mostly on English. Mention normalization (Unicode, lowercasing, NFKC) as a silent source of train/serve mismatch. Discuss special tokens for chat templates and why changing tokenizer/template without adapting the model breaks behavior. If asked to implement something, a pair-counting merge loop is a classic whiteboard exercise. If asked about production, talk about versioning tokenizer files with model artifacts so ids never drift between training and inference. Strong candidates also mention that detokenization and trailing spaces can affect exact string match evaluations.',
            bullets: [
              'Version tokenizer artifacts with the model.',
              'Normalization mismatches create invisible production bugs.',
              'Chat/special tokens are part of the product contract, not an afterthought.'
            ]
          }
        ],
        checklist: [
          'Can contrast whitespace, character, and subword tokenization tradeoffs.',
          'Can estimate embedding parameters from vocabulary size.',
          'Can implement pair counting and one BPE-like merge step.',
          'Can measure token fertility on example text.',
          'Can explain why tokenizer versioning matters in production.'
        ],
        pitfalls: [
          'Ignoring punctuation and casing in naive whitespace tokenization.',
          'Assuming character tokenization is free because the vocab is small.',
          'Implementing merges without preserving merge order for encoding.',
          'Forgetting special tokens when designing a vocabulary.',
          'Shipping a model with a different tokenizer than it was trained with.'
        ],
        interviewPrompts: [
          'Why do modern LLMs use subword tokenization?',
          'How does vocabulary size affect model parameters and sequence length?',
          'Walk through one BPE merge step on a tiny corpus.',
          'What tokenizer issues appear under domain shift?',
          'How would you evaluate two tokenizers for a code-generation model?'
        ],
        exercises: [
          {
            id: 'bpe-train-tiny',
            title: 'Train a tiny BPE-like tokenizer',
            difficulty: 'intermediate',
            type: 'coding',
            description:
              'Run several greedy merge steps on a toy word list and print the merges plus final symbolizations.',
            starterCode: code([
              'from collections import Counter',
              '',
              'def get_stats(words):',
              '    stats = Counter()',
              '    for syms in words:',
              '        for a, b in zip(syms, syms[1:]):',
              '            stats[(a, b)] += 1',
              '    return stats',
              '',
              'def merge_pair(words, pair):',
              '    a, b = pair',
              '    merged = a + b',
              '    out = []',
              '    for syms in words:',
              '        row, i = [], 0',
              '        while i < len(syms):',
              '            if i < len(syms) - 1 and syms[i] == a and syms[i + 1] == b:',
              '                row.append(merged); i += 2',
              '            else:',
              '                row.append(syms[i]); i += 1',
              '        out.append(row)',
              '    return out',
              '',
              'words = [list(w) for w in [\'low\', \'low\', \'lower\', \'newer\', \'newer\']]',
              'merges = []',
              '# TODO: perform 4 merges, appending each chosen pair to merges and updating words.',
              'print(\'TODO: train merges\')'
            ]),
            solution: code([
              'from collections import Counter',
              '',
              'def get_stats(words):',
              '    stats = Counter()',
              '    for syms in words:',
              '        for a, b in zip(syms, syms[1:]):',
              '            stats[(a, b)] += 1',
              '    return stats',
              '',
              'def merge_pair(words, pair):',
              '    a, b = pair',
              '    merged = a + b',
              '    out = []',
              '    for syms in words:',
              '        row, i = [], 0',
              '        while i < len(syms):',
              '            if i < len(syms) - 1 and syms[i] == a and syms[i + 1] == b:',
              '                row.append(merged); i += 2',
              '            else:',
              '                row.append(syms[i]); i += 1',
              '        out.append(row)',
              '    return out',
              '',
              'words = [list(w) for w in [\'low\', \'low\', \'lower\', \'newer\', \'newer\']]',
              'merges = []',
              'for _ in range(4):',
              '    stats = get_stats(words)',
              '    if not stats:',
              '        break',
              '    pair = stats.most_common(1)[0][0]',
              '    merges.append(pair)',
              '    words = merge_pair(words, pair)',
              'print(\'merges:\', merges)',
              'print(\'words:\', words)'
            ]),
            hints: [
              'Each step picks Counter.most_common(1).',
              'Update all words with merge_pair before the next count.',
              'Stop early if no pairs remain.'
            ],
            expectedOutput:
              'Printed list of four merge pairs and the resulting symbol lists for each word.'
          },
          {
            id: 'tokenizer-fertility-compare',
            title: 'Compare tokenizer fertility',
            difficulty: 'beginner',
            type: 'coding',
            description:
              'Compute tokens-per-word for whitespace, character, and a provided subword segmentation on the same sentence.',
            starterCode: code([
              'sentence = \'transformers attend carefully to token frequency\'',
              'words = sentence.split()',
              'whitespace_tokens = words',
              'char_tokens = list(sentence.replace(\' \', \'\'))',
              'subword_tokens = [\'transform\', \'ers\', \'attend\', \'care\', \'fully\', \'to\', \'token\', \'freq\', \'uency\']',
              '',
              '# TODO: print token counts and fertility for each scheme.',
              'print(\'TODO: compare fertility\')'
            ]),
            solution: code([
              'sentence = \'transformers attend carefully to token frequency\'',
              'words = sentence.split()',
              'schemes = {',
              '    \'whitespace\': words,',
              '    \'char\': list(sentence.replace(\' \', \'\')),',
              '    \'subword\': [\'transform\', \'ers\', \'attend\', \'care\', \'fully\', \'to\', \'token\', \'freq\', \'uency\'],',
              '}',
              'for name, toks in schemes.items():',
              '    fertility = len(toks) / len(words)',
              '    print(f\'{name}: tokens={len(toks)} fertility={fertility:.3f}\')'
            ]),
            hints: [
              'Fertility is len(tokens) / len(words).',
              'Use the same sentence for every scheme.',
              'Print both raw token count and fertility.'
            ],
            expectedOutput:
              'Three printed lines with token counts and fertility values for whitespace, char, and subword.'
          },
          {
            id: 'tokenizer-choice-design',
            title: 'Design a tokenizer strategy for mixed text and code',
            difficulty: 'intermediate',
            type: 'design',
            description:
              'Choose a tokenization approach for an assistant that answers with prose and code blocks.',
            promptQuestions: [
              'What corpus should you train or select the tokenizer on?',
              'Which evaluation slices (names, numbers, code, non-English) matter most?',
              'How would you version and deploy tokenizer artifacts with the model?',
              'What product symptoms would indicate tokenizer mismatch in production?'
            ]
          }
        ],
        diagram: null,
        related: [
          'embeddings-and-similarity-lab',
          'rag-evaluation-workshop'
        ]
      },
      {
        slug: 'embeddings-and-similarity-lab',
        title: 'Embeddings and similarity lab',
        summary:
          'Build bag-of-words and hashing embeddings, compute cosine similarity, and implement top-k retrieval with NumPy and scikit-learn.',
        duration: '55-70 min',
        whyItMatters:
          'Retrieval systems stand on embedding geometry. If you can build simple vectorizers and rank documents by cosine similarity, you can reason about semantic search, RAG chunk stores, and nearest-neighbor evaluation without treating embeddings as magic.',
        sections: [
          {
            heading: 'Embeddings place text in a vector space',
            body:
              'An embedding maps a document or query to a vector so that related texts are near each other under a chosen metric. Classic bag-of-words (BoW) counts how often each vocabulary term appears. If the vocabulary is [attention, mask, token, loss], the sentence \'attention mask\' becomes [1, 1, 0, 0]. TF-IDF reweights counts so common words contribute less. Hashing embeddings skip a fitted vocabulary by hashing terms into a fixed number of buckets; collisions happen, but the vector size stays bounded. Dense neural embeddings are popular in production LLMs, yet the geometry lessons are the same: choose a representation, define similarity, retrieve neighbors, and measure whether the right documents rank highly. Start with BoW so every dimension is inspectable.',
            bullets: [
              'Sparse BoW vectors are interpretable because dimensions are terms.',
              'Hashing trades interpretability for a fixed-width feature space.',
              'Dense embeddings compress meaning but need learned encoders.'
            ],
            codeExample: {
              title: 'Bag-of-words vectors with CountVectorizer',
              language: 'python',
              code: code([
                'from sklearn.feature_extraction.text import CountVectorizer',
                'import numpy as np',
                '',
                'docs = [',
                '    \'attention is a weighted sum of values\',',
                '    \'causal masks block future tokens\',',
                '    \'tokenization splits text into subwords\',',
                ']',
                'vec = CountVectorizer()',
                'X = vec.fit_transform(docs).toarray()',
                'print(vec.get_feature_names_out())',
                'print(X)'
              ])
            }
          },
          {
            heading: 'Cosine similarity focuses on direction',
            body:
              'Euclidean distance is sensitive to vector length. A long document with many repeated terms can have a huge BoW norm and look far from a short related query even if they share the same direction. Cosine similarity is cos(theta) = (a · b) / (||a|| ||b||), which ignores magnitude. Values range from -1 to 1 for real vectors; for non-negative BoW counts they fall in [0, 1]. Example: a=[1,1,0], b=[2,2,0], c=[0,0,1]. cos(a,b)=1 even though b is longer; cos(a,c)=0. In retrieval, score every document by cosine against the query vector and take the top k. Always L2-normalize rows if you want cosine to become a simple dot product, which is a common ANN optimization.',
            bullets: [
              'Cosine similarity removes pure length effects.',
              'For non-negative BoW features, cosine is between 0 and 1.',
              'Normalized vectors let you rank by dot product alone.'
            ],
            codeExample: {
              title: 'Cosine similarity matrix for tiny docs',
              language: 'python',
              code: code([
                'import numpy as np',
                'from sklearn.feature_extraction.text import TfidfVectorizer',
                'from sklearn.metrics.pairwise import cosine_similarity',
                '',
                'docs = [',
                '    \'scaled dot product attention\',',
                '    \'attention masks and softmax\',',
                '    \'gradient descent for linear regression\',',
                ']',
                'X = TfidfVectorizer().fit_transform(docs)',
                'S = cosine_similarity(X)',
                'print(np.round(S, 3))'
              ])
            }
          },
          {
            heading: 'Hashing embeddings keep width fixed',
            body:
              'HashingVectorizer maps terms through a hash function into n_features buckets. You do not store a vocabulary dictionary, which helps streaming and memory. The cost is collisions: \'attention\' and \'regression\' might land in the same bucket and become indistinguishable on that axis. With enough features, collisions are rare for small corpora. In interviews, mention hashing when asked how to vectorize high-cardinality text features without maintaining a giant vocab. Practically, compare top-k retrieval quality for CountVectorizer vs HashingVectorizer on the same queries. If hashing collapses important terms, increase n_features or move to learned embeddings. Also note that hashing is one-way: you cannot easily inspect which term produced a coordinate.',
            bullets: [
              'Hashing enables fixed-size text features without a fitted vocab.',
              'Collisions are the primary quality risk.',
              'Increase n_features when retrieval quality drops from collisions.'
            ],
            codeExample: {
              title: 'Hashing vectorizer retrieval sketch',
              language: 'python',
              code: code([
                'from sklearn.feature_extraction.text import HashingVectorizer',
                'from sklearn.metrics.pairwise import cosine_similarity',
                'import numpy as np',
                '',
                'docs = [',
                '    \'kv cache speeds up autoregressive decoding\',',
                '    \'cosine similarity ranks related documents\',',
                '    \'dropout randomly zeros activations in training\',',
                ']',
                'vec = HashingVectorizer(n_features=32, alternate_sign=False, norm=\'l2\')',
                'X = vec.transform(docs)',
                'q = vec.transform([\'how does kv caching help decoding\'])',
                'scores = cosine_similarity(q, X).ravel()',
                'print(list(np.round(scores, 3)))',
                'print(\'top doc index:\', int(scores.argmax()))'
              ])
            }
          },
          {
            heading: 'Top-k retrieval is ranking, not generation',
            body:
              'Given query q and document matrix X with rows as documents, compute scores = cosine(q, X), then choose the indices of the k largest scores. That is dense or sparse retrieval depending on the embedding type. Example: scores [0.12, 0.81, 0.44], k=2 -> indices [1, 2]. In RAG, those documents become context for a generator. Keep retrieval evaluation separate from generation quality: a perfect writer cannot fix missing evidence if the retriever never surfaces it. Implement argsort carefully: np.argsort(scores)[::-1][:k]. Ties can be broken by doc id for determinism. Also filter trivial matches like exact query duplicates when measuring generalization.',
            bullets: [
              'Retrieval returns ranked evidence; generation consumes it later.',
              'Use stable top-k selection for reproducible experiments.',
              'Evaluate retrievers before blaming the generator in RAG systems.'
            ],
            codeExample: {
              title: 'Implement top-k indices',
              language: 'python',
              code: code([
                'import numpy as np',
                '',
                'scores = np.array([0.12, 0.81, 0.44, 0.80])',
                'k = 2',
                'top = np.argsort(scores)[::-1][:k]',
                'print(\'top indices:\', top)',
                'print(\'top scores:\', scores[top])'
              ])
            }
          },
          {
            heading: 'Build a mini search index end to end',
            body:
              'A workshop-scale pipeline: fit a TF-IDF vectorizer on a corpus, transform documents once, store the sparse or dense matrix, transform each query with the same vectorizer, compute cosine similarities, return top-k texts. This is enough to demo semantic-ish search for shared terminology. Limitations are obvious: synonyms (\'mask\' vs \'blocking future tokens\') may not match without denser embeddings; word order is weak in bag-of-words; long documents dominate unless you chunk. Still, interviewers often ask for a baseline before neural retrieval. Being able to code this baseline in a few minutes with sklearn shows practical competence. Add a simple invert index mental model too: term -> posting list, even if you use vectorized cosine for the exercise.',
            bullets: [
              'Fit vectorizers on the corpus, then transform queries with the same fitted object.',
              'Chunk long documents before embedding for fairer retrieval.',
              'Keep a lexical baseline even when testing dense retrievers.'
            ],
            codeExample: {
              title: 'End-to-end TF-IDF top-k search',
              language: 'python',
              code: code([
                'from sklearn.feature_extraction.text import TfidfVectorizer',
                'from sklearn.metrics.pairwise import cosine_similarity',
                'import numpy as np',
                '',
                'corpus = [',
                '    \'Positional encodings add order information to transformers.\',',
                '    \'Dropout reduces overfitting by randomly zeroing units.\',',
                '    \'Causal masks prevent attending to future tokens.\',',
                '    \'Batch normalization stabilizes deep network training.\',',
                ']',
                'vectorizer = TfidfVectorizer()',
                'doc_m = vectorizer.fit_transform(corpus)',
                'query = \'How do causal masks protect autoregressive decoding?\'',
                'scores = cosine_similarity(vectorizer.transform([query]), doc_m).ravel()',
                'for idx in np.argsort(scores)[::-1][:2]:',
                '    print(round(float(scores[idx]), 3), corpus[idx])'
              ])
            }
          },
          {
            heading: 'What to say about neural embeddings without using them here',
            body:
              'In production RAG you may call an embedding API or local encoder that returns 384- to 3072-dimensional dense vectors. The retrieval math remains cosine or dot product over an index such as FAISS or a vector database. The failure modes also rhyme with this lab: domain shift, poor chunking, and metric mismatch. Mentally replace CountVectorizer rows with dense rows and the rest of your top-k code stays. Interview strength comes from knowing when sparse lexical retrieval beats dense retrieval (exact identifiers, error codes) and when dense wins (paraphrases). Hybrid retrieval often combines both scores. This lesson stays on sklearn/NumPy so it runs in Pyodide, while still preparing you to discuss denser systems.',
            bullets: [
              'Dense retrieval changes the encoder, not the ranking skeleton.',
              'Hybrid lexical-plus-dense ranking is a common production pattern.',
              'Chunking and metric choice often matter more than tiny model upgrades.'
            ]
          }
        ],
        checklist: [
          'Can build BoW/TF-IDF vectors with scikit-learn.',
          'Can compute cosine similarity and explain why it ignores magnitude.',
          'Can use hashing vectorizers and describe collision tradeoffs.',
          'Can implement top-k document retrieval for a query.',
          'Can outline how dense embeddings plug into the same ranking pattern.'
        ],
        pitfalls: [
          'Fitting a vectorizer on queries and documents inconsistently.',
          'Using Euclidean distance on raw counts without considering length bias.',
          'Choosing too few hashing features and suffering collisions.',
          'Evaluating RAG generators while ignoring retriever recall.',
          'Embedding entire long documents without chunking.'
        ],
        interviewPrompts: [
          'How does cosine similarity differ from Euclidean distance for text vectors?',
          'When would you prefer hashing vectorizers over a fitted vocabulary?',
          'How would you implement top-k retrieval for TF-IDF documents?',
          'Why might dense embeddings beat BoW for paraphrases?',
          'Where do lexical features still win in production search?'
        ],
        exercises: [
          {
            id: 'tfidf-topk',
            title: 'TF-IDF top-k retrieval',
            difficulty: 'beginner',
            type: 'coding',
            description:
              'Fit a TfidfVectorizer on a small corpus and print the top-2 documents for a query with scores.',
            starterCode: code([
              'from sklearn.feature_extraction.text import TfidfVectorizer',
              'from sklearn.metrics.pairwise import cosine_similarity',
              'import numpy as np',
              '',
              'corpus = [',
              '    \'attention weights come from softmax over scores\',',
              '    \'support vector machines maximize the margin\',',
              '    \'causal masking blocks future positions\',',
              '    \'k-means clusters points around centroids\',',
              ']',
              'query = \'How does causal masking work in transformers?\'',
              '',
              '# TODO: vectorize corpus and query, compute cosine scores, print top 2 docs.',
              'print(\'TODO: retrieve top documents\')'
            ]),
            solution: code([
              'from sklearn.feature_extraction.text import TfidfVectorizer',
              'from sklearn.metrics.pairwise import cosine_similarity',
              'import numpy as np',
              '',
              'corpus = [',
              '    \'attention weights come from softmax over scores\',',
              '    \'support vector machines maximize the margin\',',
              '    \'causal masking blocks future positions\',',
              '    \'k-means clusters points around centroids\',',
              ']',
              'query = \'How does causal masking work in transformers?\'',
              'vectorizer = TfidfVectorizer()',
              'doc_m = vectorizer.fit_transform(corpus)',
              'scores = cosine_similarity(vectorizer.transform([query]), doc_m).ravel()',
              'for idx in np.argsort(scores)[::-1][:2]:',
              '    print(round(float(scores[idx]), 3), corpus[idx])'
            ]),
            hints: [
              'Fit the vectorizer on the corpus only.',
              'Transform the query with the same vectorizer.',
              'Use np.argsort(scores)[::-1][:2] for top indices.'
            ],
            expectedOutput:
              'Two printed lines with cosine scores and document texts, led by the causal masking doc.'
          },
          {
            id: 'hashing-vs-count',
            title: 'Compare hashing and count retrieval ranks',
            difficulty: 'intermediate',
            type: 'coding',
            description:
              'Rank documents for the same query with CountVectorizer and HashingVectorizer; print both orderings.',
            starterCode: code([
              'from sklearn.feature_extraction.text import CountVectorizer, HashingVectorizer',
              'from sklearn.metrics.pairwise import cosine_similarity',
              'import numpy as np',
              '',
              'corpus = [',
              '    \'kv cache stores keys and values for decoding\',',
              '    \'random forests average many decision trees\',',
              '    \'query key value projections build attention heads\',',
              ']',
              'query = [\'how are keys and values cached\']',
              '',
              '# TODO: produce ranked index lists for count and hashing embeddings.',
              'print(\'TODO: compare rank orders\')'
            ]),
            solution: code([
              'from sklearn.feature_extraction.text import CountVectorizer, HashingVectorizer',
              'from sklearn.metrics.pairwise import cosine_similarity',
              'import numpy as np',
              '',
              'corpus = [',
              '    \'kv cache stores keys and values for decoding\',',
              '    \'random forests average many decision trees\',',
              '    \'query key value projections build attention heads\',',
              ']',
              'query = [\'how are keys and values cached\']',
              '',
              'count = CountVectorizer()',
              'Xc = count.fit_transform(corpus)',
              'sc = cosine_similarity(count.transform(query), Xc).ravel()',
              'print(\'count rank:\', np.argsort(sc)[::-1].tolist(), np.round(sc, 3))',
              '',
              'hash_vec = HashingVectorizer(n_features=64, alternate_sign=False, norm=\'l2\')',
              'Xh = hash_vec.transform(corpus)',
              'sh = cosine_similarity(hash_vec.transform(query), Xh).ravel()',
              'print(\'hash rank:\', np.argsort(sh)[::-1].tolist(), np.round(sh, 3))'
            ]),
            hints: [
              'Fit CountVectorizer; HashingVectorizer does not need fit for basic use.',
              'Compute cosine similarity for both representations.',
              'Print argsort descending for each score vector.'
            ],
            expectedOutput:
              'Printed count and hash rank index lists with rounded score arrays.'
          },
          {
            id: 'embedding-space-design',
            title: 'Design an embedding strategy for support search',
            difficulty: 'intermediate',
            type: 'design',
            description:
              'Choose sparse, dense, or hybrid embeddings for a customer-support knowledge base.',
            promptQuestions: [
              'Which queries need exact lexical match (IDs, error codes)?',
              'Where would paraphrastic dense retrieval help most?',
              'How would you A/B evaluate top-k quality before generation?',
              'What chunking policy would you use for long policy documents?'
            ]
          }
        ],
        diagram: null,
        related: [
          'tokenization-workshop',
          'rag-evaluation-workshop'
        ]
      },
      {
        slug: 'rag-evaluation-workshop',
        title: 'RAG evaluation workshop',
        summary:
          'Chunk documents, measure retrieval with recall@k and MRR, and run simple grounded-answer checks using string overlap—all in NumPy/sklearn-friendly Python.',
        duration: '60-75 min',
        whyItMatters:
          'RAG systems fail in distinct stages: chunking, retrieval, and grounded generation. Interviewers want candidates who can measure each stage instead of only demoing a happy-path answer.',
        sections: [
          {
            heading: 'RAG is a pipeline with separable failure modes',
            body:
              'Retrieval-augmented generation first finds evidence, then asks a model to answer using that evidence. If retrieval misses the needed chunk, the generator may hallucinate confidently. If retrieval is fine but the prompt is weak, the model may ignore evidence. If both are fine but evaluation only checks fluent answers, you can ship grounded-looking falsehoods. A practical evaluation stack measures: (1) chunk coverage and sizes, (2) retrieval recall@k / MRR against labeled relevant docs, (3) answer groundedness via overlap or entailment-style checks, and (4) final task metrics such as exact match or rubric scores. This lesson implements (1)-(3) with simple tools that run in-browser. Keep the stages separate in dashboards and in interview answers.',
            bullets: [
              'Evaluate retrieval before judging generator quality.',
              'Chunking choices change both recall and noise in context windows.',
              'Groundedness checks whether answers stick to retrieved evidence.'
            ],
            codeExample: {
              title: 'Tiny RAG stages as data structures',
              language: 'python',
              code: code([
                'query = \'What does a causal mask do?\'',
                'chunks = [',
                '    \'Causal masks block future tokens during decoding.\',',
                '    \'Dropout randomly zeroes activations during training.\',',
                ']',
                'retrieved = [chunks[0]]',
                'answer = \'A causal mask prevents attending to future tokens.\'',
                'print({\'query\': query, \'retrieved\': retrieved, \'answer\': answer})'
              ])
            }
          },
          {
            heading: 'Chunking trades context completeness against precision',
            body:
              'Long documents rarely fit into prompts and dilute embeddings. Chunking splits them into passages. Fixed-size character or token windows with overlap are common baselines. Example: text length 1000, chunk 300, overlap 50 -> starts at 0, 250, 500, 750. Too-small chunks lose surrounding definitions; too-large chunks add irrelevant sentences and hurt cosine ranking. Overlap reduces boundary tears where an answer spans two windows. In interviews, mention structure-aware chunking (by headings, paragraphs, functions) as an improvement over naive windows. For evaluation, store chunk_id and parent_doc_id so you can compute document-level or chunk-level recall. Always log chunk length histograms; extreme lengths are a smell.',
            bullets: [
              'Overlap helps when answers cross chunk boundaries.',
              'Track parent document ids for aggregation metrics.',
              'Prefer structure-aware splits when documents have clear sections.'
            ],
            codeExample: {
              title: 'Fixed-window chunking with overlap',
              language: 'python',
              code: code([
                'def chunk_text(text, size=40, overlap=10):',
                '    chunks, start = [], 0',
                '    while start < len(text):',
                '        end = min(len(text), start + size)',
                '        chunks.append(text[start:end])',
                '        if end == len(text):',
                '            break',
                '        start += size - overlap',
                '    return chunks',
                '',
                'text = \'Causal masks block future tokens. Softmax turns scores into weights. Values are mixed by those weights.\'',
                'for i, ch in enumerate(chunk_text(text, size=45, overlap=12)):',
                '    print(i, repr(ch))'
              ])
            }
          },
          {
            heading: 'Recall@k asks whether evidence made the shortlist',
            body:
              'For one query, let R be the set of relevant chunk ids and let Pred_k be the top-k retrieved ids. Recall@k = |R intersect Pred_k| / |R|. If two chunks are relevant and top-3 retrieval finds one, recall@3 is 0.5. Macro-average over queries for a dataset score. Recall ignores order except through k. It answers: did we fetch enough evidence for the generator to have a chance? If recall@5 is 0.4, improving the prompt alone is unlikely to fix correctness. Use labeled pairs (query -> relevant chunk ids) from synthetic or hand-built sets in workshops; production systems may derive labels from clicks or adjudicated eval sets. Report confidence intervals when n_queries is small.',
            bullets: [
              'Recall@k is set overlap, not generation quality.',
              'Choose k based on how many chunks you actually put in the prompt.',
              'Low recall means the retriever is the bottleneck.'
            ],
            codeExample: {
              title: 'Compute recall@k for one query',
              language: 'python',
              code: code([
                'def recall_at_k(relevant, retrieved, k):',
                '    pred = set(retrieved[:k])',
                '    rel = set(relevant)',
                '    if not rel:',
                '        return 0.0',
                '    return len(rel & pred) / len(rel)',
                '',
                'print(recall_at_k([1, 4], [4, 2, 1, 7], k=3))',
                'print(recall_at_k([1, 4], [3, 2, 7, 1], k=3))'
              ])
            }
          },
          {
            heading: 'MRR rewards early relevant hits',
            body:
              'Mean Reciprocal Rank focuses on the rank of the first relevant document. For a query, find the smallest rank i (1-based) where the retrieved item is relevant, then contribute 1/i; if none, contribute 0. Average over queries. Example: relevant doc appears at ranks 1, 2, and 5 across three queries -> RR values 1, 0.5, 0.2 -> MRR=0.567. Compared with recall@k, MRR cares about putting something useful near the top, which matters when the prompt can afford only one or two chunks. In interviews, be ready to compare MRR, recall@k, nDCG, and precision@k and pick metrics that match product constraints. Implement MRR with a simple loop before jumping to libraries.',
            bullets: [
              'Reciprocal rank uses 1/rank of the first relevant hit.',
              'MRR is sensitive to top-of-list quality.',
              'Use MRR when only a tiny context budget is available.'
            ],
            codeExample: {
              title: 'Mean reciprocal rank over queries',
              language: 'python',
              code: code([
                'def reciprocal_rank(relevant, retrieved):',
                '    rel = set(relevant)',
                '    for i, doc_id in enumerate(retrieved, start=1):',
                '        if doc_id in rel:',
                '            return 1.0 / i',
                '    return 0.0',
                '',
                'rrs = [',
                '    reciprocal_rank([4], [4, 2, 1]),',
                '    reciprocal_rank([1, 4], [3, 1, 4]),',
                '    reciprocal_rank([7], [1, 2, 3]),',
                ']',
                'print(rrs, \'MRR=\', round(sum(rrs) / len(rrs), 3))'
              ])
            }
          },
          {
            heading: 'Grounded-answer checks with string overlap',
            body:
              'A lightweight groundedness heuristic asks whether answer content appears in retrieved evidence. Token-overlap precision: tokenize answer and evidence into words, then compute |ans_tokens intersect evidence_tokens| / |ans_tokens|. If the answer is \'Causal masks block future tokens\' and evidence contains those words, overlap is high. This is imperfect: paraphrases score low, and copying irrelevant shared stopwords can score medium. Still, it is a useful regression test for workshops and CI smoke tests. Stronger systems use NLI models or LLM-as-judge, but those are heavier and not Pyodide-friendly here. Pair overlap with retrieval metrics: high overlap and low recall can mean the model is parroting incomplete evidence. Low overlap and high recall can mean the generator ignored context.',
            bullets: [
              'Overlap checks are brittle but cheap smoke tests for grounding.',
              'Remove stopwords if you want a stricter content overlap score.',
              'Combine groundedness with retrieval recall for diagnosis.'
            ],
            codeExample: {
              title: 'Answer-evidence token overlap',
              language: 'python',
              code: code([
                'def overlap_precision(answer, evidence):',
                '    a = set(answer.lower().split())',
                '    e = set(evidence.lower().split())',
                '    if not a:',
                '        return 0.0',
                '    return len(a & e) / len(a)',
                '',
                'evidence = \'Causal masks block future tokens during decoding.\'',
                'good = \'Causal masks block future tokens\'',
                'bad = \'Dropout improves causal attention accuracy\'',
                'print(\'good\', round(overlap_precision(good, evidence), 3))',
                'print(\'bad\', round(overlap_precision(bad, evidence), 3))'
              ])
            }
          },
          {
            heading: 'Put metrics together into an evaluation harness',
            body:
              'A complete workshop harness builds chunks, runs a TF-IDF retriever, computes recall@k and MRR on labeled queries, generates or stubs answers, and reports overlap groundedness. Example synthetic label: query about causal masks maps to chunk_id 0. If retriever returns [0, 2, 1], recall@3=1 and RR=1. If the stub answer copies the chunk, overlap is high. In interviews, describe gates: do not tune prompts when recall@k is below a threshold; do not expand context k forever because noise and cost rise; track metric slices by question type. Production adds citation requirements, human review, and adversarial questions. Showing that you can implement the skeleton without frameworks signals ownership of quality, not just model choice.',
            bullets: [
              'Gate prompt work on minimum retrieval recall.',
              'Slice metrics by query type and document domain.',
              'Keep an automated harness even when human eval is the gold standard.'
            ],
            codeExample: {
              title: 'Mini harness numbers for one labeled query',
              language: 'python',
              code: code([
                'from sklearn.feature_extraction.text import TfidfVectorizer',
                'from sklearn.metrics.pairwise import cosine_similarity',
                'import numpy as np',
                '',
                'chunks = [',
                '    \'Causal masks block future tokens during decoding.\',',
                '    \'Random forests average many decision trees.\',',
                '    \'Batch norm stabilizes layer activations.\',',
                ']',
                'query = \'Why use a causal mask?\'',
                'relevant = [0]',
                'vec = TfidfVectorizer().fit(chunks)',
                'scores = cosine_similarity(vec.transform([query]), vec.transform(chunks)).ravel()',
                'ranking = np.argsort(scores)[::-1].tolist()',
                'pred = ranking[:2]',
                'recall = len(set(relevant) & set(pred)) / len(relevant)',
                'rr = 1.0 / (ranking.index(relevant[0]) + 1)',
                'print(\'ranking\', ranking, \'recall@2\', recall, \'RR\', rr)'
              ])
            }
          }
        ],
        checklist: [
          'Can chunk text with fixed windows and overlap.',
          'Can compute recall@k from relevant and retrieved ids.',
          'Can compute MRR / reciprocal rank.',
          'Can run a simple answer-evidence overlap groundedness check.',
          'Can explain how to diagnose RAG failures by stage.'
        ],
        pitfalls: [
          'Judging RAG only by final answer fluency.',
          'Using chunking without overlap when answers span boundaries.',
          'Tuning prompts while recall@k is still poor.',
          'Treating token overlap as perfect factuality.',
          'Forgetting to label relevant chunks for retrieval offline eval.'
        ],
        interviewPrompts: [
          'How would you evaluate a RAG system beyond reading a few answers?',
          'What does recall@k tell you that an answer BLEU score does not?',
          'When is MRR more informative than recall@k?',
          'How can chunking choices hurt retrieval?',
          'What lightweight groundedness checks would you put in CI?'
        ],
        exercises: [
          {
            id: 'chunk-and-recall',
            title: 'Chunk docs and compute recall@k',
            difficulty: 'beginner',
            type: 'coding',
            description:
              'Chunk a document, assign ids, and compute recall@k for a retrieved list against labeled relevant ids.',
            starterCode: code([
              'def chunk_text(text, size=50, overlap=10):',
              '    chunks, start = [], 0',
              '    while start < len(text):',
              '        end = min(len(text), start + size)',
              '        chunks.append(text[start:end])',
              '        if end == len(text):',
              '            break',
              '        start += size - overlap',
              '    return chunks',
              '',
              'text = (',
              '    \'Causal masks block future tokens. \'',
              '    \'Softmax converts attention scores into weights. \'',
              '    \'Values are combined using those weights.\'',
              ')',
              'chunks = chunk_text(text, size=55, overlap=15)',
              'print(\'n_chunks\', len(chunks))',
              'relevant = [0]',
              'retrieved = [1, 0, 2]',
              '',
              '# TODO: implement recall_at_k and print recall@2.',
              'print(\'TODO: compute recall@2\')'
            ]),
            solution: code([
              'def chunk_text(text, size=50, overlap=10):',
              '    chunks, start = [], 0',
              '    while start < len(text):',
              '        end = min(len(text), start + size)',
              '        chunks.append(text[start:end])',
              '        if end == len(text):',
              '            break',
              '        start += size - overlap',
              '    return chunks',
              '',
              'def recall_at_k(relevant, retrieved, k):',
              '    rel = set(relevant)',
              '    pred = set(retrieved[:k])',
              '    return len(rel & pred) / len(rel) if rel else 0.0',
              '',
              'text = (',
              '    \'Causal masks block future tokens. \'',
              '    \'Softmax converts attention scores into weights. \'',
              '    \'Values are combined using those weights.\'',
              ')',
              'chunks = chunk_text(text, size=55, overlap=15)',
              'print(\'n_chunks\', len(chunks))',
              'relevant = [0]',
              'retrieved = [1, 0, 2]',
              'print(\'recall@2\', recall_at_k(relevant, retrieved, 2))'
            ]),
            hints: [
              'recall@k uses the first k retrieved ids only.',
              'Divide intersection size by number of relevant ids.',
              'Print both chunk count and recall.'
            ],
            expectedOutput:
              'Printed n_chunks and recall@2 of 1.0 for the provided lists.'
          },
          {
            id: 'mrr-and-overlap',
            title: 'MRR plus grounded overlap',
            difficulty: 'intermediate',
            type: 'coding',
            description:
              'Compute MRR for multiple queries and an overlap precision between an answer and joined evidence.',
            starterCode: code([
              'def reciprocal_rank(relevant, retrieved):',
              '    rel = set(relevant)',
              '    for i, doc_id in enumerate(retrieved, start=1):',
              '        if doc_id in rel:',
              '            return 1.0 / i',
              '    return 0.0',
              '',
              'def overlap_precision(answer, evidence):',
              '    # TODO',
              '    return None',
              '',
              'queries = [',
              '    {\'relevant\': [2], \'retrieved\': [2, 1, 0]},',
              '    {\'relevant\': [0, 1], \'retrieved\': [3, 1, 0]},',
              ']',
              '# TODO: print MRR and overlap for a sample answer/evidence pair.',
              'print(\'TODO: MRR and overlap\')'
            ]),
            solution: code([
              'def reciprocal_rank(relevant, retrieved):',
              '    rel = set(relevant)',
              '    for i, doc_id in enumerate(retrieved, start=1):',
              '        if doc_id in rel:',
              '            return 1.0 / i',
              '    return 0.0',
              '',
              'def overlap_precision(answer, evidence):',
              '    a = set(answer.lower().split())',
              '    e = set(evidence.lower().split())',
              '    return len(a & e) / len(a) if a else 0.0',
              '',
              'queries = [',
              '    {\'relevant\': [2], \'retrieved\': [2, 1, 0]},',
              '    {\'relevant\': [0, 1], \'retrieved\': [3, 1, 0]},',
              ']',
              'mrr = sum(reciprocal_rank(q[\'relevant\'], q[\'retrieved\']) for q in queries) / len(queries)',
              'answer = \'Causal masks block future tokens\'',
              'evidence = \'Causal masks block future tokens during decoding.\'',
              'print(\'MRR\', round(mrr, 3))',
              'print(\'overlap\', round(overlap_precision(answer, evidence), 3))'
            ]),
            hints: [
              'MRR averages reciprocal ranks across queries.',
              'Overlap precision divides shared tokens by answer tokens.',
              'Lowercase and split on whitespace for the toy check.'
            ],
            expectedOutput:
              'Printed MRR around 0.75 and a high overlap score for the sample answer.'
          },
          {
            id: 'rag-quality-gates',
            title: 'Design RAG quality gates',
            difficulty: 'advanced',
            type: 'design',
            description:
              'Define launch gates for a RAG FAQ assistant with limited context budget.',
            promptQuestions: [
              'What minimum recall@k would you require before prompt tuning?',
              'How would you combine MRR, groundedness, and human ratings?',
              'Which failure slices (multi-hop, rare entities, outdated docs) need separate metrics?',
              'How would you detect retrieval regressions after a corpus update?'
            ]
          }
        ],
        diagram: null,
        related: [
          'embeddings-and-similarity-lab',
          'tokenization-workshop'
        ]
      }
    ]
  },
  {
    slug: 'ml-production-lab',
    title: 'ML production systems lab',
    summary:
      'Ship tabular ML safely with leakage-resistant pipelines, drift monitoring, and explicit serving contracts for batch and online inference.',
    objectives: [
      'Build ColumnTransformer pipelines and demonstrate CV leakage hazards',
      'Implement PSI/KS-style drift checks and calibration monitoring',
      'Define feature schema validation and measure toy latency/throughput contracts'
    ],
    lessons: [
      {
        slug: 'leakage-safe-pipelines',
        title: 'Leakage-safe pipelines',
        summary:
          'Build ColumnTransformer pipelines and demonstrate cross-validation leakage mistakes versus honest sklearn Pipeline evaluation.',
        duration: '55-70 min',
        whyItMatters:
          'Preprocessing leakage creates optimistic offline metrics that collapse in production. Interviewers expect you to put imputation, scaling, and encoding inside fold-safe pipelines and to prove why order matters.',
        sections: [
          {
            heading: 'Leakage is information flowing from the future into training',
            body:
              'In tabular ML, leakage often hides inside preprocessing. If you compute a median on all rows, then split train/test, the test distribution already influenced training features. If you encode categories with target statistics computed from the full dataset, labels leak. Even standard scaling is leaky when fit on all data before CV. The model may look 2-5 points better offline than it deserves. Production then underperforms and trust erodes. The cure is procedural: any transformation that learns parameters from data must see only training rows for that fit. sklearn Pipeline and ColumnTransformer make the correct pattern the default if you use them with cross_val_score. Interview answers should give both the principle and a concrete numeric story.',
            bullets: [
              'Learned preprocessing parameters are model parameters.',
              'Fit them inside training folds, not on the full dataset.',
              'Pipelines encode the safe order of operations.'
            ],
            codeExample: {
              title: 'Unsafe vs safe scaling mean',
              language: 'python',
              code: code([
                'import numpy as np',
                'from sklearn.model_selection import train_test_split',
                'from sklearn.preprocessing import StandardScaler',
                '',
                'X = np.arange(10, dtype=float).reshape(-1, 1)',
                'y = (X.ravel() > 4).astype(int)',
                'X_train, X_test, _, _ = train_test_split(X, y, test_size=0.3, random_state=0)',
                'leaky_mean = X.mean()',
                'safe_mean = X_train.mean()',
                'print(\'full mean (leaky if used before split):\', leaky_mean)',
                'print(\'train mean (safe):\', safe_mean)',
                'print(\'test mean:\', X_test.mean())'
              ])
            }
          },
          {
            heading: 'ColumnTransformer keeps feature types explicit',
            body:
              'Real tables mix numeric and categorical columns. ColumnTransformer applies different transformers to column subsets and concatenates the results. Example: columns [age, spend, city, plan] use median imputation + scaling on [0,1] and most_frequent imputation + one-hot on [2,3]. This prevents the classic bug of scaling city strings or one-hotting continuous ages by accident. In interviews, draw the diagram: raw columns -> typed pipelines -> combined feature matrix -> estimator. Use handle_unknown=\'ignore\' for one-hot so unseen categories at serve time do not crash. Keep column indices or names stable between training and serving contracts.',
            bullets: [
              'Separate numeric and categorical branches explicitly.',
              'handle_unknown=\'ignore\' makes one-hot serving robust.',
              'Column order/names are part of the serving contract.'
            ],
            codeExample: {
              title: 'Mixed-type ColumnTransformer',
              language: 'python',
              code: code([
                'import numpy as np',
                'from sklearn.compose import ColumnTransformer',
                'from sklearn.impute import SimpleImputer',
                'from sklearn.pipeline import Pipeline',
                'from sklearn.preprocessing import OneHotEncoder, StandardScaler',
                '',
                'X = np.array([',
                '    [22, 35, \'NYC\', \'free\'],',
                '    [41, np.nan, \'SF\', \'pro\'],',
                '    [np.nan, 76, \'NYC\', \'pro\'],',
                '    [55, 95, \'LA\', \'team\'],',
                '], dtype=object)',
                'numeric = Pipeline([(\'impute\', SimpleImputer(strategy=\'median\')), (\'scale\', StandardScaler())])',
                'categorical = Pipeline([',
                '    (\'impute\', SimpleImputer(strategy=\'most_frequent\')),',
                '    (\'onehot\', OneHotEncoder(handle_unknown=\'ignore\', sparse_output=False)),',
                '])',
                'pre = ColumnTransformer([(\'num\', numeric, [0, 1]), (\'cat\', categorical, [2, 3])])',
                'print(pre.fit_transform(X).round(3))'
              ])
            }
          },
          {
            heading: 'Cross-validation must refit preprocessing each fold',
            body:
              'In 5-fold CV, each fold holds out a validation slice. A leakage-safe pipeline refits imputer/scaler/encoder on the four training folds only, then transforms the held-out fold. An unsafe workflow fits preprocessing on all rows once, then runs CV only on the classifier. The unsafe path lets validation rows influence means, medians, and category sets. Demo this by creating a dataset where a rare category appears once: if the encoder sees it globally, folds that should treat it as unknown no longer do. Numeric demos can also compare CV accuracy with Pipeline vs manual pre-fit scaling; the leaky path often looks better. Interviewers listen for \'refit transformers inside each fold\' without prompting.',
            bullets: [
              'cross_val_score on a Pipeline refits all steps per fold.',
              'Pre-fitting transformers before CV is a common silent leak.',
              'Rare categories and medians are typical leak channels.'
            ],
            codeExample: {
              title: 'CV with a full Pipeline',
              language: 'python',
              code: code([
                'import numpy as np',
                'from sklearn.compose import ColumnTransformer',
                'from sklearn.linear_model import LogisticRegression',
                'from sklearn.model_selection import StratifiedKFold, cross_val_score',
                'from sklearn.pipeline import Pipeline',
                'from sklearn.preprocessing import OneHotEncoder, StandardScaler',
                'from sklearn.impute import SimpleImputer',
                '',
                'X = np.array([',
                '    [22, 35, \'NYC\', \'free\'], [25, 42, \'LA\', \'free\'],',
                '    [47, 88, \'SF\', \'pro\'], [38, 76, \'NYC\', \'pro\'],',
                '    [52, 110, \'SF\', \'team\'], [46, 90, \'LA\', \'pro\'],',
                '    [56, 120, \'SF\', \'team\'], [55, 95, \'NYC\', \'team\'],',
                '    [60, 130, \'SF\', \'team\'], [28, 48, \'LA\', \'free\'],',
                '    [30, 52, \'NYC\', \'pro\'], [42, 80, \'LA\', \'pro\'],',
                '], dtype=object)',
                'y = np.array([0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1])',
                'pre = ColumnTransformer([',
                '    (\'num\', Pipeline([(\'imp\', SimpleImputer(strategy=\'median\')), (\'sc\', StandardScaler())]), [0, 1]),',
                '    (\'cat\', OneHotEncoder(handle_unknown=\'ignore\'), [2, 3]),',
                '])',
                'clf = Pipeline([(\'pre\', pre), (\'model\', LogisticRegression(max_iter=1000))])',
                'cv = StratifiedKFold(n_splits=3, shuffle=True, random_state=4)',
                'print(cross_val_score(clf, X, y, cv=cv, scoring=\'accuracy\').round(3))'
              ])
            }
          },
          {
            heading: 'Demonstrate a leaky workflow numerically',
            body:
              'Construct a clear demo: generate numeric features, scale using the full dataset, then evaluate a model with CV on the already scaled matrix. Compare to a Pipeline that scales inside folds. On some synthetic sets the difference is small; on others, especially with small n and heavy outliers, leaky CV accuracy rises. Another demo: compute a feature equal to the target mean encoding with global averages, which can nearly perfect train metrics. Even if this lesson focuses on scaling/encoding, mention target leakage and temporal leakage (training on future rows) as sibling bugs. The interviewing move is to propose an experiment that isolates the leak: identical estimator and splits, only preprocessing placement changes.',
            bullets: [
              'Hold estimator and splits fixed when comparing leaky vs safe preprocessing.',
              'Target encoding and temporal splits are related leakage families.',
              'Small data makes preprocessing leakage more dangerous.'
            ],
            codeExample: {
              title: 'Compare leaky pre-scaling vs Pipeline scaling',
              language: 'python',
              code: code([
                'import numpy as np',
                'from sklearn.datasets import make_classification',
                'from sklearn.linear_model import LogisticRegression',
                'from sklearn.model_selection import StratifiedKFold, cross_val_score',
                'from sklearn.pipeline import Pipeline',
                'from sklearn.preprocessing import StandardScaler',
                '',
                'X, y = make_classification(n_samples=240, n_features=8, random_state=3)',
                'X[:, 0] *= 25',
                'cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=3)',
                'leaky_X = StandardScaler().fit_transform(X)',
                'leaky = cross_val_score(LogisticRegression(max_iter=1000), leaky_X, y, cv=cv)',
                'safe = cross_val_score(',
                '    Pipeline([(\'sc\', StandardScaler()), (\'m\', LogisticRegression(max_iter=1000))]),',
                '    X, y, cv=cv,',
                ')',
                'print(\'leaky mean\', round(leaky.mean(), 4), \'safe mean\', round(safe.mean(), 4))'
              ])
            }
          },
          {
            heading: 'Serving must reuse fitted pipeline parameters',
            body:
              'After training, persist the entire Pipeline, not only the classifier coefficients. At serving time, call pipeline.predict(X_live) so imputation values, scaler means, and one-hot categories match training. A frequent production bug reimplements preprocessing in SQL with slightly different null handling. Suddenly medians diverge and calibration drifts. Contracts should include column names/types, allowed categories, and missingness behavior. In interviews, describe CI tests that feed a golden batch through training preprocessing and serving preprocessing and assert equality. Also discuss train/serve skew monitoring: feature distributions and fraction of unknown categories after one-hot ignore.',
            bullets: [
              'Serialize the full preprocessing+model pipeline together.',
              'Avoid reimplementing transforms in a second language without parity tests.',
              'Monitor unknown-category rates after deployment.'
            ]
          },
          {
            heading: 'Checklist language for ML system design interviews',
            body:
              'When asked how you prevent leakage, answer in layers: data splitting policy (random vs time-based), preprocessing inside pipelines, feature engineering from past windows only, target leakage review for columns that partially encode the label, and evaluation hygiene (single final test set). Mention that AutoML and manual notebooks are especially leak-prone because cells get run out of order. Offer a concrete code pattern: ColumnTransformer + Pipeline + StratifiedKFold or TimeSeriesSplit. Close with detection: if offline metrics are much better than online, suspect leakage, train/serve skew, or label delay. This lesson\'s exercises force you to build the safe pattern and measure a leaky alternative.',
            bullets: [
              'Speak in layers: split policy, pipeline discipline, feature timing, eval hygiene.',
              'Notebooks need extra care because execution order is fragile.',
              'Offline/online metric gaps should trigger leakage investigations.'
            ]
          }
        ],
        checklist: [
          'Can explain preprocessing leakage with a concrete example.',
          'Can build a ColumnTransformer for numeric and categorical columns.',
          'Can evaluate models with Pipeline + cross_val_score safely.',
          'Can demonstrate a leaky pre-fit scaling workflow.',
          'Can describe train/serve parity requirements for fitted transforms.'
        ],
        pitfalls: [
          'Fitting scalers or encoders before splitting or outside CV folds.',
          'Saving only model weights and re-coding preprocessing elsewhere.',
          'Using target-derived features computed from the full sample.',
          'Ignoring unknown categories at serving time.',
          'Comparing leaky and safe methods with different splits accidentally.'
        ],
        interviewPrompts: [
          'How can StandardScaler leak information in cross-validation?',
          'How would you preprocess mixed numeric/categorical data safely?',
          'What do you serialize for production inference?',
          'How would you detect train/serve preprocessing skew?',
          'When is TimeSeriesSplit required instead of random CV?'
        ],
        exercises: [
          {
            id: 'build-safe-column-pipeline',
            title: 'Build a leakage-safe ColumnTransformer pipeline',
            difficulty: 'beginner',
            type: 'coding',
            description:
              'Create a Pipeline with numeric/categorical preprocessing and LogisticRegression; print 3-fold CV accuracy.',
            starterCode: code([
              'import numpy as np',
              'from sklearn.compose import ColumnTransformer',
              'from sklearn.impute import SimpleImputer',
              'from sklearn.linear_model import LogisticRegression',
              'from sklearn.model_selection import StratifiedKFold, cross_val_score',
              'from sklearn.pipeline import Pipeline',
              'from sklearn.preprocessing import OneHotEncoder, StandardScaler',
              '',
              'X = np.array([',
              '    [22, 35, \'NYC\', \'free\'], [25, 42, \'LA\', \'free\'],',
              '    [47, 88, \'SF\', \'pro\'], [np.nan, 76, \'NYC\', \'pro\'],',
              '    [52, 110, \'SF\', \'team\'], [46, np.nan, \'LA\', \'pro\'],',
              '    [56, 120, \'SF\', \'team\'], [55, 95, \'NYC\', \'team\'],',
              '    [60, 130, \'SF\', \'team\'], [28, 48, \'LA\', \'free\'],',
              '    [30, 52, \'NYC\', \'pro\'], [42, 80, \'LA\', \'pro\'],',
              '], dtype=object)',
              'y = np.array([0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1])',
              '',
              '# TODO: build preprocess + model pipeline.',
              'pipeline = None',
              'if pipeline is None:',
              '    print(\'TODO: build pipeline\')',
              'else:',
              '    cv = StratifiedKFold(n_splits=3, shuffle=True, random_state=4)',
              '    scores = cross_val_score(pipeline, X, y, cv=cv, scoring=\'accuracy\')',
              '    print(\'CV accuracy:\', scores.round(3), \'mean=\', round(scores.mean(), 3))'
            ]),
            solution: code([
              'import numpy as np',
              'from sklearn.compose import ColumnTransformer',
              'from sklearn.impute import SimpleImputer',
              'from sklearn.linear_model import LogisticRegression',
              'from sklearn.model_selection import StratifiedKFold, cross_val_score',
              'from sklearn.pipeline import Pipeline',
              'from sklearn.preprocessing import OneHotEncoder, StandardScaler',
              '',
              'X = np.array([',
              '    [22, 35, \'NYC\', \'free\'], [25, 42, \'LA\', \'free\'],',
              '    [47, 88, \'SF\', \'pro\'], [np.nan, 76, \'NYC\', \'pro\'],',
              '    [52, 110, \'SF\', \'team\'], [46, np.nan, \'LA\', \'pro\'],',
              '    [56, 120, \'SF\', \'team\'], [55, 95, \'NYC\', \'team\'],',
              '    [60, 130, \'SF\', \'team\'], [28, 48, \'LA\', \'free\'],',
              '    [30, 52, \'NYC\', \'pro\'], [42, 80, \'LA\', \'pro\'],',
              '], dtype=object)',
              'y = np.array([0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1])',
              'numeric = Pipeline([(\'imp\', SimpleImputer(strategy=\'median\')), (\'sc\', StandardScaler())])',
              'categorical = Pipeline([',
              '    (\'imp\', SimpleImputer(strategy=\'most_frequent\')),',
              '    (\'oh\', OneHotEncoder(handle_unknown=\'ignore\')),',
              '])',
              'pre = ColumnTransformer([(\'num\', numeric, [0, 1]), (\'cat\', categorical, [2, 3])])',
              'pipeline = Pipeline([(\'pre\', pre), (\'model\', LogisticRegression(max_iter=1000))])',
              'cv = StratifiedKFold(n_splits=3, shuffle=True, random_state=4)',
              'scores = cross_val_score(pipeline, X, y, cv=cv, scoring=\'accuracy\')',
              'print(\'CV accuracy:\', scores.round(3), \'mean=\', round(scores.mean(), 3))'
            ]),
            hints: [
              'Numeric branch: median impute + StandardScaler.',
              'Categorical branch: most_frequent impute + OneHotEncoder(handle_unknown=\'ignore\').',
              'Wrap preprocess and LogisticRegression in a Pipeline before CV.'
            ],
            expectedOutput:
              'Printed 3-fold CV accuracy array and mean from a safe pipeline.'
          },
          {
            id: 'leakage-demo-cv',
            title: 'Measure leaky vs safe CV scores',
            difficulty: 'intermediate',
            type: 'coding',
            description:
              'Compare CV accuracy when scaling is fit on all data first versus scaling inside a Pipeline.',
            starterCode: code([
              'import numpy as np',
              'from sklearn.datasets import make_classification',
              'from sklearn.linear_model import LogisticRegression',
              'from sklearn.model_selection import StratifiedKFold, cross_val_score',
              'from sklearn.pipeline import Pipeline',
              'from sklearn.preprocessing import StandardScaler',
              '',
              'X, y = make_classification(n_samples=300, n_features=10, random_state=8)',
              'X[:, 0] *= 50',
              'cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=8)',
              '',
              '# TODO: compute leaky_scores and safe_scores arrays.',
              'leaky_scores = None',
              'safe_scores = None',
              'if leaky_scores is None:',
              '    print(\'TODO: compare leaky and safe CV\')',
              'else:',
              '    print(\'leaky\', round(leaky_scores.mean(), 4), \'safe\', round(safe_scores.mean(), 4))'
            ]),
            solution: code([
              'import numpy as np',
              'from sklearn.datasets import make_classification',
              'from sklearn.linear_model import LogisticRegression',
              'from sklearn.model_selection import StratifiedKFold, cross_val_score',
              'from sklearn.pipeline import Pipeline',
              'from sklearn.preprocessing import StandardScaler',
              '',
              'X, y = make_classification(n_samples=300, n_features=10, random_state=8)',
              'X[:, 0] *= 50',
              'cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=8)',
              'leaky_X = StandardScaler().fit_transform(X)',
              'leaky_scores = cross_val_score(LogisticRegression(max_iter=1000), leaky_X, y, cv=cv)',
              'safe_scores = cross_val_score(',
              '    Pipeline([(\'sc\', StandardScaler()), (\'m\', LogisticRegression(max_iter=1000))]),',
              '    X, y, cv=cv,',
              ')',
              'print(\'leaky\', round(leaky_scores.mean(), 4), \'safe\', round(safe_scores.mean(), 4))'
            ]),
            hints: [
              'Leaky path fits StandardScaler on all X before CV.',
              'Safe path puts StandardScaler inside Pipeline.',
              'Keep the classifier and CV object identical.'
            ],
            expectedOutput:
              'Printed mean CV accuracies for leaky and safe workflows.'
          },
          {
            id: 'leakage-review-design',
            title: 'Design a leakage review for a credit model',
            difficulty: 'intermediate',
            type: 'design',
            description:
              'Create a review process for features and CV in a lending classifier.',
            promptQuestions: [
              'Which feature candidates are high risk for target or temporal leakage?',
              'What split strategy matches the deployment time axis?',
              'Which pipeline tests would you require in CI?',
              'How would you investigate an offline/online metric gap after launch?'
            ]
          }
        ],
        diagram: null,
        related: [
          'drift-and-monitoring-lab',
          'serving-contracts-lab'
        ]
      },
      {
        slug: 'drift-and-monitoring-lab',
        title: 'Drift and monitoring lab',
        summary:
          'Implement PSI and KS-style drift checks, plot calibration curves, and practice monitoring workflows with NumPy, sklearn, and matplotlib.',
        duration: '60-75 min',
        whyItMatters:
          'Models decay when data or labeling processes change. Interview-ready engineers can quantify feature drift, watch calibration, and decide when to retrain versus debug pipelines.',
        sections: [
          {
            heading: 'Production models fail quietly without monitoring',
            body:
              'A classifier can keep returning scores while the world shifts. Marketing changes the incoming user mix, a sensor starts clipping values, or fraudsters adapt. Accuracy measured last quarter no longer applies. Monitoring watches input distributions, prediction distributions, calibration, and outcome metrics when labels arrive late. Feature drift asks whether X changed. Concept drift asks whether P(y|X) changed. Prediction drift can be an early proxy when labels are delayed. In interviews, structure your answer as: detect, diagnose, act. Detection uses statistical tests and distance metrics; diagnosis traces pipeline bugs vs real world change; action may be retrain, rollback, or throttle. This lab focuses on measurable detectors you can code.',
            bullets: [
              'Separate data drift from concept drift in explanations.',
              'Use prediction drift when labels are delayed.',
              'Pair alerts with diagnosis playbooks, not only dashboards.'
            ],
            codeExample: {
              title: 'Shift a feature distribution on purpose',
              language: 'python',
              code: code([
                'import numpy as np',
                '',
                'rng = np.random.default_rng(0)',
                'train = rng.normal(0, 1, size=1000)',
                'live = rng.normal(0.8, 1.2, size=1000)',
                'print(\'train mean/std\', round(train.mean(), 3), round(train.std(), 3))',
                'print(\'live mean/std\', round(live.mean(), 3), round(live.std(), 3))'
              ])
            }
          },
          {
            heading: 'PSI summarizes bucketed distribution change',
            body:
              'Population Stability Index compares a baseline histogram to a current histogram. For each bucket i, contribution is (c_i - b_i) * ln(c_i / b_i) where b and c are proportions. Sum over buckets to get PSI. Rules of thumb often used in industry: below 0.1 stable, 0.1-0.25 moderate, above 0.25 large shift—but treat thresholds as policy choices, not laws. Example: baseline proportions [0.5, 0.5], current [0.8, 0.2] yields a sizable PSI. Add epsilon to avoid log(0). Use quantile bins from baseline so rare live values do not invent unstable edges. PSI works for numeric features after binning and for categorical features with shared category sets. Interviewers like candidates who can implement PSI and interpret it cautiously.',
            bullets: [
              'PSI needs comparable buckets/categories between baseline and current.',
              'Add smoothing to proportions before taking logs.',
              'Thresholds should be tuned to false-alert tolerance.'
            ],
            codeExample: {
              title: 'Compute PSI for two histograms',
              language: 'python',
              code: code([
                'import numpy as np',
                '',
                'def psi(base, curr, eps=1e-6):',
                '    base = np.asarray(base, dtype=float)',
                '    curr = np.asarray(curr, dtype=float)',
                '    base = base / base.sum()',
                '    curr = curr / curr.sum()',
                '    base = np.clip(base, eps, None)',
                '    curr = np.clip(curr, eps, None)',
                '    return float(np.sum((curr - base) * np.log(curr / base)))',
                '',
                'print(\'stable\', round(psi([50, 50], [49, 51]), 4))',
                'print(\'shifted\', round(psi([50, 50], [80, 20]), 4))'
              ])
            }
          },
          {
            heading: 'KS-style checks compare cumulative distributions',
            body:
              'The Kolmogorov-Smirnov statistic is the maximum absolute difference between two empirical CDFs. For one-dimensional numeric features, sort values or use histograms to approximate CDFs. If training ages and live ages differ by a large KS distance, the feature drifted. KS does not require arbitrary business buckets, which is an advantage over PSI, but high-volume monitoring often still bins for speed and interpretability. For a workshop, compute KS on samples with NumPy: evaluate the largest vertical gap between CDFs on a shared grid. Pair statistical magnitude with practical impact: a tiny KS on an unused feature may not matter; a moderate KS on the top feature might. Always connect drift alerts to model sensitivity.',
            bullets: [
              'KS measures the largest CDF gap between two samples.',
              'Interpret drift with feature importance and error impact.',
              'Use shared evaluation grids when approximating CDFs.'
            ],
            codeExample: {
              title: 'Approximate KS distance with a value grid',
              language: 'python',
              code: code([
                'import numpy as np',
                '',
                'def ks_distance(a, b, grid=None):',
                '    a = np.sort(np.asarray(a))',
                '    b = np.sort(np.asarray(b))',
                '    if grid is None:',
                '        grid = np.linspace(min(a[0], b[0]), max(a[-1], b[-1]), 200)',
                '    cdf_a = np.searchsorted(a, grid, side=\'right\') / len(a)',
                '    cdf_b = np.searchsorted(b, grid, side=\'right\') / len(b)',
                '    return float(np.max(np.abs(cdf_a - cdf_b)))',
                '',
                'rng = np.random.default_rng(1)',
                'print(round(ks_distance(rng.normal(0, 1, 2000), rng.normal(0, 1, 2000)), 4))',
                'print(round(ks_distance(rng.normal(0, 1, 2000), rng.normal(1.0, 1, 2000)), 4))'
              ])
            }
          },
          {
            heading: 'Calibration asks whether probabilities mean what they say',
            body:
              'A well-calibrated model predicts 0.8 for cases that are positive about 80% of the time. Drift and overfitting both break calibration. Reliability curves bin predictions and plot predicted mean vs empirical positive rate. sklearn.calibration.calibration_curve helps. Example: scores concentrated at 0.9 while true rate is 0.6 indicate overconfidence. Monitoring calibration over time catches silent degradation even when ROC-AUC looks stable. Interventions include isotonic/Platt recalibration on recent labeled data, threshold retuning, or full retrain. In interviews, distinguish ranking quality (AUC) from probability quality (calibration, Brier score). Products that show probabilities or allocate budgets need calibration more than pure ranking ads click models sometimes do.',
            bullets: [
              'AUC can stay high while probabilities become unreliable.',
              'Calibration curves compare predicted vs observed frequencies.',
              'Recalibration needs fresh labels and careful leakage control.'
            ],
            codeExample: {
              title: 'Plot a calibration curve with matplotlib',
              language: 'python',
              code: code([
                'import numpy as np',
                'import matplotlib.pyplot as plt',
                'from sklearn.datasets import make_classification',
                'from sklearn.linear_model import LogisticRegression',
                'from sklearn.model_selection import train_test_split',
                'from sklearn.calibration import calibration_curve',
                '',
                'X, y = make_classification(n_samples=1200, n_features=8, weights=[0.7, 0.3], random_state=2)',
                'X_tr, X_te, y_tr, y_te = train_test_split(X, y, test_size=0.33, random_state=2, stratify=y)',
                'proba = LogisticRegression(max_iter=1000).fit(X_tr, y_tr).predict_proba(X_te)[:, 1]',
                'prob_true, prob_pred = calibration_curve(y_te, proba, n_bins=8, strategy=\'quantile\')',
                'plt.figure()',
                'plt.plot([0, 1], [0, 1], \'--\', label=\'perfect\')',
                'plt.plot(prob_pred, prob_true, marker=\'o\', label=\'model\')',
                'plt.xlabel(\'predicted\'); plt.ylabel(\'empirical\'); plt.legend(); plt.title(\'Calibration\')',
                'plt.show()',
                'print(\'bin centers:\', np.round(prob_pred, 3))',
                'print(\'empirical:\', np.round(prob_true, 3))'
              ])
            }
          },
          {
            heading: 'Build a minimal monitoring report',
            body:
              'A practical weekly report for one model might include: top feature PSI table, KS for key numeric inputs, prediction-score histogram vs baseline, calibration curve on recently labeled traffic, and online business metrics. Automate thresholds and require owners for alerts. Example action tree: if PSI high only for a feature that lost pipeline parity, fix serving; if many features shift after a product launch and labels confirm metric drop, retrain; if scores shift but labels are unchanged, investigate selection bias. Keep baseline windows explicit (training period vs last stable week). For the lab, compute PSI/KS on synthetic train vs live arrays and print a text report. Matplotlib plots help stakeholders see calibration gaps quickly.',
            bullets: [
              'Baselines must be versioned just like models.',
              'Alert ownership matters as much as metric choice.',
              'Diagnosis should distinguish bugs from true world change.'
            ],
            codeExample: {
              title: 'Text drift report for one feature',
              language: 'python',
              code: code([
                'import numpy as np',
                '',
                'def psi_from_samples(base, curr, bins=10, eps=1e-6):',
                '    qs = np.quantile(base, np.linspace(0, 1, bins + 1))',
                '    qs[-1] += 1e-9',
                '    b_counts = np.histogram(base, bins=qs)[0].astype(float)',
                '    c_counts = np.histogram(curr, bins=qs)[0].astype(float)',
                '    b = np.clip(b_counts / b_counts.sum(), eps, None)',
                '    c = np.clip(c_counts / c_counts.sum(), eps, None)',
                '    return float(np.sum((c - b) * np.log(c / b)))',
                '',
                'rng = np.random.default_rng(4)',
                'base = rng.normal(10, 2, 2000)',
                'live = rng.normal(11.5, 2.5, 2000)',
                'print(\'feature=spend psi=\', round(psi_from_samples(base, live), 4))'
              ])
            }
          },
          {
            heading: 'Interview narrative for ML monitoring',
            body:
              'A strong answer sounds like an operating system for models: define SLIs (data PSI, calibration error, latency, business KPI), set SLOs, page humans when breached, and run retrospectives. Mention label delay explicitly—credit default labels may take months—so interim proxies are required. Mention segment-wise monitoring because global averages hide regional breaks. Mention that retraining on drifted data without fixing broken features can bake the bug into the new model. Close with a concrete story from this lab: you detected a PSI jump on spend, found a cents-vs-dollars serve bug, and restored calibration without a full retrain. That combination of metric literacy and systems thinking is what hiring panels want.',
            bullets: [
              'Define SLIs/SLOs for model health, not only uptime.',
              'Monitor segments, not only global aggregates.',
              'Do not retrain over a silent feature bug.'
            ]
          }
        ],
        checklist: [
          'Can implement PSI with smoothed bucket proportions.',
          'Can compute a KS-style distance between two samples.',
          'Can plot and interpret a calibration curve.',
          'Can assemble a minimal drift monitoring report.',
          'Can separate detection, diagnosis, and action in interview answers.'
        ],
        pitfalls: [
          'Alerting on every tiny PSI move without business impact context.',
          'Using different bin edges for baseline and current PSI.',
          'Confusing ranking metrics with calibration quality.',
          'Retraining before checking train/serve bugs.',
          'Ignoring delayed labels when designing monitors.'
        ],
        interviewPrompts: [
          'How does PSI detect feature drift?',
          'When would you use KS instead of PSI?',
          'How can a model keep a good AUC but bad calibration?',
          'What do you monitor when labels arrive weeks later?',
          'Walk through your response plan for a sudden PSI spike.'
        ],
        exercises: [
          {
            id: 'implement-psi',
            title: 'Implement PSI between baseline and live samples',
            difficulty: 'beginner',
            type: 'coding',
            description:
              'Bin baseline samples by quantiles, apply the same edges to live data, and print PSI.',
            starterCode: code([
              'import numpy as np',
              '',
              'def psi_from_samples(base, curr, bins=10, eps=1e-6):',
              '    # TODO: quantile bins from base, histogram both, return PSI.',
              '    return None',
              '',
              'rng = np.random.default_rng(5)',
              'base = rng.normal(0, 1, 3000)',
              'live = rng.normal(0.7, 1.1, 3000)',
              'val = psi_from_samples(base, live)',
              'if val is None:',
              '    print(\'TODO: implement PSI\')',
              'else:',
              '    print(\'PSI\', round(val, 4))'
            ]),
            solution: code([
              'import numpy as np',
              '',
              'def psi_from_samples(base, curr, bins=10, eps=1e-6):',
              '    qs = np.quantile(base, np.linspace(0, 1, bins + 1))',
              '    qs[-1] += 1e-9',
              '    b_counts = np.histogram(base, bins=qs)[0].astype(float)',
              '    c_counts = np.histogram(curr, bins=qs)[0].astype(float)',
              '    b = np.clip(b_counts / max(b_counts.sum(), eps), eps, None)',
              '    c = np.clip(c_counts / max(c_counts.sum(), eps), eps, None)',
              '    return float(np.sum((c - b) * np.log(c / b)))',
              '',
              'rng = np.random.default_rng(5)',
              'base = rng.normal(0, 1, 3000)',
              'live = rng.normal(0.7, 1.1, 3000)',
              'print(\'PSI\', round(psi_from_samples(base, live), 4))'
            ]),
            hints: [
              'Create quantile edges from the baseline only.',
              'Convert histogram counts to proportions and clip before log.',
              'Sum (c-b)*log(c/b) across buckets.'
            ],
            expectedOutput:
              'Printed PSI value for shifted normal samples (noticeably above near-zero).'
          },
          {
            id: 'calibration-curve-report',
            title: 'Build a calibration curve report',
            difficulty: 'intermediate',
            type: 'coding',
            description:
              'Train logistic regression, compute calibration_curve on a holdout set, and print bin statistics (optionally plot).',
            starterCode: code([
              'import numpy as np',
              'import matplotlib.pyplot as plt',
              'from sklearn.datasets import make_classification',
              'from sklearn.linear_model import LogisticRegression',
              'from sklearn.model_selection import train_test_split',
              'from sklearn.calibration import calibration_curve',
              '',
              'X, y = make_classification(n_samples=1500, n_features=10, weights=[0.75, 0.25], random_state=9)',
              'X_tr, X_te, y_tr, y_te = train_test_split(X, y, test_size=0.3, random_state=9, stratify=y)',
              '',
              '# TODO: fit model, get probabilities, compute calibration_curve, print arrays, plot.',
              'print(\'TODO: calibration report\')'
            ]),
            solution: code([
              'import numpy as np',
              'import matplotlib.pyplot as plt',
              'from sklearn.datasets import make_classification',
              'from sklearn.linear_model import LogisticRegression',
              'from sklearn.model_selection import train_test_split',
              'from sklearn.calibration import calibration_curve',
              '',
              'X, y = make_classification(n_samples=1500, n_features=10, weights=[0.75, 0.25], random_state=9)',
              'X_tr, X_te, y_tr, y_te = train_test_split(X, y, test_size=0.3, random_state=9, stratify=y)',
              'proba = LogisticRegression(max_iter=1000).fit(X_tr, y_tr).predict_proba(X_te)[:, 1]',
              'prob_true, prob_pred = calibration_curve(y_te, proba, n_bins=8, strategy=\'quantile\')',
              'print(\'predicted\', np.round(prob_pred, 3))',
              'print(\'empirical\', np.round(prob_true, 3))',
              'plt.figure()',
              'plt.plot([0, 1], [0, 1], \'--\')',
              'plt.plot(prob_pred, prob_true, marker=\'o\')',
              'plt.xlabel(\'predicted\'); plt.ylabel(\'empirical\'); plt.title(\'Calibration\')',
              'plt.show()'
            ]),
            hints: [
              'Use predict_proba values for the positive class.',
              'calibration_curve returns empirical frequencies and predicted means.',
              'Plot y=x as a perfect calibration reference.'
            ],
            expectedOutput:
              'Printed predicted/empirical bin arrays and a calibration plot.'
          },
          {
            id: 'monitoring-playbook',
            title: 'Design a drift response playbook',
            difficulty: 'advanced',
            type: 'design',
            description:
              'Write the operational playbook for a payments fraud model with delayed labels.',
            promptQuestions: [
              'Which interim proxies would you monitor before labels arrive?',
              'What PSI/KS thresholds and confirmation steps avoid alert fatigue?',
              'When do you retrain vs rollback vs fix features?',
              'How do you monitor segments that matter for fairness and risk?'
            ]
          }
        ],
        diagram: null,
        related: [
          'leakage-safe-pipelines',
          'serving-contracts-lab'
        ]
      },
      {
        slug: 'serving-contracts-lab',
        title: 'Serving contracts lab',
        summary:
          'Validate feature schemas, contrast batch vs online scoring contracts, and measure toy latency/throughput for inference loops with NumPy/pandas/sklearn.',
        duration: '55-70 min',
        whyItMatters:
          'Models only create value when serving contracts are explicit: required features, types, missingness, batch semantics, and latency budgets. Interviewers probe whether you can keep training and production aligned under real traffic constraints.',
        sections: [
          {
            heading: 'A serving contract is an API for features and predictions',
            body:
              'Think of inference as a function: given a schema-conformant feature record, return a score and metadata. The contract specifies field names, dtypes, allowed ranges/categories, nullability, and defaults. Example: age:float >=0, plan:category in {free,pro,team}, missed_payments:int >=0. If production sends plan=\'enterprise\' and training never saw it, one-hot handle_unknown may keep running while behavior degrades; a strict validator might reject the request. Contracts also cover output: probability vs logit, thresholded label, model version, and trace id. In interviews, say that model quality work without contract tests is incomplete because silent schema drift is common after warehouse changes.',
            bullets: [
              'Specify names, types, nullability, and semantics for every feature.',
              'Version the contract with the model artifact.',
              'Include prediction output fields in the same contract mindset.'
            ],
            codeExample: {
              title: 'Validate a feature row against a schema',
              language: 'python',
              code: code([
                'schema = {',
                '    \'age\': {\'type\': float, \'min\': 0, \'max\': 120},',
                '    \'plan\': {\'type\': str, \'values\': {\'free\', \'pro\', \'team\'}},',
                '    \'spend\': {\'type\': float, \'min\': 0},',
                '}',
                '',
                'def validate_row(row, schema):',
                '    errors = []',
                '    for key, rules in schema.items():',
                '        if key not in row:',
                '            errors.append(f\'missing {key}\'); continue',
                '        val = row[key]',
                '        if not isinstance(val, rules[\'type\']):',
                '            errors.append(f\'{key} type\'); continue',
                '        if \'min\' in rules and val < rules[\'min\']:',
                '            errors.append(f\'{key} min\')',
                '        if \'max\' in rules and val > rules[\'max\']:',
                '            errors.append(f\'{key} max\')',
                '        if \'values\' in rules and val not in rules[\'values\']:',
                '            errors.append(f\'{key} value\')',
                '    return errors',
                '',
                'print(validate_row({\'age\': 41.0, \'plan\': \'pro\', \'spend\': 12.5}, schema))',
                'print(validate_row({\'age\': -1.0, \'plan\': \'enterprise\', \'spend\': 12.5}, schema))'
              ])
            }
          },
          {
            heading: 'Batch scoring optimizes throughput; online scoring optimizes latency',
            body:
              'Batch inference scores large tables periodically: nightly churn scores for CRM. The contract emphasizes complete columns, idempotent runs, and partition reproducibility. Online inference scores one request or a micro-batch under a latency SLO: credit check in 50 ms. Feature fetch path differs: batch can join wide warehouse tables; online needs low-latency feature stores or request-time features. Models may be the same Pipeline object, but operational concerns diverge—retry policy, cache freshness, partial failure. Interviewers often ask which mode you choose for a product and why. A hybrid exists: nearline scoring every few minutes. Clarify freshness requirements before choosing architecture.',
            bullets: [
              'Batch cares about throughput, partitioning, and recompute correctness.',
              'Online cares about p95/p99 latency and dependency freshness.',
              'The same model artifact can power both with different orchestration.'
            ],
            codeExample: {
              title: 'Micro-benchmark batch vs one-row predict loops',
              language: 'python',
              code: code([
                'import time',
                'import numpy as np',
                'from sklearn.linear_model import LogisticRegression',
                '',
                'rng = np.random.default_rng(0)',
                'X = rng.normal(size=(5000, 16))',
                'y = (X[:, 0] + 0.3 * X[:, 1] > 0).astype(int)',
                'model = LogisticRegression(max_iter=1000).fit(X, y)',
                '',
                't0 = time.perf_counter(); model.predict_proba(X); batch_ms = (time.perf_counter() - t0) * 1000',
                't0 = time.perf_counter()',
                'for i in range(200):',
                '    model.predict_proba(X[i:i+1])',
                'online_ms = (time.perf_counter() - t0) * 1000',
                'print(\'batch 5000 rows ms\', round(batch_ms, 3))',
                'print(\'200 single-row calls ms\', round(online_ms, 3))'
              ])
            }
          },
          {
            heading: 'Schema validation belongs in the hot path or the gate',
            body:
              'For online services, validate requests before model.predict. Reject or quarantine bad rows with actionable errors. For batch jobs, validate partitions before scoring and write poison rows to a dead-letter table. Use pandas dtypes for tabular batches: ensure numeric columns parse, categories are known, and required columns exist. Example bug: spend arrives as strings \'12.50\'; model may crash or coerce incorrectly. Another bug: column order shuffled while a numpy array model expects positional features—prefer named pandas columns into a Pipeline with column names when possible. Contract tests should freeze a golden request JSON and expected score for a given model version.',
            bullets: [
              'Validate early; fail with structured errors.',
              'Prefer named columns over positional arrays at boundaries.',
              'Golden request tests pin model+contract versions together.'
            ],
            codeExample: {
              title: 'pandas batch schema checks',
              language: 'python',
              code: code([
                'import pandas as pd',
                'import numpy as np',
                '',
                'df = pd.DataFrame({',
                '    \'age\': [22, 41, np.nan],',
                '    \'plan\': [\'free\', \'pro\', \'team\'],',
                '    \'spend\': [10.0, 12.5, 8.0],',
                '})',
                'required = [\'age\', \'plan\', \'spend\']',
                'missing_cols = [c for c in required if c not in df.columns]',
                'null_frac = df[required].isna().mean().to_dict()',
                'print(\'missing_cols\', missing_cols)',
                'print(\'null_frac\', {k: round(v, 3) for k, v in null_frac.items()})',
                'print(\'dtypes\', df.dtypes.astype(str).to_dict())'
              ])
            }
          },
          {
            heading: 'Latency and throughput are measurable SLOs',
            body:
              'Latency is time per request; throughput is requests per second. They trade off with batching: scoring 32 rows together may improve GPU/CPU efficiency but raise per-request wait. Even on CPU sklearn models, vectorized batch predict beats a Python loop of single rows. Toy measurements with time.perf_counter are enough for interview intuition and local experiments. Capture p50/p95 by recording many durations. Example: single-row predict takes 0.2 ms locally, but feature fetch takes 30 ms—so optimizing model code is the wrong focus. Always measure end-to-end. Include cold start (loading Pipeline) separately from warm requests. Document budgets: e.g., p95 < 40 ms excluding client network.',
            bullets: [
              'Measure end-to-end, not only model.predict time.',
              'Report percentiles, not just means.',
              'Batching can raise throughput while hurting per-request latency.'
            ],
            codeExample: {
              title: 'Collect p95 of single-row scoring times',
              language: 'python',
              code: code([
                'import time',
                'import numpy as np',
                'from sklearn.linear_model import LogisticRegression',
                '',
                'rng = np.random.default_rng(1)',
                'X = rng.normal(size=(2000, 12))',
                'y = (X.sum(axis=1) > 0).astype(int)',
                'model = LogisticRegression(max_iter=1000).fit(X, y)',
                'durations = []',
                'for i in range(500):',
                '    t0 = time.perf_counter()',
                '    model.predict_proba(X[i:i+1])',
                '    durations.append((time.perf_counter() - t0) * 1000)',
                'arr = np.sort(np.array(durations))',
                'p95 = arr[int(0.95 * (len(arr) - 1))]',
                'print(\'p50_ms\', round(float(np.median(arr)), 4), \'p95_ms\', round(float(p95), 4))'
              ])
            }
          },
          {
            heading: 'Contract tests bridge training notebooks and production services',
            body:
              'A robust workflow exports: model/pipeline artifact, schema JSON, feature fill defaults, and a suite of fixture requests with expected scores within tolerance. CI loads the artifact, validates fixtures against schema, scores them, and diffs outputs. Batch jobs reuse the same artifact with a data-frame adapter. When features change, bump contract version and require a migration. This prevents the classic \'worked in notebook\' failure. In interviews, describe how you would shadow-deploy a new version: score live traffic without acting, compare distributions, then switch. Mention canary percentages and rollback on SLO breach. The exercises practice schema validation and toy latency measurement so these stories are concrete.',
            bullets: [
              'Ship schema + fixtures + model as one versioned bundle.',
              'Shadow traffic before cutover when risk is high.',
              'Adapter layers translate batch/online payloads into the same Pipeline input.'
            ],
            codeExample: {
              title: 'Fixture scoring with a tiny tolerance check',
              language: 'python',
              code: code([
                'import numpy as np',
                'from sklearn.linear_model import LogisticRegression',
                '',
                'X = np.array([[0.0, 0.0], [1.0, -1.0], [2.0, 2.0]])',
                'y = np.array([0, 0, 1])',
                'model = LogisticRegression(max_iter=1000).fit(X, y)',
                'fixture = np.array([[2.0, 2.0]])',
                'expected = 0.7',
                'prob = float(model.predict_proba(fixture)[0, 1])',
                'print(\'prob\', round(prob, 4), \'close\', abs(prob - expected) < 0.4)'
              ])
            }
          },
          {
            heading: 'Put it all together for system-design answers',
            body:
              'A complete serving answer covers input contract, feature freshness, model artifact loading, prediction semantics, latency SLOs, throughput capacity, error handling, and monitoring hooks. Example: online fraud scoring validates schema, fetches 20 features (budget 15 ms), runs a Pipeline (budget 5 ms), returns score+model_version, logs features for later training, and emits metrics for null rates and p95 latency. Batch churn scoring reads yesterday\'s warehouse partition, validates columns, scores 10M rows in vectorized chunks of 100k, writes scores to an output table partitioned by date, and publishes a success metric. Showing both modes and their shared contract earns senior signal. Use this lab\'s vocabulary: schema, fixtures, p95, batch vs online, parity tests.',
            bullets: [
              'Shared contracts enable dual batch/online serving.',
              'Capacity planning needs both latency percentiles and throughput.',
              'Logging features/predictions closes the learning loop.'
            ]
          }
        ],
        checklist: [
          'Can define and implement a feature schema validator.',
          'Can contrast batch and online scoring requirements.',
          'Can measure toy latency percentiles for predict calls.',
          'Can explain contract tests with golden fixtures.',
          'Can describe shadow deploy and rollback triggers.'
        ],
        pitfalls: [
          'Assuming positional numpy columns stay aligned forever.',
          'Optimizing model.predict while feature fetch dominates latency.',
          'Skipping schema validation because \'the model usually works\'.',
          'Shipping notebook preprocessing that differs from serving code.',
          'Reporting only mean latency without percentiles.'
        ],
        interviewPrompts: [
          'What belongs in a model serving contract?',
          'How do batch and online inference architectures differ?',
          'How would you test train/serve parity for features?',
          'What latency metrics would you give an SLO?',
          'How do you roll out a new model version safely?'
        ],
        exercises: [
          {
            id: 'schema-validator',
            title: 'Implement feature schema validation',
            difficulty: 'beginner',
            type: 'coding',
            description:
              'Write validate_row(row, schema) that returns a list of error strings for type/range/category violations.',
            starterCode: code([
              'schema = {',
              '    \'age\': {\'type\': float, \'min\': 0, \'max\': 120},',
              '    \'plan\': {\'type\': str, \'values\': {\'free\', \'pro\', \'team\'}},',
              '    \'spend\': {\'type\': float, \'min\': 0},',
              '}',
              '',
              'def validate_row(row, schema):',
              '    # TODO: return list of error messages (empty if valid).',
              '    return [\'TODO\']',
              '',
              'rows = [',
              '    {\'age\': 41.0, \'plan\': \'pro\', \'spend\': 12.5},',
              '    {\'age\': -3.0, \'plan\': \'enterprise\', \'spend\': 12.5},',
              '    {\'plan\': \'free\', \'spend\': 1.0},',
              ']',
              'for row in rows:',
              '    print(validate_row(row, schema))'
            ]),
            solution: code([
              'schema = {',
              '    \'age\': {\'type\': float, \'min\': 0, \'max\': 120},',
              '    \'plan\': {\'type\': str, \'values\': {\'free\', \'pro\', \'team\'}},',
              '    \'spend\': {\'type\': float, \'min\': 0},',
              '}',
              '',
              'def validate_row(row, schema):',
              '    errors = []',
              '    for key, rules in schema.items():',
              '        if key not in row:',
              '            errors.append(f\'missing {key}\')',
              '            continue',
              '        val = row[key]',
              '        if not isinstance(val, rules[\'type\']):',
              '            errors.append(f\'{key} type\')',
              '            continue',
              '        if \'min\' in rules and val < rules[\'min\']:',
              '            errors.append(f\'{key} min\')',
              '        if \'max\' in rules and val > rules[\'max\']:',
              '            errors.append(f\'{key} max\')',
              '        if \'values\' in rules and val not in rules[\'values\']:',
              '            errors.append(f\'{key} value\')',
              '    return errors',
              '',
              'rows = [',
              '    {\'age\': 41.0, \'plan\': \'pro\', \'spend\': 12.5},',
              '    {\'age\': -3.0, \'plan\': \'enterprise\', \'spend\': 12.5},',
              '    {\'plan\': \'free\', \'spend\': 1.0},',
              ']',
              'for row in rows:',
              '    print(validate_row(row, schema))'
            ]),
            hints: [
              'Check missing keys first.',
              'Use isinstance for type checks.',
              'Validate min/max and allowed category sets when present.'
            ],
            expectedOutput:
              'Printed error lists: empty for the valid row, then errors for bad age/plan, then missing age.'
          },
          {
            id: 'latency-throughput-toy',
            title: 'Measure batch throughput vs single-row latency',
            difficulty: 'intermediate',
            type: 'coding',
            description:
              'Time one batch predict on many rows and many single-row predicts; print ms and rows/sec.',
            starterCode: code([
              'import time',
              'import numpy as np',
              'from sklearn.linear_model import LogisticRegression',
              '',
              'rng = np.random.default_rng(2)',
              'X = rng.normal(size=(8000, 20))',
              'y = (X[:, 0] > 0).astype(int)',
              'model = LogisticRegression(max_iter=1000).fit(X, y)',
              '',
              '# TODO: measure batch predict for all rows and 500 single-row predicts.',
              'print(\'TODO: measure latency/throughput\')'
            ]),
            solution: code([
              'import time',
              'import numpy as np',
              'from sklearn.linear_model import LogisticRegression',
              '',
              'rng = np.random.default_rng(2)',
              'X = rng.normal(size=(8000, 20))',
              'y = (X[:, 0] > 0).astype(int)',
              'model = LogisticRegression(max_iter=1000).fit(X, y)',
              '',
              't0 = time.perf_counter()',
              'model.predict_proba(X)',
              'batch_s = time.perf_counter() - t0',
              'print(\'batch_ms\', round(batch_s * 1000, 3), \'rows_per_sec\', round(len(X) / batch_s, 1))',
              '',
              't0 = time.perf_counter()',
              'for i in range(500):',
              '    model.predict_proba(X[i:i+1])',
              'online_s = time.perf_counter() - t0',
              'print(\'online_500_ms\', round(online_s * 1000, 3), \'calls_per_sec\', round(500 / online_s, 1))'
            ]),
            hints: [
              'Use time.perf_counter around predict_proba.',
              'Batch path scores the full matrix once.',
              'Online path loops single-row slices.'
            ],
            expectedOutput:
              'Printed batch ms/rows_per_sec and online 500-call ms/calls_per_sec.'
          },
          {
            id: 'serving-architecture-choice',
            title: 'Choose batch vs online serving',
            difficulty: 'intermediate',
            type: 'design',
            description:
              'Pick a serving mode for two products: weekly churn emails and checkout fraud checks.',
            promptQuestions: [
              'What freshness and latency does each product require?',
              'How would feature fetching differ in the two modes?',
              'What contract tests and SLOs would you set?',
              'How would you share one model artifact across both paths safely?'
            ]
          }
        ],
        diagram: null,
        related: [
          'leakage-safe-pipelines',
          'drift-and-monitoring-lab'
        ]
      }
    ]
  }
];
