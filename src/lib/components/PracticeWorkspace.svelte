<svelte:options runes={false} />
<script>
  import { practiceAnswers } from '$lib/stores/practice';
  import { getLessonPracticeSteps } from '$lib/data/courseData';

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
          <li class:active={index === currentStepIndex}>
            <div>
              <strong>{step.title}</strong>
              <p>{step.objective}</p>
            </div>
            <span class:done={$practiceAnswers[`${lesson.id}/${step.id}`]?.savedAt} class="progress-badge">
              {$practiceAnswers[`${lesson.id}/${step.id}`]?.savedAt ? 'Saved' : 'Draft'}
            </span>
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

      <div class="practice-guidance">
        <p class="eyebrow">Use these guardrails</p>
        <ul>
          {#each currentStep.guardrails as item}
            <li>{item}</li>
          {/each}
        </ul>
      </div>

      <label class="practice-editor">
        <span class="eyebrow">Your answer</span>
        <textarea bind:value={draft} rows="12" placeholder="Write your notes, bullets, or interview answer here. Save before moving to the next prompt."></textarea>
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
</section>
