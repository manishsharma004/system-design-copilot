<svelte:options runes={false} />
<script>
  // @ts-nocheck
  import { createEventDispatcher, onMount } from 'svelte'

  import { getMonaco } from '$lib/editor/monaco'

  export let value = ''
  export let readOnly = false
  export let minHeight = '18rem'
  export let language = 'markdown'
  export let filename = 'notes.md'
  export let title = 'Editor'
  export let files = []
  export let activeFileId = ''
  export let previewItemsByFile = {}
  export let markersByFile = {}
  export let summaryByFile = {}
  export let runtimeHints = []
  export let snippetActions = []
  export let helperDescription = ''

  const dispatch = createEventDispatcher()

  /** @type {HTMLDivElement | undefined} */
  let host
  let editor
  let monaco
  let ready = false
  let mutedModelSync = false
  let internalActiveFileId = ''
  let wordWrapEnabled = true
  let copyState = ''
  /** @type {Map<string, import('monaco-editor').editor.ITextModel>} */
  let models = new Map()
  /** @type {Map<string, string[]>} */
  let decorations = new Map()
  /** @type {Map<string, string>} */
  let fileNames = new Map()

  $: normalizedFiles = files.length
    ? files
    : [{ id: '__single__', label: title, filename, language, value }]

  $: resolvedActiveFileId = normalizedFiles.some((file) => file.id === activeFileId)
    ? activeFileId
    : normalizedFiles.some((file) => file.id === internalActiveFileId)
      ? internalActiveFileId
      : normalizedFiles[0]?.id ?? ''

  $: currentFile = normalizedFiles.find((file) => file.id === resolvedActiveFileId) ?? normalizedFiles[0] ?? null
  $: currentSummary = currentFile ? summaryByFile[currentFile.id] ?? '' : ''
  $: currentMarkers = currentFile ? markersByFile[currentFile.id] ?? [] : []
  $: currentPreviewItems = currentFile ? previewItemsByFile[currentFile.id] ?? [] : []
  $: currentText = currentFile?.value ?? value ?? ''
  $: lineCount = currentText ? currentText.split('\n').length : 1
  $: wordCount = currentText.trim() ? currentText.trim().split(/\s+/).filter(Boolean).length : 0
  $: scopedSnippetActions = snippetActions.filter((action) => !action.fileId || normalizedFiles.some((file) => file.id === action.fileId))
  $: helperVisible = Boolean(currentSummary || currentMarkers.length || currentPreviewItems.length || scopedSnippetActions.length)

  /**
   * @param {string} name
   */
  function inferLanguage(name) {
    if (name.endsWith('.ts')) return 'typescript'
    if (name.endsWith('.js')) return 'javascript'
    if (name.endsWith('.json')) return 'json'
    if (name.endsWith('.md')) return 'markdown'
    return language
  }

  /**
   * @param {{ id: string, filename?: string, language?: string }} file
   */
  function getLanguageId(file) {
    return file.language || inferLanguage(file.filename ?? '')
  }

  /**
   * @param {{ id: string, filename?: string }} file
   */
  function getModelUri(file) {
    return monaco.Uri.parse(`inmemory://editor/${encodeURIComponent(file.id)}/${encodeURIComponent(file.filename ?? file.id)}`)
  }

  /**
   * @param {string} fileId
   */
  function applyMetadata(fileId) {
    if (!monaco) return
    const model = models.get(fileId)
    if (!model) return

    const markers = (markersByFile[fileId] ?? []).map((marker) => ({
      startLineNumber: marker.line,
      startColumn: 1,
      endLineNumber: marker.line,
      endColumn: Math.max(model.getLineLength(marker.line), 1),
      message: marker.message,
      severity: marker.severity === 'error'
        ? monaco.MarkerSeverity.Error
        : marker.severity === 'warning'
          ? monaco.MarkerSeverity.Warning
          : monaco.MarkerSeverity.Hint
    }))
    monaco.editor.setModelMarkers(model, 'system-design-copilot', markers)

    const nextDecorations = (previewItemsByFile[fileId] ?? []).map((item) => ({
      range: new monaco.Range(item.line, 1, item.line, 1),
      options: {
        isWholeLine: false,
        after: {
          content: `  ${item.text}`,
          inlineClassName: 'monaco-inline-preview'
        },
        hoverMessage: item.hover
          ? {
              value: item.hover
            }
          : undefined
      }
    }))

    const previous = decorations.get(fileId) ?? []
    decorations.set(fileId, model.deltaDecorations(previous, nextDecorations))
  }

  function syncModelsFromProps() {
    if (!monaco || !editor) return

    const activeIds = new Set(normalizedFiles.map((file) => file.id))
    for (const [fileId, model] of models.entries()) {
      if (!activeIds.has(fileId)) {
        monaco.editor.setModelMarkers(model, 'system-design-copilot', [])
        model.dispose()
        models.delete(fileId)
        decorations.delete(fileId)
        fileNames.delete(fileId)
      }
    }

    for (const file of normalizedFiles) {
      const nextValue = file.value ?? ''
      const currentModel = models.get(file.id)
      if (!currentModel) {
        const model = monaco.editor.createModel(nextValue, getLanguageId(file), getModelUri(file))
        models.set(file.id, model)
        fileNames.set(file.id, file.filename ?? file.id)
      } else {
        const currentValue = currentModel.getValue()
        if (currentValue !== nextValue) {
          mutedModelSync = true
          currentModel.setValue(nextValue)
          mutedModelSync = false
        }
      }
      applyMetadata(file.id)
    }

    const activeModel = currentFile ? models.get(currentFile.id) : null
    if (activeModel && editor.getModel() !== activeModel) {
      editor.setModel(activeModel)
    }
    if (currentFile) {
      applyMetadata(currentFile.id)
    }
  }

  /**
   * @param {string} fileId
   * @param {string} nextValue
   */
  function buildNextFiles(fileId, nextValue) {
    return normalizedFiles.map((file) => (
      file.id === fileId
        ? { ...file, value: nextValue }
        : file
    ))
  }

  /**
   * @param {string} fileId
   * @param {string} nextValue
   */
  function dispatchFileState(fileId, nextValue) {
    const nextFiles = buildNextFiles(fileId, nextValue)
    if (!files.length) {
      value = nextValue
    }

    dispatch('change', {
      fileId,
      value: nextValue,
      files: nextFiles
    })
    dispatch('fileschange', {
      activeFileId: fileId,
      files: nextFiles
    })
  }

  function emitModelChange() {
    const model = editor?.getModel()
    if (!model) return
    const fileId = [...models.entries()].find(([, candidate]) => candidate === model)?.[0]
    if (!fileId) return
    dispatchFileState(fileId, model.getValue())
  }

  /**
   * @param {string} fileId
   * @param {string} nextValue
   */
  function updateFileValue(fileId, nextValue) {
    internalActiveFileId = fileId
    const model = models.get(fileId)
    if (model && model.getValue() !== nextValue) {
      mutedModelSync = true
      model.setValue(nextValue)
      mutedModelSync = false
    }
    if (editor && model && editor.getModel() !== model) {
      editor.setModel(model)
    }
    dispatchFileState(fileId, nextValue)
  }

  function activateFile(fileId) {
    internalActiveFileId = fileId
    copyState = ''
    dispatch('tabchange', { fileId })
  }

  function toggleWordWrap() {
    wordWrapEnabled = !wordWrapEnabled
    editor?.updateOptions({ wordWrap: wordWrapEnabled ? 'on' : 'off' })
  }

  async function copyCurrentFile() {
    if (!currentText || !navigator?.clipboard) return
    await navigator.clipboard.writeText(currentText)
    copyState = 'Copied'
    setTimeout(() => {
      copyState = ''
    }, 1200)
  }

  /** @param {{ insertText: string, fileId?: string }} action */
  function insertSnippet(action) {
    const targetFileId = action.fileId ?? currentFile?.id
    if (!targetFileId) return
    const targetModel = models.get(targetFileId)
    const existing = targetModel?.getValue() ?? normalizedFiles.find((file) => file.id === targetFileId)?.value ?? ''
    const needsSpacer = existing.trim().length > 0 && !existing.endsWith('\n')
    const nextValue = `${existing}${needsSpacer ? '\n\n' : existing.trim().length ? '\n' : ''}${action.insertText}`
    updateFileValue(targetFileId, nextValue)
  }

  onMount(() => {
    let disposed = false

    ;(async () => {
      monaco = await getMonaco()
      if (!host || disposed) return

      editor = monaco.editor.create(host, {
        value,
        language,
        readOnly,
        automaticLayout: true,
        minimap: { enabled: false },
        scrollBeyondLastLine: false,
        fontSize: 14,
        lineHeight: 22,
        fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
        roundedSelection: true,
        renderLineHighlight: 'gutter',
        wordWrap: 'on',
        guides: {
          bracketPairs: true,
          indentation: true
        },
        bracketPairColorization: {
          enabled: true
        },
        stickyScroll: {
          enabled: true
        },
        scrollbar: {
          verticalScrollbarSize: 10,
          horizontalScrollbarSize: 10
        },
        suggest: {
          showSnippets: true,
          showWords: true,
          preview: true
        },
        quickSuggestions: {
          comments: true,
          other: true,
          strings: true
        },
        inlineSuggest: {
          enabled: true
        },
        padding: {
          top: 12,
          bottom: 12
        }
      })

      editor.onDidChangeModelContent(() => {
        if (mutedModelSync) return
        emitModelChange()
      })

      ready = true
      syncModelsFromProps()
    })()

    return () => {
      disposed = true
      for (const model of models.values()) {
        model.dispose()
      }
      editor?.dispose()
    }
  })

  $: if (ready) {
    syncModelsFromProps()
  }

  $: if (ready && currentFile) {
    applyMetadata(currentFile.id)
  }
