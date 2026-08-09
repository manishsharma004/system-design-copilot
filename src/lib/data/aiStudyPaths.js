/**
 * Curated AI Engineer study paths and module phase labels for the flow page.
 */

/** @typedef {{ id: string, title: string, summary: string, lessonIds: string[] }} AiStudyPath */

/** @type {AiStudyPath[]} */
export const aiStudyPaths = [
  {
    id: 'app-builder',
    title: 'AI application engineer',
    summary:
      'Hands-on labs first, then LLMs, RAG, agents, and shipping — optimized for building chat, retrieval, and tool-calling products.',
    lessonIds: [
      'ml-interactive-lab/feature-engineering-playground',
      'ml-interactive-lab/supervised-learning-workshop',
      'ml-foundations/classical-ml-algorithms',
      'ml-foundations/model-evaluation',
      'llms-and-nlp/llm-fundamentals',
      'llms-and-nlp/embeddings-and-vector-search',
      'data-engineering-for-ml/data-pipelines-at-scale',
      'prompt-engineering-and-rag/prompt-engineering',
      'prompt-engineering-and-rag/rag-systems',
      'prompt-engineering-and-rag/building-with-frameworks',
      'ai-application-lab/chat-api-and-streaming',
      'ai-application-lab/multi-tenant-rag-products',
      'ai-application-lab/shipping-ai-features',
      'ai-agents/tool-use-and-function-calling',
      'mlops-and-deployment/model-serving',
      'llmops-eval-lab/llm-evaluation-harness',
      'llmops-eval-lab/cost-latency-and-observability',
      'llmops-eval-lab/shipping-gates-and-guardrails'
    ]
  },
  {
    id: 'ml-engineer',
    title: 'ML engineer',
    summary:
      'Math and classical ML foundations, deep learning, fine-tuning, and production ML systems.',
    lessonIds: [
      'ml-foundations/math-for-ml',
      'ml-foundations/classical-ml-algorithms',
      'ml-foundations/model-evaluation',
      'deep-learning/neural-network-fundamentals',
      'deep-learning/cnn-and-computer-vision',
      'deep-learning/transformer-architecture',
      'deep-learning-from-scratch/perceptron-and-mlp-numpy',
      'transformers-attention-lab/attention-from-scratch',
      'llms-and-nlp/fine-tuning-techniques',
      'llms-and-nlp/embeddings-and-vector-search',
      'ml-production-lab/serving-contracts-lab',
      'ml-production-lab/drift-and-monitoring-lab',
      'ml-production-lab/leakage-safe-pipelines',
      'data-engineering-for-ml/data-pipelines-at-scale',
      'data-engineering-for-ml/dataset-management'
    ]
  },
  {
    id: 'platform',
    title: 'Platform / LLMOps',
    summary:
      'Evaluation harnesses, cost and latency SLOs, serving, governance, and safe shipping gates.',
    lessonIds: [
      'llms-and-nlp/llm-fundamentals',
      'prompt-engineering-and-rag/rag-systems',
      'llm-retrieval-lab/rag-evaluation-workshop',
      'llmops-eval-lab/llm-evaluation-harness',
      'llmops-eval-lab/cost-latency-and-observability',
      'llmops-eval-lab/shipping-gates-and-guardrails',
      'mlops-and-deployment/ml-pipeline-design',
      'mlops-and-deployment/model-serving',
      'mlops-and-deployment/monitoring-and-observability',
      'ai-safety-and-ethics/ai-governance',
      'ai-agents/agent-evaluation-and-safety',
      'ml-production-lab/drift-and-monitoring'
    ]
  }
];

/** Default path for new learners (builder-first). */
export const DEFAULT_AI_STUDY_PATH_ID = 'app-builder';

/** Module learners should understand before deep RAG work. */
export const aiRagPrerequisiteModuleSlug = 'data-engineering-for-ml';

/** First module slug per study path (for START HERE). */
export const aiStudyPathStartModule = {
  'app-builder': 'ml-interactive-lab',
  'ml-engineer': 'ml-foundations',
  'platform': 'llmops-eval-lab'
};

/**
 * Module phase labels for the AI flow runway.
 * @type {Record<string, { phase: string, label: string }>}
 */
export const aiModulePhases = {
  'ml-foundations': { phase: 'foundations', label: 'Foundations' },
  'deep-learning': { phase: 'foundations', label: 'Foundations' },
  'ml-interactive-lab': { phase: 'foundations', label: 'Foundations' },
  'deep-learning-from-scratch': { phase: 'foundations', label: 'Foundations' },
  'llms-and-nlp': { phase: 'models', label: 'Models' },
  'transformers-attention-lab': { phase: 'models', label: 'Models' },
  'prompt-engineering-and-rag': { phase: 'applications', label: 'Applications' },
  'ai-agents': { phase: 'applications', label: 'Applications' },
  'ai-application-lab': { phase: 'applications', label: 'Applications' },
  'mlops-and-deployment': { phase: 'production', label: 'Production' },
  'ai-safety-and-ethics': { phase: 'production', label: 'Production' },
  'data-engineering-for-ml': { phase: 'production', label: 'Production' },
  'llm-retrieval-lab': { phase: 'applications', label: 'Applications' },
  'ml-production-lab': { phase: 'production', label: 'Production' },
  'llmops-eval-lab': { phase: 'production', label: 'Production' }
};

/**
 * @param {string} pathId
 */
export function getAiStudyPath(pathId) {
  return aiStudyPaths.find((path) => path.id === pathId) ?? aiStudyPaths[0];
}

/**
 * @param {string} pathId
 * @param {string[]} completedLessonIds
 */
export function getNextLessonIdForAiPath(pathId, completedLessonIds) {
  const path = getAiStudyPath(pathId);
  return path.lessonIds.find((id) => !completedLessonIds.includes(id)) ?? path.lessonIds[0];
}
