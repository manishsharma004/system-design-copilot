import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeMonacoHexColor } from '../src/lib/editor/monacoColors.js';

test('normalizeMonacoHexColor expands 3-digit hex from CSS minifiers', () => {
  assert.equal(normalizeMonacoHexColor('#ccc'), '#cccccc');
  assert.equal(normalizeMonacoHexColor('#fff'), '#ffffff');
  assert.equal(normalizeMonacoHexColor('abc'), '#aabbcc');
});

test('normalizeMonacoHexColor keeps 6/8-digit hex', () => {
  assert.equal(normalizeMonacoHexColor('#cccccc'), '#cccccc');
  assert.equal(normalizeMonacoHexColor('#E6EDF7'), '#e6edf7');
  assert.equal(normalizeMonacoHexColor('#00000000'), '#00000000');
});

test('normalizeMonacoHexColor expands 4-digit hex with alpha', () => {
  assert.equal(normalizeMonacoHexColor('#abcd'), '#aabbccdd');
});

test('normalizeMonacoHexColor converts rgb/rgba', () => {
  assert.equal(normalizeMonacoHexColor('rgb(204, 204, 204)'), '#cccccc');
  assert.equal(normalizeMonacoHexColor('rgba(255, 255, 255, 0.5)'), '#ffffff80');
});

test('normalizeMonacoHexColor falls back for invalid values', () => {
  assert.equal(normalizeMonacoHexColor(''), '#000000');
  assert.equal(normalizeMonacoHexColor('nope', '#1e293b'), '#1e293b');
});
