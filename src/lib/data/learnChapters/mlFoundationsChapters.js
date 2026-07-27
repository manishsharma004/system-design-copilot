/** @type {Record<string, import('../learnChapters.js').LessonLearnChapter>} */
export const mlFoundationsChapters = {
  "ml-foundations/math-for-ml": {
    "title": "Mathematics for machine learning",
    "readingTime": "75-95 min",
    "premise": "Machine learning is easier to reason about when vectors, derivatives, distributions, and optimization routines feel like one connected language. This chapter builds that language from the geometry of data through the numerical habits that keep real models trainable.",
    "parts": [
      {
        "id": "data-as-vectors-and-linear-maps",
        "heading": "Data as vectors and linear maps",
        "paragraphs": [
          "A model begins by turning a messy object into coordinates. A house becomes a vector of floor area, age, latitude, and recent sale context. A document becomes counts, dense embeddings, or token activations. A batch of examples becomes a matrix whose rows are observations and whose columns are features. That representation choice is not bookkeeping; it defines the space in which distances, angles, and directions are meaningful.",
          "Linear algebra gives names to the operations that move through that space. A dot product compares alignment between two vectors, which is why cosine similarity is a normalized dot product. A matrix maps input coordinates to output coordinates, so the product X @ W is many linear predictions computed at once. Rank tells how many independent directions a matrix can express. The singular value decomposition separates any matrix into rotations and axis-wise stretches, which is why it appears in PCA, low-rank approximation, and numerical diagnostics.",
          "The geometric view also explains why preprocessing matters. Centering moves the origin to the empirical mean, so covariance describes variation around a sensible reference point. Scaling prevents one unit convention, such as dollars instead of thousands of dollars, from dominating distances and regularization penalties. Norms measure size, but different norms encode different preferences: L2 spreads weight smoothly while L1 encourages sparse solutions. When an interview problem mentions embeddings, PCA, or nearest neighbors, first ask what vector space has been chosen and whether its geometry matches the task."
        ],
        "keyTerms": [
          {
            "term": "Vector space",
            "definition": "A set of objects that can be added and scaled, giving machine learning a coordinate system for examples, parameters, and predictions."
          },
          {
            "term": "Singular value decomposition",
            "definition": "A factorization that expresses a matrix as orthogonal directions with nonnegative stretch factors, useful for PCA, compression, and conditioning analysis."
          },
          {
            "term": "Norm",
            "definition": "A rule for measuring vector or matrix size; common choices such as L1 and L2 lead to different modeling behavior."
          }
        ],
        "callout": {
          "tone": "tip",
          "body": "Whenever a formula feels abstract, name the objects: rows are examples, columns are features, vectors are directions, and matrices are transformations."
        },
        "checkYourself": [
          {
            "prompt": "Why can changing feature scale alter a linear model even when the raw information is unchanged?",
            "reveal": "Feature scale changes distances, gradient magnitudes, and the meaning of coefficient penalties. With regularization, the optimizer is not only fitting predictions; it is also charging for coefficient size, so units affect the tradeoff unless features are standardized."
          }
        ]
      },
      {
        "id": "least-squares-pca-and-conditioning",
        "heading": "Least squares, PCA, and conditioning",
        "paragraphs": [
          "Least squares is the cleanest bridge between geometry and supervised learning. The linear regression prediction Xw tries to land near the target vector y. If the columns of X span a subspace, the fitted predictions are the projection of y onto that subspace. The residual is the part of y that the chosen features cannot express linearly. This view is more durable than memorizing normal equations, because it tells you what changes when features are collinear or missing.",
          "Solving least squares by explicitly forming an inverse is usually the wrong instinct. The matrix X^T X can amplify conditioning problems, especially when columns are nearly dependent. Stable solvers use QR decomposition, SVD, or iterative methods that avoid unnecessary numerical damage. The condition number measures how much small perturbations in input can change the solution. In production, a high condition number can look like coefficients that swing wildly after a minor data refresh.",
          "PCA uses related machinery with a different objective. Instead of predicting y, it searches for orthogonal directions that preserve maximum variance in X. The top principal components are eigenvectors of the covariance matrix or right singular vectors of the centered data matrix. Keeping only the largest components compresses data while discarding low-variance directions. That can denoise, but it can also remove rare signals, so PCA should be tied to the downstream goal rather than treated as automatic cleanup."
        ],
        "workedExample": {
          "title": "NumPy least squares and PCA diagnostics",
          "body": "This example fits a linear model without forming an explicit inverse, then inspects singular values to reason about PCA-style compression.",
          "code": "import numpy as np\n\nrng = np.random.default_rng(7)\nX = rng.normal(size=(8, 3))\ntrue_w = np.array([1.5, -2.0, 0.7])\ny = X @ true_w + rng.normal(scale=0.05, size=8)\n\nw_hat, residuals, rank, singular_values = np.linalg.lstsq(X, y, rcond=None)\nprint(\"weights:\", w_hat.round(3))\nprint(\"rank:\", rank)\nprint(\"singular values:\", singular_values.round(3))\nprint(\"condition number:\", round(singular_values[0] / singular_values[-1], 3))\n\nX_centered = X - X.mean(axis=0)\n_, s, vt = np.linalg.svd(X_centered, full_matrices=False)\nexplained = (s ** 2) / np.sum(s ** 2)\nprint(\"PCA variance ratio:\", explained.round(3))\nprint(\"first component:\", vt[0].round(3))",
          "language": "python"
        },
        "callout": {
          "tone": "warning",
          "body": "The formula w = (X^T X)^-1 X^T y is useful for theory, but explicit inversion is often a numerical smell in code."
        },
        "checkYourself": [
          {
            "prompt": "What does it mean geometrically when linear regression has a large residual?",
            "reveal": "It means the target vector has a component outside the subspace spanned by the feature columns. More data alone does not fix that representation gap; the feature space or model family may need to change."
          }
        ]
      },
      {
        "id": "vector-calculus-for-learning-rules",
        "heading": "Vector calculus for learning rules",
        "paragraphs": [
          "Training usually turns many predictions into one scalar loss. Vector calculus explains how that scalar changes when each parameter changes. The gradient is a vector of partial derivatives and points in the direction of steepest local increase. Gradient descent moves in the opposite direction, scaled by a learning rate. The word local is important because the gradient describes nearby behavior, not a promise about the whole loss surface.",
          "The chain rule is the engine behind modern learning systems. If a prediction depends on an activation, which depends on weights, which depend on earlier layers, then derivatives multiply through that computational path. Backpropagation is not a neural-network trick; it is organized chain rule bookkeeping over a computation graph. Jacobians describe derivatives of vector-valued functions, while Hessians describe curvature of scalar functions. Curvature explains why the same learning rate can be gentle in one direction and explosive in another.",
          "A reliable practitioner can move between notation and array shapes. If X has shape n by d and w has shape d, the gradient of mean squared error with respect to w also has shape d. If logits have shape batch by classes, the cross-entropy gradient at the logits has the same shape. These checks catch many implementation bugs before a training curve appears. In interviews, deriving a tiny gradient aloud often matters more than naming a sophisticated optimizer."
        ],
        "keyTerms": [
          {
            "term": "Gradient",
            "definition": "The vector of partial derivatives of a scalar function, indicating the locally steepest ascent direction."
          },
          {
            "term": "Jacobian",
            "definition": "A matrix of first derivatives for a vector-valued function, used when outputs and inputs both have multiple coordinates."
          },
          {
            "term": "Hessian",
            "definition": "A matrix of second derivatives that captures local curvature of a scalar objective."
          }
        ],
        "callout": {
          "tone": "interview",
          "body": "For a whiteboard derivation, state the loss, write the shapes, compute the gradient, and only then discuss optimizer choices."
        },
        "checkYourself": [
          {
            "prompt": "Why can a gradient step increase loss even though it points downhill locally?",
            "reveal": "The step may be too large for the local linear approximation to remain valid. Curvature, poor scaling, or nonconvex structure can make a direction that is initially downhill overshoot into a worse region."
          }
        ]
      },
      {
        "id": "probability-likelihood-and-bayes",
        "heading": "Probability, likelihood, and Bayes",
        "paragraphs": [
          "Probability enters machine learning whenever data is noisy, labels are uncertain, or decisions have unequal costs. A random variable is a quantity whose value is not known in advance, and a distribution describes how likely its values are. Expectation is the long-run average under a distribution, while variance measures spread around that average. Covariance describes how two quantities move together. These concepts are not optional statistics vocabulary; they define losses, uncertainty estimates, and assumptions about errors.",
          "Likelihood reverses the usual probability question. Instead of asking how probable future data is under fixed parameters, it asks which parameters make the observed data plausible. Maximum likelihood estimation chooses parameters that maximize that plausibility, while maximum a posteriori estimation adds a prior preference over parameters. Linear regression with squared error corresponds to Gaussian noise assumptions. Logistic regression with cross-entropy corresponds to Bernoulli labels whose probability is linked to a linear score.",
          "Bayes' rule is the disciplined way to combine base rates with evidence. A medical test with high sensitivity can still produce many false alarms when the disease is rare. A fraud classifier score should be interpreted against the prior rate of fraud and the costs of intervention. Conditional independence assumptions, such as those in naive Bayes, are often false but can still produce useful models. The mature habit is to ask which uncertainty is being modeled, which is ignored, and what decision will use the resulting probability."
        ],
        "keyTerms": [
          {
            "term": "Likelihood",
            "definition": "A function of model parameters measuring how plausible the observed data is under those parameters."
          },
          {
            "term": "Prior",
            "definition": "A probability distribution or preference over parameters before observing the current data."
          },
          {
            "term": "Posterior",
            "definition": "The updated distribution over unknown quantities after combining prior beliefs with observed evidence."
          }
        ],
        "callout": {
          "tone": "tip",
          "body": "Scores are not automatically probabilities. Calibration is an empirical property that must be checked on held-out data."
        },
        "checkYourself": [
          {
            "prompt": "How does a base rate change the interpretation of a classifier score?",
            "reveal": "Evidence is combined with prior prevalence. When positives are rare, even a strong signal may correspond to a modest posterior probability unless the likelihood ratio is very large."
          }
        ]
      },
      {
        "id": "optimization-and-regularization",
        "heading": "Optimization and regularization",
        "paragraphs": [
          "An optimization problem has variables, an objective, and often constraints. In machine learning the variables are usually parameters, the objective is an empirical loss plus regularization, and the constraints may be explicit or implicit. Convex objectives have a reassuring property: any local minimum is global. Many modern models are nonconvex, but convex problems remain essential because they teach the behavior of gradients, curvature, and dual tradeoffs. Logistic regression, ridge regression, and support vector machines are classical examples where this theory pays off.",
          "Gradient descent is only one member of a larger optimization family. Stochastic gradient descent uses noisy mini-batch gradients, which can speed training and sometimes help escape sharp regions. Momentum accumulates velocity so updates do not bounce as much in narrow valleys. Newton and quasi-Newton methods use curvature information to choose better-scaled steps, though they can be expensive in high dimensions. Coordinate descent and proximal methods become attractive when objectives have separable penalties such as L1 regularization.",
          "Regularization should be read as an optimization choice and a modeling belief. L2 weight decay prefers smaller, smoother parameter vectors and usually reduces variance. L1 penalties can set coefficients exactly to zero, producing sparse models that are easier to inspect. Early stopping regularizes by limiting how far optimization travels toward memorizing noise. Data augmentation, dropout, and margin constraints play similar roles in different model families: they restrict the functions that training is likely to discover."
        ],
        "keyTerms": [
          {
            "term": "Convex objective",
            "definition": "An objective whose line segment between any two points lies above the function, making local minima globally optimal."
          },
          {
            "term": "Stochastic gradient descent",
            "definition": "An optimization method that estimates gradients from mini-batches rather than the full dataset."
          },
          {
            "term": "Regularization",
            "definition": "A constraint or penalty that discourages overly flexible solutions and improves generalization."
          }
        ],
        "callout": {
          "tone": "warning",
          "body": "Do not tune regularization by training loss. A regularizer is judged by validation behavior, stability, and the deployment cost of errors."
        },
        "checkYourself": [
          {
            "prompt": "Why can early stopping act like regularization?",
            "reveal": "Stopping before full convergence limits how closely the model fits idiosyncrasies of the training set. The optimization path becomes part of the inductive bias."
          }
        ]
      },
      {
        "id": "connecting-the-foundations-to-models",
        "heading": "Connecting the foundations to models",
        "paragraphs": [
          "The same four mathematical tools reappear across algorithms. Linear algebra describes the representation and transformations. Calculus supplies gradients for learning. Probability tells us how to interpret noise, likelihood, and predictions. Optimization turns those ingredients into fitted parameters. Seeing the repetition prevents every new model from feeling like a new subject.",
          "Consider a logistic classifier. The feature matrix is multiplied by a weight vector to produce scores. A sigmoid maps each score to a number between zero and one. Cross-entropy comes from the likelihood of Bernoulli labels. Gradient-based optimization adjusts the weights, while regularization encodes a preference for simpler explanations. The entire algorithm is the chapter in miniature.",
          "The same pattern extends to newer methods. PCA is linear algebra plus an optimization objective about variance. Attention uses dot products, scaling, softmax probabilities, and gradient-based training. Gaussian processes combine linear algebra with probabilistic priors over functions. Even when software hides the details, debugging still demands this mental model: identify the space, the objective, the uncertainty assumption, and the numerical procedure."
        ],
        "callout": {
          "tone": "interview",
          "body": "A strong answer connects formulas to failure modes: collinearity, unstable gradients, bad calibration, and objective-metric mismatch."
        },
        "checkYourself": [
          {
            "prompt": "Name the linear algebra, calculus, probability, and optimization pieces inside logistic regression.",
            "reveal": "Linear algebra forms scores from Xw, calculus differentiates cross-entropy, probability interprets sigmoid outputs as Bernoulli parameters, and optimization fits w under a chosen regularizer."
          }
        ]
      }
    ],
    "wrapUp": {
      "takeaways": [
        "Representations define the vector space where models measure distance, alignment, and directions of change.",
        "Stable linear algebra matters as much as closed-form formulas when data is collinear or high dimensional.",
        "Gradients, likelihoods, and regularization are the shared mechanics behind many classical and modern algorithms.",
        "Optimization choices encode assumptions about simplicity, scale, and acceptable numerical risk."
      ],
      "nextSteps": [
        "Derive the gradient of mean squared error for a one-feature linear model.",
        "Use NumPy to compare least-squares solutions on a well-conditioned and poorly conditioned design matrix.",
        "Explain logistic regression as linear algebra plus Bernoulli likelihood plus optimization."
      ]
    }
  },
  "ml-foundations/classical-ml-algorithms": {
    "title": "Classical ML algorithms",
    "readingTime": "80-100 min",
    "premise": "Classical machine learning is not a museum of older algorithms. It is the default toolbox for many high-value tabular, ranking, forecasting, and decision-support systems where data size, interpretability, latency, and monitoring constraints matter.",
    "parts": [
      {
        "id": "inductive-bias-and-baselines",
        "heading": "Inductive bias and the baseline ladder",
        "paragraphs": [
          "Every algorithm carries an inductive bias, which is a preference for some patterns over others before seeing all possible data. Linear models prefer additive relationships in the chosen feature space. Trees prefer axis-aligned partitions. Nearest-neighbor methods prefer local smoothness under a distance metric. Support vector machines prefer separating boundaries with large margins. The right question is not which algorithm is strongest in general, but which bias is least wrong for the data and decision.",
          "A practical workflow starts with baselines because baselines make complexity accountable. A mean predictor, majority-class classifier, or logistic regression model establishes the first reference point. If a boosted tree improves a metric by two points but triples latency and complicates explanations, the baseline frames that tradeoff. Baselines also expose dataset issues quickly; if a simple model performs impossibly well, leakage is more likely than genius. If it performs at chance, labels, features, or split strategy may be broken.",
          "Bias and variance organize the ladder of model complexity. High-bias models underfit because their hypothesis class cannot express the signal. High-variance models overfit because they respond too strongly to sampling noise. Regularization, bagging, boosting, feature engineering, and more data all move this tradeoff in different ways. Interviewers listen for the ability to tie an algorithm choice to sample size, feature dimension, noise level, and operational constraints."
        ],
        "keyTerms": [
          {
            "term": "Inductive bias",
            "definition": "The assumptions an algorithm uses to generalize beyond the training examples it has seen."
          },
          {
            "term": "Bias-variance tradeoff",
            "definition": "The tension between systematic error from an overly simple model and sensitivity to noise from an overly flexible model."
          },
          {
            "term": "Baseline",
            "definition": "A simple reference model used to determine whether added complexity earns its cost."
          }
        ],
        "callout": {
          "tone": "interview",
          "body": "A senior answer usually starts with the simplest credible model, then explains the evidence needed to move up the complexity ladder."
        },
        "checkYourself": [
          {
            "prompt": "Why is a strong baseline useful even if you expect a complex model to win?",
            "reveal": "It verifies the data pipeline, sets a cost-aware reference point, and shows whether the complex model's gain is large enough to justify extra tuning, latency, monitoring, and explanation burden."
          }
        ]
      },
      {
        "id": "linear-and-logistic-models",
        "heading": "Linear and logistic models",
        "paragraphs": [
          "Linear regression models a target as a weighted sum of features plus noise. Its simplicity makes it fast, inspectable, and surprisingly strong when features are well engineered. Coefficients are meaningful only relative to feature scaling and correlation with other features. Ridge regression shrinks coefficients smoothly with an L2 penalty, while lasso uses L1 regularization to encourage sparsity. Elastic net blends both when correlated groups and feature selection matter.",
          "Logistic regression is a linear classifier with a probabilistic link function. It computes a score, passes it through the sigmoid function, and fits parameters by minimizing cross-entropy. The decision boundary is linear in the feature space, but nonlinear feature transforms can make the boundary richer. Regularization controls coefficient growth, especially in high-dimensional sparse settings such as text classification. Because outputs are often better calibrated than many flexible models, logistic regression remains valuable in risk scoring and policy settings.",
          "Solvers and preprocessing are part of the algorithm, not implementation trivia. Gradient-based solvers need scaled features so steps are balanced across coordinates. Class imbalance may require weighting, threshold adjustment, or a metric that reflects false-positive and false-negative costs. Multicollinearity can make individual coefficients unstable even when predictions are stable. A disciplined report separates predictive performance, coefficient interpretation, calibration, and deployment threshold."
        ],
        "workedExample": {
          "title": "NumPy logistic regression training loop",
          "body": "This small example shows logistic regression as a score, sigmoid, cross-entropy loss, gradient, and regularized update.",
          "code": "import numpy as np\n\nrng = np.random.default_rng(3)\nX = rng.normal(size=(120, 2))\ntrue_w = np.array([1.8, -1.2])\nlogits = X @ true_w - 0.2\np = 1 / (1 + np.exp(-logits))\ny = rng.binomial(1, p)\n\nXn = (X - X.mean(axis=0)) / X.std(axis=0)\nw = np.zeros(2)\nb = 0.0\nlr = 0.2\nl2 = 0.05\n\nfor step in range(300):\n    z = Xn @ w + b\n    pred = 1 / (1 + np.exp(-z))\n    loss = -(y * np.log(pred + 1e-9) + (1 - y) * np.log(1 - pred + 1e-9)).mean()\n    loss += 0.5 * l2 * np.sum(w ** 2)\n    error = pred - y\n    grad_w = Xn.T @ error / len(y) + l2 * w\n    grad_b = error.mean()\n    w -= lr * grad_w\n    b -= lr * grad_b\n\nprint(\"weights:\", w.round(3), \"bias:\", round(b, 3))\nprint(\"loss:\", round(float(loss), 3))\nprint(\"positive rate predicted:\", round(float((pred >= 0.5).mean()), 3))",
          "language": "python"
        },
        "callout": {
          "tone": "tip",
          "body": "For linear and logistic models, feature design often matters more than changing solvers."
        },
        "checkYourself": [
          {
            "prompt": "Why can logistic regression be a good production choice even when a tree ensemble has slightly higher validation accuracy?",
            "reveal": "It can be easier to calibrate, explain, monitor, retrain, and serve with low latency. A small metric gain may not compensate for the operational and governance cost of the ensemble."
          }
        ]
      },
      {
        "id": "neighbors-margins-and-kernels",
        "heading": "Neighbors, margins, and kernels",
        "paragraphs": [
          "Nearest-neighbor methods make almost no parametric assumption. They store examples and predict from nearby points according to a chosen distance. This can work well when the feature representation makes semantic neighbors close. It can fail badly in high dimensions because distances become less informative and irrelevant features dominate. Scaling, metric choice, and approximate nearest-neighbor indexing are therefore central to making k-NN useful.",
          "Support vector machines take a different view. A linear SVM searches for a separating hyperplane with a large margin, meaning the closest examples are pushed as far from the boundary as possible. The hinge loss penalizes examples inside the margin or on the wrong side. The regularization parameter controls the tradeoff between margin width and training violations. SVMs can be powerful in medium-sized, high-dimensional problems where margins are meaningful.",
          "Kernels let an SVM behave as if data were mapped into a richer feature space without explicitly building that space. The radial basis function kernel can form nonlinear boundaries by measuring similarity to training examples. This flexibility comes with computational cost and sensitivity to hyperparameters such as gamma. Kernels also reduce interpretability because the boundary is no longer a simple coefficient vector over original features. A good answer mentions both the mathematical elegance and the scaling limits."
        ],
        "keyTerms": [
          {
            "term": "Margin",
            "definition": "The distance between a classifier boundary and the nearest training examples, central to support vector machines."
          },
          {
            "term": "Kernel trick",
            "definition": "A method for computing inner products in an implicit feature space without explicitly constructing transformed features."
          },
          {
            "term": "Curse of dimensionality",
            "definition": "The degradation of distance-based intuition and data coverage as feature dimension grows."
          }
        ],
        "callout": {
          "tone": "warning",
          "body": "Distance-based methods inherit every mistake in feature scaling and representation. A bad metric makes nearby examples meaningless."
        },
        "checkYourself": [
          {
            "prompt": "When would an RBF-kernel SVM be a poor default?",
            "reveal": "It can be a poor default for very large datasets, strict latency budgets, heavy interpretability requirements, or problems where hyperparameter tuning cannot be done carefully."
          }
        ]
      },
      {
        "id": "trees-forests-and-boosting",
        "heading": "Trees, forests, and boosting",
        "paragraphs": [
          "A decision tree partitions feature space by asking a sequence of threshold questions. Each split is chosen to reduce impurity or error in the child nodes. Shallow trees are interpretable but biased because they can express only coarse rules. Deep trees are flexible but high variance because small data changes can alter the structure. The tree's strength is that it captures interactions and nonlinear thresholds without manual feature crosses.",
          "Random forests reduce variance by averaging many decorrelated trees. Each tree sees a bootstrap sample and a random subset of features at splits, so their errors are less synchronized. The ensemble often performs well with little preprocessing and is robust to monotonic transformations of individual features. However, feature importance can be misleading when features are correlated or have many split points. Forests are easier to tune than boosted trees but can still be heavy at inference time.",
          "Gradient boosting builds an additive model sequentially. Each new tree fits the direction that reduces the current loss, often described as learning residual corrections. Learning rate, tree depth, number of estimators, subsampling, and leaf constraints govern the bias-variance tradeoff. Boosting can dominate tabular benchmarks because it combines weak rules into a strong predictor. It also overfits quietly when validation discipline is weak, so early stopping and honest splits are part of the method."
        ],
        "keyTerms": [
          {
            "term": "Bagging",
            "definition": "Training models on bootstrap samples and averaging them to reduce variance."
          },
          {
            "term": "Boosting",
            "definition": "Sequentially adding weak learners that correct errors of the current ensemble."
          },
          {
            "term": "Impurity",
            "definition": "A node-level measure, such as Gini impurity or entropy, used to choose decision-tree splits."
          }
        ],
        "callout": {
          "tone": "interview",
          "body": "Use the phrase carefully: forests mainly average variance down, while boosting changes bias and variance through staged residual fitting."
        },
        "checkYourself": [
          {
            "prompt": "Why does a single deep tree often generalize worse than a random forest?",
            "reveal": "The single tree has high variance and can depend heavily on quirks of the sample. Averaging many decorrelated trees reduces that variance while preserving much of the nonlinear expressiveness."
          }
        ]
      },
      {
        "id": "unsupervised-learning-and-feature-work",
        "heading": "Unsupervised learning and feature work",
        "paragraphs": [
          "Unsupervised algorithms discover structure without target labels, but they do not discover meaning by themselves. K-means searches for cluster centers that minimize within-cluster squared distance, so it prefers roughly spherical clusters of similar scale. DBSCAN groups dense regions and labels sparse points as noise, which can fit irregular shapes but depends strongly on density parameters. Hierarchical clustering builds nested groupings that are useful for exploration and taxonomy. The output should be treated as a hypothesis until domain evidence validates it.",
          "Dimensionality reduction has a similar caveat. PCA preserves linear variance, which may or may not preserve task-relevant information. Nonlinear visualization methods can reveal neighborhoods but are often unstable under parameter changes and should not be treated as guaranteed supervised features. Autoencoders and matrix factorization can learn compact representations, but they still optimize specific reconstruction or factorization objectives. The common question is whether the compressed view preserves the information needed for the decision.",
          "Feature engineering remains a major source of classical ML performance. Missingness indicators can turn data quality patterns into signal. Ratios, lags, rolling aggregates, log transforms, and domain-specific bins can make simple models competitive. Categorical encoding must be designed carefully, especially for high-cardinality identifiers and target encoding. Any transformation learned from data must be fit inside the training fold, otherwise preprocessing itself leaks validation information."
        ],
        "keyTerms": [
          {
            "term": "K-means",
            "definition": "A clustering algorithm that assigns examples to centers and updates centers to minimize within-cluster squared distance."
          },
          {
            "term": "Target encoding",
            "definition": "A categorical encoding based on target statistics, powerful but leakage-prone unless computed with out-of-fold discipline."
          },
          {
            "term": "Dimensionality reduction",
            "definition": "Mapping data to fewer coordinates while trying to preserve useful structure."
          }
        ],
        "callout": {
          "tone": "warning",
          "body": "A beautiful cluster plot is not a business result. Validate clusters against outcomes, expert review, or downstream performance."
        },
        "checkYourself": [
          {
            "prompt": "Why is target encoding dangerous when computed before cross-validation?",
            "reveal": "The encoded value can contain label information from validation rows. The model then sees a summary of the answer during training, inflating validation metrics."
          }
        ]
      },
      {
        "id": "choosing-classical-models-in-systems",
        "heading": "Choosing classical models in systems",
        "paragraphs": [
          "Model choice is an engineering decision under constraints. Data volume, feature types, missingness, label noise, latency, memory, explainability, retraining cadence, and regulatory review all matter. A sparse text classifier may favor linear models. A heterogeneous tabular risk model may favor gradient boosting. A recommendation retrieval stage may use nearest-neighbor search over embeddings, followed by a ranking model.",
          "The comparison must be fair before it is persuasive. Candidate models should share the same split, same preprocessing discipline, same metric definitions, and same threshold-selection policy. Hyperparameter search should be nested or protected by a validation set so the test set remains a final estimate. Slice metrics should be reported for important cohorts rather than only an average. A model that wins overall but fails new users, rare classes, or a regulated subgroup is not a clean win.",
          "Classical models also need production ownership. Monitor input schema, missing rates, score distributions, calibration, latency, and delayed labels. Keep feature generation reproducible so training and serving compute the same values. Record model cards or decision logs that explain why the chosen algorithm beat simpler alternatives. The best classical ML systems feel boring in operation because the team invested in evaluation and data contracts, not because the algorithm was simple."
        ],
        "callout": {
          "tone": "tip",
          "body": "A classical model with clear features, honest validation, and stable monitoring often beats a complex model that the team cannot explain or operate."
        },
        "checkYourself": [
          {
            "prompt": "What should be identical when comparing logistic regression, random forest, and gradient boosting?",
            "reveal": "They should use identical split membership, leakage-safe preprocessing, metric definitions, threshold policy, and evaluation slices. Otherwise the comparison mixes model quality with experiment differences."
          }
        ]
      }
    ],
    "wrapUp": {
      "takeaways": [
        "Algorithm choice is a choice of inductive bias under data and system constraints.",
        "Linear and logistic models remain strong baselines because they are fast, regularizable, inspectable, and often well calibrated.",
        "Trees, forests, and boosting dominate many tabular tasks by capturing nonlinear interactions with different bias-variance behavior.",
        "Unsupervised results and engineered features need leakage-safe validation before they become trusted product signals."
      ],
      "nextSteps": [
        "Build a baseline ladder for one tabular problem: majority class, logistic regression, random forest, and gradient boosting.",
        "Explain bagging versus boosting using variance, bias, and validation discipline.",
        "Audit one feature pipeline for transformations that must be fit inside each cross-validation fold."
      ]
    }
  },
  "ml-foundations/model-evaluation": {
    "title": "Model evaluation and validation",
    "readingTime": "80-100 min",
    "premise": "Evaluation is the discipline that turns model development into an evidence-producing process. This chapter covers split design, leakage, grouped cross-validation, metric choice, calibration, ROC versus precision-recall tradeoffs, and the production habits that keep validation honest.",
    "parts": [
      {
        "id": "evaluation-as-experiment-design",
        "heading": "Evaluation as experiment design",
        "paragraphs": [
          "A model score is only as trustworthy as the experiment that produced it. Training data estimates parameters, validation data guides choices, and test data estimates final generalization after those choices are fixed. Confusing these roles turns evaluation into self-deception. The more often a team looks at a holdout score and changes the model, the less that holdout behaves like unseen data. Good evaluation starts by defining what question the split is supposed to answer.",
          "The target deployment setting should determine the experiment. If tomorrow's users will differ from today's users, a random row split may be too optimistic. If the same person contributes many rows, splitting rows can put one person's behavior on both sides. If labels are delayed, using features computed after the prediction time creates a future-looking model. An evaluation protocol is a contract about time, identity, label availability, and allowed information.",
          "Reproducibility is part of validity. Store dataset versions, split seeds, group definitions, feature-generation code, and metric definitions. A leaderboard that cannot be reconstructed is a story, not evidence. Human review also matters because a metric can improve while the product experience worsens for a critical slice. The evaluation artifact should let another engineer answer what changed, why it changed, and whether the result is likely to survive contact with production."
        ],
        "keyTerms": [
          {
            "term": "Validation set",
            "definition": "Data used during development to select features, hyperparameters, thresholds, and model families."
          },
          {
            "term": "Test set",
            "definition": "A protected dataset used after model selection to estimate generalization on unseen examples."
          },
          {
            "term": "Protocol",
            "definition": "The documented rules for data membership, preprocessing, metrics, thresholds, and comparisons."
          }
        ],
        "callout": {
          "tone": "warning",
          "body": "A repeatedly consulted test set becomes validation data in practice, even if the file name still says test."
        },
        "checkYourself": [
          {
            "prompt": "Why is evaluation design part of modeling rather than a final reporting step?",
            "reveal": "The split and metric define what the model is optimized to do. If they do not match deployment, later numbers can reward the wrong behavior."
          }
        ]
      },
      {
        "id": "cross-validation-groups-and-time",
        "heading": "Cross-validation, groups, and time",
        "paragraphs": [
          "Cross-validation estimates performance by fitting multiple models on different train-validation partitions. K-fold cross-validation reduces dependence on one lucky split and gives a variance estimate across folds. Stratified folds preserve label proportions, which is important under class imbalance. Repeated cross-validation can reduce split noise further, though it costs more compute. The result should be reported as a distribution, not only a mean.",
          "Grouped data requires grouped splitting. In medical data, all rows from one patient should stay in the same fold. In recommendation systems, all events from one user or household may need to stay together depending on the deployment question. In enterprise settings, rows from one customer account can share hidden context. If groups are split across folds, the model can exploit identity-specific regularities and appear to generalize when it has only recognized familiar entities.",
          "Time creates a stricter constraint because future information must not help past predictions. Forecasting and many product ML systems need forward-chaining, rolling-origin, or fixed historical holdout splits. Random shuffling can leak seasonality, campaign effects, and post-launch behavior backward into training. Nested cross-validation is useful when hyperparameter tuning is heavy because the outer loop estimates model-selection performance and the inner loop chooses settings. The right split is therefore a claim about causality, dependence, and how the model will be used."
        ],
        "keyTerms": [
          {
            "term": "Grouped cross-validation",
            "definition": "A split strategy that keeps all examples from the same entity, such as a user or patient, within one fold."
          },
          {
            "term": "Stratification",
            "definition": "Constructing folds so label proportions or other key distributions are similar across partitions."
          },
          {
            "term": "Nested cross-validation",
            "definition": "A two-level cross-validation design that separates hyperparameter selection from final performance estimation."
          }
        ],
        "callout": {
          "tone": "interview",
          "body": "When asked how to split data, name the leakage unit: time, user, session, device, patient, account, item, or geography."
        },
        "checkYourself": [
          {
            "prompt": "Why can ordinary K-fold cross-validation be wrong for user-level recommendation data?",
            "reveal": "The same user's behavior can appear in both training and validation folds. The model may learn user-specific patterns that are unavailable for truly new or future users, producing optimistic metrics."
          }
        ]
      },
      {
        "id": "metrics-thresholds-and-roc-vs-pr",
        "heading": "Metrics, thresholds, and ROC versus PR",
        "paragraphs": [
          "Metrics should be chosen from the decision and its error costs. Accuracy is reasonable only when classes and costs are roughly balanced. Precision answers how often positive predictions are correct. Recall answers how many actual positives are found. F1 compresses precision and recall into one number, but it hides the business tradeoff between false alarms and misses. A thresholded classifier should therefore be reported at the intended operating threshold, not only through threshold-free summaries.",
          "ROC curves plot true positive rate against false positive rate across thresholds. ROC-AUC measures ranking quality and can be useful when both classes are well represented or when comparing rankers abstractly. Precision-recall curves focus on the positive class and are often more informative under severe imbalance. A fraud model can have a strong ROC-AUC while precision at useful recall is too low for investigators. PR-AUC changes with the base rate, which is not a flaw; it reflects how hard positive predictions are in the actual population.",
          "Regression and ranking tasks have their own metric traps. Mean squared error punishes large errors more than mean absolute error, so it is sensitive to outliers. Mean absolute percentage error can explode near zero and bias evaluation against low-volume items. Ranking metrics such as NDCG and mean average precision depend on position and relevance definitions. Whatever the task, the metric should be accompanied by slice analysis, uncertainty intervals, and examples of failures that the metric does not capture."
        ],
        "keyTerms": [
          {
            "term": "ROC-AUC",
            "definition": "The area under the curve of true positive rate versus false positive rate across classification thresholds."
          },
          {
            "term": "Precision-recall curve",
            "definition": "A curve showing the tradeoff between positive predictive value and sensitivity across thresholds."
          },
          {
            "term": "Operating threshold",
            "definition": "The score cutoff used in deployment to convert model scores into actions."
          }
        ],
        "callout": {
          "tone": "warning",
          "body": "For rare positives, ROC-AUC can look impressive while the precision-recall curve reveals an unusable alert stream."
        },
        "checkYourself": [
          {
            "prompt": "Why is PR-AUC often preferred for rare-event detection?",
            "reveal": "It focuses on the quality and coverage of positive predictions. False positives that overwhelm the positive class are visible through precision, while ROC false-positive rates can look small because negatives are numerous."
          }
        ]
      },
      {
        "id": "calibration-and-uncertainty",
        "heading": "Calibration and uncertainty",
        "paragraphs": [
          "A model is calibrated when events assigned a probability occur at that frequency. Among examples scored near 0.8, roughly 80 percent should be positive. Calibration matters when scores drive decisions, pricing, ranking, triage, or human review. A model can rank examples well and still be poorly calibrated. That is why AUC and calibration answer different questions.",
          "Calibration can be measured and improved. Reliability diagrams compare predicted probability bins with observed frequencies. The Brier score measures squared error of probabilistic predictions. Platt scaling fits a logistic mapping from scores to probabilities, while isotonic regression fits a monotone calibration curve. Calibration must be learned on validation data separate from training, and checked again after distribution shifts because base rates and score distributions change.",
          "Uncertainty also includes uncertainty in evaluation results. A validation score computed from a few hundred examples can move substantially by chance. Confidence intervals, bootstrap resampling, and fold standard deviations help communicate that uncertainty. Statistical significance is not the same as practical significance; a tiny lift may be real and still not worth shipping. Evaluation should support decisions, not merely produce decimals."
        ],
        "keyTerms": [
          {
            "term": "Calibration",
            "definition": "Agreement between predicted probabilities and observed event frequencies."
          },
          {
            "term": "Brier score",
            "definition": "The mean squared error between predicted probabilities and binary outcomes."
          },
          {
            "term": "Reliability diagram",
            "definition": "A plot comparing predicted probability bins with empirical outcome rates."
          }
        ],
        "callout": {
          "tone": "tip",
          "body": "Separate ranking from probability quality: AUC asks whether positives score above negatives, while calibration asks whether score values mean what they claim."
        },
        "checkYourself": [
          {
            "prompt": "Can a model have excellent ROC-AUC and poor calibration?",
            "reveal": "Yes. It may rank positives above negatives reliably while assigning probabilities that are too high or too low. Ranking and probability accuracy are different properties."
          }
        ]
      },
      {
        "id": "learning-curves-and-bias-variance",
        "heading": "Learning curves and bias-variance diagnosis",
        "paragraphs": [
          "Learning curves plot training and validation performance as training set size grows. When both curves are poor and close together, the model likely has high bias or insufficient features. Adding more data may not help much because the model class cannot represent the signal. Better features, more flexible models, or a different objective may be needed. This pattern is common when a linear model is applied to strongly nonlinear structure without feature transforms.",
          "When training performance is strong but validation performance lags, the model has high variance. More data, stronger regularization, simpler models, bagging, early stopping, or data augmentation may reduce the gap. Validation curves complement learning curves by sweeping a hyperparameter such as tree depth, C value, or regularization strength. These plots turn tuning from guesswork into diagnosis. They also show when a proposed solution, such as collecting labels, is likely to pay off.",
          "Bias-variance language should be tied to the data-generating process. Label noise creates an irreducible error floor that no model can beat. Distribution shift can make past validation curves misleading after product, market, or policy changes. Slice-specific curves can reveal that the average model is high variance for rare groups and high bias for common ones. Evaluation maturity means diagnosing error sources before prescribing a bigger model."
        ],
        "keyTerms": [
          {
            "term": "Learning curve",
            "definition": "A plot of training and validation performance as the amount of training data changes."
          },
          {
            "term": "Validation curve",
            "definition": "A plot of model performance as one hyperparameter changes."
          },
          {
            "term": "Irreducible error",
            "definition": "The portion of prediction error caused by noise or missing information that the model cannot eliminate."
          }
        ],
        "callout": {
          "tone": "interview",
          "body": "Do not say only underfit or overfit. Say what evidence in the train and validation curves supports the diagnosis."
        },
        "checkYourself": [
          {
            "prompt": "What does it suggest when training and validation scores are both low and nearly equal?",
            "reveal": "The model is likely high bias or missing important signal. More capacity, better features, or a better target formulation may help more than simply adding data."
          }
        ]
      },
      {
        "id": "leakage-reproducibility-and-production-validation",
        "heading": "Leakage, reproducibility, and production validation",
        "paragraphs": [
          "Leakage is information reaching the model during evaluation that would not be available at prediction time. Target leakage can be obvious, such as including a post-outcome status field, or subtle, such as an aggregate computed using future labels. Preprocessing leakage happens when scalers, imputers, encoders, feature selection, or PCA are fit on all data before splitting. Duplicate leakage happens when near-identical examples straddle train and validation. Leakage often presents as suspiciously high performance, especially for simple models.",
          "The best defense is a pipeline that mirrors prediction time. Split first, fit transformations only on training folds, and transform validation folds with learned training parameters. Use group and time constraints to keep related records out of both sides. Maintain feature availability timestamps and data lineage so reviewers can see when each value became known. Add tests or audits for identifiers, duplicates, future timestamps, and target-derived fields.",
          "Offline validation is the beginning of a model's evidence trail, not the end. Production monitoring should track input drift, missing rates, score distributions, calibration drift, latency, and delayed outcome metrics. Online experiments or shadow deployments can reveal feedback loops and user behavior changes that offline data cannot show. Rollback criteria should be defined before launch, not improvised during an incident. A trustworthy ML system connects the validation protocol to ongoing measurement after release."
        ],
        "keyTerms": [
          {
            "term": "Target leakage",
            "definition": "Use of information derived from the label or future outcome that would not be available when making predictions."
          },
          {
            "term": "Preprocessing leakage",
            "definition": "Fitting transformations on data outside the training fold, allowing validation information into model development."
          },
          {
            "term": "Data lineage",
            "definition": "A record of where features came from, when they were available, and how they were transformed."
          }
        ],
        "callout": {
          "tone": "warning",
          "body": "If a simple model scores near perfect on a noisy real-world problem, assume leakage until proven otherwise."
        },
        "checkYourself": [
          {
            "prompt": "Why must imputers and encoders be fit inside each training fold?",
            "reveal": "Their learned statistics can contain information about validation rows. Fitting them inside each training fold keeps validation data unseen until evaluation."
          }
        ]
      }
    ],
    "wrapUp": {
      "takeaways": [
        "Evaluation is experiment design: splits, metrics, thresholds, and allowed information define what evidence means.",
        "Cross-validation must respect grouping, time, imbalance, and hyperparameter search or it will overstate generalization.",
        "ROC-AUC, PR-AUC, calibration, and thresholded metrics answer different deployment questions.",
        "Leakage prevention requires split-first pipelines, feature availability discipline, and reproducible evaluation records."
      ],
      "nextSteps": [
        "Design split rules for a user-level recommender, a hospital readmission model, and a monthly demand forecast.",
        "Compare ROC and precision-recall interpretations for a rare-event classifier.",
        "Audit an ML pipeline for preprocessing, target, duplicate, and time leakage."
      ]
    }
  }
};
