/**
 * Learn-chapter hub: long-form book-style chapter bodies for the Learn reader.
 *
 * AI/ML lessons ship dedicated chapters under `./learnChapters/`.
 * Other flows fall back to lesson sections + deep knowledge in the UI.
 */

import { mlFoundationsChapters } from './learnChapters/mlFoundationsChapters.js';
import { deepLearningChapters } from './learnChapters/deepLearningChapters.js';
import { llmsNlpChapters } from './learnChapters/llmsNlpChapters.js';
import { promptRagChapters } from './learnChapters/promptRagChapters.js';
import { aiAgentsChapters } from './learnChapters/aiAgentsChapters.js';
import { mlopsChapters } from './learnChapters/mlopsChapters.js';
import { aiSafetyChapters } from './learnChapters/aiSafetyChapters.js';
import { dataEngineeringChapters } from './learnChapters/dataEngineeringChapters.js';
import { mlInteractiveLabChapters } from './learnChapters/mlInteractiveLabChapters.js';
import { deepLearningFromScratchChapters } from './learnChapters/deepLearningFromScratchChapters.js';
import { transformersAttentionLabChapters } from './learnChapters/transformersAttentionLabChapters.js';
import { llmRetrievalLabChapters } from './learnChapters/llmRetrievalLabChapters.js';
import { mlProductionLabChapters } from './learnChapters/mlProductionLabChapters.js';
import { llmopsEvalLabChapters } from './learnChapters/llmopsEvalLabChapters.js';

/**
 * @typedef {{ term: string, definition: string }} LearnKeyTerm
 * @typedef {{ title: string, body: string, code?: string, language?: string }} LearnWorkedExample
 * @typedef {{ prompt: string, reveal: string }} LearnCheckYourself
 * @typedef {{ tone: 'tip' | 'warning' | 'interview', body: string }} LearnCallout
 * @typedef {{
 *   id: string,
 *   heading: string,
 *   paragraphs: string[],
 *   keyTerms?: LearnKeyTerm[],
 *   workedExample?: LearnWorkedExample,
 *   checkYourself?: LearnCheckYourself[],
 *   callout?: LearnCallout
 * }} LearnChapterPart
 * @typedef {{
 *   title: string,
 *   readingTime: string,
 *   premise: string,
 *   parts: LearnChapterPart[],
 *   wrapUp: { takeaways: string[], nextSteps?: string[] }
 * }} LessonLearnChapter
 */

/** @type {Record<string, LessonLearnChapter>} */
export const lessonLearnChapterIndex = {
  ...mlFoundationsChapters,
  ...deepLearningChapters,
  ...llmsNlpChapters,
  ...promptRagChapters,
  ...aiAgentsChapters,
  ...mlopsChapters,
  ...aiSafetyChapters,
  ...dataEngineeringChapters,
  ...mlInteractiveLabChapters,
  ...deepLearningFromScratchChapters,
  ...transformersAttentionLabChapters,
  ...llmRetrievalLabChapters,
  ...mlProductionLabChapters,
  ...llmopsEvalLabChapters
};

/**
 * @param {string} lessonId
 * @returns {LessonLearnChapter | null}
 */
export function getLessonLearnChapter(lessonId) {
  return lessonLearnChapterIndex[lessonId] ?? null;
}
