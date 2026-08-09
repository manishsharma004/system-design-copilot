/**
 * Merges AI/ML interactive Learn-chapter enrichments onto base chapter objects.
 * Keeps bulky mermaid / demo content in aiLearnChapterEnrichment.js.
 */

import { aiLearnChapterEnrichment } from './aiLearnChapterEnrichment.js';

/**
 * @param {import('./learnChapters.js').LessonLearnChapter} chapter
 * @param {string} lessonId
 * @returns {import('./learnChapters.js').LessonLearnChapter}
 */
export function applyAiLearnChapterEnrichment(chapter, lessonId) {
  const enrichment = aiLearnChapterEnrichment[lessonId];
  if (!enrichment) return chapter;

  const parts = chapter.parts.map((part) => {
    const patch = enrichment.parts?.[part.id];
    if (!patch) return part;

    return {
      ...part,
      mermaid: part.mermaid ?? patch.mermaid,
      workedExample: part.workedExample ?? patch.workedExample,
      interactiveDemo: part.interactiveDemo ?? patch.interactiveDemo
    };
  });

  const baseNext = chapter.wrapUp?.nextSteps ?? [];
  const extraNext = enrichment.wrapUp?.nextSteps ?? [];
  const mergedNext = [...baseNext, ...extraNext];

  return {
    ...chapter,
    parts,
    wrapUp: {
      ...chapter.wrapUp,
      nextSteps: mergedNext.length ? mergedNext : chapter.wrapUp?.nextSteps
    }
  };
}

/** Lesson ids that receive interactive Learn enrichments. */
export const AI_LEARN_ENRICHMENT_IDS = Object.keys(aiLearnChapterEnrichment);
