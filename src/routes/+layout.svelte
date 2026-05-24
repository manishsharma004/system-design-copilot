<svelte:options runes={false} />
<script>
  import { base } from '$app/paths';
  import '../app.css';
  import { page } from '$app/stores';
  import { allLessons, getModuleProgress, modules, siteOverview } from '$lib/data/courseData';
  import { progress } from '$lib/stores/progress';
  import { derived } from 'svelte/store';

  let navOpen = false;
  let query = '';

  const lessonTotal = allLessons.length;
  const moduleProgress = derived(progress, ($progress) =>
    Object.fromEntries(modules.map((module) => [module.slug, getModuleProgress($progress.completedLessonIds, module.slug)]))
  );
  const homeHref = `${base}/`;
  /** @param {string} moduleSlug */
  const moduleHref = (moduleSlug) => `${base}/module/${moduleSlug}`;
  /** @param {string} moduleSlug @param {string} lessonSlug */
  const lessonHref = (moduleSlug, lessonSlug) => `${base}/module/${moduleSlug}/lesson/${lessonSlug}`;

  $: pathname = $page.url.pathname;
  $: normalizedPathname = pathname !== homeHref && pathname.endsWith('/') ? pathname.slice(0, -1) : pathname;
  $: activeModule = modules.find((module) =>
    normalizedPathname === moduleHref(module.slug) || normalizedPathname.startsWith(`${moduleHref(module.slug)}/lesson/`)
  );
  $: activeLesson = activeModule?.lessons.find((lesson) => normalizedPathname === lessonHref(activeModule.slug, lesson.slug)) ?? null;
  $: activeModuleProgress = activeModule ? $moduleProgress[activeModule.slug] : null;
  $: contextTitle = activeLesson?.title ?? activeModule?.title ?? siteOverview.title;
  $: contextSubtitle = activeLesson
    ? `${activeModule?.title ?? ''} · Lesson ${activeLesson.order} of ${activeModule?.lessons.length ?? 0}`
    : activeModule
      ? `${activeModule.lessons.length} lessons · ${activeModuleProgress?.completed ?? 0}/${activeModuleProgress?.total ?? 0} complete`
      : siteOverview.subtitle;
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

<button aria-label="Close navigation" class:open={navOpen} class="backdrop" type="button" onclick={() => (navOpen = false)}></button>

<div class="shell">
  <header class="topbar">
    <div class="topbar-main">
      <a class="brand" href={homeHref}>
        <strong>{siteOverview.title}</strong>
        <span>{$progress.completedLessonIds.length} / {lessonTotal} lessons complete</span>
      </a>
      <div class="topbar-context">
        <strong>{contextTitle}</strong>
        <span>{contextSubtitle}</span>
      </div>
    </div>
    <div class="topbar-actions">
      <span class="pill topbar-progress">{$progress.completedLessonIds.length} / {lessonTotal} complete</span>
      <button class="nav-toggle" type="button" onclick={() => (navOpen = !navOpen)}>
        {navOpen ? 'Close' : 'Browse'} topics
      </button>
    </div>
  </header>

  <div class="layout">
    <aside class:open={navOpen} class="sidebar">
      <section class="sidebar-header panel sidebar-card">
        <div class="sidebar-header-row">
          <div>
            <p class="eyebrow">System design prep</p>
            <h2>{siteOverview.title}</h2>
          </div>
          <button class="sidebar-close" type="button" onclick={() => (navOpen = false)}>Close</button>
        </div>
        <div>
          <p class="eyebrow">Current focus</p>
          <h3>{contextTitle}</h3>
        </div>
        <p class="muted">{contextSubtitle}</p>
        <a class="action-link primary" href={homeHref}>Open curriculum home</a>
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
              <a class="nav-link {normalizedPathname === moduleHref(module.slug) ? 'active' : ''}" href={moduleHref(module.slug)}>
                <strong>{module.title}</strong>
                <small>{module.summary}</small>
              </a>
            </div>
            <span class="pill">{$moduleProgress[module.slug]?.completed ?? 0} / {$moduleProgress[module.slug]?.total ?? 0} complete</span>
            <div class="nav-links">
              {#each module.lessons as lesson}
                <a class="nav-link {normalizedPathname === lessonHref(module.slug, lesson.slug) ? 'active' : ''}" href={lessonHref(module.slug, lesson.slug)}>
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
      <slot />
    </main>
  </div>
</div>
