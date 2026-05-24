<svelte:options runes={false} />
<script>
  import { practiceAnswers } from '$lib/stores/practice';
  import IDEWorkspace from '$lib/components/IDEWorkspace.svelte';
  import LlmAssistantPanel from '$lib/components/LlmAssistantPanel.svelte';
  import { getLessonPracticeSteps } from '$lib/data/courseData';
  import { buildMarkdownMetadata, markdownCompletions } from '$lib/editor/exerciseMetadata';

  /** @type {any} */
  export let lesson;

  /** @type {any[]} */
  let steps = [];
  let currentStepIndex = 0;
  let activeKey = '';
  let draft = '';

  $: steps = getLessonPracticeSteps(lesson);
  $: currentStep = steps[currentStepIndex];
  $: currentKey = `${lesson.id}/${currentStep.id}`;
  $: savedEntry = $practiceAnswers[currentKey] ?? null;
  $: if (activeKey !== currentKey) {
    activeKey = currentKey;
    draft = savedEntry?.answer ?? '';
  }
  $: savedCount = steps.filter((step) => $practiceAnswers[`${lesson.id}/${step.id}`]?.savedAt).length;
  $: isSaved = Boolean(savedEntry?.savedAt) && (savedEntry?.answer ?? '') === draft;
  $: canSave = draft.trim().length > 0 && !isSaved;
  $: canAdvance = isSaved && currentStepIndex < steps.length - 1;
  $: draftMetadata = buildMarkdownMetadata(draft);
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
  $: editorFiles = [
    {
      id: 'answer',
      label: `step-${currentStepIndex + 1}-answer.md`,
      filename: `step-${currentStepIndex + 1}-answer.md`,
      language: 'markdown',
      value: draft
    }
  ];
  $: explorerNodes = buildExplorerNodes();
  $: previewContent = buildPreviewContent();

  function buildExplorerNodes() {
    return steps.map((step, index) => ({
      type: 'file',
      id: `step-${index}`,
      label: `step-${index + 1}-answer.md`,
      icon: $practiceAnswers[`${lesson.id}/${step.id}`]?.savedAt ? '✅' : '📝',
      badge: index === currentStepIndex ? '●' : ''
    }));
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

  function saveCurrent() {
    if (!draft.trim()) return;
    practiceAnswers.saveAnswer(currentKey, draft.trim());
  }

  function clearLessonAnswers() {
    practiceAnswers.clearLesson(lesson.id);
    draft = '';
  }

  /** @param {number} index */
  function goToStep(index) {
    currentStepIndex = index;
  }

  function goToPrevious() {
    if (currentStepIndex > 0) currentStepIndex -= 1;
  }

  function goToNext() {
    if (canAdvance) currentStepIndex += 1;
  }

  /** @param {CustomEvent} event */
  function handleFileSelect(event) {
    const { fileId } = event.detail;
    const match = fileId?.match?.(/^step-(\d+)$/);
    if (match) {
      goToStep(parseInt(match[1], 10));
    }
  }

  /** @param {CustomEvent} event */
  function handleEditorChange(event) {
    const nextFiles = event.detail?.files ?? [];
    const answer = nextFiles.find((/** @type {any} */ f) => f.id === 'answer');
    if (answer) {
      draft = answer.value;
    }
  }

  /** @param {string | undefined} savedAt */
  function formatSavedAt(savedAt) {
    if (!savedAt) return 'Not saved yet';
    return `Saved ${new Date(savedAt).toLocaleString()}`;
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
        <button
          class="practice-ide-step-btn"
          class:active={index === currentStepIndex}
          class:done={$practiceAnswers[`${lesson.id}/${step.id}`]?.savedAt}
          type="button"
          onclick={() => goToStep(index)}
          title={step.title}
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

  <IDEWorkspace
    files={editorFiles}
    explorerTitle="PRACTICE STEPS"
    projectName={lesson.title.toUpperCase().slice(0, 24)}
    {explorerNodes}
    previewItemsByFile={{ answer: draftMetadata.previewItems }}
    markersByFile={{ answer: draftMetadata.markers }}
    summaryByFile={{ answer: draftMetadata.summary }}
    snippetActions={editorSnippetActions}
    {commandActions}
    {previewContent}
    on:fileschange={handleEditorChange}
    on:fileselect={handleFileSelect}
  >
    <div slot="preview">
      {#if previewContent}
        <div class="practice-preview-panel">
          {@html previewContent}
        </div>
      {/if}
    </div>
  </IDEWorkspace>

  <LlmAssistantPanel
    title="Practice answer copilot"
    objective={currentStep?.prompt ?? ''}
    {draft}
    contextSections={[
      `Lesson: ${lesson.title}`,
      `Practice step: ${currentStep?.title ?? ''}`,
      ...(currentStep?.guardrails ?? []),
      ...(currentStep?.structure ?? [])
    ]}
  />
</section>

<style>
  .practice-ide-section {
    display: grid;
    gap: 1rem;
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
    background: linear-gradient(180deg, rgba(105, 108, 255, 0.08), rgba(17, 19, 26, 0.96));
    border: 1px solid rgba(148, 163, 184, 0.16);
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
    border: 1px solid #353c4f;
    background: #161922;
    color: #9aa3bc;
    font-size: 0.75rem;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.12s;
  }

  .practice-ide-step-btn.active {
    background: rgba(105, 108, 255, 0.22);
    border-color: rgba(105, 108, 255, 0.65);
    color: #eef2ff;
  }

  .practice-ide-step-btn.done {
    border-color: rgba(113, 221, 55, 0.45);
    color: #9be37a;
  }

  .practice-ide-step-btn.done.active {
    background: rgba(105, 108, 255, 0.22);
    border-color: rgba(105, 108, 255, 0.65);
    color: #eef2ff;
  }

  .practice-ide-actions {
    display: flex;
    gap: 0.35rem;
  }

  .ide-save-btn,
  .ide-nav-btn,
  .ide-reset-btn {
    border-radius: 0.375rem;
    border: 1px solid rgba(148, 163, 184, 0.18);
    padding: 0.35rem 0.7rem;
    font-size: 0.78rem;
    font-weight: 600;
    min-height: 28px;
    cursor: pointer;
  }

  .ide-save-btn {
    background: #388a34;
    color: #fff;
    border-color: #388a34;
  }

  .ide-save-btn:disabled {
    background: #333;
    border-color: #444;
    color: #666;
  }

  .ide-nav-btn {
    background: #1b1f2a;
    color: #cfd5e9;
  }

  .ide-nav-btn:hover:not(:disabled) {
    background: #2a3040;
  }

  .ide-reset-btn {
    background: transparent;
    color: #8b8fa7;
    border-color: transparent;
  }

  .ide-reset-btn:hover {
    color: #cfd3ec;
  }

  :global(.practice-preview-panel) {
    display: grid;
    gap: 0.85rem;
    padding: 1.1rem 1.15rem;
    border-radius: 0.9rem;
    border: 1px solid rgba(148, 163, 184, 0.14);
    background:
      linear-gradient(180deg, rgba(105, 108, 255, 0.08), rgba(17, 19, 26, 0.98) 6rem),
      #11131a;
    color: #cfd5e9;
    font-size: 0.9rem;
    line-height: 1.75;
  }

  :global(.practice-preview-panel h3) {
    margin: 0;
    color: #eef2ff;
    font-size: 1.05rem;
  }

  :global(.practice-preview-panel h4) {
    margin: 0.35rem 0 0;
    color: #9fb3ff;
    font-size: 0.78rem;
    text-transform: uppercase;
    letter-spacing: 0.08em;
  }

  :global(.practice-preview-panel p) {
    margin: 0;
    color: #bcc5de;
  }

  :global(.practice-preview-panel ul) {
    margin: 0;
    padding-left: 1.15rem;
    display: grid;
    gap: 0.4rem;
  }

  :global(.practice-preview-panel li) {
    color: #bcc5de;
    margin-bottom: 0;
  }

  :global(.practice-preview-prompt) {
    padding: 0.9rem 1rem;
    border-radius: 0.75rem;
    border: 1px solid rgba(105, 108, 255, 0.22);
    background: rgba(105, 108, 255, 0.08);
    color: #eef2ff !important;
    font-weight: 500;
  }
</style>
