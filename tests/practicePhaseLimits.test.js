import assert from 'node:assert/strict';
import test from 'node:test';

import {
  formatPhaseTargetLabel,
  formatPracticeDuration,
  getPracticePhaseLimitMs,
  PRACTICE_PHASE_LIMITS_MS
} from '../src/lib/practicePhaseLimits.js';

test('practice phase limits map mock interview steps to 25/35/45 minutes', () => {
  assert.equal(PRACTICE_PHASE_LIMITS_MS.opening, 25 * 60 * 1000);
  assert.equal(PRACTICE_PHASE_LIMITS_MS.design, 35 * 60 * 1000);
  assert.equal(PRACTICE_PHASE_LIMITS_MS.tradeoffs, 45 * 60 * 1000);
  assert.equal(getPracticePhaseLimitMs('opening'), 25 * 60 * 1000);
  assert.equal(getPracticePhaseLimitMs('unknown'), null);
});

test('formatPracticeDuration and phase target labels are interview-friendly', () => {
  assert.equal(formatPracticeDuration(125_000), '02:05');
  assert.equal(formatPracticeDuration(3_725_000), '1:02:05');
  assert.equal(formatPhaseTargetLabel(25 * 60 * 1000), '25 min target');
});
