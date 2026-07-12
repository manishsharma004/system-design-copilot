import test from 'node:test';
import assert from 'node:assert/strict';
import { getTrackNavItems, headerNavHref, headerNavItems, isHeaderNavActive } from '../src/lib/navigation.js';

const base = '/system-design-copilot';

test('header navigation exposes the primary learning tracks', () => {
  assert.equal(headerNavItems.length, 6);
  assert.deepEqual(
    headerNavItems.map((item) => item.label),
    ['Home', 'System Design', 'Low Level', 'DSA', 'AI', 'Practice']
  );
  assert.deepEqual(
    headerNavItems.map((item) => item.flowSlug),
    [
      null,
      'high-level-design',
      'low-level-design',
      'data-structures-and-algorithms',
      'ai-engineer',
      'interview-questions'
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

test('track nav items derive from course flows with progress', () => {
  const flows = [
    {
      slug: 'high-level-design',
      title: 'High-level design interview prep',
      shortTitle: 'HLD',
      modules: [{ lessons: [{}, {}, {}] }]
    },
    {
      slug: 'low-level-design',
      title: 'Low-level design interview prep',
      shortTitle: 'LLD',
      modules: [{ lessons: [{}, {}] }]
    }
  ];

  const tracks = getTrackNavItems(flows, base, {
    'high-level-design': { completed: 1, total: 3 }
  });

  assert.equal(tracks.length, 2);
  assert.deepEqual(tracks[0], {
    slug: 'high-level-design',
    title: 'High-level design interview prep',
    shortTitle: 'HLD',
    href: `${base}/flow/high-level-design`,
    completed: 1,
    total: 3
  });
  assert.equal(tracks[1].completed, 0);
  assert.equal(tracks[1].total, 2);
  assert.equal(tracks[1].href, `${base}/flow/low-level-design`);
});
