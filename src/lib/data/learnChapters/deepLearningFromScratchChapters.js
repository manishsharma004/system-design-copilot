const chapters = {
  "deep-learning-from-scratch/perceptron-and-mlp-numpy": {
    title: "Chapter: Perceptron and MLP with NumPy",
    readingTime: "70-85 min",
    premise:
      "A from-scratch neural network makes activations, losses, gradients, and parameter updates visible. This chapter builds from a single perceptron to a two-layer MLP using NumPy-level reasoning.",
    parts: [
      {
        id: "perceptron-boundary",
        heading: "A perceptron is a linear boundary with a hard decision",
        paragraphs: [
          "A perceptron computes a score by taking a dot product between input features and weights, adding a bias, and applying a threshold. In two dimensions, the equation `w1*x1 + w2*x2 + b = 0` is a line. Points on one side predict one class; points on the other side predict the other. The weights rotate the boundary, and the bias shifts it.",
          "This is enough for linearly separable patterns such as AND or OR. It is not enough for XOR, where the positive examples occupy opposite corners of a square. No single straight line can separate those corners from the negatives. That limitation is representational, not a failure of optimization. Training longer cannot make a one-layer linear model express a nonlinearly separable pattern.",
          "The perceptron is still worth implementing because it reveals the skeleton of neural networks. Inputs become scores, scores become predictions, predictions produce errors, and errors update parameters. Later networks replace the hard threshold with differentiable activations and stack multiple layers, but the basic habit of tracking shapes and parameter roles starts here."
        ],
        keyTerms: [
          {
            term: "perceptron",
            definition:
              "A linear binary classifier that thresholds a weighted sum of input features."
          },
          {
            term: "bias",
            definition:
              "A learned offset that shifts the decision boundary independently of input values."
          },
          {
            term: "linear separability",
            definition:
              "The condition that classes can be separated by a line, plane, or hyperplane in feature space."
          }
        ],
        workedExample: {
          title: "AND gate with a hand-coded perceptron",
          body:
            "The weights add the two input bits, and the bias requires both bits to be one before the score crosses zero.",
          code:
            "import numpy as np\n\nX = np.array([[0, 0], [0, 1], [1, 0], [1, 1]], dtype=float)\nw = np.array([1.0, 1.0])\nb = -1.5\nscores = X @ w + b\npred = (scores >= 0).astype(int)\nprint(scores)\nprint(pred)",
          language: "python"
        },
        checkYourself: [
          {
            prompt: "Why can a perceptron solve AND but not XOR?",
            reveal:
              "AND has a single linear boundary that separates the positive example from negatives. XOR requires two separated positive regions, which one linear boundary cannot express."
          }
        ],
        callout: {
          tone: "tip",
          body:
            "Draw the boundary before coding. If the geometry is impossible, more epochs will not fix the model family."
        }
      },
      {
        id: "perceptron-training",
        heading: "The perceptron update moves the boundary after mistakes",
        paragraphs: [
          "The perceptron training rule updates only on errors. If the target is 1 but the model predicts 0, the weights move toward the input vector so the score increases next time. If the target is 0 but the model predicts 1, the weights move away from the input vector so the score decreases. The bias update shifts the boundary even when an input vector has zeros.",
          "The learning rate controls step size. Too small can require many passes; too large can bounce around. For linearly separable data, the perceptron convergence theorem says the algorithm will eventually find a separating boundary under suitable conditions. For nonseparable data, mistakes may never disappear because the model family cannot satisfy all examples at once.",
          "Implementing the loop by hand teaches a useful debugging habit: print mistakes by epoch and inspect the final scores, not only the final class predictions. Scores show margin. A model that predicts correctly with tiny scores is less confident than one with large positive or negative margins. This intuition will later connect to logistic loss, hinge loss, and neural network logits."
        ],
        keyTerms: [
          {
            term: "learning rate",
            definition:
              "A scalar controlling how large each parameter update is."
          },
          {
            term: "margin",
            definition:
              "The signed distance-like confidence of an example relative to a decision boundary."
          },
          {
            term: "epoch",
            definition:
              "One complete pass over the training dataset."
          }
        ],
        workedExample: {
          title: "Perceptron updates on AND",
          body:
            "The loop updates weights and bias only when the threshold prediction disagrees with the target.",
          code:
            "import numpy as np\n\nX = np.array([[0, 0], [0, 1], [1, 0], [1, 1]], dtype=float)\ny = np.array([0, 0, 0, 1])\nw = np.zeros(2)\nb = 0.0\nlr = 0.2\nfor epoch in range(8):\n    mistakes = 0\n    for x, target in zip(X, y):\n        pred = int(x @ w + b >= 0)\n        err = target - pred\n        mistakes += int(err != 0)\n        w += lr * err * x\n        b += lr * err\n    print(epoch, w.round(2), round(b, 2), mistakes)",
          language: "python"
        },
        checkYourself: [
          {
            prompt: "What does the sign of `target - pred` decide?",
            reveal:
              "It decides whether the boundary should move so the score for that example increases or decreases on the next pass."
          }
        ],
        callout: {
          tone: "interview",
          body:
            "Describe the perceptron update geometrically: mistakes push the separating hyperplane toward a better orientation and offset."
        }
      },
      {
        id: "hidden-layer",
        heading: "A hidden layer learns intermediate features",
        paragraphs: [
          "A multilayer perceptron adds hidden units between the input and output. Each hidden unit computes its own affine score and passes it through a nonlinear activation. The final layer combines those activated features. This turns the model from one boundary into a composition of learned features and a decision rule.",
          "Nonlinearity is essential. If the first layer computes `X @ W1` and the second computes `H @ W2` with no activation, the composition is `X @ (W1 @ W2)`, which is still a single linear map. ReLU, tanh, sigmoid, and other activations break that collapse. They let multiple layers carve input space into richer regions.",
          "For XOR, hidden units can represent useful subconditions such as `x1 or x2` and `not both`. The final layer then combines them. In larger problems, the hidden units are not usually named so neatly, but the principle remains. The network learns a representation that makes the final prediction easier."
        ],
        keyTerms: [
          {
            term: "hidden layer",
            definition:
              "A layer between input and output that learns intermediate representations."
          },
          {
            term: "activation",
            definition:
              "A nonlinear function applied to layer scores so stacked layers can express nonlinear functions."
          },
          {
            term: "ReLU",
            definition:
              "The rectified linear unit activation, `max(0, x)`, commonly used in neural networks."
          }
        ],
        workedExample: {
          title: "Forward pass through one hidden layer",
          body:
            "The hidden matrix has one row per example and one column per hidden unit; the output layer then reads those learned features.",
          code:
            "import numpy as np\n\nrng = np.random.default_rng(1)\nX = np.array([[0, 0], [0, 1], [1, 0], [1, 1]], dtype=float)\nW1 = rng.normal(scale=0.5, size=(2, 4))\nb1 = np.zeros(4)\nW2 = rng.normal(scale=0.5, size=(4, 1))\nb2 = np.zeros(1)\nH = np.maximum(0, X @ W1 + b1)\nlogits = H @ W2 + b2\nprint(H.shape, logits.shape)",
          language: "python"
        },
        checkYourself: [
          {
            prompt: "Why does stacking linear layers without activation not help?",
            reveal:
              "The product of linear maps is still a linear map, so the network collapses to one equivalent linear layer."
          }
        ],
        callout: {
          tone: "tip",
          body:
            "Shape-check every layer: `(batch, input_dim) @ (input_dim, hidden_dim)` should produce `(batch, hidden_dim)`."
        }
      },
      {
        id: "loss-and-gradients",
        heading: "Loss turns predictions into a trainable signal",
        paragraphs: [
          "A hard threshold is not convenient for gradient-based training because a tiny parameter change usually does not change the output. MLPs commonly train with differentiable losses. For binary classification, logits can pass through a sigmoid and use binary cross-entropy. The loss is high when the model assigns low probability to the true class and low when it assigns high probability.",
          "Gradient descent asks how each parameter should change to reduce loss. The derivative of the loss with respect to a weight says the local slope: positive means increasing that weight raises loss, negative means increasing it lowers loss. The update subtracts learning rate times gradient. This local rule, repeated many times, can fit complex nonlinear functions.",
          "Numerical stability matters even in toy NumPy code. Sigmoid can overflow for large negative logits if implemented naively, and log probabilities can hit `log(0)` if clipped poorly. A small lab should still use stable formulas where possible. Good habits formed in tiny examples transfer directly to larger frameworks."
        ],
        keyTerms: [
          {
            term: "logit",
            definition:
              "A raw model score before a sigmoid or softmax converts it into a probability-like value."
          },
          {
            term: "binary cross-entropy",
            definition:
              "A loss for binary classification that penalizes confident wrong probabilities."
          },
          {
            term: "gradient descent",
            definition:
              "An optimization method that updates parameters in the direction that locally reduces loss."
          }
        ],
        workedExample: {
          title: "Binary cross-entropy from logits",
          body:
            "The stable expression avoids explicitly computing `log(sigmoid(z))` for large logits.",
          code:
            "import numpy as np\n\nz = np.array([-3.0, 0.0, 3.0])\ny = np.array([0.0, 1.0, 1.0])\nloss = np.maximum(z, 0) - z * y + np.log1p(np.exp(-np.abs(z)))\nprint(loss.round(4))\nprint('mean loss:', loss.mean().round(4))",
          language: "python"
        },
        checkYourself: [
          {
            prompt: "Why train on logits instead of thresholded predictions?",
            reveal:
              "Logits provide a smooth signal for probabilities and gradients. Thresholded predictions are mostly flat and do not reveal how to adjust parameters."
          }
        ],
        callout: {
          tone: "warning",
          body:
            "If loss is `nan`, inspect logits, exponentials, divisions, and learning rate before assuming the model architecture is wrong."
        }
      },
      {
        id: "training-loop",
        heading: "A small MLP training loop is a shape ledger",
        paragraphs: [
          "The full loop has a rhythm: initialize parameters, run a forward pass, compute loss, compute gradients, update parameters, and repeat. In NumPy, there is no autograd safety net. That is useful for learning because every intermediate has a visible shape. The gradient of `W1` must match `W1`, the gradient of `b1` must match `b1`, and the batch dimension should disappear only where you average or sum over examples.",
          "Initialization sets the numerical regime. If weights are too small, hidden activations can become nearly identical and gradients weak. If weights are too large, activations and logits can explode. ReLU networks often use a scale related to `sqrt(2 / fan_in)`, while tanh networks often use Xavier-style scaling. The point is to keep signal variance reasonable through layers.",
          "A successful XOR MLP is not impressive because XOR is large; it is impressive because every neural-network concept appears in miniature. Nonlinear representation solves the geometry, loss supplies gradients, backprop computes parameter responsibility, and the optimizer improves the boundary. Once you can narrate that tiny loop, framework code becomes less opaque."
        ],
        keyTerms: [
          {
            term: "forward pass",
            definition:
              "Computing layer activations and predictions from inputs using current parameters."
          },
          {
            term: "backward pass",
            definition:
              "Computing gradients of loss with respect to intermediate values and parameters."
          },
          {
            term: "fan-in",
            definition:
              "The number of input connections to a unit or layer, used in initialization scaling."
          }
        ],
        workedExample: {
          title: "Initialize a ReLU hidden layer",
          body:
            "The scale uses fan-in so activations start in a reasonable range before training.",
          code:
            "import numpy as np\n\nrng = np.random.default_rng(3)\nfan_in, hidden = 2, 8\nW1 = rng.normal(0, np.sqrt(2 / fan_in), size=(fan_in, hidden))\nX = rng.normal(size=(16, fan_in))\nH = np.maximum(0, X @ W1)\nprint(W1.std().round(3), H.mean().round(3), H.std().round(3))",
          language: "python"
        },
        checkYourself: [
          {
            prompt: "What is the fastest way to catch many from-scratch MLP bugs?",
            reveal:
              "Write expected shapes beside every forward value and gradient. Shape mismatches expose transpose, reduction, and broadcasting errors early."
          }
        ],
        callout: {
          tone: "interview",
          body:
            "Use XOR as a compact story: one perceptron fails by geometry; a nonlinear hidden layer creates features that make the final decision linear."
        }
      }
    ],
    wrapUp: {
      takeaways: [
        "A perceptron is a linear decision boundary with a threshold.",
        "Perceptron updates move weights and bias only after mistakes.",
        "Hidden layers plus nonlinear activations let MLPs represent nonlinear patterns such as XOR.",
        "Differentiable losses provide trainable gradients where hard thresholds do not.",
        "From-scratch NumPy networks are mostly careful shape tracking and stable numerical habits."
      ],
      nextSteps: [
        "Train the perceptron update on AND and watch how mistakes decrease.",
        "Implement a two-layer MLP forward pass and print every intermediate shape.",
        "Explain why removing ReLU from the MLP collapses it into a linear model."
      ]
    }
  },
  "deep-learning-from-scratch/backpropagation-by-hand": {
    title: "Chapter: Backpropagation by hand",
    readingTime: "70-85 min",
    premise:
      "Backpropagation is the chain rule organized over a computation graph. This chapter builds intuition for local derivatives, vector-Jacobian products, broadcasting, gradient checks, and update discipline.",
    parts: [
      {
        id: "chain-rule-graph",
        heading: "Backpropagation is bookkeeping for the chain rule",
        paragraphs: [
          "Every neural network forward pass can be seen as a computation graph. Inputs and parameters flow through operations such as matrix multiply, add, activation, loss, and reduction. Backpropagation walks that graph backward, multiplying local derivatives so each parameter receives responsibility for the final loss.",
          "The important idea is locality. An operation does not need to know the whole model. It needs its input values and the gradient arriving from its output. A ReLU node needs to know which inputs were positive. A matrix multiply node needs the left and right operands. By composing these local rules, the network computes gradients for millions or billions of parameters.",
          "Hand backprop is not about replacing autograd in production. It is about knowing what autograd is doing well enough to debug it. When loss does not fall, gradients are zero, shapes mismatch, or a custom layer behaves strangely, chain-rule literacy tells you where to inspect."
        ],
        keyTerms: [
          {
            term: "computation graph",
            definition:
              "A graph of operations and values that produced a result such as loss."
          },
          {
            term: "local derivative",
            definition:
              "The derivative of one operation's output with respect to its direct input."
          },
          {
            term: "upstream gradient",
            definition:
              "The gradient arriving at a node from later operations in the computation graph."
          }
        ],
        workedExample: {
          title: "Scalar chain rule",
          body:
            "For `y = (wx + b)^2`, the backward pass multiplies the local derivative of the square by derivatives of the affine score.",
          code:
            "x, w, b = 3.0, 2.0, -1.0\nz = w * x + b\ny = z ** 2\ndy_dz = 2 * z\ndy_dw = dy_dz * x\ndy_db = dy_dz * 1.0\nprint(y, dy_dw, dy_db)",
          language: "python"
        },
        checkYourself: [
          {
            prompt: "Why can each operation implement a local backward rule?",
            reveal:
              "The chain rule lets each node multiply the upstream gradient by its local derivative. Global gradients emerge from composing local responsibilities."
          }
        ],
        callout: {
          tone: "tip",
          body:
            "Cache forward values needed by backward rules. Recomputing or forgetting them is a common source of hand-backprop bugs."
        }
      },
      {
        id: "matrix-gradients",
        heading: "Matrix gradients mirror parameter shapes",
        paragraphs: [
          "For a linear layer, `Z = X @ W + b`. If `X` has shape `(batch, input_dim)` and `W` has `(input_dim, output_dim)`, then `Z` has `(batch, output_dim)`. During backprop, the gradient `dZ` has the same shape as `Z`. The weight gradient is `X.T @ dZ`, which produces `(input_dim, output_dim)`, exactly matching `W`.",
          "The input gradient is `dZ @ W.T`, matching `X`. The bias gradient sums `dZ` over the batch dimension because the same bias vector is broadcast to every row. If the loss averages over the batch, gradients should include the same averaging convention. Otherwise changing batch size changes gradient scale and learning-rate behavior.",
          "These shape facts are more reliable than memorized formulas. When deriving a layer, write the forward shapes and force each gradient to match the object it updates. If `dW` does not have the same shape as `W`, the algebra is wrong. If `db` has a batch dimension, you forgot to reduce over examples."
        ],
        keyTerms: [
          {
            term: "broadcasting",
            definition:
              "Automatic expansion of smaller arrays across compatible dimensions during vectorized operations."
          },
          {
            term: "parameter gradient",
            definition:
              "The derivative of loss with respect to a trainable parameter, matching that parameter's shape."
          },
          {
            term: "batch dimension",
            definition:
              "The axis indexing examples processed together in one vectorized pass."
          }
        ],
        workedExample: {
          title: "Linear layer backward shapes",
          body:
            "The printed shapes should match the forward objects: `dW` matches `W`, `db` matches `b`, and `dX` matches `X`.",
          code:
            "import numpy as np\n\nX = np.ones((5, 3))\nW = np.ones((3, 2))\nb = np.zeros(2)\ndZ = np.ones((5, 2)) / 5\n\ndW = X.T @ dZ\ndb = dZ.sum(axis=0)\ndX = dZ @ W.T\nprint(dW.shape, db.shape, dX.shape)",
          language: "python"
        },
        checkYourself: [
          {
            prompt: "Why does `db` sum over rows?",
            reveal:
              "One bias value is shared across all examples for each output unit, so each row contributes to that same bias parameter."
          }
        ],
        callout: {
          tone: "interview",
          body:
            "When explaining backprop, say gradients mirror the shapes of the values they update. It is a concise correctness check."
        }
      },
      {
        id: "activation-backward",
        heading: "Activation derivatives gate gradient flow",
        paragraphs: [
          "Activations decide how signals and gradients pass through layers. ReLU is simple: the forward output is zero for negative inputs and equal to input for positive inputs. Its backward rule passes the upstream gradient where the cached input was positive and blocks it where the input was negative. This creates sparse gradients and efficient computation.",
          "Sigmoid and tanh are smooth but can saturate. When their inputs are very positive or very negative, derivatives become small. Stacked many times, those small factors can shrink gradients until early layers learn slowly. This is one reason modern deep networks rely heavily on ReLU-like activations, normalization, residual paths, and careful initialization.",
          "Activation choice is not only a mathematical preference. It affects optimization speed, numerical stability, initialization, and dead-unit behavior. A ReLU unit can become inactive for all examples if its weights push scores negative; then its gradient may remain zero. Leaky ReLU and GELU variants soften that behavior, but the core lesson remains: nonlinearities are gradient gates as well as expressive tools."
        ],
        keyTerms: [
          {
            term: "vanishing gradient",
            definition:
              "A training problem where gradients become extremely small as they propagate backward through layers."
          },
          {
            term: "saturation",
            definition:
              "A regime where an activation's output changes little as input changes, yielding small derivatives."
          },
          {
            term: "dead ReLU",
            definition:
              "A ReLU unit that outputs zero for all relevant inputs and receives no gradient to recover."
          }
        ],
        workedExample: {
          title: "ReLU backward mask",
          body:
            "Only positions with positive forward pre-activation pass the upstream gradient.",
          code:
            "import numpy as np\n\nz = np.array([[-2.0, 0.5, 3.0]])\ndout = np.array([[10.0, 10.0, 10.0]])\ndz = dout * (z > 0)\nprint(np.maximum(0, z))\nprint(dz)",
          language: "python"
        },
        checkYourself: [
          {
            prompt: "Why can sigmoid networks learn slowly when inputs are large in magnitude?",
            reveal:
              "Sigmoid saturates near 0 or 1, where its derivative is small. Backprop multiplies by that small derivative, reducing gradient flow."
          }
        ],
        callout: {
          tone: "warning",
          body:
            "If many ReLU activations are exactly zero for all examples, inspect initialization, learning rate, and input scaling."
        }
      },
      {
        id: "loss-softmax",
        heading: "Softmax with cross-entropy has a clean gradient",
        paragraphs: [
          "For multiclass classification, the final layer often emits one logit per class. Softmax converts logits into probabilities by exponentiating each shifted logit and normalizing by the row sum. Subtracting the row maximum before exponentiation keeps the calculation stable without changing the probabilities.",
          "Cross-entropy compares the predicted probability assigned to the true class with the ideal distribution. When combined with softmax, the gradient with respect to logits is pleasantly simple: `(probabilities - one_hot_targets) / batch_size` for averaged loss. The true class receives a negative push if its probability is too low, and other classes receive positive pushes proportional to their probabilities.",
          "This simplicity is why many from-scratch implementations fuse softmax and cross-entropy in one function. It reduces numerical mistakes and avoids forming large Jacobian matrices. You still need to understand the shape contract: logits, probabilities, and gradient all have shape `(batch, num_classes)`."
        ],
        keyTerms: [
          {
            term: "softmax",
            definition:
              "A function that converts a vector of logits into nonnegative probabilities summing to one."
          },
          {
            term: "cross-entropy",
            definition:
              "A loss that penalizes low predicted probability on the correct class."
          },
          {
            term: "one-hot target",
            definition:
              "A vector with one at the correct class index and zero elsewhere."
          }
        ],
        workedExample: {
          title: "Softmax cross-entropy gradient",
          body:
            "After subtracting one from the true class probabilities and dividing by batch size, the gradient matches logits shape.",
          code:
            "import numpy as np\n\nlogits = np.array([[2.0, 1.0, 0.0], [0.5, 1.5, -1.0]])\ny = np.array([0, 2])\nshifted = logits - logits.max(axis=1, keepdims=True)\nprobs = np.exp(shifted) / np.exp(shifted).sum(axis=1, keepdims=True)\ndlogits = probs.copy()\ndlogits[np.arange(len(y)), y] -= 1\ndlogits /= len(y)\nprint(probs.round(3))\nprint(dlogits.round(3))",
          language: "python"
        },
        checkYourself: [
          {
            prompt: "Why subtract the row maximum before softmax?",
            reveal:
              "It prevents exponential overflow while preserving probabilities because adding or subtracting the same constant from all logits in a row does not change softmax."
          }
        ],
        callout: {
          tone: "tip",
          body:
            "For hand implementations, fuse softmax and cross-entropy rather than building the full softmax Jacobian."
        }
      },
      {
        id: "gradient-checking",
        heading: "Gradient checking catches algebra mistakes before training does",
        paragraphs: [
          "A gradient check compares analytical gradients from backprop with numerical gradients from finite differences. Perturb one parameter by a small epsilon, evaluate the loss, perturb it in the other direction, and estimate the slope. If the numerical slope and backprop slope disagree, the backward rule is wrong or the loss is nondeterministic.",
          "Gradient checks are slow because they require extra forward passes for many parameters, so they are used on tiny models and small batches. They are especially useful for custom layers, broadcasting-heavy code, regularization terms, and indexing operations. The check should run in double precision when possible, with randomness fixed and dropout disabled.",
          "Do not expect exact equality. Epsilon that is too large estimates a crude slope; epsilon that is too small suffers floating-point cancellation. Relative error is more informative than absolute error. Once gradients pass on a tiny problem, training curves become a meaningful debugging signal rather than a mixture of optimization behavior and algebra bugs."
        ],
        keyTerms: [
          {
            term: "finite difference",
            definition:
              "A numerical derivative estimate computed from loss changes after small parameter perturbations."
          },
          {
            term: "relative error",
            definition:
              "A scaled difference between two quantities, often used to compare numerical and analytical gradients."
          },
          {
            term: "determinism",
            definition:
              "The property that repeated runs with the same inputs and parameters produce the same outputs."
          }
        ],
        workedExample: {
          title: "One-parameter finite difference",
          body:
            "The finite-difference slope for `w` should match the analytical derivative of `(w*x + b)^2`.",
          code:
            "x, w, b = 4.0, 1.5, -2.0\neps = 1e-5\n\ndef loss(weight):\n    return (weight * x + b) ** 2\n\nnum = (loss(w + eps) - loss(w - eps)) / (2 * eps)\nana = 2 * (w * x + b) * x\nprint(round(num, 6), round(ana, 6))",
          language: "python"
        },
        checkYourself: [
          {
            prompt: "Why run gradient checks on tiny deterministic examples?",
            reveal:
              "Finite differences are expensive and noise-sensitive. Tiny deterministic cases isolate algebra mistakes without stochastic training behavior."
          }
        ],
        callout: {
          tone: "interview",
          body:
            "If asked how to debug a custom backward pass, answer: shape checks, finite-difference gradient checks, deterministic small batches, and then training curves."
        }
      }
    ],
    wrapUp: {
      takeaways: [
        "Backpropagation is the chain rule applied systematically over a computation graph.",
        "Linear-layer gradients have predictable shapes: `dW`, `db`, and `dX` mirror their forward objects.",
        "Activation derivatives control gradient flow and can saturate or zero out learning signals.",
        "Softmax plus cross-entropy gives a stable and simple logits gradient.",
        "Gradient checking validates custom backward rules before optimization behavior is interpreted."
      ],
      nextSteps: [
        "Write backward functions for affine, ReLU, and softmax-cross-entropy layers.",
        "Run a finite-difference check on one weight and one bias.",
        "Explain why batch averaging changes gradient scale."
      ]
    }
  },
  "deep-learning-from-scratch/cnn-building-blocks-numpy": {
    title: "Chapter: CNN building blocks with NumPy",
    readingTime: "70-85 min",
    premise:
      "Convolutional neural networks exploit locality, weight sharing, and spatial hierarchy. This chapter builds convolution, padding, stride, pooling, channels, and flattening from NumPy-level concepts.",
    parts: [
      {
        id: "why-convolution",
        heading: "Convolution uses local patterns and shared weights",
        paragraphs: [
          "Images and many signals have local structure. Nearby pixels form edges, corners, textures, and shapes. A fully connected layer ignores that structure by giving every input location separate weights. Convolution instead slides a small kernel across the input, applying the same weights at each location. This expresses the assumption that a useful local pattern can appear in many places.",
          "Weight sharing reduces parameters dramatically. A 3 by 3 filter over one channel has nine weights no matter how wide the image is. The same filter can detect a vertical edge on the left or right side. Multiple filters learn different patterns, and later layers combine earlier local features into more abstract ones.",
          "The output is a feature map. Each spatial location in the map reports how strongly the filter matched a local patch of the input. In a trained CNN, early filters often respond to simple edges or color contrasts, while deeper filters respond to compositions of earlier features. The architecture is useful because it builds hierarchy while preserving spatial layout."
        ],
        keyTerms: [
          {
            term: "kernel",
            definition:
              "A small set of weights slid over an input to compute local dot products."
          },
          {
            term: "weight sharing",
            definition:
              "Reusing the same kernel weights at multiple spatial locations."
          },
          {
            term: "feature map",
            definition:
              "The spatial output produced by applying a filter across an input."
          }
        ],
        workedExample: {
          title: "One 2D filter over a tiny image",
          body:
            "The output location is a dot product between a local image patch and the kernel.",
          code:
            "import numpy as np\n\nx = np.array([[1, 2, 0], [0, 1, 3], [2, 1, 0]], dtype=float)\nk = np.array([[1, 0], [0, -1]], dtype=float)\nout = np.zeros((2, 2))\nfor i in range(2):\n    for j in range(2):\n        patch = x[i:i+2, j:j+2]\n        out[i, j] = np.sum(patch * k)\nprint(out)",
          language: "python"
        },
        checkYourself: [
          {
            prompt: "Why does convolution use fewer parameters than a fully connected layer on images?",
            reveal:
              "A small kernel is reused at every spatial location, so parameter count depends on kernel size and channels rather than image width times height times outputs."
          }
        ],
        callout: {
          tone: "tip",
          body:
            "Think of a convolution output value as `how much this local patch matches this learned pattern`."
        }
      },
      {
        id: "padding-stride-shape",
        heading: "Padding and stride define output geometry",
        paragraphs: [
          "Padding adds border values, usually zeros, around the input. Without padding, a 3 by 3 kernel cannot be centered on edge pixels and the output shrinks. With one pixel of padding, a stride-one 3 by 3 convolution can preserve height and width. Padding is therefore both a shape choice and an information choice because border behavior is artificial.",
          "Stride controls how far the kernel moves between output locations. Stride one inspects every neighboring patch. Stride two skips positions and reduces spatial resolution. Larger strides reduce compute and memory but may discard detail. Downsampling is useful, but it should be deliberate because later layers cannot recover spatial information that was never computed.",
          "The common output-size formula for one dimension is `floor((input + 2*padding - kernel) / stride) + 1`. Memorizing the formula is less useful than understanding why it counts valid kernel placements. In NumPy labs, compute shapes by hand before writing loops. Most convolution bugs are off-by-one errors around padding, stride, and channel axes."
        ],
        keyTerms: [
          {
            term: "padding",
            definition:
              "Extra border values added around an input before convolution."
          },
          {
            term: "stride",
            definition:
              "The number of input positions the kernel moves between adjacent output locations."
          },
          {
            term: "downsampling",
            definition:
              "Reducing spatial resolution, often to lower compute or build larger receptive fields."
          }
        ],
        workedExample: {
          title: "Compute convolution output length",
          body:
            "The formula counts how many valid kernel starts fit after padding and stepping by stride.",
          code:
            "def conv_out(n, kernel, padding=0, stride=1):\n    return (n + 2 * padding - kernel) // stride + 1\n\nfor params in [(5, 3, 0, 1), (5, 3, 1, 1), (7, 3, 1, 2)]:\n    print(params, '->', conv_out(*params))",
          language: "python"
        },
        checkYourself: [
          {
            prompt: "Why does same-padding with a 3 by 3 stride-one convolution use padding one?",
            reveal:
              "Adding one border pixel on each side lets the 3 by 3 kernel produce one output for each original input position, preserving spatial size."
          }
        ],
        callout: {
          tone: "interview",
          body:
            "When deriving CNN shapes, state the formula and then explain it as valid kernel placements."
        }
      },
      {
        id: "channels-and-filters",
        heading: "Channels turn filters into small 3D tensors",
        paragraphs: [
          "Real CNN inputs have channels. An RGB image has height, width, and three color channels. A convolution filter spans all input channels for a local spatial patch. A 3 by 3 filter over RGB has shape `(3, 3, 3)` and produces one output map. If the layer has 32 filters, it produces 32 output channels.",
          "This channel mixing is what lets filters detect patterns across color or previous feature maps. In deeper layers, channels no longer mean red, green, and blue. They are learned feature responses. A filter can combine edge maps, texture maps, and shape hints from the previous layer into a new pattern at each location.",
          "Frameworks differ in axis order, commonly channels-last `(batch, height, width, channels)` or channels-first `(batch, channels, height, width)`. NumPy code should choose one order and stick to it. Many shape bugs come from treating a channel axis like a spatial axis or forgetting that each output channel has its own filter and bias."
        ],
        keyTerms: [
          {
            term: "input channel",
            definition:
              "A separate feature plane in the input, such as a color channel or previous layer feature map."
          },
          {
            term: "output channel",
            definition:
              "One feature map produced by one learned filter in a convolution layer."
          },
          {
            term: "channels-last",
            definition:
              "An array layout where the channel dimension follows height and width."
          }
        ],
        workedExample: {
          title: "Parameter count with channels",
          body:
            "Each output channel owns a full spatial-by-input-channel filter plus one bias.",
          code:
            "kernel_h, kernel_w = 3, 3\nin_channels = 3\nout_channels = 32\nweights = kernel_h * kernel_w * in_channels * out_channels\nbiases = out_channels\nprint(weights + biases)",
          language: "python"
        },
        checkYourself: [
          {
            prompt: "Why does one filter span all input channels?",
            reveal:
              "The filter computes one local pattern by combining information from every input channel at the same spatial neighborhood."
          }
        ],
        callout: {
          tone: "warning",
          body:
            "Always name your tensor layout in notes. Silent channels-first versus channels-last confusion can make correct-looking code wrong."
        }
      },
      {
        id: "pooling-and-receptive-fields",
        heading: "Pooling and depth grow receptive fields",
        paragraphs: [
          "Pooling summarizes local neighborhoods, commonly by maximum or average. Max pooling keeps the strongest activation in a window, giving small translation tolerance and reducing spatial resolution. Average pooling keeps a smoother summary. Pooling has no learned weights, but it changes geometry and information flow.",
          "A receptive field is the region of the original input that can affect a later activation. Stacking convolutions grows receptive fields because each layer reads neighborhoods of the previous layer. Downsampling through stride or pooling grows the effective view faster. This is how CNNs progress from local edges to larger shapes without connecting every pixel to every output immediately.",
          "Pooling is not mandatory in modern CNNs; strided convolutions and global average pooling are common alternatives. The design choice depends on compute, invariance, and task. Classification often benefits from gradually discarding exact location, while segmentation and detection need more spatial precision. A CNN block should match the output task, not just copy an old architecture."
        ],
        keyTerms: [
          {
            term: "max pooling",
            definition:
              "A downsampling operation that keeps the maximum value in each local window."
          },
          {
            term: "receptive field",
            definition:
              "The region of the input that can influence a particular activation."
          },
          {
            term: "global average pooling",
            definition:
              "A layer that averages each channel over all spatial locations before prediction."
          }
        ],
        workedExample: {
          title: "Tiny max pool",
          body:
            "Each 2 by 2 window contributes its largest value to the downsampled output.",
          code:
            "import numpy as np\n\nx = np.array([[1, 4, 2, 0], [3, 2, 5, 1], [0, 1, 2, 3], [6, 1, 0, 2]])\nout = np.zeros((2, 2), dtype=int)\nfor i in range(2):\n    for j in range(2):\n        out[i, j] = x[2*i:2*i+2, 2*j:2*j+2].max()\nprint(out)",
          language: "python"
        },
        checkYourself: [
          {
            prompt: "Why might segmentation use less aggressive downsampling than classification?",
            reveal:
              "Segmentation needs spatially precise output for each region or pixel, while classification can often discard exact location after enough features are extracted."
          }
        ],
        callout: {
          tone: "tip",
          body:
            "Receptive field explains why deep CNN layers can reason about larger objects even though each convolution is local."
        }
      },
      {
        id: "flattening-and-classification",
        heading: "CNN blocks become predictions through heads",
        paragraphs: [
          "After convolutional blocks extract spatial features, a prediction head converts those features into task outputs. The older pattern flattens all feature maps and feeds dense layers. This works but can create many parameters if spatial dimensions remain large. Global average pooling reduces each channel to one number, often producing smaller and more regularized classifiers.",
          "For classification, the final layer emits one logit per class and trains with softmax cross-entropy. For binary tasks, it may emit one logit with sigmoid loss. For detection or segmentation, the head is more specialized because outputs need boxes, masks, or per-pixel classes. The convolutional backbone supplies features; the head defines the task.",
          "From-scratch labs should keep the first implementation tiny. Use one image, one channel, one or two filters, explicit loops, and printed shapes. Then vectorize with `im2col` or batched operations only after the simple version is correct. The point is to own the mechanics before hiding them behind optimized kernels."
        ],
        keyTerms: [
          {
            term: "backbone",
            definition:
              "The feature-extraction portion of a neural network before task-specific heads."
          },
          {
            term: "classification head",
            definition:
              "Layers that convert learned features into class logits or probabilities."
          },
          {
            term: "flatten",
            definition:
              "Reshaping spatial feature maps into one vector per example for dense layers."
          }
        ],
        workedExample: {
          title: "Flatten feature maps for a dense head",
          body:
            "The batch dimension stays first; all spatial and channel dimensions become one feature dimension.",
          code:
            "import numpy as np\n\nfeatures = np.zeros((4, 6, 6, 8))  # batch, height, width, channels\nflat = features.reshape(features.shape[0], -1)\nW = np.zeros((flat.shape[1], 10))\nlogits = flat @ W\nprint(flat.shape, logits.shape)",
          language: "python"
        },
        checkYourself: [
          {
            prompt: "Why can flattening too early create many parameters?",
            reveal:
              "Flattening preserves every spatial location as a separate dense input, so parameter count grows with height times width times channels times output units."
          }
        ],
        callout: {
          tone: "interview",
          body:
            "Describe a CNN as local filters plus weight sharing, stacked to grow receptive fields, followed by a task-specific head."
        }
      }
    ],
    wrapUp: {
      takeaways: [
        "Convolution applies shared local filters to exploit spatial structure.",
        "Padding, stride, and kernel size determine output geometry.",
        "Filters span input channels and produce output channels.",
        "Pooling and depth trade spatial precision for larger receptive fields and lower compute.",
        "Prediction heads convert convolutional features into task-specific outputs."
      ],
      nextSteps: [
        "Implement one-channel convolution with explicit loops and verify output shape by hand.",
        "Compare parameter counts for flattening versus global average pooling.",
        "Explain how a 3 by 3 kernel in deep layers can still support object-level recognition."
      ]
    }
  }
};

/** @type {Record<string, import('../learnChapters.js').LessonLearnChapter>} */
export const deepLearningFromScratchChapters = JSON.parse(JSON.stringify(chapters));
