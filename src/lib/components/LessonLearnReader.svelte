<svelte:options runes={false} />
<script>
  import { base } from '$app/paths';
  import { onDestroy, tick } from 'svelte';
  import MermaidDiagram from '$lib/components/MermaidDiagram.svelte';
  import LessonCodeSnippet from '$lib/components/LessonCodeSnippet.svelte';
  import SelectionSearchPopup from '$lib/components/SelectionSearchPopup.svelte';
  import { buildLessonAnswerContext, getLikelyAnswerPoints } from '$lib/interviewAnswers';

  /** @type {boolean} */
  export let open = false;
  /** @type {any} */
  export let lesson;
  /** @type {any} */
  export let learnChapter = null;
  /** @type {string} */
  export let moduleTitle = '';
  /** @type {() => void} */
  export let onClose = () => {};

  /** @type {HTMLDivElement | undefined} */
  let dialogEl;
  /** @type {HTMLElement | undefined} */
  let contentEl;
  /** @type {HTMLButtonElement | undefined} */
  let closeButton;
  let previouslyFocused = /** @type {HTMLElement | null} */ (null);
  let bodyOverflow = '';
  let wasOpen = false;
  let activeSectionId = 'learn-premise';
  /** @type {Set<string>} */
  let visitedSectionIds = new Set(['learn-premise']);
  /** @type {IntersectionObserver | null} */
  let sectionObserver = null;

  const POSITION_KEY = 'system-design-copilot-learn-position-v1';

  $: if (open && !wasOpen) {
    wasOpen = true;
    openReader();
  } else if (!open && wasOpen) {
    wasOpen = false;
    persistPosition();
    closeReaderEffects();
  }

  $: outline = learnChapter
    ? [
        { id: 'learn-premise', label: 'Premise' },
        ...learnChapter.parts.map((/** @type {{ id: string, heading: string }} */ part) => ({
          id: `learn-part-${part.id}`,
          label: part.heading
        })),
        { id: 'learn-wrap-up', label: 'Wrap-up' }
      ]
    : [
        { id: 'learn-premise', label: 'Premise' },
        { id: 'learn-framing', label: 'Interview framing' },
        ...(lesson?.sections ?? []).map((/** @type {{ heading: string }} */ section) => ({
          id: `learn-section-${sectionId(section.heading)}`,
          label: section.heading
        })),
        ...(lesson?.deepKnowledge ? [{ id: 'learn-deep', label: 'Deep dive' }] : []),
        { id: 'learn-wrap-up', label: 'Wrap-up' }
      ];

  $: answerContext = lesson ? buildLessonAnswerContext(lesson) : [];
  $: activeIndex = Math.max(
    0,
    outline.findIndex((item) => item.id === activeSectionId)
  );
  $: progressLabel =
    outline.length > 0 ? `Part ${activeIndex + 1} of ${outline.length}` : '';
  $: progressRatio = outline.length ? Math.round(((activeIndex + 1) / outline.length) * 100) : 0;

  async function openReader() {
    if (typeof document === 'undefined') return;
    previouslyFocused = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    bodyOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    activeSectionId = 'learn-premise';
    visitedSectionIds = new Set(['learn-premise']);
    await tick();
    closeButton?.focus();
    setupSectionObserver();
    restorePosition();
  }

  function closeReaderEffects() {
    teardownSectionObserver();
    if (typeof document === 'undefined') return;
    document.body.style.overflow = bodyOverflow || '';
    previouslyFocused?.focus?.();
    previouslyFocused = null;
  }

  function requestClose() {
    persistPosition();
    onClose();
  }

  function setupSectionObserver() {
    teardownSectionObserver();
    if (!contentEl || typeof IntersectionObserver === 'undefined') return;

    sectionObserver = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        const top = visible[0]?.target;
        if (!(top instanceof HTMLElement) || !top.id) return;
        activeSectionId = top.id;
        if (!visitedSectionIds.has(top.id)) {
          visitedSectionIds = new Set([...visitedSectionIds, top.id]);
        }
      },
      {
        root: contentEl,
        rootMargin: '-12% 0px -55% 0px',
        threshold: [0.15, 0.35, 0.6]
      }
    );

    for (const item of outline) {
      const node = contentEl.querySelector(`#${CSS.escape(item.id)}`);
      if (node) sectionObserver.observe(node);
    }
  }

  function teardownSectionObserver() {
    sectionObserver?.disconnect();
    sectionObserver = null;
  }

  function persistPosition() {
    if (typeof localStorage === 'undefined' || !lesson?.id || !contentEl) return;
    try {
      const payload = {
        sectionId: activeSectionId,
        scrollTop: contentEl.scrollTop,
        updatedAt: Date.now()
      };
      localStorage.setItem(`${POSITION_KEY}:${lesson.id}`, JSON.stringify(payload));
    } catch {
      // Ignore storage failures.
    }
  }

  function restorePosition() {
    if (typeof localStorage === 'undefined' || !lesson?.id || !contentEl) return;
    try {
      const raw = localStorage.getItem(`${POSITION_KEY}:${lesson.id}`);
      if (!raw) return;
      const saved = JSON.parse(raw);
      const sectionIdValue = typeof saved?.sectionId === 'string' ? saved.sectionId : '';
      const target = sectionIdValue ? contentEl.querySelector(`#${CSS.escape(sectionIdValue)}`) : null;
      if (target instanceof HTMLElement) {
        target.scrollIntoView({ block: 'start' });
        activeSectionId = sectionIdValue;
      } else if (typeof saved?.scrollTop === 'number') {
        contentEl.scrollTop = saved.scrollTop;
      }
    } catch {
      // Ignore corrupt storage.
    }
  }

  /** @param {KeyboardEvent} event */
  function handleKeydown(event) {
    if (!open) return;
    if (event.key === 'Escape') {
      event.preventDefault();
      requestClose();
      return;
    }
    if (event.key !== 'Tab' || !dialogEl) return;

    const focusable = dialogEl.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const items = Array.from(focusable).filter(
      (node) => node instanceof HTMLElement && !node.hasAttribute('disabled')
    );
    if (!items.length) return;
    const first = items[0];
    const last = items[items.length - 1];
    const active = document.activeElement;

    if (event.shiftKey && active === first) {
      event.preventDefault();
      if (last instanceof HTMLElement) last.focus();
    } else if (!event.shiftKey && active === last) {
      event.preventDefault();
      if (first instanceof HTMLElement) first.focus();
    }
  }

  /** @param {string} heading */
  function sectionId(heading) {
    return heading.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  }

  /** @param {MouseEvent & { currentTarget: HTMLAnchorElement }} event */
  function jumpToSection(event) {
    event.preventDefault();
    const href = event.currentTarget.getAttribute('href');
    if (!href || !contentEl) return;
    const target = contentEl.querySelector(href);
    if (target instanceof HTMLElement) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      activeSectionId = href.slice(1);
      visitedSectionIds = new Set([...visitedSectionIds, activeSectionId]);
    }
  }

  onDestroy(() => {
    persistPosition();
    closeReaderEffects();
  });
