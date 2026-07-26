/**
 * Interactive AI/ML learning expansion modules.
 *
 * Exercises are designed for the in-browser Python runtime with NumPy, pandas,
 * matplotlib, and scikit-learn available. They intentionally avoid TensorFlow
 * and PyTorch so learners can run everything in Pyodide.
 */
export const rawAiLearningModules = [
  {
    slug: 'ml-interactive-lab',
    title: 'Interactive machine learning lab',
    summary:
      'Hands-on classical ML lessons for feature engineering, supervised model comparison, and unsupervised structure discovery with scikit-learn.',
    objectives: [
      'Build preprocessing pipelines that prevent train/test leakage',
      'Compare supervised models with cross-validation and task-appropriate metrics',
      'Use clustering and dimensionality reduction to explore unlabeled data'
    ],
    lessons: [
      {
        slug: 'feature-engineering-playground',
        title: 'Feature engineering playground',
        summary:
          'Scaling, encoding, missing-value handling, and scikit-learn Pipelines for tabular machine learning workflows.',
        duration: '35-45 min',
        whyItMatters:
          'Feature engineering is where most tabular ML systems win or lose. Pipelines make the transformations reproducible, testable, and safe from leakage.',
        sections: [
          {
            heading: 'Transform raw columns by type',
            body:
              'Numeric, categorical, and missing-value handling should be explicit. ColumnTransformer lets each feature family receive the preprocessing it needs before the estimator sees the data.',
            bullets: [
              'Scale numeric features for distance-based and linear models.',
              'One-hot encode categoricals when labels have no natural order.',
              'Impute missing values inside the pipeline so validation mirrors production.'
            ],
            codeExample: {
              title: 'Mixed-column preprocessing',
              language: 'python',
              code: [
                'import numpy as np',
                'import pandas as pd',
                'from sklearn.compose import ColumnTransformer',
                'from sklearn.impute import SimpleImputer',
                'from sklearn.pipeline import Pipeline',
                'from sklearn.preprocessing import OneHotEncoder, StandardScaler',
                '',
                'df = pd.DataFrame({',
                '    "age": [22, 41, np.nan, 35],',
                '    "city": ["NYC", "SF", "NYC", "LA"],',
                '    "spend": [120.0, 340.0, 90.0, np.nan]',
                '})',
                '',
                'preprocessor = ColumnTransformer([',
                '    ("num", Pipeline([("impute", SimpleImputer()), ("scale", StandardScaler())]), ["age", "spend"]),',
                '    ("cat", OneHotEncoder(handle_unknown="ignore"), ["city"])',
                '])',
                '',
                'print(preprocessor.fit_transform(df).round(3))'
              ].join('\n')
            }
          },
          {
            heading: 'Pipelines protect evaluation',
            body:
              'Preprocessing must be learned only from training folds during cross-validation. Pipeline composes preprocessing and modeling so each fold gets its own fitted transformer.',
            bullets: [
              'Fit transformations on training data only.',
              'Keep train, validation, and production transformations identical.',
              'Treat feature engineering decisions as model hyperparameters when comparing approaches.'
            ]
          },
          {
            heading: 'Feature choices change model behavior',
            body:
              'Linear models need scaled numeric inputs and encoded categoricals; trees are less sensitive to scaling but still need clean missing-value and categorical handling in many scikit-learn workflows.',
            bullets: [
              'Scaling changes distance and regularization geometry.',
              'High-cardinality categoricals can explode feature dimensions.',
              'Interaction features help linear models represent non-linear patterns.'
            ]
          }
        ],
        checklist: [
          'Can build a ColumnTransformer for numeric and categorical columns.',
          'Can explain why preprocessing belongs inside cross-validation.',
          'Can compare how scaling affects linear, distance-based, and tree models.'
        ],
        pitfalls: [
          'Fitting scalers or encoders before splitting the data.',
          'Using ordinal encoding for unordered categories without a reason.',
          'Adding many sparse features without checking model capacity or latency.'
        ],
        interviewPrompts: [
          'How would you prevent preprocessing leakage in a tabular ML project?',
          'When does one-hot encoding become problematic?',
          'Why might a KNN model change dramatically after scaling?'
        ],
        exercises: [
          {
            id: 'mixed-column-pipeline',
            title: 'Build a mixed-column sklearn Pipeline',
            difficulty: 'beginner',
            type: 'coding',
            description:
              'Create a complete preprocessing and classification pipeline for a tiny customer dataset with numeric, categorical, and missing values.',
            starterCode: [
              'import numpy as np',
              'import pandas as pd',
              'from sklearn.compose import ColumnTransformer',
              'from sklearn.impute import SimpleImputer',
              'from sklearn.linear_model import LogisticRegression',
              'from sklearn.model_selection import cross_val_score',
              'from sklearn.pipeline import Pipeline',
              'from sklearn.preprocessing import OneHotEncoder, StandardScaler',
              '',
              'data = pd.DataFrame({',
              '    "age": [22, 25, 47, np.nan, 52, 46, 56, 55, 60, 28, 30, 42],',
              '    "income": [35, 42, 88, 76, 110, np.nan, 120, 95, 130, 48, 52, 80],',
              '    "city": ["NYC", "LA", "SF", "NYC", "SF", "LA", "SF", "NYC", "SF", "LA", "NYC", "LA"],',
              '    "plan": ["free", "free", "pro", "pro", "team", "pro", "team", "team", "team", "free", "pro", "pro"],',
              '    "converted": [0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1]',
              '})',
              '',
              'X = data.drop(columns="converted")',
              'y = data["converted"]',
              'numeric_features = ["age", "income"]',
              'categorical_features = ["city", "plan"]',
              '',
              '# TODO: create numeric and categorical transformers.',
              '# TODO: combine them with ColumnTransformer.',
              '# TODO: create a Pipeline ending in LogisticRegression(max_iter=1000).',
              'pipeline = None',
              '',
              'if pipeline is None:',
              '    print("TODO: build and fit the pipeline")',
              'else:',
              '    scores = cross_val_score(pipeline, X, y, cv=3, scoring="accuracy")',
              '    print("CV accuracy:", scores.round(3), "mean=", round(scores.mean(), 3))'
            ].join('\n'),
            solution: [
              'import numpy as np',
              'import pandas as pd',
              'from sklearn.compose import ColumnTransformer',
              'from sklearn.impute import SimpleImputer',
              'from sklearn.linear_model import LogisticRegression',
              'from sklearn.model_selection import cross_val_score',
              'from sklearn.pipeline import Pipeline',
              'from sklearn.preprocessing import OneHotEncoder, StandardScaler',
              '',
              'data = pd.DataFrame({',
              '    "age": [22, 25, 47, np.nan, 52, 46, 56, 55, 60, 28, 30, 42],',
              '    "income": [35, 42, 88, 76, 110, np.nan, 120, 95, 130, 48, 52, 80],',
              '    "city": ["NYC", "LA", "SF", "NYC", "SF", "LA", "SF", "NYC", "SF", "LA", "NYC", "LA"],',
              '    "plan": ["free", "free", "pro", "pro", "team", "pro", "team", "team", "team", "free", "pro", "pro"],',
              '    "converted": [0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1]',
              '})',
              '',
              'X = data.drop(columns="converted")',
              'y = data["converted"]',
              'numeric_features = ["age", "income"]',
              'categorical_features = ["city", "plan"]',
              '',
              'numeric_transformer = Pipeline([',
              '    ("imputer", SimpleImputer(strategy="median")),',
              '    ("scaler", StandardScaler())',
              '])',
              'categorical_transformer = Pipeline([',
              '    ("imputer", SimpleImputer(strategy="most_frequent")),',
              '    ("encoder", OneHotEncoder(handle_unknown="ignore"))',
              '])',
              'preprocessor = ColumnTransformer([',
              '    ("num", numeric_transformer, numeric_features),',
              '    ("cat", categorical_transformer, categorical_features)',
              '])',
              'pipeline = Pipeline([',
              '    ("preprocess", preprocessor),',
              '    ("model", LogisticRegression(max_iter=1000))',
              '])',
              '',
              'scores = cross_val_score(pipeline, X, y, cv=3, scoring="accuracy")',
              'print("CV accuracy:", scores.round(3), "mean=", round(scores.mean(), 3))'
            ].join('\n'),
            hints: [
              'Use SimpleImputer(strategy="median") and StandardScaler for numeric columns.',
              'Use OneHotEncoder(handle_unknown="ignore") for categorical columns.',
              'Wrap preprocessing and LogisticRegression in one Pipeline before calling cross_val_score.'
            ],
            expectedOutput:
              'A printed 3-fold accuracy array and mean accuracy from a fitted preprocessing/classification pipeline.'
          },
          {
            id: 'scaling-effect-comparison',
            title: 'Measure how scaling changes models',
            difficulty: 'intermediate',
            type: 'coding',
            description:
              'Compare KNN with and without scaling on a synthetic dataset where one feature has a much larger numeric range.',
            starterCode: [
              'import numpy as np',
              'from sklearn.datasets import make_classification',
              'from sklearn.model_selection import cross_val_score',
              'from sklearn.neighbors import KNeighborsClassifier',
              'from sklearn.pipeline import Pipeline',
              'from sklearn.preprocessing import StandardScaler',
              '',
              'X, y = make_classification(n_samples=300, n_features=4, n_informative=3, n_redundant=0, random_state=7)',
              'X[:, 0] *= 1000.0',
              '',
              '# TODO: define two models:',
              '# raw_knn = KNeighborsClassifier(n_neighbors=5)',
              '# scaled_knn = Pipeline([...StandardScaler(), KNeighborsClassifier(...)])',
              'models = {}',
              '',
              'if not models:',
              '    print("TODO: add raw_knn and scaled_knn to models")',
              'for name, model in models.items():',
              '    scores = cross_val_score(model, X, y, cv=5, scoring="accuracy")',
              '    print(f"{name}: mean={scores.mean():.3f} std={scores.std():.3f}")'
            ].join('\n'),
            solution: [
              'import numpy as np',
              'from sklearn.datasets import make_classification',
              'from sklearn.model_selection import cross_val_score',
              'from sklearn.neighbors import KNeighborsClassifier',
              'from sklearn.pipeline import Pipeline',
              'from sklearn.preprocessing import StandardScaler',
              '',
              'X, y = make_classification(n_samples=300, n_features=4, n_informative=3, n_redundant=0, random_state=7)',
              'X[:, 0] *= 1000.0',
              '',
              'models = {',
              '    "raw_knn": KNeighborsClassifier(n_neighbors=5),',
              '    "scaled_knn": Pipeline([',
              '        ("scale", StandardScaler()),',
              '        ("knn", KNeighborsClassifier(n_neighbors=5))',
              '    ])',
              '}',
              '',
              'for name, model in models.items():',
              '    scores = cross_val_score(model, X, y, cv=5, scoring="accuracy")',
              '    print(f"{name}: mean={scores.mean():.3f} std={scores.std():.3f}")'
            ].join('\n'),
            hints: [
              'KNN uses distances, so large-range features dominate unless scaled.',
              'Use Pipeline so scaling is fit separately inside each CV fold.',
              'Compare mean accuracy, not just one train/test split.'
            ],
            expectedOutput:
              'Two accuracy summaries, usually with scaled_knn outperforming raw_knn on the distorted feature ranges.'
          },
          {
            id: 'feature-store-design-sketch',
            title: 'Design a leakage-safe feature store workflow',
            difficulty: 'intermediate',
            type: 'design',
            description:
              'Sketch how offline training features and online serving features stay consistent for a churn model.',
            promptQuestions: [
              'Which transformations must be shared between training and serving?',
              'How do you version feature definitions?',
              'Where can label leakage enter the workflow?',
              'What monitoring would detect feature drift?'
            ]
          }
        ],
        diagram: null,
        related: ['supervised-learning-workshop', 'data-engineering-for-ml']
      },
      {
        slug: 'supervised-learning-workshop',
        title: 'Supervised learning workshop',
        summary:
          'Train and compare classifiers on sklearn datasets and synthetic data using cross-validation, metrics, and threshold tuning.',
        duration: '40-50 min',
        whyItMatters:
          'Production ML work depends on choosing a reliable baseline, measuring it honestly, and improving it with evidence rather than model hype.',
        sections: [
          {
            heading: 'Start with baselines',
            body:
              'A strong supervised workflow compares simple models first. Logistic regression, trees, random forests, and gradient boosting often establish whether the signal is learnable.',
            bullets: [
              'Use stratified cross-validation for classification.',
              'Compare against a dummy or simple baseline before tuning.',
              'Prefer interpretable metrics tied to the business cost of mistakes.'
            ],
            codeExample: {
              title: 'Compare classifiers with cross-validation',
              language: 'python',
              code: [
                'from sklearn.datasets import load_breast_cancer',
                'from sklearn.ensemble import RandomForestClassifier',
                'from sklearn.linear_model import LogisticRegression',
                'from sklearn.model_selection import StratifiedKFold, cross_val_score',
                'from sklearn.pipeline import Pipeline',
                'from sklearn.preprocessing import StandardScaler',
                '',
                'X, y = load_breast_cancer(return_X_y=True)',
                'cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)',
                'models = {',
                '    "logreg": Pipeline([("scale", StandardScaler()), ("model", LogisticRegression(max_iter=1000))]),',
                '    "forest": RandomForestClassifier(n_estimators=100, random_state=42)',
                '}',
                'for name, model in models.items():',
                '    scores = cross_val_score(model, X, y, cv=cv, scoring="roc_auc")',
                '    print(name, round(scores.mean(), 3), round(scores.std(), 3))'
              ].join('\n')
            }
          },
          {
            heading: 'Metrics change the decision',
            body:
              'Accuracy can be the wrong metric when classes are imbalanced or false positives and false negatives have different costs.',
            bullets: [
              'Precision answers: when the model predicts positive, how often is it right?',
              'Recall answers: of the true positives, how many did the model catch?',
              'ROC-AUC and PR-AUC evaluate ranking quality across thresholds.'
            ]
          },
          {
            heading: 'Thresholds are product decisions',
            body:
              'Many classifiers output scores or probabilities. The final threshold should reflect the cost of action, review capacity, and risk tolerance.',
            bullets: [
              'Fraud and medical screening often prioritize recall.',
              'Spam blocking and automated enforcement often require high precision.',
              'A validation set should choose the threshold before final test reporting.'
            ]
          }
        ],
        checklist: [
          'Can set up stratified cross-validation.',
          'Can compare at least three classifier families fairly.',
          'Can tune a probability threshold for precision or recall goals.'
        ],
        pitfalls: [
          'Selecting the best model from one lucky split.',
          'Reporting accuracy on imbalanced data without class-specific metrics.',
          'Tuning threshold on the final test set.'
        ],
        interviewPrompts: [
          'How would you choose between logistic regression and a random forest?',
          'What metric would you use for fraud detection and why?',
          'Why is cross-validation still not enough for temporal data?'
        ],
        exercises: [
          {
            id: 'classifier-cross-val-benchmark',
            title: 'Benchmark supervised classifiers',
            difficulty: 'beginner',
            type: 'coding',
            description:
              'Compare logistic regression, random forest, and gradient boosting on the breast cancer dataset using stratified cross-validation.',
            starterCode: [
              'from sklearn.datasets import load_breast_cancer',
              'from sklearn.ensemble import GradientBoostingClassifier, RandomForestClassifier',
              'from sklearn.linear_model import LogisticRegression',
              'from sklearn.model_selection import StratifiedKFold, cross_val_score',
              'from sklearn.pipeline import Pipeline',
              'from sklearn.preprocessing import StandardScaler',
              '',
              'X, y = load_breast_cancer(return_X_y=True)',
              'cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)',
              '',
              '# TODO: add at least three models to this dictionary.',
              '# Include scaling for LogisticRegression by using Pipeline.',
              'models = {}',
              '',
              'if not models:',
              '    print("TODO: add models before benchmarking")',
              'for name, model in models.items():',
              '    scores = cross_val_score(model, X, y, cv=cv, scoring="roc_auc")',
              '    print(f"{name}: auc={scores.mean():.3f} +/- {scores.std():.3f}")'
            ].join('\n'),
            solution: [
              'from sklearn.datasets import load_breast_cancer',
              'from sklearn.ensemble import GradientBoostingClassifier, RandomForestClassifier',
              'from sklearn.linear_model import LogisticRegression',
              'from sklearn.model_selection import StratifiedKFold, cross_val_score',
              'from sklearn.pipeline import Pipeline',
              'from sklearn.preprocessing import StandardScaler',
              '',
              'X, y = load_breast_cancer(return_X_y=True)',
              'cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)',
              '',
              'models = {',
              '    "logistic_regression": Pipeline([("scale", StandardScaler()), ("model", LogisticRegression(max_iter=1000))]),',
              '    "random_forest": RandomForestClassifier(n_estimators=150, random_state=42),',
              '    "gradient_boosting": GradientBoostingClassifier(random_state=42)',
              '}',
              '',
              'for name, model in models.items():',
              '    scores = cross_val_score(model, X, y, cv=cv, scoring="roc_auc")',
              '    print(f"{name}: auc={scores.mean():.3f} +/- {scores.std():.3f}")'
            ].join('\n'),
            hints: [
              'Use StratifiedKFold for classification.',
              'LogisticRegression benefits from StandardScaler.',
              'ROC-AUC is useful when predicted ranking matters.'
            ],
            expectedOutput:
              'Three ROC-AUC summaries, typically all high on the breast cancer dataset.'
          },
          {
            id: 'precision-recall-threshold',
            title: 'Tune a decision threshold',
            difficulty: 'intermediate',
            type: 'coding',
            description:
              'Train a logistic regression model and choose the lowest threshold that achieves at least 90% recall on a validation split.',
            starterCode: [
              'import numpy as np',
              'from sklearn.datasets import make_classification',
              'from sklearn.linear_model import LogisticRegression',
              'from sklearn.metrics import precision_score, recall_score',
              'from sklearn.model_selection import train_test_split',
              'from sklearn.pipeline import Pipeline',
              'from sklearn.preprocessing import StandardScaler',
              '',
              'X, y = make_classification(n_samples=600, n_features=10, n_informative=5, weights=[0.8, 0.2], random_state=11)',
              'X_train, X_val, y_train, y_val = train_test_split(X, y, test_size=0.35, stratify=y, random_state=11)',
              'model = Pipeline([("scale", StandardScaler()), ("clf", LogisticRegression(max_iter=1000))])',
              'model.fit(X_train, y_train)',
              'scores = model.predict_proba(X_val)[:, 1]',
              '',
              '# TODO: search thresholds from 0.05 to 0.95.',
              '# Pick the threshold with recall >= 0.90 and best precision among those.',
              'best_threshold = None',
              '',
              'if best_threshold is None:',
              '    print("TODO: choose a threshold")',
              'else:',
              '    pred = (scores >= best_threshold).astype(int)',
              '    print("threshold", round(best_threshold, 2), "precision", round(precision_score(y_val, pred), 3), "recall", round(recall_score(y_val, pred), 3))'
            ].join('\n'),
            solution: [
              'import numpy as np',
              'from sklearn.datasets import make_classification',
              'from sklearn.linear_model import LogisticRegression',
              'from sklearn.metrics import precision_score, recall_score',
              'from sklearn.model_selection import train_test_split',
              'from sklearn.pipeline import Pipeline',
              'from sklearn.preprocessing import StandardScaler',
              '',
              'X, y = make_classification(n_samples=600, n_features=10, n_informative=5, weights=[0.8, 0.2], random_state=11)',
              'X_train, X_val, y_train, y_val = train_test_split(X, y, test_size=0.35, stratify=y, random_state=11)',
              'model = Pipeline([("scale", StandardScaler()), ("clf", LogisticRegression(max_iter=1000))])',
              'model.fit(X_train, y_train)',
              'scores = model.predict_proba(X_val)[:, 1]',
              '',
              'best_threshold = None',
              'best_precision = -1.0',
              'for threshold in np.linspace(0.05, 0.95, 19):',
              '    pred = (scores >= threshold).astype(int)',
              '    recall = recall_score(y_val, pred)',
              '    precision = precision_score(y_val, pred, zero_division=0)',
              '    if recall >= 0.90 and precision > best_precision:',
              '        best_threshold = threshold',
              '        best_precision = precision',
              '',
              'pred = (scores >= best_threshold).astype(int)',
              'print("threshold", round(best_threshold, 2), "precision", round(precision_score(y_val, pred), 3), "recall", round(recall_score(y_val, pred), 3))'
            ].join('\n'),
            hints: [
              'Lower thresholds usually increase recall and reduce precision.',
              'Use predict_proba to get scores instead of hard class labels.',
              'zero_division=0 avoids warnings when no positives are predicted.'
            ],
            expectedOutput:
              'A selected threshold with validation recall at or above 0.90 and the corresponding precision.'
          }
        ],
        diagram: null,
        related: ['feature-engineering-playground', 'model-evaluation']
      },
      {
        slug: 'unsupervised-learning-workshop',
        title: 'Unsupervised learning workshop',
        summary:
          'Explore clustering and dimensionality reduction with KMeans, PCA, silhouette scores, and matplotlib visualizations.',
        duration: '40-50 min',
        whyItMatters:
          'Unsupervised learning helps you inspect structure before labels exist, compress high-dimensional data, and generate hypotheses for product or data-quality work.',
        sections: [
          {
            heading: 'KMeans as prototype learning',
            body:
              'KMeans assigns points to the nearest centroid, then moves each centroid to the mean of its assigned points. It works best for compact, roughly spherical clusters.',
            bullets: [
              'Scale features before distance-based clustering.',
              'Use inertia and silhouette score to compare k values.',
              'Inspect clusters qualitatively before treating them as true labels.'
            ],
            codeExample: {
              title: 'KMeans on synthetic blobs',
              language: 'python',
              code: [
                'from sklearn.cluster import KMeans',
                'from sklearn.datasets import make_blobs',
                'from sklearn.metrics import silhouette_score',
                '',
                'X, _ = make_blobs(n_samples=250, centers=3, cluster_std=0.8, random_state=4)',
                'model = KMeans(n_clusters=3, n_init=10, random_state=4)',
                'labels = model.fit_predict(X)',
                'print("inertia", round(model.inertia_, 2))',
                'print("silhouette", round(silhouette_score(X, labels), 3))'
              ].join('\n')
            }
          },
          {
            heading: 'PCA for compression and visualization',
            body:
              'PCA rotates features into directions of maximum variance. The first two components often make high-dimensional datasets easier to inspect.',
            bullets: [
              'PCA is linear and unsupervised; it does not optimize class separation directly.',
              'Explained variance ratio helps decide how many components to keep.',
              'Scale features first when units differ.'
            ]
          },
          {
            heading: 'Interpretation beats blind clustering',
            body:
              'Clusters are not automatically personas, segments, or anomalies. After discovering groups, inspect feature distributions and validate usefulness with domain knowledge.',
            bullets: [
              'Check whether clusters are stable across random seeds.',
              'Profile clusters by feature means or representative examples.',
              'Avoid deploying cluster labels as sensitive decisions without validation.'
            ]
          }
        ],
        checklist: [
          'Can fit KMeans and evaluate inertia and silhouette score.',
          'Can reduce a dataset to two principal components for visualization.',
          'Can explain why unsupervised clusters need interpretation before action.'
        ],
        pitfalls: [
          'Treating the elbow method as an exact answer.',
          'Skipping scaling before distance-based methods.',
          'Assuming PCA components are causally meaningful.'
        ],
        interviewPrompts: [
          'How would you choose k for KMeans?',
          'What does PCA preserve and what can it hide?',
          'How would you validate that discovered customer segments are useful?'
        ],
        exercises: [
          {
            id: 'kmeans-model-selection',
            title: 'Choose k with inertia and silhouette',
            difficulty: 'beginner',
            type: 'coding',
            description:
              'Fit KMeans for several k values on synthetic blobs and report inertia plus silhouette score.',
            starterCode: [
              'from sklearn.cluster import KMeans',
              'from sklearn.datasets import make_blobs',
              'from sklearn.metrics import silhouette_score',
              '',
              'X, _ = make_blobs(n_samples=300, centers=4, cluster_std=0.75, random_state=21)',
              '',
              '# TODO: loop over k values from 2 through 6.',
              '# For each k, fit KMeans(n_clusters=k, n_init=10, random_state=21).',
              '# Print inertia and silhouette score.',
              'results = []',
              '',
              'if not results:',
              '    print("TODO: compute clustering scores")',
              'for row in results:',
              '    print(row)'
            ].join('\n'),
            solution: [
              'from sklearn.cluster import KMeans',
              'from sklearn.datasets import make_blobs',
              'from sklearn.metrics import silhouette_score',
              '',
              'X, _ = make_blobs(n_samples=300, centers=4, cluster_std=0.75, random_state=21)',
              '',
              'results = []',
              'for k in range(2, 7):',
              '    model = KMeans(n_clusters=k, n_init=10, random_state=21)',
              '    labels = model.fit_predict(X)',
              '    results.append((k, round(model.inertia_, 2), round(silhouette_score(X, labels), 3)))',
              '',
              'for k, inertia, silhouette in results:',
              '    print(f"k={k}: inertia={inertia} silhouette={silhouette}")'
            ].join('\n'),
            hints: [
              'Inertia almost always decreases as k increases, so compare it with silhouette.',
              'silhouette_score needs both X and predicted labels.',
              'The synthetic data was generated with four centers.'
            ],
            expectedOutput:
              'A table of k values where k=4 should usually have the strongest silhouette score.'
          },
          {
            id: 'pca-iris-visualization',
            title: 'Visualize Iris with PCA',
            difficulty: 'intermediate',
            type: 'coding',
            description:
              'Scale the Iris dataset, reduce it to two principal components, and create a matplotlib scatter plot colored by species.',
            starterCode: [
              'import matplotlib.pyplot as plt',
              'from sklearn.datasets import load_iris',
              'from sklearn.decomposition import PCA',
              'from sklearn.pipeline import Pipeline',
              'from sklearn.preprocessing import StandardScaler',
              '',
              'iris = load_iris()',
              'X, y = iris.data, iris.target',
              '',
              '# TODO: build a Pipeline with StandardScaler and PCA(n_components=2).',
              '# TODO: transform X into coords and print explained variance ratio.',
              'coords = None',
              '',
              'if coords is None:',
              '    print("TODO: compute PCA coordinates")',
              'else:',
              '    plt.figure(figsize=(6, 4))',
              '    plt.scatter(coords[:, 0], coords[:, 1], c=y, cmap="viridis", edgecolor="k")',
              '    plt.title("Iris projected with PCA")',
              '    plt.xlabel("PC1")',
              '    plt.ylabel("PC2")',
              '    plt.tight_layout()',
              '    plt.show()'
            ].join('\n'),
            solution: [
              'import matplotlib.pyplot as plt',
              'from sklearn.datasets import load_iris',
              'from sklearn.decomposition import PCA',
              'from sklearn.pipeline import Pipeline',
              'from sklearn.preprocessing import StandardScaler',
              '',
              'iris = load_iris()',
              'X, y = iris.data, iris.target',
              '',
              'pipe = Pipeline([("scale", StandardScaler()), ("pca", PCA(n_components=2))])',
              'coords = pipe.fit_transform(X)',
              'pca = pipe.named_steps["pca"]',
              'print("explained variance:", pca.explained_variance_ratio_.round(3))',
              '',
              'plt.figure(figsize=(6, 4))',
              'plt.scatter(coords[:, 0], coords[:, 1], c=y, cmap="viridis", edgecolor="k")',
              'plt.title("Iris projected with PCA")',
              'plt.xlabel("PC1")',
              'plt.ylabel("PC2")',
              'plt.tight_layout()',
              'plt.show()'
            ].join('\n'),
            hints: [
              'PCA should receive scaled features because Iris measurements have different ranges.',
              'Access the fitted PCA object through pipe.named_steps["pca"].',
              'The first two components explain most, but not all, variance.'
            ],
            expectedOutput:
              'Printed explained-variance ratios and a two-dimensional scatter plot with three visible Iris groups.'
          },
          {
            id: 'cluster-interpretation-design',
            title: 'Turn clusters into a product hypothesis',
            difficulty: 'beginner',
            type: 'design',
            description:
              'Given customer clusters from behavioral data, outline how you would validate whether they are useful segments.',
            promptQuestions: [
              'Which feature summaries would you inspect per cluster?',
              'How would you test stability across time?',
              'What product decision would change if the clusters are real?',
              'Which fairness or privacy risks should be reviewed?'
            ]
          }
        ],
        diagram: null,
        related: ['feature-engineering-playground', 'supervised-learning-workshop']
      }
    ]
  },
  {
    slug: 'deep-learning-from-scratch',
    title: 'Deep learning from scratch',
    summary:
      'Build neural-network intuition with NumPy: perceptrons, small MLPs, manual backpropagation, gradient checking, convolution, and max pooling.',
    objectives: [
      'Implement forward passes and training loops without deep-learning frameworks',
      'Derive and verify gradients for a tiny neural network',
      'Understand CNN building blocks from array operations before using libraries'
    ],
    lessons: [
      {
        slug: 'perceptron-and-mlp-numpy',
        title: 'Perceptron and MLP with NumPy',
        summary:
          'Build a perceptron for linearly separable data, then train a two-layer MLP that can learn XOR.',
        duration: '45-55 min',
        whyItMatters:
          'From-scratch neural nets make model behavior less mysterious. You see exactly where activations, loss, gradients, and updates enter the training loop.',
        sections: [
          {
            heading: 'Perceptrons learn linear boundaries',
            body:
              'A perceptron computes a weighted sum and applies a hard threshold. It can learn AND or OR but cannot represent XOR because XOR is not linearly separable.',
            bullets: [
              'Weights define boundary orientation.',
              'Bias shifts the boundary.',
              'The update rule moves weights toward correcting a misclassified example.'
            ],
            codeExample: {
              title: 'Perceptron prediction',
              language: 'python',
              code: [
                'import numpy as np',
                '',
                'def predict(X, weights, bias):',
                '    return (X @ weights + bias >= 0).astype(int)',
                '',
                'X = np.array([[0, 0], [0, 1], [1, 0], [1, 1]])',
                'weights = np.array([1.0, 1.0])',
                'bias = -1.5',
                'print(predict(X, weights, bias))'
              ].join('\n')
            }
          },
          {
            heading: 'Hidden layers add non-linear features',
            body:
              'A two-layer MLP transforms inputs through hidden activations before classification. The hidden layer can carve the input space into pieces that solve XOR.',
            bullets: [
              'Sigmoid outputs are convenient for binary classification demos.',
              'ReLU hidden units are common, but sigmoid works well for tiny XOR examples.',
              'Training combines forward pass, loss, backward pass, and parameter update.'
            ]
          },
          {
            heading: 'Training loops are just repeated corrections',
            body:
              'Each epoch computes predictions, measures error, backpropagates gradients, and nudges parameters in the direction that lowers loss.',
            bullets: [
              'Learning rate controls update size.',
              'Initialization matters because symmetric weights learn the same thing.',
              'Loss curves are the first debugging signal.'
            ]
          }
        ],
        checklist: [
          'Can implement a perceptron update rule.',
          'Can explain why XOR needs a hidden layer.',
          'Can write a tiny MLP training loop with NumPy.'
        ],
        pitfalls: [
          'Expecting a perceptron to solve non-linearly separable data.',
          'Initializing all neural-network weights to zero.',
          'Changing learning rate without checking the loss curve.'
        ],
        interviewPrompts: [
          'Why can a perceptron learn AND but not XOR?',
          'What role does a hidden layer play geometrically?',
          'How would you debug a tiny network whose loss never changes?'
        ],
        exercises: [
          {
            id: 'train-perceptron-and-gate',
            title: 'Train a perceptron for AND',
            difficulty: 'beginner',
            type: 'coding',
            description:
              'Implement the perceptron update rule and train it on the AND truth table.',
            starterCode: [
              'import numpy as np',
              '',
              'X = np.array([[0, 0], [0, 1], [1, 0], [1, 1]], dtype=float)',
              'y = np.array([0, 0, 0, 1])',
              'weights = np.zeros(2)',
              'bias = 0.0',
              'lr = 0.2',
              '',
              'def step(z):',
              '    return 1 if z >= 0 else 0',
              '',
              '# TODO: run several epochs.',
              '# For each sample: pred = step(x @ weights + bias)',
              '# error = target - pred; update weights and bias.',
              '',
              'predictions = np.array([step(x @ weights + bias) for x in X])',
              'print("weights", weights.round(3), "bias", round(bias, 3))',
              'print("predictions", predictions)'
            ].join('\n'),
            solution: [
              'import numpy as np',
              '',
              'X = np.array([[0, 0], [0, 1], [1, 0], [1, 1]], dtype=float)',
              'y = np.array([0, 0, 0, 1])',
              'weights = np.zeros(2)',
              'bias = 0.0',
              'lr = 0.2',
              '',
              'def step(z):',
              '    return 1 if z >= 0 else 0',
              '',
              'for _ in range(20):',
              '    for x, target in zip(X, y):',
              '        pred = step(x @ weights + bias)',
              '        error = target - pred',
              '        weights += lr * error * x',
              '        bias += lr * error',
              '',
              'predictions = np.array([step(x @ weights + bias) for x in X])',
              'print("weights", weights.round(3), "bias", round(bias, 3))',
              'print("predictions", predictions)'
            ].join('\n'),
            hints: [
              'Only misclassified examples produce a non-zero error.',
              'The bias update is lr * error.',
              'AND should predict [0, 0, 0, 1].'
            ],
            expectedOutput:
              'Learned weights and bias with predictions [0 0 0 1] for the AND truth table.'
          },
          {
            id: 'train-xor-mlp',
            title: 'Train a two-layer MLP on XOR',
            difficulty: 'advanced',
            type: 'coding',
            description:
              'Implement forward and backward passes for a tiny sigmoid MLP and train it until it solves XOR.',
            starterCode: [
              'import numpy as np',
              '',
              'rng = np.random.default_rng(3)',
              'X = np.array([[0, 0], [0, 1], [1, 0], [1, 1]], dtype=float)',
              'y = np.array([[0], [1], [1], [0]], dtype=float)',
              'W1 = rng.normal(0, 1.0, size=(2, 4))',
              'b1 = np.zeros((1, 4))',
              'W2 = rng.normal(0, 1.0, size=(4, 1))',
              'b2 = np.zeros((1, 1))',
              '',
              'def sigmoid(z):',
              '    return 1 / (1 + np.exp(-z))',
              '',
              '# TODO: train for 5000 epochs.',
              '# Forward: h=sigmoid(X@W1+b1), out=sigmoid(h@W2+b2).',
              '# Backward with binary cross-entropy sigmoid shortcut: dz2 = out - y.',
              '',
              'h = sigmoid(X @ W1 + b1)',
              'out = sigmoid(h @ W2 + b2)',
              'print("predictions", (out >= 0.5).astype(int).ravel())'
            ].join('\n'),
            solution: [
              'import numpy as np',
              '',
              'rng = np.random.default_rng(3)',
              'X = np.array([[0, 0], [0, 1], [1, 0], [1, 1]], dtype=float)',
              'y = np.array([[0], [1], [1], [0]], dtype=float)',
              'W1 = rng.normal(0, 1.0, size=(2, 4))',
              'b1 = np.zeros((1, 4))',
              'W2 = rng.normal(0, 1.0, size=(4, 1))',
              'b2 = np.zeros((1, 1))',
              'lr = 1.0',
              '',
              'def sigmoid(z):',
              '    return 1 / (1 + np.exp(-z))',
              '',
              'for epoch in range(5000):',
              '    h = sigmoid(X @ W1 + b1)',
              '    out = sigmoid(h @ W2 + b2)',
              '    dz2 = out - y',
              '    dW2 = h.T @ dz2 / len(X)',
              '    db2 = dz2.mean(axis=0, keepdims=True)',
              '    dh = dz2 @ W2.T',
              '    dz1 = dh * h * (1 - h)',
              '    dW1 = X.T @ dz1 / len(X)',
              '    db1 = dz1.mean(axis=0, keepdims=True)',
              '    W2 -= lr * dW2',
              '    b2 -= lr * db2',
              '    W1 -= lr * dW1',
              '    b1 -= lr * db1',
              '',
              'h = sigmoid(X @ W1 + b1)',
              'out = sigmoid(h @ W2 + b2)',
              'print("probabilities", out.round(3).ravel())',
              'print("predictions", (out >= 0.5).astype(int).ravel())'
            ].join('\n'),
            hints: [
              'Use cached hidden activations when computing gradients.',
              'The derivative of sigmoid activation h is h * (1 - h).',
              'With the given random seed and learning rate, 5000 epochs should solve XOR.'
            ],
            expectedOutput:
              'Probabilities near [0, 1, 1, 0] and predictions [0 1 1 0].'
          }
        ],
        diagram: null,
        related: ['backpropagation-by-hand', 'cnn-building-blocks-numpy']
      },
      {
        slug: 'backpropagation-by-hand',
        title: 'Backpropagation by hand',
        summary:
          'Implement forward and backward passes for a tiny network and verify gradients numerically.',
        duration: '45-60 min',
        whyItMatters:
          'Backpropagation is the chain rule organized over a computation graph. Gradient checks help you trust the math before scaling to larger models.',
        sections: [
          {
            heading: 'Forward pass stores intermediates',
            body:
              'Backward pass needs values from the forward pass. Cache pre-activations, activations, and predictions so gradients can flow through each operation.',
            bullets: [
              'A computation graph decomposes the model into simple differentiable steps.',
              'Each local derivative multiplies the upstream gradient.',
              'Clear shapes prevent most implementation mistakes.'
            ],
            codeExample: {
              title: 'Scalar chain rule intuition',
              language: 'python',
              code: [
                'x = 3.0',
                'w = 2.0',
                'b = -1.0',
                'z = w * x + b',
                'loss = z ** 2',
                '',
                '# dloss/dz = 2z, dz/dw = x, dz/db = 1',
                'd_loss_dw = 2 * z * x',
                'd_loss_db = 2 * z',
                'print(loss, d_loss_dw, d_loss_db)'
              ].join('\n')
            }
          },
          {
            heading: 'Vectorized gradients',
            body:
              'For batches, gradients are matrix products. The shape of each derivative mirrors the parameter it updates.',
            bullets: [
              'dW for a dense layer has the same shape as W.',
              'db is usually the mean or sum of upstream gradients over the batch.',
              'Gradient averaging keeps update scale less dependent on batch size.'
            ]
          },
          {
            heading: 'Numerical gradient checks',
            body:
              'Finite differences estimate a gradient by nudging one parameter at a time. If analytic and numerical gradients match, the backward pass is probably correct.',
            bullets: [
              'Use small epsilon values such as 1e-5.',
              'Compare relative or absolute error, not exact equality.',
              'Disable randomness while checking gradients.'
            ]
          }
        ],
        checklist: [
          'Can cache forward-pass intermediates for backward use.',
          'Can derive dense-layer gradients with matrix shapes.',
          'Can implement a finite-difference gradient check.'
        ],
        pitfalls: [
          'Mixing row-vector and column-vector conventions mid-derivation.',
          'Forgetting to average gradients over the batch.',
          'Using too large or too small an epsilon for numerical checks.'
        ],
        interviewPrompts: [
          'Walk through backpropagation for one dense layer with sigmoid activation.',
          'How do you know a hand-coded gradient is correct?',
          'What shape should dW have if X is batch-by-features and W is features-by-hidden?'
        ],
        exercises: [
          {
            id: 'manual-two-layer-backward',
            title: 'Backpropagate through a tiny network',
            difficulty: 'advanced',
            type: 'coding',
            description:
              'Implement one forward/backward step for a two-layer ReLU network with mean squared error.',
            starterCode: [
              'import numpy as np',
              '',
              'rng = np.random.default_rng(5)',
              'X = rng.normal(size=(6, 3))',
              'y = rng.normal(size=(6, 1))',
              'W1 = rng.normal(scale=0.2, size=(3, 4))',
              'b1 = np.zeros((1, 4))',
              'W2 = rng.normal(scale=0.2, size=(4, 1))',
              'b2 = np.zeros((1, 1))',
              '',
              'def relu(z):',
              '    return np.maximum(0, z)',
              '',
              '# TODO: compute z1, h, pred, loss.',
              '# TODO: compute dW2, db2, dW1, db1 for MSE loss.',
              'loss = None',
              '',
              'if loss is None:',
              '    print("TODO: implement forward and backward pass")',
              'else:',
              '    print("loss", round(float(loss), 6))',
              '    print("gradient shapes", dW1.shape, db1.shape, dW2.shape, db2.shape)'
            ].join('\n'),
            solution: [
              'import numpy as np',
              '',
              'rng = np.random.default_rng(5)',
              'X = rng.normal(size=(6, 3))',
              'y = rng.normal(size=(6, 1))',
              'W1 = rng.normal(scale=0.2, size=(3, 4))',
              'b1 = np.zeros((1, 4))',
              'W2 = rng.normal(scale=0.2, size=(4, 1))',
              'b2 = np.zeros((1, 1))',
              '',
              'def relu(z):',
              '    return np.maximum(0, z)',
              '',
              'z1 = X @ W1 + b1',
              'h = relu(z1)',
              'pred = h @ W2 + b2',
              'loss = np.mean((pred - y) ** 2)',
              '',
              'm = X.shape[0]',
              'dpred = 2 * (pred - y) / m',
              'dW2 = h.T @ dpred',
              'db2 = dpred.sum(axis=0, keepdims=True)',
              'dh = dpred @ W2.T',
              'dz1 = dh * (z1 > 0)',
              'dW1 = X.T @ dz1',
              'db1 = dz1.sum(axis=0, keepdims=True)',
              '',
              'print("loss", round(float(loss), 6))',
              'print("gradient shapes", dW1.shape, db1.shape, dW2.shape, db2.shape)'
            ].join('\n'),
            hints: [
              'For mean squared error, dloss/dpred = 2 * (pred - y) / batch_size.',
              'The ReLU derivative is z1 > 0.',
              'dW2 is h.T @ dpred and dW1 is X.T @ dz1.'
            ],
            expectedOutput:
              'A numeric loss and gradient shapes (3, 4), (1, 4), (4, 1), (1, 1).'
          },
          {
            id: 'finite-difference-gradient-check',
            title: 'Check a gradient numerically',
            difficulty: 'intermediate',
            type: 'coding',
            description:
              'Verify the analytic gradient of a small linear regression loss with finite differences.',
            starterCode: [
              'import numpy as np',
              '',
              'rng = np.random.default_rng(9)',
              'X = rng.normal(size=(8, 2))',
              'y = rng.normal(size=(8, 1))',
              'W = rng.normal(size=(2, 1))',
              'eps = 1e-5',
              '',
              'def loss_fn(W):',
              '    pred = X @ W',
              '    return np.mean((pred - y) ** 2)',
              '',
              '# TODO: compute analytic_grad for W.',
              '# TODO: compute numeric_grad by perturbing each W element by +/- eps.',
              'analytic_grad = None',
              'numeric_grad = None',
              '',
              'if analytic_grad is None or numeric_grad is None:',
              '    print("TODO: compute analytic and numeric gradients")',
              'else:',
              '    print("max error", np.max(np.abs(analytic_grad - numeric_grad)))'
            ].join('\n'),
            solution: [
              'import numpy as np',
              '',
              'rng = np.random.default_rng(9)',
              'X = rng.normal(size=(8, 2))',
              'y = rng.normal(size=(8, 1))',
              'W = rng.normal(size=(2, 1))',
              'eps = 1e-5',
              '',
              'def loss_fn(W):',
              '    pred = X @ W',
              '    return np.mean((pred - y) ** 2)',
              '',
              'pred = X @ W',
              'analytic_grad = X.T @ (2 * (pred - y) / len(X))',
              'numeric_grad = np.zeros_like(W)',
              '',
              'for i in range(W.shape[0]):',
              '    for j in range(W.shape[1]):',
              '        W_plus = W.copy()',
              '        W_minus = W.copy()',
              '        W_plus[i, j] += eps',
              '        W_minus[i, j] -= eps',
              '        numeric_grad[i, j] = (loss_fn(W_plus) - loss_fn(W_minus)) / (2 * eps)',
              '',
              'print("analytic", analytic_grad.ravel().round(6))',
              'print("numeric ", numeric_grad.ravel().round(6))',
              'print("max error", np.max(np.abs(analytic_grad - numeric_grad)))'
            ].join('\n'),
            hints: [
              'Central difference is more accurate than a one-sided difference.',
              'Perturb one parameter at a time while keeping the others fixed.',
              'For MSE linear regression, gradient is X.T @ (2 * error / n).'
            ],
            expectedOutput:
              'Analytic and numeric gradients that match closely, with max error near 1e-10 to 1e-8.'
          },
          {
            id: 'gradient-debugging-design',
            title: 'Design a gradient debugging checklist',
            difficulty: 'intermediate',
            type: 'design',
            description:
              'Create a debugging checklist for a from-scratch network whose loss becomes NaN after several iterations.',
            promptQuestions: [
              'Which tensor statistics would you print first?',
              'How would you separate data-scale problems from learning-rate problems?',
              'When would gradient checking help?',
              'What numerical-stability changes would you try?'
            ]
          }
        ],
        diagram: null,
        related: ['perceptron-and-mlp-numpy', 'cnn-building-blocks-numpy']
      },
      {
        slug: 'cnn-building-blocks-numpy',
        title: 'CNN building blocks with NumPy',
        summary:
          'Implement simple 2D convolution and max pooling on small arrays, then compare hand-crafted image features with an sklearn MLP on synthetic image data.',
        duration: '45-60 min',
        whyItMatters:
          'CNNs are easier to understand when you can see filters sliding over arrays. Convolution, pooling, and flattening are just structured NumPy operations before they become deep-learning layers.',
        sections: [
          {
            heading: 'Convolution detects local patterns',
            body:
              'A convolution filter slides over an image and computes weighted sums over local neighborhoods. Different kernels detect edges, blobs, or other small patterns.',
            bullets: [
              'Kernel size controls local receptive field.',
              'Stride controls how far the filter moves each step.',
              'Padding controls whether output keeps the original spatial size.'
            ],
            codeExample: {
              title: 'Apply a vertical edge filter',
              language: 'python',
              code: [
                'import numpy as np',
                '',
                'image = np.array([',
                '    [0, 0, 1, 1],',
                '    [0, 0, 1, 1],',
                '    [0, 0, 1, 1],',
                '    [0, 0, 1, 1]',
                '], dtype=float)',
                'kernel = np.array([[-1, 1], [-1, 1]], dtype=float)',
                '',
                'out = np.zeros((3, 3))',
                'for r in range(3):',
                '    for c in range(3):',
                '        patch = image[r:r+2, c:c+2]',
                '        out[r, c] = np.sum(patch * kernel)',
                'print(out)'
              ].join('\n')
            }
          },
          {
            heading: 'Pooling summarizes local neighborhoods',
            body:
              'Max pooling keeps the strongest local activation and reduces spatial size. It adds small translation tolerance and lowers computation.',
            bullets: [
              'Pooling discards exact location detail.',
              'Stride usually equals pool size in simple examples.',
              'Average pooling preserves broader intensity, while max pooling highlights strongest responses.'
            ]
          },
          {
            heading: 'From arrays to classifiers',
            body:
              'After convolution and pooling, a model often flattens features and feeds them into dense layers. In the browser, sklearn MLPClassifier can demonstrate this idea on tiny synthetic images.',
            bullets: [
              'Synthetic image tasks keep runtime small and deterministic.',
              'Flattened pixels are a useful baseline before hand-crafted filters.',
              'A real CNN learns filters; this lab implements the operations explicitly.'
            ]
          }
        ],
        checklist: [
          'Can implement valid 2D convolution over a single-channel image.',
          'Can implement max pooling with a fixed window and stride.',
          'Can explain how convolutional features become classifier inputs.'
        ],
        pitfalls: [
          'Mixing up output height/width calculations.',
          'Forgetting that convolution kernels and image patches must have matching shapes.',
          'Assuming pooling improves every task instead of checking lost detail.'
        ],
        interviewPrompts: [
          'What does a convolution filter compute at one output location?',
          'Why does max pooling provide some translation tolerance?',
          'How would you test a hand-written convolution implementation?'
        ],
        exercises: [
          {
            id: 'simple-conv2d-numpy',
            title: 'Implement valid 2D convolution',
            difficulty: 'intermediate',
            type: 'coding',
            description:
              'Write a NumPy function that applies one 2D kernel to one 2D image without padding.',
            starterCode: [
              'import numpy as np',
              '',
              'def conv2d_valid(image, kernel):',
              '    # TODO: compute output height and width.',
              '    # TODO: slide the kernel over the image and sum patch * kernel.',
              '    return None',
              '',
              'image = np.array([',
              '    [1, 1, 0, 0],',
              '    [1, 1, 0, 0],',
              '    [0, 0, 1, 1],',
              '    [0, 0, 1, 1]',
              '], dtype=float)',
              'kernel = np.array([[1, -1], [1, -1]], dtype=float)',
              'out = conv2d_valid(image, kernel)',
              '',
              'if out is None:',
              '    print("TODO: implement conv2d_valid")',
              'else:',
              '    print(out)'
            ].join('\n'),
            solution: [
              'import numpy as np',
              '',
              'def conv2d_valid(image, kernel):',
              '    image_h, image_w = image.shape',
              '    kernel_h, kernel_w = kernel.shape',
              '    out_h = image_h - kernel_h + 1',
              '    out_w = image_w - kernel_w + 1',
              '    out = np.zeros((out_h, out_w))',
              '    for r in range(out_h):',
              '        for c in range(out_w):',
              '            patch = image[r:r + kernel_h, c:c + kernel_w]',
              '            out[r, c] = np.sum(patch * kernel)',
              '    return out',
              '',
              'image = np.array([',
              '    [1, 1, 0, 0],',
              '    [1, 1, 0, 0],',
              '    [0, 0, 1, 1],',
              '    [0, 0, 1, 1]',
              '], dtype=float)',
              'kernel = np.array([[1, -1], [1, -1]], dtype=float)',
              'out = conv2d_valid(image, kernel)',
              'print(out)'
            ].join('\n'),
            hints: [
              'For valid convolution, out_h = image_h - kernel_h + 1.',
              'Each output cell is np.sum(image_patch * kernel).',
              'Start with nested loops before trying im2col vectorization.'
            ],
            expectedOutput:
              'A 3x3 array of filter responses, with strong values where the kernel aligns with an edge.'
          },
          {
            id: 'maxpool-and-tiny-image-classifier',
            title: 'Pool tiny images and classify bar patterns',
            difficulty: 'advanced',
            type: 'coding',
            description:
              'Implement max pooling, generate tiny vertical/horizontal bar images, and compare an sklearn MLPClassifier on flattened pixels.',
            starterCode: [
              'import numpy as np',
              'from sklearn.metrics import accuracy_score',
              'from sklearn.model_selection import train_test_split',
              'from sklearn.neural_network import MLPClassifier',
              '',
              'def max_pool2d(image, size=2, stride=2):',
              '    # TODO: compute pooled output by taking max over each window.',
              '    return None',
              '',
              'def make_bar_images(n=120, size=8, seed=2):',
              '    rng = np.random.default_rng(seed)',
              '    images = []',
              '    labels = []',
              '    for i in range(n):',
              '        img = rng.normal(0, 0.05, size=(size, size))',
              '        if i % 2 == 0:',
              '            img[:, 3:5] += 1.0',
              '            labels.append(0)',
              '        else:',
              '            img[3:5, :] += 1.0',
              '            labels.append(1)',
              '        images.append(img)',
              '    return np.array(images), np.array(labels)',
              '',
              'images, y = make_bar_images()',
              'pooled = max_pool2d(images[0])',
              '',
              'if pooled is None:',
              '    print("TODO: implement max_pool2d")',
              'else:',
              '    X = images.reshape(len(images), -1)',
              '    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.3, stratify=y, random_state=2)',
              '    clf = MLPClassifier(hidden_layer_sizes=(12,), max_iter=500, random_state=2)',
              '    clf.fit(X_train, y_train)',
              '    print("pooled shape", pooled.shape)',
              '    print("accuracy", round(accuracy_score(y_test, clf.predict(X_test)), 3))'
            ].join('\n'),
            solution: [
              'import numpy as np',
              'from sklearn.metrics import accuracy_score',
              'from sklearn.model_selection import train_test_split',
              'from sklearn.neural_network import MLPClassifier',
              '',
              'def max_pool2d(image, size=2, stride=2):',
              '    out_h = (image.shape[0] - size) // stride + 1',
              '    out_w = (image.shape[1] - size) // stride + 1',
              '    out = np.zeros((out_h, out_w))',
              '    for r in range(out_h):',
              '        for c in range(out_w):',
              '            patch = image[r * stride:r * stride + size, c * stride:c * stride + size]',
              '            out[r, c] = np.max(patch)',
              '    return out',
              '',
              'def make_bar_images(n=120, size=8, seed=2):',
              '    rng = np.random.default_rng(seed)',
              '    images = []',
              '    labels = []',
              '    for i in range(n):',
              '        img = rng.normal(0, 0.05, size=(size, size))',
              '        if i % 2 == 0:',
              '            img[:, 3:5] += 1.0',
              '            labels.append(0)',
              '        else:',
              '            img[3:5, :] += 1.0',
              '            labels.append(1)',
              '        images.append(img)',
              '    return np.array(images), np.array(labels)',
              '',
              'images, y = make_bar_images()',
              'pooled = max_pool2d(images[0])',
              'X = images.reshape(len(images), -1)',
              'X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.3, stratify=y, random_state=2)',
              'clf = MLPClassifier(hidden_layer_sizes=(12,), max_iter=500, random_state=2)',
              'clf.fit(X_train, y_train)',
              'print("pooled shape", pooled.shape)',
              'print("accuracy", round(accuracy_score(y_test, clf.predict(X_test)), 3))'
            ].join('\n'),
            hints: [
              'For an 8x8 image with size=2 and stride=2, pooled output is 4x4.',
              'Use image[r*stride:r*stride+size, c*stride:c*stride+size] for each patch.',
              'The synthetic task is easy, so a small MLP should reach high accuracy.'
            ],
            expectedOutput:
              'A pooled shape of (4, 4) and high classification accuracy on vertical versus horizontal bars.'
          },
          {
            id: 'cnn-block-design',
            title: 'Design a tiny CNN inspection plan',
            difficulty: 'beginner',
            type: 'design',
            description:
              'Describe how you would inspect whether early convolution filters learned useful edge or texture detectors.',
            promptQuestions: [
              'Which filters or activations would you visualize?',
              'How would pooling change spatial detail?',
              'What synthetic input would reveal whether a filter detects edges?',
              'What failure modes would suggest the model is memorizing noise?'
            ]
          }
        ],
        diagram: null,
        related: ['perceptron-and-mlp-numpy', 'backpropagation-by-hand']
      }
    ]
  }
];
