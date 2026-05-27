<svelte:options runes={false} />
<script>
  import { browser } from '$app/environment'
  import { onMount } from 'svelte'

  import CodeEditor from '$lib/components/CodeEditor.svelte'
  import {
    buildCppPracticeSource,
    buildPythonPracticeSource,
    formatComparableValue,
    parseExpectedValue,
    parseInputLines,
    practiceLanguageCatalog
  } from '$lib/dsa/practice'
  import { ensureCppRuntime, runCppSource } from '$lib/dsa/wasmCppRuntime'
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

  function getReadyMessage(nextLanguageId) {
    if (nextLanguageId === 'cpp') {
      return 'C++ runtime is ready. The current file will compile to WebAssembly in-browser and run through a WASI adapter.'
    }
    if (nextLanguageId === 'java') {
      return 'Java template mode is ready, but execution is still pending a browser JVM integration.'
    }
    return 'Python runtime loaded locally in the browser through Pyodide WebAssembly.'
  }

  function getDraftKey(question, nextLanguageId) {
    return `dsa-practice:${lesson.id}:${question.frontendId}:${nextLanguageId}`
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
</script>

<section class="dsa-practice-shell panel hero-card">
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
            <button class="action-link primary" type="button" onclick={runCurrentCase}>Run test case</button>
          </div>

          <div class="editor-frame">
            {#key activeDraftKey}
              <CodeEditor
                files={editorFiles}
                activeFileId="solution"
                minHeight="24rem"
                showHelperToolbar={false}
                on:change={handleEditorChange}
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
  .case-pill-row {
    display: flex;
    flex-wrap: wrap;
    gap: 0.55rem;
  }

  .runtime-pill.ready,
  .passing {
    background: rgba(30, 132, 73, 0.18);
    border-color: rgba(30, 132, 73, 0.35);
    color: #96e6b3;
  }

  .question-chip-row {
    display: grid;
    gap: 0.85rem;
    grid-template-columns: repeat(auto-fit, minmax(12rem, 1fr));
  }

  .question-chip,
  .language-pill,
  .case-pill {
    background: rgba(13, 18, 28, 0.92);
    border: 1px solid rgba(118, 139, 186, 0.18);
    border-radius: 1rem;
    color: inherit;
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
    color: rgba(222, 230, 245, 0.78);
  }

  .question-chip.active,
  .language-pill.active,
  .case-pill.active {
    border-color: rgba(92, 166, 255, 0.7);
    box-shadow: 0 0 0 1px rgba(92, 166, 255, 0.18);
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
  .dsa-empty-state {
    background: rgba(11, 15, 24, 0.92);
    border: 1px solid rgba(118, 139, 186, 0.18);
    border-radius: 1.15rem;
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
  }

  .problem-body :global(pre) {
    background: rgba(20, 27, 41, 0.96);
    border: 1px solid rgba(118, 139, 186, 0.16);
    border-radius: 0.9rem;
    overflow: auto;
    padding: 0.85rem 0.9rem;
  }

  .problem-body :global(code) {
    color: #a8d8ff;
  }

  .support-card,
  .test-card,
  .dsa-empty-state {
    padding: 0.95rem 1rem;
  }

  .editor-frame {
    overflow: hidden;
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
    background: rgba(19, 26, 39, 0.92);
    border: 1px solid rgba(118, 139, 186, 0.18);
    border-radius: 0.85rem;
    color: #e6edf7;
    font: inherit;
    line-height: 1.45;
    padding: 0.8rem 0.9rem;
    resize: vertical;
  }

  pre {
    background: rgba(19, 26, 39, 0.92);
    border-radius: 0.85rem;
    margin: 0.3rem 0 0;
    overflow: auto;
    padding: 0.75rem 0.85rem;
    white-space: pre-wrap;
    word-break: break-word;
  }

  .result-error {
    background: rgba(120, 40, 30, 0.16);
    border: 1px solid rgba(199, 93, 78, 0.25);
    border-radius: 0.9rem;
    padding: 0.75rem 0.85rem;
  }

  .result-error.muted {
    background: rgba(47, 61, 93, 0.2);
    border-color: rgba(118, 139, 186, 0.18);
  }

  @media (max-width: 980px) {
    .dsa-practice-grid,
    .test-lab-grid {
      grid-template-columns: 1fr;
    }
  }
</style>
