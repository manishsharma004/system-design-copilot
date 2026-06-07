const STOP_WORDS = new Set([
  'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'can', 'do', 'does', 'for', 'from', 'how', 'if',
  'in', 'into', 'is', 'it', 'of', 'on', 'or', 'the', 'their', 'this', 'to', 'what', 'when', 'why',
  'with', 'you', 'your'
]);

/** @param {string} text */
function toTokens(text) {
  return String(text ?? '')
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((token) => token.length > 2 && !STOP_WORDS.has(token));
}

/**
 * @param {string} question
 * @param {string[]} contextPoints
 * @param {string[]} fallbackPoints
 */
export function getLikelyAnswerPoints(question, contextPoints = [], fallbackPoints = []) {
  const questionTokens = new Set(toTokens(question));
  const usableContext = contextPoints
    .filter(Boolean)
    .map((point) => String(point).trim())
    .filter((point) => point.length > 0);

  const ranked = usableContext
    .map((point, index) => ({
      point,
      index,
      score: toTokens(point).reduce((total, token) => total + (questionTokens.has(token) ? 1 : 0), 0)
    }))
    .sort((a, b) => b.score - a.score || a.index - b.index);

  const matched = ranked
    .filter((entry) => entry.score > 0)
    .slice(0, 3)
    .map((entry) => entry.point);

  if (matched.length) {
    return matched;
  }

  const fallback = fallbackPoints
    .filter(Boolean)
    .map((point) => String(point).trim())
    .filter((point) => point.length > 0)
    .slice(0, 3);

  if (fallback.length) {
    return fallback;
  }

  return usableContext.slice(0, 3);
}

/** @param {any} lesson */
export function buildLessonAnswerContext(lesson) {
  const sectionBodies = lesson?.sections?.map((section) => section.body) ?? [];
  const sectionBullets = lesson?.sections?.flatMap((section) => section.bullets ?? []) ?? [];

  return [
    lesson?.whyItMatters,
    ...(lesson?.checklist ?? []),
    ...sectionBodies,
    ...sectionBullets,
    ...(lesson?.pitfalls ?? [])
  ]
    .filter(Boolean)
    .map((entry) => String(entry).trim())
    .filter((entry) => entry.length > 0);
}
