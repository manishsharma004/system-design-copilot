<svelte:options runes={false} />
<script>
  import { base } from '$app/paths';
  import { getFlowBySlug, getModuleProgress } from '$lib/data/courseData';
  import { progress } from '$lib/stores/progress';
  export let data;

  $: flow = getFlowBySlug(data.module.flowSlug);
  $: isLowLevelFlow = data.module.flowSlug === 'low-level-design';
  $: isDsaFlow = data.module.flowSlug === 'data-structures-and-algorithms';
  $: moduleFocusHeadline = isLowLevelFlow
    ? 'Design responsibilities cleanly before patterns start to stack up.'
    : isDsaFlow
      ? 'Choose the solving pattern early, then defend the invariant while you code.'
      : 'Build one clean mental model before scaling it.';
  $: moduleFocusSummary = isLowLevelFlow
    ? 'Move through the lessons in order so each object-model decision has context before follow-up requirements and machine-coding trade-offs appear.'
    : isDsaFlow
      ? 'Move through the lessons in order so pattern recognition, live coding structure, and company-specific reps build on each other instead of staying disconnected.'
      : 'Move through the lessons in order so each trade-off has context before the harder distributed systems decisions show up.';
  $: moduleDeepStudyLine = isLowLevelFlow
    ? 'Read the prompt shape, object boundaries, and extension seams before coding anything.'
    : isDsaFlow
      ? 'Read the prompt shape, pick the target pattern, and name the invariant before typing the first line of code.'
      : 'Read the summary, inspect the diagram, and identify the sharpest trade-off.';
  $: practiceFlowLines = isLowLevelFlow
    ? [
        'Read the summary and explain the core object or workflow decision in your own words.',
        'Sketch the key classes, responsibilities, and extension seams before you code.',
        'Answer the interview prompts aloud before marking the lesson complete.'
      ]
    : isDsaFlow
      ? [
          'Read the summary and explain the core pattern or invariant in your own words.',
          'Walk one example manually, then code the cleanest correct version before optimizing.',
          'Answer the interview prompts aloud before marking the lesson complete.'
        ]
      : [
          'Read the summary and explain the core trade-off in your own words.',
          'Study the diagram and identify the critical path or failure boundary.',
          'Answer the interview prompts aloud before marking the lesson complete.'
        ];
  $: masteryCheckLines = isLowLevelFlow
    ? [
        'Clear assumptions, invariants, and object boundaries.',
        'Justified abstraction choices instead of pattern dumping.',
        'Awareness of follow-ups such as testing, concurrency, and extensibility.'
      ]
    : isDsaFlow
      ? [
          'Clear problem restatement, complexity target, and solving pattern.',
          'A stable invariant or recurrence that survives interviewer follow-ups.',
          'Confident edge-case testing and clean explanation while coding.'
        ]
      : [
          'Clear assumptions and estimated scale.',
          'Justified component choices instead of pattern dumping.',
          'Awareness of operations, failure modes, and trade-offs.'
        ];
  $: moduleProgress = getModuleProgress($progress.completedLessonIds, data.module.slug);
  $: completedLessons = moduleProgress.completed;
  $: totalLessons = moduleProgress.total;
  $: completionRatio = totalLessons ? Math.round((completedLessons / totalLessons) * 100) : 0;
  $: nextLesson = data.module.lessons.find((lesson) => !$progress.completedLessonIds.includes(lesson.id)) ?? data.module.lessons[0];
  $: remainingLessons = Math.max(totalLessons - completedLessons, 0);
</script>

<svelte:head>
  <title>{data.module.title} · System Design Copilot</title>
  <meta name="description" content={data.module.summary} />
</svelte:head>

