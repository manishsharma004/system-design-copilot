<svelte:options runes={false} />
<script>
  import { base } from '$app/paths';
  import '../app.css';
  import { page } from '$app/stores';
  import { allLessons, courseFlows, defaultFlow, getFlowBySlug, getModuleProgress, modules, siteOverview } from '$lib/data/courseData';
  import { headerNavHref, headerNavItems, isHeaderNavActive } from '$lib/navigation';
  import { getVisibleSidebarModules } from '$lib/sidebar';
  import { progress } from '$lib/stores/progress';
  import { derived } from 'svelte/store';
  import { onMount } from 'svelte';

  let navOpen = false;
  let desktopNavOpen = true;
  let isDesktop = false;
  let query = '';
  /** @type {Record<string, boolean>} */
  let expandedModules = {};

  const SIDEBAR_STORAGE_KEY = 'system-design-copilot-sidebar-v3';

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
  $: sidebarFlow = activeFlow ?? defaultFlow;
  $: activeLesson = activeModule?.lessons.find((lesson) => normalizedPathname === lessonHref(activeModule.slug, lesson.slug)) ?? null;
  $: activeModuleProgress = activeModule ? $moduleProgress[activeModule.slug] : null;
  $: activeFlowLessonTotal = sidebarFlow ? sidebarFlow.modules.reduce((sum, module) => sum + module.lessons.length, 0) : 0;
  $: activeFlowCompleted = sidebarFlow
    ? sidebarFlow.modules.reduce((sum, module) => sum + ($moduleProgress[module.slug]?.completed ?? 0), 0)
    : 0;
  $: contextTitle = activeLesson?.title ?? activeModule?.title ?? activeFlow?.title ?? sidebarFlow.title;
  $: contextSubtitle = activeLesson
    ? `${activeModule?.title ?? ''} · Lesson ${activeLesson.order} of ${activeModule?.lessons.length ?? 0}`
    : activeModule
      ? `${sidebarFlow.shortTitle ?? 'Course'} · ${activeModule.lessons.length} lessons · ${activeModuleProgress?.completed ?? 0}/${activeModuleProgress?.total ?? 0} complete`
      : activeFlow
        ? `${activeFlow.modules.length} modules · ${activeFlowCompleted}/${activeFlowLessonTotal} lessons complete`
        : `${sidebarFlow.modules.length} modules · ${activeFlowCompleted}/${activeFlowLessonTotal} lessons complete`;
  $: filteredModules = getVisibleSidebarModules({ modules, activeFlow: sidebarFlow, query });
  $: visibleModules = filteredModules.map((module) => ({
    ...module,
    isExpanded: query.trim()
      ? true
      : expandedModules[module.slug] ?? module.slug === activeModule?.slug
  }));
  $: if (!Object.keys(expandedModules).length) {
    expandedModules = Object.fromEntries(filteredModules.map((module) => [module.slug, module.slug === activeModule?.slug]));
  }
  $: if (activeModule && !query.trim() && !expandedModules[activeModule.slug]) {
    expandedModules = {
      ...expandedModules,
      [activeModule.slug]: true
    };
  }
  $: sidebarVisible = isDesktop ? desktopNavOpen : navOpen;
</script>

<svelte:head>
  <title>{siteOverview.title}</title>
  <meta name="description" content={siteOverview.description} />
</svelte:head>

<button aria-label="Close navigation" class:open={!isDesktop && navOpen} class="backdrop" type="button" onclick={closeNavigation}></button>

<div class="shell">
  <header class="app-header">
    <div class="app-header-top">
      <a class="app-header-brand" href={homeHref}>
        <strong>{siteOverview.title}</strong>
        <span>{$progress.completedLessonIds.length} / {lessonTotal} lessons complete</span>
      </a>
      <div class="app-header-context">
        <strong>{contextTitle}</strong>
        <span>{contextSubtitle}</span>
      </div>
      <div class="app-header-actions">
        <span class="pill topbar-progress">{$progress.completedLessonIds.length} / {lessonTotal} complete</span>
        <button class="nav-toggle sidebar-toggle" type="button" aria-expanded={sidebarVisible} onclick={toggleNavigation}>
          {#if isDesktop}
            {desktopNavOpen ? 'Collapse sidebar' : 'Expand sidebar'}
          {:else}
            {navOpen ? 'Close topics' : 'Browse topics'}
          {/if}
        </button>
      </div>
    </div>

    <nav class="app-header-nav" aria-label="Primary">
      {#each headerNavItems as item}
        <a
          class:active={isHeaderNavActive(item, {
            pathname: normalizedPathname,
            homeHref,
            activeFlowSlug: activeFlow?.slug ?? null
          })}
          class="app-header-nav-link"
          href={headerNavHref(item, base)}
        >
          <span class="nav-full">{item.label}</span>
          <span class="nav-short">{item.shortLabel}</span>
        </a>
      {/each}
    </nav>
  </header>

  <div class:desktop-sidebar-collapsed={isDesktop && !desktopNavOpen} class="layout">
    <aside class:open={!isDesktop && navOpen} class:desktop-open={isDesktop && desktopNavOpen} class="sidebar sidebar-compact">
      <div class="sidebar-compact-header">
        <input bind:value={query} type="search" placeholder="Search lessons…" class="sidebar-compact-search" />
        <button class="sidebar-close" type="button" aria-label="Close sidebar" onclick={toggleNavigation}>✕</button>
      </div>

      <div class="sidebar-flow-context">
        <span class="eyebrow">{sidebarFlow.shortTitle} track</span>
        <strong>{sidebarFlow.title}</strong>
        <span>{activeFlowCompleted}/{activeFlowLessonTotal} lessons complete in this track</span>
      </div>

      <nav class="sidebar-compact-nav" aria-label="Course topics">
        {#if visibleModules.length}
          {#each visibleModules as module}
            <div class="sidebar-compact-group">
              <button
                class="sidebar-compact-module"
                class:active-module={module.slug === activeModule?.slug}
                type="button"
                aria-expanded={module.isExpanded}
                onclick={() => toggleModule(module.slug)}
              >
                <span class="sidebar-compact-chevron">{module.isExpanded ? '▾' : '▸'}</span>
                <span class="sidebar-compact-module-title">{module.title}</span>
                <span class="sidebar-compact-count">{$moduleProgress[module.slug]?.completed ?? 0}/{$moduleProgress[module.slug]?.total ?? 0}</span>
              </button>
              {#if module.isExpanded}
                <div class="sidebar-compact-lessons">
                  {#each module.lessons as lesson}
                    <a
                      class:active={normalizedPathname === lessonHref(module.slug, lesson.slug)}
                      class="sidebar-compact-link sidebar-compact-lesson"
                      href={lessonHref(module.slug, lesson.slug)}
                    >
                      <span>{lesson.order}. {lesson.title}</span>
                      {#if $progress.completedLessonIds.includes(lesson.id)}
                        <span class="sidebar-compact-done">✓</span>
                      {/if}
                    </a>
                  {/each}
                </div>
              {/if}
            </div>
          {/each}
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
