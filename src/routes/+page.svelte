<svelte:options runes={false} />
<script>
  import { base } from '$app/paths';
  import { completedLessonCount, progress } from '$lib/stores/progress';
  import { getModuleProgress, modules, siteOverview, allLessons } from '$lib/data/courseData';
</script>

<svelte:head>
  <title>{siteOverview.title} · Curriculum</title>
</svelte:head>

<section class="hero panel">
  <div class="hero-grid home-hero-grid">
    <div class="hero-card hero-primary-card">
      <p class="eyebrow">Complete curriculum</p>
      <h1 class="hero-title">Study system design in the order interviews actually reward.</h1>
      <p class="hero-subtitle">{siteOverview.description}</p>
      <p class="hero-guidance">{siteOverview.heroGuidance}</p>
      <div class="action-row">
        <a class="action-link primary" href={`${base}/module/${modules[0].slug}`}>Start with {modules[0].title}</a>
        <a class="action-link" href={`${base}/module/${modules[modules.length - 1].slug}`}>Jump to case studies</a>
      </div>
      <div class="action-row">
        <span class="pill">{$completedLessonCount} / {allLessons.length} lessons complete</span>
        <span class="pill">Interactive practice labs with saved drafts</span>
        <span class="pill">Reveal sample answers and interview-ready code on demand</span>
      </div>
      <div class="hero-highlight-grid">
        {#each siteOverview.studyMapSections as section}
          <article class="section-chip">
            <strong>{section.title}</strong>
            <span>{section.summary}</span>
          </article>
        {/each}
      </div>
    </div>
    <article class="hero-card study-loop-card">
      <p class="eyebrow">Session loop</p>
      <h2>Use the same four-part rhythm in every practice session.</h2>
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

<section class="track-grid study-track-grid">
  {#each siteOverview.studyTracks as track}
    <article class="module-card study-track-card">
      <div class="study-track-heading">
        <div>
          <p class="eyebrow">Study path</p>
          <h2>{track.title}</h2>
        </div>
        <div class="card-meta">
          <span class="pill">{track.steps.length} detailed steps</span>
        </div>
      </div>
      <p>{track.summary}</p>
      <div class="study-track-meta">
        <article class="section-chip">
          <strong>Best for</strong>
          <span>{track.bestFor}</span>
        </article>
        <article class="section-chip">
          <strong>Cadence</strong>
          <span>{track.cadence}</span>
        </article>
        <article class="section-chip">
          <strong>What success looks like</strong>
          <span>{track.outcome}</span>
        </article>
      </div>
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

<section class="section-grid home-reference-grid">
  <article class="hero-card home-detail-card">
    <p class="eyebrow">How the map builds depth</p>
    <h2>Move from design vocabulary to product-shaped systems.</h2>
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

<section class="panel hero-card">
  <div class="curriculum-map-header">
    <div>
      <p class="eyebrow">Curriculum map</p>
      <h2>Modules and lesson progress</h2>
      <p class="hero-subtitle">Each module adds a new design muscle: estimation, interfaces, storage, distributed coordination, reliability, security, and finally full case-study synthesis.</p>
    </div>
    <button class="reset-link" type="button" onclick={() => progress.reset()}>Reset progress</button>
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
