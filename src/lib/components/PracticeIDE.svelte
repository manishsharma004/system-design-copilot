<svelte:options runes={false} />
<script>
  import { onDestroy } from 'svelte';
  import { practiceAnswers } from '$lib/stores/practice';
  import IDEWorkspace from '$lib/components/IDEWorkspace.svelte';
  import LlmAssistantPanel from '$lib/components/LlmAssistantPanel.svelte';
  import { getLessonPracticeSteps } from '$lib/data/courseData';
  import { buildMarkdownMetadata, markdownCompletions } from '$lib/editor/exerciseMetadata';
  import {
    buildWorkspaceId,
    createSeedFile,
    findFileByPath,
    resetWorkspace
  } from '$lib/editor/workspace';
  import { getAttemptTimerElapsed, resolveAttemptTimer } from '$lib/stores/practiceTimer';
  import {
    formatPhaseTargetLabel,
    formatPracticeDuration,
    getPracticePhaseLimitMs
  } from '$lib/practicePhaseLimits';

  /** @type {any} */
  export let lesson;

  /** @type {any[]} */
  let steps = [];
  let currentStepIndex = 0;
  let activeKey = '';
  let draft = '';
  let workspaceReady = false;
  /** @type {any} */
  let ideWorkspace;
  let timerNow = Date.now();
  /** @type {ReturnType<typeof setInterval> | null} */
  let timerIntervalId = null;

  $: steps = getLessonPracticeSteps(lesson);
  $: currentStep = steps[currentStepIndex];
  $: currentKey = `${lesson.id}/${currentStep?.id ?? ''}`;
  $: savedEntry = $practiceAnswers[currentKey] ?? null;
  $: workspaceId = buildWorkspaceId('practice', lesson.id);
  $: if (activeKey !== currentKey) {
    activeKey = currentKey;
    draft = savedEntry?.answer ?? findStepDraft(currentStepIndex);
  }
  $: savedCount = steps.filter((step) => $practiceAnswers[`${lesson.id}/${step.id}`]?.savedAt).length;
  $: isSaved = Boolean(savedEntry?.savedAt) && (savedEntry?.answer ?? '') === draft;
  $: canSave = draft.trim().length > 0 && !isSaved;
  $: canAdvance = isSaved && currentStepIndex < steps.length - 1;
  $: draftMetadata = buildMarkdownMetadata(draft);
  $: activeFileId = `step-${currentStepIndex}`;
  $: activeAttemptTimer = resolveAttemptTimer(savedEntry?.timer);
  $: activeAttemptElapsedMs = getAttemptTimerElapsed(activeAttemptTimer, timerNow);
  $: phaseLimitMs = getPracticePhaseLimitMs(currentStep?.id);
  $: activeAttemptElapsedLabel = formatPracticeDuration(activeAttemptElapsedMs);
  $: phaseTargetLabel = phaseLimitMs ? formatPhaseTargetLabel(phaseLimitMs) : null;
  $: isOverPhaseLimit = phaseLimitMs !== null && activeAttemptElapsedMs > phaseLimitMs;
  $: attemptStatusLabel = activeAttemptTimer.status === 'running' ? 'Running' : activeAttemptTimer.status === 'paused' ? 'Paused' : 'Idle';
  $: lastAttemptLabel = activeAttemptTimer.lastCompletedMs
    ? formatPracticeDuration(activeAttemptTimer.lastCompletedMs)
    : 'No completed attempt yet';
  $: {
    const shouldTick = activeAttemptTimer.status === 'running';
    if (shouldTick && !timerIntervalId) {
      timerNow = Date.now();
      timerIntervalId = setInterval(() => {
        timerNow = Date.now();
      }, 250);
    } else if (!shouldTick && timerIntervalId) {
      clearInterval(timerIntervalId);
      timerIntervalId = null;
      timerNow = Date.now();
    }
  }
  $: editorSnippetActions = [
    ...markdownCompletions.map((item) => ({
      label: item.label,
      insertText: item.insertText
    })),
    {
      label: 'Code block',
      insertText: ['```ts', '// Add an API, schema, worker loop, or core algorithm here.', '```'].join('\n')
    }
  ];
  $: legacyMigrationFiles = steps.map((step, index) => ({
    path: stepPath(index),
    value: $practiceAnswers[`${lesson.id}/${step.id}`]?.answer ?? ''
  })).filter((entry) => entry.value)

  $: seedFiles = buildSeedFiles();
  $: previewContent = buildPreviewContent();
  $: markersByFile = buildMarkersByFile();
  $: summaryByFile = buildSummaryByFile();
  $: previewItemsByFile = buildPreviewItemsByFile();

  /** @param {number} index */
  function stepPath(index) {
    return `steps/step-${index + 1}-answer.md`;
  }

  /** @param {number} index */
  function stepFileId(index) {
    return `step-${index}`;
  }

  function buildSeedFiles() {
    return steps.map((step, index) => createSeedFile({
      id: stepFileId(index),
      path: stepPath(index),
      value: '',
      language: 'markdown'
    }));
  }

  /** @param {number} index */
  function findStepDraft(index) {
    const files = ideWorkspace?.getWorkspaceFiles?.() ?? [];
    return findFileByPath(files, stepPath(index))?.value
      ?? $practiceAnswers[`${lesson.id}/${steps[index]?.id}`]?.answer
      ?? '';
  }

  function buildMarkersByFile() {
    /** @type {Record<string, any[]>} */
    const map = {};
    steps.forEach((_, index) => {
      if (index === currentStepIndex) {
        map[stepFileId(index)] = draftMetadata.markers;
      }
    });
    return map;
  }

  function buildSummaryByFile() {
    /** @type {Record<string, string>} */
    const map = {};
    steps.forEach((_, index) => {
      if (index === currentStepIndex) {
        map[stepFileId(index)] = draftMetadata.summary;
      }
    });
    return map;
  }

  function buildPreviewItemsByFile() {
    /** @type {Record<string, any[]>} */
    const map = {};
    steps.forEach((_, index) => {
      if (index === currentStepIndex) {
        map[stepFileId(index)] = draftMetadata.previewItems;
      }
    });
    return map;
  }

  function buildPreviewContent() {
    if (!currentStep) return null;
    let text = `<div class="practice-preview">`
    text += `<h3>${currentStep.title}</h3>`
    text += `<p class="practice-preview-prompt">${currentStep.prompt}</p>`
    text += `<h4>Goal</h4><p>${currentStep.objective}</p>`
    text += `<h4>Guardrails</h4><ul>`
    for (const item of currentStep.guardrails ?? []) {
      text += `<li>${item}</li>`
    }
    text += `</ul>`
    text += `<h4>Suggested Structure</h4><ul>`
    for (const item of currentStep.structure ?? []) {
      text += `<li>${item}</li>`
    }
    text += `</ul></div>`
    return text;
  }

  /** @param {CustomEvent} event */
  function handleWorkspaceHydrated(event) {
    draft = findStepDraft(currentStepIndex)
    workspaceReady = true
  }

  function saveCurrent() {
    if (!draft.trim()) return;
    practiceAnswers.saveAnswer(currentKey, draft.trim());
  }

  async function clearLessonAnswers() {
    practiceAnswers.clearLesson(lesson.id);
    draft = '';
    await resetWorkspace(workspaceId, buildSeedFiles());
    workspaceReady = false;
  }

  /** @param {number} index */
  function goToStep(index) {
    currentStepIndex = index;
    draft = findStepDraft(index);
  }

  function goToPrevious() {
    if (currentStepIndex > 0) currentStepIndex -= 1;
    draft = findStepDraft(currentStepIndex);
  }

  function goToNext() {
    if (canAdvance) {
      currentStepIndex += 1;
      draft = findStepDraft(currentStepIndex);
    }
  }

  function startAttempt() {
    if (!currentKey) return;
    practiceAnswers.startAttempt(currentKey);
    timerNow = Date.now();
  }

  function pauseAttempt() {
    if (!currentKey) return;
    practiceAnswers.pauseAttempt(currentKey);
    timerNow = Date.now();
  }

  function stopAttempt() {
    if (!currentKey) return;
    practiceAnswers.stopAttempt(currentKey);
    timerNow = Date.now();
  }

  onDestroy(() => {
    if (timerIntervalId) {
      clearInterval(timerIntervalId);
      timerIntervalId = null;
    }
  });

  /** @param {CustomEvent} event */
  function handleStepFileChange(event) {
    const { fileId } = event.detail;
    const match = fileId?.match?.(/^step-(\d+)$/);
    if (match) {
      goToStep(parseInt(match[1], 10));
    }
  }

  /** @param {CustomEvent} event */
  function handleEditorChange(event) {
    const nextFiles = event.detail?.files ?? [];
    const nextActiveId = event.detail?.activeFileId ?? activeFileId;
    const active = nextFiles.find((/** @type {any} */ f) => f.id === nextActiveId)
      ?? findFileByPath(nextFiles, stepPath(currentStepIndex));
    if (active) {
      draft = active.value;
    }
  }

  $: commandActions = [
    {
      id: 'save-practice-answer',
      label: 'Practice: Save current answer',
      run: saveCurrent
    },
    {
      id: 'previous-practice-step',
      label: 'Practice: Previous step',
      run: goToPrevious
    },
    {
      id: 'next-practice-step',
      label: 'Practice: Next step',
      run: goToNext
    },
    {
      id: 'clear-practice-answers',
      label: 'Practice: Clear lesson answers',
      run: clearLessonAnswers
    }
  ];
