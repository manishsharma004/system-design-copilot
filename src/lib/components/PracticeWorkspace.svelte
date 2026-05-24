<svelte:options runes={false} />
<script>
  import { practiceAnswers } from '$lib/stores/practice';
  import CodeEditor from '$lib/components/CodeEditor.svelte';
  import LlmAssistantPanel from '$lib/components/LlmAssistantPanel.svelte';
  import { getLessonPracticeSteps } from '$lib/data/courseData';
  import { buildMarkdownMetadata, markdownCompletions } from '$lib/editor/exerciseMetadata';

  /** @type {any} */
  export let lesson;

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

  function saveCurrent() {
    if (!draft.trim()) return;
    practiceAnswers.saveAnswer(currentKey, draft.trim());
  }

  function clearLessonAnswers() {
    practiceAnswers.clearLesson(lesson.id);
    draft = '';
  }

  function goToPrevious() {
    if (currentStepIndex > 0) {
      currentStepIndex -= 1;
    }
  }

  function goToNext() {
    if (canAdvance) {
      currentStepIndex += 1;
    }
  }

  /** @param {number} index */
  function goToStep(index) {
    currentStepIndex = index;
  }

  function insertStructureTemplate() {
    const template = currentStep?.template ?? '';
    if (!template) return;
    draft = draft.trim() ? `${draft}\n\n${template}` : template;
  }

  function insertCodeBlock() {
    const block = ['```ts', '// Add an API, schema, worker loop, or core algorithm here.', '```'].join('\n');
    draft = draft.trim() ? `${draft}\n\n${block}` : block;
  }

  /** @param {string | undefined} savedAt */
  function formatSavedAt(savedAt) {
    if (!savedAt) return 'Not saved yet';
    return `Saved ${new Date(savedAt).toLocaleString()}`;
  }
</script>

<section class="panel hero-card practice-workspace">
  <div class="action-row" style="justify-content: space-between; align-items: end;">
    <div>
      <p class="eyebrow">Interactive practice lab</p>
      <h2>Write, save, and move through the mock interview</h2>
      <p class="practice-copy">Answers stay in your browser so you can come back later without needing automated grading.</p>
    </div>
    <div class="practice-status-group">
      <span class="pill">{savedCount}/{steps.length} prompts saved</span>
      <span class="pill">Prompt {currentStepIndex + 1} of {steps.length}</span>
    </div>
  </div>

  <div class="practice-layout">
    <article class="list-card practice-outline">
      <p class="eyebrow">Prompt flow</p>
      <h3>What you will practice</h3>
      <ol class="practice-step-list">
        {#each steps as step, index}
          <li>
            <button class:active={index === currentStepIndex} class="practice-step-button" type="button" onclick={() => goToStep(index)}>
              <div class="practice-step-copy">
                <span class="practice-step-index">Step {index + 1}</span>
                <strong>{step.title}</strong>
                <p>{step.objective}</p>
              </div>
              <span class:done={$practiceAnswers[`${lesson.id}/${step.id}`]?.savedAt} class="progress-badge">
                {$practiceAnswers[`${lesson.id}/${step.id}`]?.savedAt ? 'Saved' : 'Draft'}
              </span>
            </button>
          </li>
        {/each}
      </ol>
    </article>

    <article class="content-card practice-card">
      <div class="practice-card-header">
        <div>
          <p class="eyebrow">{currentStep.kind}</p>
          <h3>{currentStep.title}</h3>
        </div>
        <span class="pill">{formatSavedAt(savedEntry?.savedAt)}</span>
      </div>

      <p>{currentStep.prompt}</p>
      <div class="practice-guidance compact">
        <p class="eyebrow">Goal for this step</p>
        <p>{currentStep.objective}</p>
      </div>

      <div class="practice-guidance">
        <p class="eyebrow">Use these guardrails</p>
        <ul>
          {#each currentStep.guardrails as item}
            <li>{item}</li>
          {/each}
        </ul>
      </div>

       <div class="practice-structure-panel">
        <div class="practice-structure-copy">
          <p class="eyebrow">Suggested structure</p>
          <ul class="practice-structure-list">
            {#each currentStep.structure as item}
              <li>{item}</li>
            {/each}
          </ul>
        </div>
        <div class="practice-toolbar">
          <button class="action-link" type="button" onclick={insertStructureTemplate}>Insert structured template</button>
          <button class="action-link" type="button" onclick={insertCodeBlock}>Insert code block</button>
        </div>
      </div>

      <label class="practice-editor">
        <span class="eyebrow">Your answer</span>
        <CodeEditor
          bind:value={draft}
          language="markdown"
          filename="answer.md"
          title="Answer draft"
          minHeight="20rem"
          snippetActions={editorSnippetActions}
          previewItemsByFile={{ __single__: draftMetadata.previewItems }}
          markersByFile={{ __single__: draftMetadata.markers }}
          summaryByFile={{ __single__: draftMetadata.summary }}
        />
      </label>

      <div class="action-row">
        <button class:done={isSaved} class="lesson-toggle" type="button" onclick={saveCurrent} disabled={!canSave}>
          {isSaved ? 'Saved locally' : 'Save answer'}
        </button>
        <button class="reset-link" type="button" onclick={clearLessonAnswers}>
          Clear this lesson's saved answers
        </button>
      </div>

      <div class="action-row practice-nav">
        <button class="action-link" type="button" onclick={goToPrevious} disabled={currentStepIndex === 0}>← Previous prompt</button>
        {#if currentStepIndex < steps.length - 1}
          <button class="action-link primary" type="button" onclick={goToNext} disabled={!canAdvance}>Save to continue →</button>
        {:else}
          <span class="pill">Finish this lesson whenever you're ready.</span>
        {/if}
      </div>
    </article>
  </div>

  <LlmAssistantPanel
    title="Practice answer copilot"
    objective={currentStep.prompt}
    draft={draft}
    contextSections={[
      `Lesson: ${lesson.title}`,
      `Practice step: ${currentStep.title}`,
      ...currentStep.guardrails,
      ...currentStep.structure
    ]}
  />
</section>
