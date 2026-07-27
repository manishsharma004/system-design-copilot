/** @type {Record<string, import('../learnChapters.js').LessonLearnChapter>} */
export const mlInteractiveLabChapters = {
  "ml-interactive-lab/feature-engineering-playground": {
    "title": "Chapter: Feature engineering playground",
    "readingTime": "55-70 min",
    "premise": "Scaling, encoding, missing-value handling, and scikit-learn Pipelines for tabular machine learning workflows. This Learn chapter expands the short lesson summary into a full study unit you can read continuously, with interactive checks and selection-based AI search when a phrase needs a second opinion.",
    "parts": [
      {
        "id": "orientation",
        "heading": "Why this chapter exists",
        "paragraphs": [
          "Feature engineering is where many tabular ML systems win or lose. Good transformations make signal visible to the estimator, and pipelines make those transformations reproducible, testable, and safe from leakage.",
          "This chapter treats \"Feature engineering playground\" as a readable study unit: intuition first, then the mechanics you must be able to explain, then the failure modes that show up in interviews and production, and finally how to talk about the topic under time pressure.",
          "Read it like a book chapter. When a phrase is unclear, select it inside the Learn reader and use Search with AI to open Google, Perplexity, or DuckDuckGo without abandoning the chapter."
        ],
        "callout": {
          "tone": "tip",
          "body": "Target reading time is paced for depth, not skimming. Pause at each Check yourself prompt and answer out loud before revealing the guide answer."
        }
      },
      {
        "id": "raw-values-become-model-coordinates",
        "heading": "Raw values become model coordinates",
        "paragraphs": [
          "A model does not see \"income\", \"city\", or \"plan tier\" the way a person does. It sees coordinates. Feature engineering chooses those coordinates so the model can compare examples fairly. Suppose one customer has age 20 and annual spend 100, while another has age 60 and spend 110. In raw Euclidean distance, the age gap contributes 40 and spend contributes 10, so age dominates. If spend is recorded in cents instead, the same spend gap contributes 1000 and now spend dominates. The relationship did not change; the coordinate system did. Standardization fixes this by subtracting the training mean and dividing by the training standard deviation. For values [10, 20, 30], the mean is 20 and the population standard deviation is about 8.16, so 10 becomes -1.225, 20 becomes 0, and 30 becomes 1.225. The model now reads \"one and a quarter standard deviations below average\" instead of \"10 units\".",
          "Hold these points explicitly while you study. Restate each one without looking at the list — recognition is not the interview bar; recall is.",
          "• Scale numeric features when distances, dot products, or regularization strength matter.",
          "• Keep transformations interpretable enough that you can debug changed predictions.",
          "• Fit every learned transformation on training data only, because means, medians, and category vocabularies are data-derived parameters.",
          "Production lens — Transformation contract: Feature engineering is part of the model contract, not a notebook prelude. If training scales age with mean 42 and standard deviation 12, serving must use those exact fitted values, not recompute from today's request. If categorical encoding maps plan=premium to column 7, production must use the same mapping and a defined behavior for unseen categories. The estimator learns from transformed inputs; inconsistent transformation changes the meaning of every coefficient, split, or embedding.\n\nTreat transformations as versioned artifacts. A pipeline should include imputation, scaling, encoding, tokenization, feature selection, and the estimator so cross-validation and serving use the same steps. Store fitted parameters with the model version. Add tests for schema, null handling, category drift, and output shape. A model with 0.92 validation AUC can fail immediately if production sends columns in a different order or drops the missing-value indicator that carried important signal."
        ],
        "keyTerms": [
          {
            "term": "Scale numeric features when distances, dot",
            "definition": "Scale numeric features when distances, dot products, or regularization strength matter."
          },
          {
            "term": "Keep transformations interpretable enough tha…",
            "definition": "Keep transformations interpretable enough that you can debug changed predictions."
          },
          {
            "term": "Fit every learned transformation on training",
            "definition": "Fit every learned transformation on training data only, because means, medians, and category vocabularies are data-derived parameters."
          }
        ],
        "workedExample": {
          "title": "See scaling change distances",
          "body": "Narrate what each shape and step is doing. If you only recognize the API call, you do not own the idea yet — rewrite the example from memory after one pass.",
          "code": "import numpy as np\nfrom sklearn.preprocessing import StandardScaler\n\nX = np.array([\n    [20.0, 100.0],\n    [60.0, 110.0],\n    [40.0, 10000.0]\n])\n\nraw_distance = np.linalg.norm(X[0] - X[1])\nscaled = StandardScaler().fit_transform(X)\nscaled_distance = np.linalg.norm(scaled[0] - scaled[1])\n\nprint(\"raw distance between customer 0 and 1:\", round(raw_distance, 3))\nprint(\"scaled coordinates:\\n\", scaled.round(3))\nprint(\"scaled distance between customer 0 and 1:\", round(scaled_distance, 3))",
          "language": "python"
        },
        "checkYourself": [
          {
            "prompt": "Can explain how scaling changes distance, regularization, and PCA geometry.",
            "reveal": "Feature engineering is part of the model contract, not a notebook prelude. If training scales age with mean 42 and standard deviation 12, serving must use those exact fitted values, not recompute from today's request. If categorical encoding maps plan=premium to column 7, production must use the same mapping and a defined behavior for unseen categories. The estimator learns from transformed inputs; inconsistent transformation changes the meaning of every coefficient, split, or embedding.\n\nTreat transformations as versioned artifacts. A pipeline should include imputation, scaling, encoding, tokenization, feature selection, and the estimator so cross-validation and serving use the same steps. Store fitted parameters with the model version. Add tests for schema, null handling, category drift, and output shape. A model with 0.92 validation AUC can fail immediately if production sends columns in a different order or drops the missing-value indicator that carried important signal."
          }
        ]
      },
      {
        "id": "scaling-changes-algorithms-in-different-ways",
        "heading": "Scaling changes algorithms in different ways",
        "paragraphs": [
          "Scaling is not a cosmetic step. K-nearest neighbors, KMeans, SVMs with RBF kernels, PCA, and gradient-based linear models all use geometry. If feature A ranges from 0 to 1 and feature B ranges from 0 to 10,000, squared distance is almost entirely feature B. A KNN classifier may call two users similar because their salaries are close while ignoring a highly predictive binary feature. Logistic regression also changes because L2 regularization penalizes coefficients by size; an unscaled feature with large units can use a tiny coefficient to create a large prediction shift, while a small-range feature needs a large coefficient and gets penalized more. Trees are less sensitive because they split one feature at a time, but they still need sane missing-value handling and categorical treatment.",
          "Hold these points explicitly while you study. Restate each one without looking at the list — recognition is not the interview bar; recall is.",
          "• Distance-based models are usually the most sensitive to feature scale.",
          "• Regularized linear models need scale so the penalty treats features comparably.",
          "• Tree ensembles do not need standardization for split geometry, but pipelines still help keep preprocessing consistent.",
          "Production lens — Leakage barriers: Leakage happens when training features contain information that would not be available at prediction time. Fitting a scaler before train-test split lets validation influence mean and variance. Encoding a category by target average using the full dataset leaks labels. Building a churn feature from events after the churn date leaks the answer. Leakage often raises metrics just enough to look exciting, then disappears in production because the future is no longer available.\n\nThe barrier is temporal and procedural. Split first, then fit transformations only on training folds. In cross-validation, each fold must fit its own imputer, encoder, and selector inside the fold. For time series, train on past and validate on future, not random rows. For user data, group by user if the same user's history appears multiple times. Ask for every feature: would this exact value be known, with this latency, at the moment the model makes the decision?"
        ],
        "keyTerms": [
          {
            "term": "Distance-based models are usually the most",
            "definition": "Distance-based models are usually the most sensitive to feature scale."
          },
          {
            "term": "Regularized linear models need scale so",
            "definition": "Regularized linear models need scale so the penalty treats features comparably."
          },
          {
            "term": "Tree ensembles do not need standardization",
            "definition": "Tree ensembles do not need standardization for split geometry, but pipelines still help keep preprocessing consistent."
          }
        ],
        "checkYourself": [
          {
            "prompt": "Can choose one-hot encoding for unordered categories and explain high-cardinality risks.",
            "reveal": "Leakage happens when training features contain information that would not be available at prediction time. Fitting a scaler before train-test split lets validation influence mean and variance. Encoding a category by target average using the full dataset leaks labels. Building a churn feature from events after the churn date leaks the answer. Leakage often raises metrics just enough to look exciting, then disappears in production because the future is no longer available.\n\nThe barrier is temporal and procedural. Split first, then fit transformations only on training folds. In cross-validation, each fold must fit its own imputer, encoder, and selector inside the fold. For time series, train on past and validate on future, not random rows. For user data, group by user if the same user's history appears multiple times. Ask for every feature: would this exact value be known, with this latency, at the moment the model makes the decision?"
          }
        ]
      },
      {
        "id": "encoding-categories-without-inventing-fake-order",
        "heading": "Encoding categories without inventing fake order",
        "paragraphs": [
          "Categorical variables carry identity, not magnitude. If plan is free, pro, or team, encoding them as 0, 1, and 2 tells a linear model that team is twice pro and that pro sits halfway between free and team. That is usually false. One-hot encoding creates separate indicator columns, such as plan_free, plan_pro, and plan_team. A row with plan=pro becomes [0, 1, 0], so the model can learn an independent adjustment for pro. The tradeoff is dimensionality. A country feature with 200 values creates 200 columns; a user-id feature with one million values is usually a memorization trap. For high-cardinality categories, interview-level answers should mention target leakage risk, hashing, learned embeddings, frequency thresholds, or replacing the category with stable aggregate features computed from past data only.",
          "Hold these points explicitly while you study. Restate each one without looking at the list — recognition is not the interview bar; recall is.",
          "• Use one-hot encoding for unordered categories with manageable cardinality.",
          "• Use handle_unknown=\"ignore\" so production categories unseen in training do not crash inference.",
          "• Be suspicious of identifiers and rare categories because they can memorize examples instead of learning reusable patterns.",
          "Production lens — Categorical encoding tradeoffs: Categorical features need encoding that matches cardinality and model type. One-hot encoding works well for low-cardinality values like browser type or subscription tier; it creates one binary column per category and avoids implying false order. Ordinal encoding maps categories to integers, which tree models may handle but linear models can misread as magnitude. Target encoding can help high-cardinality categories like merchant ID, but it must be smoothed and computed within folds to avoid leakage.\n\nUnseen categories require an explicit plan. A production request may include a new city or product not present during training. One-hot encoders can ignore unknowns, map them to other, or reserve a bucket. Hashing trick encodes arbitrary categories into a fixed number of buckets, trading collisions for bounded dimension. Embeddings can learn dense representations for frequent categories in neural models. The choice balances memory, interpretability, collision risk, and how fast the category space changes."
        ],
        "keyTerms": [
          {
            "term": "Use one-hot encoding for unordered categories",
            "definition": "Use one-hot encoding for unordered categories with manageable cardinality."
          },
          {
            "term": "Use handle_unknown=\"ignore\" so production cat…",
            "definition": "Use handle_unknown=\"ignore\" so production categories unseen in training do not crash inference."
          },
          {
            "term": "Be suspicious of identifiers and rare",
            "definition": "Be suspicious of identifiers and rare categories because they can memorize examples instead of learning reusable patterns."
          }
        ],
        "workedExample": {
          "title": "Mixed numeric and categorical preprocessing",
          "body": "Narrate what each shape and step is doing. If you only recognize the API call, you do not own the idea yet — rewrite the example from memory after one pass.",
          "code": "import numpy as np\nfrom sklearn.compose import ColumnTransformer\nfrom sklearn.impute import SimpleImputer\nfrom sklearn.pipeline import Pipeline\nfrom sklearn.preprocessing import OneHotEncoder, StandardScaler\n\nX = np.array([\n    [22.0, 35.0, \"NYC\", \"free\"],\n    [41.0, 88.0, \"SF\", \"pro\"],\n    [np.nan, 76.0, \"NYC\", \"pro\"],\n    [55.0, np.nan, \"LA\", \"team\"]\n], dtype=object)\n\nnumeric_pipe = Pipeline([(\"impute\", SimpleImputer(strategy=\"median\")), (\"scale\", StandardScaler())])\ncategorical_pipe = Pipeline([(\"impute\", SimpleImputer(strategy=\"most_frequent\")), (\"onehot\", OneHotEncoder(handle_unknown=\"ignore\", sparse_output=False))])\npreprocess = ColumnTransformer([(\"num\", numeric_pipe, [0, 1]), (\"cat\", categorical_pipe, [2, 3])])\n\nXt = preprocess.fit_transform(X)\nprint(\"transformed shape:\", Xt.shape)\nprint(\"first row:\", Xt[0].round(3))",
          "language": "python"
        },
        "checkYourself": [
          {
            "prompt": "Can build a ColumnTransformer and Pipeline that keeps imputation, encoding, scaling, and modeling inside cross-validation.",
            "reveal": "Categorical features need encoding that matches cardinality and model type. One-hot encoding works well for low-cardinality values like browser type or subscription tier; it creates one binary column per category and avoids implying false order. Ordinal encoding maps categories to integers, which tree models may handle but linear models can misread as magnitude. Target encoding can help high-cardinality categories like merchant ID, but it must be smoothed and computed within folds to avoid leakage.\n\nUnseen categories require an explicit plan. A production request may include a new city or product not present during training. One-hot encoders can ignore unknowns, map them to other, or reserve a bucket. Hashing trick encodes arbitrary categories into a fixed number of buckets, trading collisions for bounded dimension. Embeddings can learn dense representations for frequent categories in neural models. The choice balances memory, interpretability, collision risk, and how fast the category space changes."
          }
        ]
      },
      {
        "id": "missing-values-are-information-and-risk",
        "heading": "Missing values are information and risk",
        "paragraphs": [
          "Missing data is not just an inconvenience. A missing income value might mean a user skipped a form field, a sensor failed, or the value is unavailable for a specific customer segment. Simple imputation replaces missing numeric values with a mean or median and categorical values with the most frequent category. That is often a strong baseline, but it can erase signal. A concrete example: if loan applicants with missing income default 30 percent of the time and applicants with reported income default 5 percent of the time, the missingness itself is predictive. You might add a binary missing_income indicator while also imputing the numeric column. The failure mode is leakage: if you compute the median using the full dataset before splitting, validation data influences training. That can move a median from 70 to 75 and quietly improve validation scores in a way that will not hold up later.",
          "Hold these points explicitly while you study. Restate each one without looking at the list — recognition is not the interview bar; recall is.",
          "• Ask why values are missing: random measurement error, user choice, system failure, or label-dependent process.",
          "• Consider missingness indicator features when absence carries signal.",
          "• Learn imputation values inside the training fold, never on the whole dataset.",
          "Production lens — Feature monitoring drift: Feature work continues after launch because input distributions move. A model trained when average order value is 40 dollars may see 75 dollars during holidays. A new mobile app version may stop sending device_locale for 30 percent of traffic. A fraud feature based on IP reputation may drift when a provider changes scoring. Monitor null rates, min/max, quantiles, category frequencies, and embedding coverage for features before monitoring only predictions.\n\nDrift is not automatically bad, but unexplained drift is risk. Compare training distributions, recent production windows, and slices by region or client version. Alert on schema breaks and severe shifts for high-importance features. Log feature vectors or summaries with prediction IDs so bad decisions can be audited. If retraining is automated, validate that new data has labels of comparable quality and no delayed feedback bias. Feature monitoring is the early-warning system for model behavior."
        ],
        "keyTerms": [
          {
            "term": "Ask why values are missing: random",
            "definition": "Ask why values are missing: random measurement error, user choice, system failure, or label-dependent process."
          },
          {
            "term": "Consider missingness indicator features when …",
            "definition": "Consider missingness indicator features when absence carries signal."
          },
          {
            "term": "Learn imputation values inside the training",
            "definition": "Learn imputation values inside the training fold, never on the whole dataset."
          }
        ],
        "checkYourself": [
          {
            "prompt": "Can describe train/validation/test responsibilities for feature decisions.",
            "reveal": "Feature work continues after launch because input distributions move. A model trained when average order value is 40 dollars may see 75 dollars during holidays. A new mobile app version may stop sending device_locale for 30 percent of traffic. A fraud feature based on IP reputation may drift when a provider changes scoring. Monitor null rates, min/max, quantiles, category frequencies, and embedding coverage for features before monitoring only predictions.\n\nDrift is not automatically bad, but unexplained drift is risk. Compare training distributions, recent production windows, and slices by region or client version. Alert on schema breaks and severe shifts for high-importance features. Log feature vectors or summaries with prediction IDs so bad decisions can be audited. If retraining is automated, validate that new data has labels of comparable quality and no delayed feedback bias. Feature monitoring is the early-warning system for model behavior."
          }
        ]
      },
      {
        "id": "pipelines-make-the-split-honest",
        "heading": "Pipelines make the split honest",
        "paragraphs": [
          "A train/validation/test split is a contract. Training data chooses parameters, validation data chooses modeling decisions, and the test set gives one final estimate after those decisions are frozen. Preprocessing parameters count as parameters. In 5-fold cross-validation, a pipeline refits the scaler, imputer, and encoder five times, once per training fold. Without the pipeline, it is easy to fit preprocessing once on all rows and then cross-validate only the estimator. That leaks validation fold distribution into training. The leak can be subtle: standardizing with the full dataset might use a mean of 50, while a training fold mean is 46. A borderline validation point at 48 shifts from -0.2 to +0.1 standard deviations depending on which mean is used, and a linear decision boundary can flip.",
          "Hold these points explicitly while you study. Restate each one without looking at the list — recognition is not the interview bar; recall is.",
          "• Use Pipeline so every cross-validation fold gets fresh fitted transformers.",
          "• Use ColumnTransformer to keep numeric and categorical transformations explicit.",
          "• Treat feature engineering choices as hyperparameters that belong in validation, not after test-set inspection.",
          "Production lens — Transformation contract: Feature engineering is part of the model contract, not a notebook prelude. If training scales age with mean 42 and standard deviation 12, serving must use those exact fitted values, not recompute from today's request. If categorical encoding maps plan=premium to column 7, production must use the same mapping and a defined behavior for unseen categories. The estimator learns from transformed inputs; inconsistent transformation changes the meaning of every coefficient, split, or embedding.\n\nTreat transformations as versioned artifacts. A pipeline should include imputation, scaling, encoding, tokenization, feature selection, and the estimator so cross-validation and serving use the same steps. Store fitted parameters with the model version. Add tests for schema, null handling, category drift, and output shape. A model with 0.92 validation AUC can fail immediately if production sends columns in a different order or drops the missing-value indicator that carried important signal."
        ],
        "keyTerms": [
          {
            "term": "Use Pipeline so every cross-validation fold",
            "definition": "Use Pipeline so every cross-validation fold gets fresh fitted transformers."
          },
          {
            "term": "Use ColumnTransformer to keep numeric and",
            "definition": "Use ColumnTransformer to keep numeric and categorical transformations explicit."
          },
          {
            "term": "Treat feature engineering choices as hyperpar…",
            "definition": "Treat feature engineering choices as hyperparameters that belong in validation, not after test-set inspection."
          }
        ],
        "workedExample": {
          "title": "Leakage-safe pipeline evaluation",
          "body": "Narrate what each shape and step is doing. If you only recognize the API call, you do not own the idea yet — rewrite the example from memory after one pass.",
          "code": "import numpy as np\nfrom sklearn.compose import ColumnTransformer\nfrom sklearn.impute import SimpleImputer\nfrom sklearn.linear_model import LogisticRegression\nfrom sklearn.model_selection import StratifiedKFold, cross_val_score\nfrom sklearn.pipeline import Pipeline\nfrom sklearn.preprocessing import OneHotEncoder, StandardScaler\n\nX = np.array([\n    [22, 35, \"NYC\", \"free\"], [25, 42, \"LA\", \"free\"],\n    [47, 88, \"SF\", \"pro\"], [38, 76, \"NYC\", \"pro\"],\n    [52, 110, \"SF\", \"team\"], [46, 90, \"LA\", \"pro\"],\n    [56, 120, \"SF\", \"team\"], [55, 95, \"NYC\", \"team\"],\n    [60, 130, \"SF\", \"team\"], [28, 48, \"LA\", \"free\"],\n    [30, 52, \"NYC\", \"pro\"], [42, 80, \"LA\", \"pro\"]\n], dtype=object)\ny = np.array([0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1])\n\npreprocess = ColumnTransformer([\n    (\"num\", Pipeline([(\"impute\", SimpleImputer(strategy=\"median\")), (\"scale\", StandardScaler())]), [0, 1]),\n    (\"cat\", OneHotEncoder(handle_unknown=\"ignore\"), [2, 3])\n])\nmodel = Pipeline([(\"preprocess\", preprocess), (\"clf\", LogisticRegression(max_iter=1000))])\ncv = StratifiedKFold(n_splits=3, shuffle=True, random_state=4)\nscores = cross_val_score(model, X, y, cv=cv, scoring=\"accuracy\")\nprint(\"fold accuracy:\", scores.round(3))\nprint(\"mean accuracy:\", round(scores.mean(), 3))",
          "language": "python"
        },
        "checkYourself": [
          {
            "prompt": "Can identify leakage from fitting preprocessors before splitting.",
            "reveal": "Explain the idea in two sentences, name one metric or invariant you would watch, and state one mistake juniors make. Then connect it back to pipelines make the split honest."
          }
        ]
      },
      {
        "id": "evaluate-features-by-generalization-not-cleverness",
        "heading": "Evaluate features by generalization, not cleverness",
        "paragraphs": [
          "A feature is useful only if it improves validation performance for the metric that matters. More columns can reduce training error while increasing validation error, especially with small datasets. Imagine a churn model with 500 rows and 2,000 one-hot columns from device IDs. The model may assign a strong coefficient to devices seen once in churned rows and report 99 percent training accuracy, but validation accuracy may fall below a simple baseline because the device IDs do not repeat. Watch both metric movement and operational cost: latency, memory, explainability, and monitoring. Feature drift is also a production failure mode. If the average transaction_count_7d was 8 during training and becomes 2 after a product launch, a model that leaned heavily on that feature may become badly calibrated.",
          "Hold these points explicitly while you study. Restate each one without looking at the list — recognition is not the interview bar; recall is.",
          "• Compare feature sets with the same split or the same cross-validation folds.",
          "• Track train and validation metrics together to catch overfitting.",
          "• Monitor feature distributions in production because preprocessing can keep running while meaning changes.",
          "Production lens — Leakage barriers: Leakage happens when training features contain information that would not be available at prediction time. Fitting a scaler before train-test split lets validation influence mean and variance. Encoding a category by target average using the full dataset leaks labels. Building a churn feature from events after the churn date leaks the answer. Leakage often raises metrics just enough to look exciting, then disappears in production because the future is no longer available.\n\nThe barrier is temporal and procedural. Split first, then fit transformations only on training folds. In cross-validation, each fold must fit its own imputer, encoder, and selector inside the fold. For time series, train on past and validate on future, not random rows. For user data, group by user if the same user's history appears multiple times. Ask for every feature: would this exact value be known, with this latency, at the moment the model makes the decision?"
        ],
        "keyTerms": [
          {
            "term": "Compare feature sets with the same",
            "definition": "Compare feature sets with the same split or the same cross-validation folds."
          },
          {
            "term": "Track train and validation metrics together",
            "definition": "Track train and validation metrics together to catch overfitting."
          },
          {
            "term": "Monitor feature distributions in production b…",
            "definition": "Monitor feature distributions in production because preprocessing can keep running while meaning changes."
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
          "Most interview answers fail not because the definition is wrong, but because the candidate never names how the approach breaks. Use this section as a trap checklist for feature engineering playground.",
          "Trap: Fitting scalers, imputers, or encoders before splitting the data. A strong answer preempts it — say what you would monitor, what fallback you would keep, or what simpler baseline you would try first.",
          "Trap: Using ordinal integers for unordered categories without a model-specific reason. A strong answer preempts it — say what you would monitor, what fallback you would keep, or what simpler baseline you would try first.",
          "Trap: Adding high-cardinality IDs that memorize rows instead of generalizing. A strong answer preempts it — say what you would monitor, what fallback you would keep, or what simpler baseline you would try first.",
          "Trap: Comparing feature sets on different random splits and treating noise as progress. A strong answer preempts it — say what you would monitor, what fallback you would keep, or what simpler baseline you would try first.",
          "Trap: Ignoring production feature drift because offline validation looked strong. A strong answer preempts it — say what you would monitor, what fallback you would keep, or what simpler baseline you would try first."
        ],
        "callout": {
          "tone": "warning",
          "body": "If you cannot name a failure mode, you do not yet understand the technique well enough to ship or defend it."
        },
        "checkYourself": [
          {
            "prompt": "Pick the most dangerous pitfall for Feature engineering playground and explain how you would detect it in production or on a whiteboard.",
            "reveal": "Start with: \"Fitting scalers, imputers, or encoders before splitting the data.\" Then add a detection signal (metric, test, or review question) and a mitigation."
          }
        ]
      },
      {
        "id": "deeper-lens",
        "heading": "A deeper production lens",
        "paragraphs": [
          "Transformation contract. Feature engineering is part of the model contract, not a notebook prelude. If training scales age with mean 42 and standard deviation 12, serving must use those exact fitted values, not recompute from today's request. If categorical encoding maps plan=premium to column 7, production must use the same mapping and a defined behavior for unseen categories. The estimator learns from transformed inputs; inconsistent transformation changes the meaning of every coefficient, split, or embedding.\n\nTreat transformations as versioned artifacts. A pipeline should include imputation, scaling, encoding, tokenization, feature selection, and the estimator so cross-validation and serving use the same steps. Store fitted parameters with the model version. Add tests for schema, null handling, category drift, and output shape. A model with 0.92 validation AUC can fail immediately if production sends columns in a different order or drops the missing-value indicator that carried important signal.",
          "Leakage barriers. Leakage happens when training features contain information that would not be available at prediction time. Fitting a scaler before train-test split lets validation influence mean and variance. Encoding a category by target average using the full dataset leaks labels. Building a churn feature from events after the churn date leaks the answer. Leakage often raises metrics just enough to look exciting, then disappears in production because the future is no longer available.\n\nThe barrier is temporal and procedural. Split first, then fit transformations only on training folds. In cross-validation, each fold must fit its own imputer, encoder, and selector inside the fold. For time series, train on past and validate on future, not random rows. For user data, group by user if the same user's history appears multiple times. Ask for every feature: would this exact value be known, with this latency, at the moment the model makes the decision?",
          "Categorical encoding tradeoffs. Categorical features need encoding that matches cardinality and model type. One-hot encoding works well for low-cardinality values like browser type or subscription tier; it creates one binary column per category and avoids implying false order. Ordinal encoding maps categories to integers, which tree models may handle but linear models can misread as magnitude. Target encoding can help high-cardinality categories like merchant ID, but it must be smoothed and computed within folds to avoid leakage.\n\nUnseen categories require an explicit plan. A production request may include a new city or product not present during training. One-hot encoders can ignore unknowns, map them to other, or reserve a bucket. Hashing trick encodes arbitrary categories into a fixed number of buckets, trading collisions for bounded dimension. Embeddings can learn dense representations for frequent categories in neural models. The choice balances memory, interpretability, collision risk, and how fast the category space changes.",
          "Feature monitoring drift. Feature work continues after launch because input distributions move. A model trained when average order value is 40 dollars may see 75 dollars during holidays. A new mobile app version may stop sending device_locale for 30 percent of traffic. A fraud feature based on IP reputation may drift when a provider changes scoring. Monitor null rates, min/max, quantiles, category frequencies, and embedding coverage for features before monitoring only predictions.\n\nDrift is not automatically bad, but unexplained drift is risk. Compare training distributions, recent production windows, and slices by region or client version. Alert on schema breaks and severe shifts for high-importance features. Log feature vectors or summaries with prediction IDs so bad decisions can be audited. If retraining is automated, validate that new data has labels of comparable quality and no delayed feedback bias. Feature monitoring is the early-warning system for model behavior."
        ],
        "keyTerms": [
          {
            "term": "Transformation contract",
            "definition": "Feature engineering is part of the model contract, not a notebook prelude. If training scales age with mean 42 and standard deviation 12, serving must use those exact fitted values, not recompute from today's request. If…"
          },
          {
            "term": "Leakage barriers",
            "definition": "Leakage happens when training features contain information that would not be available at prediction time. Fitting a scaler before train-test split lets validation influence mean and variance. Encoding a category by targ…"
          },
          {
            "term": "Categorical encoding tradeoffs",
            "definition": "Categorical features need encoding that matches cardinality and model type. One-hot encoding works well for low-cardinality values like browser type or subscription tier; it creates one binary column per category and avo…"
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
          "You should now be able to teach feature engineering playground as a story: what problem it solves, how the mechanism works, which assumptions it depends on, and how you would know it failed.",
          "Close the loop by writing a 90-second spoken answer out loud. If you freeze on definitions, return to the orientation and the first technical part. If you freeze on trade-offs, return to failure modes.",
          "Practice prompts from this lesson: How would you prevent preprocessing leakage in a tabular ML project? | When does one-hot encoding become problematic, and what alternatives would you consider? | Why might a KNN model change dramatically after scaling?"
        ],
        "checkYourself": [
          {
            "prompt": "Give a 90-second spoken overview of Feature engineering playground as if starting an interview answer.",
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
        "Can explain how scaling changes distance, regularization, and PCA geometry.",
        "Can choose one-hot encoding for unordered categories and explain high-cardinality risks.",
        "Can build a ColumnTransformer and Pipeline that keeps imputation, encoding, scaling, and modeling inside cross-validation.",
        "Can describe train/validation/test responsibilities for feature decisions.",
        "Can identify leakage from fitting preprocessors before splitting."
      ],
      "nextSteps": [
        "Return to the lesson page and attempt the practice / topic lab with this chapter still open if needed.",
        "Revisit any Check yourself prompts you could not answer out loud.",
        "Optional deeper reading: Column Transformer with Mixed Types (scikit-learn) — https://scikit-learn.org/stable/auto_examples/compose/plot_column_transformer_mixed_types.html",
        "Optional deeper reading: Pipeline and Composite Estimators (scikit-learn) — https://scikit-learn.org/stable/modules/compose.html"
      ]
    }
  },
  "ml-interactive-lab/supervised-learning-workshop": {
    "title": "Chapter: Supervised learning workshop",
    "readingTime": "60-75 min",
    "premise": "Train and compare classifiers using train/validation/test splits, cross-validation, metrics, threshold tuning, and overfitting checks. This Learn chapter expands the short lesson summary into a full study unit you can read continuously, with interactive checks and selection-based AI search when a phrase needs a second opinion.",
    "parts": [
      {
        "id": "orientation",
        "heading": "Why this chapter exists",
        "paragraphs": [
          "Production ML work depends on choosing a reliable baseline, measuring it honestly, and improving it with evidence rather than model hype.",
          "This chapter treats \"Supervised learning workshop\" as a readable study unit: intuition first, then the mechanics you must be able to explain, then the failure modes that show up in interviews and production, and finally how to talk about the topic under time pressure.",
          "Read it like a book chapter. When a phrase is unclear, select it inside the Learn reader and use Search with AI to open Google, Perplexity, or DuckDuckGo without abandoning the chapter."
        ],
        "callout": {
          "tone": "tip",
          "body": "Target reading time is paced for depth, not skimming. Pause at each Check yourself prompt and answer out loud before revealing the guide answer."
        }
      },
      {
        "id": "supervised-learning-maps-examples-to-labels",
        "heading": "Supervised learning maps examples to labels",
        "paragraphs": [
          "In supervised learning, each training row has features X and a known target y. Classification predicts categories such as fraud or not fraud; regression predicts numbers such as delivery time. The core loop is simple: fit a function on labeled examples, then estimate how well it works on unseen examples. A tiny numeric classifier might compute score = 0.04 * income - 1.2 * missed_payments - 1.0. If a user has income=80 and missed_payments=1, score = 3.2 - 1.2 - 1.0 = 1.0, and sigmoid(1.0) is 0.731. With a 0.5 threshold the prediction is positive. The important lesson is that the threshold is not the model; the model gives a score, and the product chooses how much score is enough to act.",
          "Hold these points explicitly while you study. Restate each one without looking at the list — recognition is not the interview bar; recall is.",
          "• Classification usually returns scores or probabilities before hard labels.",
          "• Regression metrics measure distance from the true number; classification metrics count or rank mistakes.",
          "• A good workflow separates model fitting from decision threshold selection.",
          "Production lens — Baseline as instrument: A baseline is a measurement instrument. A majority-class classifier reveals whether accuracy is meaningful; if 97 percent of examples are negative, 97 percent accuracy may mean the model learned nothing. A linear model reveals whether simple additive signal exists. A shallow tree reveals whether a few thresholds explain most outcomes. Before tuning gradient boosting or neural nets, compare against these baselines so improvement is measured against a real floor, not against hope.\n\nBaselines also catch leakage and label problems. If a trivial model reaches 0.99 AUC on a messy business problem, inspect features that encode the label, duplicate rows, or time leakage. If every model performs near random, the labels may be noisy, the features may arrive too late, or the train-test split may differ from production. A good workflow logs baseline metrics, confusion matrix, and slice performance before expensive search. Sophistication without a baseline is theater."
        ],
        "keyTerms": [
          {
            "term": "Classification usually returns scores or prob…",
            "definition": "Classification usually returns scores or probabilities before hard labels."
          },
          {
            "term": "Regression metrics measure distance from the",
            "definition": "Regression metrics measure distance from the true number; classification metrics count or rank mistakes."
          },
          {
            "term": "A good workflow separates model fitting",
            "definition": "A good workflow separates model fitting from decision threshold selection."
          }
        ],
        "checkYourself": [
          {
            "prompt": "Can explain train, validation, and test responsibilities.",
            "reveal": "A baseline is a measurement instrument. A majority-class classifier reveals whether accuracy is meaningful; if 97 percent of examples are negative, 97 percent accuracy may mean the model learned nothing. A linear model reveals whether simple additive signal exists. A shallow tree reveals whether a few thresholds explain most outcomes. Before tuning gradient boosting or neural nets, compare against these baselines so improvement is measured against a real floor, not against hope.\n\nBaselines also catch leakage and label problems. If a trivial model reaches 0.99 AUC on a messy business problem, inspect features that encode the label, duplicate rows, or time leakage. If every model performs near random, the labels may be noisy, the features may arrive too late, or the train-test split may differ from production. A good workflow logs baseline metrics, confusion matrix, and slice performance before expensive search. Sophistication without a baseline is theater."
          }
        ]
      },
      {
        "id": "train-validation-and-test-have-separate-jobs",
        "heading": "Train, validation, and test have separate jobs",
        "paragraphs": [
          "A clean split prevents self-deception. Training data fits parameters such as coefficients and tree splits. Validation data chooses model family, regularization strength, features, and threshold. The test set is held until the end and estimates final performance once choices are frozen. For example, with 10,000 rows you might use 7,000 train, 1,500 validation, and 1,500 test. If logistic regression gets validation AUC 0.82 and random forest gets 0.86, you may choose the forest. If you then try ten forest depths and pick depth 8 because it gets validation AUC 0.88, the validation set has now influenced many decisions. The test set should answer: after all that tuning, what performance should we expect on future data?",
          "Hold these points explicitly while you study. Restate each one without looking at the list — recognition is not the interview bar; recall is.",
          "• Use stratified splits for classification so class ratios are stable.",
          "• Use temporal splits when the deployment problem predicts the future from the past.",
          "• Never tune thresholds, hyperparameters, or feature choices on the final test set.",
          "Production lens — Metric-cost alignment: Metrics encode business trade-offs. Accuracy treats every mistake equally, which fails for rare fraud, disease detection, and safety moderation. Precision asks among predicted positives, how many were truly positive. Recall asks among actual positives, how many did we catch. F1 balances precision and recall, but it still hides explicit cost. ROC AUC summarizes ranking over thresholds; PR AUC is often more informative for imbalanced positives. The right metric comes from the decision cost.\n\nWork a small example. A fraud model reviews 10,000 transactions with 100 real frauds. At one threshold it flags 200 transactions, 80 fraudulent and 120 legitimate. Precision is 40 percent, recall is 80 percent. If manual review costs 2 dollars and missed fraud costs 100 dollars, expected cost is 200 * 2 + 20 * 100 = 2,400 dollars. Another threshold with lower recall but far fewer reviews might be cheaper. Metrics should support threshold decisions, not replace them."
        ],
        "keyTerms": [
          {
            "term": "Use stratified splits for classification so",
            "definition": "Use stratified splits for classification so class ratios are stable."
          },
          {
            "term": "Use temporal splits when the deployment",
            "definition": "Use temporal splits when the deployment problem predicts the future from the past."
          },
          {
            "term": "Never tune thresholds, hyperparameters, or fe…",
            "definition": "Never tune thresholds, hyperparameters, or feature choices on the final test set."
          }
        ],
        "checkYourself": [
          {
            "prompt": "Can compare baselines, linear models, and tree models with stratified cross-validation.",
            "reveal": "Metrics encode business trade-offs. Accuracy treats every mistake equally, which fails for rare fraud, disease detection, and safety moderation. Precision asks among predicted positives, how many were truly positive. Recall asks among actual positives, how many did we catch. F1 balances precision and recall, but it still hides explicit cost. ROC AUC summarizes ranking over thresholds; PR AUC is often more informative for imbalanced positives. The right metric comes from the decision cost.\n\nWork a small example. A fraud model reviews 10,000 transactions with 100 real frauds. At one threshold it flags 200 transactions, 80 fraudulent and 120 legitimate. Precision is 40 percent, recall is 80 percent. If manual review costs 2 dollars and missed fraud costs 100 dollars, expected cost is 200 * 2 + 20 * 100 = 2,400 dollars. Another threshold with lower recall but far fewer reviews might be cheaper. Metrics should support threshold decisions, not replace them."
          }
        ]
      },
      {
        "id": "baselines-keep-progress-honest",
        "heading": "Baselines keep progress honest",
        "paragraphs": [
          "Before comparing complex models, build a simple baseline. A dummy classifier that predicts the majority class might get 95 percent accuracy on a dataset with 95 percent negatives. That sounds strong until recall for the rare positive class is 0. Logistic regression with scaling is often a good first real model because it is fast, calibrated enough for threshold experiments, and inspectable. Tree ensembles are strong when interactions and non-linear thresholds matter. The baseline question in an interview is not \"which model is best\"; it is \"what evidence would convince you to move from simple to complex?\" If a random forest improves validation AUC from 0.78 to 0.80 but doubles latency and is harder to explain, the simpler model may still be the better product choice.",
          "Hold these points explicitly while you study. Restate each one without looking at the list — recognition is not the interview bar; recall is.",
          "• Compare against a dummy or business-rule baseline.",
          "• Prefer simple models until validation evidence justifies complexity.",
          "• Report uncertainty across folds or repeated splits, not one number alone.",
          "Production lens — Cross-validation realism: Cross-validation estimates generalization by training and validating on multiple splits, but the split must match deployment. Random k-fold works for independent, identically distributed rows. It fails when rows from the same user, patient, merchant, or device appear in both train and validation because the model can memorize entity patterns. It fails for time-dependent prediction if future examples help train a model evaluated on the past. The split is part of the experimental design.\n\nUse grouped splits when entities repeat, stratified splits when class balance is important, and time-based splits when production predicts future from past. Keep a final holdout set untouched until model selection is complete. Preprocessing must be fit inside each fold, not before splitting. Report mean and variance across folds; a model with 0.84 +/- 0.10 may be less trustworthy than one with 0.82 +/- 0.02. Validation should simulate production risk, not maximize leaderboard comfort."
        ],
        "keyTerms": [
          {
            "term": "Compare against a dummy or business-rule",
            "definition": "Compare against a dummy or business-rule baseline."
          },
          {
            "term": "Prefer simple models until validation evidence",
            "definition": "Prefer simple models until validation evidence justifies complexity."
          },
          {
            "term": "Report uncertainty across folds or repeated",
            "definition": "Report uncertainty across folds or repeated splits, not one number alone."
          }
        ],
        "workedExample": {
          "title": "Compare supervised baselines with cross-validation",
          "body": "Narrate what each shape and step is doing. If you only recognize the API call, you do not own the idea yet — rewrite the example from memory after one pass.",
          "code": "from sklearn.datasets import load_breast_cancer\nfrom sklearn.dummy import DummyClassifier\nfrom sklearn.ensemble import RandomForestClassifier\nfrom sklearn.linear_model import LogisticRegression\nfrom sklearn.model_selection import StratifiedKFold, cross_val_score\nfrom sklearn.pipeline import Pipeline\nfrom sklearn.preprocessing import StandardScaler\n\nX, y = load_breast_cancer(return_X_y=True)\ncv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)\nmodels = {\n    \"dummy\": DummyClassifier(strategy=\"most_frequent\"),\n    \"logreg\": Pipeline([(\"scale\", StandardScaler()), (\"model\", LogisticRegression(max_iter=1000))]),\n    \"forest\": RandomForestClassifier(n_estimators=120, max_depth=5, random_state=42)\n}\n\nfor name, model in models.items():\n    scores = cross_val_score(model, X, y, cv=cv, scoring=\"roc_auc\")\n    print(f\"{name}: auc={scores.mean():.3f} +/- {scores.std():.3f}\")",
          "language": "python"
        },
        "checkYourself": [
          {
            "prompt": "Can compute accuracy, precision, recall, F1, ROC-AUC, and explain when each is useful.",
            "reveal": "Cross-validation estimates generalization by training and validating on multiple splits, but the split must match deployment. Random k-fold works for independent, identically distributed rows. It fails when rows from the same user, patient, merchant, or device appear in both train and validation because the model can memorize entity patterns. It fails for time-dependent prediction if future examples help train a model evaluated on the past. The split is part of the experimental design.\n\nUse grouped splits when entities repeat, stratified splits when class balance is important, and time-based splits when production predicts future from past. Keep a final holdout set untouched until model selection is complete. Preprocessing must be fit inside each fold, not before splitting. Report mean and variance across folds; a model with 0.84 +/- 0.10 may be less trustworthy than one with 0.82 +/- 0.02. Validation should simulate production risk, not maximize leaderboard comfort."
          }
        ]
      },
      {
        "id": "metrics-encode-the-cost-of-mistakes",
        "heading": "Metrics encode the cost of mistakes",
        "paragraphs": [
          "Accuracy is often too blunt. Consider 100 examples with 10 actual positives. A model predicts 8 positives: 6 are true positives and 2 are false positives. It misses 4 positives and correctly rejects 88 negatives. Accuracy is (6 + 88) / 100 = 94 percent. Precision is 6 / (6 + 2) = 75 percent: when the model says positive, it is right three quarters of the time. Recall is 6 / (6 + 4) = 60 percent: it catches six out of ten positives. If positives are fraudulent payments, recall may matter because missed fraud is expensive. If positives trigger account suspension, precision may matter because false positives harm users. ROC-AUC measures ranking across thresholds; PR-AUC is often more informative when positives are rare.",
          "Hold these points explicitly while you study. Restate each one without looking at the list — recognition is not the interview bar; recall is.",
          "• Precision answers: of predicted positives, how many were correct?",
          "• Recall answers: of actual positives, how many were found?",
          "• AUC metrics evaluate ranking; thresholded metrics evaluate a chosen operating point.",
          "Production lens — Calibration and thresholds: A classifier score is useful as a probability only if it is calibrated. If the model assigns 0.8 risk to 1,000 examples, about 800 should be positive for good calibration. Many models rank well but produce overconfident or underconfident probabilities. Calibration matters when actions depend on expected value, such as approving loans, prioritizing medical review, or deciding whether fraud risk justifies manual inspection.\n\nThresholds turn scores into actions. A spam filter may quarantine above 0.95, put 0.70 to 0.95 in a review folder, and deliver below 0.70. A model can support multiple thresholds for different costs. Choose thresholds on validation data using cost curves, precision-recall trade-offs, or capacity constraints, then monitor after launch. If base rates shift, a fixed threshold may produce too many alerts or miss too many positives. Model training and decision policy are related but separate artifacts."
        ],
        "keyTerms": [
          {
            "term": "Precision answers: of predicted positives, how",
            "definition": "Precision answers: of predicted positives, how many were correct?"
          },
          {
            "term": "Recall answers: of actual positives, how",
            "definition": "Recall answers: of actual positives, how many were found?"
          },
          {
            "term": "AUC metrics evaluate ranking; thresholded met…",
            "definition": "AUC metrics evaluate ranking; thresholded metrics evaluate a chosen operating point."
          }
        ],
        "workedExample": {
          "title": "Compute confusion-derived metrics",
          "body": "Narrate what each shape and step is doing. If you only recognize the API call, you do not own the idea yet — rewrite the example from memory after one pass.",
          "code": "import numpy as np\nfrom sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, confusion_matrix\n\ny_true = np.array([1] * 10 + [0] * 90)\ny_pred = np.array([1] * 6 + [0] * 4 + [1] * 2 + [0] * 88)\n\nprint(\"confusion matrix:\\n\", confusion_matrix(y_true, y_pred))\nprint(\"accuracy:\", round(accuracy_score(y_true, y_pred), 3))\nprint(\"precision:\", round(precision_score(y_true, y_pred), 3))\nprint(\"recall:\", round(recall_score(y_true, y_pred), 3))\nprint(\"f1:\", round(f1_score(y_true, y_pred), 3))",
          "language": "python"
        },
        "checkYourself": [
          {
            "prompt": "Can diagnose overfitting from train/validation metric gaps.",
            "reveal": "A classifier score is useful as a probability only if it is calibrated. If the model assigns 0.8 risk to 1,000 examples, about 800 should be positive for good calibration. Many models rank well but produce overconfident or underconfident probabilities. Calibration matters when actions depend on expected value, such as approving loans, prioritizing medical review, or deciding whether fraud risk justifies manual inspection.\n\nThresholds turn scores into actions. A spam filter may quarantine above 0.95, put 0.70 to 0.95 in a review folder, and deliver below 0.70. A model can support multiple thresholds for different costs. Choose thresholds on validation data using cost curves, precision-recall trade-offs, or capacity constraints, then monitor after launch. If base rates shift, a fixed threshold may produce too many alerts or miss too many positives. Model training and decision policy are related but separate artifacts."
          }
        ]
      },
      {
        "id": "overfitting-is-memorization-that-survives-training-metrics",
        "heading": "Overfitting is memorization that survives training metrics",
        "paragraphs": [
          "A model overfits when it captures noise or quirks of the training sample instead of reusable signal. A decision tree with unlimited depth can split until many leaves contain one row. Training accuracy may reach 100 percent, but validation accuracy drops because those tiny rules do not repeat. Underfitting is the opposite: a model is too simple or poorly trained, so both train and validation performance are weak. The diagnostic is the gap. If train AUC is 0.99 and validation AUC is 0.73, reduce capacity, add regularization, collect more data, remove leaky features, or use cross-validation to check stability. If both are 0.62, inspect features, labels, and whether the problem is learnable before tuning hyperparameters.",
          "Hold these points explicitly while you study. Restate each one without looking at the list — recognition is not the interview bar; recall is.",
          "• High train performance with much lower validation performance indicates overfitting.",
          "• Low train and validation performance indicates underfitting, weak features, or noisy labels.",
          "• Cross-validation reduces split luck but does not fix temporal leakage or deployment mismatch.",
          "Production lens — Baseline as instrument: A baseline is a measurement instrument. A majority-class classifier reveals whether accuracy is meaningful; if 97 percent of examples are negative, 97 percent accuracy may mean the model learned nothing. A linear model reveals whether simple additive signal exists. A shallow tree reveals whether a few thresholds explain most outcomes. Before tuning gradient boosting or neural nets, compare against these baselines so improvement is measured against a real floor, not against hope.\n\nBaselines also catch leakage and label problems. If a trivial model reaches 0.99 AUC on a messy business problem, inspect features that encode the label, duplicate rows, or time leakage. If every model performs near random, the labels may be noisy, the features may arrive too late, or the train-test split may differ from production. A good workflow logs baseline metrics, confusion matrix, and slice performance before expensive search. Sophistication without a baseline is theater."
        ],
        "keyTerms": [
          {
            "term": "High train performance with much lower",
            "definition": "High train performance with much lower validation performance indicates overfitting."
          },
          {
            "term": "Low train and validation performance indicates",
            "definition": "Low train and validation performance indicates underfitting, weak features, or noisy labels."
          },
          {
            "term": "Cross-validation reduces split luck but does",
            "definition": "Cross-validation reduces split luck but does not fix temporal leakage or deployment mismatch."
          }
        ],
        "checkYourself": [
          {
            "prompt": "Can tune a decision threshold using validation data and a cost-aware metric.",
            "reveal": "Explain the idea in two sentences, name one metric or invariant you would watch, and state one mistake juniors make. Then connect it back to overfitting is memorization that survives training metrics."
          }
        ]
      },
      {
        "id": "thresholds-are-product-and-operations-decisions",
        "heading": "Thresholds are product and operations decisions",
        "paragraphs": [
          "Many classifiers output a score between 0 and 1. The default threshold 0.5 is rarely sacred. If a support team can manually review only 100 alerts per day, the threshold may be chosen so the model emits about 100 positives. If a medical screening workflow values catching nearly every possible case, the threshold may be lowered to hit 98 percent recall, accepting more false positives. A numeric walkthrough: scores [0.95, 0.80, 0.55, 0.30] with labels [1, 0, 1, 0]. At threshold 0.5, predictions are [1, 1, 1, 0], precision is 2/3 and recall is 2/2. At threshold 0.85, predictions are [1, 0, 0, 0], precision is 1/1 and recall is 1/2. Neither is universally better; the cost model chooses.",
          "Hold these points explicitly while you study. Restate each one without looking at the list — recognition is not the interview bar; recall is.",
          "• Tune thresholds on validation data after the model is trained.",
          "• Choose metrics that match false-positive and false-negative costs.",
          "• Revisit thresholds when class balance, review capacity, or product policy changes.",
          "Production lens — Metric-cost alignment: Metrics encode business trade-offs. Accuracy treats every mistake equally, which fails for rare fraud, disease detection, and safety moderation. Precision asks among predicted positives, how many were truly positive. Recall asks among actual positives, how many did we catch. F1 balances precision and recall, but it still hides explicit cost. ROC AUC summarizes ranking over thresholds; PR AUC is often more informative for imbalanced positives. The right metric comes from the decision cost.\n\nWork a small example. A fraud model reviews 10,000 transactions with 100 real frauds. At one threshold it flags 200 transactions, 80 fraudulent and 120 legitimate. Precision is 40 percent, recall is 80 percent. If manual review costs 2 dollars and missed fraud costs 100 dollars, expected cost is 200 * 2 + 20 * 100 = 2,400 dollars. Another threshold with lower recall but far fewer reviews might be cheaper. Metrics should support threshold decisions, not replace them."
        ],
        "keyTerms": [
          {
            "term": "Tune thresholds on validation data after",
            "definition": "Tune thresholds on validation data after the model is trained."
          },
          {
            "term": "Choose metrics that match false-positive and",
            "definition": "Choose metrics that match false-positive and false-negative costs."
          },
          {
            "term": "Revisit thresholds when class balance, review",
            "definition": "Revisit thresholds when class balance, review capacity, or product policy changes."
          }
        ],
        "workedExample": {
          "title": "Search thresholds for a recall goal",
          "body": "Narrate what each shape and step is doing. If you only recognize the API call, you do not own the idea yet — rewrite the example from memory after one pass.",
          "code": "import numpy as np\nfrom sklearn.datasets import make_classification\nfrom sklearn.linear_model import LogisticRegression\nfrom sklearn.metrics import precision_score, recall_score\nfrom sklearn.model_selection import train_test_split\nfrom sklearn.pipeline import Pipeline\nfrom sklearn.preprocessing import StandardScaler\n\nX, y = make_classification(n_samples=700, n_features=12, n_informative=5, weights=[0.82, 0.18], random_state=8)\nX_train, X_val, y_train, y_val = train_test_split(X, y, test_size=0.35, stratify=y, random_state=8)\nmodel = Pipeline([(\"scale\", StandardScaler()), (\"clf\", LogisticRegression(max_iter=1000))])\nmodel.fit(X_train, y_train)\nscores = model.predict_proba(X_val)[:, 1]\n\nfor threshold in [0.2, 0.4, 0.6, 0.8]:\n    pred = (scores >= threshold).astype(int)\n    print(threshold, \"precision\", round(precision_score(y_val, pred, zero_division=0), 3), \"recall\", round(recall_score(y_val, pred), 3))",
          "language": "python"
        },
        "callout": {
          "tone": "interview",
          "body": "Interview framing: define the term, give a tiny example, say when you would not use it, and name the metric that proves it worked."
        }
      },
      {
        "id": "failure-modes",
        "heading": "Failure modes and anti-patterns",
        "paragraphs": [
          "Most interview answers fail not because the definition is wrong, but because the candidate never names how the approach breaks. Use this section as a trap checklist for supervised learning workshop.",
          "Trap: Selecting the best model from one lucky split. A strong answer preempts it — say what you would monitor, what fallback you would keep, or what simpler baseline you would try first.",
          "Trap: Reporting accuracy on imbalanced data without class-specific metrics. A strong answer preempts it — say what you would monitor, what fallback you would keep, or what simpler baseline you would try first.",
          "Trap: Tuning threshold or hyperparameters on the final test set. A strong answer preempts it — say what you would monitor, what fallback you would keep, or what simpler baseline you would try first.",
          "Trap: Using random splits for temporal problems where future examples leak into training. A strong answer preempts it — say what you would monitor, what fallback you would keep, or what simpler baseline you would try first.",
          "Trap: Choosing a complex model without comparing latency, interpretability, and maintenance cost. A strong answer preempts it — say what you would monitor, what fallback you would keep, or what simpler baseline you would try first."
        ],
        "callout": {
          "tone": "warning",
          "body": "If you cannot name a failure mode, you do not yet understand the technique well enough to ship or defend it."
        },
        "checkYourself": [
          {
            "prompt": "Pick the most dangerous pitfall for Supervised learning workshop and explain how you would detect it in production or on a whiteboard.",
            "reveal": "Start with: \"Selecting the best model from one lucky split.\" Then add a detection signal (metric, test, or review question) and a mitigation."
          }
        ]
      },
      {
        "id": "deeper-lens",
        "heading": "A deeper production lens",
        "paragraphs": [
          "Baseline as instrument. A baseline is a measurement instrument. A majority-class classifier reveals whether accuracy is meaningful; if 97 percent of examples are negative, 97 percent accuracy may mean the model learned nothing. A linear model reveals whether simple additive signal exists. A shallow tree reveals whether a few thresholds explain most outcomes. Before tuning gradient boosting or neural nets, compare against these baselines so improvement is measured against a real floor, not against hope.\n\nBaselines also catch leakage and label problems. If a trivial model reaches 0.99 AUC on a messy business problem, inspect features that encode the label, duplicate rows, or time leakage. If every model performs near random, the labels may be noisy, the features may arrive too late, or the train-test split may differ from production. A good workflow logs baseline metrics, confusion matrix, and slice performance before expensive search. Sophistication without a baseline is theater.",
          "Metric-cost alignment. Metrics encode business trade-offs. Accuracy treats every mistake equally, which fails for rare fraud, disease detection, and safety moderation. Precision asks among predicted positives, how many were truly positive. Recall asks among actual positives, how many did we catch. F1 balances precision and recall, but it still hides explicit cost. ROC AUC summarizes ranking over thresholds; PR AUC is often more informative for imbalanced positives. The right metric comes from the decision cost.\n\nWork a small example. A fraud model reviews 10,000 transactions with 100 real frauds. At one threshold it flags 200 transactions, 80 fraudulent and 120 legitimate. Precision is 40 percent, recall is 80 percent. If manual review costs 2 dollars and missed fraud costs 100 dollars, expected cost is 200 * 2 + 20 * 100 = 2,400 dollars. Another threshold with lower recall but far fewer reviews might be cheaper. Metrics should support threshold decisions, not replace them.",
          "Cross-validation realism. Cross-validation estimates generalization by training and validating on multiple splits, but the split must match deployment. Random k-fold works for independent, identically distributed rows. It fails when rows from the same user, patient, merchant, or device appear in both train and validation because the model can memorize entity patterns. It fails for time-dependent prediction if future examples help train a model evaluated on the past. The split is part of the experimental design.\n\nUse grouped splits when entities repeat, stratified splits when class balance is important, and time-based splits when production predicts future from past. Keep a final holdout set untouched until model selection is complete. Preprocessing must be fit inside each fold, not before splitting. Report mean and variance across folds; a model with 0.84 +/- 0.10 may be less trustworthy than one with 0.82 +/- 0.02. Validation should simulate production risk, not maximize leaderboard comfort.",
          "Calibration and thresholds. A classifier score is useful as a probability only if it is calibrated. If the model assigns 0.8 risk to 1,000 examples, about 800 should be positive for good calibration. Many models rank well but produce overconfident or underconfident probabilities. Calibration matters when actions depend on expected value, such as approving loans, prioritizing medical review, or deciding whether fraud risk justifies manual inspection.\n\nThresholds turn scores into actions. A spam filter may quarantine above 0.95, put 0.70 to 0.95 in a review folder, and deliver below 0.70. A model can support multiple thresholds for different costs. Choose thresholds on validation data using cost curves, precision-recall trade-offs, or capacity constraints, then monitor after launch. If base rates shift, a fixed threshold may produce too many alerts or miss too many positives. Model training and decision policy are related but separate artifacts."
        ],
        "keyTerms": [
          {
            "term": "Baseline as instrument",
            "definition": "A baseline is a measurement instrument. A majority-class classifier reveals whether accuracy is meaningful; if 97 percent of examples are negative, 97 percent accuracy may mean the model learned nothing. A linear model r…"
          },
          {
            "term": "Metric-cost alignment",
            "definition": "Metrics encode business trade-offs. Accuracy treats every mistake equally, which fails for rare fraud, disease detection, and safety moderation. Precision asks among predicted positives, how many were truly positive. Rec…"
          },
          {
            "term": "Cross-validation realism",
            "definition": "Cross-validation estimates generalization by training and validating on multiple splits, but the split must match deployment. Random k-fold works for independent, identically distributed rows. It fails when rows from the…"
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
          "You should now be able to teach supervised learning workshop as a story: what problem it solves, how the mechanism works, which assumptions it depends on, and how you would know it failed.",
          "Close the loop by writing a 90-second spoken answer out loud. If you freeze on definitions, return to the orientation and the first technical part. If you freeze on trade-offs, return to failure modes.",
          "Practice prompts from this lesson: How would you choose between logistic regression and a random forest? | What metric would you use for fraud detection and why? | Why is cross-validation still not enough for temporal data?"
        ],
        "checkYourself": [
          {
            "prompt": "Give a 90-second spoken overview of Supervised learning workshop as if starting an interview answer.",
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
        "Can explain train, validation, and test responsibilities.",
        "Can compare baselines, linear models, and tree models with stratified cross-validation.",
        "Can compute accuracy, precision, recall, F1, ROC-AUC, and explain when each is useful.",
        "Can diagnose overfitting from train/validation metric gaps.",
        "Can tune a decision threshold using validation data and a cost-aware metric."
      ],
      "nextSteps": [
        "Return to the lesson page and attempt the practice / topic lab with this chapter still open if needed.",
        "Revisit any Check yourself prompts you could not answer out loud.",
        "Optional deeper reading: Supervised Learning (scikit-learn) — https://scikit-learn.org/stable/supervised_learning.html",
        "Optional deeper reading: Model Evaluation (scikit-learn) — https://scikit-learn.org/stable/modules/model_evaluation.html"
      ]
    }
  },
  "ml-interactive-lab/unsupervised-learning-workshop": {
    "title": "Chapter: Unsupervised learning workshop",
    "readingTime": "60-75 min",
    "premise": "Explore clustering and dimensionality reduction with KMeans, PCA, silhouette scores, and matplotlib visualizations. This Learn chapter expands the short lesson summary into a full study unit you can read continuously, with interactive checks and selection-based AI search when a phrase needs a second opinion.",
    "parts": [
      {
        "id": "orientation",
        "heading": "Why this chapter exists",
        "paragraphs": [
          "Unsupervised learning helps you inspect structure before labels exist, compress high-dimensional data, and generate hypotheses for product or data-quality work.",
          "This chapter treats \"Unsupervised learning workshop\" as a readable study unit: intuition first, then the mechanics you must be able to explain, then the failure modes that show up in interviews and production, and finally how to talk about the topic under time pressure.",
          "Read it like a book chapter. When a phrase is unclear, select it inside the Learn reader and use Search with AI to open Google, Perplexity, or DuckDuckGo without abandoning the chapter."
        ],
        "callout": {
          "tone": "tip",
          "body": "Target reading time is paced for depth, not skimming. Pause at each Check yourself prompt and answer out loud before revealing the guide answer."
        }
      },
      {
        "id": "unsupervised-learning-finds-structure-not-truth",
        "heading": "Unsupervised learning finds structure, not truth",
        "paragraphs": [
          "Unsupervised methods receive X without labels y. They can group similar rows, compress features, detect unusual points, or create visualizations, but they do not know what the groups mean. If KMeans finds three clusters in customer behavior, those clusters are not automatically personas. They are geometric patterns under your chosen features and preprocessing. A numeric example makes this clear: points (0, 0), (0, 1), (10, 10), and (10, 11) naturally form two compact groups in raw coordinates. If you add a third feature with values [0, 1000, 0, 1000], distance becomes dominated by that third feature, and the grouping changes to pair rows by the new feature. The algorithm did not become wrong; the representation changed the question.",
          "Hold these points explicitly while you study. Restate each one without looking at the list — recognition is not the interview bar; recall is.",
          "• Use unsupervised results as hypotheses that need profiling and validation.",
          "• Scale features before distance-based clustering or PCA when units differ.",
          "• Do not turn cluster IDs into high-stakes decisions without domain review and monitoring.",
          "Production lens — Distance metric hypothesis: Unsupervised learning discovers structure under assumptions you choose. K-means minimizes squared Euclidean distance to cluster centers, so it prefers spherical, similar-size clusters and is sensitive to feature scale. If income ranges from 0 to 200,000 and age ranges from 0 to 100, income dominates distance unless scaled. Cosine distance may fit text embeddings better because angle matters more than magnitude. DBSCAN uses density and distance thresholds, so it can find irregular shapes but struggles when densities vary widely.\n\nThe output is a hypothesis, not a label oracle. If K-means finds five customer groups, those groups are defined by the selected features, scaling, k value, and algorithm bias. They need domain interpretation and stability checks. Try different seeds, metrics, feature sets, and time windows. A cluster that disappears after standardization was probably scale artifact. A cluster that persists and maps to meaningful behavior may become a segment, but the algorithm alone does not prove it is real."
        ],
        "keyTerms": [
          {
            "term": "Use unsupervised results as hypotheses that",
            "definition": "Use unsupervised results as hypotheses that need profiling and validation."
          },
          {
            "term": "Scale features before distance-based clusteri…",
            "definition": "Scale features before distance-based clustering or PCA when units differ."
          },
          {
            "term": "Do not turn cluster IDs into",
            "definition": "Do not turn cluster IDs into high-stakes decisions without domain review and monitoring."
          }
        ],
        "checkYourself": [
          {
            "prompt": "Can explain KMeans assignment and centroid updates with a numeric example.",
            "reveal": "Unsupervised learning discovers structure under assumptions you choose. K-means minimizes squared Euclidean distance to cluster centers, so it prefers spherical, similar-size clusters and is sensitive to feature scale. If income ranges from 0 to 200,000 and age ranges from 0 to 100, income dominates distance unless scaled. Cosine distance may fit text embeddings better because angle matters more than magnitude. DBSCAN uses density and distance thresholds, so it can find irregular shapes but struggles when densities vary widely.\n\nThe output is a hypothesis, not a label oracle. If K-means finds five customer groups, those groups are defined by the selected features, scaling, k value, and algorithm bias. They need domain interpretation and stability checks. Try different seeds, metrics, feature sets, and time windows. A cluster that disappears after standardization was probably scale artifact. A cluster that persists and maps to meaningful behavior may become a segment, but the algorithm alone does not prove it is real."
          }
        ]
      },
      {
        "id": "kmeans-alternates-assignment-and-centroid-updates",
        "heading": "KMeans alternates assignment and centroid updates",
        "paragraphs": [
          "KMeans represents each cluster by its centroid, the average of assigned points. One iteration has two steps. First, assign each point to the nearest centroid. Second, recompute each centroid as the mean of the assigned points. Suppose centroids start at c0=(0, 0) and c1=(10, 10), and a point p=(1, 2). Its squared distance to c0 is 1^2 + 2^2 = 5. Its squared distance to c1 is 9^2 + 8^2 = 145, so p joins cluster 0. If cluster 0 gets points (0, 0), (1, 2), and (2, 1), the new centroid is ((0+1+2)/3, (0+2+1)/3) = (1, 1). The algorithm repeats until assignments stabilize or improvement becomes tiny.",
          "Hold these points explicitly while you study. Restate each one without looking at the list — recognition is not the interview bar; recall is.",
          "• The objective is low within-cluster squared distance, called inertia in scikit-learn.",
          "• n_init runs multiple random starts because KMeans can settle in local minima.",
          "• KMeans works best for compact, roughly spherical, similarly sized clusters.",
          "Production lens — Choosing cluster count: Many clustering algorithms require a parameter that controls granularity. K-means needs k. The elbow method plots within-cluster sum of squares as k increases and looks for diminishing returns. Silhouette score compares how close each point is to its own cluster versus other clusters. These tools help, but they do not replace domain use. A marketing team that can act on 4 segments may not benefit from 17 mathematically distinct clusters.\n\nCluster count also interacts with stability. Run the algorithm with multiple random seeds and bootstrap samples. If customer A jumps among clusters every run, the boundary is not reliable. If increasing k splits one large group into tiny fragments with no actionable difference, the model may be over-segmenting. The best k is often the smallest number that captures important structure and supports a decision, such as personalization strategy, anomaly triage, or dataset exploration."
        ],
        "keyTerms": [
          {
            "term": "The objective is low within-cluster squared",
            "definition": "The objective is low within-cluster squared distance, called inertia in scikit-learn."
          },
          {
            "term": "n_init runs multiple random starts because",
            "definition": "n_init runs multiple random starts because KMeans can settle in local minima."
          },
          {
            "term": "KMeans works best for compact, roughly",
            "definition": "KMeans works best for compact, roughly spherical, similarly sized clusters."
          }
        ],
        "workedExample": {
          "title": "Inspect KMeans inertia and silhouette",
          "body": "Narrate what each shape and step is doing. If you only recognize the API call, you do not own the idea yet — rewrite the example from memory after one pass.",
          "code": "from sklearn.cluster import KMeans\nfrom sklearn.datasets import make_blobs\nfrom sklearn.metrics import silhouette_score\n\nX, _ = make_blobs(n_samples=250, centers=3, cluster_std=0.8, random_state=4)\nmodel = KMeans(n_clusters=3, n_init=10, random_state=4)\nlabels = model.fit_predict(X)\n\nprint(\"centers:\\n\", model.cluster_centers_.round(2))\nprint(\"inertia:\", round(model.inertia_, 2))\nprint(\"silhouette:\", round(silhouette_score(X, labels), 3))",
          "language": "python"
        },
        "checkYourself": [
          {
            "prompt": "Can choose k using inertia, silhouette, stability, and product usefulness.",
            "reveal": "Many clustering algorithms require a parameter that controls granularity. K-means needs k. The elbow method plots within-cluster sum of squares as k increases and looks for diminishing returns. Silhouette score compares how close each point is to its own cluster versus other clusters. These tools help, but they do not replace domain use. A marketing team that can act on 4 segments may not benefit from 17 mathematically distinct clusters.\n\nCluster count also interacts with stability. Run the algorithm with multiple random seeds and bootstrap samples. If customer A jumps among clusters every run, the boundary is not reliable. If increasing k splits one large group into tiny fragments with no actionable difference, the model may be over-segmenting. The best k is often the smallest number that captures important structure and supports a decision, such as personalization strategy, anomaly triage, or dataset exploration."
          }
        ]
      },
      {
        "id": "choosing-k-combines-curves-scores-and-usefulness",
        "heading": "Choosing k combines curves, scores, and usefulness",
        "paragraphs": [
          "Inertia always decreases as k increases because more centroids can sit closer to points. That means the lowest inertia alone chooses k=n, which is useless. The elbow method looks for a point where the marginal improvement slows. Silhouette score compares how close a point is to its own cluster versus the nearest other cluster. A silhouette near 1 is well separated, near 0 is ambiguous, and below 0 may be assigned poorly. If k=3 has silhouette 0.61 and k=4 has 0.62, the score does not settle the product decision. You still inspect cluster profiles: sizes, feature means, representative examples, stability across random seeds, and whether any downstream action changes.",
          "Hold these points explicitly while you study. Restate each one without looking at the list — recognition is not the interview bar; recall is.",
          "• Use inertia for compactness and silhouette for separation.",
          "• Check cluster sizes; tiny clusters may be outliers or artifacts.",
          "• Prefer the simplest k that produces stable, explainable, useful groups.",
          "Production lens — Projection distortion: Dimensionality reduction preserves some relationships and distorts others. PCA finds orthogonal directions of maximum linear variance, so it is useful for compression and noise reduction when linear structure matters. t-SNE emphasizes local neighborhoods and can create visually separated islands even when global distances are not meaningful. UMAP tries to preserve local manifold structure with more global continuity than t-SNE, but it still depends on parameters such as neighbors and minimum distance.\n\nA beautiful two-dimensional plot is not proof of natural classes. Distances between t-SNE clusters may not mean what they appear to mean, and cluster sizes can be artifacts of perplexity or sampling. Use projections as exploratory views, then validate with original-space metrics, label overlays, stability under parameter changes, and downstream performance. If a projection suggests fraud and legitimate users separate perfectly, check for leakage or plotting a feature derived from the label before celebrating."
        ],
        "keyTerms": [
          {
            "term": "Use inertia for compactness and silhouette",
            "definition": "Use inertia for compactness and silhouette for separation."
          },
          {
            "term": "Check cluster sizes; tiny clusters may",
            "definition": "Check cluster sizes; tiny clusters may be outliers or artifacts."
          },
          {
            "term": "Prefer the simplest k that produces",
            "definition": "Prefer the simplest k that produces stable, explainable, useful groups."
          }
        ],
        "workedExample": {
          "title": "Plot k selection scores",
          "body": "Narrate what each shape and step is doing. If you only recognize the API call, you do not own the idea yet — rewrite the example from memory after one pass.",
          "code": "import matplotlib.pyplot as plt\nfrom sklearn.cluster import KMeans\nfrom sklearn.datasets import make_blobs\nfrom sklearn.metrics import silhouette_score\n\nX, _ = make_blobs(n_samples=300, centers=4, cluster_std=0.75, random_state=21)\nks, inertias, silhouettes = [], [], []\nfor k in range(2, 7):\n    model = KMeans(n_clusters=k, n_init=10, random_state=21)\n    labels = model.fit_predict(X)\n    ks.append(k)\n    inertias.append(model.inertia_)\n    silhouettes.append(silhouette_score(X, labels))\n    print(f\"k={k}: inertia={model.inertia_:.1f} silhouette={silhouettes[-1]:.3f}\")\n\nplt.figure(figsize=(6, 3))\nplt.plot(ks, silhouettes, marker=\"o\")\nplt.xlabel(\"k\")\nplt.ylabel(\"silhouette\")\nplt.title(\"Choose k with separation, not inertia alone\")\nplt.tight_layout()\nplt.show()",
          "language": "python"
        },
        "checkYourself": [
          {
            "prompt": "Can explain PCA as a rotation/projection that maximizes variance.",
            "reveal": "Dimensionality reduction preserves some relationships and distorts others. PCA finds orthogonal directions of maximum linear variance, so it is useful for compression and noise reduction when linear structure matters. t-SNE emphasizes local neighborhoods and can create visually separated islands even when global distances are not meaningful. UMAP tries to preserve local manifold structure with more global continuity than t-SNE, but it still depends on parameters such as neighbors and minimum distance.\n\nA beautiful two-dimensional plot is not proof of natural classes. Distances between t-SNE clusters may not mean what they appear to mean, and cluster sizes can be artifacts of perplexity or sampling. Use projections as exploratory views, then validate with original-space metrics, label overlays, stability under parameter changes, and downstream performance. If a projection suggests fraud and legitimate users separate perfectly, check for leakage or plotting a feature derived from the label before celebrating."
          }
        ]
      },
      {
        "id": "pca-rotates-data-toward-maximum-variance",
        "heading": "PCA rotates data toward maximum variance",
        "paragraphs": [
          "Principal component analysis finds new axes that capture as much variance as possible. In two dimensions, imagine centered points stretched along the line y=x. The first principal component points along that diagonal because moving on that axis explains most spread. A projection turns each point into its coordinate on the new axis. If a centered point is (2, 2) and the unit diagonal vector is (0.707, 0.707), the first PC score is 2*0.707 + 2*0.707 = 2.828. A point (2, -2) projects to 0 on that axis and mostly lives on the second component. PCA is linear and unsupervised: it preserves variance, not class separation or causality.",
          "Hold these points explicitly while you study. Restate each one without looking at the list — recognition is not the interview bar; recall is.",
          "• Centering is part of PCA; scaling is needed when features use different units.",
          "• Explained variance ratio says how much total variance each component keeps.",
          "• Low-dimensional PCA plots are useful diagnostics, not proof of class separability.",
          "Production lens — Anomaly score calibration: Unsupervised anomaly detection ranks unusual points without true labels. Isolation Forest isolates points with random splits; Local Outlier Factor compares local density; reconstruction models flag high reconstruction error. The score is relative to training data and features. A rare but harmless enterprise customer may look anomalous because it buys in bulk. A malicious pattern may look normal after attackers become common. The model surfaces candidates; humans or downstream labels define harm.\n\nThresholds require operating constraints. If investigators can review 100 cases per day, choose the top 100 by score and measure yield. If false positives annoy users, set a higher threshold and monitor missed incidents. Add feedback loops: reviewed anomalies become labels for future supervised models or threshold tuning. Monitor score distributions over time because normal behavior changes. Anomaly systems fail when teams treat unusual as bad without a review process and a cost-aware action policy."
        ],
        "keyTerms": [
          {
            "term": "Centering is part of PCA; scaling",
            "definition": "Centering is part of PCA; scaling is needed when features use different units."
          },
          {
            "term": "Explained variance ratio says how much",
            "definition": "Explained variance ratio says how much total variance each component keeps."
          },
          {
            "term": "Low-dimensional PCA plots are useful diagnost…",
            "definition": "Low-dimensional PCA plots are useful diagnostics, not proof of class separability."
          }
        ],
        "workedExample": {
          "title": "Project Iris to two principal components",
          "body": "Narrate what each shape and step is doing. If you only recognize the API call, you do not own the idea yet — rewrite the example from memory after one pass.",
          "code": "import matplotlib.pyplot as plt\nfrom sklearn.datasets import load_iris\nfrom sklearn.decomposition import PCA\nfrom sklearn.pipeline import Pipeline\nfrom sklearn.preprocessing import StandardScaler\n\niris = load_iris()\npipe = Pipeline([(\"scale\", StandardScaler()), (\"pca\", PCA(n_components=2))])\ncoords = pipe.fit_transform(iris.data)\npca = pipe.named_steps[\"pca\"]\n\nprint(\"explained variance:\", pca.explained_variance_ratio_.round(3))\nplt.figure(figsize=(6, 4))\nplt.scatter(coords[:, 0], coords[:, 1], c=iris.target, cmap=\"viridis\", edgecolor=\"k\")\nplt.xlabel(\"PC1\")\nplt.ylabel(\"PC2\")\nplt.title(\"Iris PCA projection\")\nplt.tight_layout()\nplt.show()",
          "language": "python"
        },
        "checkYourself": [
          {
            "prompt": "Can reduce data to two principal components for visualization.",
            "reveal": "Unsupervised anomaly detection ranks unusual points without true labels. Isolation Forest isolates points with random splits; Local Outlier Factor compares local density; reconstruction models flag high reconstruction error. The score is relative to training data and features. A rare but harmless enterprise customer may look anomalous because it buys in bulk. A malicious pattern may look normal after attackers become common. The model surfaces candidates; humans or downstream labels define harm.\n\nThresholds require operating constraints. If investigators can review 100 cases per day, choose the top 100 by score and measure yield. If false positives annoy users, set a higher threshold and monitor missed incidents. Add feedback loops: reviewed anomalies become labels for future supervised models or threshold tuning. Monitor score distributions over time because normal behavior changes. Anomaly systems fail when teams treat unusual as bad without a review process and a cost-aware action policy."
          }
        ]
      },
      {
        "id": "evaluation-is-indirect-because-labels-are-absent",
        "heading": "Evaluation is indirect because labels are absent",
        "paragraphs": [
          "With no labels, evaluation asks whether the representation is stable, compact, interpretable, and useful for a downstream decision. For clustering, you can measure silhouette, compare cluster profiles, rerun with different seeds, and test whether clusters predict future behavior that was not used to create them. For PCA, you can inspect explained variance, reconstruction error, and whether downstream models perform similarly with fewer dimensions. A concrete compression example: if the first 10 PCs explain 92 percent of variance in a 200-feature dataset, a logistic regression on those PCs may train faster and overfit less. But the remaining 8 percent might contain rare but critical fraud signal, so compression should be validated against the task before deployment.",
          "Hold these points explicitly while you study. Restate each one without looking at the list — recognition is not the interview bar; recall is.",
          "• Use internal metrics, stability checks, and downstream validation together.",
          "• Profile clusters with feature summaries and representative examples.",
          "• Check whether dimensionality reduction removes minority or rare-event signal.",
          "Production lens — Distance metric hypothesis: Unsupervised learning discovers structure under assumptions you choose. K-means minimizes squared Euclidean distance to cluster centers, so it prefers spherical, similar-size clusters and is sensitive to feature scale. If income ranges from 0 to 200,000 and age ranges from 0 to 100, income dominates distance unless scaled. Cosine distance may fit text embeddings better because angle matters more than magnitude. DBSCAN uses density and distance thresholds, so it can find irregular shapes but struggles when densities vary widely.\n\nThe output is a hypothesis, not a label oracle. If K-means finds five customer groups, those groups are defined by the selected features, scaling, k value, and algorithm bias. They need domain interpretation and stability checks. Try different seeds, metrics, feature sets, and time windows. A cluster that disappears after standardization was probably scale artifact. A cluster that persists and maps to meaningful behavior may become a segment, but the algorithm alone does not prove it is real."
        ],
        "keyTerms": [
          {
            "term": "Use internal metrics, stability checks, and",
            "definition": "Use internal metrics, stability checks, and downstream validation together."
          },
          {
            "term": "Profile clusters with feature summaries and",
            "definition": "Profile clusters with feature summaries and representative examples."
          },
          {
            "term": "Check whether dimensionality reduction remove…",
            "definition": "Check whether dimensionality reduction removes minority or rare-event signal."
          }
        ],
        "checkYourself": [
          {
            "prompt": "Can name failure modes of clustering and dimensionality reduction.",
            "reveal": "Explain the idea in two sentences, name one metric or invariant you would watch, and state one mistake juniors make. Then connect it back to evaluation is indirect because labels are absent."
          }
        ]
      },
      {
        "id": "failure-modes-come-from-shape-scale-and-storytelling",
        "heading": "Failure modes come from shape, scale, and storytelling",
        "paragraphs": [
          "KMeans assumes round clusters and uses means, so it struggles with crescent shapes, unequal densities, and outliers. A single far-away point can pull a centroid. PCA assumes linear structure and can hide small but important directions if most variance comes from nuisance factors such as user activity volume. The human failure mode is storytelling: naming clusters \"power users\" or \"at-risk customers\" after looking at two high-level averages. Good practice is to name clusters descriptively first, such as \"high sessions, low purchases\", then test product hypotheses. If a cluster is unstable across weeks or disappears after scaling, it should not drive product strategy.",
          "Hold these points explicitly while you study. Restate each one without looking at the list — recognition is not the interview bar; recall is.",
          "• Inspect plots when possible, but remember high-dimensional structure can mislead 2D views.",
          "• Compare results across random seeds, time windows, and preprocessing choices.",
          "• Use domain language only after validating that clusters are stable and actionable.",
          "Production lens — Choosing cluster count: Many clustering algorithms require a parameter that controls granularity. K-means needs k. The elbow method plots within-cluster sum of squares as k increases and looks for diminishing returns. Silhouette score compares how close each point is to its own cluster versus other clusters. These tools help, but they do not replace domain use. A marketing team that can act on 4 segments may not benefit from 17 mathematically distinct clusters.\n\nCluster count also interacts with stability. Run the algorithm with multiple random seeds and bootstrap samples. If customer A jumps among clusters every run, the boundary is not reliable. If increasing k splits one large group into tiny fragments with no actionable difference, the model may be over-segmenting. The best k is often the smallest number that captures important structure and supports a decision, such as personalization strategy, anomaly triage, or dataset exploration."
        ],
        "keyTerms": [
          {
            "term": "Inspect plots when possible, but remember",
            "definition": "Inspect plots when possible, but remember high-dimensional structure can mislead 2D views."
          },
          {
            "term": "Compare results across random seeds, time",
            "definition": "Compare results across random seeds, time windows, and preprocessing choices."
          },
          {
            "term": "Use domain language only after validating",
            "definition": "Use domain language only after validating that clusters are stable and actionable."
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
          "Most interview answers fail not because the definition is wrong, but because the candidate never names how the approach breaks. Use this section as a trap checklist for unsupervised learning workshop.",
          "Trap: Treating the elbow method as an exact answer. A strong answer preempts it — say what you would monitor, what fallback you would keep, or what simpler baseline you would try first.",
          "Trap: Skipping scaling before KMeans or PCA. A strong answer preempts it — say what you would monitor, what fallback you would keep, or what simpler baseline you would try first.",
          "Trap: Assuming PCA components are causally meaningful. A strong answer preempts it — say what you would monitor, what fallback you would keep, or what simpler baseline you would try first.",
          "Trap: Naming clusters as personas without profiling or validation. A strong answer preempts it — say what you would monitor, what fallback you would keep, or what simpler baseline you would try first.",
          "Trap: Deploying cluster labels in sensitive workflows without fairness and stability checks. A strong answer preempts it — say what you would monitor, what fallback you would keep, or what simpler baseline you would try first."
        ],
        "callout": {
          "tone": "warning",
          "body": "If you cannot name a failure mode, you do not yet understand the technique well enough to ship or defend it."
        },
        "checkYourself": [
          {
            "prompt": "Pick the most dangerous pitfall for Unsupervised learning workshop and explain how you would detect it in production or on a whiteboard.",
            "reveal": "Start with: \"Treating the elbow method as an exact answer.\" Then add a detection signal (metric, test, or review question) and a mitigation."
          }
        ]
      },
      {
        "id": "deeper-lens",
        "heading": "A deeper production lens",
        "paragraphs": [
          "Distance metric hypothesis. Unsupervised learning discovers structure under assumptions you choose. K-means minimizes squared Euclidean distance to cluster centers, so it prefers spherical, similar-size clusters and is sensitive to feature scale. If income ranges from 0 to 200,000 and age ranges from 0 to 100, income dominates distance unless scaled. Cosine distance may fit text embeddings better because angle matters more than magnitude. DBSCAN uses density and distance thresholds, so it can find irregular shapes but struggles when densities vary widely.\n\nThe output is a hypothesis, not a label oracle. If K-means finds five customer groups, those groups are defined by the selected features, scaling, k value, and algorithm bias. They need domain interpretation and stability checks. Try different seeds, metrics, feature sets, and time windows. A cluster that disappears after standardization was probably scale artifact. A cluster that persists and maps to meaningful behavior may become a segment, but the algorithm alone does not prove it is real.",
          "Choosing cluster count. Many clustering algorithms require a parameter that controls granularity. K-means needs k. The elbow method plots within-cluster sum of squares as k increases and looks for diminishing returns. Silhouette score compares how close each point is to its own cluster versus other clusters. These tools help, but they do not replace domain use. A marketing team that can act on 4 segments may not benefit from 17 mathematically distinct clusters.\n\nCluster count also interacts with stability. Run the algorithm with multiple random seeds and bootstrap samples. If customer A jumps among clusters every run, the boundary is not reliable. If increasing k splits one large group into tiny fragments with no actionable difference, the model may be over-segmenting. The best k is often the smallest number that captures important structure and supports a decision, such as personalization strategy, anomaly triage, or dataset exploration.",
          "Projection distortion. Dimensionality reduction preserves some relationships and distorts others. PCA finds orthogonal directions of maximum linear variance, so it is useful for compression and noise reduction when linear structure matters. t-SNE emphasizes local neighborhoods and can create visually separated islands even when global distances are not meaningful. UMAP tries to preserve local manifold structure with more global continuity than t-SNE, but it still depends on parameters such as neighbors and minimum distance.\n\nA beautiful two-dimensional plot is not proof of natural classes. Distances between t-SNE clusters may not mean what they appear to mean, and cluster sizes can be artifacts of perplexity or sampling. Use projections as exploratory views, then validate with original-space metrics, label overlays, stability under parameter changes, and downstream performance. If a projection suggests fraud and legitimate users separate perfectly, check for leakage or plotting a feature derived from the label before celebrating.",
          "Anomaly score calibration. Unsupervised anomaly detection ranks unusual points without true labels. Isolation Forest isolates points with random splits; Local Outlier Factor compares local density; reconstruction models flag high reconstruction error. The score is relative to training data and features. A rare but harmless enterprise customer may look anomalous because it buys in bulk. A malicious pattern may look normal after attackers become common. The model surfaces candidates; humans or downstream labels define harm.\n\nThresholds require operating constraints. If investigators can review 100 cases per day, choose the top 100 by score and measure yield. If false positives annoy users, set a higher threshold and monitor missed incidents. Add feedback loops: reviewed anomalies become labels for future supervised models or threshold tuning. Monitor score distributions over time because normal behavior changes. Anomaly systems fail when teams treat unusual as bad without a review process and a cost-aware action policy."
        ],
        "keyTerms": [
          {
            "term": "Distance metric hypothesis",
            "definition": "Unsupervised learning discovers structure under assumptions you choose. K-means minimizes squared Euclidean distance to cluster centers, so it prefers spherical, similar-size clusters and is sensitive to feature scale. I…"
          },
          {
            "term": "Choosing cluster count",
            "definition": "Many clustering algorithms require a parameter that controls granularity. K-means needs k. The elbow method plots within-cluster sum of squares as k increases and looks for diminishing returns. Silhouette score compares …"
          },
          {
            "term": "Projection distortion",
            "definition": "Dimensionality reduction preserves some relationships and distorts others. PCA finds orthogonal directions of maximum linear variance, so it is useful for compression and noise reduction when linear structure matters. t-…"
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
          "You should now be able to teach unsupervised learning workshop as a story: what problem it solves, how the mechanism works, which assumptions it depends on, and how you would know it failed.",
          "Close the loop by writing a 90-second spoken answer out loud. If you freeze on definitions, return to the orientation and the first technical part. If you freeze on trade-offs, return to failure modes.",
          "Practice prompts from this lesson: How would you choose k for KMeans? | What does PCA preserve, and what can it hide? | How would you validate that discovered customer segments are useful?"
        ],
        "checkYourself": [
          {
            "prompt": "Give a 90-second spoken overview of Unsupervised learning workshop as if starting an interview answer.",
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
        "Can explain KMeans assignment and centroid updates with a numeric example.",
        "Can choose k using inertia, silhouette, stability, and product usefulness.",
        "Can explain PCA as a rotation/projection that maximizes variance.",
        "Can reduce data to two principal components for visualization.",
        "Can name failure modes of clustering and dimensionality reduction."
      ],
      "nextSteps": [
        "Return to the lesson page and attempt the practice / topic lab with this chapter still open if needed.",
        "Revisit any Check yourself prompts you could not answer out loud.",
        "Optional deeper reading: Clustering (scikit-learn) — https://scikit-learn.org/stable/modules/clustering.html",
        "Optional deeper reading: Decomposing Signals in Components (scikit-learn) — https://scikit-learn.org/stable/modules/decomposition.html"
      ]
    }
  }
};
