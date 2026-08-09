<svelte:options runes={false} />
<script>
  import { base } from '$app/paths'
  import { browser } from '$app/environment'
  import { onMount, onDestroy } from 'svelte'
  import CodeEditor from '$lib/components/CodeEditor.svelte'

  export let lesson

  const DEFAULT_CODE = `import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
from sklearn.linear_model import LinearRegression

# --- Synthetic dataset ---
np.random.seed(42)
X = np.linspace(0, 10, 60).reshape(-1, 1)
y = 2.5 * X.ravel() + np.random.normal(0, 1.8, 60)

# --- Fit a linear model ---
model = LinearRegression()
model.fit(X, y)
print(f"Slope     : {model.coef_[0]:.3f}")
print(f"Intercept : {model.intercept_:.3f}")
print(f"R² score  : {model.score(X, y):.4f}")

# --- DataFrame summary ---
df = pd.DataFrame({
    'x': X.ravel(),
    'y_true': y,
    'y_pred': model.predict(X)
})
print(f"\\nFirst 5 rows:\\n{df.head().to_string(index=False)}")

# --- Plot (plt.show() is captured automatically) ---
plt.figure(figsize=(8, 5))
plt.scatter(X, y, color='steelblue', alpha=0.55, label='Data points')
plt.plot(X, model.predict(X), color='crimson', lw=2.5, label='Regression line')
plt.xlabel('X')
plt.ylabel('y')
plt.title('Linear Regression — in-browser ML with Pyodide + scikit-learn')
plt.legend()
plt.tight_layout()
plt.show()
`

  /** @type {Worker | null} */
  let worker = null

  /** @type {string} */
  let selectedExerciseId = ''
  let editorValue = DEFAULT_CODE
  let runId = 0
  let showHints = false
  /** @type {'idle' | 'pass' | 'review'} */
  let outputCheck = 'idle'

  $: codingExercises = (lesson?.exercises ?? []).filter(
    (/** @type {{ type?: string, starterCode?: string }} */ exercise) =>
      exercise?.type === 'coding' && typeof exercise?.starterCode === 'string' && exercise.starterCode.trim().length > 0
  )
  $: if (codingExercises.length && !codingExercises.some((exercise) => exercise.id === selectedExerciseId)) {
    selectedExerciseId = codingExercises[0].id
    editorValue = loadDraft(codingExercises[0].id) ?? codingExercises[0].starterCode
    showHints = false
    outputCheck = 'idle'
  }
  $: selectedExercise = codingExercises.find((exercise) => exercise.id === selectedExerciseId) ?? null
  $: draftKey = lesson?.id && selectedExerciseId ? `ml-practice:${lesson.id}:${selectedExerciseId}` : ''

  /** @param {string} exerciseId */
  function loadDraft(exerciseId) {
    if (!browser || !lesson?.id) return null
    try {
      return localStorage.getItem(`ml-practice:${lesson.id}:${exerciseId}`)
    } catch {
      return null
    }
  }

  function persistDraft() {
    if (!browser || !draftKey) return
    try {
      localStorage.setItem(draftKey, editorValue)
    } catch {
      // Ignore quota / private-mode failures.
    }
  }

  /** Soft check: look for expected-output keywords in stdout after a successful run. */
  function evaluateOutput(/** @type {string} */ text) {
    const expected = selectedExercise?.expectedOutput
    if (!expected || !text) {
      outputCheck = 'idle'
      return
    }
    const tokens = String(expected)
      .toLowerCase()
      .split(/[^a-z0-9.@+-]+/)
      .filter((token) => token.length >= 4)
      .slice(0, 6)
    if (!tokens.length) {
      outputCheck = 'review'
      return
    }
    const haystack = text.toLowerCase()
    const hits = tokens.filter((token) => haystack.includes(token)).length
    outputCheck = hits >= Math.min(2, tokens.length) ? 'pass' : 'review'
  }

  /** @type {'idle' | 'loading-runtime' | 'loading-packages' | 'running' | 'ready' | 'error'} */
  let status = 'idle'
  let statusMessage = 'Click "Run ML script" to start. The Pyodide runtime and ML packages load on first run.'

  let stdout = ''
  let stderr = ''
  /** @type {string[]} */
  let images = []
  let hasOutput = false

  $: editorFiles = [
    {
      id: 'script',
      label: `${(lesson?.slug ?? 'ml-script').replace(/[^a-z0-9-]/g, '-')}.py`,
      filename: 'script.py',
      language: 'python',
      value: editorValue
    }
  ]

  onMount(() => {
    if (!browser) return
    worker = new Worker(`${base}/ml-py-worker.js`)
    worker.onmessage = handleWorkerMessage
    worker.onerror = (e) => {
      status = 'error'
      statusMessage = e.message ?? 'Worker failed to load. Check browser console for details.'
    }
  })

  onDestroy(() => {
    worker?.terminate()
  })

  /** @param {MessageEvent} event */
  function handleWorkerMessage(event) {
    const msg = event.data
    if (msg.id !== runId) return

    if (msg.type === 'STATUS') {
      statusMessage = msg.message
      if (statusMessage.includes('Pyodide')) status = 'loading-runtime'
      else if (statusMessage.includes('Installing')) status = 'loading-packages'
      else status = 'running'
    } else if (msg.type === 'SUCCESS') {
      status = 'ready'
      statusMessage = 'Script completed successfully. Edit and re-run to iterate.'
      stdout = msg.stdout ?? ''
      stderr = msg.stderr ?? ''
      images = Array.isArray(msg.images) ? msg.images : []
      hasOutput = true
      evaluateOutput(stdout)
    } else if (msg.type === 'ERROR') {
      status = 'error'
      statusMessage = 'Script raised an exception — see output below.'
      stdout = ''
      stderr = msg.message ?? 'Unknown error.'
      images = []
      hasOutput = true
      outputCheck = 'idle'
    }
  }

  function runScript() {
    if (!worker || status === 'loading-runtime' || status === 'loading-packages' || status === 'running') return
    persistDraft()
    runId += 1
    stdout = ''
    stderr = ''
    images = []
    hasOutput = false
    outputCheck = 'idle'
    status = 'running'
    statusMessage = 'Starting…'
    worker.postMessage({ id: runId, code: editorValue })
  }

  function handleEditorChange(event) {
    editorValue = event.detail.value
    persistDraft()
  }

  /** @param {string} exerciseId */
  function loadExercise(exerciseId) {
    const exercise = codingExercises.find((item) => item.id === exerciseId)
    if (!exercise?.starterCode) return
    selectedExerciseId = exerciseId
    editorValue = loadDraft(exerciseId) ?? exercise.starterCode
    stdout = ''
    stderr = ''
    images = []
    hasOutput = false
    showHints = false
    outputCheck = 'idle'
    statusMessage = `Loaded exercise: ${exercise.title}. Edit the TODOs, then run.`
  }

  function loadSolution() {
    if (!selectedExercise?.solution) return
    editorValue = selectedExercise.solution
    persistDraft()
    statusMessage = 'Loaded reference solution. Compare it with your approach, then re-run.'
  }

  function resetToStarter() {
    if (selectedExercise?.starterCode) {
      editorValue = selectedExercise.starterCode
      persistDraft()
      statusMessage = 'Reset to starter code for the selected exercise.'
      return
    }
    editorValue = DEFAULT_CODE
    statusMessage = 'Reset to the default ML playground script.'
  }

  $: isRunning = status === 'loading-runtime' || status === 'loading-packages' || status === 'running'
  $: statusPillReady = status === 'ready'
  $: statusPillError = status === 'error'
  $: statusLabel = {
    idle: 'ML runtime idle',
    'loading-runtime': 'Loading Pyodide…',
    'loading-packages': 'Installing packages…',
    running: 'Running…',
    ready: 'Runtime ready',
    error: 'Runtime error'
  }[status] ?? status
