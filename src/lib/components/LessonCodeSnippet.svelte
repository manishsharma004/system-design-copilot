<svelte:options runes={false} />
<script>
  // @ts-nocheck
  import { onMount } from 'svelte'
  import { get } from 'svelte/store'
  import { getMonaco, applyMonacoTheme, getMonacoThemeId } from '$lib/editor/monaco'
  import { theme } from '$lib/stores/theme.js'
  import { isLessonPythonLanguage, runLessonPython } from '$lib/lessonPythonRunner.js'

  export let code = ''
  export let language = 'python'
  export let title = 'Code example'
  export let languageLabel = 'Python'
  /** When false, keep read-only even for Python. Default true. */
  export let runnable = true

  /** @type {HTMLDivElement | undefined} */
  let host
  let editor
  let model
  let monaco
  let ready = false
  let editorValue = code
  let status = 'idle'
  let statusMessage = ''
  let stdout = ''
  let stderr = ''
  /** @type {string[]} */
  let images = []
  let hasOutput = false
  let runGeneration = 0

  $: canRun = runnable && isLessonPythonLanguage(language)
  $: isBusy = status === 'loading-runtime' || status === 'loading-packages' || status === 'running'

  onMount(() => {
    let disposed = false
    editorValue = code

    ;(async () => {
      monaco = await getMonaco()
      if (disposed || !host) return

      model = monaco.editor.createModel(code, language)
      editor = monaco.editor.create(host, {
        model,
        readOnly: !canRun,
        domReadOnly: !canRun,
        minimap: { enabled: false },
        lineNumbers: 'on',
        renderLineHighlight: canRun ? 'line' : 'none',
        overviewRulerLanes: 0,
        glyphMargin: false,
        folding: false,
        scrollBeyondLastLine: false,
        wordWrap: 'on',
        automaticLayout: true,
        contextmenu: false,
        theme: getMonacoThemeId(get(theme)),
        fontSize: 13,
        fontFamily: 'JetBrains Mono, ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
        tabSize: 4,
        renderWhitespace: 'selection'
      })

      editor.onDidChangeModelContent(() => {
        editorValue = model.getValue()
      })

      ready = true
      applyMonacoTheme(monaco, get(theme))
    })()

    return () => {
      disposed = true
      editor?.dispose()
      model?.dispose()
    }
  })

  let previousCode = code

  $: if (monaco && editor) {
    applyMonacoTheme(monaco, $theme)
  }

  $: if (model && editor) {
    if (monaco && model.getLanguageId() !== language) {
      monaco.editor.setModelLanguage(model, language)
    }
    editor.updateOptions({
      readOnly: !canRun,
      domReadOnly: !canRun,
      renderLineHighlight: canRun ? 'line' : 'none'
    })
  }

  $: if (model && code !== previousCode) {
    previousCode = code
    model.setValue(code)
    editorValue = code
    clearOutput()
  }

  function clearOutput() {
    stdout = ''
    stderr = ''
    images = []
    hasOutput = false
    status = 'idle'
    statusMessage = canRun
      ? 'Edit the sample if you like, then Run. First run may take 10–30s while Pyodide loads.'
      : ''
  }

  function resetCode() {
    if (!model) return
    model.setValue(code)
    editorValue = code
    clearOutput()
    statusMessage = 'Reset to the original sample.'
  }

  async function runCode() {
    if (!canRun || isBusy) return
    const source = (model?.getValue() ?? editorValue).trim()
    if (!source) {
      status = 'error'
      statusMessage = 'Nothing to run.'
      return
    }

    const generation = ++runGeneration
    status = 'loading-runtime'
    statusMessage = 'Starting Python runtime…'
    stdout = ''
    stderr = ''
    images = []
    hasOutput = false

    const result = await runLessonPython(source, {
      onStatus: (message) => {
        if (generation !== runGeneration) return
        statusMessage = message
        if (message.includes('Pyodide')) status = 'loading-runtime'
        else if (message.includes('Installing')) status = 'loading-packages'
        else status = 'running'
      }
    })

    if (generation !== runGeneration) return

    stdout = result.stdout
    stderr = result.stderr || result.error || ''
    images = result.images
    hasOutput = Boolean(stdout || stderr || images.length)

    if (result.ok) {
      status = 'ready'
      statusMessage = 'Finished. Edit and Run again to iterate.'
    } else {
      status = 'error'
      statusMessage = 'Run failed — see output below.'
    }
  }
