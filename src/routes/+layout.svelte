<svelte:options runes={false} />
<script>
  import { browser } from '$app/environment';
  import { base } from '$app/paths';
  import '../app.css';
  import { page } from '$app/stores';
  import { allLessons, courseFlows, getFlowBySlug, getModuleProgress, modules, siteOverview } from '$lib/data/courseData';
  import { getTrackNavItems, headerNavHref, headerNavItems, isHeaderNavActive } from '$lib/navigation';
  import { getVisibleSidebarModules } from '$lib/sidebar';
  import { progress } from '$lib/stores/progress';
  import PwaUpdateBanner from '$lib/components/PwaUpdateBanner.svelte';
  import { derived } from 'svelte/store';
  import { onMount } from 'svelte';
  import { pwaInfo } from 'virtual:pwa-info';

  let navOpen = false;
  let desktopNavOpen = true;
  let isDesktop = false;
  let query = '';
  /** @type {Record<string, boolean>} */
  let expandedModules = {};
  /** @type {HTMLInputElement | null} */
  let searchInput = null;

  const SIDEBAR_STORAGE_KEY = 'system-design-copilot-sidebar-v4';

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

  /** @param {KeyboardEvent} event */
  function handleGlobalKeydown(event) {
    if (event.key !== '/' || event.metaKey || event.ctrlKey || event.altKey) return;
    const target = /** @type {HTMLElement | null} */ (event.target);
    if (target?.closest('input, textarea, select, [contenteditable="true"]')) return;
    if (!activeFlow) return;
    event.preventDefault();
    if (!sidebarVisible && !isDesktop) {
      navOpen = true;
    }
    searchInput?.focus();
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
    window.addEventListener('keydown', handleGlobalKeydown);

    return () => {
      mediaQuery.removeEventListener('change', syncViewport);
      window.removeEventListener('keydown', handleGlobalKeydown);
    };
  });

  $: pathname = $page.url.pathname;
  $: webManifestLink = pwaInfo ? pwaInfo.webManifest.linkTag : '';
  $: normalizedPathname = pathname !== homeHref && pathname.endsWith('/') ? pathname.slice(0, -1) : pathname;
  $: activeModule = modules.find((module) =>
    normalizedPathname === moduleHref(module.slug) || normalizedPathname.startsWith(`${moduleHref(module.slug)}/lesson/`)
  );
  $: activeFlow = activeModule
    ? getFlowBySlug(activeModule.flowSlug)
    : courseFlows.find((flow) => normalizedPathname === flowHref(flow.slug)) ?? null;
  $: activeLesson = activeModule?.lessons.find((lesson) => normalizedPathname === lessonHref(activeModule.slug, lesson.slug)) ?? null;
  $: isHome = !activeFlow;
  $: activeFlowLessonTotal = activeFlow
    ? activeFlow.modules.reduce((sum, module) => sum + module.lessons.length, 0)
    : 0;
  $: activeFlowCompleted = activeFlow
    ? activeFlow.modules.reduce((sum, module) => sum + ($moduleProgress[module.slug]?.completed ?? 0), 0)
    : 0;
  $: progressByFlow = Object.fromEntries(
    courseFlows.map((flow) => {
      const total = flow.modules.reduce((sum, module) => sum + module.lessons.length, 0);
      const completed = flow.modules.reduce((sum, module) => sum + ($moduleProgress[module.slug]?.completed ?? 0), 0);
      return [flow.slug, { completed, total }];
    })
  );
  $: trackNavItems = getTrackNavItems(courseFlows, base, progressByFlow);
  $: filteredModules = activeFlow
    ? getVisibleSidebarModules({
        modules,
        activeFlow,
        query
      })
    : [];
  $: visibleModules = filteredModules.map((module) => ({
    ...module,
    isExpanded: query.trim()
      ? true
      : expandedModules[module.slug] ?? module.slug === activeModule?.slug
  }));
  $: if (activeFlow && !Object.keys(expandedModules).length) {
    expandedModules = Object.fromEntries(filteredModules.map((module) => [module.slug, module.slug === activeModule?.slug]));
  }
  $: if (activeModule && !query.trim() && !expandedModules[activeModule.slug]) {
    expandedModules = {
      ...expandedModules,
      [activeModule.slug]: true
    };
  }
  $: sidebarVisible = isDesktop ? desktopNavOpen : navOpen;
  $: progressLabel = activeFlow
    ? `${activeFlowCompleted}/${activeFlowLessonTotal} · ${activeFlow.shortTitle}`
    : `${$progress.completedLessonIds.length}/${lessonTotal}`;
