const chapters = {
  "ai-safety-and-ethics/bias-and-fairness": {
    title: "Chapter: Bias, fairness, and production accountability",
    readingTime: "65-80 min",
    premise:
      "Fairness is a production practice: define harms, inspect data and labels, choose metrics aligned with the decision, evaluate slices with uncertainty, mitigate across the lifecycle, monitor after launch, and connect findings to governance. This chapter treats bias work as engineering evidence and organizational responsibility rather than a one-time metric checkbox.",
    parts: [
      {
        id: "start-from-harms",
        heading: "Start with harms, stakeholders, and decision context",
        paragraphs: [
          "Bias work begins before metric selection. The team must identify who is affected, what decision the system informs, which errors are costly, who can contest the outcome, and how the model changes human process. A hiring screener, credit model, fraud detector, medical triage assistant, and content recommender all raise different fairness questions. The same false positive can be an inconvenience in one domain and a serious rights-impacting harm in another.",
          "Stakeholder mapping should include people directly scored by the model, people indirectly affected, operators who rely on the output, and groups represented poorly in historical data. It should also define intended use and out-of-scope use. A model trained to prioritize support tickets should not quietly become an employee performance score. Many fairness failures are scope failures: a system built for one context becomes persuasive in another where its assumptions no longer hold.",
          "This framing matters in 2026 because governance programs increasingly require risk classification, impact assessment, and evidence that mitigations match actual harms. Engineers do not need to become lawyers, but they do need to translate product risks into measurable requirements. A launch gate that says `equalized odds gap under 5 percentage points for approved slices` is more useful than a slide saying `we care about fairness`."
        ],
        keyTerms: [
          {
            term: "harm mapping",
            definition:
              "A process for identifying affected stakeholders, possible errors, severity, recourse, and misuse scenarios before choosing metrics."
          },
          {
            term: "intended use",
            definition:
              "The documented context, population, and decision support role for which a model or AI system was designed."
          },
          {
            term: "impact assessment",
            definition:
              "A structured review of risks, affected groups, mitigations, residual risks, and operational controls."
          }
        ],
        checkYourself: [
          {
            prompt:
              "Why should fairness work start with harm mapping rather than a metric library?",
            reveal:
              "Different decisions create different harms. The metric should reflect the error type and stakeholder impact that matter in the actual product context."
          }
        ],
        callout: {
          tone: "interview",
          body:
            "In interviews, do not start by naming a fairness metric. Start by naming the decision, affected groups, error costs, and recourse."
        }
      },
      {
        id: "where-bias-enters",
        heading: "Bias enters through data, labels, features, and feedback loops",
        paragraphs: [
          "Historical labels often encode historical decisions rather than objective truth. If prior loan approvals reflected discrimination, a model trained on approvals may learn the old process. If police stops were concentrated in certain neighborhoods, a crime-risk model may confuse enforcement patterns with crime patterns. If support tickets from some languages are under-labeled, a classifier may appear accurate globally while failing those users. Data provenance is fairness evidence.",
          "Feature availability can also create bias. Some groups may have thinner credit files, less device metadata, different language patterns, or lower representation in training corpora. Proxy variables such as ZIP code, school, employment history, browsing behavior, or language can reintroduce protected attributes even when those attributes are removed. Removing sensitive fields can make measurement harder without removing disparate impact. The team needs lawful, privacy-aware ways to evaluate slices, including missingness.",
          "Deployment can amplify disparities through feedback loops. A recommender that shows fewer opportunities to a group gets less engagement data from that group, which justifies showing even fewer opportunities later. A fraud model that sends one population to manual review more often may create more labels for that group and fewer for others. Monitoring must look for these loops after launch because a fair offline model can become unfair under product dynamics."
        ],
        keyTerms: [
          {
            term: "historical bias",
            definition:
              "Bias inherited from past decisions, institutions, or measurement practices reflected in training labels or features."
          },
          {
            term: "proxy variable",
            definition:
              "A feature that is not itself protected but correlates with protected status and can reproduce disparate effects."
          },
          {
            term: "feedback loop",
            definition:
              "A cycle where model decisions influence future data collection, which then reinforces the model's behavior."
          }
        ],
        workedExample: {
          title: "Compare group error rates",
          body:
            "This tiny example separates false-positive and false-negative rates because different harms attach to each error.",
          code:
            "def rates(rows, group):\n    subset = [r for r in rows if r[\"group\"] == group]\n    negatives = [r for r in subset if r[\"y\"] == 0]\n    positives = [r for r in subset if r[\"y\"] == 1]\n    fpr = sum(r[\"pred\"] == 1 for r in negatives) / max(len(negatives), 1)\n    fnr = sum(r[\"pred\"] == 0 for r in positives) / max(len(positives), 1)\n    return {\"fpr\": fpr, \"fnr\": fnr, \"n\": len(subset)}\n\nrows = [\n    {\"group\": \"A\", \"y\": 1, \"pred\": 1}, {\"group\": \"A\", \"y\": 0, \"pred\": 1},\n    {\"group\": \"B\", \"y\": 1, \"pred\": 0}, {\"group\": \"B\", \"y\": 0, \"pred\": 0},\n]\nprint(rates(rows, \"A\"), rates(rows, \"B\"))",
          language: "python"
        },
        checkYourself: [
          {
            prompt:
              "Why does removing protected attributes not automatically remove bias?",
            reveal:
              "Other variables can act as proxies, historical labels can encode past discrimination, and removing attributes can prevent measurement of disparate impact."
          }
        ]
      },
      {
        id: "fairness-metrics-tradeoffs",
        heading: "Fairness metrics encode tradeoffs",
        paragraphs: [
          "Fairness metrics represent different definitions of parity. Demographic parity asks whether positive outcomes occur at similar rates across groups. Equal opportunity compares true-positive rates. Equalized odds compares both true-positive and false-positive rates. Calibration asks whether a score means the same risk level across groups. Predictive parity compares positive predictive value. These metrics can conflict, especially when base rates differ. There is rarely a single mathematically perfect answer.",
          "Choosing a metric is therefore a product, ethical, legal, and domain decision. In hiring, false negatives may deny opportunity; in fraud, false positives may block legitimate access; in medical triage, false negatives may delay care. A metric that equalizes one error can worsen another. The team should document why the chosen criterion matches the harm model, what tradeoffs remain, and who approved the residual risk.",
          "Uncertainty matters. Small slices can produce volatile metrics, and intersectional slices can become sparse quickly. Report confidence intervals or volume floors instead of pretending every subgroup estimate is equally stable. If a slice is too small for reliable automated metrics, combine quantitative monitoring with qualitative review, targeted data collection, or human oversight. Fairness analysis should be honest about what is known and unknown."
        ],
        keyTerms: [
          {
            term: "demographic parity",
            definition:
              "A criterion comparing positive prediction or decision rates across groups, regardless of true outcome labels."
          },
          {
            term: "equalized odds",
            definition:
              "A criterion comparing true-positive and false-positive rates across groups."
          },
          {
            term: "calibration",
            definition:
              "A property where predicted scores correspond to observed outcome frequencies, often checked within groups."
          }
        ],
        checkYourself: [
          {
            prompt:
              "Why can two reasonable fairness metrics disagree?",
            reveal:
              "They encode different goals, and with different base rates it is often impossible to satisfy calibration, parity of outcomes, and parity of errors simultaneously."
          }
        ],
        callout: {
          tone: "warning",
          body:
            "A metric choice without a documented harm model is a hidden policy decision."
        }
      },
      {
        id: "mitigation-options",
        heading: "Mitigation can happen before, during, or after modeling",
        paragraphs: [
          "Pre-processing mitigations improve data before training. They include better sampling, label audits, measurement repair, reweighting, balancing, removing or transforming problematic features, and collecting more data for underrepresented contexts. These are often the most durable fixes because they address the source of failure. They are also the slowest when the organization must change data collection or labeling operations.",
          "In-processing mitigations change training. They include fairness constraints, adversarial debiasing, multi-objective optimization, calibrated thresholds by slice where legally appropriate, and model choices that trade a small accuracy loss for interpretability or controllability. Post-processing mitigations adjust outputs or decisions after training, such as threshold changes, human review for uncertain cases, or fallback to rules. Each mitigation must be evaluated for utility, fairness, stability, and legal acceptability.",
          "Sometimes the right mitigation is not to automate. A high-impact decision with poor labels, weak recourse, and large slice uncertainty may require human-centered redesign rather than a better loss function. Fairness work should preserve the option to narrow scope, delay launch, add human oversight, or remove a feature. Production maturity includes knowing when a model should not own a decision."
        ],
        keyTerms: [
          {
            term: "pre-processing mitigation",
            definition:
              "A fairness intervention applied to data, labels, or features before model training."
          },
          {
            term: "in-processing mitigation",
            definition:
              "A fairness intervention built into the training objective, constraints, or model selection."
          },
          {
            term: "post-processing mitigation",
            definition:
              "A fairness intervention applied to scores, thresholds, decisions, or review flows after training."
          }
        ],
        checkYourself: [
          {
            prompt:
              "Why should mitigations be evaluated after implementation rather than assumed beneficial?",
            reveal:
              "A mitigation can improve one slice while harming another, reduce utility too much, introduce instability, or violate domain policy. It needs evidence."
          }
        ]
      },
      {
        id: "monitoring-and-governance",
        heading: "Fairness must be monitored and governed after launch",
        paragraphs: [
          "Fairness at launch is not fairness forever. Product scope expands, user populations shift, labels mature, upstream data changes, and feedback loops develop. Monitor fairness metrics by approved slices, with volume floors and privacy controls. Track complaints, appeals, overrides, and human-review outcomes. If fairness data is sensitive, access should be governed, but absence of measurement should not become an excuse to ignore disparate impact.",
          "Governance artifacts make fairness review durable. Model cards, system cards, data sheets, impact assessments, eval reports, and launch approvals should record intended use, known limitations, slice metrics, chosen fairness definitions, mitigation decisions, and monitoring plans. When a model or prompt bundle changes, the artifacts should update with the release. A model card that describes last year's behavior is a liability.",
          "Escalation paths matter. A fairness alert should specify who reviews it, what evidence they need, which mitigations are available, and how decisions are recorded. A high-severity regression may require alias rollback, threshold adjustment, human review expansion, or product pause. Fairness work becomes operational when it has owners, metrics, runbooks, and authority to change launch decisions."
        ],
        keyTerms: [
          {
            term: "model card",
            definition:
              "A document describing intended use, performance, limitations, fairness evaluation, risks, and operational context for a model."
          },
          {
            term: "appeal signal",
            definition:
              "Evidence from user contestation, human override, or complaint processes that may reveal decision harm."
          },
          {
            term: "residual risk",
            definition:
              "Risk that remains after mitigations and must be accepted, monitored, or further reduced."
          }
        ],
        checkYourself: [
          {
            prompt:
              "What should a fairness monitoring alert include besides the metric value?",
            reveal:
              "It should include slice definition, volume, uncertainty, recent changes, owner, runbook, possible mitigations, and escalation criteria."
          }
        ]
      },
      {
        id: "fairness-in-generative-and-agent-systems",
        heading: "Generative and agent systems add new fairness surfaces",
        paragraphs: [
          "Generative systems can produce representational harms, language-quality gaps, unequal refusal behavior, stereotype amplification, or different helpfulness across dialects and languages. Retrieval systems can underrepresent some groups because the corpus is incomplete or ranking favors majority-language documents. LLM judges can inherit preferences for verbosity, standard dialect, or culturally familiar framing. Fairness evaluation must include generated content, retrieved evidence, and evaluation tools themselves.",
          "Agents add action fairness. If an agent has tools for refunds, escalation, scheduling, code review, or hiring workflows, measure whether different groups receive different actions, delay, approval requirements, or handoff rates under similar circumstances. Tool availability and memory policies can create disparities: one tenant may have richer context, one language may trigger more refusals, or one group may be routed to human review more often. Trajectory-level fairness is broader than output text fairness.",
          "Production practice is to combine offline slice evals, red-team prompts, multilingual and dialect coverage, human review, trace sampling, and post-launch monitoring. Do not rely on a general-purpose fairness claim from a foundation model provider. The deployer owns application context, data, tools, users, and harms. Fairness in AI systems is therefore shared between model choice, product design, data quality, and operations."
        ],
        keyTerms: [
          {
            term: "representational harm",
            definition:
              "Harm caused by stereotyping, erasure, demeaning portrayal, or unequal quality in generated content."
          },
          {
            term: "trajectory-level fairness",
            definition:
              "Fairness analysis over the actions, tools, delays, approvals, and handoffs in an agent run, not only final text."
          },
          {
            term: "judge bias",
            definition:
              "Systematic preference or error in a human or automated evaluator that skews quality measurement across groups or styles."
          }
        ],
        checkYourself: [
          {
            prompt:
              "Why is fairness evaluation for an agent broader than fairness evaluation for a classifier?",
            reveal:
              "Agents choose actions over time. Fairness can differ in tool use, approvals, delays, handoffs, memory, refusals, and final outputs, so trajectories must be evaluated."
          }
        ],
        callout: {
          tone: "tip",
          body:
            "For 2026 systems, fairness analysis follows the whole AI workflow: data, retrieval, generation, tools, human review, and outcomes."
        }
      }
    ],
    wrapUp: {
      takeaways: [
        "Fairness starts with harms, stakeholders, decision context, and recourse.",
        "Bias enters through labels, features, proxies, sampling, deployment, and feedback loops.",
        "Fairness metrics conflict, so choices must be documented with uncertainty and slice context.",
        "Mitigations span data, training, decisions, human review, and sometimes non-automation.",
        "Generative and agent systems require fairness analysis over content, retrieval, tools, and trajectories."
      ],
      nextSteps: [
        "Pick a high-impact decision and write its harm model before choosing metrics.",
        "Compute error rates for at least two slices and explain uncertainty.",
        "Design a fairness monitoring alert with owner, runbook, and mitigation options."
      ]
    }
  },
  "ai-safety-and-ethics/explainability": {
    title: "Chapter: Explainability, interpretability, and evidence",
    readingTime: "65-80 min",
    premise:
      "Explainability helps debugging, user recourse, compliance, and trust, but explanations can also mislead. This chapter teaches how to choose explanation methods for the audience and decision, distinguish intrinsic interpretability from post-hoc attributions, evaluate explanation faithfulness, support counterfactual recourse, and handle LLM explanations without pretending they reveal hidden cognition.",
    parts: [
      {
        id: "audience-purpose-and-claim",
        heading: "Every explanation needs an audience, purpose, and claim boundary",
        paragraphs: [
          "An explanation for a model engineer is not the same as an explanation for a rejected applicant, clinician, auditor, or support agent. Engineers may need feature influence to debug drift. Users may need understandable reasons and recourse. Auditors may need traceability from data to decision. Operators may need confidence and escalation guidance. A single plot cannot satisfy every audience, and showing technical attributions to users can create false certainty.",
          "State what the explanation claims. Is it local or global? Does it explain one prediction, average model behavior, a rule layer, a retrieval result, or a generated answer? Is it faithful to the model's computation, a surrogate approximation, a causal claim, or a user-facing reason code? Many failures come from presenting correlation as causation or a post-hoc approximation as ground truth. Good explanation UX includes limitations.",
          "The purpose determines the method. Debugging may use permutation importance, slice analysis, counterfactual testing, and feature inspection. User recourse may need actionable counterfactuals and policy reason codes. Compliance may require audit logs, model cards, data provenance, and adverse-action explanations. LLM applications may need citation traces and tool-use logs more than attention maps. The right explanation is the one that supports the decision being made."
        ],
        keyTerms: [
          {
            term: "local explanation",
            definition:
              "An explanation of a specific prediction, answer, or decision instance."
          },
          {
            term: "global explanation",
            definition:
              "An explanation of broad model behavior across many examples or the whole input space."
          },
          {
            term: "faithfulness",
            definition:
              "The degree to which an explanation accurately reflects the behavior of the system it claims to explain."
          }
        ],
        checkYourself: [
          {
            prompt:
              "What question should you ask before choosing SHAP, LIME, a model card, or a counterfactual?",
            reveal:
              "Ask who the explanation is for, what decision it supports, and what claim it is allowed to make."
          }
        ],
        callout: {
          tone: "interview",
          body:
            "A strong explainability answer names the audience and decision before naming an algorithm."
        }
      },
      {
        id: "intrinsic-vs-posthoc",
        heading: "Intrinsic interpretability and post-hoc explanations solve different problems",
        paragraphs: [
          "Intrinsically interpretable models expose behavior through their structure: sparse linear models, monotonic models, generalized additive models, small decision trees, scorecards, and rule systems. They are not automatically fair or correct, but their reasoning can be inspected more directly. In high-stakes domains, a slightly less accurate interpretable model may be preferable when recourse, review, and governance matter more than a small benchmark gain.",
          "Post-hoc methods approximate explanations for complex models. Permutation importance measures performance drop when a feature is shuffled. LIME fits local surrogate models around one point. SHAP-style attributions distribute a prediction difference from a baseline across features. Partial dependence and accumulated local effects describe feature-response patterns. These methods answer different questions and can disagree. Disagreement is a diagnostic signal, not an inconvenience to hide.",
          "Interpretability also includes system-level transparency. A credit decision may combine a model score, policy rules, manual review, data eligibility, and regulatory thresholds. Explaining only the model score can misrepresent the actual decision. AI application explanations should include the rule path, model version, features used, retrieval sources, tool actions, and human approvals where relevant. The system, not just the estimator, makes the decision."
        ],
        keyTerms: [
          {
            term: "intrinsic interpretability",
            definition:
              "Interpretability arising from a model's structure, such as sparse coefficients, monotonic constraints, or small trees."
          },
          {
            term: "post-hoc explanation",
            definition:
              "An explanation computed after model training to approximate behavior of an opaque model."
          },
          {
            term: "surrogate model",
            definition:
              "A simpler model trained to approximate another model globally or around a specific point."
          }
        ],
        workedExample: {
          title: "Linear attribution from a baseline",
          body:
            "For a linear model, feature contribution from a baseline is transparent and easy to audit.",
          code:
            "weights = {\"income\": 0.4, \"debt_ratio\": -0.8, \"late_payments\": -1.2}\nexample = {\"income\": 2.0, \"debt_ratio\": 1.5, \"late_payments\": 1.0}\nbaseline = {\"income\": 0.0, \"debt_ratio\": 0.0, \"late_payments\": 0.0}\n\ncontrib = {k: (example[k] - baseline[k]) * weights[k] for k in weights}\nscore = sum(contrib.values())\nprint(contrib, score)",
          language: "python"
        },
        checkYourself: [
          {
            prompt:
              "Why might a team choose a more interpretable model with slightly lower benchmark accuracy?",
            reveal:
              "For high-impact decisions, auditability, recourse, debugging, stability, and governance may outweigh a small aggregate accuracy gain."
          }
        ]
      },
      {
        id: "attribution-methods-and-baselines",
        heading: "Attributions depend on baselines, correlations, and assumptions",
        paragraphs: [
          "Feature attributions are tempting because they produce ranked reasons, but they are easy to overclaim. A SHAP-style value explains contribution relative to a chosen baseline distribution. Change the baseline and the story can change. Correlated features share credit in ways that may not match causal intuition. A feature can receive high attribution because it is a proxy, not because changing it would change the real-world outcome. Explanation consumers need these limitations.",
          "Sanity checks are essential. If removing or perturbing a top-attributed feature does not change the model output, the explanation is suspect. If nearly identical inputs receive wildly different attributions, stability is poor. If a random model produces plausible-looking explanations, the visualization may be storytelling rather than evidence. Explanation evaluation should test faithfulness, stability, sensitivity, and usefulness for the intended audience.",
          "For production, keep explanations versioned with the model, features, and baseline data. An attribution computed against last quarter's population may not describe today's traffic. Feature names, transformations, and scaling must be understandable; a coefficient on a normalized interaction feature is not user-friendly without translation. Explanation services should log model version, feature vector, baseline version, explanation method, and any rule layer applied."
        ],
        keyTerms: [
          {
            term: "baseline",
            definition:
              "The reference input or population against which an attribution method compares a prediction."
          },
          {
            term: "stability",
            definition:
              "The degree to which explanations remain similar for similar inputs when model behavior is similar."
          },
          {
            term: "sensitivity test",
            definition:
              "A check that changing important features affects model output in a way consistent with the explanation."
          }
        ],
        checkYourself: [
          {
            prompt:
              "Why is a feature attribution not the same thing as a causal explanation?",
            reveal:
              "Attributions describe model behavior under assumptions and baselines. They do not prove that changing the real-world feature would cause the outcome to change."
          }
        ],
        callout: {
          tone: "warning",
          body:
            "A colorful attribution chart can be less honest than a plain reason code if users treat it as causal truth."
        }
      },
      {
        id: "counterfactuals-and-recourse",
        heading: "Counterfactual explanations must be actionable and feasible",
        paragraphs: [
          "Counterfactual explanations answer `what would need to change for a different decision?` They are useful for recourse because they can translate a score into possible user action. However, a counterfactual that suggests changing age, disability status, race, family history, or other immutable attributes is harmful. Even apparently mutable suggestions can be infeasible, such as doubling income in thirty days or moving to a different city.",
          "Good counterfactuals include constraints. They respect immutable features, monotonic policy rules, causal relationships, feasibility, cost to the user, and legal requirements. They should be validated through the actual decision system, not only an explainer surrogate. If the decision includes rules plus model score plus human review, the counterfactual should reflect the whole path. Otherwise the system may promise recourse that does not work.",
          "Recourse should be monitored. Track whether users understand explanations, whether suggested actions are realistic, whether different groups receive different quality of recourse, and whether appeals succeed. In some contexts, explanation quality itself is a fairness issue. A system that gives clear actionable reasons to one group and vague refusals to another creates unequal ability to contest decisions."
        ],
        keyTerms: [
          {
            term: "counterfactual explanation",
            definition:
              "An explanation describing changes that would alter a model or system decision."
          },
          {
            term: "actionable recourse",
            definition:
              "A feasible path a person can take to improve or contest an outcome."
          },
          {
            term: "feasibility constraint",
            definition:
              "A rule that prevents explanations from recommending impossible, immutable, illegal, or unrealistic changes."
          }
        ],
        workedExample: {
          title: "Filter counterfactual suggestions",
          body:
            "A recourse system should reject immutable or infeasible changes before showing suggestions.",
          code:
            "suggestions = [\n    {\"feature\": \"income\", \"change\": \"+5000\", \"mutable\": True, \"feasible\": True},\n    {\"feature\": \"age\", \"change\": \"-5 years\", \"mutable\": False, \"feasible\": False},\n    {\"feature\": \"debt_ratio\", \"change\": \"-0.1\", \"mutable\": True, \"feasible\": True},\n]\nallowed = [s for s in suggestions if s[\"mutable\"] and s[\"feasible\"]]\nprint(allowed)",
          language: "python"
        },
        checkYourself: [
          {
            prompt:
              "Why should counterfactual recourse be validated through the real decision system?",
            reveal:
              "A surrogate may miss rules, thresholds, policy constraints, or human review steps. Users need suggestions that would actually change the decision path."
          }
        ]
      },
      {
        id: "explaining-llm-and-agent-systems",
        heading: "LLM and agent explanations rely on evidence, not hidden reasoning claims",
        paragraphs: [
          "For LLMs, generated rationales are not reliable windows into internal computation. A model can produce a plausible explanation after the fact that does not reflect how tokens were generated. Chain-of-thought may improve performance in some settings, but exposing it as proof can mislead users and leak sensitive policy details. Production explanations should emphasize evidence the system can substantiate: sources retrieved, tool calls made, checks applied, uncertainty, and limitations.",
          "RAG explanations often use citations, but citations need evaluation. A cited document may be irrelevant, stale, incorrectly chunked, or used to support a claim it does not actually contain. Monitor citation precision, answer-without-citation rate, stale-source usage, and whether cited passages contain the answer. For agent systems, explain which tools were used, what approvals were required, what state changed, and why the agent stopped or handed off. This supports user trust and incident review.",
          "LLM judges and explanation generators also need governance. If an automated judge evaluates faithfulness or helpfulness, calibrate it against humans and audit bias. If a model generates user-facing reasons, ensure the reasons are grounded in decision data and policy, not invented. The explanation pipeline should be evaluated like any other AI component because misleading explanations can create their own harm even when the underlying answer is correct."
        ],
        keyTerms: [
          {
            term: "rationale",
            definition:
              "A natural-language explanation produced by a model, which may or may not faithfully represent its actual computation."
          },
          {
            term: "citation precision",
            definition:
              "The share of cited sources or passages that actually support the generated claim."
          },
          {
            term: "tool provenance",
            definition:
              "A record of which tools were called, with what arguments, under what permissions, and with what results."
          }
        ],
        checkYourself: [
          {
            prompt:
              "What is safer to show users than an LLM's claimed hidden reasoning?",
            reveal:
              "Show retrieved sources, tool actions, decision rules, uncertainty, limitations, and auditable evidence that supports the output."
          }
        ]
      },
      {
        id: "evaluation-documentation-and-governance",
        heading: "Evaluate explanations and document their limits",
        paragraphs: [
          "Explanation systems need their own tests. Faithfulness checks ask whether the explanation changes when the model behavior changes. Stability checks ask whether similar inputs with similar outputs receive similar explanations. Human-usefulness studies ask whether the explanation helps the intended audience make better decisions without overtrust. Fairness checks ask whether explanation quality differs across groups, languages, or accessibility needs.",
          "Documentation should describe the method, audience, model version, data version, baseline, known limitations, and prohibited interpretations. For regulated or high-impact contexts, link explanations to audit logs, adverse-action reason codes, model cards, and decision policies. If explanations are approximate, say so. If they are not causal, say so. If they exclude features for privacy or security reasons, explain the limitation without exposing sensitive details.",
          "Governance should decide when explanations are required, reviewed, or blocked. Some internal debugging explanations should never be shown to end users. Some user-facing explanations require legal or compliance review. Some generated explanations should be disabled if grounding or citation checks fail. The mature posture is not `explain everything`; it is `provide the right evidence to the right audience with tested limits`."
        ],
        keyTerms: [
          {
            term: "usefulness study",
            definition:
              "An evaluation of whether an explanation helps its target audience make better, safer, or more informed decisions."
          },
          {
            term: "adverse-action reason code",
            definition:
              "A regulated or policy-defined reason communicated to a person for an unfavorable decision."
          },
          {
            term: "overtrust",
            definition:
              "A failure mode where users place more confidence in an explanation or system than evidence supports."
          }
        ],
        checkYourself: [
          {
            prompt:
              "Name three tests for an explanation method.",
            reveal:
              "Faithfulness, stability, sensitivity, human usefulness, fairness of explanation quality, and grounding/citation precision are common tests."
          }
        ],
        callout: {
          tone: "tip",
          body:
            "Explanations are part of the product. If they can change user decisions, they deserve product-quality evaluation."
        }
      }
    ],
    wrapUp: {
      takeaways: [
        "Explanations must be chosen for a specific audience, purpose, and claim boundary.",
        "Intrinsic interpretability and post-hoc explanations answer different questions.",
        "Attributions depend on baselines and assumptions and should not be sold as causality.",
        "Counterfactual recourse must be feasible, actionable, and validated through the real system.",
        "LLM and agent explanations should emphasize sources, tools, provenance, and tested limitations."
      ],
      nextSteps: [
        "Pick one model decision and write separate explanations for an engineer, user, and auditor.",
        "Define faithfulness and stability tests for an attribution method.",
        "Design a user-facing recourse explanation with immutable-feature constraints."
      ]
    }
  },
  "ai-safety-and-ethics/ai-governance": {
    title: "Chapter: AI governance and regulation in practice",
    readingTime: "70-85 min",
    premise:
      "AI governance turns legal, ethical, security, and operational expectations into shipped controls. This chapter covers risk-tiered inventories, EU AI Act and NIST AI RMF operating language, model and system cards, vendor and supply-chain responsibilities, data residency, audit logs, incident response, and continuous evidence for AI systems that include models, prompts, tools, retrieval, and agents.",
    parts: [
      {
        id: "governance-as-operating-system",
        heading: "Governance is an operating system for AI change",
        paragraphs: [
          "AI governance is the set of roles, policies, evidence, controls, and escalation paths that decide how AI systems are built, launched, monitored, and changed. It is not a final legal review after engineering is done. It shapes product scope, data access, model choice, evaluation depth, human oversight, logging, retention, vendor contracts, and incident response. Good governance lets teams ship predictably because the evidence required for each risk tier is known early.",
          "A production inventory is the foundation. Each AI system should have an owner, purpose, users, affected populations, model or provider, data sources, tools, risk tier, deployment regions, evaluation artifacts, monitoring links, and rollback path. This includes LLM apps and agents, not only classic predictive models. A prompt connected to tools and user data is an AI system even if the company did not train the foundation model.",
          "Risk tiering sizes the control set. An internal writing assistant may need transparency, security, privacy, and feedback paths. A hiring, credit, education, biometric, medical, or safety-impacting system needs stronger impact assessment, human oversight, documentation, monitoring, and approval. The exact legal classification belongs with counsel, but engineering must make the classification real through technical controls and evidence."
        ],
        keyTerms: [
          {
            term: "AI system inventory",
            definition:
              "A maintained catalog of AI systems, owners, purpose, components, data, risk tier, controls, and operational links."
          },
          {
            term: "risk tier",
            definition:
              "A classification that determines the amount of evaluation, oversight, documentation, and monitoring required."
          },
          {
            term: "control set",
            definition:
              "The technical and process safeguards required for a system, such as evals, approvals, logging, and human oversight."
          }
        ],
        checkYourself: [
          {
            prompt:
              "Why should an LLM feature that uses third-party models still appear in an AI inventory?",
            reveal:
              "The deployer owns application context, data handling, prompts, retrieval, tools, user impact, monitoring, and incident response even if a vendor owns the base model."
          }
        ],
        callout: {
          tone: "interview",
          body:
            "Governance answers should connect inventory, risk tier, controls, evidence, and rollback. That is the operational story."
        }
      },
      {
        id: "regulatory-landscape-2026",
        heading: "The 2026 landscape is risk-tiered and evidence-driven",
        paragraphs: [
          "By mid-2026, organizations serving the EU are preparing for phased obligations under Regulation (EU) 2024/1689, the AI Act. Educationally, its structure is useful even outside legal analysis: some uses are prohibited, high-risk systems require stronger controls, transparency duties apply to some user-facing AI, and general-purpose AI obligations may affect providers. This chapter is not legal advice, but engineers should understand why risk classification, logging, documentation, human oversight, and post-market monitoring are not optional decorations.",
          "The NIST AI Risk Management Framework remains a common operating language, especially for organizations that need a flexible internal program across jurisdictions. Govern, Map, Measure, and Manage translate well into engineering practice. Govern defines roles and policy. Map identifies systems, context, data, and harms. Measure produces evals, red teams, and monitoring. Manage applies gates, mitigations, rollback, and incident learning. It complements legal obligations by providing a control vocabulary.",
          "Sector rules and contracts also matter. Finance, healthcare, employment, education, children's privacy, biometric systems, and government procurement can impose additional requirements. Enterprise buyers may ask for model cards, data residency, retention guarantees, audit logs, subprocessors, training-data opt-out, security reviews, and evaluation rights. Governance is therefore not only public regulation; it is also market access and trust infrastructure."
        ],
        keyTerms: [
          {
            term: "EU AI Act",
            definition:
              "Regulation (EU) 2024/1689, a risk-based AI regulatory framework with phased obligations for certain AI systems and providers."
          },
          {
            term: "NIST AI RMF",
            definition:
              "A voluntary risk-management framework organized around Govern, Map, Measure, and Manage functions."
          },
          {
            term: "post-market monitoring",
            definition:
              "Ongoing observation of system performance, risks, incidents, and control effectiveness after deployment."
          }
        ],
        checkYourself: [
          {
            prompt:
              "How does the NIST AI RMF help engineering teams even when legal obligations come from another source?",
            reveal:
              "It provides an operating vocabulary for roles, system mapping, measurement, mitigation, monitoring, and governance evidence across regimes."
          }
        ]
      },
      {
        id: "documentation-evidence-packs",
        heading: "Documentation must be synchronized with production artifacts",
        paragraphs: [
          "Model cards, system cards, data sheets, risk assessments, evaluation reports, and release notes are governance artifacts. They should describe intended use, out-of-scope use, data provenance, evaluation results, fairness slices, robustness tests, limitations, human oversight, monitoring, and incident contacts. For LLM applications, system cards should include prompts or prompt bundle ids, model aliases, retrieval indexes, tool permissions, memory policy, guardrails, and red-team summaries.",
          "The most common documentation failure is staleness. A model card written for version 2 does not govern version 5. A system card that omits a newly added email-sending tool hides the real risk. A RAG evaluation report that references an old index does not prove current groundedness. Documentation should be tied to promotion pipelines so artifact ids and evidence update together. Manual prose can remain, but release metadata should be generated or checked automatically.",
          "Evidence packs help review boards move quickly. Instead of debating abstractions, reviewers see the inventory entry, risk tier, eval report, red-team results, fairness analysis, privacy review, monitoring dashboard, runbook, approvals, and rollback plan. The pack should also include known residual risks and who accepted them. A governance process that rewards concrete limitations will produce safer systems than one that pressures teams to claim perfection."
        ],
        keyTerms: [
          {
            term: "system card",
            definition:
              "Documentation for a complete AI application, including components, tools, data flows, evaluations, limitations, and operations."
          },
          {
            term: "evidence pack",
            definition:
              "A launch or audit bundle containing evaluations, documentation, approvals, monitoring, risk analysis, and rollback evidence."
          },
          {
            term: "residual risk acceptance",
            definition:
              "A recorded decision that remaining risk after mitigations is acceptable under defined conditions."
          }
        ],
        workedExample: {
          title: "Evidence pack checklist",
          body:
            "A launch review can fail fast when required evidence is missing.",
          code:
            "required = {\n    \"inventory_id\", \"risk_tier\", \"eval_report\", \"redteam_report\",\n    \"monitoring_dashboard\", \"owner\", \"rollback_plan\", \"system_card\"\n}\npack = {\n    \"inventory_id\": \"ai-042\",\n    \"risk_tier\": \"limited\",\n    \"eval_report\": \"eval-rag-v12\",\n    \"redteam_report\": \"rt-v5\",\n    \"monitoring_dashboard\": \"dash-77\",\n    \"owner\": \"support-ai\",\n    \"rollback_plan\": \"alias_flip\",\n}\nprint(\"missing\", sorted(required - set(pack)))",
          language: "python"
        },
        checkYourself: [
          {
            prompt:
              "Why should a system card include tool permissions for an agent?",
            reveal:
              "Tools determine what external actions the system can take. They affect risk tier, approvals, audit logs, red-team scope, and incident response."
          }
        ]
      },
      {
        id: "runtime-controls-and-auditability",
        heading: "Runtime controls are governance in code",
        paragraphs: [
          "Governance becomes real when enforced by runtime systems. Access controls define who can use a feature and which data or tools it can reach. Guardrails enforce output constraints, PII handling, and tool allowlists. Human oversight gates require approval before high-impact actions. Rate limits and budgets control abuse and cost. Retention rules decide what prompts, traces, embeddings, and tool logs can persist. Regional routing enforces data residency. These are not merely platform details; they are compliance controls.",
          "Audit logs should cover significant AI decisions and agent actions. For a tool-connected agent, record user, tenant, policy version, model alias, tool name, validated arguments, authorization result, approval id, idempotency key, downstream request id, outcome, and trace id. For decision systems, record model version, feature snapshot, score, rule layer, human override, and reason codes where appropriate. Logs must be protected because they may contain sensitive data, but they must be available for authorized investigations.",
          "Runtime controls should fail safely. If the approval service is unavailable, a money-moving tool should not silently proceed. If regional routing cannot guarantee residency, the request should fail or degrade. If a guardrail cannot evaluate a high-risk response, the system may need human handoff. Governance requirements should appear in architecture diagrams and tests because they change how the service behaves under failure."
        ],
        keyTerms: [
          {
            term: "human oversight gate",
            definition:
              "A required human review or approval step before a system completes a high-impact action or decision."
          },
          {
            term: "audit log",
            definition:
              "A protected record of decisions, actions, inputs, approvals, versions, and outcomes used for investigation and compliance."
          },
          {
            term: "regional routing",
            definition:
              "Directing data processing and storage to approved geographic regions to satisfy residency or contractual requirements."
          }
        ],
        checkYourself: [
          {
            prompt:
              "Give three examples of governance requirements that should be enforced at runtime.",
            reveal:
              "Examples include tool authorization, human approval, PII redaction, retention limits, audit logging, data residency routing, rate limits, and budget caps."
          }
        ],
        callout: {
          tone: "warning",
          body:
            "A policy that exists only in a PDF will not stop an agent from calling a tool."
        }
      },
      {
        id: "vendors-open-models-and-supply-chain",
        heading: "Vendors, open models, and supply chain split responsibility",
        paragraphs: [
          "Using a hosted model provider shifts some responsibilities but not all of them. Providers may own base-model training controls, frontier safety testing, infrastructure, and some general-purpose AI obligations. Deployers still own prompts, data sent to the provider, retrieval sources, tool use, user disclosures, downstream decisions, monitoring, and incident response. Contracts should clarify retention, training-data use, subprocessors, regions, uptime, audit rights, security controls, and notification obligations.",
          "Open-weight and self-hosted models change the risk profile. They may improve data control, latency, cost, or customization, but they require model provenance review, license compliance, vulnerability management, fine-tune data governance, abuse monitoring, and serving security. If a team fine-tunes on customer data, deletion and opt-out commitments become more complex. If a model is deployed regionally for residency, the organization must operate the infrastructure and logs accordingly.",
          "Supply-chain governance extends to datasets, embeddings, eval tools, prompt libraries, agent frameworks, vector databases, and browser or code-execution tools. A vulnerability in a tool server or a licensing issue in a dataset can create as much risk as a weak model. Procurement and engineering should maintain component inventories and review changes. AI supply chain is not just model cards from vendors; it is the full behavior stack."
        ],
        keyTerms: [
          {
            term: "subprocessor",
            definition:
              "A third party used by a vendor or service provider to process data under contract."
          },
          {
            term: "model provenance",
            definition:
              "Information about a model's origin, license, training process, intended use, and known restrictions."
          },
          {
            term: "component inventory",
            definition:
              "A catalog of models, datasets, tools, frameworks, providers, and infrastructure involved in an AI system."
          }
        ],
        checkYourself: [
          {
            prompt:
              "What responsibilities remain with the deployer when using a hosted foundation model?",
            reveal:
              "The deployer owns application design, prompts, user data handling, retrieval, tools, disclosures, monitoring, incident response, and downstream harms."
          }
        ]
      },
      {
        id: "continuous-governance-and-incidents",
        heading: "Continuous governance learns from launches and incidents",
        paragraphs: [
          "Governance fails when it is a one-time committee meeting. Systems change after launch: prompts are edited, tools are added, models are swapped, corpora refresh, user populations shift, and regulations evolve. Continuous governance ties release pipelines to recurring audits, monitoring reviews, risk-tier reassessments, incident postmortems, and evidence refresh. A feature that was low-risk as a drafting assistant may become higher-risk when it gains the ability to submit forms or send messages.",
          "Incident response should update controls. If an AI assistant exposes private data in traces, retention and redaction controls need review. If an agent performs an unauthorized action, tool authorization and approval gates need strengthening. If a model shows fairness regression after market expansion, monitoring slices and data collection may need revision. The postmortem should identify artifact versions, affected users, root causes, mitigations, and new gates or tests.",
          "Culture is part of governance. Engineers, product managers, legal, security, data science, operations, and support must be able to raise risks without being treated as blockers. A mature organization rewards accurate limitations, clear escalation, and measured rollback. The goal is not to eliminate all AI risk; it is to know which risks exist, who owns them, what evidence supports the decision, and how the system responds when reality changes."
        ],
        keyTerms: [
          {
            term: "risk-tier reassessment",
            definition:
              "A review triggered by scope, tool, user, geography, model, or data changes that may alter required controls."
          },
          {
            term: "AI postmortem",
            definition:
              "An incident review that includes model, data, prompt, tool, governance, monitoring, and user-impact evidence."
          },
          {
            term: "governance culture",
            definition:
              "Organizational norms that encourage surfacing AI risks, documenting limitations, and acting on evidence."
          }
        ],
        checkYourself: [
          {
            prompt:
              "When should an AI system's risk tier be reassessed?",
            reveal:
              "When purpose, users, regions, tools, data, model/provider, automation level, human oversight, or potential harm changes."
          }
        ],
        callout: {
          tone: "tip",
          body:
            "Good governance lets teams move faster because the evidence and controls are clear before the risky change arrives."
        }
      }
    ],
    wrapUp: {
      takeaways: [
        "AI governance operationalizes roles, risk tiers, controls, evidence, and escalation paths.",
        "The 2026 landscape is risk-based, with EU AI Act readiness, NIST AI RMF language, sector rules, and enterprise requirements shaping practice.",
        "System cards, model cards, eval reports, and evidence packs must stay synchronized with production artifacts.",
        "Runtime controls, audit logs, retention, approvals, and regional routing make governance enforceable.",
        "Vendor and open-model choices split responsibility but never remove deployer accountability for application behavior."
      ],
      nextSteps: [
        "Create an inventory entry for an LLM feature that uses retrieval and tools.",
        "Draft an evidence pack checklist for a high-risk AI release.",
        "Write an incident postmortem template that includes model, prompt, data, tool, and governance artifacts."
      ]
    }
  }
};

/** @type {Record<string, import('../learnChapters.js').LessonLearnChapter>} */
export const aiSafetyChapters = JSON.parse(JSON.stringify(chapters));
