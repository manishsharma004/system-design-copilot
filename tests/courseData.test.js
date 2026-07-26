
import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { allLessons, courseFlows, getFlowBySlug, getLessonBySlug, getLessonPracticeSteps, getModulesByFlow, modules, siteOverview } from '../courseData.js';
import { getInteractiveLesson } from '../src/lib/data/interactiveLessons.js';
import { buildLessonAnswerContext, getLikelyAnswerPoints } from '../src/lib/interviewAnswers.js';
import { loadLessonSolution } from '../src/lib/data/solutionLoader.js';

const repoRoot = path.dirname(fileURLToPath(new URL('../package.json', import.meta.url)));

test('site overview describes the expanded curriculum', () => {
  assert.match(siteOverview.title, /System Design Copilot/);
  assert.ok(siteOverview.heroGuidance);
  assert.ok(siteOverview.learningPaths?.length >= 4);
  assert.ok(siteOverview.studyTracks.length >= 4);
  assert.ok(siteOverview.studyLoop.length >= 4);
  assert.ok(siteOverview.studyMapSections.length >= 3);
  assert.ok(siteOverview.recommendedReading.length >= 3);
  siteOverview.learningPaths.forEach((path) => {
    assert.ok(path.title);
    assert.ok(path.flowSlug);
    assert.ok(path.summary);
    assert.ok(path.startModule);
    assert.ok(path.focus.length >= 2);
  });
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

test('course flows separate high-level, low-level, DSA, AI engineer, and question bank prep', () => {
  assert.equal(courseFlows.length, 5);

  const highLevelFlow = getFlowBySlug('high-level-design');
  const lowLevelFlow = getFlowBySlug('low-level-design');
  const dsaFlow = getFlowBySlug('data-structures-and-algorithms');
  const aiFlow = getFlowBySlug('ai-engineer');
  const questionBankFlow = getFlowBySlug('interview-questions');

  assert.ok(highLevelFlow);
  assert.ok(lowLevelFlow);
  assert.ok(dsaFlow);
  assert.ok(aiFlow);
  assert.ok(questionBankFlow);
  assert.match(highLevelFlow.title, /High-level design/i);
  assert.match(lowLevelFlow.title, /Low-level design/i);
  assert.match(dsaFlow.title, /data structures and algorithms/i);
  assert.match(aiFlow.title, /AI Engineer/i);
  assert.match(questionBankFlow.title, /question bank/i);
  assert.ok(highLevelFlow.modules.length >= 14);
  assert.ok(lowLevelFlow.modules.length >= 6);
  assert.ok(dsaFlow.modules.length >= 6);
  assert.ok(aiFlow.modules.length >= 10);
  assert.ok(questionBankFlow.modules.length >= 4);
  assert.equal(getModulesByFlow('high-level-design').every((module) => module.flowSlug === 'high-level-design'), true);
  assert.equal(getModulesByFlow('low-level-design').every((module) => module.flowSlug === 'low-level-design'), true);
  assert.equal(getModulesByFlow('data-structures-and-algorithms').every((module) => module.flowSlug === 'data-structures-and-algorithms'), true);
  assert.equal(getModulesByFlow('ai-engineer').every((module) => module.flowSlug === 'ai-engineer'), true);
  assert.equal(getModulesByFlow('interview-questions').every((module) => module.flowSlug === 'interview-questions'), true);

  const questionBankLessonTitles = new Set(getModulesByFlow('interview-questions').flatMap((module) => module.lessons.map((lesson) => lesson.title)));
  [
    'Top interview questions · Easy',
    'Google question bank',
    'Amazon question bank',
    'Coding interview strategy'
  ].forEach((title) => assert.ok(questionBankLessonTitles.has(title), `missing question bank lesson: ${title}`));

  const lowLevelLessonTitles = new Set(getModulesByFlow('low-level-design').flatMap((module) => module.lessons.map((lesson) => lesson.title)));
  [
    'LLD prompt framing and scope control',
    'Entities, value objects, and aggregates',
    'Strategy, factory, and builder patterns in interviews',
    'Concurrency follow-ups and bridging into scale',
    'Creational patterns in practice',
    'Parking lot design lab'
  ].forEach((title) => assert.ok(lowLevelLessonTitles.has(title), `missing LLD lesson: ${title}`));

  const dsaLessonTitles = new Set(getModulesByFlow('data-structures-and-algorithms').flatMap((module) => module.lessons.map((lesson) => lesson.title)));
  [
    'Arrays, hash maps, and two pointers',
    'Recursion, backtracking, and search trees',
    'Google phone and onsite practice set',
    'Hard stretch round and review',
    'Complexity and algorithmic thinking',
    'Dynamic programming cookbook'
  ].forEach((title) => assert.ok(dsaLessonTitles.has(title), `missing DSA lesson: ${title}`));

  const hldLessonTitles = new Set(getModulesByFlow('high-level-design').flatMap((module) => module.lessons.map((lesson) => lesson.title)));
  [
    'Request lifecycle deep dive',
    'SLIs, SLOs, and error budgets',
    'Failure injection and incidents',
    'Indexing and query path design',
    'Replication, sharding, and consistency',
    'Polyglot storage selection',
    'Auth and threat modeling for HLD',
    'Encryption, secrets, and tenancy',
    'Safe change, DR, and degradation',
    'Partitioning and hot-key control',
    'Consensus, quorums, and leadership',
    'Sagas, idempotency, and workflows'
  ].forEach((title) => assert.ok(hldLessonTitles.has(title), `missing HLD learning lesson: ${title}`));

  const aiLessonTitles = new Set(getModulesByFlow('ai-engineer').flatMap((module) => module.lessons.map((lesson) => lesson.title)));
  [
    'Feature engineering playground',
    'Perceptron and MLP with NumPy',
    'Backpropagation by hand',
    'CNN building blocks with NumPy',
    'Scaled dot-product attention from scratch',
    'Tokenization workshop',
    'Drift and monitoring lab',
    'LLM evaluation harnesses that catch regressions',
    'Shipping gates, guardrails, and incident response'
  ].forEach((title) => assert.ok(aiLessonTitles.has(title), `missing AI learning lesson: ${title}`));
});

test('DSA learning expansion lessons expose coding and design exercises', () => {
  const dsaExpansionLessons = getModulesByFlow('data-structures-and-algorithms')
    .flatMap((module) => module.lessons)
    .filter((lesson) =>
      ['dsa-concepts-lab', 'dsa-algorithms-lab', 'dsa-patterns-lab', 'dsa-search-lab', 'dsa-interview-essentials-lab'].includes(lesson.moduleSlug)
    );

  assert.equal(dsaExpansionLessons.length, 15);
  dsaExpansionLessons.forEach((lesson) => {
    const codingExercises = (lesson.exercises ?? []).filter((exercise) => exercise.type === 'coding');
    const designExercises = (lesson.exercises ?? []).filter((exercise) => exercise.type === 'design');
    assert.ok(codingExercises.length >= 2, `missing coding exercises for ${lesson.id}`);
    assert.ok(designExercises.length >= 1, `missing design exercise for ${lesson.id}`);
    codingExercises.forEach((exercise) => {
      assert.ok(exercise.id);
      assert.ok(exercise.starterCode?.includes('TODO') || exercise.starterCode?.length > 40);
      assert.ok(exercise.solution?.length > 40);
      assert.ok(Array.isArray(exercise.hints));
    });
  });
});

test('DSA practice lessons bridge back to study labs', () => {
  const practiceLessons = getModulesByFlow('data-structures-and-algorithms')
    .flatMap((module) => module.lessons)
    .filter((lesson) =>
      ['dsa-foundations', 'dsa-core-patterns'].includes(lesson.moduleSlug)
    );

  assert.equal(practiceLessons.length, 6);
  practiceLessons.forEach((lesson) => {
    assert.ok(lesson.sections.some((section) => section.heading === 'Study bridge'), `missing study bridge for ${lesson.id}`);
    assert.ok((lesson.related ?? []).length >= 1, `missing related study labs for ${lesson.id}`);
    assert.ok(lesson.sections.length >= 4, `practice lesson still too thin: ${lesson.id}`);
  });
});

test('AI learning expansion lessons expose runnable coding exercises', () => {
  const expansionModuleSlugs = [
    'ml-interactive-lab',
    'deep-learning-from-scratch',
    'transformers-attention-lab',
    'llm-retrieval-lab',
    'ml-production-lab',
    'llmops-eval-lab'
  ];
  const interactiveLessons = getModulesByFlow('ai-engineer')
    .flatMap((module) => module.lessons)
    .filter((lesson) => expansionModuleSlugs.includes(lesson.moduleSlug));

  assert.equal(interactiveLessons.length, 18);
  interactiveLessons.forEach((lesson) => {
    const codingExercises = (lesson.exercises ?? []).filter((exercise) => exercise.type === 'coding');
    assert.ok(codingExercises.length >= 2, `missing coding exercises for ${lesson.id}`);
    codingExercises.forEach((exercise) => {
      assert.ok(exercise.id);
      assert.ok(exercise.starterCode?.includes('TODO') || exercise.starterCode?.length > 40);
      assert.ok(exercise.solution?.length > 40);
      assert.ok(Array.isArray(exercise.hints));
      assert.doesNotMatch(
        `${exercise.starterCode}\n${exercise.solution}`,
        /(?:import|from)\s+(torch|tiktoken|transformers|openai)\b/i,
        `non-Pyodide import in ${exercise.id}`
      );
    });
  });
});

test('AI core lessons are exhaustive and Pyodide-safe', () => {
  const coreModuleSlugs = new Set([
    'ml-foundations',
    'deep-learning',
    'llms-and-nlp',
    'prompt-engineering-and-rag',
    'ai-agents',
    'mlops-and-deployment',
    'ai-safety-and-ethics',
    'data-engineering-for-ml'
  ]);
  const coreLessons = getModulesByFlow('ai-engineer')
    .flatMap((module) => module.lessons)
    .filter((lesson) => coreModuleSlugs.has(lesson.moduleSlug));

  assert.equal(coreLessons.length, 23);
  coreLessons.forEach((lesson) => {
    assert.ok(lesson.sections.length >= 5, `too few sections for ${lesson.id}`);
    const bodyChars = lesson.sections.reduce((sum, section) => sum + (section.body?.length ?? 0), 0);
    assert.ok(bodyChars >= 2500, `thin lesson body for ${lesson.id}`);
    assert.ok(lesson.sections.filter((section) => section.codeExample).length >= 2, `missing code examples for ${lesson.id}`);
    const codingExercises = (lesson.exercises ?? []).filter((exercise) => exercise.type === 'coding');
    assert.ok(codingExercises.length >= 2, `missing coding exercises for ${lesson.id}`);
    codingExercises.forEach((exercise) => {
      assert.ok(exercise.starterCode?.includes('TODO') || exercise.starterCode?.length > 40);
      assert.ok(exercise.solution?.length > 40);
      assert.ok(Array.isArray(exercise.hints));
      assert.doesNotMatch(
        `${exercise.starterCode}\n${exercise.solution}`,
        /(?:import|from)\s+(torch|tiktoken|transformers|openai)\b/i,
        `non-Pyodide import in ${exercise.id}`
      );
    });
  });
});

test('learning expansion lessons ship on-page teaching material, exercises, and topic labs', async () => {
  const { getInteractiveLesson } = await import('../src/lib/data/interactiveLessons.js');
  const expansionModuleSlugs = new Set([
    'systems-fundamentals-lab',
    'reliability-observability-lab',
    'data-storage-lab',
    'security-operations-lab',
    'distributed-systems-lab',
    'lld-design-patterns-lab',
    'lld-project-labs',
    'dsa-concepts-lab',
    'dsa-algorithms-lab',
    'dsa-patterns-lab',
    'dsa-search-lab',
    'dsa-interview-essentials-lab',
    'ml-interactive-lab',
    'deep-learning-from-scratch',
    'transformers-attention-lab',
    'llm-retrieval-lab',
    'ml-production-lab',
    'llmops-eval-lab'
  ]);
  const expansionLessons = allLessons.filter((lesson) => expansionModuleSlugs.has(lesson.moduleSlug));
  assert.equal(expansionLessons.length, 54);

  expansionLessons.forEach((lesson) => {
    assert.ok(lesson.sections.length >= 5, `too few sections for ${lesson.id}`);
    const bodyChars = lesson.sections.reduce((sum, section) => sum + (section.body?.length ?? 0), 0);
    assert.ok(bodyChars >= 2500, `thin lesson body for ${lesson.id}`);
    assert.ok(lesson.sections.filter((section) => section.codeExample).length >= 2, `missing code examples for ${lesson.id}`);
    assert.ok((lesson.exercises ?? []).length >= 2, `missing exercises for ${lesson.id}`);

    const interactive = getInteractiveLesson(lesson.id);
    assert.ok(interactive, `missing interactive lab for ${lesson.id}`);
    assert.ok(interactive.examples?.length >= 2, `missing interactive examples for ${lesson.id}`);
    assert.ok(interactive.decisionGuide?.options?.length >= 2, `missing decision guide for ${lesson.id}`);
    assert.ok(interactive.caseStudy?.steps?.length >= 4, `missing case study for ${lesson.id}`);
    assert.ok(interactive.mermaid?.code, `missing mermaid diagram for ${lesson.id}`);
  });
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

test('question bank lessons reference a loadable dataset descriptor', () => {
  const knownBankKeys = new Set([
    'top-interview-questions-easy',
    'top-interview-questions-medium',
    'top-interview-questions-hard',
    'google',
    'amazon',
    'facebook',
    'apple',
    'microsoft',
    'adobe',
    'bloomberg',
    'linkedin',
    'uber',
    'yelp',
    'coding-interview-strategy',
    'leapai'
  ]);

  const bankLessons = getModulesByFlow('interview-questions').flatMap((module) => module.lessons);
  assert.ok(bankLessons.length >= 13);

  bankLessons.forEach((lesson) => {
    assert.equal(lesson.practiceMode, 'question-bank');
    assert.ok(lesson.questionBank, `missing questionBank descriptor for ${lesson.title}`);
    assert.ok(lesson.questionBank.label, `missing questionBank label for ${lesson.title}`);
    assert.ok(knownBankKeys.has(lesson.questionBank.key), `unknown questionBank key for ${lesson.title}: ${lesson.questionBank.key}`);
    assert.ok(['company', 'category', 'strategy'].includes(lesson.questionBank.kind), `invalid questionBank kind for ${lesson.title}`);
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

test('every lesson includes deeper knowledge and external references', async () => {
  const { getLessonDeepKnowledge, lessonDeepKnowledgeIndex } = await import('../src/lib/data/lessonDeepKnowledge.js');

  assert.equal(Object.keys(lessonDeepKnowledgeIndex).length, allLessons.length);

  allLessons.forEach((lesson) => {
    const deepKnowledge = getLessonDeepKnowledge(lesson.id);
    assert.ok(deepKnowledge, `missing deep knowledge for ${lesson.id}`);
    assert.ok(deepKnowledge.insights.length >= 2, `too few insights for ${lesson.id}`);
    assert.ok(deepKnowledge.references.length >= 2, `too few references for ${lesson.id}`);

    deepKnowledge.insights.forEach((insight) => {
      assert.ok(insight.heading);
      assert.ok(insight.body);
    });

    deepKnowledge.references.forEach((reference) => {
      assert.ok(reference.title);
      assert.ok(reference.url.startsWith('https://'), `invalid reference URL for ${lesson.id}: ${reference.url}`);
      assert.ok(reference.source);
      assert.ok(reference.note);
    });
  });
});

test('curated likely-answer points are included in lesson answer context', () => {
  const dnsLesson = allLessons.find((lesson) => lesson.id === 'edge-and-routing/dns');
  assert.ok(dnsLesson?.likelyAnswerPoints?.length >= 3);

  const context = buildLessonAnswerContext(dnsLesson);
  assert.ok(context.includes(dnsLesson.likelyAnswerPoints[0]));
});

test('core lessons return curated likely answers for interview prompts', () => {
  const framingLesson = allLessons.find((lesson) => lesson.id === 'foundations/problem-framing');
  const dnsLesson = allLessons.find((lesson) => lesson.id === 'edge-and-routing/dns');

  const framingAnswers = getLikelyAnswerPoints(
    framingLesson.interviewPrompts[0],
    buildLessonAnswerContext(framingLesson),
    framingLesson.checklist
  );
  assert.ok(
    framingAnswers.some((answer) => answer.includes('who sends and receives the notification')),
    'expected curated framing answer for notifications prompt'
  );

  const dnsAnswers = getLikelyAnswerPoints(
    dnsLesson.interviewPrompts[0],
    buildLessonAnswerContext(dnsLesson),
    dnsLesson.checklist
  );
  assert.ok(
    dnsAnswers.some((answer) => answer.includes('coarse regional steering')),
    'expected curated DNS answer for weighted routing prompt'
  );
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

test('AI curriculum reflects current industry LLMOps and RAG practices', () => {
  const llm = getLessonBySlug('llms-and-nlp', 'llm-fundamentals');
  const rag = getLessonBySlug('prompt-engineering-and-rag', 'rag-systems');
  const agents = getLessonBySlug('ai-agents', 'agent-fundamentals');
  const serving = getLessonBySlug('mlops-and-deployment', 'model-serving');
  const governance = getLessonBySlug('ai-safety-and-ethics', 'ai-governance');
  const evalLab = getLessonBySlug('llmops-eval-lab', 'llm-evaluation-harness');

  const joined = (lesson) =>
    [
      lesson.whyItMatters,
      ...(lesson.sections ?? []).flatMap((section) => [section.heading, section.body, ...(section.bullets ?? [])]),
      ...(lesson.interviewPrompts ?? [])
    ].join('\n');

  assert.match(joined(llm), /open-weight|reasoning|structured output/i);
  assert.match(joined(rag), /hybrid|rerank|GraphRAG|multi-tenant|ACL/i);
  assert.match(joined(agents), /when not to use agents|approval|workflow/i);
  assert.match(joined(serving), /KV cache|continuous batching|vLLM/i);
  assert.match(joined(governance), /EU AI Act|risk-tier|system card/i);
  assert.match(joined(evalLab), /golden|faithfulness|LLM-as-judge|RAGAS/i);
});

test('HLD learning lab practice steps use design exercises and likely answers', () => {
  const labLesson = allLessons.find((lesson) => lesson.id === 'data-storage-lab/indexing-and-query-path-design');
  assert.ok(labLesson);
  const steps = getLessonPracticeSteps(labLesson);
  assert.equal(steps.length, 3);
  assert.ok(steps[0].structure.includes('Core model'));
  assert.ok(steps[1].structure.includes('Critical path / topology'));
  assert.ok(steps[2].structure.includes('What you would defend'));
  assert.match(steps[0].title, /Teach the lab concept/);
  assert.ok(
    steps[1].guardrails.some((item) => /primary key|secondary indexes|paginate/i.test(item)),
    'expected design-exercise prompt questions in design guardrails'
  );
  assert.ok(
    steps[0].guardrails.some((item) => /access patterns|invariants|indexes/i.test(item)),
    'expected curated likelyAnswerPoints in opening guardrails'
  );
});

test('AI engineer interactive lessons cover every AI lesson', () => {
  const aiLessons = getModulesByFlow('ai-engineer').flatMap((module) => module.lessons);
  assert.ok(aiLessons.length >= 41);

  aiLessons.forEach((lesson) => {
    const interactive = getInteractiveLesson(lesson.id);
    assert.ok(interactive, `missing AI interactive lesson for ${lesson.id}`);
    assert.ok(interactive.takeaways.length >= 3);
    assert.ok(interactive.examples.length >= 2);
    assert.ok(interactive.decisionGuide.options.length >= 3);
    assert.ok(interactive.caseStudy.steps.length >= 3);
    assert.ok(interactive.caseStudy.metrics.length >= 3);
    assert.match(interactive.mermaid.code, /flowchart|graph/);
  });
});
