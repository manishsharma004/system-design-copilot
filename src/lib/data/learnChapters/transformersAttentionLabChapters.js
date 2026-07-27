const chapters = {
  "transformers-attention-lab/attention-from-scratch": {
    title: "Chapter: Scaled dot-product attention from scratch",
    readingTime: "70-85 min",
    premise:
      "Attention lets each token read from other tokens through learned queries, keys, and values. This chapter builds the formula, shapes, scaling, masking, and NumPy-style implementation from first principles.",
    parts: [
      {
        id: "attention-as-routing",
        heading: "Attention is learned routing over positions",
        paragraphs: [
          "The intuition behind attention is simple: for each destination token, decide which source tokens to read and how much of each one to mix. A query represents what the destination is looking for. A key represents what each source offers. A value carries the content that will be blended. The model learns projections that create these query, key, and value vectors from token embeddings.",
          "For one sequence with length `n` and head dimension `d_k`, queries `Q`, keys `K`, and values `V` are matrices. The score matrix `Q @ K.T` has shape `(n, n)`. Row `i` contains compatibility scores between destination token `i` and every source token `j`. Softmax turns that row into weights that sum to one, and multiplying by `V` forms a weighted content mixture.",
          "The textbook formula is `Attention(Q, K, V) = softmax(QK^T / sqrt(d_k))V`. Read it left to right. `QK^T` asks which positions match. Division by `sqrt(d_k)` keeps logits in a healthy range. Softmax creates a probability distribution over source positions. The final multiplication retrieves and blends value vectors."
        ],
        keyTerms: [
          {
            term: "query",
            definition:
              "A learned vector representing what a destination token seeks from other positions."
          },
          {
            term: "key",
            definition:
              "A learned vector representing what a source token makes available for matching."
          },
          {
            term: "value",
            definition:
              "A learned vector containing the content mixed according to attention weights."
          }
        ],
        workedExample: {
          title: "Tiny scaled attention",
          body:
            "The example computes attention for one sequence and one head using a stable row-wise softmax.",
          code:
            "import numpy as np\n\nrng = np.random.default_rng(0)\nQ = rng.normal(size=(3, 4))\nK = rng.normal(size=(3, 4))\nV = rng.normal(size=(3, 4))\nscores = (Q @ K.T) / np.sqrt(Q.shape[1])\nscores = scores - scores.max(axis=1, keepdims=True)\nweights = np.exp(scores) / np.exp(scores).sum(axis=1, keepdims=True)\nout = weights @ V\nprint(weights.round(3))\nprint(out.shape)",
          language: "python"
        },
        checkYourself: [
          {
            prompt: "What does entry `(i, j)` in `QK^T` mean?",
            reveal:
              "It is the compatibility between destination token `i`'s query and source token `j`'s key before scaling and softmax."
          }
        ],
        callout: {
          tone: "tip",
          body:
            "Use the retrieve-and-blend story: scores choose where to look, values provide what gets copied into the output."
        }
      },
      {
        id: "scaling-softmax",
        heading: "Scaling keeps softmax from becoming too sharp too early",
        paragraphs: [
          "Dot products grow in variance as dimension grows. If query and key components are roughly independent with unit variance, their dot product has variance proportional to `d_k`. At `d_k = 64`, raw logits can be much larger than at `d_k = 4`. Large logits push softmax toward a nearly one-hot distribution.",
          "A saturated softmax is bad for learning because small changes in most logits barely affect the output. Dividing by `sqrt(d_k)` keeps typical logits near order one, making attention weights softer and gradients healthier. This is not a cosmetic constant. It is the reason the same attention mechanism can scale across head widths without immediately collapsing into hard argmax behavior.",
          "Numerical stability is a separate but related habit. Even after scaling, subtract the maximum score in each row before applying `exp`. This does not change softmax results because softmax is invariant to adding the same constant to every element in a row. It does prevent overflow and makes NumPy examples behave like production kernels."
        ],
        keyTerms: [
          {
            term: "scaled dot-product attention",
            definition:
              "Attention that divides query-key dot products by `sqrt(d_k)` before softmax."
          },
          {
            term: "softmax saturation",
            definition:
              "A regime where one probability dominates and gradients for other choices become very small."
          },
          {
            term: "stable softmax",
            definition:
              "A softmax implementation that subtracts the row maximum before exponentiation."
          }
        ],
        workedExample: {
          title: "Scaling changes attention entropy",
          body:
            "The same raw logits become much less peaked after division by the square root of the head dimension.",
          code:
            "import numpy as np\n\ndef softmax(x):\n    x = x - x.max(axis=-1, keepdims=True)\n    e = np.exp(x)\n    return e / e.sum(axis=-1, keepdims=True)\n\nraw = np.array([[9.0, 2.0, -1.0]])\nprint(softmax(raw).round(4))\nprint(softmax(raw / np.sqrt(64)).round(4))",
          language: "python"
        },
        checkYourself: [
          {
            prompt: "Why divide by `sqrt(d_k)` rather than by sequence length?",
            reveal:
              "The variance growth comes from the number of dimensions in each dot product, not from the number of tokens being compared."
          }
        ],
        callout: {
          tone: "interview",
          body:
            "A complete answer names both reasons: variance control for dot products and healthier softmax gradients."
        }
      },
      {
        id: "values-and-context",
        heading: "Attention output is a context vector for every token",
        paragraphs: [
          "After softmax, each row of the attention matrix is a distribution over source positions. Multiplying by `V` computes a weighted average of value vectors. If token 0 attends 80 percent to token 2 and 20 percent to token 1, its output is mostly token 2's value content with some token 1 content. The output has the same number of rows as `Q` and value dimension columns.",
          "This context vector is not the final model answer. It is passed through output projections, residual connections, normalization, feed-forward networks, and additional layers. Each layer gives tokens another chance to exchange information and transform representations. Attention is therefore a communication primitive inside a larger block.",
          "Interpreting attention weights requires caution. A high attention weight indicates the value at that position strongly influenced the context vector for that head and layer, but it is not a complete explanation of model behavior. Values can encode transformed information, later layers can change the representation, and multiple heads may distribute responsibility."
        ],
        keyTerms: [
          {
            term: "attention weights",
            definition:
              "The row-wise softmax probabilities used to mix source value vectors."
          },
          {
            term: "context vector",
            definition:
              "The output vector for a token after attention has blended value vectors from source positions."
          },
          {
            term: "output projection",
            definition:
              "A learned linear layer applied after attention heads are combined."
          }
        ],
        workedExample: {
          title: "Manual weighted value mix",
          body:
            "One attention row combines three value rows into one context vector.",
          code:
            "import numpy as np\n\nweights = np.array([[0.2, 0.0, 0.8]])\nV = np.array([[1.0, 0.0], [0.0, 5.0], [3.0, 4.0]])\ncontext = weights @ V\nprint(context)",
          language: "python"
        },
        checkYourself: [
          {
            prompt: "Why is attention sometimes described as content-addressable memory?",
            reveal:
              "Queries match keys to choose locations, and values provide the retrieved content, similar to a soft lookup in memory."
          }
        ],
        callout: {
          tone: "warning",
          body:
            "Do not claim attention weights alone fully explain a transformer. They are one observable part of a multi-layer computation."
        }
      },
      {
        id: "masking",
        heading: "Masks define which positions attention is allowed to read",
        paragraphs: [
          "A mask changes attention scores before softmax so illegal positions receive probability zero. Padding masks prevent real tokens from attending to padding. Causal masks prevent a token from attending to future tokens during autoregressive language modeling. Without the causal mask, a training token could read the answer it is supposed to predict.",
          "Implementation usually adds a large negative number, or negative infinity, to masked logits before softmax. After exponentiation, those entries contribute zero. The mask must broadcast to the score shape correctly. A shape bug can accidentally mask the wrong axis, leak future tokens, or hide valid context.",
          "Masking is part of the task definition. Encoders for classification often allow bidirectional attention because every token in the input is known. Decoders for next-token prediction use causal attention because generation proceeds left to right. Encoder-decoder models may use self-attention masks and cross-attention masks differently. The mask tells the model what information is legal, not merely what is convenient."
        ],
        keyTerms: [
          {
            term: "padding mask",
            definition:
              "A mask that prevents attention to artificial padding positions."
          },
          {
            term: "causal mask",
            definition:
              "A triangular mask that prevents each position from attending to future positions."
          },
          {
            term: "information leak",
            definition:
              "A violation where a model can use information that should be unavailable for the prediction task."
          }
        ],
        workedExample: {
          title: "Causal mask with negative infinity",
          body:
            "The upper-triangular positions are hidden before softmax so each row can read only itself and previous tokens.",
          code:
            "import numpy as np\n\nn = 4\nscores = np.zeros((n, n))\nmask = np.triu(np.ones((n, n), dtype=bool), k=1)\nmasked = np.where(mask, -1e9, scores)\nweights = np.exp(masked - masked.max(axis=1, keepdims=True))\nweights = weights / weights.sum(axis=1, keepdims=True)\nprint(weights)",
          language: "python"
        },
        checkYourself: [
          {
            prompt: "Why is a causal mask required during language-model training?",
            reveal:
              "The model predicts the next token from previous tokens. If it can attend to future tokens, training leaks the answer and the objective is dishonest."
          }
        ],
        callout: {
          tone: "interview",
          body:
            "Mention both padding masks and causal masks. They solve different legality problems."
        }
      },
      {
        id: "complexity",
        heading: "Dense attention is powerful because every token can talk to every token",
        paragraphs: [
          "The score matrix has `n * n` entries per head for sequence length `n`. That means dense self-attention has quadratic memory in sequence length for the weights and roughly quadratic compute for score calculation. This cost is manageable for short sequences and expensive for long documents, video, or code contexts.",
          "The benefit is equally important. Any token can directly read any other token in one layer, so long-range dependencies do not require many recurrent steps. A name at the beginning of a paragraph can influence pronoun interpretation later. A function definition can influence a call site. Attention trades quadratic cost for global communication.",
          "Many long-context techniques modify this tradeoff: sparse attention, sliding windows, recurrence, retrieval, compression, linear attention approximations, or chunking. Before naming them, be clear about the baseline. Standard dense attention builds a full pairwise compatibility matrix. Every optimization is a way to reduce, approximate, cache, or avoid parts of that matrix."
        ],
        keyTerms: [
          {
            term: "quadratic complexity",
            definition:
              "Cost that grows proportional to the square of sequence length."
          },
          {
            term: "global communication",
            definition:
              "The ability for any position to directly exchange information with any other position."
          },
          {
            term: "sparse attention",
            definition:
              "Attention that restricts each token to a subset of source positions to reduce cost."
          }
        ],
        workedExample: {
          title: "Score matrix size grows quickly",
          body:
            "Doubling sequence length quadruples the number of score entries per head.",
          code:
            "for n in [128, 256, 512, 1024]:\n    print(n, n * n)",
          language: "python"
        },
        checkYourself: [
          {
            prompt: "What is the main cost of dense self-attention at long context?",
            reveal:
              "The pairwise score and weight matrices grow with sequence length squared, increasing memory and compute."
          }
        ],
        callout: {
          tone: "tip",
          body:
            "In design discussions, connect attention's cost to the score matrix shape. It makes long-context tradeoffs concrete."
        }
      }
    ],
    wrapUp: {
      takeaways: [
        "Attention computes `softmax(QK^T / sqrt(d_k))V` to route information across positions.",
        "Queries, keys, and values separate matching from content mixing.",
        "Scaling controls dot-product variance and softmax sharpness.",
        "Masks define legal information flow for padding and autoregressive prediction.",
        "Dense attention enables global communication at quadratic sequence-length cost."
      ],
      nextSteps: [
        "Implement stable scaled dot-product attention for one head in NumPy.",
        "Add a causal mask and verify masked weights are zero.",
        "Calculate score matrix memory for increasing sequence lengths."
      ]
    }
  },
  "transformers-attention-lab/multi-head-and-blocks": {
    title: "Chapter: Multi-head attention and transformer blocks",
    readingTime: "70-85 min",
    premise:
      "Multi-head attention gives a transformer several learned views of the same sequence, while residuals, normalization, and feed-forward layers turn attention into a trainable block.",
    parts: [
      {
        id: "many-heads",
        heading: "Multiple heads let the model attend in different subspaces",
        paragraphs: [
          "A single attention head produces one set of query, key, and value projections. Multi-head attention creates several heads in parallel, each with its own projections. One head might learn local syntax, another may track entity references, another may focus on separators or structural tokens. These interpretations are not guaranteed, but separate heads give the model capacity to learn different matching patterns.",
          "The usual design keeps total model width fixed. If `d_model` is 512 and there are eight heads, each head may use dimension 64. Heads compute attention independently, their outputs are concatenated, and a final output projection mixes them back into `d_model`. The block therefore gives the model multiple routes for information exchange without simply making one giant head.",
          "Head count is a capacity and efficiency choice. Too few heads may limit diversity. Too many heads can make each head dimension small and reduce per-head expressiveness. In practice, architectures choose head dimensions that work well with hardware kernels and training stability. The conceptual point is parallel learned views, not a mystical number of heads."
        ],
        keyTerms: [
          {
            term: "multi-head attention",
            definition:
              "Parallel attention heads whose outputs are concatenated and projected back to model width."
          },
          {
            term: "head dimension",
            definition:
              "The query, key, and value width used inside one attention head."
          },
          {
            term: "output projection",
            definition:
              "The linear layer that mixes concatenated head outputs into the model dimension."
          }
        ],
        workedExample: {
          title: "Split model width into heads",
          body:
            "A batch of token embeddings can be reshaped so the head axis is explicit.",
          code:
            "import numpy as np\n\nbatch, seq, d_model, heads = 2, 5, 12, 3\nx = np.zeros((batch, seq, d_model))\nd_head = d_model // heads\nsplit = x.reshape(batch, seq, heads, d_head).transpose(0, 2, 1, 3)\nprint(split.shape)  # batch, heads, seq, d_head",
          language: "python"
        },
        checkYourself: [
          {
            prompt: "Why does multi-head attention usually split width instead of multiplying it by head count?",
            reveal:
              "Splitting keeps total model dimension and projection cost controlled while giving several learned attention subspaces."
          }
        ],
        callout: {
          tone: "tip",
          body:
            "Explain heads as parallel learned views. Avoid claiming each head always has a clean human-readable role."
        }
      },
      {
        id: "qkv-projections",
        heading: "QKV projections are learned feature maps",
        paragraphs: [
          "Tokens begin as vectors of model dimension. Attention does not usually compare those raw vectors directly. Learned linear projections create queries, keys, and values. This lets the model decide which aspects of a token matter for asking, advertising, and carrying content. The same token can ask with one projection and provide value content with another.",
          "Many implementations compute Q, K, and V with one fused linear layer for efficiency, then split the result. Conceptually, it is still three learned projections. For self-attention, Q, K, and V all come from the same input sequence. For cross-attention, queries come from one sequence, while keys and values come from another, such as a decoder attending to encoder outputs.",
          "Projection shapes must be exact. If input has shape `(batch, seq, d_model)`, a Q projection might produce `(batch, seq, heads * d_head)`, then reshape to `(batch, heads, seq, d_head)`. Transpose mistakes can swap heads and sequence positions, producing outputs with plausible shapes but wrong semantics. Shape comments are not busywork; they are correctness tools."
        ],
        keyTerms: [
          {
            term: "projection",
            definition:
              "A learned linear map that changes or re-expresses token vectors."
          },
          {
            term: "self-attention",
            definition:
              "Attention where queries, keys, and values come from the same sequence."
          },
          {
            term: "cross-attention",
            definition:
              "Attention where queries come from one sequence and keys/values come from another."
          }
        ],
        workedExample: {
          title: "Fused QKV projection shape",
          body:
            "A single matrix can produce Q, K, and V channels that are split afterward.",
          code:
            "import numpy as np\n\nbatch, seq, d_model, heads, d_head = 2, 4, 6, 2, 3\nx = np.ones((batch, seq, d_model))\nWqkv = np.ones((d_model, 3 * heads * d_head))\nqkv = x @ Wqkv\nq, k, v = np.split(qkv, 3, axis=-1)\nprint(q.shape, k.shape, v.shape)",
          language: "python"
        },
        checkYourself: [
          {
            prompt: "How does cross-attention differ from self-attention?",
            reveal:
              "In cross-attention, the destination sequence supplies queries while a separate source sequence supplies keys and values."
          }
        ],
        callout: {
          tone: "warning",
          body:
            "A tensor can have the expected total size and still be wrong if sequence and head axes are transposed incorrectly."
        }
      },
      {
        id: "residual-and-norm",
        heading: "Residual connections and normalization keep deep blocks trainable",
        paragraphs: [
          "A transformer block is not just attention. The attention output is usually added back to the input through a residual connection. Residual paths give gradients a shorter route backward and let a block learn a refinement rather than a complete replacement. If a sublayer is not useful at initialization, the residual path still carries information forward.",
          "Layer normalization stabilizes activation scale within each token's feature vector. Modern decoder-only models commonly use pre-norm blocks, where normalization happens before attention and before the feed-forward network. Pre-norm tends to improve gradient flow in deep transformers. Post-norm variants exist, but the important concept is that normalization controls numerical regimes across many stacked layers.",
          "Dropout may appear during training to regularize activations or attention weights, though large modern models often rely on data scale, weight decay, and architecture choices as well. Whatever the exact recipe, the block needs both expressive transformations and stable optimization. Attention supplies communication; residuals and normalization make repeated communication trainable."
        ],
        keyTerms: [
          {
            term: "residual connection",
            definition:
              "An additive shortcut that carries a layer's input around a sublayer and adds it to the sublayer output."
          },
          {
            term: "layer normalization",
            definition:
              "Normalization across the feature dimension of each token representation."
          },
          {
            term: "pre-norm",
            definition:
              "A transformer layout that normalizes inputs before each sublayer."
          }
        ],
        workedExample: {
          title: "Layer norm over feature dimension",
          body:
            "The mean and variance are computed per token across features, not across the batch.",
          code:
            "import numpy as np\n\nx = np.random.default_rng(0).normal(size=(2, 3, 4))\nmean = x.mean(axis=-1, keepdims=True)\nvar = x.var(axis=-1, keepdims=True)\ny = (x - mean) / np.sqrt(var + 1e-5)\nprint(y.mean(axis=-1).round(6))\nprint(y.var(axis=-1).round(3))",
          language: "python"
        },
        checkYourself: [
          {
            prompt: "Why are residual connections important in deep transformers?",
            reveal:
              "They preserve an information and gradient path across sublayers, making each block a learnable refinement rather than a mandatory complete rewrite."
          }
        ],
        callout: {
          tone: "interview",
          body:
            "A transformer block answer should include attention, residual addition, normalization, feed-forward network, and another residual path."
        }
      },
      {
        id: "feed-forward",
        heading: "The feed-forward network transforms each token independently",
        paragraphs: [
          "After attention mixes information across positions, the feed-forward network processes each token position independently with the same weights. It is usually a two-layer MLP: expand from `d_model` to a larger hidden dimension, apply a nonlinearity such as GELU or SwiGLU, then project back to `d_model`. This is where much of the transformer's parameter count lives.",
          "Attention handles communication between tokens; the feed-forward network handles per-token computation. Once a token's representation includes context from attention, the MLP can transform that contextual representation into more useful features. Stacking blocks alternates these two modes: communicate, compute, communicate, compute.",
          "The expansion ratio controls capacity and cost. A common older pattern used `4 * d_model` hidden width, while newer variants may use gated activations and different ratios. Hardware efficiency matters because these dense matrix multiplies are large. Conceptually, however, the feed-forward layer is simple: the same nonlinear transformation is applied to every position."
        ],
        keyTerms: [
          {
            term: "position-wise feed-forward network",
            definition:
              "An MLP applied independently to each token position with shared weights."
          },
          {
            term: "GELU",
            definition:
              "A smooth activation commonly used in transformer feed-forward networks."
          },
          {
            term: "expansion ratio",
            definition:
              "The hidden width of the feed-forward network relative to model dimension."
          }
        ],
        workedExample: {
          title: "Position-wise MLP shape",
          body:
            "The same matrices transform every token; batch and sequence dimensions are preserved.",
          code:
            "import numpy as np\n\nbatch, seq, d_model, hidden = 2, 5, 8, 32\nx = np.ones((batch, seq, d_model))\nW1 = np.ones((d_model, hidden))\nW2 = np.ones((hidden, d_model))\nh = np.maximum(0, x @ W1)\ny = h @ W2\nprint(y.shape)",
          language: "python"
        },
        checkYourself: [
          {
            prompt: "What does the feed-forward network do that attention does not?",
            reveal:
              "It performs nonlinear per-token computation after attention has mixed contextual information across positions."
          }
        ],
        callout: {
          tone: "tip",
          body:
            "Use the phrase `attention mixes positions; the MLP transforms channels` to remember the division of labor."
        }
      },
      {
        id: "complete-block",
        heading: "A transformer block is a repeated communication-and-computation unit",
        paragraphs: [
          "A simplified pre-norm decoder block looks like this: normalize input, run masked multi-head attention, add the residual, normalize again, run the feed-forward network, and add the second residual. Encoder blocks use similar structure but may use bidirectional attention. Encoder-decoder architectures add cross-attention blocks where the decoder reads encoder outputs.",
          "Stacking blocks deepens reasoning. Early layers may capture local token relationships, later layers can combine broader context, and final layers shape representations for the objective. This description is only approximate because trained models distribute computation in complex ways. Still, the block abstraction helps engineers reason about shapes, memory, latency, and where KV-cache applies.",
          "In implementation, the block boundary is also where observability and optimization live. Attention weights, activation norms, residual stream statistics, and per-layer latency can reveal problems. Fused kernels and tensor parallelism often optimize attention and MLP sublayers separately. Understanding the block makes both debugging and system design more concrete."
        ],
        keyTerms: [
          {
            term: "decoder block",
            definition:
              "A transformer block using causal self-attention for autoregressive generation."
          },
          {
            term: "residual stream",
            definition:
              "The evolving token representation carried through residual connections across transformer layers."
          },
          {
            term: "tensor parallelism",
            definition:
              "Splitting large tensor operations across devices to train or serve large models."
          }
        ],
        workedExample: {
          title: "Block shape invariant",
          body:
            "A standard transformer block preserves `(batch, seq, d_model)` so blocks can be stacked.",
          code:
            "shape = ('batch', 'seq', 'd_model')\nprint('input:', shape)\nprint('after attention + residual:', shape)\nprint('after mlp + residual:', shape)",
          language: "python"
        },
        checkYourself: [
          {
            prompt: "Why must a transformer block usually preserve `d_model`?",
            reveal:
              "Residual additions require sublayer outputs to match the residual stream shape, and preserving width lets many blocks stack cleanly."
          }
        ],
        callout: {
          tone: "interview",
          body:
            "When asked to draw a transformer block, include shape preservation through residual paths. It shows implementation awareness."
        }
      }
    ],
    wrapUp: {
      takeaways: [
        "Multi-head attention runs several learned attention views in parallel.",
        "QKV projections define how tokens ask, advertise, and carry content.",
        "Residual connections and layer normalization stabilize deep transformer training.",
        "Feed-forward networks transform each contextualized token independently.",
        "Transformer blocks preserve model-width shape so communication-and-computation units can be stacked."
      ],
      nextSteps: [
        "Reshape a toy tensor into batch, head, sequence, and head-dimension axes.",
        "Write pseudocode for a pre-norm decoder block.",
        "Explain why attention and MLP sublayers have different latency and memory profiles."
      ]
    }
  },
  "transformers-attention-lab/positional-encoding-and-causal-mask": {
    title: "Chapter: Positional encoding, causal masks, and KV-cache intuition",
    readingTime: "70-85 min",
    premise:
      "Self-attention needs position information, legal information-flow masks, and efficient generation state. This chapter explains sinusoidal and learned positions, causal masking, relative position ideas, and KV-cache mechanics.",
    parts: [
      {
        id: "why-position",
        heading: "Attention needs position information because sets have no order",
        paragraphs: [
          "Self-attention compares every token with every other token through dot products. Without positional information, the mechanism is largely permutation-equivariant: rearranging tokens rearranges outputs in the same way. Language is not a bag of words. `Dog bites man` and `man bites dog` contain the same words but different meanings. The model needs some way to know order.",
          "Positional encodings inject order into token representations. The earliest transformer used fixed sinusoidal vectors added to token embeddings. Many models use learned absolute position embeddings. Others use relative position biases or rotary position embeddings that affect attention scores more directly. The family differs, but the goal is shared: make token position available to the network.",
          "Adding positions to embeddings is a compact design. The input to the first layer becomes token meaning plus position signal. Later layers can combine content and order however the task requires. The risk is length generalization: a model trained on one range of positions may behave poorly beyond it unless the positional method and training support extrapolation."
        ],
        keyTerms: [
          {
            term: "positional encoding",
            definition:
              "A signal that gives transformer token representations information about order or position."
          },
          {
            term: "absolute position",
            definition:
              "A representation tied to a specific index such as token position 17."
          },
          {
            term: "relative position",
            definition:
              "A representation or bias based on distance or relationship between token positions."
          }
        ],
        workedExample: {
          title: "Sinusoidal position table",
          body:
            "Even dimensions use sine and odd dimensions use cosine at different frequencies.",
          code:
            "import numpy as np\n\nseq, d_model = 4, 6\npos = np.arange(seq)[:, None]\ni = np.arange(d_model)[None, :]\nangle = pos / np.power(10000, (2 * (i // 2)) / d_model)\npe = np.where(i % 2 == 0, np.sin(angle), np.cos(angle))\nprint(pe.round(3))",
          language: "python"
        },
        checkYourself: [
          {
            prompt: "Why is token identity alone insufficient for language order?",
            reveal:
              "The same tokens can mean different things in different orders, so the model needs position signals to distinguish arrangements."
          }
        ],
        callout: {
          tone: "tip",
          body:
            "Explain positional encoding as breaking the symmetry that would otherwise treat token order too much like a set."
        }
      },
      {
        id: "positional-methods",
        heading: "Position methods differ in how they affect attention",
        paragraphs: [
          "Learned absolute embeddings assign a trainable vector to each position and add it to token embeddings. They are simple and expressive within the trained context length, but positions beyond the learned table require extension or special handling. Fixed sinusoidal encodings do not learn a table and can be evaluated at longer positions, though extrapolation quality still depends on training.",
          "Relative position methods add information based on distance between query and key positions. This better matches the idea that nearby tokens often relate differently from far tokens regardless of absolute index. Rotary position embeddings rotate query and key dimensions as a function of position, causing dot products to carry relative-position information. Many decoder-only LLMs use rotary-style approaches.",
          "The design choice affects long-context behavior and implementation. Absolute tables are easy to inspect but tied to maximum length. Relative biases and rotary encodings integrate into attention score computation and can support length scaling techniques. In an interview, avoid pretending one method is always best. Compare simplicity, extrapolation, compatibility with KV-cache, and empirical model design."
        ],
        keyTerms: [
          {
            term: "learned position embedding",
            definition:
              "A trainable vector table indexed by token position."
          },
          {
            term: "rotary position embedding",
            definition:
              "A method that applies position-dependent rotations to query and key vectors so dot products encode relative positions."
          },
          {
            term: "relative bias",
            definition:
              "An attention-score adjustment based on distance or relationship between positions."
          }
        ],
        workedExample: {
          title: "Absolute positions added to token embeddings",
          body:
            "The position row is added to every token vector at the matching sequence index.",
          code:
            "import numpy as np\n\nbatch, seq, d = 2, 3, 4\ntok = np.zeros((batch, seq, d))\npos = np.arange(seq * d).reshape(seq, d) / 100\nx = tok + pos[None, :, :]\nprint(x[0])",
          language: "python"
        },
        checkYourself: [
          {
            prompt: "Why might relative position ideas help long-context behavior?",
            reveal:
              "They represent relationships between positions rather than only memorized absolute indices, which can make distance patterns more reusable."
          }
        ],
        callout: {
          tone: "interview",
          body:
            "Name the tradeoff: absolute embeddings are simple; relative and rotary methods affect attention and often suit decoder LLMs."
        }
      },
      {
        id: "causal-mask",
        heading: "The causal mask enforces left-to-right prediction",
        paragraphs: [
          "Autoregressive language models train by predicting the next token from previous tokens. During training, the whole sequence is available in a tensor for efficiency, but the objective must pretend each position only knows the prefix before it. The causal mask enforces that rule by blocking attention to future positions.",
          "The mask is triangular. Row 0 can attend only to token 0, row 1 can attend to tokens 0 and 1, and so on. Future scores are set to a very negative value before softmax, so their probabilities become zero. This lets training process all positions in parallel while preserving the same information constraint used during generation.",
          "Causal masking is a correctness condition, not an implementation detail. If the mask is wrong, the model may learn to copy future tokens during training and fail at generation time. Padding masks may also be needed when sequences in a batch have different lengths. The final attention mask often combines causal and padding constraints."
        ],
        keyTerms: [
          {
            term: "autoregressive",
            definition:
              "Generating or modeling a sequence one token at a time, conditioning on previous tokens."
          },
          {
            term: "triangular mask",
            definition:
              "A mask that blocks positions above the main diagonal to prevent future attention."
          },
          {
            term: "teacher forcing",
            definition:
              "Training with known previous tokens supplied as context while predicting next tokens."
          }
        ],
        workedExample: {
          title: "Allowed positions under a causal mask",
          body:
            "The lower triangle marks legal reads for each destination token.",
          code:
            "import numpy as np\n\nn = 5\nallowed = np.tril(np.ones((n, n), dtype=int))\nprint(allowed)",
          language: "python"
        },
        checkYourself: [
          {
            prompt: "How can a model train on a full sequence without seeing future answers?",
            reveal:
              "The causal mask blocks future positions in attention, so parallel computation still obeys left-to-right information flow."
          }
        ],
        callout: {
          tone: "warning",
          body:
            "A wrong causal mask can produce excellent-looking training loss for the wrong reason: future-token leakage."
        }
      },
      {
        id: "kv-cache-intuition",
        heading: "KV-cache avoids recomputing the past during generation",
        paragraphs: [
          "During autoregressive generation, tokens are produced one at a time. At step `t`, the new token needs to attend to all previous tokens. A naive implementation would rerun the entire transformer on the whole prefix every step, recomputing keys and values for old tokens again and again. That wastes time because past token representations for each layer do not change once generated.",
          "A KV-cache stores key and value tensors for previous positions at each decoder layer. When a new token arrives, the model computes the new token's query, key, and value. The query attends over cached keys plus the new key, then mixes cached values plus the new value. The cache grows with sequence length, layers, heads, and head dimension.",
          "The cache improves decode latency but consumes memory. Prefill processes the prompt in parallel and creates the initial cache. Decode then adds one token at a time and is often memory-bandwidth sensitive because cached keys and values must be read for every generated token. This is why serving discussions separate prefill throughput from decode throughput and why long contexts can become expensive even when generating few tokens."
        ],
        keyTerms: [
          {
            term: "KV-cache",
            definition:
              "Stored key and value tensors from prior tokens used to speed autoregressive decoding."
          },
          {
            term: "prefill",
            definition:
              "The initial forward pass over the prompt that computes prompt representations and fills the KV-cache."
          },
          {
            term: "decode",
            definition:
              "The one-token-at-a-time generation phase after prefill."
          }
        ],
        workedExample: {
          title: "Append one token to cached keys",
          body:
            "The cache stores previous sequence positions; the new key is concatenated along the sequence axis.",
          code:
            "import numpy as np\n\nbatch, heads, past, d = 1, 2, 3, 4\nk_cache = np.zeros((batch, heads, past, d))\nk_new = np.ones((batch, heads, 1, d))\nk_all = np.concatenate([k_cache, k_new], axis=2)\nprint(k_all.shape)",
          language: "python"
        },
        checkYourself: [
          {
            prompt: "Why does KV-cache help decode but not remove attention over the past?",
            reveal:
              "It avoids recomputing old keys and values, but the new query still compares against cached keys and reads cached values for the full prefix."
          }
        ],
        callout: {
          tone: "interview",
          body:
            "Separate prefill and decode in LLM serving answers. Prefill is prompt-parallel; decode is iterative and KV-cache heavy."
        }
      },
      {
        id: "context-and-cache-tradeoffs",
        heading: "Long context is a memory contract as much as a modeling feature",
        paragraphs: [
          "Extending context length changes more than a config number. The model must handle positional behavior over longer distances, attention or cache memory grows, and serving systems must schedule requests with different prompt and generation lengths. A long prompt can spend substantial time in prefill, while long generation keeps reading an expanding KV-cache.",
          "KV-cache memory is roughly proportional to layers times batch size times heads times sequence length times head dimension times two for keys and values, adjusted by precision. This memory competes with model weights and other requests on the same accelerator. Techniques such as paged attention, cache quantization, sliding windows, grouped-query attention, and prefix caching improve utilization, but they do not make context free.",
          "For product design, context should be budgeted deliberately. Retrieval can place only the most useful chunks in the prompt. Summarization can compress stale conversation history. Tools can fetch details on demand. A model with a large maximum window still benefits from shorter, cleaner context because attention, cache, latency, and distraction all have costs."
        ],
        keyTerms: [
          {
            term: "paged attention",
            definition:
              "A serving technique that manages KV-cache memory in blocks to reduce fragmentation and improve batching."
          },
          {
            term: "grouped-query attention",
            definition:
              "An attention variant where multiple query heads share fewer key/value heads to reduce KV-cache size and bandwidth."
          },
          {
            term: "prefix caching",
            definition:
              "Reusing computed cache for shared prompt prefixes across requests."
          }
        ],
        workedExample: {
          title: "Rough KV-cache element count",
          body:
            "The factor of two accounts for storing both keys and values.",
          code:
            "layers, batch, heads, seq, d = 32, 1, 32, 4096, 128\nelements = 2 * layers * batch * heads * seq * d\nprint(f'{elements/1e9:.2f} billion elements')",
          language: "python"
        },
        checkYourself: [
          {
            prompt: "Why can long prompts slow a system even when output is short?",
            reveal:
              "Prefill must process the whole prompt and build cache across layers. Long prompt attention and cache allocation consume compute and memory before decoding starts."
          }
        ],
        callout: {
          tone: "tip",
          body:
            "Large context is useful, but the cheapest token is the one you did not send. Retrieval and compression are serving optimizations too."
        }
      }
    ],
    wrapUp: {
      takeaways: [
        "Transformers need position signals because attention alone does not encode order.",
        "Absolute, sinusoidal, relative, and rotary methods inject position in different ways.",
        "Causal masks enforce left-to-right information flow during parallel training.",
        "KV-cache stores previous keys and values so decode avoids recomputing the prefix.",
        "Long-context serving is constrained by prefill compute, decode bandwidth, and cache memory."
      ],
      nextSteps: [
        "Build a sinusoidal encoding table and add it to token embeddings.",
        "Verify a causal mask zeros all future attention weights.",
        "Estimate KV-cache memory for two model sizes and context lengths."
      ]
    }
  }
};

/** @type {Record<string, import('../learnChapters.js').LessonLearnChapter>} */
export const transformersAttentionLabChapters = JSON.parse(JSON.stringify(chapters));
