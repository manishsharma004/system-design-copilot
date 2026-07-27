/** @type {Record<string, import('../learnChapters.js').LessonLearnChapter>} */
export const mlopsChapters = {
  "mlops-and-deployment/ml-pipeline-design": {
    "title": "Chapter: ML pipeline design",
    "readingTime": "55-70 min",
    "premise": "Data pipelines, feature stores, training infrastructure, and experiment tracking for reproducible ML development. This Learn chapter expands the short lesson summary into a full study unit you can read continuously, with interactive checks and selection-based AI search when a phrase needs a second opinion.",
    "parts": [
      {
        "id": "orientation",
        "heading": "Why this chapter exists",
        "paragraphs": [
          "ML platforms now run dual tracks: classic training/registry pipelines and LLM app pipelines where prompts, indexes, and eval suites are versioned releases. Ignoring either track creates shadow IT.",
          "This chapter treats \"ML pipeline design\" as a readable study unit: intuition first, then the mechanics you must be able to explain, then the failure modes that show up in interviews and production, and finally how to talk about the topic under time pressure.",
          "Read it like a book chapter. When a phrase is unclear, select it inside the Learn reader and use Search with AI to open Google, Perplexity, or DuckDuckGo without abandoning the chapter."
        ],
        "callout": {
          "tone": "tip",
          "body": "Target reading time is paced for depth, not skimming. Pause at each Check yourself prompt and answer out loud before revealing the guide answer."
        }
      },
      {
        "id": "pipeline-stages-as-a-dag",
        "heading": "Pipeline stages as a DAG",
        "paragraphs": [
          "Typical stages: ingest -> validate -> featurize -> train -> evaluate -> register -> deploy. Edges encode data dependencies. DAGs let you retry failed stages, cache expensive steps, and compute in parallel when independent. Name artifacts explicitly (dataset version, feature version, model version). If you cannot redraw the DAG on a whiteboard with artifact contracts, the platform tooling will not save you. Artifact contracts should include schema hashes so downstream stages fail fast on drift. Artifact contracts should include schema hashes so downstream stages fail fast on drift.",
          "Hold these points explicitly while you study. Restate each one without looking at the list — recognition is not the interview bar; recall is.",
          "• Make stages idempotent with explicit artifact IOs.",
          "• Cache immutable outputs by content hash when possible.",
          "• Separate training DAGs from inference paths.",
          "Production lens — Reproducibility requires versioning everything: Data snapshots, feature definitions, code commits, hyperparameters, and environment images must be linked to every trained artifact. Pipelines should be idempotent with clear lineage so you can answer \"which data produced this model?\" Feature stores bridge training-serving skew by sharing transformation logic between batch and online paths."
        ],
        "keyTerms": [
          {
            "term": "Make stages idempotent with explicit artifact",
            "definition": "Make stages idempotent with explicit artifact IOs."
          },
          {
            "term": "Cache immutable outputs by content hash",
            "definition": "Cache immutable outputs by content hash when possible."
          },
          {
            "term": "Separate training DAGs from inference paths.",
            "definition": "Separate training DAGs from inference paths."
          }
        ],
        "workedExample": {
          "title": "Tiny DAG scheduler in Python",
          "body": "Narrate what each shape and step is doing. If you only recognize the API call, you do not own the idea yet — rewrite the example from memory after one pass.",
          "code": "def run_dag(nodes):\n    # nodes: name -> {fn, deps}\n    done = {}\n    while len(done) < len(nodes):\n        progress = False\n        for name, node in nodes.items():\n            if name in done:\n                continue\n            if all(d in done for d in node[\"deps\"]):\n                done[name] = node[\"fn\"]({d: done[d] for d in node[\"deps\"]})\n                progress = True\n        if not progress:\n            raise RuntimeError(\"cycle or missing deps\")\n    return done\n\nnodes = {\n    \"data\": {\"deps\": [], \"fn\": lambda _: [1, 2, 3]},\n    \"train\": {\"deps\": [\"data\"], \"fn\": lambda inp: sum(inp[\"data\"])},\n    \"eval\": {\"deps\": [\"train\"], \"fn\": lambda inp: inp[\"train\"] / 3},\n}\nprint(run_dag(nodes))",
          "language": "python"
        },
        "checkYourself": [
          {
            "prompt": "Can sketch a training DAG with artifact contracts.",
            "reveal": "Data snapshots, feature definitions, code commits, hyperparameters, and environment images must be linked to every trained artifact. Pipelines should be idempotent with clear lineage so you can answer \"which data produced this model?\" Feature stores bridge training-serving skew by sharing transformation logic between batch and online paths."
          }
        ]
      },
      {
        "id": "feature-pipelines-and-training-serving-skew",
        "heading": "Feature pipelines and training/serving skew",
        "paragraphs": [
          "The same feature logic must run in training and serving. Skew happens when SQL in a warehouse differs from online Python transforms. Feature stores help by sharing definitions and point-in-time joins for training. Point-in-time correctness prevents label leakage from future aggregates. Document feature freshness SLAs. Test offline/online parity with recorded requests replayed through both paths. Idempotent stages make retries safe; non-idempotent writes turn transient blips into duplicates. Idempotent stages make retries safe; non-idempotent writes turn transient blips into duplicates.",
          "Hold these points explicitly while you study. Restate each one without looking at the list — recognition is not the interview bar; recall is.",
          "• Shared definitions beat duplicated transforms.",
          "• Point-in-time joins are mandatory for time-travel training sets.",
          "• Parity tests catch train/serve skew.",
          "Production lens — CI/CD for ML adds validation gates beyond unit tests: Data schema checks, drift detectors, offline metric thresholds, and shadow deployments gate promotion. Training jobs are expensive—trigger them on meaningful data or code changes, not every commit. Orchestrators (Airflow, Kubeflow, Metaflow) manage dependencies; the hard part is organizational contracts on who owns each stage."
        ],
        "keyTerms": [
          {
            "term": "Shared definitions beat duplicated transforms.",
            "definition": "Shared definitions beat duplicated transforms."
          },
          {
            "term": "Point-in-time joins are mandatory for time-tr…",
            "definition": "Point-in-time joins are mandatory for time-travel training sets."
          },
          {
            "term": "Parity tests catch train/serve skew.",
            "definition": "Parity tests catch train/serve skew."
          }
        ],
        "checkYourself": [
          {
            "prompt": "Explains train/serve skew and PIT joins.",
            "reveal": "Data schema checks, drift detectors, offline metric thresholds, and shadow deployments gate promotion. Training jobs are expensive—trigger them on meaningful data or code changes, not every commit. Orchestrators (Airflow, Kubeflow, Metaflow) manage dependencies; the hard part is organizational contracts on who owns each stage."
          }
        ]
      },
      {
        "id": "evaluation-gates-before-registry",
        "heading": "Evaluation gates before registry",
        "paragraphs": [
          "Not every trained checkpoint deserves promotion. Gates check metric thresholds, fairness slices, calibration, and smoke inference. Store evaluation reports beside model binaries. Require reviewers for high-risk models. The registry records lineage: code git SHA, data versions, hyperparameters, metrics. Without lineage, rollback and audits fail. Promotion gates are product decisions encoded as code—keep them reviewed like business logic. Promotion gates are product decisions encoded as code—keep them reviewed like business logic.",
          "Hold these points explicitly while you study. Restate each one without looking at the list — recognition is not the interview bar; recall is.",
          "• Promotion is a gated decision, not an automatic last step.",
          "• Registry entries need full lineage metadata.",
          "• Keep evaluation artifacts immutable.",
          "Production lens — Reproducibility requires versioning everything: Data snapshots, feature definitions, code commits, hyperparameters, and environment images must be linked to every trained artifact. Pipelines should be idempotent with clear lineage so you can answer \"which data produced this model?\" Feature stores bridge training-serving skew by sharing transformation logic between batch and online paths."
        ],
        "keyTerms": [
          {
            "term": "Promotion is a gated decision, not",
            "definition": "Promotion is a gated decision, not an automatic last step."
          },
          {
            "term": "Registry entries need full lineage metadata.",
            "definition": "Registry entries need full lineage metadata."
          },
          {
            "term": "Keep evaluation artifacts immutable.",
            "definition": "Keep evaluation artifacts immutable."
          }
        ],
        "workedExample": {
          "title": "Gate model promotion with thresholds",
          "body": "Narrate what each shape and step is doing. If you only recognize the API call, you do not own the idea yet — rewrite the example from memory after one pass.",
          "code": "def should_promote(metrics, thresholds):\n    failures = [k for k, t in thresholds.items() if metrics.get(k, -1e9) < t]\n    return len(failures) == 0, failures\n\nprint(should_promote({\"f1\": 0.82, \"auc\": 0.91}, {\"f1\": 0.8, \"auc\": 0.9}))\nprint(should_promote({\"f1\": 0.7, \"auc\": 0.91}, {\"f1\": 0.8, \"auc\": 0.9}))",
          "language": "python"
        },
        "checkYourself": [
          {
            "prompt": "Defines metric gates before registry promotion.",
            "reveal": "Explain the idea in two sentences, name one metric or invariant you would watch, and state one mistake juniors make. Then connect it back to evaluation gates before registry."
          }
        ]
      },
      {
        "id": "orchestration-environments-and-secrets",
        "heading": "Orchestration, environments, and secrets",
        "paragraphs": [
          "Orchestrators schedule DAGs with retries and backfills. Keep configs declarative. Separate environments (dev/stage/prod) with different data scopes and credentials. Secrets never belong in notebooks or git. Parameterize runs so backfills are first-class. Observability on pipeline duration and failure rate is part of MLOps health. Backfills are where pipeline design quality shows; if backfill is hard, redesign storage keys.",
          "Hold these points explicitly while you study. Restate each one without looking at the list — recognition is not the interview bar; recall is.",
          "• Declarative configs + env separation.",
          "• Secrets via vault/secret manager only.",
          "• Measure pipeline SLIs like microservice SLIs.",
          "Production lens — CI/CD for ML adds validation gates beyond unit tests: Data schema checks, drift detectors, offline metric thresholds, and shadow deployments gate promotion. Training jobs are expensive—trigger them on meaningful data or code changes, not every commit. Orchestrators (Airflow, Kubeflow, Metaflow) manage dependencies; the hard part is organizational contracts on who owns each stage."
        ],
        "keyTerms": [
          {
            "term": "Declarative configs + env separation.",
            "definition": "Declarative configs + env separation."
          },
          {
            "term": "Secrets via vault/secret manager only.",
            "definition": "Secrets via vault/secret manager only."
          },
          {
            "term": "Measure pipeline SLIs like microservice SLIs.",
            "definition": "Measure pipeline SLIs like microservice SLIs."
          }
        ],
        "checkYourself": [
          {
            "prompt": "Separates secrets and environments.",
            "reveal": "Explain the idea in two sentences, name one metric or invariant you would watch, and state one mistake juniors make. Then connect it back to orchestration, environments, and secrets."
          }
        ]
      },
      {
        "id": "human-workflows-around-automation",
        "heading": "Human workflows around automation",
        "paragraphs": [
          "Automation should not hide ownership. Define who is on call when a daily training job fails, who approves promotions, and how hotfixes roll back. Provide runbooks for common failures: schema drift, empty partitions, metric regressions. Pipelines are socio-technical systems; clear owners beat clever DAGs. Separate feature compute from model training so each can scale and fail independently.",
          "Hold these points explicitly while you study. Restate each one without looking at the list — recognition is not the interview bar; recall is.",
          "• Assign owners and on-call for training DAGs.",
          "• Write runbooks for top failure modes.",
          "• Make rollback a practiced path.",
          "Production lens — Reproducibility requires versioning everything: Data snapshots, feature definitions, code commits, hyperparameters, and environment images must be linked to every trained artifact. Pipelines should be idempotent with clear lineage so you can answer \"which data produced this model?\" Feature stores bridge training-serving skew by sharing transformation logic between batch and online paths."
        ],
        "keyTerms": [
          {
            "term": "Assign owners and on-call for training",
            "definition": "Assign owners and on-call for training DAGs."
          },
          {
            "term": "Write runbooks for top failure modes.",
            "definition": "Write runbooks for top failure modes."
          },
          {
            "term": "Make rollback a practiced path.",
            "definition": "Make rollback a practiced path."
          }
        ],
        "checkYourself": [
          {
            "prompt": "Names owners/runbooks for pipeline failures.",
            "reveal": "Explain the idea in two sentences, name one metric or invariant you would watch, and state one mistake juniors make. Then connect it back to human workflows around automation."
          }
        ]
      },
      {
        "id": "dual-track-pipelines-classic-training-and-llm-app-releases",
        "heading": "Dual-track pipelines: classic training and LLM app releases",
        "paragraphs": [
          "Classic MLOps pipelines still matter: data validation → features → train → evaluate → register → deploy for tabular, CV, and ranking models. In parallel, LLM product work needs a second release train whose artifacts are prompts, tool schemas, chunker config, embedding model ids, index snapshots, routing policies, and offline eval bundles—not only weight files. Treat a prompt+index+eval triple as a versioned release candidate with changelogs and rollback. CI should run golden retrieval and answer suites the way training pipelines run metric gates; promotion to “prod alias” mirrors promoting a model registry entry. Shared platform pieces include artifact storage, approval records, secret management, and canary traffic—but stage graphs differ. A common failure mode is improving a classifier with rigorous Airflow DAGs while the companion RAG prompts are edited live in a vendor UI with no diff. Another failure is retraining an LLM adapter without refreshing the retrieval index versions referenced in production. Draw both tracks in architecture reviews; assign owners; require the same discipline for JSON prompt bundles that you require for ONNX files. Where possible, unify observability ids so a quickstart tutorial and a fraud model incident use the same deployment vocabulary.",
          "Hold these points explicitly while you study. Restate each one without looking at the list — recognition is not the interview bar; recall is.",
          "• Keep a classic train/eval/register track for discriminative models.",
          "• Version prompts, indexes, tool schemas, and eval sets as LLM app release artifacts.",
          "• Gate both tracks with CI metrics and alias-based rollback.",
          "• Avoid unversioned prompt edits in vendor consoles for production paths.",
          "Production lens — CI/CD for ML adds validation gates beyond unit tests: Data schema checks, drift detectors, offline metric thresholds, and shadow deployments gate promotion. Training jobs are expensive—trigger them on meaningful data or code changes, not every commit. Orchestrators (Airflow, Kubeflow, Metaflow) manage dependencies; the hard part is organizational contracts on who owns each stage."
        ],
        "keyTerms": [
          {
            "term": "Keep a classic train/eval/register track for",
            "definition": "Keep a classic train/eval/register track for discriminative models."
          },
          {
            "term": "Version prompts, indexes, tool schemas, and",
            "definition": "Version prompts, indexes, tool schemas, and eval sets as LLM app release artifacts."
          },
          {
            "term": "Gate both tracks with CI metrics",
            "definition": "Gate both tracks with CI metrics and alias-based rollback."
          },
          {
            "term": "Avoid unversioned prompt edits in vendor",
            "definition": "Avoid unversioned prompt edits in vendor consoles for production paths."
          }
        ],
        "workedExample": {
          "title": "Version dict for an LLM app release",
          "body": "Narrate what each shape and step is doing. If you only recognize the API call, you do not own the idea yet — rewrite the example from memory after one pass.",
          "code": "release = {\n    'prompt_version': 'policy_assist_v12',\n    'embedder': 'e5-large-v3',\n    'index_build': 'acme_docs_2026_07_20',\n    'eval_suite': 'rag_gold_v7',\n    'routing_alias': 'chat-strong',\n}\nrequired = ['prompt_version', 'embedder', 'index_build', 'eval_suite']\nmissing = [k for k in required if k not in release]\nprint(\"ready\" if not missing else missing)",
          "language": "python"
        },
        "checkYourself": [
          {
            "prompt": "Documents both classic ML and LLM app pipeline tracks.",
            "reveal": "Explain the idea in two sentences, name one metric or invariant you would watch, and state one mistake juniors make. Then connect it back to dual-track pipelines: classic training and llm app releases."
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
          "Most interview answers fail not because the definition is wrong, but because the candidate never names how the approach breaks. Use this section as a trap checklist for ml pipeline design.",
          "Trap: Notebook-only training without lineage. A strong answer preempts it — say what you would monitor, what fallback you would keep, or what simpler baseline you would try first.",
          "Trap: Duplicated online/offline feature logic. A strong answer preempts it — say what you would monitor, what fallback you would keep, or what simpler baseline you would try first.",
          "Trap: Auto-promoting every checkpoint. A strong answer preempts it — say what you would monitor, what fallback you would keep, or what simpler baseline you would try first.",
          "Trap: No backfill story for data corrections. A strong answer preempts it — say what you would monitor, what fallback you would keep, or what simpler baseline you would try first.",
          "Trap: Production prompts edited without version control. A strong answer preempts it — say what you would monitor, what fallback you would keep, or what simpler baseline you would try first.",
          "Trap: Deploying a new embedder without a matching index build id. A strong answer preempts it — say what you would monitor, what fallback you would keep, or what simpler baseline you would try first.",
          "Trap: Assuming registry-only workflows cover RAG systems. A strong answer preempts it — say what you would monitor, what fallback you would keep, or what simpler baseline you would try first."
        ],
        "callout": {
          "tone": "warning",
          "body": "If you cannot name a failure mode, you do not yet understand the technique well enough to ship or defend it."
        },
        "checkYourself": [
          {
            "prompt": "Pick the most dangerous pitfall for ML pipeline design and explain how you would detect it in production or on a whiteboard.",
            "reveal": "Start with: \"Notebook-only training without lineage.\" Then add a detection signal (metric, test, or review question) and a mitigation."
          }
        ]
      },
      {
        "id": "deeper-lens",
        "heading": "A deeper production lens",
        "paragraphs": [
          "Reproducibility requires versioning everything. Data snapshots, feature definitions, code commits, hyperparameters, and environment images must be linked to every trained artifact. Pipelines should be idempotent with clear lineage so you can answer \"which data produced this model?\" Feature stores bridge training-serving skew by sharing transformation logic between batch and online paths.",
          "CI/CD for ML adds validation gates beyond unit tests. Data schema checks, drift detectors, offline metric thresholds, and shadow deployments gate promotion. Training jobs are expensive—trigger them on meaningful data or code changes, not every commit. Orchestrators (Airflow, Kubeflow, Metaflow) manage dependencies; the hard part is organizational contracts on who owns each stage."
        ],
        "keyTerms": [
          {
            "term": "Reproducibility requires versioning everything",
            "definition": "Data snapshots, feature definitions, code commits, hyperparameters, and environment images must be linked to every trained artifact. Pipelines should be idempotent with clear lineage so you can answer \"which data produce…"
          },
          {
            "term": "CI/CD for ML adds validation gates beyond unit tests",
            "definition": "Data schema checks, drift detectors, offline metric thresholds, and shadow deployments gate promotion. Training jobs are expensive—trigger them on meaningful data or code changes, not every commit. Orchestrators (Airflow…"
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
          "You should now be able to teach ml pipeline design as a story: what problem it solves, how the mechanism works, which assumptions it depends on, and how you would know it failed.",
          "Close the loop by writing a 90-second spoken answer out loud. If you freeze on definitions, return to the orientation and the first technical part. If you freeze on trade-offs, return to failure modes.",
          "Practice prompts from this lesson: Design a daily training pipeline for fraud models. | How do you prevent training/serving skew? | What metadata belongs in a model registry?"
        ],
        "checkYourself": [
          {
            "prompt": "Give a 90-second spoken overview of ML pipeline design as if starting an interview answer.",
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
        "Can sketch a training DAG with artifact contracts.",
        "Explains train/serve skew and PIT joins.",
        "Defines metric gates before registry promotion.",
        "Separates secrets and environments.",
        "Names owners/runbooks for pipeline failures."
      ],
      "nextSteps": [
        "Return to the lesson page and attempt the practice / topic lab with this chapter still open if needed.",
        "Revisit any Check yourself prompts you could not answer out loud.",
        "Optional deeper reading: MLflow Documentation (MLflow) — https://mlflow.org/docs/latest/index.html",
        "Optional deeper reading: Hidden Technical Debt in Machine Learning Systems (NeurIPS) — https://papers.nips.cc/paper/5656-hidden-technical-debt-in-machine-learning-systems"
      ]
    }
  },
  "mlops-and-deployment/model-serving": {
    "title": "Chapter: Model serving and inference",
    "readingTime": "55-70 min",
    "premise": "Serving infrastructure, optimization techniques, scaling strategies, and cost management for production model inference. This Learn chapter expands the short lesson summary into a full study unit you can read continuously, with interactive checks and selection-based AI search when a phrase needs a second opinion.",
    "parts": [
      {
        "id": "orientation",
        "heading": "Why this chapter exists",
        "paragraphs": [
          "LLM serving in 2026 is dominated by KV-cache behavior, continuous batching, prefill vs decode asymmetry, and the choice between managed APIs and open-weight engines behind gateways—with canary prompts and model aliases as release machinery.",
          "This chapter treats \"Model serving and inference\" as a readable study unit: intuition first, then the mechanics you must be able to explain, then the failure modes that show up in interviews and production, and finally how to talk about the topic under time pressure.",
          "Read it like a book chapter. When a phrase is unclear, select it inside the Learn reader and use Search with AI to open Google, Perplexity, or DuckDuckGo without abandoning the chapter."
        ],
        "callout": {
          "tone": "tip",
          "body": "Target reading time is paced for depth, not skimming. Pause at each Check yourself prompt and answer out loud before revealing the guide answer."
        }
      },
      {
        "id": "serving-shapes-online-batch-streaming",
        "heading": "Serving shapes: online, batch, streaming",
        "paragraphs": [
          "Online inference answers interactive requests under tight SLOs. Batch scores large tables periodically. Streaming scores events as they arrive. Each shape has different latency, throughput, and failure semantics. Do not force batch workloads through an online microservice without reason. Document the path your product actually needs and the freshness requirements for scores. p99 latency is a product feature; users feel tail latency even when averages look healthy. p99 latency is a product feature; users feel tail latency even when averages look healthy. p99 latency is a product feature; users feel tail latency even when averages look healthy.",
          "Hold these points explicitly while you study. Restate each one without looking at the list — recognition is not the interview bar; recall is.",
          "• Match serving shape to freshness and traffic patterns.",
          "• Batch can be simpler and cheaper when interactive latency is unnecessary.",
          "• Streaming fits continuous feature updates.",
          "Production lens — Latency budgets split across pre/post-processing: GPU inference may be a fraction of p99 latency once serialization, auth, feature lookup, and batching queues are included. Dynamic batching improves throughput but adds tail latency—SLAs dictate batch window size. For LLMs, time-to-first-token and tokens/sec are separate UX metrics; speculative decoding and KV-cache reuse dominate optimization."
        ],
        "keyTerms": [
          {
            "term": "Match serving shape to freshness and",
            "definition": "Match serving shape to freshness and traffic patterns."
          },
          {
            "term": "Batch can be simpler and cheaper",
            "definition": "Batch can be simpler and cheaper when interactive latency is unnecessary."
          },
          {
            "term": "Streaming fits continuous feature updates.",
            "definition": "Streaming fits continuous feature updates."
          }
        ],
        "checkYourself": [
          {
            "prompt": "Chooses online vs batch vs streaming deliberately.",
            "reveal": "GPU inference may be a fraction of p99 latency once serialization, auth, feature lookup, and batching queues are included. Dynamic batching improves throughput but adds tail latency—SLAs dictate batch window size. For LLMs, time-to-first-token and tokens/sec are separate UX metrics; speculative decoding and KV-cache reuse dominate optimization."
          }
        ]
      },
      {
        "id": "apis-schemas-and-backward-compatibility",
        "heading": "APIs, schemas, and backward compatibility",
        "paragraphs": [
          "Version request/response schemas. Additive changes are safer than renames. Include model version in responses for debugging. Validate inputs and return structured errors. Canary new models on a traffic slice comparing scores and latencies. Keep a shadow mode that scores without affecting users. Rollback must be a config change, not a rebuild. Shadow traffic is the safest way to learn score deltas without user impact. Shadow traffic is the safest way to learn score deltas without user impact.",
          "Hold these points explicitly while you study. Restate each one without looking at the list — recognition is not the interview bar; recall is.",
          "• Version models and API schemas independently but coherently.",
          "• Canary/shadow before full cutover.",
          "• Practice rollback as an operational drill.",
          "Production lens — Model formats and runtimes determine portability: ONNX, TensorRT, TorchScript, and GGUF each target different hardware and precision trade-offs. Quantization (INT8/INT4) reduces memory but needs calibration on representative data. Multi-model routing, canary releases, and autoscaling on GPU metrics (utilization, queue depth) are standard production patterns."
        ],
        "keyTerms": [
          {
            "term": "Version models and API schemas independently",
            "definition": "Version models and API schemas independently but coherently."
          },
          {
            "term": "Canary/shadow before full cutover.",
            "definition": "Canary/shadow before full cutover."
          },
          {
            "term": "Practice rollback as an operational drill.",
            "definition": "Practice rollback as an operational drill."
          }
        ],
        "workedExample": {
          "title": "Canary traffic split decision",
          "body": "Narrate what each shape and step is doing. If you only recognize the API call, you do not own the idea yet — rewrite the example from memory after one pass.",
          "code": "def route(user_id, canary_pct=10):\n    return \"canary\" if (hash(user_id) % 100) < canary_pct else \"stable\"\n\nfrom collections import Counter\nprint(Counter(route(f\"u{i}\") for i in range(1000)))",
          "language": "python"
        },
        "checkYourself": [
          {
            "prompt": "Versions APIs and model artifacts with canaries.",
            "reveal": "ONNX, TensorRT, TorchScript, and GGUF each target different hardware and precision trade-offs. Quantization (INT8/INT4) reduces memory but needs calibration on representative data. Multi-model routing, canary releases, and autoscaling on GPU metrics (utilization, queue depth) are standard production patterns."
          }
        ]
      },
      {
        "id": "performance-engineering-batching-caching-quantization",
        "heading": "Performance engineering: batching, caching, quantization",
        "paragraphs": [
          "Dynamic batching raises throughput at some latency cost. Caching helps when identical feature vectors recur. Quantization and distillation reduce compute at potential quality cost—validate with offline eval + online guards. Profile before optimizing; often feature fetch dominates model math. Expose p50/p95/p99 latency, not only averages. Quantization without a quality gate is just silent accuracy drift with better GPU utilization. Quantization without a quality gate is just silent accuracy drift with better GPU utilization.",
          "Hold these points explicitly while you study. Restate each one without looking at the list — recognition is not the interview bar; recall is.",
          "• Optimize the true bottleneck (often features I/O).",
          "• Measure percentile latencies.",
          "• Validate compression techniques against quality gates.",
          "Production lens — Latency budgets split across pre/post-processing: GPU inference may be a fraction of p99 latency once serialization, auth, feature lookup, and batching queues are included. Dynamic batching improves throughput but adds tail latency—SLAs dictate batch window size. For LLMs, time-to-first-token and tokens/sec are separate UX metrics; speculative decoding and KV-cache reuse dominate optimization."
        ],
        "keyTerms": [
          {
            "term": "Optimize the true bottleneck (often features",
            "definition": "Optimize the true bottleneck (often features I/O)."
          },
          {
            "term": "Measure percentile latencies.",
            "definition": "Measure percentile latencies."
          },
          {
            "term": "Validate compression techniques against quali…",
            "definition": "Validate compression techniques against quality gates."
          }
        ],
        "workedExample": {
          "title": "Simulate dynamic batching throughput",
          "body": "Narrate what each shape and step is doing. If you only recognize the API call, you do not own the idea yet — rewrite the example from memory after one pass.",
          "code": "import math\n\ndef throughput(qps_arrivals, batch_window_ms, max_batch, infer_ms_per_batch):\n    # toy: items per window capped by max_batch\n    arrivals_per_window = qps_arrivals * (batch_window_ms / 1000)\n    batch = min(max_batch, max(1, math.floor(arrivals_per_window)))\n    batches_per_sec = 1000 / (batch_window_ms + infer_ms_per_batch)\n    return batch * batches_per_sec\n\nprint(round(throughput(200, 10, 32, 5), 2))",
          "language": "python"
        },
        "checkYourself": [
          {
            "prompt": "Tunes batching/caching with percentile SLOs.",
            "reveal": "Explain the idea in two sentences, name one metric or invariant you would watch, and state one mistake juniors make. Then connect it back to performance engineering: batching, caching, quantization."
          }
        ]
      },
      {
        "id": "resource-management-and-autoscaling",
        "heading": "Resource management and autoscaling",
        "paragraphs": [
          "Scale on concurrency, queue depth, or CPU/GPU utilization. Cold starts hurt; keep warm pools for critical paths. Isolate noisy neighbors. Set timeouts and load-shed before cascading failure. Multi-model hosts need memory budgets and admission control. Treat model servers as production services with SLOs and error budgets. Admission control protects expensive models from retry storms. Admission control protects expensive models from retry storms.",
          "Hold these points explicitly while you study. Restate each one without looking at the list — recognition is not the interview bar; recall is.",
          "• Scale on leading indicators like queue depth.",
          "• Load-shed intentionally under overload.",
          "• Give models memory/admission budgets.",
          "Production lens — Model formats and runtimes determine portability: ONNX, TensorRT, TorchScript, and GGUF each target different hardware and precision trade-offs. Quantization (INT8/INT4) reduces memory but needs calibration on representative data. Multi-model routing, canary releases, and autoscaling on GPU metrics (utilization, queue depth) are standard production patterns."
        ],
        "keyTerms": [
          {
            "term": "Scale on leading indicators like queue",
            "definition": "Scale on leading indicators like queue depth."
          },
          {
            "term": "Load-shed intentionally under overload.",
            "definition": "Load-shed intentionally under overload."
          },
          {
            "term": "Give models memory/admission budgets.",
            "definition": "Give models memory/admission budgets."
          }
        ],
        "checkYourself": [
          {
            "prompt": "Autoscales and load-sheds with clear policies.",
            "reveal": "Explain the idea in two sentences, name one metric or invariant you would watch, and state one mistake juniors make. Then connect it back to resource management and autoscaling."
          }
        ]
      },
      {
        "id": "security-and-privacy-at-the-edge-of-the-model",
        "heading": "Security and privacy at the edge of the model",
        "paragraphs": [
          "Authenticate callers, authorize features/tenants, scrub logs, and encrypt in transit. Prompt/feature logs may contain PII—apply retention limits. For LLMs, prevent secret leakage through outputs. Serving is part of the threat model, not just MLOps plumbing. Include model version in every log line you might need during an incident. Include model version in every log line you might need during an incident.",
          "Hold these points explicitly while you study. Restate each one without looking at the list — recognition is not the interview bar; recall is.",
          "• Authn/z in front of model APIs.",
          "• Minimize sensitive log retention.",
          "• Include serving in privacy reviews.",
          "Production lens — Latency budgets split across pre/post-processing: GPU inference may be a fraction of p99 latency once serialization, auth, feature lookup, and batching queues are included. Dynamic batching improves throughput but adds tail latency—SLAs dictate batch window size. For LLMs, time-to-first-token and tokens/sec are separate UX metrics; speculative decoding and KV-cache reuse dominate optimization."
        ],
        "keyTerms": [
          {
            "term": "Authn/z in front of model APIs.",
            "definition": "Authn/z in front of model APIs."
          },
          {
            "term": "Minimize sensitive log retention.",
            "definition": "Minimize sensitive log retention."
          },
          {
            "term": "Include serving in privacy reviews.",
            "definition": "Include serving in privacy reviews."
          }
        ],
        "checkYourself": [
          {
            "prompt": "Applies auth and privacy controls to inference.",
            "reveal": "Explain the idea in two sentences, name one metric or invariant you would watch, and state one mistake juniors make. Then connect it back to security and privacy at the edge of the model."
          }
        ]
      },
      {
        "id": "llm-serving-realities-kv-cache-batching-gateways-and-aliases",
        "heading": "LLM serving realities: KV cache, batching, gateways, and aliases",
        "paragraphs": [
          "Classic sklearn/torch classifiers hide behind simple horizontal autoscaling; LLMs do not. Prefill processes the prompt in parallel and builds a KV cache; decode generates token-by-token while reading and appending to that cache. Time-to-first-token is mostly prefill; tokens-per-second is decode. Continuous batching (vLLM-class and similar engines) schedules many sequences in one GPU batch as they grow at different lengths, improving utilization versus naive one-request-per-batch serving. Memory is often bound by KV cache (layers × heads × sequence × width), so long contexts and concurrency fight each other. Quantization, paged attention, and prefix caching are standard levers. Many teams put an API gateway in front of open-weight engines to expose OpenAI-compatible routes, auth, rate limits, and routing—while other workloads stay on managed frontier APIs. Product code should call stable model aliases (`chat-strong`, `extract-fast`) that map to concrete revisions; canary prompts and eval suites run against candidates before alias flips. Deprecations and capacity events then become controlled cutovers instead of surprise regressions. Measure queue time, prefill ms, decode TPS, cache hit rate, and OOM kills—not only “GPU busy %.",
          "Hold these points explicitly while you study. Restate each one without looking at the list — recognition is not the interview bar; recall is.",
          "• Separate prefill (TTFT) from decode (TPS) when capacity planning.",
          "• Continuous batching and KV-cache memory dominate open-weight serving economics.",
          "• Use gateways + model aliases in front of engines; canary prompts before alias flips.",
          "• Track cache hits, queue time, and OOM alongside generic GPU metrics.",
          "Production lens — Model formats and runtimes determine portability: ONNX, TensorRT, TorchScript, and GGUF each target different hardware and precision trade-offs. Quantization (INT8/INT4) reduces memory but needs calibration on representative data. Multi-model routing, canary releases, and autoscaling on GPU metrics (utilization, queue depth) are standard production patterns."
        ],
        "keyTerms": [
          {
            "term": "Separate prefill (TTFT) from decode (TPS)",
            "definition": "Separate prefill (TTFT) from decode (TPS) when capacity planning."
          },
          {
            "term": "Continuous batching and KV-cache memory dominate",
            "definition": "Continuous batching and KV-cache memory dominate open-weight serving economics."
          },
          {
            "term": "Use gateways + model aliases in",
            "definition": "Use gateways + model aliases in front of engines; canary prompts before alias flips."
          },
          {
            "term": "Track cache hits, queue time, and",
            "definition": "Track cache hits, queue time, and OOM alongside generic GPU metrics."
          }
        ],
        "workedExample": {
          "title": "Estimate KV-cache memory growth",
          "body": "Narrate what each shape and step is doing. If you only recognize the API call, you do not own the idea yet — rewrite the example from memory after one pass.",
          "code": "def kv_cache_gb(layers, heads, seq, head_dim, bytes_per=2, batch=1):\n    # K and V each store layers*batch*heads*seq*head_dim\n    elements = 2 * layers * batch * heads * seq * head_dim\n    return elements * bytes_per / (1024 ** 3)\n\nfor seq in [2048, 8192, 32768]:\n    print(seq, round(kv_cache_gb(32, 32, seq, 128, batch=8), 2), \"GiB\")",
          "language": "python"
        },
        "checkYourself": [
          {
            "prompt": "Can explain prefill vs decode and KV-cache memory scaling.",
            "reveal": "Explain the idea in two sentences, name one metric or invariant you would watch, and state one mistake juniors make. Then connect it back to llm serving realities: kv cache, batching, gateways, and aliases."
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
          "Most interview answers fail not because the definition is wrong, but because the candidate never names how the approach breaks. Use this section as a trap checklist for model serving and inference.",
          "Trap: Deploying without canary/shadow comparison. A strong answer preempts it — say what you would monitor, what fallback you would keep, or what simpler baseline you would try first.",
          "Trap: Average latency hiding bad p99. A strong answer preempts it — say what you would monitor, what fallback you would keep, or what simpler baseline you would try first.",
          "Trap: No rollback switch. A strong answer preempts it — say what you would monitor, what fallback you would keep, or what simpler baseline you would try first.",
          "Trap: Logging raw sensitive features forever. A strong answer preempts it — say what you would monitor, what fallback you would keep, or what simpler baseline you would try first.",
          "Trap: Autoscaling LLMs like stateless CPU microservices without cache awareness. A strong answer preempts it — say what you would monitor, what fallback you would keep, or what simpler baseline you would try first.",
          "Trap: Hard-coding provider model IDs in every client. A strong answer preempts it — say what you would monitor, what fallback you would keep, or what simpler baseline you would try first.",
          "Trap: Ignoring TTFT when optimizing only average latency. A strong answer preempts it — say what you would monitor, what fallback you would keep, or what simpler baseline you would try first."
        ],
        "callout": {
          "tone": "warning",
          "body": "If you cannot name a failure mode, you do not yet understand the technique well enough to ship or defend it."
        },
        "checkYourself": [
          {
            "prompt": "Pick the most dangerous pitfall for Model serving and inference and explain how you would detect it in production or on a whiteboard.",
            "reveal": "Start with: \"Deploying without canary/shadow comparison.\" Then add a detection signal (metric, test, or review question) and a mitigation."
          }
        ]
      },
      {
        "id": "deeper-lens",
        "heading": "A deeper production lens",
        "paragraphs": [
          "Latency budgets split across pre/post-processing. GPU inference may be a fraction of p99 latency once serialization, auth, feature lookup, and batching queues are included. Dynamic batching improves throughput but adds tail latency—SLAs dictate batch window size. For LLMs, time-to-first-token and tokens/sec are separate UX metrics; speculative decoding and KV-cache reuse dominate optimization.",
          "Model formats and runtimes determine portability. ONNX, TensorRT, TorchScript, and GGUF each target different hardware and precision trade-offs. Quantization (INT8/INT4) reduces memory but needs calibration on representative data. Multi-model routing, canary releases, and autoscaling on GPU metrics (utilization, queue depth) are standard production patterns."
        ],
        "keyTerms": [
          {
            "term": "Latency budgets split across pre/post-processing",
            "definition": "GPU inference may be a fraction of p99 latency once serialization, auth, feature lookup, and batching queues are included. Dynamic batching improves throughput but adds tail latency—SLAs dictate batch window size. For LL…"
          },
          {
            "term": "Model formats and runtimes determine portability",
            "definition": "ONNX, TensorRT, TorchScript, and GGUF each target different hardware and precision trade-offs. Quantization (INT8/INT4) reduces memory but needs calibration on representative data. Multi-model routing, canary releases, a…"
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
          "You should now be able to teach model serving and inference as a story: what problem it solves, how the mechanism works, which assumptions it depends on, and how you would know it failed.",
          "Close the loop by writing a 90-second spoken answer out loud. If you freeze on definitions, return to the orientation and the first technical part. If you freeze on trade-offs, return to failure modes.",
          "Practice prompts from this lesson: Design a canary deployment for a ranking model. | How do you decide between batch and online scoring? | What metrics instrument a model server?"
        ],
        "checkYourself": [
          {
            "prompt": "Give a 90-second spoken overview of Model serving and inference as if starting an interview answer.",
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
        "Chooses online vs batch vs streaming deliberately.",
        "Versions APIs and model artifacts with canaries.",
        "Tunes batching/caching with percentile SLOs.",
        "Autoscales and load-sheds with clear policies.",
        "Applies auth and privacy controls to inference."
      ],
      "nextSteps": [
        "Return to the lesson page and attempt the practice / topic lab with this chapter still open if needed.",
        "Revisit any Check yourself prompts you could not answer out loud.",
        "Optional deeper reading: NVIDIA Triton Inference Server (NVIDIA) — https://docs.nvidia.com/deeplearning/triton-inference-server/user-guide/docs/index.html",
        "Optional deeper reading: vLLM: Easy, Fast, and Cheap LLM Serving with PagedAttention (arXiv) — https://arxiv.org/abs/2309.06180"
      ]
    }
  },
  "mlops-and-deployment/monitoring-and-observability": {
    "title": "Chapter: ML monitoring and observability",
    "readingTime": "55-70 min",
    "premise": "Model drift detection, performance monitoring, alerting, and feedback loops for maintaining model quality in production. This Learn chapter expands the short lesson summary into a full study unit you can read continuously, with interactive checks and selection-based AI search when a phrase needs a second opinion.",
    "parts": [
      {
        "id": "orientation",
        "heading": "Why this chapter exists",
        "paragraphs": [
          "LLMOps monitoring complements classic ML drift: token cost, groundedness sampling, retrieval miss rate, and tool errors can tank a product while feature PSI stays flat. You need dashboards that separate traditional model decay from generative quality regressions.",
          "This chapter treats \"ML monitoring and observability\" as a readable study unit: intuition first, then the mechanics you must be able to explain, then the failure modes that show up in interviews and production, and finally how to talk about the topic under time pressure.",
          "Read it like a book chapter. When a phrase is unclear, select it inside the Learn reader and use Search with AI to open Google, Perplexity, or DuckDuckGo without abandoning the chapter."
        ],
        "callout": {
          "tone": "tip",
          "body": "Target reading time is paced for depth, not skimming. Pause at each Check yourself prompt and answer out loud before revealing the guide answer."
        }
      },
      {
        "id": "what-to-monitor-data-model-system",
        "heading": "What to monitor: data, model, system",
        "paragraphs": [
          "Data monitors: null rates, range violations, category shifts. Model monitors: score distributions, calibration proxies, delayed-label performance. System monitors: latency, errors, saturation. Slice by segment (country, device) to catch localized failures. Averages hide incidents. Start from user journeys: which broken signal would first show that ranking or fraud scoring is wrong? A monitor without a runbook is a future ignored page; write the action next to the threshold. A monitor without a runbook is a future ignored page; write the action next to the threshold. A monitor without a runbook is a future ignored page; write the action next to the threshold.",
          "Hold these points explicitly while you study. Restate each one without looking at the list — recognition is not the interview bar; recall is.",
          "• Cover data, model, and system signals.",
          "• Slice metrics by critical segments.",
          "• Tie monitors to user journeys.",
          "Production lens — Four planes: infra, data, GenAI traces, outcomes: Classical ML monitoring watched features, predictions, and delayed labels. LLM apps add prompt/retrieval/tool traces and token economics. A green GPU graph with collapsing citation hit rate is still an incident. Organize dashboards into infra SLOs, data/quality SLIs, GenAI trace red-lanes, and business outcomes—and page only when playbooks exist.\n\nOpenTelemetry GenAI conventions help standardize span names and attributes across vendors and self-hosted stacks. Include model ID, cache hits, retrieval document IDs, and tool errors. Sampling strategies must balance debug needs with privacy; never ship raw prompts to shared logs without redaction contracts."
        ],
        "keyTerms": [
          {
            "term": "Cover data, model, and system signals.",
            "definition": "Cover data, model, and system signals."
          },
          {
            "term": "Slice metrics by critical segments.",
            "definition": "Slice metrics by critical segments."
          },
          {
            "term": "Tie monitors to user journeys.",
            "definition": "Tie monitors to user journeys."
          }
        ],
        "workedExample": {
          "title": "PSI-like drift score on histograms",
          "body": "Narrate what each shape and step is doing. If you only recognize the API call, you do not own the idea yet — rewrite the example from memory after one pass.",
          "code": "import numpy as np\n\ndef psi(expected, actual, eps=1e-6):\n    expected = expected / (expected.sum() + eps)\n    actual = actual / (actual.sum() + eps)\n    return float(np.sum((actual - expected) * np.log((actual + eps) / (expected + eps))))\n\ne = np.array([0.2, 0.3, 0.5])\na = np.array([0.1, 0.2, 0.7])\nprint(round(psi(e, a), 4))",
          "language": "python"
        },
        "checkYourself": [
          {
            "prompt": "Defines data/model/system monitors with slices.",
            "reveal": "Classical ML monitoring watched features, predictions, and delayed labels. LLM apps add prompt/retrieval/tool traces and token economics. A green GPU graph with collapsing citation hit rate is still an incident. Organize dashboards into infra SLOs, data/quality SLIs, GenAI trace red-lanes, and business outcomes—and page only when playbooks exist.\n\nOpenTelemetry GenAI conventions help standardize span names and attributes across vendors and self-hosted stacks. Include model ID, cache hits, retrieval document IDs, and tool errors. Sampling strategies must balance debug needs with privacy; never ship raw prompts to shared logs without redaction contracts."
          }
        ]
      },
      {
        "id": "drift-vs-performance-labels-are-late",
        "heading": "Drift vs performance: labels are late",
        "paragraphs": [
          "Concept drift changes the input-output relationship; covariate shift changes input distributions. You often see covariate shift before labels arrive. Use proxy outcomes and human feedback when labels lag. Do not alert on every PSI tick—set thresholds from historical noise and connect to actionable playbooks. Re-training is one response; fixing upstream data bugs is another. Slice metrics catch the failures that global averages will apologize for too late. Slice metrics catch the failures that global averages will apologize for too late.",
          "Hold these points explicitly while you study. Restate each one without looking at the list — recognition is not the interview bar; recall is.",
          "• Separate data bugs from true concept drift.",
          "• Use proxies while waiting for labels.",
          "• Alert only with actionable runbooks.",
          "Production lens — Slice-aware quality beats global averages: Corpus refreshes, embedding upgrades, and UI changes often break one locale, tenant, or intent first. Monitor task-success proxies, faithfulness samples, and guardrail deny rates by slice with volume floors. Tie alerts to actions: roll back index, tighten guardrail, retrain reranker, or degrade to FAQ search.\n\nLabel delay still applies: many outcomes (fraud, long-term retention, ticket reopen) arrive late. Use leading proxies carefully and maintain maturation windows for honest reporting. Champion/challenger and shadow modes remain the safe way to validate retrains when ground truth is slow."
        ],
        "keyTerms": [
          {
            "term": "Separate data bugs from true concept",
            "definition": "Separate data bugs from true concept drift."
          },
          {
            "term": "Use proxies while waiting for labels.",
            "definition": "Use proxies while waiting for labels."
          },
          {
            "term": "Alert only with actionable runbooks.",
            "definition": "Alert only with actionable runbooks."
          }
        ],
        "checkYourself": [
          {
            "prompt": "Knows drift types and label delay tactics.",
            "reveal": "Corpus refreshes, embedding upgrades, and UI changes often break one locale, tenant, or intent first. Monitor task-success proxies, faithfulness samples, and guardrail deny rates by slice with volume floors. Tie alerts to actions: roll back index, tighten guardrail, retrain reranker, or degrade to FAQ search.\n\nLabel delay still applies: many outcomes (fraud, long-term retention, ticket reopen) arrive late. Use leading proxies carefully and maintain maturation windows for honest reporting. Champion/challenger and shadow modes remain the safe way to validate retrains when ground truth is slow."
          }
        ]
      },
      {
        "id": "dashboards-traces-and-ownership",
        "heading": "Dashboards, traces, and ownership",
        "paragraphs": [
          "Dashboards should answer: is the service healthy, is the model healthy, did we change something? Link deploys to charts. Distributed traces connect feature store latency to model latency. Own pages: who gets paged for drift vs 5xx spikes may differ (data science vs platform). Weekly review of top alerts prevents pager fatigue. Deploy annotations turn mysteries into timelines. Deploy annotations turn mysteries into timelines.",
          "Hold these points explicitly while you study. Restate each one without looking at the list — recognition is not the interview bar; recall is.",
          "• Annotate charts with deploys and data changes.",
          "• Clarify on-call ownership by failure class.",
          "• Prune noisy alerts regularly.",
          "Production lens — Alert fatigue is an MLOps design smell: PSI-on-everything paging trains on-call to ignore signals. Tier alerts: schema/null/freshness pages immediately; distribution drift opens tickets with slice context; quality SLO burn pages with owners. For agents, spike detection on tool error rates and loop length catches runaway behavior faster than waiting for CSAT.\n\nClose the loop into eval: sampled failures become golden cases; repeated guardrail denials become red-team tests. Monitoring without a path into the harness and release gates becomes a museum of charts. Mid-2026 interview strength is naming GenAI traces, slice SLIs, and rollback playbooks together."
        ],
        "keyTerms": [
          {
            "term": "Annotate charts with deploys and data",
            "definition": "Annotate charts with deploys and data changes."
          },
          {
            "term": "Clarify on-call ownership by failure class.",
            "definition": "Clarify on-call ownership by failure class."
          },
          {
            "term": "Prune noisy alerts regularly.",
            "definition": "Prune noisy alerts regularly."
          }
        ],
        "checkYourself": [
          {
            "prompt": "Links dashboards to deploys and owners.",
            "reveal": "PSI-on-everything paging trains on-call to ignore signals. Tier alerts: schema/null/freshness pages immediately; distribution drift opens tickets with slice context; quality SLO burn pages with owners. For agents, spike detection on tool error rates and loop length catches runaway behavior faster than waiting for CSAT.\n\nClose the loop into eval: sampled failures become golden cases; repeated guardrail denials become red-team tests. Monitoring without a path into the harness and release gates becomes a museum of charts. Mid-2026 interview strength is naming GenAI traces, slice SLIs, and rollback playbooks together."
          }
        ]
      },
      {
        "id": "feedback-loops-and-closed-loop-ml",
        "heading": "Feedback loops and closed-loop ML",
        "paragraphs": [
          "Captured labels and human corrections should flow back into datasets with lineage. Beware selection bias: only reviewing uncertain cases skews retraining. Design sampling policies for feedback. For bandits/recommenders, logging propensities matters for offline evaluation. Monitoring is incomplete without a path from incident to dataset fix. Proxy labels are imperfect; document their bias when you use them for early detection. Proxy labels are imperfect; document their bias when you use them for early detection.",
          "Hold these points explicitly while you study. Restate each one without looking at the list — recognition is not the interview bar; recall is.",
          "• Close the loop from production to datasets carefully.",
          "• Account for selection bias in human review.",
          "• Log what you need for offline counterfactuals.",
          "Production lens — Four planes: infra, data, GenAI traces, outcomes: Classical ML monitoring watched features, predictions, and delayed labels. LLM apps add prompt/retrieval/tool traces and token economics. A green GPU graph with collapsing citation hit rate is still an incident. Organize dashboards into infra SLOs, data/quality SLIs, GenAI trace red-lanes, and business outcomes—and page only when playbooks exist.\n\nOpenTelemetry GenAI conventions help standardize span names and attributes across vendors and self-hosted stacks. Include model ID, cache hits, retrieval document IDs, and tool errors. Sampling strategies must balance debug needs with privacy; never ship raw prompts to shared logs without redaction contracts."
        ],
        "keyTerms": [
          {
            "term": "Close the loop from production to",
            "definition": "Close the loop from production to datasets carefully."
          },
          {
            "term": "Account for selection bias in human",
            "definition": "Account for selection bias in human review."
          },
          {
            "term": "Log what you need for offline",
            "definition": "Log what you need for offline counterfactuals."
          }
        ],
        "workedExample": {
          "title": "Alert if null rate exceeds baseline",
          "body": "Narrate what each shape and step is doing. If you only recognize the API call, you do not own the idea yet — rewrite the example from memory after one pass.",
          "code": "def null_alert(current_null_rate, baseline, margin=0.05):\n    return current_null_rate > baseline + margin\n\nprint(null_alert(0.12, 0.03), null_alert(0.04, 0.03))",
          "language": "python"
        },
        "checkYourself": [
          {
            "prompt": "Plans feedback capture without severe bias.",
            "reveal": "Explain the idea in two sentences, name one metric or invariant you would watch, and state one mistake juniors make. Then connect it back to feedback loops and closed-loop ml."
          }
        ]
      },
      {
        "id": "incident-response-for-ml-systems",
        "heading": "Incident response for ML systems",
        "paragraphs": [
          "Runbooks: symptoms -> dashboards -> hypotheses (deploy, upstream schema, vendor outage, drift) -> mitigations (rollback model, disable feature, fail open/closed). Postmortems include data versions and model versions. Practice game days. The best monitor is useless without a rehearsed response. Game-day exercises reveal missing dashboards faster than design docs. Game-day exercises reveal missing dashboards faster than design docs.",
          "Hold these points explicitly while you study. Restate each one without looking at the list — recognition is not the interview bar; recall is.",
          "• Write ML-specific incident runbooks.",
          "• Include model/data versions in postmortems.",
          "• Rehearse rollback and disable switches.",
          "Production lens — Slice-aware quality beats global averages: Corpus refreshes, embedding upgrades, and UI changes often break one locale, tenant, or intent first. Monitor task-success proxies, faithfulness samples, and guardrail deny rates by slice with volume floors. Tie alerts to actions: roll back index, tighten guardrail, retrain reranker, or degrade to FAQ search.\n\nLabel delay still applies: many outcomes (fraud, long-term retention, ticket reopen) arrive late. Use leading proxies carefully and maintain maturation windows for honest reporting. Champion/challenger and shadow modes remain the safe way to validate retrains when ground truth is slow."
        ],
        "keyTerms": [
          {
            "term": "Write ML-specific incident runbooks.",
            "definition": "Write ML-specific incident runbooks."
          },
          {
            "term": "Include model/data versions in postmortems.",
            "definition": "Include model/data versions in postmortems."
          },
          {
            "term": "Rehearse rollback and disable switches.",
            "definition": "Rehearse rollback and disable switches."
          }
        ],
        "checkYourself": [
          {
            "prompt": "Has ML incident runbooks.",
            "reveal": "Explain the idea in two sentences, name one metric or invariant you would watch, and state one mistake juniors make. Then connect it back to incident response for ml systems."
          }
        ]
      },
      {
        "id": "llmops-dashboards-vs-classic-ml-drift",
        "heading": "LLMOps dashboards vs classic ML drift",
        "paragraphs": [
          "Tabular model monitoring centers on feature distributions, prediction scores, and delayed labels. LLM applications fail differently: a prompt change, embedder upgrade, or provider model swap can collapse groundedness while every classic drift gauge stays green. Build LLMOps dashboards that track token spend and cache hit rate, latency split by prefill/decode or provider TTFT, retrieval miss rate / recall proxies on canary queries, groundedness or citation validity on sampled traffic, schema-validation failure rate, tool/function error rate, refusal rate, and user friction (reprompts, thumbs-down). Distinguish incident classes: data drift in an upstream ranker versus generative regression from a temperature or alias change. Sampling plans matter—you cannot LLM-judge 100% of traffic; use stratified samples by tenant and query type, plus always-on cheap heuristics (citation regex, JSON parse). Join traces across retrieve → rerank → generate → tools with a single request id. Alert on spend per successful task and on sudden jumps in “answer without citation,” not only on 5xx rates. Classic PSI still matters for embedded classifiers in the same product; keep both panes rather than replacing ML monitoring with chat logs.",
          "Hold these points explicitly while you study. Restate each one without looking at the list — recognition is not the interview bar; recall is.",
          "• Add token cost, groundedness samples, retrieval misses, and tool errors to the core dashboard.",
          "• Separate classic feature/score drift from LLM quality regressions in runbooks.",
          "• Use stratified sampling for expensive judges; keep cheap always-on parsers.",
          "• Alert on spend-per-success and citation failures, not only HTTP errors.",
          "Production lens — Alert fatigue is an MLOps design smell: PSI-on-everything paging trains on-call to ignore signals. Tier alerts: schema/null/freshness pages immediately; distribution drift opens tickets with slice context; quality SLO burn pages with owners. For agents, spike detection on tool error rates and loop length catches runaway behavior faster than waiting for CSAT.\n\nClose the loop into eval: sampled failures become golden cases; repeated guardrail denials become red-team tests. Monitoring without a path into the harness and release gates becomes a museum of charts. Mid-2026 interview strength is naming GenAI traces, slice SLIs, and rollback playbooks together."
        ],
        "keyTerms": [
          {
            "term": "Add token cost, groundedness samples, retrieval",
            "definition": "Add token cost, groundedness samples, retrieval misses, and tool errors to the core dashboard."
          },
          {
            "term": "Separate classic feature/score drift from LLM",
            "definition": "Separate classic feature/score drift from LLM quality regressions in runbooks."
          },
          {
            "term": "Use stratified sampling for expensive judges;",
            "definition": "Use stratified sampling for expensive judges; keep cheap always-on parsers."
          },
          {
            "term": "Alert on spend-per-success and citation failu…",
            "definition": "Alert on spend-per-success and citation failures, not only HTTP errors."
          }
        ],
        "workedExample": {
          "title": "Aggregate a tiny LLMOps metrics table",
          "body": "Narrate what each shape and step is doing. If you only recognize the API call, you do not own the idea yet — rewrite the example from memory after one pass.",
          "code": "import pandas as pd\n\ndf = pd.DataFrame([\n    {'route': 'rag', 'tokens': 1200, 'grounded': 1, 'retrieve_hit': 1, 'tool_err': 0},\n    {'route': 'rag', 'tokens': 1800, 'grounded': 0, 'retrieve_hit': 0, 'tool_err': 0},\n    {'route': 'agent', 'tokens': 4000, 'grounded': 1, 'retrieve_hit': 1, 'tool_err': 1},\n])\nsummary = df.groupby(\"route\").agg(\n    avg_tokens=(\"tokens\", \"mean\"),\n    grounded_rate=(\"grounded\", \"mean\"),\n    retrieve_recall_proxy=(\"retrieve_hit\", \"mean\"),\n    tool_error_rate=(\"tool_err\", \"mean\"),\n)\nprint(summary.round(3))",
          "language": "python"
        },
        "checkYourself": [
          {
            "prompt": "Lists LLMOps metrics beyond HTTP and GPU utilization.",
            "reveal": "Explain the idea in two sentences, name one metric or invariant you would watch, and state one mistake juniors make. Then connect it back to llmops dashboards vs classic ml drift."
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
          "Most interview answers fail not because the definition is wrong, but because the candidate never names how the approach breaks. Use this section as a trap checklist for ml monitoring and observability.",
          "Trap: Only watching infrastructure golden signals. A strong answer preempts it — say what you would monitor, what fallback you would keep, or what simpler baseline you would try first.",
          "Trap: Alerting on noisy drift without actions. A strong answer preempts it — say what you would monitor, what fallback you would keep, or what simpler baseline you would try first.",
          "Trap: No slice metrics. A strong answer preempts it — say what you would monitor, what fallback you would keep, or what simpler baseline you would try first.",
          "Trap: No path from production errors to dataset fixes. A strong answer preempts it — say what you would monitor, what fallback you would keep, or what simpler baseline you would try first.",
          "Trap: Assuming stable PSI means the RAG answers are still faithful. A strong answer preempts it — say what you would monitor, what fallback you would keep, or what simpler baseline you would try first.",
          "Trap: Logging prompts without PII controls. A strong answer preempts it — say what you would monitor, what fallback you would keep, or what simpler baseline you would try first.",
          "Trap: Alerting only on latency while token spend doubles. A strong answer preempts it — say what you would monitor, what fallback you would keep, or what simpler baseline you would try first."
        ],
        "callout": {
          "tone": "warning",
          "body": "If you cannot name a failure mode, you do not yet understand the technique well enough to ship or defend it."
        },
        "checkYourself": [
          {
            "prompt": "Pick the most dangerous pitfall for ML monitoring and observability and explain how you would detect it in production or on a whiteboard.",
            "reveal": "Start with: \"Only watching infrastructure golden signals.\" Then add a detection signal (metric, test, or review question) and a mitigation."
          }
        ]
      },
      {
        "id": "deeper-lens",
        "heading": "A deeper production lens",
        "paragraphs": [
          "Four planes: infra, data, GenAI traces, outcomes. Classical ML monitoring watched features, predictions, and delayed labels. LLM apps add prompt/retrieval/tool traces and token economics. A green GPU graph with collapsing citation hit rate is still an incident. Organize dashboards into infra SLOs, data/quality SLIs, GenAI trace red-lanes, and business outcomes—and page only when playbooks exist.\n\nOpenTelemetry GenAI conventions help standardize span names and attributes across vendors and self-hosted stacks. Include model ID, cache hits, retrieval document IDs, and tool errors. Sampling strategies must balance debug needs with privacy; never ship raw prompts to shared logs without redaction contracts.",
          "Slice-aware quality beats global averages. Corpus refreshes, embedding upgrades, and UI changes often break one locale, tenant, or intent first. Monitor task-success proxies, faithfulness samples, and guardrail deny rates by slice with volume floors. Tie alerts to actions: roll back index, tighten guardrail, retrain reranker, or degrade to FAQ search.\n\nLabel delay still applies: many outcomes (fraud, long-term retention, ticket reopen) arrive late. Use leading proxies carefully and maintain maturation windows for honest reporting. Champion/challenger and shadow modes remain the safe way to validate retrains when ground truth is slow.",
          "Alert fatigue is an MLOps design smell. PSI-on-everything paging trains on-call to ignore signals. Tier alerts: schema/null/freshness pages immediately; distribution drift opens tickets with slice context; quality SLO burn pages with owners. For agents, spike detection on tool error rates and loop length catches runaway behavior faster than waiting for CSAT.\n\nClose the loop into eval: sampled failures become golden cases; repeated guardrail denials become red-team tests. Monitoring without a path into the harness and release gates becomes a museum of charts. Mid-2026 interview strength is naming GenAI traces, slice SLIs, and rollback playbooks together."
        ],
        "keyTerms": [
          {
            "term": "Four planes: infra, data, GenAI traces, outcomes",
            "definition": "Classical ML monitoring watched features, predictions, and delayed labels. LLM apps add prompt/retrieval/tool traces and token economics. A green GPU graph with collapsing citation hit rate is still an incident. Organize…"
          },
          {
            "term": "Slice-aware quality beats global averages",
            "definition": "Corpus refreshes, embedding upgrades, and UI changes often break one locale, tenant, or intent first. Monitor task-success proxies, faithfulness samples, and guardrail deny rates by slice with volume floors. Tie alerts t…"
          },
          {
            "term": "Alert fatigue is an MLOps design smell",
            "definition": "PSI-on-everything paging trains on-call to ignore signals. Tier alerts: schema/null/freshness pages immediately; distribution drift opens tickets with slice context; quality SLO burn pages with owners. For agents, spike …"
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
          "You should now be able to teach ml monitoring and observability as a story: what problem it solves, how the mechanism works, which assumptions it depends on, and how you would know it failed.",
          "Close the loop by writing a 90-second spoken answer out loud. If you freeze on definitions, return to the orientation and the first technical part. If you freeze on trade-offs, return to failure modes.",
          "Practice prompts from this lesson: How would you detect silent fraud-model failure? | What is PSI and when should it page someone? | Design a dashboard for an LLM+RAG feature."
        ],
        "checkYourself": [
          {
            "prompt": "Give a 90-second spoken overview of ML monitoring and observability as if starting an interview answer.",
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
        "Defines data/model/system monitors with slices.",
        "Knows drift types and label delay tactics.",
        "Links dashboards to deploys and owners.",
        "Plans feedback capture without severe bias.",
        "Has ML incident runbooks."
      ],
      "nextSteps": [
        "Return to the lesson page and attempt the practice / topic lab with this chapter still open if needed.",
        "Revisit any Check yourself prompts you could not answer out loud.",
        "Optional deeper reading: OpenTelemetry — Generative AI semantic conventions (OpenTelemetry) — https://opentelemetry.io/docs/specs/semconv/gen-ai/",
        "Optional deeper reading: Evidently AI documentation (Evidently) — https://docs.evidentlyai.com/"
      ]
    }
  }
};
