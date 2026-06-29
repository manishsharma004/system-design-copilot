import test from 'node:test';
import assert from 'node:assert/strict';
import { headerNavHref, headerNavItems, isHeaderNavActive } from '../src/lib/navigation.js';

const base = '/system-design-copilot';

test('header navigation exposes the primary learning tracks', () => {
  assert.equal(headerNavItems.length, 6);
  assert.deepEqual(
    headerNavItems.map((item) => item.label),
    [
      'Home',
      'System Design (High Level)',
      'System Design (Low Level)',
      'DSA',
      'AI Engineer',
      'DSA (Practice)'
    ]
  );
});

test('header navigation links resolve to home and flow routes', () => {
  assert.equal(headerNavHref(headerNavItems[0], base), `${base}/`);
  assert.equal(headerNavHref(headerNavItems[1], base), `${base}/flow/high-level-design`);
  assert.equal(headerNavHref(headerNavItems[5], base), `${base}/flow/interview-questions`);
});

test('header navigation highlights home only on the home route', () => {
  const homeHref = `${base}/`;

  assert.equal(
    isHeaderNavActive(headerNavItems[0], {
      pathname: homeHref,
      homeHref,
      activeFlowSlug: null
    }),
    true
  );
  assert.equal(
    isHeaderNavActive(headerNavItems[1], {
      pathname: homeHref,
      homeHref,
      activeFlowSlug: null
    }),
    false
  );
});

test('header navigation highlights the active flow route', () => {
  const homeHref = `${base}/`;

  assert.equal(
    isHeaderNavActive(headerNavItems[2], {
      pathname: `${base}/module/lld-foundations`,
      homeHref,
      activeFlowSlug: 'low-level-design'
    }),
    true
  );
});
