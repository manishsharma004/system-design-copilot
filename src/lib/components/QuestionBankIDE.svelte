<svelte:options runes={false} />
<script>
  import { browser } from '$app/environment'
  import { onDestroy, onMount } from 'svelte'

  import CodeEditor from '$lib/components/CodeEditor.svelte'
  import LlmAssistantPanel from '$lib/components/LlmAssistantPanel.svelte'
  import { plainTextFromHtml } from '$lib/llm/checkPrompts'
  import { buildQuestionBank } from '$lib/dsa/questionBank'
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
  import { ensureCppRuntime, runCppSource } from '$lib/dsa/wasmCppRuntime'
  import { ensureJavaRuntime, runJavaPractice } from '$lib/dsa/wasmJavaRuntime'
  import { ensurePythonRuntime, runPythonSource } from '$lib/dsa/wasmPythonRuntime'

  export let lesson

  // Lazy, per-bucket dataset loaders. Each entry is code-split into its own chunk
  // and only fetched when its lesson is opened, keeping lesson pages light.
  const bankLoaders = {
    'top-interview-questions-easy': () => import('$lib/data/top-interview-questions-easy.json'),
    'top-interview-questions-medium': () => import('$lib/data/top-interview-questions-medium.json'),
    'top-interview-questions-hard': () => import('$lib/data/top-interview-questions-hard.json'),
    google: () => import('$lib/data/google.json'),
    amazon: () => import('$lib/data/amazon.json'),
    facebook: () => import('$lib/data/facebook.json'),
    apple: () => import('$lib/data/apple.json'),
    microsoft: () => import('$lib/data/microsoft.json'),
    adobe: () => import('$lib/data/adobe.json'),
    bloomberg: () => import('$lib/data/bloomberg.json'),
    linkedin: () => import('$lib/data/linkedin.json'),
    uber: () => import('$lib/data/uber.json'),
    yelp: () => import('$lib/data/yelp.json'),
    'coding-interview-strategy': () => import('$lib/data/coding-interview-strategy.json'),
    leapai: () => import('$lib/data/leapai.json')
  }

  $: descriptor = lesson?.questionBank ?? null
  $: bankKey = descriptor?.key ?? ''
  $: completionStorageKey = `question-bank:${bankKey}:completed`

  let bank = null
  let loadStatus = 'idle'
  let loadError = ''
  let loadedKey = ''
  let query = ''
  let selectedItemId = ''
  /** @type {Record<string, boolean>} */
  let completed = {}

  // Editor / runner state (only used for runnable coding questions).
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
  let runtimeReadyByLanguage = { python3: false, cpp: false, java: false }
  let activeRuntimeLanguageId = ''
  let readingDraft = ''
  let readingDraftKey = ''

  $: if (browser && bankKey && bankKey !== loadedKey && loadStatus !== 'loading') {
    loadBank(bankKey)
  }

  $: allItems = bank ? bank.chapters.flatMap((chapter) => chapter.items) : []
  $: normalizedQuery = query.trim().toLowerCase()
  $: visibleChapters = bank
    ? bank.chapters
        .map((chapter) => ({
          ...chapter,
          visibleItems: normalizedQuery
            ? chapter.items.filter((item) => item.title.toLowerCase().includes(normalizedQuery))
            : chapter.items
        }))
        .filter((chapter) => chapter.visibleItems.length > 0)
    : []

  $: if (allItems.length && !allItems.some((item) => item.id === selectedItemId)) {
    selectItem(allItems[0])
  }
  $: selectedItem = allItems.find((item) => item.id === selectedItemId) ?? null
  $: completedCount = allItems.filter((item) => completed[item.id]).length

  $: availableLanguages = selectedItem?.kind === 'coding'
    ? practiceLanguageCatalog.filter((language) => selectedItem?.languageTemplates?.[language.id])
    : []
  $: if (availableLanguages.length && !availableLanguages.some((language) => language.id === languageId)) {
    languageId = availableLanguages[0].id
  }
  $: activeLanguage = availableLanguages.find((language) => language.id === languageId) ?? availableLanguages[0] ?? null
  $: practiceCases = selectedItem?.practiceCases?.length ? selectedItem.practiceCases : []

  $: if (activeLanguage?.id && activeLanguage.id !== activeRuntimeLanguageId) {
    activeRuntimeLanguageId = activeLanguage.id
    const isReady = Boolean(runtimeReadyByLanguage[activeLanguage.id])
    runtimeStatus = isReady ? 'ready' : 'idle'
    runtimeMessage = isReady ? getReadyMessage(activeLanguage.id) : activeLanguage.helperText
  }

  $: if (selectedItem?.kind === 'coding' && activeLanguage) {
    const nextDraftKey = getDraftKey(selectedItem, activeLanguage.id)
    if (nextDraftKey !== activeDraftKey) {
      activeDraftKey = nextDraftKey
      editorValue = loadDraft(selectedItem, activeLanguage.id)
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

  $: readingAnswerKey = selectedItem?.kind === 'reading' && bankKey
    ? `question-bank-answer:${bankKey}:${selectedItem.id}`
    : ''
  $: if (readingAnswerKey !== readingDraftKey) {
    readingDraftKey = readingAnswerKey
    readingDraft = readingAnswerKey ? ($practiceAnswers[readingAnswerKey]?.answer ?? '') : ''
  }
  $: checkQuestionText = selectedItem
    ? [selectedItem.title, plainTextFromHtml(selectedItem.contentHtml), selectedItem.note].filter(Boolean).join('\n\n')
    : ''
  $: checkDraft = selectedItem?.kind === 'coding'
    ? editorValue
    : readingDraft
  $: checkContextSections = selectedItem
    ? [
        `Lesson: ${lesson.title}`,
        `Question kind: ${selectedItem.kind}`,
        selectedItem.kind === 'coding' && activeLanguage ? `Language: ${activeLanguage.label}` : '',
        selectedItem.kind === 'coding'
          ? (latestRun
            ? `Last test run: ${latestRun.passed ? 'Pass' : 'Needs work'}${latestRun.error ? ` — ${latestRun.error}` : ''}`
            : 'Last test run: not run yet')
          : ''
      ].filter(Boolean)
    : []

  function saveReadingAnswer() {
    if (!readingAnswerKey) return
    practiceAnswers.saveAnswer(readingAnswerKey, readingDraft)
  }

  async function loadBank(key) {
    const loader = bankLoaders[key]
    if (!loader) {
      loadStatus = 'error'
      loadError = `No dataset is registered for "${key}".`
      return
    }
    loadStatus = 'loading'
    loadError = ''
    try {
      const module = await loader()
      const raw = module?.default ?? module
      bank = buildQuestionBank(raw)
      loadedKey = key
      loadStatus = 'ready'
      restoreCompletion(key)
      query = ''
      selectedItemId = ''
    } catch (error) {
      loadStatus = 'error'
      loadError = error instanceof Error ? error.message : 'Unable to load this question bank.'
    }
  }

  function restoreCompletion(key) {
    if (!browser) return
    try {
      const raw = window.localStorage.getItem(`question-bank:${key}:completed`)
      completed = raw ? JSON.parse(raw) : {}
    } catch {
      completed = {}
    }
  }

  function persistCompletion() {
    if (!browser) return
    try {
      window.localStorage.setItem(completionStorageKey, JSON.stringify(completed))
    } catch {
      // ignore storage errors
    }
  }

  function toggleCompleted(itemId) {
    completed = { ...completed, [itemId]: !completed[itemId] }
    if (!completed[itemId]) delete completed[itemId]
    persistCompletion()
  }

  function selectItem(item) {
    if (!item) return
    selectedItemId = item.id
    latestRun = null
    if (item.kind === 'coding') {
      applyPracticeCase(item.practiceCases?.[0] ?? { id: '', inputRaw: '', expectedRaw: '' })
    }
  }

  function getReadyMessage(nextLanguageId) {
    if (nextLanguageId === 'cpp') {
      return 'C++ runtime is ready. The current file compiles to WebAssembly in-browser and runs through a WASI adapter.'
    }
    if (nextLanguageId === 'java') {
      return 'Java runtime is ready. The current source compiles inside CheerpJ and executes through a generated harness in the browser.'
    }
    return 'Python runtime loaded locally in the browser through Pyodide WebAssembly.'
  }

  function getDraftKey(item, nextLanguageId) {
    return `question-bank:${bankKey}:${item.id}:${nextLanguageId}`
  }

  function loadDraft(item, nextLanguageId) {
    const draftKey = getDraftKey(item, nextLanguageId)
    if (draftCache[draftKey] !== undefined) return draftCache[draftKey]
    const defaultCode = item.languageTemplates?.[nextLanguageId]?.defaultCode ?? ''
    draftCache[draftKey] = defaultCode
    return defaultCode
  }

  function saveDraft(nextValue) {
    if (!selectedItem || !activeLanguage) return
    draftCache[getDraftKey(selectedItem, activeLanguage.id)] = nextValue
  }

  function applyPracticeCase(practiceCase) {
    activeCaseId = practiceCase.id
    caseInput = practiceCase.inputRaw ?? ''
    expectedOutput = practiceCase.expectedRaw ?? ''
    latestRun = null
  }

  function handleEditorChange(event) {
    editorValue = event.detail.value
    saveDraft(editorValue)
  }

  async function runCurrentCase() {
    if (!selectedItem || selectedItem.kind !== 'coding' || !activeLanguage) return

    const inputValues = parseInputLines(caseInput)
    const expectedParameterCount = selectedItem.practiceMeta?.params?.length ?? 0

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
        practiceMeta: selectedItem.practiceMeta,
        userCode: editorValue,
        inputValues
      })
      execution = await runPythonSource(source)
      if (execution.ok) runtimeReadyByLanguage = { ...runtimeReadyByLanguage, python3: true }
    } else if (activeLanguage.id === 'cpp') {
      runtimeStatus = 'loading'
      runtimeMessage = 'Compiling C++ to WebAssembly in the browser, then executing it through WASI.'
      try {
        await ensureCppRuntime()
        runtimeReadyByLanguage = { ...runtimeReadyByLanguage, cpp: true }
      } catch (error) {
        execution = { ok: false, stdout: '', stderr: '', error: error instanceof Error ? error.message : 'Unable to load the C++ browser runtime.' }
      }
      if (!execution) {
        const source = buildCppPracticeSource({ practiceMeta: selectedItem.practiceMeta, userCode: editorValue, inputValues })
        execution = await runCppSource(source)
      }
    } else if (activeLanguage.id === 'java') {
      runtimeStatus = 'loading'
      runtimeMessage = 'Compiling Java in the browser through CheerpJ, then executing a generated harness.'
      try {
        await ensureJavaRuntime()
        runtimeReadyByLanguage = { ...runtimeReadyByLanguage, java: true }
      } catch (error) {
        execution = { ok: false, stdout: '', stderr: '', error: error instanceof Error ? error.message : 'Unable to load the Java browser runtime.' }
      }
      if (!execution) {
        const sources = buildJavaPracticeFiles({ practiceMeta: selectedItem.practiceMeta, userCode: editorValue, inputValues })
        execution = await runJavaPractice(sources)
      }
    } else {
      latestRun = { ok: false, passed: false, actual: '', expected: expectedOutput.trim(), error: activeLanguage.helperText }
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
      ? `${activeLanguage.label} runtime is ready. Edit the current test case or pick another question to keep iterating.`
      : (execution.error || execution.stderr || `Execution failed inside the ${activeLanguage.label} browser runtime.`)
  }

  onMount(async () => {
    if (!browser) return
    try {
      await ensurePythonRuntime()
      runtimeReadyByLanguage = { ...runtimeReadyByLanguage, python3: true }
      if (activeLanguage?.id === 'python3') {
        runtimeStatus = 'ready'
        runtimeMessage = getReadyMessage('python3')
      }
    } catch {
      // Runtime loads lazily on first run if eager warm-up fails.
    }
  })

  onDestroy(() => {})
