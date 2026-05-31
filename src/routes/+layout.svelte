<svelte:options runes={false} />
<script>
  import { base } from '$app/paths';
  import '../app.css';
  import { page } from '$app/stores';
  import { allLessons, courseFlows, getFlowBySlug, getModuleProgress, modules, siteOverview } from '$lib/data/courseData';
  import { progress } from '$lib/stores/progress';
  import { derived } from 'svelte/store';
  import { onMount } from 'svelte';

  let navOpen = false;
  let desktopNavOpen = true;
  let isDesktop = false;
  let query = '';
  /** @type {Record<string, boolean>} */
  let expandedModules = {};

  const SIDEBAR_STORAGE_KEY = 'system-design-copilot-sidebar-v1';

  function loadSidebarState() {
    try {
      const raw = window.localStorage.getItem(SIDEBAR_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object') {
          if (typeof parsed.desktopNavOpen === 'boolean') {
            desktopNavOpen = parsed.desktopNavOpen;
          }
          if (parsed.expandedModules && typeof parsed.expandedModules === 'object') {
            expandedModules = parsed.expandedModules;
          }
        }
      }
    } catch {
      // ignore parse errors
    }
  }

  function saveSidebarState() {
    try {
      window.localStorage.setItem(SIDEBAR_STORAGE_KEY, JSON.stringify({
        desktopNavOpen,
        expandedModules
      }));
    } catch {
      // ignore storage errors
    }
  }

  const lessonTotal = allLessons.length;
  const moduleProgress = derived(progress, ($progress) =>
    Object.fromEntries(modules.map((module) => [module.slug, getModuleProgress($progress.completedLessonIds, module.slug)]))
  );
  const homeHref = `${base}/`;
  /** @param {string} flowSlug */
  const flowHref = (flowSlug) => `${base}/flow/${flowSlug}`;
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
    saveSidebarState();
  }

  function toggleNavigation() {
    if (isDesktop) {
      desktopNavOpen = !desktopNavOpen;
      saveSidebarState();
      return;
    }

    navOpen = !navOpen;
  }

  function closeNavigation() {
    navOpen = false;
  }

  onMount(() => {
    loadSidebarState();

    const mediaQuery = window.matchMedia('(min-width: 1200px)');
    /** @param {MediaQueryList | MediaQueryListEvent} event */
    const syncViewport = (event) => {
      isDesktop = event.matches;
      if (event.matches) {
        navOpen = false;
      }
    };

    syncViewport(mediaQuery);
    mediaQuery.addEventListener('change', syncViewport);

    return () => mediaQuery.removeEventListener('change', syncViewport);
  });

  $: pathname = $page.url.pathname;
  $: normalizedPathname = pathname !== homeHref && pathname.endsWith('/') ? pathname.slice(0, -1) : pathname;
  $: activeModule = modules.find((module) =>
    normalizedPathname === moduleHref(module.slug) || normalizedPathname.startsWith(`${moduleHref(module.slug)}/lesson/`)
  );
  $: activeFlow = activeModule
    ? getFlowBySlug(activeModule.flowSlug)
    : courseFlows.find((flow) => normalizedPathname === flowHref(flow.slug)) ?? null;
  $: activeLesson = activeModule?.lessons.find((lesson) => normalizedPathname === lessonHref(activeModule.slug, lesson.slug)) ?? null;
  $: activeModuleProgress = activeModule ? $moduleProgress[activeModule.slug] : null;
  $: activeFlowLessonTotal = activeFlow ? activeFlow.modules.reduce((sum, module) => sum + module.lessons.length, 0) : 0;
  $: activeFlowCompleted = activeFlow
    ? activeFlow.modules.reduce((sum, module) => sum + ($moduleProgress[module.slug]?.completed ?? 0), 0)
    : 0;
  $: contextTitle = activeLesson?.title ?? activeModule?.title ?? activeFlow?.title ?? siteOverview.title;
  $: contextSubtitle = activeLesson
    ? `${activeModule?.title ?? ''} · Lesson ${activeLesson.order} of ${activeModule?.lessons.length ?? 0}`
    : activeModule
      ? `${activeFlow?.shortTitle ?? 'Course'} · ${activeModule.lessons.length} lessons · ${activeModuleProgress?.completed ?? 0}/${activeModuleProgress?.total ?? 0} complete`
      : activeFlow
        ? `${activeFlow.modules.length} modules · ${activeFlowCompleted}/${activeFlowLessonTotal} lessons complete`
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

  $: sidebarVisible = isDesktop ? desktopNavOpen : navOpen;
