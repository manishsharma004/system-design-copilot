import { aiDeepKnowledge } from './deepKnowledge/aiDeepKnowledge.js';
import { hldDeepKnowledge } from './deepKnowledge/hldDeepKnowledge.js';
import { lldDsaDeepKnowledge } from './deepKnowledge/lldDsaDeepKnowledge.js';
import { questionBankDeepKnowledge } from './deepKnowledge/questionBankDeepKnowledge.js';

/**
 * @typedef {object} DeepKnowledgeInsight
 * @property {string} heading
 * @property {string} body
 */

/**
 * @typedef {object} DeepKnowledgeReference
 * @property {string} title
 * @property {string} url
 * @property {string} source
 * @property {string} note
 */

/**
 * @typedef {object} LessonDeepKnowledge
 * @property {DeepKnowledgeInsight[]} insights
 * @property {DeepKnowledgeReference[]} references
 */

/** @type {Record<string, LessonDeepKnowledge>} */
export const lessonDeepKnowledgeIndex = {
  ...hldDeepKnowledge,
  ...lldDsaDeepKnowledge,
  ...aiDeepKnowledge,
  ...questionBankDeepKnowledge
};

/**
 * @param {string} lessonId
 * @returns {LessonDeepKnowledge | null}
 */
export function getLessonDeepKnowledge(lessonId) {
  return lessonDeepKnowledgeIndex[lessonId] ?? null;
}
