<svelte:options runes={false} />
<script>
  import { createEventDispatcher } from 'svelte'
  import CodeEditor from '$lib/components/CodeEditor.svelte'

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
  /** @type {any} */
  export let previewContent = null
  /** @type {any} */
  export let resultsContent = null
  /** @type {any} */
  export let terminalContent = null

  const dispatch = createEventDispatcher()

  let explorerCollapsed = false
  let bottomPanelCollapsed = false
  /** @type {Set<string>} */
  let expandedFolders = new Set(['root', 'src'])
  let previousResultsContent = resultsContent

  $: internalActiveFileId = activeFileId || files[0]?.id || ''
  $: panelTabs = [
    ...(previewContent ? [{ id: 'preview', label: 'Preview' }] : []),
    ...(resultsContent ? [{ id: 'results', label: 'Results' }] : []),
    ...(terminalContent ? [{ id: 'terminal', label: 'Terminal' }] : [])
  ]
  $: if (panelTabs.length && !activePanel) {
    activePanel = /** @type {'preview' | 'results' | 'terminal'} */ (panelTabs[0].id)
  }
  // Auto-expand bottom panel and switch to results when new results arrive
  $: if (resultsContent && resultsContent !== previousResultsContent) {
    previousResultsContent = resultsContent
    bottomPanelCollapsed = false
    activePanel = 'results'
  }
  $: hasSidePanel = previewContent !== null
  $: hasBottomPanel = resultsContent !== null || terminalContent !== null

  /** @param {string} folderId */
  function toggleFolder(folderId) {
    if (expandedFolders.has(folderId)) {
      expandedFolders.delete(folderId)
    } else {
      expandedFolders.add(folderId)
    }
    expandedFolders = expandedFolders
  }

  /** @param {string} fileId */
  function selectFile(fileId) {
    internalActiveFileId = fileId
    dispatch('fileselect', { fileId })
  }

  /** @param {CustomEvent} event */
  function handleEditorChange(event) {
    dispatch('change', event.detail)
  }

  /** @param {CustomEvent} event */
  function handleFilesChange(event) {
    dispatch('fileschange', event.detail)
  }

  /** @param {CustomEvent} event */
  function handleTabChange(event) {
    internalActiveFileId = event.detail.fileId
    dispatch('tabchange', event.detail)
  }
</script>

