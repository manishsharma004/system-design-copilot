<svelte:options runes={false} />
<script>
  import IDEWorkspace from '$lib/components/IDEWorkspace.svelte'
  import MermaidDiagram from '$lib/components/MermaidDiagram.svelte'
  import {
    FLOW_GRAPH_LANGUAGE,
    buildFlowGraphMetadata,
    buildSimulationScriptMetadata,
    flowGraphCompletions,
    simulationScriptCompletions
  } from '$lib/editor/exerciseMetadata'
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
  let hydratedLessonId = ''
  /** @type {any} */
  let latestRun = null
  let editorFiles = []

  $: simulation = lesson?.simulation ?? null
  $: sessions = $simulationSessions
  $: session = simulation ? sessions[lesson.id] ?? null : null
  $: compilePreview = simulation ? compileFlowGraph(diagramText || simulation.starterDiagram) : null
  $: diagramMetadata = buildFlowGraphMetadata(diagramText || simulation?.starterDiagram || '')
  $: scriptMetadata = buildSimulationScriptMetadata(scriptText || simulation?.scriptTemplate || '')
  $: activeApi = simulation?.apis?.find((/** @type {any} */ entry) => entry.id === activeApiId) ?? null
  $: activeProfile = simulation?.workloadProfiles?.find((/** @type {any} */ entry) => entry.id === activeProfileId) ?? null
  $: compatibleProfiles = simulation?.workloadProfiles?.filter((/** @type {any} */ entry) => entry.endpointId === activeApiId) ?? []
  $: readmeContent = simulation ? `# ${simulation.title}\n\n${simulation.summary}\n\n## APIs\n${simulation.apis?.map((/** @type {any} */ a) => `- ${a.label}: ${a.method} ${a.path}`).join('\n') ?? ''}\n\n## Workload Profiles\n${simulation.workloadProfiles?.map((/** @type {any} */ p) => `- ${p.label} (${p.rps} rps)`).join('\n') ?? ''}` : ''
  $: apiConfigContent = activeApi ? JSON.stringify(activeApi, null, 2) : '{}'
  $: profileConfigContent = activeProfile ? JSON.stringify(activeProfile, null, 2) : '{}'
  $: editorFiles = [
    {
      id: 'diagram',
      label: 'topology.flow',
      filename: 'topology.flow',
      path: 'src/topology.flow',
      language: FLOW_GRAPH_LANGUAGE,
      icon: '🔷',
      value: diagramText
    },
    {
      id: 'script',
      label: 'overrides.ts',
      filename: 'overrides.ts',
      path: 'src/overrides.ts',
      language: 'typescript',
      icon: '📘',
      value: scriptText
    },
    {
      id: '_api_config',
      label: `${activeApi?.label ?? 'api'}.json`,
      filename: `${activeApi?.label ?? 'api'}.json`,
      path: `config/${activeApi?.label ?? 'api'}.json`,
      language: 'json',
      icon: '⚙',
      persistContent: false,
      value: apiConfigContent
    },
    {
      id: '_profile_config',
      label: `${activeProfile?.label ?? 'profile'}.json`,
      filename: `${activeProfile?.label ?? 'profile'}.json`,
      path: `config/${activeProfile?.label ?? 'profile'}.json`,
      language: 'json',
      icon: '⚙',
      persistContent: false,
      value: profileConfigContent
    },
    {
      id: '_readme',
      label: 'README.md',
      filename: 'README.md',
      path: 'README.md',
      language: 'markdown',
      icon: '📝',
      persistContent: false,
      value: readmeContent
    }
  ]
  $: editorSnippetActions = [
    ...flowGraphCompletions.map((item) => ({
      label: item.label,
      insertText: item.insertText,
      fileId: 'diagram'
    })),
    ...simulationScriptCompletions.map((item) => ({
      label: item.label,
      insertText: item.insertText,
      fileId: 'script'
    }))
  ]
  $: explorerNodes = buildExplorerNodes()
  $: resultsText = buildResultsText(latestRun) ?? 'Click ▶ Run to execute the simulation and see metrics here.'

  $: if (simulation && hydratedLessonId !== lesson.id) {
    hydratedLessonId = lesson.id
    activeApiId = session?.activeApiId ?? simulation.workloadProfiles?.[0]?.endpointId ?? simulation.apis?.[0]?.id ?? ''
    activeProfileId = session?.activeProfileId ?? simulation.workloadProfiles?.find((/** @type {any} */ entry) => entry.endpointId === activeApiId)?.id ?? simulation.workloadProfiles?.[0]?.id ?? ''
    diagramText = session?.diagramText ?? simulation.starterDiagram
    scriptText = session?.scriptText ?? simulation.scriptTemplate
    latestRun = session?.lastRun ?? null
  }

  $: if (activeApiId && compatibleProfiles.length && !compatibleProfiles.some((/** @type {any} */ entry) => entry.id === activeProfileId)) {
    activeProfileId = compatibleProfiles[0].id
  }

  function buildExplorerNodes() {
    if (!simulation) return []
    return [
      {
        type: 'folder',
        id: 'src',
        label: 'src',
        children: [
          { id: 'diagram', label: 'topology.flow', icon: '🔷', badge: 'M' },
          { id: 'script', label: 'overrides.ts', icon: '📘', badge: '' }
        ]
      },
      {
        type: 'folder',
        id: 'config',
        label: 'config',
        children: [
          { id: '_api_config', label: `${activeApi?.label ?? 'api'}.json`, icon: '⚙️' },
          { id: '_profile_config', label: `${activeProfile?.label ?? 'profile'}.json`, icon: '⚙️' }
        ]
      },
      { type: 'file', id: '_readme', label: 'README.md', icon: 'ℹ️' }
    ]
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
      diagramText,
      scriptText,
      lastRun: latestRun
    })
  }

  function resetSession() {
    if (!simulation) return
    activeApiId = simulation.workloadProfiles?.[0]?.endpointId ?? simulation.apis?.[0]?.id ?? ''
    activeProfileId = simulation.workloadProfiles?.find((/** @type {any} */ entry) => entry.endpointId === activeApiId)?.id ?? simulation.workloadProfiles?.[0]?.id ?? ''
    diagramText = simulation.starterDiagram
    scriptText = simulation.scriptTemplate
    latestRun = null
    simulationSessions.clearSession(lesson.id)
  }

  /** @param {CustomEvent<{ files: { id: string, value: string }[] }>} event */
  function syncEditorFiles(event) {
    const nextFiles = event.detail.files ?? []
    diagramText = nextFiles.find((file) => file.id === 'diagram')?.value ?? diagramText
    scriptText = nextFiles.find((file) => file.id === 'script')?.value ?? scriptText
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
    }
  ]