</script>

<div class="lesson-code-example">
  <div class="lesson-code-example-header">
    <div>
      <p class="eyebrow">{title}</p>
      <h4>{languageLabel}</h4>
    </div>
    {#if canRun}
      <div class="lesson-code-actions">
        <button class="action-link primary" type="button" disabled={isBusy || !ready} onclick={runCode}>
          {isBusy ? 'Running…' : 'Run'}
        </button>
        <button class="action-link" type="button" disabled={isBusy || !ready} onclick={resetCode}>
          Reset
        </button>
      </div>
    {/if}
  </div>

  {#if canRun && statusMessage}
    <p class="lesson-code-status" class:error={status === 'error'}>{statusMessage}</p>
  {/if}

  <div class:lesson-code-host-ready={ready} class="lesson-code-host" bind:this={host}></div>

  {#if canRun && hasOutput}
    <div class="lesson-code-output" aria-live="polite">
      <p class="eyebrow">Output</p>
      {#if stdout}
        <pre class="lesson-code-stdout">{stdout}</pre>
      {/if}
      {#if stderr}
        <pre class="lesson-code-stderr">{stderr}</pre>
      {/if}
      {#if images.length}
        <div class="lesson-code-figures">
          {#each images as image, index}
            <img src={`data:image/png;base64,${image}`} alt={`Plot ${index + 1}`} />
          {/each}
        </div>
      {/if}
    </div>
  {/if}
</div>

<style>
  .lesson-code-example {
    margin-top: 1rem;
    border-top: 1px solid var(--border);
    padding-top: 1rem;
  }

  .lesson-code-example-header {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
    justify-content: space-between;
    align-items: start;
    margin-bottom: 0.5rem;
  }

  .lesson-code-example-header h4 {
    margin: 0.25rem 0 0;
    font-size: 1rem;
  }

  .lesson-code-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 0.45rem;
  }

  .lesson-code-status {
    margin: 0 0 0.55rem;
    font-size: 0.82rem;
    color: var(--muted, #a1a1aa);
  }

  .lesson-code-status.error {
    color: #fca5a5;
  }

  .lesson-code-host {
    min-height: 12rem;
    overflow: hidden;
    border-radius: 0.375rem;
    border: 1px solid var(--border);
    background: #1e1e2e;
  }

  .lesson-code-host:not(.lesson-code-host-ready) {
    background-image: linear-gradient(180deg, rgba(148, 163, 184, 0.06), rgba(148, 163, 184, 0));
  }

  .lesson-code-output {
    margin-top: 0.75rem;
    padding: 0.75rem 0.85rem;
    border: 1px solid var(--border);
    border-radius: 0.55rem;
    background: color-mix(in srgb, var(--surface, #2b2c40) 88%, #000 12%);
  }

  .lesson-code-stdout,
  .lesson-code-stderr {
    margin: 0.35rem 0 0;
    white-space: pre-wrap;
    word-break: break-word;
    font-family: JetBrains Mono, ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
    font-size: 0.78rem;
    line-height: 1.45;
  }

  .lesson-code-stderr {
    color: #fca5a5;
  }

  .lesson-code-figures {
    display: grid;
    gap: 0.65rem;
    margin-top: 0.65rem;
  }

  .lesson-code-figures img {
    max-width: 100%;
    border-radius: 0.4rem;
    border: 1px solid var(--border);
    background: #fff;
  }
</style>
