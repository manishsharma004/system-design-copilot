const chapters = {
  "ml-interactive-lab/feature-engineering-playground": {
    title: "Chapter: Feature engineering playground",
    readingTime: "65-80 min",
    premise:
      "Feature engineering turns raw tabular observations into model-ready coordinates. This chapter explains scaling, missingness, categorical encoding, interactions, leakage prevention, and pipeline discipline for hands-on ML labs.",
    parts: [
      {
        id: "coordinates-not-columns",
        heading: "Models learn from coordinates, not column names",
        paragraphs: [
          "A table column has business meaning to humans, but an estimator receives numeric coordinates. The distance between examples, the slope of a coefficient, or the split threshold of a tree depends on the representation you provide. Age in years, spend in cents, a city string, and a missing timestamp are not equally usable by a model until they are transformed into a stable feature vector.",
          "Feature engineering is therefore a translation layer. Scaling expresses numeric values in comparable units; encoding turns categories into machine-readable indicators or learned statistics; imputation gives missing values a defined behavior; interactions expose relationships that a simple model may not discover alone. The best representation depends on the estimator. A linear model needs different help than a gradient boosted tree, and a nearest-neighbor method is especially sensitive to scale.",
          "The playground mindset is to change one transformation at a time and observe how geometry changes. If standardization improves KNN but barely moves a tree ensemble, that is not magic. It reflects how the algorithms consume features. The goal is not to memorize preprocessing recipes; it is to connect each transformation to the assumptions and failure modes of the model that will consume it."
        ],
        keyTerms: [
          {
            term: "feature vector",
            definition:
              "The ordered numeric representation of one example after preprocessing and feature engineering."
          },
          {
            term: "standardization",
            definition:
              "A scaling transform that subtracts a training-set mean and divides by a training-set standard deviation."
          },
          {
            term: "representation",
            definition:
              "The form in which raw observations are encoded for a learning algorithm."
          }
        ],
        checkYourself: [
          {
            prompt: "Why can changing units from dollars to cents affect KNN?",
            reveal:
              "KNN uses distances. Multiplying one feature by 100 changes its contribution to distance unless scaling is applied, so neighbors can change even though the business fact is identical."
          }
        ],
        callout: {
          tone: "tip",
          body:
            "When evaluating a transformation, ask which model assumption it supports: distance, linearity, monotonic splits, sparse indicators, or robust missingness."
        }
      },
      {
        id: "missingness-and-outliers",
        heading: "Missing values and outliers carry information and risk",
        paragraphs: [
          "Missing data is not a single problem. Values may be missing completely at random, missing because a process failed, missing because a customer skipped a field, or missing because the fact does not apply. Treating all missing values as the median can be acceptable for a baseline, but it can also erase signal. In fraud or healthcare data, the absence of a measurement may itself be predictive because it reflects workflow, access, or behavior.",
          "A practical pattern is to impute and flag. The imputed value keeps the feature matrix valid, while a missingness indicator lets the model learn whether absence matters. The exact imputation should be fit only on training data. For skewed numeric data, medians are often more stable than means. For categorical data, a dedicated `missing` bucket can be clearer than silently using the most frequent category.",
          "Outliers require the same care. A real high spend value may be valuable signal; a sensor error may dominate scaling and gradients. Winsorization, clipping, log transforms, robust scaling, and domain validation are tools, not defaults. Before transforming away an extreme value, decide whether it is impossible, rare-but-real, or a new population that the model should learn."
        ],
        keyTerms: [
          {
            term: "missingness indicator",
            definition:
              "A binary feature that records whether the original value was missing before imputation."
          },
          {
            term: "robust scaling",
            definition:
              "Scaling based on statistics such as median and interquartile range that are less sensitive to outliers."
          },
          {
            term: "winsorization",
            definition:
              "A transform that caps extreme values at chosen lower and upper bounds."
          }
        ],
        checkYourself: [
          {
            prompt: "Why might a missingness flag improve a model after imputation?",
            reveal:
              "The imputed numeric value prevents errors, but the flag preserves the information that the value was absent. If absence correlates with the target, the model can use it."
          }
        ],
        callout: {
          tone: "warning",
          body:
            "Never fit imputation statistics on the full dataset before splitting. Means, medians, and most-frequent categories are learned parameters."
        }
      },
      {
        id: "categorical-encoding",
        heading: "Categorical encoding defines what similarity means",
        paragraphs: [
          "Categorical values need a representation that matches their meaning. One-hot encoding is a safe default for unordered categories because it does not imply that plan `3` is larger than plan `1`. Ordinal encoding is appropriate only when order is real, such as education level or severity rating. Hashing can handle large vocabularies but sacrifices easy interpretability and may collide categories into the same column.",
          "High-cardinality categories are especially tricky. A merchant id, user agent, postal code, or product id can create thousands of sparse columns and leak identity-like information. Target encoding can compress these categories into statistics, but it must be computed inside training folds to avoid label leakage. Frequency encoding, grouped rare categories, learned embeddings, or domain aggregation may be better depending on the model and data volume.",
          "Serving behavior is part of the encoding design. Production will encounter categories that training did not see. A one-hot encoder should have a defined unknown behavior rather than crashing. A target encoder should have a fallback such as global mean or smoothed parent-category statistic. A feature registry should store the vocabulary or encoding parameters with the model so the same input maps to the same vector later."
        ],
        keyTerms: [
          {
            term: "one-hot encoding",
            definition:
              "Representing each category as a separate binary indicator column."
          },
          {
            term: "target encoding",
            definition:
              "Replacing a category with a label-derived statistic, usually with smoothing and fold-safe computation."
          },
          {
            term: "unknown category",
            definition:
              "A categorical value observed at inference time that was absent from the fitted training vocabulary."
          }
        ],
        checkYourself: [
          {
            prompt: "Why is naive target encoding leaky?",
            reveal:
              "If the category statistic uses labels from the validation row or fold, the encoded feature contains information from the answer. It must be computed using only training data for each fold."
          }
        ],
        callout: {
          tone: "interview",
          body:
            "For categorical features, mention cardinality, ordering, unknowns, leakage risk, and serving vocabulary. That is the full engineering answer."
        }
      },
      {
        id: "interactions-and-domain-features",
        heading: "Interactions expose structure simple models may miss",
        paragraphs: [
          "A feature interaction says that the effect of one variable depends on another. Income may matter differently by region, click rate may matter differently by device, and temperature may matter differently by hour of day. Linear models cannot represent these relationships unless you provide interaction terms or nonlinear transforms. Tree models can discover many interactions, but even they benefit from well-designed domain aggregates that reduce search burden.",
          "Domain features should be honest summaries available at prediction time. A ratio such as `failed_payments_7d / attempts_7d` may be more stable than either count alone. A recency feature such as days since last login can be more useful than a raw timestamp. A rolling aggregate can capture behavior while preserving time order. These features are valuable because they express a hypothesis about the process, not because they add columns indiscriminately.",
          "More features can hurt when they add noise, leakage, or maintenance cost. Every derived feature needs tests for units, nulls, ranges, and timestamp cutoffs. In production, the cost of computing a feature also matters. A feature that improves offline AUC by a tenth of a point but requires a slow cross-service call may be a poor serving choice. Feature engineering is an optimization over quality, latency, reliability, and explainability."
        ],
        keyTerms: [
          {
            term: "interaction feature",
            definition:
              "A derived feature that lets a model represent the combined effect of two or more inputs."
          },
          {
            term: "recency feature",
            definition:
              "A feature that measures time since a relevant event, often used for behavioral prediction."
          },
          {
            term: "rolling aggregate",
            definition:
              "A summary over a moving time window such as count, average, maximum, or ratio over the last N days."
          }
        ],
        checkYourself: [
          {
            prompt: "Why might a ratio feature beat two raw count features?",
            reveal:
              "The ratio can normalize for exposure. For example, failures per attempt distinguishes a heavy user with many normal attempts from a risky user with a high failure rate."
          }
        ],
        callout: {
          tone: "tip",
          body:
            "Prefer features that encode a causal or operational hypothesis. Feature volume is not the same as feature quality."
        }
      },
      {
        id: "pipeline-discipline",
        heading: "Pipelines make feature engineering reproducible",
        paragraphs: [
          "Interactive labs often start with a notebook cell, but production-grade feature engineering needs a repeatable pipeline. A pipeline records the order of transformations, stores fitted parameters, and applies the same logic during cross-validation and serving. Without that discipline, a model can score well in an experiment and fail in deployment because columns were reordered, a scaler was refit, or a category vocabulary changed.",
          "The safe procedure is split first, then fit preprocessing inside the training data for each fold. This includes scalers, imputers, encoders, feature selectors, PCA, and target encoders. The validation fold should be transformed using parameters learned from its corresponding training fold. This pattern mirrors production: the model sees new data transformed by artifacts learned earlier, not by statistics recomputed from the future.",
          "A good feature pipeline is also observable. It should emit output shape, missing rates, category unknown rates, clipping rates, and simple distribution summaries. Those checks catch data contract breaks before a model silently consumes bad vectors. In interviews, the strongest answer combines modeling intuition with this operational habit: every feature transformation is a learned or governed artifact."
        ],
        keyTerms: [
          {
            term: "pipeline",
            definition:
              "An ordered set of preprocessing and modeling steps that can be fit, transformed, saved, and reused consistently."
          },
          {
            term: "fit-transform boundary",
            definition:
              "The rule that learned preprocessing parameters are fit on training data and then applied to validation or serving data."
          },
          {
            term: "feature drift",
            definition:
              "A change in feature distribution, missingness, or semantics relative to the training dataset."
          }
        ],
        checkYourself: [
          {
            prompt: "What should be serialized with a trained tabular model?",
            reveal:
              "The preprocessing pipeline, fitted parameters, vocabularies, feature order, schema contract, model weights, version metadata, and validation results should travel together."
          }
        ],
        callout: {
          tone: "interview",
          body:
            "Say `split before fit` whenever learned preprocessing appears. It signals that you understand leakage, not just API syntax."
        }
      }
    ],
    wrapUp: {
      takeaways: [
        "Feature engineering defines the numeric coordinates a model consumes.",
        "Missingness, outliers, categorical encoding, and interactions must be designed around model assumptions.",
        "Learned preprocessing parameters belong inside fold-safe pipelines.",
        "Serving behavior for unknown categories, nulls, ranges, and feature order must be explicit.",
        "Feature work balances model quality with latency, reliability, and explainability."
      ],
      nextSteps: [
        "Compare scaling effects on KNN, logistic regression, and tree models in a small lab.",
        "Design an encoding plan for a high-cardinality merchant feature.",
        "Add shape and missing-rate checks to a toy preprocessing pipeline."
      ]
    }
  },
  "ml-interactive-lab/supervised-learning-workshop": {
    title: "Chapter: Supervised learning workshop",
    readingTime: "65-80 min",
    premise:
      "Supervised learning maps labeled examples to predictions. This chapter walks through loss functions, train-validation-test discipline, model families, regularization, metrics, calibration, and error analysis.",
    parts: [
      {
        id: "learning-from-labels",
        heading: "Supervised learning is function fitting under constraints",
        paragraphs: [
          "In supervised learning, each example pairs inputs with a target. The model family defines which functions are possible, the loss defines what mistakes cost, and the optimizer searches for parameters that reduce that loss on training data. The result is not truth; it is a fitted approximation that should generalize to new examples from a related distribution.",
          "Classification predicts categories or probabilities over categories. Regression predicts numeric values. Ranking predicts an order. The same input table can support different targets depending on the product question. A support system might classify ticket topic, predict time to resolution, or rank suggested replies. Each target changes labels, metrics, model choice, and evaluation risk.",
          "The workshop habit is to make the learning setup explicit before coding. Define the prediction moment, target, allowed features, evaluation split, baseline, primary metric, and error cost. A model trained without that framing can optimize the wrong problem elegantly. Supervised learning succeeds when the mathematical objective matches the decision the product actually makes."
        ],
        keyTerms: [
          {
            term: "label",
            definition:
              "The target value used to supervise training, such as a class, score, or numeric outcome."
          },
          {
            term: "loss function",
            definition:
              "A differentiable or optimizable measure of prediction error used during training."
          },
          {
            term: "generalization",
            definition:
              "Performance on new examples beyond the training data."
          }
        ],
        checkYourself: [
          {
            prompt: "Why define the prediction moment before feature selection?",
            reveal:
              "The prediction moment determines which facts are legally available. Features created after that moment leak future information and inflate validation metrics."
          }
        ],
        callout: {
          tone: "tip",
          body:
            "A supervised learning answer should name target, features, split, model, loss, metric, and baseline before discussing tuning."
        }
      },
      {
        id: "splits-and-baselines",
        heading: "Splits and baselines tell you whether learning happened",
        paragraphs: [
          "Training performance is not enough because a flexible model can memorize examples. Validation estimates how choices behave on held-out data, and the final test set estimates performance after model selection. The split should match deployment. Random row splits are acceptable for some IID tabular tasks, but time-based or group-based splits are necessary when production sees future periods or unseen entities.",
          "A baseline is the simplest credible competitor. For classification, it might predict the majority class, class priors, or a simple rule. For regression, it might predict the training mean, median, or seasonal average. For ranking, it might use popularity or recency. Baselines prevent a team from celebrating a complex model that barely beats a cheap heuristic.",
          "Data leakage often enters through split mistakes. Duplicate rows, same users in multiple partitions, future-derived labels, and preprocessing fit on all data can make validation look honest while containing answers. The antidote is to describe the split in terms of the production generalization question. If the service scores new customers next month, validation should include customers or periods that were not available during training."
        ],
        keyTerms: [
          {
            term: "validation set",
            definition:
              "Held-out data used during development to compare model choices and tune hyperparameters."
          },
          {
            term: "test set",
            definition:
              "A reserved evaluation set used after model selection to estimate final performance."
          },
          {
            term: "baseline",
            definition:
              "A simple reference method used to judge whether a model adds value."
          }
        ],
        checkYourself: [
          {
            prompt: "What does a baseline protect you from?",
            reveal:
              "It protects you from mistaking complexity for value. A model must beat simple heuristics under the same honest split to justify added cost."
          }
        ],
        callout: {
          tone: "warning",
          body:
            "Never tune repeatedly on the final test set. Once it influences decisions, it becomes part of development and loses its unbiased role."
        }
      },
      {
        id: "model-families",
        heading: "Different model families express different assumptions",
        paragraphs: [
          "Linear models are strong baselines because they are fast, interpretable, and stable under good feature engineering. Logistic regression models log-odds as a linear combination of inputs. Ridge and lasso regularization control coefficient size and can handle many correlated features. Their weakness is representational: without engineered interactions or nonlinear transforms, they miss complex boundaries.",
          "Tree-based models split feature space into regions. Decision trees are easy to explain but can overfit; random forests average many trees for variance reduction; gradient boosted trees build additive ensembles that often dominate tabular benchmarks. Trees handle mixed scales and nonlinear interactions well, but they still need careful validation, categorical strategy, and monitoring for distribution shift.",
          "Kernel methods, nearest-neighbor methods, and neural networks add more flexibility. SVMs can create nonlinear boundaries through kernels, KNN relies on distance geometry, and neural networks learn layered representations. The right workshop comparison is not which family is universally best. It is which family matches data size, feature type, latency, interpretability, and maintenance constraints."
        ],
        keyTerms: [
          {
            term: "regularization",
            definition:
              "A constraint or penalty that discourages overly complex models and improves generalization."
          },
          {
            term: "ensemble",
            definition:
              "A model composed of multiple learners whose predictions are combined."
          },
          {
            term: "inductive bias",
            definition:
              "The assumptions a model family uses to generalize beyond observed examples."
          }
        ],
        checkYourself: [
          {
            prompt: "Why do tree ensembles often perform well on tabular data?",
            reveal:
              "They capture nonlinear thresholds and interactions, tolerate mixed feature scales, and reduce overfitting through averaging or boosting when tuned carefully."
          }
        ],
        callout: {
          tone: "interview",
          body:
            "Compare model families by assumptions and constraints: data size, feature type, interpretability, latency, update frequency, and failure modes."
        }
      },
      {
        id: "metrics-and-calibration",
        heading: "Metrics must match the cost of mistakes",
        paragraphs: [
          "Accuracy is easy to understand but weak for imbalanced problems. A fraud detector with 99 percent legitimate transactions can reach 99 percent accuracy by predicting `not fraud` every time. Precision asks how many predicted positives were correct; recall asks how many true positives were found. F1 balances them, while PR-AUC is often more informative than ROC-AUC when positives are rare.",
          "Regression metrics also encode values. Mean squared error punishes large errors heavily, mean absolute error is more robust to outliers, and quantile loss is useful when prediction intervals or asymmetric costs matter. Ranking metrics such as NDCG or mean reciprocal rank care about order and top results. The metric should reflect the product decision: triage, pricing, ranking, alerting, or automation.",
          "Probability quality is separate from ranking quality. A classifier can rank positives above negatives and still output poorly calibrated probabilities. Calibration matters when thresholds, expected costs, or human workflows depend on predicted risk. Reliability diagrams, Brier score, Platt scaling, and isotonic regression are tools for checking and improving probability estimates after honest validation."
        ],
        keyTerms: [
          {
            term: "precision",
            definition:
              "The fraction of predicted positive examples that are actually positive."
          },
          {
            term: "recall",
            definition:
              "The fraction of actual positive examples that the model finds."
          },
          {
            term: "calibration",
            definition:
              "The alignment between predicted probabilities and observed outcome frequencies."
          }
        ],
        checkYourself: [
          {
            prompt: "Why can ROC-AUC look good while a rare-event model is unusable?",
            reveal:
              "ROC-AUC can remain high even when the top predicted positives contain too many false alarms. PR metrics and threshold analysis better expose rare-positive usefulness."
          }
        ],
        callout: {
          tone: "tip",
          body:
            "Always translate metrics into operational consequences: false alarms, missed cases, manual review load, revenue, latency, or user harm."
        }
      },
      {
        id: "error-analysis",
        heading: "Error analysis turns scores into next steps",
        paragraphs: [
          "A single aggregate metric rarely tells you what to fix. Error analysis slices performance by label, segment, time period, geography, device, source system, confidence bucket, and feature availability. The goal is to find systematic failure modes: a model may perform well overall while failing new users, minority languages, rare product categories, or high-value customers.",
          "Look at individual errors with context. False positives and false negatives often reveal label noise, ambiguous cases, missing features, distribution shift, or a mismatch between metric and product cost. A confusion matrix can show class-level patterns; calibration plots can show risk estimates; residual plots can show bias by predicted value. These artifacts convert model work from guesswork into targeted experiments.",
          "The workshop loop is simple: train a baseline, evaluate honestly, inspect errors, form a hypothesis, change data or model, and measure again. Hyperparameter search should not replace this loop. If the model is missing a feature that captures seasonality, no amount of tuning will make a linear feature-less model understand the calendar. Error analysis tells you whether to collect data, clean labels, engineer features, change model family, or adjust thresholds."
        ],
        keyTerms: [
          {
            term: "confusion matrix",
            definition:
              "A table that counts predicted versus actual classes to expose error patterns."
          },
          {
            term: "slice evaluation",
            definition:
              "Measuring performance on meaningful subsets of data rather than only the aggregate."
          },
          {
            term: "threshold",
            definition:
              "A decision cutoff that converts a score or probability into an action."
          }
        ],
        checkYourself: [
          {
            prompt: "When should you change a threshold instead of retraining?",
            reveal:
              "If ranking quality is acceptable but the operational tradeoff between false positives and false negatives is wrong, threshold tuning may solve the decision problem without changing the model."
          }
        ],
        callout: {
          tone: "interview",
          body:
            "A strong supervised-learning workflow ends with error analysis and deployment criteria, not with the best validation score alone."
        }
      }
    ],
    wrapUp: {
      takeaways: [
        "Supervised learning fits a target-specific function under a loss and model-family constraint.",
        "Honest splits and baselines are prerequisites for meaningful improvement claims.",
        "Model families differ by assumptions, flexibility, interpretability, latency, and maintenance cost.",
        "Metrics and calibration must match the operational cost of mistakes.",
        "Error analysis turns aggregate scores into concrete data, feature, model, or threshold changes."
      ],
      nextSteps: [
        "Build a baseline and a tree ensemble on the same split, then compare error slices.",
        "Plot precision-recall tradeoffs for an imbalanced classifier.",
        "Write a one-page model card section explaining target, split, metric, and known failure slices."
      ]
    }
  },
  "ml-interactive-lab/unsupervised-learning-workshop": {
    title: "Chapter: Unsupervised learning workshop",
    readingTime: "65-80 min",
    premise:
      "Unsupervised learning searches for structure without direct labels. This chapter covers clustering, dimensionality reduction, anomaly detection, validation, interpretability, and production use cases.",
    parts: [
      {
        id: "structure-without-labels",
        heading: "Unsupervised learning proposes structure; it does not prove meaning",
        paragraphs: [
          "Unsupervised learning operates without target labels, so its outputs need interpretation. A clustering algorithm can group customers, but it cannot tell you that the groups are useful segments. A dimensionality reduction plot can reveal neighborhoods, but it can also exaggerate separations. An anomaly detector can score unusual points, but unusual does not always mean bad.",
          "This makes the problem both powerful and dangerous. Without labels, you can explore data, compress representations, detect outliers, initialize downstream tasks, and discover patterns that were not specified in advance. Without clear validation, you can also invent stories around artifacts of scale, sampling, preprocessing, or visualization. The workshop discipline is to separate algorithmic output from business interpretation.",
          "Before choosing a method, define the intended action. Will clusters drive marketing journeys, manual review queues, data quality checks, prototype labels, or feature compression? The action determines acceptable false positives, required stability, and interpretability. A beautiful two-dimensional plot is not a product requirement unless someone can act on it responsibly."
        ],
        keyTerms: [
          {
            term: "unsupervised learning",
            definition:
              "Learning patterns from inputs without explicit target labels."
          },
          {
            term: "cluster",
            definition:
              "A group of examples considered similar under a chosen representation and algorithm."
          },
          {
            term: "representation learning",
            definition:
              "Learning transformed features that capture useful structure in data."
          }
        ],
        checkYourself: [
          {
            prompt: "Why should cluster names be assigned after inspection rather than by the algorithm?",
            reveal:
              "The algorithm groups points by mathematical criteria. Human inspection, domain knowledge, and downstream validation are needed to decide what those groups mean, if anything."
          }
        ],
        callout: {
          tone: "warning",
          body:
            "Unsupervised outputs invite over-interpretation. Treat them as hypotheses until validated against stability, domain review, and downstream usefulness."
        }
      },
      {
        id: "clustering",
        heading: "Clustering depends on geometry and assumptions",
        paragraphs: [
          "KMeans partitions data by assigning points to the nearest centroid and updating centroids until stable. It works best when clusters are roughly spherical, similarly sized, and meaningful under Euclidean distance. Scaling matters intensely because large-unit features dominate distance. The number of clusters is a design choice, not a truth discovered by the algorithm.",
          "Density-based methods such as DBSCAN look for dense regions separated by sparse space. They can find irregular shapes and mark noise points, but they depend on neighborhood radius and minimum samples. Hierarchical clustering builds a tree of merges or splits and can be useful when you want nested structure. Gaussian mixtures model clusters as probability distributions and can express soft membership.",
          "The practical question is which notion of similarity matches the use case. Users can be similar by purchase mix, timing, support needs, embeddings, or lifecycle stage. A poor representation makes every clustering algorithm look mysterious. Start with normalized, interpretable features; examine cluster profiles; test stability under resampling; and compare whether clusters lead to different decisions."
        ],
        keyTerms: [
          {
            term: "centroid",
            definition:
              "The representative center of a cluster, commonly the mean of assigned points in KMeans."
          },
          {
            term: "density clustering",
            definition:
              "Clustering based on dense neighborhoods separated by sparse regions."
          },
          {
            term: "soft membership",
            definition:
              "A probabilistic assignment where an example can partially belong to multiple clusters."
          }
        ],
        checkYourself: [
          {
            prompt: "Why does KMeans require feature scaling?",
            reveal:
              "KMeans uses distance to centroids. Features with larger numeric ranges dominate the distance calculation unless scaling makes dimensions comparable."
          }
        ],
        callout: {
          tone: "tip",
          body:
            "Cluster validation is not only a silhouette score. Profile clusters and ask whether different actions would be taken for each group."
        }
      },
      {
        id: "dimensionality-reduction",
        heading: "Dimensionality reduction trades detail for viewability or compression",
        paragraphs: [
          "Dimensionality reduction maps high-dimensional data into fewer coordinates. PCA finds orthogonal directions of maximum variance and is useful for compression, denoising, and quick inspection. It is linear, deterministic for a fixed input, and gives components that can be explained through loadings. Its weakness is that high variance is not always the same as task-relevant structure.",
          "t-SNE and UMAP are popular for visualization because they preserve local neighborhoods in two or three dimensions. They are not faithful maps of all global distances. Cluster size, spacing, and separation on the plot can be affected by parameters and sampling. A t-SNE island may be worth investigating, but it is not proof that a product segment exists.",
          "Embeddings add another dimension to the story. Text, images, users, and products can be represented by dense vectors learned from large models. Reducing those embeddings for visualization can reveal neighborhoods, duplicates, or anomalies. The same caution applies: the embedding model's training data and objective define similarity. You must validate whether that similarity serves your domain."
        ],
        keyTerms: [
          {
            term: "PCA",
            definition:
              "Principal component analysis, a linear method that projects data onto directions of maximum variance."
          },
          {
            term: "embedding",
            definition:
              "A dense vector representation learned to place related items near one another under a chosen objective."
          },
          {
            term: "local neighborhood",
            definition:
              "A set of nearby points whose relationships a visualization method may try to preserve."
          }
        ],
        checkYourself: [
          {
            prompt: "What should you not infer from a two-dimensional t-SNE plot?",
            reveal:
              "Do not treat global distances, cluster sizes, or visual gaps as exact measurements. The plot is an exploratory view, not a metric-preserving map."
          }
        ],
        callout: {
          tone: "interview",
          body:
            "Explain PCA as variance-preserving linear projection and t-SNE/UMAP as local-neighborhood visualization. That contrast prevents common overclaims."
        }
      },
      {
        id: "anomaly-detection",
        heading: "Anomaly detection ranks unusualness, then humans define risk",
        paragraphs: [
          "An anomaly detector identifies examples that differ from common patterns. The method might use distance to neighbors, reconstruction error, isolation depth, density estimates, or statistical thresholds. This is useful for fraud triage, data quality alerts, security monitoring, sensor faults, and rare operational failures. However, unusual is not the same as harmful, and common is not the same as safe.",
          "Threshold selection is the core product decision. Too strict and reviewers drown in false alarms; too loose and important cases are missed. Without labels, thresholds can be set by review capacity, historical alert rates, domain rules, or a small adjudicated sample. As labels accumulate from review outcomes, the system may transition from unsupervised scoring to semi-supervised or supervised learning.",
          "Anomaly systems are sensitive to drift. If normal behavior changes, the model may flood alerts. If attackers adapt, the model may normalize bad behavior. Monitoring should track score distributions, alert volume, reviewer agreement, confirmed incident rate, and feature freshness. The detector is one part of an operational loop that includes investigation, feedback, retraining, and policy."
        ],
        keyTerms: [
          {
            term: "anomaly score",
            definition:
              "A numeric estimate of how unusual an example is under a chosen model or rule."
          },
          {
            term: "reconstruction error",
            definition:
              "The difference between an input and a model's attempt to reproduce it, often used for anomaly detection."
          },
          {
            term: "review capacity",
            definition:
              "The practical number of alerts humans or downstream systems can investigate."
          }
        ],
        checkYourself: [
          {
            prompt: "Why is alert volume a model monitoring metric?",
            reveal:
              "Alert volume reflects threshold behavior, drift, and operational load. A technically accurate anomaly score can still fail if it overwhelms reviewers."
          }
        ],
        callout: {
          tone: "warning",
          body:
            "Anomaly detection needs a response loop. Scoring unusual points without feedback or action rarely creates durable value."
        }
      },
      {
        id: "validation-and-production",
        heading: "Validate unsupervised systems through stability and usefulness",
        paragraphs: [
          "Without labels, validation must combine multiple signals. Internal metrics such as silhouette score, inertia, density separation, or explained variance can detect obvious problems, but they do not prove business value. Stability under resampling, time windows, feature perturbations, and parameter changes is often more revealing. If clusters vanish when a small sample changes, they may not be robust enough for product decisions.",
          "External validation appears when the unsupervised output affects something measurable. Customer segments can be tested through campaign lift, support routing accuracy, or retention differences. Embedding neighborhoods can be evaluated through retrieval relevance or duplicate detection. Anomaly queues can be evaluated through reviewer precision. The key is to connect structure discovery to an action and outcome.",
          "Productionizing unsupervised learning also requires lifecycle planning. New data can shift cluster centroids, embeddings can change after model upgrades, and visualization coordinates can move between runs. Persist versioned transformations, monitor distribution and assignment drift, document interpretation limits, and avoid presenting exploratory group labels as permanent facts about users. The responsible posture is humble: the model proposes structure; the system tests whether acting on it helps."
        ],
        keyTerms: [
          {
            term: "silhouette score",
            definition:
              "A clustering metric comparing how close points are to their own cluster versus other clusters."
          },
          {
            term: "stability",
            definition:
              "The degree to which unsupervised outputs remain similar under reasonable changes to data or parameters."
          },
          {
            term: "assignment drift",
            definition:
              "A change over time in how examples are assigned to clusters, topics, or anomaly bands."
          }
        ],
        checkYourself: [
          {
            prompt: "What is a good sign that unsupervised segments are useful?",
            reveal:
              "They lead to different, measurable actions or outcomes, such as improved campaign lift, better routing, clearer analysis, or more precise review queues."
          }
        ],
        callout: {
          tone: "interview",
          body:
            "For unsupervised systems, pair internal metrics with stability checks and downstream validation. That is stronger than naming an algorithm alone."
        }
      }
    ],
    wrapUp: {
      takeaways: [
        "Unsupervised learning discovers candidate structure but requires interpretation and validation.",
        "Clustering depends on representation, scale, similarity assumptions, and actionability.",
        "Dimensionality reduction is useful for compression and exploration but can mislead when overread.",
        "Anomaly detection must connect scores to thresholds, review capacity, and feedback loops.",
        "Production unsupervised systems need versioning, stability checks, drift monitoring, and humility about labels."
      ],
      nextSteps: [
        "Run KMeans with and without scaling, then profile each cluster.",
        "Compare PCA and UMAP plots while documenting what each plot cannot prove.",
        "Design an anomaly alert threshold based on reviewer capacity and expected precision."
      ]
    }
  }
};

/** @type {Record<string, import('../learnChapters.js').LessonLearnChapter>} */
export const mlInteractiveLabChapters = JSON.parse(JSON.stringify(chapters));
