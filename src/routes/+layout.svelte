
<script>
  import '$app/environment';
  import '$app/forms';
  import '$app/paths';
  import '../app.css';
  import { page } from '$app/stores';
  import { allLessons, getModuleProgress, modules, siteOverview } from '$lib/data/courseData';
  import { progress } from '$lib/stores/progress';
  import { derived } from 'svelte/store';

  let { children } = $props();
  let navOpen = false;
  let query = '';

  const lessonTotal = allLessons.length;
  const moduleProgress = derived(progress, ($progress) =>
    Object.fromEntries(modules.map((module) => [module.slug, getModuleProgress($progress.completedLessonIds, module.slug)]))
  );

  $: pathname = $page.url.pathname;
  $: filteredModules = modules
    .map((module) => ({
      ...module,
      lessons: module.lessons.filter((lesson) => {
        const haystack = `${module.title} ${module.summary} ${lesson.title} ${lesson.summary}`.toLowerCase();
        return haystack.includes(query.trim().toLowerCase());
      })
    }))
    .filter((module) => query.trim() ? module.lessons.length > 0 || `${module.title} ${module.summary}`.toLowerCase().includes(query.trim().toLowerCase()) : true);

  $: if (pathname) {
    navOpen = false;
  }
</script>

<svelte:head>
  <title>{siteOverview.title}</title>
  <meta name="description" content={siteOverview.description} />
</svelte:head>

<div class:open={navOpen} class="backdrop" on:click={() => (navOpen = false)}></div>

<div class="shell">
  <header class="topbar">
    <button class="nav-toggle" type="button" on:click={() => (navOpen = !navOpen)}>
      {navOpen ? 'Close' : 'Browse'} topics
    </button>
    <div class="brand">
      <strong>{siteOverview.title}</strong>
      <span>{$progress.completedLessonIds.length} / {lessonTotal} lessons complete</span>
    </div>
  </header>

  <div class="layout">
    <aside class:open={navOpen} class="sidebar">
      <section class="sidebar-header panel sidebar-card">
        <div>
          <p class="eyebrow">System design prep</p>
          <h2>{siteOverview.title}</h2>
        </div>
        <p class="muted">{siteOverview.subtitle}</p>
        <a class="action-link primary" href="/">Open curriculum home</a>
      </section>

      <section class="panel sidebar-card sidebar-search">
        <label>
          <span class="eyebrow">Search lessons</span>
          <input bind:value={query} type="search" placeholder="Search modules and topics" />
        </label>
      </section>

      <section class="panel sidebar-card sidebar-stats">
        <article class="stat">
          <span class="eyebrow">Modules</span>
          <strong>{modules.length}</strong>
        </article>
        <article class="stat">
          <span class="eyebrow">Progress</span>
          <strong>{$progress.completedLessonIds.length}/{lessonTotal}</strong>
        </article>
      </section>

      {#if filteredModules.length}
        {#each filteredModules as module}
          <section class="nav-module">
            <div>
              <a class="nav-link {pathname === `/module/${module.slug}` ? 'active' : ''}" href={`/module/${module.slug}`}>
                <strong>{module.title}</strong>
                <small>{module.summary}</small>
              </a>
            </div>
            <span class="pill">{$moduleProgress[module.slug]?.completed ?? 0} / {$moduleProgress[module.slug]?.total ?? 0} complete</span>
            <div class="nav-links">
              {#each module.lessons as lesson}
                <a class="nav-link {pathname === `/module/${module.slug}/lesson/${lesson.slug}` ? 'active' : ''}" href={`/module/${module.slug}/lesson/${lesson.slug}`}>
                  <strong>{lesson.title}</strong>
                  <small>{lesson.summary}</small>
                </a>
              {/each}
            </div>
          </section>
        {/each}
      {:else}
        <div class="empty-note">No lessons matched your search.</div>
      {/if}
    </aside>

    <main class="page">
      {@render children()}
    </main>
  </div>
</div>
