<svelte:options runes={false} />
<script>
  import { base } from '$app/paths';
  import { browser } from '$app/environment';
  import { page } from '$app/stores';
  import LessonSolutionPanel from '$lib/components/LessonSolutionPanel.svelte';
  import LessonExplorer from '$lib/components/LessonExplorer.svelte';
  import SimulationIDE from '$lib/components/SimulationIDE.svelte';
  import AiTopicLab from '$lib/components/AiTopicLab.svelte';
  import AiLessonStudyGuide from '$lib/components/AiLessonStudyGuide.svelte';
  import LessonLearnReader from '$lib/components/LessonLearnReader.svelte';
  import { getFlowBySlug } from '$lib/data/courseData';
  import { progress } from '$lib/stores/progress';
  import PracticeIDE from '$lib/components/PracticeIDE.svelte';
  import DsaPracticeIDE from '$lib/components/DsaPracticeIDE.svelte';
  import QuestionBankIDE from '$lib/components/QuestionBankIDE.svelte';
  import LessonCodeSnippet from '$lib/components/LessonCodeSnippet.svelte';
  import MLPracticeIDE from '$lib/components/MLPracticeIDE.svelte';
  import LessonSectionNav from '$lib/components/LessonSectionNav.svelte';
  import { buildLessonAnswerContext, getLikelyAnswerPoints } from '$lib/interviewAnswers';
  import { solutionLessonIds } from '$lib/data/solutionLoader';
  export let data;

  let learnOpen = false;
  let learnQuerySeen = '';

  $: flow = getFlowBySlug(data.module.flowSlug);
  // searchParams are unavailable during prerender; only read them in the browser.
  $: if (browser) {
    const learnParam = $page.url.searchParams.get('learn') ?? '';
    const learnQueryKey = `${data.lesson.id}:${learnParam}`;
    if (learnQueryKey !== learnQuerySeen) {
      learnQuerySeen = learnQueryKey;
      if (learnParam === '1') {
        learnOpen = true;
      }
    }
  }
  $: isDsaLesson = data.module.flowSlug === 'data-structures-and-algorithms';
  $: isQuestionBankLesson = data.module.flowSlug === 'interview-questions';
  $: isAiLesson = data.module.flowSlug === 'ai-engineer';
  $: lessonExercises = data.lesson.exercises ?? [];
  $: hasLessonExercises = lessonExercises.length > 0;
  $: hasCodingExercises = lessonExercises.some(
    (/** @type {{ type?: string, starterCode?: string }} */ exercise) =>
      exercise?.type === 'coding' && typeof exercise?.starterCode === 'string' && exercise.starterCode.trim().length > 0
  );
  $: showSimulationLab = data.module.flowSlug === 'high-level-design' && Boolean(data.lesson.simulation);
  $: showTopicLab = Boolean(data.lesson.interactive) || isAiLesson || hasLessonExercises;
  $: showExerciseGuide = isAiLesson || hasLessonExercises;
  $: showPythonLab = isAiLesson || (hasCodingExercises && !isDsaLesson);
  $: showSolutionReveal = solutionLessonIds.has(data.lesson.id);
  $: lessonAnswerContext = buildLessonAnswerContext(data.lesson);
  $: lessonSteps = [
    {
      id: 'lesson-framing',
      index: 1,
      title: 'Interview framing',
      summary: data.lesson.whyItMatters
    },
    ...data.lesson.sections.map((section, index) => ({
      id: sectionId(section.heading),
      index: index + 2,
      title: section.heading,
      summary: section.bullets?.[0] ?? section.body
    }))
  ];
  $: lessonSections = [
    { id: 'lesson-content', label: 'Read' },
    ...(data.lesson.deepKnowledge ? [{ id: 'deep-knowledge', label: 'Deep dive' }] : []),
    ...(showTopicLab ? [{ id: 'topic-lab', label: 'Topic lab' }] : []),
    ...(showPythonLab ? [{ id: 'ml-practice-lab', label: 'Python lab' }] : []),
    ...(showSimulationLab ? [{ id: 'simulation-lab', label: 'Simulate' }] : []),
    { id: 'practice-lab', label: isAiLesson ? 'Interview practice' : 'Practice' },
    ...(showSolutionReveal ? [{ id: 'solution-reveal', label: 'Solutions' }] : [])
  ];
  $: practiceHeroLabel = isAiLesson ? 'Interview practice' : 'Start mock interview';
  $: showRagPrereqCallout =
    isAiLesson &&
    (data.lesson.id === 'prompt-engineering-and-rag/rag-systems' ||
      data.lesson.id === 'llms-and-nlp/embeddings-and-vector-search');

  /** @param {string} heading */
  function sectionId(heading) {
    return heading.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  }
