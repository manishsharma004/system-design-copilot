
<script>
  import { completedLessonCount, progress } from '$lib/stores/progress';
  import { getModuleProgress, modules, siteOverview, allLessons } from '$lib/data/courseData';
</script>

<svelte:head>
  <title>{siteOverview.title} · Curriculum</title>
</svelte:head>

<section class="hero panel">
  <div class="hero-grid">
    <div class="hero-card">
      <p class="eyebrow">Complete curriculum</p>
      <h1 class="hero-title">Study system design in the order interviews actually reward.</h1>
      <p class="hero-subtitle">{siteOverview.description}</p>
      <div class="action-row">
        <a class="action-link primary" href={`/module/${modules[0].slug}`}>Start with {modules[0].title}</a>
        <a class="action-link" href={`/module/${modules[modules.length - 1].slug}`}>Jump to case studies</a>
      </div>
      <div class="action-row">
        <span class="pill">{$completedLessonCount} / {allLessons.length} lessons complete</span>
        <span class="pill">Mobile-friendly, multi-page navigation</span>
        <span class="pill">Static build ready for Pages</span>
      </div>
    </div>
    <div class="hero-card">
      <p class="eyebrow">Study loop</p>
      <ul>
        {#each siteOverview.studyLoop as step}
          <li>{step}</li>
        {/each}
      </ul>
    </div>
  </div>
</section>

<section class="track-grid">
  {#each siteOverview.studyTracks as track}
    <article class="module-card">
      <p class="eyebrow">{track.title}</p>
      <p>{track.summary}</p>
      <ul>
        {#each track.steps as step}
          <li>{step}</li>
        {/each}
      </ul>
    </article>
  {/each}
</section>

<section class="panel hero-card">
  <div class="action-row" style="justify-content: space-between; align-items: end;">
    <div>
      <p class="eyebrow">Curriculum map</p>
      <h2>Modules and lesson progress</h2>
    </div>
    <button class="reset-link" type="button" on:click={() => progress.reset()}>Reset progress</button>
  </div>
  <div class="module-grid">
    {#each modules as module}
      <article class="module-card">
        <a class="topic-card-link" href={`/module/${module.slug}`}>
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
          {@const progressState = getModuleProgress($progress.completedLessonIds, module.slug)}
          <div class="card-meta">
            <span class="pill">{module.lessons.length} lessons</span>
            <span class="pill">{progressState.completed}/{progressState.total} complete</span>
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
