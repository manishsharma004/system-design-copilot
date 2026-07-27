/** @type {Record<string, import('../learnChapters.js').LessonLearnChapter>} */
export const mlProductionLabChapters = {
  "ml-production-lab/leakage-safe-pipelines": {
    "title": "Chapter: Leakage-safe pipelines",
    "readingTime": "55-70 min",
    "premise": "Build ColumnTransformer pipelines and demonstrate cross-validation leakage mistakes versus honest sklearn Pipeline evaluation. This Learn chapter expands the short lesson summary into a full study unit you can read continuously, with interactive checks and selection-based AI search when a phrase needs a second opinion.",
    "parts": [
      {
        "id": "orientation",
        "heading": "Why this chapter exists",
        "paragraphs": [
          "Preprocessing leakage creates optimistic offline metrics that collapse in production. Interviewers expect you to put imputation, scaling, and encoding inside fold-safe pipelines and to prove why order matters.",
          "This chapter treats \"Leakage-safe pipelines\" as a readable study unit: intuition first, then the mechanics you must be able to explain, then the failure modes that show up in interviews and production, and finally how to talk about the topic under time pressure.",
          "Read it like a book chapter. When a phrase is unclear, select it inside the Learn reader and use Search with AI to open Google, Perplexity, or DuckDuckGo without abandoning the chapter."
        ],
        "callout": {
          "tone": "tip",
          "body": "Target reading time is paced for depth, not skimming. Pause at each Check yourself prompt and answer out loud before revealing the guide answer."
        }
      },
      {
        "id": "leakage-is-information-flowing-from-the-future-into-training",
        "heading": "Leakage is information flowing from the future into training",
        "paragraphs": [
          "In tabular ML, leakage often hides inside preprocessing. If you compute a median on all rows, then split train/test, the test distribution already influenced training features. If you encode categories with target statistics computed from the full dataset, labels leak. Even standard scaling is leaky when fit on all data before CV. The model may look 2-5 points better offline than it deserves. Production then underperforms and trust erodes. The cure is procedural: any transformation that learns parameters from data must see only training rows for that fit. sklearn Pipeline and ColumnTransformer make the correct pattern the default if you use them with cross_val_score. Interview answers should give both the principle and a concrete numeric story.",
          "Hold these points explicitly while you study. Restate each one without looking at the list — recognition is not the interview bar; recall is.",
          "• Learned preprocessing parameters are model parameters.",
          "• Fit them inside training folds, not on the full dataset.",
          "• Pipelines encode the safe order of operations.",
          "Production lens — Leakage makes offline metrics liars: Data leakage lets the model see information at training or validation time that would not be available at honest prediction time. Classic forms include label leakage (features that are proxies for the target), time-travel features (values filled only after the event), and group leakage (same customer, patient, or session in both train and test). The symptom is stellar offline AUC that collapses in a shadow deploy. Treat leakage as a release-blocking defect, not a modeling footnote.\n\nThe mental model is a prediction-time contract: for each row, define the timestamp and entity state that would be visible to a production service. Any feature whose provenance violates that contract is illegal. ETL convenience fields—next_month_ticket_count, settlement_status_final, post-hoc fraud_queue_flag—are frequent offenders because warehouses join history for analytics, not for point-in-time serving."
        ],
        "keyTerms": [
          {
            "term": "Learned preprocessing parameters are model pa…",
            "definition": "Learned preprocessing parameters are model parameters."
          },
          {
            "term": "Fit them inside training folds, not",
            "definition": "Fit them inside training folds, not on the full dataset."
          },
          {
            "term": "Pipelines encode the safe order of",
            "definition": "Pipelines encode the safe order of operations."
          }
        ],
        "workedExample": {
          "title": "Unsafe vs safe scaling mean",
          "body": "Narrate what each shape and step is doing. If you only recognize the API call, you do not own the idea yet — rewrite the example from memory after one pass.",
          "code": "import numpy as np\nfrom sklearn.model_selection import train_test_split\nfrom sklearn.preprocessing import StandardScaler\n\nX = np.arange(10, dtype=float).reshape(-1, 1)\ny = (X.ravel() > 4).astype(int)\nX_train, X_test, _, _ = train_test_split(X, y, test_size=0.3, random_state=0)\nleaky_mean = X.mean()\nsafe_mean = X_train.mean()\nprint('full mean (leaky if used before split):', leaky_mean)\nprint('train mean (safe):', safe_mean)\nprint('test mean:', X_test.mean())",
          "language": "python"
        },
        "checkYourself": [
          {
            "prompt": "Can explain preprocessing leakage with a concrete example.",
            "reveal": "Data leakage lets the model see information at training or validation time that would not be available at honest prediction time. Classic forms include label leakage (features that are proxies for the target), time-travel features (values filled only after the event), and group leakage (same customer, patient, or session in both train and test). The symptom is stellar offline AUC that collapses in a shadow deploy. Treat leakage as a release-blocking defect, not a modeling footnote.\n\nThe mental model is a prediction-time contract: for each row, define the timestamp and entity state that would be visible to a production service. Any feature whose provenance violates that contract is illegal. ETL convenience fields—next_month_ticket_count, settlement_status_final, post-hoc fraud_queue_flag—are frequent offenders because warehouses join history for analytics, not for point-in-time serving."
          }
        ]
      },
      {
        "id": "columntransformer-keeps-feature-types-explicit",
        "heading": "ColumnTransformer keeps feature types explicit",
        "paragraphs": [
          "Real tables mix numeric and categorical columns. ColumnTransformer applies different transformers to column subsets and concatenates the results. Example: columns [age, spend, city, plan] use median imputation + scaling on [0,1] and most_frequent imputation + one-hot on [2,3]. This prevents the classic bug of scaling city strings or one-hotting continuous ages by accident. In interviews, draw the diagram: raw columns -> typed pipelines -> combined feature matrix -> estimator. Use handle_unknown='ignore' for one-hot so unseen categories at serve time do not crash. Keep column indices or names stable between training and serving contracts.",
          "Hold these points explicitly while you study. Restate each one without looking at the list — recognition is not the interview bar; recall is.",
          "• Separate numeric and categorical branches explicitly.",
          "• handle_unknown='ignore' makes one-hot serving robust.",
          "• Column order/names are part of the serving contract.",
          "Production lens — Point-in-time joins and entity splits: Point-in-time correct feature joins ensure that for prediction time t, only events strictly before t (or before t minus a policy lag) contribute. Feature stores and as-of join logic exist to enforce this; notebooks that merge full history on entity ID do not. Unit-test a few entities with known event timelines: a feature computed \"as of Tuesday\" must ignore Wednesday's payment.\n\nSplit by the generalization unit you will see in production. If the service scores new customers, random ticket-level splits leak writing style and history across folds—use GroupKFold or hash assignment on customer_id. Time-based splits catch temporal leakage and concept shift; nested CV keeps hyperparameter search from overfitting the test fold. Stratifying labels alone does not fix entity leakage."
        ],
        "keyTerms": [
          {
            "term": "Separate numeric and categorical branches exp…",
            "definition": "Separate numeric and categorical branches explicitly."
          },
          {
            "term": "handle_unknown='ignore' makes one-hot serving…",
            "definition": "handle_unknown='ignore' makes one-hot serving robust."
          },
          {
            "term": "Column order/names are part of the",
            "definition": "Column order/names are part of the serving contract."
          }
        ],
        "workedExample": {
          "title": "Mixed-type ColumnTransformer",
          "body": "Narrate what each shape and step is doing. If you only recognize the API call, you do not own the idea yet — rewrite the example from memory after one pass.",
          "code": "import numpy as np\nfrom sklearn.compose import ColumnTransformer\nfrom sklearn.impute import SimpleImputer\nfrom sklearn.pipeline import Pipeline\nfrom sklearn.preprocessing import OneHotEncoder, StandardScaler\n\nX = np.array([\n    [22, 35, 'NYC', 'free'],\n    [41, np.nan, 'SF', 'pro'],\n    [np.nan, 76, 'NYC', 'pro'],\n    [55, 95, 'LA', 'team'],\n], dtype=object)\nnumeric = Pipeline([('impute', SimpleImputer(strategy='median')), ('scale', StandardScaler())])\ncategorical = Pipeline([\n    ('impute', SimpleImputer(strategy='most_frequent')),\n    ('onehot', OneHotEncoder(handle_unknown='ignore', sparse_output=False)),\n])\npre = ColumnTransformer([('num', numeric, [0, 1]), ('cat', categorical, [2, 3])])\nprint(pre.fit_transform(X).round(3))",
          "language": "python"
        },
        "checkYourself": [
          {
            "prompt": "Can build a ColumnTransformer for numeric and categorical columns.",
            "reveal": "Point-in-time correct feature joins ensure that for prediction time t, only events strictly before t (or before t minus a policy lag) contribute. Feature stores and as-of join logic exist to enforce this; notebooks that merge full history on entity ID do not. Unit-test a few entities with known event timelines: a feature computed \"as of Tuesday\" must ignore Wednesday's payment.\n\nSplit by the generalization unit you will see in production. If the service scores new customers, random ticket-level splits leak writing style and history across folds—use GroupKFold or hash assignment on customer_id. Time-based splits catch temporal leakage and concept shift; nested CV keeps hyperparameter search from overfitting the test fold. Stratifying labels alone does not fix entity leakage."
          }
        ]
      },
      {
        "id": "cross-validation-must-refit-preprocessing-each-fold",
        "heading": "Cross-validation must refit preprocessing each fold",
        "paragraphs": [
          "In 5-fold CV, each fold holds out a validation slice. A leakage-safe pipeline refits imputer/scaler/encoder on the four training folds only, then transforms the held-out fold. An unsafe workflow fits preprocessing on all rows once, then runs CV only on the classifier. The unsafe path lets validation rows influence means, medians, and category sets. Demo this by creating a dataset where a rare category appears once: if the encoder sees it globally, folds that should treat it as unknown no longer do. Numeric demos can also compare CV accuracy with Pipeline vs manual pre-fit scaling; the leaky path often looks better. Interviewers listen for 'refit transformers inside each fold' without prompting.",
          "Hold these points explicitly while you study. Restate each one without looking at the list — recognition is not the interview bar; recall is.",
          "• cross_val_score on a Pipeline refits all steps per fold.",
          "• Pre-fitting transformers before CV is a common silent leak.",
          "• Rare categories and medians are typical leak channels.",
          "Production lens — Target proxies and silent channels: Some features are not the label but are causally downstream of it: chargebacks after fraud, cancellation reason codes after churn, clinician notes written after diagnosis. Others encode operational reactions to the label. Correlation with the target is a red flag, not a victory. Ablation and time-shift tests help: if shifting a feature later in time destroys performance, it may have been leaking future information.\n\nAlso watch preprocessing leakage: fitting scalers, imputers, or target encoders on the full dataset before splitting, or using rare-category statistics computed with test rows. sklearn Pipelines with ColumnTransformer inside cross-validation folds exist specifically so fitting happens only on training folds. A leakage audit checklist belongs in CI for training jobs: schema checks, timestamp asserts, group split enforcement, and forbidden-column denylists."
        ],
        "keyTerms": [
          {
            "term": "cross_val_score on a Pipeline refits all",
            "definition": "cross_val_score on a Pipeline refits all steps per fold."
          },
          {
            "term": "Pre-fitting transformers before CV is a",
            "definition": "Pre-fitting transformers before CV is a common silent leak."
          },
          {
            "term": "Rare categories and medians are typical",
            "definition": "Rare categories and medians are typical leak channels."
          }
        ],
        "workedExample": {
          "title": "CV with a full Pipeline",
          "body": "Narrate what each shape and step is doing. If you only recognize the API call, you do not own the idea yet — rewrite the example from memory after one pass.",
          "code": "import numpy as np\nfrom sklearn.compose import ColumnTransformer\nfrom sklearn.linear_model import LogisticRegression\nfrom sklearn.model_selection import StratifiedKFold, cross_val_score\nfrom sklearn.pipeline import Pipeline\nfrom sklearn.preprocessing import OneHotEncoder, StandardScaler\nfrom sklearn.impute import SimpleImputer\n\nX = np.array([\n    [22, 35, 'NYC', 'free'], [25, 42, 'LA', 'free'],\n    [47, 88, 'SF', 'pro'], [38, 76, 'NYC', 'pro'],\n    [52, 110, 'SF', 'team'], [46, 90, 'LA', 'pro'],\n    [56, 120, 'SF', 'team'], [55, 95, 'NYC', 'team'],\n    [60, 130, 'SF', 'team'], [28, 48, 'LA', 'free'],\n    [30, 52, 'NYC', 'pro'], [42, 80, 'LA', 'pro'],\n], dtype=object)\ny = np.array([0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1])\npre = ColumnTransformer([\n    ('num', Pipeline([('imp', SimpleImputer(strategy='median')), ('sc', StandardScaler())]), [0, 1]),\n    ('cat', OneHotEncoder(handle_unknown='ignore'), [2, 3]),\n])\nclf = Pipeline([('pre', pre), ('model', LogisticRegression(max_iter=1000))])\ncv = StratifiedKFold(n_splits=3, shuffle=True, random_state=4)\nprint(cross_val_score(clf, X, y, cv=cv, scoring='accuracy').round(3))",
          "language": "python"
        },
        "checkYourself": [
          {
            "prompt": "Can evaluate models with Pipeline + cross_val_score safely.",
            "reveal": "Some features are not the label but are causally downstream of it: chargebacks after fraud, cancellation reason codes after churn, clinician notes written after diagnosis. Others encode operational reactions to the label. Correlation with the target is a red flag, not a victory. Ablation and time-shift tests help: if shifting a feature later in time destroys performance, it may have been leaking future information.\n\nAlso watch preprocessing leakage: fitting scalers, imputers, or target encoders on the full dataset before splitting, or using rare-category statistics computed with test rows. sklearn Pipelines with ColumnTransformer inside cross-validation folds exist specifically so fitting happens only on training folds. A leakage audit checklist belongs in CI for training jobs: schema checks, timestamp asserts, group split enforcement, and forbidden-column denylists."
          }
        ]
      },
      {
        "id": "demonstrate-a-leaky-workflow-numerically",
        "heading": "Demonstrate a leaky workflow numerically",
        "paragraphs": [
          "Construct a clear demo: generate numeric features, scale using the full dataset, then evaluate a model with CV on the already scaled matrix. Compare to a Pipeline that scales inside folds. On some synthetic sets the difference is small; on others, especially with small n and heavy outliers, leaky CV accuracy rises. Another demo: compute a feature equal to the target mean encoding with global averages, which can nearly perfect train metrics. Even if this lesson focuses on scaling/encoding, mention target leakage and temporal leakage (training on future rows) as sibling bugs. The interviewing move is to propose an experiment that isolates the leak: identical estimator and splits, only preprocessing placement changes.",
          "Hold these points explicitly while you study. Restate each one without looking at the list — recognition is not the interview bar; recall is.",
          "• Hold estimator and splits fixed when comparing leaky vs safe preprocessing.",
          "• Target encoding and temporal splits are related leakage families.",
          "• Small data makes preprocessing leakage more dangerous.",
          "Production lens — When metrics drop after fixing leakage: Honest pipelines often look worse offline. That is success: you removed fantasy performance. Recalibrate stakeholder expectations, compare to a simple baseline under the same honest split, and invest in features that are legally available at serve time. Shadow traffic and delayed-label evaluation validate that the new offline number predicts reality.\n\nDocument the prediction-time contract next to the model card: entity keys, cutoff rules, feature versions, and split policy. Future contributors should not reintroduce next_month_* columns because an analyst dashboard exposed them. Leakage safety is a property of the pipeline and culture, not a one-time notebook cleanup."
        ],
        "keyTerms": [
          {
            "term": "Hold estimator and splits fixed when",
            "definition": "Hold estimator and splits fixed when comparing leaky vs safe preprocessing."
          },
          {
            "term": "Target encoding and temporal splits are",
            "definition": "Target encoding and temporal splits are related leakage families."
          },
          {
            "term": "Small data makes preprocessing leakage more",
            "definition": "Small data makes preprocessing leakage more dangerous."
          }
        ],
        "workedExample": {
          "title": "Compare leaky pre-scaling vs Pipeline scaling",
          "body": "Narrate what each shape and step is doing. If you only recognize the API call, you do not own the idea yet — rewrite the example from memory after one pass.",
          "code": "import numpy as np\nfrom sklearn.datasets import make_classification\nfrom sklearn.linear_model import LogisticRegression\nfrom sklearn.model_selection import StratifiedKFold, cross_val_score\nfrom sklearn.pipeline import Pipeline\nfrom sklearn.preprocessing import StandardScaler\n\nX, y = make_classification(n_samples=240, n_features=8, random_state=3)\nX[:, 0] *= 25\ncv = StratifiedKFold(n_splits=5, shuffle=True, random_state=3)\nleaky_X = StandardScaler().fit_transform(X)\nleaky = cross_val_score(LogisticRegression(max_iter=1000), leaky_X, y, cv=cv)\nsafe = cross_val_score(\n    Pipeline([('sc', StandardScaler()), ('m', LogisticRegression(max_iter=1000))]),\n    X, y, cv=cv,\n)\nprint('leaky mean', round(leaky.mean(), 4), 'safe mean', round(safe.mean(), 4))",
          "language": "python"
        },
        "checkYourself": [
          {
            "prompt": "Can demonstrate a leaky pre-fit scaling workflow.",
            "reveal": "Honest pipelines often look worse offline. That is success: you removed fantasy performance. Recalibrate stakeholder expectations, compare to a simple baseline under the same honest split, and invest in features that are legally available at serve time. Shadow traffic and delayed-label evaluation validate that the new offline number predicts reality.\n\nDocument the prediction-time contract next to the model card: entity keys, cutoff rules, feature versions, and split policy. Future contributors should not reintroduce next_month_* columns because an analyst dashboard exposed them. Leakage safety is a property of the pipeline and culture, not a one-time notebook cleanup."
          }
        ]
      },
      {
        "id": "serving-must-reuse-fitted-pipeline-parameters",
        "heading": "Serving must reuse fitted pipeline parameters",
        "paragraphs": [
          "After training, persist the entire Pipeline, not only the classifier coefficients. At serving time, call pipeline.predict(X_live) so imputation values, scaler means, and one-hot categories match training. A frequent production bug reimplements preprocessing in SQL with slightly different null handling. Suddenly medians diverge and calibration drifts. Contracts should include column names/types, allowed categories, and missingness behavior. In interviews, describe CI tests that feed a golden batch through training preprocessing and serving preprocessing and assert equality. Also discuss train/serve skew monitoring: feature distributions and fraction of unknown categories after one-hot ignore.",
          "Hold these points explicitly while you study. Restate each one without looking at the list — recognition is not the interview bar; recall is.",
          "• Serialize the full preprocessing+model pipeline together.",
          "• Avoid reimplementing transforms in a second language without parity tests.",
          "• Monitor unknown-category rates after deployment.",
          "Production lens — Leakage makes offline metrics liars: Data leakage lets the model see information at training or validation time that would not be available at honest prediction time. Classic forms include label leakage (features that are proxies for the target), time-travel features (values filled only after the event), and group leakage (same customer, patient, or session in both train and test). The symptom is stellar offline AUC that collapses in a shadow deploy. Treat leakage as a release-blocking defect, not a modeling footnote.\n\nThe mental model is a prediction-time contract: for each row, define the timestamp and entity state that would be visible to a production service. Any feature whose provenance violates that contract is illegal. ETL convenience fields—next_month_ticket_count, settlement_status_final, post-hoc fraud_queue_flag—are frequent offenders because warehouses join history for analytics, not for point-in-time serving."
        ],
        "keyTerms": [
          {
            "term": "Serialize the full preprocessing+model pipeli…",
            "definition": "Serialize the full preprocessing+model pipeline together."
          },
          {
            "term": "Avoid reimplementing transforms in a second",
            "definition": "Avoid reimplementing transforms in a second language without parity tests."
          },
          {
            "term": "Monitor unknown-category rates after deployment.",
            "definition": "Monitor unknown-category rates after deployment."
          }
        ],
        "checkYourself": [
          {
            "prompt": "Can describe train/serve parity requirements for fitted transforms.",
            "reveal": "Explain the idea in two sentences, name one metric or invariant you would watch, and state one mistake juniors make. Then connect it back to serving must reuse fitted pipeline parameters."
          }
        ]
      },
      {
        "id": "checklist-language-for-ml-system-design-interviews",
        "heading": "Checklist language for ML system design interviews",
        "paragraphs": [
          "When asked how you prevent leakage, answer in layers: data splitting policy (random vs time-based), preprocessing inside pipelines, feature engineering from past windows only, target leakage review for columns that partially encode the label, and evaluation hygiene (single final test set). Mention that AutoML and manual notebooks are especially leak-prone because cells get run out of order. Offer a concrete code pattern: ColumnTransformer + Pipeline + StratifiedKFold or TimeSeriesSplit. Close with detection: if offline metrics are much better than online, suspect leakage, train/serve skew, or label delay. This lesson's exercises force you to build the safe pattern and measure a leaky alternative.",
          "Hold these points explicitly while you study. Restate each one without looking at the list — recognition is not the interview bar; recall is.",
          "• Speak in layers: split policy, pipeline discipline, feature timing, eval hygiene.",
          "• Notebooks need extra care because execution order is fragile.",
          "• Offline/online metric gaps should trigger leakage investigations.",
          "Production lens — Point-in-time joins and entity splits: Point-in-time correct feature joins ensure that for prediction time t, only events strictly before t (or before t minus a policy lag) contribute. Feature stores and as-of join logic exist to enforce this; notebooks that merge full history on entity ID do not. Unit-test a few entities with known event timelines: a feature computed \"as of Tuesday\" must ignore Wednesday's payment.\n\nSplit by the generalization unit you will see in production. If the service scores new customers, random ticket-level splits leak writing style and history across folds—use GroupKFold or hash assignment on customer_id. Time-based splits catch temporal leakage and concept shift; nested CV keeps hyperparameter search from overfitting the test fold. Stratifying labels alone does not fix entity leakage."
        ],
        "keyTerms": [
          {
            "term": "Speak in layers: split policy, pipeline",
            "definition": "Speak in layers: split policy, pipeline discipline, feature timing, eval hygiene."
          },
          {
            "term": "Notebooks need extra care because execution",
            "definition": "Notebooks need extra care because execution order is fragile."
          },
          {
            "term": "Offline/online metric gaps should trigger lea…",
            "definition": "Offline/online metric gaps should trigger leakage investigations."
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
          "Most interview answers fail not because the definition is wrong, but because the candidate never names how the approach breaks. Use this section as a trap checklist for leakage-safe pipelines.",
          "Trap: Fitting scalers or encoders before splitting or outside CV folds. A strong answer preempts it — say what you would monitor, what fallback you would keep, or what simpler baseline you would try first.",
          "Trap: Saving only model weights and re-coding preprocessing elsewhere. A strong answer preempts it — say what you would monitor, what fallback you would keep, or what simpler baseline you would try first.",
          "Trap: Using target-derived features computed from the full sample. A strong answer preempts it — say what you would monitor, what fallback you would keep, or what simpler baseline you would try first.",
          "Trap: Ignoring unknown categories at serving time. A strong answer preempts it — say what you would monitor, what fallback you would keep, or what simpler baseline you would try first.",
          "Trap: Comparing leaky and safe methods with different splits accidentally. A strong answer preempts it — say what you would monitor, what fallback you would keep, or what simpler baseline you would try first."
        ],
        "callout": {
          "tone": "warning",
          "body": "If you cannot name a failure mode, you do not yet understand the technique well enough to ship or defend it."
        },
        "checkYourself": [
          {
            "prompt": "Pick the most dangerous pitfall for Leakage-safe pipelines and explain how you would detect it in production or on a whiteboard.",
            "reveal": "Start with: \"Fitting scalers or encoders before splitting or outside CV folds.\" Then add a detection signal (metric, test, or review question) and a mitigation."
          }
        ]
      },
      {
        "id": "deeper-lens",
        "heading": "A deeper production lens",
        "paragraphs": [
          "Leakage makes offline metrics liars. Data leakage lets the model see information at training or validation time that would not be available at honest prediction time. Classic forms include label leakage (features that are proxies for the target), time-travel features (values filled only after the event), and group leakage (same customer, patient, or session in both train and test). The symptom is stellar offline AUC that collapses in a shadow deploy. Treat leakage as a release-blocking defect, not a modeling footnote.\n\nThe mental model is a prediction-time contract: for each row, define the timestamp and entity state that would be visible to a production service. Any feature whose provenance violates that contract is illegal. ETL convenience fields—next_month_ticket_count, settlement_status_final, post-hoc fraud_queue_flag—are frequent offenders because warehouses join history for analytics, not for point-in-time serving.",
          "Point-in-time joins and entity splits. Point-in-time correct feature joins ensure that for prediction time t, only events strictly before t (or before t minus a policy lag) contribute. Feature stores and as-of join logic exist to enforce this; notebooks that merge full history on entity ID do not. Unit-test a few entities with known event timelines: a feature computed \"as of Tuesday\" must ignore Wednesday's payment.\n\nSplit by the generalization unit you will see in production. If the service scores new customers, random ticket-level splits leak writing style and history across folds—use GroupKFold or hash assignment on customer_id. Time-based splits catch temporal leakage and concept shift; nested CV keeps hyperparameter search from overfitting the test fold. Stratifying labels alone does not fix entity leakage.",
          "Target proxies and silent channels. Some features are not the label but are causally downstream of it: chargebacks after fraud, cancellation reason codes after churn, clinician notes written after diagnosis. Others encode operational reactions to the label. Correlation with the target is a red flag, not a victory. Ablation and time-shift tests help: if shifting a feature later in time destroys performance, it may have been leaking future information.\n\nAlso watch preprocessing leakage: fitting scalers, imputers, or target encoders on the full dataset before splitting, or using rare-category statistics computed with test rows. sklearn Pipelines with ColumnTransformer inside cross-validation folds exist specifically so fitting happens only on training folds. A leakage audit checklist belongs in CI for training jobs: schema checks, timestamp asserts, group split enforcement, and forbidden-column denylists.",
          "When metrics drop after fixing leakage. Honest pipelines often look worse offline. That is success: you removed fantasy performance. Recalibrate stakeholder expectations, compare to a simple baseline under the same honest split, and invest in features that are legally available at serve time. Shadow traffic and delayed-label evaluation validate that the new offline number predicts reality.\n\nDocument the prediction-time contract next to the model card: entity keys, cutoff rules, feature versions, and split policy. Future contributors should not reintroduce next_month_* columns because an analyst dashboard exposed them. Leakage safety is a property of the pipeline and culture, not a one-time notebook cleanup."
        ],
        "keyTerms": [
          {
            "term": "Leakage makes offline metrics liars",
            "definition": "Data leakage lets the model see information at training or validation time that would not be available at honest prediction time. Classic forms include label leakage (features that are proxies for the target), time-trave…"
          },
          {
            "term": "Point-in-time joins and entity splits",
            "definition": "Point-in-time correct feature joins ensure that for prediction time t, only events strictly before t (or before t minus a policy lag) contribute. Feature stores and as-of join logic exist to enforce this; notebooks that …"
          },
          {
            "term": "Target proxies and silent channels",
            "definition": "Some features are not the label but are causally downstream of it: chargebacks after fraud, cancellation reason codes after churn, clinician notes written after diagnosis. Others encode operational reactions to the label…"
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
          "You should now be able to teach leakage-safe pipelines as a story: what problem it solves, how the mechanism works, which assumptions it depends on, and how you would know it failed.",
          "Close the loop by writing a 90-second spoken answer out loud. If you freeze on definitions, return to the orientation and the first technical part. If you freeze on trade-offs, return to failure modes.",
          "Practice prompts from this lesson: How can StandardScaler leak information in cross-validation? | How would you preprocess mixed numeric/categorical data safely? | What do you serialize for production inference?"
        ],
        "checkYourself": [
          {
            "prompt": "Give a 90-second spoken overview of Leakage-safe pipelines as if starting an interview answer.",
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
        "Can explain preprocessing leakage with a concrete example.",
        "Can build a ColumnTransformer for numeric and categorical columns.",
        "Can evaluate models with Pipeline + cross_val_score safely.",
        "Can demonstrate a leaky pre-fit scaling workflow.",
        "Can describe train/serve parity requirements for fitted transforms."
      ],
      "nextSteps": [
        "Return to the lesson page and attempt the practice / topic lab with this chapter still open if needed.",
        "Revisit any Check yourself prompts you could not answer out loud.",
        "Optional deeper reading: scikit-learn: Cross-validation estimators and Pipelines (scikit-learn) — https://scikit-learn.org/stable/modules/cross_validation.html",
        "Optional deeper reading: scikit-learn: GroupKFold (scikit-learn) — https://scikit-learn.org/stable/modules/generated/sklearn.model_selection.GroupKFold.html"
      ]
    }
  },
  "ml-production-lab/drift-and-monitoring-lab": {
    "title": "Chapter: Drift and monitoring lab",
    "readingTime": "60-75 min",
    "premise": "Implement PSI and KS-style drift checks, plot calibration curves, and practice monitoring workflows with NumPy, sklearn, and matplotlib. This Learn chapter expands the short lesson summary into a full study unit you can read continuously, with interactive checks and selection-based AI search when a phrase needs a second opinion.",
    "parts": [
      {
        "id": "orientation",
        "heading": "Why this chapter exists",
        "paragraphs": [
          "Models decay when data or labeling processes change. Interview-ready engineers can quantify feature drift, watch calibration, and decide when to retrain versus debug pipelines.",
          "This chapter treats \"Drift and monitoring lab\" as a readable study unit: intuition first, then the mechanics you must be able to explain, then the failure modes that show up in interviews and production, and finally how to talk about the topic under time pressure.",
          "Read it like a book chapter. When a phrase is unclear, select it inside the Learn reader and use Search with AI to open Google, Perplexity, or DuckDuckGo without abandoning the chapter."
        ],
        "callout": {
          "tone": "tip",
          "body": "Target reading time is paced for depth, not skimming. Pause at each Check yourself prompt and answer out loud before revealing the guide answer."
        }
      },
      {
        "id": "production-models-fail-quietly-without-monitoring",
        "heading": "Production models fail quietly without monitoring",
        "paragraphs": [
          "A classifier can keep returning scores while the world shifts. Marketing changes the incoming user mix, a sensor starts clipping values, or fraudsters adapt. Accuracy measured last quarter no longer applies. Monitoring watches input distributions, prediction distributions, calibration, and outcome metrics when labels arrive late. Feature drift asks whether X changed. Concept drift asks whether P(y|X) changed. Prediction drift can be an early proxy when labels are delayed. In interviews, structure your answer as: detect, diagnose, act. Detection uses statistical tests and distance metrics; diagnosis traces pipeline bugs vs real world change; action may be retrain, rollback, or throttle. This lab focuses on measurable detectors you can code.",
          "Hold these points explicitly while you study. Restate each one without looking at the list — recognition is not the interview bar; recall is.",
          "• Separate data drift from concept drift in explanations.",
          "• Use prediction drift when labels are delayed.",
          "• Pair alerts with diagnosis playbooks, not only dashboards.",
          "Production lens — Three drifts, three responses: Data drift is a change in input distribution P(X). Prediction drift is a change in model output distribution P(Ŷ) or score histograms. Concept drift is a change in P(Y|X)—the meaning of features relative to labels. They are not interchangeable. A UI redesign can shift clicks (data drift) while the ranking function remains fine; a policy change can keep features stable while labels flip meaning (concept drift). Detectors and playbooks must distinguish these cases.\n\nPopulation Stability Index, KS tests, and embedding-distance monitors catch input and prediction shifts. Outcome proxies—CTR, conversion, chargeback rate—with sufficient delay catch concept issues. Blind auto-retrain on PSI alone creates thrash: you may fit a transient campaign spike or amplify bias. Require evidence that the mapping to outcomes degraded, or that a known schema/policy change landed, before heavy retrain."
        ],
        "keyTerms": [
          {
            "term": "Separate data drift from concept drift",
            "definition": "Separate data drift from concept drift in explanations."
          },
          {
            "term": "Use prediction drift when labels are",
            "definition": "Use prediction drift when labels are delayed."
          },
          {
            "term": "Pair alerts with diagnosis playbooks, not",
            "definition": "Pair alerts with diagnosis playbooks, not only dashboards."
          }
        ],
        "workedExample": {
          "title": "Shift a feature distribution on purpose",
          "body": "Narrate what each shape and step is doing. If you only recognize the API call, you do not own the idea yet — rewrite the example from memory after one pass.",
          "code": "import numpy as np\n\nrng = np.random.default_rng(0)\ntrain = rng.normal(0, 1, size=1000)\nlive = rng.normal(0.8, 1.2, size=1000)\nprint('train mean/std', round(train.mean(), 3), round(train.std(), 3))\nprint('live mean/std', round(live.mean(), 3), round(live.std(), 3))",
          "language": "python"
        },
        "checkYourself": [
          {
            "prompt": "Can implement PSI with smoothed bucket proportions.",
            "reveal": "Data drift is a change in input distribution P(X). Prediction drift is a change in model output distribution P(Ŷ) or score histograms. Concept drift is a change in P(Y|X)—the meaning of features relative to labels. They are not interchangeable. A UI redesign can shift clicks (data drift) while the ranking function remains fine; a policy change can keep features stable while labels flip meaning (concept drift). Detectors and playbooks must distinguish these cases.\n\nPopulation Stability Index, KS tests, and embedding-distance monitors catch input and prediction shifts. Outcome proxies—CTR, conversion, chargeback rate—with sufficient delay catch concept issues. Blind auto-retrain on PSI alone creates thrash: you may fit a transient campaign spike or amplify bias. Require evidence that the mapping to outcomes degraded, or that a known schema/policy change landed, before heavy retrain."
          }
        ]
      },
      {
        "id": "psi-summarizes-bucketed-distribution-change",
        "heading": "PSI summarizes bucketed distribution change",
        "paragraphs": [
          "Population Stability Index compares a baseline histogram to a current histogram. For each bucket i, contribution is (c_i - b_i) * ln(c_i / b_i) where b and c are proportions. Sum over buckets to get PSI. Rules of thumb often used in industry: below 0.1 stable, 0.1-0.25 moderate, above 0.25 large shift—but treat thresholds as policy choices, not laws. Example: baseline proportions [0.5, 0.5], current [0.8, 0.2] yields a sizable PSI. Add epsilon to avoid log(0). Use quantile bins from baseline so rare live values do not invent unstable edges. PSI works for numeric features after binning and for categorical features with shared category sets. Interviewers like candidates who can implement PSI and interpret it cautiously.",
          "Hold these points explicitly while you study. Restate each one without looking at the list — recognition is not the interview bar; recall is.",
          "• PSI needs comparable buckets/categories between baseline and current.",
          "• Add smoothing to proportions before taking logs.",
          "• Thresholds should be tuned to false-alert tolerance.",
          "Production lens — Slices beat global averages: Global AUC or MAE can hold while a critical slice collapses: new users, one country, mobile clients, a single SKU category. Product launches and embedding refreshes often harm a localized cohort first. Monitor slices with dedicated thresholds and volume floors so noisy tiny segments do not page you constantly while still catching concentrated harm.\n\nChoose slices from business risk and known change surfaces, not from every categorical column. Pair with ownership: who gets paged, what dashboard they open, and whether the first action is investigate, mitigate (fallback), retrain, or rollback. Slice alerts without playbooks become ignored noise."
        ],
        "keyTerms": [
          {
            "term": "PSI needs comparable buckets/categories betwe…",
            "definition": "PSI needs comparable buckets/categories between baseline and current."
          },
          {
            "term": "Add smoothing to proportions before taking",
            "definition": "Add smoothing to proportions before taking logs."
          },
          {
            "term": "Thresholds should be tuned to false-alert",
            "definition": "Thresholds should be tuned to false-alert tolerance."
          }
        ],
        "workedExample": {
          "title": "Compute PSI for two histograms",
          "body": "Narrate what each shape and step is doing. If you only recognize the API call, you do not own the idea yet — rewrite the example from memory after one pass.",
          "code": "import numpy as np\n\ndef psi(base, curr, eps=1e-6):\n    base = np.asarray(base, dtype=float)\n    curr = np.asarray(curr, dtype=float)\n    base = base / base.sum()\n    curr = curr / curr.sum()\n    base = np.clip(base, eps, None)\n    curr = np.clip(curr, eps, None)\n    return float(np.sum((curr - base) * np.log(curr / base)))\n\nprint('stable', round(psi([50, 50], [49, 51]), 4))\nprint('shifted', round(psi([50, 50], [80, 20]), 4))",
          "language": "python"
        },
        "checkYourself": [
          {
            "prompt": "Can compute a KS-style distance between two samples.",
            "reveal": "Global AUC or MAE can hold while a critical slice collapses: new users, one country, mobile clients, a single SKU category. Product launches and embedding refreshes often harm a localized cohort first. Monitor slices with dedicated thresholds and volume floors so noisy tiny segments do not page you constantly while still catching concentrated harm.\n\nChoose slices from business risk and known change surfaces, not from every categorical column. Pair with ownership: who gets paged, what dashboard they open, and whether the first action is investigate, mitigate (fallback), retrain, or rollback. Slice alerts without playbooks become ignored noise."
          }
        ]
      },
      {
        "id": "ks-style-checks-compare-cumulative-distributions",
        "heading": "KS-style checks compare cumulative distributions",
        "paragraphs": [
          "The Kolmogorov-Smirnov statistic is the maximum absolute difference between two empirical CDFs. For one-dimensional numeric features, sort values or use histograms to approximate CDFs. If training ages and live ages differ by a large KS distance, the feature drifted. KS does not require arbitrary business buckets, which is an advantage over PSI, but high-volume monitoring often still bins for speed and interpretability. For a workshop, compute KS on samples with NumPy: evaluate the largest vertical gap between CDFs on a shared grid. Pair statistical magnitude with practical impact: a tiny KS on an unused feature may not matter; a moderate KS on the top feature might. Always connect drift alerts to model sensitivity.",
          "Hold these points explicitly while you study. Restate each one without looking at the list — recognition is not the interview bar; recall is.",
          "• KS measures the largest CDF gap between two samples.",
          "• Interpret drift with feature importance and error impact.",
          "• Use shared evaluation grids when approximating CDFs.",
          "Production lens — Label delay and proxy metrics: Many labels arrive late—fraud weeks later, credit default months later, long-term retention even later. You cannot wait for perfect labels to know the model is broken today. Use leading proxies that historically correlate with the delayed label, plus human review samples, while being explicit about proxy risk. Short-term CTR is not long-term satisfaction; treat proxy moves as hypotheses.\n\nFor delayed labels, maintain a maturation window in evaluation: compare predictions only against labels that have had time to settle, and track performance by cohort age. Shadow modes and champion/challenger setups help validate a retrain before cutover when labels are slow. Document the delay so on-call does not expect same-day ground truth that cannot exist."
        ],
        "keyTerms": [
          {
            "term": "KS measures the largest CDF gap",
            "definition": "KS measures the largest CDF gap between two samples."
          },
          {
            "term": "Interpret drift with feature importance and",
            "definition": "Interpret drift with feature importance and error impact."
          },
          {
            "term": "Use shared evaluation grids when approximating",
            "definition": "Use shared evaluation grids when approximating CDFs."
          }
        ],
        "workedExample": {
          "title": "Approximate KS distance with a value grid",
          "body": "Narrate what each shape and step is doing. If you only recognize the API call, you do not own the idea yet — rewrite the example from memory after one pass.",
          "code": "import numpy as np\n\ndef ks_distance(a, b, grid=None):\n    a = np.sort(np.asarray(a))\n    b = np.sort(np.asarray(b))\n    if grid is None:\n        grid = np.linspace(min(a[0], b[0]), max(a[-1], b[-1]), 200)\n    cdf_a = np.searchsorted(a, grid, side='right') / len(a)\n    cdf_b = np.searchsorted(b, grid, side='right') / len(b)\n    return float(np.max(np.abs(cdf_a - cdf_b)))\n\nrng = np.random.default_rng(1)\nprint(round(ks_distance(rng.normal(0, 1, 2000), rng.normal(0, 1, 2000)), 4))\nprint(round(ks_distance(rng.normal(0, 1, 2000), rng.normal(1.0, 1, 2000)), 4))",
          "language": "python"
        },
        "checkYourself": [
          {
            "prompt": "Can plot and interpret a calibration curve.",
            "reveal": "Many labels arrive late—fraud weeks later, credit default months later, long-term retention even later. You cannot wait for perfect labels to know the model is broken today. Use leading proxies that historically correlate with the delayed label, plus human review samples, while being explicit about proxy risk. Short-term CTR is not long-term satisfaction; treat proxy moves as hypotheses.\n\nFor delayed labels, maintain a maturation window in evaluation: compare predictions only against labels that have had time to settle, and track performance by cohort age. Shadow modes and champion/challenger setups help validate a retrain before cutover when labels are slow. Document the delay so on-call does not expect same-day ground truth that cannot exist."
          }
        ]
      },
      {
        "id": "calibration-asks-whether-probabilities-mean-what-they-say",
        "heading": "Calibration asks whether probabilities mean what they say",
        "paragraphs": [
          "A well-calibrated model predicts 0.8 for cases that are positive about 80% of the time. Drift and overfitting both break calibration. Reliability curves bin predictions and plot predicted mean vs empirical positive rate. sklearn.calibration.calibration_curve helps. Example: scores concentrated at 0.9 while true rate is 0.6 indicate overconfidence. Monitoring calibration over time catches silent degradation even when ROC-AUC looks stable. Interventions include isotonic/Platt recalibration on recent labeled data, threshold retuning, or full retrain. In interviews, distinguish ranking quality (AUC) from probability quality (calibration, Brier score). Products that show probabilities or allocate budgets need calibration more than pure ranking ads click models sometimes do.",
          "Hold these points explicitly while you study. Restate each one without looking at the list — recognition is not the interview bar; recall is.",
          "• AUC can stay high while probabilities become unreliable.",
          "• Calibration curves compare predicted vs observed frequencies.",
          "• Recalibration needs fresh labels and careful leakage control.",
          "Production lens — Alerts must map to actions: Every monitor should answer: what changed, how bad, who acts, and what the allowed actions are. Investigate means check schema, upstream ETL, and traffic composition. Retrain means a controlled pipeline with honest splits and approval. Rollback means revert model or feature version under the serving contract. If an alert has no action, delete or demote it.\n\nGood lab practice is to simulate a drift event—feature mean shift, score inflation, slice failure—and walk the playbook on a toy dashboard. Production ML reliability is operational design: detectors, slices, proxies, and decisions wired together, not a single KS p-value printed in a notebook."
        ],
        "keyTerms": [
          {
            "term": "AUC can stay high while probabilities",
            "definition": "AUC can stay high while probabilities become unreliable."
          },
          {
            "term": "Calibration curves compare predicted vs observed",
            "definition": "Calibration curves compare predicted vs observed frequencies."
          },
          {
            "term": "Recalibration needs fresh labels and careful",
            "definition": "Recalibration needs fresh labels and careful leakage control."
          }
        ],
        "workedExample": {
          "title": "Plot a calibration curve with matplotlib",
          "body": "Narrate what each shape and step is doing. If you only recognize the API call, you do not own the idea yet — rewrite the example from memory after one pass.",
          "code": "import numpy as np\nimport matplotlib.pyplot as plt\nfrom sklearn.datasets import make_classification\nfrom sklearn.linear_model import LogisticRegression\nfrom sklearn.model_selection import train_test_split\nfrom sklearn.calibration import calibration_curve\n\nX, y = make_classification(n_samples=1200, n_features=8, weights=[0.7, 0.3], random_state=2)\nX_tr, X_te, y_tr, y_te = train_test_split(X, y, test_size=0.33, random_state=2, stratify=y)\nproba = LogisticRegression(max_iter=1000).fit(X_tr, y_tr).predict_proba(X_te)[:, 1]\nprob_true, prob_pred = calibration_curve(y_te, proba, n_bins=8, strategy='quantile')\nplt.figure()\nplt.plot([0, 1], [0, 1], '--', label='perfect')\nplt.plot(prob_pred, prob_true, marker='o', label='model')\nplt.xlabel('predicted'); plt.ylabel('empirical'); plt.legend(); plt.title('Calibration')\nplt.show()\nprint('bin centers:', np.round(prob_pred, 3))\nprint('empirical:', np.round(prob_true, 3))",
          "language": "python"
        },
        "checkYourself": [
          {
            "prompt": "Can assemble a minimal drift monitoring report.",
            "reveal": "Every monitor should answer: what changed, how bad, who acts, and what the allowed actions are. Investigate means check schema, upstream ETL, and traffic composition. Retrain means a controlled pipeline with honest splits and approval. Rollback means revert model or feature version under the serving contract. If an alert has no action, delete or demote it.\n\nGood lab practice is to simulate a drift event—feature mean shift, score inflation, slice failure—and walk the playbook on a toy dashboard. Production ML reliability is operational design: detectors, slices, proxies, and decisions wired together, not a single KS p-value printed in a notebook."
          }
        ]
      },
      {
        "id": "build-a-minimal-monitoring-report",
        "heading": "Build a minimal monitoring report",
        "paragraphs": [
          "A practical weekly report for one model might include: top feature PSI table, KS for key numeric inputs, prediction-score histogram vs baseline, calibration curve on recently labeled traffic, and online business metrics. Automate thresholds and require owners for alerts. Example action tree: if PSI high only for a feature that lost pipeline parity, fix serving; if many features shift after a product launch and labels confirm metric drop, retrain; if scores shift but labels are unchanged, investigate selection bias. Keep baseline windows explicit (training period vs last stable week). For the lab, compute PSI/KS on synthetic train vs live arrays and print a text report. Matplotlib plots help stakeholders see calibration gaps quickly.",
          "Hold these points explicitly while you study. Restate each one without looking at the list — recognition is not the interview bar; recall is.",
          "• Baselines must be versioned just like models.",
          "• Alert ownership matters as much as metric choice.",
          "• Diagnosis should distinguish bugs from true world change.",
          "Production lens — Three drifts, three responses: Data drift is a change in input distribution P(X). Prediction drift is a change in model output distribution P(Ŷ) or score histograms. Concept drift is a change in P(Y|X)—the meaning of features relative to labels. They are not interchangeable. A UI redesign can shift clicks (data drift) while the ranking function remains fine; a policy change can keep features stable while labels flip meaning (concept drift). Detectors and playbooks must distinguish these cases.\n\nPopulation Stability Index, KS tests, and embedding-distance monitors catch input and prediction shifts. Outcome proxies—CTR, conversion, chargeback rate—with sufficient delay catch concept issues. Blind auto-retrain on PSI alone creates thrash: you may fit a transient campaign spike or amplify bias. Require evidence that the mapping to outcomes degraded, or that a known schema/policy change landed, before heavy retrain."
        ],
        "keyTerms": [
          {
            "term": "Baselines must be versioned just like",
            "definition": "Baselines must be versioned just like models."
          },
          {
            "term": "Alert ownership matters as much as",
            "definition": "Alert ownership matters as much as metric choice."
          },
          {
            "term": "Diagnosis should distinguish bugs from true",
            "definition": "Diagnosis should distinguish bugs from true world change."
          }
        ],
        "workedExample": {
          "title": "Text drift report for one feature",
          "body": "Narrate what each shape and step is doing. If you only recognize the API call, you do not own the idea yet — rewrite the example from memory after one pass.",
          "code": "import numpy as np\n\ndef psi_from_samples(base, curr, bins=10, eps=1e-6):\n    qs = np.quantile(base, np.linspace(0, 1, bins + 1))\n    qs[-1] += 1e-9\n    b_counts = np.histogram(base, bins=qs)[0].astype(float)\n    c_counts = np.histogram(curr, bins=qs)[0].astype(float)\n    b = np.clip(b_counts / b_counts.sum(), eps, None)\n    c = np.clip(c_counts / c_counts.sum(), eps, None)\n    return float(np.sum((c - b) * np.log(c / b)))\n\nrng = np.random.default_rng(4)\nbase = rng.normal(10, 2, 2000)\nlive = rng.normal(11.5, 2.5, 2000)\nprint('feature=spend psi=', round(psi_from_samples(base, live), 4))",
          "language": "python"
        },
        "checkYourself": [
          {
            "prompt": "Can separate detection, diagnosis, and action in interview answers.",
            "reveal": "Explain the idea in two sentences, name one metric or invariant you would watch, and state one mistake juniors make. Then connect it back to build a minimal monitoring report."
          }
        ]
      },
      {
        "id": "interview-narrative-for-ml-monitoring",
        "heading": "Interview narrative for ML monitoring",
        "paragraphs": [
          "A strong answer sounds like an operating system for models: define SLIs (data PSI, calibration error, latency, business KPI), set SLOs, page humans when breached, and run retrospectives. Mention label delay explicitly—credit default labels may take months—so interim proxies are required. Mention segment-wise monitoring because global averages hide regional breaks. Mention that retraining on drifted data without fixing broken features can bake the bug into the new model. Close with a concrete story from this lab: you detected a PSI jump on spend, found a cents-vs-dollars serve bug, and restored calibration without a full retrain. That combination of metric literacy and systems thinking is what hiring panels want.",
          "Hold these points explicitly while you study. Restate each one without looking at the list — recognition is not the interview bar; recall is.",
          "• Define SLIs/SLOs for model health, not only uptime.",
          "• Monitor segments, not only global aggregates.",
          "• Do not retrain over a silent feature bug.",
          "Production lens — Slices beat global averages: Global AUC or MAE can hold while a critical slice collapses: new users, one country, mobile clients, a single SKU category. Product launches and embedding refreshes often harm a localized cohort first. Monitor slices with dedicated thresholds and volume floors so noisy tiny segments do not page you constantly while still catching concentrated harm.\n\nChoose slices from business risk and known change surfaces, not from every categorical column. Pair with ownership: who gets paged, what dashboard they open, and whether the first action is investigate, mitigate (fallback), retrain, or rollback. Slice alerts without playbooks become ignored noise."
        ],
        "keyTerms": [
          {
            "term": "Define SLIs/SLOs for model health, not",
            "definition": "Define SLIs/SLOs for model health, not only uptime."
          },
          {
            "term": "Monitor segments, not only global aggregates.",
            "definition": "Monitor segments, not only global aggregates."
          },
          {
            "term": "Do not retrain over a silent",
            "definition": "Do not retrain over a silent feature bug."
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
          "Most interview answers fail not because the definition is wrong, but because the candidate never names how the approach breaks. Use this section as a trap checklist for drift and monitoring lab.",
          "Trap: Alerting on every tiny PSI move without business impact context. A strong answer preempts it — say what you would monitor, what fallback you would keep, or what simpler baseline you would try first.",
          "Trap: Using different bin edges for baseline and current PSI. A strong answer preempts it — say what you would monitor, what fallback you would keep, or what simpler baseline you would try first.",
          "Trap: Confusing ranking metrics with calibration quality. A strong answer preempts it — say what you would monitor, what fallback you would keep, or what simpler baseline you would try first.",
          "Trap: Retraining before checking train/serve bugs. A strong answer preempts it — say what you would monitor, what fallback you would keep, or what simpler baseline you would try first.",
          "Trap: Ignoring delayed labels when designing monitors. A strong answer preempts it — say what you would monitor, what fallback you would keep, or what simpler baseline you would try first."
        ],
        "callout": {
          "tone": "warning",
          "body": "If you cannot name a failure mode, you do not yet understand the technique well enough to ship or defend it."
        },
        "checkYourself": [
          {
            "prompt": "Pick the most dangerous pitfall for Drift and monitoring lab and explain how you would detect it in production or on a whiteboard.",
            "reveal": "Start with: \"Alerting on every tiny PSI move without business impact context.\" Then add a detection signal (metric, test, or review question) and a mitigation."
          }
        ]
      },
      {
        "id": "deeper-lens",
        "heading": "A deeper production lens",
        "paragraphs": [
          "Three drifts, three responses. Data drift is a change in input distribution P(X). Prediction drift is a change in model output distribution P(Ŷ) or score histograms. Concept drift is a change in P(Y|X)—the meaning of features relative to labels. They are not interchangeable. A UI redesign can shift clicks (data drift) while the ranking function remains fine; a policy change can keep features stable while labels flip meaning (concept drift). Detectors and playbooks must distinguish these cases.\n\nPopulation Stability Index, KS tests, and embedding-distance monitors catch input and prediction shifts. Outcome proxies—CTR, conversion, chargeback rate—with sufficient delay catch concept issues. Blind auto-retrain on PSI alone creates thrash: you may fit a transient campaign spike or amplify bias. Require evidence that the mapping to outcomes degraded, or that a known schema/policy change landed, before heavy retrain.",
          "Slices beat global averages. Global AUC or MAE can hold while a critical slice collapses: new users, one country, mobile clients, a single SKU category. Product launches and embedding refreshes often harm a localized cohort first. Monitor slices with dedicated thresholds and volume floors so noisy tiny segments do not page you constantly while still catching concentrated harm.\n\nChoose slices from business risk and known change surfaces, not from every categorical column. Pair with ownership: who gets paged, what dashboard they open, and whether the first action is investigate, mitigate (fallback), retrain, or rollback. Slice alerts without playbooks become ignored noise.",
          "Label delay and proxy metrics. Many labels arrive late—fraud weeks later, credit default months later, long-term retention even later. You cannot wait for perfect labels to know the model is broken today. Use leading proxies that historically correlate with the delayed label, plus human review samples, while being explicit about proxy risk. Short-term CTR is not long-term satisfaction; treat proxy moves as hypotheses.\n\nFor delayed labels, maintain a maturation window in evaluation: compare predictions only against labels that have had time to settle, and track performance by cohort age. Shadow modes and champion/challenger setups help validate a retrain before cutover when labels are slow. Document the delay so on-call does not expect same-day ground truth that cannot exist.",
          "Alerts must map to actions. Every monitor should answer: what changed, how bad, who acts, and what the allowed actions are. Investigate means check schema, upstream ETL, and traffic composition. Retrain means a controlled pipeline with honest splits and approval. Rollback means revert model or feature version under the serving contract. If an alert has no action, delete or demote it.\n\nGood lab practice is to simulate a drift event—feature mean shift, score inflation, slice failure—and walk the playbook on a toy dashboard. Production ML reliability is operational design: detectors, slices, proxies, and decisions wired together, not a single KS p-value printed in a notebook."
        ],
        "keyTerms": [
          {
            "term": "Three drifts, three responses",
            "definition": "Data drift is a change in input distribution P(X). Prediction drift is a change in model output distribution P(Ŷ) or score histograms. Concept drift is a change in P(Y|X)—the meaning of features relative to labels. They …"
          },
          {
            "term": "Slices beat global averages",
            "definition": "Global AUC or MAE can hold while a critical slice collapses: new users, one country, mobile clients, a single SKU category. Product launches and embedding refreshes often harm a localized cohort first. Monitor slices wit…"
          },
          {
            "term": "Label delay and proxy metrics",
            "definition": "Many labels arrive late—fraud weeks later, credit default months later, long-term retention even later. You cannot wait for perfect labels to know the model is broken today. Use leading proxies that historically correlat…"
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
          "You should now be able to teach drift and monitoring lab as a story: what problem it solves, how the mechanism works, which assumptions it depends on, and how you would know it failed.",
          "Close the loop by writing a 90-second spoken answer out loud. If you freeze on definitions, return to the orientation and the first technical part. If you freeze on trade-offs, return to failure modes.",
          "Practice prompts from this lesson: How does PSI detect feature drift? | When would you use KS instead of PSI? | How can a model keep a good AUC but bad calibration?"
        ],
        "checkYourself": [
          {
            "prompt": "Give a 90-second spoken overview of Drift and monitoring lab as if starting an interview answer.",
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
        "Can implement PSI with smoothed bucket proportions.",
        "Can compute a KS-style distance between two samples.",
        "Can plot and interpret a calibration curve.",
        "Can assemble a minimal drift monitoring report.",
        "Can separate detection, diagnosis, and action in interview answers."
      ],
      "nextSteps": [
        "Return to the lesson page and attempt the practice / topic lab with this chapter still open if needed.",
        "Revisit any Check yourself prompts you could not answer out loud.",
        "Optional deeper reading: Dataset Shift in Machine Learning (MIT Press) — https://mitpress.mit.edu/9780262170055/dataset-shift-in-machine-learning/",
        "Optional deeper reading: Evidently / data drift documentation (Evidently AI) — https://docs.evidentlyai.com/user-guide/data-drift/"
      ]
    }
  },
  "ml-production-lab/serving-contracts-lab": {
    "title": "Chapter: Serving contracts lab",
    "readingTime": "55-70 min",
    "premise": "Validate feature schemas, contrast batch vs online scoring contracts, and measure toy latency/throughput for inference loops with NumPy/pandas/sklearn. This Learn chapter expands the short lesson summary into a full study unit you can read continuously, with interactive checks and selection-based AI search when a phrase needs a second opinion.",
    "parts": [
      {
        "id": "orientation",
        "heading": "Why this chapter exists",
        "paragraphs": [
          "Models only create value when serving contracts are explicit: required features, types, missingness, batch semantics, and latency budgets. Interviewers probe whether you can keep training and production aligned under real traffic constraints.",
          "This chapter treats \"Serving contracts lab\" as a readable study unit: intuition first, then the mechanics you must be able to explain, then the failure modes that show up in interviews and production, and finally how to talk about the topic under time pressure.",
          "Read it like a book chapter. When a phrase is unclear, select it inside the Learn reader and use Search with AI to open Google, Perplexity, or DuckDuckGo without abandoning the chapter."
        ],
        "callout": {
          "tone": "tip",
          "body": "Target reading time is paced for depth, not skimming. Pause at each Check yourself prompt and answer out loud before revealing the guide answer."
        }
      },
      {
        "id": "a-serving-contract-is-an-api-for-features-and-predictions",
        "heading": "A serving contract is an API for features and predictions",
        "paragraphs": [
          "Think of inference as a function: given a schema-conformant feature record, return a score and metadata. The contract specifies field names, dtypes, allowed ranges/categories, nullability, and defaults. Example: age:float >=0, plan:category in {free,pro,team}, missed_payments:int >=0. If production sends plan='enterprise' and training never saw it, one-hot handle_unknown may keep running while behavior degrades; a strict validator might reject the request. Contracts also cover output: probability vs logit, thresholded label, model version, and trace id. In interviews, say that model quality work without contract tests is incomplete because silent schema drift is common after warehouse changes.",
          "Hold these points explicitly while you study. Restate each one without looking at the list — recognition is not the interview bar; recall is.",
          "• Specify names, types, nullability, and semantics for every feature.",
          "• Version the contract with the model artifact.",
          "• Include prediction output fields in the same contract mindset.",
          "Production lens — A model without a contract is a notebook: Serving contracts specify what clients may send, what they receive, how fast, how wrong it can be, and what happens when dependencies fail. Schemas for features and responses, latency/availability SLOs, score semantics (calibrated probability vs rank vs logit), version identifiers, and fallback behavior belong in the contract. Without them, every deploy is a negotiation by outage.\n\nWrite the contract so a client engineer can integrate without reading training code. Include units, value ranges, missing-feature policy, and whether higher scores are better. If marketing interprets a 0.7 score as \"70% probability\" but the model emits an uncalibrated margin, you have a product bug even when the ranking quality is fine."
        ],
        "keyTerms": [
          {
            "term": "Specify names, types, nullability, and semantics",
            "definition": "Specify names, types, nullability, and semantics for every feature."
          },
          {
            "term": "Version the contract with the model",
            "definition": "Version the contract with the model artifact."
          },
          {
            "term": "Include prediction output fields in the",
            "definition": "Include prediction output fields in the same contract mindset."
          }
        ],
        "workedExample": {
          "title": "Validate a feature row against a schema",
          "body": "Narrate what each shape and step is doing. If you only recognize the API call, you do not own the idea yet — rewrite the example from memory after one pass.",
          "code": "schema = {\n    'age': {'type': float, 'min': 0, 'max': 120},\n    'plan': {'type': str, 'values': {'free', 'pro', 'team'}},\n    'spend': {'type': float, 'min': 0},\n}\n\ndef validate_row(row, schema):\n    errors = []\n    for key, rules in schema.items():\n        if key not in row:\n            errors.append(f'missing {key}'); continue\n        val = row[key]\n        if not isinstance(val, rules['type']):\n            errors.append(f'{key} type'); continue\n        if 'min' in rules and val < rules['min']:\n            errors.append(f'{key} min')\n        if 'max' in rules and val > rules['max']:\n            errors.append(f'{key} max')\n        if 'values' in rules and val not in rules['values']:\n            errors.append(f'{key} value')\n    return errors\n\nprint(validate_row({'age': 41.0, 'plan': 'pro', 'spend': 12.5}, schema))\nprint(validate_row({'age': -1.0, 'plan': 'enterprise', 'spend': 12.5}, schema))",
          "language": "python"
        },
        "checkYourself": [
          {
            "prompt": "Can define and implement a feature schema validator.",
            "reveal": "Serving contracts specify what clients may send, what they receive, how fast, how wrong it can be, and what happens when dependencies fail. Schemas for features and responses, latency/availability SLOs, score semantics (calibrated probability vs rank vs logit), version identifiers, and fallback behavior belong in the contract. Without them, every deploy is a negotiation by outage.\n\nWrite the contract so a client engineer can integrate without reading training code. Include units, value ranges, missing-feature policy, and whether higher scores are better. If marketing interprets a 0.7 score as \"70% probability\" but the model emits an uncalibrated margin, you have a product bug even when the ranking quality is fine."
          }
        ]
      },
      {
        "id": "batch-scoring-optimizes-throughput-online-scoring-optimizes-latency",
        "heading": "Batch scoring optimizes throughput; online scoring optimizes latency",
        "paragraphs": [
          "Batch inference scores large tables periodically: nightly churn scores for CRM. The contract emphasizes complete columns, idempotent runs, and partition reproducibility. Online inference scores one request or a micro-batch under a latency SLO: credit check in 50 ms. Feature fetch path differs: batch can join wide warehouse tables; online needs low-latency feature stores or request-time features. Models may be the same Pipeline object, but operational concerns diverge—retry policy, cache freshness, partial failure. Interviewers often ask which mode you choose for a product and why. A hybrid exists: nearline scoring every few minutes. Clarify freshness requirements before choosing architecture.",
          "Hold these points explicitly while you study. Restate each one without looking at the list — recognition is not the interview bar; recall is.",
          "• Batch cares about throughput, partitioning, and recompute correctness.",
          "• Online cares about p95/p99 latency and dependency freshness.",
          "• The same model artifact can power both with different orchestration.",
          "Production lens — Schema evolution and train/serve parity: Feature schemas should evolve with compatibility rules: additive optional fields, explicit versions, and logging of unknown keys. Silent drops of new client fields create invisible training-serving skew—the model never sees the feature online that analysts see offline. Breaking changes require a version bump, dual publish, or coordinated rollout, not a quiet rename.\n\nParity checks compare training-time feature vectors to online materialization for the same entity and timestamp. Thresholded diffs on critical features catch ETL drift early. The serving contract should name the feature producer (client, feature store, join job) and the model consumer version so skew has an owner."
        ],
        "keyTerms": [
          {
            "term": "Batch cares about throughput, partitioning, and",
            "definition": "Batch cares about throughput, partitioning, and recompute correctness."
          },
          {
            "term": "Online cares about p95/p99 latency and",
            "definition": "Online cares about p95/p99 latency and dependency freshness."
          },
          {
            "term": "The same model artifact can power",
            "definition": "The same model artifact can power both with different orchestration."
          }
        ],
        "workedExample": {
          "title": "Micro-benchmark batch vs one-row predict loops",
          "body": "Narrate what each shape and step is doing. If you only recognize the API call, you do not own the idea yet — rewrite the example from memory after one pass.",
          "code": "import time\nimport numpy as np\nfrom sklearn.linear_model import LogisticRegression\n\nrng = np.random.default_rng(0)\nX = rng.normal(size=(5000, 16))\ny = (X[:, 0] + 0.3 * X[:, 1] > 0).astype(int)\nmodel = LogisticRegression(max_iter=1000).fit(X, y)\n\nt0 = time.perf_counter(); model.predict_proba(X); batch_ms = (time.perf_counter() - t0) * 1000\nt0 = time.perf_counter()\nfor i in range(200):\n    model.predict_proba(X[i:i+1])\nonline_ms = (time.perf_counter() - t0) * 1000\nprint('batch 5000 rows ms', round(batch_ms, 3))\nprint('200 single-row calls ms', round(online_ms, 3))",
          "language": "python"
        },
        "checkYourself": [
          {
            "prompt": "Can contrast batch and online scoring requirements.",
            "reveal": "Feature schemas should evolve with compatibility rules: additive optional fields, explicit versions, and logging of unknown keys. Silent drops of new client fields create invisible training-serving skew—the model never sees the feature online that analysts see offline. Breaking changes require a version bump, dual publish, or coordinated rollout, not a quiet rename.\n\nParity checks compare training-time feature vectors to online materialization for the same entity and timestamp. Thresholded diffs on critical features catch ETL drift early. The serving contract should name the feature producer (client, feature store, join job) and the model consumer version so skew has an owner."
          }
        ]
      },
      {
        "id": "schema-validation-belongs-in-the-hot-path-or-the-gate",
        "heading": "Schema validation belongs in the hot path or the gate",
        "paragraphs": [
          "For online services, validate requests before model.predict. Reject or quarantine bad rows with actionable errors. For batch jobs, validate partitions before scoring and write poison rows to a dead-letter table. Use pandas dtypes for tabular batches: ensure numeric columns parse, categories are known, and required columns exist. Example bug: spend arrives as strings '12.50'; model may crash or coerce incorrectly. Another bug: column order shuffled while a numpy array model expects positional features—prefer named pandas columns into a Pipeline with column names when possible. Contract tests should freeze a golden request JSON and expected score for a given model version.",
          "Hold these points explicitly while you study. Restate each one without looking at the list — recognition is not the interview bar; recall is.",
          "• Validate early; fail with structured errors.",
          "• Prefer named columns over positional arrays at boundaries.",
          "• Golden request tests pin model+contract versions together.",
          "Production lens — SLOs, degradation, and fallbacks: Personalization that hard-fails the homepage when the feature store times out is usually worse than a product-approved fallback: cached scores, popular lists, or last-known rankings within latency SLO. Degradation must be explicit, metered, and reversible. Emit a degradation metric and customer-visible quality loss estimate so reliability work is prioritized with data.\n\nLatency SLOs drive batching, caching, model size, and hardware choices. A contract that promises p95 50 ms cannot casually pull a 200 ms LLM call without an async redesign. Timeouts, bulkheads, and default responses are part of the model product, not only the platform team's concerns."
        ],
        "keyTerms": [
          {
            "term": "Validate early; fail with structured errors.",
            "definition": "Validate early; fail with structured errors."
          },
          {
            "term": "Prefer named columns over positional arrays",
            "definition": "Prefer named columns over positional arrays at boundaries."
          },
          {
            "term": "Golden request tests pin model+contract versions",
            "definition": "Golden request tests pin model+contract versions together."
          }
        ],
        "workedExample": {
          "title": "pandas batch schema checks",
          "body": "Narrate what each shape and step is doing. If you only recognize the API call, you do not own the idea yet — rewrite the example from memory after one pass.",
          "code": "import pandas as pd\nimport numpy as np\n\ndf = pd.DataFrame({\n    'age': [22, 41, np.nan],\n    'plan': ['free', 'pro', 'team'],\n    'spend': [10.0, 12.5, 8.0],\n})\nrequired = ['age', 'plan', 'spend']\nmissing_cols = [c for c in required if c not in df.columns]\nnull_frac = df[required].isna().mean().to_dict()\nprint('missing_cols', missing_cols)\nprint('null_frac', {k: round(v, 3) for k, v in null_frac.items()})\nprint('dtypes', df.dtypes.astype(str).to_dict())",
          "language": "python"
        },
        "checkYourself": [
          {
            "prompt": "Can measure toy latency percentiles for predict calls.",
            "reveal": "Personalization that hard-fails the homepage when the feature store times out is usually worse than a product-approved fallback: cached scores, popular lists, or last-known rankings within latency SLO. Degradation must be explicit, metered, and reversible. Emit a degradation metric and customer-visible quality loss estimate so reliability work is prioritized with data.\n\nLatency SLOs drive batching, caching, model size, and hardware choices. A contract that promises p95 50 ms cannot casually pull a 200 ms LLM call without an async redesign. Timeouts, bulkheads, and default responses are part of the model product, not only the platform team's concerns."
          }
        ]
      },
      {
        "id": "latency-and-throughput-are-measurable-slos",
        "heading": "Latency and throughput are measurable SLOs",
        "paragraphs": [
          "Latency is time per request; throughput is requests per second. They trade off with batching: scoring 32 rows together may improve GPU/CPU efficiency but raise per-request wait. Even on CPU sklearn models, vectorized batch predict beats a Python loop of single rows. Toy measurements with time.perf_counter are enough for interview intuition and local experiments. Capture p50/p95 by recording many durations. Example: single-row predict takes 0.2 ms locally, but feature fetch takes 30 ms—so optimizing model code is the wrong focus. Always measure end-to-end. Include cold start (loading Pipeline) separately from warm requests. Document budgets: e.g., p95 < 40 ms excluding client network.",
          "Hold these points explicitly while you study. Restate each one without looking at the list — recognition is not the interview bar; recall is.",
          "• Measure end-to-end, not only model.predict time.",
          "• Report percentiles, not just means.",
          "• Batching can raise throughput while hurting per-request latency.",
          "Production lens — Versioning enables shadow, canary, rollback: Immutable model versions with pinned feature schemas make shadow traffic, canaries, and rollbacks possible. Publish model_id in responses (or logs) so errors can be attributed. Canary on slices that matter; compare not only aggregate AUC proxies but contract-level error budgets—timeouts, schema failures, fallback rates. Roll back on contract breach even if a vanity offline metric improved.\n\nClients should pin to compatible contract versions or negotiate ranges. The anti-pattern is \"always call /predict\" with undocumented shifting semantics. Serving-contract labs should practice a schema-additive change, a canary, a forced dependency failure hitting fallback, and a rollback—each with the metrics you would show in an incident review."
        ],
        "keyTerms": [
          {
            "term": "Measure end-to-end, not only model.predict time.",
            "definition": "Measure end-to-end, not only model.predict time."
          },
          {
            "term": "Report percentiles, not just means.",
            "definition": "Report percentiles, not just means."
          },
          {
            "term": "Batching can raise throughput while hurting",
            "definition": "Batching can raise throughput while hurting per-request latency."
          }
        ],
        "workedExample": {
          "title": "Collect p95 of single-row scoring times",
          "body": "Narrate what each shape and step is doing. If you only recognize the API call, you do not own the idea yet — rewrite the example from memory after one pass.",
          "code": "import time\nimport numpy as np\nfrom sklearn.linear_model import LogisticRegression\n\nrng = np.random.default_rng(1)\nX = rng.normal(size=(2000, 12))\ny = (X.sum(axis=1) > 0).astype(int)\nmodel = LogisticRegression(max_iter=1000).fit(X, y)\ndurations = []\nfor i in range(500):\n    t0 = time.perf_counter()\n    model.predict_proba(X[i:i+1])\n    durations.append((time.perf_counter() - t0) * 1000)\narr = np.sort(np.array(durations))\np95 = arr[int(0.95 * (len(arr) - 1))]\nprint('p50_ms', round(float(np.median(arr)), 4), 'p95_ms', round(float(p95), 4))",
          "language": "python"
        },
        "checkYourself": [
          {
            "prompt": "Can explain contract tests with golden fixtures.",
            "reveal": "Immutable model versions with pinned feature schemas make shadow traffic, canaries, and rollbacks possible. Publish model_id in responses (or logs) so errors can be attributed. Canary on slices that matter; compare not only aggregate AUC proxies but contract-level error budgets—timeouts, schema failures, fallback rates. Roll back on contract breach even if a vanity offline metric improved.\n\nClients should pin to compatible contract versions or negotiate ranges. The anti-pattern is \"always call /predict\" with undocumented shifting semantics. Serving-contract labs should practice a schema-additive change, a canary, a forced dependency failure hitting fallback, and a rollback—each with the metrics you would show in an incident review."
          }
        ]
      },
      {
        "id": "contract-tests-bridge-training-notebooks-and-production-services",
        "heading": "Contract tests bridge training notebooks and production services",
        "paragraphs": [
          "A robust workflow exports: model/pipeline artifact, schema JSON, feature fill defaults, and a suite of fixture requests with expected scores within tolerance. CI loads the artifact, validates fixtures against schema, scores them, and diffs outputs. Batch jobs reuse the same artifact with a data-frame adapter. When features change, bump contract version and require a migration. This prevents the classic 'worked in notebook' failure. In interviews, describe how you would shadow-deploy a new version: score live traffic without acting, compare distributions, then switch. Mention canary percentages and rollback on SLO breach. The exercises practice schema validation and toy latency measurement so these stories are concrete.",
          "Hold these points explicitly while you study. Restate each one without looking at the list — recognition is not the interview bar; recall is.",
          "• Ship schema + fixtures + model as one versioned bundle.",
          "• Shadow traffic before cutover when risk is high.",
          "• Adapter layers translate batch/online payloads into the same Pipeline input.",
          "Production lens — A model without a contract is a notebook: Serving contracts specify what clients may send, what they receive, how fast, how wrong it can be, and what happens when dependencies fail. Schemas for features and responses, latency/availability SLOs, score semantics (calibrated probability vs rank vs logit), version identifiers, and fallback behavior belong in the contract. Without them, every deploy is a negotiation by outage.\n\nWrite the contract so a client engineer can integrate without reading training code. Include units, value ranges, missing-feature policy, and whether higher scores are better. If marketing interprets a 0.7 score as \"70% probability\" but the model emits an uncalibrated margin, you have a product bug even when the ranking quality is fine."
        ],
        "keyTerms": [
          {
            "term": "Ship schema + fixtures + model",
            "definition": "Ship schema + fixtures + model as one versioned bundle."
          },
          {
            "term": "Shadow traffic before cutover when risk",
            "definition": "Shadow traffic before cutover when risk is high."
          },
          {
            "term": "Adapter layers translate batch/online payload…",
            "definition": "Adapter layers translate batch/online payloads into the same Pipeline input."
          }
        ],
        "workedExample": {
          "title": "Fixture scoring with a tiny tolerance check",
          "body": "Narrate what each shape and step is doing. If you only recognize the API call, you do not own the idea yet — rewrite the example from memory after one pass.",
          "code": "import numpy as np\nfrom sklearn.linear_model import LogisticRegression\n\nX = np.array([[0.0, 0.0], [1.0, -1.0], [2.0, 2.0]])\ny = np.array([0, 0, 1])\nmodel = LogisticRegression(max_iter=1000).fit(X, y)\nfixture = np.array([[2.0, 2.0]])\nexpected = 0.7\nprob = float(model.predict_proba(fixture)[0, 1])\nprint('prob', round(prob, 4), 'close', abs(prob - expected) < 0.4)",
          "language": "python"
        },
        "checkYourself": [
          {
            "prompt": "Can describe shadow deploy and rollback triggers.",
            "reveal": "Explain the idea in two sentences, name one metric or invariant you would watch, and state one mistake juniors make. Then connect it back to contract tests bridge training notebooks and production services."
          }
        ]
      },
      {
        "id": "put-it-all-together-for-system-design-answers",
        "heading": "Put it all together for system-design answers",
        "paragraphs": [
          "A complete serving answer covers input contract, feature freshness, model artifact loading, prediction semantics, latency SLOs, throughput capacity, error handling, and monitoring hooks. Example: online fraud scoring validates schema, fetches 20 features (budget 15 ms), runs a Pipeline (budget 5 ms), returns score+model_version, logs features for later training, and emits metrics for null rates and p95 latency. Batch churn scoring reads yesterday's warehouse partition, validates columns, scores 10M rows in vectorized chunks of 100k, writes scores to an output table partitioned by date, and publishes a success metric. Showing both modes and their shared contract earns senior signal. Use this lab's vocabulary: schema, fixtures, p95, batch vs online, parity tests.",
          "Hold these points explicitly while you study. Restate each one without looking at the list — recognition is not the interview bar; recall is.",
          "• Shared contracts enable dual batch/online serving.",
          "• Capacity planning needs both latency percentiles and throughput.",
          "• Logging features/predictions closes the learning loop.",
          "Production lens — Schema evolution and train/serve parity: Feature schemas should evolve with compatibility rules: additive optional fields, explicit versions, and logging of unknown keys. Silent drops of new client fields create invisible training-serving skew—the model never sees the feature online that analysts see offline. Breaking changes require a version bump, dual publish, or coordinated rollout, not a quiet rename.\n\nParity checks compare training-time feature vectors to online materialization for the same entity and timestamp. Thresholded diffs on critical features catch ETL drift early. The serving contract should name the feature producer (client, feature store, join job) and the model consumer version so skew has an owner."
        ],
        "keyTerms": [
          {
            "term": "Shared contracts enable dual batch/online ser…",
            "definition": "Shared contracts enable dual batch/online serving."
          },
          {
            "term": "Capacity planning needs both latency percentiles",
            "definition": "Capacity planning needs both latency percentiles and throughput."
          },
          {
            "term": "Logging features/predictions closes the learn…",
            "definition": "Logging features/predictions closes the learning loop."
          }
        ]
      },
      {
        "id": "llm-gateway-contracts-model-aliases-and-deprecation-drills",
        "heading": "LLM gateway contracts, model aliases, and deprecation drills",
        "paragraphs": [
          "Serving contracts expand from feature schemas to LLM gateway contracts: request fields (messages, tools, response_format, temperature caps), tenancy headers, auth scopes, and response fields (text, structured JSON, usage tokens, model revision actually served). Gateways in front of open-weight engines or multi-vendor APIs should expose stable aliases (`extract-v1`, `chat-strong`) that resolve to concrete model IDs and revisions. Clients never hard-code ephemeral provider SKUs. Deprecation drills are rehearsals: announce alias retarget, run canary prompts and schema golden tests against the candidate, compare cost/latency/quality, then flip with instant rollback. Contract tests freeze a golden chat request and expected JSON schema validity for each alias. Include error taxonomy (context length, content filter, upstream 429) so clients retry correctly. The lab mindset still applies—validate before predict—but now validation covers message roles, max tokens, and tool schema sizes that can DOS your own gateway. Treat provider deprecation notices as pages, not blog skims.",
          "Hold these points explicitly while you study. Restate each one without looking at the list — recognition is not the interview bar; recall is.",
          "• Define gateway request/response contracts including usage and resolved model revision.",
          "• Route clients through aliases; canary before retargeting.",
          "• Rehearse deprecation with golden prompts, schema checks, and rollback.",
          "• Validate message/tool payload sizes and roles at the edge.",
          "Production lens — SLOs, degradation, and fallbacks: Personalization that hard-fails the homepage when the feature store times out is usually worse than a product-approved fallback: cached scores, popular lists, or last-known rankings within latency SLO. Degradation must be explicit, metered, and reversible. Emit a degradation metric and customer-visible quality loss estimate so reliability work is prioritized with data.\n\nLatency SLOs drive batching, caching, model size, and hardware choices. A contract that promises p95 50 ms cannot casually pull a 200 ms LLM call without an async redesign. Timeouts, bulkheads, and default responses are part of the model product, not only the platform team's concerns."
        ],
        "keyTerms": [
          {
            "term": "Define gateway request/response contracts inc…",
            "definition": "Define gateway request/response contracts including usage and resolved model revision."
          },
          {
            "term": "Route clients through aliases; canary before",
            "definition": "Route clients through aliases; canary before retargeting."
          },
          {
            "term": "Rehearse deprecation with golden prompts, schema",
            "definition": "Rehearse deprecation with golden prompts, schema checks, and rollback."
          },
          {
            "term": "Validate message/tool payload sizes and roles",
            "definition": "Validate message/tool payload sizes and roles at the edge."
          }
        ],
        "workedExample": {
          "title": "Resolve a model alias with pin + canary",
          "body": "Narrate what each shape and step is doing. If you only recognize the API call, you do not own the idea yet — rewrite the example from memory after one pass.",
          "code": "ALIASES = {\n    'chat-strong': {'prod': 'providerA-large-2026-05', 'canary': 'providerA-large-2026-07'},\n}\n\ndef resolve(alias, canary_percent, user_id):\n    cfg = ALIASES[alias]\n    bucket = sum(map(ord, user_id)) % 100\n    return cfg['canary'] if bucket < canary_percent else cfg['prod']\n\nprint(resolve('chat-strong', 10, 'user-1'))\nprint(resolve('chat-strong', 10, 'user-2'))",
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
          "Most interview answers fail not because the definition is wrong, but because the candidate never names how the approach breaks. Use this section as a trap checklist for serving contracts lab.",
          "Trap: Assuming positional numpy columns stay aligned forever. A strong answer preempts it — say what you would monitor, what fallback you would keep, or what simpler baseline you would try first.",
          "Trap: Optimizing model.predict while feature fetch dominates latency. A strong answer preempts it — say what you would monitor, what fallback you would keep, or what simpler baseline you would try first.",
          "Trap: Skipping schema validation because 'the model usually works'. A strong answer preempts it — say what you would monitor, what fallback you would keep, or what simpler baseline you would try first.",
          "Trap: Shipping notebook preprocessing that differs from serving code. A strong answer preempts it — say what you would monitor, what fallback you would keep, or what simpler baseline you would try first.",
          "Trap: Reporting only mean latency without percentiles. A strong answer preempts it — say what you would monitor, what fallback you would keep, or what simpler baseline you would try first."
        ],
        "callout": {
          "tone": "warning",
          "body": "If you cannot name a failure mode, you do not yet understand the technique well enough to ship or defend it."
        },
        "checkYourself": [
          {
            "prompt": "Pick the most dangerous pitfall for Serving contracts lab and explain how you would detect it in production or on a whiteboard.",
            "reveal": "Start with: \"Assuming positional numpy columns stay aligned forever.\" Then add a detection signal (metric, test, or review question) and a mitigation."
          }
        ]
      },
      {
        "id": "deeper-lens",
        "heading": "A deeper production lens",
        "paragraphs": [
          "A model without a contract is a notebook. Serving contracts specify what clients may send, what they receive, how fast, how wrong it can be, and what happens when dependencies fail. Schemas for features and responses, latency/availability SLOs, score semantics (calibrated probability vs rank vs logit), version identifiers, and fallback behavior belong in the contract. Without them, every deploy is a negotiation by outage.\n\nWrite the contract so a client engineer can integrate without reading training code. Include units, value ranges, missing-feature policy, and whether higher scores are better. If marketing interprets a 0.7 score as \"70% probability\" but the model emits an uncalibrated margin, you have a product bug even when the ranking quality is fine.",
          "Schema evolution and train/serve parity. Feature schemas should evolve with compatibility rules: additive optional fields, explicit versions, and logging of unknown keys. Silent drops of new client fields create invisible training-serving skew—the model never sees the feature online that analysts see offline. Breaking changes require a version bump, dual publish, or coordinated rollout, not a quiet rename.\n\nParity checks compare training-time feature vectors to online materialization for the same entity and timestamp. Thresholded diffs on critical features catch ETL drift early. The serving contract should name the feature producer (client, feature store, join job) and the model consumer version so skew has an owner.",
          "SLOs, degradation, and fallbacks. Personalization that hard-fails the homepage when the feature store times out is usually worse than a product-approved fallback: cached scores, popular lists, or last-known rankings within latency SLO. Degradation must be explicit, metered, and reversible. Emit a degradation metric and customer-visible quality loss estimate so reliability work is prioritized with data.\n\nLatency SLOs drive batching, caching, model size, and hardware choices. A contract that promises p95 50 ms cannot casually pull a 200 ms LLM call without an async redesign. Timeouts, bulkheads, and default responses are part of the model product, not only the platform team's concerns.",
          "Versioning enables shadow, canary, rollback. Immutable model versions with pinned feature schemas make shadow traffic, canaries, and rollbacks possible. Publish model_id in responses (or logs) so errors can be attributed. Canary on slices that matter; compare not only aggregate AUC proxies but contract-level error budgets—timeouts, schema failures, fallback rates. Roll back on contract breach even if a vanity offline metric improved.\n\nClients should pin to compatible contract versions or negotiate ranges. The anti-pattern is \"always call /predict\" with undocumented shifting semantics. Serving-contract labs should practice a schema-additive change, a canary, a forced dependency failure hitting fallback, and a rollback—each with the metrics you would show in an incident review."
        ],
        "keyTerms": [
          {
            "term": "A model without a contract is a notebook",
            "definition": "Serving contracts specify what clients may send, what they receive, how fast, how wrong it can be, and what happens when dependencies fail. Schemas for features and responses, latency/availability SLOs, score semantics (…"
          },
          {
            "term": "Schema evolution and train/serve parity",
            "definition": "Feature schemas should evolve with compatibility rules: additive optional fields, explicit versions, and logging of unknown keys. Silent drops of new client fields create invisible training-serving skew—the model never s…"
          },
          {
            "term": "SLOs, degradation, and fallbacks",
            "definition": "Personalization that hard-fails the homepage when the feature store times out is usually worse than a product-approved fallback: cached scores, popular lists, or last-known rankings within latency SLO. Degradation must b…"
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
          "You should now be able to teach serving contracts lab as a story: what problem it solves, how the mechanism works, which assumptions it depends on, and how you would know it failed.",
          "Close the loop by writing a 90-second spoken answer out loud. If you freeze on definitions, return to the orientation and the first technical part. If you freeze on trade-offs, return to failure modes.",
          "Practice prompts from this lesson: What belongs in a model serving contract? | How do batch and online inference architectures differ? | How would you test train/serve parity for features?"
        ],
        "checkYourself": [
          {
            "prompt": "Give a 90-second spoken overview of Serving contracts lab as if starting an interview answer.",
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
        "Can define and implement a feature schema validator.",
        "Can contrast batch and online scoring requirements.",
        "Can measure toy latency percentiles for predict calls.",
        "Can explain contract tests with golden fixtures.",
        "Can describe shadow deploy and rollback triggers."
      ],
      "nextSteps": [
        "Return to the lesson page and attempt the practice / topic lab with this chapter still open if needed.",
        "Revisit any Check yourself prompts you could not answer out loud.",
        "Optional deeper reading: Hidden Technical Debt in Machine Learning Systems (NeurIPS) — https://papers.nips.cc/paper/2015/hash/86df7dcfd896faf2674f757a76b83c41-Abstract.html",
        "Optional deeper reading: Semantically Versioned ML Models (TensorFlow Extended) — https://www.tensorflow.org/tfx/guide/versioning"
      ]
    }
  }
};
