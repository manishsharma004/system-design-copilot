<svelte:options runes={false} />
<script>
  // @ts-nocheck
  import { createEventDispatcher, onMount, tick } from 'svelte'

  import { getMonaco, MONACO_THEME } from '$lib/editor/monaco'

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
  export let snippetActions = []
  export let commandActions = []

  const dispatch = createEventDispatcher()

  /** @type {HTMLDivElement | undefined} */
  let shell
  /** @type {HTMLDivElement | undefined} */
  let host
  let editor
  let monaco
  let ready = false
  let mutedModelSync = false
  let internalActiveFileId = ''
  let wordWrapEnabled = true
  let copyState = ''
  let actionDisposables = []
  let commandPaletteOpen = false
  let commandQuery = ''
  let commandInput
  let editorActive = false
  let hasSaveCommand = false
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
  $: charCount = currentText.length
  $: fileSizeKb = (new TextEncoder().encode(currentText).length / 1024).toFixed(1)
  $: scopedSnippetActions = snippetActions.filter((action) => !action.fileId || normalizedFiles.some((file) => file.id === action.fileId))
  $: showTabbar = normalizedFiles.length > 1
  $: showToolbar = Boolean(currentSummary || scopedSnippetActions.length)
  $: helperVisible = Boolean(currentMarkers.length || currentPreviewItems.length)
  $: saveCommand = commandActions.find((action) => /save/i.test(action.id ?? '') || /save/i.test(action.label ?? '')) ?? null
  $: hasSaveCommand = Boolean(saveCommand)
  let cursorLine = 1
  let cursorColumn = 1
  let minimapEnabled = true
  let fontSize = 13
  $: paletteCommands = [
    {
      id: 'toggle-word-wrap',
      label: wordWrapEnabled ? 'Editor: Disable word wrap' : 'Editor: Enable word wrap',
      run: toggleWordWrap
    },
    {
      id: 'copy-current-file',
      label: 'Editor: Copy current file',
      run: copyCurrentFile
    },
    {
      id: 'go-to-line',
      label: 'Editor: Go to line...',
      run: goToLine
    },
    {
      id: 'toggle-minimap',
      label: minimapEnabled ? 'Editor: Hide minimap' : 'Editor: Show minimap',
      run: toggleMinimap
    },
    {
      id: 'increase-font-size',
      label: 'Editor: Increase font size',
      run: increaseFontSize
    },
    {
      id: 'decrease-font-size',
      label: 'Editor: Decrease font size',
      run: decreaseFontSize
    },
    {
      id: 'format-document',
      label: 'Editor: Format document',
      run: formatDocument
    },
    {
      id: 'find-replace',
      label: 'Editor: Find and replace',
      run: openFindReplace
    },
    ...(saveCommand
      ? [{
          id: 'save-file',
          label: 'Editor: Save current file',
          run: saveCurrentFile
        }]
      : []),
    ...commandActions
  ]
  $: filteredPaletteCommands = paletteCommands.filter((action) => action.label.toLowerCase().includes(commandQuery.trim().toLowerCase()))

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

  async function openCommandPalette() {
    commandPaletteOpen = true
    commandQuery = ''
    await tick()
    commandInput?.focus()
  }

  function closeCommandPalette() {
    commandPaletteOpen = false
    commandQuery = ''
    editor?.focus()
  }

  async function copyCurrentFile() {
    if (!currentText || !navigator?.clipboard) return
    await navigator.clipboard.writeText(currentText)
    copyState = 'Copied'
    setTimeout(() => {
      copyState = ''
    }, 1200)
  }

  async function saveCurrentFile() {
    if (!saveCommand) return
    await runPaletteCommand(saveCommand)
  }

  function goToLine() {
    if (!editor) return
    editor.getAction('editor.action.gotoLine')?.run()
  }

  function toggleMinimap() {
    minimapEnabled = !minimapEnabled
    editor?.updateOptions({ minimap: { enabled: minimapEnabled } })
  }

  function increaseFontSize() {
    fontSize = Math.min(24, fontSize + 1)
    editor?.updateOptions({ fontSize })
  }

  function decreaseFontSize() {
    fontSize = Math.max(10, fontSize - 1)
    editor?.updateOptions({ fontSize })
  }

  function formatDocument() {
    if (!editor) return
    editor.getAction('editor.action.formatDocument')?.run()
  }

  function openFindReplace() {
    if (!editor) return
    editor.getAction('editor.action.startFindReplaceAction')?.run()
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

  async function runPaletteCommand(action) {
    if (!action) return
    await action.run?.({
      activeFileId: resolvedActiveFileId,
      file: currentFile
    })
    closeCommandPalette()
  }

  /** @param {KeyboardEvent} event */
  function handlePaletteKeydown(event) {
    if (event.key === 'Escape') {
      event.preventDefault()
      closeCommandPalette()
      return
    }
    if (event.key === 'Enter') {
      event.preventDefault()
      runPaletteCommand(filteredPaletteCommands[0])
    }
  }

  /** @param {KeyboardEvent} event */
  function handleBackdropKeydown(event) {
    if (event.key === 'Enter' || event.key === ' ' || event.key === 'Escape') {
      event.preventDefault()
      closeCommandPalette()
    }
  }

  /** @param {Event} event */
  function syncEditorActivity(event) {
    editorActive = Boolean(shell?.contains(/** @type {Node | null} */ (event.target)))
  }

  /** @param {KeyboardEvent} event */
  function handleGlobalKeydown(event) {
    const isPaletteShortcut = ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key.toLowerCase() === 'p') || event.key === 'F1'
    if (isPaletteShortcut && editorActive) {
      event.preventDefault()
      openCommandPalette()
      return
    }
    if (event.key === 'Escape' && commandPaletteOpen) {
      event.preventDefault()
      closeCommandPalette()
      return
    }
    if ((event.ctrlKey || event.metaKey) && !event.shiftKey && event.key.toLowerCase() === 's' && editorActive && hasSaveCommand) {
      event.preventDefault()
      saveCurrentFile()
      return
    }
    if ((event.ctrlKey || event.metaKey) && event.altKey && event.key.toLowerCase() === 'z' && editorActive) {
      event.preventDefault()
      toggleWordWrap()
      return
    }
    if ((event.ctrlKey || event.metaKey) && event.key === '=') {
      event.preventDefault()
      increaseFontSize()
      return
    }
    if ((event.ctrlKey || event.metaKey) && event.key === '-') {
      event.preventDefault()
      decreaseFontSize()
    }
  }

  function registerEditorActions() {
    if (!editor || !monaco) return

    for (const disposable of actionDisposables) {
      disposable.dispose()
    }
    actionDisposables = []

    actionDisposables.push(
      editor.addAction({
        id: 'system-design-copilot.open-command-palette',
        label: 'Open command palette',
        keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.KeyP, monaco.KeyCode.F1],
        run: async () => {
          await openCommandPalette()
        }
      })
    )
    actionDisposables.push(
      editor.addAction({
        id: 'system-design-copilot.save-current-file',
        label: 'Save current file',
        keybindings: saveCommand ? [monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS] : [],
        run: async () => {
          await saveCurrentFile()
        }
      })
    )
    actionDisposables.push(
      editor.addAction({
        id: 'system-design-copilot.toggle-word-wrap',
        label: 'Toggle word wrap',
        keybindings: [monaco.KeyMod.Alt | monaco.KeyCode.KeyZ],
        run: async () => {
          toggleWordWrap()
        }
      })
    )
    actionDisposables.push(
      editor.addAction({
        id: 'system-design-copilot.copy-current-file',
        label: 'Copy current file',
        run: async () => {
          await copyCurrentFile()
        }
      })
    )
    actionDisposables.push(
      editor.addAction({
        id: 'system-design-copilot.go-to-line',
        label: 'Go to line',
        keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyG],
        run: async () => {
          goToLine()
        }
      })
    )

    for (const action of commandActions) {
      actionDisposables.push(
        editor.addAction({
          id: `system-design-copilot.${action.id}`,
          label: action.label,
          run: async () => {
            await runPaletteCommand(action)
          }
        })
      )
    }
  }

  onMount(() => {
    let disposed = false
    document.addEventListener('pointerdown', syncEditorActivity, true)
    document.addEventListener('focusin', syncEditorActivity, true)
    document.addEventListener('keydown', handleGlobalKeydown, true)

    ;(async () => {
      monaco = await getMonaco()
      if (!host || disposed) return

      editor = monaco.editor.create(host, {
        value,
        language,
        readOnly,
        theme: MONACO_THEME,
        automaticLayout: true,
        minimap: { enabled: true, maxColumn: 120, renderCharacters: false, showSlider: 'mouseover', size: 'proportional' },
        scrollBeyondLastLine: false,
        lineNumbers: 'on',
        lineNumbersMinChars: 4,
        glyphMargin: true,
        folding: true,
        contextmenu: true,
        fontSize: 13,
        lineHeight: 20,
        fontFamily: "'JetBrains Mono', 'Fira Code', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
        fontLigatures: true,
        tabSize: 2,
        detectIndentation: false,
        insertSpaces: true,
        cursorBlinking: 'blink',
        cursorSmoothCaretAnimation: 'explicit',
        cursorSurroundingLines: 3,
        cursorSurroundingLinesStyle: 'all',
        multiCursorModifier: 'ctrlCmd',
        roundedSelection: true,
        renderLineHighlight: 'line',
        renderWhitespace: 'selection',
        matchBrackets: 'always',
        selectionHighlight: true,
        occurrencesHighlight: 'singleFile',
        wordWrap: 'on',
        smoothScrolling: true,
        mouseWheelZoom: true,
        formatOnPaste: true,
        formatOnType: true,
        dragAndDrop: true,
        links: true,
        tabCompletion: 'on',
        acceptSuggestionOnEnter: 'on',
        suggestSelection: 'recentlyUsedByPrefix',
        snippetSuggestions: 'inline',
        guides: {
          highlightActiveIndentation: true,
          bracketPairs: true,
          bracketPairsHorizontal: 'active',
          indentation: true
        },
        bracketPairColorization: {
          enabled: true
        },
        stickyScroll: {
          enabled: true
        },
        scrollbar: {
          useShadows: false,
          verticalScrollbarSize: 10,
          horizontalScrollbarSize: 10,
          verticalSliderSize: 10,
          horizontalSliderSize: 10,
          alwaysConsumeMouseWheel: false
        },
        suggest: {
          showSnippets: true,
          showWords: true,
          preview: true,
          snippetsPreventQuickSuggestions: false,
          selectionMode: 'whenQuickSuggestion'
        },
        quickSuggestions: {
          comments: true,
          other: true,
          strings: true
        },
        quickSuggestionsDelay: 60,
        parameterHints: {
          enabled: true
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

      editor.onDidChangeCursorPosition((event) => {
        cursorLine = event.position.lineNumber
        cursorColumn = event.position.column
      })

      ready = true
      registerEditorActions()
      syncModelsFromProps()
    })()

    return () => {
      disposed = true
      document.removeEventListener('pointerdown', syncEditorActivity, true)
      document.removeEventListener('focusin', syncEditorActivity, true)
      document.removeEventListener('keydown', handleGlobalKeydown, true)
      for (const disposable of actionDisposables) {
        disposable.dispose()
      }
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

  $: if (ready) {
    registerEditorActions()
  }
</script>

<div class="code-editor-shell" bind:this={shell}>
  {#if showTabbar}
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
        {#if hasSaveCommand}
          <button class="code-editor-control" type="button" onclick={saveCurrentFile} title="Save file (Ctrl+S)">
            Save
          </button>
        {/if}
        <button class="code-editor-control" type="button" onclick={toggleWordWrap} title={wordWrapEnabled ? 'Word wrap on' : 'Word wrap off'}>
          {wordWrapEnabled ? 'Wrap' : 'No wrap'}
        </button>
        <button class="code-editor-control" type="button" onclick={copyCurrentFile} disabled={!currentText.trim()} title="Copy file">
          {copyState || 'Copy'}
        </button>
        <button class="code-editor-control" type="button" onclick={openCommandPalette} title="Command palette (Ctrl+Shift+P)">
          Cmd
        </button>
      </div>
    </div>
  {/if}

  {#if showToolbar}
    <div class="code-editor-toolbar">
      {#if currentSummary}
        <p class="code-editor-summary">{currentSummary}</p>
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

  <div class="code-editor-status-bar">
    <div class="code-editor-status-left">
      {#each currentMarkers.slice(0, 3) as marker}
        <span class="code-editor-status-item warning">⚠ Line {marker.line}: {marker.message}</span>
      {/each}
      {#each currentPreviewItems.slice(0, 3) as item}
        <span class="code-editor-status-item info">● Line {item.line}: {item.text}</span>
      {/each}
    </div>
    <div class="code-editor-status-right">
      <span class="code-editor-status-item">Ln {cursorLine}, Col {cursorColumn}</span>
      <span class="code-editor-status-item">{lineCount} lines</span>
      <span class="code-editor-status-item">{wordCount} words</span>
      <span class="code-editor-status-item">{fileSizeKb} KB</span>
      {#if currentFile?.language}
        <span class="code-editor-status-item">{currentFile.language}</span>
      {/if}
    </div>
  </div>

  {#if commandPaletteOpen}
    <div
      class="code-editor-palette-backdrop"
      role="button"
      tabindex="0"
      aria-label="Close command palette"
      onclick={closeCommandPalette}
      onkeydown={handleBackdropKeydown}
    >
      <div
        class="code-editor-palette"
        role="dialog"
        aria-modal="true"
        aria-label="Command palette"
        tabindex="-1"
        onclick={(event) => event.stopPropagation()}
        onkeydown={(event) => event.stopPropagation()}
      >
        <input
          bind:this={commandInput}
          bind:value={commandQuery}
          class="code-editor-palette-input"
          type="text"
          placeholder="Type a command"
          onkeydown={handlePaletteKeydown}
        />
        <div class="code-editor-palette-list">
          {#if filteredPaletteCommands.length}
            {#each filteredPaletteCommands as action}
              <button class="code-editor-palette-item" type="button" onclick={() => runPaletteCommand(action)}>
                {action.label}
              </button>
            {/each}
          {:else}
            <p class="code-editor-palette-empty">No commands match.</p>
          {/if}
        </div>
      </div>
    </div>
  {/if}
</div>

<style>
  .code-editor-shell {
    display: flex;
    flex-direction: column;
    overflow: hidden;
    position: relative;
    border-radius: 0.35rem;
    border: 1px solid #2f3340;
    background: #11131a;
    height: 100%;
  }

  .code-editor-tabbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: #171922;
    min-height: 2.25rem;
    border-bottom: 1px solid #252a35;
  }

  .code-editor-tabs {
    display: flex;
    overflow-x: auto;
    gap: 0;
  }

  .code-editor-actions {
    display: flex;
    gap: 0.25rem;
    padding: 0 0.45rem;
    align-items: center;
  }

  .code-editor-tab {
    display: flex;
    align-items: center;
    gap: 0.3rem;
    border: none;
    border-right: 1px solid #20242f;
    background: #1c1f29;
    color: #8f96ab;
    min-height: 2.25rem;
    padding: 0 0.75rem;
    font-size: 0.76rem;
    font-weight: 400;
    cursor: pointer;
    border-radius: 0;
    white-space: nowrap;
    transition: background 0.1s, color 0.1s;
  }

  .code-editor-tab.active {
    background: #11131a;
    color: #eef2ff;
    border-bottom: 1px solid #11131a;
    margin-bottom: -1px;
  }

  .code-editor-tab:hover:not(.active) {
    background: #202531;
    color: #cdd5ea;
  }

  .tab-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 0.85rem;
    font-size: 0.65rem;
    opacity: 0.8;
  }

  .tab-label {
    font-size: 0.76rem;
  }

  .tab-modified {
    color: #e8e8e8;
    font-size: 0.65rem;
    margin-left: 0.25rem;
  }

  .code-editor-toolbar {
    display: flex;
    flex-wrap: wrap;
    gap: 0.4rem 0.65rem;
    align-items: center;
    padding: 0.42rem 0.65rem;
    background: #151821;
    border-bottom: 1px solid #252a35;
  }

  .code-editor-summary {
    margin: 0;
    color: #9aa3bc;
    font-size: 0.72rem;
    line-height: 1.4;
  }

  .code-editor-control {
    border-radius: 3px;
    border: none;
    background: transparent;
    color: #7f879e;
    min-width: 2rem;
    height: 1.85rem;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.72rem;
    font-weight: 600;
    padding: 0 0.45rem;
    min-height: 0;
    cursor: pointer;
    transition: color 0.1s, background 0.1s;
  }

  .code-editor-control:hover {
    color: #eef2ff;
    background: #2a3040;
  }

  .code-editor-snippets {
    display: flex;
    flex-wrap: wrap;
    gap: 0.25rem;
  }

  .code-editor-snippet {
    border-radius: 2px;
    border: 1px solid #303647;
    background: rgba(105, 108, 255, 0.08);
    color: #b8c0da;
    min-height: 22px;
    padding: 0.15rem 0.45rem;
    font-size: 0.68rem;
    cursor: pointer;
  }

  .code-editor-snippet:hover {
    border-color: #696cff;
    background: rgba(105, 108, 255, 0.16);
    color: #e0e7ff;
  }

  .code-editor-palette-backdrop {
    position: absolute;
    inset: 0;
    z-index: 30;
    display: grid;
    place-items: start center;
    padding: 0.85rem;
    background: rgba(8, 11, 17, 0.58);
    backdrop-filter: blur(6px);
  }

  .code-editor-palette {
    width: min(32rem, 100%);
    display: grid;
    gap: 0.5rem;
    border-radius: 0.45rem;
    border: 1px solid #31384a;
    background: #161922;
    box-shadow: 0 18px 50px rgba(0, 0, 0, 0.45);
    overflow: hidden;
  }

  .code-editor-palette-input {
    border: none;
    border-bottom: 1px solid #252d3c;
    background: transparent;
    color: #eef2ff;
    padding: 0.85rem 1rem;
    font-size: 0.88rem;
    outline: none;
  }

  .code-editor-palette-list {
    display: grid;
    gap: 0.2rem;
    padding: 0.35rem;
    max-height: 16rem;
    overflow: auto;
  }

  .code-editor-palette-item {
    border: none;
    border-radius: 0.35rem;
    background: transparent;
    color: #d7def1;
    text-align: left;
    padding: 0.6rem 0.75rem;
    min-height: 0;
  }

  .code-editor-palette-item:hover {
    background: #252d3c;
  }

  .code-editor-palette-empty {
    margin: 0;
    padding: 0.6rem 0.75rem;
    color: #8f96ab;
    font-size: 0.8rem;
  }

  .monaco-host {
    flex: 1;
    overflow: hidden;
    border-radius: 0;
    border: none;
    min-height: 16rem;
  }

  .code-editor-status-bar {
    display: flex;
    flex-wrap: wrap;
    gap: 0.35rem 0.75rem;
    padding: 0.22rem 0.65rem;
    background: #007acc;
    border-top: 1px solid #252a35;
    min-height: 1.4rem;
    align-items: center;
    justify-content: space-between;
  }

  .code-editor-status-left {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem 1rem;
    align-items: center;
  }

  .code-editor-status-right {
    display: flex;
    gap: 0.75rem;
    align-items: center;
  }

  .code-editor-status-item {
    font-size: 0.68rem;
    color: rgba(255, 255, 255, 0.92);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 30rem;
  }

  .code-editor-status-item.warning {
    color: #ffefb8;
  }

  .code-editor-status-item.info {
    color: #d8f0ff;
  }

  :global(.monaco-editor),
  :global(.monaco-editor .margin),
  :global(.monaco-editor .monaco-editor-background) {
    background: #11131a !important;
  }

  :global(.monaco-editor .suggest-widget),
  :global(.monaco-editor .monaco-hover) {
    border-radius: 4px !important;
    border: 1px solid #454545 !important;
  }

  :global(.monaco-editor .scrollbar .slider) {
    border-radius: 999px !important;
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