</script>

<svelte:head>
  <title>{data.lesson.title} · {data.module.title}</title>
  <meta name="description" content={data.lesson.summary} />
</svelte:head>

<section class="panel hero-card lesson-hero-single">
  <div class="breadcrumb">
    <a href={`${base}/`}>Curriculum</a>
    <span>→</span>
    {#if flow}
      <a href={`${base}/flow/${flow.slug}`}>{flow.title}</a>
      <span>→</span>
    {/if}
    <a href={`${base}/module/${data.module.slug}`}>{data.module.title}</a>
    <span>→</span>
    <span>{data.lesson.title}</span>
  </div>
  <p class="eyebrow">Lesson {data.lesson.order} of {data.module.lessons.length}</p>
  <h1>{data.lesson.title}</h1>
  <p class="hero-subtitle">{data.lesson.summary}</p>
  <div class="action-row">
    <button class="action-link primary" type="button" onclick={() => (learnOpen = true)}>
      {data.lesson.learnChapter ? 'Learn chapter' : 'Learn'}
    </button>
    <a class="action-link" href={showPythonLab ? '#ml-practice-lab' : '#practice-lab'}>{practiceHeroLabel}</a>
    {#if showSimulationLab}
      <a class="action-link" href="#simulation-lab">Open simulation lab</a>
    {/if}
    {#if showTopicLab}
      <a class="action-link" href="#topic-lab">Open topic lab</a>
    {/if}
    {#if data.lesson.learnChapter}
      <span class="pill">Book chapter · {data.lesson.learnChapter.parts.length} parts · {data.lesson.learnChapter.readingTime}</span>
    {/if}
    <span class="pill">{data.lesson.duration}</span>
    {#if flow}
      <span class="pill">{flow.shortTitle} flow</span>
    {/if}
    <span class="pill">{data.module.title}</span>
    <span class="pill">{lessonSteps.length} guided stops</span>
    <button
      class:done={$progress.completedLessonIds.includes(data.lesson.id)}
      class="lesson-toggle"
      type="button"
      onclick={() => progress.toggleLesson(data.lesson.id)}
    >
      {$progress.completedLessonIds.includes(data.lesson.id) ? 'Mark incomplete' : 'Mark complete'}
    </button>
  </div>
  <article class="lesson-why-card">
    <p class="eyebrow">Why this lesson matters</p>
    <p>{data.lesson.whyItMatters}</p>
  </article>
</section>

{#if showRagPrereqCallout}
  <section class="panel hero-card lesson-prereq-callout">
    <p class="eyebrow">Before you go deep</p>
    <p>
      RAG and vector search depend on ingest, freshness, and dataset hygiene. Skim
      <a href={`${base}/module/data-engineering-for-ml/lesson/data-pipelines-at-scale?learn=1`}>
        Data pipelines at scale
      </a>
      if you are jumping straight into retrieval-heavy lessons.
    </p>
  </section>
{/if}

<LessonSectionNav
  sections={lessonSections}
  onLearnOpen={data.lesson.learnChapter ? () => (learnOpen = true) : null}
/>

<section class="lesson-shell" id="lesson-content">
  <div class="lesson-main-stack">
    <nav class="lesson-step-nav" aria-label="Lesson steps">
      {#each lessonSteps as step}
        <a class="lesson-step-nav-link" href={`#${step.id}`}>
          <span class="lesson-step-nav-index">Step {step.index}</span>
          <strong>{step.title}</strong>
          <span>{step.summary}</span>
        </a>
      {/each}
    </nav>
    <article class="panel hero-card lesson-step-panel" id="lesson-framing">
      <div class="lesson-step-header">
        <div class="lesson-step-badge">1</div>
        <div>
          <p class="eyebrow">Start with this framing</p>
          <h2>Interview framing</h2>
        </div>
      </div>
      <div class="lesson-step-grid">
        <div class="lesson-step-copy">
          <p>{data.lesson.whyItMatters}</p>
        </div>
        <div class="lesson-step-support">
          <div class="practice-guidance compact">
            <p class="eyebrow">What to say first</p>
            <ul class="prompt-answer-list">
              {#each data.lesson.checklist.slice(0, 3) as item}
                <li>
                  <p>{item}</p>
                  <details class="prompt-answer-toggle">
                    <summary>Show likely answer</summary>
                    <ul>
                      {#each getLikelyAnswerPoints(item, lessonAnswerContext, data.lesson.checklist) as answerPoint}
                        <li>{answerPoint}</li>
                      {/each}
                    </ul>
                  </details>
                </li>
              {/each}
            </ul>
          </div>
        </div>
      </div>
    </article>

    {#each data.lesson.sections as section, index}
      <article class="panel hero-card lesson-step-panel" id={sectionId(section.heading)}>
        <div class="lesson-step-header">
          <div class="lesson-step-badge">{index + 2}</div>
          <div>
            <p class="eyebrow">Study section</p>
            <h2>{section.heading}</h2>
          </div>
        </div>
        <div class="lesson-step-grid">
          <div class="lesson-step-copy">
            <p>{section.body}</p>
          </div>
          {#if section.bullets?.length}
            <div class="practice-guidance compact lesson-step-support">
              <p class="eyebrow">Call these points out explicitly</p>
              <ul class="prompt-answer-list">
                {#each section.bullets as bullet}
                  <li>
                    <p>{bullet}</p>
                    <details class="prompt-answer-toggle">
                      <summary>Show likely answer</summary>
                      <ul>
                        {#each getLikelyAnswerPoints(bullet, [section.body, ...(section.bullets ?? []), ...lessonAnswerContext], data.lesson.checklist) as answerPoint}
                          <li>{answerPoint}</li>
                        {/each}
                      </ul>
                    </details>
                  </li>
                {/each}
              </ul>
            </div>
          {/if}
        </div>
        {#if section.codeExample}
          <LessonCodeSnippet
            title={section.codeExample.title}
            language={section.codeExample.language ?? 'python'}
            languageLabel={section.codeExample.languageLabel ?? 'Python'}
            code={section.codeExample.code}
          />
        {/if}
      </article>
    {/each}

    {#if data.lesson.deepKnowledge}
      <article class="panel hero-card lesson-step-panel" id="deep-knowledge">
        <div class="lesson-step-header">
          <div class="lesson-step-badge">{data.lesson.sections.length + 2}</div>
          <div>
            <p class="eyebrow">Go deeper</p>
            <h2>Deeper knowledge and references</h2>
          </div>
        </div>
        <p class="hero-subtitle lesson-deep-intro">
          These notes extend the lesson with production-minded detail and curated external references you can study after the core read-through.
        </p>
        <div class="lesson-deep-grid">
          {#each data.lesson.deepKnowledge.insights as insight}
            <article class="lesson-deep-insight">
              <h3>{insight.heading}</h3>
              <p>{insight.body}</p>
            </article>
          {/each}
        </div>
        <div class="reading-list lesson-reference-list">
          {#each data.lesson.deepKnowledge.references as reference}
            <article class="reading-card">
              <div>
                <a href={reference.url} target="_blank" rel="noreferrer">
                  <strong>{reference.title}</strong>
                </a>
                <p class="reading-author">{reference.source}</p>
              </div>
              <p>{reference.note}</p>
            </article>
          {/each}
        </div>
      </article>
    {/if}
  </div>

  <aside class="lesson-rail">
    {#if data.lesson.diagram}
      <article class="diagram-card lesson-rail-card">
        <p class="eyebrow">Reference diagram</p>
        <h3>Visual anchor</h3>
        <img src={`${base}${data.lesson.diagram.src}`} alt={data.lesson.diagram.alt} loading="lazy" />
        <p>{data.lesson.diagram.caption}</p>
        <p class="footer-copy">{data.lesson.diagram.credit}</p>
      </article>
    {/if}

    <article class="list-card lesson-rail-card">
      <p class="eyebrow">Checklist</p>
      <h3>Things to say clearly</h3>
      <ul class="checklist prompt-answer-list">
        {#each data.lesson.checklist as item}
          <li>
            <p>{item}</p>
            <details class="prompt-answer-toggle">
              <summary>Show likely answer</summary>
              <ul>
                {#each getLikelyAnswerPoints(item, lessonAnswerContext, data.lesson.checklist) as answerPoint}
                  <li>{answerPoint}</li>
                {/each}
              </ul>
            </details>
          </li>
        {/each}
      </ul>
    </article>

    <article class="list-card lesson-rail-card">
      <p class="eyebrow">Common pitfalls</p>
      <h3>What to avoid</h3>
      <ul class="pitfalls">
        {#each data.lesson.pitfalls as item}
          <li>{item}</li>
        {/each}
      </ul>
    </article>

    <article class="list-card lesson-rail-card">
      <p class="eyebrow">Interview prompts</p>
      <h3>Practice aloud</h3>
      <ul class="prompts prompt-answer-list">
        {#each data.lesson.interviewPrompts as item}
          <li>
            <p>{item}</p>
            <details class="prompt-answer-toggle">
              <summary>Show likely answer</summary>
              <ul>
                {#each getLikelyAnswerPoints(item, lessonAnswerContext, data.lesson.checklist) as answerPoint}
                  <li>{answerPoint}</li>
                {/each}
              </ul>
            </details>
          </li>
        {/each}
      </ul>
    </article>

    {#if data.lesson.relatedLessons?.length}
      <article class="list-card lesson-rail-card">
        <p class="eyebrow">Related topics</p>
        <h3>Keep the thread going</h3>
        <div class="link-stack">
          {#each data.lesson.relatedLessons as relatedLesson}
            <a class="nav-link" href={`${base}/module/${relatedLesson.moduleSlug}/lesson/${relatedLesson.slug}`}>
              <strong>{relatedLesson.title}</strong>
              <small>{relatedLesson.moduleTitle}</small>
            </a>
          {/each}
        </div>
      </article>
    {/if}
  </aside>
</section>

{#if showExerciseGuide && !isAiLesson}
  <AiLessonStudyGuide lesson={data.lesson} />
{/if}
{#if isAiLesson && showTopicLab}
  <AiTopicLab lesson={data.lesson} />
{/if}
{#if showPythonLab}
  <MLPracticeIDE lesson={data.lesson} />
{/if}

{#if !isAiLesson}
  <LessonExplorer lesson={data.lesson} />
{/if}
{#if showSimulationLab}
  <SimulationIDE lesson={data.lesson} />
{/if}

{#if isQuestionBankLesson}
  <QuestionBankIDE lesson={data.lesson} />
{:else if isDsaLesson}
  <DsaPracticeIDE lesson={data.lesson} />
{:else}
  <PracticeIDE lesson={data.lesson} />
{/if}
<LessonSolutionPanel lesson={data.lesson} />

<section class="panel hero-card">
  <div class="action-row" style="justify-content: space-between; align-items: end;">
    <div>
      <p class="eyebrow">Next steps</p>
      <h2>Keep moving through the module</h2>
    </div>
  </div>
  <div class="action-row">
    {#if data.previousLesson}
      <a class="action-link" href={`${base}/module/${data.module.slug}/lesson/${data.previousLesson.slug}`}>← {data.previousLesson.title}</a>
    {/if}
    {#if data.nextLesson}
      <a class="action-link primary" href={`${base}/module/${data.module.slug}/lesson/${data.nextLesson.slug}`}>{data.nextLesson.title} →</a>
    {:else}
      <a class="action-link primary" href={`${base}/`}>Back to curriculum</a>
    {/if}
  </div>
</section>

<LessonLearnReader
  open={learnOpen}
  lesson={data.lesson}
  learnChapter={data.lesson.learnChapter}
  moduleTitle={data.module.title}
  onClose={() => (learnOpen = false)}
/>
