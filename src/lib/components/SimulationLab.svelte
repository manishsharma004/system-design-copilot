<svelte:options runes={false} />
<script>
  import CodeEditor from '$lib/components/CodeEditor.svelte'
  import { listBrowserRuntimes } from '$lib/browserRuntimes'
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
  let browserRuntimes = listBrowserRuntimes()

  $: simulation = lesson?.simulation ?? null
  $: sessions = $simulationSessions
  $: session = simulation ? sessions[lesson.id] ?? null : null
  $: compilePreview = simulation ? compileFlowGraph(diagramText || simulation.starterDiagram) : null
  $: diagramMetadata = buildFlowGraphMetadata(diagramText || simulation?.starterDiagram || '')
  $: scriptMetadata = buildSimulationScriptMetadata(scriptText || simulation?.scriptTemplate || '')
  $: activeApi = simulation?.apis?.find((/** @type {any} */ entry) => entry.id === activeApiId) ?? null
  $: activeProfile = simulation?.workloadProfiles?.find((/** @type {any} */ entry) => entry.id === activeProfileId) ?? null
  $: compatibleProfiles = simulation?.workloadProfiles?.filter((/** @type {any} */ entry) => entry.endpointId === activeApiId) ?? []
  $: editorFiles = [
    {
      id: 'diagram',
      label: 'topology.flow',
      filename: 'topology.flow',
      language: FLOW_GRAPH_LANGUAGE,
      value: diagramText
    },
    {
      id: 'script',
      label: 'overrides.ts',
      filename: 'overrides.ts',
      language: 'typescript',
      value: scriptText
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
</script>

{#if simulation}
  <section class="panel hero-card simulation-lab">
    <div class="topic-lab-header">
      <div>
        <p class="eyebrow">Simulation lab</p>
        <h2>{simulation.title}</h2>
        <p class="practice-copy">{simulation.summary}</p>
      </div>
      <div class="topic-pill-group">
        {#each simulation.whyItMatters as item}
          <span class="pill">{item}</span>
        {/each}
      </div>
    </div>

    <div class="simulation-layout">
      <div class="simulation-stack">
        <article class="content-card topic-detail-card">
          <p class="eyebrow">Choose an API path</p>
          <h3>Which flow are you stressing?</h3>
          <div class="topic-option-list">
            {#each simulation.apis as api}
              <button
                class:active={activeApiId === api.id}
                class="topic-option"
                type="button"
                onclick={() => (activeApiId = api.id)}
              >
                <strong>{api.label}</strong>
                <span>{api.summary}</span>
              </button>
            {/each}
          </div>
          {#if activeApi}
            <div class="topic-detail-section">
              <h4>Focus metrics</h4>
              <ul>
                {#each activeApi.focusMetrics ?? [] as metric}
                  <li>{metric}</li>
                {/each}
              </ul>
            </div>
          {/if}
        </article>

        <article class="content-card topic-detail-card">
          <p class="eyebrow">Workload profile</p>
          <h3>Traffic shape</h3>
          <div class="topic-option-list">
            {#each compatibleProfiles as profile}
              <button
                class:active={activeProfileId === profile.id}
                class="topic-option"
                type="button"
                onclick={() => (activeProfileId = profile.id)}
              >
                <strong>{profile.label}</strong>
                <span>{profile.description}</span>
              </button>
            {/each}
          </div>
        </article>

        <article class="content-card simulation-editor-card">
          <div class="practice-card-header">
            <div>
              <p class="eyebrow">Exercise workspace</p>
              <h3>Multi-file topology and override editor</h3>
            </div>
            <span class="pill">{compilePreview?.nodes?.length ?? 0} nodes</span>
          </div>
          <p class="practice-copy">Use file tabs, code completion, inline previews, and diagnostics to tune the topology and scripted overrides without leaving the browser.</p>
          <CodeEditor
            files={editorFiles}
            minHeight="25rem"
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
            runtimeHints={browserRuntimes}
            snippetActions={editorSnippetActions}
            on:fileschange={syncEditorFiles}
          />
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
          {#if compilePreview?.warnings?.length || scriptMetadata.markers.length}
            <div class="simulation-note">
              <p class="eyebrow">Compiler notes</p>
              <ul>
                {#each compilePreview.warnings as warning}
                  <li>{warning}</li>
                {/each}
                {#each scriptMetadata.markers as marker}
                  <li>{marker.message}</li>
                {/each}
              </ul>
            </div>
          {/if}
        </article>

        <article class="content-card simulation-editor-card">
          <div class="practice-card-header">
            <div>
              <p class="eyebrow">Built-in runtime adapters</p>
              <h3>Browser and WebAssembly execution targets</h3>
            </div>
            <span class="pill">No eval</span>
          </div>
          <p class="practice-copy">The simulator runs its DSL interpreters in-browser today and now exposes adapter slots for WebAssembly-backed runtimes like Pyodide or custom interpreters.</p>
          <div class="simulation-node-grid">
            {#each browserRuntimes as runtime}
              <article class="simulation-node-card">
                <strong>{runtime.label}</strong>
                <p>{runtime.summary}</p>
                <span class="pill">{runtime.available ? 'Available now' : 'Register adapter'}</span>
              </article>
            {/each}
          </div>
          <div class="topic-detail-section">
            <h4>Good first experiments</h4>
            <ul>
              {#each simulation.recommendationThemes as theme}
                <li>{theme}</li>
              {/each}
            </ul>
          </div>
        </article>

        <div class="action-row">
          <button class="action-link primary" type="button" onclick={runCurrentSimulation}>Run simulation</button>
          <button class="action-link" type="button" onclick={saveSession}>Save lab locally</button>
          <button class="reset-link" type="button" onclick={resetSession}>Reset scenario</button>
        </div>
      </div>

      <div class="simulation-stack">
        <MermaidDiagram
          diagram={{
            title: 'Compiled simulation topology',
            caption: 'This preview is generated from the current flow-graph input.',
            code: latestRun?.mermaid ?? compilePreview?.mermaid
          }}
        />

        <article class="list-card">
          <p class="eyebrow">API modeling notes</p>
          <h3>How this simulator thinks</h3>
          <ul>
            {#each simulation.apiNotes as note}
              <li>{note}</li>
            {/each}
          </ul>
        </article>

        {#if latestRun}
          {#if latestRun.ok}
            <article class="content-card simulation-summary-card">
              <p class="eyebrow">Run summary</p>
              <h3>{activeApi?.label} under {activeProfile?.label?.toLowerCase()}</h3>
              <div class="simulation-metric-grid">
                <div class="stat">
                  <span class="eyebrow">Request rate</span>
                  <strong>{formatNumber(latestRun.overall.requestRps)} rps</strong>
                </div>
                <div class="stat">
                  <span class="eyebrow">Average latency</span>
                  <strong>{formatNumber(latestRun.overall.averageLatencyMs)} ms</strong>
                </div>
                <div class="stat">
                  <span class="eyebrow">p95 / p99</span>
                  <strong>{formatNumber(latestRun.overall.p95LatencyMs)} / {formatNumber(latestRun.overall.p99LatencyMs)} ms</strong>
                </div>
                <div class="stat">
                  <span class="eyebrow">Error rate</span>
                  <strong>{formatPercent(latestRun.overall.errorRate)}</strong>
                </div>
                <div class="stat">
                  <span class="eyebrow">Dropped traffic</span>
                  <strong>{formatNumber(latestRun.overall.droppedRps)} rps</strong>
                </div>
                <div class="stat">
                  <span class="eyebrow">Retry amplification</span>
                  <strong>{formatNumber(latestRun.overall.retryAmplification)}x</strong>
                </div>
              </div>
            </article>

            <article class="content-card topic-detail-card">
              <p class="eyebrow">Probable fixes</p>
              <h3>What the current bottlenecks suggest</h3>
              {#if latestRun.findings.length}
                <div class="simulation-findings">
                  {#each latestRun.findings as finding}
                    <article class="simulation-note" class:danger={finding.severity === 'high'}>
                      <p class="eyebrow">{finding.severity} signal</p>
                      <h4>{finding.title}</h4>
                      <p>{finding.summary}</p>
                      <ul>
                        {#each finding.fixes as fix}
                          <li>{fix}</li>
                        {/each}
                      </ul>
                    </article>
                  {/each}
                </div>
              {:else}
                <p class="practice-copy">The current topology still has headroom. Push the load or inject failures to surface trade-offs.</p>
              {/if}
            </article>

            <article class="content-card topic-detail-card">
              <p class="eyebrow">Component metrics</p>
              <h3>Which node breaks first?</h3>
              <div class="simulation-node-grid">
                {#each latestRun.nodeMetrics as node}
                  <article class="simulation-node-card">
                    <div class="practice-card-header">
                      <div>
                        <strong>{node.label}</strong>
                        <p class="muted">{node.type}</p>
                      </div>
                      <span class="pill">{formatPercent(node.utilization)}</span>
                    </div>
                    <ul>
                      <li>Traffic: {formatNumber(node.requestsRps)} rps</li>
                      <li>Latency: {formatNumber(node.avgLatencyMs)} ms</li>
                      <li>Error rate: {formatPercent(node.errorRate)}</li>
                      <li>Queue depth: {formatNumber(node.queueDepth)}</li>
                      <li>Dropped: {formatNumber(node.droppedRps)} rps</li>
                      {#if node.hitRate !== undefined}
                        <li>Hit rate: {formatPercent(node.hitRate)}</li>
                      {/if}
                    </ul>
                  </article>
                {/each}
              </div>
            </article>
          {:else}
            <article class="simulation-note danger">
              <p class="eyebrow">Simulation blocked</p>
              <h3>Fix these issues first</h3>
              <ul>
                {#each latestRun.errors as error}
                  <li>{error}</li>
                {/each}
              </ul>
            </article>
          {/if}
        {:else}
          <article class="list-card">
            <p class="eyebrow">What you get after a run</p>
            <h3>Simulation output</h3>
            <ul>
              <li>Per-node utilization, queue depth, and dropped traffic</li>
              <li>Average, p95, and p99 latency for the selected API path</li>
              <li>Probable fixes mapped to the dominant bottleneck</li>
            </ul>
          </article>
        {/if}
      </div>
    </div>
  </section>
{/if}
