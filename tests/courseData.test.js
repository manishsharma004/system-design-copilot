
import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { allLessons, getLessonPracticeSteps, modules, siteOverview } from '../courseData.js';
import { getInteractiveLesson } from '../src/lib/data/interactiveLessons.js';
import { loadLessonSolution } from '../src/lib/data/solutionLoader.js';

test('site overview describes the expanded curriculum', () => {
  assert.match(siteOverview.title, /System Design Copilot/);
  assert.ok(siteOverview.studyTracks.length >= 4);
  assert.ok(siteOverview.studyLoop.length >= 4);
});

test('curriculum covers a complete prep path', () => {
  assert.ok(modules.length >= 7);
  assert.ok(allLessons.length >= 30);
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
    'Case study: pastebin',
    'Case study: distributed web crawler',
    'Case study: Mint-style budgeting app',
    'Consistent hashing and hot-key management',
    'Consensus, quorums, and leader election',
    'Distributed transactions, sagas, and idempotent workflows',
    'Probabilistic data structures and cardinality estimation',
    'Batch processing, stream processing, and MapReduce',
    'Case study: Twitter timeline and search',
    'Case study: sales rank by category'
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


test('every lesson exposes a saveable three-step practice flow', () => {
  allLessons.forEach((lesson) => {
    const steps = getLessonPracticeSteps(lesson);
    assert.equal(steps.length, 3);
    steps.forEach((step) => {
      assert.ok(step.id);
      assert.ok(step.kind);
      assert.ok(step.title);
      assert.ok(step.objective);
      assert.ok(step.prompt);
      assert.ok(Array.isArray(step.guardrails));
      assert.ok(step.guardrails.length >= 3);
      assert.ok(Array.isArray(step.structure));
      assert.ok(step.structure.length >= 3);
      assert.match(step.template, /## /);
    });
  });
});

test('case studies include revealable solutions and code', async () => {
  const caseStudies = allLessons.filter((lesson) => lesson.moduleSlug === 'case-studies');
  assert.equal(caseStudies.length, 9);
  for (const lesson of caseStudies) {
    const solution = await loadLessonSolution(lesson.id);
    assert.ok(solution?.referenceSource?.url);
    assert.ok(solution?.solutionOverview?.summary);
    assert.ok(solution?.solutionOverview?.requirements?.length >= 3);
    assert.ok(solution?.detailedSolution?.length >= 3);
    assert.ok(solution?.sampleAnswer?.length >= 3);
    assert.ok(solution?.interviewCode?.length >= 1);
    solution.interviewCode.forEach((/** @type {{ title: string, filename: string, language: string, code: string }} */ snippet) => {
      assert.ok(snippet.title);
      assert.ok(snippet.filename);
      assert.ok(snippet.language);
      assert.match(snippet.code, /class|function|type|interface/);
    });
  }
});


test('interactive lesson labs cover key topic and case-study deep dives', () => {
  [
    'data-storage/relational-data-modeling',
    'data-storage/nosql-landscape',
    'data-storage/storage-selection',
    'case-studies/url-shortener',
    'case-studies/scaling-playbook'
  ].forEach((lessonId) => {
    const interactive = getInteractiveLesson(lessonId);
    assert.ok(interactive, `missing interactive lesson data for ${lessonId}`);
    assert.ok(interactive.takeaways.length >= 3);
    assert.ok(interactive.examples.length >= 2);
    assert.ok(interactive.decisionGuide.options.length >= 3);
    assert.ok(interactive.caseStudy.steps.length >= 3);
    assert.ok(interactive.caseStudy.metrics.length >= 3);
    assert.match(interactive.mermaid.code, /flowchart|graph/);
  });
});
