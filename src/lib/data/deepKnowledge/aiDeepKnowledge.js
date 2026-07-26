/** @type {Record<string, import('../lessonDeepKnowledge.js').LessonDeepKnowledge>} */
export const aiDeepKnowledge = {
  'ml-foundations/math-for-ml': {
    insights: [
      {
        heading: 'Gradients are local, not global',
        body: 'Gradient descent only guarantees convergence to a local minimum for non-convex losses like neural networks. In practice, saddle points and flat regions matter as much as sharp minima—research on loss landscape geometry shows that wide, flat minima often generalize better than narrow ones. Learning rate schedules, momentum, and adaptive optimizers exist partly to escape poor basins and navigate ill-conditioned curvature.'
      },
      {
        heading: 'Matrix factorization connects PCA to modern ML',
        body: 'Singular value decomposition (SVD) and eigendecomposition underpin PCA, recommendation systems, and low-rank approximations used in model compression. Understanding that a matrix multiply is a linear transformation—and that eigenvectors reveal invariant directions—makes attention mechanisms and spectral normalization far less mysterious. Numerical stability (condition numbers, floating-point precision) is why production code uses stable decompositions rather than naive formulas.'
      }
    ],
    references: [
      {
        title: 'Mathematics for Machine Learning',
        url: 'https://mml-book.github.io/',
        source: 'Cambridge University Press',
        note: 'Free textbook covering linear algebra, calculus, and probability with ML-oriented examples.'
      },
      {
        title: 'An Introduction to Matrix Algebra',
        url: 'https://web.stanford.edu/~boyd/papers/matrix-intro.pdf',
        source: 'Stanford',
        note: 'Concise reference for matrix operations and decompositions used throughout ML.'
      },
      {
        title: 'Visualizing the Loss Landscape of Neural Nets',
        url: 'https://arxiv.org/abs/1712.09913',
        source: 'arXiv',
        note: 'Seminal paper on how minima geometry relates to generalization in deep learning.'
      }
    ]
  },

  'ml-foundations/classical-ml-algorithms': {
    insights: [
      {
        heading: 'Bias-variance trade-off is algorithm-specific',
        body: 'Tree ensembles reduce variance through bagging and boosting without the same bias increase that deeper single trees incur. Linear models sit at high bias / low variance; k-NN is the opposite. Interview answers should map algorithm choice to data size, feature dimensionality, and interpretability requirements—not default to the fanciest method.'
      },
      {
        heading: 'Feature scaling changes which algorithm wins',
        body: 'Distance-based methods (k-NN, SVM with RBF kernel) and gradient-based optimizers are sensitive to feature scale; tree methods are not. Regularization strength in logistic regression is also scale-dependent. A strong engineer always states preprocessing assumptions when comparing model families.'
      }
    ],
    references: [
      {
        title: 'scikit-learn User Guide — Supervised Learning',
        url: 'https://scikit-learn.org/stable/supervised_learning.html',
        source: 'scikit-learn',
        note: 'Authoritative reference for algorithm APIs, hyperparameters, and when to use each estimator.'
      },
      {
        title: 'XGBoost: A Scalable Tree Boosting System',
        url: 'https://arxiv.org/abs/1603.02754',
        source: 'arXiv',
        note: 'Original paper describing the gradient boosting implementation that dominates tabular ML.'
      },
      {
        title: 'Random Forests',
        url: 'https://www.stat.berkeley.edu/~breiman/randomforest2001.pdf',
        source: 'Leo Breiman',
        note: 'Foundational ensemble paper explaining bagging, OOB error, and variable importance.'
      }
    ]
  },

  'ml-foundations/model-evaluation': {
    insights: [
      {
        heading: 'A single holdout split lies more than you think',
        body: 'Random train/test splits underestimate variance when data is temporally correlated or grouped (users, sessions, patients). K-fold cross-validation gives a better variance estimate but still leaks if folds are not constructed with the right grouping unit. Time-series and nested cross-validation exist precisely because naive splitting produces overconfident metrics.'
      },
      {
        heading: 'Optimize the metric that matches the business cost',
        body: 'Accuracy is misleading under class imbalance; ROC-AUC can look good while precision at the operating threshold is unusable. Calibration matters when scores drive decisions (lending, medical triage). Always tie metric choice to false-positive vs false-negative costs and whether ranking or absolute probability is needed.'
      }
    ],
    references: [
      {
        title: 'Model evaluation: quantifying the quality of predictions',
        url: 'https://scikit-learn.org/stable/modules/model_evaluation.html',
        source: 'scikit-learn',
        note: 'Comprehensive guide to scoring metrics, cross-validation, and learning curves.'
      },
      {
        title: 'A Survey on Evaluation Methods for Chatbots',
        url: 'https://arxiv.org/abs/1901.05815',
        source: 'arXiv',
        note: 'Useful framing for why evaluation design must match task structure—even outside chatbots.'
      },
      {
        title: 'On Calibration of Modern Neural Networks',
        url: 'https://arxiv.org/abs/1706.04599',
        source: 'arXiv',
        note: 'Shows that high accuracy does not imply well-calibrated probabilities—a common production pitfall.'
      }
    ]
  },

  'deep-learning/neural-network-fundamentals': {
    insights: [
      {
        heading: 'Vanishing gradients shaped modern architecture choices',
        body: 'Deep networks trained with sigmoid activations suffered vanishing gradients; ReLU, residual connections, and proper initialization (Xavier/He) were architectural responses, not optional tweaks. Batch normalization stabilizes internal covariate shift and allows higher learning rates. Understanding these mechanisms explains why "just add more layers" failed before ResNet.'
      },
      {
        heading: 'Capacity vs regularization determines generalization',
        body: 'A network with more parameters than training examples can still generalize when regularized (dropout, weight decay, early stopping, data augmentation). The effective capacity is controlled by optimization trajectory and implicit regularization of SGD, not parameter count alone. Interview discussions should mention underfitting/overfitting diagnostics via train vs validation curves.'
      }
    ],
    references: [
      {
        title: 'Deep Learning',
        url: 'https://www.deeplearningbook.org/',
        source: 'Goodfellow, Bengio, Courville',
        note: 'Canonical textbook for feedforward networks, optimization, and regularization.'
      },
      {
        title: 'Deep Residual Learning for Image Recognition',
        url: 'https://arxiv.org/abs/1512.03385',
        source: 'arXiv',
        note: 'ResNet paper—essential for understanding skip connections and training very deep networks.'
      },
      {
        title: 'Batch Normalization: Accelerating Deep Network Training',
        url: 'https://arxiv.org/abs/1502.03167',
        source: 'arXiv',
        note: 'Explains normalization layers that became standard in most feedforward and conv architectures.'
      }
    ]
  },

  'deep-learning/cnn-and-computer-vision': {
    insights: [
      {
        heading: 'Inductive bias is why CNNs beat MLPs on images',
        body: 'Convolution enforces translation equivariance and local connectivity; pooling builds translation invariance. These biases drastically reduce parameters and sample complexity compared to fully connected layers on raw pixels. Modern vision transformers challenge this but still borrow patch embedding and hybrid designs from conv principles.'
      },
      {
        heading: 'Receptive field and resolution trade-offs drive architecture',
        body: 'Each stacked conv layer expands the receptive field; dilated convolutions and encoder-decoder skips (U-Net) control spatial resolution for segmentation. Stride, kernel size, and feature map depth determine whether the network captures fine edges or global context. Production CV pipelines must also handle aspect ratio, color space, and augmentation policies matched to deployment data.'
      }
    ],
    references: [
      {
        title: 'ImageNet Classification with Deep Convolutional Neural Networks (AlexNet)',
        url: 'https://papers.nips.cc/paper/4824-imagenet-classification-with-deep-convolutional-neural-networks',
        source: 'NeurIPS',
        note: 'The paper that demonstrated deep CNNs at scale and sparked the modern vision era.'
      },
      {
        title: 'U-Net: Convolutional Networks for Biomedical Image Segmentation',
        url: 'https://arxiv.org/abs/1505.04597',
        source: 'arXiv',
        note: 'Encoder-decoder with skip connections—pattern reused across segmentation tasks.'
      },
      {
        title: 'torchvision models documentation',
        url: 'https://pytorch.org/vision/stable/models.html',
        source: 'PyTorch',
        note: 'Reference implementations and pretrained weights for ResNet, EfficientNet, ViT, and more.'
      }
    ]
  },

  'deep-learning/transformer-architecture': {
    insights: [
      {
        heading: 'Self-attention is O(n²) in sequence length',
        body: 'The quadratic cost of full attention is the main bottleneck for long contexts. FlashAttention, sparse attention, sliding windows, and linear attention variants exist to reduce memory and compute. Positional encoding (sinusoidal, rotary/RoPE, ALiBi) injects order information because attention itself is permutation-invariant over tokens.'
      },
      {
        heading: 'Pre-norm vs post-norm and scaling laws matter at depth',
        body: 'Transformer training stability improved with pre-layer normalization and scaled residual streams. Large-model research (scaling laws) shows predictable loss improvements with compute, data, and parameters—explaining why the same architecture family scales from BERT-size encoders to hundred-billion-parameter LLMs with minimal structural change.'
      }
    ],
    references: [
      {
        title: 'Attention Is All You Need',
        url: 'https://arxiv.org/abs/1706.03762',
        source: 'arXiv',
        note: 'Original Transformer paper defining multi-head self-attention and encoder-decoder stacks.'
      },
      {
        title: 'The Illustrated Transformer',
        url: 'https://jalammar.github.io/illustrated-transformer/',
        source: 'Jay Alammar',
        note: 'Visual walkthrough that complements the math-heavy original paper.'
      },
      {
        title: 'FlashAttention: Fast and Memory-Efficient Exact Attention',
        url: 'https://arxiv.org/abs/2205.14135',
        source: 'arXiv',
        note: 'Key IO-aware optimization underlying efficient long-context training and inference.'
      }
    ]
  },

  'llms-and-nlp/llm-fundamentals': {
    insights: [
      {
        heading: 'Autoregressive LMs model P(token | context)',
        body: 'Decoder-only LLMs are next-token predictors trained on massive corpora; emergent abilities (reasoning, instruction following) appear at scale but are not guaranteed by architecture alone. Tokenization (BPE, SentencePiece) affects multilingual behavior, math, and code because the model never sees characters—only subword IDs. Context window limits bound in-context memory regardless of apparent fluency.'
      },
      {
        heading: 'Training stages: pretrain → SFT → RLHF/DPO',
        body: 'Pretraining learns language and world knowledge; supervised fine-tuning aligns format and instruction following; preference optimization (RLHF, DPO, ORPO) shapes helpfulness and safety. Each stage uses different data and loss functions. Production LLM systems are rarely "just the base model"—deployment quality depends heavily on post-training.'
      }
    ],
    references: [
      {
        title: 'Language Models are Few-Shot Learners (GPT-3)',
        url: 'https://arxiv.org/abs/2005.14165',
        source: 'arXiv',
        note: 'Demonstrates in-context learning and motivates scale as a capability driver.'
      },
      {
        title: 'Hugging Face — Large Language Models course',
        url: 'https://huggingface.co/learn/nlp-course/chapter1/1',
        source: 'Hugging Face',
        note: 'Practical introduction to tokenization, architectures, and the transformers ecosystem.'
      },
      {
        title: 'Training language models to follow instructions with human feedback',
        url: 'https://arxiv.org/abs/2203.02155',
        source: 'arXiv',
        note: 'InstructGPT paper describing RLHF alignment pipeline used across industry LLMs.'
      }
    ]
  },

  'llms-and-nlp/fine-tuning-techniques': {
    insights: [
      {
        heading: 'Full fine-tuning vs PEFT is a memory and catastrophic-forgetting trade-off',
        body: 'Full fine-tuning updates all weights and risks overwriting general capabilities on small domain datasets. Parameter-efficient methods (LoRA, adapters, prefix tuning) train low-rank or small injected modules, reducing VRAM and enabling multi-tenant serving. LoRA merges into base weights at inference with zero latency overhead—a major production advantage.'
      },
      {
        heading: 'Data quality dominates hyperparameter tuning for alignment',
        body: 'A few thousand well-curated instruction examples often outperform noisy millions. Format consistency, deduplication, and rejection of hallucinated or toxic pairs matter more than epoch count. For domain adaptation, continued pretraining on in-domain text before instruction tuning frequently beats SFT alone on knowledge-heavy tasks.'
      }
    ],
    references: [
      {
        title: 'LoRA: Low-Rank Adaptation of Large Language Models',
        url: 'https://arxiv.org/abs/2106.09685',
        source: 'arXiv',
        note: 'Foundational PEFT method—default choice for efficient LLM fine-tuning.'
      },
      {
        title: 'Hugging Face PEFT documentation',
        url: 'https://huggingface.co/docs/peft/index',
        source: 'Hugging Face',
        note: 'Implementation guide for LoRA, QLoRA, adapters, and training recipes.'
      },
      {
        title: 'QLoRA: Efficient Finetuning of Quantized LLMs',
        url: 'https://arxiv.org/abs/2305.14314',
        source: 'arXiv',
        note: 'Shows 4-bit quantized fine-tuning on consumer GPUs without quality collapse.'
      }
    ]
  },

  'llms-and-nlp/embeddings-and-vector-search': {
    insights: [
      {
        heading: 'Embedding geometry depends on training objective',
        body: 'Contrastive models (sentence-transformers) optimize relative similarity; generative LLM hidden states are not automatically good retrieval vectors. Normalization, pooling strategy (mean vs CLS), and asymmetric queries (E5 query/passage prefixes) materially affect recall. Always evaluate embeddings on your domain—MTEB leaderboard rankings do not guarantee production performance.'
      },
      {
        heading: 'ANN indexes trade recall for speed at scale',
        body: 'Exact brute-force search works for small corpora; HNSW, IVF, and product quantization enable billion-scale retrieval with tunable recall/latency knobs. Metadata filtering combined with vector search requires indexes that support pre-filtering or post-filtering strategies—each has different recall characteristics under skewed filters.'
      }
    ],
    references: [
      {
        title: 'Sentence-BERT: Sentence Embeddings using Siamese BERT-Networks',
        url: 'https://arxiv.org/abs/1908.10084',
        source: 'arXiv',
        note: 'Core paper for semantic similarity embeddings used in modern retrieval stacks.'
      },
      {
        title: 'FAISS: A library for efficient similarity search',
        url: 'https://github.com/facebookresearch/faiss/wiki',
        source: 'Meta AI',
        note: 'Industry-standard ANN library with GPU support and index type documentation.'
      },
      {
        title: 'MTEB: Massive Text Embedding Benchmark',
        url: 'https://arxiv.org/abs/2210.07316',
        source: 'arXiv',
        note: 'Benchmark suite for comparing embedding models across retrieval and classification tasks.'
      }
    ]
  },

  'prompt-engineering-and-rag/prompt-engineering': {
    insights: [
      {
        heading: 'Structure beats clever wording',
        body: 'Clear role assignment, delimited inputs, explicit output schemas (JSON mode, tool schemas), and few-shot exemplars outperform adjective stuffing ("be very careful"). Chain-of-thought helps reasoning tasks but increases latency and tokens; self-consistency trades compute for accuracy. Temperature and top-p affect creativity vs determinism—near-zero temperature for extraction, higher for brainstorming.'
      },
      {
        heading: 'Prompt injection is an architectural problem',
        body: 'Untrusted content in prompts (user uploads, web pages, email bodies) can override system instructions. Mitigations include instruction hierarchy, output validation, tool permission boundaries, and separating control plane from data plane—not better adjectives in the system prompt. Security-aware prompt design treats the model as a probabilistic executor, not a policy engine.'
      }
    ],
    references: [
      {
        title: 'OpenAI Prompt Engineering Guide',
        url: 'https://platform.openai.com/docs/guides/prompt-engineering',
        source: 'OpenAI',
        note: 'Official guidance on clarity, formatting, few-shot examples, and structured outputs.'
      },
      {
        title: 'Chain-of-Thought Prompting Elicits Reasoning in Large Language Models',
        url: 'https://arxiv.org/abs/2201.11903',
        source: 'arXiv',
        note: 'Seminal work on eliciting step-by-step reasoning via prompting.'
      },
      {
        title: 'Anthropic — Prompting best practices',
        url: 'https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/overview',
        source: 'Anthropic',
        note: 'Practical patterns for Claude including XML tags and long-context strategies.'
      }
    ]
  },

  'prompt-engineering-and-rag/rag-systems': {
    insights: [
      {
        heading: 'Retrieval quality caps generation quality',
        body: 'RAG cannot fix a corpus with stale, duplicated, or missing documents. Chunking strategy (size, overlap, semantic vs fixed), hybrid search (BM25 + dense), and rerankers (cross-encoders) are the highest-leverage retrieval improvements. Measure recall@k on a golden question set before tuning prompts—the generator is rarely the first bottleneck.'
      },
      {
        heading: 'Grounding and citation require pipeline design',
        body: 'LLMs confabulate citations unless constrained by retrieved spans and post-generation verification. Patterns include citing chunk IDs, requiring quotes from context only, and abstention when retrieval confidence is low. Production RAG adds freshness signals, access control on chunks, and feedback loops from user corrections into the index.'
      }
    ],
    references: [
      {
        title: 'Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks',
        url: 'https://arxiv.org/abs/2005.11401',
        source: 'arXiv',
        note: 'Original RAG paper combining parametric and non-parametric memory.'
      },
      {
        title: 'LangChain — Retrieval conceptual guide',
        url: 'https://python.langchain.com/docs/concepts/retrieval/',
        source: 'LangChain',
        note: 'Practical overview of indexing, retrieval, and composition patterns in RAG pipelines.'
      },
      {
        title: 'Precise Zero-Shot Dense Retrieval without Relevance Labels',
        url: 'https://arxiv.org/abs/2212.10496',
        source: 'arXiv',
        note: 'HyDE and advanced retrieval ideas for improving zero-shot dense retrieval.'
      }
    ]
  },

  'prompt-engineering-and-rag/building-with-frameworks': {
    insights: [
      {
        heading: 'Frameworks orchestrate; they do not replace system design',
        body: 'LangChain, LlamaIndex, and Haystack provide retrievers, memory, agents, and eval hooks—but production concerns (auth, rate limits, observability, cost caps) live outside the framework. Prefer composable primitives over deep abstraction chains that obscure data flow. Version your prompts and index schemas as first-class artifacts in CI.'
      },
      {
        heading: 'Async streaming and batching affect UX and unit economics',
        body: 'Streaming tokens improves perceived latency; parallel retrieval and speculative generation reduce wall-clock time. Framework callbacks/tracers (LangSmith, Phoenix, OpenTelemetry) should be wired from day one to debug retrieval misses and tool loops. Caching embeddings and LLM responses with invalidation tied to corpus updates saves significant cost at scale.'
      }
    ],
    references: [
      {
        title: 'LlamaIndex documentation',
        url: 'https://docs.llamaindex.ai/en/stable/',
        source: 'LlamaIndex',
        note: 'Data framework for ingestion, indexing, querying, and agent workflows.'
      },
      {
        title: 'LangGraph — Build resilient language agents',
        url: 'https://langchain-ai.github.io/langgraph/',
        source: 'LangChain',
        note: 'Stateful graph-based orchestration for multi-step agent and RAG workflows.'
      },
      {
        title: 'Haystack documentation',
        url: 'https://docs.haystack.deepset.ai/docs/intro',
        source: 'deepset',
        note: 'Open-source NLP framework with pipeline abstractions for search and QA.'
      }
    ]
  },

  'ai-agents/agent-fundamentals': {
    insights: [
      {
        heading: 'Agents are control loops, not magic autonomy',
        body: 'An agent repeatedly observes state, plans (explicitly or implicitly), acts via tools, and updates memory until a stop condition. ReAct-style reasoning interleaves thought and action to reduce tool misuse. Reliability comes from bounded iteration counts, structured outputs, and human-in-the-loop checkpoints—not from larger models alone.'
      },
      {
        heading: 'Memory tiers mirror classical system design',
        body: 'Short-term context is the LLM window; working memory can be scratchpads or session state; long-term memory is vector stores or structured DBs with retrieval policies. Stale or unbounded memory causes drift and privacy issues. Explicit memory write policies (what to store, when to forget) are as important as retrieval.'
      }
    ],
    references: [
      {
        title: 'ReAct: Synergizing Reasoning and Acting in Language Models',
        url: 'https://arxiv.org/abs/2210.03629',
        source: 'arXiv',
        note: 'Foundational pattern interleaving chain-of-thought with tool use.'
      },
      {
        title: 'Generative Agents: Interactive Simulacra of Human Behavior',
        url: 'https://arxiv.org/abs/2304.03442',
        source: 'arXiv',
        note: 'Influential architecture combining memory streams, reflection, and planning.'
      },
      {
        title: 'OpenAI — Agents guide',
        url: 'https://platform.openai.com/docs/guides/agents',
        source: 'OpenAI',
        note: 'Official patterns for assistants, tools, and multi-step workflows.'
      }
    ]
  },

  'ai-agents/tool-use-and-function-calling': {
    insights: [
      {
        heading: 'Schema design is API design',
        body: 'Tool descriptions, parameter types, and required fields directly affect call accuracy. Ambiguous names ("search" vs "search_products") and overly nested JSON schemas increase malformed calls. Provide enums, examples, and error messages surfaced back to the model for self-correction. Idempotent tools and timeouts prevent runaway agent loops from causing side effects.'
      },
      {
        heading: 'Parallel vs sequential tool calls trade latency for correctness',
        body: 'Independent reads can be parallelized; writes often need ordering and confirmation. Some APIs expose parallel function calling natively; others require explicit orchestration. Validate tool outputs before feeding them back—models treat JSON as ground truth even when the tool returned partial errors.'
      }
    ],
    references: [
      {
        title: 'OpenAI Function Calling Guide',
        url: 'https://platform.openai.com/docs/guides/function-calling',
        source: 'OpenAI',
        note: 'Schema format, strict mode, and parallel tool call patterns.'
      },
      {
        title: 'Toolformer: Language Models Can Teach Themselves to Use Tools',
        url: 'https://arxiv.org/abs/2302.04761',
        source: 'arXiv',
        note: 'Research on how models learn API invocation from self-generated traces.'
      },
      {
        title: 'Anthropic — Tool use documentation',
        url: 'https://docs.anthropic.com/en/docs/build-with-claude/tool-use',
        source: 'Anthropic',
        note: 'Claude-specific tool definition, computer use, and best practices.'
      }
    ]
  },

  'ai-agents/agent-evaluation-and-safety': {
    insights: [
      {
        heading: 'Trajectory evaluation beats single-turn benchmarks',
        body: 'Agents fail across multi-step runs—wrong tool order, loops, partial task completion. Eval suites (WebArena, SWE-bench, custom task graphs) measure success rate, steps to completion, and cost. Human rubrics plus LLM-as-judge need calibration; always anchor with executable checks (did the DB row change? did tests pass?).'
      },
      {
        heading: 'Sandboxing and least-privilege are non-negotiable',
        body: 'Agents with shell, browser, or payment tools require OS-level sandboxes, scoped credentials, and approval gates for irreversible actions. Prompt-level safety does not stop a determined jailbreak from exfiltrating secrets via tool channels. Red-team for indirect injection via tool return payloads and cross-session memory poisoning.'
      }
    ],
    references: [
      {
        title: 'WebArena: A Realistic Web Environment for Building Autonomous Agents',
        url: 'https://arxiv.org/abs/2307.13854',
        source: 'arXiv',
        note: 'Benchmark highlighting the gap between chat accuracy and real web task completion.'
      },
      {
        title: 'OWASP Top 10 for Large Language Model Applications',
        url: 'https://owasp.org/www-project-top-10-for-large-language-model-applications/',
        source: 'OWASP',
        note: 'Industry threat model covering injection, insecure output handling, and excessive agency.'
      },
      {
        title: 'SWE-bench: Can Language Models Resolve Real-World GitHub Issues?',
        url: 'https://arxiv.org/abs/2310.06770',
        source: 'arXiv',
        note: 'Code-agent benchmark measuring end-to-end software engineering task success.'
      }
    ]
  },

  'mlops-and-deployment/ml-pipeline-design': {
    insights: [
      {
        heading: 'Reproducibility requires versioning everything',
        body: 'Data snapshots, feature definitions, code commits, hyperparameters, and environment images must be linked to every trained artifact. Pipelines should be idempotent with clear lineage so you can answer "which data produced this model?" Feature stores bridge training-serving skew by sharing transformation logic between batch and online paths.'
      },
      {
        heading: 'CI/CD for ML adds validation gates beyond unit tests',
        body: 'Data schema checks, drift detectors, offline metric thresholds, and shadow deployments gate promotion. Training jobs are expensive—trigger them on meaningful data or code changes, not every commit. Orchestrators (Airflow, Kubeflow, Metaflow) manage dependencies; the hard part is organizational contracts on who owns each stage.'
      }
    ],
    references: [
      {
        title: 'MLflow Documentation',
        url: 'https://mlflow.org/docs/latest/index.html',
        source: 'MLflow',
        note: 'Experiment tracking, model registry, and deployment patterns.'
      },
      {
        title: 'Hidden Technical Debt in Machine Learning Systems',
        url: 'https://papers.nips.cc/paper/5656-hidden-technical-debt-in-machine-learning-systems',
        source: 'NeurIPS',
        note: 'Classic paper on why ML systems complexity lives outside the model code.'
      },
      {
        title: 'Kubeflow Pipelines documentation',
        url: 'https://www.kubeflow.org/docs/components/pipelines/',
        source: 'Kubeflow',
        note: 'Kubernetes-native ML workflow orchestration and component packaging.'
      }
    ]
  },

  'mlops-and-deployment/model-serving': {
    insights: [
      {
        heading: 'Latency budgets split across pre/post-processing',
        body: 'GPU inference may be a fraction of p99 latency once serialization, auth, feature lookup, and batching queues are included. Dynamic batching improves throughput but adds tail latency—SLAs dictate batch window size. For LLMs, time-to-first-token and tokens/sec are separate UX metrics; speculative decoding and KV-cache reuse dominate optimization.'
      },
      {
        heading: 'Model formats and runtimes determine portability',
        body: 'ONNX, TensorRT, TorchScript, and GGUF each target different hardware and precision trade-offs. Quantization (INT8/INT4) reduces memory but needs calibration on representative data. Multi-model routing, canary releases, and autoscaling on GPU metrics (utilization, queue depth) are standard production patterns.'
      }
    ],
    references: [
      {
        title: 'NVIDIA Triton Inference Server',
        url: 'https://docs.nvidia.com/deeplearning/triton-inference-server/user-guide/docs/index.html',
        source: 'NVIDIA',
        note: 'Production serving with dynamic batching, multi-framework backends, and GPU sharing.'
      },
      {
        title: 'vLLM: Easy, Fast, and Cheap LLM Serving with PagedAttention',
        url: 'https://arxiv.org/abs/2309.06180',
        source: 'arXiv',
        note: 'High-throughput LLM serving via efficient KV-cache memory management.'
      },
      {
        title: 'TensorFlow Serving',
        url: 'https://www.tensorflow.org/tfx/guide/serving',
        source: 'Google',
        note: 'Reference architecture for versioning, A/B testing, and REST/gRPC model servers.'
      }
    ]
  },

  'mlops-and-deployment/monitoring-and-observability': {
    insights: [
      {
        heading: 'Monitor data, not just infrastructure',
        body: 'CPU and GPU metrics miss silent failures—input distribution shift, null rate spikes, and embedding drift degrade quality before alerts fire. Slice metrics (by region, product, cohort) surface fairness and performance regressions averaged away in global dashboards. LLM apps need tracing of retrieval, prompts, tool calls, token usage, and user feedback signals.'
      },
      {
        heading: 'Feedback loops close the MLOps cycle',
        body: 'Implicit signals (clicks, thumbs down) and explicit labels should flow back to retraining queues with privacy controls. Concept drift may require scheduled retrains or champion/challenger tournaments rather than static thresholds. Alert fatigue is reduced when anomaly detection is tied to business KPIs, not every statistical blip.'
      }
    ],
    references: [
      {
        title: 'Google — Rules of Machine Learning (Rule 39: Monitor and test)',
        url: 'https://developers.google.com/machine-learning/guides/rules-of-ml',
        source: 'Google',
        note: 'Practical engineering rules including monitoring and pipeline hygiene.'
      },
      {
        title: 'Evidently AI — ML monitoring concepts',
        url: 'https://docs.evidentlyai.com/',
        source: 'Evidently',
        note: 'Open-source reports for data drift, model quality, and LLM evaluations.'
      },
      {
        title: 'OpenTelemetry for Generative AI',
        url: 'https://opentelemetry.io/docs/specs/semconv/gen-ai/',
        source: 'OpenTelemetry',
        note: 'Emerging semantic conventions for tracing LLM and agent workloads.'
      }
    ]
  },

  'ai-safety-and-ethics/bias-and-fairness': {
    insights: [
      {
        heading: 'Fairness metrics conflict—pick one aligned with harm',
        body: 'Demographic parity, equalized odds, and calibration are mathematically incompatible in general. Disaggregated evaluation (performance by subgroup) is the minimum bar; choosing a fairness criterion requires stakeholder input on which errors are costliest. Proxy features (ZIP code, language) can reintroduce bias even when protected attributes are removed.'
      },
      {
        heading: 'Bias enters through data and deployment context',
        body: 'Historical labels encode past discrimination; undersampled groups yield high-variance models; feedback loops amplify disparities (predictive policing, hiring). Mitigations span resampling, constrained optimization, human review for edge cases, and post-deployment auditing—not a single preprocessing trick. Document limitations and intended use to meet regulatory expectations.'
      }
    ],
    references: [
      {
        title: 'Fairness and Machine Learning textbook',
        url: 'https://fairmlbook.org/',
        source: 'fairmlbook.org',
        note: 'Free textbook formalizing fairness definitions, trade-offs, and legal context.'
      },
      {
        title: 'Equality of Opportunity in Supervised Learning',
        url: 'https://arxiv.org/abs/1610.02413',
        source: 'arXiv',
        note: 'Foundational paper on equalized odds and fairness constraints.'
      },
      {
        title: 'NIST AI Risk Management Framework',
        url: 'https://www.nist.gov/itl/ai-risk-management-framework',
        source: 'NIST',
        note: 'US government framework for identifying and mitigating AI risks including bias.'
      }
    ]
  },

  'ai-safety-and-ethics/explainability': {
    insights: [
      {
        heading: 'Explanation method ≠ ground truth',
        body: 'SHAP, LIME, and attention maps provide post-hoc narratives that can be unstable across similar inputs. Tree models offer native feature importance; linear coefficients are interpretable only with scaled features. For LLMs, chain-of-thought may rationalize rather than reveal actual computation—use explanations to aid human review, not as legal proof.'
      },
      {
        heading: 'Regulatory contexts demand traceability',
        body: 'GDPR "right to explanation," credit adverse action notices, and medical device rules push toward interpretable models or supplementary documentation. Counterfactual explanations ("change income by X to flip decision") resonate with users but must respect feasibility constraints. Maintain audit logs linking predictions to model version, features, and policy rules applied.'
      }
    ],
    references: [
      {
        title: 'A Unified Approach to Interpreting Model Predictions (SHAP)',
        url: 'https://arxiv.org/abs/1705.07874',
        source: 'arXiv',
        note: 'Widely used game-theoretic feature attribution framework.'
      },
      {
        title: '"Why Should I Trust You?": Explaining the Predictions of Any Classifier (LIME)',
        url: 'https://arxiv.org/abs/1602.04938',
        source: 'arXiv',
        note: 'Local interpretable model-agnostic explanations for black-box models.'
      },
      {
        title: 'Interpretable Machine Learning — A Guide for Making Black Box Models Explainable',
        url: 'https://christophm.github.io/interpretable-ml-book/',
        source: 'Christoph Molnar',
        note: 'Comprehensive open book covering methods, limitations, and responsible use.'
      }
    ]
  },

  'ai-safety-and-ethics/ai-governance': {
    insights: [
      {
        heading: 'Governance maps risk to controls',
        body: 'High-risk use cases (hiring, healthcare, critical infrastructure) warrant model cards, impact assessments, human oversight, and incident response playbooks. EU AI Act, ISO 42001, and sector regulators converge on documentation, testing, and accountability—not banning all AI. Cross-functional AI review boards align legal, security, and engineering before launch.'
      },
      {
        heading: 'Third-party and foundation model risk is supply-chain risk',
        body: 'Using hosted LLMs introduces data residency, subprocessors, and terms-of-use constraints. Fine-tuning does not absolve liability for harmful outputs. Contracts should cover training data provenance, opt-out rights, and breach notification. Internal policies define approved models, data classification for prompts, and retention limits.'
      }
    ],
    references: [
      {
        title: 'EU Artificial Intelligence Act',
        url: 'https://artificialintelligenceact.eu/',
        source: 'European Union',
        note: 'Primary EU regulatory reference for risk-tiered AI system obligations.'
      },
      {
        title: 'Model Cards for Model Reporting',
        url: 'https://arxiv.org/abs/1810.03993',
        source: 'arXiv',
        note: 'Template for documenting intended use, limitations, and evaluation results.'
      },
      {
        title: 'ISO/IEC 42001 — AI Management System',
        url: 'https://www.iso.org/standard/81230.html',
        source: 'ISO',
        note: 'International standard for organizational AI governance and continual improvement.'
      }
    ]
  },

  'data-engineering-for-ml/data-pipelines-at-scale': {
    insights: [
      {
        heading: 'Batch vs streaming is a freshness and complexity trade-off',
        body: 'Lambda and kappa architectures addressed hybrid needs; modern stacks often use incremental batch (Iceberg/Delta) plus streaming for latency-sensitive features. Exactly-once semantics, late-arriving data, and backfills complicate feature correctness. Idempotent writes and partition strategies (time, tenant) prevent full reprocessing on every job failure.'
      },
      {
        heading: 'Data quality gates belong in the pipeline',
        body: 'Schema evolution, null checks, distribution monitors, and anomaly alerts should block downstream training when violated. Great Expectations, dbt tests, and custom validators encode SLAs. ML-specific concerns include label leakage across time boundaries and train-serve skew from different SQL paths computing "the same" feature.'
      }
    ],
    references: [
      {
        title: 'Apache Spark Documentation',
        url: 'https://spark.apache.org/docs/latest/',
        source: 'Apache',
        note: 'Distributed processing foundation for large-scale ETL and feature generation.'
      },
      {
        title: 'The Dataflow Model',
        url: 'https://research.google/pubs/pub43864/',
        source: 'Google Research',
        note: 'Foundational paper on unbounded data processing, windows, and triggers.'
      },
      {
        title: 'Delta Lake documentation',
        url: 'https://docs.delta.io/latest/index.html',
        source: 'Delta Lake',
        note: 'ACID transactions and time travel for reliable lakehouse ML pipelines.'
      }
    ]
  },

  'data-engineering-for-ml/dataset-management': {
    insights: [
      {
        heading: 'Dataset versioning is as critical as model versioning',
        body: 'DVC, LakeFS, and Hugging Face datasets provide reproducible snapshots with hashes and metadata. Splits must be stable and documented—reshuffling leaks test information. For multimodal and LLM corpora, deduplication (MinHash, exact hash) and PII scrubbing pipelines prevent memorization and compliance violations.'
      },
      {
        heading: 'Labeling workflows define the ceiling on model quality',
        body: 'Inter-annotator agreement, adjudication, active learning, and gold-standard hidden sets quantify label noise. Biased or rushed annotation propagates directly to production errors. Invest in tooling (Label Studio, Prodigy), clear guidelines, and stratified sampling so rare classes and edge cases receive adequate coverage.'
      }
    ],
    references: [
      {
        title: 'Hugging Face Datasets',
        url: 'https://huggingface.co/docs/datasets/index',
        source: 'Hugging Face',
        note: 'Standard library for loading, versioning, and streaming ML datasets.'
      },
      {
        title: 'Datasheets for Datasets',
        url: 'https://arxiv.org/abs/1803.09010',
        source: 'arXiv',
        note: 'Framework for documenting dataset motivation, composition, and limitations.'
      },
      {
        title: 'DVC — Data Version Control',
        url: 'https://dvc.org/doc',
        source: 'DVC',
        note: 'Git-native versioning for datasets, pipelines, and experiment reproducibility.'
      }
    ]
  }
};
