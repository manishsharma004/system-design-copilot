<svelte:options runes={false} />
<script>
  import { base } from '$app/paths';
  import LessonSolutionPanel from '$lib/components/LessonSolutionPanel.svelte';
  import LessonExplorer from '$lib/components/LessonExplorer.svelte';
  import SimulationIDE from '$lib/components/SimulationIDE.svelte';
  import AiLessonStudyGuide from '$lib/components/AiLessonStudyGuide.svelte';
  import { getFlowBySlug } from '$lib/data/courseData';
  import { progress } from '$lib/stores/progress';
  import PracticeIDE from '$lib/components/PracticeIDE.svelte';
  import DsaPracticeIDE from '$lib/components/DsaPracticeIDE.svelte';
  export let data;

  $: flow = getFlowBySlug(data.module.flowSlug);
  $: isDsaLesson = data.module.flowSlug === 'data-structures-and-algorithms';
  $: isAiLesson = data.module.flowSlug === 'ai-engineer';
  $: showSimulationLab = data.module.flowSlug === 'high-level-design' && Boolean(data.lesson.simulation);

  /** @param {string} heading */
  function sectionId(heading) {
    return heading.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  }
</script>

<svelte:head>
  <title>{data.lesson.title} · {data.module.title}</title>
  <meta name="description" content={data.lesson.summary} />
</svelte:head>

<section class="lesson-hero-grid">
  <article class="panel hero-card">
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
      <span class="pill">{data.lesson.duration}</span>
      {#if flow}
        <span class="pill">{flow.shortTitle} flow</span>
      {/if}
      <span class="pill">{data.module.title}</span>
      <span class="pill">{data.lesson.sections.length + 1} guided stops</span>
      <button
        class:done={$progress.completedLessonIds.includes(data.lesson.id)}
        class="lesson-toggle"
        type="button"
        onclick={() => progress.toggleLesson(data.lesson.id)}
      >
        {$progress.completedLessonIds.includes(data.lesson.id) ? 'Mark incomplete' : 'Mark complete'}
      </button>
    </div>
  </article>

  <article class="list-card lesson-summary-card">
    <p class="eyebrow">Study map</p>
    <h3>What this lesson helps you explain</h3>
    <p>{data.lesson.whyItMatters}</p>
    <div class="lesson-anchor-grid compact">
      <a class="section-chip" href="#lesson-framing">
        <strong>Start here</strong>
        <span>Frame the trade-off before diving into architecture.</span>
      </a>
      {#each data.lesson.sections as section, index}
        <a class="section-chip" href={`#${sectionId(section.heading)}`}>
          <strong>{index + 1}. {section.heading}</strong>
          <span>{section.bullets?.[0] ?? section.body}</span>
        </a>
      {/each}
    </div>
  </article>
</section>

<section class="lesson-shell">
  <div class="lesson-main-stack">
    <article class="panel hero-card lesson-roadmap-card">
      <div class="practice-card-header">
        <div>
          <p class="eyebrow">Guided walkthrough</p>
          <h2>Move through the lesson in a clear interview order</h2>
        </div>
        <span class="pill">{data.lesson.sections.length + 1} steps</span>
      </div>
      <p class="practice-copy">Start with the framing, walk the concept in order, then use the right rail for prompts, pitfalls, and visual anchors.</p>
      <div class="lesson-anchor-grid">
        <a class="section-chip" href="#lesson-framing">
          <strong>1. Interview framing</strong>
          <span>{data.lesson.whyItMatters}</span>
        </a>
        {#each data.lesson.sections as section, index}
          <a class="section-chip" href={`#${sectionId(section.heading)}`}>
            <strong>{index + 2}. {section.heading}</strong>
            <span>{section.bullets?.[0] ?? section.body}</span>
          </a>
        {/each}
      </div>
    </article>

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
            <ul>
              {#each data.lesson.checklist.slice(0, 3) as item}
                <li>{item}</li>
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
              <ul>
                {#each section.bullets as bullet}
                  <li>{bullet}</li>
                {/each}
              </ul>
            </div>
          {/if}
        </div>
      </article>
    {/each}
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
      <ul class="checklist">
        {#each data.lesson.checklist as item}
          <li>{item}</li>
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
      <ul class="prompts">
        {#each data.lesson.interviewPrompts as item}
          <li>{item}</li>
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

{#if isAiLesson}
  <AiLessonStudyGuide lesson={data.lesson} />
{/if}

<LessonExplorer lesson={data.lesson} />
{#if showSimulationLab}
  <SimulationIDE lesson={data.lesson} />
{/if}

{#if isDsaLesson}
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
