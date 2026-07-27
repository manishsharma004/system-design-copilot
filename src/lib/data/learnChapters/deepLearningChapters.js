/** @type {Record<string, import('../learnChapters.js').LessonLearnChapter>} */
export const deepLearningChapters = {
  "deep-learning/neural-network-fundamentals": {
    "title": "Chapter: Neural network fundamentals for interviews",
    "readingTime": "65-80 min",
    "premise": "A neural network interview is rarely about naming APIs. It is about explaining how signals move forward, how gradients move backward, why training sometimes fails, and which engineering choices make deep models trainable at useful scale.",
    "parts": [
      {
        "id": "from-affine-maps-to-representations",
        "heading": "The computation graph hiding inside every layer",
        "paragraphs": [
          "A feedforward neural network is a composition of simple functions. A dense layer first applies an affine map, usually written as z = xW + b, and then an activation function turns that linear score into a nonlinear feature. The affine part controls how inputs are mixed; the activation controls which regions of the input space can bend. If you remove the nonlinearities, a stack of dense layers collapses into one larger linear transformation, so depth would add parameters without adding expressive power.",
          "The most reliable interview habit is to track shapes before you track concepts. A batch matrix X with shape (batch, input_dim) multiplied by W with shape (input_dim, hidden_dim) yields hidden pre-activations with shape (batch, hidden_dim). That same thinking applies to embeddings, convolution feature maps, attention logits, and classifier heads. When a model trains poorly, shape mistakes, label alignment errors, and accidental broadcasting often explain more bugs than exotic theory.",
          "Neural networks learn representations because intermediate activations can become useful coordinate systems. Early layers often capture local or low-level patterns; later layers recombine them into task-specific evidence. This is why a network trained on images may learn edges and textures before object parts, and why a language model learns token patterns before abstract instructions. The representation view also explains transfer learning: reuse the lower or middle features when they are general, and adapt the head or upper blocks when the target task changes.",
          "An interviewer may ask why a small multilayer perceptron can separate points that a linear model cannot. The answer is not magic capacity; it is piecewise geometry. ReLU units carve the input space into regions, and each region can have its own linear behavior. Depth lets the model compose these regions hierarchically, so a compact network can represent functions that would require a very wide shallow network."
        ],
        "keyTerms": [
          {
            "term": "Affine map",
            "definition": "A linear transformation plus a bias, typically xW + b, that produces pre-activation scores."
          },
          {
            "term": "Activation function",
            "definition": "A nonlinear function such as ReLU, sigmoid, or tanh that prevents stacked layers from collapsing into one linear model."
          },
          {
            "term": "Representation",
            "definition": "An internal feature space learned by the network where the downstream task becomes easier to solve."
          }
        ],
        "checkYourself": [
          {
            "prompt": "Why is a two-layer network without activation functions no more expressive than a one-layer linear model?",
            "reveal": "The composition of linear or affine transformations is still affine, so the stack can be rewritten as one matrix and one bias."
          },
          {
            "prompt": "What shape should logits have for a batch of 32 examples and 10 classes?",
            "reveal": "They should have shape (32, 10), one score vector per example."
          }
        ],
        "callout": {
          "tone": "interview",
          "body": "When explaining a layer, say the shape, the operation, the nonlinearity, and the reason it helps. That short sequence sounds practical and avoids vague answers about \"learning features.\""
        },
        "workedExample": {
          "title": "Forward pass with explicit shapes",
          "body": "This small NumPy example shows a dense hidden layer, ReLU, and a classifier head without relying on a framework.",
          "code": "import numpy as np\n\nrng = np.random.default_rng(7)\nX = rng.normal(size=(32, 20))        # batch of 32, 20 input features\nW1 = rng.normal(size=(20, 64)) * 0.1\nb1 = np.zeros(64)\nW2 = rng.normal(size=(64, 10)) * 0.1\nb2 = np.zeros(10)\n\nz1 = X @ W1 + b1                    # (32, 64)\nh1 = np.maximum(z1, 0.0)            # ReLU keeps shape\nlogits = h1 @ W2 + b2               # (32, 10)\nprint(logits.shape)",
          "language": "python"
        }
      },
      {
        "id": "chain-rule-as-backward-plumbing",
        "heading": "Backpropagation is bookkeeping for the chain rule",
        "paragraphs": [
          "Backpropagation is not a separate learning algorithm; it is an efficient way to apply the chain rule through a computation graph. During the forward pass, each operation produces values and often caches what its derivative will need later. During the backward pass, each operation receives an upstream gradient and multiplies it by a local derivative to produce gradients for its inputs and parameters.",
          "For a dense layer z = xW + b, the gradient with respect to W is x transposed times the upstream gradient on z, summed or averaged over the batch. The gradient with respect to b is the batch sum of that same upstream gradient. The gradient with respect to x is the upstream gradient multiplied by W transposed. These formulas are just matrix-shaped versions of the chain rule, but saying them clearly is a strong interview signal.",
          "Loss functions provide the first gradient. With softmax plus cross-entropy, the derivative at the logits simplifies to probabilities minus one-hot labels, divided by the batch size if the loss is averaged. This simplification is why classification examples often appear clean on a whiteboard. The details still matter: using probabilities where logits are expected, or averaging twice, can silently slow training.",
          "Automatic differentiation frameworks build this graph for you, but they do not remove the need to reason about it. If a tensor is detached, converted to a Python number, modified in place, or passed through a nondifferentiable decision, gradients may stop or become misleading. In production debugging, knowing where gradients should flow is the difference between changing hyperparameters and fixing the actual broken graph."
        ],
        "keyTerms": [
          {
            "term": "Backpropagation",
            "definition": "An efficient reverse traversal of a computation graph that applies the chain rule to compute gradients."
          },
          {
            "term": "Upstream gradient",
            "definition": "The derivative arriving from later operations, representing how the final loss changes with the current operation's output."
          },
          {
            "term": "Local derivative",
            "definition": "The derivative of one operation with respect to its own inputs or parameters."
          }
        ],
        "checkYourself": [
          {
            "prompt": "For z = xW + b, what values from the forward pass are needed to compute dW?",
            "reveal": "You need x and the upstream gradient dz; dW is x.T @ dz for the batch."
          },
          {
            "prompt": "Why do softmax and cross-entropy often appear as a paired derivation?",
            "reveal": "Together they simplify the logit gradient to predicted probabilities minus one-hot labels, which is stable and easy to implement."
          }
        ],
        "callout": {
          "tone": "tip",
          "body": "A good backprop answer moves from final loss backward one operation at a time. Avoid jumping straight to optimizer names before gradients are correct."
        },
        "workedExample": {
          "title": "One hidden layer backward pass",
          "body": "The code uses averaged cross-entropy gradients and shows the parameter gradients for both dense layers.",
          "code": "import numpy as np\n\nrng = np.random.default_rng(3)\nX = rng.normal(size=(4, 5))\ny = np.array([0, 2, 1, 2])\nW1 = rng.normal(size=(5, 6)) * 0.1\nb1 = np.zeros(6)\nW2 = rng.normal(size=(6, 3)) * 0.1\nb2 = np.zeros(3)\n\nz1 = X @ W1 + b1\nh = np.maximum(z1, 0)\nlogits = h @ W2 + b2\nexp_logits = np.exp(logits - logits.max(axis=1, keepdims=True))\nprobs = exp_logits / exp_logits.sum(axis=1, keepdims=True)\n\nbatch = X.shape[0]\ndlogits = probs.copy()\ndlogits[np.arange(batch), y] -= 1\ndlogits /= batch\n\ndW2 = h.T @ dlogits\ndb2 = dlogits.sum(axis=0)\ndh = dlogits @ W2.T\ndz1 = dh * (z1 > 0)\ndW1 = X.T @ dz1\ndb1 = dz1.sum(axis=0)\nprint(dW1.shape, db1.shape, dW2.shape, db2.shape)",
          "language": "python"
        }
      },
      {
        "id": "gradient-pathologies-and-depth",
        "heading": "Why gradients disappear, explode, or lie",
        "paragraphs": [
          "Deep networks multiply many Jacobians during backpropagation. If the typical singular values of those Jacobians are less than one, gradients shrink as they move toward earlier layers; if they are greater than one, gradients can grow until updates become unstable. This is the core of vanishing and exploding gradients. The problem is especially visible in very deep feedforward networks and old recurrent networks because the same or similar transformations are applied many times.",
          "Saturating nonlinearities make vanishing gradients worse. Sigmoid and tanh have flat regions where their derivatives are close to zero, so a confident wrong activation can block useful learning signals. ReLU helped because its positive side has derivative one, but it introduces its own failure mode: dead ReLUs can output zero for all examples if the bias or update pushes them permanently negative. Leaky ReLU, GELU, careful learning rates, and normalization are common responses.",
          "Exploding gradients usually show up as loss spikes, NaNs, or parameter norms that grow abruptly. Gradient clipping is a practical fix when the model class is still appropriate, especially in sequence models. Clipping does not solve every issue; it limits update magnitude after gradients are computed. If the underlying cause is an excessive learning rate, unstable loss scaling, poor initialization, or invalid inputs, clipping may only delay failure.",
          "Gradients can also be misleading without numerically exploding. A badly scaled feature can dominate updates, a rare class can receive weak signal, or a saturated output can make the model look confident while learning slowly. Interviewers like this nuance because it connects math to operations: inspect activation distributions, gradient norms, loss curves, and data preprocessing before declaring an architecture inadequate."
        ],
        "keyTerms": [
          {
            "term": "Vanishing gradient",
            "definition": "A training failure where gradients become very small in earlier layers, causing slow or stalled learning."
          },
          {
            "term": "Exploding gradient",
            "definition": "A training failure where gradients become very large, often producing unstable updates or NaNs."
          },
          {
            "term": "Gradient clipping",
            "definition": "A technique that caps gradient norm or value before an optimizer step to control update size."
          }
        ],
        "checkYourself": [
          {
            "prompt": "Why did sigmoid activations make early deep networks hard to train?",
            "reveal": "Sigmoid derivatives are small in saturated regions, so repeated chain-rule multiplication can shrink gradients dramatically."
          },
          {
            "prompt": "What is one diagnostic that separates exploding gradients from ordinary overfitting?",
            "reveal": "Exploding gradients often show sudden loss spikes, NaNs, or rapidly increasing gradient and parameter norms, while overfitting shows train loss improving and validation loss worsening."
          }
        ],
        "callout": {
          "tone": "warning",
          "body": "Do not answer vanishing gradients with only \"use ReLU.\" Strong answers include initialization, normalization, residual paths, and learning-rate control."
        },
        "workedExample": {
          "title": "Toy gradient multiplication intuition",
          "body": "The scalar loop is not a full network, but it makes repeated multiplication easy to see.",
          "code": "grad = 1.0\nfor depth in [5, 20, 50]:\n    small = grad * (0.7 ** depth)\n    large = grad * (1.3 ** depth)\n    print(depth, \"vanishing-like\", round(small, 6), \"exploding-like\", round(large, 3))",
          "language": "python"
        }
      },
      {
        "id": "initialization-normalization-and-residual-routes",
        "heading": "Making deep stacks trainable",
        "paragraphs": [
          "Initialization controls the scale of activations and gradients at the start of training. Xavier or Glorot initialization keeps variance roughly stable for symmetric activations such as tanh by considering fan-in and fan-out. He initialization is better matched to ReLU-like activations because roughly half the activations may be zeroed. The goal is not to find a magical random seed; it is to avoid starting in a regime where signals immediately vanish or explode.",
          "Batch normalization normalizes intermediate activations across a mini-batch, then applies learned scale and shift parameters. This often permits higher learning rates and makes training less sensitive to initialization. In interviews, describe the training and inference difference: training uses batch statistics, while inference uses accumulated running estimates. BatchNorm also adds noise through mini-batch statistics, which can have a mild regularizing effect.",
          "Residual connections give gradients a shorter path through the network. A residual block learns F(x) and returns x + F(x), so the model can preserve an identity mapping if extra depth is not useful. This changed the practical depth limit for CNNs and influenced transformer blocks as well. The key idea is not merely \"skip connections improve accuracy\"; they improve optimization by letting information and gradients bypass difficult transformations.",
          "Layer normalization, common in transformers, normalizes across features within each example rather than across the batch. That makes it well suited to variable batch sizes and autoregressive generation. The broader lesson is that normalization is a design choice tied to tensor structure, hardware, and training dynamics. You should be able to explain why BatchNorm became standard in CNNs while LayerNorm became standard in transformer blocks."
        ],
        "keyTerms": [
          {
            "term": "Xavier initialization",
            "definition": "A weight initialization scheme designed to keep activation variance stable for tanh-like networks."
          },
          {
            "term": "He initialization",
            "definition": "A weight initialization scheme scaled for ReLU-like activations and their half-active behavior."
          },
          {
            "term": "Residual connection",
            "definition": "A skip path that adds a block's input to its transformed output, improving optimization in deep networks."
          }
        ],
        "checkYourself": [
          {
            "prompt": "Why does a residual block make it easier to train a very deep model?",
            "reveal": "The identity path gives activations and gradients a direct route through the block, so the model does not need every layer to learn a useful transformation immediately."
          },
          {
            "prompt": "What changes between BatchNorm training and inference?",
            "reveal": "Training uses current mini-batch statistics; inference uses running population estimates collected during training."
          }
        ],
        "callout": {
          "tone": "interview",
          "body": "Tie each stabilizer to the failure it addresses: initialization for signal scale, normalization for activation distribution, residual paths for gradient routing."
        },
        "workedExample": {
          "title": "He initialization scale",
          "body": "For ReLU layers, the standard deviation is commonly scaled by sqrt(2 / fan_in).",
          "code": "import numpy as np\n\nfan_in, fan_out = 128, 256\nW = np.random.default_rng(0).normal(0, np.sqrt(2 / fan_in), size=(fan_in, fan_out))\nprint(round(W.std(), 4), \"expected\", round(np.sqrt(2 / fan_in), 4))",
          "language": "python"
        }
      },
      {
        "id": "optimizers-and-generalization",
        "heading": "Adam, SGD, and the shape of an update",
        "paragraphs": [
          "Once backpropagation has produced gradients, an optimizer decides how to turn them into parameter updates. Plain stochastic gradient descent subtracts a learning-rate-scaled gradient estimate. Momentum adds a velocity term that smooths noisy gradients and can accelerate movement along consistent directions. SGD with momentum remains competitive because it is simple, predictable, and often generalizes well when tuned carefully.",
          "Adam keeps exponential moving averages of first moments and second moments of gradients. The first moment behaves like momentum; the second moment rescales updates for parameters with different gradient magnitudes. Bias correction matters early in training because both moving averages start at zero. Adam is popular for transformers, sparse gradients, and fast iteration because it is less sensitive to raw gradient scale than vanilla SGD.",
          "Adam is not automatically better than SGD. Adaptive methods can reach good training loss quickly but sometimes generalize differently, especially in vision settings where SGD with momentum and weight decay has long been strong. AdamW decouples weight decay from the adaptive gradient update, which matters because classic L2 regularization interacts awkwardly with Adam's per-parameter scaling. A practical answer compares convergence speed, tuning burden, memory overhead, and final validation behavior.",
          "Learning-rate schedules are part of the optimizer story. Warmup prevents early instability when weights and normalization statistics are not settled. Cosine decay, step decay, or one-cycle policies change the update scale over training. If a model is underfitting, overfitting, or diverging, the optimizer cannot be diagnosed without looking at schedule, batch size, gradient accumulation, weight decay, and data quality together."
        ],
        "keyTerms": [
          {
            "term": "SGD with momentum",
            "definition": "An optimizer that updates parameters using a smoothed velocity of past gradients."
          },
          {
            "term": "Adam",
            "definition": "An adaptive optimizer that uses moving averages of gradients and squared gradients to scale updates per parameter."
          },
          {
            "term": "AdamW",
            "definition": "A variant of Adam that decouples weight decay from the adaptive gradient step."
          }
        ],
        "checkYourself": [
          {
            "prompt": "Why does Adam usually need more optimizer state than SGD?",
            "reveal": "Adam stores first and second moment estimates for each parameter, while basic SGD stores no extra state and momentum SGD stores one velocity tensor."
          },
          {
            "prompt": "When might SGD with momentum be preferred over Adam?",
            "reveal": "It may be preferred when final generalization is strong, memory should be lower, or the training recipe is already well tuned, especially in many CNN vision settings."
          }
        ],
        "callout": {
          "tone": "tip",
          "body": "In interviews, avoid optimizer tribalism. Say what each optimizer tracks, what tradeoffs it creates, and what metric would decide the choice."
        },
        "workedExample": {
          "title": "One Adam update in NumPy-style pseudocode",
          "body": "This omits tensor libraries but keeps the essential state transitions.",
          "code": "g = 0.25          # current gradient for one parameter\nw = 1.0\nm, v = 0.0, 0.0\nbeta1, beta2 = 0.9, 0.999\nlr, eps = 1e-3, 1e-8\n\nt = 1\nm = beta1 * m + (1 - beta1) * g\nv = beta2 * v + (1 - beta2) * (g * g)\nm_hat = m / (1 - beta1 ** t)\nv_hat = v / (1 - beta2 ** t)\nw = w - lr * m_hat / ((v_hat ** 0.5) + eps)\nprint(round(w, 6))",
          "language": "python"
        }
      },
      {
        "id": "debugging-training-as-a-system",
        "heading": "Reading a training run like an engineer",
        "paragraphs": [
          "A neural network training run is a system made of data, model, loss, optimizer, hardware, and measurement. When it fails, start with simple invariants. Can the model overfit a tiny batch? Does the loss decrease on a few examples? Are labels in the expected range? Are inputs normalized the same way at training and inference? These checks often find pipeline bugs before model changes are necessary.",
          "Train and validation curves tell different stories. High train loss and high validation loss suggest underfitting, optimization failure, or insufficient features. Low train loss and high validation loss suggest overfitting, leakage in validation construction, or a distribution mismatch. Both curves becoming NaN points toward numerical instability. A flat loss near random baseline suggests labels, final activation, loss configuration, or learning rate may be wrong.",
          "Regularization is broader than dropout. Weight decay, data augmentation, early stopping, label smoothing, mixup, stochastic depth, and smaller models can all reduce overfitting. The right choice depends on modality and failure mode. For tabular or small-data problems, a deep model may not beat tree ensembles; saying so can be the most senior answer. Deep learning is powerful, but it is not exempt from dataset size, signal quality, and evaluation design.",
          "A final interview move is to connect mechanics to deployment. BatchNorm running statistics can break if serving data is preprocessed differently. Large models may require quantization, distillation, or pruning. A model that performs well offline can fail under class drift or changed input distributions. The fundamentals you just studied are not classroom details; they are the levers used to diagnose and maintain real systems."
        ],
        "keyTerms": [
          {
            "term": "Tiny-batch overfit test",
            "definition": "A debugging check where a model is trained on a very small batch to confirm the training loop can drive loss near zero."
          },
          {
            "term": "Regularization",
            "definition": "Techniques that reduce overfitting by constraining the model, data, objective, or training process."
          },
          {
            "term": "Distribution shift",
            "definition": "A mismatch between training, validation, or serving data distributions that can degrade model performance."
          }
        ],
        "checkYourself": [
          {
            "prompt": "What does it suggest if a model cannot overfit ten training examples?",
            "reveal": "It suggests a bug or severe optimization issue, such as wrong labels, frozen parameters, bad loss configuration, too much regularization, or an unsuitable learning rate."
          },
          {
            "prompt": "What is a concise way to distinguish underfitting from overfitting using curves?",
            "reveal": "Underfitting usually has poor train and validation performance; overfitting has strong train performance and weaker validation performance."
          }
        ],
        "callout": {
          "tone": "interview",
          "body": "When asked how to improve a model, begin with diagnostics. A measured debugging plan beats a random list of architectures."
        },
        "workedExample": {
          "title": "Minimal training-run checklist",
          "body": "This pseudocode captures the order of checks many teams use before changing architecture.",
          "code": "if loss_is_nan:\n    check_inputs_labels_lr_and_mixed_precision()\nelif cannot_overfit_tiny_batch:\n    inspect_training_loop_loss_and_frozen_parameters()\nelif train_good_validation_bad:\n    add_regularization_or_fix_validation_distribution()\nelif both_train_and_validation_poor:\n    improve_features_capacity_optimization_or_data_quality()",
          "language": "python"
        }
      }
    ],
    "wrapUp": {
      "takeaways": [
        "Backpropagation is the chain rule applied efficiently through cached forward computations.",
        "Vanishing and exploding gradients explain why initialization, normalization, residual connections, and learning-rate control matter.",
        "Adam and SGD make different tradeoffs in speed, state, tuning, and generalization.",
        "Strong deep learning interviews connect formulas to training diagnostics."
      ],
      "nextSteps": [
        "Practice deriving gradients for one dense layer by hand.",
        "Explain a failed training curve using data, loss, optimizer, and architecture hypotheses."
      ]
    }
  },
  "deep-learning/cnn-and-computer-vision": {
    "title": "Chapter: CNNs and computer vision systems",
    "readingTime": "60-75 min",
    "premise": "Convolutional networks remain the clearest way to discuss spatial inductive bias, parameter sharing, visual hierarchy, and transfer learning. Even when transformers are used for vision, CNN concepts still anchor many interview explanations.",
    "parts": [
      {
        "id": "locality-and-shared-filters",
        "heading": "Why images reward local filters",
        "paragraphs": [
          "Images have structure that dense networks ignore. Nearby pixels are more related than distant pixels, and the same pattern can appear in many locations. A convolutional layer uses a small filter that slides across the image, applying the same weights at each spatial position. This parameter sharing lets the model detect a feature such as an edge or texture wherever it appears, instead of learning a separate detector for every pixel location.",
          "A convolution filter has height, width, input channels, and output channels. For an RGB image, a 3 by 3 filter spans all three input channels and produces one response map for one output channel. A layer with 64 such filters produces 64 feature maps. The parameter count is kernel_height times kernel_width times input_channels times output_channels, plus optional biases, independent of the image's height and width.",
          "The sliding operation creates translation equivariance: if an object shifts in the input, the feature response shifts in the output. That is not full translation invariance, but it is a useful starting bias. Later pooling, striding, global averaging, and data augmentation can make predictions less sensitive to exact location. Interviewers often expect this distinction because it shows you know what convolution itself guarantees.",
          "CNNs work well not only because they reduce parameters, but because they encode a prior about visual data. A dense model can theoretically learn local edges, but it spends data and parameters rediscovering locality. A CNN begins with the assumption that local patterns matter and repeat across space. That assumption is wrong for some data, but it is very right for natural images, medical scans, satellite imagery, and many perception tasks."
        ],
        "keyTerms": [
          {
            "term": "Convolution",
            "definition": "A sliding local weighted operation that produces feature maps from spatial input."
          },
          {
            "term": "Parameter sharing",
            "definition": "Reuse of the same filter weights across spatial locations, reducing parameters and detecting patterns anywhere."
          },
          {
            "term": "Translation equivariance",
            "definition": "A property where shifting the input shifts the feature response in a corresponding way."
          }
        ],
        "checkYourself": [
          {
            "prompt": "How many weights are in a 3x3 convolution with 3 input channels and 64 output channels, ignoring bias?",
            "reveal": "3 * 3 * 3 * 64 = 1728 weights."
          },
          {
            "prompt": "Why is parameter sharing useful for object recognition?",
            "reveal": "The same visual pattern can appear in different positions, so one learned detector can be reused across the whole image."
          }
        ],
        "callout": {
          "tone": "interview",
          "body": "Say \"equivariant\" for convolution responses and reserve \"invariant\" for operations or training choices that make final predictions less location-sensitive."
        },
        "workedExample": {
          "title": "Naive 2D convolution over one channel",
          "body": "This is intentionally small and slow so the indexing is visible.",
          "code": "import numpy as np\n\nimage = np.arange(25).reshape(5, 5)\nkernel = np.array([[1, 0, -1], [1, 0, -1], [1, 0, -1]])\nout = np.zeros((3, 3))\nfor i in range(3):\n    for j in range(3):\n        patch = image[i:i+3, j:j+3]\n        out[i, j] = np.sum(patch * kernel)\nprint(out)",
          "language": "python"
        }
      },
      {
        "id": "stride-padding-and-receptive-fields",
        "heading": "Controlling the map: stride, padding, and receptive field",
        "paragraphs": [
          "A convolution layer is defined not only by kernel size but also by stride, padding, and dilation. Stride controls how far the filter moves between applications. Padding adds border values, usually zeros, so the output can preserve spatial size or avoid losing edge information too quickly. Dilation spaces out kernel elements, increasing the receptive field without increasing parameter count as much as a larger dense kernel would.",
          "Output size follows a predictable formula: floor((input + 2 * padding - dilation * (kernel - 1) - 1) / stride + 1). You do not need to memorize every variant, but you should be able to reason that larger padding increases output size, larger stride decreases it, and larger kernels or dilation consume more spatial extent. Shape reasoning is crucial because one off-by-one mismatch can break a residual addition or detection head.",
          "The receptive field is the region of the original input that can influence one later activation. Stacking 3 by 3 convolutions grows the receptive field while adding nonlinearities between local operations. This is one reason classic CNNs prefer several small kernels over one large kernel: they can represent richer functions with fewer parameters and more activation stages. However, the theoretical receptive field can be larger than the effective one, because gradients and learned weights may emphasize central pixels.",
          "Boundary handling matters in real vision systems. For classification, losing some edge detail may be acceptable. For segmentation, medical imaging, or document analysis, border predictions can matter directly. Choices such as same padding, valid padding, reflection padding, or tiling strategy can become product-quality issues rather than minor implementation details."
        ],
        "keyTerms": [
          {
            "term": "Stride",
            "definition": "The step size with which a convolution filter moves across the input."
          },
          {
            "term": "Padding",
            "definition": "Extra border values added around an input before convolution to control output size and edge handling."
          },
          {
            "term": "Receptive field",
            "definition": "The region of the original input that can affect a particular activation."
          }
        ],
        "checkYourself": [
          {
            "prompt": "What happens to spatial output size when stride increases from 1 to 2?",
            "reveal": "The output spatial dimensions usually shrink because the filter samples fewer positions."
          },
          {
            "prompt": "Why might several 3x3 convolutions be preferred over one 7x7 convolution?",
            "reveal": "They can grow receptive field with fewer parameters and add nonlinearities between operations."
          }
        ],
        "callout": {
          "tone": "tip",
          "body": "For whiteboard CNN design, write tensor sizes after each stage. It prevents most architecture mistakes."
        },
        "workedExample": {
          "title": "Output-size helper",
          "body": "This helper captures the common one-dimensional formula used for height and width separately.",
          "code": "def conv_out(n, kernel, stride=1, padding=0, dilation=1):\n    return ((n + 2 * padding - dilation * (kernel - 1) - 1) // stride) + 1\n\nprint(conv_out(224, kernel=3, stride=1, padding=1))  # same spatial size\nprint(conv_out(224, kernel=3, stride=2, padding=1))  # downsampled",
          "language": "python"
        }
      },
      {
        "id": "pooling-and-downsampling-tradeoffs",
        "heading": "Pooling as compression, not decoration",
        "paragraphs": [
          "Pooling reduces spatial resolution by summarizing neighborhoods. Max pooling keeps the strongest activation in a window, which is useful when the presence of a feature matters more than its exact position. Average pooling keeps mean evidence and is often used near classifier heads as global average pooling. Strided convolutions can also downsample and may be learned replacements for fixed pooling operations.",
          "Downsampling has two benefits: it reduces computation and increases the effective receptive field of later layers. A feature at a smaller spatial map corresponds to a larger area in the original image. This lets later layers combine broader context without every layer operating at full resolution. The tradeoff is loss of precise location, which matters for segmentation, keypoint detection, OCR, and small-object detection.",
          "Pooling contributes to local translation tolerance, but it can discard information. If a max-pooled feature fires for a cat ear, the next layer may not know the exact pixel where it occurred. For classification, that tolerance is often helpful. For dense prediction, architectures use skip connections, feature pyramids, dilated convolutions, or encoder-decoder designs to recover spatial detail.",
          "A senior vision answer treats resolution as a budget. High-resolution feature maps are expensive but preserve detail; low-resolution feature maps are cheap but abstract. Modern backbones manage this budget through stages: early layers keep more spatial size with fewer channels, while later layers use fewer locations and more channels. The pattern mirrors a broader systems idea: spend computation where information is most valuable."
        ],
        "keyTerms": [
          {
            "term": "Max pooling",
            "definition": "A downsampling operation that keeps the maximum activation in each local window."
          },
          {
            "term": "Global average pooling",
            "definition": "An operation that averages each feature map over spatial dimensions, often before classification."
          },
          {
            "term": "Feature pyramid",
            "definition": "A multi-scale representation that combines high-resolution detail with low-resolution semantic features."
          }
        ],
        "checkYourself": [
          {
            "prompt": "Why can pooling help classification but hurt segmentation?",
            "reveal": "Classification benefits from location tolerance, while segmentation needs precise spatial boundaries that pooling can remove."
          },
          {
            "prompt": "What is one learned alternative to max pooling?",
            "reveal": "A strided convolution can downsample while learning the summary operation."
          }
        ],
        "callout": {
          "tone": "warning",
          "body": "Do not describe pooling only as \"reducing overfitting.\" Its main roles are spatial compression, compute reduction, and local tolerance."
        },
        "workedExample": {
          "title": "Max pooling a tiny map",
          "body": "The output keeps one value per 2x2 window.",
          "code": "import numpy as np\n\nx = np.array([[1, 3, 2, 0], [4, 6, 1, 2], [0, 2, 8, 1], [3, 1, 5, 7]])\nout = np.zeros((2, 2), dtype=int)\nfor i in range(2):\n    for j in range(2):\n        out[i, j] = x[2*i:2*i+2, 2*j:2*j+2].max()\nprint(out)",
          "language": "python"
        }
      },
      {
        "id": "visual-hierarchy-and-backbones",
        "heading": "From edges to objects: the hierarchy story",
        "paragraphs": [
          "CNNs build visual hierarchy by composing local features into larger and more semantic patterns. Early filters may respond to edges, color contrasts, or simple textures. Middle layers may respond to motifs such as corners, repeated textures, or object parts. Later layers combine those parts into class-level evidence. This description is simplified, but it is a useful mental model for explaining why depth helps vision.",
          "Backbone architectures organize this hierarchy into stages. VGG showed that repeated small convolutions could work well but used many parameters. ResNet made much deeper networks trainable with residual blocks. EfficientNet explored compound scaling of depth, width, and resolution. MobileNet used depthwise separable convolutions to reduce compute for mobile settings. The architecture names matter less than the design pressures they reveal.",
          "Depthwise separable convolution factorizes a standard convolution into a per-channel spatial convolution followed by a 1 by 1 pointwise convolution that mixes channels. This greatly reduces multiply-adds when channel counts are high. It is a common interview example of preserving an inductive bias while changing the cost structure. The tradeoff is that cheaper blocks may need careful scaling or training recipes to match larger models.",
          "CNN features are also interpretable enough to debug. Feature map visualization, saliency methods, Grad-CAM, and error slicing can suggest whether a model uses object evidence or background shortcuts. These tools are imperfect, but they help connect hierarchy to failure analysis. In applied vision, a model that classifies cows by grass texture may pass a random validation split and fail in a new environment."
        ],
        "keyTerms": [
          {
            "term": "Backbone",
            "definition": "The main feature extractor network used before task-specific heads such as classifiers, detectors, or segmenters."
          },
          {
            "term": "Residual block",
            "definition": "A block that adds its input to a learned transformation, enabling very deep CNNs."
          },
          {
            "term": "Depthwise separable convolution",
            "definition": "A factorized convolution using spatial per-channel filtering followed by channel mixing with 1x1 convolutions."
          }
        ],
        "checkYourself": [
          {
            "prompt": "What did residual connections solve for very deep CNNs?",
            "reveal": "They improved optimization by allowing identity paths for activations and gradients."
          },
          {
            "prompt": "Why are 1x1 convolutions useful?",
            "reveal": "They mix information across channels and can change channel count without changing spatial resolution."
          }
        ],
        "callout": {
          "tone": "interview",
          "body": "When listing CNN architectures, attach each name to its idea: VGG for repeated small kernels, ResNet for residual depth, MobileNet for efficient factorization."
        },
        "workedExample": {
          "title": "Standard vs depthwise separable parameter count",
          "body": "The savings grow when input and output channel counts are large.",
          "code": "kernel = 3\ncin = 64\ncout = 128\nstandard = kernel * kernel * cin * cout\ndepthwise_separable = kernel * kernel * cin + cin * cout\nprint(standard, depthwise_separable, round(standard / depthwise_separable, 2), \"x fewer\")",
          "language": "python"
        }
      },
      {
        "id": "transfer-learning-and-data-realities",
        "heading": "Reusing vision features without fooling yourself",
        "paragraphs": [
          "Transfer learning works because many visual features are reusable. A backbone trained on a large dataset can provide edge, texture, shape, and part detectors that help a smaller target task. A common recipe freezes the backbone at first, trains a new classifier head, then optionally fine-tunes upper layers with a lower learning rate. This reduces data requirements and speeds experimentation.",
          "The amount of fine-tuning depends on similarity between source and target domains. If the target is ordinary product photos and the source is ImageNet-like, many features transfer well. If the target is ultrasound, satellite radar, histology, or industrial defects, earlier assumptions may be less useful. Domain shift can make a pretrained model confidently wrong because its features were shaped by source data biases.",
          "Data augmentation is part of transfer learning, not an afterthought. Random crops, flips, color jitter, blur, mixup, cutmix, and domain-specific transforms can improve robustness. The augmentation must preserve labels. Horizontal flips are reasonable for many object categories but wrong for text recognition or medical laterality. Good interview answers mention augmentation invariances and label semantics together.",
          "Evaluation needs careful splits. If near-duplicate images, same patients, same products, or same scenes appear in both train and validation, transfer learning can look better than it is. For deployed systems, slice metrics by lighting, device, geography, class frequency, and other operational factors. CNN performance is often limited by dataset construction as much as by architecture."
        ],
        "keyTerms": [
          {
            "term": "Transfer learning",
            "definition": "Reusing a model or features trained on one task as a starting point for another task."
          },
          {
            "term": "Fine-tuning",
            "definition": "Continuing training of pretrained weights on a target dataset, often with smaller learning rates."
          },
          {
            "term": "Data augmentation",
            "definition": "Label-preserving transformations applied to training data to improve robustness and effective dataset size."
          }
        ],
        "checkYourself": [
          {
            "prompt": "Why might you freeze a pretrained CNN backbone before fine-tuning it?",
            "reveal": "Freezing protects general features and lets the new head adapt first, which is helpful when target data is small."
          },
          {
            "prompt": "What makes an augmentation unsafe?",
            "reveal": "It is unsafe when it changes the label or creates examples unlike the intended deployment distribution."
          }
        ],
        "callout": {
          "tone": "tip",
          "body": "In transfer-learning interviews, ask about domain similarity and split hygiene before proposing a fine-tuning depth."
        },
        "workedExample": {
          "title": "Fine-tuning schedule pseudocode",
          "body": "The pattern separates head adaptation from full-model adaptation.",
          "code": "backbone.requires_grad_(False)\ntrain(classifier_head, lr=1e-3, epochs=5)\n\nbackbone.requires_grad_(True)\nset_layerwise_lr(backbone_lower=1e-5, backbone_upper=1e-4, head=1e-4)\ntrain(full_model, lr_schedule=\"cosine\", epochs=20)",
          "language": "python"
        }
      },
      {
        "id": "vision-tasks-beyond-classification",
        "heading": "Choosing heads for the job",
        "paragraphs": [
          "Image classification maps an entire image to one or more labels, but many vision systems need localization. Object detection predicts boxes and classes. Semantic segmentation predicts a class for each pixel. Instance segmentation separates individual objects of the same class. Keypoint models predict landmarks. The backbone may be similar, but the head, loss, labels, and evaluation metrics change substantially.",
          "Detection introduces the challenge of variable numbers of objects. Older systems used anchors and non-maximum suppression; newer transformer-style detectors can frame detection as set prediction. Segmentation emphasizes resolution recovery, so encoder-decoder structures, skip connections, and multi-scale features are common. A classifier that discards location too aggressively cannot simply be rebranded as a segmenter.",
          "Metrics must match the task. Accuracy can be misleading for imbalanced classification. Mean average precision is common for detection because it accounts for confidence ranking and localization thresholds. Intersection over union measures overlap for boxes or masks. Pixel accuracy can look high in segmentation when background dominates, so mean IoU or per-class metrics are often more informative.",
          "Production constraints shape architecture choice. A mobile camera app may prefer a smaller CNN with quantization and lower input resolution. A medical review tool may accept slower inference for higher sensitivity and better calibration. A warehouse detector may optimize latency under fixed lighting but need robust monitoring for camera drift. CNN interview answers become stronger when they connect model design to task and operating constraints."
        ],
        "keyTerms": [
          {
            "term": "Object detection",
            "definition": "A vision task that predicts object classes and bounding boxes within an image."
          },
          {
            "term": "Semantic segmentation",
            "definition": "A vision task that assigns a class label to each pixel."
          },
          {
            "term": "Intersection over union",
            "definition": "A metric measuring overlap between predicted and target boxes or masks."
          }
        ],
        "checkYourself": [
          {
            "prompt": "Why is classification accuracy not enough for object detection?",
            "reveal": "Detection must evaluate both class prediction and localization quality, often across confidence thresholds."
          },
          {
            "prompt": "Why do segmentation architectures often use skip connections?",
            "reveal": "Skip connections bring high-resolution spatial detail from early layers into later decoding stages."
          }
        ],
        "callout": {
          "tone": "interview",
          "body": "Start a vision-system answer by naming the task and metric. Architecture choices follow from that, not the other way around."
        },
        "workedExample": {
          "title": "Intersection over union for boxes",
          "body": "This small function computes IoU for boxes represented as x1, y1, x2, y2.",
          "code": "def iou(a, b):\n    x1 = max(a[0], b[0]); y1 = max(a[1], b[1])\n    x2 = min(a[2], b[2]); y2 = min(a[3], b[3])\n    inter = max(0, x2 - x1) * max(0, y2 - y1)\n    area_a = (a[2] - a[0]) * (a[3] - a[1])\n    area_b = (b[2] - b[0]) * (b[3] - b[1])\n    return inter / (area_a + area_b - inter)\n\nprint(round(iou([0, 0, 10, 10], [5, 5, 15, 15]), 3))",
          "language": "python"
        }
      }
    ],
    "wrapUp": {
      "takeaways": [
        "Convolution uses local filters and parameter sharing to encode a strong visual prior.",
        "Stride, padding, pooling, and receptive field control the resolution-compute tradeoff.",
        "CNN hierarchy builds from local patterns toward semantic features.",
        "Transfer learning succeeds or fails based on domain similarity, augmentation, and evaluation splits."
      ],
      "nextSteps": [
        "Practice computing convolution output sizes and parameter counts.",
        "Compare a classification, detection, and segmentation design for the same image dataset."
      ]
    }
  },
  "deep-learning/transformer-architecture": {
    "title": "Chapter: Transformer architecture for deep learning interviews",
    "readingTime": "70-85 min",
    "premise": "Transformers replaced recurrence as the default architecture for many sequence tasks because attention lets tokens exchange information directly. To explain them well, focus on QKV projections, scaled dot-product attention, multi-head structure, positional information, residual-normalized blocks, cost, and the BERT versus GPT training distinction.",
    "parts": [
      {
        "id": "tokens-as-contextual-vectors",
        "heading": "From token IDs to contextual meaning",
        "paragraphs": [
          "A transformer begins with tokenization and embeddings. Token IDs are discrete symbols, but the model operates on vectors. An embedding table maps each token ID to a dense vector, and the sequence becomes a matrix with shape (sequence_length, model_dim), or with a batch dimension in implementation. At this point, each token vector knows only its identity, not its sentence context.",
          "Self-attention is the operation that makes token representations contextual. Each token can compare itself with other tokens and gather information from them. The word \"bank\" can attend to \"river\" or \"loan\" and become different internal evidence depending on surrounding words. This is the central difference between static embeddings and transformer layer outputs.",
          "Transformers process all positions in a layer largely in parallel, unlike classic recurrent networks that step through time. Parallelism improves hardware utilization and makes long-range interaction shorter in computation graph distance. The cost is that full attention compares all token pairs, so memory and compute grow quadratically with sequence length. This tradeoff is why context length is such an important product and infrastructure constraint.",
          "The architecture is modality-flexible because tokens need not be words. They can be subword pieces, image patches, audio frames, code tokens, graph nodes, or multimodal placeholders. The attention mechanism only sees vectors and positions. The surrounding system decides how raw input becomes tokens and how output vectors become predictions."
        ],
        "keyTerms": [
          {
            "term": "Token embedding",
            "definition": "A learned vector representation looked up for each discrete token ID."
          },
          {
            "term": "Contextual representation",
            "definition": "A token vector whose value depends on surrounding tokens after attention and feedforward layers."
          },
          {
            "term": "Self-attention",
            "definition": "An operation where tokens in a sequence compute weighted combinations of other token representations from the same sequence."
          }
        ],
        "checkYourself": [
          {
            "prompt": "Why does a transformer need positional information if it already has token embeddings?",
            "reveal": "Self-attention alone is permutation-insensitive with respect to token order, so the model needs position signals to distinguish sequences with the same tokens in different orders."
          },
          {
            "prompt": "What is the main sequence-length cost of full self-attention?",
            "reveal": "It compares all token pairs, so attention scores scale as O(n^2) in sequence length."
          }
        ],
        "callout": {
          "tone": "tip",
          "body": "Separate token identity from contextual meaning. Embeddings start the representation; attention layers rewrite it using context."
        },
        "workedExample": {
          "title": "Embedding lookup shape",
          "body": "A token sequence becomes a matrix of vectors before attention begins.",
          "code": "import numpy as np\n\nvocab_size = 1000\nmodel_dim = 16\nembedding = np.random.default_rng(0).normal(size=(vocab_size, model_dim))\ntoken_ids = np.array([42, 17, 17, 901])\nx = embedding[token_ids]\nprint(x.shape)  # (sequence_length, model_dim)",
          "language": "python"
        }
      },
      {
        "id": "qkv-and-scaled-dot-product",
        "heading": "Queries, keys, values: the routing contract",
        "paragraphs": [
          "Each attention layer projects input vectors into queries, keys, and values. A query represents what a token is looking for. A key represents what a token offers for matching. A value represents the information that will be mixed into the output if attention weight is assigned. These are learned linear projections, not separate data sources. The same input token vector produces Q, K, and V through different matrices.",
          "Scaled dot-product attention computes scores as QK^T divided by the square root of the key dimension. The dot product measures query-key compatibility. The scale factor prevents large key dimensions from producing overly large logits that push softmax into saturated regions. After softmax, each row contains weights over source positions, and multiplying by V forms weighted sums of value vectors.",
          "Masks modify attention scores before softmax. Padding masks prevent attention to fake padding tokens. Causal masks prevent a position from attending to future positions during autoregressive language modeling. The mask is usually implemented by adding a very negative number to disallowed logits, making their softmax probability approximately zero. This detail matters because masking after softmax can leave probability mass in the wrong places.",
          "QKV language is useful in interviews because it avoids anthropomorphic confusion. Tokens are not literally reading each other; the model learns projections that create useful compatibility scores and information mixtures. Still, the search metaphor is practical: a query asks, keys match, and values supply content. If you can also state the matrix shapes, the explanation becomes concrete."
        ],
        "keyTerms": [
          {
            "term": "Query",
            "definition": "A learned projection used to score what information the current token should attend to."
          },
          {
            "term": "Key",
            "definition": "A learned projection used for matching against queries from other tokens."
          },
          {
            "term": "Value",
            "definition": "A learned projection whose weighted combination becomes the attention output."
          }
        ],
        "checkYourself": [
          {
            "prompt": "Why is QK^T divided by sqrt(d_k)?",
            "reveal": "The scaling keeps attention logits from growing too large as key dimension increases, which helps avoid softmax saturation."
          },
          {
            "prompt": "Where should a causal mask be applied?",
            "reveal": "It should be applied to attention logits before softmax so future positions receive effectively zero probability."
          }
        ],
        "callout": {
          "tone": "interview",
          "body": "A crisp answer: attention weights are softmax(QK^T / sqrt(d_k)); the output is those weights times V."
        },
        "workedExample": {
          "title": "Scaled dot-product attention in NumPy",
          "body": "This single-head example omits batching but shows the core math.",
          "code": "import numpy as np\n\nrng = np.random.default_rng(1)\nX = rng.normal(size=(4, 8))\nWq = rng.normal(size=(8, 8)) * 0.1\nWk = rng.normal(size=(8, 8)) * 0.1\nWv = rng.normal(size=(8, 8)) * 0.1\nQ, K, V = X @ Wq, X @ Wk, X @ Wv\nscores = Q @ K.T / np.sqrt(K.shape[-1])\nweights = np.exp(scores - scores.max(axis=-1, keepdims=True))\nweights = weights / weights.sum(axis=-1, keepdims=True)\nout = weights @ V\nprint(weights.shape, out.shape)",
          "language": "python"
        }
      },
      {
        "id": "many-heads-many-subspaces",
        "heading": "Multi-head attention as parallel views",
        "paragraphs": [
          "Multi-head attention runs several attention operations in parallel with smaller per-head dimensions. Each head has its own Q, K, and V projections, so heads can specialize in different relationships. One head might track nearby syntax, another might track long-distance agreement, and another might capture delimiter structure in code. The model is not forced into these roles, but multiple heads give it separate subspaces for different patterns.",
          "After the heads compute their outputs, the model concatenates them and applies an output projection. This lets information from separate heads mix before moving to the next sublayer. The total model dimension often stays constant: for example, a 512-dimensional model with 8 heads may use 64 dimensions per head. More heads are not free; they change memory access, projection shapes, and sometimes quality depending on scale.",
          "Multi-head attention is different from an ensemble. The heads are trained jointly inside one layer and are followed by shared projections and feedforward networks. Some heads may be redundant or prunable, especially in large models, but the architecture gives optimization a flexible set of routes. In practice, attention-head analysis can be interesting, yet attention weights alone should not be treated as a complete explanation of model behavior.",
          "Grouped-query and multi-query attention are variants that reduce inference cost by sharing key and value projections across groups or heads while keeping multiple query heads. These designs are common in efficient decoder-only language models because cached keys and values dominate memory during generation. You do not need every variant for a fundamentals interview, but mentioning the KV-cache pressure shows systems awareness."
        ],
        "keyTerms": [
          {
            "term": "Attention head",
            "definition": "One parallel attention pathway with its own learned projections and per-head representation space."
          },
          {
            "term": "Output projection",
            "definition": "A learned linear map applied after concatenating head outputs to mix information across heads."
          },
          {
            "term": "KV cache",
            "definition": "Stored keys and values from previous tokens used to speed autoregressive decoding."
          }
        ],
        "checkYourself": [
          {
            "prompt": "If model_dim is 768 and there are 12 heads, what is the usual per-head dimension?",
            "reveal": "768 / 12 = 64 dimensions per head."
          },
          {
            "prompt": "Why is multi-head attention not the same as training several independent models?",
            "reveal": "Heads are internal jointly trained pathways whose outputs are mixed inside one model, not independent predictors with separate losses."
          }
        ],
        "callout": {
          "tone": "tip",
          "body": "When describing heads, avoid claiming fixed human-readable roles unless you have evidence. Say they can learn different relationship subspaces."
        },
        "workedExample": {
          "title": "Splitting a model dimension into heads",
          "body": "Implementations reshape projections so each head can run attention over a smaller dimension.",
          "code": "import numpy as np\n\nbatch, seq, model_dim, heads = 2, 5, 12, 3\nx = np.zeros((batch, seq, model_dim))\nhead_dim = model_dim // heads\nq = x.reshape(batch, seq, heads, head_dim).transpose(0, 2, 1, 3)\nprint(q.shape)  # (batch, heads, seq, head_dim)",
          "language": "python"
        }
      },
      {
        "id": "position-and-order",
        "heading": "Giving attention a sense of order",
        "paragraphs": [
          "Self-attention compares content vectors, but by itself it does not know whether a token came first or last. Positional encoding injects order information so the model can distinguish \"dog bites man\" from \"man bites dog.\" Original transformers used sinusoidal positional encodings added to token embeddings. Many modern models use learned absolute positions, relative position biases, rotary positional embeddings, or variants tailored to longer context.",
          "Absolute positions assign information to each index. Relative methods focus on distances or pairwise offsets between tokens, which can generalize better to some sequence lengths and tasks. Rotary position embeddings rotate query and key vectors in a way that makes dot products position-aware. The implementation details vary, but the purpose is stable: attention needs an order signal because sequence meaning depends on arrangement.",
          "Position interacts with extrapolation. A model trained on short contexts may not automatically handle much longer contexts because its positional scheme, attention distribution, and data distribution were not trained for that regime. Extending context length can require interpolation, continued training, memory-efficient attention, or architecture changes. This is why long-context claims should be evaluated empirically rather than assumed from a changed configuration value.",
          "Vision transformers show the same issue in spatial form. Image patches need position embeddings because a bag of patches loses layout. For images, two-dimensional structure can be encoded directly or flattened into a sequence with learned positions. The lesson carries across modalities: once data becomes tokens, the model needs a way to recover the order or geometry that tokenization removed."
        ],
        "keyTerms": [
          {
            "term": "Positional encoding",
            "definition": "Information added or applied to token representations so the model can use sequence order."
          },
          {
            "term": "Relative position bias",
            "definition": "A learned or computed attention bias based on distance between token positions."
          },
          {
            "term": "Rotary positional embedding",
            "definition": "A method that applies position-dependent rotations to query and key vectors."
          }
        ],
        "checkYourself": [
          {
            "prompt": "Why would self-attention without positions struggle with word order?",
            "reveal": "Without position information, attention sees a set of token vectors and lacks a built-in signal for sequence arrangement."
          },
          {
            "prompt": "Why might changing max context length without training be risky?",
            "reveal": "The model may not have learned reliable positional behavior, attention patterns, or data distributions at the longer length."
          }
        ],
        "callout": {
          "tone": "warning",
          "body": "Do not treat positional encoding as a minor add-on. It is what lets a permutation-friendly attention operation model ordered data."
        },
        "workedExample": {
          "title": "Sinusoidal positional encoding sketch",
          "body": "The original transformer used sine and cosine functions at different frequencies.",
          "code": "import numpy as np\n\ndef sinusoidal_positions(seq_len, dim):\n    pos = np.arange(seq_len)[:, None]\n    i = np.arange(dim)[None, :]\n    angles = pos / np.power(10000, (2 * (i // 2)) / dim)\n    enc = np.zeros((seq_len, dim))\n    enc[:, 0::2] = np.sin(angles[:, 0::2])\n    enc[:, 1::2] = np.cos(angles[:, 1::2])\n    return enc\n\nprint(sinusoidal_positions(4, 8).round(3))",
          "language": "python"
        }
      },
      {
        "id": "block-anatomy-and-training-stability",
        "heading": "Residual paths, layer norm, and feedforward expansion",
        "paragraphs": [
          "A transformer block is more than attention. It typically contains a self-attention sublayer, a position-wise feedforward network, residual connections around each sublayer, and layer normalization. The attention sublayer mixes information across positions. The feedforward sublayer transforms each position independently, often expanding the hidden dimension and applying a nonlinearity before projecting back to model dimension.",
          "Residual connections preserve a direct route for information and gradients. Without them, very deep transformer stacks would be harder to optimize because every layer would have to transform the representation without damaging it. Layer normalization stabilizes feature scale within each token representation, which is better suited than BatchNorm for variable sequence lengths, small batches, and autoregressive inference.",
          "Transformer blocks may be post-norm or pre-norm. In post-norm designs, normalization comes after the residual addition; in pre-norm designs, normalization comes before the sublayer. Pre-norm became popular for deeper models because it often improves gradient flow, though final quality and training recipes depend on details. This is a good example of an interview theme: small block-order choices can affect whether scaling works.",
          "The feedforward network often contains most of the parameters in a transformer block. A common pattern expands from d_model to several times d_model, applies GELU or another activation, then projects back. Recent models may use gated feedforward variants such as SwiGLU. Attention decides which positions exchange information; the feedforward network gives each position nonlinear capacity after that exchange."
        ],
        "keyTerms": [
          {
            "term": "Layer normalization",
            "definition": "A normalization method that standardizes features within each example or token representation."
          },
          {
            "term": "Feedforward network",
            "definition": "The per-position MLP inside a transformer block, usually with expansion, activation, and projection."
          },
          {
            "term": "Pre-norm transformer",
            "definition": "A block layout where layer normalization is applied before attention or feedforward sublayers."
          }
        ],
        "checkYourself": [
          {
            "prompt": "Why is LayerNorm common in transformers instead of BatchNorm?",
            "reveal": "LayerNorm operates within each token representation and does not depend on batch statistics, making it suitable for variable batches and autoregressive inference."
          },
          {
            "prompt": "What role does the feedforward network play after attention?",
            "reveal": "It applies nonlinear per-position transformations, adding capacity after tokens have exchanged context."
          }
        ],
        "callout": {
          "tone": "interview",
          "body": "A complete transformer-block answer includes attention, MLP, residuals, normalization, activation, and where masks enter."
        },
        "workedExample": {
          "title": "Transformer block pseudocode",
          "body": "This pre-norm sketch shows the residual structure without implementation clutter.",
          "code": "def transformer_block(x, mask):\n    x = x + self_attention(layer_norm(x), mask=mask)\n    x = x + feed_forward(layer_norm(x))\n    return x",
          "language": "python"
        }
      },
      {
        "id": "scaling-limits-and-bert-gpt-contrast",
        "heading": "Quadratic cost, encoder-decoder choices, and BERT versus GPT",
        "paragraphs": [
          "Full attention builds an n by n score matrix for each head, so its memory and compute scale as O(n^2) with sequence length. This is manageable for short sequences and expensive for long documents, high-resolution images, or long conversations. Many efficient attention methods reduce exactness, sparsify patterns, chunk context, use recurrence-like memory, or optimize kernels, but the baseline quadratic cost is the fact interviewers expect you to state.",
          "Transformer families differ by masking and training objective. Encoder-only models use bidirectional self-attention, so each token can attend to tokens on both sides. Decoder-only models use causal self-attention, so each token can attend only to previous tokens. Encoder-decoder models use an encoder for the input and a decoder that attends causally to generated output while cross-attending to encoded input. These choices map directly to tasks.",
          "BERT is the canonical encoder-only example. It is trained with masked language modeling, where some input tokens are hidden and predicted using left and right context. This makes BERT strong for understanding tasks such as classification, retrieval embeddings, token tagging, and extractive question answering. BERT is not naturally an autoregressive generator because its pretraining does not match left-to-right text generation.",
          "GPT is the canonical decoder-only example. It is trained to predict the next token from previous tokens, using a causal mask. That objective matches generation, chat completion, code completion, and many instruction-following workflows. The same architecture can be adapted through supervised fine-tuning, preference optimization, tool use, retrieval augmentation, and system prompts, but the architectural root remains causal next-token modeling."
        ],
        "keyTerms": [
          {
            "term": "O(n^2) attention",
            "definition": "The quadratic sequence-length cost from computing pairwise attention scores among all tokens."
          },
          {
            "term": "Encoder-only transformer",
            "definition": "A transformer stack with bidirectional self-attention, commonly used for understanding tasks."
          },
          {
            "term": "Decoder-only transformer",
            "definition": "A transformer stack with causal self-attention, commonly used for autoregressive generation."
          }
        ],
        "checkYourself": [
          {
            "prompt": "Why is BERT better described as bidirectional than autoregressive?",
            "reveal": "BERT uses bidirectional attention and masked-token prediction, so tokens can use both left and right context during pretraining."
          },
          {
            "prompt": "Why does GPT use a causal mask?",
            "reveal": "The causal mask prevents a position from seeing future tokens, matching the next-token prediction objective."
          }
        ],
        "callout": {
          "tone": "interview",
          "body": "The fastest BERT-vs-GPT distinction: BERT is encoder-only and bidirectional for understanding; GPT is decoder-only and causal for generation."
        },
        "workedExample": {
          "title": "Causal mask construction",
          "body": "Allowed positions are on or below the diagonal; future positions are masked.",
          "code": "import numpy as np\n\nn = 5\nallowed = np.tril(np.ones((n, n), dtype=bool))\nlogit_mask = np.where(allowed, 0.0, -1e9)\nprint(logit_mask)",
          "language": "python"
        }
      }
    ],
    "wrapUp": {
      "takeaways": [
        "Q, K, and V are learned projections used to score compatibility and mix information.",
        "Scaled dot-product attention computes softmax(QK^T / sqrt(d_k)) V, with masks applied before softmax.",
        "Multi-head attention provides parallel relationship subspaces, then mixes them with an output projection.",
        "Positional information, residual connections, layer normalization, and feedforward networks are essential parts of the transformer block.",
        "BERT and GPT differ primarily in architecture family, attention mask, and pretraining objective."
      ],
      "nextSteps": [
        "Derive the shapes for Q, K, V, attention scores, and output in a multi-head layer.",
        "Practice explaining why full attention is O(n^2) and when that matters operationally."
      ]
    }
  }
};
