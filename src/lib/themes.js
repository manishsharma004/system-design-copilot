/** @typedef {'dark' | 'light'} ThemeMode */
/** @typedef {{ id: string, label: string, swatch: string, themeColor: string, mode: ThemeMode }} ThemeOption */
/** @typedef {{ id: ThemeMode, label: string, themes: ThemeOption[] }} ThemeGroup */

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
      { id: 'rose', label: 'Rose', swatch: '#f472b6', themeColor: '#18101a', mode: 'dark' }
    ]
  },
  {
    id: 'light',
    label: 'Light',
    themes: [
      { id: 'copilot-light', label: 'Copilot Light', swatch: '#5f61e6', themeColor: '#f3f3f9', mode: 'light' },
      { id: 'ocean-light', label: 'Ocean Light', swatch: '#0891b2', themeColor: '#f0f9ff', mode: 'light' },
      { id: 'ember-light', label: 'Ember Light', swatch: '#d97706', themeColor: '#fffbeb', mode: 'light' },
      { id: 'forest-light', label: 'Forest Light', swatch: '#059669', themeColor: '#ecfdf5', mode: 'light' },
      { id: 'paper', label: 'Paper', swatch: '#4f46e5', themeColor: '#f8fafc', mode: 'light' },
      { id: 'dawn', label: 'Dawn', swatch: '#ea580c', themeColor: '#fff7ed', mode: 'light' }
    ]
  }
];

/** @type {ThemeOption[]} */
export const THEME_OPTIONS = THEME_GROUPS.flatMap((group) => group.themes);

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
