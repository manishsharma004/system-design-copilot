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
        minimap: { enabled: true, maxColumn: 80, renderCharacters: false },
        scrollBeyondLastLine: false,
        fontSize: 13,
        lineHeight: 20,
        fontFamily: "'JetBrains Mono', 'Fira Code', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
        fontLigatures: true,
        roundedSelection: true,
        renderLineHighlight: 'line',
        wordWrap: 'on',
        cursorBlinking: 'smooth',
        cursorSmoothCaretAnimation: 'on',
        smoothScrolling: true,
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
          verticalScrollbarSize: 8,
          horizontalScrollbarSize: 8,
          verticalSliderSize: 8
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
          top: 8,
          bottom: 8
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
  <!-- VS Code style tabs -->
  <div class="code-editor-tabbar">
    <div class="code-editor-tabs" role="tablist" aria-label="Open files">
      {#each normalizedFiles as file}
        <button
          class:active={file.id === resolvedActiveFileId}
          class="code-editor-tab"
          type="button"
          onclick={() => activateFile(file.id)}
        >
          <span class="tab-icon">{file.language === 'typescript' ? '📘' : file.language === 'javascript' ? '📒' : file.language === 'markdown' ? '📝' : '🔷'}</span>
          <span class="tab-label">{file.label ?? file.filename ?? file.id}</span>
          {#if file.id === resolvedActiveFileId && currentText !== (file.value ?? '')}
            <span class="tab-modified">●</span>
          {/if}
        </button>
      {/each}
    </div>
    <div class="code-editor-actions">
      <button class="code-editor-control" type="button" onclick={toggleWordWrap} title={wordWrapEnabled ? 'Word wrap on' : 'Word wrap off'}>
        {wordWrapEnabled ? '↩' : '→'}
      </button>
      <button class="code-editor-control" type="button" onclick={copyCurrentFile} disabled={!currentText.trim()} title="Copy file">
        {copyState || '📋'}
      </button>
    </div>
  </div>

  <!-- Breadcrumb bar -->
  <div class="code-editor-breadcrumb">
    <span class="breadcrumb-item">{currentFile?.filename ?? filename}</span>
    {#if currentSummary}
      <span class="breadcrumb-sep">·</span>
      <span class="breadcrumb-item muted">{currentSummary}</span>
    {/if}
  </div>

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
    display: flex;
    flex-direction: column;
    overflow: hidden;
    border-radius: 0.5rem;
    border: 1px solid #333;
    background: #1e1e1e;
    height: 100%;
  }

  .code-editor-tabbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: #252526;
    min-height: 35px;
    border-bottom: 1px solid #333;
  }

  .code-editor-tabs {
    display: flex;
    overflow-x: auto;
    gap: 0;
  }

  .code-editor-actions {
    display: flex;
    gap: 0.25rem;
    padding: 0 0.5rem;
    align-items: center;
  }

  .code-editor-tab {
    display: flex;
    align-items: center;
    gap: 0.35rem;
    border: none;
    border-right: 1px solid #252526;
    background: #2d2d2d;
    color: #969696;
    min-height: 35px;
    padding: 0 0.85rem;
    font-size: 0.8rem;
    font-weight: 400;
    cursor: pointer;
    border-radius: 0;
    white-space: nowrap;
    transition: background 0.1s, color 0.1s;
  }

  .code-editor-tab.active {
    background: #1e1e1e;
    color: #fff;
    border-bottom: 1px solid #1e1e1e;
    margin-bottom: -1px;
  }

  .code-editor-tab:hover:not(.active) {
    background: #2a2d2e;
    color: #ccc;
  }

  .tab-icon {
    font-size: 0.75rem;
  }

  .tab-label {
    font-size: 0.8rem;
  }

  .tab-modified {
    color: #e8e8e8;
    font-size: 0.65rem;
    margin-left: 0.25rem;
  }

  .code-editor-breadcrumb {
    display: flex;
    align-items: center;
    gap: 0.35rem;
    padding: 0.2rem 0.75rem;
    background: #1e1e1e;
    border-bottom: 1px solid #2d2d2d;
    font-size: 0.75rem;
    color: #a9a9a9;
    min-height: 22px;
  }

  .breadcrumb-item {
    color: #ccc;
  }

  .breadcrumb-item.muted {
    color: #666;
    font-style: italic;
  }

  .breadcrumb-sep {
    color: #555;
  }

  .code-editor-control {
    border-radius: 3px;
    border: none;
    background: transparent;
    color: #858585;
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.85rem;
    padding: 0;
    min-height: 0;
    cursor: pointer;
    transition: color 0.1s, background 0.1s;
  }

  .code-editor-control:hover {
    color: #fff;
    background: #37373d;
  }

  .code-editor-snippets {
    display: flex;
    flex-wrap: wrap;
    gap: 0.3rem;
    padding: 0.35rem 0.75rem;
    background: #252526;
    border-bottom: 1px solid #333;
  }

  .code-editor-runtime-row {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    justify-content: flex-start;
    align-items: center;
    padding: 0.3rem 0.75rem;
    background: #252526;
    border-bottom: 1px solid #333;
  }

  .code-editor-snippet {
    border-radius: 3px;
    border: 1px solid #444;
    background: rgba(105, 108, 255, 0.06);
    color: #a6adc8;
    min-height: 24px;
    padding: 0.2rem 0.5rem;
    font-size: 0.72rem;
    cursor: pointer;
  }

  .code-editor-snippet:hover {
    border-color: #696cff;
    background: rgba(105, 108, 255, 0.12);
    color: #cdd6f4;
  }

  .monaco-host {
    flex: 1;
    overflow: hidden;
    border-radius: 0;
    border: none;
    min-height: 18rem;
  }

  .code-editor-helper-grid {
    display: grid;
    gap: 0.5rem;
    grid-template-columns: repeat(auto-fit, minmax(14rem, 1fr));
    padding: 0.5rem 0.75rem;
    background: #252526;
    border-top: 1px solid #333;
  }

  .code-editor-helper-card {
    display: grid;
    gap: 0.4rem;
    border-radius: 4px;
    border: 1px solid #333;
    background: #1e1e1e;
    padding: 0.6rem 0.75rem;
  }

  .code-editor-helper-card h4 {
    margin: 0;
    font-size: 0.8rem;
    color: #cdd6f4;
  }

  .code-editor-helper-card p,
  .code-editor-helper-card li {
    color: #858585;
    line-height: 1.5;
    font-size: 0.8rem;
  }

  .code-editor-helper-card ul {
    margin: 0;
    padding-left: 1rem;
    display: grid;
    gap: 0.3rem;
  }

  :global(.monaco-editor),
  :global(.monaco-editor .margin),
  :global(.monaco-editor .monaco-editor-background) {
    background: #1e1e1e !important;
  }

  :global(.monaco-editor .suggest-widget),
  :global(.monaco-editor .monaco-hover) {
    border-radius: 4px !important;
    border: 1px solid #454545 !important;
  }

  :global(.monaco-inline-preview) {
    color: #89b4fa;
    opacity: 0.7;
    font-style: italic;
  }

  .editor-hidden {
    display: none;
  }
</style>