</script>

<div class="code-editor-shell">
  <div class="code-editor-toolbar">
    <div class="code-editor-overview">
      <strong>{currentFile?.label ?? title}</strong>
      <span>{helperDescription || `Edit ${currentFile?.filename ?? filename} with completion, diagnostics, and inline cues.`}</span>
    </div>
    <div class="code-editor-actions">
      <span class="pill">{lineCount} lines · {wordCount} words</span>
      <button class="code-editor-control" type="button" onclick={toggleWordWrap}>
        {wordWrapEnabled ? 'Wrap on' : 'Wrap off'}
      </button>
      <button class="code-editor-control" type="button" onclick={copyCurrentFile} disabled={!currentText.trim()}>
        {copyState || 'Copy'}
      </button>
    </div>
  </div>

  {#if normalizedFiles.length > 1}
    <div class="code-editor-header">
      <div class="code-editor-tabs" role="tablist" aria-label="Open exercise files">
        {#each normalizedFiles as file}
          <button
            class:active={file.id === resolvedActiveFileId}
            class="code-editor-tab"
            type="button"
            onclick={() => activateFile(file.id)}
          >
            {file.label ?? file.filename ?? file.id}
          </button>
        {/each}
      </div>
      {#if currentSummary}
        <span class="pill">{currentSummary}</span>
      {/if}
    </div>
  {/if}

  {#if scopedSnippetActions.length}
    <div class="code-editor-snippets">
      {#each scopedSnippetActions as action}
        <button class="code-editor-snippet" type="button" onclick={() => insertSnippet(action)}>
          {action.label}
        </button>
      {/each}
    </div>
  {/if}

  {#if runtimeHints?.length}
    <div class="code-editor-runtime-row">
      {#each runtimeHints as runtime}
        <span class:muted={!runtime.available} class="pill">
          {runtime.kind === 'wasm' ? 'WASM' : 'Browser'} · {runtime.label}
        </span>
      {/each}
    </div>
  {/if}

  {#if !ready}
    <textarea
      rows="12"
      value={currentText}
      oninput={(event) => updateFileValue(currentFile?.id ?? '__single__', event.currentTarget.value)}
    ></textarea>
  {/if}

  <div class:editor-hidden={!ready} class="monaco-host" style={`min-height: ${minHeight};`} bind:this={host}></div>

  {#if helperVisible}
    <div class="code-editor-helper-grid">
      {#if currentSummary}
        <article class="code-editor-helper-card">
          <p class="eyebrow">Snapshot</p>
          <h4>Current file summary</h4>
          <p>{currentSummary}</p>
        </article>
      {/if}

      {#if currentPreviewItems.length}
        <article class="code-editor-helper-card">
          <p class="eyebrow">Signals</p>
          <h4>What the editor found</h4>
          <ul>
            {#each currentPreviewItems.slice(0, 6) as item}
              <li>
                <strong>Line {item.line}:</strong> {item.text}
              </li>
            {/each}
          </ul>
        </article>
      {/if}

      {#if currentMarkers.length}
        <article class="code-editor-helper-card">
          <p class="eyebrow">Diagnostics</p>
          <h4>Things to fix or tighten</h4>
          <ul>
            {#each currentMarkers.slice(0, 6) as marker}
              <li>
                <strong>Line {marker.line}:</strong> {marker.message}
              </li>
            {/each}
          </ul>
        </article>
      {/if}
    </div>
  {/if}
</div>

<style>
  .code-editor-shell {
    display: grid;
    gap: 0.75rem;
  }

  .code-editor-toolbar,
  .code-editor-header,
  .code-editor-runtime-row,
  .code-editor-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
    justify-content: space-between;
    align-items: center;
  }

  .code-editor-overview {
    display: grid;
    gap: 0.2rem;
  }

  .code-editor-overview strong,
  .code-editor-helper-card h4 {
    margin: 0;
  }

  .code-editor-overview span,
  .code-editor-helper-card p,
  .code-editor-helper-card li {
    color: var(--muted);
    line-height: 1.6;
  }

  .code-editor-tabs,
  .code-editor-snippets {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .code-editor-tab,
  .code-editor-control,
  .code-editor-snippet {
    border-radius: 999px;
    border: 1px solid var(--border);
    background: var(--surface);
    color: var(--text);
    min-height: 40px;
    padding: 0.55rem 0.9rem;
  }

  .code-editor-tab.active,
  .code-editor-snippet:hover,
  .code-editor-control:hover {
    border-color: var(--border-strong);
    background: rgba(56, 189, 248, 0.12);
  }

  .monaco-host {
    overflow: hidden;
    border-radius: 1rem;
    border: 1px solid var(--border);
  }

  .code-editor-helper-grid {
    display: grid;
    gap: 0.75rem;
    grid-template-columns: repeat(auto-fit, minmax(14rem, 1fr));
  }

  .code-editor-helper-card {
    display: grid;
    gap: 0.6rem;
    border-radius: 1rem;
    border: 1px solid var(--border);
    background: var(--surface);
    padding: 0.9rem 1rem;
  }

  .code-editor-helper-card ul {
    margin: 0;
    padding-left: 1.1rem;
    display: grid;
    gap: 0.45rem;
  }

  :global(.monaco-editor),
  :global(.monaco-editor .margin),
  :global(.monaco-editor .monaco-editor-background) {
    background: rgba(8, 17, 31, 0.96) !important;
  }

  :global(.monaco-editor .suggest-widget),
  :global(.monaco-editor .monaco-hover) {
    border-radius: 0.85rem !important;
    border: 1px solid var(--border) !important;
  }

  :global(.monaco-inline-preview) {
    color: #7dd3fc;
    opacity: 0.75;
    font-style: italic;
  }

  .editor-hidden {
    display: none;
  }
</style>
