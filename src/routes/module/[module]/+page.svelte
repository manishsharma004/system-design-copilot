<svelte:options runes={false} />
<script>
  import { base } from '$app/paths';
  import { getModuleProgress } from '$lib/data/courseData';
  import { progress } from '$lib/stores/progress';
  export let data;
</script>

<svelte:head>
  <title>{data.module.title} · System Design Copilot</title>
  <meta name="description" content={data.module.summary} />
</svelte:head>

<section class="panel hero-card">
  <div class="breadcrumb">
    <a href={`${base}/`}>Curriculum</a>
    <span>→</span>
    <span>{data.module.title}</span>
  </div>
  <p class="eyebrow">Module overview</p>
  <h1>{data.module.title}</h1>
  <p class="hero-subtitle">{data.module.summary}</p>
  <div class="action-row">
    <span class="pill">{data.module.lessons.length} lessons</span>
    <span class="pill">{getModuleProgress($progress.completedLessonIds, data.module.slug).completed}/{getModuleProgress($progress.completedLessonIds, data.module.slug).total} complete</span>
    <a class="action-link primary" href={`${base}/module/${data.module.slug}/lesson/${data.module.lessons[0].slug}`}>Start module</a>
  </div>
</section>

<section class="list-grid">
  <article class="list-card">
    <p class="eyebrow">Objectives</p>
    <h3>What to master here</h3>
    <ul>
      {#each data.module.objectives as objective}
        <li>{objective}</li>
      {/each}
    </ul>
  </article>
  <article class="list-card">
    <p class="eyebrow">How to use this module</p>
    <h3>Practice flow</h3>
    <ul>
      <li>Read the summary and explain the core trade-off in your own words.</li>
      <li>Study the diagram and identify the critical path or failure boundary.</li>
      <li>Answer the interview prompts aloud before marking the lesson complete.</li>
    </ul>
  </article>
  <article class="list-card">
    <p class="eyebrow">Interview signal</p>
    <h3>What reviewers expect</h3>
    <ul>
      <li>Clear assumptions and estimated scale.</li>
      <li>Justified component choices instead of pattern dumping.</li>
      <li>Awareness of operations, failure modes, and trade-offs.</li>
    </ul>
  </article>
</section>

<section class="lesson-grid">
  {#each data.module.lessons as lesson}
    <article class="lesson-card">
      <a class="topic-card-link" href={`${base}/module/${data.module.slug}/lesson/${lesson.slug}`}>
        <div>
          <p class="eyebrow">Lesson {lesson.order}</p>
          <h3>{lesson.title}</h3>
        </div>
        <p>{lesson.summary}</p>
        <div class="card-meta">
          <span class="pill">{lesson.duration}</span>
          <span class:done={$progress.completedLessonIds.includes(lesson.id)} class="progress-badge">{$progress.completedLessonIds.includes(lesson.id) ? 'Completed' : 'Open'}</span>
        </div>
      </a>
    </article>
  {/each}
</section>
