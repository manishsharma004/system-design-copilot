/**
 * AI Engineer Learning Path – module and lesson data.
 *
 * Covers the modern AI/ML engineer skill tree from foundational ML through
 * production LLM systems, RAG pipelines, AI agents, MLOps, and AI safety.
 */

export const rawAiEngineerModules = [
  {
    slug: 'ml-foundations',
    title: 'Machine learning foundations',
    summary: 'Build core intuition for supervised and unsupervised learning, feature engineering, model evaluation, and the mathematical underpinnings every AI engineer needs.',
    objectives: [
      'Understand linear algebra, calculus, and probability concepts relevant to ML',
      'Apply classical ML algorithms: regression, classification, clustering',
      'Evaluate models with proper validation techniques and metrics'
    ],
    lessons: [
      {
        slug: 'math-for-ml',
        title: 'Mathematics for machine learning',
        summary: 'Linear algebra, calculus, and probability foundations required for understanding model internals and optimization.',
        duration: '30-40 min',
        whyItMatters: 'Every optimization step in ML relies on gradients, matrix operations, and probabilistic reasoning. Without this foundation the rest of the path feels like magic.',
        sections: [
          {
            heading: 'Linear algebra essentials',
            body: 'Vectors, matrices, eigenvalues, and matrix decompositions form the backbone of data representations and transformations in ML.',
            bullets: [
              'Understand how data is represented as matrices and how transformations operate on them',
              'Eigenvalues and eigenvectors explain variance directions in PCA and model stability',
              'Matrix multiplication is the core operation in neural network forward passes'
            ]
          },
          {
            heading: 'Calculus and optimization',
            body: 'Derivatives, gradients, and the chain rule enable backpropagation and parameter updates in every trainable model.',
            bullets: [
              'Partial derivatives measure how each parameter affects the loss',
              'Gradient descent iteratively moves parameters toward lower loss',
              'Learning rate controls step size and affects convergence speed and stability'
            ]
          },
          {
            heading: 'Probability and statistics',
            body: 'Probability distributions, Bayes theorem, and statistical testing provide the language for uncertainty, generalization, and hypothesis evaluation.',
            bullets: [
              'Bayes theorem underpins many generative and classification models',
              'Understanding distributions helps in choosing loss functions and modeling noise',
              'Hypothesis testing and confidence intervals guide experiment evaluation'
            ]
          }
        ],
        checklist: [
          'Can explain how gradient descent updates parameters using partial derivatives.',
          'Understands matrix multiplication as the core neural network operation.',
          'Can describe what a probability distribution tells you about data uncertainty.'
        ],
        pitfalls: [
          'Skipping math foundations and relying solely on library abstractions.',
          'Memorizing formulas without understanding geometric or probabilistic intuition.',
          'Ignoring numerical stability issues that arise in practice.'
        ],
        interviewPrompts: [
          'Why does gradient descent work and what are its failure modes?',
          'Explain the role of eigenvalues in PCA.',
          'How does Bayes theorem apply to a spam classifier?'
        ],
        diagram: null,
        related: ['classical-ml-algorithms', 'model-evaluation']
      },
      {
        slug: 'classical-ml-algorithms',
        title: 'Classical ML algorithms',
        summary: 'Regression, classification, clustering, and ensemble methods using scikit-learn.',
        duration: '30-40 min',
        whyItMatters: 'Classical algorithms remain the best choice for many production problems and serve as baselines against which deep learning must justify its complexity.',
        sections: [
          {
            heading: 'Supervised learning',
            body: 'Linear regression, logistic regression, decision trees, random forests, gradient boosting, and SVMs cover the majority of tabular prediction tasks.',
            bullets: [
              'Linear models are interpretable and fast; start here as a baseline',
              'Tree ensembles (XGBoost, LightGBM) dominate tabular data competitions',
              'SVMs work well in high-dimensional spaces with clear margins'
            ]
          },
          {
            heading: 'Unsupervised learning',
            body: 'K-means, DBSCAN, hierarchical clustering, and dimensionality reduction reveal structure in unlabeled data.',
            bullets: [
              'K-means is simple but assumes spherical clusters of similar size',
              'DBSCAN finds arbitrarily shaped clusters and handles noise',
              'PCA and t-SNE reduce dimensions for visualization and denoising'
            ]
          },
          {
            heading: 'Feature engineering and selection',
            body: 'Transforming raw data into informative features often matters more than algorithm choice.',
            bullets: [
              'One-hot encoding, binning, and interaction features expand model capacity',
              'Feature selection reduces overfitting and speeds training',
              'Domain knowledge drives the most impactful feature ideas'
            ]
          }
        ],
        checklist: [
          'Can select an appropriate algorithm family given the problem type and data shape.',
          'Knows when to prefer tree ensembles over linear models.',
          'Understands the bias-variance tradeoff in model selection.'
        ],
        pitfalls: [
          'Using deep learning on small tabular datasets where gradient boosting wins.',
          'Neglecting feature engineering in favor of complex architectures.',
          'Not establishing a simple baseline before moving to advanced methods.'
        ],
        interviewPrompts: [
          'When would you choose logistic regression over a neural network?',
          'Explain the bias-variance tradeoff with a concrete example.',
          'How does gradient boosting differ from random forests?'
        ],
        diagram: null,
        related: ['math-for-ml', 'model-evaluation']
      },
      {
        slug: 'model-evaluation',
        title: 'Model evaluation and validation',
        summary: 'Cross-validation, metrics selection, overfitting detection, and experiment tracking best practices.',
        duration: '25-35 min',
        whyItMatters: 'A model is only as good as its evaluation. Proper validation prevents costly production failures and builds trust in ML systems.',
        sections: [
          {
            heading: 'Validation strategies',
            body: 'Hold-out splits, k-fold cross-validation, stratified sampling, and time-series splits each suit different data distributions.',
            bullets: [
              'K-fold cross-validation gives robust estimates on small datasets',
              'Stratified splits preserve class ratios in imbalanced problems',
              'Time-series data requires chronological splits to avoid look-ahead bias'
            ]
          },
          {
            heading: 'Metrics that matter',
            body: 'Accuracy, precision, recall, F1, AUC-ROC, RMSE, and MAE each tell a different story about model quality.',
            bullets: [
              'Accuracy misleads on imbalanced classes; prefer precision-recall analysis',
              'AUC-ROC measures ranking quality independent of threshold',
              'Regression metrics (RMSE, MAE) differ in sensitivity to outliers'
            ]
          },
          {
            heading: 'Detecting and preventing overfitting',
            body: 'Learning curves, regularization, early stopping, and data augmentation keep models generalizable.',
            bullets: [
              'A widening gap between train and validation loss signals overfitting',
              'Regularization (L1/L2, dropout) penalizes model complexity',
              'More data and augmentation are often the most effective remedies'
            ]
          }
        ],
        checklist: [
          'Can choose the right validation strategy for the data distribution.',
          'Selects metrics aligned with business objectives rather than defaulting to accuracy.',
          'Monitors learning curves and applies regularization when overfitting appears.'
        ],
        pitfalls: [
          'Optimizing accuracy on an imbalanced dataset without examining per-class performance.',
          'Leaking future information into training data in time-series problems.',
          'Tuning hyperparameters on the test set instead of a separate validation fold.'
        ],
        interviewPrompts: [
          'How would you evaluate a fraud detection model when only 0.1% of transactions are fraudulent?',
          'What does a ROC curve tell you that accuracy alone does not?',
          'Describe a scenario where cross-validation is misleading.'
        ],
        diagram: null,
        related: ['classical-ml-algorithms', 'data-engineering-for-ml']
      }
    ]
  },
  {
    slug: 'deep-learning',
    title: 'Deep learning',
    summary: 'Neural network architectures from feed-forward networks through CNNs, RNNs, and transformers, with hands-on training using PyTorch and TensorFlow.',
    objectives: [
      'Build and train neural networks from scratch and with frameworks',
      'Understand CNN, RNN, and transformer architectures and their applications',
      'Apply transfer learning and fine-tuning to accelerate model development'
    ],
    lessons: [
      {
        slug: 'neural-network-fundamentals',
        title: 'Neural network fundamentals',
        summary: 'Perceptrons, activation functions, backpropagation, and optimization form the building blocks of all deep learning.',
        duration: '30-40 min',
        whyItMatters: 'Understanding how gradients flow through layers is essential for debugging training failures and designing effective architectures.',
        sections: [
          {
            heading: 'Architecture basics',
            body: 'Neurons, layers, activation functions (ReLU, sigmoid, tanh), and the universal approximation theorem explain why networks can model complex functions.',
            bullets: [
              'Each neuron computes a weighted sum followed by a non-linear activation',
              'Depth allows hierarchical feature learning; width allows richer representations per layer',
              'ReLU dominates hidden layers due to efficient gradients; softmax serves classification outputs'
            ]
          },
          {
            heading: 'Training mechanics',
            body: 'Forward pass, loss computation, backward pass (backpropagation), and parameter updates via optimizers (SGD, Adam) form the training loop.',
            bullets: [
              'Backpropagation applies the chain rule layer by layer to compute gradients',
              'Adam adapts learning rates per parameter using momentum and variance estimates',
              'Batch normalization and learning rate schedules stabilize training'
            ]
          },
          {
            heading: 'Practical considerations',
            body: 'GPU utilization, batch size effects, initialization strategies, and debugging vanishing/exploding gradients.',
            bullets: [
              'Xavier/He initialization prevents early gradient collapse',
              'Larger batch sizes improve throughput but may hurt generalization',
              'Gradient clipping prevents exploding gradients in deep or recurrent networks'
            ]
          }
        ],
        checklist: [
          'Can trace a forward and backward pass through a simple network on paper.',
          'Understands why ReLU helps with vanishing gradients compared to sigmoid.',
          'Knows when to adjust learning rate, batch size, or initialization.'
        ],
        pitfalls: [
          'Training without monitoring loss curves and validation metrics.',
          'Using overly complex architectures before proving a simpler one fails.',
          'Ignoring data preprocessing that causes numerical instability.'
        ],
        interviewPrompts: [
          'Walk through backpropagation for a two-layer network.',
          'Why might training loss decrease while validation loss increases?',
          'Compare SGD with momentum to Adam. When would you prefer each?'
        ],
        diagram: null,
        related: ['cnn-and-computer-vision', 'transformer-architecture']
      },
      {
        slug: 'cnn-and-computer-vision',
        title: 'CNNs and computer vision',
        summary: 'Convolutional neural networks for image classification, object detection, and segmentation tasks.',
        duration: '30-40 min',
        whyItMatters: 'CNNs are the foundation of computer vision systems deployed in autonomous vehicles, medical imaging, content moderation, and manufacturing quality control.',
        sections: [
          {
            heading: 'Convolution and pooling',
            body: 'Convolutional layers learn local spatial features; pooling reduces spatial dimensions while preserving important signals.',
            bullets: [
              'Filters detect edges, textures, and increasingly abstract patterns in deeper layers',
              'Stride and padding control output dimensions',
              'Max pooling provides translation invariance; average pooling preserves more spatial info'
            ]
          },
          {
            heading: 'Modern architectures',
            body: 'ResNet, EfficientNet, and Vision Transformers (ViT) represent the evolution from hand-crafted to learned architectures.',
            bullets: [
              'Skip connections in ResNet solve vanishing gradients in very deep networks',
              'EfficientNet uses compound scaling to balance depth, width, and resolution',
              'Vision Transformers apply self-attention to image patches for global context'
            ]
          },
          {
            heading: 'Applied computer vision',
            body: 'Object detection (YOLO, Faster R-CNN), semantic segmentation (U-Net), and transfer learning enable practical vision systems.',
            bullets: [
              'Transfer learning from ImageNet-pretrained models saves weeks of training',
              'Data augmentation (flips, crops, color jitter) regularizes on small datasets',
              'Real-time inference requires model optimization: quantization, pruning, TensorRT'
            ]
          }
        ],
        checklist: [
          'Can explain how a convolutional layer differs from a fully connected layer.',
          'Understands transfer learning and when to freeze versus fine-tune layers.',
          'Knows the tradeoffs between YOLO and Faster R-CNN for detection tasks.'
        ],
        pitfalls: [
          'Training from scratch on small datasets instead of leveraging pretrained models.',
          'Ignoring data augmentation which is often more impactful than architecture changes.',
          'Not considering inference latency requirements when choosing architectures.'
        ],
        interviewPrompts: [
          'How do skip connections help train deeper networks?',
          'When would you use a Vision Transformer instead of a CNN?',
          'Explain the tradeoff between model accuracy and inference speed in production.'
        ],
        diagram: null,
        related: ['neural-network-fundamentals', 'transformer-architecture']
      },
      {
        slug: 'transformer-architecture',
        title: 'Transformer architecture deep dive',
        summary: 'Self-attention, multi-head attention, positional encoding, and the encoder-decoder structure that powers modern NLP and beyond.',
        duration: '35-45 min',
        whyItMatters: 'Transformers are the foundation of GPT, BERT, and virtually all modern language models. Understanding them is non-negotiable for AI engineers.',
        sections: [
          {
            heading: 'Self-attention mechanism',
            body: 'Query, key, value projections and scaled dot-product attention allow each token to attend to all others, capturing long-range dependencies.',
            bullets: [
              'Attention weights are computed as softmax(QK^T / sqrt(d_k))',
              'Multi-head attention runs parallel attention with different learned projections',
              'Self-attention has O(n²) complexity in sequence length, motivating efficiency research'
            ]
          },
          {
            heading: 'Architecture components',
            body: 'Layer normalization, residual connections, feed-forward networks, and positional encodings complete the transformer block.',
            bullets: [
              'Positional encodings inject sequence order since attention is permutation-invariant',
              'Pre-norm vs post-norm affects training stability at scale',
              'The feed-forward network applies non-linearity independently per position'
            ]
          },
          {
            heading: 'Variants and scaling',
            body: 'Encoder-only (BERT), decoder-only (GPT), and encoder-decoder (T5) architectures serve different task families.',
            bullets: [
              'Decoder-only models with causal masking dominate text generation',
              'BERT-style models excel at classification and extraction tasks',
              'Scaling laws relate model size, data, and compute to performance'
            ]
          }
        ],
        checklist: [
          'Can explain the self-attention computation step by step.',
          'Understands the difference between encoder-only and decoder-only models.',
          'Knows why positional encoding is necessary and what alternatives exist.'
        ],
        pitfalls: [
          'Treating transformers as black boxes without understanding attention patterns.',
          'Ignoring quadratic attention complexity when working with long sequences.',
          'Confusing pre-training objectives (MLM vs causal LM) and their downstream implications.'
        ],
        interviewPrompts: [
          'Explain how multi-head attention differs from single-head attention.',
          'Why do decoder-only models use causal masking?',
          'How do scaling laws inform decisions about model size vs dataset size?'
        ],
        diagram: null,
        related: ['neural-network-fundamentals', 'llm-fundamentals']
      }
    ]
  },
  {
    slug: 'llms-and-nlp',
    title: 'Large language models and NLP',
    summary: 'From tokenization and embeddings to LLM pre-training, fine-tuning, and deployment for production NLP systems.',
    objectives: [
      'Understand how LLMs are trained, fine-tuned, and served at scale',
      'Apply parameter-efficient fine-tuning techniques (LoRA, QLoRA, PEFT)',
      'Design NLP pipelines for classification, summarization, and generation tasks'
    ],
    lessons: [
      {
        slug: 'llm-fundamentals',
        title: 'LLM fundamentals',
        summary: 'Pre-training objectives, tokenization, context windows, and the emergent capabilities that appear at scale.',
        duration: '30-40 min',
        whyItMatters: 'LLMs are reshaping software engineering. Understanding their capabilities and limitations is essential for building reliable AI-powered applications.',
        sections: [
          {
            heading: 'How LLMs are trained',
            body: 'Next-token prediction on massive text corpora, followed by RLHF alignment, produces models that follow instructions and reason about novel tasks.',
            bullets: [
              'Pre-training learns language patterns from trillions of tokens',
              'Instruction tuning and RLHF align the model with human preferences',
              'Emergent abilities (reasoning, code generation) appear at sufficient scale'
            ]
          },
          {
            heading: 'Tokenization and context',
            body: 'BPE, SentencePiece, and tiktoken break text into subword tokens that define the model vocabulary and context window limits.',
            bullets: [
              'Token count determines memory usage and computational cost per request',
              'Context window size limits how much information the model can use at once',
              'Tokenization artifacts can cause surprising behavior with numbers, code, and rare words'
            ]
          },
          {
            heading: 'Capabilities and limitations',
            body: 'LLMs excel at pattern completion but struggle with factual accuracy, arithmetic, and maintaining consistency over long outputs.',
            bullets: [
              'Hallucination is inherent to probabilistic generation and requires mitigation strategies',
              'Knowledge cutoff dates mean models lack awareness of recent events',
              'Context window overflow loses earlier information without explicit management'
            ]
          }
        ],
        checklist: [
          'Can explain the training pipeline from pre-training through RLHF.',
          'Understands tokenization and its impact on model behavior and cost.',
          'Knows the main failure modes of LLMs and mitigation approaches.'
        ],
        pitfalls: [
          'Assuming LLMs have reliable factual knowledge without verification.',
          'Ignoring token costs when designing applications with large context needs.',
          'Treating LLMs as deterministic systems rather than probabilistic generators.'
        ],
        interviewPrompts: [
          'How does RLHF differ from supervised fine-tuning?',
          'What causes hallucination and how would you mitigate it in a production system?',
          'Explain the tradeoff between context window size and inference cost.'
        ],
        diagram: null,
        related: ['transformer-architecture', 'fine-tuning-techniques']
      },
      {
        slug: 'fine-tuning-techniques',
        title: 'Fine-tuning and adaptation',
        summary: 'Full fine-tuning, LoRA, QLoRA, PEFT, and instruction tuning to adapt foundation models to specific domains and tasks.',
        duration: '30-40 min',
        whyItMatters: 'Fine-tuning lets you build specialized models that outperform prompting alone on domain-specific tasks while controlling cost and latency.',
        sections: [
          {
            heading: 'When to fine-tune',
            body: 'Fine-tuning is most valuable when the task requires domain-specific style, format adherence, or performance that prompting cannot achieve.',
            bullets: [
              'Prompting first: try few-shot examples before committing to fine-tuning',
              'Fine-tuning wins when you need consistent output format or domain vocabulary',
              'Cost-benefit: fine-tuned smaller models often beat prompted larger models at lower cost'
            ]
          },
          {
            heading: 'Parameter-efficient methods',
            body: 'LoRA, QLoRA, and adapters update a tiny fraction of parameters while achieving near-full fine-tuning quality.',
            bullets: [
              'LoRA adds low-rank matrices to attention layers, training <1% of parameters',
              'QLoRA combines 4-bit quantization with LoRA for memory efficiency',
              'Adapter layers insert small trainable modules between frozen transformer blocks'
            ]
          },
          {
            heading: 'Data preparation and evaluation',
            body: 'Instruction formatting, data quality, evaluation metrics, and avoiding catastrophic forgetting are critical to successful fine-tuning.',
            bullets: [
              'High-quality instruction-response pairs matter more than dataset size',
              'Evaluation should include both automated metrics and human preference ratings',
              'Mixing general data prevents catastrophic forgetting of base capabilities'
            ]
          }
        ],
        checklist: [
          'Can decide when fine-tuning is worthwhile versus prompting strategies.',
          'Understands LoRA mechanics and when to prefer it over full fine-tuning.',
          'Knows how to prepare instruction-tuning datasets and evaluate results.'
        ],
        pitfalls: [
          'Fine-tuning without first exhausting prompt engineering approaches.',
          'Using low-quality or biased training data that degrades model behavior.',
          'Evaluating only on automated metrics without checking output quality manually.'
        ],
        interviewPrompts: [
          'Explain how LoRA achieves parameter efficiency. What are its limitations?',
          'How would you prepare a dataset for instruction-tuning a customer support model?',
          'What is catastrophic forgetting and how do you prevent it during fine-tuning?'
        ],
        diagram: null,
        related: ['llm-fundamentals', 'prompt-engineering']
      },
      {
        slug: 'embeddings-and-vector-search',
        title: 'Embeddings and vector search',
        summary: 'Text embeddings, vector databases, similarity search, and hybrid retrieval for powering semantic search and RAG systems.',
        duration: '25-35 min',
        whyItMatters: 'Vector search is the retrieval backbone of RAG systems, semantic search, recommendation engines, and knowledge management applications.',
        sections: [
          {
            heading: 'Embedding models',
            body: 'Sentence transformers, OpenAI embeddings, and domain-specific models convert text into dense vectors that capture semantic meaning.',
            bullets: [
              'Embedding quality directly determines retrieval relevance in downstream tasks',
              'Domain-specific fine-tuning of embedding models improves retrieval for specialized corpora',
              'Embedding dimensions trade off between expressiveness and storage/compute cost'
            ]
          },
          {
            heading: 'Vector databases',
            body: 'Pinecone, Weaviate, Milvus, Qdrant, and FAISS provide infrastructure for storing, indexing, and querying high-dimensional vectors at scale.',
            bullets: [
              'Approximate nearest neighbor (ANN) algorithms enable sub-linear search time',
              'Metadata filtering combines semantic similarity with structured constraints',
              'Choosing between managed services and self-hosted depends on scale and compliance needs'
            ]
          },
          {
            heading: 'Hybrid and advanced retrieval',
            body: 'Combining keyword search (BM25) with vector similarity and reranking produces more robust retrieval than either alone.',
            bullets: [
              'Hybrid search catches exact matches that embeddings might miss',
              'Cross-encoder reranking improves precision at the cost of latency',
              'Chunking strategy (size, overlap, boundaries) significantly affects retrieval quality'
            ]
          }
        ],
        checklist: [
          'Can select an appropriate embedding model for the use case and domain.',
          'Understands ANN index tradeoffs: recall vs latency vs memory.',
          'Knows when hybrid search outperforms pure vector similarity.'
        ],
        pitfalls: [
          'Using generic embeddings without evaluating domain-specific alternatives.',
          'Choosing chunk sizes without considering the downstream task requirements.',
          'Over-relying on vector similarity when keyword matching would be more precise.'
        ],
        interviewPrompts: [
          'How would you design a semantic search system for a legal document corpus?',
          'Compare HNSW and IVF indexes in terms of build time, query speed, and recall.',
          'When does hybrid search provide value over pure vector retrieval?'
        ],
        diagram: null,
        related: ['llm-fundamentals', 'rag-systems']
      }
    ]
  },
  {
    slug: 'prompt-engineering-and-rag',
    title: 'Prompt engineering and RAG',
    summary: 'Systematic prompt design, retrieval-augmented generation pipelines, and techniques for grounding LLM outputs in verified knowledge.',
    objectives: [
      'Design effective prompts using few-shot, chain-of-thought, and structured techniques',
      'Build end-to-end RAG pipelines that ground LLM responses in external knowledge',
      'Evaluate and optimize retrieval quality and generation accuracy'
    ],
    lessons: [
      {
        slug: 'prompt-engineering',
        title: 'Prompt engineering',
        summary: 'Zero-shot, few-shot, chain-of-thought, and structured prompting techniques for reliable LLM outputs.',
        duration: '25-35 min',
        whyItMatters: 'Effective prompting is the fastest way to extract value from LLMs without training. It is the primary interface skill for AI engineers building applications.',
        sections: [
          {
            heading: 'Core techniques',
            body: 'Zero-shot instructions, few-shot examples, chain-of-thought reasoning, and system prompts give increasing control over model behavior.',
            bullets: [
              'Clear role and task descriptions in system prompts set the behavioral frame',
              'Few-shot examples teach format and style more reliably than verbose instructions',
              'Chain-of-thought prompting improves reasoning on multi-step problems'
            ]
          },
          {
            heading: 'Structured output',
            body: 'JSON mode, function calling, and output schemas ensure LLM responses can be reliably parsed by downstream systems.',
            bullets: [
              'Constrained decoding and grammar-guided generation prevent malformed outputs',
              'Function calling schemas define the interface between LLM and application code',
              'Validation and retry logic handles edge cases in structured generation'
            ]
          },
          {
            heading: 'Evaluation and iteration',
            body: 'Prompt versioning, A/B testing, and automated evaluation enable systematic improvement of prompt quality.',
            bullets: [
              'Track prompt versions alongside their evaluation scores and failure cases',
              'Automated evaluators (LLM-as-judge) scale beyond manual review',
              'Red-teaming and adversarial testing reveal prompt injection vulnerabilities'
            ]
          }
        ],
        checklist: [
          'Can select the appropriate prompting technique for a given task complexity.',
          'Designs prompts that produce structured, parseable outputs.',
          'Tests prompts systematically with evaluation metrics and edge cases.'
        ],
        pitfalls: [
          'Writing overly long prompts that confuse the model with contradictory instructions.',
          'Not testing prompts against adversarial inputs and edge cases.',
          'Relying on prompt engineering alone when fine-tuning would be more reliable.'
        ],
        interviewPrompts: [
          'How does chain-of-thought prompting improve reasoning and what are its costs?',
          'Design a prompt strategy for extracting structured data from unstructured emails.',
          'How would you defend against prompt injection in a user-facing application?'
        ],
        diagram: null,
        related: ['llm-fundamentals', 'rag-systems']
      },
      {
        slug: 'rag-systems',
        title: 'Retrieval-augmented generation',
        summary: 'End-to-end RAG architecture: document ingestion, chunking, retrieval, context assembly, and grounded generation.',
        duration: '35-45 min',
        whyItMatters: 'RAG is the dominant pattern for building knowledge-grounded AI applications that need up-to-date information without retraining the model.',
        sections: [
          {
            heading: 'RAG architecture',
            body: 'Ingest documents, chunk and embed them, retrieve relevant passages at query time, and augment the LLM prompt with retrieved context.',
            bullets: [
              'Document loaders handle PDFs, HTML, databases, and API sources',
              'Chunking strategy (sentence, paragraph, semantic boundaries) affects retrieval granularity',
              'The retriever-generator pipeline separates knowledge storage from reasoning'
            ]
          },
          {
            heading: 'Advanced RAG patterns',
            body: 'Query transformation, multi-step retrieval, reranking, and self-reflection improve answer quality beyond naive RAG.',
            bullets: [
              'Query expansion and hypothetical document embeddings improve recall',
              'Multi-hop retrieval chains answer complex questions requiring multiple sources',
              'Self-RAG and CRAG add verification steps that check retrieval relevance'
            ]
          },
          {
            heading: 'Evaluation and optimization',
            body: 'Measuring retrieval recall, answer faithfulness, and hallucination rates guides pipeline tuning.',
            bullets: [
              'Retrieval metrics: precision@k, recall@k, MRR measure retriever quality',
              'Generation metrics: faithfulness, relevance, and hallucination rate assess grounding',
              'End-to-end evaluation combines retrieval and generation quality holistically'
            ]
          }
        ],
        checklist: [
          'Can design a complete RAG pipeline from document ingestion to response generation.',
          'Understands chunking tradeoffs and their impact on retrieval quality.',
          'Evaluates RAG systems with appropriate retrieval and generation metrics.'
        ],
        pitfalls: [
          'Using fixed chunk sizes without considering document structure.',
          'Not measuring retrieval quality separately from generation quality.',
          'Stuffing too much context into the prompt, exceeding useful context window usage.'
        ],
        interviewPrompts: [
          'Design a RAG system for a customer support knowledge base with 10,000 articles.',
          'How would you handle conflicting information from multiple retrieved documents?',
          'Compare naive RAG to advanced RAG with reranking. When is the complexity justified?'
        ],
        diagram: null,
        related: ['embeddings-and-vector-search', 'prompt-engineering']
      },
      {
        slug: 'building-with-frameworks',
        title: 'Building with LLM frameworks',
        summary: 'LangChain, LlamaIndex, Haystack, and other orchestration frameworks for composing LLM-powered applications.',
        duration: '25-35 min',
        whyItMatters: 'Frameworks abstract common patterns (chains, retrieval, memory) and accelerate development of production LLM applications.',
        sections: [
          {
            heading: 'Framework landscape',
            body: 'LangChain, LlamaIndex, Haystack, and Semantic Kernel each emphasize different aspects of LLM application development.',
            bullets: [
              'LangChain provides composable chains, agents, and tool integrations',
              'LlamaIndex focuses on data indexing and retrieval optimization',
              'Haystack emphasizes production pipelines with modular components'
            ]
          },
          {
            heading: 'Core abstractions',
            body: 'Chains, retrievers, memory, output parsers, and callbacks provide reusable building blocks for complex applications.',
            bullets: [
              'Chains compose multiple LLM calls and transformations into workflows',
              'Memory modules maintain conversation context across turns',
              'Output parsers enforce structured responses and handle parsing failures'
            ]
          },
          {
            heading: 'When to use vs build custom',
            body: 'Frameworks accelerate prototyping but may introduce overhead, abstraction leaks, or vendor lock-in for production systems.',
            bullets: [
              'Start with a framework for rapid prototyping and validation',
              'Consider custom implementations when you need full control over latency and cost',
              'Evaluate framework maturity, community support, and maintenance trajectory'
            ]
          }
        ],
        checklist: [
          'Can choose an appropriate framework for the project requirements.',
          'Understands framework abstractions well enough to debug and extend them.',
          'Knows when custom code is preferable to framework abstractions.'
        ],
        pitfalls: [
          'Over-engineering with frameworks when a simple API call would suffice.',
          'Coupling business logic tightly to a specific framework version.',
          'Not profiling framework overhead in latency-sensitive applications.'
        ],
        interviewPrompts: [
          'Compare LangChain and LlamaIndex for a document Q&A use case.',
          'When would you build a custom RAG pipeline instead of using a framework?',
          'How do you handle framework version upgrades in production applications?'
        ],
        diagram: null,
        related: ['rag-systems', 'ai-agents']
      }
    ]
  },
  {
    slug: 'ai-agents',
    title: 'AI agents and autonomous systems',
    summary: 'Design, build, and deploy AI agents that reason, plan, use tools, and accomplish multi-step tasks autonomously.',
    objectives: [
      'Understand agent architectures: ReAct, plan-and-execute, and multi-agent systems',
      'Implement tool use, memory, and planning capabilities in LLM-powered agents',
      'Evaluate agent reliability, safety, and cost in production deployments'
    ],
    lessons: [
      {
        slug: 'agent-fundamentals',
        title: 'Agent architectures and patterns',
        summary: 'ReAct, plan-and-execute, reflection, and multi-agent patterns for building autonomous AI systems.',
        duration: '30-40 min',
        whyItMatters: 'AI agents represent the next frontier of LLM applications, moving from single-turn generation to multi-step task completion.',
        sections: [
          {
            heading: 'What makes an agent',
            body: 'An AI agent combines an LLM with tools, memory, and a control loop that enables multi-step reasoning and action.',
            bullets: [
              'The agent loop: observe, reason, act, and evaluate results iteratively',
              'Tools extend LLM capabilities to interact with external systems and APIs',
              'Memory (short-term and long-term) maintains context across reasoning steps'
            ]
          },
          {
            heading: 'Architecture patterns',
            body: 'ReAct (reasoning + acting), plan-and-execute, reflexion, and hierarchical agents offer different tradeoffs.',
            bullets: [
              'ReAct interleaves reasoning traces with tool calls for transparent decision-making',
              'Plan-and-execute separates planning from execution for complex multi-step tasks',
              'Reflexion adds self-critique loops that improve performance over iterations'
            ]
          },
          {
            heading: 'Multi-agent systems',
            body: 'Multiple specialized agents collaborating through communication protocols can solve problems beyond single-agent capability.',
            bullets: [
              'Specialized agents handle subtasks (research, coding, review) with focused expertise',
              'Orchestration patterns: supervisor, debate, pipeline, and marketplace',
              'Communication protocols define how agents share context and coordinate'
            ]
          }
        ],
        checklist: [
          'Can explain the core agent loop and how it differs from single-turn LLM usage.',
          'Understands tradeoffs between ReAct and plan-and-execute patterns.',
          'Knows when multi-agent systems provide value over single-agent approaches.'
        ],
        pitfalls: [
          'Building agents for tasks that would be better served by deterministic code.',
          'Insufficient error handling causing agents to loop indefinitely.',
          'Not setting token and step budgets leading to runaway costs.'
        ],
        interviewPrompts: [
          'Design an agent that can research a topic, write a summary, and fact-check itself.',
          'How would you prevent an agent from taking harmful actions in a production environment?',
          'Compare ReAct and plan-and-execute for a complex data analysis task.'
        ],
        diagram: null,
        related: ['building-with-frameworks', 'tool-use-and-function-calling']
      },
      {
        slug: 'tool-use-and-function-calling',
        title: 'Tool use and function calling',
        summary: 'Designing tool interfaces, function schemas, error handling, and safety guardrails for agents that interact with external systems.',
        duration: '25-35 min',
        whyItMatters: 'Tools transform LLMs from text generators into capable actors that can search, compute, access databases, and control external services.',
        sections: [
          {
            heading: 'Designing tool interfaces',
            body: 'Clear function schemas, comprehensive descriptions, and well-typed parameters help LLMs select and invoke tools correctly.',
            bullets: [
              'Function descriptions should explain when and why to use the tool',
              'Parameter schemas with types, constraints, and examples reduce invocation errors',
              'Return value formatting affects how the LLM integrates tool results into reasoning'
            ]
          },
          {
            heading: 'Error handling and recovery',
            body: 'Tools fail, return unexpected results, or timeout. Robust agents handle these gracefully and adapt their strategy.',
            bullets: [
              'Retry logic with exponential backoff handles transient failures',
              'Fallback tools provide alternative paths when primary tools fail',
              'The agent should explain failures to users rather than silently retrying forever'
            ]
          },
          {
            heading: 'Safety and permissions',
            body: 'Tool access control, confirmation flows, and sandboxing prevent agents from taking dangerous actions.',
            bullets: [
              'Principle of least privilege: agents should only access tools they need',
              'Human-in-the-loop confirmation for irreversible or high-stakes actions',
              'Sandboxing prevents code execution tools from accessing sensitive resources'
            ]
          }
        ],
        checklist: [
          'Can design tool schemas that minimize LLM invocation errors.',
          'Implements proper error handling and fallback strategies for tool failures.',
          'Applies safety guardrails appropriate to the risk level of each tool.'
        ],
        pitfalls: [
          'Vague tool descriptions that lead to incorrect tool selection.',
          'Missing error handling causing agents to crash on tool failures.',
          'Giving agents access to dangerous tools without confirmation gates.'
        ],
        interviewPrompts: [
          'Design a tool interface for an agent that manages cloud infrastructure.',
          'How would you implement permission levels for an agent with database access?',
          'What happens when a tool returns unexpected results? Design the recovery flow.'
        ],
        diagram: null,
        related: ['agent-fundamentals', 'agent-evaluation-and-safety']
      },
      {
        slug: 'agent-evaluation-and-safety',
        title: 'Agent evaluation and safety',
        summary: 'Benchmarking agent performance, measuring reliability, and implementing safety controls for production deployment.',
        duration: '25-35 min',
        whyItMatters: 'Agents operating autonomously can cause real harm if not properly evaluated and constrained. Safety is not optional for production systems.',
        sections: [
          {
            heading: 'Evaluation frameworks',
            body: 'Task completion rates, cost per task, latency budgets, and regression testing measure agent effectiveness.',
            bullets: [
              'End-to-end task success rate is the primary metric, not intermediate step quality',
              'Cost per task (tokens consumed, API calls, time) determines economic viability',
              'Regression test suites catch capability degradation across model or prompt updates'
            ]
          },
          {
            heading: 'Safety mechanisms',
            body: 'Output filtering, action constraints, rate limits, and human oversight prevent agents from causing harm.',
            bullets: [
              'Content filtering catches harmful or biased outputs before they reach users',
              'Action budgets limit the number of steps and cost an agent can incur per task',
              'Audit logging enables post-hoc review of all agent decisions and actions'
            ]
          },
          {
            heading: 'Production deployment',
            body: 'Gradual rollout, monitoring, fallback to human operators, and continuous evaluation maintain reliability.',
            bullets: [
              'Canary deployments test new agent versions on a subset of traffic first',
              'Anomaly detection flags unusual agent behavior for human review',
              'Graceful degradation to simpler systems when agent confidence is low'
            ]
          }
        ],
        checklist: [
          'Has an evaluation suite that measures task success, cost, and safety metrics.',
          'Implements budget limits, content filtering, and audit logging.',
          'Plans for graceful degradation when agent performance drops.'
        ],
        pitfalls: [
          'Deploying agents without comprehensive evaluation on edge cases.',
          'Relying solely on the LLM for safety without external guardrails.',
          'Not monitoring agent behavior continuously after deployment.'
        ],
        interviewPrompts: [
          'How would you evaluate an agent that manages customer refunds?',
          'Design a safety system for an agent with write access to production databases.',
          'What monitoring would you implement for an autonomous coding agent?'
        ],
        diagram: null,
        related: ['tool-use-and-function-calling', 'mlops-and-deployment']
      }
    ]
  },
  {
    slug: 'mlops-and-deployment',
    title: 'MLOps and production AI',
    summary: 'End-to-end ML lifecycle management: experiment tracking, model serving, monitoring, CI/CD for ML, and infrastructure at scale.',
    objectives: [
      'Design ML pipelines from training through deployment and monitoring',
      'Implement model serving with appropriate latency, cost, and reliability tradeoffs',
      'Build monitoring systems that detect model drift and performance degradation'
    ],
    lessons: [
      {
        slug: 'ml-pipeline-design',
        title: 'ML pipeline design',
        summary: 'Data pipelines, feature stores, training infrastructure, and experiment tracking for reproducible ML development.',
        duration: '30-40 min',
        whyItMatters: 'Production ML requires reproducible pipelines. Ad-hoc notebooks do not scale to teams or production reliability requirements.',
        sections: [
          {
            heading: 'Data pipelines',
            body: 'ETL, data validation, feature computation, and versioning ensure models train on clean, reproducible datasets.',
            bullets: [
              'Data validation (Great Expectations, TFX) catches data quality issues before training',
              'Feature stores (Feast, Tecton) enable feature reuse and consistency between training and serving',
              'Data versioning (DVC, LakeFS) enables reproducibility and rollback'
            ]
          },
          {
            heading: 'Training infrastructure',
            body: 'Distributed training, GPU management, hyperparameter optimization, and experiment tracking at scale.',
            bullets: [
              'Experiment tracking (MLflow, W&B) records parameters, metrics, and artifacts',
              'Distributed training (DeepSpeed, FSDP) enables training models that exceed single-GPU memory',
              'Hyperparameter optimization (Optuna, Ray Tune) automates search over configuration space'
            ]
          },
          {
            heading: 'Pipeline orchestration',
            body: 'Airflow, Kubeflow Pipelines, and Prefect coordinate multi-stage ML workflows with dependency management.',
            bullets: [
              'DAG-based orchestration handles complex dependencies between pipeline stages',
              'Retry logic and checkpointing prevent full restarts on transient failures',
              'Scheduling and triggers enable automated retraining on data freshness signals'
            ]
          }
        ],
        checklist: [
          'Can design a reproducible training pipeline with proper versioning.',
          'Understands feature store benefits for training-serving consistency.',
          'Knows how to orchestrate multi-stage ML workflows.'
        ],
        pitfalls: [
          'Running production training from Jupyter notebooks without version control.',
          'Not versioning data alongside code and model artifacts.',
          'Building monolithic pipelines that are hard to debug and iterate on.'
        ],
        interviewPrompts: [
          'Design an ML pipeline for a recommendation system that retrains daily.',
          'How would you ensure training-serving skew does not degrade model quality?',
          'Compare Kubeflow Pipelines and Airflow for ML orchestration. When would you choose each?'
        ],
        diagram: null,
        related: ['model-serving', 'monitoring-and-observability']
      },
      {
        slug: 'model-serving',
        title: 'Model serving and inference',
        summary: 'Serving infrastructure, optimization techniques, scaling strategies, and cost management for production model inference.',
        duration: '30-40 min',
        whyItMatters: 'Serving is where ML models create business value. Latency, throughput, cost, and reliability directly impact user experience and unit economics.',
        sections: [
          {
            heading: 'Serving architectures',
            body: 'Real-time APIs, batch inference, streaming predictions, and edge deployment each serve different latency and throughput requirements.',
            bullets: [
              'REST/gRPC APIs serve real-time predictions with low-latency requirements',
              'Batch inference processes large datasets efficiently when latency is not critical',
              'Edge deployment (ONNX Runtime, TFLite) brings predictions to devices and reduces cloud costs'
            ]
          },
          {
            heading: 'Optimization techniques',
            body: 'Quantization, pruning, distillation, caching, and batching reduce inference cost and latency.',
            bullets: [
              'Quantization (INT8, FP16) reduces model size and speeds inference with minimal quality loss',
              'Knowledge distillation trains smaller models to mimic larger ones',
              'Dynamic batching groups concurrent requests to maximize GPU utilization'
            ]
          },
          {
            heading: 'Scaling and reliability',
            body: 'Auto-scaling, load balancing, A/B testing, and canary deployments maintain service quality under variable load.',
            bullets: [
              'Horizontal scaling with request routing handles traffic spikes',
              'Model versioning enables rollback when new models underperform',
              'Shadow deployment compares new model performance before switching traffic'
            ]
          }
        ],
        checklist: [
          'Can choose the right serving architecture for latency and throughput requirements.',
          'Applies optimization techniques to meet cost and latency budgets.',
          'Designs for reliability with proper scaling and rollback capabilities.'
        ],
        pitfalls: [
          'Serving unoptimized models that exceed latency or cost budgets.',
          'Not implementing model rollback causing stuck bad deployments.',
          'Ignoring cold start latency in auto-scaled serverless deployments.'
        ],
        interviewPrompts: [
          'Design a serving system for an LLM that handles 1000 concurrent users.',
          'How would you reduce inference cost by 50% without significant quality degradation?',
          'Compare real-time and batch serving for a content moderation system.'
        ],
        diagram: null,
        related: ['ml-pipeline-design', 'monitoring-and-observability']
      },
      {
        slug: 'monitoring-and-observability',
        title: 'ML monitoring and observability',
        summary: 'Model drift detection, performance monitoring, alerting, and feedback loops for maintaining model quality in production.',
        duration: '25-35 min',
        whyItMatters: 'Models degrade silently in production as data distributions shift. Without monitoring you discover failures from user complaints, not metrics.',
        sections: [
          {
            heading: 'What to monitor',
            body: 'Input distributions, prediction distributions, latency, error rates, and business metrics collectively signal model health.',
            bullets: [
              'Data drift: statistical divergence between training and serving distributions',
              'Concept drift: the relationship between inputs and correct outputs changes over time',
              'Business metrics: revenue, conversion, satisfaction measure real-world impact'
            ]
          },
          {
            heading: 'Drift detection methods',
            body: 'Statistical tests (KS test, PSI), embedding drift, and performance-based triggers identify when models need retraining.',
            bullets: [
              'Population Stability Index (PSI) measures feature distribution shift',
              'Embedding drift detects semantic changes in unstructured input data',
              'Performance monitoring requires labeled ground truth, often with delay'
            ]
          },
          {
            heading: 'Feedback loops and retraining',
            body: 'Automated retraining triggers, human feedback collection, and A/B testing close the loop between monitoring and improvement.',
            bullets: [
              'Automated retraining pipelines trigger on drift detection or schedule',
              'Human feedback (thumbs up/down, corrections) provides ground truth labels',
              'Champion-challenger testing validates new models before full deployment'
            ]
          }
        ],
        checklist: [
          'Monitors both technical metrics (latency, errors) and ML-specific metrics (drift, accuracy).',
          'Has automated alerting for significant distribution shifts.',
          'Maintains feedback loops that connect monitoring to retraining decisions.'
        ],
        pitfalls: [
          'Only monitoring infrastructure health without tracking model prediction quality.',
          'Setting drift thresholds too sensitively causing alert fatigue.',
          'Retraining automatically without validating that new models improve performance.'
        ],
        interviewPrompts: [
          'How would you detect that a fraud model has degraded due to new attack patterns?',
          'Design a monitoring system for a recommendation engine serving millions of users.',
          'What is the difference between data drift and concept drift? Give examples of each.'
        ],
        diagram: null,
        related: ['model-serving', 'ml-pipeline-design']
      }
    ]
  },
  {
    slug: 'ai-safety-and-ethics',
    title: 'AI safety, ethics, and responsible AI',
    summary: 'Bias detection, fairness metrics, explainability, regulatory compliance, and building trustworthy AI systems.',
    objectives: [
      'Identify and mitigate bias in training data and model outputs',
      'Implement explainability and interpretability for stakeholder trust',
      'Navigate AI regulations (EU AI Act, GDPR) and organizational governance'
    ],
    lessons: [
      {
        slug: 'bias-and-fairness',
        title: 'Bias detection and fairness',
        summary: 'Sources of bias, fairness metrics, debiasing techniques, and testing practices for building equitable AI systems.',
        duration: '25-35 min',
        whyItMatters: 'Biased models cause real harm to people. AI engineers must proactively identify and mitigate bias throughout the development lifecycle.',
        sections: [
          {
            heading: 'Sources of bias',
            body: 'Training data, labeling processes, feature selection, and evaluation metrics can all introduce or amplify societal biases.',
            bullets: [
              'Historical bias in training data reflects past discrimination',
              'Representation bias occurs when certain groups are under-represented in data',
              'Measurement bias arises when proxy features correlate with protected attributes'
            ]
          },
          {
            heading: 'Fairness metrics',
            body: 'Demographic parity, equalized odds, and calibration measure different aspects of fairness that are often mathematically incompatible.',
            bullets: [
              'No single fairness metric satisfies all ethical frameworks simultaneously',
              'Choosing metrics requires understanding the specific harm you want to prevent',
              'Disaggregated evaluation across subgroups reveals disparate performance'
            ]
          },
          {
            heading: 'Mitigation strategies',
            body: 'Pre-processing (data rebalancing), in-processing (constrained training), and post-processing (threshold adjustment) approaches.',
            bullets: [
              'Data augmentation and resampling address representation imbalances',
              'Adversarial debiasing removes sensitive information from learned representations',
              'Post-hoc calibration adjusts decision thresholds per subgroup'
            ]
          }
        ],
        checklist: [
          'Evaluates models with disaggregated metrics across relevant subgroups.',
          'Can explain the tradeoffs between different fairness definitions.',
          'Implements at least one debiasing technique appropriate to the application.'
        ],
        pitfalls: [
          'Assuming a model is fair because overall accuracy is high.',
          'Applying fairness constraints without understanding which harm they address.',
          'Treating fairness as a one-time check rather than ongoing monitoring.'
        ],
        interviewPrompts: [
          'A hiring model shows different acceptance rates across demographics. How would you investigate and address this?',
          'Explain why demographic parity and equalized odds cannot both be satisfied simultaneously.',
          'Design a testing framework for detecting bias in an LLM-powered customer service system.'
        ],
        diagram: null,
        related: ['explainability', 'ai-governance']
      },
      {
        slug: 'explainability',
        title: 'Explainability and interpretability',
        summary: 'SHAP, LIME, attention visualization, and model-agnostic explanation methods for building trust and debugging models.',
        duration: '25-35 min',
        whyItMatters: 'Stakeholders, regulators, and users need to understand why a model made a decision. Explainability enables trust, debugging, and compliance.',
        sections: [
          {
            heading: 'Explanation methods',
            body: 'SHAP values, LIME, integrated gradients, and attention visualization provide different perspectives on model decisions.',
            bullets: [
              'SHAP provides theoretically grounded feature importance with consistency guarantees',
              'LIME generates local explanations by approximating the model with interpretable surrogates',
              'Attention weights provide some insight but are not always faithful explanations'
            ]
          },
          {
            heading: 'Designing for interpretability',
            body: 'Choosing inherently interpretable models, constraining architectures, and building explanation interfaces for different audiences.',
            bullets: [
              'Linear models and decision trees are inherently interpretable for simple problems',
              'Concept bottleneck models force intermediate representations to be human-understandable',
              'Different audiences (engineers, executives, end users) need different explanation formats'
            ]
          },
          {
            heading: 'Limitations and risks',
            body: 'Explanations can be misleading, unfaithful to the model, or provide false confidence in flawed systems.',
            bullets: [
              'Post-hoc explanations may not reflect the actual decision process',
              'Users may over-trust systems that provide plausible but incorrect explanations',
              'Explanation methods have their own failure modes and assumptions'
            ]
          }
        ],
        checklist: [
          'Can select an appropriate explanation method for the model type and audience.',
          'Understands the limitations and potential faithfulness issues of each method.',
          'Designs explanation interfaces appropriate for the stakeholder audience.'
        ],
        pitfalls: [
          'Treating attention weights as definitive explanations of model behavior.',
          'Providing explanations without validating their faithfulness to the model.',
          'Using complex explanation methods when a simpler model would be more appropriate.'
        ],
        interviewPrompts: [
          'Compare SHAP and LIME. When would you use each?',
          'A loan application was denied by your model. Design an explanation for the applicant.',
          'How would you verify that an explanation method is faithful to the model behavior?'
        ],
        diagram: null,
        related: ['bias-and-fairness', 'ai-governance']
      },
      {
        slug: 'ai-governance',
        title: 'AI governance and regulation',
        summary: 'EU AI Act, GDPR implications, model documentation, risk assessment, and organizational AI governance frameworks.',
        duration: '25-35 min',
        whyItMatters: 'AI regulation is rapidly evolving. Engineers must understand compliance requirements to avoid legal liability and build systems that meet regulatory standards.',
        sections: [
          {
            heading: 'Regulatory landscape',
            body: 'The EU AI Act, GDPR right to explanation, US executive orders, and sector-specific regulations create compliance requirements for AI systems.',
            bullets: [
              'EU AI Act categorizes systems by risk level with corresponding requirements',
              'High-risk AI systems require conformity assessments and documentation',
              'GDPR Article 22 grants rights around automated decision-making'
            ]
          },
          {
            heading: 'Documentation and auditing',
            body: 'Model cards, data sheets, impact assessments, and audit trails provide the documentation required for compliance and accountability.',
            bullets: [
              'Model cards document intended use, limitations, and evaluation results',
              'Datasheets describe dataset composition, collection process, and known biases',
              'Impact assessments evaluate risks to fundamental rights before deployment'
            ]
          },
          {
            heading: 'Organizational governance',
            body: 'AI ethics boards, review processes, incident response, and responsible disclosure frameworks operationalize AI safety at scale.',
            bullets: [
              'Cross-functional review boards bring diverse perspectives to deployment decisions',
              'Staged deployment with escalation paths controls risk during rollout',
              'Incident response plans define how to handle AI system failures and harms'
            ]
          }
        ],
        checklist: [
          'Understands the risk classification system in the EU AI Act.',
          'Can produce model documentation meeting regulatory requirements.',
          'Knows how to conduct an AI impact assessment for a new system.'
        ],
        pitfalls: [
          'Treating AI governance as purely a legal concern without engineering involvement.',
          'Producing documentation as a box-ticking exercise without meaningful content.',
          'Ignoring international regulatory differences when deploying globally.'
        ],
        interviewPrompts: [
          'How would you classify a resume screening system under the EU AI Act?',
          'Design a model card for an LLM-powered medical triage assistant.',
          'What technical measures would you implement to comply with GDPR Article 22?'
        ],
        diagram: null,
        related: ['bias-and-fairness', 'explainability']
      }
    ]
  },
  {
    slug: 'data-engineering-for-ml',
    title: 'Data engineering for AI',
    summary: 'Building robust data pipelines, managing training datasets at scale, and ensuring data quality for production ML systems.',
    objectives: [
      'Design data pipelines that handle ingestion, transformation, and validation at scale',
      'Manage training datasets with proper versioning, lineage, and quality controls',
      'Build feature stores that maintain consistency between training and serving'
    ],
    lessons: [
      {
        slug: 'data-pipelines-at-scale',
        title: 'Data pipelines at scale',
        summary: 'Batch and stream processing, ETL design patterns, and data quality validation for ML training data.',
        duration: '30-40 min',
        whyItMatters: 'Models are only as good as their training data. Robust data pipelines are the foundation of reliable AI systems.',
        sections: [
          {
            heading: 'Pipeline architecture patterns',
            body: 'Batch ETL, streaming ingestion, lambda and kappa architectures, and event-driven pipelines serve different freshness requirements.',
            bullets: [
              'Batch processing (Spark, Dask) handles large-scale historical data efficiently',
              'Stream processing (Kafka, Flink) enables real-time feature computation',
              'Lambda architecture combines batch and streaming for both freshness and completeness'
            ]
          },
          {
            heading: 'Data quality and validation',
            body: 'Schema validation, statistical checks, and anomaly detection prevent garbage-in-garbage-out training failures.',
            bullets: [
              'Schema enforcement catches structural data issues at ingestion time',
              'Statistical profiling detects distribution shifts, null spikes, and anomalies',
              'Data contracts between producers and consumers prevent silent breaking changes'
            ]
          },
          {
            heading: 'Scaling considerations',
            body: 'Partitioning strategies, storage formats, and compute resource management for terabyte-scale training datasets.',
            bullets: [
              'Columnar formats (Parquet, ORC) optimize both storage and query performance',
              'Partition pruning reduces the data scanned for feature computation',
              'Cost optimization balances compute spot instances against pipeline reliability'
            ]
          }
        ],
        checklist: [
          'Can design a data pipeline appropriate for the freshness and scale requirements.',
          'Implements data quality checks that catch issues before they affect training.',
          'Understands storage format and partitioning tradeoffs for large datasets.'
        ],
        pitfalls: [
          'Building real-time pipelines when batch processing would meet SLAs at lower cost.',
          'Not implementing data validation, leading to silent data corruption in training.',
          'Over-engineering pipeline infrastructure before proving the model value.'
        ],
        interviewPrompts: [
          'Design a data pipeline for a recommendation system that needs hourly feature updates.',
          'How would you implement data quality checks for a pipeline processing 10TB/day?',
          'Compare batch and streaming architectures for computing user engagement features.'
        ],
        diagram: null,
        related: ['model-evaluation', 'ml-pipeline-design']
      },
      {
        slug: 'dataset-management',
        title: 'Dataset management and versioning',
        summary: 'Data versioning, lineage tracking, labeling pipelines, and dataset governance for reproducible ML.',
        duration: '25-35 min',
        whyItMatters: 'Without proper dataset management, you cannot reproduce results, audit decisions, or comply with data regulations.',
        sections: [
          {
            heading: 'Versioning and lineage',
            body: 'DVC, LakeFS, and Delta Lake provide git-like versioning for datasets, enabling reproducibility and rollback.',
            bullets: [
              'Dataset versions tied to model versions enable full reproducibility',
              'Lineage tracking shows how raw data was transformed into training features',
              'Branching enables experimentation with different data preprocessing strategies'
            ]
          },
          {
            heading: 'Labeling and annotation',
            body: 'Human labeling pipelines, active learning, weak supervision, and quality control for supervised learning datasets.',
            bullets: [
              'Active learning prioritizes labeling the most informative examples',
              'Weak supervision (Snorkel) generates noisy labels programmatically at scale',
              'Inter-annotator agreement metrics measure labeling consistency'
            ]
          },
          {
            heading: 'Privacy and compliance',
            body: 'Data anonymization, access controls, retention policies, and consent management for training data.',
            bullets: [
              'PII detection and masking prevent sensitive data from entering training sets',
              'Data retention policies ensure compliance with deletion requests',
              'Differential privacy adds mathematical guarantees to model training'
            ]
          }
        ],
        checklist: [
          'Versions datasets alongside model code and training configurations.',
          'Maintains lineage from raw data through features to model predictions.',
          'Implements privacy controls appropriate for the data sensitivity level.'
        ],
        pitfalls: [
          'Treating datasets as immutable without tracking transformations applied.',
          'Not measuring labeling quality leading to noisy training signals.',
          'Ignoring data privacy requirements until compliance becomes an emergency.'
        ],
        interviewPrompts: [
          'How would you manage datasets for a model that must comply with right-to-be-forgotten requests?',
          'Design a labeling pipeline for a medical image classification task.',
          'When would you choose weak supervision over manual labeling?'
        ],
        diagram: null,
        related: ['data-pipelines-at-scale', 'ml-pipeline-design']
      }
    ]
  }
];
