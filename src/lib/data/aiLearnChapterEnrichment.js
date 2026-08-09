/** @type {Record<string, {
 *   parts: Record<string, Partial<import('./learnChapters.js').LearnChapterPart>>,
 *   wrapUp?: { nextSteps?: import('./learnChapters.js').LearnNextStep[] }
 * }>} */
export const aiLearnChapterEnrichment = {
  "ml-foundations/math-for-ml": {
    "parts": {
      "data-as-vectors-and-linear-maps": {
        "mermaid": {
          "title": "Feature → model pipeline",
          "caption": "Feature → model pipeline",
          "code": "%%{init: {'theme':'dark','themeVariables':{'primaryColor':'#696cff','primaryTextColor':'#e4e4e7','primaryBorderColor':'#5658d4','lineColor':'#a1a1aa','secondaryColor':'#2b2c40','tertiaryColor':'#232333'}}}%%\nflowchart LR\n  A[Raw table] --> B[Clean]\n  B --> C[Encode]\n  C --> D[Scale]\n  D --> E[Model]\n  E --> F[Metrics]"
        },
        "workedExample": {
          "title": "Feature scale changes distances",
          "body": "Compare Euclidean distance before and after scaling one coordinate by 100×.",
          "language": "python",
          "code": "import numpy as np\na = np.array([1.0, 0.0])\nb = np.array([2.0, 100.0])\nprint(\"raw distance:\", round(np.linalg.norm(a - b), 3))\nscale = np.array([1.0, 0.01])\nprint(\"scaled distance:\", round(np.linalg.norm((a - b) * scale), 3))"
        }
      },
      "least-squares-pca-and-conditioning": {
        "mermaid": {
          "title": "Train / validate / deploy loop",
          "caption": "Train / validate / deploy loop",
          "code": "%%{init: {'theme':'dark','themeVariables':{'primaryColor':'#696cff','primaryTextColor':'#e4e4e7','primaryBorderColor':'#5658d4','lineColor':'#a1a1aa','secondaryColor':'#2b2c40','tertiaryColor':'#232333'}}}%%\nflowchart TD\n  A[Train split] --> B[Fit model]\n  B --> C[Validate]\n  C --> D{Gate?}\n  D -->|pass| E[Serve]\n  D -->|fail| A"
        },
        "interactiveDemo": {
          "title": "Conditioning playground",
          "body": "Increase feature noise and watch the condition number grow.",
          "sliders": [
            {
              "id": "noise",
              "label": "Noise σ",
              "min": 0.01,
              "max": 2,
              "step": 0.05,
              "value": 0.05
            }
          ],
          "codeTemplate": "import numpy as np\nrng = np.random.default_rng(7)\nnoise = {{noise}}\nX = rng.normal(size=(8, 3))\nw = np.array([1.5, -2.0, 0.7])\ny = X @ w + rng.normal(scale=noise, size=8)\n_, _, _, sv = np.linalg.lstsq(X, y, rcond=None)\nprint(\"noise\", noise)\nprint(\"condition\", round(sv[0]/sv[-1], 3))",
          "language": "python"
        }
      },
      "vector-calculus-for-learning-rules": {
        "workedExample": {
          "title": "One gradient descent step",
          "body": "Manual update on a quadratic bowl to connect calculus to code.",
          "language": "python",
          "code": "x = 10.0\nlr = 0.1\nfor step in range(5):\n    grad = 2.0 * (x - 3.0)\n    x -= lr * grad\nprint(\"x after 5 steps:\", round(x, 4))"
        }
      }
    },
    "wrapUp": {
      "nextSteps": [
        {
          "label": "Open the topic lab diagram and decision guide",
          "href": "/module/ml-foundations/lesson/math-for-ml#topic-lab"
        },
        {
          "label": "Run the primary Python lab exercise",
          "href": "/module/ml-foundations/lesson/math-for-ml#ml-practice-lab",
          "exerciseId": "gradient-descent-from-scratch"
        }
      ]
    }
  },
  "ml-foundations/classical-ml-algorithms": {
    "parts": {
      "inductive-bias-and-baselines": {
        "mermaid": {
          "title": "Feature → model pipeline",
          "caption": "Feature → model pipeline",
          "code": "%%{init: {'theme':'dark','themeVariables':{'primaryColor':'#696cff','primaryTextColor':'#e4e4e7','primaryBorderColor':'#5658d4','lineColor':'#a1a1aa','secondaryColor':'#2b2c40','tertiaryColor':'#232333'}}}%%\nflowchart LR\n  A[Raw table] --> B[Clean]\n  B --> C[Encode]\n  C --> D[Scale]\n  D --> E[Model]\n  E --> F[Metrics]"
        },
        "workedExample": {
          "title": "Cross-validation score spread",
          "body": "Train three sklearn estimators on the same folds and print mean metrics.",
          "language": "python",
          "code": "from sklearn.datasets import make_classification\nfrom sklearn.model_selection import cross_val_score\nfrom sklearn.linear_model import LogisticRegression\nfrom sklearn.tree import DecisionTreeClassifier\nfrom sklearn.neighbors import KNeighborsClassifier\nX, y = make_classification(n_samples=400, n_features=8, random_state=0)\nmodels = {\n    \"logistic\": LogisticRegression(max_iter=200),\n    \"tree\": DecisionTreeClassifier(max_depth=4, random_state=0),\n    \"knn\": KNeighborsClassifier(n_neighbors=7),\n}\nfor name, model in models.items():\n    scores = cross_val_score(model, X, y, cv=3)\n    print(name, \"mean acc\", round(scores.mean(), 3), \"std\", round(scores.std(), 3))"
        }
      },
      "linear-and-logistic-models": {
        "mermaid": {
          "title": "Train / validate / deploy loop",
          "caption": "Train / validate / deploy loop",
          "code": "%%{init: {'theme':'dark','themeVariables':{'primaryColor':'#696cff','primaryTextColor':'#e4e4e7','primaryBorderColor':'#5658d4','lineColor':'#a1a1aa','secondaryColor':'#2b2c40','tertiaryColor':'#232333'}}}%%\nflowchart TD\n  A[Train split] --> B[Fit model]\n  B --> C[Validate]\n  C --> D{Gate?}\n  D -->|pass| E[Serve]\n  D -->|fail| A"
        }
      },
      "neighbors-margins-and-kernels": {
        "workedExample": {
          "title": "Feature scale changes distances",
          "body": "Compare Euclidean distance before and after scaling one coordinate by 100×.",
          "language": "python",
          "code": "import numpy as np\na = np.array([1.0, 0.0])\nb = np.array([2.0, 100.0])\nprint(\"raw distance:\", round(np.linalg.norm(a - b), 3))\nscale = np.array([1.0, 0.01])\nprint(\"scaled distance:\", round(np.linalg.norm((a - b) * scale), 3))"
        }
      },
      "trees-forests-and-boosting": {
        "interactiveDemo": {
          "title": "Tree depth vs flexibility",
          "body": "Sweep tree depth on a toy dataset (printed accuracy).",
          "sliders": [
            {
              "id": "depth",
              "label": "Max depth",
              "min": 1,
              "max": 8,
              "step": 1,
              "value": 3
            }
          ],
          "codeTemplate": "from sklearn.tree import DecisionTreeClassifier\nfrom sklearn.datasets import make_classification\nfrom sklearn.model_selection import cross_val_score\ndepth = int({{depth}})\nX, y = make_classification(n_samples=300, random_state=2)\nclf = DecisionTreeClassifier(max_depth=depth, random_state=0)\nacc = cross_val_score(clf, X, y, cv=3).mean()\nprint(\"depth\", depth, \"cv acc\", round(acc, 3))",
          "language": "python"
        }
      }
    },
    "wrapUp": {
      "nextSteps": [
        {
          "label": "Open the topic lab diagram and decision guide",
          "href": "/module/ml-foundations/lesson/classical-ml-algorithms#topic-lab"
        },
        {
          "label": "Run the primary Python lab exercise",
          "href": "/module/ml-foundations/lesson/classical-ml-algorithms#ml-practice-lab",
          "exerciseId": "model-selection-challenge"
        }
      ]
    }
  },
  "ml-foundations/model-evaluation": {
    "parts": {
      "evaluation-as-experiment-design": {
        "mermaid": {
          "title": "Train / validate / deploy loop",
          "caption": "Train / validate / deploy loop",
          "code": "%%{init: {'theme':'dark','themeVariables':{'primaryColor':'#696cff','primaryTextColor':'#e4e4e7','primaryBorderColor':'#5658d4','lineColor':'#a1a1aa','secondaryColor':'#2b2c40','tertiaryColor':'#232333'}}}%%\nflowchart TD\n  A[Train split] --> B[Fit model]\n  B --> C[Validate]\n  C --> D{Gate?}\n  D -->|pass| E[Serve]\n  D -->|fail| A"
        },
        "workedExample": {
          "title": "Leakage inflates validation score",
          "body": "Fit a scaler on all data vs inside each CV fold.",
          "language": "python",
          "code": "import numpy as np\nfrom sklearn.model_selection import cross_val_score\nfrom sklearn.pipeline import Pipeline\nfrom sklearn.preprocessing import StandardScaler\nfrom sklearn.linear_model import LogisticRegression\nfrom sklearn.datasets import make_classification\nX, y = make_classification(n_samples=300, n_features=6, random_state=1)\nleaky = Pipeline([(\"scale\", StandardScaler()), (\"clf\", LogisticRegression(max_iter=200))])\nleaky.named_steps[\"scale\"].fit(X)\nsafe = Pipeline([(\"scale\", StandardScaler()), (\"clf\", LogisticRegression(max_iter=200))])\nprint(\"leaky CV:\", round(cross_val_score(leaky, X, y, cv=3).mean(), 3))\nprint(\"safe CV:\", round(cross_val_score(safe, X, y, cv=3).mean(), 3))"
        }
      },
      "cross-validation-groups-and-time": {
        "mermaid": {
          "title": "Eval harness",
          "caption": "Eval harness",
          "code": "%%{init: {'theme':'dark','themeVariables':{'primaryColor':'#696cff','primaryTextColor':'#e4e4e7','primaryBorderColor':'#5658d4','lineColor':'#a1a1aa','secondaryColor':'#2b2c40','tertiaryColor':'#232333'}}}%%\nflowchart LR\n  A[Golden set] --> B[Run model]\n  B --> C[Score]\n  C --> D{Pass gate?}\n  D -->|yes| E[Ship]\n  D -->|no| F[Block]"
        },
        "workedExample": {
          "title": "Cross-validation score spread",
          "body": "Train three sklearn estimators on the same folds and print mean metrics.",
          "language": "python",
          "code": "from sklearn.datasets import make_classification\nfrom sklearn.model_selection import cross_val_score\nfrom sklearn.linear_model import LogisticRegression\nfrom sklearn.tree import DecisionTreeClassifier\nfrom sklearn.neighbors import KNeighborsClassifier\nX, y = make_classification(n_samples=400, n_features=8, random_state=0)\nmodels = {\n    \"logistic\": LogisticRegression(max_iter=200),\n    \"tree\": DecisionTreeClassifier(max_depth=4, random_state=0),\n    \"knn\": KNeighborsClassifier(n_neighbors=7),\n}\nfor name, model in models.items():\n    scores = cross_val_score(model, X, y, cv=3)\n    print(name, \"mean acc\", round(scores.mean(), 3), \"std\", round(scores.std(), 3))"
        }
      },
      "metrics-thresholds-and-roc-vs-pr": {
        "workedExample": {
          "title": "Eval harness pass/fail",
          "body": "Score answers against gold strings with a simple overlap gate.",
          "language": "python",
          "code": "def score(answer, gold):\n    a = set(answer.lower().split())\n    g = set(gold.lower().split())\n    return len(a & g) / max(1, len(g))\ncases = [(\"reset via email link\", \"users reset password using email link\")]\nfor ans, gold in cases:\n    s = score(ans, gold)\n    print(round(s,3), \"pass\", s >= 0.4)"
        }
      }
    },
    "wrapUp": {
      "nextSteps": [
        {
          "label": "Open the topic lab diagram and decision guide",
          "href": "/module/ml-foundations/lesson/model-evaluation#topic-lab"
        },
        {
          "label": "Run the primary Python lab exercise",
          "href": "/module/ml-foundations/lesson/model-evaluation#ml-practice-lab",
          "exerciseId": "cross-validation-comparison"
        }
      ]
    }
  },
  "deep-learning/neural-network-fundamentals": {
    "parts": {
      "from-affine-maps-to-representations": {
        "mermaid": {
          "title": "Token lifecycle",
          "caption": "Token lifecycle",
          "code": "%%{init: {'theme':'dark','themeVariables':{'primaryColor':'#696cff','primaryTextColor':'#e4e4e7','primaryBorderColor':'#5658d4','lineColor':'#a1a1aa','secondaryColor':'#2b2c40','tertiaryColor':'#232333'}}}%%\nflowchart LR\n  A[Text] --> B[Tokenize]\n  B --> C[Embed]\n  C --> D[Attention]\n  D --> E[Decode]"
        }
      },
      "chain-rule-as-backward-plumbing": {
        "mermaid": {
          "title": "Scaled dot-product attention",
          "caption": "Scaled dot-product attention",
          "code": "%%{init: {'theme':'dark','themeVariables':{'primaryColor':'#696cff','primaryTextColor':'#e4e4e7','primaryBorderColor':'#5658d4','lineColor':'#a1a1aa','secondaryColor':'#2b2c40','tertiaryColor':'#232333'}}}%%\nflowchart LR\n  Q[Queries] --> S[Scores]\n  K[Keys] --> S\n  S --> SM[Softmax]\n  SM --> V[Values]\n  V --> O[Context]"
        }
      }
    },
    "wrapUp": {
      "nextSteps": [
        {
          "label": "Open the topic lab diagram and decision guide",
          "href": "/module/deep-learning/lesson/neural-network-fundamentals#topic-lab"
        },
        {
          "label": "Run the primary Python lab exercise",
          "href": "/module/deep-learning/lesson/neural-network-fundamentals#ml-practice-lab",
          "exerciseId": "build-simple-nn"
        }
      ]
    }
  },
  "deep-learning/cnn-and-computer-vision": {
    "parts": {
      "locality-and-shared-filters": {
        "mermaid": {
          "title": "CNN block stack",
          "caption": "CNN block stack",
          "code": "%%{init: {'theme':'dark','themeVariables':{'primaryColor':'#696cff','primaryTextColor':'#e4e4e7','primaryBorderColor':'#5658d4','lineColor':'#a1a1aa','secondaryColor':'#2b2c40','tertiaryColor':'#232333'}}}%%\nflowchart LR\n  A[Image] --> B[Conv]\n  B --> C[ReLU]\n  C --> D[Pool]\n  D --> E[Conv]\n  E --> F[FC head]"
        }
      },
      "stride-padding-and-receptive-fields": {
        "mermaid": {
          "title": "Feature → model pipeline",
          "caption": "Feature → model pipeline",
          "code": "%%{init: {'theme':'dark','themeVariables':{'primaryColor':'#696cff','primaryTextColor':'#e4e4e7','primaryBorderColor':'#5658d4','lineColor':'#a1a1aa','secondaryColor':'#2b2c40','tertiaryColor':'#232333'}}}%%\nflowchart LR\n  A[Raw table] --> B[Clean]\n  B --> C[Encode]\n  C --> D[Scale]\n  D --> E[Model]\n  E --> F[Metrics]"
        }
      }
    },
    "wrapUp": {
      "nextSteps": [
        {
          "label": "Open the topic lab diagram and decision guide",
          "href": "/module/deep-learning/lesson/cnn-and-computer-vision#topic-lab"
        },
        {
          "label": "Run the primary Python lab exercise",
          "href": "/module/deep-learning/lesson/cnn-and-computer-vision#ml-practice-lab",
          "exerciseId": "numpy-conv2d-layer"
        }
      ]
    }
  },
  "deep-learning/transformer-architecture": {
    "parts": {
      "tokens-as-contextual-vectors": {
        "mermaid": {
          "title": "Scaled dot-product attention",
          "caption": "Scaled dot-product attention",
          "code": "%%{init: {'theme':'dark','themeVariables':{'primaryColor':'#696cff','primaryTextColor':'#e4e4e7','primaryBorderColor':'#5658d4','lineColor':'#a1a1aa','secondaryColor':'#2b2c40','tertiaryColor':'#232333'}}}%%\nflowchart LR\n  Q[Queries] --> S[Scores]\n  K[Keys] --> S\n  S --> SM[Softmax]\n  SM --> V[Values]\n  V --> O[Context]"
        }
      },
      "qkv-and-scaled-dot-product": {
        "mermaid": {
          "title": "Token lifecycle",
          "caption": "Token lifecycle",
          "code": "%%{init: {'theme':'dark','themeVariables':{'primaryColor':'#696cff','primaryTextColor':'#e4e4e7','primaryBorderColor':'#5658d4','lineColor':'#a1a1aa','secondaryColor':'#2b2c40','tertiaryColor':'#232333'}}}%%\nflowchart LR\n  A[Text] --> B[Tokenize]\n  B --> C[Embed]\n  C --> D[Attention]\n  D --> E[Decode]"
        }
      }
    },
    "wrapUp": {
      "nextSteps": [
        {
          "label": "Open the topic lab diagram and decision guide",
          "href": "/module/deep-learning/lesson/transformer-architecture#topic-lab"
        },
        {
          "label": "Run the primary Python lab exercise",
          "href": "/module/deep-learning/lesson/transformer-architecture#ml-practice-lab",
          "exerciseId": "attention-from-scratch"
        }
      ]
    }
  },
  "llms-and-nlp/llm-fundamentals": {
    "parts": {
      "tokens-are-the-interface": {
        "mermaid": {
          "title": "Token lifecycle",
          "caption": "Token lifecycle",
          "code": "%%{init: {'theme':'dark','themeVariables':{'primaryColor':'#696cff','primaryTextColor':'#e4e4e7','primaryBorderColor':'#5658d4','lineColor':'#a1a1aa','secondaryColor':'#2b2c40','tertiaryColor':'#232333'}}}%%\nflowchart LR\n  A[Text] --> B[Tokenize]\n  B --> C[Embed]\n  C --> D[Attention]\n  D --> E[Decode]"
        },
        "workedExample": {
          "title": "Temperature changes token diversity",
          "body": "Sample from a toy logit vector with different temperatures.",
          "language": "python",
          "code": "import numpy as np\nlogits = np.array([2.0, 1.0, 0.2, -0.5])\nfor temp in [0.3, 1.0, 1.8]:\n    scaled = logits / temp\n    exp = np.exp(scaled - scaled.max())\n    probs = exp / exp.sum()\n    print(f\"T={temp}\", np.round(probs, 3))"
        }
      },
      "context-window-as-working-memory": {
        "mermaid": {
          "title": "KV-cache decode steps",
          "caption": "KV-cache decode steps",
          "code": "%%{init: {'theme':'dark','themeVariables':{'primaryColor':'#696cff','primaryTextColor':'#e4e4e7','primaryBorderColor':'#5658d4','lineColor':'#a1a1aa','secondaryColor':'#2b2c40','tertiaryColor':'#232333'}}}%%\nflowchart LR\n  A[Prefill] --> B[Cache K/V]\n  B --> C[Decode step]\n  C --> D[Append token]\n  D --> C"
        },
        "workedExample": {
          "title": "Token cost estimate",
          "body": "Estimate USD from prompt + completion token counts.",
          "language": "python",
          "code": "prompt_tokens = 1200\ncompletion_tokens = 350\nprice_in, price_out = 0.15, 0.60  # per 1M tokens (illustrative)\ncost = (prompt_tokens * price_in + completion_tokens * price_out) / 1_000_000\nprint(\"est USD\", round(cost, 6))"
        }
      },
      "pretraining-sft-and-preference-alignment": {
        "workedExample": {
          "title": "Character pair counting",
          "body": "One step of naive BPE merge candidate selection.",
          "language": "python",
          "code": "from collections import Counter\ntext = \"low low low\"\npairs = Counter()\nchars = list(text)\nfor i in range(len(chars)-1):\n    pairs[(chars[i], chars[i+1])] += 1\nprint(\"top pair\", pairs.most_common(1)[0])"
        }
      },
      "sampling-temperature-and-output-control": {
        "interactiveDemo": {
          "title": "Decoding temperature",
          "body": "See how temperature reshapes a toy probability vector.",
          "sliders": [
            {
              "id": "temp",
              "label": "Temperature",
              "min": 0.2,
              "max": 2.5,
              "step": 0.1,
              "value": 1
            }
          ],
          "codeTemplate": "import numpy as np\nlogits = np.array([2.0, 1.0, 0.2, -0.5])\ntemp = {{temp}}\nscaled = logits / temp\nexp = np.exp(scaled - scaled.max())\nprobs = exp / exp.sum()\nprint(\"temp\", temp, \"probs\", np.round(probs, 3))",
          "language": "python"
        }
      }
    },
    "wrapUp": {
      "nextSteps": [
        {
          "label": "Open the topic lab diagram and decision guide",
          "href": "/module/llms-and-nlp/lesson/llm-fundamentals#topic-lab"
        },
        {
          "label": "Run the primary Python lab exercise",
          "href": "/module/llms-and-nlp/lesson/llm-fundamentals#ml-practice-lab",
          "exerciseId": "tokenization-comparison"
        }
      ]
    }
  },
  "llms-and-nlp/fine-tuning-techniques": {
    "parts": {
      "fine-tuning-changes-behavior-not-facts": {
        "mermaid": {
          "title": "Train / validate / deploy loop",
          "caption": "Train / validate / deploy loop",
          "code": "%%{init: {'theme':'dark','themeVariables':{'primaryColor':'#696cff','primaryTextColor':'#e4e4e7','primaryBorderColor':'#5658d4','lineColor':'#a1a1aa','secondaryColor':'#2b2c40','tertiaryColor':'#232333'}}}%%\nflowchart TD\n  A[Train split] --> B[Fit model]\n  B --> C[Validate]\n  C --> D{Gate?}\n  D -->|pass| E[Serve]\n  D -->|fail| A"
        },
        "workedExample": {
          "title": "LoRA parameter budget",
          "body": "Compare full weight matrix params vs low-rank adapters.",
          "language": "python",
          "code": "d_in, d_out = 768, 768\nrank = 16\nfull = d_in * d_out\nlora = d_in * rank + rank * d_out\nprint(\"full params\", full)\nprint(\"lora params\", lora)\nprint(\"ratio\", round(lora / full, 4))"
        }
      },
      "full-fine-tuning": {
        "mermaid": {
          "title": "Feature → model pipeline",
          "caption": "Feature → model pipeline",
          "code": "%%{init: {'theme':'dark','themeVariables':{'primaryColor':'#696cff','primaryTextColor':'#e4e4e7','primaryBorderColor':'#5658d4','lineColor':'#a1a1aa','secondaryColor':'#2b2c40','tertiaryColor':'#232333'}}}%%\nflowchart LR\n  A[Raw table] --> B[Clean]\n  B --> C[Encode]\n  C --> D[Scale]\n  D --> E[Model]\n  E --> F[Metrics]"
        },
        "workedExample": {
          "title": "Cross-validation score spread",
          "body": "Train three sklearn estimators on the same folds and print mean metrics.",
          "language": "python",
          "code": "from sklearn.datasets import make_classification\nfrom sklearn.model_selection import cross_val_score\nfrom sklearn.linear_model import LogisticRegression\nfrom sklearn.tree import DecisionTreeClassifier\nfrom sklearn.neighbors import KNeighborsClassifier\nX, y = make_classification(n_samples=400, n_features=8, random_state=0)\nmodels = {\n    \"logistic\": LogisticRegression(max_iter=200),\n    \"tree\": DecisionTreeClassifier(max_depth=4, random_state=0),\n    \"knn\": KNeighborsClassifier(n_neighbors=7),\n}\nfor name, model in models.items():\n    scores = cross_val_score(model, X, y, cv=3)\n    print(name, \"mean acc\", round(scores.mean(), 3), \"std\", round(scores.std(), 3))"
        }
      },
      "lora-qlora-and-adapters": {
        "workedExample": {
          "title": "Bayes with a rare event prior",
          "body": "A high-accuracy test can still yield many false positives when the prior is tiny.",
          "language": "python",
          "code": "prior = 0.001\nsensitivity = 0.99\nspecificity = 0.95\nlikelihood_pos = sensitivity\nlikelihood_neg = 1 - specificity\npost = (likelihood_pos * prior) / (likelihood_pos * prior + likelihood_neg * (1 - prior))\nprint(\"posterior spam:\", round(post, 4))"
        }
      }
    },
    "wrapUp": {
      "nextSteps": [
        {
          "label": "Open the topic lab diagram and decision guide",
          "href": "/module/llms-and-nlp/lesson/fine-tuning-techniques#topic-lab"
        },
        {
          "label": "Run the primary Python lab exercise",
          "href": "/module/llms-and-nlp/lesson/fine-tuning-techniques#ml-practice-lab",
          "exerciseId": "lora-implementation"
        }
      ]
    }
  },
  "llms-and-nlp/embeddings-and-vector-search": {
    "parts": {
      "embeddings-map-meaning-to-geometry": {
        "mermaid": {
          "title": "Hybrid retrieval funnel",
          "caption": "Hybrid retrieval funnel",
          "code": "%%{init: {'theme':'dark','themeVariables':{'primaryColor':'#696cff','primaryTextColor':'#e4e4e7','primaryBorderColor':'#5658d4','lineColor':'#a1a1aa','secondaryColor':'#2b2c40','tertiaryColor':'#232333'}}}%%\nflowchart LR\n  A[Query] --> B[BM25]\n  A --> C[Dense]\n  B --> D[RRF merge]\n  C --> D\n  D --> E[Rerank]\n  E --> F[Top-k]"
        },
        "workedExample": {
          "title": "Cosine nearest neighbors",
          "body": "Rank five toy vectors against a query embedding.",
          "language": "python",
          "code": "import numpy as np\nvecs = np.array([[1,0,0],[0.9,0.1,0],[0,1,0],[0.8,0.2,0],[0,0,1]])\nquery = np.array([1.0, 0.0, 0.0])\ndef cos(a,b):\n    return float(a @ b / (np.linalg.norm(a) * np.linalg.norm(b)))\nscores = [(i, cos(query, v)) for i,v in enumerate(vecs)]\nfor i,s in sorted(scores, key=lambda x: -x[1]):\n    print(i, round(s, 3))"
        }
      },
      "cosine-dot-and-normalization": {
        "mermaid": {
          "title": "RAG ingest and query paths",
          "caption": "RAG ingest and query paths",
          "code": "%%{init: {'theme':'dark','themeVariables':{'primaryColor':'#696cff','primaryTextColor':'#e4e4e7','primaryBorderColor':'#5658d4','lineColor':'#a1a1aa','secondaryColor':'#2b2c40','tertiaryColor':'#232333'}}}%%\nflowchart LR\n  subgraph ingest [Ingest]\n    I1[Docs] --> I2[Chunk]\n    I2 --> I3[Embed]\n    I3 --> I4[Index]\n  end\n  subgraph query [Query]\n    Q1[Question] --> Q2[Retrieve]\n    Q2 --> Q3[Prompt]\n    Q3 --> Q4[Answer]\n  end\n  I4 --> Q2"
        },
        "workedExample": {
          "title": "Feature scale changes distances",
          "body": "Compare Euclidean distance before and after scaling one coordinate by 100×.",
          "language": "python",
          "code": "import numpy as np\na = np.array([1.0, 0.0])\nb = np.array([2.0, 100.0])\nprint(\"raw distance:\", round(np.linalg.norm(a - b), 3))\nscale = np.array([1.0, 0.01])\nprint(\"scaled distance:\", round(np.linalg.norm((a - b) * scale), 3))"
        }
      },
      "ann-and-hnsw-at-scale": {
        "workedExample": {
          "title": "TF-IDF top-k by hand",
          "body": "Score two documents for a query term overlap.",
          "language": "python",
          "code": "docs = [\"neural networks train deep\", \"graph database index\"]\nquery = \"neural train\"\ndef score(doc):\n    dset = set(doc.split())\n    qset = set(query.split())\n    return len(dset & qset)\nfor i,d in enumerate(docs):\n    print(i, score(d), d)"
        }
      }
    },
    "wrapUp": {
      "nextSteps": [
        {
          "label": "Open the topic lab diagram and decision guide",
          "href": "/module/llms-and-nlp/lesson/embeddings-and-vector-search#topic-lab"
        },
        {
          "label": "Run the primary Python lab exercise",
          "href": "/module/llms-and-nlp/lesson/embeddings-and-vector-search#ml-practice-lab",
          "exerciseId": "embedding-similarity-search"
        }
      ]
    }
  },
  "prompt-engineering-and-rag/prompt-engineering": {
    "parts": {
      "prompts-as-interfaces": {
        "mermaid": {
          "title": "Eval harness",
          "caption": "Eval harness",
          "code": "%%{init: {'theme':'dark','themeVariables':{'primaryColor':'#696cff','primaryTextColor':'#e4e4e7','primaryBorderColor':'#5658d4','lineColor':'#a1a1aa','secondaryColor':'#2b2c40','tertiaryColor':'#232333'}}}%%\nflowchart LR\n  A[Golden set] --> B[Run model]\n  B --> C[Score]\n  C --> D{Pass gate?}\n  D -->|yes| E[Ship]\n  D -->|no| F[Block]"
        },
        "workedExample": {
          "title": "JSON schema validation loop",
          "body": "Parse model JSON output and flag missing required keys.",
          "language": "python",
          "code": "import json\nsamples = ['{\"name\":\"Ada\",\"role\":\"eng\"}', '{\"name\":\"Bob\"}', 'not json']\nrequired = {\"name\", \"role\"}\nfor raw in samples:\n    try:\n        obj = json.loads(raw)\n        missing = required - set(obj)\n        print(raw[:20], \"valid\", not missing, \"missing\", sorted(missing))\n    except json.JSONDecodeError:\n        print(raw, \"invalid JSON\")"
        }
      },
      "system-user-and-untrusted-context": {
        "mermaid": {
          "title": "RAG ingest and query paths",
          "caption": "RAG ingest and query paths",
          "code": "%%{init: {'theme':'dark','themeVariables':{'primaryColor':'#696cff','primaryTextColor':'#e4e4e7','primaryBorderColor':'#5658d4','lineColor':'#a1a1aa','secondaryColor':'#2b2c40','tertiaryColor':'#232333'}}}%%\nflowchart LR\n  subgraph ingest [Ingest]\n    I1[Docs] --> I2[Chunk]\n    I2 --> I3[Embed]\n    I3 --> I4[Index]\n  end\n  subgraph query [Query]\n    Q1[Question] --> Q2[Retrieve]\n    Q2 --> Q3[Prompt]\n    Q3 --> Q4[Answer]\n  end\n  I4 --> Q2"
        },
        "workedExample": {
          "title": "Eval harness pass/fail",
          "body": "Score answers against gold strings with a simple overlap gate.",
          "language": "python",
          "code": "def score(answer, gold):\n    a = set(answer.lower().split())\n    g = set(gold.lower().split())\n    return len(a & g) / max(1, len(g))\ncases = [(\"reset via email link\", \"users reset password using email link\")]\nfor ans, gold in cases:\n    s = score(ans, gold)\n    print(round(s,3), \"pass\", s >= 0.4)"
        }
      },
      "few-shot-and-task-demonstrations": {
        "workedExample": {
          "title": "Temperature changes token diversity",
          "body": "Sample from a toy logit vector with different temperatures.",
          "language": "python",
          "code": "import numpy as np\nlogits = np.array([2.0, 1.0, 0.2, -0.5])\nfor temp in [0.3, 1.0, 1.8]:\n    scaled = logits / temp\n    exp = np.exp(scaled - scaled.max())\n    probs = exp / exp.sum()\n    print(f\"T={temp}\", np.round(probs, 3))"
        }
      }
    },
    "wrapUp": {
      "nextSteps": [
        {
          "label": "Open the topic lab diagram and decision guide",
          "href": "/module/prompt-engineering-and-rag/lesson/prompt-engineering#topic-lab"
        },
        {
          "label": "Run the primary Python lab exercise",
          "href": "/module/prompt-engineering-and-rag/lesson/prompt-engineering#ml-practice-lab",
          "exerciseId": "prompt-techniques-comparison"
        }
      ]
    }
  },
  "prompt-engineering-and-rag/rag-systems": {
    "parts": {
      "hierarchical-parent-child-chunking": {
        "mermaid": {
          "title": "RAG ingest and query paths",
          "caption": "RAG ingest and query paths",
          "code": "%%{init: {'theme':'dark','themeVariables':{'primaryColor':'#696cff','primaryTextColor':'#e4e4e7','primaryBorderColor':'#5658d4','lineColor':'#a1a1aa','secondaryColor':'#2b2c40','tertiaryColor':'#232333'}}}%%\nflowchart LR\n  subgraph ingest [Ingest]\n    I1[Docs] --> I2[Chunk]\n    I2 --> I3[Embed]\n    I3 --> I4[Index]\n  end\n  subgraph query [Query]\n    Q1[Question] --> Q2[Retrieve]\n    Q2 --> Q3[Prompt]\n    Q3 --> Q4[Answer]\n  end\n  I4 --> Q2"
        },
        "workedExample": {
          "title": "Recall@k on gold ids",
          "body": "Check whether any gold chunk id appears in retrieved top-k.",
          "language": "python",
          "code": "gold = {\"chunk-2\", \"chunk-5\"}\nretrieved = [\"chunk-1\", \"chunk-2\", \"chunk-3\"][:2]\nhit = bool(gold & set(retrieved))\nprint(\"recall@2\", hit)"
        }
      },
      "hybrid-retrieval-rrf-and-rerank-funnel": {
        "mermaid": {
          "title": "Hybrid retrieval funnel",
          "caption": "Hybrid retrieval funnel",
          "code": "%%{init: {'theme':'dark','themeVariables':{'primaryColor':'#696cff','primaryTextColor':'#e4e4e7','primaryBorderColor':'#5658d4','lineColor':'#a1a1aa','secondaryColor':'#2b2c40','tertiaryColor':'#232333'}}}%%\nflowchart LR\n  A[Query] --> B[BM25]\n  A --> C[Dense]\n  B --> D[RRF merge]\n  C --> D\n  D --> E[Rerank]\n  E --> F[Top-k]"
        },
        "workedExample": {
          "title": "Cosine nearest neighbors",
          "body": "Rank five toy vectors against a query embedding.",
          "language": "python",
          "code": "import numpy as np\nvecs = np.array([[1,0,0],[0.9,0.1,0],[0,1,0],[0.8,0.2,0],[0,0,1]])\nquery = np.array([1.0, 0.0, 0.0])\ndef cos(a,b):\n    return float(a @ b / (np.linalg.norm(a) * np.linalg.norm(b)))\nscores = [(i, cos(query, v)) for i,v in enumerate(vecs)]\nfor i,s in sorted(scores, key=lambda x: -x[1]):\n    print(i, round(s, 3))"
        },
        "interactiveDemo": {
          "title": "Recall@k sweep",
          "body": "Adjust k and see whether the gold chunk stays in the retrieved set.",
          "sliders": [
            {
              "id": "topk",
              "label": "Top-k",
              "min": 1,
              "max": 5,
              "step": 1,
              "value": 2
            }
          ],
          "codeTemplate": "gold = {\"chunk-2\"}\nretrieved = [\"chunk-1\", \"chunk-2\", \"chunk-3\", \"chunk-4\"]\nk = int({{topk}})\nhit = bool(gold & set(retrieved[:k]))\nprint(\"k\", k, \"recall@\", k, hit)",
          "language": "python"
        }
      },
      "rag-is-a-pipeline": {
        "workedExample": {
          "title": "Chunk and recall@k toy index",
          "body": "Split text into chunks and score whether gold chunk is in top-k.",
          "language": "python",
          "code": "text = \"Refund within 30 days. Password reset via email. SSO uses SAML.\"\nchunks = [text]\nfor sep in [\". \", \" \"]:\n    if len(chunks) == 1 and len(chunks[0]) > 40:\n        chunks = [c.strip() for c in text.split(sep) if c.strip()]\nquery = \"password reset\"\ndef score(c):\n    return sum(1 for w in query.split() if w in c.lower())\nranked = sorted(chunks, key=score, reverse=True)\nprint(\"top chunk:\", ranked[0])\nprint(\"recall@1\", \"password\" in ranked[0].lower())"
        }
      }
    },
    "wrapUp": {
      "nextSteps": [
        {
          "label": "Open the topic lab diagram and decision guide",
          "href": "/module/prompt-engineering-and-rag/lesson/rag-systems#topic-lab"
        },
        {
          "label": "Run the primary Python lab exercise",
          "href": "/module/prompt-engineering-and-rag/lesson/rag-systems#ml-practice-lab",
          "exerciseId": "rag-pipeline-build"
        }
      ]
    }
  },
  "prompt-engineering-and-rag/building-with-frameworks": {
    "parts": {
      "frameworks-package-patterns": {
        "mermaid": {
          "title": "Agent control loop",
          "caption": "Agent control loop",
          "code": "%%{init: {'theme':'dark','themeVariables':{'primaryColor':'#696cff','primaryTextColor':'#e4e4e7','primaryBorderColor':'#5658d4','lineColor':'#a1a1aa','secondaryColor':'#2b2c40','tertiaryColor':'#232333'}}}%%\nflowchart LR\n  A[Plan] --> B[Select tool]\n  B --> C[Execute]\n  C --> D[Observe]\n  D --> E{Done?}\n  E -->|no| A\n  E -->|yes| F[Respond]"
        },
        "workedExample": {
          "title": "Mock tool router",
          "body": "Route a JSON tool call to mock_search or mock_sql fixtures.",
          "language": "python",
          "code": "def mock_search(q):\n    return [{\"id\":\"doc-a\", \"snippet\":\"reset via email\"}] if \"reset\" in q else []\ndef mock_sql(table):\n    return [{\"order_id\":101,\"status\":\"shipped\"}] if table==\"orders\" else []\ncall = {\"tool\":\"search\", \"args\":{\"query\":\"password reset\"}}\nif call[\"tool\"] == \"search\":\n    print(mock_search(call[\"args\"][\"query\"]))\nelse:\n    print(mock_sql(call.get(\"args\",{}).get(\"table\",\"\")))"
        }
      },
      "langchain-and-llamaindex-tradeoffs": {
        "mermaid": {
          "title": "Serving paths",
          "caption": "Serving paths",
          "code": "%%{init: {'theme':'dark','themeVariables':{'primaryColor':'#696cff','primaryTextColor':'#e4e4e7','primaryBorderColor':'#5658d4','lineColor':'#a1a1aa','secondaryColor':'#2b2c40','tertiaryColor':'#232333'}}}%%\nflowchart LR\n  A[Client] --> B{Mode}\n  B -->|sync| C[Online API]\n  B -->|stream| D[SSE tokens]\n  B -->|batch| E[Queue worker]"
        },
        "workedExample": {
          "title": "JSON schema validation loop",
          "body": "Parse model JSON output and flag missing required keys.",
          "language": "python",
          "code": "import json\nsamples = ['{\"name\":\"Ada\",\"role\":\"eng\"}', '{\"name\":\"Bob\"}', 'not json']\nrequired = {\"name\", \"role\"}\nfor raw in samples:\n    try:\n        obj = json.loads(raw)\n        missing = required - set(obj)\n        print(raw[:20], \"valid\", not missing, \"missing\", sorted(missing))\n    except json.JSONDecodeError:\n        print(raw, \"invalid JSON\")"
        }
      },
      "when-plain-http-is-better": {
        "workedExample": {
          "title": "Agent state machine step",
          "body": "Simulate three ReAct-style steps with a budget counter.",
          "language": "python",
          "code": "state = {\"steps\": 0, \"budget\": 3, \"answer\": None}\ntrace = []\nwhile state[\"budget\"] > 0 and state[\"answer\"] is None:\n    state[\"steps\"] += 1\n    state[\"budget\"] -= 1\n    trace.append(f\"step {state['steps']} act=search\")\n    if state[\"steps\"] >= 2:\n        state[\"answer\"] = 42.0\nprint(\"trace:\", trace)\nprint(\"answer:\", state[\"answer\"])"
        }
      }
    },
    "wrapUp": {
      "nextSteps": [
        {
          "label": "Open the topic lab diagram and decision guide",
          "href": "/module/prompt-engineering-and-rag/lesson/building-with-frameworks#topic-lab"
        },
        {
          "label": "Run the primary Python lab exercise",
          "href": "/module/prompt-engineering-and-rag/lesson/building-with-frameworks#ml-practice-lab",
          "exerciseId": "prompt-chain-design"
        }
      ]
    }
  },
  "ai-agents/agent-fundamentals": {
    "parts": {
      "agent-as-controller": {
        "mermaid": {
          "title": "Agent control loop",
          "caption": "Agent control loop",
          "code": "%%{init: {'theme':'dark','themeVariables':{'primaryColor':'#696cff','primaryTextColor':'#e4e4e7','primaryBorderColor':'#5658d4','lineColor':'#a1a1aa','secondaryColor':'#2b2c40','tertiaryColor':'#232333'}}}%%\nflowchart LR\n  A[Plan] --> B[Select tool]\n  B --> C[Execute]\n  C --> D[Observe]\n  D --> E{Done?}\n  E -->|no| A\n  E -->|yes| F[Respond]"
        },
        "workedExample": {
          "title": "Agent state machine step",
          "body": "Simulate three ReAct-style steps with a budget counter.",
          "language": "python",
          "code": "state = {\"steps\": 0, \"budget\": 3, \"answer\": None}\ntrace = []\nwhile state[\"budget\"] > 0 and state[\"answer\"] is None:\n    state[\"steps\"] += 1\n    state[\"budget\"] -= 1\n    trace.append(f\"step {state['steps']} act=search\")\n    if state[\"steps\"] >= 2:\n        state[\"answer\"] = 42.0\nprint(\"trace:\", trace)\nprint(\"answer:\", state[\"answer\"])"
        }
      },
      "state-and-memory": {
        "mermaid": {
          "title": "Eval harness",
          "caption": "Eval harness",
          "code": "%%{init: {'theme':'dark','themeVariables':{'primaryColor':'#696cff','primaryTextColor':'#e4e4e7','primaryBorderColor':'#5658d4','lineColor':'#a1a1aa','secondaryColor':'#2b2c40','tertiaryColor':'#232333'}}}%%\nflowchart LR\n  A[Golden set] --> B[Run model]\n  B --> C[Score]\n  C --> D{Pass gate?}\n  D -->|yes| E[Ship]\n  D -->|no| F[Block]"
        }
      },
      "planning-patterns": {
        "interactiveDemo": {
          "title": "Agent step budget",
          "body": "Simulate how many tool steps run before the budget is exhausted.",
          "sliders": [
            {
              "id": "budget",
              "label": "Step budget",
              "min": 1,
              "max": 6,
              "step": 1,
              "value": 3
            }
          ],
          "codeTemplate": "budget = int({{budget}})\nsteps = 0\nanswer = None\nwhile budget > 0 and answer is None:\n    steps += 1\n    budget -= 1\n    if steps >= 2:\n        answer = \"done\"\nprint(\"steps used\", steps, \"answer\", answer)",
          "language": "python"
        }
      }
    },
    "wrapUp": {
      "nextSteps": [
        {
          "label": "Open the topic lab diagram and decision guide",
          "href": "/module/ai-agents/lesson/agent-fundamentals#topic-lab"
        },
        {
          "label": "Run the primary Python lab exercise",
          "href": "/module/ai-agents/lesson/agent-fundamentals#ml-practice-lab",
          "exerciseId": "react-agent-implementation"
        }
      ]
    }
  },
  "ai-agents/tool-use-and-function-calling": {
    "parts": {
      "schemas-are-model-facing-apis": {
        "mermaid": {
          "title": "Agent control loop",
          "caption": "Agent control loop",
          "code": "%%{init: {'theme':'dark','themeVariables':{'primaryColor':'#696cff','primaryTextColor':'#e4e4e7','primaryBorderColor':'#5658d4','lineColor':'#a1a1aa','secondaryColor':'#2b2c40','tertiaryColor':'#232333'}}}%%\nflowchart LR\n  A[Plan] --> B[Select tool]\n  B --> C[Execute]\n  C --> D[Observe]\n  D --> E{Done?}\n  E -->|no| A\n  E -->|yes| F[Respond]"
        }
      },
      "validation-normalization-dispatch": {
        "mermaid": {
          "title": "Serving paths",
          "caption": "Serving paths",
          "code": "%%{init: {'theme':'dark','themeVariables':{'primaryColor':'#696cff','primaryTextColor':'#e4e4e7','primaryBorderColor':'#5658d4','lineColor':'#a1a1aa','secondaryColor':'#2b2c40','tertiaryColor':'#232333'}}}%%\nflowchart LR\n  A[Client] --> B{Mode}\n  B -->|sync| C[Online API]\n  B -->|stream| D[SSE tokens]\n  B -->|batch| E[Queue worker]"
        },
        "workedExample": {
          "title": "Mock tool router",
          "body": "Route a JSON tool call to mock_search or mock_sql fixtures.",
          "language": "python",
          "code": "def mock_search(q):\n    return [{\"id\":\"doc-a\", \"snippet\":\"reset via email\"}] if \"reset\" in q else []\ndef mock_sql(table):\n    return [{\"order_id\":101,\"status\":\"shipped\"}] if table==\"orders\" else []\ncall = {\"tool\":\"search\", \"args\":{\"query\":\"password reset\"}}\nif call[\"tool\"] == \"search\":\n    print(mock_search(call[\"args\"][\"query\"]))\nelse:\n    print(mock_sql(call.get(\"args\",{}).get(\"table\",\"\")))"
        }
      }
    },
    "wrapUp": {
      "nextSteps": [
        {
          "label": "Open the topic lab diagram and decision guide",
          "href": "/module/ai-agents/lesson/tool-use-and-function-calling#topic-lab"
        },
        {
          "label": "Run the primary Python lab exercise",
          "href": "/module/ai-agents/lesson/tool-use-and-function-calling#ml-practice-lab",
          "exerciseId": "function-calling-schema"
        }
      ]
    }
  },
  "ai-agents/agent-evaluation-and-safety": {
    "parts": {
      "trajectory-success": {
        "mermaid": {
          "title": "Eval harness",
          "caption": "Eval harness",
          "code": "%%{init: {'theme':'dark','themeVariables':{'primaryColor':'#696cff','primaryTextColor':'#e4e4e7','primaryBorderColor':'#5658d4','lineColor':'#a1a1aa','secondaryColor':'#2b2c40','tertiaryColor':'#232333'}}}%%\nflowchart LR\n  A[Golden set] --> B[Run model]\n  B --> C[Score]\n  C --> D{Pass gate?}\n  D -->|yes| E[Ship]\n  D -->|no| F[Block]"
        }
      },
      "offline-simulators": {
        "mermaid": {
          "title": "Agent control loop",
          "caption": "Agent control loop",
          "code": "%%{init: {'theme':'dark','themeVariables':{'primaryColor':'#696cff','primaryTextColor':'#e4e4e7','primaryBorderColor':'#5658d4','lineColor':'#a1a1aa','secondaryColor':'#2b2c40','tertiaryColor':'#232333'}}}%%\nflowchart LR\n  A[Plan] --> B[Select tool]\n  B --> C[Execute]\n  C --> D[Observe]\n  D --> E{Done?}\n  E -->|no| A\n  E -->|yes| F[Respond]"
        },
        "workedExample": {
          "title": "Eval harness pass/fail",
          "body": "Score answers against gold strings with a simple overlap gate.",
          "language": "python",
          "code": "def score(answer, gold):\n    a = set(answer.lower().split())\n    g = set(gold.lower().split())\n    return len(a & g) / max(1, len(g))\ncases = [(\"reset via email link\", \"users reset password using email link\")]\nfor ans, gold in cases:\n    s = score(ans, gold)\n    print(round(s,3), \"pass\", s >= 0.4)"
        }
      }
    },
    "wrapUp": {
      "nextSteps": [
        {
          "label": "Open the topic lab diagram and decision guide",
          "href": "/module/ai-agents/lesson/agent-evaluation-and-safety#topic-lab"
        },
        {
          "label": "Run the primary Python lab exercise",
          "href": "/module/ai-agents/lesson/agent-evaluation-and-safety#ml-practice-lab",
          "exerciseId": "agent-evaluation-suite"
        }
      ]
    }
  },
  "mlops-and-deployment/ml-pipeline-design": {
    "parts": {
      "pipelines-as-artifact-graphs": {
        "mermaid": {
          "title": "ML pipeline DAG",
          "caption": "ML pipeline DAG",
          "code": "%%{init: {'theme':'dark','themeVariables':{'primaryColor':'#696cff','primaryTextColor':'#e4e4e7','primaryBorderColor':'#5658d4','lineColor':'#a1a1aa','secondaryColor':'#2b2c40','tertiaryColor':'#232333'}}}%%\nflowchart TD\n  A[Data ingest] --> B[Validate]\n  B --> C[Features]\n  C --> D[Train]\n  D --> E[Evaluate]\n  E --> F[Register]\n  F --> G[Deploy]"
        }
      },
      "data-validation-and-feature-correctness": {
        "mermaid": {
          "title": "Dataset lineage",
          "caption": "Dataset lineage",
          "code": "%%{init: {'theme':'dark','themeVariables':{'primaryColor':'#696cff','primaryTextColor':'#e4e4e7','primaryBorderColor':'#5658d4','lineColor':'#a1a1aa','secondaryColor':'#2b2c40','tertiaryColor':'#232333'}}}%%\nflowchart TD\n  A[Raw dump] --> B[Snapshot v1]\n  B --> C[Clean v1.1]\n  C --> D[Train set]\n  C --> E[Serve features]"
        },
        "workedExample": {
          "title": "Pipeline inside CV fold",
          "body": "Ensure preprocessing is fit only on training folds.",
          "language": "python",
          "code": "from sklearn.pipeline import Pipeline\nfrom sklearn.preprocessing import StandardScaler\nfrom sklearn.linear_model import LogisticRegression\nfrom sklearn.model_selection import cross_val_score\nfrom sklearn.datasets import make_classification\nX, y = make_classification(n_samples=200, random_state=9)\npipe = Pipeline([(\"s\", StandardScaler()), (\"c\", LogisticRegression(max_iter=200))])\nprint(\"cv acc\", round(cross_val_score(pipe, X, y, cv=3).mean(), 3))"
        }
      }
    },
    "wrapUp": {
      "nextSteps": [
        {
          "label": "Open the topic lab diagram and decision guide",
          "href": "/module/mlops-and-deployment/lesson/ml-pipeline-design#topic-lab"
        },
        {
          "label": "Run the primary Python lab exercise",
          "href": "/module/mlops-and-deployment/lesson/ml-pipeline-design#ml-practice-lab",
          "exerciseId": "ml-pipeline-dag"
        }
      ]
    }
  },
  "mlops-and-deployment/model-serving": {
    "parts": {
      "serving-shapes": {
        "mermaid": {
          "title": "Serving paths",
          "caption": "Serving paths",
          "code": "%%{init: {'theme':'dark','themeVariables':{'primaryColor':'#696cff','primaryTextColor':'#e4e4e7','primaryBorderColor':'#5658d4','lineColor':'#a1a1aa','secondaryColor':'#2b2c40','tertiaryColor':'#232333'}}}%%\nflowchart LR\n  A[Client] --> B{Mode}\n  B -->|sync| C[Online API]\n  B -->|stream| D[SSE tokens]\n  B -->|batch| E[Queue worker]"
        },
        "workedExample": {
          "title": "p99 latency budget calculator",
          "body": "Sum stage budgets and compare to an SLO ceiling.",
          "language": "python",
          "code": "stages = [20, 35, 90, 40, 25]\nslo = 200\ntotal = sum(stages)\nprint(\"budget sum\", total, \"within slo\", total <= slo)"
        }
      },
      "apis-aliases-and-rollout": {
        "mermaid": {
          "title": "Train / validate / deploy loop",
          "caption": "Train / validate / deploy loop",
          "code": "%%{init: {'theme':'dark','themeVariables':{'primaryColor':'#696cff','primaryTextColor':'#e4e4e7','primaryBorderColor':'#5658d4','lineColor':'#a1a1aa','secondaryColor':'#2b2c40','tertiaryColor':'#232333'}}}%%\nflowchart TD\n  A[Train split] --> B[Fit model]\n  B --> C[Validate]\n  C --> D{Gate?}\n  D -->|pass| E[Serve]\n  D -->|fail| A"
        }
      }
    },
    "wrapUp": {
      "nextSteps": [
        {
          "label": "Open the topic lab diagram and decision guide",
          "href": "/module/mlops-and-deployment/lesson/model-serving#topic-lab"
        },
        {
          "label": "Run the primary Python lab exercise",
          "href": "/module/mlops-and-deployment/lesson/model-serving#ml-practice-lab",
          "exerciseId": "model-serving-optimization"
        }
      ]
    }
  },
  "mlops-and-deployment/monitoring-and-observability": {
    "parts": {
      "four-monitoring-planes": {
        "mermaid": {
          "title": "Drift to rollback",
          "caption": "Drift to rollback",
          "code": "%%{init: {'theme':'dark','themeVariables':{'primaryColor':'#696cff','primaryTextColor':'#e4e4e7','primaryBorderColor':'#5658d4','lineColor':'#a1a1aa','secondaryColor':'#2b2c40','tertiaryColor':'#232333'}}}%%\nflowchart LR\n  A[Live scores] --> B[Drift test]\n  B --> C{Threshold?}\n  C -->|yes| D[Alert]\n  D --> E[Rollback alias]"
        },
        "workedExample": {
          "title": "Population stability index toy",
          "body": "Flag drift when PSI crosses a threshold on binned counts.",
          "language": "python",
          "code": "import numpy as np\nexpected = np.array([50, 30, 20], dtype=float)\nactual = np.array([35, 35, 30], dtype=float)\ndef psi(e, a):\n    e = e / e.sum()\n    a = a / a.sum()\n    return float(np.sum((a - e) * np.log((a + 1e-6) / (e + 1e-6))))\nvalue = psi(expected, actual)\nprint(\"PSI\", round(value, 3), \"alert\", value > 0.2)"
        }
      },
      "drift-label-delay-and-slices": {
        "mermaid": {
          "title": "Eval harness",
          "caption": "Eval harness",
          "code": "%%{init: {'theme':'dark','themeVariables':{'primaryColor':'#696cff','primaryTextColor':'#e4e4e7','primaryBorderColor':'#5658d4','lineColor':'#a1a1aa','secondaryColor':'#2b2c40','tertiaryColor':'#232333'}}}%%\nflowchart LR\n  A[Golden set] --> B[Run model]\n  B --> C[Score]\n  C --> D{Pass gate?}\n  D -->|yes| E[Ship]\n  D -->|no| F[Block]"
        },
        "interactiveDemo": {
          "title": "PSI alert threshold",
          "body": "Shift bin counts and compare PSI to a threshold.",
          "sliders": [
            {
              "id": "shift",
              "label": "Distribution shift",
              "min": 0,
              "max": 30,
              "step": 5,
              "value": 10
            }
          ],
          "codeTemplate": "import numpy as np\nshift = int({{shift}})\nexpected = np.array([50, 30, 20], dtype=float)\nactual = np.array([50 - shift, 30, 20 + shift], dtype=float)\ne, a = expected/expected.sum(), actual/actual.sum()\npsi = float(np.sum((a-e)*np.log((a+1e-6)/(e+1e-6))))\nprint(\"shift\", shift, \"PSI\", round(psi,3), \"alert\", psi>0.2)",
          "language": "python"
        }
      }
    },
    "wrapUp": {
      "nextSteps": [
        {
          "label": "Open the topic lab diagram and decision guide",
          "href": "/module/mlops-and-deployment/lesson/monitoring-and-observability#topic-lab"
        },
        {
          "label": "Run the primary Python lab exercise",
          "href": "/module/mlops-and-deployment/lesson/monitoring-and-observability#ml-practice-lab",
          "exerciseId": "drift-detection-system"
        }
      ]
    }
  },
  "ai-safety-and-ethics/bias-and-fairness": {
    "parts": {
      "start-from-harms": {
        "mermaid": {
          "title": "Fairness workflow",
          "caption": "Fairness workflow",
          "code": "%%{init: {'theme':'dark','themeVariables':{'primaryColor':'#696cff','primaryTextColor':'#e4e4e7','primaryBorderColor':'#5658d4','lineColor':'#a1a1aa','secondaryColor':'#2b2c40','tertiaryColor':'#232333'}}}%%\nflowchart TD\n  A[Define harms] --> B[Slice metrics]\n  B --> C[Compare groups]\n  C --> D[Mitigate]\n  D --> E[Monitor]"
        },
        "workedExample": {
          "title": "Subgroup true-positive rate gap",
          "body": "Compute TPR gap on synthetic binary labels and scores.",
          "language": "python",
          "code": "import numpy as np\nrng = np.random.default_rng(0)\ngroups = rng.integers(0, 2, size=200)\nscores = rng.normal(size=200)\nlabels = (scores + groups * 0.5 > 0).astype(int)\npred = scores > 0\ndef tpr(mask):\n    m = mask & (labels == 1)\n    return float(pred[m].mean()) if m.any() else 0.0\ntpr0, tpr1 = tpr(groups==0), tpr(groups==1)\nprint(\"TPR gap\", round(abs(tpr0 - tpr1), 3))"
        }
      },
      "where-bias-enters": {
        "mermaid": {
          "title": "Eval harness",
          "caption": "Eval harness",
          "code": "%%{init: {'theme':'dark','themeVariables':{'primaryColor':'#696cff','primaryTextColor':'#e4e4e7','primaryBorderColor':'#5658d4','lineColor':'#a1a1aa','secondaryColor':'#2b2c40','tertiaryColor':'#232333'}}}%%\nflowchart LR\n  A[Golden set] --> B[Run model]\n  B --> C[Score]\n  C --> D{Pass gate?}\n  D -->|yes| E[Ship]\n  D -->|no| F[Block]"
        }
      },
      "fairness-metrics-tradeoffs": {
        "workedExample": {
          "title": "Eval harness pass/fail",
          "body": "Score answers against gold strings with a simple overlap gate.",
          "language": "python",
          "code": "def score(answer, gold):\n    a = set(answer.lower().split())\n    g = set(gold.lower().split())\n    return len(a & g) / max(1, len(g))\ncases = [(\"reset via email link\", \"users reset password using email link\")]\nfor ans, gold in cases:\n    s = score(ans, gold)\n    print(round(s,3), \"pass\", s >= 0.4)"
        }
      }
    },
    "wrapUp": {
      "nextSteps": [
        {
          "label": "Open the topic lab diagram and decision guide",
          "href": "/module/ai-safety-and-ethics/lesson/bias-and-fairness#topic-lab"
        },
        {
          "label": "Run the primary Python lab exercise",
          "href": "/module/ai-safety-and-ethics/lesson/bias-and-fairness#ml-practice-lab",
          "exerciseId": "bias-audit-implementation"
        }
      ]
    }
  },
  "ai-safety-and-ethics/explainability": {
    "parts": {
      "audience-purpose-and-claim": {
        "mermaid": {
          "title": "Fairness workflow",
          "caption": "Fairness workflow",
          "code": "%%{init: {'theme':'dark','themeVariables':{'primaryColor':'#696cff','primaryTextColor':'#e4e4e7','primaryBorderColor':'#5658d4','lineColor':'#a1a1aa','secondaryColor':'#2b2c40','tertiaryColor':'#232333'}}}%%\nflowchart TD\n  A[Define harms] --> B[Slice metrics]\n  B --> C[Compare groups]\n  C --> D[Mitigate]\n  D --> E[Monitor]"
        },
        "workedExample": {
          "title": "Feature scale changes distances",
          "body": "Compare Euclidean distance before and after scaling one coordinate by 100×.",
          "language": "python",
          "code": "import numpy as np\na = np.array([1.0, 0.0])\nb = np.array([2.0, 100.0])\nprint(\"raw distance:\", round(np.linalg.norm(a - b), 3))\nscale = np.array([1.0, 0.01])\nprint(\"scaled distance:\", round(np.linalg.norm((a - b) * scale), 3))"
        }
      },
      "intrinsic-vs-posthoc": {
        "mermaid": {
          "title": "Feature → model pipeline",
          "caption": "Feature → model pipeline",
          "code": "%%{init: {'theme':'dark','themeVariables':{'primaryColor':'#696cff','primaryTextColor':'#e4e4e7','primaryBorderColor':'#5658d4','lineColor':'#a1a1aa','secondaryColor':'#2b2c40','tertiaryColor':'#232333'}}}%%\nflowchart LR\n  A[Raw table] --> B[Clean]\n  B --> C[Encode]\n  C --> D[Scale]\n  D --> E[Model]\n  E --> F[Metrics]"
        }
      }
    },
    "wrapUp": {
      "nextSteps": [
        {
          "label": "Open the topic lab diagram and decision guide",
          "href": "/module/ai-safety-and-ethics/lesson/explainability#topic-lab"
        },
        {
          "label": "Run the primary Python lab exercise",
          "href": "/module/ai-safety-and-ethics/lesson/explainability#ml-practice-lab",
          "exerciseId": "shap-values-manual"
        }
      ]
    }
  },
  "ai-safety-and-ethics/ai-governance": {
    "parts": {
      "governance-as-operating-system": {
        "mermaid": {
          "title": "Eval harness",
          "caption": "Eval harness",
          "code": "%%{init: {'theme':'dark','themeVariables':{'primaryColor':'#696cff','primaryTextColor':'#e4e4e7','primaryBorderColor':'#5658d4','lineColor':'#a1a1aa','secondaryColor':'#2b2c40','tertiaryColor':'#232333'}}}%%\nflowchart LR\n  A[Golden set] --> B[Run model]\n  B --> C[Score]\n  C --> D{Pass gate?}\n  D -->|yes| E[Ship]\n  D -->|no| F[Block]"
        },
        "workedExample": {
          "title": "Dataset manifest fingerprint",
          "body": "Hash sorted file paths for a reproducible dataset manifest.",
          "language": "python",
          "code": "import hashlib\nfiles = sorted([\"train.parquet\", \"val.parquet\", \"features/schema.json\"])\ndigest = hashlib.sha256(\"\\n\".join(files).encode()).hexdigest()[:12]\nprint(\"manifest id\", digest)"
        }
      },
      "regulatory-landscape-2026": {
        "mermaid": {
          "title": "Fairness workflow",
          "caption": "Fairness workflow",
          "code": "%%{init: {'theme':'dark','themeVariables':{'primaryColor':'#696cff','primaryTextColor':'#e4e4e7','primaryBorderColor':'#5658d4','lineColor':'#a1a1aa','secondaryColor':'#2b2c40','tertiaryColor':'#232333'}}}%%\nflowchart TD\n  A[Define harms] --> B[Slice metrics]\n  B --> C[Compare groups]\n  C --> D[Mitigate]\n  D --> E[Monitor]"
        },
        "workedExample": {
          "title": "Release gate checklist score",
          "body": "Score shadow/canary gates before full rollout.",
          "language": "python",
          "code": "gates = {\"eval_pass\": True, \"latency_ok\": True, \"error_budget\": True, \"guardrails\": False}\nscore = sum(gates.values())\nprint(\"gates\", gates)\nprint(\"ready\", score >= 3)"
        }
      }
    },
    "wrapUp": {
      "nextSteps": [
        {
          "label": "Open the topic lab diagram and decision guide",
          "href": "/module/ai-safety-and-ethics/lesson/ai-governance#topic-lab"
        },
        {
          "label": "Run the primary Python lab exercise",
          "href": "/module/ai-safety-and-ethics/lesson/ai-governance#ml-practice-lab",
          "exerciseId": "model-card-creation"
        }
      ]
    }
  },
  "data-engineering-for-ml/data-pipelines-at-scale": {
    "parts": {
      "pipeline-purpose": {
        "mermaid": {
          "title": "ML pipeline DAG",
          "caption": "ML pipeline DAG",
          "code": "%%{init: {'theme':'dark','themeVariables':{'primaryColor':'#696cff','primaryTextColor':'#e4e4e7','primaryBorderColor':'#5658d4','lineColor':'#a1a1aa','secondaryColor':'#2b2c40','tertiaryColor':'#232333'}}}%%\nflowchart TD\n  A[Data ingest] --> B[Validate]\n  B --> C[Features]\n  C --> D[Train]\n  D --> E[Evaluate]\n  E --> F[Register]\n  F --> G[Deploy]"
        },
        "workedExample": {
          "title": "Batch window aggregator",
          "body": "Aggregate events into hourly buckets deterministically.",
          "language": "python",
          "code": "from collections import defaultdict\nevents = [(0, 2), (15, 1), (70, 4), (125, 3)]\nbuckets = defaultdict(int)\nfor ts, val in events:\n    buckets[ts // 60] += val\nfor hour in sorted(buckets):\n    print(f\"hour {hour}: total {buckets[hour]}\")"
        }
      },
      "batch-vs-streaming": {
        "mermaid": {
          "title": "Dataset lineage",
          "caption": "Dataset lineage",
          "code": "%%{init: {'theme':'dark','themeVariables':{'primaryColor':'#696cff','primaryTextColor':'#e4e4e7','primaryBorderColor':'#5658d4','lineColor':'#a1a1aa','secondaryColor':'#2b2c40','tertiaryColor':'#232333'}}}%%\nflowchart TD\n  A[Raw dump] --> B[Snapshot v1]\n  B --> C[Clean v1.1]\n  C --> D[Train set]\n  C --> E[Serve features]"
        },
        "workedExample": {
          "title": "Dataset manifest fingerprint",
          "body": "Hash sorted file paths for a reproducible dataset manifest.",
          "language": "python",
          "code": "import hashlib\nfiles = sorted([\"train.parquet\", \"val.parquet\", \"features/schema.json\"])\ndigest = hashlib.sha256(\"\\n\".join(files).encode()).hexdigest()[:12]\nprint(\"manifest id\", digest)"
        }
      },
      "distributed-engines": {
        "workedExample": {
          "title": "Pipeline inside CV fold",
          "body": "Ensure preprocessing is fit only on training folds.",
          "language": "python",
          "code": "from sklearn.pipeline import Pipeline\nfrom sklearn.preprocessing import StandardScaler\nfrom sklearn.linear_model import LogisticRegression\nfrom sklearn.model_selection import cross_val_score\nfrom sklearn.datasets import make_classification\nX, y = make_classification(n_samples=200, random_state=9)\npipe = Pipeline([(\"s\", StandardScaler()), (\"c\", LogisticRegression(max_iter=200))])\nprint(\"cv acc\", round(cross_val_score(pipe, X, y, cv=3).mean(), 3))"
        }
      }
    },
    "wrapUp": {
      "nextSteps": [
        {
          "label": "Open the topic lab diagram and decision guide",
          "href": "/module/data-engineering-for-ml/lesson/data-pipelines-at-scale#topic-lab"
        },
        {
          "label": "Run the primary Python lab exercise",
          "href": "/module/data-engineering-for-ml/lesson/data-pipelines-at-scale#ml-practice-lab",
          "exerciseId": "data-pipeline-spark"
        }
      ]
    }
  },
  "data-engineering-for-ml/dataset-management": {
    "parts": {
      "datasets-as-products": {
        "mermaid": {
          "title": "Dataset lineage",
          "caption": "Dataset lineage",
          "code": "%%{init: {'theme':'dark','themeVariables':{'primaryColor':'#696cff','primaryTextColor':'#e4e4e7','primaryBorderColor':'#5658d4','lineColor':'#a1a1aa','secondaryColor':'#2b2c40','tertiaryColor':'#232333'}}}%%\nflowchart TD\n  A[Raw dump] --> B[Snapshot v1]\n  B --> C[Clean v1.1]\n  C --> D[Train set]\n  C --> E[Serve features]"
        },
        "workedExample": {
          "title": "Dataset manifest fingerprint",
          "body": "Hash sorted file paths for a reproducible dataset manifest.",
          "language": "python",
          "code": "import hashlib\nfiles = sorted([\"train.parquet\", \"val.parquet\", \"features/schema.json\"])\ndigest = hashlib.sha256(\"\\n\".join(files).encode()).hexdigest()[:12]\nprint(\"manifest id\", digest)"
        }
      },
      "versioning-and-lineage": {
        "mermaid": {
          "title": "ML pipeline DAG",
          "caption": "ML pipeline DAG",
          "code": "%%{init: {'theme':'dark','themeVariables':{'primaryColor':'#696cff','primaryTextColor':'#e4e4e7','primaryBorderColor':'#5658d4','lineColor':'#a1a1aa','secondaryColor':'#2b2c40','tertiaryColor':'#232333'}}}%%\nflowchart TD\n  A[Data ingest] --> B[Validate]\n  B --> C[Features]\n  C --> D[Train]\n  D --> E[Evaluate]\n  E --> F[Register]\n  F --> G[Deploy]"
        },
        "workedExample": {
          "title": "Leakage inflates validation score",
          "body": "Fit a scaler on all data vs inside each CV fold.",
          "language": "python",
          "code": "import numpy as np\nfrom sklearn.model_selection import cross_val_score\nfrom sklearn.pipeline import Pipeline\nfrom sklearn.preprocessing import StandardScaler\nfrom sklearn.linear_model import LogisticRegression\nfrom sklearn.datasets import make_classification\nX, y = make_classification(n_samples=300, n_features=6, random_state=1)\nleaky = Pipeline([(\"scale\", StandardScaler()), (\"clf\", LogisticRegression(max_iter=200))])\nleaky.named_steps[\"scale\"].fit(X)\nsafe = Pipeline([(\"scale\", StandardScaler()), (\"clf\", LogisticRegression(max_iter=200))])\nprint(\"leaky CV:\", round(cross_val_score(leaky, X, y, cv=3).mean(), 3))\nprint(\"safe CV:\", round(cross_val_score(safe, X, y, cv=3).mean(), 3))"
        }
      },
      "train-serving-skew": {
        "workedExample": {
          "title": "Batch window aggregator",
          "body": "Aggregate events into hourly buckets deterministically.",
          "language": "python",
          "code": "from collections import defaultdict\nevents = [(0, 2), (15, 1), (70, 4), (125, 3)]\nbuckets = defaultdict(int)\nfor ts, val in events:\n    buckets[ts // 60] += val\nfor hour in sorted(buckets):\n    print(f\"hour {hour}: total {buckets[hour]}\")"
        }
      }
    },
    "wrapUp": {
      "nextSteps": [
        {
          "label": "Open the topic lab diagram and decision guide",
          "href": "/module/data-engineering-for-ml/lesson/dataset-management#topic-lab"
        },
        {
          "label": "Run the primary Python lab exercise",
          "href": "/module/data-engineering-for-ml/lesson/dataset-management#ml-practice-lab",
          "exerciseId": "labeling-pipeline-quality"
        }
      ]
    }
  },
  "ai-application-lab/chat-api-and-streaming": {
    "parts": {
      "sync-vs-stream": {
        "mermaid": {
          "title": "Serving paths",
          "caption": "Serving paths",
          "code": "%%{init: {'theme':'dark','themeVariables':{'primaryColor':'#696cff','primaryTextColor':'#e4e4e7','primaryBorderColor':'#5658d4','lineColor':'#a1a1aa','secondaryColor':'#2b2c40','tertiaryColor':'#232333'}}}%%\nflowchart LR\n  A[Client] --> B{Mode}\n  B -->|sync| C[Online API]\n  B -->|stream| D[SSE tokens]\n  B -->|batch| E[Queue worker]"
        },
        "workedExample": {
          "title": "Streaming latency stack",
          "body": "Sum per-stage latency budget for an SSE chat path.",
          "language": "python",
          "code": "stages = {\"auth\": 12, \"retrieve\": 45, \"prefill\": 80, \"first_token\": 35, \"decode\": 120}\ntotal = sum(stages.values())\nprint(\"stage ms:\", stages)\nprint(\"p50 budget ms:\", total)\nprint(\"headroom if SLO 400ms\", 400 - total)"
        }
      },
      "sessions": {
        "mermaid": {
          "title": "KV-cache decode steps",
          "caption": "KV-cache decode steps",
          "code": "%%{init: {'theme':'dark','themeVariables':{'primaryColor':'#696cff','primaryTextColor':'#e4e4e7','primaryBorderColor':'#5658d4','lineColor':'#a1a1aa','secondaryColor':'#2b2c40','tertiaryColor':'#232333'}}}%%\nflowchart LR\n  A[Prefill] --> B[Cache K/V]\n  B --> C[Decode step]\n  C --> D[Append token]\n  D --> C"
        },
        "workedExample": {
          "title": "Token cost estimate",
          "body": "Estimate USD from prompt + completion token counts.",
          "language": "python",
          "code": "prompt_tokens = 1200\ncompletion_tokens = 350\nprice_in, price_out = 0.15, 0.60  # per 1M tokens (illustrative)\ncost = (prompt_tokens * price_in + completion_tokens * price_out) / 1_000_000\nprint(\"est USD\", round(cost, 6))"
        }
      }
    },
    "wrapUp": {
      "nextSteps": [
        {
          "label": "Open the topic lab diagram and decision guide",
          "href": "/module/ai-application-lab/lesson/chat-api-and-streaming#topic-lab"
        },
        {
          "label": "Run the primary Python lab exercise",
          "href": "/module/ai-application-lab/lesson/chat-api-and-streaming#ml-practice-lab",
          "exerciseId": "stream-budget"
        }
      ]
    }
  },
  "ai-application-lab/multi-tenant-rag-products": {
    "parts": {
      "metadata": {
        "mermaid": {
          "title": "Tenant isolation",
          "caption": "Tenant isolation",
          "code": "%%{init: {'theme':'dark','themeVariables':{'primaryColor':'#696cff','primaryTextColor':'#e4e4e7','primaryBorderColor':'#5658d4','lineColor':'#a1a1aa','secondaryColor':'#2b2c40','tertiaryColor':'#232333'}}}%%\nflowchart LR\n  A[Request] --> B[Auth]\n  B --> C[ACL filter]\n  C --> D[Index query]\n  D --> E[Ranked hits]"
        },
        "workedExample": {
          "title": "Chunk and recall@k toy index",
          "body": "Split text into chunks and score whether gold chunk is in top-k.",
          "language": "python",
          "code": "text = \"Refund within 30 days. Password reset via email. SSO uses SAML.\"\nchunks = [text]\nfor sep in [\". \", \" \"]:\n    if len(chunks) == 1 and len(chunks[0]) > 40:\n        chunks = [c.strip() for c in text.split(sep) if c.strip()]\nquery = \"password reset\"\ndef score(c):\n    return sum(1 for w in query.split() if w in c.lower())\nranked = sorted(chunks, key=score, reverse=True)\nprint(\"top chunk:\", ranked[0])\nprint(\"recall@1\", \"password\" in ranked[0].lower())"
        }
      },
      "freshness-empty": {
        "mermaid": {
          "title": "RAG ingest and query paths",
          "caption": "RAG ingest and query paths",
          "code": "%%{init: {'theme':'dark','themeVariables':{'primaryColor':'#696cff','primaryTextColor':'#e4e4e7','primaryBorderColor':'#5658d4','lineColor':'#a1a1aa','secondaryColor':'#2b2c40','tertiaryColor':'#232333'}}}%%\nflowchart LR\n  subgraph ingest [Ingest]\n    I1[Docs] --> I2[Chunk]\n    I2 --> I3[Embed]\n    I3 --> I4[Index]\n  end\n  subgraph query [Query]\n    Q1[Question] --> Q2[Retrieve]\n    Q2 --> Q3[Prompt]\n    Q3 --> Q4[Answer]\n  end\n  I4 --> Q2"
        },
        "workedExample": {
          "title": "Cosine nearest neighbors",
          "body": "Rank five toy vectors against a query embedding.",
          "language": "python",
          "code": "import numpy as np\nvecs = np.array([[1,0,0],[0.9,0.1,0],[0,1,0],[0.8,0.2,0],[0,0,1]])\nquery = np.array([1.0, 0.0, 0.0])\ndef cos(a,b):\n    return float(a @ b / (np.linalg.norm(a) * np.linalg.norm(b)))\nscores = [(i, cos(query, v)) for i,v in enumerate(vecs)]\nfor i,s in sorted(scores, key=lambda x: -x[1]):\n    print(i, round(s, 3))"
        }
      },
      "tenant-filters": {
        "workedExample": {
          "title": "Tenant filter on mock index",
          "body": "Apply ACL tenant id before ranking retrieval hits.",
          "language": "python",
          "code": "docs = [\n    {\"id\":\"a\", \"tenant\":\"t1\", \"text\":\"reset\"},\n    {\"id\":\"b\", \"tenant\":\"t2\", \"text\":\"reset\"},\n    {\"id\":\"c\", \"tenant\":\"t1\", \"text\":\"billing\"},\n]\ntenant = \"t1\"\nvisible = [d for d in docs if d[\"tenant\"] == tenant]\nprint(\"visible ids\", [d[\"id\"] for d in visible])"
        }
      }
    },
    "wrapUp": {
      "nextSteps": [
        {
          "label": "Open the topic lab diagram and decision guide",
          "href": "/module/ai-application-lab/lesson/multi-tenant-rag-products#topic-lab"
        },
        {
          "label": "Run the primary Python lab exercise",
          "href": "/module/ai-application-lab/lesson/multi-tenant-rag-products#ml-practice-lab",
          "exerciseId": "acl-filter"
        }
      ]
    }
  },
  "ai-application-lab/shipping-ai-features": {
    "parts": {
      "ci-gates": {
        "mermaid": {
          "title": "Release gates",
          "caption": "Release gates",
          "code": "%%{init: {'theme':'dark','themeVariables':{'primaryColor':'#696cff','primaryTextColor':'#e4e4e7','primaryBorderColor':'#5658d4','lineColor':'#a1a1aa','secondaryColor':'#2b2c40','tertiaryColor':'#232333'}}}%%\nflowchart LR\n  A[Shadow] --> B[Canary]\n  B --> C[Partial]\n  C --> D[Full rollout]"
        },
        "workedExample": {
          "title": "Release gate checklist score",
          "body": "Score shadow/canary gates before full rollout.",
          "language": "python",
          "code": "gates = {\"eval_pass\": True, \"latency_ok\": True, \"error_budget\": True, \"guardrails\": False}\nscore = sum(gates.values())\nprint(\"gates\", gates)\nprint(\"ready\", score >= 3)"
        }
      },
      "shadow-canary": {
        "mermaid": {
          "title": "Eval harness",
          "caption": "Eval harness",
          "code": "%%{init: {'theme':'dark','themeVariables':{'primaryColor':'#696cff','primaryTextColor':'#e4e4e7','primaryBorderColor':'#5658d4','lineColor':'#a1a1aa','secondaryColor':'#2b2c40','tertiaryColor':'#232333'}}}%%\nflowchart LR\n  A[Golden set] --> B[Run model]\n  B --> C[Score]\n  C --> D{Pass gate?}\n  D -->|yes| E[Ship]\n  D -->|no| F[Block]"
        },
        "workedExample": {
          "title": "Eval harness pass/fail",
          "body": "Score answers against gold strings with a simple overlap gate.",
          "language": "python",
          "code": "def score(answer, gold):\n    a = set(answer.lower().split())\n    g = set(gold.lower().split())\n    return len(a & g) / max(1, len(g))\ncases = [(\"reset via email link\", \"users reset password using email link\")]\nfor ans, gold in cases:\n    s = score(ans, gold)\n    print(round(s,3), \"pass\", s >= 0.4)"
        }
      },
      "rollback": {
        "workedExample": {
          "title": "Risk-tier gate score",
          "body": "Combine eval, guardrail, and latency signals into a ship decision.",
          "language": "python",
          "code": "signals = {\"eval\": 0.82, \"guardrails\": True, \"latency_ok\": True}\ntier = \"high\" if signals[\"eval\"] < 0.7 else \"standard\"\nship = signals[\"guardrails\"] and signals[\"latency_ok\"] and signals[\"eval\"] >= 0.75\nprint(\"tier\", tier, \"ship\", ship)"
        }
      }
    },
    "wrapUp": {
      "nextSteps": [
        {
          "label": "Open the topic lab diagram and decision guide",
          "href": "/module/ai-application-lab/lesson/shipping-ai-features#topic-lab"
        },
        {
          "label": "Run the primary Python lab exercise",
          "href": "/module/ai-application-lab/lesson/shipping-ai-features#ml-practice-lab",
          "exerciseId": "eval-gate"
        }
      ]
    }
  },
  "ml-interactive-lab/feature-engineering-playground": {
    "parts": {
      "coordinates-not-columns": {
        "mermaid": {
          "title": "Feature → model pipeline",
          "caption": "Feature → model pipeline",
          "code": "%%{init: {'theme':'dark','themeVariables':{'primaryColor':'#696cff','primaryTextColor':'#e4e4e7','primaryBorderColor':'#5658d4','lineColor':'#a1a1aa','secondaryColor':'#2b2c40','tertiaryColor':'#232333'}}}%%\nflowchart LR\n  A[Raw table] --> B[Clean]\n  B --> C[Encode]\n  C --> D[Scale]\n  D --> E[Model]\n  E --> F[Metrics]"
        },
        "workedExample": {
          "title": "StandardScaler before KNN",
          "body": "Show neighbor label changes after scaling a dominant feature.",
          "language": "python",
          "code": "import numpy as np\nfrom sklearn.preprocessing import StandardScaler\nX = np.array([[1, 1000],[2, 1100],[10, 50]])\nquery = np.array([[1.5, 1050]])\ndef nn(X, q):\n    d = np.linalg.norm(X - q, axis=1)\n    return int(np.argmin(d))\nprint(\"raw nn label idx\", nn(X, query))\nXs = StandardScaler().fit_transform(X)\nqs = StandardScaler().fit(X).transform(query)\nprint(\"scaled nn label idx\", nn(Xs, qs))"
        }
      },
      "missingness-and-outliers": {
        "mermaid": {
          "title": "Lab iteration loop",
          "caption": "Lab iteration loop",
          "code": "%%{init: {'theme':'dark','themeVariables':{'primaryColor':'#696cff','primaryTextColor':'#e4e4e7','primaryBorderColor':'#5658d4','lineColor':'#a1a1aa','secondaryColor':'#2b2c40','tertiaryColor':'#232333'}}}%%\nflowchart LR\n  A[Hypothesis] --> B[Code]\n  B --> C[Run]\n  C --> D[Plot]\n  D --> E{Learned?}\n  E -->|yes| F[Next topic]\n  E -->|no| A"
        },
        "workedExample": {
          "title": "Feature scale changes distances",
          "body": "Compare Euclidean distance before and after scaling one coordinate by 100×.",
          "language": "python",
          "code": "import numpy as np\na = np.array([1.0, 0.0])\nb = np.array([2.0, 100.0])\nprint(\"raw distance:\", round(np.linalg.norm(a - b), 3))\nscale = np.array([1.0, 0.01])\nprint(\"scaled distance:\", round(np.linalg.norm((a - b) * scale), 3))"
        }
      },
      "categorical-encoding": {
        "workedExample": {
          "title": "Cross-validation score spread",
          "body": "Train three sklearn estimators on the same folds and print mean metrics.",
          "language": "python",
          "code": "from sklearn.datasets import make_classification\nfrom sklearn.model_selection import cross_val_score\nfrom sklearn.linear_model import LogisticRegression\nfrom sklearn.tree import DecisionTreeClassifier\nfrom sklearn.neighbors import KNeighborsClassifier\nX, y = make_classification(n_samples=400, n_features=8, random_state=0)\nmodels = {\n    \"logistic\": LogisticRegression(max_iter=200),\n    \"tree\": DecisionTreeClassifier(max_depth=4, random_state=0),\n    \"knn\": KNeighborsClassifier(n_neighbors=7),\n}\nfor name, model in models.items():\n    scores = cross_val_score(model, X, y, cv=3)\n    print(name, \"mean acc\", round(scores.mean(), 3), \"std\", round(scores.std(), 3))"
        }
      },
      "pipeline-discipline": {
        "interactiveDemo": {
          "title": "Scaling multiplier",
          "body": "Change the dominant feature scale and watch KNN neighbor index.",
          "sliders": [
            {
              "id": "mult",
              "label": "Feature-2 scale",
              "min": 1,
              "max": 200,
              "step": 10,
              "value": 100
            }
          ],
          "codeTemplate": "import numpy as np\nmult = {{mult}}\nX = np.array([[1, 1.0],[2, 1.1],[10, 0.05]])\nX[:,1] *= mult / 100.0\nq = np.array([[1.5, mult/100.0 * 1.05]])\nd = np.linalg.norm(X - q, axis=1)\nprint(\"mult\", mult, \"nn idx\", int(np.argmin(d)))",
          "language": "python"
        }
      }
    },
    "wrapUp": {
      "nextSteps": [
        {
          "label": "Open the topic lab diagram and decision guide",
          "href": "/module/ml-interactive-lab/lesson/feature-engineering-playground#topic-lab"
        },
        {
          "label": "Run the primary Python lab exercise",
          "href": "/module/ml-interactive-lab/lesson/feature-engineering-playground#ml-practice-lab",
          "exerciseId": "mixed-column-pipeline"
        }
      ]
    }
  },
  "ml-interactive-lab/supervised-learning-workshop": {
    "parts": {
      "learning-from-labels": {
        "mermaid": {
          "title": "Train / validate / deploy loop",
          "caption": "Train / validate / deploy loop",
          "code": "%%{init: {'theme':'dark','themeVariables':{'primaryColor':'#696cff','primaryTextColor':'#e4e4e7','primaryBorderColor':'#5658d4','lineColor':'#a1a1aa','secondaryColor':'#2b2c40','tertiaryColor':'#232333'}}}%%\nflowchart TD\n  A[Train split] --> B[Fit model]\n  B --> C[Validate]\n  C --> D{Gate?}\n  D -->|pass| E[Serve]\n  D -->|fail| A"
        },
        "workedExample": {
          "title": "2D classifier benchmark",
          "body": "Fit logistic regression on synthetic 2D blobs and print accuracy.",
          "language": "python",
          "code": "from sklearn.datasets import make_blobs\nfrom sklearn.linear_model import LogisticRegression\nfrom sklearn.model_selection import cross_val_score\nX, y = make_blobs(n_samples=180, centers=2, random_state=3)\nclf = LogisticRegression(max_iter=300)\nprint(\"cv acc\", round(cross_val_score(clf, X, y, cv=3).mean(), 3))"
        }
      },
      "splits-and-baselines": {
        "mermaid": {
          "title": "Lab iteration loop",
          "caption": "Lab iteration loop",
          "code": "%%{init: {'theme':'dark','themeVariables':{'primaryColor':'#696cff','primaryTextColor':'#e4e4e7','primaryBorderColor':'#5658d4','lineColor':'#a1a1aa','secondaryColor':'#2b2c40','tertiaryColor':'#232333'}}}%%\nflowchart LR\n  A[Hypothesis] --> B[Code]\n  B --> C[Run]\n  C --> D[Plot]\n  D --> E{Learned?}\n  E -->|yes| F[Next topic]\n  E -->|no| A"
        },
        "workedExample": {
          "title": "Cross-validation score spread",
          "body": "Train three sklearn estimators on the same folds and print mean metrics.",
          "language": "python",
          "code": "from sklearn.datasets import make_classification\nfrom sklearn.model_selection import cross_val_score\nfrom sklearn.linear_model import LogisticRegression\nfrom sklearn.tree import DecisionTreeClassifier\nfrom sklearn.neighbors import KNeighborsClassifier\nX, y = make_classification(n_samples=400, n_features=8, random_state=0)\nmodels = {\n    \"logistic\": LogisticRegression(max_iter=200),\n    \"tree\": DecisionTreeClassifier(max_depth=4, random_state=0),\n    \"knn\": KNeighborsClassifier(n_neighbors=7),\n}\nfor name, model in models.items():\n    scores = cross_val_score(model, X, y, cv=3)\n    print(name, \"mean acc\", round(scores.mean(), 3), \"std\", round(scores.std(), 3))"
        }
      },
      "model-families": {
        "workedExample": {
          "title": "Leakage inflates validation score",
          "body": "Fit a scaler on all data vs inside each CV fold.",
          "language": "python",
          "code": "import numpy as np\nfrom sklearn.model_selection import cross_val_score\nfrom sklearn.pipeline import Pipeline\nfrom sklearn.preprocessing import StandardScaler\nfrom sklearn.linear_model import LogisticRegression\nfrom sklearn.datasets import make_classification\nX, y = make_classification(n_samples=300, n_features=6, random_state=1)\nleaky = Pipeline([(\"scale\", StandardScaler()), (\"clf\", LogisticRegression(max_iter=200))])\nleaky.named_steps[\"scale\"].fit(X)\nsafe = Pipeline([(\"scale\", StandardScaler()), (\"clf\", LogisticRegression(max_iter=200))])\nprint(\"leaky CV:\", round(cross_val_score(leaky, X, y, cv=3).mean(), 3))\nprint(\"safe CV:\", round(cross_val_score(safe, X, y, cv=3).mean(), 3))"
        }
      }
    },
    "wrapUp": {
      "nextSteps": [
        {
          "label": "Open the topic lab diagram and decision guide",
          "href": "/module/ml-interactive-lab/lesson/supervised-learning-workshop#topic-lab"
        },
        {
          "label": "Run the primary Python lab exercise",
          "href": "/module/ml-interactive-lab/lesson/supervised-learning-workshop#ml-practice-lab",
          "exerciseId": "classifier-cross-val-benchmark"
        }
      ]
    }
  },
  "ml-interactive-lab/unsupervised-learning-workshop": {
    "parts": {
      "structure-without-labels": {
        "mermaid": {
          "title": "Lab iteration loop",
          "caption": "Lab iteration loop",
          "code": "%%{init: {'theme':'dark','themeVariables':{'primaryColor':'#696cff','primaryTextColor':'#e4e4e7','primaryBorderColor':'#5658d4','lineColor':'#a1a1aa','secondaryColor':'#2b2c40','tertiaryColor':'#232333'}}}%%\nflowchart LR\n  A[Hypothesis] --> B[Code]\n  B --> C[Run]\n  C --> D[Plot]\n  D --> E{Learned?}\n  E -->|yes| F[Next topic]\n  E -->|no| A"
        },
        "workedExample": {
          "title": "K-means inertia sweep",
          "body": "Plot inertia vs k on synthetic clusters (table printed).",
          "language": "python",
          "code": "from sklearn.cluster import KMeans\nfrom sklearn.datasets import make_blobs\nimport numpy as np\nX, _ = make_blobs(n_samples=200, centers=3, random_state=4)\nfor k in [2, 3, 4, 5]:\n    km = KMeans(n_clusters=k, n_init=10, random_state=0)\n    km.fit(X)\n    print(\"k\", k, \"inertia\", round(km.inertia_, 1))"
        }
      },
      "clustering": {
        "mermaid": {
          "title": "Feature → model pipeline",
          "caption": "Feature → model pipeline",
          "code": "%%{init: {'theme':'dark','themeVariables':{'primaryColor':'#696cff','primaryTextColor':'#e4e4e7','primaryBorderColor':'#5658d4','lineColor':'#a1a1aa','secondaryColor':'#2b2c40','tertiaryColor':'#232333'}}}%%\nflowchart LR\n  A[Raw table] --> B[Clean]\n  B --> C[Encode]\n  C --> D[Scale]\n  D --> E[Model]\n  E --> F[Metrics]"
        },
        "workedExample": {
          "title": "Feature scale changes distances",
          "body": "Compare Euclidean distance before and after scaling one coordinate by 100×.",
          "language": "python",
          "code": "import numpy as np\na = np.array([1.0, 0.0])\nb = np.array([2.0, 100.0])\nprint(\"raw distance:\", round(np.linalg.norm(a - b), 3))\nscale = np.array([1.0, 0.01])\nprint(\"scaled distance:\", round(np.linalg.norm((a - b) * scale), 3))"
        }
      },
      "dimensionality-reduction": {
        "workedExample": {
          "title": "2D classifier benchmark",
          "body": "Fit logistic regression on synthetic 2D blobs and print accuracy.",
          "language": "python",
          "code": "from sklearn.datasets import make_blobs\nfrom sklearn.linear_model import LogisticRegression\nfrom sklearn.model_selection import cross_val_score\nX, y = make_blobs(n_samples=180, centers=2, random_state=3)\nclf = LogisticRegression(max_iter=300)\nprint(\"cv acc\", round(cross_val_score(clf, X, y, cv=3).mean(), 3))"
        }
      }
    },
    "wrapUp": {
      "nextSteps": [
        {
          "label": "Open the topic lab diagram and decision guide",
          "href": "/module/ml-interactive-lab/lesson/unsupervised-learning-workshop#topic-lab"
        },
        {
          "label": "Run the primary Python lab exercise",
          "href": "/module/ml-interactive-lab/lesson/unsupervised-learning-workshop#ml-practice-lab",
          "exerciseId": "kmeans-model-selection"
        }
      ]
    }
  },
  "deep-learning-from-scratch/perceptron-and-mlp-numpy": {
    "parts": {
      "perceptron-boundary": {
        "mermaid": {
          "title": "Feature → model pipeline",
          "caption": "Feature → model pipeline",
          "code": "%%{init: {'theme':'dark','themeVariables':{'primaryColor':'#696cff','primaryTextColor':'#e4e4e7','primaryBorderColor':'#5658d4','lineColor':'#a1a1aa','secondaryColor':'#2b2c40','tertiaryColor':'#232333'}}}%%\nflowchart LR\n  A[Raw table] --> B[Clean]\n  B --> C[Encode]\n  C --> D[Scale]\n  D --> E[Model]\n  E --> F[Metrics]"
        }
      },
      "perceptron-training": {
        "mermaid": {
          "title": "Scaled dot-product attention",
          "caption": "Scaled dot-product attention",
          "code": "%%{init: {'theme':'dark','themeVariables':{'primaryColor':'#696cff','primaryTextColor':'#e4e4e7','primaryBorderColor':'#5658d4','lineColor':'#a1a1aa','secondaryColor':'#2b2c40','tertiaryColor':'#232333'}}}%%\nflowchart LR\n  Q[Queries] --> S[Scores]\n  K[Keys] --> S\n  S --> SM[Softmax]\n  SM --> V[Values]\n  V --> O[Context]"
        }
      }
    },
    "wrapUp": {
      "nextSteps": [
        {
          "label": "Open the topic lab diagram and decision guide",
          "href": "/module/deep-learning-from-scratch/lesson/perceptron-and-mlp-numpy#topic-lab"
        },
        {
          "label": "Run the primary Python lab exercise",
          "href": "/module/deep-learning-from-scratch/lesson/perceptron-and-mlp-numpy#ml-practice-lab",
          "exerciseId": "train-perceptron-and-gate"
        }
      ]
    }
  },
  "deep-learning-from-scratch/backpropagation-by-hand": {
    "parts": {
      "chain-rule-graph": {
        "mermaid": {
          "title": "Scaled dot-product attention",
          "caption": "Scaled dot-product attention",
          "code": "%%{init: {'theme':'dark','themeVariables':{'primaryColor':'#696cff','primaryTextColor':'#e4e4e7','primaryBorderColor':'#5658d4','lineColor':'#a1a1aa','secondaryColor':'#2b2c40','tertiaryColor':'#232333'}}}%%\nflowchart LR\n  Q[Queries] --> S[Scores]\n  K[Keys] --> S\n  S --> SM[Softmax]\n  SM --> V[Values]\n  V --> O[Context]"
        }
      },
      "matrix-gradients": {
        "mermaid": {
          "title": "Token lifecycle",
          "caption": "Token lifecycle",
          "code": "%%{init: {'theme':'dark','themeVariables':{'primaryColor':'#696cff','primaryTextColor':'#e4e4e7','primaryBorderColor':'#5658d4','lineColor':'#a1a1aa','secondaryColor':'#2b2c40','tertiaryColor':'#232333'}}}%%\nflowchart LR\n  A[Text] --> B[Tokenize]\n  B --> C[Embed]\n  C --> D[Attention]\n  D --> E[Decode]"
        }
      }
    },
    "wrapUp": {
      "nextSteps": [
        {
          "label": "Open the topic lab diagram and decision guide",
          "href": "/module/deep-learning-from-scratch/lesson/backpropagation-by-hand#topic-lab"
        },
        {
          "label": "Run the primary Python lab exercise",
          "href": "/module/deep-learning-from-scratch/lesson/backpropagation-by-hand#ml-practice-lab",
          "exerciseId": "manual-two-layer-backward"
        }
      ]
    }
  },
  "deep-learning-from-scratch/cnn-building-blocks-numpy": {
    "parts": {
      "why-convolution": {
        "mermaid": {
          "title": "CNN block stack",
          "caption": "CNN block stack",
          "code": "%%{init: {'theme':'dark','themeVariables':{'primaryColor':'#696cff','primaryTextColor':'#e4e4e7','primaryBorderColor':'#5658d4','lineColor':'#a1a1aa','secondaryColor':'#2b2c40','tertiaryColor':'#232333'}}}%%\nflowchart LR\n  A[Image] --> B[Conv]\n  B --> C[ReLU]\n  C --> D[Pool]\n  D --> E[Conv]\n  E --> F[FC head]"
        }
      },
      "padding-stride-shape": {
        "mermaid": {
          "title": "Lab iteration loop",
          "caption": "Lab iteration loop",
          "code": "%%{init: {'theme':'dark','themeVariables':{'primaryColor':'#696cff','primaryTextColor':'#e4e4e7','primaryBorderColor':'#5658d4','lineColor':'#a1a1aa','secondaryColor':'#2b2c40','tertiaryColor':'#232333'}}}%%\nflowchart LR\n  A[Hypothesis] --> B[Code]\n  B --> C[Run]\n  C --> D[Plot]\n  D --> E{Learned?}\n  E -->|yes| F[Next topic]\n  E -->|no| A"
        }
      }
    },
    "wrapUp": {
      "nextSteps": [
        {
          "label": "Open the topic lab diagram and decision guide",
          "href": "/module/deep-learning-from-scratch/lesson/cnn-building-blocks-numpy#topic-lab"
        },
        {
          "label": "Run the primary Python lab exercise",
          "href": "/module/deep-learning-from-scratch/lesson/cnn-building-blocks-numpy#ml-practice-lab",
          "exerciseId": "simple-conv2d-numpy"
        }
      ]
    }
  },
  "transformers-attention-lab/attention-from-scratch": {
    "parts": {
      "attention-as-routing": {
        "mermaid": {
          "title": "Scaled dot-product attention",
          "caption": "Scaled dot-product attention",
          "code": "%%{init: {'theme':'dark','themeVariables':{'primaryColor':'#696cff','primaryTextColor':'#e4e4e7','primaryBorderColor':'#5658d4','lineColor':'#a1a1aa','secondaryColor':'#2b2c40','tertiaryColor':'#232333'}}}%%\nflowchart LR\n  Q[Queries] --> S[Scores]\n  K[Keys] --> S\n  S --> SM[Softmax]\n  SM --> V[Values]\n  V --> O[Context]"
        }
      },
      "scaling-softmax": {
        "mermaid": {
          "title": "Token lifecycle",
          "caption": "Token lifecycle",
          "code": "%%{init: {'theme':'dark','themeVariables':{'primaryColor':'#696cff','primaryTextColor':'#e4e4e7','primaryBorderColor':'#5658d4','lineColor':'#a1a1aa','secondaryColor':'#2b2c40','tertiaryColor':'#232333'}}}%%\nflowchart LR\n  A[Text] --> B[Tokenize]\n  B --> C[Embed]\n  C --> D[Attention]\n  D --> E[Decode]"
        }
      }
    },
    "wrapUp": {
      "nextSteps": [
        {
          "label": "Open the topic lab diagram and decision guide",
          "href": "/module/transformers-attention-lab/lesson/attention-from-scratch#topic-lab"
        },
        {
          "label": "Run the primary Python lab exercise",
          "href": "/module/transformers-attention-lab/lesson/attention-from-scratch#ml-practice-lab",
          "exerciseId": "implement-sdpa"
        }
      ]
    }
  },
  "transformers-attention-lab/multi-head-and-blocks": {
    "parts": {
      "many-heads": {
        "mermaid": {
          "title": "Scaled dot-product attention",
          "caption": "Scaled dot-product attention",
          "code": "%%{init: {'theme':'dark','themeVariables':{'primaryColor':'#696cff','primaryTextColor':'#e4e4e7','primaryBorderColor':'#5658d4','lineColor':'#a1a1aa','secondaryColor':'#2b2c40','tertiaryColor':'#232333'}}}%%\nflowchart LR\n  Q[Queries] --> S[Scores]\n  K[Keys] --> S\n  S --> SM[Softmax]\n  SM --> V[Values]\n  V --> O[Context]"
        }
      },
      "qkv-projections": {
        "mermaid": {
          "title": "CNN block stack",
          "caption": "CNN block stack",
          "code": "%%{init: {'theme':'dark','themeVariables':{'primaryColor':'#696cff','primaryTextColor':'#e4e4e7','primaryBorderColor':'#5658d4','lineColor':'#a1a1aa','secondaryColor':'#2b2c40','tertiaryColor':'#232333'}}}%%\nflowchart LR\n  A[Image] --> B[Conv]\n  B --> C[ReLU]\n  C --> D[Pool]\n  D --> E[Conv]\n  E --> F[FC head]"
        }
      }
    },
    "wrapUp": {
      "nextSteps": [
        {
          "label": "Open the topic lab diagram and decision guide",
          "href": "/module/transformers-attention-lab/lesson/multi-head-and-blocks#topic-lab"
        },
        {
          "label": "Run the primary Python lab exercise",
          "href": "/module/transformers-attention-lab/lesson/multi-head-and-blocks#ml-practice-lab",
          "exerciseId": "split-merge-heads"
        }
      ]
    }
  },
  "transformers-attention-lab/positional-encoding-and-causal-mask": {
    "parts": {
      "why-position": {
        "mermaid": {
          "title": "KV-cache decode steps",
          "caption": "KV-cache decode steps",
          "code": "%%{init: {'theme':'dark','themeVariables':{'primaryColor':'#696cff','primaryTextColor':'#e4e4e7','primaryBorderColor':'#5658d4','lineColor':'#a1a1aa','secondaryColor':'#2b2c40','tertiaryColor':'#232333'}}}%%\nflowchart LR\n  A[Prefill] --> B[Cache K/V]\n  B --> C[Decode step]\n  C --> D[Append token]\n  D --> C"
        }
      },
      "positional-methods": {
        "mermaid": {
          "title": "Scaled dot-product attention",
          "caption": "Scaled dot-product attention",
          "code": "%%{init: {'theme':'dark','themeVariables':{'primaryColor':'#696cff','primaryTextColor':'#e4e4e7','primaryBorderColor':'#5658d4','lineColor':'#a1a1aa','secondaryColor':'#2b2c40','tertiaryColor':'#232333'}}}%%\nflowchart LR\n  Q[Queries] --> S[Scores]\n  K[Keys] --> S\n  S --> SM[Softmax]\n  SM --> V[Values]\n  V --> O[Context]"
        }
      }
    },
    "wrapUp": {
      "nextSteps": [
        {
          "label": "Open the topic lab diagram and decision guide",
          "href": "/module/transformers-attention-lab/lesson/positional-encoding-and-causal-mask#topic-lab"
        },
        {
          "label": "Run the primary Python lab exercise",
          "href": "/module/transformers-attention-lab/lesson/positional-encoding-and-causal-mask#ml-practice-lab",
          "exerciseId": "build-sinusoidal-pe"
        }
      ]
    }
  },
  "llm-retrieval-lab/tokenization-workshop": {
    "parts": {
      "text-becomes-ids": {
        "mermaid": {
          "title": "Token lifecycle",
          "caption": "Token lifecycle",
          "code": "%%{init: {'theme':'dark','themeVariables':{'primaryColor':'#696cff','primaryTextColor':'#e4e4e7','primaryBorderColor':'#5658d4','lineColor':'#a1a1aa','secondaryColor':'#2b2c40','tertiaryColor':'#232333'}}}%%\nflowchart LR\n  A[Text] --> B[Tokenize]\n  B --> C[Embed]\n  C --> D[Attention]\n  D --> E[Decode]"
        },
        "workedExample": {
          "title": "Character pair counting",
          "body": "One step of naive BPE merge candidate selection.",
          "language": "python",
          "code": "from collections import Counter\ntext = \"low low low\"\npairs = Counter()\nchars = list(text)\nfor i in range(len(chars)-1):\n    pairs[(chars[i], chars[i+1])] += 1\nprint(\"top pair\", pairs.most_common(1)[0])"
        }
      },
      "vocab-tradeoffs": {
        "mermaid": {
          "title": "Lab iteration loop",
          "caption": "Lab iteration loop",
          "code": "%%{init: {'theme':'dark','themeVariables':{'primaryColor':'#696cff','primaryTextColor':'#e4e4e7','primaryBorderColor':'#5658d4','lineColor':'#a1a1aa','secondaryColor':'#2b2c40','tertiaryColor':'#232333'}}}%%\nflowchart LR\n  A[Hypothesis] --> B[Code]\n  B --> C[Run]\n  C --> D[Plot]\n  D --> E{Learned?}\n  E -->|yes| F[Next topic]\n  E -->|no| A"
        },
        "workedExample": {
          "title": "Temperature changes token diversity",
          "body": "Sample from a toy logit vector with different temperatures.",
          "language": "python",
          "code": "import numpy as np\nlogits = np.array([2.0, 1.0, 0.2, -0.5])\nfor temp in [0.3, 1.0, 1.8]:\n    scaled = logits / temp\n    exp = np.exp(scaled - scaled.max())\n    probs = exp / exp.sum()\n    print(f\"T={temp}\", np.round(probs, 3))"
        }
      },
      "merges-and-bytes": {
        "workedExample": {
          "title": "Token cost estimate",
          "body": "Estimate USD from prompt + completion token counts.",
          "language": "python",
          "code": "prompt_tokens = 1200\ncompletion_tokens = 350\nprice_in, price_out = 0.15, 0.60  # per 1M tokens (illustrative)\ncost = (prompt_tokens * price_in + completion_tokens * price_out) / 1_000_000\nprint(\"est USD\", round(cost, 6))"
        }
      }
    },
    "wrapUp": {
      "nextSteps": [
        {
          "label": "Open the topic lab diagram and decision guide",
          "href": "/module/llm-retrieval-lab/lesson/tokenization-workshop#topic-lab"
        },
        {
          "label": "Run the primary Python lab exercise",
          "href": "/module/llm-retrieval-lab/lesson/tokenization-workshop#ml-practice-lab",
          "exerciseId": "bpe-train-tiny"
        }
      ]
    }
  },
  "llm-retrieval-lab/embeddings-and-similarity-lab": {
    "parts": {
      "embedding-intuition": {
        "mermaid": {
          "title": "Hybrid retrieval funnel",
          "caption": "Hybrid retrieval funnel",
          "code": "%%{init: {'theme':'dark','themeVariables':{'primaryColor':'#696cff','primaryTextColor':'#e4e4e7','primaryBorderColor':'#5658d4','lineColor':'#a1a1aa','secondaryColor':'#2b2c40','tertiaryColor':'#232333'}}}%%\nflowchart LR\n  A[Query] --> B[BM25]\n  A --> C[Dense]\n  B --> D[RRF merge]\n  C --> D\n  D --> E[Rerank]\n  E --> F[Top-k]"
        },
        "workedExample": {
          "title": "TF-IDF top-k by hand",
          "body": "Score two documents for a query term overlap.",
          "language": "python",
          "code": "docs = [\"neural networks train deep\", \"graph database index\"]\nquery = \"neural train\"\ndef score(doc):\n    dset = set(doc.split())\n    qset = set(query.split())\n    return len(dset & qset)\nfor i,d in enumerate(docs):\n    print(i, score(d), d)"
        }
      },
      "similarity-metrics": {
        "mermaid": {
          "title": "RAG ingest and query paths",
          "caption": "RAG ingest and query paths",
          "code": "%%{init: {'theme':'dark','themeVariables':{'primaryColor':'#696cff','primaryTextColor':'#e4e4e7','primaryBorderColor':'#5658d4','lineColor':'#a1a1aa','secondaryColor':'#2b2c40','tertiaryColor':'#232333'}}}%%\nflowchart LR\n  subgraph ingest [Ingest]\n    I1[Docs] --> I2[Chunk]\n    I2 --> I3[Embed]\n    I3 --> I4[Index]\n  end\n  subgraph query [Query]\n    Q1[Question] --> Q2[Retrieve]\n    Q2 --> Q3[Prompt]\n    Q3 --> Q4[Answer]\n  end\n  I4 --> Q2"
        },
        "workedExample": {
          "title": "Cosine nearest neighbors",
          "body": "Rank five toy vectors against a query embedding.",
          "language": "python",
          "code": "import numpy as np\nvecs = np.array([[1,0,0],[0.9,0.1,0],[0,1,0],[0.8,0.2,0],[0,0,1]])\nquery = np.array([1.0, 0.0, 0.0])\ndef cos(a,b):\n    return float(a @ b / (np.linalg.norm(a) * np.linalg.norm(b)))\nscores = [(i, cos(query, v)) for i,v in enumerate(vecs)]\nfor i,s in sorted(scores, key=lambda x: -x[1]):\n    print(i, round(s, 3))"
        }
      },
      "chunking": {
        "workedExample": {
          "title": "Chunk and recall@k toy index",
          "body": "Split text into chunks and score whether gold chunk is in top-k.",
          "language": "python",
          "code": "text = \"Refund within 30 days. Password reset via email. SSO uses SAML.\"\nchunks = [text]\nfor sep in [\". \", \" \"]:\n    if len(chunks) == 1 and len(chunks[0]) > 40:\n        chunks = [c.strip() for c in text.split(sep) if c.strip()]\nquery = \"password reset\"\ndef score(c):\n    return sum(1 for w in query.split() if w in c.lower())\nranked = sorted(chunks, key=score, reverse=True)\nprint(\"top chunk:\", ranked[0])\nprint(\"recall@1\", \"password\" in ranked[0].lower())"
        }
      }
    },
    "wrapUp": {
      "nextSteps": [
        {
          "label": "Open the topic lab diagram and decision guide",
          "href": "/module/llm-retrieval-lab/lesson/embeddings-and-similarity-lab#topic-lab"
        },
        {
          "label": "Run the primary Python lab exercise",
          "href": "/module/llm-retrieval-lab/lesson/embeddings-and-similarity-lab#ml-practice-lab",
          "exerciseId": "tfidf-topk"
        }
      ]
    }
  },
  "llm-retrieval-lab/rag-evaluation-workshop": {
    "parts": {
      "rag-eval-scope": {
        "mermaid": {
          "title": "Eval harness",
          "caption": "Eval harness",
          "code": "%%{init: {'theme':'dark','themeVariables':{'primaryColor':'#696cff','primaryTextColor':'#e4e4e7','primaryBorderColor':'#5658d4','lineColor':'#a1a1aa','secondaryColor':'#2b2c40','tertiaryColor':'#232333'}}}%%\nflowchart LR\n  A[Golden set] --> B[Run model]\n  B --> C[Score]\n  C --> D{Pass gate?}\n  D -->|yes| E[Ship]\n  D -->|no| F[Block]"
        },
        "workedExample": {
          "title": "Recall@k on gold ids",
          "body": "Check whether any gold chunk id appears in retrieved top-k.",
          "language": "python",
          "code": "gold = {\"chunk-2\", \"chunk-5\"}\nretrieved = [\"chunk-1\", \"chunk-2\", \"chunk-3\"][:2]\nhit = bool(gold & set(retrieved))\nprint(\"recall@2\", hit)"
        }
      },
      "golden-sets": {
        "mermaid": {
          "title": "Hybrid retrieval funnel",
          "caption": "Hybrid retrieval funnel",
          "code": "%%{init: {'theme':'dark','themeVariables':{'primaryColor':'#696cff','primaryTextColor':'#e4e4e7','primaryBorderColor':'#5658d4','lineColor':'#a1a1aa','secondaryColor':'#2b2c40','tertiaryColor':'#232333'}}}%%\nflowchart LR\n  A[Query] --> B[BM25]\n  A --> C[Dense]\n  B --> D[RRF merge]\n  C --> D\n  D --> E[Rerank]\n  E --> F[Top-k]"
        },
        "workedExample": {
          "title": "Eval harness pass/fail",
          "body": "Score answers against gold strings with a simple overlap gate.",
          "language": "python",
          "code": "def score(answer, gold):\n    a = set(answer.lower().split())\n    g = set(gold.lower().split())\n    return len(a & g) / max(1, len(g))\ncases = [(\"reset via email link\", \"users reset password using email link\")]\nfor ans, gold in cases:\n    s = score(ans, gold)\n    print(round(s,3), \"pass\", s >= 0.4)"
        }
      },
      "context-metrics": {
        "workedExample": {
          "title": "Chunk and recall@k toy index",
          "body": "Split text into chunks and score whether gold chunk is in top-k.",
          "language": "python",
          "code": "text = \"Refund within 30 days. Password reset via email. SSO uses SAML.\"\nchunks = [text]\nfor sep in [\". \", \" \"]:\n    if len(chunks) == 1 and len(chunks[0]) > 40:\n        chunks = [c.strip() for c in text.split(sep) if c.strip()]\nquery = \"password reset\"\ndef score(c):\n    return sum(1 for w in query.split() if w in c.lower())\nranked = sorted(chunks, key=score, reverse=True)\nprint(\"top chunk:\", ranked[0])\nprint(\"recall@1\", \"password\" in ranked[0].lower())"
        }
      },
      "faithfulness-answer-quality": {
        "interactiveDemo": {
          "title": "Overlap pass threshold",
          "body": "Tune the overlap gate used by score_rag-style checks.",
          "sliders": [
            {
              "id": "thresh",
              "label": "Pass threshold",
              "min": 0.1,
              "max": 0.8,
              "step": 0.05,
              "value": 0.35
            }
          ],
          "codeTemplate": "answer = \"reset password using email link\"\ngold = \"users reset password via email link\"\nthresh = {{thresh}}\na, g = set(answer.split()), set(gold.split())\noverlap = len(a & g) / max(1, len(g))\nprint(\"overlap\", round(overlap,3), \"pass\", overlap >= thresh)",
          "language": "python"
        }
      }
    },
    "wrapUp": {
      "nextSteps": [
        {
          "label": "Open the topic lab diagram and decision guide",
          "href": "/module/llm-retrieval-lab/lesson/rag-evaluation-workshop#topic-lab"
        },
        {
          "label": "Run the primary Python lab exercise",
          "href": "/module/llm-retrieval-lab/lesson/rag-evaluation-workshop#ml-practice-lab",
          "exerciseId": "chunk-and-recall"
        }
      ]
    }
  },
  "ml-production-lab/leakage-safe-pipelines": {
    "parts": {
      "leakage-definition": {
        "mermaid": {
          "title": "Train / validate / deploy loop",
          "caption": "Train / validate / deploy loop",
          "code": "%%{init: {'theme':'dark','themeVariables':{'primaryColor':'#696cff','primaryTextColor':'#e4e4e7','primaryBorderColor':'#5658d4','lineColor':'#a1a1aa','secondaryColor':'#2b2c40','tertiaryColor':'#232333'}}}%%\nflowchart TD\n  A[Train split] --> B[Fit model]\n  B --> C[Validate]\n  C --> D{Gate?}\n  D -->|pass| E[Serve]\n  D -->|fail| A"
        },
        "workedExample": {
          "title": "Pipeline inside CV fold",
          "body": "Ensure preprocessing is fit only on training folds.",
          "language": "python",
          "code": "from sklearn.pipeline import Pipeline\nfrom sklearn.preprocessing import StandardScaler\nfrom sklearn.linear_model import LogisticRegression\nfrom sklearn.model_selection import cross_val_score\nfrom sklearn.datasets import make_classification\nX, y = make_classification(n_samples=200, random_state=9)\npipe = Pipeline([(\"s\", StandardScaler()), (\"c\", LogisticRegression(max_iter=200))])\nprint(\"cv acc\", round(cross_val_score(pipe, X, y, cv=3).mean(), 3))"
        }
      },
      "preprocessing-inside-folds": {
        "mermaid": {
          "title": "ML pipeline DAG",
          "caption": "ML pipeline DAG",
          "code": "%%{init: {'theme':'dark','themeVariables':{'primaryColor':'#696cff','primaryTextColor':'#e4e4e7','primaryBorderColor':'#5658d4','lineColor':'#a1a1aa','secondaryColor':'#2b2c40','tertiaryColor':'#232333'}}}%%\nflowchart TD\n  A[Data ingest] --> B[Validate]\n  B --> C[Features]\n  C --> D[Train]\n  D --> E[Evaluate]\n  E --> F[Register]\n  F --> G[Deploy]"
        },
        "workedExample": {
          "title": "Leakage inflates validation score",
          "body": "Fit a scaler on all data vs inside each CV fold.",
          "language": "python",
          "code": "import numpy as np\nfrom sklearn.model_selection import cross_val_score\nfrom sklearn.pipeline import Pipeline\nfrom sklearn.preprocessing import StandardScaler\nfrom sklearn.linear_model import LogisticRegression\nfrom sklearn.datasets import make_classification\nX, y = make_classification(n_samples=300, n_features=6, random_state=1)\nleaky = Pipeline([(\"scale\", StandardScaler()), (\"clf\", LogisticRegression(max_iter=200))])\nleaky.named_steps[\"scale\"].fit(X)\nsafe = Pipeline([(\"scale\", StandardScaler()), (\"clf\", LogisticRegression(max_iter=200))])\nprint(\"leaky CV:\", round(cross_val_score(leaky, X, y, cv=3).mean(), 3))\nprint(\"safe CV:\", round(cross_val_score(safe, X, y, cv=3).mean(), 3))"
        }
      },
      "point-in-time": {
        "workedExample": {
          "title": "Cross-validation score spread",
          "body": "Train three sklearn estimators on the same folds and print mean metrics.",
          "language": "python",
          "code": "from sklearn.datasets import make_classification\nfrom sklearn.model_selection import cross_val_score\nfrom sklearn.linear_model import LogisticRegression\nfrom sklearn.tree import DecisionTreeClassifier\nfrom sklearn.neighbors import KNeighborsClassifier\nX, y = make_classification(n_samples=400, n_features=8, random_state=0)\nmodels = {\n    \"logistic\": LogisticRegression(max_iter=200),\n    \"tree\": DecisionTreeClassifier(max_depth=4, random_state=0),\n    \"knn\": KNeighborsClassifier(n_neighbors=7),\n}\nfor name, model in models.items():\n    scores = cross_val_score(model, X, y, cv=3)\n    print(name, \"mean acc\", round(scores.mean(), 3), \"std\", round(scores.std(), 3))"
        }
      }
    },
    "wrapUp": {
      "nextSteps": [
        {
          "label": "Open the topic lab diagram and decision guide",
          "href": "/module/ml-production-lab/lesson/leakage-safe-pipelines#topic-lab"
        },
        {
          "label": "Run the primary Python lab exercise",
          "href": "/module/ml-production-lab/lesson/leakage-safe-pipelines#ml-practice-lab",
          "exerciseId": "build-safe-column-pipeline"
        }
      ]
    }
  },
  "ml-production-lab/drift-and-monitoring-lab": {
    "parts": {
      "monitoring-scope": {
        "mermaid": {
          "title": "Drift to rollback",
          "caption": "Drift to rollback",
          "code": "%%{init: {'theme':'dark','themeVariables':{'primaryColor':'#696cff','primaryTextColor':'#e4e4e7','primaryBorderColor':'#5658d4','lineColor':'#a1a1aa','secondaryColor':'#2b2c40','tertiaryColor':'#232333'}}}%%\nflowchart LR\n  A[Live scores] --> B[Drift test]\n  B --> C{Threshold?}\n  C -->|yes| D[Alert]\n  D --> E[Rollback alias]"
        },
        "workedExample": {
          "title": "Population stability index toy",
          "body": "Flag drift when PSI crosses a threshold on binned counts.",
          "language": "python",
          "code": "import numpy as np\nexpected = np.array([50, 30, 20], dtype=float)\nactual = np.array([35, 35, 30], dtype=float)\ndef psi(e, a):\n    e = e / e.sum()\n    a = a / a.sum()\n    return float(np.sum((a - e) * np.log((a + 1e-6) / (e + 1e-6))))\nvalue = psi(expected, actual)\nprint(\"PSI\", round(value, 3), \"alert\", value > 0.2)"
        }
      },
      "drift-types": {
        "mermaid": {
          "title": "Eval harness",
          "caption": "Eval harness",
          "code": "%%{init: {'theme':'dark','themeVariables':{'primaryColor':'#696cff','primaryTextColor':'#e4e4e7','primaryBorderColor':'#5658d4','lineColor':'#a1a1aa','secondaryColor':'#2b2c40','tertiaryColor':'#232333'}}}%%\nflowchart LR\n  A[Golden set] --> B[Run model]\n  B --> C[Score]\n  C --> D{Pass gate?}\n  D -->|yes| E[Ship]\n  D -->|no| F[Block]"
        },
        "workedExample": {
          "title": "Eval harness pass/fail",
          "body": "Score answers against gold strings with a simple overlap gate.",
          "language": "python",
          "code": "def score(answer, gold):\n    a = set(answer.lower().split())\n    g = set(gold.lower().split())\n    return len(a & g) / max(1, len(g))\ncases = [(\"reset via email link\", \"users reset password using email link\")]\nfor ans, gold in cases:\n    s = score(ans, gold)\n    print(round(s,3), \"pass\", s >= 0.4)"
        }
      },
      "metrics-and-tests": {
        "workedExample": {
          "title": "Leakage inflates validation score",
          "body": "Fit a scaler on all data vs inside each CV fold.",
          "language": "python",
          "code": "import numpy as np\nfrom sklearn.model_selection import cross_val_score\nfrom sklearn.pipeline import Pipeline\nfrom sklearn.preprocessing import StandardScaler\nfrom sklearn.linear_model import LogisticRegression\nfrom sklearn.datasets import make_classification\nX, y = make_classification(n_samples=300, n_features=6, random_state=1)\nleaky = Pipeline([(\"scale\", StandardScaler()), (\"clf\", LogisticRegression(max_iter=200))])\nleaky.named_steps[\"scale\"].fit(X)\nsafe = Pipeline([(\"scale\", StandardScaler()), (\"clf\", LogisticRegression(max_iter=200))])\nprint(\"leaky CV:\", round(cross_val_score(leaky, X, y, cv=3).mean(), 3))\nprint(\"safe CV:\", round(cross_val_score(safe, X, y, cv=3).mean(), 3))"
        }
      }
    },
    "wrapUp": {
      "nextSteps": [
        {
          "label": "Open the topic lab diagram and decision guide",
          "href": "/module/ml-production-lab/lesson/drift-and-monitoring-lab#topic-lab"
        },
        {
          "label": "Run the primary Python lab exercise",
          "href": "/module/ml-production-lab/lesson/drift-and-monitoring-lab#ml-practice-lab",
          "exerciseId": "implement-psi"
        }
      ]
    }
  },
  "ml-production-lab/serving-contracts-lab": {
    "parts": {
      "contract-boundary": {
        "mermaid": {
          "title": "Serving paths",
          "caption": "Serving paths",
          "code": "%%{init: {'theme':'dark','themeVariables':{'primaryColor':'#696cff','primaryTextColor':'#e4e4e7','primaryBorderColor':'#5658d4','lineColor':'#a1a1aa','secondaryColor':'#2b2c40','tertiaryColor':'#232333'}}}%%\nflowchart LR\n  A[Client] --> B{Mode}\n  B -->|sync| C[Online API]\n  B -->|stream| D[SSE tokens]\n  B -->|batch| E[Queue worker]"
        },
        "workedExample": {
          "title": "p99 latency budget calculator",
          "body": "Sum stage budgets and compare to an SLO ceiling.",
          "language": "python",
          "code": "stages = [20, 35, 90, 40, 25]\nslo = 200\ntotal = sum(stages)\nprint(\"budget sum\", total, \"within slo\", total <= slo)"
        }
      },
      "preprocessing-and-artifacts": {
        "mermaid": {
          "title": "Eval harness",
          "caption": "Eval harness",
          "code": "%%{init: {'theme':'dark','themeVariables':{'primaryColor':'#696cff','primaryTextColor':'#e4e4e7','primaryBorderColor':'#5658d4','lineColor':'#a1a1aa','secondaryColor':'#2b2c40','tertiaryColor':'#232333'}}}%%\nflowchart LR\n  A[Golden set] --> B[Run model]\n  B --> C[Score]\n  C --> D{Pass gate?}\n  D -->|yes| E[Ship]\n  D -->|no| F[Block]"
        },
        "workedExample": {
          "title": "Streaming latency stack",
          "body": "Sum per-stage latency budget for an SSE chat path.",
          "language": "python",
          "code": "stages = {\"auth\": 12, \"retrieve\": 45, \"prefill\": 80, \"first_token\": 35, \"decode\": 120}\ntotal = sum(stages.values())\nprint(\"stage ms:\", stages)\nprint(\"p50 budget ms:\", total)\nprint(\"headroom if SLO 400ms\", 400 - total)"
        }
      },
      "latency-and-throughput": {
        "workedExample": {
          "title": "Pipeline inside CV fold",
          "body": "Ensure preprocessing is fit only on training folds.",
          "language": "python",
          "code": "from sklearn.pipeline import Pipeline\nfrom sklearn.preprocessing import StandardScaler\nfrom sklearn.linear_model import LogisticRegression\nfrom sklearn.model_selection import cross_val_score\nfrom sklearn.datasets import make_classification\nX, y = make_classification(n_samples=200, random_state=9)\npipe = Pipeline([(\"s\", StandardScaler()), (\"c\", LogisticRegression(max_iter=200))])\nprint(\"cv acc\", round(cross_val_score(pipe, X, y, cv=3).mean(), 3))"
        }
      }
    },
    "wrapUp": {
      "nextSteps": [
        {
          "label": "Open the topic lab diagram and decision guide",
          "href": "/module/ml-production-lab/lesson/serving-contracts-lab#topic-lab"
        },
        {
          "label": "Run the primary Python lab exercise",
          "href": "/module/ml-production-lab/lesson/serving-contracts-lab#ml-practice-lab",
          "exerciseId": "schema-validator"
        }
      ]
    }
  },
  "llmops-eval-lab/llm-evaluation-harness": {
    "parts": {
      "eval-as-system": {
        "mermaid": {
          "title": "Eval harness",
          "caption": "Eval harness",
          "code": "%%{init: {'theme':'dark','themeVariables':{'primaryColor':'#696cff','primaryTextColor':'#e4e4e7','primaryBorderColor':'#5658d4','lineColor':'#a1a1aa','secondaryColor':'#2b2c40','tertiaryColor':'#232333'}}}%%\nflowchart LR\n  A[Golden set] --> B[Run model]\n  B --> C[Score]\n  C --> D{Pass gate?}\n  D -->|yes| E[Ship]\n  D -->|no| F[Block]"
        },
        "workedExample": {
          "title": "Eval harness pass/fail",
          "body": "Score answers against gold strings with a simple overlap gate.",
          "language": "python",
          "code": "def score(answer, gold):\n    a = set(answer.lower().split())\n    g = set(gold.lower().split())\n    return len(a & g) / max(1, len(g))\ncases = [(\"reset via email link\", \"users reset password using email link\")]\nfor ans, gold in cases:\n    s = score(ans, gold)\n    print(round(s,3), \"pass\", s >= 0.4)"
        }
      },
      "goldens-and-tags": {
        "mermaid": {
          "title": "Release gates",
          "caption": "Release gates",
          "code": "%%{init: {'theme':'dark','themeVariables':{'primaryColor':'#696cff','primaryTextColor':'#e4e4e7','primaryBorderColor':'#5658d4','lineColor':'#a1a1aa','secondaryColor':'#2b2c40','tertiaryColor':'#232333'}}}%%\nflowchart LR\n  A[Shadow] --> B[Canary]\n  B --> C[Partial]\n  C --> D[Full rollout]"
        },
        "workedExample": {
          "title": "Recall@k on gold ids",
          "body": "Check whether any gold chunk id appears in retrieved top-k.",
          "language": "python",
          "code": "gold = {\"chunk-2\", \"chunk-5\"}\nretrieved = [\"chunk-1\", \"chunk-2\", \"chunk-3\"][:2]\nhit = bool(gold & set(retrieved))\nprint(\"recall@2\", hit)"
        }
      },
      "grader-types": {
        "workedExample": {
          "title": "Risk-tier gate score",
          "body": "Combine eval, guardrail, and latency signals into a ship decision.",
          "language": "python",
          "code": "signals = {\"eval\": 0.82, \"guardrails\": True, \"latency_ok\": True}\ntier = \"high\" if signals[\"eval\"] < 0.7 else \"standard\"\nship = signals[\"guardrails\"] and signals[\"latency_ok\"] and signals[\"eval\"] >= 0.75\nprint(\"tier\", tier, \"ship\", ship)"
        }
      }
    },
    "wrapUp": {
      "nextSteps": [
        {
          "label": "Open the topic lab diagram and decision guide",
          "href": "/module/llmops-eval-lab/lesson/llm-evaluation-harness#topic-lab"
        },
        {
          "label": "Run the primary Python lab exercise",
          "href": "/module/llmops-eval-lab/lesson/llm-evaluation-harness#ml-practice-lab",
          "exerciseId": "recall-and-faithfulness-proxy"
        }
      ]
    }
  },
  "llmops-eval-lab/cost-latency-and-observability": {
    "parts": {
      "token-economics": {
        "mermaid": {
          "title": "Serving paths",
          "caption": "Serving paths",
          "code": "%%{init: {'theme':'dark','themeVariables':{'primaryColor':'#696cff','primaryTextColor':'#e4e4e7','primaryBorderColor':'#5658d4','lineColor':'#a1a1aa','secondaryColor':'#2b2c40','tertiaryColor':'#232333'}}}%%\nflowchart LR\n  A[Client] --> B{Mode}\n  B -->|sync| C[Online API]\n  B -->|stream| D[SSE tokens]\n  B -->|batch| E[Queue worker]"
        },
        "workedExample": {
          "title": "Token cost estimate",
          "body": "Estimate USD from prompt + completion token counts.",
          "language": "python",
          "code": "prompt_tokens = 1200\ncompletion_tokens = 350\nprice_in, price_out = 0.15, 0.60  # per 1M tokens (illustrative)\ncost = (prompt_tokens * price_in + completion_tokens * price_out) / 1_000_000\nprint(\"est USD\", round(cost, 6))"
        }
      },
      "prefill-vs-decode": {
        "mermaid": {
          "title": "KV-cache decode steps",
          "caption": "KV-cache decode steps",
          "code": "%%{init: {'theme':'dark','themeVariables':{'primaryColor':'#696cff','primaryTextColor':'#e4e4e7','primaryBorderColor':'#5658d4','lineColor':'#a1a1aa','secondaryColor':'#2b2c40','tertiaryColor':'#232333'}}}%%\nflowchart LR\n  A[Prefill] --> B[Cache K/V]\n  B --> C[Decode step]\n  C --> D[Append token]\n  D --> C"
        },
        "workedExample": {
          "title": "Streaming latency stack",
          "body": "Sum per-stage latency budget for an SSE chat path.",
          "language": "python",
          "code": "stages = {\"auth\": 12, \"retrieve\": 45, \"prefill\": 80, \"first_token\": 35, \"decode\": 120}\ntotal = sum(stages.values())\nprint(\"stage ms:\", stages)\nprint(\"p50 budget ms:\", total)\nprint(\"headroom if SLO 400ms\", 400 - total)"
        }
      },
      "batching-cache": {
        "workedExample": {
          "title": "p99 latency budget calculator",
          "body": "Sum stage budgets and compare to an SLO ceiling.",
          "language": "python",
          "code": "stages = [20, 35, 90, 40, 25]\nslo = 200\ntotal = sum(stages)\nprint(\"budget sum\", total, \"within slo\", total <= slo)"
        }
      }
    },
    "wrapUp": {
      "nextSteps": [
        {
          "label": "Open the topic lab diagram and decision guide",
          "href": "/module/llmops-eval-lab/lesson/cost-latency-and-observability#topic-lab"
        },
        {
          "label": "Run the primary Python lab exercise",
          "href": "/module/llmops-eval-lab/lesson/cost-latency-and-observability#ml-practice-lab",
          "exerciseId": "cost-latency-budget"
        }
      ]
    }
  },
  "llmops-eval-lab/shipping-gates-and-guardrails": {
    "parts": {
      "risk-tiered-shipping": {
        "mermaid": {
          "title": "Release gates",
          "caption": "Release gates",
          "code": "%%{init: {'theme':'dark','themeVariables':{'primaryColor':'#696cff','primaryTextColor':'#e4e4e7','primaryBorderColor':'#5658d4','lineColor':'#a1a1aa','secondaryColor':'#2b2c40','tertiaryColor':'#232333'}}}%%\nflowchart LR\n  A[Shadow] --> B[Canary]\n  B --> C[Partial]\n  C --> D[Full rollout]"
        },
        "workedExample": {
          "title": "Risk-tier gate score",
          "body": "Combine eval, guardrail, and latency signals into a ship decision.",
          "language": "python",
          "code": "signals = {\"eval\": 0.82, \"guardrails\": True, \"latency_ok\": True}\ntier = \"high\" if signals[\"eval\"] < 0.7 else \"standard\"\nship = signals[\"guardrails\"] and signals[\"latency_ok\"] and signals[\"eval\"] >= 0.75\nprint(\"tier\", tier, \"ship\", ship)"
        }
      },
      "guardrail-layers": {
        "mermaid": {
          "title": "Eval harness",
          "caption": "Eval harness",
          "code": "%%{init: {'theme':'dark','themeVariables':{'primaryColor':'#696cff','primaryTextColor':'#e4e4e7','primaryBorderColor':'#5658d4','lineColor':'#a1a1aa','secondaryColor':'#2b2c40','tertiaryColor':'#232333'}}}%%\nflowchart LR\n  A[Golden set] --> B[Run model]\n  B --> C[Score]\n  C --> D{Pass gate?}\n  D -->|yes| E[Ship]\n  D -->|no| F[Block]"
        },
        "workedExample": {
          "title": "Release gate checklist score",
          "body": "Score shadow/canary gates before full rollout.",
          "language": "python",
          "code": "gates = {\"eval_pass\": True, \"latency_ok\": True, \"error_budget\": True, \"guardrails\": False}\nscore = sum(gates.values())\nprint(\"gates\", gates)\nprint(\"ready\", score >= 3)"
        }
      },
      "structured-output-tools": {
        "workedExample": {
          "title": "Eval harness pass/fail",
          "body": "Score answers against gold strings with a simple overlap gate.",
          "language": "python",
          "code": "def score(answer, gold):\n    a = set(answer.lower().split())\n    g = set(gold.lower().split())\n    return len(a & g) / max(1, len(g))\ncases = [(\"reset via email link\", \"users reset password using email link\")]\nfor ans, gold in cases:\n    s = score(ans, gold)\n    print(round(s,3), \"pass\", s >= 0.4)"
        }
      }
    },
    "wrapUp": {
      "nextSteps": [
        {
          "label": "Open the topic lab diagram and decision guide",
          "href": "/module/llmops-eval-lab/lesson/shipping-gates-and-guardrails#topic-lab"
        },
        {
          "label": "Run the primary Python lab exercise",
          "href": "/module/llmops-eval-lab/lesson/shipping-gates-and-guardrails#ml-practice-lab",
          "exerciseId": "schema-and-pii-guard"
        }
      ]
    }
  }
};