</script>

{#if simulation}
  <section class="simulation-ide-section">
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
        </div>
      </div>
    </div>

    <IDEWorkspace
      workspaceId={`simulation:${lesson.id}`}
      files={editorFiles}
      explorerTitle="EXPLORER"
      projectName={simulation.title.toUpperCase().slice(0, 24)}
      {explorerNodes}
      sidebarHelpersTitle="NODE HELPERS"
      previewItemsByFile={{
        diagram: diagramMetadata.previewItems,
        script: scriptMetadata.previewItems
      }}
      markersByFile={{
        diagram: diagramMetadata.markers,
        script: scriptMetadata.markers
      }}
      summaryByFile={{
        diagram: diagramMetadata.summary,
        script: scriptMetadata.summary
      }}
      snippetActions={editorSnippetActions}
      {commandActions}
      sidePanelEyebrow="INTERACTIVE DIAGRAM"
      sidePanelTitle="Compiled topology"
      sidePanelDescription="Generated from current flow-graph."
      previewContent={compilePreview?.mermaid || latestRun?.mermaid ? 'diagram' : null}
      resultsContent={resultsText}
      on:fileschange={syncEditorFiles}
    >
      <div slot="preview">
        <MermaidDiagram
          variant="extension"
          diagram={{
            title: 'Compiled topology',
            caption: 'Generated from current flow-graph.',
            code: latestRun?.mermaid ?? compilePreview?.mermaid
          }}
        />
      </div>
      <div slot="results">
        {#if resultsText}
          <pre class="ide-terminal-output">{resultsText}</pre>
        {/if}
      </div>
    </IDEWorkspace>

    {#if compilePreview?.errors?.length}
      <div class="simulation-note danger">
        <p class="eyebrow">Topology issues</p>
        <ul>
          {#each compilePreview.errors as error}
            <li>{error}</li>
          {/each}
        </ul>
      </div>
    {/if}
  </section>
{/if}

<style>
  .simulation-ide-section {
    display: grid;
    gap: 1rem;
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
  .ide-reset-btn {
    border-radius: 0.6rem;
    border: 1px solid rgba(148, 163, 184, 0.16);
    padding: 0.5rem 0.9rem;
    font-size: 0.82rem;
    font-weight: 600;
    min-height: 32px;
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

  :global(.ide-terminal-output) {
    margin: 0;
    color: #ccc;
    font-family: 'JetBrains Mono', 'Fira Code', ui-monospace, monospace;
    font-size: 0.82rem;
    line-height: 1.5;
    white-space: pre-wrap;
  }
</style>
