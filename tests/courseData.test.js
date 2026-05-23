
import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { allLessons, modules, siteOverview } from '../courseData.js';

test('site overview describes the expanded curriculum', () => {
  assert.match(siteOverview.title, /System Design Copilot/);
  assert.ok(siteOverview.studyTracks.length >= 3);
  assert.ok(siteOverview.studyLoop.length >= 4);
});

test('curriculum covers a complete prep path', () => {
  assert.ok(modules.length >= 6);
  assert.ok(allLessons.length >= 25);
  const titles = new Set(allLessons.map((lesson) => lesson.title));
  [
    'Problem framing and requirements',
    'Back-of-the-envelope estimation',
    'DNS fundamentals',
    'Load balancing',
    'API design: REST, RPC, and contracts',
    'Relational data modeling and indexing',
    'Caching layers and cache placement',
    'Security foundations for system design',
    'Case study: URL shortener',
    'Case study: distributed web crawler'
  ].forEach((title) => assert.ok(titles.has(title), `missing lesson: ${title}`));
});

test('every lesson has interview scaffolding and local diagrams resolve', () => {
  allLessons.forEach((lesson) => {
    assert.ok(lesson.summary);
    assert.ok(lesson.whyItMatters);
    assert.ok(lesson.sections.length >= 3);
    assert.ok(lesson.checklist.length >= 3);
    assert.ok(lesson.pitfalls.length >= 2);
    assert.ok(lesson.interviewPrompts.length >= 2);
    if (lesson.diagram) {
      assert.equal(lesson.diagram.src.startsWith('/primer-images/'), true);
      const imagePath = `/home/runner/work/system-design-copilot/system-design-copilot/static${lesson.diagram.src}`;
      assert.equal(existsSync(imagePath), true, `missing diagram file for ${lesson.title}`);
    }
  });
});
