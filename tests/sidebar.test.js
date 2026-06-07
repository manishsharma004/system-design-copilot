import test from 'node:test';
import assert from 'node:assert/strict';
import { courseFlows, modules } from '../src/lib/data/courseData.js';
import { getVisibleSidebarModules } from '../src/lib/sidebar.js';

test('sidebar modules are scoped to the selected flow', () => {
  const aiFlow = courseFlows.find((flow) => flow.slug === 'ai-engineer');
  const visibleModules = getVisibleSidebarModules({ modules, activeFlow: aiFlow });

  assert.deepEqual(
    visibleModules.map((module) => module.slug),
    aiFlow.modules.map((module) => module.slug)
  );
  assert.equal(visibleModules.every((module) => module.flowSlug === 'ai-engineer'), true);
});

test('sidebar search stays within the selected flow', () => {
  const dsaFlow = courseFlows.find((flow) => flow.slug === 'data-structures-and-algorithms');
  const visibleModules = getVisibleSidebarModules({ modules, activeFlow: dsaFlow, query: 'google' });

  assert.equal(visibleModules.some((module) => module.flowSlug !== 'data-structures-and-algorithms'), false);
  assert.deepEqual(visibleModules.map((module) => module.slug), ['dsa-company-rounds']);
});
