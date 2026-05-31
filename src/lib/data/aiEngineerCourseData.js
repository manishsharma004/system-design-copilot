/**
 * AI Engineer Learning Path – module and lesson data.
 *
 * Covers the modern AI/ML engineer skill tree from foundational ML through
 * production LLM systems, RAG pipelines, AI agents, MLOps, and AI safety.
 */

export const rawAiEngineerModules = [
  {
    slug: 'ml-foundations',
    title: 'Machine learning foundations',
    summary: 'Build core intuition for supervised and unsupervised learning, feature engineering, model evaluation, and the mathematical underpinnings every AI engineer needs.',
    objectives: [
      'Understand linear algebra, calculus, and probability concepts relevant to ML',
      'Apply classical ML algorithms: regression, classification, clustering',
      'Evaluate models with proper validation techniques and metrics'
    ],
    lessons: [
      {
        slug: 'math-for-ml',
        title: 'Mathematics for machine learning',
        summary: 'Linear algebra, calculus, and probability foundations required for understanding model internals and optimization.',
        duration: '30-40 min',
        whyItMatters: 'Every optimization step in ML relies on gradients, matrix operations, and probabilistic reasoning. Without this foundation the rest of the path feels like magic.',
        sections: [
          {
            heading: 'Linear algebra essentials',
            body: 'Vectors, matrices, eigenvalues, and matrix decompositions form the backbone of data representations and transformations in ML.',
            bullets: [
              'Understand how data is represented as matrices and how transformations operate on them',
              'Eigenvalues and eigenvectors explain variance directions in PCA and model stability',
              'Matrix multiplication is the core operation in neural network forward passes'
            ]
          },
          {
            heading: 'Calculus and optimization',
            body: 'Derivatives, gradients, and the chain rule enable backpropagation and parameter updates in every trainable model.',
            bullets: [
              'Partial derivatives measure how each parameter affects the loss',
              'Gradient descent iteratively moves parameters toward lower loss',
              'Learning rate controls step size and affects convergence speed and stability'
            ]
          },
          {
            heading: 'Probability and statistics',
            body: 'Probability distributions, Bayes theorem, and statistical testing provide the language for uncertainty, generalization, and hypothesis evaluation.',
            bullets: [
              'Bayes theorem underpins many generative and classification models',
              'Understanding distributions helps in choosing loss functions and modeling noise',
              'Hypothesis testing and confidence intervals guide experiment evaluation'
            ]
          }
        ],
        checklist: [
          'Can explain how gradient descent updates parameters using partial derivatives.',
          'Understands matrix multiplication as the core neural network operation.',
          'Can describe what a probability distribution tells you about data uncertainty.'
        ],
        pitfalls: [
          'Skipping math foundations and relying solely on library abstractions.',
          'Memorizing formulas without understanding geometric or probabilistic intuition.',
          'Ignoring numerical stability issues that arise in practice.'
        ],
        interviewPrompts: [
          'Why does gradient descent work and what are its failure modes?',
          'Explain the role of eigenvalues in PCA.',
          'How does Bayes theorem apply to a spam classifier?'
        ],
        exercises: [
          {
            id: 'gradient-descent-from-scratch',
            title: 'Implement gradient descent from scratch',
            difficulty: 'intermediate',
            type: 'coding',
            description: 'Implement a basic gradient descent optimizer in Python that minimizes a quadratic loss function. Track and plot the convergence path.',
            starterCode: `import numpy as np\n\ndef gradient_descent(f, grad_f, x0, learning_rate=0.01, num_steps=100):\n    \"\"\"Minimize f starting from x0 using gradient descent.\"\"\"\n    # TODO: Implement the optimization loop\n    # Return: list of (x, f(x)) pairs showing the optimization path\n    pass\n\n# Test with f(x) = (x - 3)^2 + 1\nf = lambda x: (x - 3)**2 + 1\ngrad_f = lambda x: 2 * (x - 3)\npath = gradient_descent(f, grad_f, x0=10.0)\nprint(f"Final x: {path[-1][0]:.4f}, Final f(x): {path[-1][1]:.4f}")`,
            solution: `import numpy as np\n\ndef gradient_descent(f, grad_f, x0, learning_rate=0.01, num_steps=100):\n    x = x0\n    path = [(x, f(x))]\n    for _ in range(num_steps):\n        x = x - learning_rate * grad_f(x)\n        path.append((x, f(x)))\n    return path`,
            hints: [
              'The update rule is: x_new = x_old - learning_rate * gradient(x_old)',
              'Store each intermediate (x, f(x)) pair to visualize convergence',
              'Try different learning rates (0.001, 0.01, 0.1, 1.0) and observe behavior'
            ],
            expectedOutput: 'Final x should converge near 3.0, f(x) near 1.0'
          },
          {
            id: 'matrix-operations-numpy',
            title: 'Neural network forward pass with NumPy',
            difficulty: 'intermediate',
            type: 'coding',
            description: 'Implement a single-layer neural network forward pass using only NumPy matrix operations. Apply ReLU activation.',
            starterCode: `import numpy as np\n\ndef relu(x):\n    \"\"\"Apply ReLU activation element-wise.\"\"\"\n    # TODO\n    pass\n\ndef forward_pass(X, W, b):\n    \"\"\"Compute output = ReLU(X @ W + b)\n    X: (batch_size, input_dim)\n    W: (input_dim, output_dim)\n    b: (output_dim,)\n    \"\"\"\n    # TODO\n    pass\n\n# Test\nX = np.array([[1, 2], [3, 4], [-1, -2]])\nW = np.array([[0.5, -0.3], [0.2, 0.8]])\nb = np.array([0.1, -0.1])\nprint(forward_pass(X, W, b))`,
            solution: `import numpy as np\n\ndef relu(x):\n    return np.maximum(0, x)\n\ndef forward_pass(X, W, b):\n    return relu(X @ W + b)`,
            hints: [
              'Matrix multiply X and W using @ or np.dot',
              'Broadcasting handles adding b to each row',
              'np.maximum(0, x) implements ReLU element-wise'
            ],
            expectedOutput: 'Array with non-negative values after ReLU activation'
          },
          {
            id: 'bayes-theorem-classifier',
            title: 'Naive Bayes spam classifier',
            difficulty: 'beginner',
            type: 'design',
            description: 'Design a naive Bayes spam classifier on paper. Write out the probability calculations for classifying an email containing the words "free" and "prize" given training statistics.',
            promptQuestions: [
              'What is P(spam) and P(not spam) from the training data?',
              'How do you compute P(word | spam) for each word?',
              'How does the naive assumption simplify the calculation?',
              'What happens with words not seen in training (zero-frequency problem)?'
            ]
          }
        ],
        diagram: null,
        related: ['classical-ml-algorithms', 'model-evaluation']
      },
      {
        slug: 'classical-ml-algorithms',
        title: 'Classical ML algorithms',
        summary: 'Regression, classification, clustering, and ensemble methods using scikit-learn.',
        duration: '30-40 min',
        whyItMatters: 'Classical algorithms remain the best choice for many production problems and serve as baselines against which deep learning must justify its complexity.',
        sections: [
          {
            heading: 'Supervised learning',
            body: 'Linear regression, logistic regression, decision trees, random forests, gradient boosting, and SVMs cover the majority of tabular prediction tasks.',
            bullets: [
              'Linear models are interpretable and fast; start here as a baseline',
              'Tree ensembles (XGBoost, LightGBM) dominate tabular data competitions',
              'SVMs work well in high-dimensional spaces with clear margins'
            ]
          },
          {
            heading: 'Unsupervised learning',
            body: 'K-means, DBSCAN, hierarchical clustering, and dimensionality reduction reveal structure in unlabeled data.',
            bullets: [
              'K-means is simple but assumes spherical clusters of similar size',
              'DBSCAN finds arbitrarily shaped clusters and handles noise',
              'PCA and t-SNE reduce dimensions for visualization and denoising'
            ]
          },
          {
            heading: 'Feature engineering and selection',
            body: 'Transforming raw data into informative features often matters more than algorithm choice.',
            bullets: [
              'One-hot encoding, binning, and interaction features expand model capacity',
              'Feature selection reduces overfitting and speeds training',
              'Domain knowledge drives the most impactful feature ideas'
            ]
          }
        ],
        checklist: [
          'Can select an appropriate algorithm family given the problem type and data shape.',
          'Knows when to prefer tree ensembles over linear models.',
          'Understands the bias-variance tradeoff in model selection.'
        ],
        pitfalls: [
          'Using deep learning on small tabular datasets where gradient boosting wins.',
          'Neglecting feature engineering in favor of complex architectures.',
          'Not establishing a simple baseline before moving to advanced methods.'
        ],
        interviewPrompts: [
          'When would you choose logistic regression over a neural network?',
          'Explain the bias-variance tradeoff with a concrete example.',
          'How does gradient boosting differ from random forests?'
        ],
        exercises: [
          {
            id: 'model-selection-challenge',
            title: 'Model selection for real-world datasets',
            difficulty: 'intermediate',
            type: 'coding',
            description: 'Given three datasets (small tabular, high-dimensional text, time-series), choose and train appropriate models using scikit-learn. Compare performance using proper cross-validation.',
            starterCode: `from sklearn.datasets import make_classification, make_regression\nfrom sklearn.model_selection import cross_val_score\nfrom sklearn.linear_model import LogisticRegression\nfrom sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier\nimport numpy as np\n\n# Dataset: 200 samples, 20 features, 5 informative\nX, y = make_classification(n_samples=200, n_features=20, n_informative=5, random_state=42)\n\n# TODO: Train at least 3 different models\n# TODO: Use 5-fold cross-validation to compare\n# TODO: Report mean and std of accuracy for each\n# Which model wins and why?`,
            solution: `from sklearn.datasets import make_classification\nfrom sklearn.model_selection import cross_val_score\nfrom sklearn.linear_model import LogisticRegression\nfrom sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier\nfrom sklearn.svm import SVC\nimport numpy as np\n\nX, y = make_classification(n_samples=200, n_features=20, n_informative=5, random_state=42)\n\nmodels = {\n    'Logistic Regression': LogisticRegression(max_iter=1000),\n    'Random Forest': RandomForestClassifier(n_estimators=100, random_state=42),\n    'Gradient Boosting': GradientBoostingClassifier(random_state=42),\n    'SVM (RBF)': SVC(kernel='rbf')\n}\n\nfor name, model in models.items():\n    scores = cross_val_score(model, X, y, cv=5, scoring='accuracy')\n    print(f"{name}: {scores.mean():.3f} (+/- {scores.std():.3f})")`,
            hints: [
              'Use cross_val_score with cv=5 for reliable estimates',
              'Try linear models, tree ensembles, and SVMs',
              'Small datasets often favor simpler models that don\'t overfit'
            ],
            expectedOutput: 'Comparison showing gradient boosting or random forest likely winning on this small dataset'
          },
          {
            id: 'feature-engineering-pipeline',
            title: 'Build a feature engineering pipeline',
            difficulty: 'intermediate',
            type: 'coding',
            description: 'Create a scikit-learn Pipeline that handles missing values, scales numeric features, one-hot encodes categoricals, and trains a model.',
            starterCode: `from sklearn.pipeline import Pipeline\nfrom sklearn.compose import ColumnTransformer\nfrom sklearn.preprocessing import StandardScaler, OneHotEncoder\nfrom sklearn.impute import SimpleImputer\nimport numpy as np\nimport pandas as pd\n\n# Sample data with mixed types and missing values\ndata = pd.DataFrame({\n    'age': [25, 30, np.nan, 45, 35],\n    'salary': [50000, 60000, 75000, np.nan, 55000],\n    'city': ['NYC', 'LA', 'NYC', 'SF', 'LA'],\n    'target': [0, 1, 1, 0, 1]\n})\n\n# TODO: Build a ColumnTransformer that:\n# 1. Imputes and scales numeric features (age, salary)\n# 2. One-hot encodes categorical features (city)\n# TODO: Wrap in a Pipeline with a classifier`,
            solution: `from sklearn.pipeline import Pipeline\nfrom sklearn.compose import ColumnTransformer\nfrom sklearn.preprocessing import StandardScaler, OneHotEncoder\nfrom sklearn.impute import SimpleImputer\nfrom sklearn.ensemble import RandomForestClassifier\nimport numpy as np\nimport pandas as pd\n\ndata = pd.DataFrame({\n    'age': [25, 30, np.nan, 45, 35],\n    'salary': [50000, 60000, 75000, np.nan, 55000],\n    'city': ['NYC', 'LA', 'NYC', 'SF', 'LA'],\n    'target': [0, 1, 1, 0, 1]\n})\n\nnumeric_features = ['age', 'salary']\ncategorical_features = ['city']\n\nnumeric_transformer = Pipeline([\n    ('imputer', SimpleImputer(strategy='median')),\n    ('scaler', StandardScaler())\n])\n\ncategorical_transformer = Pipeline([\n    ('imputer', SimpleImputer(strategy='most_frequent')),\n    ('encoder', OneHotEncoder(handle_unknown='ignore'))\n])\n\npreprocessor = ColumnTransformer([\n    ('num', numeric_transformer, numeric_features),\n    ('cat', categorical_transformer, categorical_features)\n])\n\npipeline = Pipeline([\n    ('preprocessor', preprocessor),\n    ('classifier', RandomForestClassifier(random_state=42))\n])\n\nX = data.drop('target', axis=1)\ny = data['target']\npipeline.fit(X, y)\nprint(f"Pipeline trained successfully. Classes: {pipeline.classes_}")`,
            hints: [
              'ColumnTransformer applies different transforms to different column groups',
              'Use SimpleImputer with strategy="median" for numeric, "most_frequent" for categorical',
              'Pipeline ensures preprocessing is applied consistently in train and predict'
            ],
            expectedOutput: 'A fitted pipeline that handles all preprocessing and prediction in one call'
          }
        ],
        diagram: null,
        related: ['math-for-ml', 'model-evaluation']
      },
      {
        slug: 'model-evaluation',
        title: 'Model evaluation and validation',
        summary: 'Cross-validation, metrics selection, overfitting detection, and experiment tracking best practices.',
        duration: '25-35 min',
        whyItMatters: 'A model is only as good as its evaluation. Proper validation prevents costly production failures and builds trust in ML systems.',
        sections: [
          {
            heading: 'Validation strategies',
            body: 'Hold-out splits, k-fold cross-validation, stratified sampling, and time-series splits each suit different data distributions.',
            bullets: [
              'K-fold cross-validation gives robust estimates on small datasets',
              'Stratified splits preserve class ratios in imbalanced problems',
              'Time-series data requires chronological splits to avoid look-ahead bias'
            ]
          },
          {
            heading: 'Metrics that matter',
            body: 'Accuracy, precision, recall, F1, AUC-ROC, RMSE, and MAE each tell a different story about model quality.',
            bullets: [
              'Accuracy misleads on imbalanced classes; prefer precision-recall analysis',
              'AUC-ROC measures ranking quality independent of threshold',
              'Regression metrics (RMSE, MAE) differ in sensitivity to outliers'
            ]
          },
          {
            heading: 'Detecting and preventing overfitting',
            body: 'Learning curves, regularization, early stopping, and data augmentation keep models generalizable.',
            bullets: [
              'A widening gap between train and validation loss signals overfitting',
              'Regularization (L1/L2, dropout) penalizes model complexity',
              'More data and augmentation are often the most effective remedies'
            ]
          }
        ],
        checklist: [
          'Can choose the right validation strategy for the data distribution.',
          'Selects metrics aligned with business objectives rather than defaulting to accuracy.',
          'Monitors learning curves and applies regularization when overfitting appears.'
        ],
        pitfalls: [
          'Optimizing accuracy on an imbalanced dataset without examining per-class performance.',
          'Leaking future information into training data in time-series problems.',
          'Tuning hyperparameters on the test set instead of a separate validation fold.'
        ],
        interviewPrompts: [
          'How would you evaluate a fraud detection model when only 0.1% of transactions are fraudulent?',
          'What does a ROC curve tell you that accuracy alone does not?',
          'Describe a scenario where cross-validation is misleading.'
        ],
        exercises: [
          {
            id: 'cross-validation-comparison',
            title: 'Compare validation strategies',
            difficulty: 'intermediate',
            type: 'coding',
            description: 'Implement k-fold, stratified k-fold, and time-series split on a dataset. Compare how each affects the reported model performance.',
            starterCode: `from sklearn.model_selection import KFold, StratifiedKFold, TimeSeriesSplit, cross_val_score\nfrom sklearn.ensemble import RandomForestClassifier\nfrom sklearn.datasets import make_classification\nimport numpy as np\n\n# Imbalanced dataset\nX, y = make_classification(n_samples=500, weights=[0.9, 0.1], random_state=42)\nmodel = RandomForestClassifier(random_state=42)\n\n# TODO: Compare these three strategies\n# 1. KFold(n_splits=5)\n# 2. StratifiedKFold(n_splits=5)\n# 3. RepeatedStratifiedKFold(n_splits=5, n_repeats=3)\n# Report accuracy and F1 for each\n# Which gives the most reliable estimate and why?`,
            solution: `from sklearn.model_selection import KFold, StratifiedKFold, RepeatedStratifiedKFold, cross_val_score\nfrom sklearn.ensemble import RandomForestClassifier\nfrom sklearn.datasets import make_classification\nimport numpy as np\n\nX, y = make_classification(n_samples=500, weights=[0.9, 0.1], random_state=42)\nmodel = RandomForestClassifier(random_state=42)\n\nstrategies = {\n    'KFold': KFold(n_splits=5, shuffle=True, random_state=42),\n    'StratifiedKFold': StratifiedKFold(n_splits=5, shuffle=True, random_state=42),\n    'RepeatedStratified': RepeatedStratifiedKFold(n_splits=5, n_repeats=3, random_state=42)\n}\n\nfor name, cv in strategies.items():\n    acc = cross_val_score(model, X, y, cv=cv, scoring='accuracy')\n    f1 = cross_val_score(model, X, y, cv=cv, scoring='f1')\n    print(f"{name}: Acc={acc.mean():.3f}(+/-{acc.std():.3f}) F1={f1.mean():.3f}(+/-{f1.std():.3f})")`,
            hints: [
              'Stratified splits preserve class ratios in each fold',
              'With imbalanced data, accuracy can be misleading - check F1 too',
              'RepeatedStratifiedKFold gives lower-variance estimates'
            ],
            expectedOutput: 'StratifiedKFold and repeated variants should show more stable F1 scores'
          },
          {
            id: 'learning-curve-analysis',
            title: 'Diagnose overfitting with learning curves',
            difficulty: 'beginner',
            type: 'coding',
            description: 'Generate learning curves for models with different complexity levels and identify which is overfitting, underfitting, or well-fit.',
            starterCode: `from sklearn.model_selection import learning_curve\nfrom sklearn.tree import DecisionTreeClassifier\nfrom sklearn.datasets import make_classification\nimport numpy as np\n\nX, y = make_classification(n_samples=300, n_features=10, random_state=42)\n\n# TODO: Generate learning curves for:\n# 1. DecisionTreeClassifier(max_depth=1)  -- likely underfitting\n# 2. DecisionTreeClassifier(max_depth=None)  -- likely overfitting\n# 3. DecisionTreeClassifier(max_depth=5)  -- likely well-fit\n# Use learning_curve() and print train vs validation scores\n# Identify which model shows the largest train-val gap`,
            solution: `from sklearn.model_selection import learning_curve\nfrom sklearn.tree import DecisionTreeClassifier\nfrom sklearn.datasets import make_classification\nimport numpy as np\n\nX, y = make_classification(n_samples=300, n_features=10, random_state=42)\n\nmodels = {\n    'Underfitting (depth=1)': DecisionTreeClassifier(max_depth=1),\n    'Overfitting (no limit)': DecisionTreeClassifier(max_depth=None),\n    'Well-fit (depth=5)': DecisionTreeClassifier(max_depth=5)\n}\n\nfor name, model in models.items():\n    train_sizes, train_scores, val_scores = learning_curve(\n        model, X, y, cv=5, train_sizes=np.linspace(0.2, 1.0, 5), scoring='accuracy'\n    )\n    gap = train_scores.mean(axis=1)[-1] - val_scores.mean(axis=1)[-1]\n    print(f"{name}: Train={train_scores.mean(axis=1)[-1]:.3f} Val={val_scores.mean(axis=1)[-1]:.3f} Gap={gap:.3f}")`,
            hints: [
              'learning_curve returns train sizes, train scores, and validation scores',
              'A large gap between train and val scores indicates overfitting',
              'Underfitting shows low scores on both train and validation'
            ],
            expectedOutput: 'The unlimited depth tree should show the largest train-val gap (overfitting)'
          }
        ],
        diagram: null,
        related: ['classical-ml-algorithms', 'data-engineering-for-ml']
      }
    ]
  },
  {
    slug: 'deep-learning',
    title: 'Deep learning',
    summary: 'Neural network architectures from feed-forward networks through CNNs, RNNs, and transformers, with hands-on training using PyTorch and TensorFlow.',
    objectives: [
      'Build and train neural networks from scratch and with frameworks',
      'Understand CNN, RNN, and transformer architectures and their applications',
      'Apply transfer learning and fine-tuning to accelerate model development'
    ],
    lessons: [
      {
        slug: 'neural-network-fundamentals',
        title: 'Neural network fundamentals',
        summary: 'Perceptrons, activation functions, backpropagation, and optimization form the building blocks of all deep learning.',
        duration: '30-40 min',
        whyItMatters: 'Understanding how gradients flow through layers is essential for debugging training failures and designing effective architectures.',
        sections: [
          {
            heading: 'Architecture basics',
            body: 'Neurons, layers, activation functions (ReLU, sigmoid, tanh), and the universal approximation theorem explain why networks can model complex functions.',
            bullets: [
              'Each neuron computes a weighted sum followed by a non-linear activation',
              'Depth allows hierarchical feature learning; width allows richer representations per layer',
              'ReLU dominates hidden layers due to efficient gradients; softmax serves classification outputs'
            ]
          },
          {
            heading: 'Training mechanics',
            body: 'Forward pass, loss computation, backward pass (backpropagation), and parameter updates via optimizers (SGD, Adam) form the training loop.',
            bullets: [
              'Backpropagation applies the chain rule layer by layer to compute gradients',
              'Adam adapts learning rates per parameter using momentum and variance estimates',
              'Batch normalization and learning rate schedules stabilize training'
            ]
          },
          {
            heading: 'Practical considerations',
            body: 'GPU utilization, batch size effects, initialization strategies, and debugging vanishing/exploding gradients.',
            bullets: [
              'Xavier/He initialization prevents early gradient collapse',
              'Larger batch sizes improve throughput but may hurt generalization',
              'Gradient clipping prevents exploding gradients in deep or recurrent networks'
            ]
          }
        ],
        checklist: [
          'Can trace a forward and backward pass through a simple network on paper.',
          'Understands why ReLU helps with vanishing gradients compared to sigmoid.',
          'Knows when to adjust learning rate, batch size, or initialization.'
        ],
        pitfalls: [
          'Training without monitoring loss curves and validation metrics.',
          'Using overly complex architectures before proving a simpler one fails.',
          'Ignoring data preprocessing that causes numerical instability.'
        ],
        interviewPrompts: [
          'Walk through backpropagation for a two-layer network.',
          'Why might training loss decrease while validation loss increases?',
          'Compare SGD with momentum to Adam. When would you prefer each?'
        ],
        exercises: [
          {
            id: 'build-simple-nn',
            title: 'Build a neural network from scratch',
            difficulty: 'intermediate',
            type: 'coding',
            description: 'Implement a two-layer neural network in NumPy with forward pass, ReLU activation, cross-entropy loss, and backpropagation. Train it on XOR.',
            starterCode: `import numpy as np\n\nclass TwoLayerNet:\n    def __init__(self, input_dim, hidden_dim, output_dim):\n        self.W1 = np.random.randn(input_dim, hidden_dim) * 0.01\n        self.b1 = np.zeros(hidden_dim)\n        self.W2 = np.random.randn(hidden_dim, output_dim) * 0.01\n        self.b2 = np.zeros(output_dim)\n\n    def forward(self, X):\n        # TODO: Implement forward pass with ReLU\n        pass\n\n    def backward(self, X, y, learning_rate=0.1):\n        # TODO: Implement backpropagation\n        pass\n\n# Train on XOR\nX = np.array([[0,0],[0,1],[1,0],[1,1]])\ny = np.array([[0],[1],[1],[0]])\nnet = TwoLayerNet(2, 8, 1)`,
            solution: `import numpy as np\n\nclass TwoLayerNet:\n    def __init__(self, input_dim, hidden_dim, output_dim):\n        self.W1 = np.random.randn(input_dim, hidden_dim) * 0.01\n        self.b1 = np.zeros(hidden_dim)\n        self.W2 = np.random.randn(hidden_dim, output_dim) * 0.01\n        self.b2 = np.zeros(output_dim)\n\n    def forward(self, X):\n        self.z1 = X @ self.W1 + self.b1\n        self.a1 = np.maximum(0, self.z1)  # ReLU\n        self.z2 = self.a1 @ self.W2 + self.b2\n        self.output = 1 / (1 + np.exp(-self.z2))  # Sigmoid\n        return self.output\n\n    def backward(self, X, y, learning_rate=0.1):\n        m = X.shape[0]\n        dz2 = self.output - y\n        dW2 = self.a1.T @ dz2 / m\n        db2 = dz2.mean(axis=0)\n        da1 = dz2 @ self.W2.T\n        dz1 = da1 * (self.z1 > 0)\n        dW1 = X.T @ dz1 / m\n        db1 = dz1.mean(axis=0)\n        self.W2 -= learning_rate * dW2\n        self.b2 -= learning_rate * db2\n        self.W1 -= learning_rate * dW1\n        self.b1 -= learning_rate * db1`,
            hints: [
              'Forward: z1 = X @ W1 + b1, a1 = ReLU(z1), z2 = a1 @ W2 + b2, output = sigmoid(z2)',
              'Backward: start from output error and chain rule back through each layer',
              'ReLU derivative is 1 where input > 0, else 0'
            ],
            expectedOutput: 'Network should learn XOR after ~5000 iterations with correct outputs near 0 or 1'
          },
          {
            id: 'vanishing-gradient-experiment',
            title: 'Demonstrate vanishing gradients',
            difficulty: 'beginner',
            type: 'design',
            description: 'Design an experiment that shows vanishing gradients with sigmoid activations in a deep network vs ReLU. Explain what you would measure and expect to observe.',
            promptQuestions: [
              'What happens to the gradient of sigmoid when inputs are very large or very small?',
              'How does this compound across 10+ layers during backpropagation?',
              'Why does ReLU not suffer from this problem (and what is its own failure mode)?',
              'How would you monitor gradient magnitudes during training?'
            ]
          }
        ],
        diagram: null,
        related: ['cnn-and-computer-vision', 'transformer-architecture']
      },
      {
        slug: 'cnn-and-computer-vision',
        title: 'CNNs and computer vision',
        summary: 'Convolutional neural networks for image classification, object detection, and segmentation tasks.',
        duration: '30-40 min',
        whyItMatters: 'CNNs are the foundation of computer vision systems deployed in autonomous vehicles, medical imaging, content moderation, and manufacturing quality control.',
        sections: [
          {
            heading: 'Convolution and pooling',
            body: 'Convolutional layers learn local spatial features; pooling reduces spatial dimensions while preserving important signals.',
            bullets: [
              'Filters detect edges, textures, and increasingly abstract patterns in deeper layers',
              'Stride and padding control output dimensions',
              'Max pooling provides translation invariance; average pooling preserves more spatial info'
            ]
          },
          {
            heading: 'Modern architectures',
            body: 'ResNet, EfficientNet, and Vision Transformers (ViT) represent the evolution from hand-crafted to learned architectures.',
            bullets: [
              'Skip connections in ResNet solve vanishing gradients in very deep networks',
              'EfficientNet uses compound scaling to balance depth, width, and resolution',
              'Vision Transformers apply self-attention to image patches for global context'
            ]
          },
          {
            heading: 'Applied computer vision',
            body: 'Object detection (YOLO, Faster R-CNN), semantic segmentation (U-Net), and transfer learning enable practical vision systems.',
            bullets: [
              'Transfer learning from ImageNet-pretrained models saves weeks of training',
              'Data augmentation (flips, crops, color jitter) regularizes on small datasets',
              'Real-time inference requires model optimization: quantization, pruning, TensorRT'
            ]
          }
        ],
        checklist: [
          'Can explain how a convolutional layer differs from a fully connected layer.',
          'Understands transfer learning and when to freeze versus fine-tune layers.',
          'Knows the tradeoffs between YOLO and Faster R-CNN for detection tasks.'
        ],
        pitfalls: [
          'Training from scratch on small datasets instead of leveraging pretrained models.',
          'Ignoring data augmentation which is often more impactful than architecture changes.',
          'Not considering inference latency requirements when choosing architectures.'
        ],
        interviewPrompts: [
          'How do skip connections help train deeper networks?',
          'When would you use a Vision Transformer instead of a CNN?',
          'Explain the tradeoff between model accuracy and inference speed in production.'
        ],
        exercises: [
          {
            id: 'cnn-feature-visualization',
            title: 'Build and analyze a CNN for MNIST',
            difficulty: 'intermediate',
            type: 'coding',
            description: 'Build a CNN in PyTorch for MNIST digit classification. Visualize what the first convolutional layer learns by examining filter weights.',
            starterCode: `import torch\nimport torch.nn as nn\nimport torch.optim as optim\n\nclass SimpleCNN(nn.Module):\n    def __init__(self):\n        super().__init__()\n        # TODO: Define layers\n        # Conv2d -> ReLU -> MaxPool -> Conv2d -> ReLU -> MaxPool -> Flatten -> Linear\n        pass\n\n    def forward(self, x):\n        # TODO: Implement forward pass\n        pass\n\n# TODO: Train for 3 epochs on MNIST\n# TODO: Print first conv layer filter shapes and norms`,
            solution: `import torch\nimport torch.nn as nn\n\nclass SimpleCNN(nn.Module):\n    def __init__(self):\n        super().__init__()\n        self.conv1 = nn.Conv2d(1, 16, kernel_size=3, padding=1)\n        self.conv2 = nn.Conv2d(16, 32, kernel_size=3, padding=1)\n        self.pool = nn.MaxPool2d(2, 2)\n        self.fc1 = nn.Linear(32 * 7 * 7, 128)\n        self.fc2 = nn.Linear(128, 10)\n        self.relu = nn.ReLU()\n\n    def forward(self, x):\n        x = self.pool(self.relu(self.conv1(x)))\n        x = self.pool(self.relu(self.conv2(x)))\n        x = x.view(-1, 32 * 7 * 7)\n        x = self.relu(self.fc1(x))\n        return self.fc2(x)`,
            hints: [
              'MNIST images are 1x28x28 (grayscale)',
              'After two MaxPool2d(2,2) layers: 28->14->7',
              'First conv layer filters often learn edge detectors'
            ],
            expectedOutput: 'Model achieves >98% accuracy; first layer filters show edge-like patterns'
          },
          {
            id: 'transfer-learning-decision',
            title: 'Transfer learning strategy design',
            difficulty: 'beginner',
            type: 'design',
            description: 'Given a new task (classifying 500 medical X-ray images into 5 categories), design a transfer learning strategy. Decide which layers to freeze, what to fine-tune, and what data augmentation to apply.',
            promptQuestions: [
              'Which pretrained model would you choose and why (ResNet50, EfficientNet, ViT)?',
              'How many layers would you freeze vs fine-tune given only 500 images?',
              'What data augmentation is appropriate for medical images (vs general photos)?',
              'How would you handle class imbalance if some categories have fewer examples?'
            ]
          }
        ],
        diagram: null,
        related: ['neural-network-fundamentals', 'transformer-architecture']
      },
      {
        slug: 'transformer-architecture',
        title: 'Transformer architecture deep dive',
        summary: 'Self-attention, multi-head attention, positional encoding, and the encoder-decoder structure that powers modern NLP and beyond.',
        duration: '35-45 min',
        whyItMatters: 'Transformers are the foundation of GPT, BERT, and virtually all modern language models. Understanding them is non-negotiable for AI engineers.',
        sections: [
          {
            heading: 'Self-attention mechanism',
            body: 'Query, key, value projections and scaled dot-product attention allow each token to attend to all others, capturing long-range dependencies.',
            bullets: [
              'Attention weights are computed as softmax(QK^T / sqrt(d_k))',
              'Multi-head attention runs parallel attention with different learned projections',
              'Self-attention has O(n²) complexity in sequence length, motivating efficiency research'
            ]
          },
          {
            heading: 'Architecture components',
            body: 'Layer normalization, residual connections, feed-forward networks, and positional encodings complete the transformer block.',
            bullets: [
              'Positional encodings inject sequence order since attention is permutation-invariant',
              'Pre-norm vs post-norm affects training stability at scale',
              'The feed-forward network applies non-linearity independently per position'
            ]
          },
          {
            heading: 'Variants and scaling',
            body: 'Encoder-only (BERT), decoder-only (GPT), and encoder-decoder (T5) architectures serve different task families.',
            bullets: [
              'Decoder-only models with causal masking dominate text generation',
              'BERT-style models excel at classification and extraction tasks',
              'Scaling laws relate model size, data, and compute to performance'
            ]
          }
        ],
        checklist: [
          'Can explain the self-attention computation step by step.',
          'Understands the difference between encoder-only and decoder-only models.',
          'Knows why positional encoding is necessary and what alternatives exist.'
        ],
        pitfalls: [
          'Treating transformers as black boxes without understanding attention patterns.',
          'Ignoring quadratic attention complexity when working with long sequences.',
          'Confusing pre-training objectives (MLM vs causal LM) and their downstream implications.'
        ],
        interviewPrompts: [
          'Explain how multi-head attention differs from single-head attention.',
          'Why do decoder-only models use causal masking?',
          'How do scaling laws inform decisions about model size vs dataset size?'
        ],
        exercises: [
          {
            id: 'attention-from-scratch',
            title: 'Implement self-attention from scratch',
            difficulty: 'advanced',
            type: 'coding',
            description: 'Implement scaled dot-product attention and multi-head attention in NumPy. Verify outputs match expected shapes for a small sequence.',
            starterCode: `import numpy as np\n\ndef scaled_dot_product_attention(Q, K, V):\n    """\n    Q: (seq_len, d_k)\n    K: (seq_len, d_k)\n    V: (seq_len, d_v)\n    Returns: (seq_len, d_v) attention output\n    """\n    # TODO: Compute attention weights and output\n    # attention = softmax(Q @ K^T / sqrt(d_k)) @ V\n    pass\n\ndef multi_head_attention(X, num_heads, d_model):\n    """\n    X: (seq_len, d_model)\n    Split into num_heads, apply attention, concatenate\n    """\n    # TODO\n    pass\n\n# Test with seq_len=4, d_model=8, num_heads=2\nX = np.random.randn(4, 8)\noutput = multi_head_attention(X, num_heads=2, d_model=8)\nassert output.shape == (4, 8), f"Expected (4,8), got {output.shape}"\nprint("Self-attention output shape:", output.shape)`,
            solution: `import numpy as np\n\ndef softmax(x, axis=-1):\n    e_x = np.exp(x - x.max(axis=axis, keepdims=True))\n    return e_x / e_x.sum(axis=axis, keepdims=True)\n\ndef scaled_dot_product_attention(Q, K, V):\n    d_k = Q.shape[-1]\n    scores = Q @ K.T / np.sqrt(d_k)\n    weights = softmax(scores)\n    return weights @ V\n\ndef multi_head_attention(X, num_heads, d_model):\n    d_k = d_model // num_heads\n    outputs = []\n    for i in range(num_heads):\n        W_q = np.random.randn(d_model, d_k) * 0.1\n        W_k = np.random.randn(d_model, d_k) * 0.1\n        W_v = np.random.randn(d_model, d_k) * 0.1\n        Q = X @ W_q\n        K = X @ W_k\n        V = X @ W_v\n        outputs.append(scaled_dot_product_attention(Q, K, V))\n    concat = np.concatenate(outputs, axis=-1)\n    W_o = np.random.randn(d_model, d_model) * 0.1\n    return concat @ W_o`,
            hints: [
              'Softmax: subtract max for numerical stability before exp',
              'Scale factor is sqrt(d_k) where d_k is key dimension',
              'Multi-head: split d_model into num_heads of size d_model/num_heads'
            ],
            expectedOutput: 'Output shape (4, 8) matching input shape, demonstrating self-attention transformation'
          },
          {
            id: 'positional-encoding-analysis',
            title: 'Visualize positional encodings',
            difficulty: 'intermediate',
            type: 'coding',
            description: 'Implement sinusoidal positional encodings and demonstrate why they enable the model to learn relative positions.',
            starterCode: `import numpy as np\n\ndef positional_encoding(max_len, d_model):\n    """Generate sinusoidal positional encoding matrix.\n    Returns: (max_len, d_model) matrix\n    """\n    # TODO: Implement PE(pos, 2i) = sin(pos / 10000^(2i/d_model))\n    #        PE(pos, 2i+1) = cos(pos / 10000^(2i/d_model))\n    pass\n\n# Generate and verify properties\nPE = positional_encoding(50, 64)\nprint(f"Shape: {PE.shape}")\n# Show that dot product between positions decays with distance\nfor dist in [1, 5, 10, 25]:\n    sim = np.dot(PE[0], PE[dist])\n    print(f"Similarity pos 0 vs pos {dist}: {sim:.4f}")`,
            solution: `import numpy as np\n\ndef positional_encoding(max_len, d_model):\n    PE = np.zeros((max_len, d_model))\n    position = np.arange(max_len)[:, np.newaxis]\n    div_term = np.exp(np.arange(0, d_model, 2) * -(np.log(10000.0) / d_model))\n    PE[:, 0::2] = np.sin(position * div_term)\n    PE[:, 1::2] = np.cos(position * div_term)\n    return PE`,
            hints: [
              'Use broadcasting: positions as column vector, frequencies as row vector',
              'Even indices get sin, odd indices get cos',
              'The dot product between encodings should decrease with positional distance'
            ],
            expectedOutput: 'Similarity should decrease as positional distance increases'
          }
        ],
        diagram: null,
        related: ['neural-network-fundamentals', 'llm-fundamentals']
      }
    ]
  },
  {
    slug: 'llms-and-nlp',
    title: 'Large language models and NLP',
    summary: 'From tokenization and embeddings to LLM pre-training, fine-tuning, and deployment for production NLP systems.',
    objectives: [
      'Understand how LLMs are trained, fine-tuned, and served at scale',
      'Apply parameter-efficient fine-tuning techniques (LoRA, QLoRA, PEFT)',
      'Design NLP pipelines for classification, summarization, and generation tasks'
    ],
    lessons: [
      {
        slug: 'llm-fundamentals',
        title: 'LLM fundamentals',
        summary: 'Pre-training objectives, tokenization, context windows, and the emergent capabilities that appear at scale.',
        duration: '30-40 min',
        whyItMatters: 'LLMs are reshaping software engineering. Understanding their capabilities and limitations is essential for building reliable AI-powered applications.',
        sections: [
          {
            heading: 'How LLMs are trained',
            body: 'Next-token prediction on massive text corpora, followed by RLHF alignment, produces models that follow instructions and reason about novel tasks.',
            bullets: [
              'Pre-training learns language patterns from trillions of tokens',
              'Instruction tuning and RLHF align the model with human preferences',
              'Emergent abilities (reasoning, code generation) appear at sufficient scale'
            ]
          },
          {
            heading: 'Tokenization and context',
            body: 'BPE, SentencePiece, and tiktoken break text into subword tokens that define the model vocabulary and context window limits.',
            bullets: [
              'Token count determines memory usage and computational cost per request',
              'Context window size limits how much information the model can use at once',
              'Tokenization artifacts can cause surprising behavior with numbers, code, and rare words'
            ]
          },
          {
            heading: 'Capabilities and limitations',
            body: 'LLMs excel at pattern completion but struggle with factual accuracy, arithmetic, and maintaining consistency over long outputs.',
            bullets: [
              'Hallucination is inherent to probabilistic generation and requires mitigation strategies',
              'Knowledge cutoff dates mean models lack awareness of recent events',
              'Context window overflow loses earlier information without explicit management'
            ]
          }
        ],
        checklist: [
          'Can explain the training pipeline from pre-training through RLHF.',
          'Understands tokenization and its impact on model behavior and cost.',
          'Knows the main failure modes of LLMs and mitigation approaches.'
        ],
        pitfalls: [
          'Assuming LLMs have reliable factual knowledge without verification.',
          'Ignoring token costs when designing applications with large context needs.',
          'Treating LLMs as deterministic systems rather than probabilistic generators.'
        ],
        interviewPrompts: [
          'How does RLHF differ from supervised fine-tuning?',
          'What causes hallucination and how would you mitigate it in a production system?',
          'Explain the tradeoff between context window size and inference cost.'
        ],
        exercises: [
          {
            id: 'tokenization-comparison',
            title: 'Compare tokenization strategies',
            difficulty: 'beginner',
            type: 'coding',
            description: 'Tokenize the same text with different tokenizers (whitespace, BPE via tiktoken, character-level) and analyze the differences in vocabulary size, token count, and handling of rare words.',
            starterCode: `# Install: pip install tiktoken\nimport tiktoken\n\ntext = "The transformer architecture revolutionized NLP. GPT-4's tokenizer handles subwords efficiently."\n\n# Method 1: Whitespace tokenization\ndef whitespace_tokenize(text):\n    return text.split()\n\n# Method 2: Character-level\ndef char_tokenize(text):\n    return list(text)\n\n# Method 3: BPE (tiktoken)\ndef bpe_tokenize(text):\n    enc = tiktoken.get_encoding("cl100k_base")\n    # TODO: encode and decode to show tokens\n    pass\n\n# TODO: Compare token counts and show how each handles "GPT-4's"\n# TODO: Calculate cost difference at $0.01 per 1K tokens`,
            solution: `import tiktoken\n\ntext = "The transformer architecture revolutionized NLP. GPT-4's tokenizer handles subwords efficiently."\n\ndef whitespace_tokenize(text):\n    return text.split()\n\ndef char_tokenize(text):\n    return list(text)\n\ndef bpe_tokenize(text):\n    enc = tiktoken.get_encoding("cl100k_base")\n    tokens = enc.encode(text)\n    decoded = [enc.decode([t]) for t in tokens]\n    return tokens, decoded\n\nws_tokens = whitespace_tokenize(text)\nchar_tokens = char_tokenize(text)\nbpe_ids, bpe_decoded = bpe_tokenize(text)\n\nprint(f"Whitespace: {len(ws_tokens)} tokens")\nprint(f"Character: {len(char_tokens)} tokens")\nprint(f"BPE: {len(bpe_ids)} tokens")\nprint(f"\nBPE breakdown of 'GPT-4\'s': {[t for t in bpe_decoded if 'GPT' in t or '4' in t or "'" in t]}")`,
            hints: [
              'tiktoken.get_encoding("cl100k_base") gives GPT-4 tokenizer',
              'enc.encode() returns token IDs, enc.decode([id]) shows the text',
              'BPE balances vocabulary size with sequence length'
            ],
            expectedOutput: 'BPE produces fewer tokens than character-level but more than whitespace, handling subwords gracefully'
          },
          {
            id: 'llm-limitations-probe',
            title: 'Probe LLM limitations systematically',
            difficulty: 'intermediate',
            type: 'design',
            description: 'Design a test suite that exposes common LLM failure modes: arithmetic errors, hallucination, inconsistency, and context window overflow.',
            promptQuestions: [
              'What arithmetic operations tend to fail and at what number sizes?',
              'How would you test for factual hallucination in a verifiable domain?',
              'Design a test that shows context window information loss',
              'How would you measure inconsistency across repeated queries?'
            ]
          }
        ],
        diagram: null,
        related: ['transformer-architecture', 'fine-tuning-techniques']
      },
      {
        slug: 'fine-tuning-techniques',
        title: 'Fine-tuning and adaptation',
        summary: 'Full fine-tuning, LoRA, QLoRA, PEFT, and instruction tuning to adapt foundation models to specific domains and tasks.',
        duration: '30-40 min',
        whyItMatters: 'Fine-tuning lets you build specialized models that outperform prompting alone on domain-specific tasks while controlling cost and latency.',
        sections: [
          {
            heading: 'When to fine-tune',
            body: 'Fine-tuning is most valuable when the task requires domain-specific style, format adherence, or performance that prompting cannot achieve.',
            bullets: [
              'Prompting first: try few-shot examples before committing to fine-tuning',
              'Fine-tuning wins when you need consistent output format or domain vocabulary',
              'Cost-benefit: fine-tuned smaller models often beat prompted larger models at lower cost'
            ]
          },
          {
            heading: 'Parameter-efficient methods',
            body: 'LoRA, QLoRA, and adapters update a tiny fraction of parameters while achieving near-full fine-tuning quality.',
            bullets: [
              'LoRA adds low-rank matrices to attention layers, training <1% of parameters',
              'QLoRA combines 4-bit quantization with LoRA for memory efficiency',
              'Adapter layers insert small trainable modules between frozen transformer blocks'
            ]
          },
          {
            heading: 'Data preparation and evaluation',
            body: 'Instruction formatting, data quality, evaluation metrics, and avoiding catastrophic forgetting are critical to successful fine-tuning.',
            bullets: [
              'High-quality instruction-response pairs matter more than dataset size',
              'Evaluation should include both automated metrics and human preference ratings',
              'Mixing general data prevents catastrophic forgetting of base capabilities'
            ]
          }
        ],
        checklist: [
          'Can decide when fine-tuning is worthwhile versus prompting strategies.',
          'Understands LoRA mechanics and when to prefer it over full fine-tuning.',
          'Knows how to prepare instruction-tuning datasets and evaluate results.'
        ],
        pitfalls: [
          'Fine-tuning without first exhausting prompt engineering approaches.',
          'Using low-quality or biased training data that degrades model behavior.',
          'Evaluating only on automated metrics without checking output quality manually.'
        ],
        interviewPrompts: [
          'Explain how LoRA achieves parameter efficiency. What are its limitations?',
          'How would you prepare a dataset for instruction-tuning a customer support model?',
          'What is catastrophic forgetting and how do you prevent it during fine-tuning?'
        ],
        exercises: [
          {
            id: 'lora-implementation',
            title: 'Implement LoRA from scratch',
            difficulty: 'advanced',
            type: 'coding',
            description: 'Implement a simplified LoRA (Low-Rank Adaptation) layer in PyTorch. Show how it reduces trainable parameters while preserving model quality.',
            starterCode: `import torch\nimport torch.nn as nn\n\nclass LoRALayer(nn.Module):\n    """Low-Rank Adaptation layer.\n    Wraps an existing linear layer and adds low-rank update: output = Wx + BAx\n    where B is (out_features, rank) and A is (rank, in_features)\n    """\n    def __init__(self, original_layer, rank=4):\n        super().__init__()\n        # TODO: Store original layer (frozen) and create A, B matrices\n        # A should be initialized with small random values\n        # B should be initialized to zeros (so LoRA starts as identity)\n        pass\n\n    def forward(self, x):\n        # TODO: Return original output + low-rank update\n        pass\n\n# Test: wrap a large linear layer\noriginal = nn.Linear(768, 768)\nlora = LoRALayer(original, rank=8)\noriginal_params = sum(p.numel() for p in original.parameters())\nlora_params = sum(p.numel() for p in lora.parameters() if p.requires_grad)\nprint(f"Original params: {original_params}")\nprint(f"LoRA trainable params: {lora_params}")\nprint(f"Reduction: {lora_params/original_params*100:.1f}%")`,
            solution: `import torch\nimport torch.nn as nn\n\nclass LoRALayer(nn.Module):\n    def __init__(self, original_layer, rank=4):\n        super().__init__()\n        self.original = original_layer\n        self.original.weight.requires_grad_(False)\n        if self.original.bias is not None:\n            self.original.bias.requires_grad_(False)\n        in_features = original_layer.in_features\n        out_features = original_layer.out_features\n        self.A = nn.Parameter(torch.randn(rank, in_features) * 0.01)\n        self.B = nn.Parameter(torch.zeros(out_features, rank))\n\n    def forward(self, x):\n        original_output = self.original(x)\n        lora_output = (x @ self.A.T) @ self.B.T\n        return original_output + lora_output`,
            hints: [
              'Freeze original weights with requires_grad_(False)',
              'B initialized to zeros means LoRA output starts at zero (preserves original behavior)',
              'A has shape (rank, in_features), B has shape (out_features, rank)',
              'Total LoRA params = rank * (in_features + out_features)'
            ],
            expectedOutput: 'LoRA adds ~2% trainable params for rank=8 on a 768x768 layer'
          },
          {
            id: 'fine-tuning-data-prep',
            title: 'Prepare instruction-tuning dataset',
            difficulty: 'intermediate',
            type: 'coding',
            description: 'Transform raw customer support conversations into instruction-tuning format (system/user/assistant). Implement quality filters and train/eval split.',
            starterCode: `import json\n\n# Raw support conversations\nraw_data = [\n    {"customer": "My order #1234 hasn't arrived", "agent": "I can see order #1234 was shipped on Monday. Let me check the tracking status for you.", "resolved": True},\n    {"customer": "How do I return this?", "agent": "You can initiate a return from your order history page. Would you like me to walk you through it?", "resolved": True},\n    {"customer": "This is terrible!!!", "agent": "I'm sorry to hear that. I want to help resolve this. Can you tell me more about what went wrong?", "resolved": False},\n]\n\n# TODO: Convert to instruction format\n# TODO: Add quality filters (resolved conversations only, min length, etc.)\n# TODO: Create 80/20 train/eval split\n# TODO: Save as JSONL`,
            solution: `import json\nimport random\n\nraw_data = [\n    {"customer": "My order #1234 hasn't arrived", "agent": "I can see order #1234 was shipped on Monday. Let me check the tracking status for you.", "resolved": True},\n    {"customer": "How do I return this?", "agent": "You can initiate a return from your order history page. Would you like me to walk you through it?", "resolved": True},\n    {"customer": "This is terrible!!!", "agent": "I'm sorry to hear that. I want to help resolve this. Can you tell me more about what went wrong?", "resolved": False},\n]\n\ndef to_instruction_format(conv):\n    return {\n        "messages": [\n            {"role": "system", "content": "You are a helpful customer support agent. Be empathetic, professional, and solution-oriented."},\n            {"role": "user", "content": conv["customer"]},\n            {"role": "assistant", "content": conv["agent"]}\n        ]\n    }\n\n# Quality filters\nfiltered = [c for c in raw_data if c["resolved"] and len(c["agent"]) > 20]\nformatted = [to_instruction_format(c) for c in filtered]\n\n# Split\nrandom.shuffle(formatted)\nsplit_idx = int(len(formatted) * 0.8)\ntrain, eval_set = formatted[:split_idx], formatted[split_idx:]\nprint(f"Train: {len(train)}, Eval: {len(eval_set)}")`,
            hints: [
              'Instruction format uses system/user/assistant message roles',
              'Filter for quality: resolved conversations, minimum response length',
              'JSONL format: one JSON object per line'
            ],
            expectedOutput: 'Properly formatted JSONL with system prompts, filtered for quality'
          }
        ],
        diagram: null,
        related: ['llm-fundamentals', 'prompt-engineering']
      },
      {
        slug: 'embeddings-and-vector-search',
        title: 'Embeddings and vector search',
        summary: 'Text embeddings, vector databases, similarity search, and hybrid retrieval for powering semantic search and RAG systems.',
        duration: '25-35 min',
        whyItMatters: 'Vector search is the retrieval backbone of RAG systems, semantic search, recommendation engines, and knowledge management applications.',
        sections: [
          {
            heading: 'Embedding models',
            body: 'Sentence transformers, OpenAI embeddings, and domain-specific models convert text into dense vectors that capture semantic meaning.',
            bullets: [
              'Embedding quality directly determines retrieval relevance in downstream tasks',
              'Domain-specific fine-tuning of embedding models improves retrieval for specialized corpora',
              'Embedding dimensions trade off between expressiveness and storage/compute cost'
            ]
          },
          {
            heading: 'Vector databases',
            body: 'Pinecone, Weaviate, Milvus, Qdrant, and FAISS provide infrastructure for storing, indexing, and querying high-dimensional vectors at scale.',
            bullets: [
              'Approximate nearest neighbor (ANN) algorithms enable sub-linear search time',
              'Metadata filtering combines semantic similarity with structured constraints',
              'Choosing between managed services and self-hosted depends on scale and compliance needs'
            ]
          },
          {
            heading: 'Hybrid and advanced retrieval',
            body: 'Combining keyword search (BM25) with vector similarity and reranking produces more robust retrieval than either alone.',
            bullets: [
              'Hybrid search catches exact matches that embeddings might miss',
              'Cross-encoder reranking improves precision at the cost of latency',
              'Chunking strategy (size, overlap, boundaries) significantly affects retrieval quality'
            ]
          }
        ],
        checklist: [
          'Can select an appropriate embedding model for the use case and domain.',
          'Understands ANN index tradeoffs: recall vs latency vs memory.',
          'Knows when hybrid search outperforms pure vector similarity.'
        ],
        pitfalls: [
          'Using generic embeddings without evaluating domain-specific alternatives.',
          'Choosing chunk sizes without considering the downstream task requirements.',
          'Over-relying on vector similarity when keyword matching would be more precise.'
        ],
        interviewPrompts: [
          'How would you design a semantic search system for a legal document corpus?',
          'Compare HNSW and IVF indexes in terms of build time, query speed, and recall.',
          'When does hybrid search provide value over pure vector retrieval?'
        ],
        exercises: [
          {
            id: 'embedding-similarity-search',
            title: 'Build a semantic search engine',
            difficulty: 'intermediate',
            type: 'coding',
            description: 'Implement a simple semantic search using sentence embeddings and cosine similarity. Index a set of documents and retrieve the most relevant ones for a query.',
            starterCode: `import numpy as np\n\n# Simulated embeddings (in practice, use sentence-transformers or OpenAI)\ndef mock_embed(text):\n    """Deterministic mock embedding based on word overlap."""\n    words = set(text.lower().split())\n    vocab = ['machine', 'learning', 'neural', 'network', 'data', 'model',\n             'train', 'python', 'code', 'api', 'database', 'cloud']\n    return np.array([1.0 if w in words else 0.0 for w in vocab])\n\ndocuments = [\n    "Machine learning models need training data",\n    "Neural networks learn from large datasets",\n    "Python is great for data science",\n    "REST APIs connect frontend to database",\n    "Cloud deployment scales machine learning models",\n]\n\n# TODO: Embed all documents\n# TODO: Implement cosine_similarity(a, b)\n# TODO: Search function that returns top-k most similar documents\n# TODO: Test with query "how to train a neural network"`,
            solution: `import numpy as np\n\ndef mock_embed(text):\n    words = set(text.lower().split())\n    vocab = ['machine', 'learning', 'neural', 'network', 'data', 'model',\n             'train', 'python', 'code', 'api', 'database', 'cloud']\n    return np.array([1.0 if w in words else 0.0 for w in vocab])\n\ndef cosine_similarity(a, b):\n    dot = np.dot(a, b)\n    norm = np.linalg.norm(a) * np.linalg.norm(b)\n    return dot / norm if norm > 0 else 0.0\n\ndocuments = [\n    "Machine learning models need training data",\n    "Neural networks learn from large datasets",\n    "Python is great for data science",\n    "REST APIs connect frontend to database",\n    "Cloud deployment scales machine learning models",\n]\n\n# Index\nembeddings = [mock_embed(doc) for doc in documents]\n\ndef search(query, top_k=3):\n    query_emb = mock_embed(query)\n    scores = [(i, cosine_similarity(query_emb, emb)) for i, emb in enumerate(embeddings)]\n    scores.sort(key=lambda x: x[1], reverse=True)\n    return [(documents[i], score) for i, score in scores[:top_k]]\n\nresults = search("how to train a neural network")\nfor doc, score in results:\n    print(f"{score:.3f}: {doc}")`,
            hints: [
              'Cosine similarity = dot(a,b) / (||a|| * ||b||)',
              'Index all documents once, then compare query embedding to all',
              'Sort by descending similarity and return top-k'
            ],
            expectedOutput: 'Documents about neural networks and training data should rank highest'
          },
          {
            id: 'chunking-strategy-design',
            title: 'Design optimal chunking for RAG',
            difficulty: 'intermediate',
            type: 'design',
            description: 'Given a technical documentation corpus, design a chunking strategy that balances retrieval granularity with context completeness.',
            promptQuestions: [
              'What chunk size would you choose for API documentation vs tutorials vs troubleshooting guides?',
              'How does chunk overlap affect retrieval recall vs storage cost?',
              'When should you use semantic boundaries (paragraphs, sections) vs fixed-size chunks?',
              'How would you handle tables, code blocks, and images during chunking?'
            ]
          }
        ],
        diagram: null,
        related: ['llm-fundamentals', 'rag-systems']
      }
    ]
  },
  {
    slug: 'prompt-engineering-and-rag',
    title: 'Prompt engineering and RAG',
    summary: 'Systematic prompt design, retrieval-augmented generation pipelines, and techniques for grounding LLM outputs in verified knowledge.',
    objectives: [
      'Design effective prompts using few-shot, chain-of-thought, and structured techniques',
      'Build end-to-end RAG pipelines that ground LLM responses in external knowledge',
      'Evaluate and optimize retrieval quality and generation accuracy'
    ],
    lessons: [
      {
        slug: 'prompt-engineering',
        title: 'Prompt engineering',
        summary: 'Zero-shot, few-shot, chain-of-thought, and structured prompting techniques for reliable LLM outputs.',
        duration: '25-35 min',
        whyItMatters: 'Effective prompting is the fastest way to extract value from LLMs without training. It is the primary interface skill for AI engineers building applications.',
        sections: [
          {
            heading: 'Core techniques',
            body: 'Zero-shot instructions, few-shot examples, chain-of-thought reasoning, and system prompts give increasing control over model behavior.',
            bullets: [
              'Clear role and task descriptions in system prompts set the behavioral frame',
              'Few-shot examples teach format and style more reliably than verbose instructions',
              'Chain-of-thought prompting improves reasoning on multi-step problems'
            ]
          },
          {
            heading: 'Structured output',
            body: 'JSON mode, function calling, and output schemas ensure LLM responses can be reliably parsed by downstream systems.',
            bullets: [
              'Constrained decoding and grammar-guided generation prevent malformed outputs',
              'Function calling schemas define the interface between LLM and application code',
              'Validation and retry logic handles edge cases in structured generation'
            ]
          },
          {
            heading: 'Evaluation and iteration',
            body: 'Prompt versioning, A/B testing, and automated evaluation enable systematic improvement of prompt quality.',
            bullets: [
              'Track prompt versions alongside their evaluation scores and failure cases',
              'Automated evaluators (LLM-as-judge) scale beyond manual review',
              'Red-teaming and adversarial testing reveal prompt injection vulnerabilities'
            ]
          }
        ],
        checklist: [
          'Can select the appropriate prompting technique for a given task complexity.',
          'Designs prompts that produce structured, parseable outputs.',
          'Tests prompts systematically with evaluation metrics and edge cases.'
        ],
        pitfalls: [
          'Writing overly long prompts that confuse the model with contradictory instructions.',
          'Not testing prompts against adversarial inputs and edge cases.',
          'Relying on prompt engineering alone when fine-tuning would be more reliable.'
        ],
        interviewPrompts: [
          'How does chain-of-thought prompting improve reasoning and what are its costs?',
          'Design a prompt strategy for extracting structured data from unstructured emails.',
          'How would you defend against prompt injection in a user-facing application?'
        ],
        exercises: [
          {
            id: 'prompt-techniques-comparison',
            title: 'Compare prompting techniques',
            difficulty: 'intermediate',
            type: 'coding',
            description: 'Implement zero-shot, few-shot, and chain-of-thought prompts for the same classification task. Compare their effectiveness on edge cases.',
            starterCode: "def build_zero_shot_prompt(text):\n    \"\"\"Classify sentiment as positive, negative, or neutral.\"\"\"\n    # TODO: Write a zero-shot prompt\n    pass\n\ndef build_few_shot_prompt(text):\n    \"\"\"Include 3 examples before the classification request.\"\"\"\n    # TODO: Write a few-shot prompt with examples\n    pass\n\ndef build_cot_prompt(text):\n    \"\"\"Ask the model to reason step-by-step before classifying.\"\"\"\n    # TODO: Write a chain-of-thought prompt\n    pass\n\n# Test with ambiguous cases\ntest_cases = [\n    'The product works but the delivery was awful.',\n    'Not bad for the price I guess.',\n    'I expected better from this brand.'\n]\n\nfor text in test_cases:\n    print(f'Text: {text}')\n    print(f'Zero-shot: {build_zero_shot_prompt(text)}')\n    print(f'Few-shot: {build_few_shot_prompt(text)}')\n    print(f'CoT: {build_cot_prompt(text)}')\n    print()",
            solution: "def build_zero_shot_prompt(text):\n    return f\"\"\"Classify the sentiment of the following text as exactly one of: positive, negative, or neutral.\\n\\nText: {text}\\nSentiment:\"\"\"\n\ndef build_few_shot_prompt(text):\n    return f\"\"\"Classify the sentiment as positive, negative, or neutral.\\n\\nText: \\\"I love this product, it works perfectly!\\\"\\nSentiment: positive\\n\\nText: \\\"Terrible quality, broke after one day.\\\"\\nSentiment: negative\\n\\nText: \\\"It does what it says, nothing special.\\\"\\nSentiment: neutral\\n\\nText: \\\"{text}\\\"\\nSentiment:\"\"\"\n\ndef build_cot_prompt(text):\n    return f\"\"\"Classify the sentiment of the following text. Think step by step:\\n1. Identify positive aspects mentioned\\n2. Identify negative aspects mentioned\\n3. Weigh which dominates\\n4. Give your final classification as: positive, negative, or neutral\\n\\nText: \\\"{text}\\\"\\n\\nStep-by-step analysis:\"\"\"",
            hints: [
              'Zero-shot: just describe the task clearly with the output format',
              'Few-shot: include 3 diverse examples covering all classes',
              'Chain-of-thought: ask the model to reason before giving the final answer'
            ],
            expectedOutput: 'Three different prompt formats; CoT should handle ambiguous cases better'
          },
          {
            id: 'structured-output-design',
            title: 'Design structured output schemas',
            difficulty: 'beginner',
            type: 'design',
            description: 'Design function calling schemas and JSON output formats for a system that extracts meeting action items from transcripts.',
            promptQuestions: [
              'What JSON schema would you use for extracted action items (assignee, task, deadline, priority)?',
              'How would you handle cases where information is ambiguous or missing?',
              'Design error handling for when the model produces malformed JSON.',
              'How would you validate extracted dates and assignee names against known entities?'
            ]
          }
        ],
        diagram: null,
        related: ['llm-fundamentals', 'rag-systems']
      },
      {
        slug: 'rag-systems',
        title: 'Retrieval-augmented generation',
        summary: 'End-to-end RAG architecture: document ingestion, chunking, retrieval, context assembly, and grounded generation.',
        duration: '35-45 min',
        whyItMatters: 'RAG is the dominant pattern for building knowledge-grounded AI applications that need up-to-date information without retraining the model.',
        sections: [
          {
            heading: 'RAG architecture',
            body: 'Ingest documents, chunk and embed them, retrieve relevant passages at query time, and augment the LLM prompt with retrieved context.',
            bullets: [
              'Document loaders handle PDFs, HTML, databases, and API sources',
              'Chunking strategy (sentence, paragraph, semantic boundaries) affects retrieval granularity',
              'The retriever-generator pipeline separates knowledge storage from reasoning'
            ]
          },
          {
            heading: 'Advanced RAG patterns',
            body: 'Query transformation, multi-step retrieval, reranking, and self-reflection improve answer quality beyond naive RAG.',
            bullets: [
              'Query expansion and hypothetical document embeddings improve recall',
              'Multi-hop retrieval chains answer complex questions requiring multiple sources',
              'Self-RAG and CRAG add verification steps that check retrieval relevance'
            ]
          },
          {
            heading: 'Evaluation and optimization',
            body: 'Measuring retrieval recall, answer faithfulness, and hallucination rates guides pipeline tuning.',
            bullets: [
              'Retrieval metrics: precision@k, recall@k, MRR measure retriever quality',
              'Generation metrics: faithfulness, relevance, and hallucination rate assess grounding',
              'End-to-end evaluation combines retrieval and generation quality holistically'
            ]
          }
        ],
        checklist: [
          'Can design a complete RAG pipeline from document ingestion to response generation.',
          'Understands chunking tradeoffs and their impact on retrieval quality.',
          'Evaluates RAG systems with appropriate retrieval and generation metrics.'
        ],
        pitfalls: [
          'Using fixed chunk sizes without considering document structure.',
          'Not measuring retrieval quality separately from generation quality.',
          'Stuffing too much context into the prompt, exceeding useful context window usage.'
        ],
        interviewPrompts: [
          'Design a RAG system for a customer support knowledge base with 10,000 articles.',
          'How would you handle conflicting information from multiple retrieved documents?',
          'Compare naive RAG to advanced RAG with reranking. When is the complexity justified?'
        ],
        exercises: [
          {
            id: 'rag-pipeline-build',
            title: 'Build an end-to-end RAG pipeline',
            difficulty: 'advanced',
            type: 'coding',
            description: 'Implement a complete RAG pipeline: document chunking, embedding, retrieval, context assembly, and prompt construction. Use mock embeddings for testing.',
            starterCode: `import numpy as np\nfrom typing import List, Dict\n\n# Mock embedding function\ndef embed(text: str) -> np.ndarray:\n    np.random.seed(hash(text) % 2**32)\n    return np.random.randn(64)\n\nclass RAGPipeline:\n    def __init__(self):\n        self.chunks: List[str] = []\n        self.embeddings: List[np.ndarray] = []\n\n    def ingest(self, document: str, chunk_size: int = 200, overlap: int = 50):\n        """Chunk document and store embeddings."""\n        # TODO: Split into overlapping chunks\n        # TODO: Embed each chunk\n        pass\n\n    def retrieve(self, query: str, top_k: int = 3) -> List[str]:\n        """Find most relevant chunks for a query."""\n        # TODO: Embed query and find nearest chunks\n        pass\n\n    def generate_prompt(self, query: str, context: List[str]) -> str:\n        """Assemble the RAG prompt with retrieved context."""\n        # TODO: Format context and query into a prompt\n        pass\n\n# Test\npipeline = RAGPipeline()\ndoc = "Python is a versatile programming language. " * 20\npipeline.ingest(doc)\nresults = pipeline.retrieve("What is Python used for?")\nprompt = pipeline.generate_prompt("What is Python used for?", results)\nprint(prompt[:500])`,
            solution: `import numpy as np\nfrom typing import List\n\ndef embed(text: str) -> np.ndarray:\n    np.random.seed(hash(text) % 2**32)\n    return np.random.randn(64)\n\nclass RAGPipeline:\n    def __init__(self):\n        self.chunks = []\n        self.embeddings = []\n\n    def ingest(self, document: str, chunk_size: int = 200, overlap: int = 50):\n        words = document.split()\n        for i in range(0, len(words), chunk_size - overlap):\n            chunk = ' '.join(words[i:i + chunk_size])\n            if chunk:\n                self.chunks.append(chunk)\n                self.embeddings.append(embed(chunk))\n\n    def retrieve(self, query: str, top_k: int = 3) -> List[str]:\n        query_emb = embed(query)\n        scores = []\n        for i, emb in enumerate(self.embeddings):\n            sim = np.dot(query_emb, emb) / (np.linalg.norm(query_emb) * np.linalg.norm(emb))\n            scores.append((sim, i))\n        scores.sort(reverse=True)\n        return [self.chunks[i] for _, i in scores[:top_k]]\n\n    def generate_prompt(self, query: str, context: List[str]) -> str:\n        ctx = '\\n---\\n'.join(context)\n        return f"""Answer the question based on the context below.\\n\\nContext:\\n{ctx}\\n\\nQuestion: {query}\\nAnswer:"""`,
            hints: [
              'Chunk with overlap: step by (chunk_size - overlap) words',
              'Cosine similarity for retrieval: dot / (norm * norm)',
              'Prompt should clearly separate context from the question'
            ],
            expectedOutput: 'A properly formatted prompt with retrieved context chunks and the user query'
          },
          {
            id: 'rag-evaluation-metrics',
            title: 'Evaluate RAG retrieval quality',
            difficulty: 'intermediate',
            type: 'coding',
            description: 'Implement precision@k, recall@k, and MRR metrics for evaluating a retrieval system given ground truth relevant documents.',
            starterCode: `from typing import List\n\ndef precision_at_k(retrieved: List[str], relevant: List[str], k: int) -> float:\n    """Fraction of top-k retrieved docs that are relevant."""\n    # TODO\n    pass\n\ndef recall_at_k(retrieved: List[str], relevant: List[str], k: int) -> float:\n    """Fraction of relevant docs found in top-k."""\n    # TODO\n    pass\n\ndef mrr(retrieved: List[str], relevant: List[str]) -> float:\n    """Mean Reciprocal Rank: 1/position of first relevant result."""\n    # TODO\n    pass\n\n# Test\nretrieved = ['doc_a', 'doc_b', 'doc_c', 'doc_d', 'doc_e']\nrelevant = ['doc_b', 'doc_d', 'doc_f']\nprint(f"P@3: {precision_at_k(retrieved, relevant, 3):.3f}")\nprint(f"R@3: {recall_at_k(retrieved, relevant, 3):.3f}")\nprint(f"MRR: {mrr(retrieved, relevant):.3f}")`,
            solution: `from typing import List\n\ndef precision_at_k(retrieved: List[str], relevant: List[str], k: int) -> float:\n    top_k = retrieved[:k]\n    relevant_set = set(relevant)\n    return len([d for d in top_k if d in relevant_set]) / k\n\ndef recall_at_k(retrieved: List[str], relevant: List[str], k: int) -> float:\n    top_k = retrieved[:k]\n    relevant_set = set(relevant)\n    return len([d for d in top_k if d in relevant_set]) / len(relevant_set)\n\ndef mrr(retrieved: List[str], relevant: List[str]) -> float:\n    relevant_set = set(relevant)\n    for i, doc in enumerate(retrieved):\n        if doc in relevant_set:\n            return 1.0 / (i + 1)\n    return 0.0`,
            hints: [
              'P@k = (relevant in top-k) / k',
              'R@k = (relevant in top-k) / total_relevant',
              'MRR = 1/rank of first relevant document'
            ],
            expectedOutput: 'P@3: 0.333, R@3: 0.333, MRR: 0.500'
          }
        ],
        diagram: null,
        related: ['embeddings-and-vector-search', 'prompt-engineering']
      },
      {
        slug: 'building-with-frameworks',
        title: 'Building with LLM frameworks',
        summary: 'LangChain, LlamaIndex, Haystack, and other orchestration frameworks for composing LLM-powered applications.',
        duration: '25-35 min',
        whyItMatters: 'Frameworks abstract common patterns (chains, retrieval, memory) and accelerate development of production LLM applications.',
        sections: [
          {
            heading: 'Framework landscape',
            body: 'LangChain, LlamaIndex, Haystack, and Semantic Kernel each emphasize different aspects of LLM application development.',
            bullets: [
              'LangChain provides composable chains, agents, and tool integrations',
              'LlamaIndex focuses on data indexing and retrieval optimization',
              'Haystack emphasizes production pipelines with modular components'
            ]
          },
          {
            heading: 'Core abstractions',
            body: 'Chains, retrievers, memory, output parsers, and callbacks provide reusable building blocks for complex applications.',
            bullets: [
              'Chains compose multiple LLM calls and transformations into workflows',
              'Memory modules maintain conversation context across turns',
              'Output parsers enforce structured responses and handle parsing failures'
            ]
          },
          {
            heading: 'When to use vs build custom',
            body: 'Frameworks accelerate prototyping but may introduce overhead, abstraction leaks, or vendor lock-in for production systems.',
            bullets: [
              'Start with a framework for rapid prototyping and validation',
              'Consider custom implementations when you need full control over latency and cost',
              'Evaluate framework maturity, community support, and maintenance trajectory'
            ]
          }
        ],
        checklist: [
          'Can choose an appropriate framework for the project requirements.',
          'Understands framework abstractions well enough to debug and extend them.',
          'Knows when custom code is preferable to framework abstractions.'
        ],
        pitfalls: [
          'Over-engineering with frameworks when a simple API call would suffice.',
          'Coupling business logic tightly to a specific framework version.',
          'Not profiling framework overhead in latency-sensitive applications.'
        ],
        interviewPrompts: [
          'Compare LangChain and LlamaIndex for a document Q&A use case.',
          'When would you build a custom RAG pipeline instead of using a framework?',
          'How do you handle framework version upgrades in production applications?'
        ],
        exercises: [
          {
            id: 'prompt-chain-design',
            title: 'Build a multi-step prompt chain',
            difficulty: 'intermediate',
            type: 'coding',
            description: 'Implement a prompt chain that: 1) classifies intent, 2) extracts entities, 3) generates a structured response. Show how to handle errors between steps.',
            starterCode: `from typing import Dict, Any\n\n# Mock LLM function\ndef mock_llm(prompt: str) -> str:\n    if "classify" in prompt.lower():\n        return "intent: question, confidence: 0.9"\n    elif "extract" in prompt.lower():\n        return '{"entities": ["Python", "machine learning"], "topic": "programming"}'\n    else:\n        return "Based on your question about Python and machine learning..."\n\nclass PromptChain:\n    def __init__(self, llm_fn):\n        self.llm = llm_fn\n        self.steps = []\n\n    def add_step(self, name: str, prompt_template: str, parser=None):\n        """Add a step to the chain."""\n        # TODO\n        pass\n\n    def run(self, user_input: str) -> Dict[str, Any]:\n        """Execute chain, passing results between steps."""\n        # TODO: Run each step, feed output to next\n        # TODO: Handle parsing failures gracefully\n        pass\n\n# Build chain\nchain = PromptChain(mock_llm)\nchain.add_step("classify", "Classify the intent: {input}")\nchain.add_step("extract", "Extract entities from: {input}")\nchain.add_step("respond", "Generate response for {input} about {entities}")\nresult = chain.run("How do I learn Python for ML?")\nprint(result)`,
            solution: `from typing import Dict, Any, Callable, Optional\nimport json\n\ndef mock_llm(prompt: str) -> str:\n    if "classify" in prompt.lower():\n        return "intent: question, confidence: 0.9"\n    elif "extract" in prompt.lower():\n        return '{"entities": ["Python", "machine learning"], "topic": "programming"}'\n    else:\n        return "Based on your question about Python and machine learning..."\n\nclass PromptChain:\n    def __init__(self, llm_fn):\n        self.llm = llm_fn\n        self.steps = []\n\n    def add_step(self, name: str, prompt_template: str, parser: Optional[Callable] = None):\n        self.steps.append({"name": name, "template": prompt_template, "parser": parser})\n\n    def run(self, user_input: str) -> Dict[str, Any]:\n        context = {"input": user_input}\n        results = {}\n        for step in self.steps:\n            try:\n                prompt = step["template"].format(**context)\n                response = self.llm(prompt)\n                if step["parser"]:\n                    parsed = step["parser"](response)\n                else:\n                    parsed = response\n                results[step["name"]] = parsed\n                context[step["name"]] = parsed\n                context.update({"last_output": parsed})\n            except Exception as e:\n                results[step["name"]] = {"error": str(e)}\n        return results`,
            hints: [
              'Use string format to inject previous results into prompts',
              'Each step output becomes available as context for subsequent steps',
              'Wrap each step in try/except to handle LLM or parsing failures'
            ],
            expectedOutput: 'Dict with results from each chain step, showing data flowing between them'
          },
          {
            id: 'prompt-injection-defense',
            title: 'Design prompt injection defenses',
            difficulty: 'intermediate',
            type: 'design',
            description: 'Design a defense-in-depth strategy against prompt injection for a customer-facing chatbot that has access to a product database.',
            promptQuestions: [
              'What are the common prompt injection attack vectors (direct, indirect, jailbreaks)?',
              'How would you separate system instructions from user input at the prompt level?',
              'What output validation would you apply before returning responses?',
              'Design a layered defense: input sanitization, system prompt hardening, output filtering.'
            ]
          }
        ],
        diagram: null,
        related: ['rag-systems', 'ai-agents']
      }
    ]
  },
  {
    slug: 'ai-agents',
    title: 'AI agents and autonomous systems',
    summary: 'Design, build, and deploy AI agents that reason, plan, use tools, and accomplish multi-step tasks autonomously.',
    objectives: [
      'Understand agent architectures: ReAct, plan-and-execute, and multi-agent systems',
      'Implement tool use, memory, and planning capabilities in LLM-powered agents',
      'Evaluate agent reliability, safety, and cost in production deployments'
    ],
    lessons: [
      {
        slug: 'agent-fundamentals',
        title: 'Agent architectures and patterns',
        summary: 'ReAct, plan-and-execute, reflection, and multi-agent patterns for building autonomous AI systems.',
        duration: '30-40 min',
        whyItMatters: 'AI agents represent the next frontier of LLM applications, moving from single-turn generation to multi-step task completion.',
        sections: [
          {
            heading: 'What makes an agent',
            body: 'An AI agent combines an LLM with tools, memory, and a control loop that enables multi-step reasoning and action.',
            bullets: [
              'The agent loop: observe, reason, act, and evaluate results iteratively',
              'Tools extend LLM capabilities to interact with external systems and APIs',
              'Memory (short-term and long-term) maintains context across reasoning steps'
            ]
          },
          {
            heading: 'Architecture patterns',
            body: 'ReAct (reasoning + acting), plan-and-execute, reflexion, and hierarchical agents offer different tradeoffs.',
            bullets: [
              'ReAct interleaves reasoning traces with tool calls for transparent decision-making',
              'Plan-and-execute separates planning from execution for complex multi-step tasks',
              'Reflexion adds self-critique loops that improve performance over iterations'
            ]
          },
          {
            heading: 'Multi-agent systems',
            body: 'Multiple specialized agents collaborating through communication protocols can solve problems beyond single-agent capability.',
            bullets: [
              'Specialized agents handle subtasks (research, coding, review) with focused expertise',
              'Orchestration patterns: supervisor, debate, pipeline, and marketplace',
              'Communication protocols define how agents share context and coordinate'
            ]
          }
        ],
        checklist: [
          'Can explain the core agent loop and how it differs from single-turn LLM usage.',
          'Understands tradeoffs between ReAct and plan-and-execute patterns.',
          'Knows when multi-agent systems provide value over single-agent approaches.'
        ],
        pitfalls: [
          'Building agents for tasks that would be better served by deterministic code.',
          'Insufficient error handling causing agents to loop indefinitely.',
          'Not setting token and step budgets leading to runaway costs.'
        ],
        interviewPrompts: [
          'Design an agent that can research a topic, write a summary, and fact-check itself.',
          'How would you prevent an agent from taking harmful actions in a production environment?',
          'Compare ReAct and plan-and-execute for a complex data analysis task.'
        ],
        exercises: [
          {
            id: 'react-agent-implementation',
            title: 'Implement a ReAct agent from scratch',
            difficulty: 'advanced',
            type: 'coding',
            description: 'Build a ReAct (Reasoning + Acting) agent loop that can use tools (calculator, search mock) to answer questions. Implement the thought-action-observation cycle.',
            starterCode: `from typing import Dict, Callable\n\n# Available tools\ndef calculator(expression: str) -> str:\n    try:\n        return str(eval(expression))\n    except:\n        return "Error: invalid expression"\n\ndef search(query: str) -> str:\n    knowledge = {\n        "python release": "Python 3.12 was released in October 2023",\n        "earth population": "World population is approximately 8 billion",\n    }\n    for key, val in knowledge.items():\n        if key in query.lower():\n            return val\n    return "No results found"\n\ntools = {"calculator": calculator, "search": search}\n\nclass ReActAgent:\n    def __init__(self, tools: Dict[str, Callable], max_steps: int = 5):\n        self.tools = tools\n        self.max_steps = max_steps\n\n    def run(self, question: str) -> str:\n        """Execute the ReAct loop: Thought -> Action -> Observation -> ... -> Answer"""\n        # TODO: Implement the agent loop\n        # Each step: generate thought, decide action (tool + input), get observation\n        # Stop when you have enough info to answer or hit max_steps\n        pass\n\nagent = ReActAgent(tools)\nanswer = agent.run("What is 15% of the world population?")\nprint(answer)`,
            solution: `from typing import Dict, Callable\n\ndef calculator(expression: str) -> str:\n    try:\n        return str(eval(expression))\n    except:\n        return "Error: invalid expression"\n\ndef search(query: str) -> str:\n    knowledge = {\n        "python release": "Python 3.12 was released in October 2023",\n        "earth population": "World population is approximately 8 billion",\n    }\n    for key, val in knowledge.items():\n        if key in query.lower():\n            return val\n    return "No results found"\n\ntools = {"calculator": calculator, "search": search}\n\nclass ReActAgent:\n    def __init__(self, tools: Dict[str, Callable], max_steps: int = 5):\n        self.tools = tools\n        self.max_steps = max_steps\n\n    def think(self, question: str, history: list) -> tuple:\n        # Simplified: determine next action based on history\n        if not history:\n            return ("I need to find the world population first.", "search", "earth population")\n        elif len(history) == 1:\n            return ("Now I need to calculate 15% of 8 billion.", "calculator", "0.15 * 8000000000")\n        else:\n            return ("I have the answer.", "finish", "")\n\n    def run(self, question: str) -> str:\n        history = []\n        for step in range(self.max_steps):\n            thought, action, action_input = self.think(question, history)\n            print(f"Thought: {thought}")\n            if action == "finish":\n                obs = history[-1]["observation"] if history else ""\n                print(f"Answer: {obs}")\n                return obs\n            observation = self.tools[action](action_input)\n            print(f"Action: {action}({action_input})")\n            print(f"Observation: {observation}")\n            history.append({"thought": thought, "action": action, "input": action_input, "observation": observation})\n        return "Max steps reached"`,
            hints: [
              'The loop is: Thought (reasoning) -> Action (tool choice) -> Observation (tool result)',
              'Keep a history of all steps to inform the next thought',
              'Add a "finish" action type to exit the loop with an answer',
              'Implement max_steps to prevent infinite loops'
            ],
            expectedOutput: 'Agent searches for population, then calculates 15% of 8 billion = 1.2 billion'
          },
          {
            id: 'multi-agent-design',
            title: 'Design a multi-agent research system',
            difficulty: 'intermediate',
            type: 'design',
            description: 'Design a multi-agent system where a supervisor coordinates specialized agents (researcher, writer, fact-checker) to produce a verified article on a given topic.',
            promptQuestions: [
              'How does the supervisor decide which agent to call next?',
              'What is the communication format between agents (shared memory vs message passing)?',
              'How does the fact-checker verify claims made by the writer?',
              'What happens when agents disagree or produce conflicting information?'
            ]
          }
        ],
        diagram: null,
        related: ['building-with-frameworks', 'tool-use-and-function-calling']
      },
      {
        slug: 'tool-use-and-function-calling',
        title: 'Tool use and function calling',
        summary: 'Designing tool interfaces, function schemas, error handling, and safety guardrails for agents that interact with external systems.',
        duration: '25-35 min',
        whyItMatters: 'Tools transform LLMs from text generators into capable actors that can search, compute, access databases, and control external services.',
        sections: [
          {
            heading: 'Designing tool interfaces',
            body: 'Clear function schemas, comprehensive descriptions, and well-typed parameters help LLMs select and invoke tools correctly.',
            bullets: [
              'Function descriptions should explain when and why to use the tool',
              'Parameter schemas with types, constraints, and examples reduce invocation errors',
              'Return value formatting affects how the LLM integrates tool results into reasoning'
            ]
          },
          {
            heading: 'Error handling and recovery',
            body: 'Tools fail, return unexpected results, or timeout. Robust agents handle these gracefully and adapt their strategy.',
            bullets: [
              'Retry logic with exponential backoff handles transient failures',
              'Fallback tools provide alternative paths when primary tools fail',
              'The agent should explain failures to users rather than silently retrying forever'
            ]
          },
          {
            heading: 'Safety and permissions',
            body: 'Tool access control, confirmation flows, and sandboxing prevent agents from taking dangerous actions.',
            bullets: [
              'Principle of least privilege: agents should only access tools they need',
              'Human-in-the-loop confirmation for irreversible or high-stakes actions',
              'Sandboxing prevents code execution tools from accessing sensitive resources'
            ]
          }
        ],
        checklist: [
          'Can design tool schemas that minimize LLM invocation errors.',
          'Implements proper error handling and fallback strategies for tool failures.',
          'Applies safety guardrails appropriate to the risk level of each tool.'
        ],
        pitfalls: [
          'Vague tool descriptions that lead to incorrect tool selection.',
          'Missing error handling causing agents to crash on tool failures.',
          'Giving agents access to dangerous tools without confirmation gates.'
        ],
        interviewPrompts: [
          'Design a tool interface for an agent that manages cloud infrastructure.',
          'How would you implement permission levels for an agent with database access?',
          'What happens when a tool returns unexpected results? Design the recovery flow.'
        ],
        exercises: [
          {
            id: 'function-calling-schema',
            title: 'Design function calling schemas',
            difficulty: 'intermediate',
            type: 'coding',
            description: 'Design and implement OpenAI-compatible function calling schemas for a set of tools. Include proper descriptions, parameter types, and required fields.',
            starterCode: `import json\nfrom typing import Dict, Any\n\n# TODO: Define function schemas for these tools:\n# 1. get_weather(city: str, units: "celsius"|"fahrenheit") -> weather info\n# 2. send_email(to: str, subject: str, body: str, urgent: bool = False)\n# 3. search_database(query: str, table: str, limit: int = 10, filters: dict = {})\n\nfunction_schemas = [\n    # TODO: Define OpenAI-compatible function schema for each\n]\n\ndef validate_function_call(name: str, arguments: Dict[str, Any], schemas: list) -> bool:\n    """Validate that a function call matches its schema."""\n    # TODO: Check required params, types, enum values\n    pass\n\n# Test\ncall = {"name": "get_weather", "arguments": {"city": "NYC", "units": "celsius"}}\nprint(validate_function_call(call["name"], call["arguments"], function_schemas))`,
            solution: `import json\nfrom typing import Dict, Any\n\nfunction_schemas = [\n    {\n        "name": "get_weather",\n        "description": "Get current weather for a city. Use when user asks about weather conditions.",\n        "parameters": {\n            "type": "object",\n            "properties": {\n                "city": {"type": "string", "description": "City name"},\n                "units": {"type": "string", "enum": ["celsius", "fahrenheit"], "description": "Temperature unit"}\n            },\n            "required": ["city", "units"]\n        }\n    },\n    {\n        "name": "send_email",\n        "description": "Send an email to a recipient. Use for communication tasks.",\n        "parameters": {\n            "type": "object",\n            "properties": {\n                "to": {"type": "string", "description": "Recipient email"},\n                "subject": {"type": "string", "description": "Email subject"},\n                "body": {"type": "string", "description": "Email body"},\n                "urgent": {"type": "boolean", "description": "Mark as urgent", "default": False}\n            },\n            "required": ["to", "subject", "body"]\n        }\n    },\n    {\n        "name": "search_database",\n        "description": "Search records in a database table with optional filters.",\n        "parameters": {\n            "type": "object",\n            "properties": {\n                "query": {"type": "string", "description": "Search query"},\n                "table": {"type": "string", "description": "Table to search"},\n                "limit": {"type": "integer", "description": "Max results", "default": 10},\n                "filters": {"type": "object", "description": "Key-value filters"}\n            },\n            "required": ["query", "table"]\n        }\n    }\n]\n\ndef validate_function_call(name, arguments, schemas):\n    schema = next((s for s in schemas if s["name"] == name), None)\n    if not schema:\n        return False\n    required = schema["parameters"].get("required", [])\n    for param in required:\n        if param not in arguments:\n            return False\n    props = schema["parameters"]["properties"]\n    for key, value in arguments.items():\n        if key in props and "enum" in props[key]:\n            if value not in props[key]["enum"]:\n                return False\n    return True`,
            hints: [
              'OpenAI function schema uses JSON Schema format for parameters',
              'Good descriptions help the LLM decide WHEN to use each tool',
              'Required fields must be present; enum fields must match allowed values'
            ],
            expectedOutput: 'True for valid calls, False for missing required params or invalid enum values'
          }
        ],
        diagram: null,
        related: ['agent-fundamentals', 'agent-evaluation-and-safety']
      },
      {
        slug: 'agent-evaluation-and-safety',
        title: 'Agent evaluation and safety',
        summary: 'Benchmarking agent performance, measuring reliability, and implementing safety controls for production deployment.',
        duration: '25-35 min',
        whyItMatters: 'Agents operating autonomously can cause real harm if not properly evaluated and constrained. Safety is not optional for production systems.',
        sections: [
          {
            heading: 'Evaluation frameworks',
            body: 'Task completion rates, cost per task, latency budgets, and regression testing measure agent effectiveness.',
            bullets: [
              'End-to-end task success rate is the primary metric, not intermediate step quality',
              'Cost per task (tokens consumed, API calls, time) determines economic viability',
              'Regression test suites catch capability degradation across model or prompt updates'
            ]
          },
          {
            heading: 'Safety mechanisms',
            body: 'Output filtering, action constraints, rate limits, and human oversight prevent agents from causing harm.',
            bullets: [
              'Content filtering catches harmful or biased outputs before they reach users',
              'Action budgets limit the number of steps and cost an agent can incur per task',
              'Audit logging enables post-hoc review of all agent decisions and actions'
            ]
          },
          {
            heading: 'Production deployment',
            body: 'Gradual rollout, monitoring, fallback to human operators, and continuous evaluation maintain reliability.',
            bullets: [
              'Canary deployments test new agent versions on a subset of traffic first',
              'Anomaly detection flags unusual agent behavior for human review',
              'Graceful degradation to simpler systems when agent confidence is low'
            ]
          }
        ],
        checklist: [
          'Has an evaluation suite that measures task success, cost, and safety metrics.',
          'Implements budget limits, content filtering, and audit logging.',
          'Plans for graceful degradation when agent performance drops.'
        ],
        pitfalls: [
          'Deploying agents without comprehensive evaluation on edge cases.',
          'Relying solely on the LLM for safety without external guardrails.',
          'Not monitoring agent behavior continuously after deployment.'
        ],
        interviewPrompts: [
          'How would you evaluate an agent that manages customer refunds?',
          'Design a safety system for an agent with write access to production databases.',
          'What monitoring would you implement for an autonomous coding agent?'
        ],
        exercises: [
          {
            id: 'agent-evaluation-suite',
            title: 'Build an agent evaluation framework',
            difficulty: 'advanced',
            type: 'coding',
            description: 'Create a framework for evaluating agent task completion. Define test cases with expected outcomes, implement success metrics, and measure cost efficiency.',
            starterCode: `from typing import List, Dict, Any\nfrom dataclasses import dataclass\nimport time\n\n@dataclass\nclass AgentTestCase:\n    name: str\n    input_query: str\n    expected_actions: List[str]  # Expected tool calls\n    expected_output_contains: List[str]  # Key phrases in output\n    max_steps: int\n    max_tokens: int\n\n@dataclass\nclass AgentResult:\n    output: str\n    actions_taken: List[str]\n    steps: int\n    tokens_used: int\n    duration_ms: float\n\nclass AgentEvaluator:\n    def __init__(self):\n        self.results = []\n\n    def evaluate(self, test_case: AgentTestCase, result: AgentResult) -> Dict[str, Any]:\n        """Score an agent run against expected outcomes."""\n        # TODO: Compute task_success, action_accuracy, efficiency, budget_compliance\n        pass\n\n    def summary(self) -> Dict[str, float]:\n        """Aggregate metrics across all test cases."""\n        # TODO\n        pass\n\n# Test\nevaluator = AgentEvaluator()\ntest = AgentTestCase("weather_query", "What's the weather in NYC?",\n    ["get_weather"], ["temperature", "NYC"], max_steps=3, max_tokens=500)\nresult = AgentResult("The temperature in NYC is 72°F",\n    ["get_weather"], steps=2, tokens_used=350, duration_ms=1200)\nprint(evaluator.evaluate(test, result))`,
            solution: `from typing import List, Dict, Any\nfrom dataclasses import dataclass\n\n@dataclass\nclass AgentTestCase:\n    name: str\n    input_query: str\n    expected_actions: List[str]\n    expected_output_contains: List[str]\n    max_steps: int\n    max_tokens: int\n\n@dataclass\nclass AgentResult:\n    output: str\n    actions_taken: List[str]\n    steps: int\n    tokens_used: int\n    duration_ms: float\n\nclass AgentEvaluator:\n    def __init__(self):\n        self.results = []\n\n    def evaluate(self, test_case: AgentTestCase, result: AgentResult) -> Dict[str, Any]:\n        # Task success: output contains expected phrases\n        output_lower = result.output.lower()\n        phrases_found = sum(1 for p in test_case.expected_output_contains if p.lower() in output_lower)\n        task_success = phrases_found / len(test_case.expected_output_contains) if test_case.expected_output_contains else 1.0\n\n        # Action accuracy: did it use the right tools?\n        expected_set = set(test_case.expected_actions)\n        actual_set = set(result.actions_taken)\n        action_precision = len(expected_set & actual_set) / len(actual_set) if actual_set else 0\n        action_recall = len(expected_set & actual_set) / len(expected_set) if expected_set else 1.0\n\n        # Budget compliance\n        within_steps = result.steps <= test_case.max_steps\n        within_tokens = result.tokens_used <= test_case.max_tokens\n\n        score = {\n            "task_success": task_success,\n            "action_precision": action_precision,\n            "action_recall": action_recall,\n            "within_budget": within_steps and within_tokens,\n            "efficiency": 1.0 - (result.steps / test_case.max_steps)\n        }\n        self.results.append(score)\n        return score\n\n    def summary(self) -> Dict[str, float]:\n        if not self.results:\n            return {}\n        keys = self.results[0].keys()\n        return {k: sum(r[k] for r in self.results) / len(self.results) for k in keys if isinstance(self.results[0][k], (int, float))}`,
            hints: [
              'Task success = fraction of expected output phrases present',
              'Action accuracy checks both precision (no wrong tools) and recall (all needed tools used)',
              'Budget compliance is a hard pass/fail on steps and tokens'
            ],
            expectedOutput: 'Dict with task_success=1.0, action_recall=1.0, within_budget=True'
          }
        ],
        diagram: null,
        related: ['tool-use-and-function-calling', 'mlops-and-deployment']
      }
    ]
  },
  {
    slug: 'mlops-and-deployment',
    title: 'MLOps and production AI',
    summary: 'End-to-end ML lifecycle management: experiment tracking, model serving, monitoring, CI/CD for ML, and infrastructure at scale.',
    objectives: [
      'Design ML pipelines from training through deployment and monitoring',
      'Implement model serving with appropriate latency, cost, and reliability tradeoffs',
      'Build monitoring systems that detect model drift and performance degradation'
    ],
    lessons: [
      {
        slug: 'ml-pipeline-design',
        title: 'ML pipeline design',
        summary: 'Data pipelines, feature stores, training infrastructure, and experiment tracking for reproducible ML development.',
        duration: '30-40 min',
        whyItMatters: 'Production ML requires reproducible pipelines. Ad-hoc notebooks do not scale to teams or production reliability requirements.',
        sections: [
          {
            heading: 'Data pipelines',
            body: 'ETL, data validation, feature computation, and versioning ensure models train on clean, reproducible datasets.',
            bullets: [
              'Data validation (Great Expectations, TFX) catches data quality issues before training',
              'Feature stores (Feast, Tecton) enable feature reuse and consistency between training and serving',
              'Data versioning (DVC, LakeFS) enables reproducibility and rollback'
            ]
          },
          {
            heading: 'Training infrastructure',
            body: 'Distributed training, GPU management, hyperparameter optimization, and experiment tracking at scale.',
            bullets: [
              'Experiment tracking (MLflow, W&B) records parameters, metrics, and artifacts',
              'Distributed training (DeepSpeed, FSDP) enables training models that exceed single-GPU memory',
              'Hyperparameter optimization (Optuna, Ray Tune) automates search over configuration space'
            ]
          },
          {
            heading: 'Pipeline orchestration',
            body: 'Airflow, Kubeflow Pipelines, and Prefect coordinate multi-stage ML workflows with dependency management.',
            bullets: [
              'DAG-based orchestration handles complex dependencies between pipeline stages',
              'Retry logic and checkpointing prevent full restarts on transient failures',
              'Scheduling and triggers enable automated retraining on data freshness signals'
            ]
          }
        ],
        checklist: [
          'Can design a reproducible training pipeline with proper versioning.',
          'Understands feature store benefits for training-serving consistency.',
          'Knows how to orchestrate multi-stage ML workflows.'
        ],
        pitfalls: [
          'Running production training from Jupyter notebooks without version control.',
          'Not versioning data alongside code and model artifacts.',
          'Building monolithic pipelines that are hard to debug and iterate on.'
        ],
        interviewPrompts: [
          'Design an ML pipeline for a recommendation system that retrains daily.',
          'How would you ensure training-serving skew does not degrade model quality?',
          'Compare Kubeflow Pipelines and Airflow for ML orchestration. When would you choose each?'
        ],
        exercises: [
          {
            id: 'ml-pipeline-dag',
            title: 'Design an ML training pipeline DAG',
            difficulty: 'intermediate',
            type: 'design',
            description: 'Design a complete ML pipeline for a recommendation system that retrains daily. Define stages, dependencies, data validation checks, and rollback procedures.',
            promptQuestions: [
              'What are the stages: data extraction, validation, feature engineering, training, evaluation, deployment?',
              'What data validation checks would you add between extraction and training?',
              'How do you handle training failure: retry, alert, or fall back to previous model?',
              'What triggers retraining: schedule, data drift, or performance degradation?'
            ]
          },
          {
            id: 'feature-store-implementation',
            title: 'Implement a minimal feature store',
            difficulty: 'advanced',
            type: 'coding',
            description: 'Build a simplified feature store that serves features consistently for both training (batch) and serving (online) with point-in-time correctness.',
            starterCode: `from typing import Dict, List, Any\nfrom datetime import datetime\nimport json\n\nclass FeatureStore:\n    def __init__(self):\n        self.features: Dict[str, List[Dict]] = {}  # entity_id -> [{timestamp, features}]\n\n    def ingest(self, entity_id: str, features: Dict[str, Any], timestamp: datetime):\n        """Store a feature vector with timestamp."""\n        # TODO\n        pass\n\n    def get_online(self, entity_id: str) -> Dict[str, Any]:\n        """Get latest features for real-time serving."""\n        # TODO\n        pass\n\n    def get_historical(self, entity_id: str, as_of: datetime) -> Dict[str, Any]:\n        """Get features as they were at a point in time (for training)."""\n        # TODO: Return most recent features BEFORE as_of timestamp\n        pass\n\n# Test\nfs = FeatureStore()\nfs.ingest("user_123", {"avg_order": 45.0, "total_orders": 10}, datetime(2024, 1, 1))\nfs.ingest("user_123", {"avg_order": 52.0, "total_orders": 15}, datetime(2024, 6, 1))\nprint("Online:", fs.get_online("user_123"))\nprint("Historical (March):", fs.get_historical("user_123", datetime(2024, 3, 1)))`,
            solution: `from typing import Dict, List, Any\nfrom datetime import datetime\n\nclass FeatureStore:\n    def __init__(self):\n        self.features = {}\n\n    def ingest(self, entity_id: str, features: Dict[str, Any], timestamp: datetime):\n        if entity_id not in self.features:\n            self.features[entity_id] = []\n        self.features[entity_id].append({"timestamp": timestamp, "features": features})\n        self.features[entity_id].sort(key=lambda x: x["timestamp"])\n\n    def get_online(self, entity_id: str) -> Dict[str, Any]:\n        if entity_id not in self.features or not self.features[entity_id]:\n            return {}\n        return self.features[entity_id][-1]["features"]\n\n    def get_historical(self, entity_id: str, as_of: datetime) -> Dict[str, Any]:\n        if entity_id not in self.features:\n            return {}\n        valid = [f for f in self.features[entity_id] if f["timestamp"] <= as_of]\n        return valid[-1]["features"] if valid else {}`,
            hints: [
              'Online serving always returns the latest feature values',
              'Historical queries must respect point-in-time: only return features that existed BEFORE the query timestamp',
              'This prevents data leakage in training'
            ],
            expectedOutput: 'Online returns latest (52.0, 15); Historical March returns Jan values (45.0, 10)'
          }
        ],
        diagram: null,
        related: ['model-serving', 'monitoring-and-observability']
      },
      {
        slug: 'model-serving',
        title: 'Model serving and inference',
        summary: 'Serving infrastructure, optimization techniques, scaling strategies, and cost management for production model inference.',
        duration: '30-40 min',
        whyItMatters: 'Serving is where ML models create business value. Latency, throughput, cost, and reliability directly impact user experience and unit economics.',
        sections: [
          {
            heading: 'Serving architectures',
            body: 'Real-time APIs, batch inference, streaming predictions, and edge deployment each serve different latency and throughput requirements.',
            bullets: [
              'REST/gRPC APIs serve real-time predictions with low-latency requirements',
              'Batch inference processes large datasets efficiently when latency is not critical',
              'Edge deployment (ONNX Runtime, TFLite) brings predictions to devices and reduces cloud costs'
            ]
          },
          {
            heading: 'Optimization techniques',
            body: 'Quantization, pruning, distillation, caching, and batching reduce inference cost and latency.',
            bullets: [
              'Quantization (INT8, FP16) reduces model size and speeds inference with minimal quality loss',
              'Knowledge distillation trains smaller models to mimic larger ones',
              'Dynamic batching groups concurrent requests to maximize GPU utilization'
            ]
          },
          {
            heading: 'Scaling and reliability',
            body: 'Auto-scaling, load balancing, A/B testing, and canary deployments maintain service quality under variable load.',
            bullets: [
              'Horizontal scaling with request routing handles traffic spikes',
              'Model versioning enables rollback when new models underperform',
              'Shadow deployment compares new model performance before switching traffic'
            ]
          }
        ],
        checklist: [
          'Can choose the right serving architecture for latency and throughput requirements.',
          'Applies optimization techniques to meet cost and latency budgets.',
          'Designs for reliability with proper scaling and rollback capabilities.'
        ],
        pitfalls: [
          'Serving unoptimized models that exceed latency or cost budgets.',
          'Not implementing model rollback causing stuck bad deployments.',
          'Ignoring cold start latency in auto-scaled serverless deployments.'
        ],
        interviewPrompts: [
          'Design a serving system for an LLM that handles 1000 concurrent users.',
          'How would you reduce inference cost by 50% without significant quality degradation?',
          'Compare real-time and batch serving for a content moderation system.'
        ],
        exercises: [
          {
            id: 'model-serving-optimization',
            title: 'Optimize model serving latency',
            difficulty: 'intermediate',
            type: 'coding',
            description: 'Implement dynamic batching for model inference that groups concurrent requests to maximize GPU utilization while respecting latency SLOs.',
            starterCode: `import time\nimport threading\nfrom typing import List, Any\nfrom queue import Queue\n\nclass DynamicBatcher:\n    """Batches incoming inference requests for efficient GPU utilization."""\n    def __init__(self, max_batch_size: int = 8, max_wait_ms: float = 50):\n        self.max_batch_size = max_batch_size\n        self.max_wait_ms = max_wait_ms\n        self.queue = Queue()\n        # TODO: Implement batching logic\n\n    def predict(self, input_data: Any) -> Any:\n        """Submit a single prediction request. Blocks until result is ready."""\n        # TODO: Add to batch queue, wait for result\n        pass\n\n    def _process_batch(self, batch: List) -> List:\n        """Simulate batch GPU inference."""\n        # Simulates batch processing (faster per-item than individual)\n        time.sleep(0.01)  # 10ms for any batch size\n        return [f"result_for_{item}" for item in batch]\n\n# Test: simulate concurrent requests\nbatcher = DynamicBatcher(max_batch_size=4, max_wait_ms=20)`,
            solution: `import time\nimport threading\nfrom typing import List, Any\nfrom queue import Queue\n\nclass DynamicBatcher:\n    def __init__(self, max_batch_size: int = 8, max_wait_ms: float = 50):\n        self.max_batch_size = max_batch_size\n        self.max_wait_ms = max_wait_ms\n        self.queue = Queue()\n        self.worker = threading.Thread(target=self._batch_loop, daemon=True)\n        self.worker.start()\n\n    def predict(self, input_data: Any) -> Any:\n        result_event = threading.Event()\n        result_holder = {}\n        self.queue.put((input_data, result_event, result_holder))\n        result_event.wait()\n        return result_holder["result"]\n\n    def _batch_loop(self):\n        while True:\n            batch = []\n            first = self.queue.get()\n            batch.append(first)\n            deadline = time.time() + self.max_wait_ms / 1000\n            while len(batch) < self.max_batch_size and time.time() < deadline:\n                try:\n                    item = self.queue.get(timeout=max(0, deadline - time.time()))\n                    batch.append(item)\n                except:\n                    break\n            inputs = [item[0] for item in batch]\n            results = self._process_batch(inputs)\n            for (_, event, holder), result in zip(batch, results):\n                holder["result"] = result\n                event.set()\n\n    def _process_batch(self, batch: List) -> List:\n        time.sleep(0.01)\n        return [f"result_for_{item}" for item in batch]`,
            hints: [
              'Use a background thread that collects requests until batch is full OR timeout expires',
              'Each caller blocks on an Event until their result is ready',
              'Balance max_batch_size (throughput) with max_wait_ms (latency)'
            ],
            expectedOutput: 'Concurrent requests are batched together, each getting their individual result back'
          },
          {
            id: 'quantization-tradeoff',
            title: 'Analyze quantization trade-offs',
            difficulty: 'beginner',
            type: 'design',
            description: 'Design an experiment to measure the quality-speed tradeoff of INT8 vs FP16 vs FP32 quantization for a production model serving at 1000 RPS.',
            promptQuestions: [
              'What metrics would you measure: accuracy, latency p50/p99, throughput, memory usage?',
              'How would you set an acceptable quality degradation threshold?',
              'What test set would you use to ensure quantization does not disproportionately affect edge cases?',
              'At what serving load does quantization become critical for cost/latency targets?'
            ]
          }
        ],
        diagram: null,
        related: ['ml-pipeline-design', 'monitoring-and-observability']
      },
      {
        slug: 'monitoring-and-observability',
        title: 'ML monitoring and observability',
        summary: 'Model drift detection, performance monitoring, alerting, and feedback loops for maintaining model quality in production.',
        duration: '25-35 min',
        whyItMatters: 'Models degrade silently in production as data distributions shift. Without monitoring you discover failures from user complaints, not metrics.',
        sections: [
          {
            heading: 'What to monitor',
            body: 'Input distributions, prediction distributions, latency, error rates, and business metrics collectively signal model health.',
            bullets: [
              'Data drift: statistical divergence between training and serving distributions',
              'Concept drift: the relationship between inputs and correct outputs changes over time',
              'Business metrics: revenue, conversion, satisfaction measure real-world impact'
            ]
          },
          {
            heading: 'Drift detection methods',
            body: 'Statistical tests (KS test, PSI), embedding drift, and performance-based triggers identify when models need retraining.',
            bullets: [
              'Population Stability Index (PSI) measures feature distribution shift',
              'Embedding drift detects semantic changes in unstructured input data',
              'Performance monitoring requires labeled ground truth, often with delay'
            ]
          },
          {
            heading: 'Feedback loops and retraining',
            body: 'Automated retraining triggers, human feedback collection, and A/B testing close the loop between monitoring and improvement.',
            bullets: [
              'Automated retraining pipelines trigger on drift detection or schedule',
              'Human feedback (thumbs up/down, corrections) provides ground truth labels',
              'Champion-challenger testing validates new models before full deployment'
            ]
          }
        ],
        checklist: [
          'Monitors both technical metrics (latency, errors) and ML-specific metrics (drift, accuracy).',
          'Has automated alerting for significant distribution shifts.',
          'Maintains feedback loops that connect monitoring to retraining decisions.'
        ],
        pitfalls: [
          'Only monitoring infrastructure health without tracking model prediction quality.',
          'Setting drift thresholds too sensitively causing alert fatigue.',
          'Retraining automatically without validating that new models improve performance.'
        ],
        interviewPrompts: [
          'How would you detect that a fraud model has degraded due to new attack patterns?',
          'Design a monitoring system for a recommendation engine serving millions of users.',
          'What is the difference between data drift and concept drift? Give examples of each.'
        ],
        exercises: [
          {
            id: 'drift-detection-system',
            title: 'Implement drift detection',
            difficulty: 'intermediate',
            type: 'coding',
            description: 'Build a drift detector that monitors feature distributions and alerts when training and serving distributions diverge significantly.',
            starterCode: `import numpy as np\nfrom typing import Dict, Tuple\n\nclass DriftDetector:\n    def __init__(self, threshold: float = 0.1):\n        self.threshold = threshold\n        self.reference_stats: Dict[str, Dict] = {}\n\n    def set_reference(self, feature_name: str, values: np.ndarray):\n        """Store reference distribution statistics from training data."""\n        # TODO: Store mean, std, and histogram for comparison\n        pass\n\n    def check_drift(self, feature_name: str, values: np.ndarray) -> Tuple[bool, float]:\n        """Check if current distribution has drifted from reference.\n        Returns (is_drifted, drift_score)."""\n        # TODO: Compute PSI (Population Stability Index)\n        # PSI = sum((actual% - expected%) * ln(actual% / expected%))\n        pass\n\n    def psi(self, expected: np.ndarray, actual: np.ndarray) -> float:\n        """Compute Population Stability Index."""\n        # TODO\n        pass\n\n# Test\ndetector = DriftDetector(threshold=0.2)\ntrain_data = np.random.normal(50, 10, 1000)\ndetector.set_reference("age", train_data)\n\n# No drift\nserving_normal = np.random.normal(50, 10, 200)\nprint("Normal:", detector.check_drift("age", serving_normal))\n\n# Significant drift\nserving_drifted = np.random.normal(65, 15, 200)\nprint("Drifted:", detector.check_drift("age", serving_drifted))`,
            solution: `import numpy as np\nfrom typing import Dict, Tuple\n\nclass DriftDetector:\n    def __init__(self, threshold: float = 0.2):\n        self.threshold = threshold\n        self.reference_stats = {}\n\n    def set_reference(self, feature_name: str, values: np.ndarray):\n        hist, bin_edges = np.histogram(values, bins=10)\n        self.reference_stats[feature_name] = {\n            "hist": hist / hist.sum(),\n            "bin_edges": bin_edges,\n            "mean": values.mean(),\n            "std": values.std()\n        }\n\n    def check_drift(self, feature_name: str, values: np.ndarray) -> Tuple[bool, float]:\n        ref = self.reference_stats[feature_name]\n        hist, _ = np.histogram(values, bins=ref["bin_edges"])\n        actual_pct = hist / hist.sum()\n        score = self.psi(ref["hist"], actual_pct)\n        return (score > self.threshold, score)\n\n    def psi(self, expected: np.ndarray, actual: np.ndarray) -> float:\n        expected = np.clip(expected, 0.001, None)\n        actual = np.clip(actual, 0.001, None)\n        return float(np.sum((actual - expected) * np.log(actual / expected)))`,
            hints: [
              'PSI < 0.1: no drift, 0.1-0.2: moderate, >0.2: significant drift',
              'Use np.histogram with the SAME bin edges for both distributions',
              'Clip values to avoid log(0) in PSI calculation'
            ],
            expectedOutput: 'Normal data: (False, low PSI); Drifted data: (True, high PSI > 0.2)'
          },
          {
            id: 'monitoring-dashboard-design',
            title: 'Design an ML monitoring dashboard',
            difficulty: 'beginner',
            type: 'design',
            description: 'Design the key metrics and alerts for a production ML monitoring dashboard. Specify what to track, alert thresholds, and escalation procedures.',
            promptQuestions: [
              'What are the three tiers of metrics: infrastructure, model performance, business impact?',
              'How do you set alert thresholds that minimize both false positives and missed issues?',
              'What is the expected delay between drift occurring and it being detected?',
              'How do you distinguish between data issues, model degradation, and concept drift?'
            ]
          }
        ],
        diagram: null,
        related: ['model-serving', 'ml-pipeline-design']
      }
    ]
  },
  {
    slug: 'ai-safety-and-ethics',
    title: 'AI safety, ethics, and responsible AI',
    summary: 'Bias detection, fairness metrics, explainability, regulatory compliance, and building trustworthy AI systems.',
    objectives: [
      'Identify and mitigate bias in training data and model outputs',
      'Implement explainability and interpretability for stakeholder trust',
      'Navigate AI regulations (EU AI Act, GDPR) and organizational governance'
    ],
    lessons: [
      {
        slug: 'bias-and-fairness',
        title: 'Bias detection and fairness',
        summary: 'Sources of bias, fairness metrics, debiasing techniques, and testing practices for building equitable AI systems.',
        duration: '25-35 min',
        whyItMatters: 'Biased models cause real harm to people. AI engineers must proactively identify and mitigate bias throughout the development lifecycle.',
        sections: [
          {
            heading: 'Sources of bias',
            body: 'Training data, labeling processes, feature selection, and evaluation metrics can all introduce or amplify societal biases.',
            bullets: [
              'Historical bias in training data reflects past discrimination',
              'Representation bias occurs when certain groups are under-represented in data',
              'Measurement bias arises when proxy features correlate with protected attributes'
            ]
          },
          {
            heading: 'Fairness metrics',
            body: 'Demographic parity, equalized odds, and calibration measure different aspects of fairness that are often mathematically incompatible.',
            bullets: [
              'No single fairness metric satisfies all ethical frameworks simultaneously',
              'Choosing metrics requires understanding the specific harm you want to prevent',
              'Disaggregated evaluation across subgroups reveals disparate performance'
            ]
          },
          {
            heading: 'Mitigation strategies',
            body: 'Pre-processing (data rebalancing), in-processing (constrained training), and post-processing (threshold adjustment) approaches.',
            bullets: [
              'Data augmentation and resampling address representation imbalances',
              'Adversarial debiasing removes sensitive information from learned representations',
              'Post-hoc calibration adjusts decision thresholds per subgroup'
            ]
          }
        ],
        checklist: [
          'Evaluates models with disaggregated metrics across relevant subgroups.',
          'Can explain the tradeoffs between different fairness definitions.',
          'Implements at least one debiasing technique appropriate to the application.'
        ],
        pitfalls: [
          'Assuming a model is fair because overall accuracy is high.',
          'Applying fairness constraints without understanding which harm they address.',
          'Treating fairness as a one-time check rather than ongoing monitoring.'
        ],
        interviewPrompts: [
          'A hiring model shows different acceptance rates across demographics. How would you investigate and address this?',
          'Explain why demographic parity and equalized odds cannot both be satisfied simultaneously.',
          'Design a testing framework for detecting bias in an LLM-powered customer service system.'
        ],
        exercises: [
          {
            id: 'bias-audit-implementation',
            title: 'Implement a bias audit for a classifier',
            difficulty: 'intermediate',
            type: 'coding',
            description: 'Build a bias auditing tool that measures disparate impact, equalized odds, and demographic parity across protected groups for a binary classifier.',
            starterCode: `import numpy as np\nfrom typing import Dict\n\ndef demographic_parity(y_pred: np.ndarray, groups: np.ndarray) -> Dict[str, float]:\n    """Measure positive prediction rate per group.\n    Demographic parity: all groups should have similar positive rates."""\n    # TODO\n    pass\n\ndef equalized_odds(y_true: np.ndarray, y_pred: np.ndarray, groups: np.ndarray) -> Dict[str, Dict[str, float]]:\n    """Measure TPR and FPR per group.\n    Equalized odds: TPR and FPR should be similar across groups."""\n    # TODO\n    pass\n\ndef disparate_impact_ratio(y_pred: np.ndarray, groups: np.ndarray, privileged: str) -> float:\n    """Ratio of positive rate for unprivileged to privileged group.\n    Should be >= 0.8 (80% rule)."""\n    # TODO\n    pass\n\n# Test with synthetic predictions\nnp.random.seed(42)\ny_true = np.array([1,1,0,0,1,1,0,0,1,1])\ny_pred = np.array([1,1,0,0,1,0,0,1,1,0])  # Some errors\ngroups = np.array(['A','A','A','A','A','B','B','B','B','B'])\n\nprint("Demographic parity:", demographic_parity(y_pred, groups))\nprint("Equalized odds:", equalized_odds(y_true, y_pred, groups))\nprint("Disparate impact:", disparate_impact_ratio(y_pred, groups, 'A'))`,
            solution: `import numpy as np\nfrom typing import Dict\n\ndef demographic_parity(y_pred: np.ndarray, groups: np.ndarray) -> Dict[str, float]:\n    result = {}\n    for group in np.unique(groups):\n        mask = groups == group\n        result[group] = y_pred[mask].mean()\n    return result\n\ndef equalized_odds(y_true: np.ndarray, y_pred: np.ndarray, groups: np.ndarray) -> Dict[str, Dict[str, float]]:\n    result = {}\n    for group in np.unique(groups):\n        mask = groups == group\n        positives = y_true[mask] == 1\n        negatives = y_true[mask] == 0\n        tpr = y_pred[mask][positives].mean() if positives.any() else 0\n        fpr = y_pred[mask][negatives].mean() if negatives.any() else 0\n        result[group] = {"TPR": float(tpr), "FPR": float(fpr)}\n    return result\n\ndef disparate_impact_ratio(y_pred: np.ndarray, groups: np.ndarray, privileged: str) -> float:\n    rates = demographic_parity(y_pred, groups)\n    unprivileged = [g for g in rates if g != privileged]\n    if not unprivileged:\n        return 1.0\n    return min(rates[g] for g in unprivileged) / rates[privileged]`,
            hints: [
              'Demographic parity: positive_rate = mean(y_pred) per group',
              'TPR = positive predictions among actual positives per group',
              'Disparate impact ratio < 0.8 indicates potential discrimination'
            ],
            expectedOutput: 'Group-level metrics showing any disparities in prediction rates'
          }
        ],
        diagram: null,
        related: ['explainability', 'ai-governance']
      },
      {
        slug: 'explainability',
        title: 'Explainability and interpretability',
        summary: 'SHAP, LIME, attention visualization, and model-agnostic explanation methods for building trust and debugging models.',
        duration: '25-35 min',
        whyItMatters: 'Stakeholders, regulators, and users need to understand why a model made a decision. Explainability enables trust, debugging, and compliance.',
        sections: [
          {
            heading: 'Explanation methods',
            body: 'SHAP values, LIME, integrated gradients, and attention visualization provide different perspectives on model decisions.',
            bullets: [
              'SHAP provides theoretically grounded feature importance with consistency guarantees',
              'LIME generates local explanations by approximating the model with interpretable surrogates',
              'Attention weights provide some insight but are not always faithful explanations'
            ]
          },
          {
            heading: 'Designing for interpretability',
            body: 'Choosing inherently interpretable models, constraining architectures, and building explanation interfaces for different audiences.',
            bullets: [
              'Linear models and decision trees are inherently interpretable for simple problems',
              'Concept bottleneck models force intermediate representations to be human-understandable',
              'Different audiences (engineers, executives, end users) need different explanation formats'
            ]
          },
          {
            heading: 'Limitations and risks',
            body: 'Explanations can be misleading, unfaithful to the model, or provide false confidence in flawed systems.',
            bullets: [
              'Post-hoc explanations may not reflect the actual decision process',
              'Users may over-trust systems that provide plausible but incorrect explanations',
              'Explanation methods have their own failure modes and assumptions'
            ]
          }
        ],
        checklist: [
          'Can select an appropriate explanation method for the model type and audience.',
          'Understands the limitations and potential faithfulness issues of each method.',
          'Designs explanation interfaces appropriate for the stakeholder audience.'
        ],
        pitfalls: [
          'Treating attention weights as definitive explanations of model behavior.',
          'Providing explanations without validating their faithfulness to the model.',
          'Using complex explanation methods when a simpler model would be more appropriate.'
        ],
        interviewPrompts: [
          'Compare SHAP and LIME. When would you use each?',
          'A loan application was denied by your model. Design an explanation for the applicant.',
          'How would you verify that an explanation method is faithful to the model behavior?'
        ],
        exercises: [
          {
            id: 'shap-values-manual',
            title: 'Compute SHAP-like feature attributions',
            difficulty: 'intermediate',
            type: 'coding',
            description: 'Implement a simplified permutation-based feature importance method that shows which features most influenced a specific prediction.',
            starterCode: `import numpy as np\nfrom sklearn.ensemble import RandomForestClassifier\nfrom sklearn.datasets import make_classification\n\ndef permutation_importance(model, X, y, n_repeats=10):\n    """Measure feature importance by permuting each feature and measuring accuracy drop."""\n    # TODO: For each feature, shuffle it and measure performance decrease\n    pass\n\ndef local_explanation(model, instance, X_background, n_samples=100):\n    """Explain a single prediction by measuring each feature's contribution."""\n    # TODO: For each feature, replace with random background values\n    # Measure how prediction changes\n    pass\n\n# Setup\nX, y = make_classification(n_samples=200, n_features=5, n_informative=3, random_state=42)\nmodel = RandomForestClassifier(random_state=42).fit(X, y)\n\n# Global importance\nprint("Feature importances:", permutation_importance(model, X, y))\n\n# Local explanation for first instance\nprint("Local explanation:", local_explanation(model, X[0], X))`,
            solution: `import numpy as np\nfrom sklearn.ensemble import RandomForestClassifier\nfrom sklearn.datasets import make_classification\n\ndef permutation_importance(model, X, y, n_repeats=10):\n    base_score = model.score(X, y)\n    importances = []\n    for col in range(X.shape[1]):\n        scores = []\n        for _ in range(n_repeats):\n            X_perm = X.copy()\n            X_perm[:, col] = np.random.permutation(X_perm[:, col])\n            scores.append(model.score(X_perm, y))\n        importances.append(base_score - np.mean(scores))\n    return np.array(importances)\n\ndef local_explanation(model, instance, X_background, n_samples=100):\n    base_pred = model.predict_proba(instance.reshape(1, -1))[0, 1]\n    contributions = []\n    for col in range(len(instance)):\n        preds = []\n        for _ in range(n_samples):\n            modified = instance.copy()\n            bg_idx = np.random.randint(len(X_background))\n            modified[col] = X_background[bg_idx, col]\n            preds.append(model.predict_proba(modified.reshape(1, -1))[0, 1])\n        contributions.append(base_pred - np.mean(preds))\n    return np.array(contributions)\n\nX, y = make_classification(n_samples=200, n_features=5, n_informative=3, random_state=42)\nmodel = RandomForestClassifier(random_state=42).fit(X, y)\nprint("Feature importances:", permutation_importance(model, X, y))\nprint("Local explanation:", local_explanation(model, X[0], X))`,
            hints: [
              'Permutation importance: shuffle one feature, measure accuracy drop',
              'Local explanation: replace one feature with background values, measure prediction change',
              'Higher importance = bigger prediction change when feature is removed'
            ],
            expectedOutput: 'Informative features (0-2) should have highest importance scores'
          }
        ],
        diagram: null,
        related: ['bias-and-fairness', 'ai-governance']
      },
      {
        slug: 'ai-governance',
        title: 'AI governance and regulation',
        summary: 'EU AI Act, GDPR implications, model documentation, risk assessment, and organizational AI governance frameworks.',
        duration: '25-35 min',
        whyItMatters: 'AI regulation is rapidly evolving. Engineers must understand compliance requirements to avoid legal liability and build systems that meet regulatory standards.',
        sections: [
          {
            heading: 'Regulatory landscape',
            body: 'The EU AI Act, GDPR right to explanation, US executive orders, and sector-specific regulations create compliance requirements for AI systems.',
            bullets: [
              'EU AI Act categorizes systems by risk level with corresponding requirements',
              'High-risk AI systems require conformity assessments and documentation',
              'GDPR Article 22 grants rights around automated decision-making'
            ]
          },
          {
            heading: 'Documentation and auditing',
            body: 'Model cards, data sheets, impact assessments, and audit trails provide the documentation required for compliance and accountability.',
            bullets: [
              'Model cards document intended use, limitations, and evaluation results',
              'Datasheets describe dataset composition, collection process, and known biases',
              'Impact assessments evaluate risks to fundamental rights before deployment'
            ]
          },
          {
            heading: 'Organizational governance',
            body: 'AI ethics boards, review processes, incident response, and responsible disclosure frameworks operationalize AI safety at scale.',
            bullets: [
              'Cross-functional review boards bring diverse perspectives to deployment decisions',
              'Staged deployment with escalation paths controls risk during rollout',
              'Incident response plans define how to handle AI system failures and harms'
            ]
          }
        ],
        checklist: [
          'Understands the risk classification system in the EU AI Act.',
          'Can produce model documentation meeting regulatory requirements.',
          'Knows how to conduct an AI impact assessment for a new system.'
        ],
        pitfalls: [
          'Treating AI governance as purely a legal concern without engineering involvement.',
          'Producing documentation as a box-ticking exercise without meaningful content.',
          'Ignoring international regulatory differences when deploying globally.'
        ],
        interviewPrompts: [
          'How would you classify a resume screening system under the EU AI Act?',
          'Design a model card for an LLM-powered medical triage assistant.',
          'What technical measures would you implement to comply with GDPR Article 22?'
        ],
        exercises: [
          {
            id: 'model-card-creation',
            title: 'Write a model card',
            difficulty: 'beginner',
            type: 'design',
            description: 'Create a complete model card for a loan approval ML model following the Model Cards framework. Cover intended use, limitations, ethical considerations, and performance across demographic groups.',
            promptQuestions: [
              'What information should the model card include about training data and methodology?',
              'How do you document performance across different demographic groups?',
              'What limitations and failure modes should be explicitly stated?',
              'How do you specify intended vs out-of-scope use cases?',
              'What governance processes should be documented for model updates?'
            ]
          },
          {
            id: 'ai-risk-assessment',
            title: 'Conduct an AI risk assessment',
            difficulty: 'intermediate',
            type: 'design',
            description: 'Perform a structured risk assessment for deploying an AI-powered medical triage system. Identify risks, likelihood, impact, and mitigation strategies.',
            promptQuestions: [
              'What are the highest-severity failure modes (false negatives for critical conditions)?',
              'How do you assess risk for different patient demographics?',
              'What regulatory frameworks apply (FDA, EU AI Act, HIPAA)?',
              'Design mitigation for each high-risk scenario (human oversight, confidence thresholds, escalation paths)',
              'How do you ensure ongoing compliance as the model and regulations evolve?'
            ]
          }
        ],
        diagram: null,
        related: ['bias-and-fairness', 'explainability']
      }
    ]
  },
  {
    slug: 'data-engineering-for-ml',
    title: 'Data engineering for AI',
    summary: 'Building robust data pipelines, managing training datasets at scale, and ensuring data quality for production ML systems.',
    objectives: [
      'Design data pipelines that handle ingestion, transformation, and validation at scale',
      'Manage training datasets with proper versioning, lineage, and quality controls',
      'Build feature stores that maintain consistency between training and serving'
    ],
    lessons: [
      {
        slug: 'data-pipelines-at-scale',
        title: 'Data pipelines at scale',
        summary: 'Batch and stream processing, ETL design patterns, and data quality validation for ML training data.',
        duration: '30-40 min',
        whyItMatters: 'Models are only as good as their training data. Robust data pipelines are the foundation of reliable AI systems.',
        sections: [
          {
            heading: 'Pipeline architecture patterns',
            body: 'Batch ETL, streaming ingestion, lambda and kappa architectures, and event-driven pipelines serve different freshness requirements.',
            bullets: [
              'Batch processing (Spark, Dask) handles large-scale historical data efficiently',
              'Stream processing (Kafka, Flink) enables real-time feature computation',
              'Lambda architecture combines batch and streaming for both freshness and completeness'
            ]
          },
          {
            heading: 'Data quality and validation',
            body: 'Schema validation, statistical checks, and anomaly detection prevent garbage-in-garbage-out training failures.',
            bullets: [
              'Schema enforcement catches structural data issues at ingestion time',
              'Statistical profiling detects distribution shifts, null spikes, and anomalies',
              'Data contracts between producers and consumers prevent silent breaking changes'
            ]
          },
          {
            heading: 'Scaling considerations',
            body: 'Partitioning strategies, storage formats, and compute resource management for terabyte-scale training datasets.',
            bullets: [
              'Columnar formats (Parquet, ORC) optimize both storage and query performance',
              'Partition pruning reduces the data scanned for feature computation',
              'Cost optimization balances compute spot instances against pipeline reliability'
            ]
          }
        ],
        checklist: [
          'Can design a data pipeline appropriate for the freshness and scale requirements.',
          'Implements data quality checks that catch issues before they affect training.',
          'Understands storage format and partitioning tradeoffs for large datasets.'
        ],
        pitfalls: [
          'Building real-time pipelines when batch processing would meet SLAs at lower cost.',
          'Not implementing data validation, leading to silent data corruption in training.',
          'Over-engineering pipeline infrastructure before proving the model value.'
        ],
        interviewPrompts: [
          'Design a data pipeline for a recommendation system that needs hourly feature updates.',
          'How would you implement data quality checks for a pipeline processing 10TB/day?',
          'Compare batch and streaming architectures for computing user engagement features.'
        ],
        exercises: [
          {
            id: 'data-pipeline-spark',
            title: 'Design a feature engineering pipeline',
            difficulty: 'intermediate',
            type: 'coding',
            description: 'Implement a data pipeline that reads raw event data, computes aggregated features (rolling averages, counts), and outputs training-ready feature vectors.',
            starterCode: `import numpy as np\nfrom typing import List, Dict\nfrom collections import defaultdict\nfrom datetime import datetime, timedelta\n\nclass FeatureEngineer:\n    def __init__(self, window_days: int = 7):\n        self.window_days = window_days\n\n    def compute_user_features(self, events: List[Dict]) -> Dict[str, float]:\n        """Compute features from a user's event history.\n        Events: [{timestamp, event_type, value}, ...]\n        Features: event_count_7d, avg_value_7d, distinct_event_types, recency_hours\n        """\n        # TODO\n        pass\n\n    def compute_batch(self, all_events: Dict[str, List[Dict]]) -> Dict[str, Dict[str, float]]:\n        """Compute features for all users."""\n        # TODO\n        pass\n\n# Test\nevents = {\n    "user_1": [\n        {"timestamp": datetime(2024, 1, 7, 10, 0), "event_type": "purchase", "value": 50},\n        {"timestamp": datetime(2024, 1, 6, 14, 0), "event_type": "view", "value": 0},\n        {"timestamp": datetime(2024, 1, 5, 9, 0), "event_type": "purchase", "value": 30},\n    ],\n    "user_2": [\n        {"timestamp": datetime(2024, 1, 7, 8, 0), "event_type": "view", "value": 0},\n    ]\n}\nfe = FeatureEngineer(window_days=7)\nfeatures = fe.compute_batch(events)\nfor user, feats in features.items():\n    print(f"{user}: {feats}")`,
            solution: `import numpy as np\nfrom typing import List, Dict\nfrom datetime import datetime, timedelta\n\nclass FeatureEngineer:\n    def __init__(self, window_days: int = 7):\n        self.window_days = window_days\n        self.now = datetime(2024, 1, 7, 23, 59)\n\n    def compute_user_features(self, events: List[Dict]) -> Dict[str, float]:\n        cutoff = self.now - timedelta(days=self.window_days)\n        recent = [e for e in events if e["timestamp"] >= cutoff]\n        if not recent:\n            return {"event_count_7d": 0, "avg_value_7d": 0, "distinct_types": 0, "recency_hours": 999}\n        values = [e["value"] for e in recent]\n        types = set(e["event_type"] for e in recent)\n        latest = max(e["timestamp"] for e in recent)\n        recency = (self.now - latest).total_seconds() / 3600\n        return {\n            "event_count_7d": len(recent),\n            "avg_value_7d": np.mean(values),\n            "distinct_types": len(types),\n            "recency_hours": round(recency, 1)\n        }\n\n    def compute_batch(self, all_events: Dict[str, List[Dict]]) -> Dict[str, Dict[str, float]]:\n        return {user: self.compute_user_features(events) for user, events in all_events.items()}`,
            hints: [
              'Filter events within the time window first',
              'Recency = hours since most recent event',
              'Handle edge case of users with no events in window'
            ],
            expectedOutput: 'user_1 has higher event count and avg value; user_2 has minimal features'
          },
          {
            id: 'data-validation-checks',
            title: 'Build a data validation framework',
            difficulty: 'beginner',
            type: 'coding',
            description: 'Create a data validation system that checks schema compliance, value ranges, null percentages, and distribution stability before training.',
            starterCode: `from typing import Dict, List, Any\nimport numpy as np\n\nclass DataValidator:\n    def __init__(self):\n        self.rules = []\n\n    def add_rule(self, column: str, check: str, **kwargs):\n        """Add a validation rule.\n        Checks: 'not_null', 'range', 'unique_ratio', 'type'\n        """\n        # TODO\n        pass\n\n    def validate(self, data: Dict[str, np.ndarray]) -> List[Dict]:\n        """Run all rules and return list of violations."""\n        # TODO\n        pass\n\n# Test\nvalidator = DataValidator()\nvalidator.add_rule("age", "range", min_val=0, max_val=120)\nvalidator.add_rule("age", "not_null", max_null_pct=0.05)\nvalidator.add_rule("email", "not_null", max_null_pct=0.0)\n\ndata = {\n    "age": np.array([25, 30, -5, 150, None, 40]),\n    "email": np.array(["a@b.com", None, "c@d.com", "e@f.com", "g@h.com", "i@j.com"])\n}\nviolations = validator.validate(data)\nfor v in violations:\n    print(v)`,
            solution: `from typing import Dict, List, Any\nimport numpy as np\n\nclass DataValidator:\n    def __init__(self):\n        self.rules = []\n\n    def add_rule(self, column: str, check: str, **kwargs):\n        self.rules.append({"column": column, "check": check, **kwargs})\n\n    def validate(self, data: Dict[str, np.ndarray]) -> List[Dict]:\n        violations = []\n        for rule in self.rules:\n            col = rule["column"]\n            values = data.get(col)\n            if values is None:\n                violations.append({"column": col, "check": rule["check"], "error": "column missing"})\n                continue\n            if rule["check"] == "not_null":\n                null_pct = sum(1 for v in values if v is None) / len(values)\n                if null_pct > rule.get("max_null_pct", 0):\n                    violations.append({"column": col, "check": "not_null", "null_pct": null_pct, "max": rule["max_null_pct"]})\n            elif rule["check"] == "range":\n                for v in values:\n                    if v is not None and (v < rule.get("min_val", float("-inf")) or v > rule.get("max_val", float("inf"))):\n                        violations.append({"column": col, "check": "range", "value": v, "bounds": (rule["min_val"], rule["max_val"])})\n        return violations`,
            hints: [
              'Store rules as dicts with column, check type, and parameters',
              'Handle None values before applying numeric checks',
              'Return all violations, not just the first one'
            ],
            expectedOutput: 'Violations for age=-5 (out of range), age=150 (out of range), email null'
          }
        ],
        diagram: null,
        related: ['model-evaluation', 'ml-pipeline-design']
      },
      {
        slug: 'dataset-management',
        title: 'Dataset management and versioning',
        summary: 'Data versioning, lineage tracking, labeling pipelines, and dataset governance for reproducible ML.',
        duration: '25-35 min',
        whyItMatters: 'Without proper dataset management, you cannot reproduce results, audit decisions, or comply with data regulations.',
        sections: [
          {
            heading: 'Versioning and lineage',
            body: 'DVC, LakeFS, and Delta Lake provide git-like versioning for datasets, enabling reproducibility and rollback.',
            bullets: [
              'Dataset versions tied to model versions enable full reproducibility',
              'Lineage tracking shows how raw data was transformed into training features',
              'Branching enables experimentation with different data preprocessing strategies'
            ]
          },
          {
            heading: 'Labeling and annotation',
            body: 'Human labeling pipelines, active learning, weak supervision, and quality control for supervised learning datasets.',
            bullets: [
              'Active learning prioritizes labeling the most informative examples',
              'Weak supervision (Snorkel) generates noisy labels programmatically at scale',
              'Inter-annotator agreement metrics measure labeling consistency'
            ]
          },
          {
            heading: 'Privacy and compliance',
            body: 'Data anonymization, access controls, retention policies, and consent management for training data.',
            bullets: [
              'PII detection and masking prevent sensitive data from entering training sets',
              'Data retention policies ensure compliance with deletion requests',
              'Differential privacy adds mathematical guarantees to model training'
            ]
          }
        ],
        checklist: [
          'Versions datasets alongside model code and training configurations.',
          'Maintains lineage from raw data through features to model predictions.',
          'Implements privacy controls appropriate for the data sensitivity level.'
        ],
        pitfalls: [
          'Treating datasets as immutable without tracking transformations applied.',
          'Not measuring labeling quality leading to noisy training signals.',
          'Ignoring data privacy requirements until compliance becomes an emergency.'
        ],
        interviewPrompts: [
          'How would you manage datasets for a model that must comply with right-to-be-forgotten requests?',
          'Design a labeling pipeline for a medical image classification task.',
          'When would you choose weak supervision over manual labeling?'
        ],
        exercises: [
          {
            id: 'dataset-versioning-design',
            title: 'Design a dataset versioning system',
            difficulty: 'intermediate',
            type: 'design',
            description: 'Design a system that versions datasets alongside model code, ensuring full reproducibility of any training run from any point in history.',
            promptQuestions: [
              'How would you store dataset versions efficiently (full copies vs diffs vs content-addressable storage)?',
              'How do you link a specific model artifact to the exact dataset version it was trained on?',
              'Design the metadata schema: what information must be captured per dataset version?',
              'How do you handle right-to-be-forgotten requests that require retroactive data deletion?',
              'What is the access control model for sensitive datasets with different permission levels?'
            ]
          },
          {
            id: 'labeling-pipeline-quality',
            title: 'Build a labeling quality control system',
            difficulty: 'intermediate',
            type: 'coding',
            description: 'Implement inter-annotator agreement metrics (Cohen kappa, Fleiss kappa) and a system that flags low-quality labels for re-annotation.',
            starterCode: `import numpy as np\nfrom typing import List\n\ndef cohens_kappa(annotator1: List[int], annotator2: List[int]) -> float:\n    """Compute Cohen's kappa for two annotators.\n    kappa = (observed_agreement - expected_agreement) / (1 - expected_agreement)\n    """\n    # TODO\n    pass\n\ndef flag_disagreements(annotations: List[List[int]], threshold: float = 0.5) -> List[int]:\n    """Flag items where annotators disagree significantly.\n    Returns indices of items needing re-annotation."""\n    # TODO: Flag items where less than threshold% of annotators agree\n    pass\n\n# Test\na1 = [1, 0, 1, 1, 0, 1, 0, 0, 1, 1]\na2 = [1, 0, 1, 0, 0, 1, 1, 0, 1, 0]\na3 = [1, 1, 1, 1, 0, 0, 0, 0, 1, 1]\n\nprint(f"Kappa (a1 vs a2): {cohens_kappa(a1, a2):.3f}")\nprint(f"Items to re-annotate: {flag_disagreements([a1, a2, a3])}")`,
            solution: `import numpy as np\nfrom typing import List\n\ndef cohens_kappa(annotator1: List[int], annotator2: List[int]) -> float:\n    n = len(annotator1)\n    observed_agree = sum(a == b for a, b in zip(annotator1, annotator2)) / n\n    p1_pos = sum(annotator1) / n\n    p2_pos = sum(annotator2) / n\n    expected_agree = p1_pos * p2_pos + (1 - p1_pos) * (1 - p2_pos)\n    if expected_agree == 1:\n        return 1.0\n    return (observed_agree - expected_agree) / (1 - expected_agree)\n\ndef flag_disagreements(annotations: List[List[int]], threshold: float = 0.67) -> List[int]:\n    n_items = len(annotations[0])\n    flagged = []\n    for i in range(n_items):\n        votes = [a[i] for a in annotations]\n        majority_pct = max(votes.count(0), votes.count(1)) / len(votes)\n        if majority_pct < threshold:\n            flagged.append(i)\n    return flagged`,
            hints: [
              'Kappa = (observed - expected) / (1 - expected)',
              'Expected agreement assumes independence: P(both yes) + P(both no)',
              'Flag items where no label gets >= threshold agreement'
            ],
            expectedOutput: 'Kappa around 0.4-0.6 (moderate agreement); several items flagged for re-annotation'
          }
        ],
        diagram: null,
        related: ['data-pipelines-at-scale', 'ml-pipeline-design']
      }
    ]
  }
];
