/**
 * Interactive AI/ML learning expansion modules.
 *
 * Lessons are written to teach the core concepts directly on the page, with
 * runnable Pyodide-safe exercises that use NumPy, scikit-learn, and matplotlib.
 */
const code = (lines) => lines.join('\n');

export const rawAiLearningModules = [
  {
    slug: 'ml-interactive-lab',
    title: 'Interactive machine learning lab',
    summary:
      'Hands-on classical ML lessons for feature engineering, supervised model comparison, and unsupervised structure discovery with scikit-learn.',
    objectives: [
      'Build preprocessing pipelines that prevent train/test leakage',
      'Compare supervised models with validation splits, cross-validation, and task-appropriate metrics',
      'Use clustering and dimensionality reduction to explore unlabeled data without overclaiming what the patterns mean'
    ],
    lessons: [
      {
        slug: 'feature-engineering-playground',
        title: 'Feature engineering playground',
        summary:
          'Scaling, encoding, missing-value handling, and scikit-learn Pipelines for tabular machine learning workflows.',
        duration: '55-70 min',
        whyItMatters:
          'Feature engineering is where many tabular ML systems win or lose. Good transformations make signal visible to the estimator, and pipelines make those transformations reproducible, testable, and safe from leakage.',
        sections: [
          {
            heading: 'Raw values become model coordinates',
            body:
              'A model does not see "income", "city", or "plan tier" the way a person does. It sees coordinates. Feature engineering chooses those coordinates so the model can compare examples fairly. Suppose one customer has age 20 and annual spend 100, while another has age 60 and spend 110. In raw Euclidean distance, the age gap contributes 40 and spend contributes 10, so age dominates. If spend is recorded in cents instead, the same spend gap contributes 1000 and now spend dominates. The relationship did not change; the coordinate system did. Standardization fixes this by subtracting the training mean and dividing by the training standard deviation. For values [10, 20, 30], the mean is 20 and the population standard deviation is about 8.16, so 10 becomes -1.225, 20 becomes 0, and 30 becomes 1.225. The model now reads "one and a quarter standard deviations below average" instead of "10 units".',
            bullets: [
              'Scale numeric features when distances, dot products, or regularization strength matter.',
              'Keep transformations interpretable enough that you can debug changed predictions.',
              'Fit every learned transformation on training data only, because means, medians, and category vocabularies are data-derived parameters.'
            ],
            codeExample: {
              title: 'See scaling change distances',
              language: 'python',
              code: code([
                'import numpy as np',
                'from sklearn.preprocessing import StandardScaler',
                '',
                'X = np.array([',
                '    [20.0, 100.0],',
                '    [60.0, 110.0],',
                '    [40.0, 10000.0]',
                '])',
                '',
                'raw_distance = np.linalg.norm(X[0] - X[1])',
                'scaled = StandardScaler().fit_transform(X)',
                'scaled_distance = np.linalg.norm(scaled[0] - scaled[1])',
                '',
                'print("raw distance between customer 0 and 1:", round(raw_distance, 3))',
                'print("scaled coordinates:\\n", scaled.round(3))',
                'print("scaled distance between customer 0 and 1:", round(scaled_distance, 3))'
              ])
            }
          },
          {
            heading: 'Scaling changes algorithms in different ways',
            body:
              'Scaling is not a cosmetic step. K-nearest neighbors, KMeans, SVMs with RBF kernels, PCA, and gradient-based linear models all use geometry. If feature A ranges from 0 to 1 and feature B ranges from 0 to 10,000, squared distance is almost entirely feature B. A KNN classifier may call two users similar because their salaries are close while ignoring a highly predictive binary feature. Logistic regression also changes because L2 regularization penalizes coefficients by size; an unscaled feature with large units can use a tiny coefficient to create a large prediction shift, while a small-range feature needs a large coefficient and gets penalized more. Trees are less sensitive because they split one feature at a time, but they still need sane missing-value handling and categorical treatment.',
            bullets: [
              'Distance-based models are usually the most sensitive to feature scale.',
              'Regularized linear models need scale so the penalty treats features comparably.',
              'Tree ensembles do not need standardization for split geometry, but pipelines still help keep preprocessing consistent.'
            ]
          },
          {
            heading: 'Encoding categories without inventing fake order',
            body:
              'Categorical variables carry identity, not magnitude. If plan is free, pro, or team, encoding them as 0, 1, and 2 tells a linear model that team is twice pro and that pro sits halfway between free and team. That is usually false. One-hot encoding creates separate indicator columns, such as plan_free, plan_pro, and plan_team. A row with plan=pro becomes [0, 1, 0], so the model can learn an independent adjustment for pro. The tradeoff is dimensionality. A country feature with 200 values creates 200 columns; a user-id feature with one million values is usually a memorization trap. For high-cardinality categories, interview-level answers should mention target leakage risk, hashing, learned embeddings, frequency thresholds, or replacing the category with stable aggregate features computed from past data only.',
            bullets: [
              'Use one-hot encoding for unordered categories with manageable cardinality.',
              'Use handle_unknown="ignore" so production categories unseen in training do not crash inference.',
              'Be suspicious of identifiers and rare categories because they can memorize examples instead of learning reusable patterns.'
            ],
            codeExample: {
              title: 'Mixed numeric and categorical preprocessing',
              language: 'python',
              code: code([
                'import numpy as np',
                'from sklearn.compose import ColumnTransformer',
                'from sklearn.impute import SimpleImputer',
                'from sklearn.pipeline import Pipeline',
                'from sklearn.preprocessing import OneHotEncoder, StandardScaler',
                '',
                'X = np.array([',
                '    [22.0, 35.0, "NYC", "free"],',
                '    [41.0, 88.0, "SF", "pro"],',
                '    [np.nan, 76.0, "NYC", "pro"],',
                '    [55.0, np.nan, "LA", "team"]',
                '], dtype=object)',
                '',
                'numeric_pipe = Pipeline([("impute", SimpleImputer(strategy="median")), ("scale", StandardScaler())])',
                'categorical_pipe = Pipeline([("impute", SimpleImputer(strategy="most_frequent")), ("onehot", OneHotEncoder(handle_unknown="ignore", sparse_output=False))])',
                'preprocess = ColumnTransformer([("num", numeric_pipe, [0, 1]), ("cat", categorical_pipe, [2, 3])])',
                '',
                'Xt = preprocess.fit_transform(X)',
                'print("transformed shape:", Xt.shape)',
                'print("first row:", Xt[0].round(3))'
              ])
            }
          },
          {
            heading: 'Missing values are information and risk',
            body:
              'Missing data is not just an inconvenience. A missing income value might mean a user skipped a form field, a sensor failed, or the value is unavailable for a specific customer segment. Simple imputation replaces missing numeric values with a mean or median and categorical values with the most frequent category. That is often a strong baseline, but it can erase signal. A concrete example: if loan applicants with missing income default 30 percent of the time and applicants with reported income default 5 percent of the time, the missingness itself is predictive. You might add a binary missing_income indicator while also imputing the numeric column. The failure mode is leakage: if you compute the median using the full dataset before splitting, validation data influences training. That can move a median from 70 to 75 and quietly improve validation scores in a way that will not hold up later.',
            bullets: [
              'Ask why values are missing: random measurement error, user choice, system failure, or label-dependent process.',
              'Consider missingness indicator features when absence carries signal.',
              'Learn imputation values inside the training fold, never on the whole dataset.'
            ]
          },
          {
            heading: 'Pipelines make the split honest',
            body:
              'A train/validation/test split is a contract. Training data chooses parameters, validation data chooses modeling decisions, and the test set gives one final estimate after those decisions are frozen. Preprocessing parameters count as parameters. In 5-fold cross-validation, a pipeline refits the scaler, imputer, and encoder five times, once per training fold. Without the pipeline, it is easy to fit preprocessing once on all rows and then cross-validate only the estimator. That leaks validation fold distribution into training. The leak can be subtle: standardizing with the full dataset might use a mean of 50, while a training fold mean is 46. A borderline validation point at 48 shifts from -0.2 to +0.1 standard deviations depending on which mean is used, and a linear decision boundary can flip.',
            bullets: [
              'Use Pipeline so every cross-validation fold gets fresh fitted transformers.',
              'Use ColumnTransformer to keep numeric and categorical transformations explicit.',
              'Treat feature engineering choices as hyperparameters that belong in validation, not after test-set inspection.'
            ],
            codeExample: {
              title: 'Leakage-safe pipeline evaluation',
              language: 'python',
              code: code([
                'import numpy as np',
                'from sklearn.compose import ColumnTransformer',
                'from sklearn.impute import SimpleImputer',
                'from sklearn.linear_model import LogisticRegression',
                'from sklearn.model_selection import StratifiedKFold, cross_val_score',
                'from sklearn.pipeline import Pipeline',
                'from sklearn.preprocessing import OneHotEncoder, StandardScaler',
                '',
                'X = np.array([',
                '    [22, 35, "NYC", "free"], [25, 42, "LA", "free"],',
                '    [47, 88, "SF", "pro"], [38, 76, "NYC", "pro"],',
                '    [52, 110, "SF", "team"], [46, 90, "LA", "pro"],',
                '    [56, 120, "SF", "team"], [55, 95, "NYC", "team"],',
                '    [60, 130, "SF", "team"], [28, 48, "LA", "free"],',
                '    [30, 52, "NYC", "pro"], [42, 80, "LA", "pro"]',
                '], dtype=object)',
                'y = np.array([0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1])',
                '',
                'preprocess = ColumnTransformer([',
                '    ("num", Pipeline([("impute", SimpleImputer(strategy="median")), ("scale", StandardScaler())]), [0, 1]),',
                '    ("cat", OneHotEncoder(handle_unknown="ignore"), [2, 3])',
                '])',
                'model = Pipeline([("preprocess", preprocess), ("clf", LogisticRegression(max_iter=1000))])',
                'cv = StratifiedKFold(n_splits=3, shuffle=True, random_state=4)',
                'scores = cross_val_score(model, X, y, cv=cv, scoring="accuracy")',
                'print("fold accuracy:", scores.round(3))',
                'print("mean accuracy:", round(scores.mean(), 3))'
              ])
            }
          },
          {
            heading: 'Evaluate features by generalization, not cleverness',
            body:
              'A feature is useful only if it improves validation performance for the metric that matters. More columns can reduce training error while increasing validation error, especially with small datasets. Imagine a churn model with 500 rows and 2,000 one-hot columns from device IDs. The model may assign a strong coefficient to devices seen once in churned rows and report 99 percent training accuracy, but validation accuracy may fall below a simple baseline because the device IDs do not repeat. Watch both metric movement and operational cost: latency, memory, explainability, and monitoring. Feature drift is also a production failure mode. If the average transaction_count_7d was 8 during training and becomes 2 after a product launch, a model that leaned heavily on that feature may become badly calibrated.',
            bullets: [
              'Compare feature sets with the same split or the same cross-validation folds.',
              'Track train and validation metrics together to catch overfitting.',
              'Monitor feature distributions in production because preprocessing can keep running while meaning changes.'
            ]
          }
        ],
        checklist: [
          'Can explain how scaling changes distance, regularization, and PCA geometry.',
          'Can choose one-hot encoding for unordered categories and explain high-cardinality risks.',
          'Can build a ColumnTransformer and Pipeline that keeps imputation, encoding, scaling, and modeling inside cross-validation.',
          'Can describe train/validation/test responsibilities for feature decisions.',
          'Can identify leakage from fitting preprocessors before splitting.'
        ],
        pitfalls: [
          'Fitting scalers, imputers, or encoders before splitting the data.',
          'Using ordinal integers for unordered categories without a model-specific reason.',
          'Adding high-cardinality IDs that memorize rows instead of generalizing.',
          'Comparing feature sets on different random splits and treating noise as progress.',
          'Ignoring production feature drift because offline validation looked strong.'
        ],
        interviewPrompts: [
          'How would you prevent preprocessing leakage in a tabular ML project?',
          'When does one-hot encoding become problematic, and what alternatives would you consider?',
          'Why might a KNN model change dramatically after scaling?',
          'How would you decide whether a missing-value indicator belongs in the feature set?',
          'What train/validation/test workflow would you use when iterating on features?'
        ],
        exercises: [
          {
            id: 'mixed-column-pipeline',
            title: 'Build a mixed-column sklearn Pipeline',
            difficulty: 'beginner',
            type: 'coding',
            description:
              'Create a complete preprocessing and classification pipeline for a tiny customer dataset with numeric, categorical, and missing values.',
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
              '    [22, 35, "NYC", "free"], [25, 42, "LA", "free"],',
              '    [47, 88, "SF", "pro"], [np.nan, 76, "NYC", "pro"],',
              '    [52, 110, "SF", "team"], [46, np.nan, "LA", "pro"],',
              '    [56, 120, "SF", "team"], [55, 95, "NYC", "team"],',
              '    [60, 130, "SF", "team"], [28, 48, "LA", "free"],',
              '    [30, 52, "NYC", "pro"], [42, 80, "LA", "pro"]',
              '], dtype=object)',
              'y = np.array([0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1])',
              '',
              '# TODO: build numeric and categorical preprocessing pipelines.',
              '# TODO: combine them with ColumnTransformer.',
              '# TODO: wrap preprocessing and LogisticRegression(max_iter=1000) in one Pipeline.',
              'pipeline = None',
              '',
              'if pipeline is None:',
              '    print("TODO: build and evaluate the pipeline")',
              'else:',
              '    cv = StratifiedKFold(n_splits=3, shuffle=True, random_state=4)',
              '    scores = cross_val_score(pipeline, X, y, cv=cv, scoring="accuracy")',
              '    print("CV accuracy:", scores.round(3), "mean=", round(scores.mean(), 3))'
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
              '    [22, 35, "NYC", "free"], [25, 42, "LA", "free"],',
              '    [47, 88, "SF", "pro"], [np.nan, 76, "NYC", "pro"],',
              '    [52, 110, "SF", "team"], [46, np.nan, "LA", "pro"],',
              '    [56, 120, "SF", "team"], [55, 95, "NYC", "team"],',
              '    [60, 130, "SF", "team"], [28, 48, "LA", "free"],',
              '    [30, 52, "NYC", "pro"], [42, 80, "LA", "pro"]',
              '], dtype=object)',
              'y = np.array([0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1])',
              '',
              'numeric = Pipeline([("imputer", SimpleImputer(strategy="median")), ("scaler", StandardScaler())])',
              'categorical = Pipeline([("imputer", SimpleImputer(strategy="most_frequent")), ("encoder", OneHotEncoder(handle_unknown="ignore"))])',
              'preprocess = ColumnTransformer([("num", numeric, [0, 1]), ("cat", categorical, [2, 3])])',
              'pipeline = Pipeline([("preprocess", preprocess), ("model", LogisticRegression(max_iter=1000))])',
              '',
              'cv = StratifiedKFold(n_splits=3, shuffle=True, random_state=4)',
              'scores = cross_val_score(pipeline, X, y, cv=cv, scoring="accuracy")',
              'print("CV accuracy:", scores.round(3), "mean=", round(scores.mean(), 3))'
            ]),
            hints: [
              'Use SimpleImputer(strategy="median") and StandardScaler for columns 0 and 1.',
              'Use OneHotEncoder(handle_unknown="ignore") for columns 2 and 3.',
              'The estimator should be inside the Pipeline before calling cross_val_score.'
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
            starterCode: code([
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
              '# TODO: define raw KNN and scaled KNN models.',
              '# TODO: evaluate both with 5-fold accuracy.',
              'models = {}',
              '',
              'if not models:',
              '    print("TODO: add raw_knn and scaled_knn to models")',
              'for name, model in models.items():',
              '    scores = cross_val_score(model, X, y, cv=5, scoring="accuracy")',
              '    print(f"{name}: mean={scores.mean():.3f} std={scores.std():.3f}")'
            ]),
            solution: code([
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
              '    "scaled_knn": Pipeline([("scale", StandardScaler()), ("knn", KNeighborsClassifier(n_neighbors=5))])',
              '}',
              '',
              'for name, model in models.items():',
              '    scores = cross_val_score(model, X, y, cv=5, scoring="accuracy")',
              '    print(f"{name}: mean={scores.mean():.3f} std={scores.std():.3f}")'
            ]),
            hints: [
              'KNN uses distances, so large-range features dominate unless scaled.',
              'Use Pipeline so scaling is fit separately inside each CV fold.',
              'Compare mean accuracy and variability, not just one lucky split.'
            ],
            expectedOutput:
              'Two accuracy summaries, usually with scaled_knn outperforming raw_knn on the distorted feature ranges.'
          },
          {
            id: 'feature-workflow-design',
            title: 'Design a leakage-safe feature workflow',
            difficulty: 'intermediate',
            type: 'design',
            description:
              'Sketch how offline training features and online serving features stay consistent for a churn model.',
            promptQuestions: [
              'Which transformations must be shared between training and serving?',
              'How do you version feature definitions and fitted preprocessing parameters?',
              'Where can label leakage enter the workflow?',
              'What monitoring would detect feature drift or missingness drift?'
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
          'Train and compare classifiers using train/validation/test splits, cross-validation, metrics, threshold tuning, and overfitting checks.',
        duration: '60-75 min',
        whyItMatters:
          'Production ML work depends on choosing a reliable baseline, measuring it honestly, and improving it with evidence rather than model hype.',
        sections: [
          {
            heading: 'Supervised learning maps examples to labels',
            body:
              'In supervised learning, each training row has features X and a known target y. Classification predicts categories such as fraud or not fraud; regression predicts numbers such as delivery time. The core loop is simple: fit a function on labeled examples, then estimate how well it works on unseen examples. A tiny numeric classifier might compute score = 0.04 * income - 1.2 * missed_payments - 1.0. If a user has income=80 and missed_payments=1, score = 3.2 - 1.2 - 1.0 = 1.0, and sigmoid(1.0) is 0.731. With a 0.5 threshold the prediction is positive. The important lesson is that the threshold is not the model; the model gives a score, and the product chooses how much score is enough to act.',
            bullets: [
              'Classification usually returns scores or probabilities before hard labels.',
              'Regression metrics measure distance from the true number; classification metrics count or rank mistakes.',
              'A good workflow separates model fitting from decision threshold selection.'
            ]
          },
          {
            heading: 'Train, validation, and test have separate jobs',
            body:
              'A clean split prevents self-deception. Training data fits parameters such as coefficients and tree splits. Validation data chooses model family, regularization strength, features, and threshold. The test set is held until the end and estimates final performance once choices are frozen. For example, with 10,000 rows you might use 7,000 train, 1,500 validation, and 1,500 test. If logistic regression gets validation AUC 0.82 and random forest gets 0.86, you may choose the forest. If you then try ten forest depths and pick depth 8 because it gets validation AUC 0.88, the validation set has now influenced many decisions. The test set should answer: after all that tuning, what performance should we expect on future data?',
            bullets: [
              'Use stratified splits for classification so class ratios are stable.',
              'Use temporal splits when the deployment problem predicts the future from the past.',
              'Never tune thresholds, hyperparameters, or feature choices on the final test set.'
            ]
          },
          {
            heading: 'Baselines keep progress honest',
            body:
              'Before comparing complex models, build a simple baseline. A dummy classifier that predicts the majority class might get 95 percent accuracy on a dataset with 95 percent negatives. That sounds strong until recall for the rare positive class is 0. Logistic regression with scaling is often a good first real model because it is fast, calibrated enough for threshold experiments, and inspectable. Tree ensembles are strong when interactions and non-linear thresholds matter. The baseline question in an interview is not "which model is best"; it is "what evidence would convince you to move from simple to complex?" If a random forest improves validation AUC from 0.78 to 0.80 but doubles latency and is harder to explain, the simpler model may still be the better product choice.',
            bullets: [
              'Compare against a dummy or business-rule baseline.',
              'Prefer simple models until validation evidence justifies complexity.',
              'Report uncertainty across folds or repeated splits, not one number alone.'
            ],
            codeExample: {
              title: 'Compare supervised baselines with cross-validation',
              language: 'python',
              code: code([
                'from sklearn.datasets import load_breast_cancer',
                'from sklearn.dummy import DummyClassifier',
                'from sklearn.ensemble import RandomForestClassifier',
                'from sklearn.linear_model import LogisticRegression',
                'from sklearn.model_selection import StratifiedKFold, cross_val_score',
                'from sklearn.pipeline import Pipeline',
                'from sklearn.preprocessing import StandardScaler',
                '',
                'X, y = load_breast_cancer(return_X_y=True)',
                'cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)',
                'models = {',
                '    "dummy": DummyClassifier(strategy="most_frequent"),',
                '    "logreg": Pipeline([("scale", StandardScaler()), ("model", LogisticRegression(max_iter=1000))]),',
                '    "forest": RandomForestClassifier(n_estimators=120, max_depth=5, random_state=42)',
                '}',
                '',
                'for name, model in models.items():',
                '    scores = cross_val_score(model, X, y, cv=cv, scoring="roc_auc")',
                '    print(f"{name}: auc={scores.mean():.3f} +/- {scores.std():.3f}")'
              ])
            }
          },
          {
            heading: 'Metrics encode the cost of mistakes',
            body:
              'Accuracy is often too blunt. Consider 100 examples with 10 actual positives. A model predicts 8 positives: 6 are true positives and 2 are false positives. It misses 4 positives and correctly rejects 88 negatives. Accuracy is (6 + 88) / 100 = 94 percent. Precision is 6 / (6 + 2) = 75 percent: when the model says positive, it is right three quarters of the time. Recall is 6 / (6 + 4) = 60 percent: it catches six out of ten positives. If positives are fraudulent payments, recall may matter because missed fraud is expensive. If positives trigger account suspension, precision may matter because false positives harm users. ROC-AUC measures ranking across thresholds; PR-AUC is often more informative when positives are rare.',
            bullets: [
              'Precision answers: of predicted positives, how many were correct?',
              'Recall answers: of actual positives, how many were found?',
              'AUC metrics evaluate ranking; thresholded metrics evaluate a chosen operating point.'
            ],
            codeExample: {
              title: 'Compute confusion-derived metrics',
              language: 'python',
              code: code([
                'import numpy as np',
                'from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, confusion_matrix',
                '',
                'y_true = np.array([1] * 10 + [0] * 90)',
                'y_pred = np.array([1] * 6 + [0] * 4 + [1] * 2 + [0] * 88)',
                '',
                'print("confusion matrix:\\n", confusion_matrix(y_true, y_pred))',
                'print("accuracy:", round(accuracy_score(y_true, y_pred), 3))',
                'print("precision:", round(precision_score(y_true, y_pred), 3))',
                'print("recall:", round(recall_score(y_true, y_pred), 3))',
                'print("f1:", round(f1_score(y_true, y_pred), 3))'
              ])
            }
          },
          {
            heading: 'Overfitting is memorization that survives training metrics',
            body:
              'A model overfits when it captures noise or quirks of the training sample instead of reusable signal. A decision tree with unlimited depth can split until many leaves contain one row. Training accuracy may reach 100 percent, but validation accuracy drops because those tiny rules do not repeat. Underfitting is the opposite: a model is too simple or poorly trained, so both train and validation performance are weak. The diagnostic is the gap. If train AUC is 0.99 and validation AUC is 0.73, reduce capacity, add regularization, collect more data, remove leaky features, or use cross-validation to check stability. If both are 0.62, inspect features, labels, and whether the problem is learnable before tuning hyperparameters.',
            bullets: [
              'High train performance with much lower validation performance indicates overfitting.',
              'Low train and validation performance indicates underfitting, weak features, or noisy labels.',
              'Cross-validation reduces split luck but does not fix temporal leakage or deployment mismatch.'
            ]
          },
          {
            heading: 'Thresholds are product and operations decisions',
            body:
              'Many classifiers output a score between 0 and 1. The default threshold 0.5 is rarely sacred. If a support team can manually review only 100 alerts per day, the threshold may be chosen so the model emits about 100 positives. If a medical screening workflow values catching nearly every possible case, the threshold may be lowered to hit 98 percent recall, accepting more false positives. A numeric walkthrough: scores [0.95, 0.80, 0.55, 0.30] with labels [1, 0, 1, 0]. At threshold 0.5, predictions are [1, 1, 1, 0], precision is 2/3 and recall is 2/2. At threshold 0.85, predictions are [1, 0, 0, 0], precision is 1/1 and recall is 1/2. Neither is universally better; the cost model chooses.',
            bullets: [
              'Tune thresholds on validation data after the model is trained.',
              'Choose metrics that match false-positive and false-negative costs.',
              'Revisit thresholds when class balance, review capacity, or product policy changes.'
            ],
            codeExample: {
              title: 'Search thresholds for a recall goal',
              language: 'python',
              code: code([
                'import numpy as np',
                'from sklearn.datasets import make_classification',
                'from sklearn.linear_model import LogisticRegression',
                'from sklearn.metrics import precision_score, recall_score',
                'from sklearn.model_selection import train_test_split',
                'from sklearn.pipeline import Pipeline',
                'from sklearn.preprocessing import StandardScaler',
                '',
                'X, y = make_classification(n_samples=700, n_features=12, n_informative=5, weights=[0.82, 0.18], random_state=8)',
                'X_train, X_val, y_train, y_val = train_test_split(X, y, test_size=0.35, stratify=y, random_state=8)',
                'model = Pipeline([("scale", StandardScaler()), ("clf", LogisticRegression(max_iter=1000))])',
                'model.fit(X_train, y_train)',
                'scores = model.predict_proba(X_val)[:, 1]',
                '',
                'for threshold in [0.2, 0.4, 0.6, 0.8]:',
                '    pred = (scores >= threshold).astype(int)',
                '    print(threshold, "precision", round(precision_score(y_val, pred, zero_division=0), 3), "recall", round(recall_score(y_val, pred), 3))'
              ])
            }
          }
        ],
        checklist: [
          'Can explain train, validation, and test responsibilities.',
          'Can compare baselines, linear models, and tree models with stratified cross-validation.',
          'Can compute accuracy, precision, recall, F1, ROC-AUC, and explain when each is useful.',
          'Can diagnose overfitting from train/validation metric gaps.',
          'Can tune a decision threshold using validation data and a cost-aware metric.'
        ],
        pitfalls: [
          'Selecting the best model from one lucky split.',
          'Reporting accuracy on imbalanced data without class-specific metrics.',
          'Tuning threshold or hyperparameters on the final test set.',
          'Using random splits for temporal problems where future examples leak into training.',
          'Choosing a complex model without comparing latency, interpretability, and maintenance cost.'
        ],
        interviewPrompts: [
          'How would you choose between logistic regression and a random forest?',
          'What metric would you use for fraud detection and why?',
          'Why is cross-validation still not enough for temporal data?',
          'How do you explain precision and recall to a non-ML stakeholder?',
          'What signs tell you a model is overfitting?'
        ],
        exercises: [
          {
            id: 'classifier-cross-val-benchmark',
            title: 'Benchmark supervised classifiers',
            difficulty: 'beginner',
            type: 'coding',
            description:
              'Compare a dummy classifier, logistic regression, random forest, and gradient boosting on the breast cancer dataset using stratified cross-validation.',
            starterCode: code([
              'from sklearn.datasets import load_breast_cancer',
              'from sklearn.dummy import DummyClassifier',
              'from sklearn.ensemble import GradientBoostingClassifier, RandomForestClassifier',
              'from sklearn.linear_model import LogisticRegression',
              'from sklearn.model_selection import StratifiedKFold, cross_val_score',
              'from sklearn.pipeline import Pipeline',
              'from sklearn.preprocessing import StandardScaler',
              '',
              'X, y = load_breast_cancer(return_X_y=True)',
              'cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)',
              '',
              '# TODO: add dummy, logistic regression, random forest, and gradient boosting models.',
              '# Include scaling for LogisticRegression by using Pipeline.',
              'models = {}',
              '',
              'if not models:',
              '    print("TODO: add models before benchmarking")',
              'for name, model in models.items():',
              '    scores = cross_val_score(model, X, y, cv=cv, scoring="roc_auc")',
              '    print(f"{name}: auc={scores.mean():.3f} +/- {scores.std():.3f}")'
            ]),
            solution: code([
              'from sklearn.datasets import load_breast_cancer',
              'from sklearn.dummy import DummyClassifier',
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
              '    "dummy": DummyClassifier(strategy="most_frequent"),',
              '    "logistic_regression": Pipeline([("scale", StandardScaler()), ("model", LogisticRegression(max_iter=1000))]),',
              '    "random_forest": RandomForestClassifier(n_estimators=150, max_depth=5, random_state=42),',
              '    "gradient_boosting": GradientBoostingClassifier(random_state=42)',
              '}',
              '',
              'for name, model in models.items():',
              '    scores = cross_val_score(model, X, y, cv=cv, scoring="roc_auc")',
              '    print(f"{name}: auc={scores.mean():.3f} +/- {scores.std():.3f}")'
            ]),
            hints: [
              'Use StratifiedKFold for classification.',
              'LogisticRegression benefits from StandardScaler.',
              'The dummy baseline should show why a real model is needed.'
            ],
            expectedOutput:
              'Four ROC-AUC summaries, with real models far above the dummy baseline on the breast cancer dataset.'
          },
          {
            id: 'precision-recall-threshold',
            title: 'Tune a decision threshold',
            difficulty: 'intermediate',
            type: 'coding',
            description:
              'Train a logistic regression model and choose the threshold with the best precision while keeping validation recall at or above 90 percent.',
            starterCode: code([
              'import numpy as np',
              'from sklearn.datasets import make_classification',
              'from sklearn.linear_model import LogisticRegression',
              'from sklearn.metrics import precision_score, recall_score',
              'from sklearn.model_selection import train_test_split',
              'from sklearn.pipeline import Pipeline',
              'from sklearn.preprocessing import StandardScaler',
              '',
              'X, y = make_classification(n_samples=700, n_features=12, n_informative=5, weights=[0.82, 0.18], random_state=8)',
              'X_train, X_val, y_train, y_val = train_test_split(X, y, test_size=0.35, stratify=y, random_state=8)',
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
              '    print("threshold", round(best_threshold, 2), "precision", round(precision_score(y_val, pred, zero_division=0), 3), "recall", round(recall_score(y_val, pred), 3))'
            ]),
            solution: code([
              'import numpy as np',
              'from sklearn.datasets import make_classification',
              'from sklearn.linear_model import LogisticRegression',
              'from sklearn.metrics import precision_score, recall_score',
              'from sklearn.model_selection import train_test_split',
              'from sklearn.pipeline import Pipeline',
              'from sklearn.preprocessing import StandardScaler',
              '',
              'X, y = make_classification(n_samples=700, n_features=12, n_informative=5, weights=[0.82, 0.18], random_state=8)',
              'X_train, X_val, y_train, y_val = train_test_split(X, y, test_size=0.35, stratify=y, random_state=8)',
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
              'print("threshold", round(best_threshold, 2), "precision", round(precision_score(y_val, pred, zero_division=0), 3), "recall", round(recall_score(y_val, pred), 3))'
            ]),
            hints: [
              'Lower thresholds usually increase recall and reduce precision.',
              'Use predict_proba to get scores instead of hard class labels.',
              'zero_division=0 avoids warnings when no positives are predicted.'
            ],
            expectedOutput:
              'A selected threshold with validation recall at or above 0.90 and the corresponding precision.'
          },
          {
            id: 'supervised-evaluation-design',
            title: 'Design an evaluation plan for fraud review',
            difficulty: 'intermediate',
            type: 'design',
            description:
              'Propose a validation and monitoring plan for a fraud model whose alerts go to a limited human review team.',
            promptQuestions: [
              'What split strategy avoids future information leaking into training?',
              'Which metric controls review quality and which controls missed fraud?',
              'How would you choose a threshold if the team can review only 500 alerts per day?',
              'What production drift or calibration metrics should be watched?'
            ]
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
        duration: '60-75 min',
        whyItMatters:
          'Unsupervised learning helps you inspect structure before labels exist, compress high-dimensional data, and generate hypotheses for product or data-quality work.',
        sections: [
          {
            heading: 'Unsupervised learning finds structure, not truth',
            body:
              'Unsupervised methods receive X without labels y. They can group similar rows, compress features, detect unusual points, or create visualizations, but they do not know what the groups mean. If KMeans finds three clusters in customer behavior, those clusters are not automatically personas. They are geometric patterns under your chosen features and preprocessing. A numeric example makes this clear: points (0, 0), (0, 1), (10, 10), and (10, 11) naturally form two compact groups in raw coordinates. If you add a third feature with values [0, 1000, 0, 1000], distance becomes dominated by that third feature, and the grouping changes to pair rows by the new feature. The algorithm did not become wrong; the representation changed the question.',
            bullets: [
              'Use unsupervised results as hypotheses that need profiling and validation.',
              'Scale features before distance-based clustering or PCA when units differ.',
              'Do not turn cluster IDs into high-stakes decisions without domain review and monitoring.'
            ]
          },
          {
            heading: 'KMeans alternates assignment and centroid updates',
            body:
              'KMeans represents each cluster by its centroid, the average of assigned points. One iteration has two steps. First, assign each point to the nearest centroid. Second, recompute each centroid as the mean of the assigned points. Suppose centroids start at c0=(0, 0) and c1=(10, 10), and a point p=(1, 2). Its squared distance to c0 is 1^2 + 2^2 = 5. Its squared distance to c1 is 9^2 + 8^2 = 145, so p joins cluster 0. If cluster 0 gets points (0, 0), (1, 2), and (2, 1), the new centroid is ((0+1+2)/3, (0+2+1)/3) = (1, 1). The algorithm repeats until assignments stabilize or improvement becomes tiny.',
            bullets: [
              'The objective is low within-cluster squared distance, called inertia in scikit-learn.',
              'n_init runs multiple random starts because KMeans can settle in local minima.',
              'KMeans works best for compact, roughly spherical, similarly sized clusters.'
            ],
            codeExample: {
              title: 'Inspect KMeans inertia and silhouette',
              language: 'python',
              code: code([
                'from sklearn.cluster import KMeans',
                'from sklearn.datasets import make_blobs',
                'from sklearn.metrics import silhouette_score',
                '',
                'X, _ = make_blobs(n_samples=250, centers=3, cluster_std=0.8, random_state=4)',
                'model = KMeans(n_clusters=3, n_init=10, random_state=4)',
                'labels = model.fit_predict(X)',
                '',
                'print("centers:\\n", model.cluster_centers_.round(2))',
                'print("inertia:", round(model.inertia_, 2))',
                'print("silhouette:", round(silhouette_score(X, labels), 3))'
              ])
            }
          },
          {
            heading: 'Choosing k combines curves, scores, and usefulness',
            body:
              'Inertia always decreases as k increases because more centroids can sit closer to points. That means the lowest inertia alone chooses k=n, which is useless. The elbow method looks for a point where the marginal improvement slows. Silhouette score compares how close a point is to its own cluster versus the nearest other cluster. A silhouette near 1 is well separated, near 0 is ambiguous, and below 0 may be assigned poorly. If k=3 has silhouette 0.61 and k=4 has 0.62, the score does not settle the product decision. You still inspect cluster profiles: sizes, feature means, representative examples, stability across random seeds, and whether any downstream action changes.',
            bullets: [
              'Use inertia for compactness and silhouette for separation.',
              'Check cluster sizes; tiny clusters may be outliers or artifacts.',
              'Prefer the simplest k that produces stable, explainable, useful groups.'
            ],
            codeExample: {
              title: 'Plot k selection scores',
              language: 'python',
              code: code([
                'import matplotlib.pyplot as plt',
                'from sklearn.cluster import KMeans',
                'from sklearn.datasets import make_blobs',
                'from sklearn.metrics import silhouette_score',
                '',
                'X, _ = make_blobs(n_samples=300, centers=4, cluster_std=0.75, random_state=21)',
                'ks, inertias, silhouettes = [], [], []',
                'for k in range(2, 7):',
                '    model = KMeans(n_clusters=k, n_init=10, random_state=21)',
                '    labels = model.fit_predict(X)',
                '    ks.append(k)',
                '    inertias.append(model.inertia_)',
                '    silhouettes.append(silhouette_score(X, labels))',
                '    print(f"k={k}: inertia={model.inertia_:.1f} silhouette={silhouettes[-1]:.3f}")',
                '',
                'plt.figure(figsize=(6, 3))',
                'plt.plot(ks, silhouettes, marker="o")',
                'plt.xlabel("k")',
                'plt.ylabel("silhouette")',
                'plt.title("Choose k with separation, not inertia alone")',
                'plt.tight_layout()',
                'plt.show()'
              ])
            }
          },
          {
            heading: 'PCA rotates data toward maximum variance',
            body:
              'Principal component analysis finds new axes that capture as much variance as possible. In two dimensions, imagine centered points stretched along the line y=x. The first principal component points along that diagonal because moving on that axis explains most spread. A projection turns each point into its coordinate on the new axis. If a centered point is (2, 2) and the unit diagonal vector is (0.707, 0.707), the first PC score is 2*0.707 + 2*0.707 = 2.828. A point (2, -2) projects to 0 on that axis and mostly lives on the second component. PCA is linear and unsupervised: it preserves variance, not class separation or causality.',
            bullets: [
              'Centering is part of PCA; scaling is needed when features use different units.',
              'Explained variance ratio says how much total variance each component keeps.',
              'Low-dimensional PCA plots are useful diagnostics, not proof of class separability.'
            ],
            codeExample: {
              title: 'Project Iris to two principal components',
              language: 'python',
              code: code([
                'import matplotlib.pyplot as plt',
                'from sklearn.datasets import load_iris',
                'from sklearn.decomposition import PCA',
                'from sklearn.pipeline import Pipeline',
                'from sklearn.preprocessing import StandardScaler',
                '',
                'iris = load_iris()',
                'pipe = Pipeline([("scale", StandardScaler()), ("pca", PCA(n_components=2))])',
                'coords = pipe.fit_transform(iris.data)',
                'pca = pipe.named_steps["pca"]',
                '',
                'print("explained variance:", pca.explained_variance_ratio_.round(3))',
                'plt.figure(figsize=(6, 4))',
                'plt.scatter(coords[:, 0], coords[:, 1], c=iris.target, cmap="viridis", edgecolor="k")',
                'plt.xlabel("PC1")',
                'plt.ylabel("PC2")',
                'plt.title("Iris PCA projection")',
                'plt.tight_layout()',
                'plt.show()'
              ])
            }
          },
          {
            heading: 'Evaluation is indirect because labels are absent',
            body:
              'With no labels, evaluation asks whether the representation is stable, compact, interpretable, and useful for a downstream decision. For clustering, you can measure silhouette, compare cluster profiles, rerun with different seeds, and test whether clusters predict future behavior that was not used to create them. For PCA, you can inspect explained variance, reconstruction error, and whether downstream models perform similarly with fewer dimensions. A concrete compression example: if the first 10 PCs explain 92 percent of variance in a 200-feature dataset, a logistic regression on those PCs may train faster and overfit less. But the remaining 8 percent might contain rare but critical fraud signal, so compression should be validated against the task before deployment.',
            bullets: [
              'Use internal metrics, stability checks, and downstream validation together.',
              'Profile clusters with feature summaries and representative examples.',
              'Check whether dimensionality reduction removes minority or rare-event signal.'
            ]
          },
          {
            heading: 'Failure modes come from shape, scale, and storytelling',
            body:
              'KMeans assumes round clusters and uses means, so it struggles with crescent shapes, unequal densities, and outliers. A single far-away point can pull a centroid. PCA assumes linear structure and can hide small but important directions if most variance comes from nuisance factors such as user activity volume. The human failure mode is storytelling: naming clusters "power users" or "at-risk customers" after looking at two high-level averages. Good practice is to name clusters descriptively first, such as "high sessions, low purchases", then test product hypotheses. If a cluster is unstable across weeks or disappears after scaling, it should not drive product strategy.',
            bullets: [
              'Inspect plots when possible, but remember high-dimensional structure can mislead 2D views.',
              'Compare results across random seeds, time windows, and preprocessing choices.',
              'Use domain language only after validating that clusters are stable and actionable.'
            ]
          }
        ],
        checklist: [
          'Can explain KMeans assignment and centroid updates with a numeric example.',
          'Can choose k using inertia, silhouette, stability, and product usefulness.',
          'Can explain PCA as a rotation/projection that maximizes variance.',
          'Can reduce data to two principal components for visualization.',
          'Can name failure modes of clustering and dimensionality reduction.'
        ],
        pitfalls: [
          'Treating the elbow method as an exact answer.',
          'Skipping scaling before KMeans or PCA.',
          'Assuming PCA components are causally meaningful.',
          'Naming clusters as personas without profiling or validation.',
          'Deploying cluster labels in sensitive workflows without fairness and stability checks.'
        ],
        interviewPrompts: [
          'How would you choose k for KMeans?',
          'What does PCA preserve, and what can it hide?',
          'How would you validate that discovered customer segments are useful?',
          'Why can scaling change KMeans assignments?',
          'When would you avoid unsupervised learning for a product decision?'
        ],
        exercises: [
          {
            id: 'kmeans-model-selection',
            title: 'Choose k with inertia and silhouette',
            difficulty: 'beginner',
            type: 'coding',
            description:
              'Fit KMeans for several k values on synthetic blobs and report inertia plus silhouette score.',
            starterCode: code([
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
            ]),
            solution: code([
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
            ]),
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
            starterCode: code([
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
            ]),
            solution: code([
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
            ]),
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
              'How would you test stability across time and random seeds?',
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
        duration: '60-75 min',
        whyItMatters:
          'From-scratch neural nets make model behavior less mysterious. You see exactly where activations, loss, gradients, and updates enter the training loop.',
        sections: [
          {
            heading: 'A perceptron is a linear decision rule',
            body:
              'A perceptron computes z = w1*x1 + w2*x2 + b and applies a step function. If z >= 0, it predicts 1; otherwise it predicts 0. The weights set the boundary direction and the bias shifts it. For the AND gate, weights [1, 1] and bias -1.5 work: input [1, 1] gives z = 1 + 1 - 1.5 = 0.5, so the prediction is 1. Input [1, 0] gives z = 1 + 0 - 1.5 = -0.5, so the prediction is 0. Geometrically, the boundary is the line x1 + x2 - 1.5 = 0. Points on one side are positive. That is powerful for linearly separable tasks and impossible for patterns that need curved or disconnected regions.',
            bullets: [
              'Weights define the orientation of the separating line or hyperplane.',
              'Bias shifts the boundary without changing its orientation.',
              'A hard step activation gives binary predictions but no smooth gradient.'
            ],
            codeExample: {
              title: 'Predict AND with a hand-coded perceptron',
              language: 'python',
              code: code([
                'import numpy as np',
                '',
                'def predict(X, weights, bias):',
                '    return (X @ weights + bias >= 0).astype(int)',
                '',
                'X = np.array([[0, 0], [0, 1], [1, 0], [1, 1]], dtype=float)',
                'weights = np.array([1.0, 1.0])',
                'bias = -1.5',
                'print("scores:", (X @ weights + bias).round(2))',
                'print("predictions:", predict(X, weights, bias))'
              ])
            }
          },
          {
            heading: 'The perceptron update is targeted correction',
            body:
              'The training rule updates only when the prediction is wrong. For one example, error = target - prediction. Then w = w + learning_rate * error * x and b = b + learning_rate * error. Suppose weights start [0, 0], bias 0, learning rate 0.2, and the example is x=[1, 1], target=1. The score is 0, the step predicts 1, error is 0, and nothing changes. If the example is x=[0, 0], target=0, the score is 0, prediction is 1, error is -1, weights stay [0, 0] because x is zero, and bias becomes -0.2. That bias shift makes the all-zero case less likely to fire next time. Over many passes, mistakes push the boundary until separable data is classified correctly.',
            bullets: [
              'The sign of the error decides whether the boundary moves toward or away from the example.',
              'The learning rate controls how large each correction is.',
              'For separable data, the perceptron convergence theorem says a solution will eventually be found.'
            ],
            codeExample: {
              title: 'Train a perceptron on AND',
              language: 'python',
              code: code([
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
                'for epoch in range(12):',
                '    mistakes = 0',
                '    for x, target in zip(X, y):',
                '        pred = step(x @ weights + bias)',
                '        error = target - pred',
                '        mistakes += int(error != 0)',
                '        weights += lr * error * x',
                '        bias += lr * error',
                '    if epoch in [0, 1, 11]:',
                '        print(epoch, "weights", weights.round(2), "bias", round(bias, 2), "mistakes", mistakes)',
                '',
                'print("final predictions:", np.array([step(x @ weights + bias) for x in X]))'
              ])
            }
          },
          {
            heading: 'XOR proves why one linear boundary is not enough',
            body:
              'XOR outputs 1 for [0, 1] and [1, 0], but 0 for [0, 0] and [1, 1]. Try drawing one straight line that puts the two diagonal positive corners on one side and the two diagonal negative corners on the other. It cannot be done. Algebra shows the conflict. To classify [1, 0] positive, w1 + b >= 0. To classify [0, 1] positive, w2 + b >= 0. To classify [0, 0] negative, b < 0. Adding the first two inequalities gives w1 + w2 + 2b >= 0. But [1, 1] must be negative, so w1 + w2 + b < 0. Since b < 0, these inequalities fight each other. A hidden layer solves this by creating intermediate features such as "x1 OR x2" and "x1 AND x2", then combining them nonlinearly.',
            bullets: [
              'A single perceptron can solve AND and OR but not XOR.',
              'Hidden units create learned features before the final decision.',
              'Nonlinear activations are what make stacked layers more expressive than one linear model.'
            ]
          },
          {
            heading: 'An MLP composes affine maps and activations',
            body:
              'A two-layer MLP computes hidden = activation(X @ W1 + b1), then output = activation(hidden @ W2 + b2). Shapes are the first debugging tool. If X has shape (4, 2) for four XOR rows and two inputs, W1 can be (2, 4), making hidden shape (4, 4). W2 can be (4, 1), making output shape (4, 1). A tiny numeric forward pass: if x=[1, 0], one hidden unit has weights [3, -2] and bias -1, its pre-activation is 3*1 + -2*0 - 1 = 2. A sigmoid turns 2 into 0.881, so this hidden unit is strongly active for x1=1. Other hidden units can specialize in other regions, and the output layer combines them.',
            bullets: [
              'Affine maps choose directions; activations bend the decision surface.',
              'Random initialization breaks symmetry so hidden units can learn different features.',
              'Shape checks catch many bugs before you inspect the math.'
            ],
            codeExample: {
              title: 'Run an XOR MLP forward pass',
              language: 'python',
              code: code([
                'import numpy as np',
                '',
                'def sigmoid(z):',
                '    return 1 / (1 + np.exp(-z))',
                '',
                'X = np.array([[0, 0], [0, 1], [1, 0], [1, 1]], dtype=float)',
                'W1 = np.array([[4.0, -4.0], [4.0, -4.0]])',
                'b1 = np.array([[-2.0, 6.0]])',
                'W2 = np.array([[5.0], [5.0]])',
                'b2 = np.array([[-7.0]])',
                '',
                'hidden = sigmoid(X @ W1 + b1)',
                'out = sigmoid(hidden @ W2 + b2)',
                'print("hidden activations:\\n", hidden.round(3))',
                'print("output probabilities:", out.round(3).ravel())'
              ])
            }
          },
          {
            heading: 'Training repeats forward, loss, backward, update',
            body:
              'A neural-network training loop is not magic. The forward pass makes predictions. The loss measures how wrong they are. Backpropagation computes how each parameter contributed to the loss. The optimizer updates parameters in the opposite direction of the gradient. For binary cross-entropy with sigmoid output, the final pre-activation gradient simplifies to output - target. If the target is 1 and the model outputs 0.2, the gradient is -0.8, so gradient descent increases the score. If the target is 0 and the model outputs 0.9, the gradient is +0.9, so gradient descent decreases the score. The learning rate controls whether those corrections are steady, too slow, or explosive.',
            bullets: [
              'Track loss over epochs before trusting final predictions.',
              'Initialize weights randomly; all-zero hidden weights keep units identical.',
              'Use small deterministic datasets like XOR to debug the loop before scaling.'
            ],
            codeExample: {
              title: 'Train a sigmoid MLP on XOR',
              language: 'python',
              code: code([
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
                '    dz1 = (dz2 @ W2.T) * h * (1 - h)',
                '    dW1 = X.T @ dz1 / len(X)',
                '    db1 = dz1.mean(axis=0, keepdims=True)',
                '    W2 -= lr * dW2; b2 -= lr * db2',
                '    W1 -= lr * dW1; b1 -= lr * db1',
                '',
                'out = sigmoid(sigmoid(X @ W1 + b1) @ W2 + b2)',
                'print("probabilities:", out.round(3).ravel())',
                'print("predictions:", (out >= 0.5).astype(int).ravel())'
              ])
            }
          },
          {
            heading: 'Evaluation and failure modes start with tiny signals',
            body:
              'From-scratch networks fail in recognizable ways. If loss does not move at all, check that gradients are nonzero, parameters update, and activation derivatives are connected to the right cached values. If loss becomes NaN, the learning rate may be too high or exponentials may overflow. If every hidden unit has the same activation, initialization may be symmetric. If training accuracy is perfect and validation is poor, the network has too much capacity for the data or the split is leaking. Evaluation for a tiny MLP still follows supervised-learning rules: hold out data when possible, inspect train and validation curves, compare to a simpler baseline, and make sure the metric matches the task.',
            bullets: [
              'Print loss, gradient norms, and prediction ranges while debugging.',
              'Reduce learning rate when updates overshoot or loss becomes NaN.',
              'Compare against linear baselines to verify that the neural net earns its complexity.'
            ]
          }
        ],
        checklist: [
          'Can implement a perceptron prediction and update rule.',
          'Can explain why XOR needs a hidden layer.',
          'Can trace MLP matrix shapes through a forward pass.',
          'Can write a tiny NumPy MLP training loop with sigmoid activations.',
          'Can debug stalled, exploding, or overfitting neural-network training.'
        ],
        pitfalls: [
          'Expecting a perceptron to solve non-linearly separable data.',
          'Initializing all neural-network weights to zero.',
          'Changing learning rate without checking the loss curve.',
          'Mixing up matrix shapes and silently relying on unintended broadcasting.',
          'Judging a neural network without comparing a simpler baseline.'
        ],
        interviewPrompts: [
          'Why can a perceptron learn AND but not XOR?',
          'What role does a hidden layer play geometrically?',
          'How would you debug a tiny network whose loss never changes?',
          'Why does random initialization matter?',
          'What does the learning rate change in gradient descent?'
        ],
        exercises: [
          {
            id: 'train-perceptron-and-gate',
            title: 'Train a perceptron for AND',
            difficulty: 'beginner',
            type: 'coding',
            description:
              'Implement the perceptron update rule and train it on the AND truth table.',
            starterCode: code([
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
              '# For each sample: pred = step(x @ weights + bias).',
              '# error = target - pred; update weights and bias.',
              '',
              'predictions = np.array([step(x @ weights + bias) for x in X])',
              'print("weights", weights.round(3), "bias", round(bias, 3))',
              'print("predictions", predictions)'
            ]),
            solution: code([
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
            ]),
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
            starterCode: code([
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
            ]),
            solution: code([
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
              '    dz1 = (dz2 @ W2.T) * h * (1 - h)',
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
            ]),
            hints: [
              'Use cached hidden activations when computing gradients.',
              'The derivative of sigmoid activation h is h * (1 - h).',
              'With the given random seed and learning rate, 5000 epochs should solve XOR.'
            ],
            expectedOutput:
              'Probabilities near [0, 1, 1, 0] and predictions [0 1 1 0].'
          },
          {
            id: 'mlp-debugging-design',
            title: 'Design a tiny-network debugging checklist',
            difficulty: 'intermediate',
            type: 'design',
            description:
              'Create a checklist for diagnosing a small MLP whose XOR loss does not decrease.',
            promptQuestions: [
              'Which shapes and cached tensors should you print first?',
              'How would you tell a learning-rate problem from a gradient bug?',
              'Why should all-zero hidden weights be avoided?',
              'What baseline would prove the task needs nonlinearity?'
            ]
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
        duration: '60-75 min',
        whyItMatters:
          'Backpropagation is the chain rule organized over a computation graph. Gradient checks help you trust the math before scaling to larger models.',
        sections: [
          {
            heading: 'Backpropagation is bookkeeping for the chain rule',
            body:
              'The chain rule says that if loss depends on z and z depends on w, then dloss/dw = dloss/dz * dz/dw. Neural networks are large compositions of simple operations, so backpropagation stores forward values and walks backward multiplying local derivatives by upstream gradients. A scalar example: x=3, w=2, b=-1, z=w*x+b=5, loss=z^2=25. The local derivative dloss/dz is 2z=10. Since dz/dw=x=3, dloss/dw=30. Since dz/db=1, dloss/db=10. One gradient descent step with lr=0.1 gives w=2-3= -1 and b=-1-1=-2. That step is intentionally huge because the learning rate is huge for this toy; the direction is the point.',
            bullets: [
              'Each node receives an upstream gradient and multiplies by its local derivative.',
              'Forward-pass caches are required because derivatives often use intermediate values.',
              'Gradient descent subtracts learning_rate * gradient from each parameter.'
            ],
            codeExample: {
              title: 'Scalar chain rule with finite difference check',
              language: 'python',
              code: code([
                'x = 3.0',
                'w = 2.0',
                'b = -1.0',
                '',
                'def loss_fn(w_value):',
                '    z = w_value * x + b',
                '    return z ** 2',
                '',
                'z = w * x + b',
                'loss = z ** 2',
                'analytic = 2 * z * x',
                'eps = 1e-5',
                'numeric = (loss_fn(w + eps) - loss_fn(w - eps)) / (2 * eps)',
                'print("loss:", loss)',
                'print("analytic dloss/dw:", analytic)',
                'print("numeric dloss/dw:", round(numeric, 6))'
              ])
            }
          },
          {
            heading: 'Forward pass caches the values backward pass needs',
            body:
              'For a dense layer, z = X @ W + b and h = activation(z). The backward pass for the activation needs z or h. ReLU needs to know where z > 0. Sigmoid needs h because derivative is h*(1-h). The dense-layer weight gradient needs X, because each weight connects one input feature to one output unit. If X has shape (batch=6, features=3), W has shape (3, hidden=4), and upstream gradient dz has shape (6, 4), then dW = X.T @ dz has shape (3, 4), exactly matching W. db is dz summed or averaged over the batch, shape (1, 4). Shape matching is not a side detail; it is a correctness invariant.',
            bullets: [
              'Cache pre-activations and activations during forward pass.',
              'The gradient for a parameter should have the same shape as that parameter.',
              'Batch averaging keeps update magnitude comparable across batch sizes.'
            ],
            codeExample: {
              title: 'Check dense-layer gradient shapes',
              language: 'python',
              code: code([
                'import numpy as np',
                '',
                'rng = np.random.default_rng(1)',
                'X = rng.normal(size=(6, 3))',
                'W = rng.normal(size=(3, 4))',
                'b = np.zeros((1, 4))',
                'z = X @ W + b',
                'h = np.maximum(0, z)',
                'upstream = rng.normal(size=h.shape)',
                'dz = upstream * (z > 0)',
                'dW = X.T @ dz / len(X)',
                'db = dz.mean(axis=0, keepdims=True)',
                'print("z shape:", z.shape)',
                'print("dW shape:", dW.shape, "db shape:", db.shape)'
              ])
            }
          },
          {
            heading: 'Loss derivatives start the backward flow',
            body:
              'Backpropagation starts at the loss. For mean squared error, loss = mean((pred - y)^2), so dloss/dpred = 2*(pred-y)/n. If pred=[2, 4] and y=[1, 7], errors are [1, -3], squared errors are [1, 9], and loss is 5. The derivative is [2*1/2, 2*(-3)/2] = [1, -3]. That means increasing the first prediction increases loss, while increasing the second prediction decreases loss because it is too low. For sigmoid plus binary cross-entropy, the derivative with respect to the output logit simplifies to probability - target, which is why many small MLP examples use dz = out - y at the final layer.',
            bullets: [
              'MSE gradients point from target to prediction and scale with error size.',
              'Binary cross-entropy with sigmoid has a convenient output-layer shortcut.',
              'The loss derivative determines the first upstream gradient sent into the network.'
            ]
          },
          {
            heading: 'A two-layer network is just repeated local derivatives',
            body:
              'For pred = relu(X @ W1 + b1) @ W2 + b2 with MSE, the backward path is mechanical. First compute dpred from the loss. Then dW2 = hidden.T @ dpred and db2 = sum(dpred). The gradient into hidden is dpred @ W2.T. ReLU gates that gradient: dz1 = dhidden * (z1 > 0). Then dW1 = X.T @ dz1 and db1 = sum(dz1). A tiny numeric ReLU example: if z1 values are [-2, 0.5, 3] and upstream gradients are [10, 10, 10], ReLU sends back [0, 10, 10] because the negative unit was off in the forward pass. This gate is one reason dead ReLUs can occur when units stay negative for most data.',
            bullets: [
              'Backward order is the reverse of forward order.',
              'Matrix multiplications aggregate gradients over all examples in the batch.',
              'Activation derivatives decide which upstream gradient components pass through.'
            ],
            codeExample: {
              title: 'One backward pass through a tiny ReLU network',
              language: 'python',
              code: code([
                'import numpy as np',
                '',
                'rng = np.random.default_rng(5)',
                'X = rng.normal(size=(6, 3))',
                'y = rng.normal(size=(6, 1))',
                'W1 = rng.normal(scale=0.2, size=(3, 4)); b1 = np.zeros((1, 4))',
                'W2 = rng.normal(scale=0.2, size=(4, 1)); b2 = np.zeros((1, 1))',
                '',
                'z1 = X @ W1 + b1',
                'h = np.maximum(0, z1)',
                'pred = h @ W2 + b2',
                'loss = np.mean((pred - y) ** 2)',
                'dpred = 2 * (pred - y) / len(X)',
                'dW2 = h.T @ dpred',
                'db2 = dpred.sum(axis=0, keepdims=True)',
                'dz1 = (dpred @ W2.T) * (z1 > 0)',
                'dW1 = X.T @ dz1',
                'db1 = dz1.sum(axis=0, keepdims=True)',
                'print("loss:", round(float(loss), 6))',
                'print("gradient shapes:", dW1.shape, db1.shape, dW2.shape, db2.shape)'
              ])
            }
          },
          {
            heading: 'Numerical gradient checking catches silent algebra bugs',
            body:
              'A finite-difference gradient estimates one parameter at a time: (loss(theta + eps) - loss(theta - eps)) / (2*eps). If eps is 1e-5 and changing a weight up gives loss 2.000030 while changing it down gives 1.999970, the numeric gradient is (0.000060)/(0.000020) = 3.0. If your analytic gradient says 3.000001, the backward pass is probably correct. If it says -3 or 0.3, look for sign errors, missing batch division, wrong transpose, or using the post-update parameter in the check. Gradient checking is slow because it touches each parameter separately, so use it on tiny deterministic networks, not full training runs.',
            bullets: [
              'Use central difference rather than one-sided difference for better accuracy.',
              'Freeze randomness and dropout while checking gradients.',
              'Compare absolute or relative error with tolerance, not exact equality.'
            ],
            codeExample: {
              title: 'Finite-difference check for linear regression',
              language: 'python',
              code: code([
                'import numpy as np',
                '',
                'rng = np.random.default_rng(9)',
                'X = rng.normal(size=(8, 2))',
                'y = rng.normal(size=(8, 1))',
                'W = rng.normal(size=(2, 1))',
                'eps = 1e-5',
                '',
                'def loss_fn(W_value):',
                '    pred = X @ W_value',
                '    return np.mean((pred - y) ** 2)',
                '',
                'pred = X @ W',
                'analytic = X.T @ (2 * (pred - y) / len(X))',
                'numeric = np.zeros_like(W)',
                'for i in range(W.shape[0]):',
                '    plus = W.copy(); minus = W.copy()',
                '    plus[i, 0] += eps; minus[i, 0] -= eps',
                '    numeric[i, 0] = (loss_fn(plus) - loss_fn(minus)) / (2 * eps)',
                'print("analytic:", analytic.ravel().round(6))',
                'print("numeric :", numeric.ravel().round(6))',
                'print("max error:", np.max(np.abs(analytic - numeric)))'
              ])
            }
          },
          {
            heading: 'Gradient debugging is evidence-driven',
            body:
              'When training fails, inspect the smallest reproducible case. If gradients are all zero, activations may be saturated or disconnected from the loss. Sigmoid saturates near 0 or 1; at h=0.99, h*(1-h)=0.0099, so gradients shrink. If gradients explode, update norms may dwarf parameter norms; a weight of 0.1 receiving a gradient of 100 with lr=0.1 jumps by 10, likely destabilizing the next forward pass. If only one layer learns, a transpose or broadcasting error may be blocking the earlier layer. The best debugging loop is: print shapes, print loss before and after one update, compare analytic gradients to finite differences, then train for several steps and verify the loss trend.',
            bullets: [
              'Start with deterministic data, tiny dimensions, and no randomness during checks.',
              'Print gradient norms and parameter update norms.',
              'Remove temporary debug prints after the issue is understood.'
            ]
          }
        ],
        checklist: [
          'Can compute scalar chain-rule derivatives by hand.',
          'Can cache forward-pass intermediates for backward use.',
          'Can derive dense-layer gradients with matrix shapes.',
          'Can implement a finite-difference gradient check.',
          'Can name common backprop bugs and the evidence that reveals them.'
        ],
        pitfalls: [
          'Mixing row-vector and column-vector conventions mid-derivation.',
          'Forgetting to average or sum gradients consistently over the batch.',
          'Using too large or too small an epsilon for numerical checks.',
          'Checking gradients while randomness or parameter updates are still changing values.',
          'Trusting loss curves without verifying shape and gradient invariants.'
        ],
        interviewPrompts: [
          'Walk through backpropagation for one dense layer with sigmoid activation.',
          'How do you know a hand-coded gradient is correct?',
          'What shape should dW have if X is batch-by-features and W is features-by-hidden?',
          'Why does ReLU block gradients for negative pre-activations?',
          'How would you debug NaN loss in a from-scratch network?'
        ],
        exercises: [
          {
            id: 'manual-two-layer-backward',
            title: 'Backpropagate through a tiny network',
            difficulty: 'advanced',
            type: 'coding',
            description:
              'Implement one forward/backward step for a two-layer ReLU network with mean squared error.',
            starterCode: code([
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
              '# TODO: compute z1, h, pred, loss.',
              '# TODO: compute dW2, db2, dW1, db1 for MSE loss.',
              'loss = None',
              '',
              'if loss is None:',
              '    print("TODO: implement forward and backward pass")',
              'else:',
              '    print("loss", round(float(loss), 6))',
              '    print("gradient shapes", dW1.shape, db1.shape, dW2.shape, db2.shape)'
            ]),
            solution: code([
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
              'z1 = X @ W1 + b1',
              'h = np.maximum(0, z1)',
              'pred = h @ W2 + b2',
              'loss = np.mean((pred - y) ** 2)',
              '',
              'm = X.shape[0]',
              'dpred = 2 * (pred - y) / m',
              'dW2 = h.T @ dpred',
              'db2 = dpred.sum(axis=0, keepdims=True)',
              'dz1 = (dpred @ W2.T) * (z1 > 0)',
              'dW1 = X.T @ dz1',
              'db1 = dz1.sum(axis=0, keepdims=True)',
              '',
              'print("loss", round(float(loss), 6))',
              'print("gradient shapes", dW1.shape, db1.shape, dW2.shape, db2.shape)'
            ]),
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
            starterCode: code([
              'import numpy as np',
              '',
              'rng = np.random.default_rng(9)',
              'X = rng.normal(size=(8, 2))',
              'y = rng.normal(size=(8, 1))',
              'W = rng.normal(size=(2, 1))',
              'eps = 1e-5',
              '',
              'def loss_fn(W_value):',
              '    pred = X @ W_value',
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
            ]),
            solution: code([
              'import numpy as np',
              '',
              'rng = np.random.default_rng(9)',
              'X = rng.normal(size=(8, 2))',
              'y = rng.normal(size=(8, 1))',
              'W = rng.normal(size=(2, 1))',
              'eps = 1e-5',
              '',
              'def loss_fn(W_value):',
              '    pred = X @ W_value',
              '    return np.mean((pred - y) ** 2)',
              '',
              'pred = X @ W',
              'analytic_grad = X.T @ (2 * (pred - y) / len(X))',
              'numeric_grad = np.zeros_like(W)',
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
            ]),
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
        duration: '60-75 min',
        whyItMatters:
          'CNNs are easier to understand when you can see filters sliding over arrays. Convolution, pooling, and flattening are structured NumPy operations before they become deep-learning layers.',
        sections: [
          {
            heading: 'Images are tensors with local structure',
            body:
              'A grayscale image can be represented as a 2D matrix of pixel intensities. A color image is often height by width by channels. Fully connected layers ignore locality: pixel (10, 10) and pixel (10, 11) are just two unrelated inputs unless the data teaches otherwise. Convolution builds in the assumption that nearby pixels form useful patterns and that the same pattern can appear in many locations. If a 3x3 edge detector works in the top-left corner, the same weights can scan the center and bottom-right. This weight sharing reduces parameters and improves generalization for image-like data. A 28x28 image flattened into a dense layer with 100 hidden units needs 78,400 weights; one 3x3 filter needs only 9 weights plus a bias and can be applied everywhere.',
            bullets: [
              'Convolution preserves spatial locality while sharing weights across positions.',
              'Small filters detect local patterns that deeper layers can combine.',
              'CNN assumptions help image, audio spectrogram, and grid-like data more than arbitrary tabular columns.'
            ]
          },
          {
            heading: 'A convolution output cell is a weighted patch sum',
            body:
              'For valid 2D convolution, place the kernel over an image patch with the same shape, multiply elementwise, and sum. Suppose the patch is [[1, 2], [3, 4]] and the kernel is [[1, 0], [-1, 1]]. The output is 1*1 + 2*0 + 3*(-1) + 4*1 = 2. Then the kernel slides one column or row and repeats. With a 4x4 image and a 2x2 kernel, valid convolution has output size (4-2+1) by (4-2+1), so 3x3. Edge filters use positive weights on one side and negative weights on the other, producing large magnitude where intensities change sharply.',
            bullets: [
              'Kernel size controls the local receptive field.',
              'Each output value summarizes one neighborhood.',
              'Valid convolution uses only patches fully inside the image.'
            ],
            codeExample: {
              title: 'Apply a vertical edge filter',
              language: 'python',
              code: code([
                'import numpy as np',
                '',
                'image = np.array([',
                '    [0, 0, 1, 1],',
                '    [0, 0, 1, 1],',
                '    [0, 0, 1, 1],',
                '    [0, 0, 1, 1]',
                '], dtype=float)',
                'kernel = np.array([[-1, 1], [-1, 1]], dtype=float)',
                'out = np.zeros((3, 3))',
                '',
                'for r in range(3):',
                '    for c in range(3):',
                '        patch = image[r:r+2, c:c+2]',
                '        out[r, c] = np.sum(patch * kernel)',
                '',
                'print(out)'
              ])
            }
          },
          {
            heading: 'Stride and padding decide the output grid',
            body:
              'Stride is how far the kernel moves between outputs. With stride 1, a 5x5 image and 3x3 kernel produce a 3x3 valid output. With stride 2, the output becomes floor((5-3)/2) + 1 = 2 positions per axis, so 2x2. Padding adds zeros around the image so filters can cover border pixels and sometimes preserve size. For same padding with stride 1 and a 3x3 kernel, one pixel of padding turns 5x5 into 7x7 before convolution, and the output returns to 5x5. The tradeoff is context: padding lets edges produce outputs, but those outputs partially see artificial zeros. In interviews, state the formula and then talk about why preserving spatial size may help deeper networks.',
            bullets: [
              'Valid output size is floor((input - kernel) / stride) + 1.',
              'Padding increases effective input size and changes border behavior.',
              'Stride reduces spatial resolution and computation.'
            ],
            codeExample: {
              title: 'Compute convolution output sizes',
              language: 'python',
              code: code([
                'def conv_out_size(input_size, kernel_size, stride=1, padding=0):',
                '    return (input_size + 2 * padding - kernel_size) // stride + 1',
                '',
                'for stride in [1, 2]:',
                '    print("5x5, 3x3, stride", stride, "valid ->", conv_out_size(5, 3, stride=stride))',
                'print("5x5, 3x3, stride 1, padding 1 ->", conv_out_size(5, 3, stride=1, padding=1))'
              ])
            }
          },
          {
            heading: 'Pooling trades precise location for robustness',
            body:
              'Max pooling takes the largest value in each window. For a 2x2 patch [[0.1, 0.7], [0.2, 0.4]], max pooling outputs 0.7. If a detector fires one pixel to the left in another image, a 2x2 max pool may still keep a similar activation, giving small translation tolerance. Pooling also reduces computation: an 8x8 activation map pooled with size 2 and stride 2 becomes 4x4, reducing 64 values to 16. The cost is lost detail. If the task depends on exact location, aggressive pooling can hurt. Average pooling keeps broader intensity information, while max pooling emphasizes strongest local evidence.',
            bullets: [
              'Max pooling keeps the strongest local response.',
              'Pooling lowers spatial resolution and downstream computation.',
              'Translation tolerance is useful only when exact location is not the label.'
            ],
            codeExample: {
              title: 'Max pool a small activation map',
              language: 'python',
              code: code([
                'import numpy as np',
                '',
                'activation = np.array([',
                '    [0.1, 0.7, 0.2, 0.3],',
                '    [0.2, 0.4, 0.9, 0.1],',
                '    [0.0, 0.5, 0.8, 0.6],',
                '    [0.3, 0.2, 0.4, 0.9]',
                '])',
                'pooled = np.zeros((2, 2))',
                'for r in range(2):',
                '    for c in range(2):',
                '        patch = activation[r*2:r*2+2, c*2:c*2+2]',
                '        pooled[r, c] = np.max(patch)',
                'print(pooled)'
              ])
            }
          },
          {
            heading: 'From convolutional features to classifiers',
            body:
              'A full CNN learns filters during training, applies nonlinear activations, pools or strides, then flattens or globally pools features for classification. In this browser-friendly lesson, we implement the array operations explicitly and use scikit-learn for small classifiers. A useful baseline is flattened pixels. On synthetic 8x8 images with vertical bars and horizontal bars, flattened pixels are enough because the pattern is simple. Convolutional features become more valuable when objects shift location, local edges combine into shapes, and weight sharing reduces the number of examples needed. Evaluation still follows the supervised workflow: hold out test images, compare to baselines, inspect errors, and watch for shortcuts such as a noise pattern that correlates with the label.',
            bullets: [
              'Flattened pixels are a baseline, not a CNN.',
              'Convolutional features help when local patterns repeat across positions.',
              'Synthetic image tasks are useful for understanding operations but do not prove real-world robustness.'
            ],
            codeExample: {
              title: 'Classify synthetic bar images with sklearn',
              language: 'python',
              code: code([
                'import numpy as np',
                'from sklearn.metrics import accuracy_score',
                'from sklearn.model_selection import train_test_split',
                'from sklearn.neural_network import MLPClassifier',
                '',
                'def make_bar_images(n=120, size=8, seed=2):',
                '    rng = np.random.default_rng(seed)',
                '    images, labels = [], []',
                '    for i in range(n):',
                '        img = rng.normal(0, 0.05, size=(size, size))',
                '        if i % 2 == 0:',
                '            img[:, 3:5] += 1.0; labels.append(0)',
                '        else:',
                '            img[3:5, :] += 1.0; labels.append(1)',
                '        images.append(img)',
                '    return np.array(images), np.array(labels)',
                '',
                'images, y = make_bar_images()',
                'X = images.reshape(len(images), -1)',
                'X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.3, stratify=y, random_state=2)',
                'clf = MLPClassifier(hidden_layer_sizes=(12,), max_iter=500, random_state=2)',
                'clf.fit(X_train, y_train)',
                'print("accuracy:", round(accuracy_score(y_test, clf.predict(X_test)), 3))'
              ])
            }
          },
          {
            heading: 'CNN block failure modes are often shape or shortcut bugs',
            body:
              'Hand-written convolution code fails when output dimensions are off by one, patches and kernels have mismatched shapes, stride indexes skip the wrong pixels, or pooling windows overlap unintentionally. Model-level failures are more subtle. A classifier may learn a border artifact from padding instead of the object. Pooling may erase a small object. A synthetic dataset may put every vertical bar at columns 3 and 4, so the classifier learns position rather than verticality. Good tests include tiny matrices with hand-computed outputs, translated examples, noise stress tests, and confusion-matrix review. If an edge filter should return a strong response at one boundary, write that expected array before optimizing anything.',
            bullets: [
              'Test convolution and pooling on small matrices with known outputs.',
              'Check translated inputs to see whether the feature is robust or position-specific.',
              'Inspect false positives and false negatives before claiming the feature works.'
            ]
          }
        ],
        checklist: [
          'Can compute one convolution output cell from a patch and kernel.',
          'Can derive output sizes from input size, kernel, stride, and padding.',
          'Can implement valid 2D convolution over a single-channel image.',
          'Can implement max pooling with a fixed window and stride.',
          'Can explain how convolutional features become classifier inputs and how to evaluate them.'
        ],
        pitfalls: [
          'Mixing up output height/width calculations.',
          'Forgetting that convolution kernels and image patches must have matching shapes.',
          'Assuming pooling improves every task instead of checking lost detail.',
          'Training on synthetic images with a position shortcut and calling it shape learning.',
          'Ignoring border behavior introduced by padding.'
        ],
        interviewPrompts: [
          'What does a convolution filter compute at one output location?',
          'How do stride and padding change output size?',
          'Why does max pooling provide some translation tolerance?',
          'How would you test a hand-written convolution implementation?',
          'When might pooling hurt performance?'
        ],
        exercises: [
          {
            id: 'simple-conv2d-numpy',
            title: 'Implement valid 2D convolution',
            difficulty: 'intermediate',
            type: 'coding',
            description:
              'Write a NumPy function that applies one 2D kernel to one 2D image without padding.',
            starterCode: code([
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
            ]),
            solution: code([
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
            ]),
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
            starterCode: code([
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
            ]),
            solution: code([
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
            ]),
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
