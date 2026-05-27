<svelte:options runes={false} />
<script>
  import { createEventDispatcher, onDestroy } from 'svelte'
  import CodeEditor from '$lib/components/CodeEditor.svelte'
  import { loadWorkspaceSnapshot, saveWorkspaceSnapshot } from '$lib/editor/indexedDbWorkspace'

  /** @type {any[]} */
  export let files = []
  export let activeFileId = ''
  export let explorerTitle = 'EXPLORER'
  export let projectName = 'WORKSPACE'
  export let previewItemsByFile = {}
  export let markersByFile = {}
  export let summaryByFile = {}
  /** @type {any[]} */
  export let snippetActions = []
  /** @type {any[]} */
  export let commandActions = []
  export let readOnly = false
  export let minHeight = '100%'
  /** @type {'preview' | 'results' | 'terminal' | null} */
  export let activePanel = null
  /** @type {any[]} */
  export let explorerNodes = []
  export let workspaceId = ''
  export let sidebarHelpersTitle = 'NODE HELPERS'
  export let sidePanelEyebrow = 'PREVIEW'
  export let sidePanelTitle = 'Preview'
  export let sidePanelDescription = ''
  /** @type {any} */
  export let previewContent = null
  /** @type {any} */
  export let resultsContent = null
  /** @type {any} */
  export let terminalContent = null

  const dispatch = createEventDispatcher()

  let codeEditor
  let explorerCollapsed = false
  let activeSidebarView = 'explorer'
  let bottomPanelCollapsed = false
  let explorerWidth = 272
  let sidePanelWidth = 360
  let bottomPanelHeight = 220
  let workspaceEl
  let mainEl
  let editorAreaEl
  let activeResizeCleanup = null
  let persistTimer = null
  let hydratedWorkspaceId = ''
  let hydratingWorkspace = false
  /** @type {Set<string>} */
  let expandedFolders = new Set(['root', 'src', 'config'])
  /** @type {any[]} */
  let workspaceFiles = []
  /** @type {string[]} */
  let workspaceFolders = []
  let previousResultsContent = resultsContent

  $: usesPersistentWorkspace = Boolean(workspaceId)
  $: seededFiles = files.map((file, index) => normalizeIncomingFile(file, index))
  $: currentFiles = usesPersistentWorkspace && hydratedWorkspaceId === workspaceId ? workspaceFiles : seededFiles
  $: internalActiveFileId = resolveActiveFileId(activeFileId || internalActiveFileId, currentFiles)
  $: currentFile = currentFiles.find((file) => file.id === internalActiveFileId) ?? currentFiles[0] ?? null
  $: currentSummary = currentFile ? summaryByFile[currentFile.id] ?? '' : ''
  $: currentMarkers = currentFile ? markersByFile[currentFile.id] ?? [] : []
  $: currentPreviewItems = currentFile ? previewItemsByFile[currentFile.id] ?? [] : []
  $: scopedSnippetActions = snippetActions.filter((action) => !action.fileId || currentFiles.some((file) => file.id === action.fileId))
  $: explorerEntries = usesPersistentWorkspace ? buildExplorerEntries(currentFiles, workspaceFolders) : []
  $: panelTabs = [
    ...(previewContent ? [{ id: 'preview', label: 'Preview' }] : []),
    ...(resultsContent ? [{ id: 'results', label: 'Results' }] : []),
    ...(terminalContent ? [{ id: 'terminal', label: 'Terminal' }] : [])
  ]
  $: if (panelTabs.length && !activePanel) {
    activePanel = /** @type {'preview' | 'results' | 'terminal'} */ (panelTabs[0].id)
  }
  $: if (resultsContent && resultsContent !== previousResultsContent) {
    previousResultsContent = resultsContent
    bottomPanelCollapsed = false
    activePanel = 'results'
  }
  $: hasSidePanel = previewContent !== null
  $: hasBottomPanel = resultsContent !== null || terminalContent !== null
  $: if (usesPersistentWorkspace && workspaceId && hydratedWorkspaceId !== workspaceId && !hydratingWorkspace) {
    void hydrateWorkspace(workspaceId, seededFiles)
  }
  $: if (usesPersistentWorkspace && workspaceId && hydratedWorkspaceId === workspaceId && !hydratingWorkspace) {
    syncSeededFiles()
  }
  $: if (!usesPersistentWorkspace) {
    workspaceFiles = []
    workspaceFolders = []
    hydratedWorkspaceId = ''
  }

  /** @param {string} value */
  function normalizePath(value) {
    return (value ?? '').replace(/\\/g, '/').replace(/^\/+|\/+$/g, '')
  }

  /** @param {string} path */
  function getBaseName(path) {
    const normalized = normalizePath(path)
    const parts = normalized.split('/').filter(Boolean)
    return parts[parts.length - 1] ?? normalized
  }

  /** @param {string} path */
  function getParentPath(path) {
    const parts = normalizePath(path).split('/').filter(Boolean)
    return parts.slice(0, -1).join('/')
  }

  /** @param {string} name */
  function inferLanguage(name) {
    if (name.endsWith('.ts')) return 'typescript'
    if (name.endsWith('.js')) return 'javascript'
    if (name.endsWith('.json')) return 'json'
    if (name.endsWith('.md')) return 'markdown'
    if (name.endsWith('.flow')) return 'flow-graph'
    return 'plaintext'
  }

  /** @param {string} name @param {string} language */
  function defaultFileIcon(name, language) {
    if (name.endsWith('.ts') || language === 'typescript') return '📘'
    if (name.endsWith('.json') || language === 'json') return '⚙'
    if (name.endsWith('.md') || language === 'markdown') return '📝'
    if (name.endsWith('.flow')) return '🔷'
    return '📄'
  }

  /** @param {any} file @param {number} index */
  function normalizeIncomingFile(file, index) {
    const fallbackPath = normalizePath(file.path ?? file.filename ?? file.label ?? `untitled-${index + 1}.txt`)
    const filename = file.filename ?? getBaseName(fallbackPath)
    const language = file.language ?? inferLanguage(filename)
    return {
      ...file,
      id: file.id ?? fallbackPath,
      path: fallbackPath,
      filename,
      label: file.label ?? filename,
      language,
      icon: file.icon ?? defaultFileIcon(filename, language),
      value: file.value ?? '',
      persistContent: file.persistContent !== false,
      isUserCreated: Boolean(file.isUserCreated)
    }
  }

  /** @param {any[]} nextSeedFiles @param {any[]} persistedFiles */
  function mergeFiles(nextSeedFiles, persistedFiles) {
    const nextIds = new Set(nextSeedFiles.map((file) => file.id))
    const persistedById = new Map(persistedFiles.map((file, index) => [file.id, normalizeIncomingFile(file, index)]))
    const mergedSeedFiles = nextSeedFiles.map((seedFile, index) => {
      const persistedFile = persistedById.get(seedFile.id)
      if (!persistedFile) {
        return normalizeIncomingFile(seedFile, index)
      }
      return normalizeIncomingFile({
        ...seedFile,
        value: seedFile.persistContent === false ? seedFile.value ?? '' : persistedFile.value ?? seedFile.value ?? '',
        path: seedFile.path,
        filename: seedFile.filename,
        label: seedFile.label,
        icon: persistedFile.icon ?? seedFile.icon,
        isUserCreated: persistedFile.isUserCreated
      }, index)
    })
    const userFiles = persistedFiles
      .map((file, index) => normalizeIncomingFile(file, index))
      .filter((file) => !nextIds.has(file.id))
    return [...mergedSeedFiles, ...userFiles]
  }

  /** @param {string[]} folders */
  function normalizeFolders(folders) {
    return [...new Set((folders ?? []).map((folder) => normalizePath(folder)).filter(Boolean))].sort((left, right) => left.localeCompare(right))
  }

  async function hydrateWorkspace(nextWorkspaceId, nextSeedFiles) {
    hydratingWorkspace = true
    const snapshot = await loadWorkspaceSnapshot(nextWorkspaceId)
    if (workspaceId !== nextWorkspaceId) {
      hydratingWorkspace = false
      return
    }
    workspaceFiles = mergeFiles(nextSeedFiles, snapshot.files ?? [])
    workspaceFolders = normalizeFolders(snapshot.folders ?? [])
    hydratedWorkspaceId = nextWorkspaceId
    internalActiveFileId = resolveActiveFileId(snapshot.activeFileId || activeFileId, workspaceFiles)
    hydratingWorkspace = false
    emitFilesChange(workspaceFiles)
  }

  function syncSeededFiles() {
    const nextFiles = mergeFiles(seededFiles, workspaceFiles)
    if (serializeFiles(nextFiles) !== serializeFiles(workspaceFiles)) {
      workspaceFiles = nextFiles
      schedulePersist()
      emitFilesChange(workspaceFiles)
    }
  }

  /** @param {any[]} nextFiles */
  function serializeFiles(nextFiles) {
    return JSON.stringify(nextFiles.map((file) => ({
      id: file.id,
      path: file.path,
      value: file.value,
      filename: file.filename,
      label: file.label,
      language: file.language,
      icon: file.icon,
      isUserCreated: file.isUserCreated,
      persistContent: file.persistContent
    })))
  }

  function schedulePersist() {
    if (!usesPersistentWorkspace || !workspaceId || hydratingWorkspace || typeof window === 'undefined') {
      return
    }
    window.clearTimeout(persistTimer)
    persistTimer = window.setTimeout(() => {
      saveWorkspaceSnapshot(workspaceId, {
        files: workspaceFiles,
        folders: workspaceFolders,
        activeFileId: internalActiveFileId
      })
    }, 120)
  }

  /** @param {string} preferredId @param {any[]} fileList */
  function resolveActiveFileId(preferredId, fileList) {
    if (preferredId && fileList.some((file) => file.id === preferredId)) {
      return preferredId
    }
    return fileList[0]?.id ?? ''
  }

  /** @param {any[]=} nextFiles */
  function emitFilesChange(nextFiles = currentFiles) {
    dispatch('fileschange', {
      activeFileId: internalActiveFileId,
      files: nextFiles
    })
  }

  /** @param {string} folderId */
  function toggleFolder(folderId) {
    if (expandedFolders.has(folderId)) {
      expandedFolders.delete(folderId)
    } else {
      expandedFolders.add(folderId)
    }
    expandedFolders = expandedFolders
  }

  /** @param {'explorer' | 'helpers'} view */
  function toggleSidebar(view) {
    if (!explorerCollapsed && activeSidebarView === view) {
      explorerCollapsed = true
      return
    }
    activeSidebarView = view
    explorerCollapsed = false
  }

  /** @param {string} fileId */
  function selectFile(fileId) {
    internalActiveFileId = fileId
    if (usesPersistentWorkspace) {
      schedulePersist()
    }
    dispatch('fileselect', { fileId })
  }

  /** @param {CustomEvent} event */
  function handleEditorChange(event) {
    dispatch('change', event.detail)
  }

  /** @param {CustomEvent} event */
  function handleFilesChange(event) {
    internalActiveFileId = event.detail.activeFileId ?? internalActiveFileId
    if (usesPersistentWorkspace) {
      workspaceFiles = (event.detail.files ?? []).map((file, index) => normalizeIncomingFile(file, index))
      schedulePersist()
      emitFilesChange(workspaceFiles)
      return
    }
    dispatch('fileschange', event.detail)
  }

  /** @param {CustomEvent} event */
  function handleTabChange(event) {
    internalActiveFileId = event.detail.fileId
    if (usesPersistentWorkspace) {
      schedulePersist()
    }
    dispatch('tabchange', event.detail)
  }

  /** @param {number} value @param {number} min @param {number} max */
  function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max)
  }

  /** @param {'explorer' | 'side' | 'bottom'} kind @param {PointerEvent} event */
  function startResize(kind, event) {
    if (window.matchMedia('(max-width: 768px)').matches) return

    event.preventDefault()

    const startX = event.clientX
    const startY = event.clientY
    const workspaceRect = workspaceEl?.getBoundingClientRect()
    const editorAreaRect = editorAreaEl?.getBoundingClientRect()
    const mainRect = mainEl?.getBoundingClientRect()
    const startExplorerWidth = explorerWidth
    const startSidePanelWidth = sidePanelWidth
    const startBottomPanelHeight = bottomPanelHeight
    const handle = /** @type {HTMLElement | null} */ (event.currentTarget)

    document.body.style.userSelect = 'none'
    document.body.style.cursor = kind === 'bottom' ? 'ns-resize' : 'ew-resize'

    const onMove = (moveEvent) => {
      if (kind === 'explorer' && workspaceRect) {
        const nextWidth = startExplorerWidth + (moveEvent.clientX - startX)
        explorerWidth = clamp(nextWidth, 180, Math.max(180, workspaceRect.width - 420))
      }

      if (kind === 'side' && editorAreaRect) {
        const nextWidth = startSidePanelWidth - (moveEvent.clientX - startX)
        sidePanelWidth = clamp(nextWidth, 240, Math.max(240, editorAreaRect.width - 320))
      }

      if (kind === 'bottom' && mainRect) {
        const nextHeight = startBottomPanelHeight - (moveEvent.clientY - startY)
        bottomPanelHeight = clamp(nextHeight, 120, Math.max(120, mainRect.height - 140))
      }
    }

    const stopResize = () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', stopResize)
      window.removeEventListener('pointercancel', stopResize)
      document.body.style.userSelect = ''
      document.body.style.cursor = ''
      handle?.classList.remove('dragging')
      activeResizeCleanup = null
    }

    activeResizeCleanup?.()
    handle?.classList.add('dragging')
    activeResizeCleanup = stopResize

    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', stopResize)
    window.addEventListener('pointercancel', stopResize)
  }

  /** @param {string} path */
  function ensureFolderExpanded(path) {
    const parts = normalizePath(path).split('/').filter(Boolean)
    let currentPath = ''
    for (const part of parts) {
      currentPath = currentPath ? `${currentPath}/${part}` : part
      expandedFolders.add(currentPath)
    }
    expandedFolders = expandedFolders
  }

  function createFile() {
    const requestedPath = window.prompt('New file path', 'src/untitled.txt')
    if (!requestedPath) return
    const nextPath = normalizePath(requestedPath)
    const nextId = `user:${nextPath}`
    if (!nextPath || currentFiles.some((file) => file.path === nextPath || file.id === nextId)) {
      return
    }
    const filename = getBaseName(nextPath)
    const language = inferLanguage(filename)
    workspaceFiles = [...currentFiles, normalizeIncomingFile({
      id: nextId,
      path: nextPath,
      filename,
      label: filename,
      language,
      icon: defaultFileIcon(filename, language),
      value: '',
      isUserCreated: true
    }, currentFiles.length)]
    ensureFolderExpanded(getParentPath(nextPath))
    internalActiveFileId = nextId
    activeSidebarView = 'explorer'
    explorerCollapsed = false
    schedulePersist()
    emitFilesChange(workspaceFiles)
  }

  function createFolder() {
    const requestedPath = window.prompt('New folder path', 'src/new-folder')
    if (!requestedPath) return
    const nextPath = normalizePath(requestedPath)
    if (!nextPath || workspaceFolders.includes(nextPath)) {
      return
    }
    workspaceFolders = normalizeFolders([...workspaceFolders, nextPath])
    ensureFolderExpanded(nextPath)
    schedulePersist()
  }

  /** @param {{ path: string, id?: string }} entry */
  function renameFile(entry) {
    const requestedPath = window.prompt('Rename file', entry.path)
    if (!requestedPath) return
    const nextPath = normalizePath(requestedPath)
    if (!nextPath || nextPath === entry.path || currentFiles.some((file) => file.path === nextPath)) {
      return
    }
    workspaceFiles = currentFiles.map((file, index) => (
      file.id === entry.id
        ? normalizeIncomingFile({
            ...file,
            path: nextPath,
            filename: getBaseName(nextPath),
            label: getBaseName(nextPath)
          }, index)
        : file
    ))
    ensureFolderExpanded(getParentPath(nextPath))
    schedulePersist()
    emitFilesChange(workspaceFiles)
  }

  /** @param {{ path: string }} entry */
  function renameFolder(entry) {
    const requestedPath = window.prompt('Rename folder', entry.path)
    if (!requestedPath) return
    const nextPath = normalizePath(requestedPath)
    if (!nextPath || nextPath === entry.path || workspaceFolders.includes(nextPath)) {
      return
    }
    workspaceFolders = normalizeFolders(workspaceFolders.map((folder) => (
      folder === entry.path || folder.startsWith(`${entry.path}/`)
        ? `${nextPath}${folder.slice(entry.path.length)}`
        : folder
    )))
    workspaceFiles = currentFiles.map((file, index) => (
      file.path === entry.path || file.path.startsWith(`${entry.path}/`)
        ? normalizeIncomingFile({
            ...file,
            path: `${nextPath}${file.path.slice(entry.path.length)}`,
            filename: getBaseName(`${nextPath}${file.path.slice(entry.path.length)}`),
            label: getBaseName(`${nextPath}${file.path.slice(entry.path.length)}`)
          }, index)
        : file
    ))
    ensureFolderExpanded(nextPath)
    schedulePersist()
    emitFilesChange(workspaceFiles)
  }

  /** @param {{ id: string }} entry */
  function deleteFile(entry) {
    workspaceFiles = currentFiles.filter((file) => file.id !== entry.id)
    internalActiveFileId = resolveActiveFileId('', workspaceFiles)
    schedulePersist()
    emitFilesChange(workspaceFiles)
  }

  /** @param {{ path: string }} entry */
  function deleteFolder(entry) {
    workspaceFolders = normalizeFolders(workspaceFolders.filter((folder) => folder !== entry.path && !folder.startsWith(`${entry.path}/`)))
    workspaceFiles = currentFiles.filter((file) => file.path !== entry.path && !file.path.startsWith(`${entry.path}/`))
    internalActiveFileId = resolveActiveFileId('', workspaceFiles)
    schedulePersist()
    emitFilesChange()
  }

  /** @param {{ insertText: string, fileId?: string }} action */
  function insertSnippet(action) {
    codeEditor?.insertSnippetAction?.(action)
  }

  /** @param {any[]} fileList @param {string[]} explicitFolders */
  function buildExplorerEntries(fileList, explicitFolders) {
    const folders = new Set(normalizeFolders(explicitFolders))
    for (const file of fileList) {
      const parts = normalizePath(file.path).split('/').filter(Boolean)
      let currentPath = ''
      for (const part of parts.slice(0, -1)) {
        currentPath = currentPath ? `${currentPath}/${part}` : part
        folders.add(currentPath)
      }
    }

    const folderChildren = new Map()
    const fileChildren = new Map()
    const sortedFolders = [...folders].sort((left, right) => left.localeCompare(right))
    const sortedFiles = [...fileList].sort((left, right) => left.path.localeCompare(right.path))

    for (const folder of sortedFolders) {
      const parent = getParentPath(folder)
      const items = folderChildren.get(parent) ?? []
      items.push(folder)
      folderChildren.set(parent, items)
    }

    for (const file of sortedFiles) {
      const parent = getParentPath(file.path)
      const items = fileChildren.get(parent) ?? []
      items.push(file)
      fileChildren.set(parent, items)
    }

    const entries = []

    /** @param {string} parentPath @param {number} depth */
    function appendChildren(parentPath, depth) {
      for (const folderPath of folderChildren.get(parentPath) ?? []) {
        entries.push({
          type: 'folder',
          id: folderPath,
          path: folderPath,
          depth,
          label: getBaseName(folderPath)
        })
        if (expandedFolders.has(folderPath)) {
          appendChildren(folderPath, depth + 1)
        }
      }

      for (const file of fileChildren.get(parentPath) ?? []) {
        entries.push({
          type: 'file',
          id: file.id,
          path: file.path,
          depth,
          label: file.label,
          icon: file.icon,
          badge: file.badge
        })
      }
    }

    appendChildren('', 0)
    return entries
  }

  onDestroy(() => {
    activeResizeCleanup?.()
    if (typeof window !== 'undefined') {
      window.clearTimeout(persistTimer)
    }
  })
