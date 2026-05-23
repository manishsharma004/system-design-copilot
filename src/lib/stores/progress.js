
import { browser } from '$app/environment';
import { derived, writable } from 'svelte/store';

const STORAGE_KEY = 'system-design-copilot-progress-v4';
/** @typedef {{ completedLessonIds: string[] }} ProgressState */

function createProgressStore() {
  /** @type {ProgressState} */
  const initial = { completedLessonIds: [] };
  const { subscribe, set, update } = writable(initial);

  if (browser) {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        set({ completedLessonIds: Array.isArray(parsed.completedLessonIds) ? parsed.completedLessonIds : [] });
      }
    } catch {
      set(initial);
    }
  }

  return {
    subscribe,
    /**
     * @param {string} lessonId
     */
    toggleLesson(lessonId) {
      /** @param {ProgressState} state */
      update((state) => {
        const next = state.completedLessonIds.includes(lessonId)
          ? state.completedLessonIds.filter((id) => id !== lessonId)
          : [...state.completedLessonIds, lessonId];
        /** @type {ProgressState} */
        const value = { completedLessonIds: next };
        if (browser) {
          window.localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
        }
        return value;
      });
    },
    reset() {
      set(initial);
      if (browser) {
        window.localStorage.removeItem(STORAGE_KEY);
      }
    }
  };
}

export const progress = createProgressStore();
export const completedLessonCount = derived(progress, ($progress) => $progress.completedLessonIds.length);
