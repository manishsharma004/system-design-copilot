/** @type {Record<string, import('../learnChapters.js').LessonLearnChapter>} */
export const deepLearningFromScratchChapters = {
  "deep-learning-from-scratch/perceptron-and-mlp-numpy": {
    "title": "Chapter: Perceptron and MLP with NumPy",
    "readingTime": "60-75 min",
    "premise": "Build a perceptron for linearly separable data, then train a two-layer MLP that can learn XOR. This Learn chapter expands the short lesson summary into a full study unit you can read continuously, with interactive checks and selection-based AI search when a phrase needs a second opinion.",
    "parts": [
      {
        "id": "orientation",
        "heading": "Why this chapter exists",
        "paragraphs": [
          "From-scratch neural nets make model behavior less mysterious. You see exactly where activations, loss, gradients, and updates enter the training loop.",
          "This chapter treats \"Perceptron and MLP with NumPy\" as a readable study unit: intuition first, then the mechanics you must be able to explain, then the failure modes that show up in interviews and production, and finally how to talk about the topic under time pressure.",
          "Read it like a book chapter. When a phrase is unclear, select it inside the Learn reader and use Search with AI to open Google, Perplexity, or DuckDuckGo without abandoning the chapter."
        ],
        "callout": {
          "tone": "tip",
          "body": "Target reading time is paced for depth, not skimming. Pause at each Check yourself prompt and answer out loud before revealing the guide answer."
        }
      },
      {
        "id": "a-perceptron-is-a-linear-decision-rule",
        "heading": "A perceptron is a linear decision rule",
        "paragraphs": [
          "A perceptron computes z = w1*x1 + w2*x2 + b and applies a step function. If z >= 0, it predicts 1; otherwise it predicts 0. The weights set the boundary direction and the bias shifts it. For the AND gate, weights [1, 1] and bias -1.5 work: input [1, 1] gives z = 1 + 1 - 1.5 = 0.5, so the prediction is 1. Input [1, 0] gives z = 1 + 0 - 1.5 = -0.5, so the prediction is 0. Geometrically, the boundary is the line x1 + x2 - 1.5 = 0. Points on one side are positive. That is powerful for linearly separable tasks and impossible for patterns that need curved or disconnected regions.",
          "Hold these points explicitly while you study. Restate each one without looking at the list — recognition is not the interview bar; recall is.",
          "• Weights define the orientation of the separating line or hyperplane.",
          "• Bias shifts the boundary without changing its orientation.",
          "• A hard step activation gives binary predictions but no smooth gradient.",
          "Production lens — Linear boundary limit: A perceptron computes y = step(w dot x + b), so its decision boundary is a hyperplane. In two dimensions, that boundary is a line. It can separate points where one class lies mostly above the line and the other below, but it cannot solve XOR because XOR needs two separated positive regions. This limitation is not a training failure; it is representational. No single linear boundary can assign (0,1) and (1,0) positive while assigning (0,0) and (1,1) negative.\n\nAn MLP adds hidden units that transform the input before the final linear decision. One hidden unit can represent a half-space; multiple units can combine half-spaces into more complex regions. Nonlinear activation is essential. If layer1 is xW1 and layer2 is hW2 with no nonlinearity, the composition is x(W1W2), still one linear map. ReLU, sigmoid, or tanh makes the network a learned feature composer rather than a deeper linear model."
        ],
        "keyTerms": [
          {
            "term": "Weights define the orientation of the",
            "definition": "Weights define the orientation of the separating line or hyperplane."
          },
          {
            "term": "Bias shifts the boundary without changing",
            "definition": "Bias shifts the boundary without changing its orientation."
          },
          {
            "term": "A hard step activation gives binary",
            "definition": "A hard step activation gives binary predictions but no smooth gradient."
          }
        ],
        "workedExample": {
          "title": "Predict AND with a hand-coded perceptron",
          "body": "Narrate what each shape and step is doing. If you only recognize the API call, you do not own the idea yet — rewrite the example from memory after one pass.",
          "code": "import numpy as np\n\ndef predict(X, weights, bias):\n    return (X @ weights + bias >= 0).astype(int)\n\nX = np.array([[0, 0], [0, 1], [1, 0], [1, 1]], dtype=float)\nweights = np.array([1.0, 1.0])\nbias = -1.5\nprint(\"scores:\", (X @ weights + bias).round(2))\nprint(\"predictions:\", predict(X, weights, bias))",
          "language": "python"
        },
        "checkYourself": [
          {
            "prompt": "Can implement a perceptron prediction and update rule.",
            "reveal": "A perceptron computes y = step(w dot x + b), so its decision boundary is a hyperplane. In two dimensions, that boundary is a line. It can separate points where one class lies mostly above the line and the other below, but it cannot solve XOR because XOR needs two separated positive regions. This limitation is not a training failure; it is representational. No single linear boundary can assign (0,1) and (1,0) positive while assigning (0,0) and (1,1) negative.\n\nAn MLP adds hidden units that transform the input before the final linear decision. One hidden unit can represent a half-space; multiple units can combine half-spaces into more complex regions. Nonlinear activation is essential. If layer1 is xW1 and layer2 is hW2 with no nonlinearity, the composition is x(W1W2), still one linear map. ReLU, sigmoid, or tanh makes the network a learned feature composer rather than a deeper linear model."
          }
        ]
      },
      {
        "id": "the-perceptron-update-is-targeted-correction",
        "heading": "The perceptron update is targeted correction",
        "paragraphs": [
          "The training rule updates only when the prediction is wrong. For one example, error = target - prediction. Then w = w + learning_rate * error * x and b = b + learning_rate * error. Suppose weights start [0, 0], bias 0, learning rate 0.2, and the example is x=[1, 1], target=1. The score is 0, the step predicts 1, error is 0, and nothing changes. If the example is x=[0, 0], target=0, the score is 0, prediction is 1, error is -1, weights stay [0, 0] because x is zero, and bias becomes -0.2. That bias shift makes the all-zero case less likely to fire next time. Over many passes, mistakes push the boundary until separable data is classified correctly.",
          "Hold these points explicitly while you study. Restate each one without looking at the list — recognition is not the interview bar; recall is.",
          "• The sign of the error decides whether the boundary moves toward or away from the example.",
          "• The learning rate controls how large each correction is.",
          "• For separable data, the perceptron convergence theorem says a solution will eventually be found.",
          "Production lens — Shape calculus: From-scratch NumPy networks are mostly shape discipline. If X has shape (batch, input_dim), W1 has (input_dim, hidden_dim), and b1 has (hidden_dim,), then Z1 = X @ W1 + b1 has (batch, hidden_dim). A2 for classification might be (batch, num_classes). Gradients mirror parameters: dW1 has the same shape as W1, db1 has the same shape as b1, and dX has the same shape as X. Shape mismatches reveal algebra mistakes faster than staring at loss curves.\n\nBatching affects scale. If loss is averaged over batch size m, gradients should usually be divided by m so learning rate behavior does not change when batch size changes. Bias gradients sum over rows, not columns, because one bias value is shared across the batch for each hidden unit. Broadcasting can hide mistakes: adding b with shape (batch, 1) instead of (hidden_dim,) may run but mean the wrong thing. Write expected shapes beside equations while implementing."
        ],
        "keyTerms": [
          {
            "term": "The sign of the error decides",
            "definition": "The sign of the error decides whether the boundary moves toward or away from the example."
          },
          {
            "term": "The learning rate controls how large",
            "definition": "The learning rate controls how large each correction is."
          },
          {
            "term": "For separable data, the perceptron convergence",
            "definition": "For separable data, the perceptron convergence theorem says a solution will eventually be found."
          }
        ],
        "workedExample": {
          "title": "Train a perceptron on AND",
          "body": "Narrate what each shape and step is doing. If you only recognize the API call, you do not own the idea yet — rewrite the example from memory after one pass.",
          "code": "import numpy as np\n\nX = np.array([[0, 0], [0, 1], [1, 0], [1, 1]], dtype=float)\ny = np.array([0, 0, 0, 1])\nweights = np.zeros(2)\nbias = 0.0\nlr = 0.2\n\ndef step(z):\n    return 1 if z >= 0 else 0\n\nfor epoch in range(12):\n    mistakes = 0\n    for x, target in zip(X, y):\n        pred = step(x @ weights + bias)\n        error = target - pred\n        mistakes += int(error != 0)\n        weights += lr * error * x\n        bias += lr * error\n    if epoch in [0, 1, 11]:\n        print(epoch, \"weights\", weights.round(2), \"bias\", round(bias, 2), \"mistakes\", mistakes)\n\nprint(\"final predictions:\", np.array([step(x @ weights + bias) for x in X]))",
          "language": "python"
        },
        "checkYourself": [
          {
            "prompt": "Can explain why XOR needs a hidden layer.",
            "reveal": "From-scratch NumPy networks are mostly shape discipline. If X has shape (batch, input_dim), W1 has (input_dim, hidden_dim), and b1 has (hidden_dim,), then Z1 = X @ W1 + b1 has (batch, hidden_dim). A2 for classification might be (batch, num_classes). Gradients mirror parameters: dW1 has the same shape as W1, db1 has the same shape as b1, and dX has the same shape as X. Shape mismatches reveal algebra mistakes faster than staring at loss curves.\n\nBatching affects scale. If loss is averaged over batch size m, gradients should usually be divided by m so learning rate behavior does not change when batch size changes. Bias gradients sum over rows, not columns, because one bias value is shared across the batch for each hidden unit. Broadcasting can hide mistakes: adding b with shape (batch, 1) instead of (hidden_dim,) may run but mean the wrong thing. Write expected shapes beside equations while implementing."
          }
        ]
      },
      {
        "id": "xor-proves-why-one-linear-boundary-is-not-enough",
        "heading": "XOR proves why one linear boundary is not enough",
        "paragraphs": [
          "XOR outputs 1 for [0, 1] and [1, 0], but 0 for [0, 0] and [1, 1]. Try drawing one straight line that puts the two diagonal positive corners on one side and the two diagonal negative corners on the other. It cannot be done. Algebra shows the conflict. To classify [1, 0] positive, w1 + b >= 0. To classify [0, 1] positive, w2 + b >= 0. To classify [0, 0] negative, b < 0. Adding the first two inequalities gives w1 + w2 + 2b >= 0. But [1, 1] must be negative, so w1 + w2 + b < 0. Since b < 0, these inequalities fight each other. A hidden layer solves this by creating intermediate features such as \"x1 OR x2\" and \"x1 AND x2\", then combining them nonlinearly.",
          "Hold these points explicitly while you study. Restate each one without looking at the list — recognition is not the interview bar; recall is.",
          "• A single perceptron can solve AND and OR but not XOR.",
          "• Hidden units create learned features before the final decision.",
          "• Nonlinear activations are what make stacked layers more expressive than one linear model.",
          "Production lens — Initialization signal flow: Initialization controls whether signals survive depth before learning starts. If weights are too small, activations and gradients shrink toward zero layer by layer. If weights are too large, activations explode or saturate nonlinearities. Xavier initialization scales variance around 1 / fan_in or 2 / (fan_in + fan_out) for tanh-like activations. He initialization uses roughly 2 / fan_in for ReLU because about half the activations are zeroed. The goal is stable activation variance through forward and backward passes.\n\nA simple check is to pass random data through the network and inspect activation means and standard deviations per layer. If layer 1 has std 1.0 and layer 5 has std 0.001, gradients will struggle. If layer 5 has std 200, optimization may explode. Initialization does not replace learning rate tuning, normalization, or residual connections, but it sets the starting numerical regime. Deep learning is optimization under floating-point constraints, not just drawing a graph of neurons."
        ],
        "keyTerms": [
          {
            "term": "A single perceptron can solve AND",
            "definition": "A single perceptron can solve AND and OR but not XOR."
          },
          {
            "term": "Hidden units create learned features before",
            "definition": "Hidden units create learned features before the final decision."
          },
          {
            "term": "Nonlinear activations are what make stacked",
            "definition": "Nonlinear activations are what make stacked layers more expressive than one linear model."
          }
        ],
        "checkYourself": [
          {
            "prompt": "Can trace MLP matrix shapes through a forward pass.",
            "reveal": "Initialization controls whether signals survive depth before learning starts. If weights are too small, activations and gradients shrink toward zero layer by layer. If weights are too large, activations explode or saturate nonlinearities. Xavier initialization scales variance around 1 / fan_in or 2 / (fan_in + fan_out) for tanh-like activations. He initialization uses roughly 2 / fan_in for ReLU because about half the activations are zeroed. The goal is stable activation variance through forward and backward passes.\n\nA simple check is to pass random data through the network and inspect activation means and standard deviations per layer. If layer 1 has std 1.0 and layer 5 has std 0.001, gradients will struggle. If layer 5 has std 200, optimization may explode. Initialization does not replace learning rate tuning, normalization, or residual connections, but it sets the starting numerical regime. Deep learning is optimization under floating-point constraints, not just drawing a graph of neurons."
          }
        ]
      },
      {
        "id": "an-mlp-composes-affine-maps-and-activations",
        "heading": "An MLP composes affine maps and activations",
        "paragraphs": [
          "A two-layer MLP computes hidden = activation(X @ W1 + b1), then output = activation(hidden @ W2 + b2). Shapes are the first debugging tool. If X has shape (4, 2) for four XOR rows and two inputs, W1 can be (2, 4), making hidden shape (4, 4). W2 can be (4, 1), making output shape (4, 1). A tiny numeric forward pass: if x=[1, 0], one hidden unit has weights [3, -2] and bias -1, its pre-activation is 3*1 + -2*0 - 1 = 2. A sigmoid turns 2 into 0.881, so this hidden unit is strongly active for x1=1. Other hidden units can specialize in other regions, and the output layer combines them.",
          "Hold these points explicitly while you study. Restate each one without looking at the list — recognition is not the interview bar; recall is.",
          "• Affine maps choose directions; activations bend the decision surface.",
          "• Random initialization breaks symmetry so hidden units can learn different features.",
          "• Shape checks catch many bugs before you inspect the math.",
          "Production lens — Softmax loss gradient: For multiclass classification, logits are raw scores with shape (batch, classes). Softmax converts logits to probabilities by exponentiating and normalizing, but implementation should subtract the row maximum first to avoid overflow. Cross-entropy loss for the correct class is negative log probability. The elegant result is that gradient with respect to logits is probabilities minus one-hot labels, divided by batch size when the loss is averaged.\n\nThis result simplifies backprop. If a sample has predicted probabilities [0.7, 0.2, 0.1] and true class 1, the gradient is [0.7, -0.8, 0.1]. The model is pushed to lower class 0, raise class 1, and slightly lower class 2. Large confident mistakes produce large gradients; correct confident predictions produce small gradients. Numerical stability matters: compute log-softmax or use shifted logits rather than taking log of values that may underflow to zero."
        ],
        "keyTerms": [
          {
            "term": "Affine maps choose directions; activations bend",
            "definition": "Affine maps choose directions; activations bend the decision surface."
          },
          {
            "term": "Random initialization breaks symmetry so hidden",
            "definition": "Random initialization breaks symmetry so hidden units can learn different features."
          },
          {
            "term": "Shape checks catch many bugs before",
            "definition": "Shape checks catch many bugs before you inspect the math."
          }
        ],
        "workedExample": {
          "title": "Run an XOR MLP forward pass",
          "body": "Narrate what each shape and step is doing. If you only recognize the API call, you do not own the idea yet — rewrite the example from memory after one pass.",
          "code": "import numpy as np\n\ndef sigmoid(z):\n    return 1 / (1 + np.exp(-z))\n\nX = np.array([[0, 0], [0, 1], [1, 0], [1, 1]], dtype=float)\nW1 = np.array([[4.0, -4.0], [4.0, -4.0]])\nb1 = np.array([[-2.0, 6.0]])\nW2 = np.array([[5.0], [5.0]])\nb2 = np.array([[-7.0]])\n\nhidden = sigmoid(X @ W1 + b1)\nout = sigmoid(hidden @ W2 + b2)\nprint(\"hidden activations:\\n\", hidden.round(3))\nprint(\"output probabilities:\", out.round(3).ravel())",
          "language": "python"
        },
        "checkYourself": [
          {
            "prompt": "Can write a tiny NumPy MLP training loop with sigmoid activations.",
            "reveal": "For multiclass classification, logits are raw scores with shape (batch, classes). Softmax converts logits to probabilities by exponentiating and normalizing, but implementation should subtract the row maximum first to avoid overflow. Cross-entropy loss for the correct class is negative log probability. The elegant result is that gradient with respect to logits is probabilities minus one-hot labels, divided by batch size when the loss is averaged.\n\nThis result simplifies backprop. If a sample has predicted probabilities [0.7, 0.2, 0.1] and true class 1, the gradient is [0.7, -0.8, 0.1]. The model is pushed to lower class 0, raise class 1, and slightly lower class 2. Large confident mistakes produce large gradients; correct confident predictions produce small gradients. Numerical stability matters: compute log-softmax or use shifted logits rather than taking log of values that may underflow to zero."
          }
        ]
      },
      {
        "id": "training-repeats-forward-loss-backward-update",
        "heading": "Training repeats forward, loss, backward, update",
        "paragraphs": [
          "A neural-network training loop is not magic. The forward pass makes predictions. The loss measures how wrong they are. Backpropagation computes how each parameter contributed to the loss. The optimizer updates parameters in the opposite direction of the gradient. For binary cross-entropy with sigmoid output, the final pre-activation gradient simplifies to output - target. If the target is 1 and the model outputs 0.2, the gradient is -0.8, so gradient descent increases the score. If the target is 0 and the model outputs 0.9, the gradient is +0.9, so gradient descent decreases the score. The learning rate controls whether those corrections are steady, too slow, or explosive.",
          "Hold these points explicitly while you study. Restate each one without looking at the list — recognition is not the interview bar; recall is.",
          "• Track loss over epochs before trusting final predictions.",
          "• Initialize weights randomly; all-zero hidden weights keep units identical.",
          "• Use small deterministic datasets like XOR to debug the loop before scaling.",
          "Production lens — Linear boundary limit: A perceptron computes y = step(w dot x + b), so its decision boundary is a hyperplane. In two dimensions, that boundary is a line. It can separate points where one class lies mostly above the line and the other below, but it cannot solve XOR because XOR needs two separated positive regions. This limitation is not a training failure; it is representational. No single linear boundary can assign (0,1) and (1,0) positive while assigning (0,0) and (1,1) negative.\n\nAn MLP adds hidden units that transform the input before the final linear decision. One hidden unit can represent a half-space; multiple units can combine half-spaces into more complex regions. Nonlinear activation is essential. If layer1 is xW1 and layer2 is hW2 with no nonlinearity, the composition is x(W1W2), still one linear map. ReLU, sigmoid, or tanh makes the network a learned feature composer rather than a deeper linear model."
        ],
        "keyTerms": [
          {
            "term": "Track loss over epochs before trusting",
            "definition": "Track loss over epochs before trusting final predictions."
          },
          {
            "term": "Initialize weights randomly; all-zero hidden …",
            "definition": "Initialize weights randomly; all-zero hidden weights keep units identical."
          },
          {
            "term": "Use small deterministic datasets like XOR",
            "definition": "Use small deterministic datasets like XOR to debug the loop before scaling."
          }
        ],
        "workedExample": {
          "title": "Train a sigmoid MLP on XOR",
          "body": "Narrate what each shape and step is doing. If you only recognize the API call, you do not own the idea yet — rewrite the example from memory after one pass.",
          "code": "import numpy as np\n\nrng = np.random.default_rng(3)\nX = np.array([[0, 0], [0, 1], [1, 0], [1, 1]], dtype=float)\ny = np.array([[0], [1], [1], [0]], dtype=float)\nW1 = rng.normal(0, 1.0, size=(2, 4))\nb1 = np.zeros((1, 4))\nW2 = rng.normal(0, 1.0, size=(4, 1))\nb2 = np.zeros((1, 1))\nlr = 1.0\n\ndef sigmoid(z):\n    return 1 / (1 + np.exp(-z))\n\nfor epoch in range(5000):\n    h = sigmoid(X @ W1 + b1)\n    out = sigmoid(h @ W2 + b2)\n    dz2 = out - y\n    dW2 = h.T @ dz2 / len(X)\n    db2 = dz2.mean(axis=0, keepdims=True)\n    dz1 = (dz2 @ W2.T) * h * (1 - h)\n    dW1 = X.T @ dz1 / len(X)\n    db1 = dz1.mean(axis=0, keepdims=True)\n    W2 -= lr * dW2; b2 -= lr * db2\n    W1 -= lr * dW1; b1 -= lr * db1\n\nout = sigmoid(sigmoid(X @ W1 + b1) @ W2 + b2)\nprint(\"probabilities:\", out.round(3).ravel())\nprint(\"predictions:\", (out >= 0.5).astype(int).ravel())",
          "language": "python"
        },
        "checkYourself": [
          {
            "prompt": "Can debug stalled, exploding, or overfitting neural-network training.",
            "reveal": "Explain the idea in two sentences, name one metric or invariant you would watch, and state one mistake juniors make. Then connect it back to training repeats forward, loss, backward, update."
          }
        ]
      },
      {
        "id": "evaluation-and-failure-modes-start-with-tiny-signals",
        "heading": "Evaluation and failure modes start with tiny signals",
        "paragraphs": [
          "From-scratch networks fail in recognizable ways. If loss does not move at all, check that gradients are nonzero, parameters update, and activation derivatives are connected to the right cached values. If loss becomes NaN, the learning rate may be too high or exponentials may overflow. If every hidden unit has the same activation, initialization may be symmetric. If training accuracy is perfect and validation is poor, the network has too much capacity for the data or the split is leaking. Evaluation for a tiny MLP still follows supervised-learning rules: hold out data when possible, inspect train and validation curves, compare to a simpler baseline, and make sure the metric matches the task.",
          "Hold these points explicitly while you study. Restate each one without looking at the list — recognition is not the interview bar; recall is.",
          "• Print loss, gradient norms, and prediction ranges while debugging.",
          "• Reduce learning rate when updates overshoot or loss becomes NaN.",
          "• Compare against linear baselines to verify that the neural net earns its complexity.",
          "Production lens — Shape calculus: From-scratch NumPy networks are mostly shape discipline. If X has shape (batch, input_dim), W1 has (input_dim, hidden_dim), and b1 has (hidden_dim,), then Z1 = X @ W1 + b1 has (batch, hidden_dim). A2 for classification might be (batch, num_classes). Gradients mirror parameters: dW1 has the same shape as W1, db1 has the same shape as b1, and dX has the same shape as X. Shape mismatches reveal algebra mistakes faster than staring at loss curves.\n\nBatching affects scale. If loss is averaged over batch size m, gradients should usually be divided by m so learning rate behavior does not change when batch size changes. Bias gradients sum over rows, not columns, because one bias value is shared across the batch for each hidden unit. Broadcasting can hide mistakes: adding b with shape (batch, 1) instead of (hidden_dim,) may run but mean the wrong thing. Write expected shapes beside equations while implementing."
        ],
        "keyTerms": [
          {
            "term": "Print loss, gradient norms, and prediction",
            "definition": "Print loss, gradient norms, and prediction ranges while debugging."
          },
          {
            "term": "Reduce learning rate when updates overshoot",
            "definition": "Reduce learning rate when updates overshoot or loss becomes NaN."
          },
          {
            "term": "Compare against linear baselines to verify",
            "definition": "Compare against linear baselines to verify that the neural net earns its complexity."
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
          "Most interview answers fail not because the definition is wrong, but because the candidate never names how the approach breaks. Use this section as a trap checklist for perceptron and mlp with numpy.",
          "Trap: Expecting a perceptron to solve non-linearly separable data. A strong answer preempts it — say what you would monitor, what fallback you would keep, or what simpler baseline you would try first.",
          "Trap: Initializing all neural-network weights to zero. A strong answer preempts it — say what you would monitor, what fallback you would keep, or what simpler baseline you would try first.",
          "Trap: Changing learning rate without checking the loss curve. A strong answer preempts it — say what you would monitor, what fallback you would keep, or what simpler baseline you would try first.",
          "Trap: Mixing up matrix shapes and silently relying on unintended broadcasting. A strong answer preempts it — say what you would monitor, what fallback you would keep, or what simpler baseline you would try first.",
          "Trap: Judging a neural network without comparing a simpler baseline. A strong answer preempts it — say what you would monitor, what fallback you would keep, or what simpler baseline you would try first."
        ],
        "callout": {
          "tone": "warning",
          "body": "If you cannot name a failure mode, you do not yet understand the technique well enough to ship or defend it."
        },
        "checkYourself": [
          {
            "prompt": "Pick the most dangerous pitfall for Perceptron and MLP with NumPy and explain how you would detect it in production or on a whiteboard.",
            "reveal": "Start with: \"Expecting a perceptron to solve non-linearly separable data.\" Then add a detection signal (metric, test, or review question) and a mitigation."
          }
        ]
      },
      {
        "id": "deeper-lens",
        "heading": "A deeper production lens",
        "paragraphs": [
          "Linear boundary limit. A perceptron computes y = step(w dot x + b), so its decision boundary is a hyperplane. In two dimensions, that boundary is a line. It can separate points where one class lies mostly above the line and the other below, but it cannot solve XOR because XOR needs two separated positive regions. This limitation is not a training failure; it is representational. No single linear boundary can assign (0,1) and (1,0) positive while assigning (0,0) and (1,1) negative.\n\nAn MLP adds hidden units that transform the input before the final linear decision. One hidden unit can represent a half-space; multiple units can combine half-spaces into more complex regions. Nonlinear activation is essential. If layer1 is xW1 and layer2 is hW2 with no nonlinearity, the composition is x(W1W2), still one linear map. ReLU, sigmoid, or tanh makes the network a learned feature composer rather than a deeper linear model.",
          "Shape calculus. From-scratch NumPy networks are mostly shape discipline. If X has shape (batch, input_dim), W1 has (input_dim, hidden_dim), and b1 has (hidden_dim,), then Z1 = X @ W1 + b1 has (batch, hidden_dim). A2 for classification might be (batch, num_classes). Gradients mirror parameters: dW1 has the same shape as W1, db1 has the same shape as b1, and dX has the same shape as X. Shape mismatches reveal algebra mistakes faster than staring at loss curves.\n\nBatching affects scale. If loss is averaged over batch size m, gradients should usually be divided by m so learning rate behavior does not change when batch size changes. Bias gradients sum over rows, not columns, because one bias value is shared across the batch for each hidden unit. Broadcasting can hide mistakes: adding b with shape (batch, 1) instead of (hidden_dim,) may run but mean the wrong thing. Write expected shapes beside equations while implementing.",
          "Initialization signal flow. Initialization controls whether signals survive depth before learning starts. If weights are too small, activations and gradients shrink toward zero layer by layer. If weights are too large, activations explode or saturate nonlinearities. Xavier initialization scales variance around 1 / fan_in or 2 / (fan_in + fan_out) for tanh-like activations. He initialization uses roughly 2 / fan_in for ReLU because about half the activations are zeroed. The goal is stable activation variance through forward and backward passes.\n\nA simple check is to pass random data through the network and inspect activation means and standard deviations per layer. If layer 1 has std 1.0 and layer 5 has std 0.001, gradients will struggle. If layer 5 has std 200, optimization may explode. Initialization does not replace learning rate tuning, normalization, or residual connections, but it sets the starting numerical regime. Deep learning is optimization under floating-point constraints, not just drawing a graph of neurons.",
          "Softmax loss gradient. For multiclass classification, logits are raw scores with shape (batch, classes). Softmax converts logits to probabilities by exponentiating and normalizing, but implementation should subtract the row maximum first to avoid overflow. Cross-entropy loss for the correct class is negative log probability. The elegant result is that gradient with respect to logits is probabilities minus one-hot labels, divided by batch size when the loss is averaged.\n\nThis result simplifies backprop. If a sample has predicted probabilities [0.7, 0.2, 0.1] and true class 1, the gradient is [0.7, -0.8, 0.1]. The model is pushed to lower class 0, raise class 1, and slightly lower class 2. Large confident mistakes produce large gradients; correct confident predictions produce small gradients. Numerical stability matters: compute log-softmax or use shifted logits rather than taking log of values that may underflow to zero."
        ],
        "keyTerms": [
          {
            "term": "Linear boundary limit",
            "definition": "A perceptron computes y = step(w dot x + b), so its decision boundary is a hyperplane. In two dimensions, that boundary is a line. It can separate points where one class lies mostly above the line and the other below, bu…"
          },
          {
            "term": "Shape calculus",
            "definition": "From-scratch NumPy networks are mostly shape discipline. If X has shape (batch, input_dim), W1 has (input_dim, hidden_dim), and b1 has (hidden_dim,), then Z1 = X @ W1 + b1 has (batch, hidden_dim). A2 for classification m…"
          },
          {
            "term": "Initialization signal flow",
            "definition": "Initialization controls whether signals survive depth before learning starts. If weights are too small, activations and gradients shrink toward zero layer by layer. If weights are too large, activations explode or satura…"
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
          "You should now be able to teach perceptron and mlp with numpy as a story: what problem it solves, how the mechanism works, which assumptions it depends on, and how you would know it failed.",
          "Close the loop by writing a 90-second spoken answer out loud. If you freeze on definitions, return to the orientation and the first technical part. If you freeze on trade-offs, return to failure modes.",
          "Practice prompts from this lesson: Why can a perceptron learn AND but not XOR? | What role does a hidden layer play geometrically? | How would you debug a tiny network whose loss never changes?"
        ],
        "checkYourself": [
          {
            "prompt": "Give a 90-second spoken overview of Perceptron and MLP with NumPy as if starting an interview answer.",
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
        "Can implement a perceptron prediction and update rule.",
        "Can explain why XOR needs a hidden layer.",
        "Can trace MLP matrix shapes through a forward pass.",
        "Can write a tiny NumPy MLP training loop with sigmoid activations.",
        "Can debug stalled, exploding, or overfitting neural-network training."
      ],
      "nextSteps": [
        "Return to the lesson page and attempt the practice / topic lab with this chapter still open if needed.",
        "Revisit any Check yourself prompts you could not answer out loud.",
        "Optional deeper reading: Deep Learning (Goodfellow, Bengio, Courville) — https://www.deeplearningbook.org/",
        "Optional deeper reading: Neural Networks and Deep Learning (Michael Nielsen) — https://neuralnetworksanddeeplearning.com/"
      ]
    }
  },
  "deep-learning-from-scratch/backpropagation-by-hand": {
    "title": "Chapter: Backpropagation by hand",
    "readingTime": "60-75 min",
    "premise": "Implement forward and backward passes for a tiny network and verify gradients numerically. This Learn chapter expands the short lesson summary into a full study unit you can read continuously, with interactive checks and selection-based AI search when a phrase needs a second opinion.",
    "parts": [
      {
        "id": "orientation",
        "heading": "Why this chapter exists",
        "paragraphs": [
          "Backpropagation is the chain rule organized over a computation graph. Gradient checks help you trust the math before scaling to larger models.",
          "This chapter treats \"Backpropagation by hand\" as a readable study unit: intuition first, then the mechanics you must be able to explain, then the failure modes that show up in interviews and production, and finally how to talk about the topic under time pressure.",
          "Read it like a book chapter. When a phrase is unclear, select it inside the Learn reader and use Search with AI to open Google, Perplexity, or DuckDuckGo without abandoning the chapter."
        ],
        "callout": {
          "tone": "tip",
          "body": "Target reading time is paced for depth, not skimming. Pause at each Check yourself prompt and answer out loud before revealing the guide answer."
        }
      },
      {
        "id": "backpropagation-is-bookkeeping-for-the-chain-rule",
        "heading": "Backpropagation is bookkeeping for the chain rule",
        "paragraphs": [
          "The chain rule says that if loss depends on z and z depends on w, then dloss/dw = dloss/dz * dz/dw. Neural networks are large compositions of simple operations, so backpropagation stores forward values and walks backward multiplying local derivatives by upstream gradients. A scalar example: x=3, w=2, b=-1, z=w*x+b=5, loss=z^2=25. The local derivative dloss/dz is 2z=10. Since dz/dw=x=3, dloss/dw=30. Since dz/db=1, dloss/db=10. One gradient descent step with lr=0.1 gives w=2-3= -1 and b=-1-1=-2. That step is intentionally huge because the learning rate is huge for this toy; the direction is the point.",
          "Hold these points explicitly while you study. Restate each one without looking at the list — recognition is not the interview bar; recall is.",
          "• Each node receives an upstream gradient and multiplies by its local derivative.",
          "• Forward-pass caches are required because derivatives often use intermediate values.",
          "• Gradient descent subtracts learning_rate * gradient from each parameter.",
          "Production lens — Adjoint accumulation: Backpropagation is dynamic programming over the chain rule. Each node in a computation graph stores its forward value and receives an upstream gradient, often called an adjoint, representing how the final loss changes with that node. The node multiplies by local derivatives and passes contributions to its inputs. If a value feeds multiple downstream nodes, gradients add. For z = x*y + x, dz/dx receives y from the multiply path and 1 from the add path, so total derivative is y + 1.\n\nThe efficiency comes from reusing downstream derivatives. Naively differentiating a million parameters independently would repeat the same suffix computations many times. Backprop visits each operation once in reverse topological order, using cached forward values. Matrix operations batch this work: dW = X.T @ dZ accumulates contributions from every example. The algorithm is not a mysterious neural-network trick; it is the chain rule organized to avoid repeated work on a directed acyclic graph."
        ],
        "keyTerms": [
          {
            "term": "Each node receives an upstream gradient",
            "definition": "Each node receives an upstream gradient and multiplies by its local derivative."
          },
          {
            "term": "Forward-pass caches are required because deri…",
            "definition": "Forward-pass caches are required because derivatives often use intermediate values."
          },
          {
            "term": "Gradient descent subtracts learning_rate * gr…",
            "definition": "Gradient descent subtracts learning_rate * gradient from each parameter."
          }
        ],
        "workedExample": {
          "title": "Scalar chain rule with finite difference check",
          "body": "Narrate what each shape and step is doing. If you only recognize the API call, you do not own the idea yet — rewrite the example from memory after one pass.",
          "code": "x = 3.0\nw = 2.0\nb = -1.0\n\ndef loss_fn(w_value):\n    z = w_value * x + b\n    return z ** 2\n\nz = w * x + b\nloss = z ** 2\nanalytic = 2 * z * x\neps = 1e-5\nnumeric = (loss_fn(w + eps) - loss_fn(w - eps)) / (2 * eps)\nprint(\"loss:\", loss)\nprint(\"analytic dloss/dw:\", analytic)\nprint(\"numeric dloss/dw:\", round(numeric, 6))",
          "language": "python"
        },
        "checkYourself": [
          {
            "prompt": "Can compute scalar chain-rule derivatives by hand.",
            "reveal": "Backpropagation is dynamic programming over the chain rule. Each node in a computation graph stores its forward value and receives an upstream gradient, often called an adjoint, representing how the final loss changes with that node. The node multiplies by local derivatives and passes contributions to its inputs. If a value feeds multiple downstream nodes, gradients add. For z = x*y + x, dz/dx receives y from the multiply path and 1 from the add path, so total derivative is y + 1.\n\nThe efficiency comes from reusing downstream derivatives. Naively differentiating a million parameters independently would repeat the same suffix computations many times. Backprop visits each operation once in reverse topological order, using cached forward values. Matrix operations batch this work: dW = X.T @ dZ accumulates contributions from every example. The algorithm is not a mysterious neural-network trick; it is the chain rule organized to avoid repeated work on a directed acyclic graph."
          }
        ]
      },
      {
        "id": "forward-pass-caches-the-values-backward-pass-needs",
        "heading": "Forward pass caches the values backward pass needs",
        "paragraphs": [
          "For a dense layer, z = X @ W + b and h = activation(z). The backward pass for the activation needs z or h. ReLU needs to know where z > 0. Sigmoid needs h because derivative is h*(1-h). The dense-layer weight gradient needs X, because each weight connects one input feature to one output unit. If X has shape (batch=6, features=3), W has shape (3, hidden=4), and upstream gradient dz has shape (6, 4), then dW = X.T @ dz has shape (3, 4), exactly matching W. db is dz summed or averaged over the batch, shape (1, 4). Shape matching is not a side detail; it is a correctness invariant.",
          "Hold these points explicitly while you study. Restate each one without looking at the list — recognition is not the interview bar; recall is.",
          "• Cache pre-activations and activations during forward pass.",
          "• The gradient for a parameter should have the same shape as that parameter.",
          "• Batch averaging keeps update magnitude comparable across batch sizes.",
          "Production lens — Local derivative library: From-scratch backprop becomes manageable when each operation has a local derivative rule. Addition sends the upstream gradient to both inputs, with broadcasting reductions when shapes differ. Multiplication sends upstream * other_input to each side. Matrix multiply Y = X @ W gives dX = dY @ W.T and dW = X.T @ dY. ReLU passes upstream where pre-activation was positive and zeroes it where negative. Sigmoid derivative is sigmoid(x) * (1 - sigmoid(x)).\n\nComplex networks are compositions of these small rules. For a dense layer Z = X @ W + b, cache X and W. During backward, compute dW, db, and dX. For batch normalization, convolution, or attention, the local rule is longer but the same principle holds: upstream gradient in, parameter gradients and input gradients out. Keeping a table of local derivatives and expected shapes lets you debug one operation at a time rather than re-deriving the entire network for every bug."
        ],
        "keyTerms": [
          {
            "term": "Cache pre-activations and activations during …",
            "definition": "Cache pre-activations and activations during forward pass."
          },
          {
            "term": "The gradient for a parameter should",
            "definition": "The gradient for a parameter should have the same shape as that parameter."
          },
          {
            "term": "Batch averaging keeps update magnitude compar…",
            "definition": "Batch averaging keeps update magnitude comparable across batch sizes."
          }
        ],
        "workedExample": {
          "title": "Check dense-layer gradient shapes",
          "body": "Narrate what each shape and step is doing. If you only recognize the API call, you do not own the idea yet — rewrite the example from memory after one pass.",
          "code": "import numpy as np\n\nrng = np.random.default_rng(1)\nX = rng.normal(size=(6, 3))\nW = rng.normal(size=(3, 4))\nb = np.zeros((1, 4))\nz = X @ W + b\nh = np.maximum(0, z)\nupstream = rng.normal(size=h.shape)\ndz = upstream * (z > 0)\ndW = X.T @ dz / len(X)\ndb = dz.mean(axis=0, keepdims=True)\nprint(\"z shape:\", z.shape)\nprint(\"dW shape:\", dW.shape, \"db shape:\", db.shape)",
          "language": "python"
        },
        "checkYourself": [
          {
            "prompt": "Can cache forward-pass intermediates for backward use.",
            "reveal": "From-scratch backprop becomes manageable when each operation has a local derivative rule. Addition sends the upstream gradient to both inputs, with broadcasting reductions when shapes differ. Multiplication sends upstream * other_input to each side. Matrix multiply Y = X @ W gives dX = dY @ W.T and dW = X.T @ dY. ReLU passes upstream where pre-activation was positive and zeroes it where negative. Sigmoid derivative is sigmoid(x) * (1 - sigmoid(x)).\n\nComplex networks are compositions of these small rules. For a dense layer Z = X @ W + b, cache X and W. During backward, compute dW, db, and dX. For batch normalization, convolution, or attention, the local rule is longer but the same principle holds: upstream gradient in, parameter gradients and input gradients out. Keeping a table of local derivatives and expected shapes lets you debug one operation at a time rather than re-deriving the entire network for every bug."
          }
        ]
      },
      {
        "id": "loss-derivatives-start-the-backward-flow",
        "heading": "Loss derivatives start the backward flow",
        "paragraphs": [
          "Backpropagation starts at the loss. For mean squared error, loss = mean((pred - y)^2), so dloss/dpred = 2*(pred-y)/n. If pred=[2, 4] and y=[1, 7], errors are [1, -3], squared errors are [1, 9], and loss is 5. The derivative is [2*1/2, 2*(-3)/2] = [1, -3]. That means increasing the first prediction increases loss, while increasing the second prediction decreases loss because it is too low. For sigmoid plus binary cross-entropy, the derivative with respect to the output logit simplifies to probability - target, which is why many small MLP examples use dz = out - y at the final layer.",
          "Hold these points explicitly while you study. Restate each one without looking at the list — recognition is not the interview bar; recall is.",
          "• MSE gradients point from target to prediction and scale with error size.",
          "• Binary cross-entropy with sigmoid has a convenient output-layer shortcut.",
          "• The loss derivative determines the first upstream gradient sent into the network.",
          "Production lens — Gradient checking: Gradient checking compares analytical backprop with finite differences on a tiny problem. For parameter theta_i, estimate derivative as (L(theta_i + epsilon) - L(theta_i - epsilon)) / (2 epsilon). With epsilon around 1e-5 for double precision, this central difference should be close to the backprop gradient. Check relative error, not just absolute error, because tiny gradients naturally have tiny differences. Run on a few parameters and examples; full checks are slow.\n\nGradient checks catch transposes, missing batch division, wrong broadcasting reduction, and sign errors. They do not prove training will work, because numerical gradients can pass while learning rate, initialization, or data preprocessing is poor. Disable dropout, randomness, and data augmentation during checks. Use deterministic inputs and small networks. Once a layer passes, keep its test as a guardrail. From-scratch learning is much faster when calculus errors are separated from optimization behavior."
        ],
        "keyTerms": [
          {
            "term": "MSE gradients point from target to",
            "definition": "MSE gradients point from target to prediction and scale with error size."
          },
          {
            "term": "Binary cross-entropy with sigmoid has a",
            "definition": "Binary cross-entropy with sigmoid has a convenient output-layer shortcut."
          },
          {
            "term": "The loss derivative determines the first",
            "definition": "The loss derivative determines the first upstream gradient sent into the network."
          }
        ],
        "checkYourself": [
          {
            "prompt": "Can derive dense-layer gradients with matrix shapes.",
            "reveal": "Gradient checking compares analytical backprop with finite differences on a tiny problem. For parameter theta_i, estimate derivative as (L(theta_i + epsilon) - L(theta_i - epsilon)) / (2 epsilon). With epsilon around 1e-5 for double precision, this central difference should be close to the backprop gradient. Check relative error, not just absolute error, because tiny gradients naturally have tiny differences. Run on a few parameters and examples; full checks are slow.\n\nGradient checks catch transposes, missing batch division, wrong broadcasting reduction, and sign errors. They do not prove training will work, because numerical gradients can pass while learning rate, initialization, or data preprocessing is poor. Disable dropout, randomness, and data augmentation during checks. Use deterministic inputs and small networks. Once a layer passes, keep its test as a guardrail. From-scratch learning is much faster when calculus errors are separated from optimization behavior."
          }
        ]
      },
      {
        "id": "a-two-layer-network-is-just-repeated-local-derivatives",
        "heading": "A two-layer network is just repeated local derivatives",
        "paragraphs": [
          "For pred = relu(X @ W1 + b1) @ W2 + b2 with MSE, the backward path is mechanical. First compute dpred from the loss. Then dW2 = hidden.T @ dpred and db2 = sum(dpred). The gradient into hidden is dpred @ W2.T. ReLU gates that gradient: dz1 = dhidden * (z1 > 0). Then dW1 = X.T @ dz1 and db1 = sum(dz1). A tiny numeric ReLU example: if z1 values are [-2, 0.5, 3] and upstream gradients are [10, 10, 10], ReLU sends back [0, 10, 10] because the negative unit was off in the forward pass. This gate is one reason dead ReLUs can occur when units stay negative for most data.",
          "Hold these points explicitly while you study. Restate each one without looking at the list — recognition is not the interview bar; recall is.",
          "• Backward order is the reverse of forward order.",
          "• Matrix multiplications aggregate gradients over all examples in the batch.",
          "• Activation derivatives decide which upstream gradient components pass through.",
          "Production lens — Vanishing and exploding gradients: Gradients multiply through layers. If many local derivatives have magnitude below 1, the product shrinks; if many exceed 1, it can explode. Sigmoid saturates near 0 or 1, where derivative is close to 0, so deep sigmoid networks can learn slowly in early layers. ReLU keeps derivative 1 on active units, helping flow, but dead ReLUs can output zero forever if weights drive them negative. Recurrent networks are especially vulnerable because the same transition multiplies through many time steps.\n\nMitigations target the multiplication chain. Good initialization keeps activation and gradient variance stable. Normalization reduces internal scale drift. Residual connections create shorter gradient paths by adding identity routes. Gradient clipping caps extreme updates, common in sequence models. Monitoring gradient norms by layer is diagnostic: if early layers have norms near zero while final layers move, learning is not reaching them. Backprop gives gradients; architecture and numerics decide whether they are useful."
        ],
        "keyTerms": [
          {
            "term": "Backward order is the reverse of",
            "definition": "Backward order is the reverse of forward order."
          },
          {
            "term": "Matrix multiplications aggregate gradients ov…",
            "definition": "Matrix multiplications aggregate gradients over all examples in the batch."
          },
          {
            "term": "Activation derivatives decide which upstream …",
            "definition": "Activation derivatives decide which upstream gradient components pass through."
          }
        ],
        "workedExample": {
          "title": "One backward pass through a tiny ReLU network",
          "body": "Narrate what each shape and step is doing. If you only recognize the API call, you do not own the idea yet — rewrite the example from memory after one pass.",
          "code": "import numpy as np\n\nrng = np.random.default_rng(5)\nX = rng.normal(size=(6, 3))\ny = rng.normal(size=(6, 1))\nW1 = rng.normal(scale=0.2, size=(3, 4)); b1 = np.zeros((1, 4))\nW2 = rng.normal(scale=0.2, size=(4, 1)); b2 = np.zeros((1, 1))\n\nz1 = X @ W1 + b1\nh = np.maximum(0, z1)\npred = h @ W2 + b2\nloss = np.mean((pred - y) ** 2)\ndpred = 2 * (pred - y) / len(X)\ndW2 = h.T @ dpred\ndb2 = dpred.sum(axis=0, keepdims=True)\ndz1 = (dpred @ W2.T) * (z1 > 0)\ndW1 = X.T @ dz1\ndb1 = dz1.sum(axis=0, keepdims=True)\nprint(\"loss:\", round(float(loss), 6))\nprint(\"gradient shapes:\", dW1.shape, db1.shape, dW2.shape, db2.shape)",
          "language": "python"
        },
        "checkYourself": [
          {
            "prompt": "Can implement a finite-difference gradient check.",
            "reveal": "Gradients multiply through layers. If many local derivatives have magnitude below 1, the product shrinks; if many exceed 1, it can explode. Sigmoid saturates near 0 or 1, where derivative is close to 0, so deep sigmoid networks can learn slowly in early layers. ReLU keeps derivative 1 on active units, helping flow, but dead ReLUs can output zero forever if weights drive them negative. Recurrent networks are especially vulnerable because the same transition multiplies through many time steps.\n\nMitigations target the multiplication chain. Good initialization keeps activation and gradient variance stable. Normalization reduces internal scale drift. Residual connections create shorter gradient paths by adding identity routes. Gradient clipping caps extreme updates, common in sequence models. Monitoring gradient norms by layer is diagnostic: if early layers have norms near zero while final layers move, learning is not reaching them. Backprop gives gradients; architecture and numerics decide whether they are useful."
          }
        ]
      },
      {
        "id": "numerical-gradient-checking-catches-silent-algebra-bugs",
        "heading": "Numerical gradient checking catches silent algebra bugs",
        "paragraphs": [
          "A finite-difference gradient estimates one parameter at a time: (loss(theta + eps) - loss(theta - eps)) / (2*eps). If eps is 1e-5 and changing a weight up gives loss 2.000030 while changing it down gives 1.999970, the numeric gradient is (0.000060)/(0.000020) = 3.0. If your analytic gradient says 3.000001, the backward pass is probably correct. If it says -3 or 0.3, look for sign errors, missing batch division, wrong transpose, or using the post-update parameter in the check. Gradient checking is slow because it touches each parameter separately, so use it on tiny deterministic networks, not full training runs.",
          "Hold these points explicitly while you study. Restate each one without looking at the list — recognition is not the interview bar; recall is.",
          "• Use central difference rather than one-sided difference for better accuracy.",
          "• Freeze randomness and dropout while checking gradients.",
          "• Compare absolute or relative error with tolerance, not exact equality.",
          "Production lens — Adjoint accumulation: Backpropagation is dynamic programming over the chain rule. Each node in a computation graph stores its forward value and receives an upstream gradient, often called an adjoint, representing how the final loss changes with that node. The node multiplies by local derivatives and passes contributions to its inputs. If a value feeds multiple downstream nodes, gradients add. For z = x*y + x, dz/dx receives y from the multiply path and 1 from the add path, so total derivative is y + 1.\n\nThe efficiency comes from reusing downstream derivatives. Naively differentiating a million parameters independently would repeat the same suffix computations many times. Backprop visits each operation once in reverse topological order, using cached forward values. Matrix operations batch this work: dW = X.T @ dZ accumulates contributions from every example. The algorithm is not a mysterious neural-network trick; it is the chain rule organized to avoid repeated work on a directed acyclic graph."
        ],
        "keyTerms": [
          {
            "term": "Use central difference rather than one-sided",
            "definition": "Use central difference rather than one-sided difference for better accuracy."
          },
          {
            "term": "Freeze randomness and dropout while checking",
            "definition": "Freeze randomness and dropout while checking gradients."
          },
          {
            "term": "Compare absolute or relative error with",
            "definition": "Compare absolute or relative error with tolerance, not exact equality."
          }
        ],
        "workedExample": {
          "title": "Finite-difference check for linear regression",
          "body": "Narrate what each shape and step is doing. If you only recognize the API call, you do not own the idea yet — rewrite the example from memory after one pass.",
          "code": "import numpy as np\n\nrng = np.random.default_rng(9)\nX = rng.normal(size=(8, 2))\ny = rng.normal(size=(8, 1))\nW = rng.normal(size=(2, 1))\neps = 1e-5\n\ndef loss_fn(W_value):\n    pred = X @ W_value\n    return np.mean((pred - y) ** 2)\n\npred = X @ W\nanalytic = X.T @ (2 * (pred - y) / len(X))\nnumeric = np.zeros_like(W)\nfor i in range(W.shape[0]):\n    plus = W.copy(); minus = W.copy()\n    plus[i, 0] += eps; minus[i, 0] -= eps\n    numeric[i, 0] = (loss_fn(plus) - loss_fn(minus)) / (2 * eps)\nprint(\"analytic:\", analytic.ravel().round(6))\nprint(\"numeric :\", numeric.ravel().round(6))\nprint(\"max error:\", np.max(np.abs(analytic - numeric)))",
          "language": "python"
        },
        "checkYourself": [
          {
            "prompt": "Can name common backprop bugs and the evidence that reveals them.",
            "reveal": "Explain the idea in two sentences, name one metric or invariant you would watch, and state one mistake juniors make. Then connect it back to numerical gradient checking catches silent algebra bugs."
          }
        ]
      },
      {
        "id": "gradient-debugging-is-evidence-driven",
        "heading": "Gradient debugging is evidence-driven",
        "paragraphs": [
          "When training fails, inspect the smallest reproducible case. If gradients are all zero, activations may be saturated or disconnected from the loss. Sigmoid saturates near 0 or 1; at h=0.99, h*(1-h)=0.0099, so gradients shrink. If gradients explode, update norms may dwarf parameter norms; a weight of 0.1 receiving a gradient of 100 with lr=0.1 jumps by 10, likely destabilizing the next forward pass. If only one layer learns, a transpose or broadcasting error may be blocking the earlier layer. The best debugging loop is: print shapes, print loss before and after one update, compare analytic gradients to finite differences, then train for several steps and verify the loss trend.",
          "Hold these points explicitly while you study. Restate each one without looking at the list — recognition is not the interview bar; recall is.",
          "• Start with deterministic data, tiny dimensions, and no randomness during checks.",
          "• Print gradient norms and parameter update norms.",
          "• Remove temporary debug prints after the issue is understood.",
          "Production lens — Local derivative library: From-scratch backprop becomes manageable when each operation has a local derivative rule. Addition sends the upstream gradient to both inputs, with broadcasting reductions when shapes differ. Multiplication sends upstream * other_input to each side. Matrix multiply Y = X @ W gives dX = dY @ W.T and dW = X.T @ dY. ReLU passes upstream where pre-activation was positive and zeroes it where negative. Sigmoid derivative is sigmoid(x) * (1 - sigmoid(x)).\n\nComplex networks are compositions of these small rules. For a dense layer Z = X @ W + b, cache X and W. During backward, compute dW, db, and dX. For batch normalization, convolution, or attention, the local rule is longer but the same principle holds: upstream gradient in, parameter gradients and input gradients out. Keeping a table of local derivatives and expected shapes lets you debug one operation at a time rather than re-deriving the entire network for every bug."
        ],
        "keyTerms": [
          {
            "term": "Start with deterministic data, tiny dimensions,",
            "definition": "Start with deterministic data, tiny dimensions, and no randomness during checks."
          },
          {
            "term": "Print gradient norms and parameter update",
            "definition": "Print gradient norms and parameter update norms."
          },
          {
            "term": "Remove temporary debug prints after the",
            "definition": "Remove temporary debug prints after the issue is understood."
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
          "Most interview answers fail not because the definition is wrong, but because the candidate never names how the approach breaks. Use this section as a trap checklist for backpropagation by hand.",
          "Trap: Mixing row-vector and column-vector conventions mid-derivation. A strong answer preempts it — say what you would monitor, what fallback you would keep, or what simpler baseline you would try first.",
          "Trap: Forgetting to average or sum gradients consistently over the batch. A strong answer preempts it — say what you would monitor, what fallback you would keep, or what simpler baseline you would try first.",
          "Trap: Using too large or too small an epsilon for numerical checks. A strong answer preempts it — say what you would monitor, what fallback you would keep, or what simpler baseline you would try first.",
          "Trap: Checking gradients while randomness or parameter updates are still changing values. A strong answer preempts it — say what you would monitor, what fallback you would keep, or what simpler baseline you would try first.",
          "Trap: Trusting loss curves without verifying shape and gradient invariants. A strong answer preempts it — say what you would monitor, what fallback you would keep, or what simpler baseline you would try first."
        ],
        "callout": {
          "tone": "warning",
          "body": "If you cannot name a failure mode, you do not yet understand the technique well enough to ship or defend it."
        },
        "checkYourself": [
          {
            "prompt": "Pick the most dangerous pitfall for Backpropagation by hand and explain how you would detect it in production or on a whiteboard.",
            "reveal": "Start with: \"Mixing row-vector and column-vector conventions mid-derivation.\" Then add a detection signal (metric, test, or review question) and a mitigation."
          }
        ]
      },
      {
        "id": "deeper-lens",
        "heading": "A deeper production lens",
        "paragraphs": [
          "Adjoint accumulation. Backpropagation is dynamic programming over the chain rule. Each node in a computation graph stores its forward value and receives an upstream gradient, often called an adjoint, representing how the final loss changes with that node. The node multiplies by local derivatives and passes contributions to its inputs. If a value feeds multiple downstream nodes, gradients add. For z = x*y + x, dz/dx receives y from the multiply path and 1 from the add path, so total derivative is y + 1.\n\nThe efficiency comes from reusing downstream derivatives. Naively differentiating a million parameters independently would repeat the same suffix computations many times. Backprop visits each operation once in reverse topological order, using cached forward values. Matrix operations batch this work: dW = X.T @ dZ accumulates contributions from every example. The algorithm is not a mysterious neural-network trick; it is the chain rule organized to avoid repeated work on a directed acyclic graph.",
          "Local derivative library. From-scratch backprop becomes manageable when each operation has a local derivative rule. Addition sends the upstream gradient to both inputs, with broadcasting reductions when shapes differ. Multiplication sends upstream * other_input to each side. Matrix multiply Y = X @ W gives dX = dY @ W.T and dW = X.T @ dY. ReLU passes upstream where pre-activation was positive and zeroes it where negative. Sigmoid derivative is sigmoid(x) * (1 - sigmoid(x)).\n\nComplex networks are compositions of these small rules. For a dense layer Z = X @ W + b, cache X and W. During backward, compute dW, db, and dX. For batch normalization, convolution, or attention, the local rule is longer but the same principle holds: upstream gradient in, parameter gradients and input gradients out. Keeping a table of local derivatives and expected shapes lets you debug one operation at a time rather than re-deriving the entire network for every bug.",
          "Gradient checking. Gradient checking compares analytical backprop with finite differences on a tiny problem. For parameter theta_i, estimate derivative as (L(theta_i + epsilon) - L(theta_i - epsilon)) / (2 epsilon). With epsilon around 1e-5 for double precision, this central difference should be close to the backprop gradient. Check relative error, not just absolute error, because tiny gradients naturally have tiny differences. Run on a few parameters and examples; full checks are slow.\n\nGradient checks catch transposes, missing batch division, wrong broadcasting reduction, and sign errors. They do not prove training will work, because numerical gradients can pass while learning rate, initialization, or data preprocessing is poor. Disable dropout, randomness, and data augmentation during checks. Use deterministic inputs and small networks. Once a layer passes, keep its test as a guardrail. From-scratch learning is much faster when calculus errors are separated from optimization behavior.",
          "Vanishing and exploding gradients. Gradients multiply through layers. If many local derivatives have magnitude below 1, the product shrinks; if many exceed 1, it can explode. Sigmoid saturates near 0 or 1, where derivative is close to 0, so deep sigmoid networks can learn slowly in early layers. ReLU keeps derivative 1 on active units, helping flow, but dead ReLUs can output zero forever if weights drive them negative. Recurrent networks are especially vulnerable because the same transition multiplies through many time steps.\n\nMitigations target the multiplication chain. Good initialization keeps activation and gradient variance stable. Normalization reduces internal scale drift. Residual connections create shorter gradient paths by adding identity routes. Gradient clipping caps extreme updates, common in sequence models. Monitoring gradient norms by layer is diagnostic: if early layers have norms near zero while final layers move, learning is not reaching them. Backprop gives gradients; architecture and numerics decide whether they are useful."
        ],
        "keyTerms": [
          {
            "term": "Adjoint accumulation",
            "definition": "Backpropagation is dynamic programming over the chain rule. Each node in a computation graph stores its forward value and receives an upstream gradient, often called an adjoint, representing how the final loss changes wi…"
          },
          {
            "term": "Local derivative library",
            "definition": "From-scratch backprop becomes manageable when each operation has a local derivative rule. Addition sends the upstream gradient to both inputs, with broadcasting reductions when shapes differ. Multiplication sends upstrea…"
          },
          {
            "term": "Gradient checking",
            "definition": "Gradient checking compares analytical backprop with finite differences on a tiny problem. For parameter theta_i, estimate derivative as (L(theta_i + epsilon) - L(theta_i - epsilon)) / (2 epsilon). With epsilon around 1e-…"
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
          "You should now be able to teach backpropagation by hand as a story: what problem it solves, how the mechanism works, which assumptions it depends on, and how you would know it failed.",
          "Close the loop by writing a 90-second spoken answer out loud. If you freeze on definitions, return to the orientation and the first technical part. If you freeze on trade-offs, return to failure modes.",
          "Practice prompts from this lesson: Walk through backpropagation for one dense layer with sigmoid activation. | How do you know a hand-coded gradient is correct? | What shape should dW have if X is batch-by-features and W is features-by-hidden?"
        ],
        "checkYourself": [
          {
            "prompt": "Give a 90-second spoken overview of Backpropagation by hand as if starting an interview answer.",
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
        "Can compute scalar chain-rule derivatives by hand.",
        "Can cache forward-pass intermediates for backward use.",
        "Can derive dense-layer gradients with matrix shapes.",
        "Can implement a finite-difference gradient check.",
        "Can name common backprop bugs and the evidence that reveals them."
      ],
      "nextSteps": [
        "Return to the lesson page and attempt the practice / topic lab with this chapter still open if needed.",
        "Revisit any Check yourself prompts you could not answer out loud.",
        "Optional deeper reading: Calculus on Computational Graphs: Backpropagation (CS231n) — https://cs231n.github.io/optimization-2/",
        "Optional deeper reading: Backpropagation (3Blue1Brown) — https://www.3blue1brown.com/lessons/backpropagation"
      ]
    }
  },
  "deep-learning-from-scratch/cnn-building-blocks-numpy": {
    "title": "Chapter: CNN building blocks with NumPy",
    "readingTime": "60-75 min",
    "premise": "Implement simple 2D convolution and max pooling on small arrays, then compare hand-crafted image features with an sklearn MLP on synthetic image data. This Learn chapter expands the short lesson summary into a full study unit you can read continuously, with interactive checks and selection-based AI search when a phrase needs a second opinion.",
    "parts": [
      {
        "id": "orientation",
        "heading": "Why this chapter exists",
        "paragraphs": [
          "CNNs are easier to understand when you can see filters sliding over arrays. Convolution, pooling, and flattening are structured NumPy operations before they become deep-learning layers.",
          "This chapter treats \"CNN building blocks with NumPy\" as a readable study unit: intuition first, then the mechanics you must be able to explain, then the failure modes that show up in interviews and production, and finally how to talk about the topic under time pressure.",
          "Read it like a book chapter. When a phrase is unclear, select it inside the Learn reader and use Search with AI to open Google, Perplexity, or DuckDuckGo without abandoning the chapter."
        ],
        "callout": {
          "tone": "tip",
          "body": "Target reading time is paced for depth, not skimming. Pause at each Check yourself prompt and answer out loud before revealing the guide answer."
        }
      },
      {
        "id": "images-are-tensors-with-local-structure",
        "heading": "Images are tensors with local structure",
        "paragraphs": [
          "A grayscale image can be represented as a 2D matrix of pixel intensities. A color image is often height by width by channels. Fully connected layers ignore locality: pixel (10, 10) and pixel (10, 11) are just two unrelated inputs unless the data teaches otherwise. Convolution builds in the assumption that nearby pixels form useful patterns and that the same pattern can appear in many locations. If a 3x3 edge detector works in the top-left corner, the same weights can scan the center and bottom-right. This weight sharing reduces parameters and improves generalization for image-like data. A 28x28 image flattened into a dense layer with 100 hidden units needs 78,400 weights; one 3x3 filter needs only 9 weights plus a bias and can be applied everywhere.",
          "Hold these points explicitly while you study. Restate each one without looking at the list — recognition is not the interview bar; recall is.",
          "• Convolution preserves spatial locality while sharing weights across positions.",
          "• Small filters detect local patterns that deeper layers can combine.",
          "• CNN assumptions help image, audio spectrogram, and grid-like data more than arbitrary tabular columns.",
          "Production lens — Local receptive fields: Convolution assumes local patterns matter. A 3x3 filter over an RGB image has 3 * 3 * 3 = 27 weights plus bias and slides across height and width. The same weights detect the same pattern in many positions, creating translation equivariance: shifting the input shifts the feature map. A dense layer over a 224x224x3 image to 64 outputs would need over 9.6 million weights; a convolution with 64 filters of size 3x3 needs only 1,792 weights including biases.\n\nReceptive fields grow with depth. One 3x3 convolution sees a 3x3 patch. Two stacked 3x3 convolutions with stride 1 let the second layer combine information from a 5x5 area. Three see 7x7. This stacking adds nonlinearities and fewer parameters than one huge filter. CNNs therefore learn edges and textures early, parts in middle layers, and task-specific arrangements later. Implementing convolution in NumPy makes these locality and sharing assumptions visible."
        ],
        "keyTerms": [
          {
            "term": "Convolution preserves spatial locality while …",
            "definition": "Convolution preserves spatial locality while sharing weights across positions."
          },
          {
            "term": "Small filters detect local patterns that",
            "definition": "Small filters detect local patterns that deeper layers can combine."
          },
          {
            "term": "CNN assumptions help image, audio spectrogram,",
            "definition": "CNN assumptions help image, audio spectrogram, and grid-like data more than arbitrary tabular columns."
          }
        ],
        "checkYourself": [
          {
            "prompt": "Can compute one convolution output cell from a patch and kernel.",
            "reveal": "Convolution assumes local patterns matter. A 3x3 filter over an RGB image has 3 * 3 * 3 = 27 weights plus bias and slides across height and width. The same weights detect the same pattern in many positions, creating translation equivariance: shifting the input shifts the feature map. A dense layer over a 224x224x3 image to 64 outputs would need over 9.6 million weights; a convolution with 64 filters of size 3x3 needs only 1,792 weights including biases.\n\nReceptive fields grow with depth. One 3x3 convolution sees a 3x3 patch. Two stacked 3x3 convolutions with stride 1 let the second layer combine information from a 5x5 area. Three see 7x7. This stacking adds nonlinearities and fewer parameters than one huge filter. CNNs therefore learn edges and textures early, parts in middle layers, and task-specific arrangements later. Implementing convolution in NumPy makes these locality and sharing assumptions visible."
          }
        ]
      },
      {
        "id": "a-convolution-output-cell-is-a-weighted-patch-sum",
        "heading": "A convolution output cell is a weighted patch sum",
        "paragraphs": [
          "For valid 2D convolution, place the kernel over an image patch with the same shape, multiply elementwise, and sum. Suppose the patch is [[1, 2], [3, 4]] and the kernel is [[1, 0], [-1, 1]]. The output is 1*1 + 2*0 + 3*(-1) + 4*1 = 2. Then the kernel slides one column or row and repeats. With a 4x4 image and a 2x2 kernel, valid convolution has output size (4-2+1) by (4-2+1), so 3x3. Edge filters use positive weights on one side and negative weights on the other, producing large magnitude where intensities change sharply.",
          "Hold these points explicitly while you study. Restate each one without looking at the list — recognition is not the interview bar; recall is.",
          "• Kernel size controls the local receptive field.",
          "• Each output value summarizes one neighborhood.",
          "• Valid convolution uses only patches fully inside the image.",
          "Production lens — Output shape arithmetic: Convolution output size follows a concrete formula. For input size W, filter size F, padding P, and stride S, output size is floor((W - F + 2P) / S) + 1. A 32x32 image with 3x3 filters, padding 1, stride 1 stays 32x32. Without padding it becomes 30x30. With stride 2 and padding 1 it becomes 16x16. Shape arithmetic is not bookkeeping; it controls memory, compute, and whether later layers receive the expected dimensions.\n\nChannels add another dimension. A convolution filter spans all input channels, so for input (N, H, W, C_in) and C_out filters of size KxK, weights have shape (K, K, C_in, C_out) in one common convention. Output is (N, H_out, W_out, C_out). During backprop, dWeights has the same shape as weights, and dInput has the same shape as input. Most CNN bugs are wrong padding, stride, channel order, or off-by-one output dimensions."
        ],
        "keyTerms": [
          {
            "term": "Kernel size controls the local receptive",
            "definition": "Kernel size controls the local receptive field."
          },
          {
            "term": "Each output value summarizes one neighborhood.",
            "definition": "Each output value summarizes one neighborhood."
          },
          {
            "term": "Valid convolution uses only patches fully",
            "definition": "Valid convolution uses only patches fully inside the image."
          }
        ],
        "workedExample": {
          "title": "Apply a vertical edge filter",
          "body": "Narrate what each shape and step is doing. If you only recognize the API call, you do not own the idea yet — rewrite the example from memory after one pass.",
          "code": "import numpy as np\n\nimage = np.array([\n    [0, 0, 1, 1],\n    [0, 0, 1, 1],\n    [0, 0, 1, 1],\n    [0, 0, 1, 1]\n], dtype=float)\nkernel = np.array([[-1, 1], [-1, 1]], dtype=float)\nout = np.zeros((3, 3))\n\nfor r in range(3):\n    for c in range(3):\n        patch = image[r:r+2, c:c+2]\n        out[r, c] = np.sum(patch * kernel)\n\nprint(out)",
          "language": "python"
        },
        "checkYourself": [
          {
            "prompt": "Can derive output sizes from input size, kernel, stride, and padding.",
            "reveal": "Convolution output size follows a concrete formula. For input size W, filter size F, padding P, and stride S, output size is floor((W - F + 2P) / S) + 1. A 32x32 image with 3x3 filters, padding 1, stride 1 stays 32x32. Without padding it becomes 30x30. With stride 2 and padding 1 it becomes 16x16. Shape arithmetic is not bookkeeping; it controls memory, compute, and whether later layers receive the expected dimensions.\n\nChannels add another dimension. A convolution filter spans all input channels, so for input (N, H, W, C_in) and C_out filters of size KxK, weights have shape (K, K, C_in, C_out) in one common convention. Output is (N, H_out, W_out, C_out). During backprop, dWeights has the same shape as weights, and dInput has the same shape as input. Most CNN bugs are wrong padding, stride, channel order, or off-by-one output dimensions."
          }
        ]
      },
      {
        "id": "stride-and-padding-decide-the-output-grid",
        "heading": "Stride and padding decide the output grid",
        "paragraphs": [
          "Stride is how far the kernel moves between outputs. With stride 1, a 5x5 image and 3x3 kernel produce a 3x3 valid output. With stride 2, the output becomes floor((5-3)/2) + 1 = 2 positions per axis, so 2x2. Padding adds zeros around the image so filters can cover border pixels and sometimes preserve size. For same padding with stride 1 and a 3x3 kernel, one pixel of padding turns 5x5 into 7x7 before convolution, and the output returns to 5x5. The tradeoff is context: padding lets edges produce outputs, but those outputs partially see artificial zeros. In interviews, state the formula and then talk about why preserving spatial size may help deeper networks.",
          "Hold these points explicitly while you study. Restate each one without looking at the list — recognition is not the interview bar; recall is.",
          "• Valid output size is floor((input - kernel) / stride) + 1.",
          "• Padding increases effective input size and changes border behavior.",
          "• Stride reduces spatial resolution and computation.",
          "Production lens — Pooling information tradeoff: Pooling reduces spatial resolution and compute while adding tolerance to small shifts. Max pooling with 2x2 window and stride 2 halves height and width, keeping the strongest activation in each window. This can help classification because a cat ear detected one pixel left should still count. The cost is lost detail. For segmentation, detection of tiny objects, or precise localization, aggressive pooling can remove information the task needs.\n\nStrided convolution is a learnable alternative to fixed pooling. Average pooling summarizes smooth presence; max pooling captures strongest evidence. Modern networks often combine downsampling with residual blocks and normalization to control information flow. When building from scratch, inspect activation maps before and after pooling. If a 28x28 digit becomes 7x7 too quickly, the model may lose stroke details. Downsampling is not free compression; it is an architectural decision about invariance versus precision."
        ],
        "keyTerms": [
          {
            "term": "Valid output size is floor((input -",
            "definition": "Valid output size is floor((input - kernel) / stride) + 1."
          },
          {
            "term": "Padding increases effective input size and",
            "definition": "Padding increases effective input size and changes border behavior."
          },
          {
            "term": "Stride reduces spatial resolution and computa…",
            "definition": "Stride reduces spatial resolution and computation."
          }
        ],
        "workedExample": {
          "title": "Compute convolution output sizes",
          "body": "Narrate what each shape and step is doing. If you only recognize the API call, you do not own the idea yet — rewrite the example from memory after one pass.",
          "code": "def conv_out_size(input_size, kernel_size, stride=1, padding=0):\n    return (input_size + 2 * padding - kernel_size) // stride + 1\n\nfor stride in [1, 2]:\n    print(\"5x5, 3x3, stride\", stride, \"valid ->\", conv_out_size(5, 3, stride=stride))\nprint(\"5x5, 3x3, stride 1, padding 1 ->\", conv_out_size(5, 3, stride=1, padding=1))",
          "language": "python"
        },
        "checkYourself": [
          {
            "prompt": "Can implement valid 2D convolution over a single-channel image.",
            "reveal": "Pooling reduces spatial resolution and compute while adding tolerance to small shifts. Max pooling with 2x2 window and stride 2 halves height and width, keeping the strongest activation in each window. This can help classification because a cat ear detected one pixel left should still count. The cost is lost detail. For segmentation, detection of tiny objects, or precise localization, aggressive pooling can remove information the task needs.\n\nStrided convolution is a learnable alternative to fixed pooling. Average pooling summarizes smooth presence; max pooling captures strongest evidence. Modern networks often combine downsampling with residual blocks and normalization to control information flow. When building from scratch, inspect activation maps before and after pooling. If a 28x28 digit becomes 7x7 too quickly, the model may lose stroke details. Downsampling is not free compression; it is an architectural decision about invariance versus precision."
          }
        ]
      },
      {
        "id": "pooling-trades-precise-location-for-robustness",
        "heading": "Pooling trades precise location for robustness",
        "paragraphs": [
          "Max pooling takes the largest value in each window. For a 2x2 patch [[0.1, 0.7], [0.2, 0.4]], max pooling outputs 0.7. If a detector fires one pixel to the left in another image, a 2x2 max pool may still keep a similar activation, giving small translation tolerance. Pooling also reduces computation: an 8x8 activation map pooled with size 2 and stride 2 becomes 4x4, reducing 64 values to 16. The cost is lost detail. If the task depends on exact location, aggressive pooling can hurt. Average pooling keeps broader intensity information, while max pooling emphasizes strongest local evidence.",
          "Hold these points explicitly while you study. Restate each one without looking at the list — recognition is not the interview bar; recall is.",
          "• Max pooling keeps the strongest local response.",
          "• Pooling lowers spatial resolution and downstream computation.",
          "• Translation tolerance is useful only when exact location is not the label.",
          "Production lens — Im2col compute trick: Naive convolution uses many nested loops over batch, output height, output width, filters, kernel rows, kernel columns, and channels. That is clear but slow in Python. The im2col trick extracts every sliding window into rows of a matrix, reshapes filters into columns, and turns convolution into matrix multiplication. For input patches shaped (N * H_out * W_out, K * K * C_in) and filters shaped (K * K * C_in, C_out), one matrix multiply produces all output activations.\n\nThe trick trades memory for speed. im2col duplicates input values because overlapping windows share pixels, so the temporary matrix can be much larger than the original image. Libraries use optimized variants, tiling, and GPU kernels to avoid worst-case overhead. For learning, im2col is valuable because it connects convolution to linear algebra and makes backward pass easier to reason about: gradients through the matrix multiply are computed, then col2im scatters overlapping patch gradients back into the input shape by summing contributions."
        ],
        "keyTerms": [
          {
            "term": "Max pooling keeps the strongest local",
            "definition": "Max pooling keeps the strongest local response."
          },
          {
            "term": "Pooling lowers spatial resolution and downstream",
            "definition": "Pooling lowers spatial resolution and downstream computation."
          },
          {
            "term": "Translation tolerance is useful only when",
            "definition": "Translation tolerance is useful only when exact location is not the label."
          }
        ],
        "workedExample": {
          "title": "Max pool a small activation map",
          "body": "Narrate what each shape and step is doing. If you only recognize the API call, you do not own the idea yet — rewrite the example from memory after one pass.",
          "code": "import numpy as np\n\nactivation = np.array([\n    [0.1, 0.7, 0.2, 0.3],\n    [0.2, 0.4, 0.9, 0.1],\n    [0.0, 0.5, 0.8, 0.6],\n    [0.3, 0.2, 0.4, 0.9]\n])\npooled = np.zeros((2, 2))\nfor r in range(2):\n    for c in range(2):\n        patch = activation[r*2:r*2+2, c*2:c*2+2]\n        pooled[r, c] = np.max(patch)\nprint(pooled)",
          "language": "python"
        },
        "checkYourself": [
          {
            "prompt": "Can implement max pooling with a fixed window and stride.",
            "reveal": "Naive convolution uses many nested loops over batch, output height, output width, filters, kernel rows, kernel columns, and channels. That is clear but slow in Python. The im2col trick extracts every sliding window into rows of a matrix, reshapes filters into columns, and turns convolution into matrix multiplication. For input patches shaped (N * H_out * W_out, K * K * C_in) and filters shaped (K * K * C_in, C_out), one matrix multiply produces all output activations.\n\nThe trick trades memory for speed. im2col duplicates input values because overlapping windows share pixels, so the temporary matrix can be much larger than the original image. Libraries use optimized variants, tiling, and GPU kernels to avoid worst-case overhead. For learning, im2col is valuable because it connects convolution to linear algebra and makes backward pass easier to reason about: gradients through the matrix multiply are computed, then col2im scatters overlapping patch gradients back into the input shape by summing contributions."
          }
        ]
      },
      {
        "id": "from-convolutional-features-to-classifiers",
        "heading": "From convolutional features to classifiers",
        "paragraphs": [
          "A full CNN learns filters during training, applies nonlinear activations, pools or strides, then flattens or globally pools features for classification. In this browser-friendly lesson, we implement the array operations explicitly and use scikit-learn for small classifiers. A useful baseline is flattened pixels. On synthetic 8x8 images with vertical bars and horizontal bars, flattened pixels are enough because the pattern is simple. Convolutional features become more valuable when objects shift location, local edges combine into shapes, and weight sharing reduces the number of examples needed. Evaluation still follows the supervised workflow: hold out test images, compare to baselines, inspect errors, and watch for shortcuts such as a noise pattern that correlates with the label.",
          "Hold these points explicitly while you study. Restate each one without looking at the list — recognition is not the interview bar; recall is.",
          "• Flattened pixels are a baseline, not a CNN.",
          "• Convolutional features help when local patterns repeat across positions.",
          "• Synthetic image tasks are useful for understanding operations but do not prove real-world robustness.",
          "Production lens — Local receptive fields: Convolution assumes local patterns matter. A 3x3 filter over an RGB image has 3 * 3 * 3 = 27 weights plus bias and slides across height and width. The same weights detect the same pattern in many positions, creating translation equivariance: shifting the input shifts the feature map. A dense layer over a 224x224x3 image to 64 outputs would need over 9.6 million weights; a convolution with 64 filters of size 3x3 needs only 1,792 weights including biases.\n\nReceptive fields grow with depth. One 3x3 convolution sees a 3x3 patch. Two stacked 3x3 convolutions with stride 1 let the second layer combine information from a 5x5 area. Three see 7x7. This stacking adds nonlinearities and fewer parameters than one huge filter. CNNs therefore learn edges and textures early, parts in middle layers, and task-specific arrangements later. Implementing convolution in NumPy makes these locality and sharing assumptions visible."
        ],
        "keyTerms": [
          {
            "term": "Flattened pixels are a baseline, not",
            "definition": "Flattened pixels are a baseline, not a CNN."
          },
          {
            "term": "Convolutional features help when local patterns",
            "definition": "Convolutional features help when local patterns repeat across positions."
          },
          {
            "term": "Synthetic image tasks are useful for",
            "definition": "Synthetic image tasks are useful for understanding operations but do not prove real-world robustness."
          }
        ],
        "workedExample": {
          "title": "Classify synthetic bar images with sklearn",
          "body": "Narrate what each shape and step is doing. If you only recognize the API call, you do not own the idea yet — rewrite the example from memory after one pass.",
          "code": "import numpy as np\nfrom sklearn.metrics import accuracy_score\nfrom sklearn.model_selection import train_test_split\nfrom sklearn.neural_network import MLPClassifier\n\ndef make_bar_images(n=120, size=8, seed=2):\n    rng = np.random.default_rng(seed)\n    images, labels = [], []\n    for i in range(n):\n        img = rng.normal(0, 0.05, size=(size, size))\n        if i % 2 == 0:\n            img[:, 3:5] += 1.0; labels.append(0)\n        else:\n            img[3:5, :] += 1.0; labels.append(1)\n        images.append(img)\n    return np.array(images), np.array(labels)\n\nimages, y = make_bar_images()\nX = images.reshape(len(images), -1)\nX_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.3, stratify=y, random_state=2)\nclf = MLPClassifier(hidden_layer_sizes=(12,), max_iter=500, random_state=2)\nclf.fit(X_train, y_train)\nprint(\"accuracy:\", round(accuracy_score(y_test, clf.predict(X_test)), 3))",
          "language": "python"
        },
        "checkYourself": [
          {
            "prompt": "Can explain how convolutional features become classifier inputs and how to evaluate them.",
            "reveal": "Explain the idea in two sentences, name one metric or invariant you would watch, and state one mistake juniors make. Then connect it back to from convolutional features to classifiers."
          }
        ]
      },
      {
        "id": "cnn-block-failure-modes-are-often-shape-or-shortcut-bugs",
        "heading": "CNN block failure modes are often shape or shortcut bugs",
        "paragraphs": [
          "Hand-written convolution code fails when output dimensions are off by one, patches and kernels have mismatched shapes, stride indexes skip the wrong pixels, or pooling windows overlap unintentionally. Model-level failures are more subtle. A classifier may learn a border artifact from padding instead of the object. Pooling may erase a small object. A synthetic dataset may put every vertical bar at columns 3 and 4, so the classifier learns position rather than verticality. Good tests include tiny matrices with hand-computed outputs, translated examples, noise stress tests, and confusion-matrix review. If an edge filter should return a strong response at one boundary, write that expected array before optimizing anything.",
          "Hold these points explicitly while you study. Restate each one without looking at the list — recognition is not the interview bar; recall is.",
          "• Test convolution and pooling on small matrices with known outputs.",
          "• Check translated inputs to see whether the feature is robust or position-specific.",
          "• Inspect false positives and false negatives before claiming the feature works.",
          "Production lens — Output shape arithmetic: Convolution output size follows a concrete formula. For input size W, filter size F, padding P, and stride S, output size is floor((W - F + 2P) / S) + 1. A 32x32 image with 3x3 filters, padding 1, stride 1 stays 32x32. Without padding it becomes 30x30. With stride 2 and padding 1 it becomes 16x16. Shape arithmetic is not bookkeeping; it controls memory, compute, and whether later layers receive the expected dimensions.\n\nChannels add another dimension. A convolution filter spans all input channels, so for input (N, H, W, C_in) and C_out filters of size KxK, weights have shape (K, K, C_in, C_out) in one common convention. Output is (N, H_out, W_out, C_out). During backprop, dWeights has the same shape as weights, and dInput has the same shape as input. Most CNN bugs are wrong padding, stride, channel order, or off-by-one output dimensions."
        ],
        "keyTerms": [
          {
            "term": "Test convolution and pooling on small",
            "definition": "Test convolution and pooling on small matrices with known outputs."
          },
          {
            "term": "Check translated inputs to see whether",
            "definition": "Check translated inputs to see whether the feature is robust or position-specific."
          },
          {
            "term": "Inspect false positives and false negatives",
            "definition": "Inspect false positives and false negatives before claiming the feature works."
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
          "Most interview answers fail not because the definition is wrong, but because the candidate never names how the approach breaks. Use this section as a trap checklist for cnn building blocks with numpy.",
          "Trap: Mixing up output height/width calculations. A strong answer preempts it — say what you would monitor, what fallback you would keep, or what simpler baseline you would try first.",
          "Trap: Forgetting that convolution kernels and image patches must have matching shapes. A strong answer preempts it — say what you would monitor, what fallback you would keep, or what simpler baseline you would try first.",
          "Trap: Assuming pooling improves every task instead of checking lost detail. A strong answer preempts it — say what you would monitor, what fallback you would keep, or what simpler baseline you would try first.",
          "Trap: Training on synthetic images with a position shortcut and calling it shape learning. A strong answer preempts it — say what you would monitor, what fallback you would keep, or what simpler baseline you would try first.",
          "Trap: Ignoring border behavior introduced by padding. A strong answer preempts it — say what you would monitor, what fallback you would keep, or what simpler baseline you would try first."
        ],
        "callout": {
          "tone": "warning",
          "body": "If you cannot name a failure mode, you do not yet understand the technique well enough to ship or defend it."
        },
        "checkYourself": [
          {
            "prompt": "Pick the most dangerous pitfall for CNN building blocks with NumPy and explain how you would detect it in production or on a whiteboard.",
            "reveal": "Start with: \"Mixing up output height/width calculations.\" Then add a detection signal (metric, test, or review question) and a mitigation."
          }
        ]
      },
      {
        "id": "deeper-lens",
        "heading": "A deeper production lens",
        "paragraphs": [
          "Local receptive fields. Convolution assumes local patterns matter. A 3x3 filter over an RGB image has 3 * 3 * 3 = 27 weights plus bias and slides across height and width. The same weights detect the same pattern in many positions, creating translation equivariance: shifting the input shifts the feature map. A dense layer over a 224x224x3 image to 64 outputs would need over 9.6 million weights; a convolution with 64 filters of size 3x3 needs only 1,792 weights including biases.\n\nReceptive fields grow with depth. One 3x3 convolution sees a 3x3 patch. Two stacked 3x3 convolutions with stride 1 let the second layer combine information from a 5x5 area. Three see 7x7. This stacking adds nonlinearities and fewer parameters than one huge filter. CNNs therefore learn edges and textures early, parts in middle layers, and task-specific arrangements later. Implementing convolution in NumPy makes these locality and sharing assumptions visible.",
          "Output shape arithmetic. Convolution output size follows a concrete formula. For input size W, filter size F, padding P, and stride S, output size is floor((W - F + 2P) / S) + 1. A 32x32 image with 3x3 filters, padding 1, stride 1 stays 32x32. Without padding it becomes 30x30. With stride 2 and padding 1 it becomes 16x16. Shape arithmetic is not bookkeeping; it controls memory, compute, and whether later layers receive the expected dimensions.\n\nChannels add another dimension. A convolution filter spans all input channels, so for input (N, H, W, C_in) and C_out filters of size KxK, weights have shape (K, K, C_in, C_out) in one common convention. Output is (N, H_out, W_out, C_out). During backprop, dWeights has the same shape as weights, and dInput has the same shape as input. Most CNN bugs are wrong padding, stride, channel order, or off-by-one output dimensions.",
          "Pooling information tradeoff. Pooling reduces spatial resolution and compute while adding tolerance to small shifts. Max pooling with 2x2 window and stride 2 halves height and width, keeping the strongest activation in each window. This can help classification because a cat ear detected one pixel left should still count. The cost is lost detail. For segmentation, detection of tiny objects, or precise localization, aggressive pooling can remove information the task needs.\n\nStrided convolution is a learnable alternative to fixed pooling. Average pooling summarizes smooth presence; max pooling captures strongest evidence. Modern networks often combine downsampling with residual blocks and normalization to control information flow. When building from scratch, inspect activation maps before and after pooling. If a 28x28 digit becomes 7x7 too quickly, the model may lose stroke details. Downsampling is not free compression; it is an architectural decision about invariance versus precision.",
          "Im2col compute trick. Naive convolution uses many nested loops over batch, output height, output width, filters, kernel rows, kernel columns, and channels. That is clear but slow in Python. The im2col trick extracts every sliding window into rows of a matrix, reshapes filters into columns, and turns convolution into matrix multiplication. For input patches shaped (N * H_out * W_out, K * K * C_in) and filters shaped (K * K * C_in, C_out), one matrix multiply produces all output activations.\n\nThe trick trades memory for speed. im2col duplicates input values because overlapping windows share pixels, so the temporary matrix can be much larger than the original image. Libraries use optimized variants, tiling, and GPU kernels to avoid worst-case overhead. For learning, im2col is valuable because it connects convolution to linear algebra and makes backward pass easier to reason about: gradients through the matrix multiply are computed, then col2im scatters overlapping patch gradients back into the input shape by summing contributions."
        ],
        "keyTerms": [
          {
            "term": "Local receptive fields",
            "definition": "Convolution assumes local patterns matter. A 3x3 filter over an RGB image has 3 * 3 * 3 = 27 weights plus bias and slides across height and width. The same weights detect the same pattern in many positions, creating tran…"
          },
          {
            "term": "Output shape arithmetic",
            "definition": "Convolution output size follows a concrete formula. For input size W, filter size F, padding P, and stride S, output size is floor((W - F + 2P) / S) + 1. A 32x32 image with 3x3 filters, padding 1, stride 1 stays 32x32. W…"
          },
          {
            "term": "Pooling information tradeoff",
            "definition": "Pooling reduces spatial resolution and compute while adding tolerance to small shifts. Max pooling with 2x2 window and stride 2 halves height and width, keeping the strongest activation in each window. This can help clas…"
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
          "You should now be able to teach cnn building blocks with numpy as a story: what problem it solves, how the mechanism works, which assumptions it depends on, and how you would know it failed.",
          "Close the loop by writing a 90-second spoken answer out loud. If you freeze on definitions, return to the orientation and the first technical part. If you freeze on trade-offs, return to failure modes.",
          "Practice prompts from this lesson: What does a convolution filter compute at one output location? | How do stride and padding change output size? | Why does max pooling provide some translation tolerance?"
        ],
        "checkYourself": [
          {
            "prompt": "Give a 90-second spoken overview of CNN building blocks with NumPy as if starting an interview answer.",
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
        "Can compute one convolution output cell from a patch and kernel.",
        "Can derive output sizes from input size, kernel, stride, and padding.",
        "Can implement valid 2D convolution over a single-channel image.",
        "Can implement max pooling with a fixed window and stride.",
        "Can explain how convolutional features become classifier inputs and how to evaluate them."
      ],
      "nextSteps": [
        "Return to the lesson page and attempt the practice / topic lab with this chapter still open if needed.",
        "Revisit any Check yourself prompts you could not answer out loud.",
        "Optional deeper reading: Convolutional Neural Networks (CS231n) — https://cs231n.github.io/convolutional-networks/",
        "Optional deeper reading: A Guide to Convolution Arithmetic for Deep Learning (arXiv) — https://arxiv.org/abs/1603.07285"
      ]
    }
  }
};