</script>

<section class="practice-ide-section">
  <div class="practice-ide-header">
    <div>
      <p class="eyebrow">Interactive practice lab</p>
      <h2>Write, save, and move through the mock interview</h2>
      <p class="practice-copy">Answers stay in your browser so you can come back later.</p>
    </div>
    <div class="practice-ide-status">
      <span class="pill">{savedCount}/{steps.length} saved</span>
      <span class="pill">Step {currentStepIndex + 1}/{steps.length}: {currentStep?.title ?? ''}</span>
    </div>
  </div>

  <div class="practice-ide-toolbar">
    <div class="practice-ide-steps">
      {#each steps as step, index}
        {@const stepLimit = getPracticePhaseLimitMs(step.id)}
        <button
          class="practice-ide-step-btn"
          class:active={index === currentStepIndex}
          class:done={$practiceAnswers[`${lesson.id}/${step.id}`]?.savedAt}
          type="button"
          onclick={() => goToStep(index)}
          title="{step.title}{stepLimit != null ? ` · ${formatPhaseTargetLabel(stepLimit)}` : ''}"
        >
          {index + 1}
        </button>
      {/each}
    </div>
    <div class="practice-ide-actions">
      <button class="ide-save-btn" type="button" onclick={saveCurrent} disabled={!canSave}>
        {isSaved ? '✓ Saved' : 'Save'}
      </button>
      <button class="ide-nav-btn" type="button" onclick={goToPrevious} disabled={currentStepIndex === 0}>←</button>
      <button class="ide-nav-btn" type="button" onclick={goToNext} disabled={!canAdvance}>→</button>
      <button class="ide-reset-btn" type="button" onclick={clearLessonAnswers}>Clear all</button>
    </div>
  </div>

  <div class="attempt-timer-card" class:over-limit={isOverPhaseLimit}>
    <div class="attempt-timer-header">
      <div>
        <p class="eyebrow">Mock interview timer</p>
        <h3>{activeAttemptElapsedLabel}</h3>
      </div>
      <div class="attempt-timer-pill-row">
        {#if phaseTargetLabel}
          <span class="pill">{phaseTargetLabel}</span>
        {/if}
        <span class="pill">{attemptStatusLabel}</span>
        <span class="pill">{activeAttemptTimer.attemptCount} completed</span>
        <span class="pill">Last {lastAttemptLabel}</span>
      </div>
    </div>
    <p class="attempt-timer-copy">
      Phase {currentStepIndex + 1}: {currentStep?.title ?? 'Practice step'}.
      {#if phaseLimitMs}
        Aim for about {Math.round(phaseLimitMs / 60_000)} minutes before moving on — real interviews rarely give unlimited time per section.
      {:else}
        Track time per phase so you build pacing muscle for the real interview.
      {/if}
    </p>
  <div class="attempt-timer-actions">
      <button class="action-link primary" type="button" onclick={startAttempt}>
        {activeAttemptTimer.status === 'paused' ? 'Resume phase' : activeAttemptTimer.attemptCount ? 'Start new phase' : 'Start phase timer'}
      </button>
      <button class="action-link" type="button" onclick={pauseAttempt} disabled={activeAttemptTimer.status !== 'running'}>Pause</button>
      <button class="action-link" type="button" onclick={stopAttempt} disabled={activeAttemptTimer.status === 'idle' && activeAttemptElapsedMs === 0}>Stop</button>
    </div>
  </div>

  <div id="practice-lab" class="practice-ide-workspace">
  <IDEWorkspace
    bind:this={ideWorkspace}
    files={seedFiles}
    {workspaceId}
    legacyFiles={legacyMigrationFiles}
    {activeFileId}
    explorerTitle="PRACTICE STEPS"
    projectName={lesson.title.toUpperCase().slice(0, 24)}
    sidePanelEyebrow="PRACTICE GUIDE"
    sidePanelTitle={currentStep?.title ?? 'Preview'}
    sidePanelDescription={currentStep?.objective ?? ''}
    {previewItemsByFile}
    {markersByFile}
    {summaryByFile}
    snippetActions={editorSnippetActions}
    {commandActions}
    {previewContent}
    on:workspacehydrated={handleWorkspaceHydrated}
    on:fileschange={handleEditorChange}
    on:fileselect={handleStepFileChange}
    on:tabchange={handleStepFileChange}
  >
    <div slot="editor-chrome">
      <LlmAssistantPanel
        title="Practice answer copilot"
        flowId={lesson.flowSlug ?? ''}
        objective={currentStep?.prompt ?? ''}
        {draft}
        contextSections={[
          `Lesson: ${lesson.title}`,
          `Practice step: ${currentStep?.title ?? ''}`,
          ...(currentStep?.guardrails ?? []),
          ...(currentStep?.structure ?? [])
        ]}
      />
    </div>
    <div slot="preview">
      {#if previewContent}
        <div class="practice-preview-panel">
          {@html previewContent}
        </div>
      {/if}
    </div>
  </IDEWorkspace>
  </div>
</section>

<style>
  .practice-ide-section {
    display: grid;
    gap: 1rem;
  }

  .practice-ide-workspace {
    scroll-margin-top: 5.5rem;
  }

  .practice-ide-header {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    justify-content: space-between;
    align-items: start;
  }

  .practice-ide-status {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    align-items: center;
  }

  .practice-ide-toolbar {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
    justify-content: space-between;
    align-items: center;
    padding: 0.7rem 0.9rem;
    background: var(--ide-toolbar-bg, var(--bg-soft));
    border: 1px solid var(--ide-border, var(--border));
    border-radius: 0.8rem;
  }

  .practice-ide-steps {
    display: flex;
    gap: 0.25rem;
  }

  .practice-ide-step-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    border-radius: 4px;
    border: 1px solid var(--ide-border, var(--border));
    background: var(--ide-button-bg, var(--panel));
    color: var(--ide-muted, var(--muted));
    font-size: 0.75rem;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.12s;
  }

  .practice-ide-step-btn.active {
    background: var(--ide-focus-bg, var(--accent-muted));
    border-color: var(--accent-border, var(--accent));
    color: var(--ide-strong-fg, var(--text));
  }

  .practice-ide-step-btn.done {
    border-color: color-mix(in srgb, var(--success) 45%, transparent);
    color: var(--success);
  }

  .practice-ide-step-btn.done.active {
    background: var(--ide-focus-bg, var(--accent-muted));
    border-color: var(--accent-border, var(--accent));
    color: var(--ide-strong-fg, var(--text));
  }

  .practice-ide-actions {
    display: flex;
    gap: 0.35rem;
  }

  .ide-save-btn,
  .ide-nav-btn,
  .ide-reset-btn {
    border-radius: 0.375rem;
    border: 1px solid var(--ide-border, var(--border));
    padding: 0.35rem 0.7rem;
    font-size: 0.78rem;
    font-weight: 600;
    min-height: 28px;
    cursor: pointer;
  }

  .ide-save-btn {
    background: var(--ide-run-bg, var(--success));
    color: var(--ide-run-fg, var(--on-accent));
    border-color: var(--ide-run-bg, var(--success));
  }

  .ide-save-btn:disabled {
    background: var(--ide-button-bg, var(--bg-soft));
    border-color: var(--ide-border, var(--border));
    color: var(--ide-muted, var(--muted));
    opacity: 0.65;
  }

  .ide-nav-btn {
    background: var(--ide-button-bg, var(--panel));
    color: var(--ide-button-fg, var(--text));
  }

  .ide-nav-btn:hover:not(:disabled) {
    background: var(--ide-button-hover, var(--bg-soft));
  }

  .ide-reset-btn {
    background: transparent;
    color: var(--ide-reset-fg, var(--muted));
    border-color: transparent;
  }

  .ide-reset-btn:hover {
    color: var(--ide-reset-hover-fg, var(--text));
    background: var(--ide-reset-hover-bg, var(--accent-subtle));
  }

  .attempt-timer-card {
    display: grid;
    gap: 0.75rem;
    padding: 1rem 1.1rem;
    border-radius: 0.8rem;
    border: 1px solid var(--ide-border, var(--border));
    background: var(--panel);
  }

  .attempt-timer-card.over-limit {
    border-color: color-mix(in srgb, var(--danger) 45%, transparent);
    background: var(--ide-warning-bg);
  }

  .attempt-timer-header {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    justify-content: space-between;
    align-items: start;
  }

  .attempt-timer-header h3 {
    margin: 0;
    font-size: 1.35rem;
    color: var(--text);
  }

  .attempt-timer-pill-row,
  .attempt-timer-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 0.55rem;
  }

  .attempt-timer-copy {
    margin: 0;
    color: var(--muted);
    font-size: 0.88rem;
    line-height: 1.6;
  }

  :global(.practice-preview-panel) {
    display: grid;
    gap: 0.85rem;
    padding: 1.1rem 1.15rem;
    border-radius: 0;
    border: none;
    background: var(--ide-panel, var(--panel));
    color: var(--ide-guide-body, var(--text));
    font-size: 0.9rem;
    line-height: 1.75;
  }

  :global(.practice-preview-panel h3) {
    margin: 0;
    color: var(--ide-guide-body, var(--text));
    font-size: 1.05rem;
  }

  :global(.practice-preview-panel h4) {
    margin: 0.35rem 0 0;
    color: var(--ide-guide-heading, var(--accent-strong));
    font-size: 0.78rem;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    font-weight: 700;
  }

  :global(.practice-preview-panel p) {
    margin: 0;
    color: var(--ide-guide-body, var(--text));
  }

  :global(.practice-preview-panel ul) {
    margin: 0;
    padding-left: 1.15rem;
    display: grid;
    gap: 0.4rem;
  }

  :global(.practice-preview-panel li) {
    color: var(--ide-guide-body, var(--text));
    margin-bottom: 0;
  }

  :global(.practice-preview-prompt) {
    padding: 0.9rem 1rem;
    border-radius: 0.75rem;
    border: 1px solid var(--accent-border, var(--border));
    background: var(--accent-subtle);
    color: var(--text) !important;
    font-weight: 500;
  }
</style>