</script>

<svelte:head>
  <title>{siteOverview.title}</title>
  <meta name="description" content={siteOverview.description} />
</svelte:head>

<button aria-label="Close navigation" class:open={!isDesktop && navOpen} class="backdrop" type="button" onclick={closeNavigation}></button>

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
      <button class="nav-toggle" type="button" aria-expanded={sidebarVisible} onclick={toggleNavigation}>
        {#if isDesktop}
          {desktopNavOpen ? 'Collapse sidebar' : 'Expand sidebar'}
        {:else}
          {navOpen ? 'Close topics' : 'Browse topics'}
        {/if}
      </button>
    </div>
  </header>

  <div class:desktop-sidebar-collapsed={isDesktop && !desktopNavOpen} class="layout">
    <aside class:open={!isDesktop && navOpen} class:desktop-open={isDesktop && desktopNavOpen} class="sidebar sidebar-compact">
      <div class="sidebar-compact-header">
        <input bind:value={query} type="search" placeholder="Search lessons…" class="sidebar-compact-search" />
        <button class="sidebar-close" type="button" onclick={toggleNavigation}>✕</button>
      </div>

      <nav class="sidebar-compact-nav">
        <div class="sidebar-compact-group">
          <span class="sidebar-compact-label">Flows</span>
          {#each courseFlows as flow}
            <a class:active={normalizedPathname === flowHref(flow.slug)} class="sidebar-menu-item" href={flowHref(flow.slug)}>
              <span class="sidebar-menu-icon">◈</span>
              <span class="sidebar-menu-text">{flow.title}</span>
              <span class="sidebar-menu-chevron">›</span>
            </a>
          {/each}
        </div>

        {#if visibleModules.length}
          <div class="sidebar-compact-group">
            <span class="sidebar-compact-label">Modules</span>
            {#each visibleModules as module}
              <button
                class="sidebar-menu-item"
                class:active={module.slug === activeModule?.slug}
                type="button"
                aria-expanded={module.isExpanded}
                onclick={() => toggleModule(module.slug)}
              >
                <span class="sidebar-menu-icon">◎</span>
                <span class="sidebar-menu-text">{module.title}</span>
                <span class="sidebar-menu-badge">{$moduleProgress[module.slug]?.completed ?? 0}/{$moduleProgress[module.slug]?.total ?? 0}</span>
                <span class="sidebar-menu-chevron">›</span>
              </button>
              {#if module.isExpanded}
                <div class="sidebar-compact-lessons">
                  {#each module.lessons as lesson}
                    <a class:active={normalizedPathname === lessonHref(module.slug, lesson.slug)} class="sidebar-menu-item sidebar-menu-item--nested" href={lessonHref(module.slug, lesson.slug)}>
                      <span class="sidebar-menu-icon sidebar-menu-icon--small">○</span>
                      <span class="sidebar-menu-text">{lesson.order}. {lesson.title}</span>
                      {#if $progress.completedLessonIds.includes(lesson.id)}
                        <span class="sidebar-menu-done">✓</span>
                      {/if}
                      <span class="sidebar-menu-chevron">›</span>
                    </a>
                  {/each}
                </div>
              {/if}
            {/each}
          </div>
        {:else}
          <p class="sidebar-compact-empty">No lessons matched your search.</p>
        {/if}
      </nav>
    </aside>

    <main class="page">
      <slot />
    </main>
  </div>
</div>
