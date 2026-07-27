/** @type {Record<string, import('../learnChapters.js').LessonLearnChapter>} */
export const deepLearningChapters = {
  "deep-learning/neural-network-fundamentals": {
    "title": "Chapter: Neural network fundamentals",
    "readingTime": "55-70 min",
    "premise": "Perceptrons, activation functions, backpropagation, and optimization form the building blocks of all deep learning. This Learn chapter expands the short lesson summary into a full study unit you can read continuously, with interactive checks and selection-based AI search when a phrase needs a second opinion.",
    "parts": [
      {
        "id": "orientation",
        "heading": "Why this chapter exists",
        "paragraphs": [
          "Understanding how gradients flow through layers is essential for debugging training failures and designing architectures. Framework APIs change; the forward/backward mental model does not.",
          "This chapter treats \"Neural network fundamentals\" as a readable study unit: intuition first, then the mechanics you must be able to explain, then the failure modes that show up in interviews and production, and finally how to talk about the topic under time pressure.",
          "Read it like a book chapter. When a phrase is unclear, select it inside the Learn reader and use Search with AI to open Google, Perplexity, or DuckDuckGo without abandoning the chapter."
        ],
        "callout": {
          "tone": "tip",
          "body": "Target reading time is paced for depth, not skimming. Pause at each Check yourself prompt and answer out loud before revealing the guide answer."
        }
      },
      {
        "id": "neurons-layers-and-why-nonlinearity-matters",
        "heading": "Neurons, layers, and why nonlinearity matters",
        "paragraphs": [
          "A dense layer computes Y = activation(X @ W + b). Without a nonlinearity, stacking layers collapses into one linear map, no matter the depth. ReLU (max(0,x)) is the workhorse: sparse activations, cheap derivative (0 or 1), and fewer saturating regions than sigmoid/tanh. Sigmoid still appears in binary outputs; softmax turns logits into a categorical distribution. Width buys parallel features; depth buys hierarchical composition. Universal approximation says a wide enough shallow net can approximate continuous functions on compact sets, but deep nets often learn reusable intermediate representations more sample-efficiently. Always track shapes: (batch, in_dim) times (in_dim, out_dim) yields (batch, out_dim).",
          "Hold these points explicitly while you study. Restate each one without looking at the list — recognition is not the interview bar; recall is.",
          "• Nonlinearity is what makes depth meaningful.",
          "• ReLU dominates hidden layers; softmax/sigmoid are output tools.",
          "• Shape-check every layer before worrying about loss curves.",
          "Production lens — Vanishing gradients shaped modern architecture choices: Deep networks trained with sigmoid activations suffered vanishing gradients; ReLU, residual connections, and proper initialization (Xavier/He) were architectural responses, not optional tweaks. Batch normalization stabilizes internal covariate shift and allows higher learning rates. Understanding these mechanisms explains why \"just add more layers\" failed before ResNet."
        ],
        "keyTerms": [
          {
            "term": "Nonlinearity is what makes depth meaningful.",
            "definition": "Nonlinearity is what makes depth meaningful."
          },
          {
            "term": "ReLU dominates hidden layers; softmax/sigmoid…",
            "definition": "ReLU dominates hidden layers; softmax/sigmoid are output tools."
          },
          {
            "term": "Shape-check every layer before worrying about",
            "definition": "Shape-check every layer before worrying about loss curves."
          }
        ],
        "workedExample": {
          "title": "NumPy forward pass for a 2-layer classifier head",
          "body": "Narrate what each shape and step is doing. If you only recognize the API call, you do not own the idea yet — rewrite the example from memory after one pass.",
          "code": "import numpy as np\n\nrng = np.random.default_rng(0)\nX = rng.normal(size=(32, 10))\nW1, b1 = rng.normal(size=(10, 64)) * 0.1, np.zeros(64)\nW2, b2 = rng.normal(size=(64, 3)) * 0.1, np.zeros(3)\nh = np.maximum(0, X @ W1 + b1)\nlogits = h @ W2 + b2\n# stable softmax\nz = logits - logits.max(axis=1, keepdims=True)\nprobs = np.exp(z) / np.exp(z).sum(axis=1, keepdims=True)\nprint(\"probs shape\", probs.shape, \"row sum\", probs.sum(axis=1)[:3].round(3))",
          "language": "python"
        },
        "checkYourself": [
          {
            "prompt": "Can trace forward and backward for a two-layer net on paper.",
            "reveal": "Deep networks trained with sigmoid activations suffered vanishing gradients; ReLU, residual connections, and proper initialization (Xavier/He) were architectural responses, not optional tweaks. Batch normalization stabilizes internal covariate shift and allows higher learning rates. Understanding these mechanisms explains why \"just add more layers\" failed before ResNet."
          }
        ]
      },
      {
        "id": "loss-backpropagation-and-parameter-updates",
        "heading": "Loss, backpropagation, and parameter updates",
        "paragraphs": [
          "Training minimizes average loss over a batch. Cross-entropy with softmax pairs cleanly with classification: gradients at the logit layer become probs - one_hot(y). Backpropagation applies the chain rule: each layer receives an upstream gradient, multiplies by local Jacobians, and produces gradients for weights and for the previous activation. In code you cache forward intermediates (pre-activations) needed for those local derivatives. SGD steps opposite the gradient; Adam tracks first/second moments for adaptive per-parameter rates. Batch size changes gradient noise and hardware efficiency. If loss is NaN, check learning rate, initialization scale, and whether labels/logits are transposed or unnormalized.",
          "Hold these points explicitly while you study. Restate each one without looking at the list — recognition is not the interview bar; recall is.",
          "• Cache forward values needed for local backward rules.",
          "• Logit-level CE gradient is probabilities minus labels.",
          "• Optimizer choice matters after the backward pass is correct.",
          "Production lens — Capacity vs regularization determines generalization: A network with more parameters than training examples can still generalize when regularized (dropout, weight decay, early stopping, data augmentation). The effective capacity is controlled by optimization trajectory and implicit regularization of SGD, not parameter count alone. Interview discussions should mention underfitting/overfitting diagnostics via train vs validation curves."
        ],
        "keyTerms": [
          {
            "term": "Cache forward values needed for local",
            "definition": "Cache forward values needed for local backward rules."
          },
          {
            "term": "Logit-level CE gradient is probabilities minus",
            "definition": "Logit-level CE gradient is probabilities minus labels."
          },
          {
            "term": "Optimizer choice matters after the backward",
            "definition": "Optimizer choice matters after the backward pass is correct."
          }
        ],
        "workedExample": {
          "title": "Tiny NumPy train step on XOR-shaped data",
          "body": "Narrate what each shape and step is doing. If you only recognize the API call, you do not own the idea yet — rewrite the example from memory after one pass.",
          "code": "import numpy as np\n\nX = np.array([[0.,0.],[0.,1.],[1.,0.],[1.,1.]])\ny = np.array([[0.],[1.],[1.],[0.]])\nrng = np.random.default_rng(1)\nW1 = rng.normal(size=(2, 8)) * 0.5\nb1 = np.zeros((1, 8))\nW2 = rng.normal(size=(8, 1)) * 0.5\nb2 = np.zeros((1, 1))\nfor step in range(2000):\n    z1 = X @ W1 + b1\n    a1 = np.maximum(0, z1)\n    z2 = a1 @ W2 + b2\n    pred = 1 / (1 + np.exp(-z2))\n    loss = (-(y*np.log(pred+1e-9)+(1-y)*np.log(1-pred+1e-9))).mean()\n    dz2 = (pred - y) / len(X)\n    dW2, db2 = a1.T @ dz2, dz2.sum(axis=0, keepdims=True)\n    da1 = dz2 @ W2.T\n    dz1 = da1 * (z1 > 0)\n    dW1, db1 = X.T @ dz1, dz1.sum(axis=0, keepdims=True)\n    lr = 0.5\n    W2 -= lr*dW2; b2 -= lr*db2; W1 -= lr*dW1; b1 -= lr*db1\n    if step % 500 == 0:\n        print(step, float(loss))\nprint(\"preds\", pred.round(3).ravel())",
          "language": "python"
        },
        "checkYourself": [
          {
            "prompt": "Understands why ReLU helps compared with saturating activations.",
            "reveal": "A network with more parameters than training examples can still generalize when regularized (dropout, weight decay, early stopping, data augmentation). The effective capacity is controlled by optimization trajectory and implicit regularization of SGD, not parameter count alone. Interview discussions should mention underfitting/overfitting diagnostics via train vs validation curves."
          }
        ]
      },
      {
        "id": "initialization-normalization-and-gradient-health",
        "heading": "Initialization, normalization, and gradient health",
        "paragraphs": [
          "Poor initialization is a silent killer. Too-large weights saturate sigmoids; too-small weights shrink signals across depth. He initialization scales ReLU layers using fan-in; Xavier targets tanh/sigmoid regimes. Batch normalization and layer normalization re-center activations to stabilize training, at the cost of subtle train/serve differences for batch norm. Gradient clipping caps exploding updates in deep or recurrent stacks. Practical debugging: histogram weights, plot gradient L2 norms by layer, and verify a single-batch overfit on a tiny subset before scaling data. If you cannot overfit 16 examples, the graph or shapes are wrong.",
          "Hold these points explicitly while you study. Restate each one without looking at the list — recognition is not the interview bar; recall is.",
          "• Match initialization to activation family.",
          "• Use a tiny overfit test as a correctness oracle.",
          "• Monitor per-layer gradient norms during unstable runs.",
          "Production lens — Vanishing gradients shaped modern architecture choices: Deep networks trained with sigmoid activations suffered vanishing gradients; ReLU, residual connections, and proper initialization (Xavier/He) were architectural responses, not optional tweaks. Batch normalization stabilizes internal covariate shift and allows higher learning rates. Understanding these mechanisms explains why \"just add more layers\" failed before ResNet."
        ],
        "keyTerms": [
          {
            "term": "Match initialization to activation family.",
            "definition": "Match initialization to activation family."
          },
          {
            "term": "Use a tiny overfit test as",
            "definition": "Use a tiny overfit test as a correctness oracle."
          },
          {
            "term": "Monitor per-layer gradient norms during unstable",
            "definition": "Monitor per-layer gradient norms during unstable runs."
          }
        ],
        "checkYourself": [
          {
            "prompt": "Can diagnose underfitting vs overfitting from curves.",
            "reveal": "Explain the idea in two sentences, name one metric or invariant you would watch, and state one mistake juniors make. Then connect it back to initialization, normalization, and gradient health."
          }
        ]
      },
      {
        "id": "regularization-and-generalization-in-deep-nets",
        "heading": "Regularization and generalization in deep nets",
        "paragraphs": [
          "Capacity without constraints memorizes. Weight decay (L2) shrinks parameters; dropout randomly masks activations during training to prevent co-adaptation; data augmentation expands effective support of the training distribution. Early stopping uses validation loss as a regularizer. Dropout must be disabled at evaluation time. For tabular problems, deep nets often lose to gradient boosting unless you have huge data or structured multimodal inputs. Choose regularization intensity with validation curves, not folklore. Document the recipe that actually moved validation metrics: augmentation and label cleaning often beat an extra layer.",
          "Hold these points explicitly while you study. Restate each one without looking at the list — recognition is not the interview bar; recall is.",
          "• Prefer validation-driven regularization over stacking tricks.",
          "• Remember train vs eval behavior for dropout and batch norm.",
          "• Do not assume deep nets beat trees on small tables.",
          "Production lens — Capacity vs regularization determines generalization: A network with more parameters than training examples can still generalize when regularized (dropout, weight decay, early stopping, data augmentation). The effective capacity is controlled by optimization trajectory and implicit regularization of SGD, not parameter count alone. Interview discussions should mention underfitting/overfitting diagnostics via train vs validation curves."
        ],
        "keyTerms": [
          {
            "term": "Prefer validation-driven regularization over …",
            "definition": "Prefer validation-driven regularization over stacking tricks."
          },
          {
            "term": "Remember train vs eval behavior for",
            "definition": "Remember train vs eval behavior for dropout and batch norm."
          },
          {
            "term": "Do not assume deep nets beat",
            "definition": "Do not assume deep nets beat trees on small tables."
          }
        ],
        "checkYourself": [
          {
            "prompt": "Knows initialization and learning-rate first-aid for NaNs.",
            "reveal": "Explain the idea in two sentences, name one metric or invariant you would watch, and state one mistake juniors make. Then connect it back to regularization and generalization in deep nets."
          }
        ]
      },
      {
        "id": "from-scratch-intuition-to-production-frameworks",
        "heading": "From scratch intuition to production frameworks",
        "paragraphs": [
          "Frameworks automate autograd, kernels, and device placement, but they do not replace understanding. When a training job diverges, you still ask: is the loss correct, are labels aligned, is the learning rate sane, are gradients flowing to early layers? Mixed precision, distributed data parallel, and checkpointing are systems concerns layered on the same math. For this course environment we implement the core loops in NumPy so Pyodide can run them; the same algorithms appear in PyTorch/TensorFlow with tensors and `.backward()`. Carry the NumPy shapes and gradient identities with you—they transfer.",
          "Hold these points explicitly while you study. Restate each one without looking at the list — recognition is not the interview bar; recall is.",
          "• Treat frameworks as accelerators for a mental model you already have.",
          "• Debug with loss correctness and gradient flow before systems knobs.",
          "• NumPy prototypes clarify what GPU kernels later hide.",
          "Production lens — Vanishing gradients shaped modern architecture choices: Deep networks trained with sigmoid activations suffered vanishing gradients; ReLU, residual connections, and proper initialization (Xavier/He) were architectural responses, not optional tweaks. Batch normalization stabilizes internal covariate shift and allows higher learning rates. Understanding these mechanisms explains why \"just add more layers\" failed before ResNet."
        ],
        "keyTerms": [
          {
            "term": "Treat frameworks as accelerators for a",
            "definition": "Treat frameworks as accelerators for a mental model you already have."
          },
          {
            "term": "Debug with loss correctness and gradient",
            "definition": "Debug with loss correctness and gradient flow before systems knobs."
          },
          {
            "term": "NumPy prototypes clarify what GPU kernels",
            "definition": "NumPy prototypes clarify what GPU kernels later hide."
          }
        ],
        "checkYourself": [
          {
            "prompt": "Can implement a tiny NumPy training loop end to end.",
            "reveal": "Explain the idea in two sentences, name one metric or invariant you would watch, and state one mistake juniors make. Then connect it back to from scratch intuition to production frameworks."
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
          "Most interview answers fail not because the definition is wrong, but because the candidate never names how the approach breaks. Use this section as a trap checklist for neural network fundamentals.",
          "Trap: Training without watching train vs validation loss. A strong answer preempts it — say what you would monitor, what fallback you would keep, or what simpler baseline you would try first.",
          "Trap: Complex architectures before a correct tiny overfit test. A strong answer preempts it — say what you would monitor, what fallback you would keep, or what simpler baseline you would try first.",
          "Trap: Learning rates copied from blogs without retuning. A strong answer preempts it — say what you would monitor, what fallback you would keep, or what simpler baseline you would try first.",
          "Trap: Forgetting eval-mode behavior for dropout/batch norm. A strong answer preempts it — say what you would monitor, what fallback you would keep, or what simpler baseline you would try first."
        ],
        "callout": {
          "tone": "warning",
          "body": "If you cannot name a failure mode, you do not yet understand the technique well enough to ship or defend it."
        },
        "checkYourself": [
          {
            "prompt": "Pick the most dangerous pitfall for Neural network fundamentals and explain how you would detect it in production or on a whiteboard.",
            "reveal": "Start with: \"Training without watching train vs validation loss.\" Then add a detection signal (metric, test, or review question) and a mitigation."
          }
        ]
      },
      {
        "id": "deeper-lens",
        "heading": "A deeper production lens",
        "paragraphs": [
          "Vanishing gradients shaped modern architecture choices. Deep networks trained with sigmoid activations suffered vanishing gradients; ReLU, residual connections, and proper initialization (Xavier/He) were architectural responses, not optional tweaks. Batch normalization stabilizes internal covariate shift and allows higher learning rates. Understanding these mechanisms explains why \"just add more layers\" failed before ResNet.",
          "Capacity vs regularization determines generalization. A network with more parameters than training examples can still generalize when regularized (dropout, weight decay, early stopping, data augmentation). The effective capacity is controlled by optimization trajectory and implicit regularization of SGD, not parameter count alone. Interview discussions should mention underfitting/overfitting diagnostics via train vs validation curves."
        ],
        "keyTerms": [
          {
            "term": "Vanishing gradients shaped modern architecture choices",
            "definition": "Deep networks trained with sigmoid activations suffered vanishing gradients; ReLU, residual connections, and proper initialization (Xavier/He) were architectural responses, not optional tweaks. Batch normalization stabil…"
          },
          {
            "term": "Capacity vs regularization determines generalization",
            "definition": "A network with more parameters than training examples can still generalize when regularized (dropout, weight decay, early stopping, data augmentation). The effective capacity is controlled by optimization trajectory and …"
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
          "You should now be able to teach neural network fundamentals as a story: what problem it solves, how the mechanism works, which assumptions it depends on, and how you would know it failed.",
          "Close the loop by writing a 90-second spoken answer out loud. If you freeze on definitions, return to the orientation and the first technical part. If you freeze on trade-offs, return to failure modes.",
          "Practice prompts from this lesson: Walk through backpropagation for a two-layer network. | Why might training loss fall while validation loss rises? | Compare SGD with momentum to Adam."
        ],
        "checkYourself": [
          {
            "prompt": "Give a 90-second spoken overview of Neural network fundamentals as if starting an interview answer.",
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
        "Can trace forward and backward for a two-layer net on paper.",
        "Understands why ReLU helps compared with saturating activations.",
        "Can diagnose underfitting vs overfitting from curves.",
        "Knows initialization and learning-rate first-aid for NaNs.",
        "Can implement a tiny NumPy training loop end to end."
      ],
      "nextSteps": [
        "Return to the lesson page and attempt the practice / topic lab with this chapter still open if needed.",
        "Revisit any Check yourself prompts you could not answer out loud.",
        "Optional deeper reading: Deep Learning (Goodfellow, Bengio, Courville) — https://www.deeplearningbook.org/",
        "Optional deeper reading: Deep Residual Learning for Image Recognition (arXiv) — https://arxiv.org/abs/1512.03385"
      ]
    }
  },
  "deep-learning/cnn-and-computer-vision": {
    "title": "Chapter: CNNs and computer vision",
    "readingTime": "55-70 min",
    "premise": "Convolutional neural networks for image classification, object detection, and segmentation tasks. This Learn chapter expands the short lesson summary into a full study unit you can read continuously, with interactive checks and selection-based AI search when a phrase needs a second opinion.",
    "parts": [
      {
        "id": "orientation",
        "heading": "Why this chapter exists",
        "paragraphs": [
          "CNNs—and their modern cousins—are the foundation of vision systems in medical imaging, moderation, robotics, and inspection. Understanding convolution geometry lets you debug shapes, receptive fields, and transfer-learning choices.",
          "This chapter treats \"CNNs and computer vision\" as a readable study unit: intuition first, then the mechanics you must be able to explain, then the failure modes that show up in interviews and production, and finally how to talk about the topic under time pressure.",
          "Read it like a book chapter. When a phrase is unclear, select it inside the Learn reader and use Search with AI to open Google, Perplexity, or DuckDuckGo without abandoning the chapter."
        ],
        "callout": {
          "tone": "tip",
          "body": "Target reading time is paced for depth, not skimming. Pause at each Check yourself prompt and answer out loud before revealing the guide answer."
        }
      },
      {
        "id": "convolution-geometry-without-framework-magic",
        "heading": "Convolution geometry without framework magic",
        "paragraphs": [
          "A convolution slides small filters across spatial positions, computing local dot products. For a single-channel input patch and a 3x3 filter, each output cell is the sum of 9 multiplies plus bias. Multiple filters produce multiple output channels. Stride controls step size; padding preserves spatial size. Pooling downsamples, buying translation tolerance and compute reduction. Parameter sharing is the point: the same edge detector runs everywhere, so you do not need a separate weight per pixel. Output size formulas are interview staples: floor((L + 2P - K)/S) + 1 for each spatial dimension. Implement these with NumPy on tiny images to own the shapes before touching GPU APIs.",
          "Hold these points explicitly while you study. Restate each one without looking at the list — recognition is not the interview bar; recall is.",
          "• Filters share weights across space; channels expand capacity.",
          "• Stride/padding/kernel determine output spatial size.",
          "• Pooling trades resolution for invariance and speed.",
          "Production lens — Inductive bias is why CNNs beat MLPs on images: Convolution enforces translation equivariance and local connectivity; pooling builds translation invariance. These biases drastically reduce parameters and sample complexity compared to fully connected layers on raw pixels. Modern vision transformers challenge this but still borrow patch embedding and hybrid designs from conv principles."
        ],
        "keyTerms": [
          {
            "term": "Filters share weights across space; channels",
            "definition": "Filters share weights across space; channels expand capacity."
          },
          {
            "term": "Stride/padding/kernel determine output spatia…",
            "definition": "Stride/padding/kernel determine output spatial size."
          },
          {
            "term": "Pooling trades resolution for invariance and",
            "definition": "Pooling trades resolution for invariance and speed."
          }
        ],
        "workedExample": {
          "title": "NumPy 2D convolution on a tiny image",
          "body": "Narrate what each shape and step is doing. If you only recognize the API call, you do not own the idea yet — rewrite the example from memory after one pass.",
          "code": "import numpy as np\n\nimg = np.array([\n    [0,0,0,0,0],\n    [0,1,1,1,0],\n    [0,1,1,1,0],\n    [0,1,1,1,0],\n    [0,0,0,0,0],\n], dtype=float)\nkernel = np.array([[1,0,-1],[1,0,-1],[1,0,-1]], dtype=float)  # vertical edge-ish\nout = np.zeros((3, 3))\nfor i in range(3):\n    for j in range(3):\n        patch = img[i:i+3, j:j+3]\n        out[i, j] = np.sum(patch * kernel)\nprint(out)",
          "language": "python"
        },
        "checkYourself": [
          {
            "prompt": "Can compute convolution output shapes by hand.",
            "reveal": "Convolution enforces translation equivariance and local connectivity; pooling builds translation invariance. These biases drastically reduce parameters and sample complexity compared to fully connected layers on raw pixels. Modern vision transformers challenge this but still borrow patch embedding and hybrid designs from conv principles."
          }
        ]
      },
      {
        "id": "stacks-receptive-fields-and-hierarchical-features",
        "heading": "Stacks, receptive fields, and hierarchical features",
        "paragraphs": [
          "Early layers respond to edges and textures; deeper layers compose object parts. Receptive field grows with kernel sizes, strides, and depth—roughly how much input context an output cell sees. Modern CNNs add batch norm, residual links, and carefully designed stages (ResNet). Residual skip connections let gradients bypass blocks, enabling deeper training. EfficientNet-style compound scaling balances depth/width/resolution. Vision Transformers patchify images and apply attention; they thrive with large data/compute but CNNs remain strong inductive biases for smaller regimes. For production, measure accuracy and latency on target hardware, not only ImageNet folklore.",
          "Hold these points explicitly while you study. Restate each one without looking at the list — recognition is not the interview bar; recall is.",
          "• Think in receptive fields when debugging context errors.",
          "• Residuals are optimization technology as much as architecture.",
          "• Choose CNN vs ViT with data size and latency constraints.",
          "Production lens — Receptive field and resolution trade-offs drive architecture: Each stacked conv layer expands the receptive field; dilated convolutions and encoder-decoder skips (U-Net) control spatial resolution for segmentation. Stride, kernel size, and feature map depth determine whether the network captures fine edges or global context. Production CV pipelines must also handle aspect ratio, color space, and augmentation policies matched to deployment data."
        ],
        "keyTerms": [
          {
            "term": "Think in receptive fields when debugging",
            "definition": "Think in receptive fields when debugging context errors."
          },
          {
            "term": "Residuals are optimization technology as much",
            "definition": "Residuals are optimization technology as much as architecture."
          },
          {
            "term": "Choose CNN vs ViT with data",
            "definition": "Choose CNN vs ViT with data size and latency constraints."
          }
        ],
        "checkYourself": [
          {
            "prompt": "Can explain weight sharing vs dense layers on images.",
            "reveal": "Each stacked conv layer expands the receptive field; dilated convolutions and encoder-decoder skips (U-Net) control spatial resolution for segmentation. Stride, kernel size, and feature map depth determine whether the network captures fine edges or global context. Production CV pipelines must also handle aspect ratio, color space, and augmentation policies matched to deployment data."
          }
        ]
      },
      {
        "id": "transfer-learning-and-data-augmentation",
        "heading": "Transfer learning and data augmentation",
        "paragraphs": [
          "With hundreds of labels, training from scratch is usually wrong. Start from ImageNet-pretrained weights, freeze early layers, train a new head, then optionally fine-tune deeper layers with a tiny learning rate. Augmentations— flips, crops, color jitter—must respect domain semantics: random vertical flips may be fine for textures but wrong for chest X-rays with orientation meaning. Class imbalance needs weighted losses or resampling. Always keep a patient-level or site-level split in medical settings to avoid leaking the same case across sets. Track whether gains come from augmentation, unfreezing, or simply better cleaning of labels.",
          "Hold these points explicitly while you study. Restate each one without looking at the list — recognition is not the interview bar; recall is.",
          "• Freeze then fine-tune when data is scarce.",
          "• Match augmentations to domain invariants.",
          "• Split on the real leakage unit (patient, camera, store).",
          "Production lens — Inductive bias is why CNNs beat MLPs on images: Convolution enforces translation equivariance and local connectivity; pooling builds translation invariance. These biases drastically reduce parameters and sample complexity compared to fully connected layers on raw pixels. Modern vision transformers challenge this but still borrow patch embedding and hybrid designs from conv principles."
        ],
        "keyTerms": [
          {
            "term": "Freeze then fine-tune when data is",
            "definition": "Freeze then fine-tune when data is scarce."
          },
          {
            "term": "Match augmentations to domain invariants.",
            "definition": "Match augmentations to domain invariants."
          },
          {
            "term": "Split on the real leakage unit",
            "definition": "Split on the real leakage unit (patient, camera, store)."
          }
        ],
        "workedExample": {
          "title": "Sklearn baseline on flattened tiny images (sanity check)",
          "body": "Narrate what each shape and step is doing. If you only recognize the API call, you do not own the idea yet — rewrite the example from memory after one pass.",
          "code": "import numpy as np\nfrom sklearn.linear_model import LogisticRegression\nfrom sklearn.model_selection import cross_val_score\n\nrng = np.random.default_rng(0)\n# 100 synthetic 8x8 \"images\", label = bright center vs not\nX_img = rng.normal(size=(200, 8, 8))\ny = (X_img[:, 3:5, 3:5].mean(axis=(1, 2)) > 0).astype(int)\nX = X_img.reshape(200, -1)\nscores = cross_val_score(LogisticRegression(max_iter=1000), X, y, cv=5)\nprint(\"flatten+logreg acc\", scores.mean().round(3))",
          "language": "python"
        },
        "checkYourself": [
          {
            "prompt": "Can design a transfer-learning plan for a small dataset.",
            "reveal": "Explain the idea in two sentences, name one metric or invariant you would watch, and state one mistake juniors make. Then connect it back to transfer learning and data augmentation."
          }
        ]
      },
      {
        "id": "detection-segmentation-and-task-heads",
        "heading": "Detection, segmentation, and task heads",
        "paragraphs": [
          "Classification is only one head. Detection adds localization (boxes) with models like YOLO or two-stage R-CNN families; segmentation predicts per-pixel classes (U-Net is classic for biomedical). Each task changes loss design, annotation cost, and latency. Multitask heads can share a backbone. Evaluation metrics change too: mAP for detection, Dice/IoU for segmentation. Do not quote top-1 ImageNet accuracy as proof your segmentation model is ready. Also plan annotation workflows: detection/segmentation labels are expensive, so active learning and weak supervision often matter as much as architecture.",
          "Hold these points explicitly while you study. Restate each one without looking at the list — recognition is not the interview bar; recall is.",
          "• Task heads dictate losses and metrics.",
          "• Annotation cost shapes feasible accuracy targets.",
          "• Shared backbones need careful freeze/fine-tune plans.",
          "Production lens — Receptive field and resolution trade-offs drive architecture: Each stacked conv layer expands the receptive field; dilated convolutions and encoder-decoder skips (U-Net) control spatial resolution for segmentation. Stride, kernel size, and feature map depth determine whether the network captures fine edges or global context. Production CV pipelines must also handle aspect ratio, color space, and augmentation policies matched to deployment data."
        ],
        "keyTerms": [
          {
            "term": "Task heads dictate losses and metrics.",
            "definition": "Task heads dictate losses and metrics."
          },
          {
            "term": "Annotation cost shapes feasible accuracy targ…",
            "definition": "Annotation cost shapes feasible accuracy targets."
          },
          {
            "term": "Shared backbones need careful freeze/fine-tun…",
            "definition": "Shared backbones need careful freeze/fine-tune plans."
          }
        ],
        "checkYourself": [
          {
            "prompt": "Knows detection/segmentation need different metrics than top-1.",
            "reveal": "Explain the idea in two sentences, name one metric or invariant you would watch, and state one mistake juniors make. Then connect it back to detection, segmentation, and task heads."
          }
        ]
      },
      {
        "id": "serving-vision-models-under-constraints",
        "heading": "Serving vision models under constraints",
        "paragraphs": [
          "Real systems care about input resolution, batching, quantization, and hardware. A 2% accuracy win that doubles GPU latency may be a product loss. Export paths (ONNX, TensorRT, CoreML) introduce numerical drift—validate. Cache embeddings for gallery search; avoid recomputing heavy backbones on unchanged images. Monitor upstream camera changes as data drift: compression, mounting angle, lighting. The modeling lesson continues into ops: store model version, preprocess version, and sample inputs for failure review when precision drops in one factory line or clinic.",
          "Hold these points explicitly while you study. Restate each one without looking at the list — recognition is not the interview bar; recall is.",
          "• Optimize for the deployment metric: accuracy at latency/cost budget.",
          "• Validate exported engines against the training framework.",
          "• Monitor sensor/preprocess drift as first-class risk.",
          "Production lens — Inductive bias is why CNNs beat MLPs on images: Convolution enforces translation equivariance and local connectivity; pooling builds translation invariance. These biases drastically reduce parameters and sample complexity compared to fully connected layers on raw pixels. Modern vision transformers challenge this but still borrow patch embedding and hybrid designs from conv principles."
        ],
        "keyTerms": [
          {
            "term": "Optimize for the deployment metric: accuracy",
            "definition": "Optimize for the deployment metric: accuracy at latency/cost budget."
          },
          {
            "term": "Validate exported engines against the training",
            "definition": "Validate exported engines against the training framework."
          },
          {
            "term": "Monitor sensor/preprocess drift as first-clas…",
            "definition": "Monitor sensor/preprocess drift as first-class risk."
          }
        ],
        "checkYourself": [
          {
            "prompt": "Connects vision quality to serving and sensor drift.",
            "reveal": "Explain the idea in two sentences, name one metric or invariant you would watch, and state one mistake juniors make. Then connect it back to serving vision models under constraints."
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
          "Most interview answers fail not because the definition is wrong, but because the candidate never names how the approach breaks. Use this section as a trap checklist for cnns and computer vision.",
          "Trap: Training from scratch on tiny datasets. A strong answer preempts it — say what you would monitor, what fallback you would keep, or what simpler baseline you would try first.",
          "Trap: Augmentations that destroy label semantics. A strong answer preempts it — say what you would monitor, what fallback you would keep, or what simpler baseline you would try first.",
          "Trap: Leaking the same patient/image across splits. A strong answer preempts it — say what you would monitor, what fallback you would keep, or what simpler baseline you would try first.",
          "Trap: Ignoring inference latency until after model selection. A strong answer preempts it — say what you would monitor, what fallback you would keep, or what simpler baseline you would try first."
        ],
        "callout": {
          "tone": "warning",
          "body": "If you cannot name a failure mode, you do not yet understand the technique well enough to ship or defend it."
        },
        "checkYourself": [
          {
            "prompt": "Pick the most dangerous pitfall for CNNs and computer vision and explain how you would detect it in production or on a whiteboard.",
            "reveal": "Start with: \"Training from scratch on tiny datasets.\" Then add a detection signal (metric, test, or review question) and a mitigation."
          }
        ]
      },
      {
        "id": "deeper-lens",
        "heading": "A deeper production lens",
        "paragraphs": [
          "Inductive bias is why CNNs beat MLPs on images. Convolution enforces translation equivariance and local connectivity; pooling builds translation invariance. These biases drastically reduce parameters and sample complexity compared to fully connected layers on raw pixels. Modern vision transformers challenge this but still borrow patch embedding and hybrid designs from conv principles.",
          "Receptive field and resolution trade-offs drive architecture. Each stacked conv layer expands the receptive field; dilated convolutions and encoder-decoder skips (U-Net) control spatial resolution for segmentation. Stride, kernel size, and feature map depth determine whether the network captures fine edges or global context. Production CV pipelines must also handle aspect ratio, color space, and augmentation policies matched to deployment data."
        ],
        "keyTerms": [
          {
            "term": "Inductive bias is why CNNs beat MLPs on images",
            "definition": "Convolution enforces translation equivariance and local connectivity; pooling builds translation invariance. These biases drastically reduce parameters and sample complexity compared to fully connected layers on raw pixe…"
          },
          {
            "term": "Receptive field and resolution trade-offs drive architecture",
            "definition": "Each stacked conv layer expands the receptive field; dilated convolutions and encoder-decoder skips (U-Net) control spatial resolution for segmentation. Stride, kernel size, and feature map depth determine whether the ne…"
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
          "You should now be able to teach cnns and computer vision as a story: what problem it solves, how the mechanism works, which assumptions it depends on, and how you would know it failed.",
          "Close the loop by writing a 90-second spoken answer out loud. If you freeze on definitions, return to the orientation and the first technical part. If you freeze on trade-offs, return to failure modes.",
          "Practice prompts from this lesson: How do skip connections help train deeper networks? | When would you use a Vision Transformer instead of a CNN? | Explain accuracy vs latency tradeoffs for mobile vision."
        ],
        "checkYourself": [
          {
            "prompt": "Give a 90-second spoken overview of CNNs and computer vision as if starting an interview answer.",
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
        "Can compute convolution output shapes by hand.",
        "Can explain weight sharing vs dense layers on images.",
        "Can design a transfer-learning plan for a small dataset.",
        "Knows detection/segmentation need different metrics than top-1.",
        "Connects vision quality to serving and sensor drift."
      ],
      "nextSteps": [
        "Return to the lesson page and attempt the practice / topic lab with this chapter still open if needed.",
        "Revisit any Check yourself prompts you could not answer out loud.",
        "Optional deeper reading: ImageNet Classification with Deep Convolutional Neural Networks (AlexNet) (NeurIPS) — https://papers.nips.cc/paper/4824-imagenet-classification-with-deep-convolutional-neural-networks",
        "Optional deeper reading: U-Net: Convolutional Networks for Biomedical Image Segmentation (arXiv) — https://arxiv.org/abs/1505.04597"
      ]
    }
  },
  "deep-learning/transformer-architecture": {
    "title": "Chapter: Transformer architecture deep dive",
    "readingTime": "60-75 min",
    "premise": "Self-attention, multi-head attention, positional encoding, and the encoder-decoder structure that powers modern NLP and beyond. This Learn chapter expands the short lesson summary into a full study unit you can read continuously, with interactive checks and selection-based AI search when a phrase needs a second opinion.",
    "parts": [
      {
        "id": "orientation",
        "heading": "Why this chapter exists",
        "paragraphs": [
          "Transformers power GPT, BERT, and most modern multimodal models. If you can implement attention and positional encoding in NumPy, architecture papers and serving constraints stop feeling opaque.",
          "This chapter treats \"Transformer architecture deep dive\" as a readable study unit: intuition first, then the mechanics you must be able to explain, then the failure modes that show up in interviews and production, and finally how to talk about the topic under time pressure.",
          "Read it like a book chapter. When a phrase is unclear, select it inside the Learn reader and use Search with AI to open Google, Perplexity, or DuckDuckGo without abandoning the chapter."
        ],
        "callout": {
          "tone": "tip",
          "body": "Target reading time is paced for depth, not skimming. Pause at each Check yourself prompt and answer out loud before revealing the guide answer."
        }
      },
      {
        "id": "scaled-dot-product-attention-as-geometry",
        "heading": "Scaled dot-product attention as geometry",
        "paragraphs": [
          "Attention asks: for each query token, how much should each key token contribute to a weighted value mixture? Scores are QK^T / sqrt(d_k); the scale keeps dot products from growing with dimension and saturating softmax. Softmax turns scores into a probability distribution over keys; multiplying by V mixes value vectors. Self-attention uses Q,K,V derived from the same sequence; cross-attention uses queries from one stream and keys/values from another. Complexity is O(n^2) in sequence length for the score matrix—central to long-context engineering. Causal masks set future positions to -inf before softmax so generators cannot peek ahead.",
          "Hold these points explicitly while you study. Restate each one without looking at the list — recognition is not the interview bar; recall is.",
          "• Attention is softmax over scaled similarities times values.",
          "• sqrt(d_k) scaling is a numerical/optimization detail with huge practical impact.",
          "• Causal masks enforce autoregressive information flow.",
          "Production lens — Self-attention is O(n²) in sequence length: The quadratic cost of full attention is the main bottleneck for long contexts. FlashAttention, sparse attention, sliding windows, and linear attention variants exist to reduce memory and compute. Positional encoding (sinusoidal, rotary/RoPE, ALiBi) injects order information because attention itself is permutation-invariant over tokens."
        ],
        "keyTerms": [
          {
            "term": "Attention is softmax over scaled similarities",
            "definition": "Attention is softmax over scaled similarities times values."
          },
          {
            "term": "sqrt(d_k) scaling is a numerical/optimization…",
            "definition": "sqrt(d_k) scaling is a numerical/optimization detail with huge practical impact."
          },
          {
            "term": "Causal masks enforce autoregressive informati…",
            "definition": "Causal masks enforce autoregressive information flow."
          }
        ],
        "workedExample": {
          "title": "NumPy scaled dot-product attention",
          "body": "Narrate what each shape and step is doing. If you only recognize the API call, you do not own the idea yet — rewrite the example from memory after one pass.",
          "code": "import numpy as np\n\ndef softmax(x, axis=-1):\n    x = x - x.max(axis=axis, keepdims=True)\n    e = np.exp(x)\n    return e / e.sum(axis=axis, keepdims=True)\n\ndef attention(Q, K, V, mask=None):\n    d = Q.shape[-1]\n    scores = Q @ K.T / np.sqrt(d)\n    if mask is not None:\n        scores = np.where(mask, scores, -1e9)\n    weights = softmax(scores)\n    return weights @ V, weights\n\nrng = np.random.default_rng(0)\nX = rng.normal(size=(4, 8))\nWq, Wk, Wv = [rng.normal(size=(8, 8)) * 0.1 for _ in range(3)]\nout, w = attention(X@Wq, X@Wk, X@Wv)\nprint(out.shape, w.round(3))",
          "language": "python"
        },
        "checkYourself": [
          {
            "prompt": "Can write scaled dot-product attention in NumPy.",
            "reveal": "The quadratic cost of full attention is the main bottleneck for long contexts. FlashAttention, sparse attention, sliding windows, and linear attention variants exist to reduce memory and compute. Positional encoding (sinusoidal, rotary/RoPE, ALiBi) injects order information because attention itself is permutation-invariant over tokens."
          }
        ]
      },
      {
        "id": "multi-head-attention-and-transformer-blocks",
        "heading": "Multi-head attention and transformer blocks",
        "paragraphs": [
          "Multi-head attention projects into several lower-dimensional subspaces, runs attention per head, concatenates, and applies an output projection. Heads can specialize (syntax vs long-range links) though specialization is not guaranteed. A transformer block typically wraps multi-head attention and an MLP with residual connections and layer normalization (pre-norm vs post-norm variants). The MLP is position-wise: same dense layers applied at each token. Residuals keep gradient highways open. Encoder-only stacks (BERT) see bidirectional context; decoder-only (GPT) use causal masks; encoder-decoder (T5) separate understanding and generation streams.",
          "Hold these points explicitly while you study. Restate each one without looking at the list — recognition is not the interview bar; recall is.",
          "• Heads are parallel attentions in subspaces.",
          "• Block = attention + MLP + residuals + norm.",
          "• Encoder/decoder variants differ mainly by masking and cross-attn.",
          "Production lens — Pre-norm vs post-norm and scaling laws matter at depth: Transformer training stability improved with pre-layer normalization and scaled residual streams. Large-model research (scaling laws) shows predictable loss improvements with compute, data, and parameters—explaining why the same architecture family scales from BERT-size encoders to hundred-billion-parameter LLMs with minimal structural change."
        ],
        "keyTerms": [
          {
            "term": "Heads are parallel attentions in subspaces.",
            "definition": "Heads are parallel attentions in subspaces."
          },
          {
            "term": "Block = attention + MLP +",
            "definition": "Block = attention + MLP + residuals + norm."
          },
          {
            "term": "Encoder/decoder variants differ mainly by mas…",
            "definition": "Encoder/decoder variants differ mainly by masking and cross-attn."
          }
        ],
        "checkYourself": [
          {
            "prompt": "Can explain multi-head concat/project.",
            "reveal": "Transformer training stability improved with pre-layer normalization and scaled residual streams. Large-model research (scaling laws) shows predictable loss improvements with compute, data, and parameters—explaining why the same architecture family scales from BERT-size encoders to hundred-billion-parameter LLMs with minimal structural change."
          }
        ]
      },
      {
        "id": "positional-information",
        "heading": "Positional information",
        "paragraphs": [
          "Pure attention is permutation-equivariant: without position signals, shuffling tokens would not change the set of interactions in a well-defined way the model can exploit for order. Sinusoidal encodings add deterministic sin/cos features of absolute position; learned positional embeddings are lookup tables; relative position biases and RoPE encode relative offsets more directly for length extrapolation stories. In practice, choosing a positional scheme interacts with context length extension methods. Implement sinusoids once so the formulas stop being mystical, then treat industrial variants as engineering refinements of the same need: inject order into set-like attention.",
          "Hold these points explicitly while you study. Restate each one without looking at the list — recognition is not the interview bar; recall is.",
          "• Attention needs an explicit order channel.",
          "• Sinusoidal PE is a teachable baseline still worth implementing.",
          "• Relative/RoPE methods target length generalization.",
          "Production lens — Self-attention is O(n²) in sequence length: The quadratic cost of full attention is the main bottleneck for long contexts. FlashAttention, sparse attention, sliding windows, and linear attention variants exist to reduce memory and compute. Positional encoding (sinusoidal, rotary/RoPE, ALiBi) injects order information because attention itself is permutation-invariant over tokens."
        ],
        "keyTerms": [
          {
            "term": "Attention needs an explicit order channel.",
            "definition": "Attention needs an explicit order channel."
          },
          {
            "term": "Sinusoidal PE is a teachable baseline",
            "definition": "Sinusoidal PE is a teachable baseline still worth implementing."
          },
          {
            "term": "Relative/RoPE methods target length generaliz…",
            "definition": "Relative/RoPE methods target length generalization."
          }
        ],
        "workedExample": {
          "title": "Sinusoidal positional encoding",
          "body": "Narrate what each shape and step is doing. If you only recognize the API call, you do not own the idea yet — rewrite the example from memory after one pass.",
          "code": "import numpy as np\n\ndef positional_encoding(max_len, d_model):\n    PE = np.zeros((max_len, d_model))\n    pos = np.arange(max_len)[:, None]\n    div = np.exp(np.arange(0, d_model, 2) * -(np.log(10000.0) / d_model))\n    PE[:, 0::2] = np.sin(pos * div)\n    PE[:, 1::2] = np.cos(pos * div)\n    return PE\n\nPE = positional_encoding(50, 64)\nfor dist in [1, 5, 10, 25]:\n    print(dist, float(np.dot(PE[0], PE[dist])))",
          "language": "python"
        },
        "checkYourself": [
          {
            "prompt": "Can implement sinusoidal positional encodings.",
            "reveal": "Explain the idea in two sentences, name one metric or invariant you would watch, and state one mistake juniors make. Then connect it back to positional information."
          }
        ]
      },
      {
        "id": "training-objectives-and-scaling-intuition",
        "heading": "Training objectives and scaling intuition",
        "paragraphs": [
          "Masked language modeling teaches bidirectional representations; causal language modeling teaches next-token prediction for generation. Seq2seq denoising objectives power many T5-style models. Scaling laws relate loss to parameters, data, and compute, guiding whether to grow model size or tokens. In interviews, separate architecture from objective from alignment stage (SFT/RLHF). For engineering, KV-cache, FlashAttention-style IO awareness, and quantization are systems responses to attention's cost. Understanding O(n^2) memory for scores explains why 128k context is not \"just a config flag.\"",
          "Hold these points explicitly while you study. Restate each one without looking at the list — recognition is not the interview bar; recall is.",
          "• Objective choice shapes capabilities more than trivia about layer counts.",
          "• Scaling is an allocation problem across model/data/compute.",
          "• Long context is primarily a systems + algorithm problem.",
          "Production lens — Pre-norm vs post-norm and scaling laws matter at depth: Transformer training stability improved with pre-layer normalization and scaled residual streams. Large-model research (scaling laws) shows predictable loss improvements with compute, data, and parameters—explaining why the same architecture family scales from BERT-size encoders to hundred-billion-parameter LLMs with minimal structural change."
        ],
        "keyTerms": [
          {
            "term": "Objective choice shapes capabilities more than",
            "definition": "Objective choice shapes capabilities more than trivia about layer counts."
          },
          {
            "term": "Scaling is an allocation problem across",
            "definition": "Scaling is an allocation problem across model/data/compute."
          },
          {
            "term": "Long context is primarily a systems",
            "definition": "Long context is primarily a systems + algorithm problem."
          }
        ],
        "checkYourself": [
          {
            "prompt": "Knows encoder-only vs decoder-only masking differences.",
            "reveal": "Explain the idea in two sentences, name one metric or invariant you would watch, and state one mistake juniors make. Then connect it back to training objectives and scaling intuition."
          }
        ]
      },
      {
        "id": "practical-debugging-of-attention-models",
        "heading": "Practical debugging of attention models",
        "paragraphs": [
          "When outputs are garbage, inspect attention weight entropy (collapse to uniform or single token), verify masks, and check whether positional encodings are added vs concatenated incorrectly. Confirm dtype/device consistency and that padding tokens are masked. For encoder stacks used as embedders, mean pooling vs CLS token is a design choice with retrieval impact. For decoders, off-by-one errors in causal masks create subtle leakage. A NumPy prototype of attention+mask on 4 tokens is a powerful interview whiteboard and a real unit-test oracle for custom kernels.",
          "Hold these points explicitly while you study. Restate each one without looking at the list — recognition is not the interview bar; recall is.",
          "• Mask bugs are the most common attention defect.",
          "• Visualize or summarize attention entropy when debugging.",
          "• Keep a tiny NumPy oracle for custom implementations.",
          "Production lens — Self-attention is O(n²) in sequence length: The quadratic cost of full attention is the main bottleneck for long contexts. FlashAttention, sparse attention, sliding windows, and linear attention variants exist to reduce memory and compute. Positional encoding (sinusoidal, rotary/RoPE, ALiBi) injects order information because attention itself is permutation-invariant over tokens."
        ],
        "keyTerms": [
          {
            "term": "Mask bugs are the most common",
            "definition": "Mask bugs are the most common attention defect."
          },
          {
            "term": "Visualize or summarize attention entropy when",
            "definition": "Visualize or summarize attention entropy when debugging."
          },
          {
            "term": "Keep a tiny NumPy oracle for",
            "definition": "Keep a tiny NumPy oracle for custom implementations."
          }
        ],
        "checkYourself": [
          {
            "prompt": "Can explain why attention is quadratic in sequence length.",
            "reveal": "Explain the idea in two sentences, name one metric or invariant you would watch, and state one mistake juniors make. Then connect it back to practical debugging of attention models."
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
          "Most interview answers fail not because the definition is wrong, but because the candidate never names how the approach breaks. Use this section as a trap checklist for transformer architecture deep dive.",
          "Trap: Forgetting causal or padding masks. A strong answer preempts it — say what you would monitor, what fallback you would keep, or what simpler baseline you would try first.",
          "Trap: Dropping sqrt(d_k) scaling and blaming the optimizer. A strong answer preempts it — say what you would monitor, what fallback you would keep, or what simpler baseline you would try first.",
          "Trap: Treating transformers as black boxes in interviews. A strong answer preempts it — say what you would monitor, what fallback you would keep, or what simpler baseline you would try first.",
          "Trap: Ignoring context-length memory costs in product design. A strong answer preempts it — say what you would monitor, what fallback you would keep, or what simpler baseline you would try first."
        ],
        "callout": {
          "tone": "warning",
          "body": "If you cannot name a failure mode, you do not yet understand the technique well enough to ship or defend it."
        },
        "checkYourself": [
          {
            "prompt": "Pick the most dangerous pitfall for Transformer architecture deep dive and explain how you would detect it in production or on a whiteboard.",
            "reveal": "Start with: \"Forgetting causal or padding masks.\" Then add a detection signal (metric, test, or review question) and a mitigation."
          }
        ]
      },
      {
        "id": "deeper-lens",
        "heading": "A deeper production lens",
        "paragraphs": [
          "Self-attention is O(n²) in sequence length. The quadratic cost of full attention is the main bottleneck for long contexts. FlashAttention, sparse attention, sliding windows, and linear attention variants exist to reduce memory and compute. Positional encoding (sinusoidal, rotary/RoPE, ALiBi) injects order information because attention itself is permutation-invariant over tokens.",
          "Pre-norm vs post-norm and scaling laws matter at depth. Transformer training stability improved with pre-layer normalization and scaled residual streams. Large-model research (scaling laws) shows predictable loss improvements with compute, data, and parameters—explaining why the same architecture family scales from BERT-size encoders to hundred-billion-parameter LLMs with minimal structural change."
        ],
        "keyTerms": [
          {
            "term": "Self-attention is O(n²) in sequence length",
            "definition": "The quadratic cost of full attention is the main bottleneck for long contexts. FlashAttention, sparse attention, sliding windows, and linear attention variants exist to reduce memory and compute. Positional encoding (sin…"
          },
          {
            "term": "Pre-norm vs post-norm and scaling laws matter at depth",
            "definition": "Transformer training stability improved with pre-layer normalization and scaled residual streams. Large-model research (scaling laws) shows predictable loss improvements with compute, data, and parameters—explaining why …"
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
          "You should now be able to teach transformer architecture deep dive as a story: what problem it solves, how the mechanism works, which assumptions it depends on, and how you would know it failed.",
          "Close the loop by writing a 90-second spoken answer out loud. If you freeze on definitions, return to the orientation and the first technical part. If you freeze on trade-offs, return to failure modes.",
          "Practice prompts from this lesson: Explain multi-head attention versus single-head. | Why do decoder-only models use causal masking? | How do scaling laws inform model size vs data size?"
        ],
        "checkYourself": [
          {
            "prompt": "Give a 90-second spoken overview of Transformer architecture deep dive as if starting an interview answer.",
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
        "Can write scaled dot-product attention in NumPy.",
        "Can explain multi-head concat/project.",
        "Can implement sinusoidal positional encodings.",
        "Knows encoder-only vs decoder-only masking differences.",
        "Can explain why attention is quadratic in sequence length."
      ],
      "nextSteps": [
        "Return to the lesson page and attempt the practice / topic lab with this chapter still open if needed.",
        "Revisit any Check yourself prompts you could not answer out loud.",
        "Optional deeper reading: Attention Is All You Need (arXiv) — https://arxiv.org/abs/1706.03762",
        "Optional deeper reading: The Illustrated Transformer (Jay Alammar) — https://jalammar.github.io/illustrated-transformer/"
      ]
    }
  }
};
