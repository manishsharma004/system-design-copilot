import { browser } from '$app/environment';
import { writable } from 'svelte/store';
import { DEFAULT_THEME_ID, getThemeOption, normalizeThemeId } from '$lib/themes.js';

const STORAGE_KEY = 'system-design-copilot-theme-v1';

/** @param {string} themeId */
export function applyTheme(themeId) {
  if (!browser) return;

  const normalized = normalizeThemeId(themeId);
  document.documentElement.dataset.theme = normalized;

  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) {
    meta.setAttribute('content', getThemeOption(normalized).themeColor);
  }
}

function readStoredTheme() {
  if (!browser) return DEFAULT_THEME_ID;

  try {
    return normalizeThemeId(window.localStorage.getItem(STORAGE_KEY));
  } catch {
    return DEFAULT_THEME_ID;
  }
}

function createThemeStore() {
  const initial = readStoredTheme();
  const { subscribe, set } = writable(initial);

  if (browser) {
    applyTheme(initial);
  }

  return {
    subscribe,
    /** @param {string} themeId */
    set(themeId) {
      const normalized = normalizeThemeId(themeId);
      set(normalized);
      if (browser) {
        try {
          window.localStorage.setItem(STORAGE_KEY, normalized);
        } catch {
          // ignore storage errors
        }
        applyTheme(normalized);
      }
    },
    reset() {
      this.set(DEFAULT_THEME_ID);
    }
  };
}

export const theme = createThemeStore();
