<svelte:options runes={false} />
<script>
  import { base } from '$app/paths';
  import { getModuleProgress } from '$lib/data/courseData';
  import { progress } from '$lib/stores/progress';
  export let data;

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
          <span>{data.module.title}</span>
        </div>
        <p class="eyebrow">Learning path</p>
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
        <strong>Build one clean mental model before scaling it.</strong>
        <p>Move through the lessons in order so each trade-off has context before the harder distributed systems decisions show up.</p>
      </article>
      <article class="module-focus-card">
        <span class="eyebrow">Study target</span>
        <strong>{remainingLessons ? `${remainingLessons} lessons left` : 'Module complete'}</strong>
        <p>{remainingLessons ? 'Aim to finish one lesson, then explain its core trade-off out loud before moving on.' : 'Use the runway below to review the lessons where trade-offs still feel fuzzy.'}</p>
      </article>
    </div>

    <div class="action-row">
      <span class="pill">{data.module.lessons.length} lessons</span>
      <span class="pill">{completedLessons}/{totalLessons} complete</span>
      <span class="pill">Follow in order for best results</span>
      <a class="action-link primary" href={`${base}/module/${data.module.slug}/lesson/${nextLesson.slug}`}>{completedLessons ? 'Continue module' : 'Start module'}</a>
      <a class="action-link" href="#lesson-runway">View lesson runway</a>
    </div>
  </article>

  <article class="list-card module-sidebar-card module-rhythm-card">
    <p class="eyebrow">Learning rhythm</p>
    <h3>Study this like a sequenced course, not a reference dump</h3>
    <ol class="module-rhythm-list">
      <li><strong>Preview the runway.</strong> Skim every lesson title first so you can see the progression before you dive in.</li>
      <li><strong>Do one lesson deeply.</strong> Read the summary, inspect the diagram, and identify the sharpest trade-off.</li>
      <li><strong>Say it back aloud.</strong> Explain the idea in interviewer language before you mark it complete.</li>
      <li><strong>Only then advance.</strong> Move to the next lesson when you can defend the previous one without the notes open.</li>
    </ol>
    <div class="module-rhythm-meta">
      <span class="pill">Sequential learning path</span>
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
      <li>Read the summary and explain the core trade-off in your own words.</li>
      <li>Study the diagram and identify the critical path or failure boundary.</li>
      <li>Answer the interview prompts aloud before marking the lesson complete.</li>
    </ul>
  </article>
  <article class="list-card">
    <p class="eyebrow">Mastery check</p>
    <h3>How you know it is sticking</h3>
    <ul>
      <li>Clear assumptions and estimated scale.</li>
      <li>Justified component choices instead of pattern dumping.</li>
      <li>Awareness of operations, failure modes, and trade-offs.</li>
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
