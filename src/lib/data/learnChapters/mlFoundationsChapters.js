/** @type {Record<string, import('../learnChapters.js').LessonLearnChapter>} */
export const mlFoundationsChapters = {
  "ml-foundations/math-for-ml": {
    "title": "Chapter: Mathematics for machine learning",
    "readingTime": "55-70 min",
    "premise": "Linear algebra, calculus, and probability foundations required for understanding model internals and optimization. This Learn chapter expands the short lesson summary into a full study unit you can read continuously, with interactive checks and selection-based AI search when a phrase needs a second opinion.",
    "parts": [
      {
        "id": "orientation",
        "heading": "Why this chapter exists",
        "paragraphs": [
          "Every optimization step in machine learning is a numerical story about gradients, matrices, and probability. If you can rewrite a training update as linear algebra plus a derivative, you can debug exploding losses, choose better initializations, and explain why PCA, attention, and Bayesian classifiers work instead of treating them as library magic.",
          "This chapter treats \"Mathematics for machine learning\" as a readable study unit: intuition first, then the mechanics you must be able to explain, then the failure modes that show up in interviews and production, and finally how to talk about the topic under time pressure.",
          "Read it like a book chapter. When a phrase is unclear, select it inside the Learn reader and use Search with AI to open Google, Perplexity, or DuckDuckGo without abandoning the chapter."
        ],
        "callout": {
          "tone": "tip",
          "body": "Target reading time is paced for depth, not skimming. Pause at each Check yourself prompt and answer out loud before revealing the guide answer."
        }
      },
      {
        "id": "vectors-and-matrices-as-the-language-of-data",
        "heading": "Vectors and matrices as the language of data",
        "paragraphs": [
          "Machine learning almost never operates on single scalars. A dataset with n rows and d features is an n by d matrix. A weight vector for linear regression is a d-dimensional vector. A mini-batch of embeddings is a matrix. When you multiply X by W you are applying the same linear map to every row: each feature is mixed into new coordinates. Geometrically, matrix multiplication rotates, scales, and shears space. Eigenvectors are special directions that only get scaled, not rotated; their eigenvalues tell you the stretch factor. In PCA those directions are the axes of greatest variance. In neural networks, ill-conditioned weight matrices make gradient descent zigzag. Numerical stability matters too: centering features before computing covariance and preferring stable solvers over naive inverse formulas are engineering consequences of linear algebra, not optional polish.",
          "Hold these points explicitly while you study. Restate each one without looking at the list — recognition is not the interview bar; recall is.",
          "• Represent tabular batches as matrices and think of models as maps between spaces.",
          "• Eigen/SVD structure explains PCA, low-rank adapters, and conditioning problems.",
          "• Prefer stable linear-algebra primitives over hand-rolled inverses in production code.",
          "Production lens — Gradients are local, not global: Gradient descent only guarantees convergence to a local minimum for non-convex losses like neural networks. In practice, saddle points and flat regions matter as much as sharp minima—research on loss landscape geometry shows that wide, flat minima often generalize better than narrow ones. Learning rate schedules, momentum, and adaptive optimizers exist partly to escape poor basins and navigate ill-conditioned curvature."
        ],
        "keyTerms": [
          {
            "term": "Represent tabular batches as matrices and",
            "definition": "Represent tabular batches as matrices and think of models as maps between spaces."
          },
          {
            "term": "Eigen/SVD structure explains PCA, low-rank ad…",
            "definition": "Eigen/SVD structure explains PCA, low-rank adapters, and conditioning problems."
          },
          {
            "term": "Prefer stable linear-algebra primitives over …",
            "definition": "Prefer stable linear-algebra primitives over hand-rolled inverses in production code."
          }
        ],
        "workedExample": {
          "title": "Matrix multiply as a neural-style transform",
          "body": "Narrate what each shape and step is doing. If you only recognize the API call, you do not own the idea yet — rewrite the example from memory after one pass.",
          "code": "import numpy as np\n\nX = np.array([[1.0, 2.0], [3.0, 4.0], [-1.0, 0.5]])\nW = np.array([[0.5, -0.2], [0.1, 0.8]])\nb = np.array([0.1, -0.3])\nY = X @ W + b\nprint(\"batch shape:\", X.shape)\nprint(\"transformed:\\n\", Y.round(3))\nprint(\"column means after transform:\", Y.mean(axis=0).round(3))",
          "language": "python"
        },
        "checkYourself": [
          {
            "prompt": "Can explain gradient descent as following the negative gradient with a step size.",
            "reveal": "Gradient descent only guarantees convergence to a local minimum for non-convex losses like neural networks. In practice, saddle points and flat regions matter as much as sharp minima—research on loss landscape geometry shows that wide, flat minima often generalize better than narrow ones. Learning rate schedules, momentum, and adaptive optimizers exist partly to escape poor basins and navigate ill-conditioned curvature."
          }
        ]
      },
      {
        "id": "gradients-chain-rule-and-what-optimizers-actually-do",
        "heading": "Gradients, chain rule, and what optimizers actually do",
        "paragraphs": [
          "Training is iterative minimization of a scalar loss L(theta). The gradient points toward steepest ascent, so gradient descent steps opposite that direction: theta <- theta - eta * grad. For f(x)=(x-3)^2+1 the derivative is 2(x-3); from x=10 with learning rate 0.1 you move toward 3. Partial derivatives matter because models have many parameters: each coordinate answers \"if I nudge this weight alone, how does loss change?\" Backpropagation is the chain rule applied layer by layer. Learning rate trades speed for stability. Momentum and Adam accumulate gradient history to damp oscillation in high-curvature directions. When the loss blows up, the step usually left the region where the local linear approximation is valid.",
          "Hold these points explicitly while you study. Restate each one without looking at the list — recognition is not the interview bar; recall is.",
          "• Write the update rule before touching an optimizer API.",
          "• Learning rate controls both speed and stability of the local approximation.",
          "• Momentum/Adam reshape the effective step using gradient history.",
          "Production lens — Matrix factorization connects PCA to modern ML: Singular value decomposition (SVD) and eigendecomposition underpin PCA, recommendation systems, and low-rank approximations used in model compression. Understanding that a matrix multiply is a linear transformation—and that eigenvectors reveal invariant directions—makes attention mechanisms and spectral normalization far less mysterious. Numerical stability (condition numbers, floating-point precision) is why production code uses stable decompositions rather than naive formulas."
        ],
        "keyTerms": [
          {
            "term": "Write the update rule before touching",
            "definition": "Write the update rule before touching an optimizer API."
          },
          {
            "term": "Learning rate controls both speed and",
            "definition": "Learning rate controls both speed and stability of the local approximation."
          },
          {
            "term": "Momentum/Adam reshape the effective step using",
            "definition": "Momentum/Adam reshape the effective step using gradient history."
          }
        ],
        "workedExample": {
          "title": "Gradient descent on a quadratic bowl",
          "body": "Narrate what each shape and step is doing. If you only recognize the API call, you do not own the idea yet — rewrite the example from memory after one pass.",
          "code": "import numpy as np\n\ndef f(x):\n    return (x - 3.0) ** 2 + 1.0\n\ndef grad(x):\n    return 2.0 * (x - 3.0)\n\nx = 10.0\nlr = 0.1\nfor step in range(15):\n    x = x - lr * grad(x)\n    if step % 3 == 0:\n        print(f\"step {step:2d}: x={x:.4f} f={f(x):.4f}\")\nprint(\"converged near\", round(x, 4))",
          "language": "python"
        },
        "checkYourself": [
          {
            "prompt": "Can compute a small matrix multiply and state output shapes.",
            "reveal": "Singular value decomposition (SVD) and eigendecomposition underpin PCA, recommendation systems, and low-rank approximations used in model compression. Understanding that a matrix multiply is a linear transformation—and that eigenvectors reveal invariant directions—makes attention mechanisms and spectral normalization far less mysterious. Numerical stability (condition numbers, floating-point precision) is why production code uses stable decompositions rather than naive formulas."
          }
        ]
      },
      {
        "id": "probability-as-the-language-of-uncertainty",
        "heading": "Probability as the language of uncertainty",
        "paragraphs": [
          "Models rarely produce certainty; they produce distributions. A classifier that outputs 0.9 for spam is stating a calibrated belief only if you trained and evaluated for calibration. Bayes theorem rearranges conditional probability: P(spam|words) proportional to P(words|spam) P(spam). Naive Bayes assumes word independence given the class so the joint likelihood factors into a product—wrong in reality, often useful in practice. Distributions also choose losses: squared error pairs with Gaussian noise; cross-entropy pairs with categorical predictions. Hypothesis testing keeps you honest when comparing models: a 0.01 accuracy bump on 200 validation rows may be noise. Connect each probabilistic object to a decision: priors encode base rates, likelihoods encode evidence, posteriors drive actions under cost-sensitive thresholds.",
          "Hold these points explicitly while you study. Restate each one without looking at the list — recognition is not the interview bar; recall is.",
          "• Separate model scores from calibrated probabilities.",
          "• Bayes theorem is the template for combining base rates with evidence.",
          "• Loss functions encode noise and error-cost assumptions.",
          "Production lens — Gradients are local, not global: Gradient descent only guarantees convergence to a local minimum for non-convex losses like neural networks. In practice, saddle points and flat regions matter as much as sharp minima—research on loss landscape geometry shows that wide, flat minima often generalize better than narrow ones. Learning rate schedules, momentum, and adaptive optimizers exist partly to escape poor basins and navigate ill-conditioned curvature."
        ],
        "keyTerms": [
          {
            "term": "Separate model scores from calibrated probabi…",
            "definition": "Separate model scores from calibrated probabilities."
          },
          {
            "term": "Bayes theorem is the template for",
            "definition": "Bayes theorem is the template for combining base rates with evidence."
          },
          {
            "term": "Loss functions encode noise and error-cost",
            "definition": "Loss functions encode noise and error-cost assumptions."
          }
        ],
        "checkYourself": [
          {
            "prompt": "Can apply Bayes theorem to a spam-style classification example.",
            "reveal": "Explain the idea in two sentences, name one metric or invariant you would watch, and state one mistake juniors make. Then connect it back to probability as the language of uncertainty."
          }
        ]
      },
      {
        "id": "from-calculus-intuition-to-numerical-ml-practice",
        "heading": "From calculus intuition to numerical ML practice",
        "paragraphs": [
          "Floating-point arithmetic is part of the math. Softmax can overflow if you exponentiate large logits; the fix is subtracting the max logit before exp. Log-sum-exp is the stable cousin used in losses. Vanishing and exploding signals show up whenever you multiply many Jacobians: products of numbers below one shrink to zero; products above one explode. That is why initialization scale, residual connections, and normalization layers keep signal magnitude in a trainable band. When debugging, log gradient norms per layer and activation histograms. A practitioner who can estimate \"this multiply mixes a 1024-d embedding into 12 heads of 64-d each\" is already thinking in transformer units.",
          "Hold these points explicitly while you study. Restate each one without looking at the list — recognition is not the interview bar; recall is.",
          "• Use stable softmax / log-sum-exp patterns by default.",
          "• Track gradient and activation scales when deep compositions misbehave.",
          "• Initialization and residual paths are numerical tools, not decoration.",
          "Production lens — Matrix factorization connects PCA to modern ML: Singular value decomposition (SVD) and eigendecomposition underpin PCA, recommendation systems, and low-rank approximations used in model compression. Understanding that a matrix multiply is a linear transformation—and that eigenvectors reveal invariant directions—makes attention mechanisms and spectral normalization far less mysterious. Numerical stability (condition numbers, floating-point precision) is why production code uses stable decompositions rather than naive formulas."
        ],
        "keyTerms": [
          {
            "term": "Use stable softmax / log-sum-exp patterns",
            "definition": "Use stable softmax / log-sum-exp patterns by default."
          },
          {
            "term": "Track gradient and activation scales when",
            "definition": "Track gradient and activation scales when deep compositions misbehave."
          },
          {
            "term": "Initialization and residual paths are numerical",
            "definition": "Initialization and residual paths are numerical tools, not decoration."
          }
        ],
        "checkYourself": [
          {
            "prompt": "Knows at least one numerical stability trick used in softmax or losses.",
            "reveal": "Explain the idea in two sentences, name one metric or invariant you would watch, and state one mistake juniors make. Then connect it back to from calculus intuition to numerical ml practice."
          }
        ]
      },
      {
        "id": "putting-the-pieces-together-for-model-internals",
        "heading": "Putting the pieces together for model internals",
        "paragraphs": [
          "A linear classifier is matrix multiply plus bias plus activation. A neural net stacks those maps with nonlinearities so the overall function is no longer linear. PCA compresses X via top eigenvectors of the covariance. Attention scores are scaled dot products—geometry again—followed by softmax probabilities over tokens. Retrieval uses cosine similarity, which is a normalized inner product. Keep translating each new technique back to what vector space is involved, what objective is optimized, and what distribution is assumed. The goal is not memorizing identities; it is deriving a gradient for a toy loss, explaining a matrix shape error, and arguing why a probabilistic baseline belongs in every evaluation plan.",
          "Hold these points explicitly while you study. Restate each one without looking at the list — recognition is not the interview bar; recall is.",
          "• Translate architectures into shapes, objectives, and assumptions.",
          "• Reuse geometric intuition across PCA, attention, and embeddings.",
          "• Keep a tiny NumPy mental model before jumping to frameworks.",
          "Production lens — Gradients are local, not global: Gradient descent only guarantees convergence to a local minimum for non-convex losses like neural networks. In practice, saddle points and flat regions matter as much as sharp minima—research on loss landscape geometry shows that wide, flat minima often generalize better than narrow ones. Learning rate schedules, momentum, and adaptive optimizers exist partly to escape poor basins and navigate ill-conditioned curvature."
        ],
        "keyTerms": [
          {
            "term": "Translate architectures into shapes, objectiv…",
            "definition": "Translate architectures into shapes, objectives, and assumptions."
          },
          {
            "term": "Reuse geometric intuition across PCA, attention,",
            "definition": "Reuse geometric intuition across PCA, attention, and embeddings."
          },
          {
            "term": "Keep a tiny NumPy mental model",
            "definition": "Keep a tiny NumPy mental model before jumping to frameworks."
          }
        ],
        "checkYourself": [
          {
            "prompt": "Can connect eigenvalues/SVD to PCA or low-rank structure.",
            "reveal": "Explain the idea in two sentences, name one metric or invariant you would watch, and state one mistake juniors make. Then connect it back to putting the pieces together for model internals."
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
          "Most interview answers fail not because the definition is wrong, but because the candidate never names how the approach breaks. Use this section as a trap checklist for mathematics for machine learning.",
          "Trap: Memorizing formulas without geometric or probabilistic meaning. A strong answer preempts it — say what you would monitor, what fallback you would keep, or what simpler baseline you would try first.",
          "Trap: Ignoring conditioning and floating-point issues until training diverges. A strong answer preempts it — say what you would monitor, what fallback you would keep, or what simpler baseline you would try first.",
          "Trap: Skipping simple baselines that only need linear algebra and probability. A strong answer preempts it — say what you would monitor, what fallback you would keep, or what simpler baseline you would try first.",
          "Trap: Confusing model confidence scores with true calibrated probabilities. A strong answer preempts it — say what you would monitor, what fallback you would keep, or what simpler baseline you would try first."
        ],
        "callout": {
          "tone": "warning",
          "body": "If you cannot name a failure mode, you do not yet understand the technique well enough to ship or defend it."
        },
        "checkYourself": [
          {
            "prompt": "Pick the most dangerous pitfall for Mathematics for machine learning and explain how you would detect it in production or on a whiteboard.",
            "reveal": "Start with: \"Memorizing formulas without geometric or probabilistic meaning.\" Then add a detection signal (metric, test, or review question) and a mitigation."
          }
        ]
      },
      {
        "id": "deeper-lens",
        "heading": "A deeper production lens",
        "paragraphs": [
          "Gradients are local, not global. Gradient descent only guarantees convergence to a local minimum for non-convex losses like neural networks. In practice, saddle points and flat regions matter as much as sharp minima—research on loss landscape geometry shows that wide, flat minima often generalize better than narrow ones. Learning rate schedules, momentum, and adaptive optimizers exist partly to escape poor basins and navigate ill-conditioned curvature.",
          "Matrix factorization connects PCA to modern ML. Singular value decomposition (SVD) and eigendecomposition underpin PCA, recommendation systems, and low-rank approximations used in model compression. Understanding that a matrix multiply is a linear transformation—and that eigenvectors reveal invariant directions—makes attention mechanisms and spectral normalization far less mysterious. Numerical stability (condition numbers, floating-point precision) is why production code uses stable decompositions rather than naive formulas."
        ],
        "keyTerms": [
          {
            "term": "Gradients are local, not global",
            "definition": "Gradient descent only guarantees convergence to a local minimum for non-convex losses like neural networks. In practice, saddle points and flat regions matter as much as sharp minima—research on loss landscape geometry s…"
          },
          {
            "term": "Matrix factorization connects PCA to modern ML",
            "definition": "Singular value decomposition (SVD) and eigendecomposition underpin PCA, recommendation systems, and low-rank approximations used in model compression. Understanding that a matrix multiply is a linear transformation—and t…"
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
          "You should now be able to teach mathematics for machine learning as a story: what problem it solves, how the mechanism works, which assumptions it depends on, and how you would know it failed.",
          "Close the loop by writing a 90-second spoken answer out loud. If you freeze on definitions, return to the orientation and the first technical part. If you freeze on trade-offs, return to failure modes.",
          "Practice prompts from this lesson: Why does gradient descent work, and when does it fail? | Explain the role of eigenvectors in PCA with a concrete 2D example. | How does Bayes theorem show up in a naive Bayes spam classifier?"
        ],
        "checkYourself": [
          {
            "prompt": "Give a 90-second spoken overview of Mathematics for machine learning as if starting an interview answer.",
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
        "Can explain gradient descent as following the negative gradient with a step size.",
        "Can compute a small matrix multiply and state output shapes.",
        "Can apply Bayes theorem to a spam-style classification example.",
        "Knows at least one numerical stability trick used in softmax or losses.",
        "Can connect eigenvalues/SVD to PCA or low-rank structure."
      ],
      "nextSteps": [
        "Return to the lesson page and attempt the practice / topic lab with this chapter still open if needed.",
        "Revisit any Check yourself prompts you could not answer out loud.",
        "Optional deeper reading: Mathematics for Machine Learning (Cambridge University Press) — https://mml-book.github.io/",
        "Optional deeper reading: An Introduction to Matrix Algebra (Stanford) — https://web.stanford.edu/~boyd/papers/matrix-intro.pdf"
      ]
    }
  },
  "ml-foundations/classical-ml-algorithms": {
    "title": "Chapter: Classical ML algorithms",
    "readingTime": "55-70 min",
    "premise": "Regression, classification, clustering, and ensemble methods using scikit-learn. This Learn chapter expands the short lesson summary into a full study unit you can read continuously, with interactive checks and selection-based AI search when a phrase needs a second opinion.",
    "parts": [
      {
        "id": "orientation",
        "heading": "Why this chapter exists",
        "paragraphs": [
          "Classical algorithms remain the best default for many production tabular problems and the baseline against which deep learning must justify complexity. Interviewers expect you to pick logistic regression, trees, or clustering for the right reasons: data size, feature types, interpretability, and latency—not fashion.",
          "This chapter treats \"Classical ML algorithms\" as a readable study unit: intuition first, then the mechanics you must be able to explain, then the failure modes that show up in interviews and production, and finally how to talk about the topic under time pressure.",
          "Read it like a book chapter. When a phrase is unclear, select it inside the Learn reader and use Search with AI to open Google, Perplexity, or DuckDuckGo without abandoning the chapter."
        ],
        "callout": {
          "tone": "tip",
          "body": "Target reading time is paced for depth, not skimming. Pause at each Check yourself prompt and answer out loud before revealing the guide answer."
        }
      },
      {
        "id": "start-supervised-linear-models-before-ensembles",
        "heading": "Start supervised: linear models before ensembles",
        "paragraphs": [
          "Linear and logistic regression force you to state an inductive bias: the target is roughly a weighted sum of features (after a link function for classification). That bias is a feature, not a bug. On small or mostly-linear problems they are fast, regularizable, and explainable via coefficients. Regularization (L2/L1) trades coefficient magnitude for generalization; scaling features matters because the penalty treats coefficient size as meaningful. When relationships are nonlinear and interactions dominate, tree ensembles usually win on tabular data. Still, ship a linear baseline first: if gradient boosting only beats logistic regression by a hair, the simpler model may win on monitoring, fairness review, and cold-start ops cost.",
          "Hold these points explicitly while you study. Restate each one without looking at the list — recognition is not the interview bar; recall is.",
          "• Use linear/logistic models as honest baselines with scaled features.",
          "• Interpret coefficients only after accounting for scaling and collinearity.",
          "• Escalate to trees when interactions and nonlinearity dominate.",
          "Production lens — Bias-variance trade-off is algorithm-specific: Tree ensembles reduce variance through bagging and boosting without the same bias increase that deeper single trees incur. Linear models sit at high bias / low variance; k-NN is the opposite. Interview answers should map algorithm choice to data size, feature dimensionality, and interpretability requirements—not default to the fanciest method."
        ],
        "keyTerms": [
          {
            "term": "Use linear/logistic models as honest baselines",
            "definition": "Use linear/logistic models as honest baselines with scaled features."
          },
          {
            "term": "Interpret coefficients only after accounting for",
            "definition": "Interpret coefficients only after accounting for scaling and collinearity."
          },
          {
            "term": "Escalate to trees when interactions and",
            "definition": "Escalate to trees when interactions and nonlinearity dominate."
          }
        ],
        "workedExample": {
          "title": "Compare classifiers with cross-validation",
          "body": "Narrate what each shape and step is doing. If you only recognize the API call, you do not own the idea yet — rewrite the example from memory after one pass.",
          "code": "from sklearn.datasets import load_iris\nfrom sklearn.model_selection import cross_val_score\nfrom sklearn.linear_model import LogisticRegression\nfrom sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier\n\nX, y = load_iris(return_X_y=True)\nmodels = {\n    \"Logistic Regression\": LogisticRegression(max_iter=500),\n    \"Random Forest\": RandomForestClassifier(n_estimators=100, random_state=0),\n    \"Gradient Boosting\": GradientBoostingClassifier(random_state=0),\n}\nfor name, model in models.items():\n    scores = cross_val_score(model, X, y, cv=5, scoring=\"accuracy\")\n    print(f\"{name:20s} acc={scores.mean():.3f} +/- {scores.std():.3f}\")",
          "language": "python"
        },
        "checkYourself": [
          {
            "prompt": "Can pick linear vs tree ensembles given data shape and constraints.",
            "reveal": "Tree ensembles reduce variance through bagging and boosting without the same bias increase that deeper single trees incur. Linear models sit at high bias / low variance; k-NN is the opposite. Interview answers should map algorithm choice to data size, feature dimensionality, and interpretability requirements—not default to the fanciest method."
          }
        ]
      },
      {
        "id": "trees-and-boosting-variance-bias-and-why-they-dominate-tables",
        "heading": "Trees and boosting: variance, bias, and why they dominate tables",
        "paragraphs": [
          "A decision tree partitions feature space with axis-aligned splits. Deep trees memorize; shallow trees underfit. Random forests average many deep trees trained on bootstrap samples with feature randomness, reducing variance. Gradient boosting builds trees sequentially to correct residuals, reducing bias aggressively—and overfitting if unchecked. Hyperparameters (depth, learning rate, subsample, min leaf size) are your knobs. For interviews, explain bagging versus boosting, and when monotonic constraints or shallow depths are required for policy reasons. Also remember inference cost: a 500-tree model may be fine offline but painful in a tight online latency budget.",
          "Hold these points explicitly while you study. Restate each one without looking at the list — recognition is not the interview bar; recall is.",
          "• Bagging reduces variance; boosting reduces bias (with overfitting risk).",
          "• Tune depth and learning rate with validation, not training score.",
          "• Consider latency and interpretability constraints before maxing trees.",
          "Production lens — Feature scaling changes which algorithm wins: Distance-based methods (k-NN, SVM with RBF kernel) and gradient-based optimizers are sensitive to feature scale; tree methods are not. Regularization strength in logistic regression is also scale-dependent. A strong engineer always states preprocessing assumptions when comparing model families."
        ],
        "keyTerms": [
          {
            "term": "Bagging reduces variance; boosting reduces bias",
            "definition": "Bagging reduces variance; boosting reduces bias (with overfitting risk)."
          },
          {
            "term": "Tune depth and learning rate with",
            "definition": "Tune depth and learning rate with validation, not training score."
          },
          {
            "term": "Consider latency and interpretability constra…",
            "definition": "Consider latency and interpretability constraints before maxing trees."
          }
        ],
        "checkYourself": [
          {
            "prompt": "Can explain bagging vs boosting in one minute.",
            "reveal": "Distance-based methods (k-NN, SVM with RBF kernel) and gradient-based optimizers are sensitive to feature scale; tree methods are not. Regularization strength in logistic regression is also scale-dependent. A strong engineer always states preprocessing assumptions when comparing model families."
          }
        ]
      },
      {
        "id": "unsupervised-structure-clustering-and-projection",
        "heading": "Unsupervised structure: clustering and projection",
        "paragraphs": [
          "Unsupervised methods find structure without labels. K-means assumes roughly spherical clusters and needs k. DBSCAN finds arbitrary shapes and marks noise, but density parameters are sensitive. Hierarchical clustering yields a dendrogram useful for taxonomy exploration. PCA finds orthogonal directions of variance for compression and visualization; it is linear. t-SNE/UMAP are for visualization, not blindly as supervised features. Always validate clusters with domain checks: silhouette scores help, but a \"nice\" cluster that mixes fraud and non-fraud is still wrong for the business question. Use unsupervised tools for discovery and feature ideas, then confirm with labeled evaluation whenever labels exist.",
          "Hold these points explicitly while you study. Restate each one without looking at the list — recognition is not the interview bar; recall is.",
          "• Match cluster assumptions to geometry of the data.",
          "• Treat nonlinear embeddings as visualization unless validated as features.",
          "• Validate discovered structure against domain outcomes.",
          "Production lens — Bias-variance trade-off is algorithm-specific: Tree ensembles reduce variance through bagging and boosting without the same bias increase that deeper single trees incur. Linear models sit at high bias / low variance; k-NN is the opposite. Interview answers should map algorithm choice to data size, feature dimensionality, and interpretability requirements—not default to the fanciest method."
        ],
        "keyTerms": [
          {
            "term": "Match cluster assumptions to geometry of",
            "definition": "Match cluster assumptions to geometry of the data."
          },
          {
            "term": "Treat nonlinear embeddings as visualization u…",
            "definition": "Treat nonlinear embeddings as visualization unless validated as features."
          },
          {
            "term": "Validate discovered structure against domain …",
            "definition": "Validate discovered structure against domain outcomes."
          }
        ],
        "workedExample": {
          "title": "K-means plus PCA sketch",
          "body": "Narrate what each shape and step is doing. If you only recognize the API call, you do not own the idea yet — rewrite the example from memory after one pass.",
          "code": "import numpy as np\nfrom sklearn.cluster import KMeans\nfrom sklearn.decomposition import PCA\nfrom sklearn.datasets import make_blobs\n\nX, y = make_blobs(n_samples=300, centers=3, random_state=2)\nXs = (X - X.mean(0)) / X.std(0)\nlabels = KMeans(n_clusters=3, n_init=10, random_state=2).fit_predict(Xs)\nZ = PCA(n_components=2, random_state=2).fit_transform(Xs)\nprint(\"cluster sizes:\", np.bincount(labels))\nprint(\"PCA variance ratio:\", PCA(n_components=2).fit(Xs).explained_variance_ratio_.round(3))\nprint(\"embedded shape:\", Z.shape)",
          "language": "python"
        },
        "checkYourself": [
          {
            "prompt": "Can build a leakage-safe sklearn Pipeline for mixed types.",
            "reveal": "Explain the idea in two sentences, name one metric or invariant you would watch, and state one mistake juniors make. Then connect it back to unsupervised structure: clustering and projection."
          }
        ]
      },
      {
        "id": "feature-engineering-still-moves-the-needle",
        "heading": "Feature engineering still moves the needle",
        "paragraphs": [
          "Algorithm choice matters less than representing the problem well. Missingness indicators, calibrated encodings, interaction terms, and leakage-safe aggregates often outperform a fancier model on raw columns. Pipelines in scikit-learn exist so imputation, scaling, and encoding fit inside each training fold. High-cardinality IDs are memorization traps. Target encoding can help but leaks if computed with future labels. Domain transforms (log spend, days since signup, ratio features) inject prior knowledge. Document feature contracts: type, allowed range, freshness, and owner—because production failures are often schema failures, not optimizer failures.",
          "Hold these points explicitly while you study. Restate each one without looking at the list — recognition is not the interview bar; recall is.",
          "• Prefer Pipeline/ColumnTransformer to prevent preprocessing leakage.",
          "• Be skeptical of identifiers and leakage-prone target encodings.",
          "• Invest in feature contracts as much as in estimators.",
          "Production lens — Feature scaling changes which algorithm wins: Distance-based methods (k-NN, SVM with RBF kernel) and gradient-based optimizers are sensitive to feature scale; tree methods are not. Regularization strength in logistic regression is also scale-dependent. A strong engineer always states preprocessing assumptions when comparing model families."
        ],
        "keyTerms": [
          {
            "term": "Prefer Pipeline/ColumnTransformer to prevent …",
            "definition": "Prefer Pipeline/ColumnTransformer to prevent preprocessing leakage."
          },
          {
            "term": "Be skeptical of identifiers and leakage-prone",
            "definition": "Be skeptical of identifiers and leakage-prone target encodings."
          },
          {
            "term": "Invest in feature contracts as much",
            "definition": "Invest in feature contracts as much as in estimators."
          }
        ],
        "checkYourself": [
          {
            "prompt": "Knows when clustering results are hypotheses, not truths.",
            "reveal": "Explain the idea in two sentences, name one metric or invariant you would watch, and state one mistake juniors make. Then connect it back to feature engineering still moves the needle."
          }
        ]
      },
      {
        "id": "model-selection-as-an-engineering-decision",
        "heading": "Model selection as an engineering decision",
        "paragraphs": [
          "Choose models with constraints: data volume, sparsity, need for probabilities, human explainability, training frequency, and serving hardware. SVMs can work in high dimensions with clear margins but scale poorly to huge datasets. k-NN is a strong sanity check and can be productionized with ANN indexes, yet suffers in high dimensions without good features. Ensembles win many Kaggle-style tabular contests; linear models win many regulated scoring systems. The professional move is a ladder: baseline -> strong classical -> only then deep models if the delta justifies ops complexity. Record the comparison protocol so \"we tried the simple model\" is evidence, not folklore.",
          "Hold these points explicitly while you study. Restate each one without looking at the list — recognition is not the interview bar; recall is.",
          "• Define constraints before picking an algorithm family.",
          "• Compare models with the same splits and the metric that matches cost.",
          "• Escalate complexity only when measured gains justify ops burden.",
          "Production lens — Bias-variance trade-off is algorithm-specific: Tree ensembles reduce variance through bagging and boosting without the same bias increase that deeper single trees incur. Linear models sit at high bias / low variance; k-NN is the opposite. Interview answers should map algorithm choice to data size, feature dimensionality, and interpretability requirements—not default to the fanciest method."
        ],
        "keyTerms": [
          {
            "term": "Define constraints before picking an algorithm",
            "definition": "Define constraints before picking an algorithm family."
          },
          {
            "term": "Compare models with the same splits",
            "definition": "Compare models with the same splits and the metric that matches cost."
          },
          {
            "term": "Escalate complexity only when measured gains",
            "definition": "Escalate complexity only when measured gains justify ops burden."
          }
        ],
        "checkYourself": [
          {
            "prompt": "Establishes a simple baseline before complex methods.",
            "reveal": "Explain the idea in two sentences, name one metric or invariant you would watch, and state one mistake juniors make. Then connect it back to model selection as an engineering decision."
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
          "Most interview answers fail not because the definition is wrong, but because the candidate never names how the approach breaks. Use this section as a trap checklist for classical ml algorithms.",
          "Trap: Reaching for deep learning on small tabular datasets by default. A strong answer preempts it — say what you would monitor, what fallback you would keep, or what simpler baseline you would try first.",
          "Trap: Fitting preprocessors on all data before cross-validation. A strong answer preempts it — say what you would monitor, what fallback you would keep, or what simpler baseline you would try first.",
          "Trap: Reporting training accuracy as if it were generalization. A strong answer preempts it — say what you would monitor, what fallback you would keep, or what simpler baseline you would try first.",
          "Trap: Treating t-SNE coordinates as supervised features without validation. A strong answer preempts it — say what you would monitor, what fallback you would keep, or what simpler baseline you would try first."
        ],
        "callout": {
          "tone": "warning",
          "body": "If you cannot name a failure mode, you do not yet understand the technique well enough to ship or defend it."
        },
        "checkYourself": [
          {
            "prompt": "Pick the most dangerous pitfall for Classical ML algorithms and explain how you would detect it in production or on a whiteboard.",
            "reveal": "Start with: \"Reaching for deep learning on small tabular datasets by default.\" Then add a detection signal (metric, test, or review question) and a mitigation."
          }
        ]
      },
      {
        "id": "deeper-lens",
        "heading": "A deeper production lens",
        "paragraphs": [
          "Bias-variance trade-off is algorithm-specific. Tree ensembles reduce variance through bagging and boosting without the same bias increase that deeper single trees incur. Linear models sit at high bias / low variance; k-NN is the opposite. Interview answers should map algorithm choice to data size, feature dimensionality, and interpretability requirements—not default to the fanciest method.",
          "Feature scaling changes which algorithm wins. Distance-based methods (k-NN, SVM with RBF kernel) and gradient-based optimizers are sensitive to feature scale; tree methods are not. Regularization strength in logistic regression is also scale-dependent. A strong engineer always states preprocessing assumptions when comparing model families."
        ],
        "keyTerms": [
          {
            "term": "Bias-variance trade-off is algorithm-specific",
            "definition": "Tree ensembles reduce variance through bagging and boosting without the same bias increase that deeper single trees incur. Linear models sit at high bias / low variance; k-NN is the opposite. Interview answers should map…"
          },
          {
            "term": "Feature scaling changes which algorithm wins",
            "definition": "Distance-based methods (k-NN, SVM with RBF kernel) and gradient-based optimizers are sensitive to feature scale; tree methods are not. Regularization strength in logistic regression is also scale-dependent. A strong engi…"
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
          "You should now be able to teach classical ml algorithms as a story: what problem it solves, how the mechanism works, which assumptions it depends on, and how you would know it failed.",
          "Close the loop by writing a 90-second spoken answer out loud. If you freeze on definitions, return to the orientation and the first technical part. If you freeze on trade-offs, return to failure modes.",
          "Practice prompts from this lesson: When would you choose logistic regression over a neural network? | Explain the bias-variance tradeoff with a concrete tabular example. | How does gradient boosting differ from random forests?"
        ],
        "checkYourself": [
          {
            "prompt": "Give a 90-second spoken overview of Classical ML algorithms as if starting an interview answer.",
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
        "Can pick linear vs tree ensembles given data shape and constraints.",
        "Can explain bagging vs boosting in one minute.",
        "Can build a leakage-safe sklearn Pipeline for mixed types.",
        "Knows when clustering results are hypotheses, not truths.",
        "Establishes a simple baseline before complex methods."
      ],
      "nextSteps": [
        "Return to the lesson page and attempt the practice / topic lab with this chapter still open if needed.",
        "Revisit any Check yourself prompts you could not answer out loud.",
        "Optional deeper reading: scikit-learn User Guide — Supervised Learning (scikit-learn) — https://scikit-learn.org/stable/supervised_learning.html",
        "Optional deeper reading: XGBoost: A Scalable Tree Boosting System (arXiv) — https://arxiv.org/abs/1603.02754"
      ]
    }
  },
  "ml-foundations/model-evaluation": {
    "title": "Chapter: Model evaluation and validation",
    "readingTime": "55-70 min",
    "premise": "Cross-validation, metrics selection, overfitting detection, and experiment tracking best practices. This Learn chapter expands the short lesson summary into a full study unit you can read continuously, with interactive checks and selection-based AI search when a phrase needs a second opinion.",
    "parts": [
      {
        "id": "orientation",
        "heading": "Why this chapter exists",
        "paragraphs": [
          "A model that looks great on the wrong split or the wrong metric becomes a production incident. Evaluation design—splits, metrics, calibration, and uncertainty—is how you turn modeling into a trustworthy decision system.",
          "This chapter treats \"Model evaluation and validation\" as a readable study unit: intuition first, then the mechanics you must be able to explain, then the failure modes that show up in interviews and production, and finally how to talk about the topic under time pressure.",
          "Read it like a book chapter. When a phrase is unclear, select it inside the Learn reader and use Search with AI to open Google, Perplexity, or DuckDuckGo without abandoning the chapter."
        ],
        "callout": {
          "tone": "tip",
          "body": "Target reading time is paced for depth, not skimming. Pause at each Check yourself prompt and answer out loud before revealing the guide answer."
        }
      },
      {
        "id": "splits-are-contracts-not-formalities",
        "heading": "Splits are contracts, not formalities",
        "paragraphs": [
          "Train data fits parameters, validation data chooses modeling decisions, and test data is a locked final estimate. Random row splits lie when users, sessions, or time create dependence across rows. If the same customer appears in train and test, leakage inflates scores. Time-based splits respect causality for forecasting and many product metrics. Grouped splits keep entire users or hospitals on one side. Nested cross-validation separates model selection variance from final estimation when you tune aggressively. Write the split rule down; if two engineers cannot reproduce the same membership, your leaderboard is theater.",
          "Hold these points explicitly while you study. Restate each one without looking at the list — recognition is not the interview bar; recall is.",
          "• Match split strategy to leakage structure (time, group, label).",
          "• Keep a true holdout that is not used for iterative tuning.",
          "• Document split seeds and membership rules for reproducibility.",
          "Production lens — A single holdout split lies more than you think: Random train/test splits underestimate variance when data is temporally correlated or grouped (users, sessions, patients). K-fold cross-validation gives a better variance estimate but still leaks if folds are not constructed with the right grouping unit. Time-series and nested cross-validation exist precisely because naive splitting produces overconfident metrics."
        ],
        "keyTerms": [
          {
            "term": "Match split strategy to leakage structure",
            "definition": "Match split strategy to leakage structure (time, group, label)."
          },
          {
            "term": "Keep a true holdout that is",
            "definition": "Keep a true holdout that is not used for iterative tuning."
          },
          {
            "term": "Document split seeds and membership rules",
            "definition": "Document split seeds and membership rules for reproducibility."
          }
        ],
        "workedExample": {
          "title": "Stratified vs plain KFold on imbalance",
          "body": "Narrate what each shape and step is doing. If you only recognize the API call, you do not own the idea yet — rewrite the example from memory after one pass.",
          "code": "from sklearn.datasets import make_classification\nfrom sklearn.model_selection import KFold, StratifiedKFold, cross_val_score\nfrom sklearn.ensemble import RandomForestClassifier\n\nX, y = make_classification(n_samples=500, weights=[0.9, 0.1], random_state=42)\nmodel = RandomForestClassifier(random_state=42)\nfor name, cv in {\n    \"KFold\": KFold(n_splits=5, shuffle=True, random_state=42),\n    \"StratifiedKFold\": StratifiedKFold(n_splits=5, shuffle=True, random_state=42),\n}.items():\n    acc = cross_val_score(model, X, y, cv=cv, scoring=\"accuracy\")\n    f1 = cross_val_score(model, X, y, cv=cv, scoring=\"f1\")\n    print(f\"{name}: acc={acc.mean():.3f} f1={f1.mean():.3f}\")",
          "language": "python"
        },
        "checkYourself": [
          {
            "prompt": "Can choose split strategy for time/group leakage risks.",
            "reveal": "Random train/test splits underestimate variance when data is temporally correlated or grouped (users, sessions, patients). K-fold cross-validation gives a better variance estimate but still leaks if folds are not constructed with the right grouping unit. Time-series and nested cross-validation exist precisely because naive splitting produces overconfident metrics."
          }
        ]
      },
      {
        "id": "metrics-must-match-the-decision-and-the-costs",
        "heading": "Metrics must match the decision and the costs",
        "paragraphs": [
          "Accuracy is seductive and often wrong under imbalance: predicting the majority class can score 90% while missing every fraud case. Precision and recall make the precision-recall tradeoff explicit; F1 balances them when both matter. ROC-AUC summarizes ranking quality across thresholds but can look strong while precision at the deployed threshold is unusable. For probabilistic decisions, calibration error matters: a score of 0.8 should mean roughly 80% frequency in that bin. Regression needs MAE/MSE/MAPE chosen by error cost shape. Always state the operating threshold and the dollar or risk cost of false positives versus false negatives.",
          "Hold these points explicitly while you study. Restate each one without looking at the list — recognition is not the interview bar; recall is.",
          "• Pick metrics from business costs, not leaderboard habit.",
          "• Report thresholded metrics for the deployed operating point.",
          "• Check calibration when scores drive automated decisions.",
          "Production lens — Optimize the metric that matches the business cost: Accuracy is misleading under class imbalance; ROC-AUC can look good while precision at the operating threshold is unusable. Calibration matters when scores drive decisions (lending, medical triage). Always tie metric choice to false-positive vs false-negative costs and whether ranking or absolute probability is needed."
        ],
        "keyTerms": [
          {
            "term": "Pick metrics from business costs, not",
            "definition": "Pick metrics from business costs, not leaderboard habit."
          },
          {
            "term": "Report thresholded metrics for the deployed",
            "definition": "Report thresholded metrics for the deployed operating point."
          },
          {
            "term": "Check calibration when scores drive automated",
            "definition": "Check calibration when scores drive automated decisions."
          }
        ],
        "checkYourself": [
          {
            "prompt": "Can justify metric choice from false positive/negative costs.",
            "reveal": "Accuracy is misleading under class imbalance; ROC-AUC can look good while precision at the operating threshold is unusable. Calibration matters when scores drive decisions (lending, medical triage). Always tie metric choice to false-positive vs false-negative costs and whether ranking or absolute probability is needed."
          }
        ]
      },
      {
        "id": "learning-curves-diagnose-bias-versus-variance",
        "heading": "Learning curves diagnose bias versus variance",
        "paragraphs": [
          "Learning curves plot training and validation scores against training set size. A high-bias model shows both curves poor and close; more data will not save a too-shallow tree. A high-variance model shows a large gap: training near perfect, validation weaker; more data or stronger regularization can help. Validation curves sweep a hyperparameter such as max_depth. Use these plots before inventing exotic architectures. Also watch for non-stationary data: a beautiful curve on last quarter may not transfer after a product launch changes feature distributions.",
          "Hold these points explicitly while you study. Restate each one without looking at the list — recognition is not the interview bar; recall is.",
          "• Use learning curves to choose between more data vs more capacity.",
          "• Interpret train/validation gaps as variance signals.",
          "• Revisit curves after major distribution shifts.",
          "Production lens — A single holdout split lies more than you think: Random train/test splits underestimate variance when data is temporally correlated or grouped (users, sessions, patients). K-fold cross-validation gives a better variance estimate but still leaks if folds are not constructed with the right grouping unit. Time-series and nested cross-validation exist precisely because naive splitting produces overconfident metrics."
        ],
        "keyTerms": [
          {
            "term": "Use learning curves to choose between",
            "definition": "Use learning curves to choose between more data vs more capacity."
          },
          {
            "term": "Interpret train/validation gaps as variance s…",
            "definition": "Interpret train/validation gaps as variance signals."
          },
          {
            "term": "Revisit curves after major distribution shifts.",
            "definition": "Revisit curves after major distribution shifts."
          }
        ],
        "workedExample": {
          "title": "Learning curves for under/overfit trees",
          "body": "Narrate what each shape and step is doing. If you only recognize the API call, you do not own the idea yet — rewrite the example from memory after one pass.",
          "code": "from sklearn.model_selection import learning_curve\nfrom sklearn.tree import DecisionTreeClassifier\nfrom sklearn.datasets import make_classification\nimport numpy as np\n\nX, y = make_classification(n_samples=300, n_features=10, random_state=42)\nfor name, model in {\n    \"depth=1\": DecisionTreeClassifier(max_depth=1),\n    \"depth=None\": DecisionTreeClassifier(max_depth=None),\n    \"depth=5\": DecisionTreeClassifier(max_depth=5),\n}.items():\n    _, tr, va = learning_curve(model, X, y, cv=5, train_sizes=np.linspace(0.2, 1.0, 5), scoring=\"accuracy\")\n    gap = tr.mean(axis=1)[-1] - va.mean(axis=1)[-1]\n    print(f\"{name}: train={tr.mean(axis=1)[-1]:.3f} val={va.mean(axis=1)[-1]:.3f} gap={gap:.3f}\")",
          "language": "python"
        },
        "checkYourself": [
          {
            "prompt": "Can read learning curves for bias vs variance.",
            "reveal": "Explain the idea in two sentences, name one metric or invariant you would watch, and state one mistake juniors make. Then connect it back to learning curves diagnose bias versus variance."
          }
        ]
      },
      {
        "id": "uncertainty-ablations-and-honest-comparisons",
        "heading": "Uncertainty, ablations, and honest comparisons",
        "paragraphs": [
          "A single number without variance is incomplete. Prefer mean +/- std across folds or bootstrap intervals. When comparing model A and B, use the same folds. Ablations remove a feature set or component to prove it mattered. Statistical significance is not product significance: a tiny lift may not pay for complexity. For generative or ranking systems, combine offline metrics with slice analysis (new users, rare locales) because averages hide harmed cohorts. Build an evaluation sheet that lists dataset version, split rule, metric definitions, and known blind spots—this becomes the audit trail when someone asks why the model was shipped.",
          "Hold these points explicitly while you study. Restate each one without looking at the list — recognition is not the interview bar; recall is.",
          "• Report uncertainty, not only point estimates.",
          "• Compare models on identical folds and dataset versions.",
          "• Slice metrics to catch cohort-specific failures.",
          "Production lens — Optimize the metric that matches the business cost: Accuracy is misleading under class imbalance; ROC-AUC can look good while precision at the operating threshold is unusable. Calibration matters when scores drive decisions (lending, medical triage). Always tie metric choice to false-positive vs false-negative costs and whether ranking or absolute probability is needed."
        ],
        "keyTerms": [
          {
            "term": "Report uncertainty, not only point estimates.",
            "definition": "Report uncertainty, not only point estimates."
          },
          {
            "term": "Compare models on identical folds and",
            "definition": "Compare models on identical folds and dataset versions."
          },
          {
            "term": "Slice metrics to catch cohort-specific failures.",
            "definition": "Slice metrics to catch cohort-specific failures."
          }
        ],
        "checkYourself": [
          {
            "prompt": "Reports fold variance and slice metrics, not only averages.",
            "reveal": "Explain the idea in two sentences, name one metric or invariant you would watch, and state one mistake juniors make. Then connect it back to uncertainty, ablations, and honest comparisons."
          }
        ]
      },
      {
        "id": "from-offline-metrics-to-online-monitoring",
        "heading": "From offline metrics to online monitoring",
        "paragraphs": [
          "Offline evaluation approximates future performance; production confirms it. Define leading indicators: prediction volume, null feature rates, score distribution drift, and delayed label performance. Some labels arrive late (credit default, churn), so you need proxy metrics and delayed evaluation jobs. Guardrail metrics catch harmful side effects even when the primary metric moves up. The evaluation mindset does not end at train time—it becomes the monitoring specification. If you cannot name how you would detect a silent failure within a week, your offline ROC curve is not an operational plan.",
          "Hold these points explicitly while you study. Restate each one without looking at the list — recognition is not the interview bar; recall is.",
          "• Translate offline metrics into online monitors and alerts.",
          "• Plan for delayed labels with proxies and backfill evaluation.",
          "• Include guardrail metrics alongside the optimization objective.",
          "Production lens — A single holdout split lies more than you think: Random train/test splits underestimate variance when data is temporally correlated or grouped (users, sessions, patients). K-fold cross-validation gives a better variance estimate but still leaks if folds are not constructed with the right grouping unit. Time-series and nested cross-validation exist precisely because naive splitting produces overconfident metrics."
        ],
        "keyTerms": [
          {
            "term": "Translate offline metrics into online monitors",
            "definition": "Translate offline metrics into online monitors and alerts."
          },
          {
            "term": "Plan for delayed labels with proxies",
            "definition": "Plan for delayed labels with proxies and backfill evaluation."
          },
          {
            "term": "Include guardrail metrics alongside the optim…",
            "definition": "Include guardrail metrics alongside the optimization objective."
          }
        ],
        "checkYourself": [
          {
            "prompt": "Connects offline evaluation to production monitoring.",
            "reveal": "Explain the idea in two sentences, name one metric or invariant you would watch, and state one mistake juniors make. Then connect it back to from offline metrics to online monitoring."
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
          "Most interview answers fail not because the definition is wrong, but because the candidate never names how the approach breaks. Use this section as a trap checklist for model evaluation and validation.",
          "Trap: Tuning on the test set until it becomes validation in disguise. A strong answer preempts it — say what you would monitor, what fallback you would keep, or what simpler baseline you would try first.",
          "Trap: Using accuracy alone on imbalanced problems. A strong answer preempts it — say what you would monitor, what fallback you would keep, or what simpler baseline you would try first.",
          "Trap: Ignoring calibration for thresholded automated decisions. A strong answer preempts it — say what you would monitor, what fallback you would keep, or what simpler baseline you would try first.",
          "Trap: Comparing models trained on different hidden preprocessing leaks. A strong answer preempts it — say what you would monitor, what fallback you would keep, or what simpler baseline you would try first."
        ],
        "callout": {
          "tone": "warning",
          "body": "If you cannot name a failure mode, you do not yet understand the technique well enough to ship or defend it."
        },
        "checkYourself": [
          {
            "prompt": "Pick the most dangerous pitfall for Model evaluation and validation and explain how you would detect it in production or on a whiteboard.",
            "reveal": "Start with: \"Tuning on the test set until it becomes validation in disguise.\" Then add a detection signal (metric, test, or review question) and a mitigation."
          }
        ]
      },
      {
        "id": "deeper-lens",
        "heading": "A deeper production lens",
        "paragraphs": [
          "A single holdout split lies more than you think. Random train/test splits underestimate variance when data is temporally correlated or grouped (users, sessions, patients). K-fold cross-validation gives a better variance estimate but still leaks if folds are not constructed with the right grouping unit. Time-series and nested cross-validation exist precisely because naive splitting produces overconfident metrics.",
          "Optimize the metric that matches the business cost. Accuracy is misleading under class imbalance; ROC-AUC can look good while precision at the operating threshold is unusable. Calibration matters when scores drive decisions (lending, medical triage). Always tie metric choice to false-positive vs false-negative costs and whether ranking or absolute probability is needed."
        ],
        "keyTerms": [
          {
            "term": "A single holdout split lies more than you think",
            "definition": "Random train/test splits underestimate variance when data is temporally correlated or grouped (users, sessions, patients). K-fold cross-validation gives a better variance estimate but still leaks if folds are not constru…"
          },
          {
            "term": "Optimize the metric that matches the business cost",
            "definition": "Accuracy is misleading under class imbalance; ROC-AUC can look good while precision at the operating threshold is unusable. Calibration matters when scores drive decisions (lending, medical triage). Always tie metric cho…"
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
          "You should now be able to teach model evaluation and validation as a story: what problem it solves, how the mechanism works, which assumptions it depends on, and how you would know it failed.",
          "Close the loop by writing a 90-second spoken answer out loud. If you freeze on definitions, return to the orientation and the first technical part. If you freeze on trade-offs, return to failure modes.",
          "Practice prompts from this lesson: How do you evaluate a fraud model with 1% positives? | When is ROC-AUC misleading for deployment decisions? | Design a split strategy for user-level recommendations."
        ],
        "checkYourself": [
          {
            "prompt": "Give a 90-second spoken overview of Model evaluation and validation as if starting an interview answer.",
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
        "Can choose split strategy for time/group leakage risks.",
        "Can justify metric choice from false positive/negative costs.",
        "Can read learning curves for bias vs variance.",
        "Reports fold variance and slice metrics, not only averages.",
        "Connects offline evaluation to production monitoring."
      ],
      "nextSteps": [
        "Return to the lesson page and attempt the practice / topic lab with this chapter still open if needed.",
        "Revisit any Check yourself prompts you could not answer out loud.",
        "Optional deeper reading: Model evaluation: quantifying the quality of predictions (scikit-learn) — https://scikit-learn.org/stable/modules/model_evaluation.html",
        "Optional deeper reading: A Survey on Evaluation Methods for Chatbots (arXiv) — https://arxiv.org/abs/1901.05815"
      ]
    }
  }
};
