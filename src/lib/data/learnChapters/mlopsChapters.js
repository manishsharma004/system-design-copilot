const chapters = {
  "mlops-and-deployment/ml-pipeline-design": {
    title: "Chapter: ML pipeline design for production AI",
    readingTime: "65-80 min",
    premise:
      "Modern MLOps pipelines manage more than trained model files. They version data, features, code, prompts, retrieval indexes, evaluation suites, environments, approvals, and deployment aliases. This chapter teaches pipeline design as a set of artifact contracts and promotion gates that make classic ML, LLM applications, and agent systems reproducible enough to operate.",
    parts: [
      {
        id: "pipelines-as-artifact-graphs",
        heading: "Pipelines are artifact graphs, not notebooks with schedules",
        paragraphs: [
          "A production ML pipeline is a directed graph of transformations that produce versioned artifacts. Typical classic stages include ingest, validate, label, feature, train, evaluate, register, deploy, and monitor. LLM application stages add prompt packaging, chunking, embedding, index build, retrieval eval, tool-schema validation, judge calibration, and safety red teams. The graph matters because every promoted system should answer a simple question: which code, data, configuration, environment, and eval evidence produced this behavior?",
          "Artifacts need contracts. A dataset artifact should declare schema, time range, sampling logic, privacy filters, and lineage. A feature artifact should declare transformation version, freshness, join keys, and point-in-time correctness. A model artifact should declare training code, hyperparameters, environment image, metrics, fairness slices, and intended serving runtime. A prompt or agent artifact should declare model alias, tool catalog version, memory policy, retrieval index, and eval suite. Without these contracts, retries and rollbacks become guesswork.",
          "The pipeline should be idempotent. Re-running a stage with the same inputs should either reuse the cached artifact or produce the same artifact identity. This enables backfills, disaster recovery, and audit reproduction. Non-idempotent writes, hidden notebook state, live vendor-console prompt edits, and unpinned dependencies are pipeline smells. They may work during research, but they are not a production release path."
        ],
        keyTerms: [
          {
            term: "artifact graph",
            definition:
              "A dependency graph where each pipeline stage consumes and produces versioned artifacts with explicit contracts."
          },
          {
            term: "lineage",
            definition:
              "Metadata that links a production artifact to the data, code, configuration, environment, and evaluation that produced it."
          },
          {
            term: "idempotent stage",
            definition:
              "A pipeline step that can be retried safely without duplicating side effects or changing results for the same inputs."
          }
        ],
        workedExample: {
          title: "A compact lineage record",
          body:
            "The record is the minimum kind of metadata a registry or artifact store should preserve for later audit.",
          code:
            "lineage = {\n    \"artifact\": \"fraud_model_v42\",\n    \"data_snapshot\": \"transactions_2026_07_01_to_2026_07_14\",\n    \"feature_set\": \"fraud_features_v18\",\n    \"code_sha\": \"9f2c1ab\",\n    \"env_image\": \"ml-train:2026-07-20\",\n    \"eval_report\": \"eval_fraud_v42.json\",\n    \"approved_by\": [\"risk\", \"ml_platform\"],\n}\n\nrequired = [\"data_snapshot\", \"feature_set\", \"code_sha\", \"eval_report\"]\nprint(all(key in lineage for key in required))",
          language: "python"
        },
        checkYourself: [
          {
            prompt:
              "Why is a scheduled notebook not enough to count as a production ML pipeline?",
            reveal:
              "A production pipeline needs explicit artifact contracts, idempotent stages, lineage, validation, promotion gates, and rollback paths. A notebook schedule usually hides state and evidence."
          }
        ]
      },
      {
        id: "data-validation-and-feature-correctness",
        heading: "Data validation and feature correctness are first-class stages",
        paragraphs: [
          "Most ML failures begin before training. Null spikes, duplicated events, shifted category values, delayed labels, broken joins, and upstream backfills can silently change the meaning of a training set. Data validation should run before expensive training and before index builds. It should check schema, ranges, uniqueness, volume, freshness, referential integrity, privacy filters, and known invariants. Validation failures should block promotion or route to owners with clear remediation.",
          "Feature correctness is especially subtle for time-dependent systems. Point-in-time joins prevent the model from seeing future information during training. Offline and online transformations must match or the serving path will compute features the model never learned. Feature stores help by centralizing definitions, but they do not remove ownership questions: who approves a feature change, how freshness is monitored, and how backfills affect historical labels.",
          "LLM and retrieval pipelines have analogous data quality problems. A documentation crawler can ingest stale pages, an embedding job can mix embedder versions, a chunker change can break citations, and a PII scrubber can miss prompt logs. Treat corpus snapshots, chunk metadata, embedding model ids, and index build ids as feature artifacts. Retrieval quality is not separate from MLOps; it is feature engineering for generative systems."
        ],
        keyTerms: [
          {
            term: "point-in-time join",
            definition:
              "A training-set join that only uses feature values available at the prediction time for each example."
          },
          {
            term: "training-serving skew",
            definition:
              "A mismatch between features or transformations used during training and those used during production inference."
          },
          {
            term: "corpus snapshot",
            definition:
              "A versioned capture of documents and metadata used to build a retrieval index."
          }
        ],
        checkYourself: [
          {
            prompt:
              "What is the LLM-app equivalent of a feature-set version in a classic ML pipeline?",
            reveal:
              "A prompt, chunker configuration, embedding model id, corpus snapshot, index build id, tool schema set, and eval bundle together play a similar role as versioned release artifacts."
          }
        ],
        callout: {
          tone: "tip",
          body:
            "If you cannot rebuild the training set or retrieval index from identifiers, you cannot reliably debug production behavior."
        }
      },
      {
        id: "training-evaluation-and-promotion",
        heading: "Training is only one step before gated promotion",
        paragraphs: [
          "Training jobs produce candidates, not production systems. Candidates must pass evaluation gates that reflect product risk: offline metrics, calibration, slice performance, fairness checks, robustness, latency estimates, cost, and compatibility with the target runtime. For LLM apps, gates may include groundedness, retrieval recall proxies, JSON validity, refusal quality, tool-call correctness, red-team attack success, and cost per successful task. Promotion is a decision with evidence, not the final line of a training script.",
          "A model registry or release registry should store more than binaries. It should link artifacts, metrics, approvals, known limitations, owners, model cards or system cards, and deployment aliases. High-risk domains often require human review before a candidate becomes deployable. Lower-risk systems can automate more of the path, but even then the gate policy should be explicit. A silent auto-promotion based on one aggregate score is a common source of regressions.",
          "The evaluation report should be immutable and comparable. If a model improves overall AUC but worsens performance for a protected slice, the report should show the tradeoff. If a prompt reduces hallucination but doubles token spend, the report should show whether the launch gate allows that. The point is not to optimize every metric simultaneously. It is to make tradeoffs visible before they become user-facing surprises."
        ],
        keyTerms: [
          {
            term: "promotion gate",
            definition:
              "A rule or review requirement that a candidate artifact must satisfy before deployment."
          },
          {
            term: "registry",
            definition:
              "A system of record for model or AI application artifacts, metadata, metrics, approvals, and aliases."
          },
          {
            term: "system card",
            definition:
              "Documentation for an AI system, including intended use, components, evaluations, limitations, and operational controls."
          }
        ],
        workedExample: {
          title: "Gate a candidate on multiple dimensions",
          body:
            "A gate can block on safety even when aggregate accuracy improves.",
          code:
            "def gate(report):\n    failures = []\n    if report[\"auc\"] < 0.86:\n        failures.append(\"auc\")\n    if report[\"slice_gap\"] > 0.04:\n        failures.append(\"slice_gap\")\n    if report[\"p95_latency_ms\"] > 120:\n        failures.append(\"latency\")\n    if report[\"critical_redteam_failures\"] != 0:\n        failures.append(\"redteam\")\n    return {\"promote\": not failures, \"failures\": failures}\n\nprint(gate({\"auc\": 0.88, \"slice_gap\": 0.02, \"p95_latency_ms\": 90, \"critical_redteam_failures\": 0}))\nprint(gate({\"auc\": 0.90, \"slice_gap\": 0.07, \"p95_latency_ms\": 80, \"critical_redteam_failures\": 0}))",
          language: "python"
        },
        checkYourself: [
          {
            prompt:
              "Why should a registry entry include approvals and limitations, not only a model file?",
            reveal:
              "Production operation requires evidence: who approved it, what it was evaluated on, where it should not be used, which version is deployed, and how to roll it back."
          }
        ]
      },
      {
        id: "orchestration-and-environments",
        heading: "Orchestration coordinates compute, environments, and ownership",
        paragraphs: [
          "Orchestrators such as Airflow, Kubeflow, Metaflow, Dagster, cloud-native pipeline services, and internal platforms solve scheduling and dependency execution, but the hard work is designing ownership and contracts. Each stage needs an owner, retry policy, resource profile, secret scope, data access boundary, and runbook. Backfills should be planned, not improvised. When a data correction requires rebuilding six months of features and retraining three models, the pipeline design is tested more than the scheduler brand.",
          "Environments must be reproducible. Training images, CUDA versions, Python dependencies, compiler settings, tokenizer versions, and feature code all influence outputs. For LLM systems, prompt templates, tokenizer behavior, model aliases, provider settings, and index builders also belong in configuration. Secrets should come from managed secret stores, never notebooks or artifact metadata. Dev, staging, and production should have different data scopes and credentials so experiments cannot accidentally touch regulated production data.",
          "Pipeline observability includes duration, queue time, retries, failure rate, stale artifact age, validation failures, cost, and owner response. These are platform SLIs, not afterthoughts. If the daily training job fails every third run but the model is still serving yesterday's version, users may not notice immediately; the business will notice when labels drift and retraining cannot catch up. MLOps reliability is software reliability with data-dependent symptoms."
        ],
        keyTerms: [
          {
            term: "backfill",
            definition:
              "A controlled reprocessing of historical data or artifacts after code, data, or logic changes."
          },
          {
            term: "environment image",
            definition:
              "A pinned runtime container or equivalent environment that captures dependencies needed to reproduce a stage."
          },
          {
            term: "pipeline SLI",
            definition:
              "A service-level indicator for pipeline health, such as freshness, duration, retry rate, or validation failure rate."
          }
        ],
        checkYourself: [
          {
            prompt:
              "What makes a pipeline backfill safe instead of risky?",
            reveal:
              "Idempotent stages, versioned artifacts, clear data partitions, controlled credentials, validation gates, cost awareness, and owner runbooks make backfills safe."
          }
        ]
      },
      {
        id: "dual-track-llm-and-classic-ml",
        heading: "Classic ML and LLM application releases need dual-track discipline",
        paragraphs: [
          "Many 2026 products ship both classic ML and LLM components. A fraud system may use gradient-boosted risk models plus an analyst assistant. A support product may use intent classifiers, retrieval, generation, and tool-calling agents. The platform must handle both tracks without pretending they are identical. Classic training pipelines center on data snapshots, features, labels, training, registry, and serving. LLM application pipelines center on prompt bundles, model aliases, retrieval indexes, tools, memory policy, eval suites, traces, and safety controls.",
          "The shared discipline is versioned release candidates. A prompt edit in a vendor console is a production change. An embedding model upgrade without a matching index rebuild is a broken artifact graph. A tool schema change without trajectory evals can alter agent behavior even when the model is unchanged. Conversely, a tabular model retrain without a feature-store update can pass offline metrics but fail online due to skew. Draw the two tracks together during architecture reviews so dependencies are visible.",
          "Promotion and rollback should use aliases. Product code should call stable names such as `fraud-risk-prod`, `support-rag-default`, or `agent-tools-v4`, while deployment control maps those names to concrete artifacts. This keeps rollback as a configuration action, enables canaries, and avoids hard-coded model or prompt ids scattered across clients. Release notes should describe the whole AI behavior bundle, not just one model file."
        ],
        keyTerms: [
          {
            term: "AI behavior bundle",
            definition:
              "The combined versioned set of model, prompt, tools, retrieval, memory, guardrails, and eval artifacts that define runtime behavior."
          },
          {
            term: "deployment alias",
            definition:
              "A stable production identifier that routes traffic to a concrete artifact version and can be flipped for canary or rollback."
          },
          {
            term: "prompt bundle",
            definition:
              "A versioned package of prompts, model parameters, output schemas, and related evaluation metadata."
          }
        ],
        checkYourself: [
          {
            prompt:
              "Why can an embedding model upgrade require a pipeline rebuild even if application code is unchanged?",
            reveal:
              "The retrieval index was built in the old embedding space. Changing the embedder without rebuilding and evaluating the index can break retrieval relevance and citations."
          }
        ]
      },
      {
        id: "pipeline-governance-and-feedback",
        heading: "Pipelines close the loop from production back to evidence",
        paragraphs: [
          "A pipeline does not end at deployment. Monitoring produces drift reports, quality samples, incident traces, user feedback, human labels, and cost data. Those signals should feed new training data, golden evals, prompt tests, feature fixes, and risk reviews. If production failures stay in dashboards and never become artifacts, the platform forgets. A strong MLOps loop turns each meaningful failure into a reproducible case.",
          "Governance evidence should be generated as much as possible by the pipeline. Model cards, data sheets, system cards, eval reports, risk classifications, approval records, and audit logs should reference concrete artifact ids. This reduces last-minute slide assembly and supports regulatory or enterprise reviews. When the pipeline blocks a deploy because a required card or eval report is missing, governance becomes operational rather than ceremonial.",
          "The design goal is predictable change. Teams should be able to answer what changed, why it changed, who approved it, how it was evaluated, what users are exposed, how it is monitored, and how it rolls back. Whether the artifact is a LightGBM model, a reranker, a prompt, an index, or an agent policy, production AI needs the same release discipline. The implementation details differ; the accountability loop does not."
        ],
        keyTerms: [
          {
            term: "feedback loop",
            definition:
              "The process that converts production observations into new data, evals, fixes, and release gates."
          },
          {
            term: "governance evidence",
            definition:
              "Versioned proof such as eval reports, approvals, model cards, risk assessments, and audit logs."
          },
          {
            term: "predictable change",
            definition:
              "A release process where changes are identifiable, evaluated, approved, monitored, and reversible."
          }
        ],
        checkYourself: [
          {
            prompt:
              "What should happen to a production incident trace in a healthy ML pipeline organization?",
            reveal:
              "It should become a reproducible eval or training case, trigger artifact or policy fixes, update monitoring or runbooks, and link to the next release evidence."
          }
        ],
        callout: {
          tone: "interview",
          body:
            "For pipeline design interviews, speak in artifacts, gates, owners, and rollback. That language shows production maturity."
        }
      }
    ],
    wrapUp: {
      takeaways: [
        "Production ML pipelines are artifact graphs with explicit lineage and contracts.",
        "Data validation, point-in-time features, and retrieval index quality are core pipeline stages.",
        "Candidates need promotion gates before registry or deployment.",
        "Orchestration must include reproducible environments, secrets, ownership, and backfill paths.",
        "Classic ML and LLM app releases need dual-track discipline with shared governance evidence."
      ],
      nextSteps: [
        "Draw an artifact graph for a product that combines a classifier, RAG, and an agent.",
        "List the promotion gates for one high-risk and one low-risk AI release.",
        "Define the metadata required to rebuild a model and a retrieval index six months later."
      ]
    }
  },
  "mlops-and-deployment/model-serving": {
    title: "Chapter: Model serving and inference systems",
    readingTime: "65-80 min",
    premise:
      "Model serving turns artifacts into reliable user-facing behavior. This chapter covers online, batch, and streaming inference; schema and alias management; canary and shadow release patterns; GPU and LLM serving mechanics; latency and cost optimization; security; and production SLOs for classic models, LLMs, and AI application gateways.",
    parts: [
      {
        id: "serving-shapes",
        heading: "Choose the serving shape before the serving stack",
        paragraphs: [
          "Serving begins with a product question: how fresh must the prediction be, how quickly must the user see it, and what happens if the system is unavailable? Online inference answers interactive requests under strict latency SLOs. Batch inference scores large datasets on a schedule. Streaming inference reacts to events continuously. An internal churn score used weekly does not need the same path as a fraud decision at checkout or an LLM assistant generating a live answer.",
          "Each serving shape has different failure semantics. Online systems need timeouts, load shedding, fallbacks, and p99 latency control. Batch systems need partition correctness, idempotent outputs, backfill support, and freshness monitoring. Streaming systems need ordering, replay, watermarking, state management, and exactly-once or at-least-once tradeoffs. Forcing every workload into a model microservice creates unnecessary operational cost and can make simple batch jobs brittle.",
          "LLM applications add hybrid serving paths. A single user request may perform auth, retrieval, reranking, prompt assembly, model generation, tool calls, moderation, and logging. Some steps are online; others are precomputed. Chunking and embedding may run as batch pipelines, while retrieval and generation run online. Treat the end-to-end path as the serving system because users experience the whole chain, not the model call alone."
        ],
        keyTerms: [
          {
            term: "online inference",
            definition:
              "Low-latency inference performed in response to interactive requests."
          },
          {
            term: "batch inference",
            definition:
              "Scheduled or ad hoc scoring over many records where immediate response is not required."
          },
          {
            term: "streaming inference",
            definition:
              "Inference triggered by event streams with continuous state and freshness requirements."
          }
        ],
        checkYourself: [
          {
            prompt:
              "Why might batch inference be better than online serving for some ML products?",
            reveal:
              "If freshness and interactivity are not required, batch is often cheaper, simpler, easier to backfill, and easier to validate at large scale."
          }
        ]
      },
      {
        id: "apis-aliases-and-rollout",
        heading: "APIs, aliases, canaries, and shadows control change",
        paragraphs: [
          "Serving APIs need stable schemas. Inputs should be validated, outputs should include model or behavior version, and errors should be structured. Model artifacts and API schemas can evolve independently, but clients need compatibility rules. Additive fields are easier than renames. For LLM systems, output schemas may include JSON contracts, citation objects, tool-call envelopes, refusal metadata, or safety categories. Schema validation protects both users and downstream automation.",
          "Deployment aliases decouple product code from concrete artifacts. Clients call `ranker-prod` or `chat-default`, while the serving layer maps that alias to a model, prompt bundle, index, or gateway route. Canary releases send a small traffic slice to a candidate. Shadow deployments run the candidate on live traffic without affecting users. Champion/challenger patterns compare a stable system against a new one over time. Rollback should be an alias flip or config change, not a rebuild.",
          "Canaries must compare more than accuracy. Watch latency, error rate, calibration, slice metrics, refusal rate, citation quality, tool errors, token spend, and downstream business outcomes. A candidate that improves relevance but doubles p99 latency may still fail. A prompt that lowers hallucination by refusing too much may increase human escalations. Release decisions should use predefined guardrails so teams do not rationalize regressions after seeing a favorite metric improve."
        ],
        keyTerms: [
          {
            term: "shadow deployment",
            definition:
              "A candidate system receives copies of live requests for measurement but does not affect user outcomes."
          },
          {
            term: "canary release",
            definition:
              "A controlled rollout where a small share of traffic uses a candidate before broader promotion."
          },
          {
            term: "serving alias",
            definition:
              "A stable route name that maps to concrete model or AI application artifact versions."
          }
        ],
        workedExample: {
          title: "Stable alias with weighted canary",
          body:
            "A production router can shift traffic without changing client code.",
          code:
            "def route(request_id, canary_percent):\n    bucket = hash(request_id) % 100\n    return \"candidate_v7\" if bucket < canary_percent else \"stable_v6\"\n\ncounts = {\"stable_v6\": 0, \"candidate_v7\": 0}\nfor i in range(1000):\n    counts[route(f\"req-{i}\", 5)] += 1\nprint(counts)",
          language: "python"
        },
        checkYourself: [
          {
            prompt:
              "Why should clients call a stable model alias rather than a concrete model id?",
            reveal:
              "Aliases allow canary, rollback, vendor migration, and capacity routing without changing every client or redeploying product code."
          }
        ]
      },
      {
        id: "latency-throughput-and-cost",
        heading: "Serving economics are latency, throughput, quality, and cost together",
        paragraphs: [
          "A model server's p99 latency includes more than inference math. Authentication, request parsing, feature lookup, retrieval, serialization, queueing, batching, network hops, post-processing, logging, and safety filters all contribute. Optimizing the GPU kernel while feature lookup dominates p99 is wasted effort. Teams should create a latency budget that allocates time across the end-to-end path and trace each segment.",
          "Batching improves throughput but can hurt tail latency. Dynamic batching waits briefly to group requests. Continuous batching for LLMs keeps GPUs full while sequences enter and leave at different lengths. Caching helps repeated embeddings, repeated retrieval prefixes, common prompts, and deterministic feature vectors. Quantization, pruning, distillation, compilation, and hardware-specific formats reduce cost, but each needs quality gates. A faster model that silently worsens a protected slice is not an improvement.",
          "Cost should be measured per useful outcome. For classic models, cost may be CPU, memory, feature-store reads, and network egress. For LLMs, cost includes prompt tokens, output tokens, context length, cache hit rate, tool calls, retrieval, and sometimes GPU reservation. Long contexts can make time-to-first-token and KV-cache memory explode. Teams that only monitor requests per second miss the economics that decide whether a feature can scale."
        ],
        keyTerms: [
          {
            term: "latency budget",
            definition:
              "A planned allocation of end-to-end response time across preprocessing, inference, post-processing, and network segments."
          },
          {
            term: "dynamic batching",
            definition:
              "Grouping requests over a short window to improve throughput while managing added latency."
          },
          {
            term: "cost per useful outcome",
            definition:
              "Serving cost normalized by successful user or business task rather than raw request count."
          }
        ],
        checkYourself: [
          {
            prompt:
              "Why is average latency a weak serving metric?",
            reveal:
              "Users experience tail latency, and averages hide queueing, cold starts, long-context requests, and slow dependencies. p95/p99 and segment traces are more actionable."
          }
        ],
        callout: {
          tone: "tip",
          body:
            "For serving design, always ask which part of the path owns p99 before prescribing optimization techniques."
        }
      },
      {
        id: "llm-serving-mechanics",
        heading: "LLM serving is shaped by prefill, decode, and KV cache",
        paragraphs: [
          "LLM serving differs from ordinary stateless inference. Prefill processes the prompt and builds the key-value cache; decode generates one token at a time while reading and extending that cache. Time-to-first-token is dominated by prompt processing and queueing, while tokens per second reflects decode efficiency. Long prompts, long outputs, and high concurrency compete for memory because KV cache grows with layers, sequence length, hidden dimensions, and batch size.",
          "Open-weight serving engines use techniques such as paged attention, continuous batching, prefix caching, speculative decoding, tensor parallelism, and quantization to improve utilization. Managed API providers hide some details but not the product tradeoffs: context length, output length, streaming behavior, rate limits, vendor latency, region, data retention, and cost still matter. Many organizations use gateways to normalize API shapes, apply auth, enforce quotas, route by alias, and compare managed and self-hosted models.",
          "Capacity planning should use LLM-specific metrics: queue time, time-to-first-token, output tokens per second, prompt tokens, completion tokens, context length distribution, KV-cache utilization, cache hit rate, GPU memory pressure, out-of-memory kills, and rate-limit retries. Generic GPU utilization can look healthy while users wait because decode is serialized or the queue is full of long-context requests. Serving teams need workload-aware dashboards."
        ],
        keyTerms: [
          {
            term: "prefill",
            definition:
              "The LLM serving phase that processes input tokens and initializes the KV cache before output generation."
          },
          {
            term: "decode",
            definition:
              "The token-by-token generation phase that extends the sequence using the KV cache."
          },
          {
            term: "KV cache",
            definition:
              "Stored key and value tensors used by transformer attention to avoid recomputing previous context during generation."
          }
        ],
        workedExample: {
          title: "Estimate KV-cache memory pressure",
          body:
            "This simplified estimate shows why long context and concurrency fight for GPU memory.",
          code:
            "def kv_cache_gib(layers, heads, head_dim, seq_len, batch, bytes_per_value=2):\n    elements = 2 * layers * heads * head_dim * seq_len * batch\n    return elements * bytes_per_value / (1024 ** 3)\n\nfor seq in [4096, 16384, 65536]:\n    print(seq, round(kv_cache_gib(32, 32, 128, seq, batch=8), 2), \"GiB\")",
          language: "python"
        },
        checkYourself: [
          {
            prompt:
              "Why should LLM dashboards separate time-to-first-token from tokens per second?",
            reveal:
              "They reflect different bottlenecks. TTFT is affected by prefill, queueing, and prompt length; tokens per second reflects decode throughput and generation efficiency."
          }
        ]
      },
      {
        id: "security-privacy-and-multitenancy",
        heading: "Security, privacy, and multitenancy are serving concerns",
        paragraphs: [
          "Model serving sits on sensitive boundaries. Requests may include PII, regulated features, customer documents, code, secrets, or tenant identifiers. Serving layers should authenticate callers, authorize tenants and feature access, redact or minimize logs, encrypt in transit, enforce retention, and isolate credentials. For LLM gateways, prompts, retrieved context, tool observations, and generated outputs all need data-handling rules. A prompt log can be as sensitive as an application database row.",
          "Multitenancy affects memory, caching, and retrieval. A shared embedding cache must not leak tenant data. A retrieval index may need per-tenant partitions or regional storage. A model server hosting multiple customers needs rate limits and noisy-neighbor protection. If a product promises data residency, routing must keep inference, logs, indexes, and support traces in approved regions. Security review should include the full serving path, not only the model container.",
          "Supply chain matters as well. Hosted models require vendor diligence around training-data use, retention, subprocessors, uptime, incident notification, and evaluation rights. Open-weight models shift responsibilities to the operator: model provenance, license terms, vulnerability scanning, fine-tune data controls, and abuse monitoring. Neither option removes the need for application-level guardrails and monitoring. The serving architecture implements those obligations."
        ],
        keyTerms: [
          {
            term: "tenant isolation",
            definition:
              "Controls that prevent data, cache entries, credentials, and logs from crossing customer or organizational boundaries."
          },
          {
            term: "data residency",
            definition:
              "Requirements that data processing and storage remain within approved geographic or legal regions."
          },
          {
            term: "LLM gateway",
            definition:
              "A serving layer that normalizes access to one or more model providers while enforcing auth, routing, policy, and observability."
          }
        ],
        checkYourself: [
          {
            prompt:
              "Why can model-serving logs create privacy risk even when the model itself is secure?",
            reveal:
              "Logs may contain raw prompts, features, retrieved documents, tool outputs, PII, secrets, or tenant identifiers. Retention and access controls must cover them."
          }
        ]
      },
      {
        id: "slo-operations-and-fallbacks",
        heading: "SLOs, fallbacks, and runbooks keep inference dependable",
        paragraphs: [
          "Serving SLOs should cover availability, latency, correctness proxies, cost, and safety. For a ranking model, p99 latency and click-quality proxies may matter. For fraud scoring, fail-open versus fail-closed policy is critical. For LLM assistants, groundedness samples, refusal quality, token spend, citation failures, and tool errors may join ordinary 5xx metrics. Each SLO needs an owner and a runbook; alerts without action become dashboard decoration.",
          "Fallbacks should be designed before incidents. Options include cached scores, previous model version, rules-based baseline, simpler model, retrieval-only response, human handoff, read-only agent mode, provider failover, or feature disablement. The right fallback depends on harm. A medical triage model may fail closed to human review; a recommendation carousel may fall back to popularity. A support assistant may stop generating and show a knowledge-base search result when grounding is weak.",
          "Operational maturity shows up during rollback. Teams should know how to flip aliases, drain traffic, clear bad cache entries, disable a tool, reduce context length, change rate limits, or shift between providers. Post-incident reviews should add serving tests and monitoring, not only blame capacity. Inference is a live service, and model quality is only one component of its reliability."
        ],
        keyTerms: [
          {
            term: "fail open",
            definition:
              "A fallback posture that allows the user or transaction to proceed when the model is unavailable or uncertain."
          },
          {
            term: "fail closed",
            definition:
              "A fallback posture that blocks, delays, or routes to review when the model is unavailable or uncertain."
          },
          {
            term: "provider failover",
            definition:
              "Routing requests from one model provider or serving cluster to another during outages or capacity events."
          }
        ],
        checkYourself: [
          {
            prompt:
              "How do you choose between fail-open and fail-closed behavior?",
            reveal:
              "Choose based on harm. Low-risk UX features may fail open or degrade; safety, financial, legal, or security decisions often fail closed or route to human review."
          }
        ],
        callout: {
          tone: "interview",
          body:
            "A serving design answer is incomplete until it includes canary, rollback, SLOs, and fallback behavior."
        }
      }
    ],
    wrapUp: {
      takeaways: [
        "Serving shape should match product freshness, latency, and failure semantics.",
        "Stable schemas, aliases, canaries, and shadows make model changes controllable.",
        "Latency, throughput, quality, and cost must be optimized together across the full path.",
        "LLM serving capacity is shaped by prefill, decode, KV cache, context length, and gateway routing.",
        "Security, privacy, SLOs, fallbacks, and runbooks are core inference responsibilities."
      ],
      nextSteps: [
        "Create a latency budget for a RAG request from auth through generation.",
        "Define canary metrics for a model alias flip.",
        "Write fallback behavior for three products: recommendations, fraud scoring, and an LLM assistant."
      ]
    }
  },
  "mlops-and-deployment/monitoring-and-observability": {
    title: "Chapter: Monitoring and observability for AI systems",
    readingTime: "65-80 min",
    premise:
      "AI monitoring combines service health, data quality, model quality, GenAI traces, business outcomes, fairness slices, cost, and governance signals. This chapter teaches how production teams detect drift, label delay, retrieval failures, agent loops, prompt regressions, and serving incidents while converting observations back into evals and release controls.",
    parts: [
      {
        id: "four-monitoring-planes",
        heading: "Monitor four planes: infrastructure, data, behavior, and outcomes",
        paragraphs: [
          "Classic service monitoring asks whether the system is up, fast, and error-free. AI systems require more planes. Infrastructure signals cover latency, saturation, errors, queue depth, GPU memory, and cost. Data signals cover schema, nulls, freshness, ranges, categories, feature distributions, corpus changes, and index build health. Behavior signals cover predictions, scores, explanations, prompts, retrieval, tool calls, refusals, guardrails, and traces. Outcome signals cover user success, delayed labels, human overrides, complaints, revenue, safety events, and fairness slices.",
          "A dashboard that shows green GPUs and low HTTP errors can still hide a broken AI product. A retrieval index might stop finding policy documents, a prompt change might increase unsupported claims, a feature pipeline might swap units, or an agent might loop through tools while eventually returning a polite apology. Observability should connect the user request to the data, model, retrieval, tool, and output path so responders can see where quality changed.",
          "The four-plane framing also reduces alert noise. Not every distribution shift should page someone at 3 a.m. Schema breaks, missing partitions, runaway spend, and high-severity policy escapes may page immediately. Mild drift may open a ticket with slice context. Outcome regressions may require a product and data-science review once labels mature. Monitoring is useful when each signal has an owner and a next action."
        ],
        keyTerms: [
          {
            term: "behavior signal",
            definition:
              "A measurement of model or AI application behavior, such as score distribution, citation quality, refusal rate, or tool errors."
          },
          {
            term: "outcome signal",
            definition:
              "A downstream product or user result, such as conversion, fraud loss, resolution rate, complaint rate, or delayed label quality."
          },
          {
            term: "alert actionability",
            definition:
              "The property that an alert has a clear owner, severity, and runbook response."
          }
        ],
        checkYourself: [
          {
            prompt:
              "Why are infrastructure golden signals insufficient for AI monitoring?",
            reveal:
              "They show whether the service is technically healthy, but not whether data, predictions, retrieval, generation, fairness, cost, or user outcomes are correct."
          }
        ]
      },
      {
        id: "drift-label-delay-and-slices",
        heading: "Drift, label delay, and slices make quality measurement hard",
        paragraphs: [
          "Covariate drift means input distributions change. Concept drift means the relationship between inputs and labels changes. Prior probability shift means class balance changes. In production, labels often arrive late: fraud chargebacks, loan defaults, customer churn, long-term retention, and medical outcomes may take days or months. Teams must use leading proxies carefully while maintaining mature reporting windows that reflect true labels.",
          "Slice monitoring prevents averages from hiding harm. A global AUC, groundedness rate, or latency metric can look stable while one locale, device, tenant, protected group, product category, or intent breaks. Each slice needs volume floors and confidence intervals so noise does not become alert fatigue. For fairness-sensitive systems, disaggregated performance and error types should connect to governance review, not only dashboards.",
          "Drift is not always a reason to retrain. It may indicate an upstream data bug, product launch, seasonality, abuse pattern, label-policy change, or monitoring instrumentation issue. The runbook should ask: did inputs change, did outputs change, did outcomes change, did a deploy happen, and which slices moved? Retraining on broken data can lock the failure into the next model. Observability is diagnosis before automation."
        ],
        keyTerms: [
          {
            term: "covariate drift",
            definition:
              "A change in input feature distribution between training or baseline data and production traffic."
          },
          {
            term: "concept drift",
            definition:
              "A change in the relationship between inputs and the target outcome."
          },
          {
            term: "slice metric",
            definition:
              "A metric computed for a subgroup, tenant, locale, intent, device, or other segment rather than only globally."
          }
        ],
        workedExample: {
          title: "Simple population stability score",
          body:
            "This toy PSI-like score is a drift screen, not an automatic retraining trigger.",
          code:
            "import math\n\ndef psi(expected, actual, eps=1e-6):\n    total_e = sum(expected) + eps\n    total_a = sum(actual) + eps\n    score = 0.0\n    for e, a in zip(expected, actual):\n        ep = e / total_e\n        ap = a / total_a\n        score += (ap - ep) * math.log((ap + eps) / (ep + eps))\n    return score\n\nprint(round(psi([20, 30, 50], [10, 25, 65]), 4))",
          language: "python"
        },
        checkYourself: [
          {
            prompt:
              "Why should drift alerts not automatically trigger retraining?",
            reveal:
              "Drift can come from data bugs, product changes, seasonality, abuse, or label shifts. Retraining before diagnosis can preserve or amplify the problem."
          }
        ]
      },
      {
        id: "genai-traces-and-evals",
        heading: "GenAI observability needs traces that feed evals",
        paragraphs: [
          "LLM applications need request traces across retrieve, rerank, prompt assembly, model call, tool call, guardrail, and response. Useful attributes include model id, prompt version, temperature, token counts, context length, retrieved document ids, citation ids, cache hits, tool names, validation failures, refusal category, latency segments, cost estimate, and user feedback. OpenTelemetry GenAI semantic conventions and vendor tooling have made span naming more consistent, but the key is complete causality from input to output.",
          "Quality metrics depend on the application. RAG systems monitor retrieval recall proxies, citation precision, answer-without-citation rate, groundedness samples, stale-document hits, and chunk coverage. Agent systems monitor tool error rate, loop length, approval blocks, policy escapes, memory writes, and cost per successful task. Structured-output systems monitor JSON validity, schema repair attempts, and downstream rejection. A single `LLM quality` score is less useful than task-specific failure categories.",
          "Traces should generate eval data. Sampled bad answers become golden prompts. Failed citations become retrieval cases. Tool validation failures become contract fixtures. Guardrail denials become red-team cases. Human corrections become labeled examples with bias-aware sampling. The goal is not to store everything forever; it is to retain enough redacted, governed evidence to improve the release harness."
        ],
        keyTerms: [
          {
            term: "GenAI trace",
            definition:
              "A structured request trace across prompts, retrieval, generation, tools, guardrails, costs, and outputs."
          },
          {
            term: "groundedness",
            definition:
              "The degree to which an answer is supported by supplied evidence or approved sources."
          },
          {
            term: "eval seed",
            definition:
              "A production observation converted into a repeatable offline evaluation case."
          }
        ],
        checkYourself: [
          {
            prompt:
              "Name four LLM application metrics beyond HTTP errors and GPU utilization.",
            reveal:
              "Examples include token spend, groundedness, citation precision, retrieval miss rate, JSON validity, refusal rate, tool error rate, loop length, and cost per successful task."
          }
        ],
        callout: {
          tone: "tip",
          body:
            "If a production trace cannot become an eval case, it probably lacks the metadata needed for learning."
        }
      },
      {
        id: "feedback-and-human-review",
        heading: "Feedback loops need sampling discipline",
        paragraphs: [
          "Human review and user feedback are valuable but biased. Users who click thumbs-down are not a random sample. Review queues often overrepresent uncertain, high-value, or escalated cases. Support agents may correct only the most visible errors. If teams train or evaluate directly on this feedback without documenting sampling, they can overfit to the review process rather than the population. Monitoring should track how feedback was collected, not just what it says.",
          "Sampling plans should balance cost, privacy, and coverage. Stratify by traffic slice, intent, model version, risk tier, geography, tenant, and confidence. Oversample rare high-severity events, but maintain a baseline random sample for trend estimation. For LLM judges or human graders, measure inter-rater agreement, calibrate rubrics, and periodically audit judge drift. Expensive review should focus where cheap heuristics indicate risk, while still preserving unbiased trend data.",
          "Closed-loop learning also needs safeguards. Feedback that enters training, prompt edits, retrieval curation, or memory must carry provenance and consent. A user complaint can indicate a policy mismatch, a data error, a model problem, or a UX issue. The loop should route different findings to different owners: data engineering for upstream breaks, product for unclear policy, ML for model regression, trust and safety for harm patterns, and platform for trace or serving issues."
        ],
        keyTerms: [
          {
            term: "sampling bias",
            definition:
              "Distortion caused when reviewed or labeled examples do not represent the population the metric claims to measure."
          },
          {
            term: "inter-rater agreement",
            definition:
              "A measure of how consistently different human reviewers apply the same rubric."
          },
          {
            term: "judge drift",
            definition:
              "A change over time in how an automated or human judge applies evaluation criteria."
          }
        ],
        workedExample: {
          title: "Stratified sample plan sketch",
          body:
            "The plan reserves baseline coverage while oversampling high-risk traffic.",
          code:
            "traffic = {\n    \"billing\": 50000,\n    \"security\": 8000,\n    \"medical\": 1200,\n    \"general\": 200000,\n}\n\nsample = {}\nfor intent, volume in traffic.items():\n    base = max(30, int(volume * 0.001))\n    if intent in {\"security\", \"medical\"}:\n        base *= 3\n    sample[intent] = base\nprint(sample)",
          language: "python"
        },
        checkYourself: [
          {
            prompt:
              "Why can a human-review dataset mislead a monitoring program?",
            reveal:
              "It may overrepresent escalations, uncertain cases, specific users, or visible failures. Without sampling metadata, metrics may not represent live traffic."
          }
        ]
      },
      {
        id: "alerting-runbooks-and-incidents",
        heading: "Alerts need runbooks, ownership, and rollback choices",
        paragraphs: [
          "Alert design is part of MLOps design. Page on signals that require immediate action, such as missing data partitions, schema breaks, runaway token spend, serving unavailability, critical policy escapes, or a high-risk model alias misroute. Ticket lower-severity drift with slice evidence and suggested diagnosis. Review trend dashboards for slow quality decay. A page that has no owner or no action trains responders to ignore the next page.",
          "Runbooks should start with symptoms and lead to hypotheses. Did a deploy happen? Did upstream data change? Did a vendor model alias move? Did retrieval corpus freshness drop? Did a region fail? Did a guardrail begin blocking a new legitimate pattern? Did labels mature differently across slices? Mitigations include rollback, freeze training, rebuild index, disable a tool, switch provider, fail to rules, lower max context, or route to humans. The runbook should name who can make each decision.",
          "Postmortems for AI incidents require artifact ids. Include model version, prompt bundle, index build, feature set, data snapshot, serving alias, guardrail version, trace ids, and affected slices. The corrective action should add a test, a monitor, a data validation, a runbook step, or a release gate. Otherwise the same class of failure will return under a new model version."
        ],
        keyTerms: [
          {
            term: "AI incident",
            definition:
              "A production failure involving model behavior, data quality, AI system safety, cost, or serving reliability."
          },
          {
            term: "artifact id",
            definition:
              "A stable identifier for a versioned model, prompt, index, dataset, feature set, guardrail, or eval report."
          },
          {
            term: "rollback choice",
            definition:
              "A predefined mitigation such as alias flip, feature disablement, rules fallback, or human handoff."
          }
        ],
        checkYourself: [
          {
            prompt:
              "What artifact identifiers belong in an AI incident postmortem?",
            reveal:
              "Include model, prompt, index, feature set, data snapshot, serving alias, guardrail, eval report, and relevant trace ids."
          }
        ]
      },
      {
        id: "governance-fairness-and-cost-observability",
        heading: "Monitoring also serves governance, fairness, and unit economics",
        paragraphs: [
          "Governance needs ongoing evidence, not only pre-launch review. High-risk systems should monitor performance by relevant groups, data quality, human override rates, complaint categories, transparency notices, audit-log completeness, and incident response times. Fairness at launch can decay after product expansion, market shifts, or feedback loops. Monitoring should connect slice regressions to escalation paths and model cards or system cards.",
          "Cost monitoring is not a finance afterthought. LLM and agent systems can regress economically without obvious quality drops: longer prompts, larger context windows, lower cache hit rates, repeated tool calls, provider price changes, or retries during partial outages. Track token spend, GPU hours, cost per successful task, cost by tenant, and spend anomalies. Tie budgets to product value so teams can decide whether to optimize, downgrade, cache, batch, or remove a feature.",
          "The strongest observability programs make dashboards part of release governance. A candidate is not ready if the team cannot monitor its known risks. A launch review should ask which metrics prove the system is healthy, which alerts page whom, which slices are reviewed, which traces are retained, which privacy filters protect logs, and how production failures become evals. Monitoring is the operating memory of the AI organization."
        ],
        keyTerms: [
          {
            term: "audit-log completeness",
            definition:
              "The share of required actions or decisions that produce complete traceable records."
          },
          {
            term: "spend anomaly",
            definition:
              "An unexpected increase in cost due to traffic, token usage, retries, provider changes, or inefficient behavior."
          },
          {
            term: "release observability",
            definition:
              "The requirement that a system's known risks can be measured and responded to before launch."
          }
        ],
        checkYourself: [
          {
            prompt:
              "How can an LLM feature have a production incident with no accuracy drop?",
            reveal:
              "It can suffer runaway token spend, tool loops, privacy logging violations, citation failures, high refusal rates, tenant-specific regressions, or governance evidence gaps."
          }
        ],
        callout: {
          tone: "interview",
          body:
            "A complete monitoring answer names signals, slices, owners, runbooks, and how failures become future evals."
        }
      }
    ],
    wrapUp: {
      takeaways: [
        "AI observability spans infrastructure, data, behavior, and outcomes.",
        "Drift requires diagnosis across labels, slices, product changes, and upstream data before retraining.",
        "GenAI traces should connect retrieval, prompts, tools, guardrails, cost, and outputs.",
        "Feedback loops need sampling discipline and ownership routing.",
        "Monitoring supports incident response, governance, fairness, and unit economics."
      ],
      nextSteps: [
        "Design a four-plane dashboard for a RAG support assistant.",
        "Write an alert runbook for a sudden groundedness drop in one locale.",
        "Choose five production failures and describe how each becomes an eval case."
      ]
    }
  }
};

/** @type {Record<string, import('../learnChapters.js').LessonLearnChapter>} */
export const mlopsChapters = JSON.parse(JSON.stringify(chapters));
