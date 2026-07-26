<svelte:options runes={false} />
<script>
  import { browser } from '$app/environment'
  import { onDestroy, onMount } from 'svelte'

  import CodeEditor from '$lib/components/CodeEditor.svelte'
  import LlmAssistantPanel from '$lib/components/LlmAssistantPanel.svelte'
  import { plainTextFromHtml } from '$lib/llm/checkPrompts'
  import {
    buildCppPracticeSource,
    buildJavaPracticeFiles,
    buildPythonPracticeSource,
    formatComparableValue,
    parseExpectedValue,
    parseInputLines,
    practiceLanguageCatalog
  } from '$lib/dsa/practice'
  import { practiceAnswers } from '$lib/stores/practice'
  import { getAttemptTimerElapsed, resolveAttemptTimer } from '$lib/stores/practiceTimer'
  import { ensureCppRuntime, runCppSource } from '$lib/dsa/wasmCppRuntime'
  import { ensureJavaRuntime, runJavaPractice } from '$lib/dsa/wasmJavaRuntime'
  import { ensurePythonRuntime, runPythonSource } from '$lib/dsa/wasmPythonRuntime'

  export let lesson

  let selectedQuestionId = ''
  let languageId = 'python3'
  let activeCaseId = ''
  let activeDraftKey = ''
  let editorValue = ''
  let caseInput = ''
  let expectedOutput = ''
  let latestRun = null
  let runtimeStatus = 'idle'
  let runtimeMessage = 'Choose a runnable language to load its browser-side runtime.'
  let draftCache = {}
  let timerNow = Date.now()
  let timerIntervalId = null
  let runtimeReadyByLanguage = {
    python3: false,
    cpp: false,
    java: false
  }
  let activeRuntimeLanguageId = ''

  $: practiceQuestions = (lesson?.questionHighlights ?? []).filter((question) => question.supportsLocalWasmRun)
  $: if (practiceQuestions.length && !practiceQuestions.some((question) => `${question.frontendId}` === `${selectedQuestionId}`)) {
    selectedQuestionId = practiceQuestions[0].frontendId
  }
  $: selectedQuestion = practiceQuestions.find((question) => `${question.frontendId}` === `${selectedQuestionId}`) ?? null

  $: availableLanguages = practiceLanguageCatalog.filter((language) => selectedQuestion?.languageTemplates?.[language.id])
  $: if (availableLanguages.length && !availableLanguages.some((language) => language.id === languageId)) {
    languageId = availableLanguages[0].id
  }
  $: activeLanguage = availableLanguages.find((language) => language.id === languageId) ?? availableLanguages[0] ?? null
  $: practiceCases = selectedQuestion?.practiceCases?.length ? selectedQuestion.practiceCases : []
  $: attemptEntryKey = selectedQuestion ? `dsa-attempt:${lesson.id}:${selectedQuestion.frontendId}` : ''
  $: activeAttemptTimer = resolveAttemptTimer(attemptEntryKey ? $practiceAnswers[attemptEntryKey]?.timer : null)
  $: activeAttemptElapsedMs = getAttemptTimerElapsed(activeAttemptTimer, timerNow)
  $: activeAttemptElapsedLabel = formatDuration(activeAttemptElapsedMs)
  $: attemptStatusLabel = activeAttemptTimer.status === 'running' ? 'Running' : activeAttemptTimer.status === 'paused' ? 'Paused' : 'Idle'
  $: lastAttemptLabel = activeAttemptTimer.lastCompletedMs ? formatDuration(activeAttemptTimer.lastCompletedMs) : 'No completed attempt yet'

  $: checkQuestionText = selectedQuestion
    ? [selectedQuestion.title, plainTextFromHtml(selectedQuestion.contentHtml)].filter(Boolean).join('\n\n')
    : ''
  $: checkContextSections = selectedQuestion
    ? [
        `Lesson: ${lesson.title}`,
        activeLanguage ? `Language: ${activeLanguage.label}` : '',
        latestRun
          ? `Last test run: ${latestRun.passed ? 'Pass' : 'Needs work'}${latestRun.error ? ` — ${latestRun.error}` : ''}`
          : 'Last test run: not run yet'
      ].filter(Boolean)
    : []

  $: if (activeLanguage?.id && activeLanguage.id !== activeRuntimeLanguageId) {
    activeRuntimeLanguageId = activeLanguage.id
    const isReady = Boolean(runtimeReadyByLanguage[activeLanguage.id])
    runtimeStatus = isReady ? 'ready' : 'idle'
    runtimeMessage = isReady ? getReadyMessage(activeLanguage.id) : activeLanguage.helperText
  }

  $: if (selectedQuestion && activeLanguage) {
    const nextDraftKey = getDraftKey(selectedQuestion, activeLanguage.id)
    if (nextDraftKey !== activeDraftKey) {
      activeDraftKey = nextDraftKey
      editorValue = loadDraft(selectedQuestion, activeLanguage.id)
      latestRun = null
    }
  }

  $: if (practiceCases.length && !practiceCases.some((entry) => entry.id === activeCaseId)) {
    applyPracticeCase(practiceCases[0])
  }

  $: if (browser) {
    const shouldTick = activeAttemptTimer.status === 'running'
    if (shouldTick && !timerIntervalId) {
      timerNow = Date.now()
      timerIntervalId = window.setInterval(() => {
        timerNow = Date.now()
      }, 250)
    } else if (!shouldTick && timerIntervalId) {
      window.clearInterval(timerIntervalId)
      timerIntervalId = null
      timerNow = Date.now()
    }
  }

  $: editorFiles = activeLanguage
    ? [{
        id: 'solution',
        label: activeLanguage.filename,
        filename: activeLanguage.filename,
        language: activeLanguage.monacoLanguage,
        value: editorValue
      }]
    : []

  onMount(async () => {
    if (!browser) return
    try {
      await ensurePythonRuntime()
      runtimeReadyByLanguage = { ...runtimeReadyByLanguage, python3: true }
      if (activeLanguage?.id === 'python3') {
        runtimeStatus = 'ready'
        runtimeMessage = getReadyMessage('python3')
      }
    } catch (error) {
      if (activeLanguage?.id === 'python3') {
        runtimeStatus = 'error'
        runtimeMessage = error instanceof Error ? error.message : 'Unable to load the Python WebAssembly runtime.'
      }
    }
  })

  onDestroy(() => {
    if (timerIntervalId) {
      window.clearInterval(timerIntervalId)
    }
  })

  function getReadyMessage(nextLanguageId) {
    if (nextLanguageId === 'cpp') {
      return 'C++ runtime is ready. The current file will compile to WebAssembly in-browser and run through a WASI adapter.'
    }
    if (nextLanguageId === 'java') {
      return 'Java runtime is ready. The current source will compile inside CheerpJ and execute through a generated harness in the browser.'
    }
    return 'Python runtime loaded locally in the browser through Pyodide WebAssembly.'
  }

  function getDraftKey(question, nextLanguageId) {
    return `dsa-practice:${lesson.id}:${question.frontendId}:${nextLanguageId}`
  }

  function formatDuration(totalMs) {
    const totalSeconds = Math.max(0, Math.floor(totalMs / 1000))
    const hours = Math.floor(totalSeconds / 3600)
    const minutes = Math.floor((totalSeconds % 3600) / 60)
    const seconds = totalSeconds % 60

    if (hours > 0) {
      return `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
    }

    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
  }

  function loadDraft(question, nextLanguageId) {
    const draftKey = getDraftKey(question, nextLanguageId)
    if (draftCache[draftKey] !== undefined) return draftCache[draftKey]

    const defaultCode = question.languageTemplates?.[nextLanguageId]?.defaultCode ?? ''
    draftCache[draftKey] = defaultCode
    return defaultCode
  }

  function saveDraft(nextValue) {
    if (!selectedQuestion || !activeLanguage) return
    const draftKey = getDraftKey(selectedQuestion, activeLanguage.id)
    draftCache[draftKey] = nextValue
  }

  function applyPracticeCase(practiceCase) {
    activeCaseId = practiceCase.id
    caseInput = practiceCase.inputRaw ?? ''
    expectedOutput = practiceCase.expectedRaw ?? ''
    latestRun = null
  }

  async function runCurrentCase() {
    if (!selectedQuestion || !activeLanguage) return

    const inputValues = parseInputLines(caseInput)
    const expectedParameterCount = selectedQuestion.practiceMeta?.params?.length ?? 0

    if (inputValues.length !== expectedParameterCount) {
      latestRun = {
        ok: false,
        passed: false,
        actual: '',
        expected: expectedOutput.trim(),
        error: `Expected ${expectedParameterCount} input line${expectedParameterCount === 1 ? '' : 's'} based on the function signature, but received ${inputValues.length}.`
      }
      return
    }

    let execution

    if (activeLanguage.id === 'python3') {
      runtimeStatus = 'loading'
      runtimeMessage = 'Running Python locally in the browser via WebAssembly.'

      const source = buildPythonPracticeSource({
        practiceMeta: selectedQuestion.practiceMeta,
        userCode: editorValue,
        inputValues
      })

      execution = await runPythonSource(source)
      if (execution.ok) {
        runtimeReadyByLanguage = { ...runtimeReadyByLanguage, python3: true }
      }
    } else if (activeLanguage.id === 'cpp') {
      runtimeStatus = 'loading'
      runtimeMessage = 'Compiling C++ to WebAssembly in the browser, then executing it through WASI.'

      try {
        await ensureCppRuntime()
        runtimeReadyByLanguage = { ...runtimeReadyByLanguage, cpp: true }
      } catch (error) {
        execution = {
          ok: false,
          stdout: '',
          stderr: '',
          error: error instanceof Error ? error.message : 'Unable to load the C++ browser runtime.'
        }
      }

      if (!execution) {
        const source = buildCppPracticeSource({
          practiceMeta: selectedQuestion.practiceMeta,
          userCode: editorValue,
          inputValues
        })
        execution = await runCppSource(source)
      }
    } else if (activeLanguage.id === 'java') {
      runtimeStatus = 'loading'
      runtimeMessage = 'Compiling Java in the browser through CheerpJ, then executing a generated harness.'

      try {
        await ensureJavaRuntime()
        runtimeReadyByLanguage = { ...runtimeReadyByLanguage, java: true }
      } catch (error) {
        execution = {
          ok: false,
          stdout: '',
          stderr: '',
          error: error instanceof Error ? error.message : 'Unable to load the Java browser runtime.'
        }
      }

      if (!execution) {
        const sources = buildJavaPracticeFiles({
          practiceMeta: selectedQuestion.practiceMeta,
          userCode: editorValue,
          inputValues
        })
        console.log('Generated Java sources for practice run:', sources)
        execution = await runJavaPractice(sources)
      }
    } else {
      latestRun = {
        ok: false,
        passed: false,
        actual: '',
        expected: expectedOutput.trim(),
        error: activeLanguage.helperText
      }
      return
    }

    const actualValue = execution.stdout ? parseExpectedValue(execution.stdout) : null
    const expectedValue = expectedOutput.trim() ? parseExpectedValue(expectedOutput) : null
    const actualComparable = actualValue === null ? execution.stdout.trim() : formatComparableValue(actualValue)
    const expectedComparable = expectedValue === null ? expectedOutput.trim() : formatComparableValue(expectedValue)
    const passed = execution.ok && (!expectedComparable || actualComparable === expectedComparable)

    latestRun = {
      ok: execution.ok,
      passed,
      actual: actualComparable,
      expected: expectedComparable,
      stderr: execution.stderr,
      error: execution.ok ? '' : (execution.error || execution.stderr || 'Execution failed.')
    }

    runtimeStatus = execution.ok ? 'ready' : 'error'
    runtimeMessage = execution.ok
      ? `${activeLanguage.label} runtime is ready. Edit the current test case or switch to another problem to keep iterating.`
      : (execution.error || execution.stderr || `Execution failed inside the ${activeLanguage.label} browser runtime.`)
  }

  function handleEditorChange(event) {
    editorValue = event.detail.value
    saveDraft(editorValue)
  }

  function startAttempt() {
    if (!attemptEntryKey) return
    practiceAnswers.startAttempt(attemptEntryKey)
    timerNow = Date.now()
  }

  function pauseAttempt() {
    if (!attemptEntryKey) return
    practiceAnswers.pauseAttempt(attemptEntryKey)
    timerNow = Date.now()
  }

  function stopAttempt() {
    if (!attemptEntryKey) return
    practiceAnswers.stopAttempt(attemptEntryKey)
    timerNow = Date.now()
  }
</script>

<section id="practice-lab" class="dsa-practice-shell panel hero-card">
  <div class="practice-heading-row">
    <div>
      <p class="eyebrow">Coding practice</p>
      <h2>DSA interview workspace</h2>
      <p class="practice-copy">This lab only surfaces runnable DSA prompts from the lesson set and keeps the editor in a single-file interview format.</p>
    </div>
    <div class="runtime-pill-stack">
      <span class:ready={runtimeStatus === 'ready'} class="pill runtime-pill">{runtimeStatus === 'ready' ? 'WASM runtime ready' : runtimeStatus === 'loading' ? 'Loading WASM runtime' : runtimeStatus === 'error' ? 'Runtime error' : 'WASM runtime idle'}</span>
      <span class="pill">{practiceQuestions.length} runnable question{practiceQuestions.length === 1 ? '' : 's'}</span>
    </div>
  </div>

  {#if !practiceQuestions.length}
    <div class="dsa-empty-state">
      <h3>No runnable DSA prompts in this lesson yet</h3>
      <p>The lesson content is present, but none of its linked questions currently expose a single-method signature that this local WASM runner can execute safely.</p>
    </div>
  {:else}
    <div class="question-chip-row">
      {#each practiceQuestions as question}
        <button
          class:active={selectedQuestion?.frontendId === question.frontendId}
          class="question-chip"
          type="button"
          onclick={() => {
            selectedQuestionId = question.frontendId
            applyPracticeCase(question.practiceCases?.[0] ?? { id: '', inputRaw: '', expectedRaw: '' })
          }}
        >
          <strong>{question.title}</strong>
          <span>{[question.difficulty, question.company].filter(Boolean).join(' · ') || 'General DSA'}</span>
        </button>
      {/each}
    </div>

    {#if selectedQuestion}
      <div class="dsa-practice-grid">
        <article class="problem-pane">
          <div class="problem-pane-header">
            <div>
              <p class="eyebrow">Problem statement</p>
              <h3>{selectedQuestion.title}</h3>
            </div>
            <div class="tag-row">
              {#if selectedQuestion.difficulty}
                <span class="pill">{selectedQuestion.difficulty}</span>
              {/if}
              {#if selectedQuestion.company}
                <span class="pill">{selectedQuestion.company}</span>
              {/if}
              {#if selectedQuestion.chapterTitle}
                <span class="pill">{selectedQuestion.chapterTitle}</span>
              {/if}
            </div>
          </div>

          <div class="problem-body prose-like">{@html selectedQuestion.contentHtml}</div>

          {#if selectedQuestion.hints?.length}
            <div class="support-card">
              <p class="eyebrow">Hints</p>
              <ul>
                {#each selectedQuestion.hints.slice(0, 3) as hint}
                  <li>{hint}</li>
                {/each}
              </ul>
            </div>
          {/if}

          <div class="support-card">
            <p class="eyebrow">Runtime model</p>
            <p>{runtimeMessage}</p>
          </div>
        </article>

        <article class="workspace-pane">
          <div class="attempt-timer-card">
            <div class="attempt-timer-header">
              <div>
                <p class="eyebrow">Attempt timer</p>
                <h3>{activeAttemptElapsedLabel}</h3>
              </div>
              <div class="attempt-timer-pill-row">
                <span class="pill">{attemptStatusLabel}</span>
                <span class="pill">{activeAttemptTimer.attemptCount} completed</span>
                <span class="pill">Last {lastAttemptLabel}</span>
              </div>
            </div>
            <p class="attempt-timer-copy">Track one timed attempt per question. Pause when you step away, then stop to record the finished time and reset for the next try.</p>
            <div class="attempt-timer-actions">
              <button class="action-link primary" type="button" onclick={startAttempt}>
                {activeAttemptTimer.status === 'paused' ? 'Resume attempt' : activeAttemptTimer.attemptCount ? 'Start new attempt' : 'Start attempt'}
              </button>
              <button class="action-link" type="button" onclick={pauseAttempt} disabled={activeAttemptTimer.status !== 'running'}>Pause</button>
              <button class="action-link" type="button" onclick={stopAttempt} disabled={activeAttemptTimer.status === 'idle' && activeAttemptElapsedMs === 0}>Stop</button>
            </div>
          </div>

          <div class="workspace-toolbar">
            <div class="language-switcher">
              {#each availableLanguages as language}
                <button
                  class:active={activeLanguage?.id === language.id}
                  class="language-pill"
                  type="button"
                  onclick={() => languageId = language.id}
                >
                  {language.label}
                </button>
              {/each}
            </div>
            <button class="action-link primary" type="button" onclick={runCurrentCase} title="Run test case (Ctrl+Enter)">Run test case</button>
          </div>

          <div class="editor-frame">
            <LlmAssistantPanel
              title="DSA answer copilot"
              flowId="data-structures-and-algorithms"
              showOutline={false}
              objective={checkQuestionText}
              draft={editorValue}
              contextSections={checkContextSections}
            />
            {#key activeDraftKey}
              <CodeEditor
                files={editorFiles}
                activeFileId="solution"
                minHeight="24rem"
                runShortcutEnabled={true}
                showHelperToolbar={false}
                on:change={handleEditorChange}
                on:runshortcut={runCurrentCase}
              />
            {/key}
          </div>

          <div class="test-lab-grid">
            <div class="test-card">
              <div class="test-card-header">
                <p class="eyebrow">Test case</p>
                <div class="case-pill-row">
                  {#each practiceCases as practiceCase}
                    <button
                      class:active={practiceCase.id === activeCaseId}
                      class="case-pill"
                      type="button"
                      onclick={() => applyPracticeCase(practiceCase)}
                    >
                      {practiceCase.label}
                    </button>
                  {/each}
                </div>
              </div>
              <label>
                <span>Input</span>
                <textarea rows="7" bind:value={caseInput}></textarea>
              </label>
              <label>
                <span>Expected output</span>
                <textarea rows="3" bind:value={expectedOutput}></textarea>
              </label>
            </div>

            <div class="test-card result-card">
              <div class="test-card-header">
                <p class="eyebrow">Run result</p>
                {#if latestRun}
                  <span class:passing={latestRun.passed} class="pill">{latestRun.passed ? 'Pass' : 'Needs work'}</span>
                {/if}
              </div>
              {#if latestRun}
                <div class="result-metric-grid">
                  <div>
                    <span>Actual</span>
                    <pre>{latestRun.actual || 'No stdout captured.'}</pre>
                  </div>
                  <div>
                    <span>Expected</span>
                    <pre>{latestRun.expected || 'No expected output set.'}</pre>
                  </div>
                </div>
                {#if latestRun.error}
                  <div class="result-error">
                    <strong>Runtime feedback</strong>
                    <pre>{latestRun.error}</pre>
                  </div>
                {/if}
                {#if latestRun.stderr}
                  <div class="result-error muted">
                    <strong>stderr</strong>
                    <pre>{latestRun.stderr}</pre>
                  </div>
                {/if}
              {:else}
                <p class="empty-copy">Run the selected test case to compare your output against the expected result.</p>
              {/if}
            </div>
          </div>
        </article>
      </div>
    {/if}
  {/if}
</section>

<style>
  .dsa-practice-shell {
    display: grid;
    gap: 1.25rem;
    margin-top: 1.5rem;
  }

  .practice-heading-row,
  .workspace-toolbar,
  .problem-pane-header,
  .test-card-header {
    align-items: flex-start;
    display: flex;
    gap: 1rem;
    justify-content: space-between;
  }

  .runtime-pill-stack,
  .tag-row,
  .language-switcher,
  .case-pill-row,
  .attempt-timer-pill-row,
  .attempt-timer-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 0.55rem;
  }

  .runtime-pill.ready,
  .passing {
    background: color-mix(in srgb, var(--success) 18%, transparent);
    border-color: color-mix(in srgb, var(--success) 35%, transparent);
    color: var(--success);
  }

  .question-chip-row {
    display: grid;
    gap: 0.85rem;
    grid-template-columns: repeat(auto-fit, minmax(12rem, 1fr));
  }

  .question-chip,
  .language-pill,
  .case-pill {
    background: var(--ide-button-bg, var(--bg-soft));
    border: 1px solid var(--ide-border, var(--border));
    border-radius: 1rem;
    color: var(--text);
    cursor: pointer;
    transition: border-color 0.18s ease, transform 0.18s ease;
  }

  .question-chip {
    display: grid;
    gap: 0.35rem;
    padding: 0.9rem 1rem;
    text-align: left;
  }

  .question-chip span,
  .empty-copy,
  .support-card p,
  label span {
    color: var(--muted);
  }

  .question-chip.active,
  .language-pill.active,
  .case-pill.active {
    border-color: var(--accent);
    box-shadow: 0 0 0 1px var(--accent-muted);
    transform: translateY(-1px);
  }

  .dsa-practice-grid {
    display: grid;
    gap: 1rem;
    grid-template-columns: minmax(0, 0.95fr) minmax(0, 1.25fr);
  }

  .problem-pane,
  .workspace-pane,
  .test-card,
  .support-card,
  .dsa-empty-state,
  .attempt-timer-card {
    background: var(--panel);
    border: 1px solid var(--border);
    border-radius: 1.15rem;
    color: var(--text);
  }

  .attempt-timer-card {
    display: grid;
    gap: 0.85rem;
    margin-bottom: 1rem;
    padding: 0.95rem 1rem;
  }

  .attempt-timer-header {
    align-items: flex-start;
    display: flex;
    gap: 1rem;
    justify-content: space-between;
  }

  .attempt-timer-copy {
    color: var(--muted);
    margin: 0;
  }

  .attempt-timer-card h3 {
    margin: 0.15rem 0 0;
    color: var(--text);
  }

  .problem-pane,
  .workspace-pane {
    display: grid;
    gap: 1rem;
    padding: 1.1rem;
  }

  .problem-body {
    display: grid;
    gap: 0.8rem;
    max-height: 42rem;
    overflow: auto;
    padding-right: 0.35rem;
    color: var(--text);
  }

  .problem-body :global(p),
  .problem-body :global(li),
  .problem-body :global(h1),
  .problem-body :global(h2),
  .problem-body :global(h3),
  .problem-body :global(h4),
  .problem-body :global(strong) {
    color: inherit;
  }

  .problem-body :global(pre) {
    background: var(--code-bg, var(--bg-soft));
    border: 1px solid var(--border);
    border-radius: 0.9rem;
    flex-shrink: 0;
    max-height: none;
    min-height: min-content;
    overflow-x: auto;
    overflow-y: visible;
    padding: 0.85rem 0.9rem;
    white-space: pre-wrap;
    word-break: break-word;
  }

  .problem-body :global(code) {
    color: var(--code-fg, var(--accent-strong));
  }

  .support-card,
  .test-card,
  .dsa-empty-state {
    padding: 0.95rem 1rem;
  }

  .editor-frame {
    display: flex;
    flex-direction: column;
    overflow: hidden;
    min-width: 0;
    max-width: 100%;
    border: 1px solid var(--ide-border, var(--border));
    border-radius: 0.85rem;
    background: var(--ide-surface, var(--panel));
  }

  .editor-frame :global(.llm-editor-chrome) {
    flex: 0 0 auto;
    min-width: 0;
    border-bottom: 1px solid var(--ide-border, var(--border));
  }

  .editor-frame :global(.code-editor-shell) {
    border: none;
    border-radius: 0;
    height: auto;
    flex: 0 0 auto;
    min-width: 0;
  }

  .editor-frame :global(.monaco-host) {
    flex: 0 0 auto;
    max-height: min(50vh, 28rem);
  }

  .language-pill,
  .case-pill {
    padding: 0.55rem 0.8rem;
  }

  .test-lab-grid,
  .result-metric-grid {
    display: grid;
    gap: 1rem;
  }

  .test-lab-grid {
    grid-template-columns: minmax(0, 0.9fr) minmax(0, 1.1fr);
  }

  label {
    display: grid;
    gap: 0.45rem;
  }

  textarea {
    background: var(--bg-soft);
    border: 1px solid var(--border);
    border-radius: 0.85rem;
    color: var(--text);
    font: inherit;
    line-height: 1.45;
    padding: 0.8rem 0.9rem;
    resize: vertical;
  }

  pre {
    background: var(--bg-soft);
    border: 1px solid var(--border);
    border-radius: 0.85rem;
    color: var(--text);
    margin: 0.3rem 0 0;
    max-height: none;
    min-height: min-content;
    overflow-x: auto;
    overflow-y: visible;
    padding: 0.75rem 0.85rem;
    white-space: pre-wrap;
    word-break: break-word;
  }

  .result-error {
    background: var(--ide-warning-bg);
    border: 1px solid var(--ide-warning-border);
    border-radius: 0.9rem;
    padding: 0.75rem 0.85rem;
    color: var(--text);
  }

  .result-error.muted {
    background: var(--bg-soft);
    border-color: var(--border);
  }

  @media (max-width: 980px) {
    .dsa-practice-grid,
    .test-lab-grid {
      grid-template-columns: 1fr;
    }
  }
</style>
