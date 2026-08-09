import { browser } from '$app/environment';

const STORAGE_KEY = 'system-design-copilot-review-queue-v1';

/** Intervals in ms: 1d, 3d, 7d after completion */
export const REVIEW_INTERVALS_MS = [
  24 * 60 * 60 * 1000,
  3 * 24 * 60 * 60 * 1000,
  7 * 24 * 60 * 60 * 1000
];

/**
 * @typedef {{ lessonId: string, completedAt: number, nextReviewAt: number, intervalIndex: number }} ReviewEntry
 */

export function readReviewQueue() {
  if (!browser) return /** @type {ReviewEntry[]} */ ([]);
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/** @param {ReviewEntry[]} entries */
export function writeReviewQueue(entries) {
  if (!browser) return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch {
    // ignore
  }
}

/**
 * @param {string} lessonId
 * @param {ReviewEntry[]} entries
 */
function enqueueLesson(lessonId, entries) {
  if (entries.some((e) => e.lessonId === lessonId)) return entries;
  const completedAt = Date.now();
  return [
    ...entries,
    {
      lessonId,
      completedAt,
      nextReviewAt: completedAt + REVIEW_INTERVALS_MS[0],
      intervalIndex: 0
    }
  ];
}

/**
 * Record completion for spaced review (call when lesson marked complete).
 * @param {string} lessonId
 */
export function scheduleLessonReview(lessonId) {
  const entries = enqueueLesson(lessonId, readReviewQueue());
  writeReviewQueue(entries);
}

/**
 * Advance review interval after a review session.
 * @param {string} lessonId
 */
export function markReviewed(lessonId) {
  const entries = readReviewQueue();
  const next = entries.map((entry) => {
    if (entry.lessonId !== lessonId) return entry;
    const nextIndex = Math.min(entry.intervalIndex + 1, REVIEW_INTERVALS_MS.length - 1);
    return {
      ...entry,
      intervalIndex: nextIndex,
      nextReviewAt: Date.now() + REVIEW_INTERVALS_MS[nextIndex]
    };
  });
  writeReviewQueue(next);
}
