<svelte:options runes={false} />
<script>
  import { base } from '$app/paths';
  import LessonSolutionPanel from '$lib/components/LessonSolutionPanel.svelte';
  import { progress } from '$lib/stores/progress';
  import PracticeWorkspace from '$lib/components/PracticeWorkspace.svelte';
  export let data;
</script>

<svelte:head>
  <title>{data.lesson.title} · {data.module.title}</title>
  <meta name="description" content={data.lesson.summary} />
</svelte:head>

<section class="panel hero-card">
  <div class="breadcrumb">
    <a href={`${base}/`}>Curriculum</a>
    <span>→</span>
    <a href={`${base}/module/${data.module.slug}`}>{data.module.title}</a>
    <span>→</span>
    <span>{data.lesson.title}</span>
  </div>
  <p class="eyebrow">Lesson {data.lesson.order} of {data.module.lessons.length}</p>
  <h1>{data.lesson.title}</h1>
  <p class="hero-subtitle">{data.lesson.summary}</p>
  <div class="action-row">
    <span class="pill">{data.lesson.duration}</span>
    <span class="pill">{data.module.title}</span>
    <button
      class:done={$progress.completedLessonIds.includes(data.lesson.id)}
      class="lesson-toggle"
      type="button"
      onclick={() => progress.toggleLesson(data.lesson.id)}
    >
      {$progress.completedLessonIds.includes(data.lesson.id) ? 'Mark incomplete' : 'Mark complete'}
    </button>
  </div>
</section>

<section class="section-grid">
  <div class="content-grid">
    <article class="content-card">
      <p class="eyebrow">Why it matters</p>
      <h3>Interview framing</h3>
      <p>{data.lesson.whyItMatters}</p>
    </article>

    {#each data.lesson.sections as section}
      <article class="content-card">
        <p class="eyebrow">Study section</p>
        <h3>{section.heading}</h3>
        <p>{section.body}</p>
        {#if section.bullets?.length}
          <ul>
            {#each section.bullets as bullet}
              <li>{bullet}</li>
            {/each}
          </ul>
        {/if}
      </article>
    {/each}
  </div>

  <div class="content-grid">
    {#if data.lesson.diagram}
      <article class="diagram-card">
        <p class="eyebrow">Reference diagram</p>
        <h3>Visual anchor</h3>
        <img src={`${base}${data.lesson.diagram.src}`} alt={data.lesson.diagram.alt} loading="lazy" />
        <p>{data.lesson.diagram.caption}</p>
        <p class="footer-copy">{data.lesson.diagram.credit}</p>
      </article>
    {/if}

    <article class="list-card">
      <p class="eyebrow">Checklist</p>
      <h3>Things to say clearly</h3>
      <ul class="checklist">
        {#each data.lesson.checklist as item}
          <li>{item}</li>
        {/each}
      </ul>
    </article>

    <article class="list-card">
      <p class="eyebrow">Common pitfalls</p>
      <h3>What to avoid</h3>
      <ul class="pitfalls">
        {#each data.lesson.pitfalls as item}
          <li>{item}</li>
        {/each}
      </ul>
    </article>

    <article class="list-card">
      <p class="eyebrow">Interview prompts</p>
      <h3>Practice aloud</h3>
      <ul class="prompts">
        {#each data.lesson.interviewPrompts as item}
          <li>{item}</li>
        {/each}
      </ul>
    </article>
  </div>
</section>

<PracticeWorkspace lesson={data.lesson} />
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
