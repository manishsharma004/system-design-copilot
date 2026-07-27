/**
 * Learn-chapter hub: long-form book-style chapter bodies for the Learn reader.
 *
 * Dedicated chapters ship for AI/ML, HLD, LLD, and DSA lessons under `./learnChapters/`.
 * Question-bank lessons still fall back to lesson sections + deep knowledge in the UI.
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

import { hldFoundationsChapters } from './learnChapters/hldFoundationsChapters.js';
import { hldEdgeRoutingChapters } from './learnChapters/hldEdgeRoutingChapters.js';
import { hldApplicationArchitectureChapters } from './learnChapters/hldApplicationArchitectureChapters.js';
import { hldDataStorageChapters } from './learnChapters/hldDataStorageChapters.js';
import { hldPerformanceResilienceChapters } from './learnChapters/hldPerformanceResilienceChapters.js';
import { hldSecurityOperationsChapters } from './learnChapters/hldSecurityOperationsChapters.js';
import { hldDistributedSystemsChapters } from './learnChapters/hldDistributedSystemsChapters.js';
import { hldProductPatternsChapters } from './learnChapters/hldProductPatternsChapters.js';
import { hldCaseStudiesChapters } from './learnChapters/hldCaseStudiesChapters.js';
import { hldSystemsFundamentalsLabChapters } from './learnChapters/hldSystemsFundamentalsLabChapters.js';
import { hldReliabilityObservabilityLabChapters } from './learnChapters/hldReliabilityObservabilityLabChapters.js';
import { hldDataStorageLabChapters } from './learnChapters/hldDataStorageLabChapters.js';
import { hldSecurityOperationsLabChapters } from './learnChapters/hldSecurityOperationsLabChapters.js';
import { hldDistributedSystemsLabChapters } from './learnChapters/hldDistributedSystemsLabChapters.js';

import { lldFoundationsChapters } from './learnChapters/lldFoundationsChapters.js';
import { lldModelingChapters } from './learnChapters/lldModelingChapters.js';
import { lldExtensibilityChapters } from './learnChapters/lldExtensibilityChapters.js';
import { lldMachineCodingChapters } from './learnChapters/lldMachineCodingChapters.js';
import { lldDesignPatternsLabChapters } from './learnChapters/lldDesignPatternsLabChapters.js';
import { lldProjectLabsChapters } from './learnChapters/lldProjectLabsChapters.js';
import { lldSolidPrinciplesLabChapters } from './learnChapters/lldSolidPrinciplesLabChapters.js';
import { lldMachineCodingClassicsChapters } from './learnChapters/lldMachineCodingClassicsChapters.js';
import { lldHotPathLabsChapters } from './learnChapters/lldHotPathLabsChapters.js';

import { dsaConceptsLabChapters } from './learnChapters/dsaConceptsLabChapters.js';
import { dsaAlgorithmsLabChapters } from './learnChapters/dsaAlgorithmsLabChapters.js';
import { dsaPatternsLabChapters } from './learnChapters/dsaPatternsLabChapters.js';
import { dsaSearchLabChapters } from './learnChapters/dsaSearchLabChapters.js';
import { dsaInterviewEssentialsLabChapters } from './learnChapters/dsaInterviewEssentialsLabChapters.js';
import { dsaFoundationsChapters } from './learnChapters/dsaFoundationsChapters.js';
import { dsaCorePatternsChapters } from './learnChapters/dsaCorePatternsChapters.js';
import { dsaCompanyRoundsChapters } from './learnChapters/dsaCompanyRoundsChapters.js';
import { dsaMockLoopsChapters } from './learnChapters/dsaMockLoopsChapters.js';

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
  ...llmopsEvalLabChapters,
  ...hldFoundationsChapters,
  ...hldEdgeRoutingChapters,
  ...hldApplicationArchitectureChapters,
  ...hldDataStorageChapters,
  ...hldPerformanceResilienceChapters,
  ...hldSecurityOperationsChapters,
  ...hldDistributedSystemsChapters,
  ...hldProductPatternsChapters,
  ...hldCaseStudiesChapters,
  ...hldSystemsFundamentalsLabChapters,
  ...hldReliabilityObservabilityLabChapters,
  ...hldDataStorageLabChapters,
  ...hldSecurityOperationsLabChapters,
  ...hldDistributedSystemsLabChapters,
  ...lldFoundationsChapters,
  ...lldModelingChapters,
  ...lldExtensibilityChapters,
  ...lldMachineCodingChapters,
  ...lldDesignPatternsLabChapters,
  ...lldProjectLabsChapters,
  ...lldSolidPrinciplesLabChapters,
  ...lldMachineCodingClassicsChapters,
  ...lldHotPathLabsChapters,
  ...dsaConceptsLabChapters,
  ...dsaAlgorithmsLabChapters,
  ...dsaPatternsLabChapters,
  ...dsaSearchLabChapters,
  ...dsaInterviewEssentialsLabChapters,
  ...dsaFoundationsChapters,
  ...dsaCorePatternsChapters,
  ...dsaCompanyRoundsChapters,
  ...dsaMockLoopsChapters
};

/**
 * @param {string} lessonId
 * @returns {LessonLearnChapter | null}
 */
export function getLessonLearnChapter(lessonId) {
  return lessonLearnChapterIndex[lessonId] ?? null;
}