</script>

<svelte:window onkeydown={handleKeydown} />

{#if open && lesson}
  <!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
  <div class="learn-reader-backdrop" onclick={requestClose}>
    <div
      class="learn-reader-dialog"
      bind:this={dialogEl}
      role="dialog"
      aria-modal="true"
      aria-label={`Learn chapter: ${learnChapter?.title || lesson.title}`}
      tabindex="-1"
      onclick={(event) => event.stopPropagation()}
    >
      <header class="learn-reader-header">
        <div>
          <p class="eyebrow">Learn · {moduleTitle}</p>
          <h2>{learnChapter?.title || lesson.title}</h2>
          <p class="learn-reader-meta">
            {learnChapter?.readingTime || lesson.duration || 'Reading'}
            · {progressLabel}
            · select any phrase for Search with AI
          </p>
          <div class="learn-reader-progress" aria-hidden="true">
            <span style={`width:${progressRatio}%`}></span>
          </div>
        </div>
        <button class="action-link" type="button" bind:this={closeButton} onclick={requestClose}>
          Close
        </button>
      </header>

      <div class="learn-reader-shell">
        <nav class="learn-reader-outline" aria-label="Chapter outline">
          {#each outline as item}
            <a
              class:active={item.id === activeSectionId}
              class:visited={visitedSectionIds.has(item.id)}
              href={`#${item.id}`}
              onclick={jumpToSection}
            >
              {item.label}
            </a>
          {/each}
        </nav>

        <div class="learn-reader-content" bind:this={contentEl}>
          <SelectionSearchPopup
            rootEl={contentEl}
            lessonTitle={learnChapter?.title || lesson.title}
            moduleTitle={moduleTitle}
          />

          <article class="learn-reader-section" id="learn-premise">
            <p class="eyebrow">Premise</p>
            <h3>{lesson.title}</h3>
            <p>{learnChapter?.premise || lesson.summary}</p>
          </article>

          {#if learnChapter}
            {#each learnChapter.parts as part}
              <article class="learn-reader-section" id={`learn-part-${part.id}`}>
                <h3>{part.heading}</h3>
                {#if part.mermaid}
                  <div class="learn-part-diagram">
                    <MermaidDiagram diagram={part.mermaid} />
                  </div>
                {/if}
                {#each part.paragraphs as paragraph}
                  <p>{paragraph}</p>
                {/each}

                {#if part.keyTerms?.length}
                  <div class="learn-key-terms">
                    <p class="eyebrow">Key terms</p>
                    <dl>
                      {#each part.keyTerms as item}
                        <div>
                          <dt>{item.term}</dt>
                          <dd>{item.definition}</dd>
                        </div>
                      {/each}
                    </dl>
                  </div>
                {/if}

                {#if part.callout}
                  <aside class={`learn-callout tone-${part.callout.tone}`}>
                    <p class="eyebrow">{part.callout.tone}</p>
                    <p>{part.callout.body}</p>
                  </aside>
                {/if}

                {#if part.workedExample}
                  <div class="learn-worked-example">
                    <p class="eyebrow">Worked example</p>
                    <h4>{part.workedExample.title}</h4>
                    <p>{part.workedExample.body}</p>
                    {#if part.workedExample.code}
                      <LessonCodeSnippet
                        title={part.workedExample.title}
                        language={part.workedExample.language || 'python'}
                        languageLabel={(part.workedExample.language || 'python').toUpperCase()}
                        code={part.workedExample.code}
                      />
                    {/if}
                  </div>
                {/if}

                {#if part.checkYourself?.length}
                  <div class="learn-checks">
                    <p class="eyebrow">Check yourself</p>
                    {#each part.checkYourself as item}
                      <details class="prompt-answer-toggle">
                        <summary>{item.prompt}</summary>
                        <p>{item.reveal}</p>
                      </details>
                    {/each}
                  </div>
                {/if}
              </article>
            {/each}
          {:else}
            <article class="learn-reader-section" id="learn-framing">
              <p class="eyebrow">Interview framing</p>
              <h3>Why this lesson matters</h3>
              <p>{lesson.whyItMatters}</p>
            </article>

            {#each lesson.sections ?? [] as section}
              <article class="learn-reader-section" id={`learn-section-${sectionId(section.heading)}`}>
                <h3>{section.heading}</h3>
                <p>{section.body}</p>
                {#if section.bullets?.length}
                  <ul class="prompt-answer-list">
                    {#each section.bullets as bullet}
                      <li>
                        <p>{bullet}</p>
                        <details class="prompt-answer-toggle">
                          <summary>Show likely answer</summary>
                          <ul>
                            {#each getLikelyAnswerPoints(bullet, [section.body, ...(section.bullets ?? []), ...answerContext], lesson.checklist ?? []) as answerPoint}
                              <li>{answerPoint}</li>
                            {/each}
                          </ul>
                        </details>
                      </li>
                    {/each}
                  </ul>
                {/if}
                {#if section.codeExample}
                  <LessonCodeSnippet
                    title={section.codeExample.title}
                    language={section.codeExample.language ?? 'python'}
                    languageLabel={section.codeExample.languageLabel ?? 'Python'}
                    code={section.codeExample.code}
                  />
                {/if}
              </article>
            {/each}

            {#if lesson.deepKnowledge}
              <article class="learn-reader-section" id="learn-deep">
                <p class="eyebrow">Deep dive</p>
                <h3>Deeper knowledge</h3>
                {#each lesson.deepKnowledge.insights as insight}
                  <h4>{insight.heading}</h4>
                  <p>{insight.body}</p>
                {/each}
              </article>
            {/if}
          {/if}

          <article class="learn-reader-section" id="learn-wrap-up">
            <p class="eyebrow">Wrap-up</p>
            <h3>Takeaways</h3>
            <ul>
              {#each learnChapter?.wrapUp?.takeaways || lesson.checklist || [] as item}
                <li>{item}</li>
              {/each}
            </ul>
            {#if learnChapter?.wrapUp?.nextSteps?.length}
              <h4>Next steps</h4>
              <ul>
                {#each learnChapter.wrapUp.nextSteps as step}
                  <li>
                    {#if typeof step === 'string'}
                      {step}
                    {:else}
                      <a href={`${base}${step.href}`}>{step.label}</a>
                    {/if}
                  </li>
                {/each}
              </ul>
            {:else if lesson.pitfalls?.length}
              <h4>Watch for these pitfalls</h4>
              <ul>
                {#each lesson.pitfalls as pitfall}
                  <li>{pitfall}</li>
                {/each}
              </ul>
            {/if}
          </article>
        </div>
      </div>
    </div>
  </div>
{/if}

<style>
  .learn-reader-backdrop {
    position: fixed;
    inset: 0;
    z-index: 70;
    display: grid;
    place-items: center;
    padding: 1rem;
    background: var(--backdrop, rgba(8, 8, 16, 0.72));
    backdrop-filter: blur(8px);
  }

  .learn-reader-dialog {
    width: min(72rem, 100%);
    height: min(92vh, 100%);
    display: grid;
    grid-template-rows: auto 1fr;
    overflow: hidden;
    border: 1px solid var(--border);
    border-radius: 1rem;
    background: var(--panel);
    box-shadow: var(--shadow, 0 24px 64px rgba(0, 0, 0, 0.45));
  }

  .learn-reader-header {
    display: flex;
    justify-content: space-between;
    gap: 1rem;
    align-items: start;
    padding: 1rem 1.15rem;
    border-bottom: 1px solid var(--border);
  }

  .learn-reader-header h2 {
    margin: 0.15rem 0 0;
    font-size: clamp(1.15rem, 2vw, 1.55rem);
  }

  .learn-reader-meta {
    margin: 0.35rem 0 0;
    color: var(--muted, #a1a1aa);
    font-size: 0.85rem;
  }

  .learn-reader-progress {
    margin-top: 0.65rem;
    height: 0.4rem;
    border-radius: 999px;
    background: color-mix(in srgb, var(--border) 70%, #000 30%);
    overflow: hidden;
    width: min(18rem, 100%);
  }

  .learn-reader-progress span {
    display: block;
    height: 100%;
    min-width: 0.4rem;
    background: var(--accent);
    box-shadow: 0 0 0 1px color-mix(in srgb, var(--accent) 40%, transparent);
  }

  .learn-reader-shell {
    display: grid;
    grid-template-columns: minmax(11rem, 15rem) 1fr;
    min-height: 0;
  }

  .learn-reader-outline {
    display: grid;
    align-content: start;
    gap: 0.35rem;
    padding: 1rem 0.85rem;
    border-right: 1px solid var(--border);
    overflow: auto;
    background: color-mix(in srgb, var(--panel) 88%, #000 12%);
  }

  .learn-reader-outline a {
    color: var(--text);
    text-decoration: none;
    font-size: 0.82rem;
    line-height: 1.35;
    padding: 0.4rem 0.5rem;
    border-radius: 0.45rem;
    opacity: 0.78;
  }

  .learn-reader-outline a.visited {
    opacity: 1;
  }

  .learn-reader-outline a:hover {
    background: color-mix(in srgb, var(--accent) 18%, transparent);
  }

  .learn-reader-outline a.active {
    opacity: 1;
    background: color-mix(in srgb, var(--accent) 24%, transparent);
    box-shadow: inset 2px 0 0 var(--accent);
  }

  .learn-reader-content {
    overflow: auto;
    padding: 1.25rem 1.4rem 2rem;
    scroll-behavior: smooth;
  }

  .learn-reader-section {
    max-width: 46rem;
    margin: 0 auto 1.75rem;
    line-height: 1.7;
  }

  .learn-reader-section h3 {
    margin: 0 0 0.75rem;
    font-size: 1.25rem;
  }

  .learn-reader-section h4 {
    margin: 1rem 0 0.4rem;
    font-size: 1rem;
  }

  .learn-reader-section p,
  .learn-reader-section li {
    color: var(--text);
  }

  .learn-key-terms {
    margin-top: 1rem;
    padding: 0.85rem 1rem;
    border: 1px solid var(--border);
    border-radius: 0.75rem;
    background: color-mix(in srgb, var(--surface, #2b2c40) 80%, transparent);
  }

  .learn-key-terms dl {
    display: grid;
    gap: 0.65rem;
    margin: 0.5rem 0 0;
  }

  .learn-key-terms dt {
    font-weight: 650;
  }

  .learn-key-terms dd {
    margin: 0.15rem 0 0;
    color: var(--muted, #a1a1aa);
  }

  .learn-callout {
    margin-top: 1rem;
    padding: 0.85rem 1rem;
    border-radius: 0.75rem;
    border: 1px solid var(--border);
  }

  .learn-callout.tone-tip {
    border-color: color-mix(in srgb, var(--accent) 55%, var(--border));
  }

  .learn-callout.tone-warning {
    border-color: color-mix(in srgb, #f59e0b 55%, var(--border));
  }

  .learn-callout.tone-interview {
    border-color: color-mix(in srgb, #22d3ee 55%, var(--border));
  }

  .learn-worked-example,
  .learn-checks {
    margin-top: 1rem;
  }

  .learn-checks details,
  .learn-reader-section details {
    margin-top: 0.55rem;
  }

  @media (max-width: 860px) {
    .learn-reader-shell {
      grid-template-columns: 1fr;
    }

    .learn-reader-outline {
      display: flex;
      gap: 0.35rem;
      overflow-x: auto;
      border-right: none;
      border-bottom: 1px solid var(--border);
      padding: 0.75rem;
    }

    .learn-reader-outline a {
      white-space: nowrap;
    }

    .learn-reader-content {
      padding: 1rem;
    }
  }
</style>
