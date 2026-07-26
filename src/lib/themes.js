/** @typedef {{ id: string, label: string, swatch: string, themeColor: string }} ThemeOption */

/** @type {ThemeOption[]} */
export const THEME_OPTIONS = [
  { id: 'copilot', label: 'Copilot', swatch: '#696cff', themeColor: '#232333' },
  { id: 'ocean', label: 'Ocean', swatch: '#22d3ee', themeColor: '#0f172a' },
  { id: 'ember', label: 'Ember', swatch: '#f59e0b', themeColor: '#1c1917' },
  { id: 'forest', label: 'Forest', swatch: '#34d399', themeColor: '#0f1a14' }
];

export const DEFAULT_THEME_ID = 'copilot';

/** @param {string | null | undefined} value */
export function normalizeThemeId(value) {
  return THEME_OPTIONS.some((theme) => theme.id === value) ? /** @type {string} */ (value) : DEFAULT_THEME_ID;
}

/** @param {string} themeId */
export function getThemeOption(themeId) {
  return THEME_OPTIONS.find((theme) => theme.id === themeId) ?? THEME_OPTIONS[0];
}
