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
  /** @type {Record<string, boolean>} */
  let expandedModules = {};

  const lessonTotal = allLessons.length;
  const moduleProgress = derived(progress, ($progress) =>
    Object.fromEntries(modules.map((module) => [module.slug, getModuleProgress($progress.completedLessonIds, module.slug)]))
  );
  const homeHref = `${base}/`;
  /** @param {string} moduleSlug */
  const moduleHref = (moduleSlug) => `${base}/module/${moduleSlug}`;
  /** @param {string} moduleSlug @param {string} lessonSlug */
  const lessonHref = (moduleSlug, lessonSlug) => `${base}/module/${moduleSlug}/lesson/${lessonSlug}`;

  /** @param {string} moduleSlug */
  function toggleModule(moduleSlug) {
    expandedModules = {
      ...expandedModules,
      [moduleSlug]: !(expandedModules[moduleSlug] ?? false)
    };
  }

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
  $: currentLessonIndex = activeModule && activeLesson
    ? activeModule.lessons.findIndex((lesson) => lesson.slug === activeLesson.slug)
    : -1;
  $: previousLesson = activeModule && currentLessonIndex > 0 ? activeModule.lessons[currentLessonIndex - 1] : null;
  $: nextLesson = activeModule && currentLessonIndex > -1 && currentLessonIndex < activeModule.lessons.length - 1
    ? activeModule.lessons[currentLessonIndex + 1]
    : null;
  $: filteredModules = modules
    .map((module) => ({
      ...module,
      lessons: module.lessons.filter((lesson) => {
        const haystack = `${module.title} ${module.summary} ${lesson.title} ${lesson.summary}`.toLowerCase();
        return haystack.includes(query.trim().toLowerCase());
      })
    }))
    .filter((module) => query.trim() ? module.lessons.length > 0 || `${module.title} ${module.summary}`.toLowerCase().includes(query.trim().toLowerCase()) : true);
  $: visibleModules = filteredModules.map((module) => ({
    ...module,
    isExpanded: query.trim()
      ? true
      : expandedModules[module.slug] ?? module.slug === activeModule?.slug
  }));

  $: if (!Object.keys(expandedModules).length) {
    expandedModules = Object.fromEntries(modules.map((module) => [module.slug, module.slug === activeModule?.slug]));
  }

  $: if (activeModule && !query.trim() && !expandedModules[activeModule.slug]) {
    expandedModules = {
      ...expandedModules,
      [activeModule.slug]: true
    };
  }

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
            <p class="eyebrow">Curriculum explorer</p>
            <h2>{siteOverview.title}</h2>
          </div>
          <button class="sidebar-close" type="button" onclick={() => (navOpen = false)}>Close</button>
        </div>
        <p class="muted">Browse one module at a time, keep the active lesson visible, and jump directly to the next useful topic.</p>
      </section>

      <section class="panel sidebar-card sidebar-context-card">
        <div>
          <p class="eyebrow">You are here</p>
          <h3>{contextTitle}</h3>
        </div>
        <p class="muted">{contextSubtitle}</p>
        {#if activeModule}
          <div class="sidebar-current-meta">
            <span class="pill">{$moduleProgress[activeModule.slug]?.completed ?? 0} / {$moduleProgress[activeModule.slug]?.total ?? 0} complete</span>
            <a class="action-link" href={moduleHref(activeModule.slug)}>{activeModule.title}</a>
          </div>
        {/if}
        <div class="sidebar-quick-links">
          <a class="action-link primary" href={homeHref}>Curriculum home</a>
          {#if previousLesson}
            <a class="action-link" href={lessonHref(activeModule?.slug ?? '', previousLesson.slug)}>← {previousLesson.title}</a>
          {/if}
          {#if nextLesson}
            <a class="action-link" href={lessonHref(activeModule?.slug ?? '', nextLesson.slug)}>{nextLesson.title} →</a>
          {/if}
        </div>
      </section>

      <section class="panel sidebar-card sidebar-search">
        <label>
          <span class="eyebrow">Search lessons</span>
          <input bind:value={query} type="search" placeholder="Search modules and topics" />
        </label>
      </section>

      <section class="panel sidebar-card sidebar-stats sidebar-stats-wide">
        <article class="stat">
          <span class="eyebrow">Modules</span>
          <strong>{modules.length}</strong>
        </article>
        <article class="stat">
          <span class="eyebrow">Lessons</span>
          <strong>{lessonTotal}</strong>
        </article>
        <article class="stat">
          <span class="eyebrow">Progress</span>
          <strong>{$progress.completedLessonIds.length}/{lessonTotal}</strong>
        </article>
      </section>

      <section class="sidebar-card panel">
        <div class="sidebar-section-heading">
          <div>
            <p class="eyebrow">Browse by module</p>
            <h3>Open one thread at a time</h3>
          </div>
          <span class="pill">{visibleModules.length} shown</span>
        </div>

        {#if visibleModules.length}
          <div class="sidebar-module-list">
            {#each visibleModules as module}
              <section class:active-module={module.slug === activeModule?.slug} class="nav-module explorer-module">
                <button class="module-toggle" type="button" onclick={() => toggleModule(module.slug)}>
                  <div class="module-toggle-copy">
                    <strong>{module.title}</strong>
                    <small>{module.summary}</small>
                  </div>
                  <div class="module-toggle-meta">
                    <span class="pill">{$moduleProgress[module.slug]?.completed ?? 0} / {$moduleProgress[module.slug]?.total ?? 0}</span>
                    <span class="module-toggle-label">{module.isExpanded ? 'Hide' : 'Show'}</span>
                  </div>
                </button>
                {#if module.isExpanded}
                  <div class="nav-links nav-links-dense">
                    {#each module.lessons as lesson}
                      <a class:active={normalizedPathname === lessonHref(module.slug, lesson.slug)} class="nav-link nav-link-lesson" href={lessonHref(module.slug, lesson.slug)}>
                        <div class="nav-link-row">
                          <strong>{lesson.order}. {lesson.title}</strong>
                          <span class:done={$progress.completedLessonIds.includes(lesson.id)} class="progress-badge">{$progress.completedLessonIds.includes(lesson.id) ? 'Done' : 'Open'}</span>
                        </div>
                        <small>{lesson.summary}</small>
                      </a>
                    {/each}
                  </div>
                {/if}
              </section>
            {/each}
          </div>
        {:else}
          <div class="empty-note">No lessons matched your search.</div>
        {/if}
      </section>
    </aside>

    <main class="page">
      <slot />
    </main>
  </div>
</div>
