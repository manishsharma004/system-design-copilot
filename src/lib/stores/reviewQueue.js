import { derived } from 'svelte/store';
import { browser } from '$app/environment';
import { allLessons } from '$lib/data/courseData';
import { progress } from '$lib/stores/progress';
import { readReviewQueue } from '$lib/stores/reviewQueueStorage';

/** AI lessons get a slight boost in review ordering. */
const AI_FLOW_SLUG = 'ai-engineer';

export { scheduleLessonReview, markReviewed } from '$lib/stores/reviewQueueStorage';

/** Lessons due for review today. Recomputes when progress changes (lesson marked complete). */
export const reviewDueToday = derived(progress, () => {
  if (!browser) return [];
  const now = Date.now();
  const entries = readReviewQueue().filter((e) => e.nextReviewAt <= now);
  const lessonMap = Object.fromEntries(allLessons.map((l) => [l.id, l]));

  return entries
    .map((entry) => {
      const lesson = lessonMap[entry.lessonId];
      if (!lesson) return null;
      return { ...entry, lesson };
    })
    .filter(Boolean)
    .sort((a, b) => {
      const aAi = a.lesson.flowSlug === AI_FLOW_SLUG ? 0 : 1;
      const bAi = b.lesson.flowSlug === AI_FLOW_SLUG ? 0 : 1;
      if (aAi !== bAi) return aAi - bAi;
      return a.nextReviewAt - b.nextReviewAt;
    })
    .slice(0, 5);
});