</script>

<div
  class="ide-workspace"
  class:explorer-collapsed={explorerCollapsed}
  style={`--explorer-width: ${explorerWidth}px; --side-panel-width: ${sidePanelWidth}px; --bottom-panel-height: ${bottomPanelHeight}px;`}
  bind:this={workspaceEl}
>
  <div class="ide-activity-bar">
    <button
      class="ide-activity-icon"
      class:active={!explorerCollapsed && activeSidebarView === 'explorer'}
      type="button"
      title="Explorer"
      onclick={() => toggleSidebar('explorer')}
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
        <path d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
      </svg>
    </button>
    <button
      class="ide-activity-icon"
      class:active={!explorerCollapsed && activeSidebarView === 'helpers'}
      type="button"
      title="Node helpers"
      onclick={() => toggleSidebar('helpers')}
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
        <path d="M4 5h16" />
        <path d="M4 12h10" />
        <path d="M4 19h7" />
        <circle cx="18" cy="12" r="2.5" />
        <circle cx="15" cy="19" r="2.5" />
      </svg>
    </button>
  </div>

  {#if !explorerCollapsed}
    <aside class="ide-explorer">
      {#if activeSidebarView === 'explorer'}
        <div class="ide-explorer-section">
          <button class="ide-explorer-section-title" type="button" onclick={() => toggleFolder('root')}>
            <span class="ide-chevron">{expandedFolders.has('root') ? '▼' : '▶'}</span>
            <span class="ide-explorer-label">{explorerTitle}</span>
            <strong>{projectName}</strong>
          </button>

          {#if expandedFolders.has('root')}
            {#if usesPersistentWorkspace}
              <div class="ide-explorer-toolbar">
                <button class="ide-explorer-action" type="button" onclick={createFile}>New File</button>
                <button class="ide-explorer-action" type="button" onclick={createFolder}>New Folder</button>
              </div>
            {/if}

            <div class="ide-explorer-tree">
              {#if usesPersistentWorkspace}
                {#each explorerEntries as entry}
                  {#if entry.type === 'folder'}
                    <div class="ide-tree-row" style={`--tree-indent: ${entry.depth};`}>
                      <button
                        class="ide-tree-item ide-tree-folder"
                        type="button"
                        onclick={() => toggleFolder(entry.id)}
                      >
                        <span class="ide-chevron">{expandedFolders.has(entry.id) ? '▼' : '▶'}</span>
                        <span class="ide-file-icon folder">📁</span>
                        <span>{entry.label}</span>
                      </button>
                      <div class="ide-tree-actions">
                        <button class="ide-tree-action" type="button" title="Rename folder" onclick={() => renameFolder(entry)}>✎</button>
                        <button class="ide-tree-action" type="button" title="Delete folder" onclick={() => deleteFolder(entry)}>×</button>
                      </div>
                    </div>
                  {:else}
                    <div class="ide-tree-row" style={`--tree-indent: ${entry.depth};`}>
                      <button
                        class="ide-tree-item ide-tree-file"
                        class:active={entry.id === internalActiveFileId}
                        type="button"
                        onclick={() => selectFile(entry.id)}
                      >
                        <span class="ide-file-icon">{entry.icon ?? '📄'}</span>
                        <span>{entry.label}</span>
                        {#if entry.badge}
                          <span class="ide-file-badge">{entry.badge}</span>
                        {/if}
                      </button>
                      <div class="ide-tree-actions">
                        <button class="ide-tree-action" type="button" title="Rename file" onclick={() => renameFile(entry)}>✎</button>
                        <button class="ide-tree-action" type="button" title="Delete file" onclick={() => deleteFile(entry)}>×</button>
                      </div>
                    </div>
                  {/if}
                {/each}
              {:else if explorerNodes.length}
                {#each explorerNodes as node}
                  {#if node.type === 'folder'}
                    <button
                      class="ide-tree-item ide-tree-folder"
                      type="button"
                      onclick={() => toggleFolder(node.id)}
                    >
                      <span class="ide-chevron">{expandedFolders.has(node.id) ? '▼' : '▶'}</span>
                      <span class="ide-file-icon folder">📁</span>
                      <span>{node.label}</span>
                    </button>
                    {#if expandedFolders.has(node.id) && node.children}
                      {#each node.children as child}
                        <button
                          class="ide-tree-item ide-tree-file nested"
                          class:active={child.id === internalActiveFileId}
                          type="button"
                          onclick={() => selectFile(child.id)}
                        >
                          <span class="ide-file-icon">{child.icon ?? '📄'}</span>
                          <span>{child.label}</span>
                          {#if child.badge}
                            <span class="ide-file-badge">{child.badge}</span>
                          {/if}
                        </button>
                      {/each}
                    {/if}
                  {:else}
                    <button
                      class="ide-tree-item ide-tree-file"
                      class:active={node.id === internalActiveFileId}
                      type="button"
                      onclick={() => selectFile(node.id)}
                    >
                      <span class="ide-file-icon">{node.icon ?? '📄'}</span>
                      <span>{node.label}</span>
                      {#if node.badge}
                        <span class="ide-file-badge">{node.badge}</span>
                      {/if}
                    </button>
                  {/if}
                {/each}
              {:else}
                {#each currentFiles as file}
                  <button
                    class="ide-tree-item ide-tree-file"
                    class:active={file.id === internalActiveFileId}
                    type="button"
                    onclick={() => selectFile(file.id)}
                  >
                    <span class="ide-file-icon">{file.icon ?? '📄'}</span>
                    <span>{file.label ?? file.filename ?? file.id}</span>
                  </button>
                {/each}
              {/if}
            </div>
          {/if}
        </div>
      {:else}
        <div class="ide-explorer-section ide-helper-panel">
          <div class="ide-helper-header">
            <p>{sidebarHelpersTitle}</p>
            <strong>{currentFile?.label ?? 'No file selected'}</strong>
          </div>

          {#if currentSummary}
            <section class="ide-helper-section">
              <p class="ide-helper-kicker">Context</p>
              <p class="ide-helper-copy">{currentSummary}</p>
            </section>
          {/if}

          {#if scopedSnippetActions.length}
            <section class="ide-helper-section">
              <p class="ide-helper-kicker">Insert</p>
              <div class="ide-helper-chip-grid">
                {#each scopedSnippetActions as action}
                  <button class="ide-helper-chip" type="button" onclick={() => insertSnippet(action)}>{action.label}</button>
                {/each}
              </div>
            </section>
          {/if}

          {#if currentPreviewItems.length}
            <section class="ide-helper-section">
              <p class="ide-helper-kicker">Inline helpers</p>
              <div class="ide-helper-list">
                {#each currentPreviewItems as item}
                  <article class="ide-helper-card">
                    <strong>Line {item.line}</strong>
                    <p>{item.text}</p>
                  </article>
                {/each}
              </div>
            </section>
          {/if}

          {#if currentMarkers.length}
            <section class="ide-helper-section">
              <p class="ide-helper-kicker">Diagnostics</p>
              <div class="ide-helper-list">
                {#each currentMarkers as marker}
                  <article class="ide-helper-card warning">
                    <strong>Line {marker.line}</strong>
                    <p>{marker.message}</p>
                  </article>
                {/each}
              </div>
            </section>
          {/if}

          {#if !currentSummary && !scopedSnippetActions.length && !currentPreviewItems.length && !currentMarkers.length}
            <p class="ide-helper-empty">Select a file to inspect helpers, snippets, and diagnostics here.</p>
          {/if}
        </div>
      {/if}
    </aside>
    <button
      aria-label="Resize explorer"
      class="ide-resize-handle ide-resize-handle-vertical"
      type="button"
      onpointerdown={(event) => startResize('explorer', event)}
    ></button>
  {/if}

  <div class="ide-main" bind:this={mainEl}>
    <div class="ide-editor-area" class:has-side-panel={hasSidePanel} bind:this={editorAreaEl}>
      <div class="ide-editor-pane">
        <CodeEditor
          bind:this={codeEditor}
          files={currentFiles}
          activeFileId={internalActiveFileId}
          {readOnly}
          {minHeight}
          {previewItemsByFile}
          {markersByFile}
          {summaryByFile}
          {snippetActions}
          {commandActions}
          showHelperToolbar={false}
          on:change={handleEditorChange}
          on:fileschange={handleFilesChange}
          on:tabchange={handleTabChange}
        />
      </div>

      {#if hasSidePanel && previewContent}
        <button
          aria-label="Resize preview panel"
          class="ide-resize-handle ide-resize-handle-vertical"
          type="button"
          onpointerdown={(event) => startResize('side', event)}
        ></button>
        <div class="ide-side-panel">
          <div class="ide-side-panel-header">
            <p>{sidePanelEyebrow}</p>
            <strong>{sidePanelTitle}</strong>
            {#if sidePanelDescription}
              <span>{sidePanelDescription}</span>
            {/if}
          </div>
          <div class="ide-panel-content ide-preview-content">
            <slot name="preview">
              {#if typeof previewContent === 'string'}
                <div class="ide-preview-text">{@html previewContent}</div>
              {:else}
                <div class="ide-preview-slot">
                  <slot name="preview-component" />
                </div>
              {/if}
            </slot>
          </div>
        </div>
      {/if}
    </div>

    {#if hasBottomPanel && !bottomPanelCollapsed}
      <div class="ide-bottom-panel">
        <button
          aria-label="Resize bottom panel"
          class="ide-resize-handle ide-resize-handle-horizontal"
          type="button"
          onpointerdown={(event) => startResize('bottom', event)}
        ></button>
        <div class="ide-panel-tabs">
          {#each panelTabs.filter((tab) => tab.id !== 'preview') as tab}
            <button
              class="ide-panel-tab"
              class:active={activePanel === tab.id}
              type="button"
              onclick={() => (activePanel = /** @type {'preview' | 'results' | 'terminal'} */ (tab.id))}
            >
              {tab.label}
            </button>
          {/each}
          <button class="ide-panel-close" type="button" onclick={() => (bottomPanelCollapsed = true)}>×</button>
        </div>
        <div class="ide-panel-content ide-bottom-content">
          {#if activePanel === 'results' && resultsContent}
            <slot name="results">
              {#if typeof resultsContent === 'string'}
                <pre class="ide-terminal-output">{resultsContent}</pre>
              {/if}
            </slot>
          {/if}
          {#if activePanel === 'terminal' && terminalContent}
            <slot name="terminal">
              {#if typeof terminalContent === 'string'}
                <pre class="ide-terminal-output">{terminalContent}</pre>
              {/if}
            </slot>
          {/if}
        </div>
      </div>
    {/if}
  </div>
</div>

<style>
  .ide-workspace {
    display: grid;
    grid-template-columns: auto var(--explorer-width, 17rem) 6px minmax(0, 1fr);
    height: clamp(34rem, 70vh, 48rem);
    min-height: 34rem;
    background: #11131a;
    border: 1px solid #2f3340;
    border-radius: 0.5rem;
    overflow: hidden;
    resize: vertical;
    font-family: 'Segoe WPC', 'Segoe UI', system-ui, sans-serif;
  }

  .ide-workspace.explorer-collapsed {
    grid-template-columns: auto minmax(0, 1fr);
  }

  .ide-activity-bar {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.45rem;
    width: 48px;
    background: #161922;
    border-right: 1px solid #252a35;
    padding-top: 0.6rem;
  }

  .ide-activity-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 48px;
    height: 48px;
    border: none;
    background: transparent;
    color: #7f879e;
    transition: color 0.1s;
    padding: 0;
    min-height: 0;
    border-radius: 0.3rem;
    border-left: 2px solid transparent;
  }

  .ide-activity-icon:hover {
    color: #eef2ff;
    background: rgba(255, 255, 255, 0.04);
  }

  .ide-activity-icon.active {
    color: #eef2ff;
    border-left-color: #007acc;
    background: rgba(0, 122, 204, 0.16);
  }

  .ide-explorer {
    background: #161922;
    border-right: 1px solid #252a35;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
  }

  .ide-explorer-section {
    display: flex;
    flex-direction: column;
    padding: 0.55rem;
    gap: 0.55rem;
  }

  .ide-explorer-section-title {
    display: flex;
    align-items: center;
    gap: 0.35rem;
    padding: 0.55rem 0.65rem;
    border: none;
    background: transparent;
    color: #d8def0;
    font-size: 0.72rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    min-height: 0;
    border-radius: 0.25rem;
    cursor: pointer;
  }

  .ide-explorer-section-title:hover {
    background: rgba(255, 255, 255, 0.04);
  }

  .ide-explorer-label,
  .ide-helper-kicker,
  .ide-side-panel-header p,
  .ide-helper-header p {
    color: #8d95ab;
    margin: 0;
    font-size: 0.7rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    font-weight: 700;
  }

  .ide-explorer-toolbar {
    display: flex;
    gap: 0.4rem;
  }

  .ide-explorer-action,
  .ide-helper-chip,
  .ide-tree-action {
    border: 1px solid #303647;
    background: #1b1f2a;
    color: #cfd5e9;
    border-radius: 0.25rem;
    min-height: 0;
  }

  .ide-explorer-action {
    padding: 0.3rem 0.55rem;
    font-size: 0.72rem;
  }

  .ide-explorer-action:hover,
  .ide-helper-chip:hover,
  .ide-tree-action:hover {
    border-color: #007acc;
    color: #eef2ff;
    background: rgba(0, 122, 204, 0.16);
  }

  .ide-explorer-tree {
    display: flex;
    flex-direction: column;
    gap: 0.05rem;
  }

  .ide-tree-row {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    align-items: center;
    gap: 0.15rem;
  }

  .ide-tree-item {
    display: flex;
    align-items: center;
    gap: 0.3rem;
    padding: 0.18rem 0.4rem 0.18rem calc(0.55rem + (var(--tree-indent, 0) * 0.9rem));
    border: none;
    background: transparent;
    color: #cfd5e9;
    font-size: 0.78rem;
    min-height: 1.8rem;
    border-radius: 0.25rem;
    cursor: pointer;
    text-align: left;
  }

  .ide-tree-item.nested {
    padding-left: 2.1rem;
  }

  .ide-tree-item:hover {
    background: #1f2430;
  }

  .ide-tree-item.active {
    background: rgba(0, 122, 204, 0.18);
    color: #eef2ff;
  }

  .ide-tree-actions {
    display: flex;
    gap: 0.15rem;
    opacity: 0;
    pointer-events: none;
    padding-right: 0.2rem;
  }

  .ide-tree-row:hover .ide-tree-actions {
    opacity: 1;
    pointer-events: auto;
  }

  .ide-tree-action {
    width: 22px;
    height: 22px;
    padding: 0;
    font-size: 0.72rem;
  }

  .ide-chevron {
    font-size: 0.55rem;
    width: 1rem;
    text-align: center;
    color: #7f879e;
  }

  .ide-file-icon {
    font-size: 0.8rem;
    width: 1.1rem;
    text-align: center;
  }

  .ide-file-icon.folder {
    color: #dcb67a;
  }

  .ide-file-badge {
    margin-left: auto;
    font-size: 0.65rem;
    color: #73c991;
    font-weight: 600;
    letter-spacing: 0.02em;
  }

  .ide-helper-panel,
  .ide-helper-section,
  .ide-helper-list {
    display: grid;
    gap: 0.55rem;
  }

  .ide-helper-header strong,
  .ide-side-panel-header strong {
    color: #eef2ff;
    font-size: 0.95rem;
  }

  .ide-helper-copy,
  .ide-helper-card p,
  .ide-helper-empty,
  .ide-side-panel-header span {
    margin: 0;
    color: #a6aec6;
    line-height: 1.5;
    font-size: 0.8rem;
  }

  .ide-helper-chip-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 0.3rem;
  }

  .ide-helper-chip {
    padding: 0.3rem 0.45rem;
    font-size: 0.7rem;
  }

  .ide-helper-card {
    display: grid;
    gap: 0.2rem;
    padding: 0.55rem 0.6rem;
    border: 1px solid #252a35;
    border-radius: 0.3rem;
    background: #11131a;
  }

  .ide-helper-card.warning {
    border-color: rgba(255, 196, 0, 0.22);
    background: rgba(255, 196, 0, 0.06);
  }

  .ide-main {
    display: flex;
    flex-direction: column;
    min-width: 0;
    overflow: hidden;
  }

  .ide-editor-area {
    flex: 1;
    display: grid;
    grid-template-columns: 1fr;
    min-height: 0;
    overflow: hidden;
  }

  .ide-editor-area.has-side-panel {
    grid-template-columns: minmax(0, 1fr) 6px minmax(16rem, var(--side-panel-width, 22.5rem));
  }

  .ide-editor-pane {
    min-width: 0;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }

  .ide-editor-pane :global(.code-editor-shell) {
    border-radius: 0;
    border: none;
    height: 100%;
  }

  .ide-editor-pane :global(.monaco-host) {
    flex: 1;
    min-height: 0;
  }

  .ide-side-panel {
    display: flex;
    flex-direction: column;
    border-left: 1px solid #252a35;
    background: #0f1118;
    min-width: 0;
    overflow: hidden;
  }

  .ide-side-panel-header {
    display: grid;
    gap: 0.35rem;
    padding: 0.95rem 0.95rem 0.75rem;
    border-bottom: 1px solid #252a35;
    background: linear-gradient(180deg, rgba(255, 255, 255, 0.03), transparent);
  }

  .ide-panel-tabs {
    display: flex;
    align-items: center;
    background: #161922;
    border-bottom: 1px solid #252a35;
    min-height: 35px;
    padding: 0 0.5rem;
    gap: 0;
  }

  .ide-panel-tab {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.4rem 0.75rem;
    border: none;
    background: transparent;
    color: #8f96ab;
    font-size: 0.78rem;
    min-height: 35px;
    border-radius: 0;
    border-bottom: 1px solid transparent;
    cursor: pointer;
  }

  .ide-panel-tab.active {
    color: #eef2ff;
    border-bottom-color: #007acc;
  }

  .ide-panel-tab:hover:not(.active) {
    color: #cfd5e9;
  }

  .ide-panel-close {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 20px;
    margin-left: auto;
    border: none;
    background: transparent;
    color: #7f879e;
    font-size: 1rem;
    padding: 0;
    min-height: 0;
    border-radius: 2px;
    cursor: pointer;
  }

  .ide-panel-close:hover {
    background: #2a3040;
    color: #eef2ff;
  }

  .ide-panel-content {
    flex: 1;
    overflow: auto;
    padding: 0.85rem;
  }

  .ide-preview-content {
    background: linear-gradient(180deg, rgba(255, 255, 255, 0.02), transparent 4rem), #0f1118;
  }

  .ide-bottom-panel {
    border-top: 1px solid #252a35;
    background: #11131a;
    height: var(--bottom-panel-height, 220px);
    max-height: none;
    min-height: 120px;
    display: flex;
    flex-direction: column;
  }

  .ide-resize-handle {
    position: relative;
    border: none;
    background: transparent;
    padding: 0;
    margin: 0;
    min-height: 0;
    min-width: 0;
  }

  .ide-resize-handle::after {
    content: '';
    position: absolute;
    inset: 0;
    background: transparent;
    transition: background 0.12s ease;
  }

  .ide-resize-handle:hover::after,
  .ide-resize-handle.dragging::after {
    background: rgba(0, 122, 204, 0.65);
  }

  .ide-resize-handle-vertical {
    width: 6px;
    cursor: ew-resize;
    background: #11131a;
  }

  .ide-resize-handle-horizontal {
    height: 6px;
    width: 100%;
    cursor: ns-resize;
    background: #11131a;
  }

  @media (max-width: 768px) {
    .ide-workspace,
    .ide-workspace.explorer-collapsed {
      grid-template-columns: minmax(0, 1fr);
    }

    .ide-activity-bar,
    .ide-resize-handle-vertical {
      display: none;
    }

    .ide-explorer {
      display: none;
    }

    .ide-editor-area.has-side-panel {
      grid-template-columns: 1fr;
    }

    .ide-side-panel {
      display: none;
    }
  }
</style>
