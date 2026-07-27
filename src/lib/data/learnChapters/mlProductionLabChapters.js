const chapters = {
  "ml-production-lab/leakage-safe-pipelines": {
    title: "Chapter: Leakage-safe pipelines",
    readingTime: "65-80 min",
    premise:
      "Production ML pipelines must prevent future information from entering training and validation. This chapter covers leakage types, fold-safe preprocessing, point-in-time joins, split design, and pipeline tests.",
    parts: [
      {
        id: "leakage-definition",
        heading: "Leakage is illegal information flow",
        paragraphs: [
          "Data leakage occurs when training or validation uses information that would not be available at prediction time. The model may appear excellent offline because it has seen clues from the future, the label, or the validation population. In production, those clues disappear and performance collapses. Leakage is therefore a correctness defect, not a minor evaluation issue.",
          "Leakage can be direct, such as a feature that contains the final outcome. It can be indirect, such as a status field that is updated only after a decision, a timestamp that reveals process completion, or a target-encoded category computed using validation labels. It can also be procedural, such as fitting a scaler, imputer, PCA transform, or feature selector before splitting data.",
          "The safest mental model is the prediction-time contract. For each row, define the moment the model makes a prediction and list exactly what facts are available then. Any feature, transformation, label, or join that relies on later information is illegal. This framing works across tabular ML, time series, recommender systems, fraud, healthcare, and LLM evaluation datasets."
        ],
        keyTerms: [
          {
            term: "data leakage",
            definition:
              "Use of information during training or evaluation that would not be available for honest prediction."
          },
          {
            term: "prediction-time contract",
            definition:
              "A specification of what facts are available at the moment a model is allowed to predict."
          },
          {
            term: "label leakage",
            definition:
              "A feature or process accidentally exposes the target or a proxy for the target."
          }
        ],
        checkYourself: [
          {
            prompt: "Why is leakage a release-blocking bug?",
            reveal:
              "It invalidates offline evidence. A model selected under leakage may not perform when deployed because production lacks the leaked information."
          }
        ],
        callout: {
          tone: "warning",
          body:
            "If a feature is known only after the event being predicted, it is not a feature. It is time travel."
        }
      },
      {
        id: "preprocessing-inside-folds",
        heading: "Learned preprocessing belongs inside cross-validation folds",
        paragraphs: [
          "Preprocessing steps often learn from data. Imputers learn medians or modes, scalers learn means and variances, encoders learn vocabularies, PCA learns directions, and target encoders learn label statistics. If these are fit on the full dataset before cross-validation, validation rows influence the transformations used to train the model. That is leakage even though no explicit target column was joined.",
          "The correct pattern is split first, then fit transformations only on the training portion of each fold. Validation rows are transformed using parameters learned from that fold's training rows. In scikit-learn, `Pipeline` and `ColumnTransformer` make this pattern natural because `cross_val_score` clones and fits the whole pipeline inside each fold. Hand-written preprocessing outside the pipeline often breaks the contract.",
          "This discipline also mirrors serving. A deployed model transforms new requests using artifacts learned earlier, not statistics recomputed from the request batch. The serialized model package should include preprocessing parameters, category vocabularies, feature order, and schema expectations. The boundary between preprocessing and model is artificial; both are part of the trained predictor."
        ],
        keyTerms: [
          {
            term: "fold-safe preprocessing",
            definition:
              "Fitting transformations only on the training partition of each validation fold."
          },
          {
            term: "ColumnTransformer",
            definition:
              "A scikit-learn utility that applies different preprocessing pipelines to different column subsets."
          },
          {
            term: "fitted artifact",
            definition:
              "A learned preprocessing or model object whose parameters must be reused consistently."
          }
        ],
        checkYourself: [
          {
            prompt: "Why is scaling before train-test split leaky?",
            reveal:
              "The test distribution contributes to the mean and standard deviation, so training data is transformed using information from held-out rows."
          }
        ],
        callout: {
          tone: "interview",
          body:
            "Use the phrase `learned preprocessing parameters are model parameters` to explain why they must be fit inside folds."
        }
      },
      {
        id: "point-in-time",
        heading: "Point-in-time joins prevent future facts from entering features",
        paragraphs: [
          "Warehouses are optimized for analysis, not always for prediction-time truth. A simple join on customer id may attach a lifetime aggregate that includes events after the prediction timestamp. For training a model that scores customers on Monday, a feature computed with Wednesday's events leaks future behavior. Point-in-time joins solve this by joining only feature values available before the row's prediction time.",
          "Feature stores and time-aware tables often maintain event timestamps, processing timestamps, and materialization times. The training builder can then ask for the latest feature value as of `t`, optionally respecting a freshness lag. This produces rows that resemble what online serving would have known. Late-arriving data must be handled by policy, not accident.",
          "Testing point-in-time correctness requires concrete timelines. Pick a few entities, list their events, choose prediction times, and verify that future events are excluded. Automated tests can catch off-by-one timestamp bugs, timezone mistakes, and accidental full-history joins. These bugs are common because SQL that looks reasonable for analytics can be invalid for ML."
        ],
        keyTerms: [
          {
            term: "point-in-time join",
            definition:
              "A join that uses only feature values available before each example's prediction timestamp."
          },
          {
            term: "feature freshness",
            definition:
              "How recently a feature value reflects source data relative to prediction time."
          },
          {
            term: "as-of time",
            definition:
              "The timestamp boundary used to decide which historical facts are visible."
          }
        ],
        checkYourself: [
          {
            prompt: "Why is a lifetime aggregate dangerous for future prediction?",
            reveal:
              "It may include events that happen after the prediction moment, allowing the model to learn from facts unavailable in production."
          }
        ],
        callout: {
          tone: "warning",
          body:
            "Analytics joins answer `what happened overall`; ML training joins must answer `what was known then`."
        }
      },
      {
        id: "split-design",
        heading: "Split design should match the deployment boundary",
        paragraphs: [
          "A random row split assumes future examples are exchangeable with past examples and independent across rows. That assumption fails when rows share users, sessions, devices, documents, or time periods. If the same customer appears in both train and validation, a churn model may learn customer-specific history instead of general behavior. If future months appear in training, a forecasting model may avoid the hard part of forecasting.",
          "Group splits keep all examples from one entity in the same partition. Time splits train on earlier periods and validate on later periods. Nested validation keeps hyperparameter tuning from contaminating final evaluation. Stratification helps preserve label ratios but should not override leakage boundaries. The split is a model requirement, not a convenience setting.",
          "A useful production lab compares metrics across split strategies. If random validation is high and time-based validation is much lower, the issue is not necessarily a worse model. It may reveal temporal drift, missing recency features, or leakage in the random split. Honest discomfort is valuable because it prevents deploying a model whose apparent performance depends on unrealistic evaluation."
        ],
        keyTerms: [
          {
            term: "group split",
            definition:
              "A split that keeps examples from the same entity or group in only one partition."
          },
          {
            term: "time split",
            definition:
              "A split that trains on earlier data and validates on later data."
          },
          {
            term: "nested validation",
            definition:
              "An evaluation pattern that separates hyperparameter selection from final model assessment."
          }
        ],
        checkYourself: [
          {
            prompt: "When should you prefer GroupKFold over random KFold?",
            reveal:
              "When examples from the same user, patient, merchant, document, session, or other entity could appear multiple times and leak identity-specific information."
          }
        ],
        callout: {
          tone: "tip",
          body:
            "Ask what will be new in production: new time, new user, new item, new geography, or new source system. Split accordingly."
        }
      },
      {
        id: "pipeline-tests",
        heading: "Leakage-safe systems need tests, not trust",
        paragraphs: [
          "Leakage prevention should be encoded as tests and release checks. Unit tests can verify that preprocessing is inside pipelines, feature builders reject future timestamps, and split assignments are stable. Data tests can inspect row counts, null rates, timestamp ranges, duplicate entities across partitions, and label availability. Integration tests can train a tiny pipeline and assert that validation transforms do not refit on validation rows.",
          "Negative controls are helpful. Train with shuffled labels; performance should collapse. Train with an intentionally leaky feature in a controlled test; the metric should spike, proving the harness would notice suspicious results. Compare feature timestamps to prediction timestamps. Alert when an offline metric improves too suddenly without a plausible modeling explanation.",
          "Documentation also matters. A model card or release note should state prediction time, legal features, split design, preprocessing pipeline, leakage tests, and known limitations. This makes future changes safer. Leakage often returns during maintenance when someone adds a convenient warehouse column without understanding why the earlier pipeline was strict."
        ],
        keyTerms: [
          {
            term: "negative control",
            definition:
              "A test setup expected to fail or degrade, used to verify that the evaluation harness detects invalid signal."
          },
          {
            term: "data test",
            definition:
              "An automated check over dataset properties such as ranges, nulls, duplicates, timestamps, or schema."
          },
          {
            term: "model card",
            definition:
              "A document describing model purpose, data, evaluation, limitations, and operational considerations."
          }
        ],
        checkYourself: [
          {
            prompt: "What should happen when labels are shuffled in a leakage-safe pipeline?",
            reveal:
              "Performance should fall near chance or a weak baseline. Strong performance with shuffled labels suggests leakage, duplicates, or a flawed evaluation setup."
          }
        ],
        callout: {
          tone: "interview",
          body:
            "A strong production answer includes tests for timestamp legality, split isolation, fold-safe preprocessing, and suspicious metric jumps."
        }
      }
    ],
    wrapUp: {
      takeaways: [
        "Leakage is any illegal information flow from future, labels, validation data, or grouped entities.",
        "Learned preprocessing must be fit inside training folds and serialized with the model.",
        "Point-in-time joins align training features with what serving would have known.",
        "Splits must match the production generalization boundary.",
        "Leakage prevention should be enforced through tests, traces, and release documentation."
      ],
      nextSteps: [
        "Identify three potentially leaky columns in a warehouse-style table.",
        "Design a point-in-time join test for one entity timeline.",
        "Compare random, group, and time-based validation metrics for the same model."
      ]
    }
  },
  "ml-production-lab/drift-and-monitoring-lab": {
    title: "Chapter: Drift and monitoring lab",
    readingTime: "65-80 min",
    premise:
      "ML monitoring watches data, predictions, outcomes, and system behavior after deployment. This chapter covers drift types, reference windows, metrics, alerting, delayed labels, and retraining decisions.",
    parts: [
      {
        id: "monitoring-scope",
        heading: "Model monitoring watches a socio-technical system",
        paragraphs: [
          "A deployed model is embedded in a changing product, data pipeline, user population, and serving system. Monitoring must therefore cover more than model accuracy. Input schemas can break, feature distributions can shift, prediction scores can collapse, labels can change meaning, latency can increase, and users can respond to the model in ways that change future data.",
          "Monitoring layers include infrastructure, data quality, feature drift, prediction drift, outcome performance, fairness slices, and business metrics. Infrastructure tells you whether the service is alive. Data quality tells you whether inputs are valid. Drift tells you whether the world resembles training. Outcome metrics tell you whether predictions remain useful when labels arrive.",
          "The lab mindset is to connect each metric to an action. An alert that no one knows how to interpret becomes noise. A missing-rate spike might roll back a pipeline deploy. A score distribution shift might trigger shadow evaluation. A delayed performance drop might start retraining or policy review. Monitoring is valuable when it shortens time from symptom to decision."
        ],
        keyTerms: [
          {
            term: "feature drift",
            definition:
              "A change in the distribution or meaning of model input features relative to a reference period."
          },
          {
            term: "prediction drift",
            definition:
              "A change in the distribution of model outputs or scores over time."
          },
          {
            term: "reference window",
            definition:
              "The baseline data period used to compare current production behavior."
          }
        ],
        checkYourself: [
          {
            prompt: "Why monitor prediction scores even before labels arrive?",
            reveal:
              "Score distributions can reveal input changes, serving bugs, or population shifts before outcome labels become available."
          }
        ],
        callout: {
          tone: "tip",
          body:
            "Every monitoring chart should have an owner, interpretation guide, and response path. Otherwise it is dashboard decoration."
        }
      },
      {
        id: "drift-types",
        heading: "Data drift, concept drift, and label shift are different problems",
        paragraphs: [
          "Data drift means input distributions change. A feature such as device type, transaction amount, or query language may shift because the product changed, a new market launched, or a logging pipeline broke. Data drift does not automatically mean the model is wrong, but it tells you the model is operating farther from its training evidence.",
          "Concept drift means the relationship between inputs and target changes. The same feature values now imply different outcomes. Fraud patterns evolve, user preferences change, medical practice updates, and economic conditions alter risk. Concept drift usually requires outcome labels or proxy feedback to detect because input distributions alone may look stable.",
          "Label shift means class proportions change while class-conditional feature distributions may remain similar. A support classifier may see many more billing tickets after a pricing change. Thresholds, calibration, and capacity planning can break even if per-class recognition remains decent. Clear terminology helps choose the fix: data validation, recalibration, retraining, threshold adjustment, or product intervention."
        ],
        keyTerms: [
          {
            term: "data drift",
            definition:
              "A change in input feature distributions relative to a baseline."
          },
          {
            term: "concept drift",
            definition:
              "A change in the relationship between inputs and target outcomes."
          },
          {
            term: "label shift",
            definition:
              "A change in class or outcome proportions."
          }
        ],
        checkYourself: [
          {
            prompt: "Which drift type requires labels or outcome feedback to confirm?",
            reveal:
              "Concept drift requires evidence that the input-target relationship changed, which usually needs labels or reliable outcome proxies."
          }
        ],
        callout: {
          tone: "interview",
          body:
            "Do not use `drift` as one bucket. Name the drift type and the evidence needed to detect it."
        }
      },
      {
        id: "metrics-and-tests",
        heading: "Drift metrics should be simple enough to operate",
        paragraphs: [
          "Common drift checks include missing rates, invalid value rates, category frequencies, quantiles, population stability index, Kolmogorov-Smirnov tests, Jensen-Shannon divergence, embedding-distance summaries, and score histograms. The best metric depends on feature type and actionability. A category-frequency alert may be clearer than an abstract divergence score for a high-impact feature.",
          "Reference windows need thought. Comparing today's traffic to the original training set can reveal long-term drift, while comparing to last week can catch sudden breaks. Seasonal products may need day-of-week or holiday-aware baselines. Too-sensitive thresholds create alert fatigue; too-loose thresholds miss incidents. Backtesting alerts on historical data helps tune them.",
          "Slice monitoring is often more important than aggregate monitoring. A model can look stable overall while failing one geography, device, language, or customer tier. Monitor high-risk slices and slices tied to fairness or compliance. When sample sizes are small, show uncertainty or minimum-count rules rather than overreacting to noise."
        ],
        keyTerms: [
          {
            term: "PSI",
            definition:
              "Population stability index, a binned distribution-shift measure commonly used in risk modeling."
          },
          {
            term: "alert fatigue",
            definition:
              "Reduced responsiveness caused by too many low-value or noisy alerts."
          },
          {
            term: "slice monitoring",
            definition:
              "Tracking metrics separately for meaningful subpopulations or conditions."
          }
        ],
        checkYourself: [
          {
            prompt: "Why might last-week comparison miss slow drift?",
            reveal:
              "Gradual changes can look small week to week while accumulating far from the training distribution over months."
          }
        ],
        callout: {
          tone: "tip",
          body:
            "Pair short-term baselines for incident detection with training-set baselines for model-validity checks."
        }
      },
      {
        id: "delayed-labels",
        heading: "Delayed labels make monitoring a two-speed system",
        paragraphs: [
          "Many labels arrive late. Fraud chargebacks, churn, loan defaults, medical outcomes, and support resolutions can take days or months. During that delay, teams rely on input quality, feature drift, prediction drift, proxy metrics, and human review samples. Once labels arrive, they can compute true performance and calibration.",
          "Proxy metrics need humility. A click, escalation, or manual override may correlate with model quality but can be affected by UI changes, policy, incentives, and user behavior. Proxies are useful early warning signals, not final truth. When possible, compare proxies against eventual labels to understand their reliability.",
          "Delayed-label systems should store prediction logs with model version, feature vector or feature references, score, threshold, action, context, and later outcome. This enables backtesting, calibration checks, and incident analysis. Without joined prediction-outcome logs, teams cannot confidently answer whether a model degraded or whether the monitored outcome changed for another reason."
        ],
        keyTerms: [
          {
            term: "delayed label",
            definition:
              "An outcome that becomes known only after a time lag following prediction."
          },
          {
            term: "proxy metric",
            definition:
              "An indirect signal used before the primary outcome is available."
          },
          {
            term: "prediction log",
            definition:
              "A durable record of model inputs, outputs, versions, actions, and later outcomes."
          }
        ],
        checkYourself: [
          {
            prompt: "Why should prediction logs include model version?",
            reveal:
              "When outcomes arrive later, version metadata lets teams attribute performance to the model and pipeline that actually made each decision."
          }
        ],
        callout: {
          tone: "warning",
          body:
            "Proxy metrics can be gamed or confounded. Treat them as smoke alarms, not courtroom evidence."
        }
      },
      {
        id: "response-loop",
        heading: "Monitoring should trigger diagnosis before retraining",
        paragraphs: [
          "Retraining is not the answer to every alert. A missing feature spike may require a data pipeline rollback. A category drift alert may require adding a new product mapping. A calibration drop may need threshold adjustment. A fairness slice regression may need policy review and targeted data collection. Blind retraining can preserve or amplify the underlying problem.",
          "A response playbook should classify alerts by severity, owner, likely causes, immediate mitigation, and follow-up analysis. For high-impact models, safe responses may include disabling automation, falling back to rules, increasing human review, narrowing model scope, or rolling back to a previous version. Monitoring is part of risk control, not only model improvement.",
          "When retraining is appropriate, use the same discipline as the original launch. Version the new data, compare against fixed and recent holdouts, check slices, validate calibration, and run shadow or canary deployment. The monitoring signal that started the retrain should become part of the evaluation evidence that proves the new model addresses the issue."
        ],
        keyTerms: [
          {
            term: "response playbook",
            definition:
              "A documented set of actions, owners, and escalation paths for monitoring alerts."
          },
          {
            term: "shadow deployment",
            definition:
              "Running a candidate model on live traffic without affecting user-visible decisions."
          },
          {
            term: "canary deployment",
            definition:
              "Releasing a model to a small traffic slice before broader rollout."
          }
        ],
        checkYourself: [
          {
            prompt: "Why can retraining be the wrong first response to drift?",
            reveal:
              "The alert may be caused by data breakage, product change, threshold mismatch, or monitoring error. Retraining without diagnosis can hide the root cause."
          }
        ],
        callout: {
          tone: "interview",
          body:
            "A production monitoring answer should end with actions: rollback, fallback, review, recalibrate, retrain, or investigate."
        }
      }
    ],
    wrapUp: {
      takeaways: [
        "ML monitoring spans infrastructure, data quality, drift, predictions, labels, slices, and business impact.",
        "Data drift, concept drift, and label shift require different evidence and responses.",
        "Reference windows, thresholds, and slice definitions determine alert usefulness.",
        "Delayed labels require proxy monitoring plus durable prediction-outcome logs.",
        "Monitoring should drive diagnosis and controlled response, not automatic retraining by reflex."
      ],
      nextSteps: [
        "Design a monitoring dashboard with one metric per layer: service, data, score, outcome, and slice.",
        "Backtest a drift threshold against historical feature distributions.",
        "Write an alert playbook for a sudden missing-rate spike in a top feature."
      ]
    }
  },
  "ml-production-lab/serving-contracts-lab": {
    title: "Chapter: Serving contracts lab",
    readingTime: "65-80 min",
    premise:
      "Serving contracts define the boundary between clients, feature systems, models, and downstream decisions. This chapter covers schemas, latency, versioning, fallbacks, observability, and compatibility.",
    parts: [
      {
        id: "contract-boundary",
        heading: "A serving contract makes inference predictable",
        paragraphs: [
          "A model service is not just a function from JSON to prediction. It is a contract describing request schema, feature meanings, allowed ranges, missing-value behavior, model version, response schema, latency expectations, error semantics, and ownership. Clients build against that contract. If it changes silently, downstream products can make wrong decisions even while HTTP requests still return 200.",
          "The contract should include both raw request fields and derived feature requirements. Units matter: dollars versus cents, seconds versus milliseconds, UTC versus local time. Types matter: strings that look numeric are not necessarily numeric. Optional fields need defaults or explicit rejection. Categories need unknown handling. A model trained on one coordinate system cannot safely consume another.",
          "Serving contracts also define responsibility. The client may provide request-time facts, the feature service may provide historical aggregates, and the model server may apply preprocessing. Each boundary needs validation and versioning. Without clear ownership, incidents become arguments over whether the client sent bad data or the model handled it badly."
        ],
        keyTerms: [
          {
            term: "serving contract",
            definition:
              "An agreement specifying inference request and response schemas, feature semantics, versions, errors, and operational expectations."
          },
          {
            term: "schema validation",
            definition:
              "Checking that inputs or outputs match expected fields, types, ranges, and constraints."
          },
          {
            term: "unknown handling",
            definition:
              "Defined behavior for categories or values not observed during training."
          }
        ],
        checkYourself: [
          {
            prompt: "Why are units part of a serving contract?",
            reveal:
              "A model trained on seconds, dollars, or normalized values will misinterpret milliseconds, cents, or raw values even if field names and types match."
          }
        ],
        callout: {
          tone: "tip",
          body:
            "A schema that validates type but not meaning is incomplete. Include units, freshness, defaults, and allowed ranges."
        }
      },
      {
        id: "preprocessing-and-artifacts",
        heading: "The served artifact includes preprocessing and metadata",
        paragraphs: [
          "The deployed predictor should include the preprocessing pipeline, fitted parameters, feature order, vocabularies, model weights, thresholds, calibration maps, and metadata. A raw estimator without its preprocessing is only part of the model. If serving reimplements transformations in another language, the team needs equivalence tests and strong reasons for the duplication.",
          "Artifact versioning lets teams reproduce predictions. Given a request id, engineers should identify the model version, data contract version, feature definitions, preprocessing parameters, and response. This matters for debugging, rollback, compliance, and customer support. Version strings should be machine-readable and logged, not hidden in a release note.",
          "Backward compatibility is a product decision. Some changes add optional fields and are safe. Others change feature meaning or output semantics and require a new version. Clients need migration windows when response fields change. Batch scoring jobs need the same contract discipline as online APIs because they may feed high-impact decisions downstream."
        ],
        keyTerms: [
          {
            term: "model artifact",
            definition:
              "The serialized package needed to reproduce inference, including preprocessing and model parameters."
          },
          {
            term: "calibration map",
            definition:
              "A learned or fitted transform that adjusts raw model scores to better match observed probabilities."
          },
          {
            term: "backward compatibility",
            definition:
              "The ability for existing clients to continue working correctly after a service or schema change."
          }
        ],
        checkYourself: [
          {
            prompt: "What must be logged to reproduce a prediction later?",
            reveal:
              "At minimum: request or feature references, model artifact version, contract version, preprocessing version, score, threshold/action, timestamp, and relevant feature data policy."
          }
        ],
        callout: {
          tone: "interview",
          body:
            "Say `the preprocessing pipeline is part of the model artifact` when discussing deployment."
        }
      },
      {
        id: "latency-and-throughput",
        heading: "Serving design balances latency, throughput, and feature freshness",
        paragraphs: [
          "Online inference has a latency budget. Time may be spent on authentication, request validation, feature lookup, preprocessing, model execution, postprocessing, logging, and network hops. The model itself may not be the slowest part. A feature store call or cross-region dependency can dominate user-visible latency.",
          "Batching improves throughput by processing multiple requests together, especially on GPUs, but it can increase tail latency if requests wait too long. Caching can reduce repeated feature or prediction work, but cached values may become stale. Asynchronous scoring can move inference out of the request path when immediate decisions are not required. The right serving mode depends on product tolerance for delay and staleness.",
          "Freshness requirements should be explicit. A recommendation model may need recent clicks; a credit preapproval model may use daily aggregates; a content safety model may require immediate text. Serving contracts should state maximum feature age and fallback behavior when freshness is violated. Returning a stale but fast prediction may be acceptable in one product and dangerous in another."
        ],
        keyTerms: [
          {
            term: "tail latency",
            definition:
              "High-percentile latency such as p95 or p99 that reflects slow user experiences."
          },
          {
            term: "batching",
            definition:
              "Combining multiple inference requests for more efficient execution."
          },
          {
            term: "staleness",
            definition:
              "The age or outdatedness of data used for inference relative to freshness requirements."
          }
        ],
        checkYourself: [
          {
            prompt: "Why can batching improve throughput but hurt p99 latency?",
            reveal:
              "Requests may wait to form a batch, and slow batch members or queueing can increase high-percentile latency even if average compute efficiency improves."
          }
        ],
        callout: {
          tone: "tip",
          body:
            "Break latency into feature retrieval, model compute, postprocessing, logging, and network time. That makes optimization concrete."
        }
      },
      {
        id: "fallbacks-and-errors",
        heading: "Fallbacks make failures explicit instead of accidental",
        paragraphs: [
          "Model serving fails in ordinary ways: missing features, invalid schemas, feature store timeouts, model server overload, dependency outages, and unsupported categories. A contract should define whether the service rejects the request, returns a default score, falls back to a previous model, uses a rules baseline, or routes to human review. Silent best-effort behavior is dangerous because clients may treat degraded predictions as normal.",
          "Fallbacks should be measured separately. If 20 percent of traffic uses a default score, aggregate model performance is misleading. Logs and responses can include a reason code such as `freshness_timeout` or `schema_invalid`. Client teams can then decide whether to block an action, degrade UI, or ask for more information.",
          "The safest fallback depends on risk. A music recommendation can use popularity when personalization fails. A fraud approval model may need conservative review. A medical triage assistant may need to refuse automation and escalate. Serving contracts should encode domain risk rather than assuming one generic fallback policy."
        ],
        keyTerms: [
          {
            term: "fallback",
            definition:
              "A defined behavior used when normal model inference cannot be completed reliably."
          },
          {
            term: "reason code",
            definition:
              "Structured metadata explaining why a prediction, rejection, or fallback occurred."
          },
          {
            term: "degraded mode",
            definition:
              "A reduced-capability operating state used during partial failures."
          }
        ],
        checkYourself: [
          {
            prompt: "Why log fallback rate separately from prediction count?",
            reveal:
              "Fallback traffic did not receive normal model behavior, so mixing it with model predictions hides reliability and quality problems."
          }
        ],
        callout: {
          tone: "warning",
          body:
            "A default score is a product decision. It should never appear because an exception handler needed something to return."
        }
      },
      {
        id: "observability-and-change",
        heading: "Serving observability protects contracts as systems evolve",
        paragraphs: [
          "A serving system should log enough to debug without violating privacy. Useful fields include request id, model version, contract version, feature freshness, validation failures, score, threshold, action, latency breakdown, fallback reason, and later outcome references. Sensitive raw features may need hashing, redaction, aggregation, or restricted access.",
          "Change management should include compatibility tests. Before deploying a new model or schema, replay recent requests through the candidate and compare feature vectors, scores, actions, latency, and error rates. Shadow and canary deployments reveal production behavior without exposing all users at once. Rollback should be practiced, not improvised during an incident.",
          "Serving contracts are living artifacts. New clients, features, model versions, and regulations will change requirements. The discipline is to make change explicit: version schemas, document semantics, deprecate carefully, monitor usage, and communicate migration plans. A model service earns trust by being predictable during change."
        ],
        keyTerms: [
          {
            term: "shadow test",
            definition:
              "Running a candidate service or model on real traffic without affecting decisions."
          },
          {
            term: "replay",
            definition:
              "Reprocessing logged historical requests through a candidate system for comparison."
          },
          {
            term: "deprecation",
            definition:
              "A managed process for retiring fields, versions, or behaviors after clients migrate."
          }
        ],
        checkYourself: [
          {
            prompt: "What should a canary compare besides model accuracy?",
            reveal:
              "It should compare latency, validation failures, fallback rate, feature freshness, score distributions, action rates, and slice behavior."
          }
        ],
        callout: {
          tone: "interview",
          body:
            "In production design, include observability fields in the contract. You cannot debug what you chose not to record."
        }
      }
    ],
    wrapUp: {
      takeaways: [
        "Serving contracts specify schemas, semantics, versions, latency, errors, fallbacks, and ownership.",
        "Preprocessing, vocabularies, thresholds, calibration, and metadata belong with the model artifact.",
        "Latency design must account for feature lookup, freshness, batching, caching, and tail behavior.",
        "Fallbacks should be explicit, risk-aware, logged, and evaluated separately.",
        "Replay, shadow, canary, rollback, and deprecation practices keep serving changes safe."
      ],
      nextSteps: [
        "Write a serving contract for a binary risk model with schema, freshness, and fallback rules.",
        "Design a latency budget that separates feature lookup from model compute.",
        "Plan a shadow test comparing old and new model score distributions."
      ]
    }
  }
};

/** @type {Record<string, import('../learnChapters.js').LessonLearnChapter>} */
export const mlProductionLabChapters = JSON.parse(JSON.stringify(chapters));
