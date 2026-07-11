/**
 * Flow-aware prompt builders for the in-app LLM coach (outline / check).
 */

/** @typedef {'outline' | 'check' | 'review'} AssistantMode */

/** @type {Record<string, string>} */
const CHECK_INSTRUCTIONS = {
  'high-level-design':
    'Check this system-design interview answer. Evaluate coverage of requirements, capacity estimates, APIs, data model, bottlenecks, and trade-offs. Call out what is strong, what is missing, and suggest the next three concrete improvements.',
  'low-level-design':
    'Check this low-level design / machine-coding answer. Evaluate classes or interfaces, responsibilities, invariants, complexity, and extensibility. Call out what is strong, what is missing, and suggest the next three concrete improvements.',
  'data-structures-and-algorithms':
    'Check this coding-interview solution. Focus on correctness of the approach, time and space complexity, edge cases, and code clarity — not only whether tests may have passed. Call out what is strong, what is missing, and suggest the next three concrete improvements.',
  'ai-engineer':
    'Check this AI/ML interview answer. Evaluate intuition, pipeline or architecture, evaluation metrics, failure modes, and production concerns. Call out what is strong, what is missing, and suggest the next three concrete improvements.',
  'interview-questions':
    'Check this interview-prep answer. Evaluate interview communication quality and technical depth. For coding answers, also cover approach, complexity, and edge cases; for reading/strategy answers, cover structure and completeness. Call out what is strong, what is missing, and suggest the next three concrete improvements.',
  simulation:
    'Check this system-design simulation. Judge whether the topology matches the stated goals and workload, interpret the findings, and suggest one concrete fix. Call out what is strong, what is missing, and the single highest-leverage next change.'
}

const OUTLINE_INSTRUCTION =
  'Produce a tighter system-design answer outline with concrete sections, missing considerations, and one suggested next edit.'

const DEFAULT_CHECK_INSTRUCTION =
  'Check the user answer against the question. Highlight strengths, gaps, missing trade-offs, and suggest the next three improvements.'

/**
 * @param {string | undefined | null} flowId
 * @returns {string}
 */
export function getCheckInstruction(flowId) {
  if (!flowId) return DEFAULT_CHECK_INSTRUCTION
  return CHECK_INSTRUCTIONS[flowId] ?? DEFAULT_CHECK_INSTRUCTION
}

/**
 * @param {AssistantMode} mode
 * @param {string | undefined | null} flowId
 * @returns {string}
 */
export function getModeInstruction(mode, flowId) {
  if (mode === 'outline') return OUTLINE_INSTRUCTION
  // 'review' is an alias for check (kept for callers that still pass review)
  return getCheckInstruction(flowId)
}

/**
 * Build the user prompt for Check (AI) / outline / review.
 *
 * @param {{
 *   flowId?: string | null,
 *   mode?: AssistantMode,
 *   question?: string,
 *   answer?: string,
 *   contextSections?: string[],
 *   extraRequest?: string
 * }} options
 * @returns {string}
 */
export function buildAnswerCheckPrompt(options = {}) {
  const {
    flowId = '',
    mode = 'check',
    question = '',
    answer = '',
    contextSections = [],
    extraRequest = ''
  } = options

  const sections = []

  if (question?.trim()) {
    sections.push(`Question:\n${question.trim()}`)
  }

  for (const section of contextSections) {
    if (section?.trim()) {
      sections.push(`Context: ${section.trim()}`)
    }
  }

  if (answer?.trim()) {
    sections.push(`User answer:\n${answer.trim()}`)
  }

  if (extraRequest?.trim()) {
    sections.push(`Specific request: ${extraRequest.trim()}`)
  }

  sections.push(getModeInstruction(mode, flowId))

  return sections.filter(Boolean).join('\n\n')
}

/**
 * Known flow ids that have dedicated check rubrics (for tests / docs).
 * @returns {string[]}
 */
export function getCheckPromptFlowIds() {
  return Object.keys(CHECK_INSTRUCTIONS)
}

/**
 * Strip HTML tags for prompt text (browser-safe enough for lesson HTML).
 * @param {string | undefined | null} html
 * @returns {string}
 */
export function plainTextFromHtml(html) {
  return String(html ?? '')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/\s+/g, ' ')
    .trim()
}