<section class="module-hero-grid learning-hero-grid">
  <article class="panel hero-card module-hero-card">
    <div class="module-hero-header">
      <div class="module-hero-copy">
        <div class="breadcrumb">
          <a href={`${base}/`}>Curriculum</a>
          <span>→</span>
          {#if flow}
            <a href={`${base}/flow/${flow.slug}`}>{flow.title}</a>
            <span>→</span>
          {/if}
          <span>{data.module.title}</span>
        </div>
        <p class="eyebrow">{flow?.shortTitle ?? 'Course'} learning path</p>
        <h1>{data.module.title}</h1>
        <p class="hero-subtitle">{data.module.summary}</p>
      </div>
      <article class="module-status-card">
        <span class="eyebrow">Module progress</span>
        <strong>{completionRatio}%</strong>
        <p>{completedLessons} of {totalLessons} lessons complete</p>
        <div aria-hidden="true" class="module-progress-meter">
          <span style={`width: ${completionRatio}%`}></span>
        </div>
      </article>
    </div>

    <div class="module-focus-strip">
      <article class="module-focus-card module-focus-card-accent">
        <span class="eyebrow">Next up</span>
        <strong>Lesson {nextLesson.order}: {nextLesson.title}</strong>
        <p>{nextLesson.summary}</p>
      </article>
      <article class="module-focus-card">
        <span class="eyebrow">Why this module matters</span>
        <strong>{moduleFocusHeadline}</strong>
        <p>{moduleFocusSummary}</p>
      </article>
      <article class="module-focus-card">
        <span class="eyebrow">Study target</span>
        <strong>{remainingLessons ? `${remainingLessons} lessons left` : 'Module complete'}</strong>
        <p>{remainingLessons ? 'Aim to finish one lesson, then explain its core trade-off out loud before moving on.' : 'Use the runway below to review the lessons where trade-offs still feel fuzzy.'}</p>
      </article>
    </div>

    <div class="action-row">
      {#if flow}
        <span class="pill">{flow.title}</span>
      {/if}
      <span class="pill">{data.module.lessons.length} lessons</span>
      <span class="pill">{completedLessons}/{totalLessons} complete</span>
      <span class="pill">Follow in order for best results</span>
      {#if flow}
        <a class="action-link" href={`${base}/flow/${flow.slug}`}>Back to {flow.shortTitle} roadmap</a>
      {/if}
      <a class="action-link primary" href={`${base}/module/${data.module.slug}/lesson/${nextLesson.slug}`}>{completedLessons ? 'Continue module' : 'Start module'}</a>
      <a class="action-link" href="#lesson-runway">View lesson runway</a>
    </div>
  </article>

  <article class="list-card module-sidebar-card module-rhythm-card">
    <p class="eyebrow">Learning rhythm</p>
    <h3>Study this like a sequenced course, not a reference dump</h3>
    <ol class="module-rhythm-list">
      <li><strong>Preview the runway.</strong> Skim every lesson title first so you can see the progression before you dive in.</li>
      <li><strong>Do one lesson deeply.</strong> {moduleDeepStudyLine}</li>
      <li><strong>Say it back aloud.</strong> Explain the idea in interviewer language before you mark it complete.</li>
      <li><strong>Only then advance.</strong> Move to the next lesson when you can defend the previous one without the notes open.</li>
    </ol>
    <div class="module-rhythm-meta">
      <span class="pill">{flow?.shortTitle ?? 'Course'} sequence</span>
      <span class="pill">Designed for interview recall</span>
    </div>
  </article>
</section>

<section class="list-grid">
  <article class="list-card">
    <p class="eyebrow">Outcomes</p>
    <h3>What you should walk away with</h3>
    <ul>
      {#each data.module.objectives as objective}
        <li>{objective}</li>
      {/each}
    </ul>
  </article>
  <article class="list-card">
    <p class="eyebrow">Practice flow</p>
    <h3>How to study each lesson</h3>
    <ul>
      {#each practiceFlowLines as line}
        <li>{line}</li>
      {/each}
    </ul>
  </article>
  <article class="list-card">
    <p class="eyebrow">Mastery check</p>
    <h3>How you know it is sticking</h3>
    <ul>
      {#each masteryCheckLines as line}
        <li>{line}</li>
      {/each}
    </ul>
  </article>
</section>

<section class="panel module-runway-card" id="lesson-runway">
  <div class="curriculum-map-header">
    <div>
      <p class="eyebrow">Lesson runway</p>
      <h2>Follow the sequence from first principles to fluency</h2>
      <p class="hero-subtitle">This is the core pattern borrowed from stronger learning products: show the path, make the next step obvious, and keep outcomes visible while the learner moves.</p>
    </div>
    <span class="pill">{completedLessons}/{totalLessons} complete</span>
  </div>

  <div class="module-runway-grid">
    {#each data.module.lessons as lesson}
      <a
        class:completed={$progress.completedLessonIds.includes(lesson.id)}
        class:next-lesson={lesson.id === nextLesson.id}
        class="lesson-sequence-card"
        href={`${base}/module/${data.module.slug}/lesson/${lesson.slug}`}
      >
        <div class="lesson-sequence-header">
          <span class="pill">Lesson {lesson.order}</span>
          <span class:done={$progress.completedLessonIds.includes(lesson.id)} class="progress-badge">{$progress.completedLessonIds.includes(lesson.id) ? 'Completed' : lesson.id === nextLesson.id ? 'Next' : 'Open'}</span>
        </div>
        <strong>{lesson.title}</strong>
        <p>{lesson.summary}</p>
        <div class="lesson-sequence-meta">
          <span>{lesson.duration}</span>
          <span>{lesson.interviewPrompts.length} prompts</span>
          <span>{lesson.sections.length} sections</span>
        </div>
      </a>
    {/each}
  </div>
</section>

<section class="lesson-grid">
  {#each data.module.lessons as lesson}
    <article class="lesson-card module-lesson-card">
      <a class="topic-card-link" href={`${base}/module/${data.module.slug}/lesson/${lesson.slug}`}>
        <div class="lesson-card-heading">
          <div>
            <p class="eyebrow">Lesson {lesson.order}</p>
            <h3>{lesson.title}</h3>
          </div>
          <span class:done={$progress.completedLessonIds.includes(lesson.id)} class="progress-badge">{$progress.completedLessonIds.includes(lesson.id) ? 'Completed' : 'Open'}</span>
        </div>
        <p>{lesson.summary}</p>
        <div class="lesson-detail-block">
          <p class="eyebrow">Why it matters</p>
          <p>{lesson.whyItMatters}</p>
        </div>
        <div class="lesson-detail-block">
          <p class="eyebrow">What you will cover</p>
          <div class="pill-row">
            {#each lesson.sections.slice(0, 3) as section}
              <span class="pill">{section.heading}</span>
            {/each}
          </div>
        </div>
        <div class="lesson-detail-block">
          <p class="eyebrow">Good interview signal</p>
          <ul class="lesson-preview-list">
            {#each lesson.checklist.slice(0, 2) as item}
              <li>{item}</li>
            {/each}
          </ul>
        </div>
        <div class="card-meta">
          <span class="pill">{lesson.duration}</span>
          <span class="pill">{lesson.interviewPrompts.length} prompts</span>
          <span class="pill">{lesson.sections.length} sections</span>
        </div>
        <span class="lesson-card-cta">{$progress.completedLessonIds.includes(lesson.id) ? 'Review lesson' : 'Start lesson'}</span>
      </a>
    </article>
  {/each}
</section>
