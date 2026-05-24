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

  const dispatch = createEventDispatcher()

  /** @type {HTMLDivElement | undefined} */
  let host
  let editor
  let monaco
  let ready = false
  let mutedModelSync = false
  let internalActiveFileId = ''
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

  function emitModelChange() {
    const model = editor?.getModel()
    if (!model) return
    const fileId = [...models.entries()].find(([, candidate]) => candidate === model)?.[0]
    if (!fileId) return

    const nextFiles = normalizedFiles.map((file) => (
      file.id === fileId
        ? { ...file, value: model.getValue() }
        : file
    ))

    if (!files.length) {
      value = model.getValue()
    }

    dispatch('change', {
      fileId,
      value: model.getValue(),
      files: nextFiles
    })
    dispatch('fileschange', {
      activeFileId: fileId,
      files: nextFiles
    })
  }

  function activateFile(fileId) {
    internalActiveFileId = fileId
    dispatch('tabchange', { fileId })
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
        scrollbar: {
          verticalScrollbarSize: 10,
          horizontalScrollbarSize: 10
        },
        suggest: {
          showSnippets: true,
          showWords: true
        },
        quickSuggestions: {
          comments: true,
          other: true,
          strings: true
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
      {#if currentFile && summaryByFile[currentFile.id]}
        <span class="pill">{summaryByFile[currentFile.id]}</span>
      {/if}
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
    <textarea bind:value rows="12"></textarea>
  {/if}

  <div class:editor-hidden={!ready} class="monaco-host" style={`min-height: ${minHeight};`} bind:this={host}></div>
</div>

<style>
  .code-editor-header,
  .code-editor-runtime-row {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
    justify-content: space-between;
    align-items: center;
  }

  .code-editor-tabs {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .code-editor-tab {
    border-radius: 999px;
    border: 1px solid var(--border);
    background: var(--surface);
    color: var(--text);
    min-height: 40px;
    padding: 0.55rem 0.9rem;
  }

  .code-editor-tab.active {
    border-color: var(--border-strong);
    background: rgba(56, 189, 248, 0.12);
  }

  .monaco-host {
    overflow: hidden;
    border-radius: 1rem;
    border: 1px solid var(--border);
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
</style>
