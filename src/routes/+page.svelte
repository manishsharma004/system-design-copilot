<svelte:options runes={false} />
<script>
  import { base } from '$app/paths';
  import { completedLessonCount, progress } from '$lib/stores/progress';
  import ProgressControls from '$lib/components/ProgressControls.svelte';
  import {
    courseFlows,
    defaultFlow,
    getModuleProgress,
    getResumeLesson,
    modules,
    siteOverview,
    allLessons
  } from '$lib/data/courseData';
  import { reviewDueToday } from '$lib/stores/reviewQueue';

  const featuredModules = defaultFlow.modules.slice(0, 3);
  let showExtendedResources = false;

  $: resumeLesson = getResumeLesson($progress.completedLessonIds);
  $: resumeFlow = resumeLesson ? courseFlows.find((flow) => flow.slug === resumeLesson.flowSlug) : null;
  $: learningPaths = siteOverview.learningPaths ?? [];
</script>

<svelte:head>
  <title>{siteOverview.title} · Learn & practice</title>
</svelte:head>

<section class="hero panel">
  <div class="hero-grid home-hero-grid">
    <div class="hero-card hero-primary-card">
      <p class="eyebrow">Learn systems · design · algorithms · AI</p>
      <div class="hero-kicker-row">
        <span class="pill">Browser-only curriculum</span>
        <span class="pill">{courseFlows.length} learning tracks · {allLessons.length} lessons</span>
      </div>
      <h1 class="hero-title">System Design Copilot</h1>
      <p class="hero-subtitle">{siteOverview.subtitle}</p>
      <p class="hero-guidance">{siteOverview.heroGuidance}</p>
      <div class="action-row">
        <a class="action-link primary" href={`${base}/flow/high-level-design`}>Learn HLD</a>
        <a class="action-link" href={`${base}/flow/low-level-design`}>Learn LLD</a>
        <a class="action-link" href={`${base}/flow/data-structures-and-algorithms`}>Learn DSA</a>
        <a class="action-link" href={`${base}/flow/ai-engineer`}>Learn AI / ML</a>
        <a class="action-link" href={`${base}/flow/interview-questions`}>Practice questions</a>
      </div>
      <div class="hero-stat-strip">
        <article class="hero-stat-card">
          <span class="eyebrow">Progress</span>
          <strong>{$completedLessonCount}/{allLessons.length}</strong>
          <p>Saved locally. Export a backup anytime so you do not lose drafts or completion state.</p>
        </article>
        <article class="hero-stat-card">
          <span class="eyebrow">Modules</span>
          <strong>{modules.length}</strong>
          <p>Learning labs plus interview modules, sequenced so the next step stays obvious.</p>
        </article>
        <article class="hero-stat-card">
          <span class="eyebrow">Interactive labs</span>
          <strong>Learn + labs</strong>
          <p>Learn chapters, topic labs, Python ML IDE, simulation, and interview practice — all in-browser.</p>
        </article>
      </div>
    </div>
    <article class="hero-card study-loop-card">
      <p class="eyebrow">Learning loop</p>
      <div class="hero-orbit">
        <div class="hero-orbit-ring hero-orbit-ring-outer"></div>
        <div class="hero-orbit-ring hero-orbit-ring-inner"></div>
        <div class="hero-orbit-core">
          <strong>Learn</strong>
          <span>Concept → lab → practice</span>
        </div>
      </div>
      <h2>Build intuition first, then rehearse under pressure.</h2>
      <p class="hero-note">Use concept labs to understand the idea, project labs to apply it, and interview practice when you are ready to explain trade-offs out loud.</p>
      <div class="study-loop-list">
        {#each siteOverview.studyLoop as step}
          <article class="study-loop-step">
            <strong>{step.title}</strong>
            <p>{step.summary}</p>
            <span>{step.coachNote}</span>
          </article>
        {/each}
      </div>
    </article>
  </div>
</section>

{#if resumeLesson}
  <section class="panel hero-card home-resume-card">
    <div class="curriculum-map-header">
      <div>
        <p class="eyebrow">Resume where you left off</p>
        <h2>{resumeLesson.title}</h2>
        <p class="hero-subtitle">
          {#if resumeFlow}
            {resumeFlow.shortTitle} · {resumeLesson.moduleTitle}
          {:else}
            {resumeLesson.moduleTitle}
          {/if}
        </p>
      </div>
      <a
        class="action-link primary"
        href={`${base}/module/${resumeLesson.moduleSlug}/lesson/${resumeLesson.slug}`}
      >
        Continue lesson
      </a>
    </div>
  </section>
{/if}

{#if $reviewDueToday.length}
  <section class="panel hero-card home-resume-card">
    <div class="curriculum-map-header">
      <div>
        <p class="eyebrow">Review today</p>
        <h2>Resurface lessons you completed earlier</h2>
        <p class="hero-subtitle">Spaced review prioritizes AI Engineer topics (RAG, agents, LLMOps) when due.</p>
      </div>
    </div>
    <ul class="link-stack">
      {#each $reviewDueToday as entry}
        <li>
          <a
            class="nav-link"
            href={`${base}/module/${entry.lesson.moduleSlug}/lesson/${entry.lesson.slug}?learn=1`}
          >
            <strong>{entry.lesson.title}</strong>
            <small>{entry.lesson.moduleTitle}</small>
          </a>
        </li>
      {/each}
    </ul>
  </section>
{/if}

{#if learningPaths.length}
  <section class="panel hero-card">
    <div class="curriculum-map-header">
      <div>
        <p class="eyebrow">Start with a learning path</p>
        <h2>Four skill tracks beyond interview cramming</h2>
        <p class="hero-subtitle">Each path mixes fundamentals, hands-on labs, and optional interview rehearsal.</p>
      </div>
    </div>
    <div class="section-grid hero-featured-grid">
      {#each learningPaths as path}
        <article class="module-card study-track-card">
          <div class="study-track-heading">
            <div>
              <p class="eyebrow">Learning path</p>
              <h2>{path.title}</h2>
            </div>
          </div>
          <p>{path.summary}</p>
          <div class="card-meta">
            {#each path.focus as focusItem}
              <span class="pill">{focusItem}</span>
            {/each}
          </div>
          <div class="action-row">
            <a class="action-link primary" href={`${base}/flow/${path.flowSlug}`}>Open track</a>
            <a class="action-link" href={`${base}/module/${path.startModule}`}>Start {path.startModule.replace(/-/g, ' ')}</a>
          </div>
        </article>
      {/each}
    </div>
  </section>
{/if}

<section class="section-grid hero-featured-grid">
  {#each courseFlows as flow}
    <article class="module-card study-track-card">
      <div class="study-track-heading">
        <div>
          <p class="eyebrow">{flow.shortTitle} track</p>
          <h2>{flow.title}</h2>
        </div>
        <div class="card-meta">
          <span class="pill">{flow.modules.length} modules</span>
        </div>
      </div>
      <p>{flow.description}</p>
      <div class="study-track-meta">
        <article class="section-chip">
          <strong>Best for</strong>
          <span>{flow.audience}</span>
        </article>
        <article class="section-chip">
          <strong>Cadence</strong>
          <span>{flow.cadence}</span>
        </article>
      </div>
      <div class="action-row">
        <a class="action-link primary" href={`${base}/flow/${flow.slug}`}>Open {flow.shortTitle} roadmap</a>
        <a class="action-link" href={`${base}/module/${flow.modules[0].slug}`}>Start with {flow.modules[0].title}</a>
      </div>
    </article>
  {/each}
</section>

<section class="section-grid hero-featured-grid">
  <article class="hero-card home-detail-card">
    <p class="eyebrow">HLD starting points</p>
    <h2>Three strong entry points into systems learning.</h2>
    <div class="hero-featured-modules">
      {#each featuredModules as module, index}
        <a class="featured-module-card" href={`${base}/module/${module.slug}`}>
          <div class="featured-module-header">
            <span class="pill">0{index + 1}</span>
            <span class="eyebrow">{module.lessons.length} lessons</span>
          </div>
          <h3>{module.title}</h3>
          <p>{module.summary}</p>
          <span class="featured-module-link">Open module</span>
        </a>
      {/each}
    </div>
  </article>
  <article class="hero-card home-detail-card home-commitment-card">
    <p class="eyebrow">What changes when this clicks</p>
    <h2>You stop collecting topics and start building judgment.</h2>
    <div class="study-section-list compact-list">
      <article class="study-section-card emphasis-card">
        <strong>Systems intuition</strong>
        <p>You can explain where latency and cost come from, not just name caches, queues, and databases.</p>
      </article>
      <article class="study-section-card emphasis-card">
        <strong>Design judgment</strong>
        <p>Patterns and object models become tools for change, not memorized class diagrams.</p>
      </article>
      <article class="study-section-card emphasis-card">
        <strong>Hands-on AI practice</strong>
        <p>ML and deep-learning exercises run in the browser, so learning loops stay interactive instead of passive.</p>
      </article>
    </div>
  </article>
</section>

<details class="panel hero-card home-collapsible" bind:open={showExtendedResources}>
  <summary class="home-collapsible-summary">
    <span>
      <p class="eyebrow">Extended resources</p>
      <strong>Study tracks, reading list, and curriculum depth map</strong>
    </span>
    <span class="pill">{siteOverview.studyTracks.length} study tracks · {siteOverview.recommendedReading.length} books</span>
  </summary>

  <section class="track-grid study-track-grid home-collapsible-body">
    <article class="hero-card home-detail-card">
      <p class="eyebrow">Study modes</p>
      <h2>Learning paths and interview rehearsal rhythms.</h2>
      <p>{siteOverview.heroGuidance}</p>
    </article>
    {#each siteOverview.studyTracks as track}
      <article class="module-card study-track-card">
        <div class="study-track-heading">
          <div>
            <p class="eyebrow">Study path</p>
            <h2>{track.title}</h2>
          </div>
          <div class="card-meta">
            <span class="pill">{track.steps.length} steps</span>
          </div>
        </div>
        <p>{track.summary}</p>
        <ol class="study-step-list">
          {#each track.steps as step, index}
            <li class="study-step-card">
              <span class="pill">Step {index + 1}</span>
              <strong>{step.title}</strong>
              <p>{step.detail}</p>
            </li>
          {/each}
        </ol>
      </article>
    {/each}
  </section>

  <section class="section-grid home-reference-grid home-collapsible-body">
    <article class="hero-card home-detail-card">
      <p class="eyebrow">How the map builds depth</p>
      <h2>Move from vocabulary to working systems judgment.</h2>
      <div class="study-section-list">
        {#each siteOverview.studyMapSections as section}
          <article class="study-section-card">
            <strong>{section.title}</strong>
            <p>{section.summary}</p>
          </article>
        {/each}
      </div>
    </article>
    <article class="hero-card home-detail-card">
      <p class="eyebrow">Helpful design books</p>
      <h2>Use these references to deepen the lessons, not replace practice.</h2>
      <div class="reading-list">
        {#each siteOverview.recommendedReading as book}
          <article class="reading-card">
            <div>
              <strong>{book.title}</strong>
              <p class="reading-author">{book.author}</p>
            </div>
            <p>{book.focus}</p>
            <span>{book.whyItFits}</span>
          </article>
        {/each}
      </div>
    </article>
  </section>
</details>

<section class="panel hero-card">
  <div class="curriculum-map-header">
    <div>
      <p class="eyebrow">Curriculum map</p>
      <h2>All modules and lesson progress</h2>
      <p class="hero-subtitle">Browse every module across HLD, LLD, DSA, AI, and question-bank tracks. Progress is tracked per lesson.</p>
    </div>
    <ProgressControls />
  </div>
  <div class="module-grid">
    {#each modules as module}
      <article class="module-card">
        <a class="topic-card-link" href={`${base}/module/${module.slug}`}>
          <div>
            <p class="eyebrow">Module</p>
            <h3>{module.title}</h3>
          </div>
          <p>{module.summary}</p>
          <ul>
            {#each module.objectives as objective}
              <li>{objective}</li>
            {/each}
          </ul>
          <div class="card-meta">
            <span class="pill">{module.lessons.length} lessons</span>
            <span class="pill">{getModuleProgress($progress.completedLessonIds, module.slug).completed}/{getModuleProgress($progress.completedLessonIds, module.slug).total} complete</span>
          </div>
        </a>
      </article>
    {/each}
  </div>
</section>

<section class="panel hero-card footer">
  <p class="eyebrow">Sources and attribution</p>
  <p class="footer-copy">{siteOverview.sourceAttribution.note} Selected diagrams originate from <a href={siteOverview.sourceAttribution.url} target="_blank" rel="noreferrer">{siteOverview.sourceAttribution.name}</a> and are licensed under <a href={siteOverview.sourceAttribution.licenseUrl} target="_blank" rel="noreferrer">{siteOverview.sourceAttribution.license}</a>.</p>
</section>
