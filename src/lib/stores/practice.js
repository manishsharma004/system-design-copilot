import { browser } from '$app/environment';
import { writable } from 'svelte/store';

const STORAGE_KEY = 'system-design-copilot-practice-v1';
/** @typedef {{ answer: string, savedAt: string }} PracticeEntry */
/** @typedef {Record<string, PracticeEntry>} PracticeState */

function createPracticeStore() {
  /** @type {PracticeState} */
  const initial = {};
  const { subscribe, set, update } = writable(initial);

  if (browser) {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
          set(parsed);
        }
      }
    } catch {
      set(initial);
    }
  }

  /** @param {PracticeState} value */
  const persist = (value) => {
    if (browser) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
    }
    return value;
  };

  return {
    subscribe,
    /**
     * @param {string} entryKey
     * @param {string} answer
     */
    saveAnswer(entryKey, answer) {
      update((state) => persist({
        ...state,
        [entryKey]: {
          answer,
          savedAt: new Date().toISOString()
        }
      }));
    },
    /**
     * @param {string} lessonId
     */
    clearLesson(lessonId) {
      update((state) => {
        const next = Object.fromEntries(
          Object.entries(state).filter(([entryKey]) => !entryKey.startsWith(`${lessonId}/`))
        );
        return persist(next);
      });
    }
  };
}

export const practiceAnswers = createPracticeStore();
