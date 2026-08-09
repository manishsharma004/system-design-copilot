import { writable } from 'svelte/store';
import { browser } from '$app/environment';
import { DEFAULT_AI_STUDY_PATH_ID } from '$lib/data/aiStudyPaths';

const STORAGE_KEY = 'system-design-copilot-ai-study-path-v1';

function readStoredPath() {
  if (!browser) return DEFAULT_AI_STUDY_PATH_ID;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === 'app-builder' || raw === 'ml-engineer' || raw === 'platform') {
      return raw;
    }
  } catch {
    // ignore
  }
  return DEFAULT_AI_STUDY_PATH_ID;
}

function createAiStudyPathStore() {
  const { subscribe, set, update } = writable(readStoredPath());

  return {
    subscribe,
    /** @param {string} pathId */
    select(pathId) {
      if (pathId !== 'app-builder' && pathId !== 'ml-engineer' && pathId !== 'platform') return;
      set(pathId);
      if (browser) {
        try {
          localStorage.setItem(STORAGE_KEY, pathId);
        } catch {
          // ignore
        }
      }
    }
  };
}

export const aiStudyPath = createAiStudyPathStore();
