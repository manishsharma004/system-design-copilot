/** @type {Record<string, import('../learnChapters.js').LessonLearnChapter>} */
export const dataEngineeringChapters = {
  "data-engineering-for-ml/data-pipelines-at-scale": {
    "title": "Chapter: Data pipelines at scale",
    "readingTime": "55-70 min",
    "premise": "Batch and stream processing, ETL design patterns, and data quality validation for ML training data. This Learn chapter expands the short lesson summary into a full study unit you can read continuously, with interactive checks and selection-based AI search when a phrase needs a second opinion.",
    "parts": [
      {
        "id": "orientation",
        "heading": "Why this chapter exists",
        "paragraphs": [
          "ML quality is bounded by data reliability. Scalable pipelines, validation, and late-data handling are core AI engineering—not someone else's problem.",
          "This chapter treats \"Data pipelines at scale\" as a readable study unit: intuition first, then the mechanics you must be able to explain, then the failure modes that show up in interviews and production, and finally how to talk about the topic under time pressure.",
          "Read it like a book chapter. When a phrase is unclear, select it inside the Learn reader and use Search with AI to open Google, Perplexity, or DuckDuckGo without abandoning the chapter."
        ],
        "callout": {
          "tone": "tip",
          "body": "Target reading time is paced for depth, not skimming. Pause at each Check yourself prompt and answer out loud before revealing the guide answer."
        }
      },
      {
        "id": "batch-and-stream-paths-for-ml-data",
        "heading": "Batch and stream paths for ML data",
        "paragraphs": [
          "Batch pipelines process partitions (hours/days) with predictable recompute. Streams process events with low lag and harder exactly-once semantics. Many ML platforms are hybrid: stream into a feature store for online features, batch for training sets. Choose based on freshness needs and operational maturity. Idempotent writes and partition planning matter more than framework brand names. Data quality SLAs are part of model SLOs whether or not they appear on the same dashboard. Data quality SLAs are part of model SLOs whether or not they appear on the same dashboard. Data quality SLAs are part of model SLOs whether or not they appear on the same dashboard.",
          "Hold these points explicitly while you study. Restate each one without looking at the list — recognition is not the interview bar; recall is.",
          "• Pick batch vs stream from freshness/ops constraints.",
          "• Design idempotent sinks.",
          "• Hybrid architectures are common and OK.",
          "Production lens — Batch vs streaming is a freshness and complexity trade-off: Lambda and kappa architectures addressed hybrid needs; modern stacks often use incremental batch (Iceberg/Delta) plus streaming for latency-sensitive features. Exactly-once semantics, late-arriving data, and backfills complicate feature correctness. Idempotent writes and partition strategies (time, tenant) prevent full reprocessing on every job failure."
        ],
        "keyTerms": [
          {
            "term": "Pick batch vs stream from freshness/ops",
            "definition": "Pick batch vs stream from freshness/ops constraints."
          },
          {
            "term": "Design idempotent sinks.",
            "definition": "Design idempotent sinks."
          },
          {
            "term": "Hybrid architectures are common and OK.",
            "definition": "Hybrid architectures are common and OK."
          }
        ],
        "checkYourself": [
          {
            "prompt": "Chooses batch/stream/hybrid thoughtfully.",
            "reveal": "Lambda and kappa architectures addressed hybrid needs; modern stacks often use incremental batch (Iceberg/Delta) plus streaming for latency-sensitive features. Exactly-once semantics, late-arriving data, and backfills complicate feature correctness. Idempotent writes and partition strategies (time, tenant) prevent full reprocessing on every job failure."
          }
        ]
      },
      {
        "id": "validation-beats-optimistic-schemas",
        "heading": "Validation beats optimistic schemas",
        "paragraphs": [
          "At scale, assume poison rows arrive. Validate types, ranges, null rates, referential integrity, and distribution drift before training. Fail or quarantine bad partitions. Great Expectations-style checks or custom asserts both work if enforced. Silent schema evolution (\"extra column, missing column\") is a top cause of training incidents. Quarantine beats best-effort parsing when the cost of poisoning training is high. Quarantine beats best-effort parsing when the cost of poisoning training is high.",
          "Hold these points explicitly while you study. Restate each one without looking at the list — recognition is not the interview bar; recall is.",
          "• Validate before expensive training compute.",
          "• Quarantine bad partitions instead of poisoning lakes.",
          "• Alert on schema changes explicitly.",
          "Production lens — Data quality gates belong in the pipeline: Schema evolution, null checks, distribution monitors, and anomaly alerts should block downstream training when violated. Great Expectations, dbt tests, and custom validators encode SLAs. ML-specific concerns include label leakage across time boundaries and train-serve skew from different SQL paths computing \"the same\" feature."
        ],
        "keyTerms": [
          {
            "term": "Validate before expensive training compute.",
            "definition": "Validate before expensive training compute."
          },
          {
            "term": "Quarantine bad partitions instead of poisoning",
            "definition": "Quarantine bad partitions instead of poisoning lakes."
          },
          {
            "term": "Alert on schema changes explicitly.",
            "definition": "Alert on schema changes explicitly."
          }
        ],
        "workedExample": {
          "title": "Partition validation checks",
          "body": "Narrate what each shape and step is doing. If you only recognize the API call, you do not own the idea yet — rewrite the example from memory after one pass.",
          "code": "import pandas as pd\n\ndef validate_partition(df):\n    errors = []\n    if df[\"user_id\"].isna().any():\n        errors.append(\"null user_id\")\n    if (df[\"amount\"] < 0).any():\n        errors.append(\"negative amount\")\n    if df[\"amount\"].mean() > 10000:\n        errors.append(\"amount mean spike\")\n    return errors\n\ndf = pd.DataFrame({\"user_id\":[1,2,None], \"amount\":[10,-1,5]})\nprint(validate_partition(df))",
          "language": "python"
        },
        "checkYourself": [
          {
            "prompt": "Implements validation gates on partitions.",
            "reveal": "Schema evolution, null checks, distribution monitors, and anomaly alerts should block downstream training when violated. Great Expectations, dbt tests, and custom validators encode SLAs. ML-specific concerns include label leakage across time boundaries and train-serve skew from different SQL paths computing \"the same\" feature."
          }
        ]
      },
      {
        "id": "late-data-recomputes-and-time-travel",
        "heading": "Late data, recomputes, and time travel",
        "paragraphs": [
          "Events arrive late. Training sets need watermarks and recomputation policies. Feature point-in-time joins must define how late updates revise history. Document whether your pipeline is append-only or mutable. Backfills should be routine, not heroic. Cost out recompute windows before promising daily full refreshes of enormous corpora. Bytes scanned and shuffle volume predict cloud bills better than row counts. Bytes scanned and shuffle volume predict cloud bills better than row counts.",
          "Hold these points explicitly while you study. Restate each one without looking at the list — recognition is not the interview bar; recall is.",
          "• Define watermarks and late-data policies.",
          "• Make backfills a scheduled capability.",
          "• Clarify mutability of historical features.",
          "Production lens — Batch vs streaming is a freshness and complexity trade-off: Lambda and kappa architectures addressed hybrid needs; modern stacks often use incremental batch (Iceberg/Delta) plus streaming for latency-sensitive features. Exactly-once semantics, late-arriving data, and backfills complicate feature correctness. Idempotent writes and partition strategies (time, tenant) prevent full reprocessing on every job failure."
        ],
        "keyTerms": [
          {
            "term": "Define watermarks and late-data policies.",
            "definition": "Define watermarks and late-data policies."
          },
          {
            "term": "Make backfills a scheduled capability.",
            "definition": "Make backfills a scheduled capability."
          },
          {
            "term": "Clarify mutability of historical features.",
            "definition": "Clarify mutability of historical features."
          }
        ],
        "checkYourself": [
          {
            "prompt": "Plans late data and backfills.",
            "reveal": "Explain the idea in two sentences, name one metric or invariant you would watch, and state one mistake juniors make. Then connect it back to late data, recomputes, and time travel."
          }
        ]
      },
      {
        "id": "efficient-transforms-and-storage-layout",
        "heading": "Efficient transforms and storage layout",
        "paragraphs": [
          "Columnar formats, partition pruning, and predicate pushdown dominate performance. Avoid wide Python row loops on huge frames when vectorized or SQL engines suffice. For teaching we use pandas/NumPy, but the principles transfer to Spark/BigQuery: minimize shuffles, narrow columns early, and measure bytes scanned. Compact small files. Readiness flags prevent the classic 'train on half a day of data' silent failure. Readiness flags prevent the classic 'train on half a day of data' silent failure.",
          "Hold these points explicitly while you study. Restate each one without looking at the list — recognition is not the interview bar; recall is.",
          "• Prune columns/partitions early.",
          "• Watch shuffle and small-file problems.",
          "• Measure bytes scanned as a first-class cost.",
          "Production lens — Data quality gates belong in the pipeline: Schema evolution, null checks, distribution monitors, and anomaly alerts should block downstream training when violated. Great Expectations, dbt tests, and custom validators encode SLAs. ML-specific concerns include label leakage across time boundaries and train-serve skew from different SQL paths computing \"the same\" feature."
        ],
        "keyTerms": [
          {
            "term": "Prune columns/partitions early.",
            "definition": "Prune columns/partitions early."
          },
          {
            "term": "Watch shuffle and small-file problems.",
            "definition": "Watch shuffle and small-file problems."
          },
          {
            "term": "Measure bytes scanned as a first-class",
            "definition": "Measure bytes scanned as a first-class cost."
          }
        ],
        "workedExample": {
          "title": "Filter early pattern",
          "body": "Narrate what each shape and step is doing. If you only recognize the API call, you do not own the idea yet — rewrite the example from memory after one pass.",
          "code": "import pandas as pd\n\ndf = pd.DataFrame({\n    \"date\": [\"2026-07-01\"]*3 + [\"2026-07-02\"]*3,\n    \"country\": [\"US\",\"US\",\"FR\",\"US\",\"FR\",\"FR\"],\n    \"x\": range(6),\n})\n# prune partition then columns\npart = df[df.date == \"2026-07-02\"][[\"country\", \"x\"]]\nprint(part[part.country == \"FR\"])",
          "language": "python"
        },
        "checkYourself": [
          {
            "prompt": "Uses storage layout efficiently.",
            "reveal": "Explain the idea in two sentences, name one metric or invariant you would watch, and state one mistake juniors make. Then connect it back to efficient transforms and storage layout."
          }
        ]
      },
      {
        "id": "orchestration-and-data-slas-for-ml",
        "heading": "Orchestration and data SLAs for ML",
        "paragraphs": [
          "Training jobs depend on data SLAs. Publish freshness indicators (\"features for date D ready\"). Downstream model jobs should wait on sensors/flags, not wall-clock guesses. When SLAs break, degrade gracefully (reuse yesterday's model). Cross-team contracts on schemas and freshness prevent finger-pointing. Schema contracts across teams need owners and compatibility tests. Schema contracts across teams need owners and compatibility tests.",
          "Hold these points explicitly while you study. Restate each one without looking at the list — recognition is not the interview bar; recall is.",
          "• Expose data readiness signals to training DAGs.",
          "• Degrade gracefully on missed SLAs.",
          "• Contract on schemas across teams.",
          "Production lens — Batch vs streaming is a freshness and complexity trade-off: Lambda and kappa architectures addressed hybrid needs; modern stacks often use incremental batch (Iceberg/Delta) plus streaming for latency-sensitive features. Exactly-once semantics, late-arriving data, and backfills complicate feature correctness. Idempotent writes and partition strategies (time, tenant) prevent full reprocessing on every job failure."
        ],
        "keyTerms": [
          {
            "term": "Expose data readiness signals to training",
            "definition": "Expose data readiness signals to training DAGs."
          },
          {
            "term": "Degrade gracefully on missed SLAs.",
            "definition": "Degrade gracefully on missed SLAs."
          },
          {
            "term": "Contract on schemas across teams.",
            "definition": "Contract on schemas across teams."
          }
        ],
        "checkYourself": [
          {
            "prompt": "Connects data SLAs to training triggers.",
            "reveal": "Explain the idea in two sentences, name one metric or invariant you would watch, and state one mistake juniors make. Then connect it back to orchestration and data slas for ml."
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
          "Most interview answers fail not because the definition is wrong, but because the candidate never names how the approach breaks. Use this section as a trap checklist for data pipelines at scale.",
          "Trap: Training on unvalidated partitions. A strong answer preempts it — say what you would monitor, what fallback you would keep, or what simpler baseline you would try first.",
          "Trap: No late-data policy. A strong answer preempts it — say what you would monitor, what fallback you would keep, or what simpler baseline you would try first.",
          "Trap: Wide unschematized JSON lakes as features. A strong answer preempts it — say what you would monitor, what fallback you would keep, or what simpler baseline you would try first.",
          "Trap: Wall-clock scheduling without readiness sensors. A strong answer preempts it — say what you would monitor, what fallback you would keep, or what simpler baseline you would try first."
        ],
        "callout": {
          "tone": "warning",
          "body": "If you cannot name a failure mode, you do not yet understand the technique well enough to ship or defend it."
        },
        "checkYourself": [
          {
            "prompt": "Pick the most dangerous pitfall for Data pipelines at scale and explain how you would detect it in production or on a whiteboard.",
            "reveal": "Start with: \"Training on unvalidated partitions.\" Then add a detection signal (metric, test, or review question) and a mitigation."
          }
        ]
      },
      {
        "id": "deeper-lens",
        "heading": "A deeper production lens",
        "paragraphs": [
          "Batch vs streaming is a freshness and complexity trade-off. Lambda and kappa architectures addressed hybrid needs; modern stacks often use incremental batch (Iceberg/Delta) plus streaming for latency-sensitive features. Exactly-once semantics, late-arriving data, and backfills complicate feature correctness. Idempotent writes and partition strategies (time, tenant) prevent full reprocessing on every job failure.",
          "Data quality gates belong in the pipeline. Schema evolution, null checks, distribution monitors, and anomaly alerts should block downstream training when violated. Great Expectations, dbt tests, and custom validators encode SLAs. ML-specific concerns include label leakage across time boundaries and train-serve skew from different SQL paths computing \"the same\" feature."
        ],
        "keyTerms": [
          {
            "term": "Batch vs streaming is a freshness and complexity trade-off",
            "definition": "Lambda and kappa architectures addressed hybrid needs; modern stacks often use incremental batch (Iceberg/Delta) plus streaming for latency-sensitive features. Exactly-once semantics, late-arriving data, and backfills co…"
          },
          {
            "term": "Data quality gates belong in the pipeline",
            "definition": "Schema evolution, null checks, distribution monitors, and anomaly alerts should block downstream training when violated. Great Expectations, dbt tests, and custom validators encode SLAs. ML-specific concerns include labe…"
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
          "You should now be able to teach data pipelines at scale as a story: what problem it solves, how the mechanism works, which assumptions it depends on, and how you would know it failed.",
          "Close the loop by writing a 90-second spoken answer out loud. If you freeze on definitions, return to the orientation and the first technical part. If you freeze on trade-offs, return to failure modes.",
          "Practice prompts from this lesson: Design a feature pipeline with daily batch + online stream. | How do you handle late-arriving events in training data? | What validation checks gate a training partition?"
        ],
        "checkYourself": [
          {
            "prompt": "Give a 90-second spoken overview of Data pipelines at scale as if starting an interview answer.",
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
        "Chooses batch/stream/hybrid thoughtfully.",
        "Implements validation gates on partitions.",
        "Plans late data and backfills.",
        "Uses storage layout efficiently.",
        "Connects data SLAs to training triggers."
      ],
      "nextSteps": [
        "Return to the lesson page and attempt the practice / topic lab with this chapter still open if needed.",
        "Revisit any Check yourself prompts you could not answer out loud.",
        "Optional deeper reading: Apache Spark Documentation (Apache) — https://spark.apache.org/docs/latest/",
        "Optional deeper reading: The Dataflow Model (Google Research) — https://research.google/pubs/pub43864/"
      ]
    }
  },
  "data-engineering-for-ml/dataset-management": {
    "title": "Chapter: Dataset management and versioning",
    "readingTime": "55-70 min",
    "premise": "Data versioning, lineage tracking, labeling pipelines, and dataset governance for reproducible ML. This Learn chapter expands the short lesson summary into a full study unit you can read continuously, with interactive checks and selection-based AI search when a phrase needs a second opinion.",
    "parts": [
      {
        "id": "orientation",
        "heading": "Why this chapter exists",
        "paragraphs": [
          "Datasets are living products: versioned, lineage-tracked, quality-measured, and privacy-constrained. Model reproducibility collapses without dataset management discipline.",
          "This chapter treats \"Dataset management and versioning\" as a readable study unit: intuition first, then the mechanics you must be able to explain, then the failure modes that show up in interviews and production, and finally how to talk about the topic under time pressure.",
          "Read it like a book chapter. When a phrase is unclear, select it inside the Learn reader and use Search with AI to open Google, Perplexity, or DuckDuckGo without abandoning the chapter."
        ],
        "callout": {
          "tone": "tip",
          "body": "Target reading time is paced for depth, not skimming. Pause at each Check yourself prompt and answer out loud before revealing the guide answer."
        }
      },
      {
        "id": "versioning-datasets-like-code",
        "heading": "Versioning datasets like code",
        "paragraphs": [
          "A dataset version should be immutable and addressable (content hash or snapshot ID). Training configs pin dataset versions alongside code SHAs and hyperparameters. Store diffs or snapshots efficiently, but never silently mutate \"latest\" under a model that claimed reproducibility. Record transforms that produced a version from raw sources. Immutable versions make 'what changed?' a diff problem instead of an archaeology dig. Immutable versions make 'what changed?' a diff problem instead of an archaeology dig.",
          "Hold these points explicitly while you study. Restate each one without looking at the list — recognition is not the interview bar; recall is.",
          "• Pin immutable dataset IDs in training configs.",
          "• Record transform lineage from raw to train set.",
          "• Forbid silent mutation of published versions.",
          "Production lens — Dataset versioning is as critical as model versioning: DVC, LakeFS, and Hugging Face datasets provide reproducible snapshots with hashes and metadata. Splits must be stable and documented—reshuffling leaks test information. For multimodal and LLM corpora, deduplication (MinHash, exact hash) and PII scrubbing pipelines prevent memorization and compliance violations."
        ],
        "keyTerms": [
          {
            "term": "Pin immutable dataset IDs in training",
            "definition": "Pin immutable dataset IDs in training configs."
          },
          {
            "term": "Record transform lineage from raw to",
            "definition": "Record transform lineage from raw to train set."
          },
          {
            "term": "Forbid silent mutation of published versions.",
            "definition": "Forbid silent mutation of published versions."
          }
        ],
        "workedExample": {
          "title": "Content-hash a CSV snapshot",
          "body": "Narrate what each shape and step is doing. If you only recognize the API call, you do not own the idea yet — rewrite the example from memory after one pass.",
          "code": "import hashlib\nimport pandas as pd\n\ndef dataset_id(df):\n    payload = df.sort_index(axis=1).to_csv(index=False).encode()\n    return hashlib.sha256(payload).hexdigest()[:12]\n\na = pd.DataFrame({\"x\":[1,2], \"y\":[0,1]})\nb = pd.DataFrame({\"y\":[0,1], \"x\":[1,2]})\nprint(dataset_id(a), dataset_id(b), dataset_id(a) == dataset_id(b))",
          "language": "python"
        },
        "checkYourself": [
          {
            "prompt": "Pins immutable dataset versions in training.",
            "reveal": "DVC, LakeFS, and Hugging Face datasets provide reproducible snapshots with hashes and metadata. Splits must be stable and documented—reshuffling leaks test information. For multimodal and LLM corpora, deduplication (MinHash, exact hash) and PII scrubbing pipelines prevent memorization and compliance violations."
          }
        ]
      },
      {
        "id": "labeling-quality-and-agreement",
        "heading": "Labeling quality and agreement",
        "paragraphs": [
          "Labels are noisy. Measure inter-annotator agreement (Cohen's kappa, etc.), use gold questions, and route hard items to experts. Weak supervision and active learning can reduce cost but need evaluation against gold sets. For LLMs, preference labels and rubric scores have their own biases—document rater guidelines. Dataset management includes the human process, not only files in object storage. Labeling guidelines drift; version them next to the labels they produced. Labeling guidelines drift; version them next to the labels they produced.",
          "Hold these points explicitly while you study. Restate each one without looking at the list — recognition is not the interview bar; recall is.",
          "• Quantify annotator agreement continuously.",
          "• Hold out gold labels for quality control.",
          "• Document labeling guidelines as versioned artifacts.",
          "Production lens — Labeling workflows define the ceiling on model quality: Inter-annotator agreement, adjudication, active learning, and gold-standard hidden sets quantify label noise. Biased or rushed annotation propagates directly to production errors. Invest in tooling (Label Studio, Prodigy), clear guidelines, and stratified sampling so rare classes and edge cases receive adequate coverage."
        ],
        "keyTerms": [
          {
            "term": "Quantify annotator agreement continuously.",
            "definition": "Quantify annotator agreement continuously."
          },
          {
            "term": "Hold out gold labels for quality",
            "definition": "Hold out gold labels for quality control."
          },
          {
            "term": "Document labeling guidelines as versioned art…",
            "definition": "Document labeling guidelines as versioned artifacts."
          }
        ],
        "checkYourself": [
          {
            "prompt": "Measures labeling agreement and gold QC.",
            "reveal": "Inter-annotator agreement, adjudication, active learning, and gold-standard hidden sets quantify label noise. Biased or rushed annotation propagates directly to production errors. Invest in tooling (Label Studio, Prodigy), clear guidelines, and stratified sampling so rare classes and edge cases receive adequate coverage."
          }
        ]
      },
      {
        "id": "lineage-provenance-and-reproducibility",
        "heading": "Lineage, provenance, and reproducibility",
        "paragraphs": [
          "Provenance answers: which raw dumps, which cleaning script, which label version produced this train set? When a bug is found in a parser, you must find affected models. Propagate dataset IDs into model registries and prediction logs when feasible. Reproducibility is a graph problem across data and code. Derived artifacts inherit sensitivity—embeddings and caches are not automatically anonymous. Derived artifacts inherit sensitivity—embeddings and caches are not automatically anonymous.",
          "Hold these points explicitly while you study. Restate each one without looking at the list — recognition is not the interview bar; recall is.",
          "• Propagate dataset IDs into model metadata.",
          "• Make impacted-model queries answerable after data bugs.",
          "• Store configs that fully specify rebuilds.",
          "Production lens — Dataset versioning is as critical as model versioning: DVC, LakeFS, and Hugging Face datasets provide reproducible snapshots with hashes and metadata. Splits must be stable and documented—reshuffling leaks test information. For multimodal and LLM corpora, deduplication (MinHash, exact hash) and PII scrubbing pipelines prevent memorization and compliance violations."
        ],
        "keyTerms": [
          {
            "term": "Propagate dataset IDs into model metadata.",
            "definition": "Propagate dataset IDs into model metadata."
          },
          {
            "term": "Make impacted-model queries answerable after …",
            "definition": "Make impacted-model queries answerable after data bugs."
          },
          {
            "term": "Store configs that fully specify rebuilds.",
            "definition": "Store configs that fully specify rebuilds."
          }
        ],
        "checkYourself": [
          {
            "prompt": "Tracks lineage to raw sources.",
            "reveal": "Explain the idea in two sentences, name one metric or invariant you would watch, and state one mistake juniors make. Then connect it back to lineage, provenance, and reproducibility."
          }
        ]
      },
      {
        "id": "privacy-pii-and-retention-in-datasets",
        "heading": "Privacy, PII, and retention in datasets",
        "paragraphs": [
          "Minimize PII in training sets; mask or hash when possible. Access-control datasets by sensitivity. Retention policies must cover derived artifacts (embeddings, caches). Deletion requests may require rebuilding versions. Differential privacy is a stronger guarantee for some releases—but not a default checkbox. Involve privacy review when user content enters training. Dataset SLOs need humans on call, or models will absorb silent decay. Dataset SLOs need humans on call, or models will absorb silent decay.",
          "Hold these points explicitly while you study. Restate each one without looking at the list — recognition is not the interview bar; recall is.",
          "• Treat derived embeddings as potentially sensitive.",
          "• ACL sensitive datasets.",
          "• Plan deletion/rebuild mechanics.",
          "Production lens — Labeling workflows define the ceiling on model quality: Inter-annotator agreement, adjudication, active learning, and gold-standard hidden sets quantify label noise. Biased or rushed annotation propagates directly to production errors. Invest in tooling (Label Studio, Prodigy), clear guidelines, and stratified sampling so rare classes and edge cases receive adequate coverage."
        ],
        "keyTerms": [
          {
            "term": "Treat derived embeddings as potentially sensi…",
            "definition": "Treat derived embeddings as potentially sensitive."
          },
          {
            "term": "ACL sensitive datasets.",
            "definition": "ACL sensitive datasets."
          },
          {
            "term": "Plan deletion/rebuild mechanics.",
            "definition": "Plan deletion/rebuild mechanics."
          }
        ],
        "workedExample": {
          "title": "Mask PII fields in a frame",
          "body": "Narrate what each shape and step is doing. If you only recognize the API call, you do not own the idea yet — rewrite the example from memory after one pass.",
          "code": "import hashlib\nimport pandas as pd\n\ndef mask_email(email):\n    return hashlib.sha256(email.encode()).hexdigest()[:8]\n\ndf = pd.DataFrame({\"email\": [\"a@x.com\", \"b@y.com\"], \"label\":[0,1]})\ndf[\"email\"] = df[\"email\"].map(mask_email)\nprint(df)",
          "language": "python"
        },
        "checkYourself": [
          {
            "prompt": "Handles PII/retention for derived artifacts.",
            "reveal": "Explain the idea in two sentences, name one metric or invariant you would watch, and state one mistake juniors make. Then connect it back to privacy, pii, and retention in datasets."
          }
        ]
      },
      {
        "id": "quality-metrics-and-dataset-slos",
        "heading": "Quality metrics and dataset SLOs",
        "paragraphs": [
          "Publish dataset quality dashboards: label agreement, class balance, null rates, freshness, slice coverage. Define SLOs (\"train set for market X ready by 06:00 with agreement >= 0.7\"). Dataset owners—not only model owners—should be on call for quality regressions. This organizational pattern prevents models from absorbing silent data decay. Reproducibility graphs should let you answer which models used a bad raw dump within minutes. Reproducibility graphs should let you answer which models used a bad raw dump within minutes.",
          "Hold these points explicitly while you study. Restate each one without looking at the list — recognition is not the interview bar; recall is.",
          "• Give datasets owners and SLOs.",
          "• Monitor quality continuously after publish.",
          "• Block training when SLOs fail.",
          "Production lens — Dataset versioning is as critical as model versioning: DVC, LakeFS, and Hugging Face datasets provide reproducible snapshots with hashes and metadata. Splits must be stable and documented—reshuffling leaks test information. For multimodal and LLM corpora, deduplication (MinHash, exact hash) and PII scrubbing pipelines prevent memorization and compliance violations."
        ],
        "keyTerms": [
          {
            "term": "Give datasets owners and SLOs.",
            "definition": "Give datasets owners and SLOs."
          },
          {
            "term": "Monitor quality continuously after publish.",
            "definition": "Monitor quality continuously after publish."
          },
          {
            "term": "Block training when SLOs fail.",
            "definition": "Block training when SLOs fail."
          }
        ],
        "checkYourself": [
          {
            "prompt": "Defines dataset quality SLOs and owners.",
            "reveal": "Explain the idea in two sentences, name one metric or invariant you would watch, and state one mistake juniors make. Then connect it back to quality metrics and dataset slos."
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
          "Most interview answers fail not because the definition is wrong, but because the candidate never names how the approach breaks. Use this section as a trap checklist for dataset management and versioning.",
          "Trap: Mutating 'latest.csv' without a new version ID. A strong answer preempts it — say what you would monitor, what fallback you would keep, or what simpler baseline you would try first.",
          "Trap: No gold set for label QC. A strong answer preempts it — say what you would monitor, what fallback you would keep, or what simpler baseline you would try first.",
          "Trap: Embeddings retaining PII without controls. A strong answer preempts it — say what you would monitor, what fallback you would keep, or what simpler baseline you would try first.",
          "Trap: Models owned but datasets unowned. A strong answer preempts it — say what you would monitor, what fallback you would keep, or what simpler baseline you would try first."
        ],
        "callout": {
          "tone": "warning",
          "body": "If you cannot name a failure mode, you do not yet understand the technique well enough to ship or defend it."
        },
        "checkYourself": [
          {
            "prompt": "Pick the most dangerous pitfall for Dataset management and versioning and explain how you would detect it in production or on a whiteboard.",
            "reveal": "Start with: \"Mutating 'latest.csv' without a new version ID.\" Then add a detection signal (metric, test, or review question) and a mitigation."
          }
        ]
      },
      {
        "id": "deeper-lens",
        "heading": "A deeper production lens",
        "paragraphs": [
          "Dataset versioning is as critical as model versioning. DVC, LakeFS, and Hugging Face datasets provide reproducible snapshots with hashes and metadata. Splits must be stable and documented—reshuffling leaks test information. For multimodal and LLM corpora, deduplication (MinHash, exact hash) and PII scrubbing pipelines prevent memorization and compliance violations.",
          "Labeling workflows define the ceiling on model quality. Inter-annotator agreement, adjudication, active learning, and gold-standard hidden sets quantify label noise. Biased or rushed annotation propagates directly to production errors. Invest in tooling (Label Studio, Prodigy), clear guidelines, and stratified sampling so rare classes and edge cases receive adequate coverage."
        ],
        "keyTerms": [
          {
            "term": "Dataset versioning is as critical as model versioning",
            "definition": "DVC, LakeFS, and Hugging Face datasets provide reproducible snapshots with hashes and metadata. Splits must be stable and documented—reshuffling leaks test information. For multimodal and LLM corpora, deduplication (MinH…"
          },
          {
            "term": "Labeling workflows define the ceiling on model quality",
            "definition": "Inter-annotator agreement, adjudication, active learning, and gold-standard hidden sets quantify label noise. Biased or rushed annotation propagates directly to production errors. Invest in tooling (Label Studio, Prodigy…"
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
          "You should now be able to teach dataset management and versioning as a story: what problem it solves, how the mechanism works, which assumptions it depends on, and how you would know it failed.",
          "Close the loop by writing a 90-second spoken answer out loud. If you freeze on definitions, return to the orientation and the first technical part. If you freeze on trade-offs, return to failure modes.",
          "Practice prompts from this lesson: How would you version datasets for full reproducibility? | Design a labeling QC process for medical images. | How do deletion requests affect trained models?"
        ],
        "checkYourself": [
          {
            "prompt": "Give a 90-second spoken overview of Dataset management and versioning as if starting an interview answer.",
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
        "Pins immutable dataset versions in training.",
        "Measures labeling agreement and gold QC.",
        "Tracks lineage to raw sources.",
        "Handles PII/retention for derived artifacts.",
        "Defines dataset quality SLOs and owners."
      ],
      "nextSteps": [
        "Return to the lesson page and attempt the practice / topic lab with this chapter still open if needed.",
        "Revisit any Check yourself prompts you could not answer out loud.",
        "Optional deeper reading: Hugging Face Datasets (Hugging Face) — https://huggingface.co/docs/datasets/index",
        "Optional deeper reading: Datasheets for Datasets (arXiv) — https://arxiv.org/abs/1803.09010"
      ]
    }
  }
};
