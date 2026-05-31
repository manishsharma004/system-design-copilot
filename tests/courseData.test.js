
import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { allLessons, courseFlows, getFlowBySlug, getLessonPracticeSteps, getModulesByFlow, modules, siteOverview } from '../courseData.js';
import { getInteractiveLesson } from '../src/lib/data/interactiveLessons.js';
import { loadLessonSolution } from '../src/lib/data/solutionLoader.js';

const repoRoot = path.dirname(fileURLToPath(new URL('../package.json', import.meta.url)));

test('site overview describes the expanded curriculum', () => {
  assert.match(siteOverview.title, /System Design Copilot/);
  assert.ok(siteOverview.heroGuidance);
  assert.ok(siteOverview.studyTracks.length >= 4);
  assert.ok(siteOverview.studyLoop.length >= 4);
  assert.ok(siteOverview.studyMapSections.length >= 3);
  assert.ok(siteOverview.recommendedReading.length >= 3);
  siteOverview.studyTracks.forEach((track) => {
    assert.ok(track.bestFor);
    assert.ok(track.cadence);
    assert.ok(track.outcome);
    assert.ok(track.steps.length >= 4);
    track.steps.forEach((step) => {
      assert.ok(step.title);
      assert.ok(step.detail);
    });
  });
  siteOverview.studyLoop.forEach((step) => {
    assert.ok(step.title);
    assert.ok(step.summary);
    assert.ok(step.coachNote);
  });
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

test('course flows separate high-level, low-level, DSA, and AI engineer prep', () => {
  assert.equal(courseFlows.length, 4);

  const highLevelFlow = getFlowBySlug('high-level-design');
  const lowLevelFlow = getFlowBySlug('low-level-design');
  const dsaFlow = getFlowBySlug('data-structures-and-algorithms');
  const aiFlow = getFlowBySlug('ai-engineer');

  assert.ok(highLevelFlow);
  assert.ok(lowLevelFlow);
  assert.ok(dsaFlow);
  assert.ok(aiFlow);
  assert.match(highLevelFlow.title, /High-level design/i);
  assert.match(lowLevelFlow.title, /Low-level design/i);
  assert.match(dsaFlow.title, /data structures and algorithms/i);
  assert.match(aiFlow.title, /AI Engineer/i);
  assert.ok(highLevelFlow.modules.length >= 7);
  assert.ok(lowLevelFlow.modules.length >= 4);
  assert.ok(dsaFlow.modules.length >= 4);
  assert.ok(aiFlow.modules.length >= 5);
  assert.equal(getModulesByFlow('high-level-design').every((module) => module.flowSlug === 'high-level-design'), true);
  assert.equal(getModulesByFlow('low-level-design').every((module) => module.flowSlug === 'low-level-design'), true);
  assert.equal(getModulesByFlow('data-structures-and-algorithms').every((module) => module.flowSlug === 'data-structures-and-algorithms'), true);
  assert.equal(getModulesByFlow('ai-engineer').every((module) => module.flowSlug === 'ai-engineer'), true);

  const lowLevelLessonTitles = new Set(getModulesByFlow('low-level-design').flatMap((module) => module.lessons.map((lesson) => lesson.title)));
  [
    'LLD prompt framing and scope control',
    'Entities, value objects, and aggregates',
    'Strategy, factory, and builder patterns in interviews',
    'Concurrency follow-ups and bridging into scale'
  ].forEach((title) => assert.ok(lowLevelLessonTitles.has(title), `missing LLD lesson: ${title}`));

  const dsaLessonTitles = new Set(getModulesByFlow('data-structures-and-algorithms').flatMap((module) => module.lessons.map((lesson) => lesson.title)));
  [
    'Arrays, hash maps, and two pointers',
    'Recursion, backtracking, and search trees',
    'Google phone and onsite practice set',
    'Hard stretch round and review'
  ].forEach((title) => assert.ok(dsaLessonTitles.has(title), `missing DSA lesson: ${title}`));
});

test('DSA lessons expose coding-practice metadata for the local WASM runner', () => {
  const dsaLessons = getModulesByFlow('data-structures-and-algorithms').flatMap((module) => module.lessons);

  dsaLessons.forEach((lesson) => {
    assert.equal(lesson.practiceMode, 'coding');
    assert.equal(lesson.runtimeTarget, 'browser-wasm');
    assert.ok(lesson.questionHighlights.length >= 1, `missing DSA practice questions for ${lesson.title}`);
    assert.ok(lesson.questionHighlights.some((question) => question.supportsLocalWasmRun), `missing runnable DSA question for ${lesson.title}`);

    lesson.questionHighlights.forEach((question) => {
      assert.ok(question.practiceMeta?.name, `missing practice metadata for ${question.title}`);
      assert.ok(question.languageTemplates?.python3?.defaultCode, `missing Python template for ${question.title}`);
      assert.ok(Array.isArray(question.practiceCases), `missing practice cases for ${question.title}`);
    });
  });
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
      const imagePath = path.join(repoRoot, 'static', lesson.diagram.src.replace(/^\//, ''));
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

test('AI engineer lessons include hands-on exercises', () => {
  const aiLessons = getModulesByFlow('ai-engineer').flatMap((module) => module.lessons);
  assert.ok(aiLessons.length >= 20);

  aiLessons.forEach((lesson) => {
    assert.ok(Array.isArray(lesson.exercises), `missing exercises for ${lesson.title}`);
    assert.ok(lesson.exercises.length >= 1, `empty exercises for ${lesson.title}`);

    lesson.exercises.forEach((exercise) => {
      assert.ok(exercise.id, `missing exercise id in ${lesson.title}`);
      assert.ok(exercise.title, `missing exercise title in ${lesson.title}`);
      assert.ok(exercise.difficulty, `missing exercise difficulty in ${lesson.title}`);
      assert.ok(exercise.type, `missing exercise type in ${lesson.title}`);
      assert.ok(['coding', 'design'].includes(exercise.type), `invalid exercise type: ${exercise.type}`);
      assert.ok(exercise.description, `missing exercise description in ${lesson.title}`);

      if (exercise.type === 'coding') {
        assert.ok(exercise.starterCode, `missing starterCode for coding exercise ${exercise.id}`);
        assert.ok(exercise.solution, `missing solution for coding exercise ${exercise.id}`);
        assert.ok(Array.isArray(exercise.hints), `missing hints for ${exercise.id}`);
      }
      if (exercise.type === 'design') {
        assert.ok(Array.isArray(exercise.promptQuestions), `missing promptQuestions for design exercise ${exercise.id}`);
        assert.ok(exercise.promptQuestions.length >= 3, `too few promptQuestions for ${exercise.id}`);
      }
    });
  });
});

test('AI engineer practice steps use ML-specific structure', () => {
  const aiLessons = getModulesByFlow('ai-engineer').flatMap((module) => module.lessons);
  const firstLesson = aiLessons[0];
  const steps = getLessonPracticeSteps(firstLesson);

  assert.equal(steps.length, 3);
  assert.equal(steps[0].id, 'opening');
  assert.equal(steps[1].id, 'design');
  assert.equal(steps[2].id, 'tradeoffs');

  // AI-specific structure elements
  assert.ok(steps[0].structure.includes('Core intuition'));
  assert.ok(steps[1].structure.includes('Architecture or pipeline'));
  assert.ok(steps[2].structure.includes('Metrics and evaluation'));

  // AI-specific titles
  assert.match(steps[1].title, /Implementation deep dive/);
  assert.match(steps[2].title, /Evaluation and production review/);
});

test('AI engineer interactive lessons cover every AI module', () => {
  [
    'ml-foundations/model-evaluation',
    'deep-learning/neural-network-fundamentals',
    'llms-and-nlp/llm-fundamentals',
    'prompt-engineering-and-rag/rag-systems',
    'ai-agents/agent-fundamentals',
    'mlops-and-deployment/model-serving',
    'ai-safety-and-ethics/bias-and-fairness',
    'data-engineering-for-ml/data-pipelines-at-scale'
  ].forEach((lessonId) => {
    const interactive = getInteractiveLesson(lessonId);
    assert.ok(interactive, `missing AI interactive lesson for ${lessonId}`);
    assert.ok(interactive.takeaways.length >= 3);
    assert.ok(interactive.examples.length >= 2);
    assert.ok(interactive.decisionGuide.options.length >= 3);
    assert.ok(interactive.caseStudy.steps.length >= 3);
    assert.ok(interactive.caseStudy.metrics.length >= 3);
    assert.match(interactive.mermaid.code, /flowchart|graph/);
  });
});
