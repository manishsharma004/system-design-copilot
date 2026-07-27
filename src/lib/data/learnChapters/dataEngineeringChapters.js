const chapters = {
  "data-engineering-for-ml/data-pipelines-at-scale": {
    title: "Chapter: Data pipelines at scale",
    readingTime: "65-80 min",
    premise:
      "Production ML depends on data systems that can move, validate, replay, and serve facts at the right time. This chapter builds a practical mental model for batch and streaming pipelines, distributed execution, late data, schema evolution, and feature stores.",
    parts: [
      {
        id: "pipeline-purpose",
        heading: "A data pipeline is part of the model, not plumbing",
        paragraphs: [
          "A model is trained on examples, but those examples are produced by a system of collectors, queues, storage tables, transforms, validations, and serving paths. When the system changes, the model's input distribution changes even if the model artifact does not. A reliable ML pipeline therefore has to be designed as part of the model boundary: it defines what facts exist, when they become visible, how they are corrected, and which version of those facts a training job or online prediction can use.",
          "The central design question is not whether to choose a fashionable framework. It is what freshness, correctness, scale, replay, and ownership requirements the product actually has. Fraud scoring may require minute-level features and point-in-time correctness. Weekly demand forecasting may tolerate overnight recompute but needs stable backfills across many years. A recommendation feed might use a streaming path for recent clicks and a batch path for slower profile aggregates. Each case changes the engineering burden.",
          "Good pipeline design starts with contracts. Define the event schema, partitioning strategy, data quality checks, expected latency, idempotency rule, and recovery plan before training depends on the output. If the model team cannot answer where a feature came from, which rows were excluded, or how a failed run is replayed, the training metric is not reproducible evidence. It is a temporary observation from a fragile data path."
        ],
        keyTerms: [
          {
            term: "data contract",
            definition:
              "An explicit agreement about schema, meaning, freshness, quality checks, and ownership for data consumed by downstream systems."
          },
          {
            term: "idempotency",
            definition:
              "The property that retrying the same write or transform does not duplicate or corrupt output."
          },
          {
            term: "replay",
            definition:
              "The ability to recompute downstream state from retained source data for recovery, backfills, audits, or new feature logic."
          }
        ],
        checkYourself: [
          {
            prompt: "Why should an ML engineer care about retry behavior and backfills?",
            reveal:
              "Retries and backfills can silently change training rows, feature values, and label alignment. If a pipeline cannot replay deterministically, model comparison becomes unreliable because two runs may train on different facts."
          }
        ],
        callout: {
          tone: "interview",
          body:
            "When asked to design an ML pipeline, state the prediction use case first, then derive freshness, correctness, replay, validation, and serving requirements from that use case."
        }
      },
      {
        id: "batch-vs-streaming",
        heading: "Batch and streaming are freshness and recovery choices",
        paragraphs: [
          "Batch processing groups data into bounded windows such as hourly partitions, daily snapshots, or month-end ledgers. It is attractive because it is easy to inspect, easy to rerun, and easy to align with warehouse storage. A failed daily transform can often be fixed by deleting one partition and recomputing it from source. For many ML workloads, especially training datasets and slow-changing aggregates, this simplicity is a feature rather than a compromise.",
          "Streaming treats the input as an unbounded sequence of events and continuously updates outputs. It is useful when prediction quality depends on recent behavior: a fraud model needs the last five minutes of payment attempts, a ranking model wants fresh engagement, and an anomaly detector reacts to current sensor readings. Streaming adds operational complexity because events may arrive out of order, messages may be retried, state must be checkpointed, and exactly-once behavior is usually an end-to-end design property rather than a switch in a framework.",
          "Most serious ML platforms are hybrid. Batch jobs create reproducible training sets, historical aggregates, and large offline joins. Streams update online features, counters, alerts, or incremental tables. The key is to prevent the two paths from defining the same feature differently. If training computes `purchases_7d` in SQL and serving computes it in a streaming job, the team needs shared definitions, common tests, and drift checks between offline and online values."
        ],
        keyTerms: [
          {
            term: "bounded data",
            definition:
              "A finite input collection such as a daily partition or static snapshot that can be processed to completion."
          },
          {
            term: "unbounded data",
            definition:
              "A continuously arriving event stream with no natural end, requiring windowing and state management."
          },
          {
            term: "hybrid architecture",
            definition:
              "A platform that uses batch processing for reproducible history and streaming for low-latency updates."
          }
        ],
        checkYourself: [
          {
            prompt: "When is batch the better answer even if streaming sounds more modern?",
            reveal:
              "Batch is often better when the product tolerates slower freshness, requires simple replay, needs large historical joins, or has a small team that cannot safely operate stateful streaming jobs."
          }
        ],
        callout: {
          tone: "tip",
          body:
            "Do not describe streaming as automatically superior. Describe the latency benefit and the extra burden: state, checkpoints, ordering, late events, and operational alerts."
        }
      },
      {
        id: "distributed-engines",
        heading: "Spark and Flink are execution models with different instincts",
        paragraphs: [
          "Spark popularized resilient distributed batch processing by representing work as transformations over partitioned data. Modern Spark SQL, DataFrames, and structured streaming hide many details, but the same fundamentals remain: partitions determine parallelism, shuffles move data across the network, joins can explode if keys are skewed, and caching only helps when reused data is actually expensive to recompute. For ML training data, Spark is often used to clean logs, build labels, join dimensions, and materialize offline feature tables.",
          "Flink is designed around stateful stream processing. It treats event time, watermarks, windows, checkpoints, and exactly-once sinks as first-class concerns. A Flink job can maintain keyed state such as per-user counters, update it as events arrive, and recover from failure using checkpoints. That makes it powerful for online feature computation, but it also means state size, checkpoint duration, backpressure, and savepoint compatibility become production design issues.",
          "The interview-level distinction is not `Spark equals batch, Flink equals streaming` in a simplistic way. Spark can stream and Flink can process bounded inputs. The deeper distinction is operational posture. Spark teams often reason in partitions, shuffles, and recompute. Flink teams often reason in event time, state, watermarks, and continuous recovery. Choosing between them depends on the workload's latency target, statefulness, team experience, and ecosystem fit."
        ],
        keyTerms: [
          {
            term: "shuffle",
            definition:
              "A distributed data movement step, commonly caused by joins, group-bys, and repartitioning, that can dominate runtime."
          },
          {
            term: "checkpoint",
            definition:
              "A durable snapshot of streaming operator state used to resume processing after failure."
          },
          {
            term: "backpressure",
            definition:
              "A condition where downstream processing cannot keep up with input, causing queues and lag to grow."
          }
        ],
        checkYourself: [
          {
            prompt: "What does a shuffle tell you about the cost profile of a pipeline?",
            reveal:
              "A shuffle means data must be redistributed across workers, usually involving network and disk. It is often the expensive step to inspect when a distributed job is slow or unstable."
          }
        ],
        callout: {
          tone: "interview",
          body:
            "Name the execution risks, not only the engine names: skewed keys, large shuffles, state growth, checkpoint failures, lag, and incompatible schema changes."
        }
      },
      {
        id: "late-data-and-schema-evolution",
        heading: "Late data and schema evolution decide whether history can be trusted",
        paragraphs: [
          "Real events do not arrive in perfect timestamp order. Mobile clients go offline, queues retry, source systems batch uploads, and partners send corrections after the original transaction. A pipeline has to distinguish processing time, which is when the system observes an event, from event time, which is when the event actually happened. ML features usually care about event time because the model should learn the world as it existed at prediction time, not the order in which logs happened to arrive.",
          "Watermarks give stream processors a policy for how long to wait for late events before closing a window. A strict watermark reduces latency but may miss delayed facts. A generous watermark improves completeness but increases state and delays output. Some domains also need correction streams or retraction logic because late events may change previously emitted aggregates. For training sets, the same issue appears as backfills: if yesterday's labels arrive today, the dataset version must say which cutoff and correction policy were used.",
          "Schema evolution is the other source of historical fragility. Adding an optional field is usually manageable, renaming a field can break consumers, and changing meaning without changing the name is the most dangerous case. A feature named `active_user` might change from a 7-day window to a 30-day window and make old models incomparable. Schema registries, compatibility checks, semantic versioning, and quarantine paths help, but the most important habit is treating schema changes as product changes that require communication and tests."
        ],
        keyTerms: [
          {
            term: "event time",
            definition:
              "The timestamp at which the business event occurred, independent of when the pipeline processed it."
          },
          {
            term: "watermark",
            definition:
              "A stream-processing estimate that data earlier than a given event-time point is mostly complete."
          },
          {
            term: "schema evolution",
            definition:
              "Controlled change to fields, types, compatibility, and semantics over time."
          }
        ],
        checkYourself: [
          {
            prompt: "Why is changing a feature's meaning worse than adding a new nullable field?",
            reveal:
              "Consumers may continue to run without errors while receiving values with different semantics. That can corrupt models and dashboards silently, whereas a new nullable field is usually easier to ignore or validate."
          }
        ],
        callout: {
          tone: "warning",
          body:
            "A pipeline that passes type checks can still be wrong if event-time cutoffs or feature semantics changed. Validate meaning, not only shape."
        }
      },
      {
        id: "feature-stores",
        heading: "Feature stores encode definitions, time, and serving paths",
        paragraphs: [
          "A feature store is not just a key-value database for model inputs. Its value is the controlled definition of features across offline training and online serving. A feature definition should specify the source data, transformation logic, entity keys, timestamp behavior, freshness expectation, owner, validation rules, and serving availability. Without those details, the store becomes a warehouse shortcut and train-serving skew returns under a different name.",
          "Offline stores materialize historical feature values for training and evaluation. Online stores serve low-latency values for inference. The hard requirement is point-in-time correctness: when building a training row for a prediction at time t, the pipeline should join only feature values that would have been available before t. Otherwise the model learns from the future. Feature stores often provide as-of joins, materialization jobs, and freshness monitors to make that discipline repeatable.",
          "A mature feature platform also handles lifecycle concerns. Features need discovery, documentation, permissions, backfills, deprecation, and monitoring. Highly reused features deserve strong contracts because a bad change can affect many models at once. Low-value one-off features may not deserve platform overhead. The practical rule is to put shared, production-critical, or online-used features behind the strongest governance, while keeping experimentation lightweight enough that teams still explore."
        ],
        keyTerms: [
          {
            term: "offline feature store",
            definition:
              "Historical feature storage optimized for training, evaluation, backfills, and point-in-time joins."
          },
          {
            term: "online feature store",
            definition:
              "Low-latency storage that serves current feature values to production inference systems."
          },
          {
            term: "point-in-time join",
            definition:
              "A join that uses only feature values available before the prediction timestamp for each training row."
          }
        ],
        checkYourself: [
          {
            prompt: "What makes a feature store useful beyond central storage?",
            reveal:
              "It standardizes definitions, ownership, validation, point-in-time training joins, online serving, freshness monitoring, and reuse. Storage alone does not prevent skew."
          }
        ],
        callout: {
          tone: "tip",
          body:
            "In system design answers, connect the feature store to both sides of ML: reproducible offline training sets and low-latency online inference."
        }
      }
    ],
    wrapUp: {
      takeaways: [
        "Pipeline requirements come from model freshness, correctness, replay, and serving needs.",
        "Batch favors inspection and recompute; streaming favors freshness but introduces state, ordering, and recovery complexity.",
        "Spark and Flink differ most in operational instincts: partitions and shuffles versus event time and stateful recovery.",
        "Late data, watermarks, and schema evolution determine whether historical features remain trustworthy.",
        "Feature stores are strongest when they encode definitions, point-in-time correctness, and offline-online consistency."
      ],
      nextSteps: [
        "Sketch a hybrid pipeline for a fraud model with both batch labels and streaming counters.",
        "Write a data contract for one feature, including freshness, owner, schema, and validation checks.",
        "Explain how you would backfill a corrected event field without corrupting model comparisons."
      ]
    }
  },
  "data-engineering-for-ml/dataset-management": {
    title: "Chapter: Dataset management and versioning",
    readingTime: "65-80 min",
    premise:
      "Datasets are production artifacts. This chapter explains how versioning, lineage, reproducible splits, privacy controls, and train-serving skew prevention turn raw data into evidence that models can be compared and shipped safely.",
    parts: [
      {
        id: "datasets-as-products",
        heading: "A dataset version is a claim about evidence",
        paragraphs: [
          "A training dataset is not merely a table loaded into a notebook. It is a claim that a specific population, time range, label definition, feature set, filtering policy, and split procedure were used to evaluate a model. If any of those ingredients change without a version, model metrics lose their meaning. Two AUC numbers are comparable only when the underlying evidence is comparable or the difference is intentionally documented.",
          "Dataset management gives teams a way to answer ordinary but important questions. Which raw snapshots produced this model? Which rows were excluded? Which label policy was used? What code built the features? Was PII removed before export? Can we recreate the exact train, validation, and test sets six months later? These questions appear during incidents, audits, model refreshes, and handoffs between teams.",
          "The discipline can be lightweight or heavy depending on risk. A research prototype may need a manifest file with input paths, row counts, hashes, and split seeds. A regulated credit model may need immutable dataset artifacts, approval workflow, lineage graphs, retention policies, and access logs. The principle is the same in both cases: preserve enough context that a future engineer can reproduce the evidence rather than reverse-engineer it."
        ],
        keyTerms: [
          {
            term: "dataset manifest",
            definition:
              "A record of source inputs, transformations, filters, row counts, checksums, split rules, and metadata for a dataset version."
          },
          {
            term: "immutable artifact",
            definition:
              "A stored object that is not edited in place; new data creates a new version instead."
          },
          {
            term: "evidence trail",
            definition:
              "The chain of data, code, parameters, and approvals that supports a model result or release."
          }
        ],
        checkYourself: [
          {
            prompt: "Why is a split seed alone not enough for reproducibility?",
            reveal:
              "The seed recreates a split only if the input rows, ordering, filters, label policy, and code are the same. Dataset reproducibility needs the full manifest, not only randomness."
          }
        ],
        callout: {
          tone: "interview",
          body:
            "Define a dataset version by inputs, code, parameters, time cutoffs, split policy, quality checks, and privacy state. That answer is stronger than saying `we store it in S3`."
        }
      },
      {
        id: "versioning-and-lineage",
        heading: "Versioning and lineage make model comparisons honest",
        paragraphs: [
          "Dataset versioning can be implemented with lakehouse table snapshots, content-addressed files, DVC-style manifests, warehouse clone points, or a custom registry. The tool matters less than the invariant: a version should identify the exact records and transformations used. If a partition is overwritten in place, an old model run may become impossible to explain. If source data is append-only but transformation code changes, the same raw inputs can still produce a different dataset and need a new derived version.",
          "Lineage connects versions across the data graph. Raw events feed cleaned tables, cleaned tables feed feature tables, feature tables feed training sets, and training sets feed models. When an upstream bug is discovered, lineage answers which datasets and models are affected. Without lineage, teams either overreact by retraining everything or underreact by missing a dependent model. Both outcomes are expensive.",
          "Lineage should include code and configuration, not only table names. A join condition, null imputation policy, deduplication rule, or label horizon can change model behavior while the table path stays the same. Practical manifests record git commit, job image, parameter values, source snapshot ids, row counts by split, and validation results. The goal is not bureaucratic decoration; it is fast, confident reasoning when something goes wrong."
        ],
        keyTerms: [
          {
            term: "lineage",
            definition:
              "A record of upstream data, code, transformations, and artifacts that produced a downstream dataset or model."
          },
          {
            term: "snapshot",
            definition:
              "A consistent view of a table or file collection at a particular version or time."
          },
          {
            term: "derived dataset",
            definition:
              "A dataset produced by transforming, filtering, joining, or labeling source data."
          }
        ],
        checkYourself: [
          {
            prompt: "What should lineage tell you after discovering a bad source column?",
            reveal:
              "It should identify derived datasets, features, training runs, models, dashboards, and serving paths that consumed the bad column so remediation is scoped accurately."
          }
        ],
        callout: {
          tone: "tip",
          body:
            "For interviews, describe lineage as incident response infrastructure. It reduces guesswork when upstream data quality defects are found."
        }
      },
      {
        id: "train-serving-skew",
        heading: "Train-serving skew is a dataset management failure",
        paragraphs: [
          "Train-serving skew happens when the model sees one feature distribution or meaning during training and a different one during inference. Sometimes the cause is obvious, such as serving missing a column. More often it is subtle: training uses a warehouse join that includes late-arriving corrections, while serving uses a cache updated every ten minutes; training normalizes with a global mean, while serving recomputes from a small request batch; training encodes categories with a vocabulary that production did not deploy.",
          "Dataset management reduces skew by tying training data to serving contracts. The same feature definitions, transformations, category maps, timestamp cutoffs, and default values should be versioned with the model. For online features, training sets should be built from historical feature values using point-in-time joins, not from a convenient full-history aggregation. For request features, the schema should specify types, units, nullable behavior, and valid ranges.",
          "Monitoring closes the loop because some skew appears only after deployment. Compare online feature distributions with the training dataset version, track missing and default rates, and sample logged inference rows for offline recomputation. If offline recomputation of the same request produces a different feature vector, the problem is not model drift; it is a broken contract between dataset construction and serving."
        ],
        keyTerms: [
          {
            term: "train-serving skew",
            definition:
              "A mismatch between feature values, definitions, distributions, or transformations used during training and those used during inference."
          },
          {
            term: "feature contract",
            definition:
              "A specification for feature name, type, units, freshness, source, transformation, defaults, and owner."
          },
          {
            term: "offline recomputation",
            definition:
              "Rebuilding production feature vectors from logged inputs to check consistency with serving behavior."
          }
        ],
        checkYourself: [
          {
            prompt: "How can a feature be correct in both training and serving code but still skewed?",
            reveal:
              "The two paths may use different data cutoffs, freshness, vocabularies, imputation defaults, or source systems. Code correctness does not guarantee semantic equivalence."
          }
        ],
        callout: {
          tone: "warning",
          body:
            "If production recomputes transformations from live request batches, it is probably changing the coordinate system the model learned during training."
        }
      },
      {
        id: "pii-and-governance",
        heading: "PII handling is part of the dataset lifecycle",
        paragraphs: [
          "ML datasets often contain direct identifiers, quasi-identifiers, behavioral traces, free-text fields, or labels that reveal sensitive facts. Dataset management must therefore track what personal data exists, why it is needed, who can access it, how long it is retained, and how it is removed. Privacy cannot be patched after a model is trained if the artifact or embeddings have already absorbed sensitive content.",
          "Practical controls include classification, minimization, access grants, encryption, redaction, tokenization, aggregation, and audit logs. Free text deserves special care because names, emails, addresses, medical details, and secrets can appear in fields that look harmless. For LLM and embedding workflows, teams also need to decide whether source documents can be used for training, retrieval, evaluation, or logging. Those are different uses and may require different consent or retention rules.",
          "Privacy controls should be recorded in the dataset version. A manifest might state that email addresses were hashed with a keyed function, raw text was redacted before embedding, rows from opted-out users were excluded, and the artifact expires after a set retention period. During audits or deletion requests, that metadata matters as much as the model metric. The dataset is not only a technical artifact; it is a governed record of allowed use."
        ],
        keyTerms: [
          {
            term: "PII",
            definition:
              "Personally identifiable information that can identify, contact, locate, or distinguish a person directly or indirectly."
          },
          {
            term: "data minimization",
            definition:
              "Collecting and retaining only the personal data needed for a specific, justified purpose."
          },
          {
            term: "retention policy",
            definition:
              "A rule defining how long data or derived artifacts are kept and when they must be deleted or reprocessed."
          }
        ],
        checkYourself: [
          {
            prompt: "Why should privacy state be versioned with a dataset?",
            reveal:
              "A future user must know whether an artifact includes sensitive data, opted-out users, redacted text, or restricted fields. Privacy state affects access, retention, reuse, and legal obligations."
          }
        ],
        callout: {
          tone: "warning",
          body:
            "Embedding text does not automatically make sensitive data safe. Treat embeddings and model artifacts as derived data that may inherit governance requirements."
        }
      },
      {
        id: "reproducible-splits",
        heading: "Reproducible splits protect evaluation from accidental optimism",
        paragraphs: [
          "A split is a scientific design decision. Random row splits are easy, but they can leak user history, time trends, session context, or near-duplicate examples across train and test. If production predicts future behavior, a time-based split is often more honest. If production sees new users, a group split by user is more honest. If labels are rare, stratification may be needed, but it should not override the main generalization boundary.",
          "Reproducibility means storing the split assignment, not merely the method. Hash-based splits over stable entity ids are useful because new rows can be assigned consistently. Time cutoffs should be explicit and timezone-safe. For cross-validation, each fold must fit preprocessing only on its training portion. Hyperparameter tuning should not repeatedly peek at the final test set. These rules sound basic until a deadline pushes someone to reuse the test data as a scoreboard.",
          "Evaluation datasets also age. A frozen test set is good for comparing model versions, but it may stop representing current traffic. Mature teams keep a stable benchmark for regression detection and add rolling or recent holdouts for distribution shift. The answer is not one perfect split; it is a documented evaluation portfolio where each split has a purpose and known limitations."
        ],
        keyTerms: [
          {
            term: "group split",
            definition:
              "A split that keeps all examples from the same entity, user, session, or group in one evaluation partition."
          },
          {
            term: "time-based split",
            definition:
              "A split that trains on earlier data and evaluates on later data to mimic future prediction."
          },
          {
            term: "holdout set",
            definition:
              "A reserved dataset used for unbiased evaluation after model selection or tuning."
          }
        ],
        checkYourself: [
          {
            prompt: "Why might a random split be misleading for churn prediction?",
            reveal:
              "Rows from the same customer or future events may appear in both train and test. The model can learn customer-specific history or time patterns that would not generalize to honest future scoring."
          }
        ],
        callout: {
          tone: "interview",
          body:
            "State the production generalization question before choosing a split: new time, new user, new geography, new product, or new distribution."
        }
      }
    ],
    wrapUp: {
      takeaways: [
        "Dataset versions make model metrics reproducible and comparable.",
        "Lineage connects source data, code, transforms, derived datasets, and models for audits and incidents.",
        "Train-serving skew is often caused by mismatched feature definitions, cutoffs, transformations, or vocabularies.",
        "PII controls belong in the dataset lifecycle and must be recorded with artifacts.",
        "Reproducible splits should match the production generalization boundary, not just a random seed."
      ],
      nextSteps: [
        "Draft a dataset manifest for a churn model, including split policy and PII controls.",
        "Explain how you would detect train-serving skew using logged inference rows.",
        "Compare random, group, and time-based splits for a product recommendation dataset."
      ]
    }
  }
};

/** @type {Record<string, import('../learnChapters.js').LessonLearnChapter>} */
export const dataEngineeringChapters = JSON.parse(JSON.stringify(chapters));
