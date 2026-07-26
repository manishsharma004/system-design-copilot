import test from 'node:test';
import assert from 'node:assert/strict';
import {
  DEFAULT_THEME_ID,
  getThemeOption,
  getThemesByMode,
  normalizeThemeId,
  THEME_GROUPS,
  THEME_OPTIONS
} from '../src/lib/themes.js';

test('theme options include dark and light color schemes', () => {
  assert.equal(THEME_OPTIONS.length, 19);
  assert.equal(getThemesByMode('dark').length, 9);
  assert.equal(getThemesByMode('light').length, 10);
  assert.ok(THEME_OPTIONS.some((theme) => theme.id === 'copilot-light'));
  assert.ok(THEME_OPTIONS.some((theme) => theme.id === 'midnight'));
  assert.ok(THEME_OPTIONS.some((theme) => theme.id === 'paper'));
  assert.ok(THEME_OPTIONS.some((theme) => theme.id === 'blush'));
  assert.ok(THEME_OPTIONS.some((theme) => theme.id === 'sakura'));
});

test('theme groups expose dark, light, and bloom sections', () => {
  assert.equal(THEME_GROUPS.length, 3);
  assert.equal(THEME_GROUPS[0].id, 'dark');
  assert.equal(THEME_GROUPS[1].id, 'light');
  assert.equal(THEME_GROUPS[2].id, 'bloom');
  assert.equal(THEME_GROUPS[2].themes.length, 7);
});

test('normalizeThemeId falls back to default for unknown values', () => {
  assert.equal(normalizeThemeId('ocean-light'), 'ocean-light');
  assert.equal(normalizeThemeId('invalid'), DEFAULT_THEME_ID);
  assert.equal(normalizeThemeId(null), DEFAULT_THEME_ID);
});

test('getThemeOption returns metadata for each theme', () => {
  const oceanLight = getThemeOption('ocean-light');
  assert.equal(oceanLight.label, 'Ocean Light');
  assert.equal(oceanLight.mode, 'light');
  assert.equal(getThemeOption('missing').id, DEFAULT_THEME_ID);
});
