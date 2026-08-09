/** @typedef {'dark' | 'light'} ThemeMode */
/** @typedef {{ id: string, label: string, swatch: string, themeColor: string, mode: ThemeMode }} ThemeOption */
/** @typedef {{ id: string, label: string, themes: ThemeOption[] }} ThemeGroup */

/** @type {ThemeGroup[]} */
export const THEME_GROUPS = [
  {
    id: 'dark',
    label: 'Dark',
    themes: [
      { id: 'copilot', label: 'Copilot', swatch: '#696cff', themeColor: '#232333', mode: 'dark' },
      { id: 'ocean', label: 'Ocean', swatch: '#22d3ee', themeColor: '#0f172a', mode: 'dark' },
      { id: 'ember', label: 'Ember', swatch: '#f59e0b', themeColor: '#1c1917', mode: 'dark' },
      { id: 'forest', label: 'Forest', swatch: '#34d399', themeColor: '#0f1a14', mode: 'dark' },
      { id: 'midnight', label: 'Midnight', swatch: '#a78bfa', themeColor: '#0c0c12', mode: 'dark' },
      { id: 'rose', label: 'Rose', swatch: '#f472b6', themeColor: '#18101a', mode: 'dark' },
      { id: 'sakura', label: 'Sakura', swatch: '#ff8fab', themeColor: '#1a1218', mode: 'dark' },
      { id: 'lavender', label: 'Lavender', swatch: '#c4b5fd', themeColor: '#15121f', mode: 'dark' },
      { id: 'mauve', label: 'Mauve', swatch: '#e879a8', themeColor: '#1c1619', mode: 'dark' },
      { id: 'slate', label: 'Slate', swatch: '#60a5fa', themeColor: '#111827', mode: 'dark' },
      { id: 'wine', label: 'Wine', swatch: '#fb7185', themeColor: '#1a0f14', mode: 'dark' },
      { id: 'aurora', label: 'Aurora', swatch: '#2dd4bf', themeColor: '#0a1412', mode: 'dark' }
    ]
  },
  {
    id: 'light',
    label: 'Light',
    themes: [
      { id: 'copilot-light', label: 'Copilot', swatch: '#5f61e6', themeColor: '#f3f3f9', mode: 'light' },
      { id: 'ocean-light', label: 'Ocean', swatch: '#0891b2', themeColor: '#f0f9ff', mode: 'light' },
      { id: 'ember-light', label: 'Ember', swatch: '#d97706', themeColor: '#fffbeb', mode: 'light' },
      { id: 'forest-light', label: 'Forest', swatch: '#059669', themeColor: '#ecfdf5', mode: 'light' },
      { id: 'paper', label: 'Paper', swatch: '#4f46e5', themeColor: '#f8fafc', mode: 'light' },
      { id: 'dawn', label: 'Dawn', swatch: '#ea580c', themeColor: '#fff7ed', mode: 'light' },
      { id: 'blush', label: 'Blush', swatch: '#f43f5e', themeColor: '#fff5f7', mode: 'light' },
      { id: 'petal', label: 'Petal', swatch: '#8b5cf6', themeColor: '#faf5ff', mode: 'light' },
      { id: 'ballet', label: 'Ballet', swatch: '#ec4899', themeColor: '#fff1f2', mode: 'light' },
      { id: 'rose-light', label: 'Rose', swatch: '#db2777', themeColor: '#fdf2f8', mode: 'light' },
      { id: 'mint', label: 'Mint', swatch: '#10b981', themeColor: '#ecfdf5', mode: 'light' },
      { id: 'sand', label: 'Sand', swatch: '#d97706', themeColor: '#faf8f5', mode: 'light' },
      { id: 'sky', label: 'Sky', swatch: '#0ea5e9', themeColor: '#f0f9ff', mode: 'light' }
    ]
  }
];

/** @type {ThemeOption[]} */
export const THEME_OPTIONS = THEME_GROUPS.flatMap((group) => group.themes);

/** @type {string[]} */
export const LIGHT_THEME_IDS = THEME_OPTIONS.filter((theme) => theme.mode === 'light').map((theme) => theme.id);
// Keep src/app.html isLightThemeId() in sync when adding light themes (suffix -light or explicit list).

export const DEFAULT_THEME_ID = 'copilot';

/** @param {string | null | undefined} value */
export function normalizeThemeId(value) {
  return THEME_OPTIONS.some((theme) => theme.id === value) ? /** @type {string} */ (value) : DEFAULT_THEME_ID;
}

/** @param {string} themeId */
export function getThemeOption(themeId) {
  return THEME_OPTIONS.find((theme) => theme.id === themeId) ?? THEME_OPTIONS[0];
}

/** @param {ThemeMode} mode */
export function getThemesByMode(mode) {
  return THEME_OPTIONS.filter((theme) => theme.mode === mode);
}

/** @param {string} themeId */
export function isLightTheme(themeId) {
  return getThemeOption(themeId).mode === 'light';
}
