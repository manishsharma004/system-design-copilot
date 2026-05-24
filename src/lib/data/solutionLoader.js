export const solutionLessonIds = new Set([
  'case-studies/url-shortener',
  'case-studies/web-crawler',
  'case-studies/social-graph',
  'case-studies/query-cache',
  'case-studies/scaling-playbook'
]);

/**
 * @param {string} lessonId
 */
export async function loadLessonSolution(lessonId) {
  if (!solutionLessonIds.has(lessonId)) {
    return null;
  }

  const { lessonEnhancements } = await import('./lessonEnhancements.js');
  const enhancementMap = /** @type {Record<string, any>} */ (lessonEnhancements);
  return enhancementMap[lessonId] ?? null;
}