</script>

<svelte:head>
  <title>{siteOverview.title}</title>
  <meta name="description" content={siteOverview.description} />
  {@html webManifestLink}
  <meta name="apple-mobile-web-app-capable" content="yes" />
  <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
  <meta name="apple-mobile-web-app-title" content="SD Copilot" />
  <link rel="apple-touch-icon" href={`${base}/favicon.svg`} />
</svelte:head>

<a class="skip-link" href="#main-content">Skip to main content</a>

<button aria-label="Close navigation" class:open={!isDesktop && navOpen} class="backdrop" type="button" onclick={closeNavigation}></button>

<div class="shell">
  <header class="app-header">
    <div class="app-header-top">
      <a class="app-header-brand" href={homeHref}>
        <strong>{siteOverview.title}</strong>
      </a>
      <div class="app-header-actions">
        <span class="pill topbar-progress" title="Lesson completion progress">{progressLabel}</span>
        <button class="nav-toggle sidebar-toggle" type="button" aria-expanded={sidebarVisible} onclick={toggleNavigation}>
          {#if isDesktop}
            {desktopNavOpen ? 'Hide topics' : 'Show topics'}
          {:else}
            {navOpen ? 'Close topics' : 'Topics'}
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
          {item.label}
        </a>
      {/each}
    </nav>
  </header>

  <div class:desktop-sidebar-collapsed={isDesktop && !desktopNavOpen} class="layout">
    <aside class:open={!isDesktop && navOpen} class:desktop-open={isDesktop && desktopNavOpen} class="sidebar sidebar-compact">
      {#if isHome}
        <div class="sidebar-compact-header sidebar-home-header">
          <div class="sidebar-panel-header">
            <span class="eyebrow">Tracks</span>
            <strong>Prep flows</strong>
            <span class="sidebar-panel-meta">{$progress.completedLessonIds.length}/{lessonTotal} lessons complete</span>
          </div>
          <button class="sidebar-close" type="button" aria-label="Close sidebar" onclick={toggleNavigation}>✕</button>
        </div>

        <nav class="sidebar-track-nav" aria-label="Prep tracks">
          {#each trackNavItems as track}
            <a class="sidebar-track-link" href={track.href}>
              <span class="sidebar-track-copy">
                <strong>{track.shortTitle}</strong>
                <span>{track.title}</span>
              </span>
              <span class="sidebar-compact-count">{track.completed}/{track.total}</span>
            </a>
          {/each}
        </nav>
      {:else}
        <div class="sidebar-compact-header">
          <label class="sidebar-search-label">
            <span class="sidebar-search-label-text">Search lessons</span>
            <input bind:this={searchInput} bind:value={query} type="search" placeholder="Search lessons… (press /)" class="sidebar-compact-search" />
          </label>
          <button class="sidebar-close" type="button" aria-label="Close sidebar" onclick={toggleNavigation}>✕</button>
        </div>

        <div class="sidebar-flow-context">
          {#if activeFlow}
            <span class="eyebrow">{activeFlow.shortTitle} track</span>
            <strong>{activeFlow.title}</strong>
            <span>{activeFlowCompleted}/{activeFlowLessonTotal} lessons complete</span>
          {/if}
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
      {/if}
    </aside>

    <main id="main-content" class="page">
      <slot />
    </main>
  </div>

  {#if browser}
    <PwaUpdateBanner />
  {/if}
</div>