</script>

<section id="ml-practice-lab" class="ml-practice-shell panel hero-card">
  <div class="ml-heading-row">
    <div>
      <p class="eyebrow">{codingExercises.length ? 'Python lab' : 'ML playground'}</p>
      <h2>{codingExercises.length ? 'In-browser Python editor' : 'In-browser Python ML editor'}</h2>
      <p class="practice-copy">
        Run Python in your browser via Pyodide WebAssembly
        {#if codingExercises.some((exercise) => /sklearn|numpy|matplotlib|pandas/i.test(exercise.starterCode || ''))}
          with NumPy, Pandas, Matplotlib, and scikit-learn available.
        {:else}
          (stdlib plus common scientific packages when needed).
        {/if}
        {#if codingExercises.length}
          Load a lesson exercise below, fill in the TODOs, and iterate with live output.
        {:else}
          No server, no install — all compute stays on your device.
        {/if}
      </p>
    </div>
    <div class="ml-pill-stack">
      <span
        class="pill runtime-pill"
        class:ready={statusPillReady}
        class:error={statusPillError}
        class:loading={isRunning}
      >{statusLabel}</span>
      <span class="pill">numpy · pandas · matplotlib · scikit-learn</span>
      {#if codingExercises.length}
        <span class="pill">{codingExercises.length} lesson exercise{codingExercises.length === 1 ? '' : 's'}</span>
      {/if}
    </div>
  </div>

  {#if codingExercises.length}
    <div class="ml-exercise-picker">
      <div class="ml-exercise-chip-row" role="list" aria-label="Coding exercises">
        {#each codingExercises as exercise}
          <button
            type="button"
            class="pill ml-exercise-chip"
            class:active={exercise.id === selectedExerciseId}
            role="listitem"
            onclick={() => loadExercise(exercise.id)}
          >
            {exercise.title}
            <span class="ml-chip-diff">{exercise.difficulty}</span>
          </button>
        {/each}
      </div>
      <label class="ml-exercise-label" for="ml-exercise-select">
        <span class="eyebrow">Lesson exercises</span>
        <select
          id="ml-exercise-select"
          class="ml-exercise-select"
          value={selectedExerciseId}
          onchange={(event) => loadExercise(/** @type {HTMLSelectElement} */ (event.currentTarget).value)}
        >
          {#each codingExercises as exercise}
            <option value={exercise.id}>{exercise.title} · {exercise.difficulty}</option>
          {/each}
        </select>
      </label>
      {#if selectedExercise}
        <p class="ml-exercise-copy">{selectedExercise.description}</p>
        {#if selectedExercise.expectedOutput}
          <p class="muted-hint">Expected: {selectedExercise.expectedOutput}</p>
        {/if}
        {#if Array.isArray(selectedExercise.hints) && selectedExercise.hints.length}
          <details class="ml-hints" bind:open={showHints}>
            <summary>Show hints ({selectedExercise.hints.length})</summary>
            <ol>
              {#each selectedExercise.hints as hint}
                <li>{hint}</li>
              {/each}
            </ol>
          </details>
        {/if}
        {#if outputCheck === 'pass'}
          <p class="ml-check pass">Output looks aligned with the expected result — review details, then try the next exercise.</p>
        {:else if outputCheck === 'review'}
          <p class="ml-check review">Script ran, but output may not match the expected markers yet. Compare against the expected note or load the solution.</p>
        {/if}
      {/if}
    </div>
  {/if}

  <div class="ml-workspace-grid">
    <!-- Editor pane -->
    <article class="ml-editor-pane">
      <div class="ml-toolbar">
        <p class="eyebrow">script.py</p>
        <div class="ml-toolbar-actions">
          {#if selectedExercise?.starterCode}
            <button class="action-link" type="button" onclick={resetToStarter}>Reset starter</button>
          {/if}
          {#if selectedExercise?.solution}
            <button class="action-link" type="button" onclick={loadSolution}>Load solution</button>
          {/if}
          <button
            class="action-link primary"
            class:disabled={isRunning}
            disabled={isRunning}
            type="button"
            onclick={runScript}
          >
            {isRunning ? 'Running…' : 'Run ML script'}
          </button>
        </div>
      </div>

      <div class="editor-frame">
        <CodeEditor
          files={editorFiles}
          activeFileId="script"
          minHeight="28rem"
          runShortcutEnabled={true}
          showHelperToolbar={false}
          on:change={handleEditorChange}
          on:runshortcut={runScript}
        />
      </div>

      <div class="ml-status-bar">
        <span class="status-dot" class:ready={statusPillReady} class:error={statusPillError} class:loading={isRunning}></span>
        <span class="status-text">{statusMessage}</span>
      </div>
    </article>

    <!-- Output pane -->
    <article class="ml-output-pane">
      <p class="eyebrow">Output</p>

      {#if !hasOutput && !isRunning}
        <div class="ml-output-empty">
          <p>Run the script to see printed output and matplotlib plots here.</p>
          <p class="muted-hint">First run downloads ~10 MB of WASM packages — subsequent runs are instant.</p>
        </div>
      {:else if isRunning}
        <div class="ml-output-empty">
          <div class="loading-dots">
            <span></span><span></span><span></span>
          </div>
          <p>{statusMessage}</p>
        </div>
      {:else}
        {#if stdout}
          <div class="output-section">
            <p class="eyebrow">stdout</p>
            <pre class="stdout-block">{stdout}</pre>
          </div>
        {/if}

        {#if stderr}
          <div class="output-section">
            <p class="eyebrow">stderr / traceback</p>
            <pre class="stderr-block">{stderr}</pre>
          </div>
        {/if}

        {#if images.length}
          <div class="output-section">
            <p class="eyebrow">{images.length} plot{images.length === 1 ? '' : 's'}</p>
            <div class="plot-grid">
              {#each images as imgB64, i}
                <figure class="plot-figure">
                  <img
                    src="data:image/png;base64,{imgB64}"
                    alt="Matplotlib plot {i + 1}"
                    loading="lazy"
                  />
                  <figcaption>Figure {i + 1}</figcaption>
                </figure>
              {/each}
            </div>
          </div>
        {/if}

        {#if !stdout && !stderr && !images.length}
          <p class="ml-output-empty">Script ran without output. Add <code>print()</code> calls or <code>plt.show()</code> to see results.</p>
        {/if}
      {/if}
    </article>
  </div>

  <div class="ml-footer-note">
    <p>
      <strong>How plots work:</strong> <code>plt.show()</code> is intercepted and renders each figure as a PNG above.
      All execution runs in a Web Worker so the page stays responsive during heavy computation.
    </p>
  </div>
</section>

<style>
  .ml-practice-shell {
    display: grid;
    gap: 1.25rem;
    margin-top: 1.5rem;
  }

  .ml-heading-row {
    align-items: flex-start;
    display: flex;
    gap: 1rem;
    justify-content: space-between;
  }

  .ml-pill-stack {
    display: flex;
    flex-shrink: 0;
    flex-wrap: wrap;
    gap: 0.55rem;
    justify-content: flex-end;
  }

  .ml-exercise-picker {
    display: grid;
    gap: 0.65rem;
    border: 1px solid var(--border);
    border-radius: 0.75rem;
    background: color-mix(in srgb, var(--panel) 88%, transparent);
    padding: 0.9rem 1rem;
  }

  .ml-exercise-label {
    display: grid;
    gap: 0.4rem;
  }

  .ml-exercise-select {
    width: min(100%, 36rem);
    border: 1px solid var(--border);
    border-radius: 0.5rem;
    background: var(--panel-strong, #1e1e2e);
    color: var(--text);
    padding: 0.55rem 0.75rem;
  }

  .ml-exercise-copy {
    margin: 0;
    color: var(--muted);
    line-height: 1.5;
  }

  .ml-exercise-chip-row {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .ml-exercise-chip {
    cursor: pointer;
    border: 1px solid var(--border);
    background: transparent;
    color: var(--muted);
  }

  .ml-exercise-chip.active {
    border-color: color-mix(in srgb, var(--accent) 55%, var(--border));
    background: color-mix(in srgb, var(--accent) 18%, transparent);
    color: var(--text);
  }

  .ml-chip-diff {
    margin-left: 0.35rem;
    opacity: 0.75;
    font-size: 0.78em;
  }

  .ml-hints {
    border-top: 1px solid var(--border);
    padding-top: 0.55rem;
  }

  .ml-hints summary {
    cursor: pointer;
    color: var(--accent, #696cff);
    font-size: 0.9rem;
  }

  .ml-hints ol {
    margin: 0.55rem 0 0;
    padding-left: 1.2rem;
    color: var(--muted);
    line-height: 1.5;
  }

  .ml-check {
    margin: 0;
    border-radius: 0.55rem;
    padding: 0.55rem 0.75rem;
    font-size: 0.88rem;
    line-height: 1.45;
  }

  .ml-check.pass {
    background: rgba(30, 132, 73, 0.16);
    border: 1px solid rgba(30, 132, 73, 0.35);
    color: #96e6b3;
  }

  .ml-check.review {
    background: rgba(180, 140, 40, 0.14);
    border: 1px solid rgba(220, 180, 80, 0.3);
    color: #f0d48a;
  }

  .ml-toolbar-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 0.55rem;
    justify-content: flex-end;
  }

  .runtime-pill {
    transition: background 0.2s ease, border-color 0.2s ease, color 0.2s ease;
  }

  .runtime-pill.ready {
    background: rgba(30, 132, 73, 0.18);
    border-color: rgba(30, 132, 73, 0.35);
    color: #96e6b3;
  }

  .runtime-pill.error {
    background: rgba(120, 40, 30, 0.2);
    border-color: rgba(199, 93, 78, 0.35);
    color: #f4a49e;
  }

  .runtime-pill.loading {
    background: rgba(92, 166, 255, 0.1);
    border-color: rgba(92, 166, 255, 0.3);
    color: #a8d8ff;
  }

  .ml-workspace-grid {
    display: grid;
    gap: 1rem;
    grid-template-columns: minmax(0, 1.1fr) minmax(0, 0.9fr);
  }

  @media (max-width: 900px) {
    .ml-workspace-grid {
      grid-template-columns: 1fr;
    }
  }

  .ml-editor-pane,
  .ml-output-pane {
    background: var(--panel);
    border: 1px solid var(--border);
    border-radius: 1.15rem;
    display: grid;
    gap: 0.85rem;
    padding: 1rem;
    color: var(--text);
  }

  .ml-toolbar {
    align-items: center;
    display: flex;
    justify-content: space-between;
  }

  .action-link.disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }

  .editor-frame {
    overflow: hidden;
  }

  .ml-status-bar {
    align-items: center;
    background: rgba(19, 26, 39, 0.7);
    border: 1px solid rgba(118, 139, 186, 0.14);
    border-radius: 0.7rem;
    display: flex;
    gap: 0.6rem;
    padding: 0.55rem 0.75rem;
  }

  .status-dot {
    background: rgba(118, 139, 186, 0.5);
    border-radius: 50%;
    flex-shrink: 0;
    height: 0.55rem;
    transition: background 0.2s ease;
    width: 0.55rem;
  }

  .status-dot.ready {
    background: #48bb78;
    box-shadow: 0 0 5px rgba(72, 187, 120, 0.5);
  }

  .status-dot.error {
    background: #fc8181;
    box-shadow: 0 0 5px rgba(252, 129, 129, 0.5);
  }

  .status-dot.loading {
    animation: pulse 1.2s ease-in-out infinite;
    background: #63b3ed;
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.35; }
  }

  .status-text {
    color: rgba(222, 230, 245, 0.78);
    font-size: 0.82rem;
    line-height: 1.35;
  }

  .ml-output-empty {
    align-items: center;
    color: rgba(222, 230, 245, 0.6);
    display: grid;
    gap: 0.5rem;
    justify-items: center;
    padding: 2rem 1rem;
    text-align: center;
  }

  .muted-hint {
    color: rgba(222, 230, 245, 0.4);
    font-size: 0.82rem;
  }

  .loading-dots {
    display: flex;
    gap: 0.4rem;
    margin-bottom: 0.5rem;
  }

  .loading-dots span {
    animation: bounce 1.1s ease-in-out infinite;
    background: rgba(92, 166, 255, 0.7);
    border-radius: 50%;
    height: 0.5rem;
    width: 0.5rem;
  }

  .loading-dots span:nth-child(2) { animation-delay: 0.15s; }
  .loading-dots span:nth-child(3) { animation-delay: 0.3s; }

  @keyframes bounce {
    0%, 80%, 100% { transform: scale(0.7); opacity: 0.5; }
    40% { transform: scale(1); opacity: 1; }
  }

  .output-section {
    display: grid;
    gap: 0.45rem;
  }

  pre {
    border-radius: 0.85rem;
    font-size: 0.82rem;
    line-height: 1.55;
    margin: 0;
    max-height: 18rem;
    overflow: auto;
    padding: 0.85rem 0.95rem;
    white-space: pre-wrap;
    word-break: break-word;
  }

  .stdout-block {
    background: rgba(19, 26, 39, 0.92);
    border: 1px solid rgba(118, 139, 186, 0.18);
    color: #e6edf7;
  }

  .stderr-block {
    background: rgba(120, 40, 30, 0.16);
    border: 1px solid rgba(199, 93, 78, 0.28);
    color: #f4a49e;
  }

  .plot-grid {
    display: grid;
    gap: 0.85rem;
  }

  .plot-figure {
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(118, 139, 186, 0.2);
    border-radius: 0.85rem;
    display: grid;
    gap: 0.35rem;
    margin: 0;
    overflow: hidden;
    padding: 0.5rem;
  }

  .plot-figure img {
    border-radius: 0.55rem;
    display: block;
    max-width: 100%;
    width: 100%;
  }

  .plot-figure figcaption {
    color: rgba(222, 230, 245, 0.5);
    font-size: 0.78rem;
    text-align: center;
  }

  .ml-footer-note {
    background: rgba(92, 166, 255, 0.06);
    border: 1px solid rgba(92, 166, 255, 0.16);
    border-radius: 0.85rem;
    font-size: 0.84rem;
    padding: 0.75rem 1rem;
  }

  .ml-footer-note p {
    color: rgba(222, 230, 245, 0.72);
    margin: 0;
  }

  .ml-footer-note code {
    background: rgba(92, 166, 255, 0.12);
    border-radius: 0.3rem;
    color: #a8d8ff;
    padding: 0.1em 0.35em;
  }
</style>
