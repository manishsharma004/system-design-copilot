/** @type {Record<string, import('../learnChapters.js').LessonLearnChapter>} */
export const aiSafetyChapters = {
  "ai-safety-and-ethics/bias-and-fairness": {
    "title": "Chapter: Bias detection and fairness",
    "readingTime": "55-70 min",
    "premise": "Sources of bias, fairness metrics, debiasing techniques, and testing practices for building equitable AI systems. This Learn chapter expands the short lesson summary into a full study unit you can read continuously, with interactive checks and selection-based AI search when a phrase needs a second opinion.",
    "parts": [
      {
        "id": "orientation",
        "heading": "Why this chapter exists",
        "paragraphs": [
          "Biased systems harm users and create legal/product risk. Fairness work is measurement, tradeoff analysis, and process—not a single checkbox metric.",
          "This chapter treats \"Bias detection and fairness\" as a readable study unit: intuition first, then the mechanics you must be able to explain, then the failure modes that show up in interviews and production, and finally how to talk about the topic under time pressure.",
          "Read it like a book chapter. When a phrase is unclear, select it inside the Learn reader and use Search with AI to open Google, Perplexity, or DuckDuckGo without abandoning the chapter."
        ],
        "callout": {
          "tone": "tip",
          "body": "Target reading time is paced for depth, not skimming. Pause at each Check yourself prompt and answer out loud before revealing the guide answer."
        }
      },
      {
        "id": "where-bias-enters-the-lifecycle",
        "heading": "Where bias enters the lifecycle",
        "paragraphs": [
          "Bias can enter via historical labels, sampling frames, feature availability, proxy variables, annotation guidelines, and deployment context. A model can be accurate on average and still systematically fail a group. Start by naming stakeholders and harms, not by picking a metric in the abstract. Document intended use and out-of-scope uses. Fairness work starts with harm narratives grounded in how decisions affect people, not with a library call. Fairness work starts with harm narratives grounded in how decisions affect people, not with a library call. Fairness work starts with harm narratives grounded in how decisions affect people, not with a library call.",
          "Hold these points explicitly while you study. Restate each one without looking at the list — recognition is not the interview bar; recall is.",
          "• Map harms and stakeholders before metrics.",
          "• Inspect data collection and labeling processes.",
          "• Document intended use boundaries.",
          "Production lens — Fairness metrics conflict—pick one aligned with harm: Demographic parity, equalized odds, and calibration are mathematically incompatible in general. Disaggregated evaluation (performance by subgroup) is the minimum bar; choosing a fairness criterion requires stakeholder input on which errors are costliest. Proxy features (ZIP code, language) can reintroduce bias even when protected attributes are removed."
        ],
        "keyTerms": [
          {
            "term": "Map harms and stakeholders before metrics.",
            "definition": "Map harms and stakeholders before metrics."
          },
          {
            "term": "Inspect data collection and labeling processes.",
            "definition": "Inspect data collection and labeling processes."
          },
          {
            "term": "Document intended use boundaries.",
            "definition": "Document intended use boundaries."
          }
        ],
        "checkYourself": [
          {
            "prompt": "Maps harms before choosing metrics.",
            "reveal": "Demographic parity, equalized odds, and calibration are mathematically incompatible in general. Disaggregated evaluation (performance by subgroup) is the minimum bar; choosing a fairness criterion requires stakeholder input on which errors are costliest. Proxy features (ZIP code, language) can reintroduce bias even when protected attributes are removed."
          }
        ]
      },
      {
        "id": "metrics-and-inevitable-tradeoffs",
        "heading": "Metrics and inevitable tradeoffs",
        "paragraphs": [
          "Demographic parity, equalized odds, equal opportunity, calibration within groups—these capture different notions and can conflict. Choosing among them is an ethical/product decision constrained by law and domain. Always report uncertainty and base rates. Intersectional slices matter: aggregated \"group fairness\" can hide subgroup harm. Conflicting metrics are normal; leadership must choose and document the chosen definition. Conflicting metrics are normal; leadership must choose and document the chosen definition.",
          "Hold these points explicitly while you study. Restate each one without looking at the list — recognition is not the interview bar; recall is.",
          "• Know what each fairness metric claims and ignores.",
          "• Expect tradeoffs; make them explicit.",
          "• Check intersectional slices, not only coarse groups.",
          "Production lens — Bias enters through data and deployment context: Historical labels encode past discrimination; undersampled groups yield high-variance models; feedback loops amplify disparities (predictive policing, hiring). Mitigations span resampling, constrained optimization, human review for edge cases, and post-deployment auditing—not a single preprocessing trick. Document limitations and intended use to meet regulatory expectations."
        ],
        "keyTerms": [
          {
            "term": "Know what each fairness metric claims",
            "definition": "Know what each fairness metric claims and ignores."
          },
          {
            "term": "Expect tradeoffs; make them explicit.",
            "definition": "Expect tradeoffs; make them explicit."
          },
          {
            "term": "Check intersectional slices, not only coarse",
            "definition": "Check intersectional slices, not only coarse groups."
          }
        ],
        "workedExample": {
          "title": "Compute simple group positive rates",
          "body": "Narrate what each shape and step is doing. If you only recognize the API call, you do not own the idea yet — rewrite the example from memory after one pass.",
          "code": "import pandas as pd\n\ndf = pd.DataFrame({\n    \"group\": [\"A\", \"A\", \"B\", \"B\", \"B\"],\n    \"y_pred\": [1, 0, 1, 1, 0],\n    \"y_true\": [1, 0, 0, 1, 0],\n})\nprint(df.groupby(\"group\")[\"y_pred\"].mean())\nprint(df.groupby(\"group\").apply(lambda g: ((g.y_pred == 1) & (g.y_true == 1)).sum() / max((g.y_true == 1).sum(), 1)))",
          "language": "python"
        },
        "checkYourself": [
          {
            "prompt": "Computes group metrics with uncertainty.",
            "reveal": "Historical labels encode past discrimination; undersampled groups yield high-variance models; feedback loops amplify disparities (predictive policing, hiring). Mitigations span resampling, constrained optimization, human review for edge cases, and post-deployment auditing—not a single preprocessing trick. Document limitations and intended use to meet regulatory expectations."
          }
        ]
      },
      {
        "id": "mitigations-across-the-stack",
        "heading": "Mitigations across the stack",
        "paragraphs": [
          "Mitigations include better sampling, removing proxies, reweighting, constrained optimization, post-processing thresholds per group (careful with legal context), and human review for uncertain cases. Sometimes the right fix is not deploying automated decisions. Measure side effects on overall utility and on each group after mitigation. Missing sensitive attributes do not remove disparate impact—they only remove easy measurement. Missing sensitive attributes do not remove disparate impact—they only remove easy measurement.",
          "Hold these points explicitly while you study. Restate each one without looking at the list — recognition is not the interview bar; recall is.",
          "• Prefer upstream data fixes when possible.",
          "• Re-evaluate utility and group metrics after mitigation.",
          "• Consider non-automation as a mitigation.",
          "Production lens — Fairness metrics conflict—pick one aligned with harm: Demographic parity, equalized odds, and calibration are mathematically incompatible in general. Disaggregated evaluation (performance by subgroup) is the minimum bar; choosing a fairness criterion requires stakeholder input on which errors are costliest. Proxy features (ZIP code, language) can reintroduce bias even when protected attributes are removed."
        ],
        "keyTerms": [
          {
            "term": "Prefer upstream data fixes when possible.",
            "definition": "Prefer upstream data fixes when possible."
          },
          {
            "term": "Re-evaluate utility and group metrics after",
            "definition": "Re-evaluate utility and group metrics after mitigation."
          },
          {
            "term": "Consider non-automation as a mitigation.",
            "definition": "Consider non-automation as a mitigation."
          }
        ],
        "checkYourself": [
          {
            "prompt": "Understands metric tradeoffs.",
            "reveal": "Explain the idea in two sentences, name one metric or invariant you would watch, and state one mistake juniors make. Then connect it back to mitigations across the stack."
          }
        ]
      },
      {
        "id": "evaluation-protocol-for-fairness-audits",
        "heading": "Evaluation protocol for fairness audits",
        "paragraphs": [
          "Define groups carefully (privacy, consent, missingness). Use confidence intervals. Test under shifts. Include qualitative review of explanations and user complaints. Version the audit like code. Fairness is continuous monitoring, not a one-time report before launch. Mitigation that tanks overall recall may be unacceptable in safety-critical detection domains. Mitigation that tanks overall recall may be unacceptable in safety-critical detection domains.",
          "Hold these points explicitly while you study. Restate each one without looking at the list — recognition is not the interview bar; recall is.",
          "• Treat audits as versioned artifacts.",
          "• Monitor fairness metrics in production slices.",
          "• Combine quantitative and qualitative evidence.",
          "Production lens — Bias enters through data and deployment context: Historical labels encode past discrimination; undersampled groups yield high-variance models; feedback loops amplify disparities (predictive policing, hiring). Mitigations span resampling, constrained optimization, human review for edge cases, and post-deployment auditing—not a single preprocessing trick. Document limitations and intended use to meet regulatory expectations."
        ],
        "keyTerms": [
          {
            "term": "Treat audits as versioned artifacts.",
            "definition": "Treat audits as versioned artifacts."
          },
          {
            "term": "Monitor fairness metrics in production slices.",
            "definition": "Monitor fairness metrics in production slices."
          },
          {
            "term": "Combine quantitative and qualitative evidence.",
            "definition": "Combine quantitative and qualitative evidence."
          }
        ],
        "workedExample": {
          "title": "Equalized odds gaps (TPR/FPR)",
          "body": "Narrate what each shape and step is doing. If you only recognize the API call, you do not own the idea yet — rewrite the example from memory after one pass.",
          "code": "import numpy as np\n\ndef rates(y_true, y_pred):\n    tpr = ((y_pred == 1) & (y_true == 1)).sum() / max((y_true == 1).sum(), 1)\n    fpr = ((y_pred == 1) & (y_true == 0)).sum() / max((y_true == 0).sum(), 1)\n    return tpr, fpr\n\ny_true = np.array([1,1,0,0,1,0])\ny_a = np.array([1,0,0,0,1,1])\ny_b = np.array([1,1,1,0,1,0])\nprint(\"A\", rates(y_true, y_a), \"B\", rates(y_true, y_b))",
          "language": "python"
        },
        "checkYourself": [
          {
            "prompt": "Re-evaluates after mitigations.",
            "reveal": "Explain the idea in two sentences, name one metric or invariant you would watch, and state one mistake juniors make. Then connect it back to evaluation protocol for fairness audits."
          }
        ]
      },
      {
        "id": "governance-touchpoints",
        "heading": "Governance touchpoints",
        "paragraphs": [
          "Model cards, datasheets, review boards, and escalation paths institutionalize fairness work. Engineers should know how to raise concerns and what evidence reviewers expect. Link fairness findings to launch gates. Ethics is not an appendix; it changes ship decisions. Continuous monitoring prevents 'fair at launch, unfair after drift' failures. Continuous monitoring prevents 'fair at launch, unfair after drift' failures.",
          "Hold these points explicitly while you study. Restate each one without looking at the list — recognition is not the interview bar; recall is.",
          "• Connect fairness metrics to launch gates.",
          "• Use model cards to communicate limits.",
          "• Know escalation paths for harmful failures.",
          "Production lens — Fairness metrics conflict—pick one aligned with harm: Demographic parity, equalized odds, and calibration are mathematically incompatible in general. Disaggregated evaluation (performance by subgroup) is the minimum bar; choosing a fairness criterion requires stakeholder input on which errors are costliest. Proxy features (ZIP code, language) can reintroduce bias even when protected attributes are removed."
        ],
        "keyTerms": [
          {
            "term": "Connect fairness metrics to launch gates.",
            "definition": "Connect fairness metrics to launch gates."
          },
          {
            "term": "Use model cards to communicate limits.",
            "definition": "Use model cards to communicate limits."
          },
          {
            "term": "Know escalation paths for harmful failures.",
            "definition": "Know escalation paths for harmful failures."
          }
        ],
        "checkYourself": [
          {
            "prompt": "Ties fairness to governance artifacts.",
            "reveal": "Explain the idea in two sentences, name one metric or invariant you would watch, and state one mistake juniors make. Then connect it back to governance touchpoints."
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
          "Most interview answers fail not because the definition is wrong, but because the candidate never names how the approach breaks. Use this section as a trap checklist for bias detection and fairness.",
          "Trap: Optimizing one fairness metric blindly. A strong answer preempts it — say what you would monitor, what fallback you would keep, or what simpler baseline you would try first.",
          "Trap: Using race/gender proxies casually. A strong answer preempts it — say what you would monitor, what fallback you would keep, or what simpler baseline you would try first.",
          "Trap: One-time audits without monitoring. A strong answer preempts it — say what you would monitor, what fallback you would keep, or what simpler baseline you would try first.",
          "Trap: Ignoring intersectional slices. A strong answer preempts it — say what you would monitor, what fallback you would keep, or what simpler baseline you would try first."
        ],
        "callout": {
          "tone": "warning",
          "body": "If you cannot name a failure mode, you do not yet understand the technique well enough to ship or defend it."
        },
        "checkYourself": [
          {
            "prompt": "Pick the most dangerous pitfall for Bias detection and fairness and explain how you would detect it in production or on a whiteboard.",
            "reveal": "Start with: \"Optimizing one fairness metric blindly.\" Then add a detection signal (metric, test, or review question) and a mitigation."
          }
        ]
      },
      {
        "id": "deeper-lens",
        "heading": "A deeper production lens",
        "paragraphs": [
          "Fairness metrics conflict—pick one aligned with harm. Demographic parity, equalized odds, and calibration are mathematically incompatible in general. Disaggregated evaluation (performance by subgroup) is the minimum bar; choosing a fairness criterion requires stakeholder input on which errors are costliest. Proxy features (ZIP code, language) can reintroduce bias even when protected attributes are removed.",
          "Bias enters through data and deployment context. Historical labels encode past discrimination; undersampled groups yield high-variance models; feedback loops amplify disparities (predictive policing, hiring). Mitigations span resampling, constrained optimization, human review for edge cases, and post-deployment auditing—not a single preprocessing trick. Document limitations and intended use to meet regulatory expectations."
        ],
        "keyTerms": [
          {
            "term": "Fairness metrics conflict—pick one aligned with harm",
            "definition": "Demographic parity, equalized odds, and calibration are mathematically incompatible in general. Disaggregated evaluation (performance by subgroup) is the minimum bar; choosing a fairness criterion requires stakeholder in…"
          },
          {
            "term": "Bias enters through data and deployment context",
            "definition": "Historical labels encode past discrimination; undersampled groups yield high-variance models; feedback loops amplify disparities (predictive policing, hiring). Mitigations span resampling, constrained optimization, human…"
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
          "You should now be able to teach bias detection and fairness as a story: what problem it solves, how the mechanism works, which assumptions it depends on, and how you would know it failed.",
          "Close the loop by writing a 90-second spoken answer out loud. If you freeze on definitions, return to the orientation and the first technical part. If you freeze on trade-offs, return to failure modes.",
          "Practice prompts from this lesson: How would you audit a lending model for fairness? | Compare demographic parity and equalized odds. | What if fairness and accuracy conflict?"
        ],
        "checkYourself": [
          {
            "prompt": "Give a 90-second spoken overview of Bias detection and fairness as if starting an interview answer.",
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
        "Maps harms before choosing metrics.",
        "Computes group metrics with uncertainty.",
        "Understands metric tradeoffs.",
        "Re-evaluates after mitigations.",
        "Ties fairness to governance artifacts."
      ],
      "nextSteps": [
        "Return to the lesson page and attempt the practice / topic lab with this chapter still open if needed.",
        "Revisit any Check yourself prompts you could not answer out loud.",
        "Optional deeper reading: Fairness and Machine Learning textbook (fairmlbook.org) — https://fairmlbook.org/",
        "Optional deeper reading: Equality of Opportunity in Supervised Learning (arXiv) — https://arxiv.org/abs/1610.02413"
      ]
    }
  },
  "ai-safety-and-ethics/explainability": {
    "title": "Chapter: Explainability and interpretability",
    "readingTime": "55-70 min",
    "premise": "SHAP, LIME, attention visualization, and model-agnostic explanation methods for building trust and debugging models. This Learn chapter expands the short lesson summary into a full study unit you can read continuously, with interactive checks and selection-based AI search when a phrase needs a second opinion.",
    "parts": [
      {
        "id": "orientation",
        "heading": "Why this chapter exists",
        "paragraphs": [
          "Explanations support debugging, user trust, and compliance—but bad explanations mislead. Learn what common methods actually compute and where they fail.",
          "This chapter treats \"Explainability and interpretability\" as a readable study unit: intuition first, then the mechanics you must be able to explain, then the failure modes that show up in interviews and production, and finally how to talk about the topic under time pressure.",
          "Read it like a book chapter. When a phrase is unclear, select it inside the Learn reader and use Search with AI to open Google, Perplexity, or DuckDuckGo without abandoning the chapter."
        ],
        "callout": {
          "tone": "tip",
          "body": "Target reading time is paced for depth, not skimming. Pause at each Check yourself prompt and answer out loud before revealing the guide answer."
        }
      },
      {
        "id": "why-explain-and-for-whom",
        "heading": "Why explain, and for whom",
        "paragraphs": [
          "Audiences differ: engineers debugging features, users seeking recourse, auditors checking compliance. An explanation that helps an engineer may harm a user if overclaimed. State whether an explanation is local (one prediction) or global (model behavior), and whether it is faithful to the model or a separate interpretable surrogate. Explanations are themselves models of models; they need evaluation just like predictors do. Explanations are themselves models of models; they need evaluation just like predictors do.",
          "Hold these points explicitly while you study. Restate each one without looking at the list — recognition is not the interview bar; recall is.",
          "• Match explanation type to audience and decision.",
          "• Disclose local vs global and faithfulness limits.",
          "• Avoid implying causality from correlational attributions.",
          "Production lens — Explanation method ≠ ground truth: SHAP, LIME, and attention maps provide post-hoc narratives that can be unstable across similar inputs. Tree models offer native feature importance; linear coefficients are interpretable only with scaled features. For LLMs, chain-of-thought may rationalize rather than reveal actual computation—use explanations to aid human review, not as legal proof."
        ],
        "keyTerms": [
          {
            "term": "Match explanation type to audience and",
            "definition": "Match explanation type to audience and decision."
          },
          {
            "term": "Disclose local vs global and faithfulness",
            "definition": "Disclose local vs global and faithfulness limits."
          },
          {
            "term": "Avoid implying causality from correlational a…",
            "definition": "Avoid implying causality from correlational attributions."
          }
        ],
        "checkYourself": [
          {
            "prompt": "Chooses explanation methods for a stated audience.",
            "reveal": "SHAP, LIME, and attention maps provide post-hoc narratives that can be unstable across similar inputs. Tree models offer native feature importance; linear coefficients are interpretable only with scaled features. For LLMs, chain-of-thought may rationalize rather than reveal actual computation—use explanations to aid human review, not as legal proof."
          }
        ]
      },
      {
        "id": "intrinsic-interpretability-vs-post-hoc-methods",
        "heading": "Intrinsic interpretability vs post-hoc methods",
        "paragraphs": [
          "Linear models and short trees are intrinsically inspectable. Post-hoc methods (permutation importance, SHAP-style attributions, LIME-like local surrogates) approximate influence for opaque models. They can disagree. Use multiple methods and sanity checks: does removing a top feature change the prediction? For high stakes, prefer models that are interpretable enough by design when performance allows. If an explanation cannot survive a simple removal test, do not show it to end users as truth. If an explanation cannot survive a simple removal test, do not show it to end users as truth.",
          "Hold these points explicitly while you study. Restate each one without looking at the list — recognition is not the interview bar; recall is.",
          "• Prefer intrinsically interpretable models when they suffice.",
          "• Cross-check post-hoc explanations with interventions.",
          "• Expect disagreements across explainers.",
          "Production lens — Regulatory contexts demand traceability: GDPR \"right to explanation,\" credit adverse action notices, and medical device rules push toward interpretable models or supplementary documentation. Counterfactual explanations (\"change income by X to flip decision\") resonate with users but must respect feasibility constraints. Maintain audit logs linking predictions to model version, features, and policy rules applied."
        ],
        "keyTerms": [
          {
            "term": "Prefer intrinsically interpretable models whe…",
            "definition": "Prefer intrinsically interpretable models when they suffice."
          },
          {
            "term": "Cross-check post-hoc explanations with interv…",
            "definition": "Cross-check post-hoc explanations with interventions."
          },
          {
            "term": "Expect disagreements across explainers.",
            "definition": "Expect disagreements across explainers."
          }
        ],
        "workedExample": {
          "title": "Permutation importance with sklearn",
          "body": "Narrate what each shape and step is doing. If you only recognize the API call, you do not own the idea yet — rewrite the example from memory after one pass.",
          "code": "import numpy as np\nfrom sklearn.datasets import make_classification\nfrom sklearn.ensemble import RandomForestClassifier\nfrom sklearn.inspection import permutation_importance\nfrom sklearn.model_selection import train_test_split\n\nX, y = make_classification(n_samples=400, n_features=5, n_informative=3, random_state=0)\nXtr, Xte, ytr, yte = train_test_split(X, y, random_state=0)\nclf = RandomForestClassifier(random_state=0).fit(Xtr, ytr)\nr = permutation_importance(clf, Xte, yte, n_repeats=5, random_state=0)\nprint(np.round(r.importances_mean, 3))",
          "language": "python"
        },
        "checkYourself": [
          {
            "prompt": "Can compute permutation importance.",
            "reveal": "GDPR \"right to explanation,\" credit adverse action notices, and medical device rules push toward interpretable models or supplementary documentation. Counterfactual explanations (\"change income by X to flip decision\") resonate with users but must respect feasibility constraints. Maintain audit logs linking predictions to model version, features, and policy rules applied."
          }
        ]
      },
      {
        "id": "additive-attributions-in-practice-shap-intuition",
        "heading": "Additive attributions in practice (SHAP intuition)",
        "paragraphs": [
          "SHAP-style values distribute a prediction's difference from a baseline across features using cooperative game theoretic ideas. Exact SHAP is expensive; approximations abound. In this lab we compute a teaching version for a linear model where attributions reduce to coefficient times centered feature values. Understanding the linear case prevents magical thinking about black-box attributions. Baseline choice changes SHAP-style stories; disclose baselines in UI and docs. Baseline choice changes SHAP-style stories; disclose baselines in UI and docs.",
          "Hold these points explicitly while you study. Restate each one without looking at the list — recognition is not the interview bar; recall is.",
          "• Linear attributions are coefficient times centered inputs.",
          "• Black-box SHAP is approximate and baseline-dependent.",
          "• Always state the baseline explanation compares to.",
          "Production lens — Explanation method ≠ ground truth: SHAP, LIME, and attention maps provide post-hoc narratives that can be unstable across similar inputs. Tree models offer native feature importance; linear coefficients are interpretable only with scaled features. For LLMs, chain-of-thought may rationalize rather than reveal actual computation—use explanations to aid human review, not as legal proof."
        ],
        "keyTerms": [
          {
            "term": "Linear attributions are coefficient times cen…",
            "definition": "Linear attributions are coefficient times centered inputs."
          },
          {
            "term": "Black-box SHAP is approximate and baseline-de…",
            "definition": "Black-box SHAP is approximate and baseline-dependent."
          },
          {
            "term": "Always state the baseline explanation compares",
            "definition": "Always state the baseline explanation compares to."
          }
        ],
        "workedExample": {
          "title": "Exact attributions for a linear model",
          "body": "Narrate what each shape and step is doing. If you only recognize the API call, you do not own the idea yet — rewrite the example from memory after one pass.",
          "code": "import numpy as np\n\nw = np.array([0.5, -1.0, 2.0])\nb = 0.1\nx = np.array([1.0, 2.0, 0.5])\nbaseline = np.zeros(3)\npred = b + x @ w\nbase_pred = b + baseline @ w\nattr = (x - baseline) * w\nprint(pred, base_pred, attr, attr.sum() + base_pred)",
          "language": "python"
        },
        "checkYourself": [
          {
            "prompt": "Understands linear attribution baselines.",
            "reveal": "Explain the idea in two sentences, name one metric or invariant you would watch, and state one mistake juniors make. Then connect it back to additive attributions in practice (shap intuition)."
          }
        ]
      },
      {
        "id": "counterfactuals-and-actionable-recourse",
        "heading": "Counterfactuals and actionable recourse",
        "paragraphs": [
          "Counterfactual explanations answer \"what minimal change would flip the decision?\" Actionability constraints matter: telling someone to change immutable attributes is useless or harmful. Optimize counterfactuals with constraints and validate them through the real model, not only a surrogate. For regulators, process evidence (tests, reviews) matters as much as colorful plots. For regulators, process evidence (tests, reviews) matters as much as colorful plots.",
          "Hold these points explicitly while you study. Restate each one without looking at the list — recognition is not the interview bar; recall is.",
          "• Optimize counterfactuals under actionability constraints.",
          "• Validate by re-scoring through the true model.",
          "• Mind ethical issues around recourse suggestions.",
          "Production lens — Regulatory contexts demand traceability: GDPR \"right to explanation,\" credit adverse action notices, and medical device rules push toward interpretable models or supplementary documentation. Counterfactual explanations (\"change income by X to flip decision\") resonate with users but must respect feasibility constraints. Maintain audit logs linking predictions to model version, features, and policy rules applied."
        ],
        "keyTerms": [
          {
            "term": "Optimize counterfactuals under actionability …",
            "definition": "Optimize counterfactuals under actionability constraints."
          },
          {
            "term": "Validate by re-scoring through the true",
            "definition": "Validate by re-scoring through the true model."
          },
          {
            "term": "Mind ethical issues around recourse suggestions.",
            "definition": "Mind ethical issues around recourse suggestions."
          }
        ],
        "checkYourself": [
          {
            "prompt": "Designs actionable counterfactuals carefully.",
            "reveal": "Explain the idea in two sentences, name one metric or invariant you would watch, and state one mistake juniors make. Then connect it back to counterfactuals and actionable recourse."
          }
        ]
      },
      {
        "id": "explanation-pitfalls-and-evaluation",
        "heading": "Explanation pitfalls and evaluation",
        "paragraphs": [
          "Explanations can be unstable under tiny input changes, or can be manipulated. Evaluate explanation methods with faithfulness tests, stability tests, and human usefulness studies when relevant. Do not ship colorful plots as compliance theater. Document limitations next to every explanation UI. Stable, slightly incomplete explanations beat unstable precise-looking ones. Stable, slightly incomplete explanations beat unstable precise-looking ones.",
          "Hold these points explicitly while you study. Restate each one without looking at the list — recognition is not the interview bar; recall is.",
          "• Test faithfulness and stability.",
          "• Document explanation limitations in UX copy.",
          "• Avoid compliance theater without evidence.",
          "Production lens — Explanation method ≠ ground truth: SHAP, LIME, and attention maps provide post-hoc narratives that can be unstable across similar inputs. Tree models offer native feature importance; linear coefficients are interpretable only with scaled features. For LLMs, chain-of-thought may rationalize rather than reveal actual computation—use explanations to aid human review, not as legal proof."
        ],
        "keyTerms": [
          {
            "term": "Test faithfulness and stability.",
            "definition": "Test faithfulness and stability."
          },
          {
            "term": "Document explanation limitations in UX copy.",
            "definition": "Document explanation limitations in UX copy."
          },
          {
            "term": "Avoid compliance theater without evidence.",
            "definition": "Avoid compliance theater without evidence."
          }
        ],
        "checkYourself": [
          {
            "prompt": "Evaluates explanations, not only models.",
            "reveal": "Explain the idea in two sentences, name one metric or invariant you would watch, and state one mistake juniors make. Then connect it back to explanation pitfalls and evaluation."
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
          "Most interview answers fail not because the definition is wrong, but because the candidate never names how the approach breaks. Use this section as a trap checklist for explainability and interpretability.",
          "Trap: Treating SHAP values as causal truth. A strong answer preempts it — say what you would monitor, what fallback you would keep, or what simpler baseline you would try first.",
          "Trap: Explaining a model different from the one deployed. A strong answer preempts it — say what you would monitor, what fallback you would keep, or what simpler baseline you would try first.",
          "Trap: Unstable explanations without disclosure. A strong answer preempts it — say what you would monitor, what fallback you would keep, or what simpler baseline you would try first.",
          "Trap: Recourse that requires immutable attribute changes. A strong answer preempts it — say what you would monitor, what fallback you would keep, or what simpler baseline you would try first."
        ],
        "callout": {
          "tone": "warning",
          "body": "If you cannot name a failure mode, you do not yet understand the technique well enough to ship or defend it."
        },
        "checkYourself": [
          {
            "prompt": "Pick the most dangerous pitfall for Explainability and interpretability and explain how you would detect it in production or on a whiteboard.",
            "reveal": "Start with: \"Treating SHAP values as causal truth.\" Then add a detection signal (metric, test, or review question) and a mitigation."
          }
        ]
      },
      {
        "id": "deeper-lens",
        "heading": "A deeper production lens",
        "paragraphs": [
          "Explanation method ≠ ground truth. SHAP, LIME, and attention maps provide post-hoc narratives that can be unstable across similar inputs. Tree models offer native feature importance; linear coefficients are interpretable only with scaled features. For LLMs, chain-of-thought may rationalize rather than reveal actual computation—use explanations to aid human review, not as legal proof.",
          "Regulatory contexts demand traceability. GDPR \"right to explanation,\" credit adverse action notices, and medical device rules push toward interpretable models or supplementary documentation. Counterfactual explanations (\"change income by X to flip decision\") resonate with users but must respect feasibility constraints. Maintain audit logs linking predictions to model version, features, and policy rules applied."
        ],
        "keyTerms": [
          {
            "term": "Explanation method ≠ ground truth",
            "definition": "SHAP, LIME, and attention maps provide post-hoc narratives that can be unstable across similar inputs. Tree models offer native feature importance; linear coefficients are interpretable only with scaled features. For LLM…"
          },
          {
            "term": "Regulatory contexts demand traceability",
            "definition": "GDPR \"right to explanation,\" credit adverse action notices, and medical device rules push toward interpretable models or supplementary documentation. Counterfactual explanations (\"change income by X to flip decision\") re…"
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
          "You should now be able to teach explainability and interpretability as a story: what problem it solves, how the mechanism works, which assumptions it depends on, and how you would know it failed.",
          "Close the loop by writing a 90-second spoken answer out loud. If you freeze on definitions, return to the orientation and the first technical part. If you freeze on trade-offs, return to failure modes.",
          "Practice prompts from this lesson: How would you explain a denied loan decision? | Compare permutation importance and coefficient inspection. | What makes a counterfactual explanation actionable?"
        ],
        "checkYourself": [
          {
            "prompt": "Give a 90-second spoken overview of Explainability and interpretability as if starting an interview answer.",
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
        "Chooses explanation methods for a stated audience.",
        "Can compute permutation importance.",
        "Understands linear attribution baselines.",
        "Designs actionable counterfactuals carefully.",
        "Evaluates explanations, not only models."
      ],
      "nextSteps": [
        "Return to the lesson page and attempt the practice / topic lab with this chapter still open if needed.",
        "Revisit any Check yourself prompts you could not answer out loud.",
        "Optional deeper reading: A Unified Approach to Interpreting Model Predictions (SHAP) (arXiv) — https://arxiv.org/abs/1705.07874",
        "Optional deeper reading: \"Why Should I Trust You?\": Explaining the Predictions of Any Classifier (LIME) (arXiv) — https://arxiv.org/abs/1602.04938"
      ]
    }
  },
  "ai-safety-and-ethics/ai-governance": {
    "title": "Chapter: AI governance and regulation",
    "readingTime": "50-65 min",
    "premise": "EU AI Act, GDPR implications, model documentation, risk assessment, and organizational AI governance frameworks. This Learn chapter expands the short lesson summary into a full study unit you can read continuously, with interactive checks and selection-based AI search when a phrase needs a second opinion.",
    "parts": [
      {
        "id": "orientation",
        "heading": "Why this chapter exists",
        "paragraphs": [
          "Governance in 2026 is risk-tiered and operational: EU AI Act-style intuition (educational, not legal advice), model/system cards for LLM apps, audit logs for tool actions, and data residency constraints shape architecture as much as accuracy does.",
          "This chapter treats \"AI governance and regulation\" as a readable study unit: intuition first, then the mechanics you must be able to explain, then the failure modes that show up in interviews and production, and finally how to talk about the topic under time pressure.",
          "Read it like a book chapter. When a phrase is unclear, select it inside the Learn reader and use Search with AI to open Google, Perplexity, or DuckDuckGo without abandoning the chapter."
        ],
        "callout": {
          "tone": "tip",
          "body": "Target reading time is paced for depth, not skimming. Pause at each Check yourself prompt and answer out loud before revealing the guide answer."
        }
      },
      {
        "id": "governance-as-a-product-constraint",
        "heading": "Governance as a product constraint",
        "paragraphs": [
          "Governance defines who can approve models, what evidence is required, and how incidents escalate. It is not only legal theater: clear gates prevent late surprises. Map systems by risk tier (impact on rights, safety, finances). Higher tiers need stronger evals, monitoring, and human oversight. Engineers should know their system's tier and the artifacts expected at review time. Governance scales when evidence is generated by CI, not copied into slides the night before launch. Governance scales when evidence is generated by CI, not copied into slides the night before launch.",
          "Hold these points explicitly while you study. Restate each one without looking at the list — recognition is not the interview bar; recall is.",
          "• Risk-tier systems early in design.",
          "• Know required artifacts per tier.",
          "• Treat gates as enablers of predictable shipping.",
          "Production lens — Mid-2026 means operational EU AI Act readiness: Regulation (EU) 2024/1689 (AI Act) entered into force in 2024 with phased applicability; by mid-2026 organizations serving the EU need working inventories, risk classifications, and evidence for high-risk and GPAI-related duties—not slideware. Map each deployed system to a risk tier, owner, and control set: evals, human oversight, transparency, logging, and incident response proportionate to impact.\n\nHiring, credit, and biometric use cases demand deeper impact assessment and monitoring than internal writing assistants. GPAI/provider obligations may sit with model vendors, but deployers still own application-level misuse, data handling, and downstream harm. Contracts and technical controls must reflect that split of responsibility."
        ],
        "keyTerms": [
          {
            "term": "Risk-tier systems early in design.",
            "definition": "Risk-tier systems early in design."
          },
          {
            "term": "Know required artifacts per tier.",
            "definition": "Know required artifacts per tier."
          },
          {
            "term": "Treat gates as enablers of predictable",
            "definition": "Treat gates as enablers of predictable shipping."
          }
        ],
        "checkYourself": [
          {
            "prompt": "Can risk-tier an AI feature.",
            "reveal": "Regulation (EU) 2024/1689 (AI Act) entered into force in 2024 with phased applicability; by mid-2026 organizations serving the EU need working inventories, risk classifications, and evidence for high-risk and GPAI-related duties—not slideware. Map each deployed system to a risk tier, owner, and control set: evals, human oversight, transparency, logging, and incident response proportionate to impact.\n\nHiring, credit, and biometric use cases demand deeper impact assessment and monitoring than internal writing assistants. GPAI/provider obligations may sit with model vendors, but deployers still own application-level misuse, data handling, and downstream harm. Contracts and technical controls must reflect that split of responsibility."
          }
        ]
      },
      {
        "id": "model-cards-and-datasheets",
        "heading": "Model cards and datasheets",
        "paragraphs": [
          "Model cards communicate intended use, metrics, limitations, fairness evaluations, and ethical considerations. Datasheets describe dataset provenance, collection, and known gaps. Write them so a new on-call engineer and an external auditor can both understand limits. Keep them versioned with the model. Empty marketing language fails review; concrete failure modes pass. Risk tiers should change when tools gain side effects or when audiences expand. Risk tiers should change when tools gain side effects or when audiences expand.",
          "Hold these points explicitly while you study. Restate each one without looking at the list — recognition is not the interview bar; recall is.",
          "• Be concrete about out-of-scope uses and failure modes.",
          "• Version cards with model releases.",
          "• Link to evaluation evidence, not slogans.",
          "Production lens — NIST AI RMF remains the operating language for many teams: The NIST AI RMF (Govern, Map, Measure, Manage) is voluntary but widely used to structure programs that produce evidence useful under multiple regimes. Map: know systems, data, and harm scenarios. Measure: evals, red teams, monitoring. Manage: gates, rollback, incident learning. Govern: roles, policies, and third-party oversight. Use it as an internal control catalog even when legal obligations come from the EU Act or sector rules.\n\nModel cards, data sheets, and system cards only work if they stay synchronized with production versions. A card that describes last year’s model while canaries run a new prompt is a liability. Tie documentation updates to the same promote pipeline as code."
        ],
        "keyTerms": [
          {
            "term": "Be concrete about out-of-scope uses and",
            "definition": "Be concrete about out-of-scope uses and failure modes."
          },
          {
            "term": "Version cards with model releases.",
            "definition": "Version cards with model releases."
          },
          {
            "term": "Link to evaluation evidence, not slogans.",
            "definition": "Link to evaluation evidence, not slogans."
          }
        ],
        "workedExample": {
          "title": "Generate a minimal model card dict",
          "body": "Narrate what each shape and step is doing. If you only recognize the API call, you do not own the idea yet — rewrite the example from memory after one pass.",
          "code": "def model_card(name, intended_use, metrics, limitations):\n    return {\n        \"name\": name,\n        \"intended_use\": intended_use,\n        \"metrics\": metrics,\n        \"limitations\": limitations,\n        \"out_of_scope\": [\"medical diagnosis\", \"criminal justice scoring\"],\n    }\n\nprint(model_card(\"churn-v3\", \"email retention offers\", {\"auc\": 0.84}, [\"unstable for new markets\"]))",
          "language": "python"
        },
        "checkYourself": [
          {
            "prompt": "Writes a concrete model card.",
            "reveal": "The NIST AI RMF (Govern, Map, Measure, Manage) is voluntary but widely used to structure programs that produce evidence useful under multiple regimes. Map: know systems, data, and harm scenarios. Measure: evals, red teams, monitoring. Manage: gates, rollback, incident learning. Govern: roles, policies, and third-party oversight. Use it as an internal control catalog even when legal obligations come from the EU Act or sector rules.\n\nModel cards, data sheets, and system cards only work if they stay synchronized with production versions. A card that describes last year’s model while canaries run a new prompt is a liability. Tie documentation updates to the same promote pipeline as code."
          }
        ]
      },
      {
        "id": "risk-assessments-and-launch-reviews",
        "heading": "Risk assessments and launch reviews",
        "paragraphs": [
          "Risk assessments identify hazards, likelihood, severity, mitigations, and residual risk. Launch reviews check that mitigations are implemented (evals, monitoring, kill switches, privacy reviews). Record decisions and dissent. For LLM apps, include prompt injection, data leakage, and unsafe tool use as first-class hazards. Model cards that admit limitations increase trust more than cards that claim universality. Model cards that admit limitations increase trust more than cards that claim universality.",
          "Hold these points explicitly while you study. Restate each one without looking at the list — recognition is not the interview bar; recall is.",
          "• List hazards with mitigations and residual risk.",
          "• Verify mitigations exist before launch.",
          "• Record decisions for later audits.",
          "Production lens — Runtime controls and supply chain are governance: Access control on tools/data, retention limits on prompts, regional routing, and audit logs are governance primitives. So is vendor diligence for hosted models: training-data opt-out, subprocessors, uptime, and eval rights on your tasks. Open-weight self-hosting shifts some risks (exfiltration, fine-tune misuse) onto your perimeter without removing responsibility for outputs.\n\nIncidents should change gates. If an agent issues an out-of-policy refund, the fix is dual-control tools plus a new offline case—not only a sterner system prompt. Cross-functional review boards unblock high-risk launches when they demand evidence packs, not unanimous philosophy. Mid-2026 competence is showing the inventory, the tier, the metrics, and the rollback in one coherent story."
        ],
        "keyTerms": [
          {
            "term": "List hazards with mitigations and residual",
            "definition": "List hazards with mitigations and residual risk."
          },
          {
            "term": "Verify mitigations exist before launch.",
            "definition": "Verify mitigations exist before launch."
          },
          {
            "term": "Record decisions for later audits.",
            "definition": "Record decisions for later audits."
          }
        ],
        "checkYourself": [
          {
            "prompt": "Participates in hazard-driven launch reviews.",
            "reveal": "Access control on tools/data, retention limits on prompts, regional routing, and audit logs are governance primitives. So is vendor diligence for hosted models: training-data opt-out, subprocessors, uptime, and eval rights on your tasks. Open-weight self-hosting shifts some risks (exfiltration, fine-tune misuse) onto your perimeter without removing responsibility for outputs.\n\nIncidents should change gates. If an agent issues an out-of-policy refund, the fix is dual-control tools plus a new offline case—not only a sterner system prompt. Cross-functional review boards unblock high-risk launches when they demand evidence packs, not unanimous philosophy. Mid-2026 competence is showing the inventory, the tier, the metrics, and the rollback in one coherent story."
          }
        ]
      },
      {
        "id": "policies-for-data-privacy-and-retention",
        "heading": "Policies for data, privacy, and retention",
        "paragraphs": [
          "Governance includes data minimization, consent, retention, and deletion (including \"right to be forgotten\" impacts on models). Know whether your system can delete or retrain, and how embeddings/logs retain personal data. Coordinate with legal/security early when planning durable memories or training on user content. Deletion and retention are governance issues that intersect model retraining cost—plan both. Deletion and retention are governance issues that intersect model retraining cost—plan both.",
          "Hold these points explicitly while you study. Restate each one without looking at the list — recognition is not the interview bar; recall is.",
          "• Minimize and retain data with purpose limits.",
          "• Plan deletion impacts on models and indexes.",
          "• Review user-content training/memory explicitly.",
          "Production lens — Mid-2026 means operational EU AI Act readiness: Regulation (EU) 2024/1689 (AI Act) entered into force in 2024 with phased applicability; by mid-2026 organizations serving the EU need working inventories, risk classifications, and evidence for high-risk and GPAI-related duties—not slideware. Map each deployed system to a risk tier, owner, and control set: evals, human oversight, transparency, logging, and incident response proportionate to impact.\n\nHiring, credit, and biometric use cases demand deeper impact assessment and monitoring than internal writing assistants. GPAI/provider obligations may sit with model vendors, but deployers still own application-level misuse, data handling, and downstream harm. Contracts and technical controls must reflect that split of responsibility."
        ],
        "keyTerms": [
          {
            "term": "Minimize and retain data with purpose",
            "definition": "Minimize and retain data with purpose limits."
          },
          {
            "term": "Plan deletion impacts on models and",
            "definition": "Plan deletion impacts on models and indexes."
          },
          {
            "term": "Review user-content training/memory explicitly.",
            "definition": "Review user-content training/memory explicitly."
          }
        ],
        "workedExample": {
          "title": "Check whether a request requires model retrain",
          "body": "Narrate what each shape and step is doing. If you only recognize the API call, you do not own the idea yet — rewrite the example from memory after one pass.",
          "code": "def deletion_impact(user_id, trained_on_users, hard_delete_logs=True):\n    in_train = user_id in trained_on_users\n    return {\n        \"remove_logs\": hard_delete_logs,\n        \"retrain_required\": in_train,\n        \"reembed_required\": in_train,\n    }\n\nprint(deletion_impact(\"u9\", {\"u1\", \"u9\"}))",
          "language": "python"
        },
        "checkYourself": [
          {
            "prompt": "Plans deletion/retention for user data in AI systems.",
            "reveal": "Explain the idea in two sentences, name one metric or invariant you would watch, and state one mistake juniors make. Then connect it back to policies for data, privacy, and retention."
          }
        ]
      },
      {
        "id": "continuous-compliance-and-culture",
        "heading": "Continuous compliance and culture",
        "paragraphs": [
          "Governance fails when it is a one-time PDF. Tie policies to CI checks (eval suites, license scans), recurring audits, and blameless incident learning. Empower engineers to pause launches. Celebrate well-written limitations sections—they are signs of maturity, not weakness. Empower engineers to halt launches; culture is part of the control system. Empower engineers to halt launches; culture is part of the control system.",
          "Hold these points explicitly while you study. Restate each one without looking at the list — recognition is not the interview bar; recall is.",
          "• Automate evidence collection in CI where possible.",
          "• Revisit risk tiers when product scope expands.",
          "• Build culture that rewards surfacing risks early.",
          "Production lens — NIST AI RMF remains the operating language for many teams: The NIST AI RMF (Govern, Map, Measure, Manage) is voluntary but widely used to structure programs that produce evidence useful under multiple regimes. Map: know systems, data, and harm scenarios. Measure: evals, red teams, monitoring. Manage: gates, rollback, incident learning. Govern: roles, policies, and third-party oversight. Use it as an internal control catalog even when legal obligations come from the EU Act or sector rules.\n\nModel cards, data sheets, and system cards only work if they stay synchronized with production versions. A card that describes last year’s model while canaries run a new prompt is a liability. Tie documentation updates to the same promote pipeline as code."
        ],
        "keyTerms": [
          {
            "term": "Automate evidence collection in CI where",
            "definition": "Automate evidence collection in CI where possible."
          },
          {
            "term": "Revisit risk tiers when product scope",
            "definition": "Revisit risk tiers when product scope expands."
          },
          {
            "term": "Build culture that rewards surfacing risks",
            "definition": "Build culture that rewards surfacing risks early."
          }
        ],
        "checkYourself": [
          {
            "prompt": "Connects governance to CI and incidents.",
            "reveal": "Explain the idea in two sentences, name one metric or invariant you would watch, and state one mistake juniors make. Then connect it back to continuous compliance and culture."
          }
        ]
      },
      {
        "id": "risk-tiered-governance-system-cards-audit-logs-and-residency",
        "heading": "Risk-tiered governance, system cards, audit logs, and residency",
        "paragraphs": [
          "Regulators and enterprise buyers increasingly expect risk-tiered controls. Using EU AI Act-style intuition for education—not as legal advice—helps structure reviews: unacceptable-use categories (e.g., social scoring-like patterns) are blocked; high-risk decision systems need stronger documentation, human oversight, and quality management; limited-risk apps emphasize transparency (user knows they interact with AI); minimal-risk freer iteration still needs basic security and privacy hygiene. Map your product to a tier with counsel; engineering’s job is to make the tier real in code paths. For LLM apps, publish model cards and system cards: intended use, out-of-scope uses, evaluation summaries, known failure modes, tool permissions, and escalation paths. Audit logs for tool actions (who/what/when/why/idempotency key/approver) are evidence in incidents and compliance reviews. Data residency and cross-border processing constraints may force regional open-weight serving, regional indexes, and prompt/log storage rules—architecture must follow. Retention, deletion, and training-data opt-out commitments should connect to reindex and fine-tune invalidation runbooks. Governance that ends as a slide deck fails; governance that blocks a deploy when cards, evals, or audit sinks are missing actually protects users.",
          "Hold these points explicitly while you study. Restate each one without looking at the list — recognition is not the interview bar; recall is.",
          "• Risk-tier systems (unacceptable/high/limited/minimal) to size oversight—educational framing, involve counsel for compliance.",
          "• Ship model/system cards that cover tools, evals, and out-of-scope uses for LLM apps.",
          "• Audit-log privileged tool actions with approver and idempotency metadata.",
          "• Design for data residency: regional inference, indexes, and log storage when required.",
          "Production lens — Runtime controls and supply chain are governance: Access control on tools/data, retention limits on prompts, regional routing, and audit logs are governance primitives. So is vendor diligence for hosted models: training-data opt-out, subprocessors, uptime, and eval rights on your tasks. Open-weight self-hosting shifts some risks (exfiltration, fine-tune misuse) onto your perimeter without removing responsibility for outputs.\n\nIncidents should change gates. If an agent issues an out-of-policy refund, the fix is dual-control tools plus a new offline case—not only a sterner system prompt. Cross-functional review boards unblock high-risk launches when they demand evidence packs, not unanimous philosophy. Mid-2026 competence is showing the inventory, the tier, the metrics, and the rollback in one coherent story."
        ],
        "keyTerms": [
          {
            "term": "Risk-tier systems (unacceptable/high/limited/…",
            "definition": "Risk-tier systems (unacceptable/high/limited/minimal) to size oversight—educational framing, involve counsel for compliance."
          },
          {
            "term": "Ship model/system cards that cover tools,",
            "definition": "Ship model/system cards that cover tools, evals, and out-of-scope uses for LLM apps."
          },
          {
            "term": "Audit-log privileged tool actions with approver",
            "definition": "Audit-log privileged tool actions with approver and idempotency metadata."
          },
          {
            "term": "Design for data residency: regional inference,",
            "definition": "Design for data residency: regional inference, indexes, and log storage when required."
          }
        ],
        "workedExample": {
          "title": "Toy risk tier classifier for launch review",
          "body": "Narrate what each shape and step is doing. If you only recognize the API call, you do not own the idea yet — rewrite the example from memory after one pass.",
          "code": "def risk_tier(feature):\n    if feature.get('prohibited_use'):\n        return 'unacceptable_review_block'\n    if feature.get('affects_legal_or_credit') or feature.get('safety_critical'):\n        return 'high'\n    if feature.get('user_facing_chat'):\n        return 'limited'\n    return 'minimal'\n\nprint(risk_tier({'user_facing_chat': True}))\nprint(risk_tier({'affects_legal_or_credit': True}))\nprint(risk_tier({'prohibited_use': True}))",
          "language": "python"
        },
        "checkYourself": [
          {
            "prompt": "Can risk-tier an LLM feature and list required artifacts per tier.",
            "reveal": "Explain the idea in two sentences, name one metric or invariant you would watch, and state one mistake juniors make. Then connect it back to risk-tiered governance, system cards, audit logs, and residency."
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
          "Most interview answers fail not because the definition is wrong, but because the candidate never names how the approach breaks. Use this section as a trap checklist for ai governance and regulation.",
          "Trap: Generic cards with no failure modes. A strong answer preempts it — say what you would monitor, what fallback you would keep, or what simpler baseline you would try first.",
          "Trap: Ignoring LLM tool hazards in risk reviews. A strong answer preempts it — say what you would monitor, what fallback you would keep, or what simpler baseline you would try first.",
          "Trap: No deletion story for trained user content. A strong answer preempts it — say what you would monitor, what fallback you would keep, or what simpler baseline you would try first.",
          "Trap: Governance only at the last mile before launch. A strong answer preempts it — say what you would monitor, what fallback you would keep, or what simpler baseline you would try first.",
          "Trap: Treating a model card as optional marketing copy. A strong answer preempts it — say what you would monitor, what fallback you would keep, or what simpler baseline you would try first.",
          "Trap: No audit trail for agent tool actions that move money or data. A strong answer preempts it — say what you would monitor, what fallback you would keep, or what simpler baseline you would try first.",
          "Trap: Sending prompts to a foreign region when contracts require residency. A strong answer preempts it — say what you would monitor, what fallback you would keep, or what simpler baseline you would try first."
        ],
        "callout": {
          "tone": "warning",
          "body": "If you cannot name a failure mode, you do not yet understand the technique well enough to ship or defend it."
        },
        "checkYourself": [
          {
            "prompt": "Pick the most dangerous pitfall for AI governance and regulation and explain how you would detect it in production or on a whiteboard.",
            "reveal": "Start with: \"Generic cards with no failure modes.\" Then add a detection signal (metric, test, or review question) and a mitigation."
          }
        ]
      },
      {
        "id": "deeper-lens",
        "heading": "A deeper production lens",
        "paragraphs": [
          "Mid-2026 means operational EU AI Act readiness. Regulation (EU) 2024/1689 (AI Act) entered into force in 2024 with phased applicability; by mid-2026 organizations serving the EU need working inventories, risk classifications, and evidence for high-risk and GPAI-related duties—not slideware. Map each deployed system to a risk tier, owner, and control set: evals, human oversight, transparency, logging, and incident response proportionate to impact.\n\nHiring, credit, and biometric use cases demand deeper impact assessment and monitoring than internal writing assistants. GPAI/provider obligations may sit with model vendors, but deployers still own application-level misuse, data handling, and downstream harm. Contracts and technical controls must reflect that split of responsibility.",
          "NIST AI RMF remains the operating language for many teams. The NIST AI RMF (Govern, Map, Measure, Manage) is voluntary but widely used to structure programs that produce evidence useful under multiple regimes. Map: know systems, data, and harm scenarios. Measure: evals, red teams, monitoring. Manage: gates, rollback, incident learning. Govern: roles, policies, and third-party oversight. Use it as an internal control catalog even when legal obligations come from the EU Act or sector rules.\n\nModel cards, data sheets, and system cards only work if they stay synchronized with production versions. A card that describes last year’s model while canaries run a new prompt is a liability. Tie documentation updates to the same promote pipeline as code.",
          "Runtime controls and supply chain are governance. Access control on tools/data, retention limits on prompts, regional routing, and audit logs are governance primitives. So is vendor diligence for hosted models: training-data opt-out, subprocessors, uptime, and eval rights on your tasks. Open-weight self-hosting shifts some risks (exfiltration, fine-tune misuse) onto your perimeter without removing responsibility for outputs.\n\nIncidents should change gates. If an agent issues an out-of-policy refund, the fix is dual-control tools plus a new offline case—not only a sterner system prompt. Cross-functional review boards unblock high-risk launches when they demand evidence packs, not unanimous philosophy. Mid-2026 competence is showing the inventory, the tier, the metrics, and the rollback in one coherent story."
        ],
        "keyTerms": [
          {
            "term": "Mid-2026 means operational EU AI Act readiness",
            "definition": "Regulation (EU) 2024/1689 (AI Act) entered into force in 2024 with phased applicability; by mid-2026 organizations serving the EU need working inventories, risk classifications, and evidence for high-risk and GPAI-relate…"
          },
          {
            "term": "NIST AI RMF remains the operating language for many teams",
            "definition": "The NIST AI RMF (Govern, Map, Measure, Manage) is voluntary but widely used to structure programs that produce evidence useful under multiple regimes. Map: know systems, data, and harm scenarios. Measure: evals, red team…"
          },
          {
            "term": "Runtime controls and supply chain are governance",
            "definition": "Access control on tools/data, retention limits on prompts, regional routing, and audit logs are governance primitives. So is vendor diligence for hosted models: training-data opt-out, subprocessors, uptime, and eval righ…"
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
          "You should now be able to teach ai governance and regulation as a story: what problem it solves, how the mechanism works, which assumptions it depends on, and how you would know it failed.",
          "Close the loop by writing a 90-second spoken answer out loud. If you freeze on definitions, return to the orientation and the first technical part. If you freeze on trade-offs, return to failure modes.",
          "Practice prompts from this lesson: What belongs in a model card for a credit model? | How do you risk-tier an internal LLM assistant? | How does right-to-be-forgotten affect embeddings?"
        ],
        "checkYourself": [
          {
            "prompt": "Give a 90-second spoken overview of AI governance and regulation as if starting an interview answer.",
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
        "Can risk-tier an AI feature.",
        "Writes a concrete model card.",
        "Participates in hazard-driven launch reviews.",
        "Plans deletion/retention for user data in AI systems.",
        "Connects governance to CI and incidents."
      ],
      "nextSteps": [
        "Return to the lesson page and attempt the practice / topic lab with this chapter still open if needed.",
        "Revisit any Check yourself prompts you could not answer out loud.",
        "Optional deeper reading: Regulation (EU) 2024/1689 — Artificial Intelligence Act (EUR-Lex) — https://eur-lex.europa.eu/eli/reg/2024/1689/en",
        "Optional deeper reading: European Commission — AI Act overview (European Commission) — https://digital-strategy.ec.europa.eu/en/policies/regulatory-framework-ai"
      ]
    }
  }
};