<div class="ide-workspace" class:explorer-collapsed={explorerCollapsed}>
  <div class="ide-activity-bar">
    <button
      class="ide-activity-icon"
      class:active={!explorerCollapsed}
      type="button"
      title="Explorer"
      onclick={() => (explorerCollapsed = !explorerCollapsed)}
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
        <path d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
      </svg>
    </button>
  </div>

  {#if !explorerCollapsed}
    <aside class="ide-explorer">
      <div class="ide-explorer-section">
        <button class="ide-explorer-section-title" type="button" onclick={() => toggleFolder('root')}>
          <span class="ide-chevron">{expandedFolders.has('root') ? '▼' : '▶'}</span>
          <span class="ide-explorer-label">{explorerTitle}</span>
          <strong>{projectName}</strong>
        </button>

        {#if expandedFolders.has('root')}
          <div class="ide-explorer-tree">
            {#if explorerNodes.length}
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
              {#each files as file}
                <button
                  class="ide-tree-item ide-tree-file"
                  class:active={file.id === internalActiveFileId}
                  type="button"
                  onclick={() => selectFile(file.id)}
                >
                  <span class="ide-file-icon">📄</span>
                  <span>{file.label ?? file.filename ?? file.id}</span>
                </button>
              {/each}
            {/if}
          </div>
        {/if}
      </div>
    </aside>
  {/if}

  <div class="ide-main">
    <div class="ide-editor-area" class:has-side-panel={hasSidePanel}>
      <div class="ide-editor-pane">
        <CodeEditor
          {files}
          activeFileId={internalActiveFileId}
          {readOnly}
          {minHeight}
          {previewItemsByFile}
          {markersByFile}
          {summaryByFile}
          {snippetActions}
          {commandActions}
          on:change={handleEditorChange}
          on:fileschange={handleFilesChange}
          on:tabchange={handleTabChange}
        />
      </div>

      {#if hasSidePanel && previewContent}
        <div class="ide-side-panel">
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
        <div class="ide-panel-tabs">
          {#each panelTabs.filter(t => t.id !== 'preview') as tab}
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
    grid-template-columns: auto minmax(14rem, 18rem) minmax(0, 1fr);
    height: clamp(34rem, 70vh, 48rem);
    min-height: 34rem;
    background: #11131a;
    border: 1px solid #2f3340;
    border-radius: 0.9rem;
    overflow: hidden;
    resize: vertical;
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
    border-radius: 0.7rem;
    border-left: 2px solid transparent;
  }

  .ide-activity-icon:hover {
    color: #eef2ff;
    background: rgba(105, 108, 255, 0.08);
  }

  .ide-activity-icon.active {
    color: #eef2ff;
    border-left-color: #696cff;
    background: rgba(105, 108, 255, 0.12);
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
    padding: 0.6rem;
  }

  .ide-explorer-section-title {
    display: flex;
    align-items: center;
    gap: 0.35rem;
    padding: 0.55rem 0.7rem;
    border: 1px solid #2d3342;
    background: #1b1f2a;
    color: #d8def0;
    font-size: 0.72rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    min-height: 0;
    border-radius: 0.75rem;
    cursor: pointer;
  }

  .ide-explorer-section-title:hover {
    background: #202531;
  }

  .ide-explorer-label {
    color: #8d95ab;
    margin-right: 0.25rem;
  }

  .ide-explorer-tree {
    display: flex;
    flex-direction: column;
    gap: 0.15rem;
    padding-top: 0.6rem;
  }

  .ide-chevron {
    font-size: 0.55rem;
    width: 1rem;
    text-align: center;
    color: #7f879e;
  }

  .ide-tree-item {
    display: flex;
    align-items: center;
    gap: 0.3rem;
    padding: 0.2rem 0.5rem 0.2rem 1.2rem;
    border: none;
    background: transparent;
    color: #cfd5e9;
    font-size: 0.82rem;
    min-height: 2rem;
    border-radius: 0.55rem;
    cursor: pointer;
    text-align: left;
  }

  .ide-tree-item.nested {
    padding-left: 2.2rem;
  }

  .ide-tree-item:hover {
    background: #1f2430;
  }

  .ide-tree-item.active {
    background: rgba(105, 108, 255, 0.18);
    color: #eef2ff;
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
    grid-template-columns: 1fr 1fr;
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
    border-bottom-color: #696cff;
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
    border-radius: 3px;
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
    background:
      linear-gradient(180deg, rgba(255, 255, 255, 0.02), transparent 4rem),
      #0f1118;
  }

  .ide-bottom-panel {
    border-top: 1px solid #252a35;
    background: #11131a;
    max-height: 280px;
    min-height: 120px;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .ide-bottom-content {
    flex: 1;
    overflow: auto;
    padding: 0.5rem 0.75rem;
  }

  .ide-terminal-output {
    margin: 0;
    color: #cfd5e9;
    font-family: 'JetBrains Mono', 'Fira Code', ui-monospace, monospace;
    font-size: 0.82rem;
    line-height: 1.5;
    white-space: pre-wrap;
  }

  .ide-preview-text {
    color: #cfd5e9;
    font-size: 0.85rem;
    line-height: 1.6;
  }

  .ide-side-panel :global(.diagram-card) {
    height: 100%;
    border: 1px solid #252a35;
    background: #11131a;
    box-shadow: none;
  }

  .ide-side-panel :global(.mermaid-output) {
    border-radius: 0.75rem;
    background: #0b0d13;
    border: 1px solid #222735;
    padding: 1rem;
  }

  @media (max-width: 768px) {
    .ide-workspace {
      grid-template-columns: 1fr;
      height: auto;
      min-height: 500px;
    }

    .ide-activity-bar {
      display: none;
    }

    .ide-explorer {
      display: none;
    }

    .ide-editor-area.has-side-panel {
      grid-template-columns: 1fr;
    }

    .ide-side-panel {
      border-left: none;
      border-top: 1px solid #333;
      max-height: 300px;
    }
  }
</style>
