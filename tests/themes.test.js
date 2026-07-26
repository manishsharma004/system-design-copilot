import test from 'node:test';
import assert from 'node:assert/strict';
import {
  DEFAULT_THEME_ID,
  getThemeOption,
  getThemesByMode,
  LIGHT_THEME_IDS,
  normalizeThemeId,
  THEME_GROUPS,
  THEME_OPTIONS
} from '../src/lib/themes.js';

test('theme options include dark and light color schemes', () => {
  assert.equal(THEME_OPTIONS.length, 25);
  assert.equal(getThemesByMode('dark').length, 12);
  assert.equal(getThemesByMode('light').length, 13);
  assert.equal(LIGHT_THEME_IDS.length, 13);
  assert.ok(THEME_OPTIONS.some((theme) => theme.id === 'copilot-light'));
  assert.ok(THEME_OPTIONS.some((theme) => theme.id === 'midnight'));
  assert.ok(THEME_OPTIONS.some((theme) => theme.id === 'mint'));
  assert.ok(THEME_OPTIONS.some((theme) => theme.id === 'aurora'));
});

test('theme groups expose only dark and light sections', () => {
  assert.equal(THEME_GROUPS.length, 2);
  assert.equal(THEME_GROUPS[0].id, 'dark');
  assert.equal(THEME_GROUPS[1].id, 'light');
  assert.equal(THEME_GROUPS[0].themes.length, 12);
  assert.equal(THEME_GROUPS[1].themes.length, 13);
});

test('normalizeThemeId falls back to default for unknown values', () => {
  assert.equal(normalizeThemeId('ocean-light'), 'ocean-light');
  assert.equal(normalizeThemeId('invalid'), DEFAULT_THEME_ID);
  assert.equal(normalizeThemeId(null), DEFAULT_THEME_ID);
});

test('getThemeOption returns metadata for each theme', () => {
  const oceanLight = getThemeOption('ocean-light');
  assert.equal(oceanLight.label, 'Ocean');
  assert.equal(oceanLight.mode, 'light');
  assert.equal(getThemeOption('missing').id, DEFAULT_THEME_ID);
});