</script>

<section id="practice-lab" class="bank-shell panel hero-card">
  <div class="bank-heading-row">
    <div>
      <p class="eyebrow">Question bank</p>
      <h2>{descriptor?.label ?? 'Question bank'} practice</h2>
      <p class="bank-copy">Browse every question in this bucket by section, then read, solve, and run the runnable ones in the browser.</p>
    </div>
    {#if bank}
      <div class="bank-pill-stack">
        <span class="pill">{bank.totalQuestions} item{bank.totalQuestions === 1 ? '' : 's'}</span>
        {#if bank.runnableCount}
          <span class="pill">{bank.runnableCount} runnable</span>
        {/if}
        <span class:ready={completedCount > 0} class="pill">{completedCount} completed</span>
      </div>
    {/if}
  </div>

  {#if loadStatus === 'loading'}
    <div class="bank-state">
      <h3>Loading the {descriptor?.label ?? ''} question bank…</h3>
      <p>The dataset is fetched on demand the first time you open this lesson.</p>
    </div>
  {:else if loadStatus === 'error'}
    <div class="bank-state">
      <h3>Could not load this question bank</h3>
      <p>{loadError}</p>
    </div>
  {:else if loadStatus === 'idle' && !browser}
    <div class="bank-state">
      <h3>Question bank workspace</h3>
      <p>The interactive question bank loads in the browser.</p>
    </div>
  {:else if bank}
    <div class="bank-grid">
      <aside class="bank-sidebar">
        <label class="bank-search">
          <span>Filter questions</span>
          <input type="search" placeholder="Search by title" bind:value={query} />
        </label>
        <div class="bank-section-list">
          {#each visibleChapters as chapter}
            {@const sectionTotal = chapter.items.length}
            {@const sectionDone = chapter.items.filter((item) => completed[item.id]).length}
            <div class="bank-section" class:completed={sectionTotal > 0 && sectionDone === sectionTotal}>
              <div class="bank-section-header">
                <strong>{chapter.title}</strong>
                <span class="count">{sectionDone}/{sectionTotal}</span>
              </div>
              <ol class="bank-question-list">
                {#each chapter.visibleItems as item, index}
                  <li>
                    <button
                      class:active={item.id === selectedItemId}
                      class:done={completed[item.id]}
                      class="bank-question-link"
                      type="button"
                      onclick={() => selectItem(item)}
                    >
                      <span class="q-index">{index + 1}</span>
                      <span class="q-title">{item.title}</span>
                      {#if item.kind === 'coding' && item.supportsLocalWasmRun}
                        <span class="q-flag" title="Runnable in-browser">▶</span>
                      {:else if item.kind === 'reading'}
                        <span class="q-flag reading" title="Reading">★</span>
                      {/if}
                    </button>
                  </li>
                {/each}
              </ol>
            </div>
          {/each}
          {#if !visibleChapters.length}
            <p class="empty-copy">No questions match “{query}”.</p>
          {/if}
        </div>
      </aside>

      <div class="bank-main">
        {#if selectedItem}
          <article class="problem-pane">
            <div class="problem-pane-header">
              <div>
                <p class="eyebrow">{selectedItem.kind === 'reading' ? 'Reading' : 'Problem statement'}</p>
                <h3>{selectedItem.title}</h3>
              </div>
              <div class="tag-row">
                {#if selectedItem.kind === 'coding' && selectedItem.supportsLocalWasmRun}
                  <span class="pill runnable">Runnable</span>
                {/if}
                {#if selectedItem.paidOnly}
                  <span class="pill">Premium</span>
                {/if}
                <button
                  class:done={completed[selectedItem.id]}
                  class="action-link complete-toggle"
                  type="button"
                  onclick={() => toggleCompleted(selectedItem.id)}
                >
                  {completed[selectedItem.id] ? 'Completed ✓' : 'Mark complete'}
                </button>
              </div>
            </div>

            {#if selectedItem.note}
              <p class="problem-note">{selectedItem.note}</p>
            {/if}

            {#if selectedItem.contentHtml}
              <div class="problem-body prose-like">{@html selectedItem.contentHtml}</div>
            {:else}
              <p class="empty-copy">No description is available for this item.</p>
            {/if}

            {#if selectedItem.kind === 'coding' && selectedItem.titleSlug}
              <a class="action-link" href={`https://leetcode.com/problems/${selectedItem.titleSlug}/`} target="_blank" rel="noopener noreferrer">Open on LeetCode ↗</a>
            {:else if selectedItem.kind === 'reading' && selectedItem.originalLink}
              <a class="action-link" href={selectedItem.originalLink} target="_blank" rel="noopener noreferrer">Open original ↗</a>
            {/if}

            {#if selectedItem.hints?.length}
              <details class="support-card">
                <summary>Hints ({selectedItem.hints.length})</summary>
                <ul>
                  {#each selectedItem.hints as hint}
                    <li>{@html hint}</li>
                  {/each}
                </ul>
              </details>
            {/if}

            {#if selectedItem.solutionHtml}
              <details class="support-card">
                <summary>Show solution</summary>
                <div class="prose-like">{@html selectedItem.solutionHtml}</div>
              </details>
            {/if}

            {#if selectedItem.kind === 'reading'}
              <label class="reading-answer-field">
                <span class="eyebrow">Your answer</span>
                <textarea
                  rows="6"
                  bind:value={readingDraft}
                  oninput={saveReadingAnswer}
                  placeholder="Write a short interview-style answer, then use Check (AI)."
                ></textarea>
              </label>
              <div class="reading-llm-chrome">
                <LlmAssistantPanel
                  title="Interview answer copilot"
                  flowId="interview-questions"
                  showOutline={false}
                  objective={checkQuestionText}
                  draft={checkDraft}
                  contextSections={checkContextSections}
                />
              </div>
            {/if}
          </article>

          {#if selectedItem.kind === 'coding' && selectedItem.supportsLocalWasmRun && activeLanguage}
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
                <button class="action-link primary" type="button" onclick={runCurrentCase} title="Run test case (Ctrl+Enter)">Run test case</button>
              </div>

              <div class="editor-frame">
                <LlmAssistantPanel
                  title="Interview answer copilot"
                  flowId="interview-questions"
                  showOutline={false}
                  objective={checkQuestionText}
                  draft={checkDraft}
                  contextSections={checkContextSections}
                />
                {#key activeDraftKey}
                  <CodeEditor
                    files={editorFiles}
                    activeFileId="solution"
                    minHeight="22rem"
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
                    <textarea rows="6" bind:value={caseInput}></textarea>
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
                  {:else}
                    <p class="empty-copy">Run the selected test case to compare your output against the expected result.</p>
                  {/if}
                  <p class="runtime-note">{runtimeMessage}</p>
                </div>
              </div>
            </article>
          {:else if selectedItem.kind === 'coding'}
            <article class="workspace-pane">
              <div class="bank-state inline">
                <h3>Not runnable in the browser yet</h3>
                <p>This question does not expose a single-method signature the local WASM runner can execute. You can still read it here and practice on LeetCode.</p>
              </div>
            </article>
          {/if}
        {/if}
      </div>
    </div>
  {/if}
</section>

<style>
  .bank-shell {
    display: grid;
    gap: 1.25rem;
    margin-top: 1.5rem;
  }

  .bank-heading-row {
    align-items: flex-start;
    display: flex;
    gap: 1rem;
    justify-content: space-between;
  }

  .bank-pill-stack,
  .tag-row,
  .language-switcher,
  .case-pill-row {
    display: flex;
    flex-wrap: wrap;
    gap: 0.55rem;
  }

  .bank-copy,
  .empty-copy,
  .problem-note,
  .runtime-note,
  label span {
    color: var(--muted);
  }

  .pill.ready,
  .pill.runnable,
  .passing {
    background: color-mix(in srgb, var(--success) 18%, transparent);
    border-color: color-mix(in srgb, var(--success) 35%, transparent);
    color: var(--success);
  }

  .bank-state {
    background: var(--panel);
    border: 1px solid var(--border);
    border-radius: 1.15rem;
    padding: 1.1rem;
    color: var(--text);
  }

  .bank-state.inline {
    margin: 0;
  }

  .reading-answer-field {
    display: grid;
    gap: 0.45rem;
    margin-top: 0.85rem;
  }

  .reading-answer-field textarea {
    width: 100%;
    min-height: 8rem;
    resize: vertical;
  }

  .reading-llm-chrome {
    margin-top: 0.65rem;
    overflow: hidden;
    min-width: 0;
    max-width: 100%;
    border: 1px solid var(--ide-border, var(--border));
    border-radius: 0.85rem;
  }

  .bank-grid {
    display: grid;
    gap: 1rem;
    grid-template-columns: minmax(0, 0.8fr) minmax(0, 1.6fr);
  }

  .bank-sidebar {
    background: var(--panel);
    border: 1px solid var(--border);
    border-radius: 1.15rem;
    display: grid;
    gap: 0.85rem;
    max-height: 46rem;
    overflow: auto;
    padding: 1rem;
    color: var(--text);
  }

  .bank-search {
    display: grid;
    gap: 0.4rem;
    position: sticky;
    top: 0;
  }

  .bank-search input,
  textarea {
    background: var(--bg-soft);
    border: 1px solid var(--border);
    border-radius: 0.85rem;
    color: var(--text);
    font: inherit;
    padding: 0.6rem 0.75rem;
  }

  textarea {
    line-height: 1.45;
    resize: vertical;
  }

  .bank-section-list {
    display: grid;
    gap: 0.85rem;
  }

  .bank-section.completed .bank-section-header strong {
    color: var(--success);
  }

  .bank-section-header {
    align-items: baseline;
    display: flex;
    gap: 0.5rem;
    justify-content: space-between;
    margin-bottom: 0.35rem;
  }

  .bank-section-header .count {
    color: var(--muted);
    font-size: 0.8rem;
  }

  .bank-question-list {
    display: grid;
    gap: 0.3rem;
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .bank-question-link {
    align-items: center;
    background: var(--bg-soft);
    border: 1px solid var(--border);
    border-radius: 0.7rem;
    color: var(--text);
    cursor: pointer;
    display: flex;
    gap: 0.5rem;
    padding: 0.5rem 0.6rem;
    text-align: left;
    transition: border-color 0.16s ease;
    width: 100%;
  }

  .bank-question-link:hover {
    border-color: var(--accent);
  }

  .bank-question-link.active {
    border-color: var(--accent);
    box-shadow: 0 0 0 1px var(--accent-muted);
  }

  .bank-question-link.done {
    background: color-mix(in srgb, var(--success) 16%, transparent);
    border-color: color-mix(in srgb, var(--success) 32%, transparent);
  }

  .q-index {
    color: var(--muted);
    font-size: 0.78rem;
    min-width: 1.4rem;
  }

  .q-title {
    flex: 1;
  }

  .q-flag {
    color: var(--accent);
    font-size: 0.75rem;
  }

  .q-flag.reading {
    color: var(--warning, var(--accent-strong));
  }

  .bank-main {
    display: grid;
    gap: 1rem;
  }

  .problem-pane,
  .workspace-pane,
  .test-card,
  .support-card {
    background: var(--panel);
    border: 1px solid var(--border);
    border-radius: 1.15rem;
    color: var(--text);
  }

  .problem-pane,
  .workspace-pane {
    display: grid;
    gap: 1rem;
    padding: 1.1rem;
  }

  .problem-pane-header,
  .workspace-toolbar,
  .test-card-header {
    align-items: flex-start;
    display: flex;
    gap: 1rem;
    justify-content: space-between;
  }

  .complete-toggle.done {
    background: color-mix(in srgb, var(--success) 18%, transparent);
    border-color: color-mix(in srgb, var(--success) 35%, transparent);
    color: var(--success);
  }

  .problem-body {
    display: grid;
    gap: 0.8rem;
    max-height: 36rem;
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

  .support-card {
    padding: 0.85rem 1rem;
  }

  .support-card summary {
    cursor: pointer;
    font-weight: 600;
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
    background: var(--ide-button-bg, var(--bg-soft));
    border: 1px solid var(--ide-border, var(--border));
    border-radius: 1rem;
    color: var(--text);
    cursor: pointer;
    padding: 0.5rem 0.8rem;
  }

  .language-pill.active,
  .case-pill.active {
    border-color: var(--accent);
    box-shadow: 0 0 0 1px var(--accent-muted);
  }

  .test-lab-grid,
  .result-metric-grid {
    display: grid;
    gap: 1rem;
  }

  .test-lab-grid {
    grid-template-columns: minmax(0, 0.9fr) minmax(0, 1.1fr);
  }

  .test-card {
    padding: 0.95rem 1rem;
  }

  label {
    display: grid;
    gap: 0.45rem;
  }

  textarea {
    padding: 0.8rem 0.9rem;
  }

  pre {
    background: var(--bg-soft);
    border: 1px solid var(--border);
    border-radius: 0.85rem;
    color: var(--text);
    margin: 0.3rem 0 0;
    max-height: none;
    overflow: auto;
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

  @media (max-width: 980px) {
    .bank-grid,
    .test-lab-grid {
      grid-template-columns: 1fr;
    }

    .bank-sidebar {
      max-height: 22rem;
    }
  }
</style>
