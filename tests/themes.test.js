import test from 'node:test';
import assert from 'node:assert/strict';
import { DEFAULT_THEME_ID, getThemeOption, normalizeThemeId, THEME_OPTIONS } from '../src/lib/themes.js';

test('theme options include four color schemes', () => {
  assert.equal(THEME_OPTIONS.length, 4);
  assert.ok(THEME_OPTIONS.some((theme) => theme.id === 'copilot'));
  assert.ok(THEME_OPTIONS.some((theme) => theme.id === 'ocean'));
  assert.ok(THEME_OPTIONS.some((theme) => theme.id === 'ember'));
  assert.ok(THEME_OPTIONS.some((theme) => theme.id === 'forest'));
});

test('normalizeThemeId falls back to default for unknown values', () => {
  assert.equal(normalizeThemeId('ocean'), 'ocean');
  assert.equal(normalizeThemeId('invalid'), DEFAULT_THEME_ID);
  assert.equal(normalizeThemeId(null), DEFAULT_THEME_ID);
});

test('getThemeOption returns metadata for each theme', () => {
  const ocean = getThemeOption('ocean');
  assert.equal(ocean.label, 'Ocean');
  assert.equal(ocean.swatch, '#22d3ee');
  assert.equal(getThemeOption('missing').id, DEFAULT_THEME_ID);
});
