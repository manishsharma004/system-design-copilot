<svelte:options runes={false} />
<script>
  import { onDestroy, onMount } from 'svelte'
  import { browser } from '$app/environment'
  import IDEWorkspace from '$lib/components/IDEWorkspace.svelte'
  import TopologyBuilder from '$lib/components/TopologyBuilder.svelte'
  import { codiconSvg } from '$lib/editor/codicons'
  import {
    FLOW_GRAPH_LANGUAGE,
    buildFlowGraphMetadata,
    buildSimulationScriptMetadata,
    flowGraphCompletions,
    simulationScriptCompletions
  } from '$lib/editor/exerciseMetadata'
  import {
    buildWorkspaceId,
    createSeedFile,
    findFileByPath,
    resetWorkspace,
    SIMULATION_PATHS
  } from '$lib/editor/workspace'
  import { simulationSessions } from '$lib/stores/simulation'
  import { compileFlowGraph } from '$lib/simulation/graphCompiler'
  import { runSimulation } from '$lib/simulation/engine'

  /** @type {any} */
  export let lesson

  /** @type {any} */
  let simulation = null
  /** @type {Record<string, any>} */
  let sessions = {}
  /** @type {any} */
  let session = null
  /** @type {any} */
  let compilePreview = null
  /** @type {any} */
  let activeApi = null
  /** @type {any} */
  let activeProfile = null
  /** @type {any[]} */
  let compatibleProfiles = []
  let activeApiId = ''
  let activeProfileId = ''
  let diagramText = ''
  let scriptText = ''
  let layoutJson = '{}'
  let hydratedLessonId = ''
  let workspaceReady = false
  /** @type {'editor' | 'builder'} */
  let lastChangeSource = 'editor'
  /** @type {any} */
  let latestRun = null
  /** @type {any} */
  let ideWorkspace
  /** @type {HTMLDivElement | undefined} */
  let fullscreenShell
  let isFullscreen = false
  let overlayFullscreen = false

  $: simulation = lesson?.simulation ?? null
  $: workspaceId = simulation ? buildWorkspaceId('simulation', lesson.id) : ''
  $: sessions = $simulationSessions
  $: session = simulation ? sessions[lesson.id] ?? null : null
  $: compilePreview = simulation ? compileFlowGraph(diagramText || simulation.starterDiagram) : null
  $: diagramMetadata = buildFlowGraphMetadata(diagramText || simulation?.starterDiagram || '')
  $: scriptMetadata = buildSimulationScriptMetadata(scriptText || simulation?.scriptTemplate || '')
  $: activeApi = simulation?.apis?.find((/** @type {any} */ entry) => entry.id === activeApiId) ?? null
  $: activeProfile = simulation?.workloadProfiles?.find((/** @type {any} */ entry) => entry.id === activeProfileId) ?? null
  $: compatibleProfiles = simulation?.workloadProfiles?.filter((/** @type {any} */ entry) => entry.endpointId === activeApiId) ?? []
  $: readmeContent = simulation ? `# ${simulation.title}\n\n${simulation.summary}\n\n## APIs\n${simulation.apis?.map((/** @type {any} */ a) => `- ${a.label}: ${a.method} ${a.path}`).join('\n') ?? ''}\n\n## Workload Profiles\n${simulation.workloadProfiles?.map((/** @type {any} */ p) => `- ${p.label} (${p.rps} rps)`).join('\n') ?? ''}` : ''
  $: legacyMigrationFiles = session ? [
    ...(session.diagramText ? [{ path: SIMULATION_PATHS.topology, value: session.diagramText }] : []),
    ...(session.scriptText ? [{ path: SIMULATION_PATHS.overrides, value: session.scriptText }] : [])
  ] : []

  /** @param {string} id */
  function configPath(id) {
    return `config/${id}.json`
  }

  $: seedFiles = simulation ? buildSeedFiles() : []
  $: editorSnippetActions = [
    ...flowGraphCompletions.map((item) => ({
      label: item.label,
      insertText: item.insertText,
      fileId: SIMULATION_PATHS.topology
    })),
    ...simulationScriptCompletions.map((item) => ({
      label: item.label,
      insertText: item.insertText,
      fileId: SIMULATION_PATHS.overrides
    }))
  ]
  $: resultsText = buildResultsText(latestRun) ?? 'Click ▶ Run to execute the simulation and see metrics here.'

  $: if (simulation && hydratedLessonId !== lesson.id) {
    hydratedLessonId = lesson.id
    workspaceReady = false
    activeApiId = session?.activeApiId ?? simulation.workloadProfiles?.[0]?.endpointId ?? simulation.apis?.[0]?.id ?? ''
    activeProfileId = session?.activeProfileId ?? simulation.workloadProfiles?.find((/** @type {any} */ entry) => entry.endpointId === activeApiId)?.id ?? simulation.workloadProfiles?.[0]?.id ?? ''
    diagramText = session?.diagramText ?? simulation.starterDiagram
    scriptText = session?.scriptText ?? simulation.scriptTemplate
    layoutJson = '{}'
    latestRun = session?.lastRun ?? null
  }

  $: if (activeApiId && compatibleProfiles.length && !compatibleProfiles.some((/** @type {any} */ entry) => entry.id === activeProfileId)) {
    activeProfileId = compatibleProfiles[0].id
  }

  function buildSeedFiles() {
    if (!simulation) return []
    return [
      createSeedFile({
        path: SIMULATION_PATHS.topology,
        value: simulation.starterDiagram,
        language: FLOW_GRAPH_LANGUAGE
      }),
      createSeedFile({
        path: SIMULATION_PATHS.overrides,
        value: simulation.scriptTemplate,
        language: 'typescript'
      }),
      createSeedFile({
        path: SIMULATION_PATHS.layout,
        value: '{}',
        language: 'json'
      }),
      createSeedFile({
        path: activeApi ? configPath(activeApi.id) : 'config/api.json',
        value: activeApi ? JSON.stringify(activeApi, null, 2) : '{}',
        readOnly: true,
        language: 'json'
      }),
      createSeedFile({
        path: activeProfile ? configPath(activeProfile.id) : 'config/profile.json',
        value: activeProfile ? JSON.stringify(activeProfile, null, 2) : '{}',
        readOnly: true,
        language: 'json'
      }),
      createSeedFile({
        path: 'README.md',
        value: readmeContent,
        readOnly: true,
        language: 'markdown'
      })
    ]
  }

  /** @param {CustomEvent} event */
  function handleWorkspaceHydrated(event) {
    syncFromWorkspaceFiles(event.detail.files ?? ideWorkspace?.getWorkspaceFiles?.() ?? [])
    workspaceReady = true
  }

  /** @param {any[]} files */
  function syncFromWorkspaceFiles(files) {
    diagramText = findFileByPath(files, SIMULATION_PATHS.topology)?.value ?? diagramText
    scriptText = findFileByPath(files, SIMULATION_PATHS.overrides)?.value ?? scriptText
    layoutJson = findFileByPath(files, SIMULATION_PATHS.layout)?.value ?? layoutJson
  }

  /** @param {CustomEvent<{ files: any[] }>} event */
  function syncEditorFiles(event) {
    if (lastChangeSource === 'builder') {
      lastChangeSource = 'editor'
      return
    }
    syncFromWorkspaceFiles(event.detail.files ?? [])
  }

  /** @param {{ diagramText: string, layoutJson: string }} detail */
  function handleTopologyBuilderChange(detail) {
    const { diagramText: nextDiagram, layoutJson: nextLayout } = detail
    if (!nextDiagram) return
    lastChangeSource = 'builder'
    diagramText = nextDiagram
    layoutJson = nextLayout ?? layoutJson
    ideWorkspace?.updateFileByPath?.(SIMULATION_PATHS.topology, nextDiagram)
    if (nextLayout !== undefined) {
      ideWorkspace?.updateFileByPath?.(SIMULATION_PATHS.layout, nextLayout)
    }
  }

  /** @param {any} run */
  function buildResultsText(run) {
    if (!run) return null
    if (!run.ok) {
      return `❌ Simulation blocked\n\n${run.errors?.join('\n') ?? 'Unknown error'}`
    }
    let output = `✅ Simulation complete\n`
    output += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`
    output += `API: ${activeApi?.label ?? ''} | Profile: ${activeProfile?.label ?? ''}\n\n`
    output += `📊 METRICS\n`
    output += `  Request rate:      ${formatNumber(run.overall.requestRps)} rps\n`
    output += `  Average latency:   ${formatNumber(run.overall.averageLatencyMs)} ms\n`
    output += `  p95 latency:       ${formatNumber(run.overall.p95LatencyMs)} ms\n`
    output += `  p99 latency:       ${formatNumber(run.overall.p99LatencyMs)} ms\n`
    output += `  Error rate:        ${formatPercent(run.overall.errorRate)}\n`
    output += `  Dropped traffic:   ${formatNumber(run.overall.droppedRps)} rps\n`
    output += `  Retry amplification: ${formatNumber(run.overall.retryAmplification)}x\n\n`
    if (run.nodeMetrics?.length) {
      output += `📦 NODE METRICS\n`
      for (const node of run.nodeMetrics) {
        output += `  ┌─ ${node.label} (${node.type})\n`
        output += `  │  Utilization: ${formatPercent(node.utilization)} | Traffic: ${formatNumber(node.requestsRps)} rps\n`
        output += `  │  Latency: ${formatNumber(node.avgLatencyMs)} ms | Errors: ${formatPercent(node.errorRate)}\n`
        output += `  └─ Queue: ${formatNumber(node.queueDepth)} | Dropped: ${formatNumber(node.droppedRps)} rps\n\n`
      }
    }
    if (run.findings?.length) {
      output += `⚠️  FINDINGS\n`
      for (const finding of run.findings) {
        output += `  [${finding.severity}] ${finding.title}\n`
        output += `  ${finding.summary}\n`
        for (const fix of finding.fixes ?? []) {
          output += `    → ${fix}\n`
        }
        output += `\n`
      }
    }
    return output
  }

  function runCurrentSimulation() {
    if (!simulation || !activeApiId || !activeProfileId) return
    latestRun = runSimulation({
      scenario: simulation,
      diagramText,
      apiId: activeApiId,
      profileId: activeProfileId,
      scriptText
    })
    saveSession()
  }

  function saveSession() {
    if (!simulation) return
    simulationSessions.saveSession(lesson.id, {
      activeApiId,
      activeProfileId,
      lastRun: latestRun
    })
  }

  async function resetSession() {
    if (!simulation) return
    activeApiId = simulation.workloadProfiles?.[0]?.endpointId ?? simulation.apis?.[0]?.id ?? ''
    activeProfileId = simulation.workloadProfiles?.find((/** @type {any} */ entry) => entry.endpointId === activeApiId)?.id ?? simulation.workloadProfiles?.[0]?.id ?? ''
    diagramText = simulation.starterDiagram
    scriptText = simulation.scriptTemplate
    layoutJson = '{}'
    latestRun = null
    simulationSessions.clearSession(lesson.id)
    await resetWorkspace(workspaceId, buildSeedFiles())
    workspaceReady = false
  }

  /** @param {number | undefined} value */
  function formatPercent(value) {
    if (value === undefined || value === null) return '—'
    return `${Math.round(value * 100)}%`
  }

  /** @param {number | undefined} value */
  function formatNumber(value) {
    if (value === undefined || value === null) return '—'
    return Intl.NumberFormat('en-US', { maximumFractionDigits: value >= 100 ? 0 : 2 }).format(value)
  }

  function syncFullscreenState() {
    if (!browser) return
    isFullscreen = document.fullscreenElement === fullscreenShell || overlayFullscreen
  }

  async function toggleFullscreen() {
    if (!browser || !fullscreenShell) return
    try {
      if (document.fullscreenElement === fullscreenShell) {
        await document.exitFullscreen()
        overlayFullscreen = false
      } else if (typeof fullscreenShell.requestFullscreen === 'function') {
        await fullscreenShell.requestFullscreen()
        overlayFullscreen = false
      } else {
        overlayFullscreen = !overlayFullscreen
      }
    } catch {
      overlayFullscreen = !overlayFullscreen
    }
    syncFullscreenState()
  }

  /** @param {KeyboardEvent} event */
  function handleFullscreenKeydown(event) {
    if (event.key !== 'Escape' || !overlayFullscreen) return
    overlayFullscreen = false
    syncFullscreenState()
  }

  onMount(() => {
    if (!browser) return
    document.addEventListener('fullscreenchange', syncFullscreenState)
  })

  onDestroy(() => {
    if (!browser) return
    document.removeEventListener('fullscreenchange', syncFullscreenState)
    if (document.fullscreenElement === fullscreenShell) {
      void document.exitFullscreen()
    }
  })

  $: commandActions = [
    {
      id: 'run-simulation',
      label: 'Simulation: Run current scenario',
      run: runCurrentSimulation
    },
    {
      id: 'save-simulation',
      label: 'Simulation: Save current scenario',
      run: saveSession
    },
    {
      id: 'reset-simulation',
      label: 'Simulation: Reset current scenario',
      run: resetSession
    },
    {
      id: 'toggle-simulation-fullscreen',
      label: isFullscreen ? 'Simulation: Exit full screen' : 'Simulation: Enter full screen',
      run: toggleFullscreen
    }
  ]
</script>

<svelte:window onkeydown={handleFullscreenKeydown} />

{#if simulation}
  <section class="simulation-ide-section">
    <div
      class="simulation-ide-shell"
      class:is-fullscreen={isFullscreen}
      bind:this={fullscreenShell}
    >
    <div class="simulation-ide-header">
      <div>
        <p class="eyebrow">Simulation lab</p>
        <h2>{simulation.title}</h2>
        <p class="practice-copy">{simulation.summary}</p>
      </div>
      <div class="simulation-ide-controls">
        <div class="simulation-ide-config">
          <label class="simulation-ide-select">
            <span>API</span>
            <select bind:value={activeApiId}>
              {#each simulation.apis as api}
                <option value={api.id}>{api.label}</option>
              {/each}
            </select>
          </label>
          <label class="simulation-ide-select">
            <span>Profile</span>
            <select bind:value={activeProfileId}>
              {#each compatibleProfiles as profile}
                <option value={profile.id}>{profile.label}</option>
              {/each}
            </select>
          </label>
        </div>
        <div class="simulation-ide-actions">
          <button class="ide-run-btn" type="button" onclick={runCurrentSimulation}>
            ▶ Run
          </button>
          <button class="ide-save-btn" type="button" onclick={saveSession}>Save</button>
          <button class="ide-reset-btn" type="button" onclick={resetSession}>Reset</button>
          <button
            class="ide-fullscreen-btn"
            type="button"
            title={isFullscreen ? 'Exit full screen (Esc)' : 'Enter full screen'}
            aria-pressed={isFullscreen}
            onclick={toggleFullscreen}
          >
            <span class="ide-fullscreen-icon">{@html codiconSvg(isFullscreen ? 'fullscreen-exit' : 'fullscreen')}</span>
            <span>{isFullscreen ? 'Exit' : 'Full screen'}</span>
          </button>
        </div>
      </div>
    </div>

    <div id="simulation-lab" class="simulation-ide-workspace">
    <IDEWorkspace
      bind:this={ideWorkspace}
      files={seedFiles}
      {workspaceId}
      legacyFiles={legacyMigrationFiles}
      explorerTitle="EXPLORER"
      projectName={simulation.title.toUpperCase().slice(0, 24)}
      sidebarHelpersTitle="NODE HELPERS"
      previewItemsByFile={{
        [SIMULATION_PATHS.topology]: diagramMetadata.previewItems,
        [SIMULATION_PATHS.overrides]: scriptMetadata.previewItems
      }}
      markersByFile={{
        [SIMULATION_PATHS.topology]: diagramMetadata.markers,
        [SIMULATION_PATHS.overrides]: scriptMetadata.markers
      }}
      summaryByFile={{
        [SIMULATION_PATHS.topology]: diagramMetadata.summary,
        [SIMULATION_PATHS.overrides]: scriptMetadata.summary
      }}
      snippetActions={editorSnippetActions}
      {commandActions}
      sidePanelEyebrow="TOPOLOGY"
      sidePanelTitle="Interactive diagram"
      sidePanelDescription="Edit visually or in topology.flow."
      previewContent="topology"
      resultsContent={resultsText}
      on:workspacehydrated={handleWorkspaceHydrated}
      on:fileschange={syncEditorFiles}
    >
      <div slot="preview" class="topology-panel-slot">
        <TopologyBuilder
          diagramText={diagramText || simulation.starterDiagram}
          layoutJson={layoutJson}
          compileErrors={compilePreview?.errors ?? []}
          onDiagramChange={handleTopologyBuilderChange}
        />
      </div>
      <div slot="results">
        {#if resultsText}
          <pre class="ide-terminal-output">{resultsText}</pre>
        {/if}
      </div>
    </IDEWorkspace>
    </div>
    </div>
  </section>
{/if}

<style>
  .simulation-ide-section {
    display: grid;
    gap: 1rem;
  }

  .simulation-ide-workspace {
    scroll-margin-top: 5.5rem;
  }

  .simulation-ide-shell {
    display: grid;
    gap: 1rem;
  }

  .simulation-ide-shell:fullscreen,
  .simulation-ide-shell.is-fullscreen {
    position: fixed;
    inset: 0;
    z-index: 2000;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    padding: 0.75rem;
    background: var(--vscode-editor-bg, #1e1e1e);
    overflow: hidden;
  }

  .simulation-ide-shell:fullscreen .simulation-ide-header,
  .simulation-ide-shell.is-fullscreen .simulation-ide-header {
    flex: 0 0 auto;
  }

  .simulation-ide-shell:fullscreen :global(.ide-workspace),
  .simulation-ide-shell.is-fullscreen :global(.ide-workspace) {
    flex: 1;
    min-height: 0;
    height: auto;
    max-height: none;
    resize: none;
  }

  .simulation-ide-header {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    justify-content: space-between;
    align-items: start;
  }

  .simulation-ide-controls {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
    align-items: end;
  }

  .simulation-ide-config {
    display: flex;
    gap: 0.5rem;
    align-items: end;
  }

  .simulation-ide-select {
    display: grid;
    gap: 0.25rem;
  }

  .simulation-ide-select span {
    font-size: 0.7rem;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    font-weight: 700;
    color: #696cff;
  }

  .simulation-ide-select select {
    border: 1px solid rgba(148, 163, 184, 0.16);
    background: #161922;
    color: #cfd3ec;
    border-radius: 0.6rem;
    padding: 0.5rem 0.75rem;
    font-size: 0.82rem;
    min-width: 120px;
  }

  .simulation-ide-actions {
    display: flex;
    gap: 0.4rem;
  }

  .ide-run-btn,
  .ide-save-btn,
  .ide-reset-btn,
  .ide-fullscreen-btn {
    border-radius: 0.6rem;
    border: 1px solid rgba(148, 163, 184, 0.16);
    padding: 0.5rem 0.9rem;
    font-size: 0.82rem;
    font-weight: 600;
    min-height: 32px;
  }

  .ide-fullscreen-btn {
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    background: #1b1f2a;
    color: #cfd3ec;
    cursor: pointer;
  }

  .ide-fullscreen-btn:hover {
    background: #2a3040;
    color: #eef2ff;
  }

  .ide-fullscreen-icon {
    display: inline-flex;
    width: 1rem;
    height: 1rem;
  }

  .ide-fullscreen-icon :global(svg) {
    display: block;
  }

  .ide-run-btn {
    background: #388a34;
    color: #fff;
    border-color: #388a34;
  }

  .ide-run-btn:hover {
    background: #45a341;
  }

  .ide-save-btn {
    background: rgba(105, 108, 255, 0.14);
    color: #cfd3ec;
  }

  .ide-save-btn:hover {
    background: rgba(105, 108, 255, 0.2);
  }

  .ide-reset-btn {
    background: transparent;
    color: #8b8fa7;
  }

  .ide-reset-btn:hover {
    color: #cfd3ec;
    background: rgba(148, 163, 184, 0.08);
  }

  .topology-panel-slot {
    height: 100%;
    min-height: 18rem;
  }

  .topology-panel-slot :global(.topology-builder) {
    height: 100%;
  }

  :global(.ide-terminal-output) {
    margin: 0;
    color: #ccc;
    font-family: 'JetBrains Mono', 'Fira Code', ui-monospace, monospace;
    font-size: 0.82rem;
    line-height: 1.5;
    white-space: pre-wrap;
  }
</style>
