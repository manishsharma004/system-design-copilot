import MarkdownIt from 'markdown-it'
import {
  extractPracticeCases,
  parseLanguageTemplates,
  parseQuestionMeta,
  supportsLocalWasmPractice
} from './practice.js'

const solutionMarkdown = new MarkdownIt({
  html: true,
  linkify: true,
  breaks: false,
  typographer: false
})

/**
 * @param {string} value
 */
function slugify(value) {
  return String(value ?? '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

/**
 * LeetCode article solutions ship as Markdown (with a few HTML tags). Convert
 * them to HTML for the question-bank "Show solution" panel.
 *
 * @param {string} markdown
 */
export function renderSolutionHtml(markdown) {
  const source = String(markdown ?? '')
    .replace(/^\s*\[TOC\]\s*/i, '')
    .replace(/!\?![\s\S]*?!\?!/g, '')
    .replace(/\$\$([^$\n]+)\$\$/g, (_match, expr) => `<code>${simplifySolutionMath(expr)}</code>`)
    .trim()

  if (!source) return ''

  try {
    return solutionMarkdown.render(source)
  } catch {
    return `<pre>${escapeHtml(source)}</pre>`
  }
}

/**
 * @param {string} value
 */
function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
}

/**
 * Lightweight cleanup for common LeetCode $$...$$ math snippets.
 *
 * @param {string} expr
 */
function simplifySolutionMath(expr) {
  return escapeHtml(
    String(expr)
      .replace(/\\cdot/g, '·')
      .replace(/\\times/g, '×')
      .replace(/\\leq/g, '≤')
      .replace(/\\geq/g, '≥')
      .replace(/\\neq/g, '≠')
      .replace(/\\infty/g, '∞')
      .replace(/\\rightarrow/g, '→')
      .replace(/\\text\{([^}]+)\}/g, '$1')
      .replace(/\\mathrm\{([^}]+)\}/g, '$1')
      .replace(/[{}]/g, '')
  )
}

/**
 * Convert one raw chapter item from a LeetCode-style dataset into a normalized
 * entry the question bank UI can render. Coding questions (`type === 1`) expose
 * practice metadata; article/reading items (`type === 3`) expose HTML content.
 *
 * @param {any} item
 * @returns {null | {
 *   kind: 'coding' | 'reading',
 *   id: string,
 *   title: string,
 *   note: string,
 *   contentHtml: string,
 *   hints: string[],
 *   frontendId?: string | null,
 *   titleSlug?: string,
 *   paidOnly?: boolean,
 *   solutionHtml?: string,
 *   sampleTestCase?: string,
 *   practiceMeta?: any,
 *   languageTemplates?: Record<string, any>,
 *   practiceCases?: any[],
 *   supportsLocalWasmRun?: boolean,
 *   originalLink?: string
 * }}
 */
export function toBankItem(item) {
  const questionData = item?.questionData
  if (!questionData) return null

  if (questionData.questionTitle) {
    const practiceMeta = parseQuestionMeta(questionData.metaData)
    const languageTemplates = parseLanguageTemplates(questionData.codeDefinition)
    const practiceCases = extractPracticeCases(questionData.content, questionData.sampleTestCase)
    const supportsLocalWasmRun = supportsLocalWasmPractice({ practiceMeta, languageTemplates })

    return {
      kind: 'coding',
      id: String(item.id),
      title: questionData.questionTitle,
      frontendId: questionData.questionFrontendId ?? null,
      titleSlug: questionData.titleSlug || slugify(questionData.questionTitle),
      note: item.info || '',
      paidOnly: Boolean(item.paidOnly),
      contentHtml: questionData.content || '',
      solutionHtml: renderSolutionHtml(questionData.solution?.content || ''),
      hints: Array.isArray(questionData.hints) ? questionData.hints : [],
      sampleTestCase: questionData.sampleTestCase || '',
      practiceMeta,
      languageTemplates,
      practiceCases,
      supportsLocalWasmRun
    }
  }

  if (questionData.html) {
    return {
      kind: 'reading',
      id: String(item.id),
      title: item.title || 'Reading',
      note: item.info || '',
      contentHtml: questionData.html,
      originalLink: questionData.originalLink || '',
      hints: []
    }
  }

  return null
}

/**
 * Normalize a raw dataset (array of chapters) into the structure consumed by the
 * question bank workspace. Empty chapters are dropped so the sidebar stays clean.
 *
 * @param {any} rawData
 */
export function buildQuestionBank(rawData) {
  const chapters = (Array.isArray(rawData) ? rawData : [])
    .map((/** @type {any} */ chapter) => {
      const items = (chapter?.items ?? [])
        .map((/** @type {any} */ item) => toBankItem(item))
        .filter(Boolean)
      return {
        id: String(chapter?.id ?? slugify(chapter?.title ?? '')),
        title: chapter?.title ?? 'Section',
        slug: chapter?.slug ?? slugify(chapter?.title ?? ''),
        description: chapter?.descriptionText ?? '',
        items
      }
    })
    .filter((chapter) => chapter.items.length > 0)

  const allItems = chapters.flatMap((chapter) => chapter.items)

  return {
    chapters,
    totalQuestions: allItems.length,
    codingCount: allItems.filter((item) => item.kind === 'coding').length,
    readingCount: allItems.filter((item) => item.kind === 'reading').length,
    runnableCount: allItems.filter((item) => item.kind === 'coding' && item.supportsLocalWasmRun).length
  }
}
