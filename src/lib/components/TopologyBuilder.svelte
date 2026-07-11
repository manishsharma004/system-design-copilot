<svelte:options runes={false} />
<script>
  import { createEventDispatcher, onMount } from 'svelte'
  import { codiconSvg } from '$lib/editor/codicons'
  import {
    applyLayout,
    autoLayout,
    compileFlowGraph,
    extractLayout,
    serializeFlowGraph
  } from '$lib/simulation/graphCompiler'

  export let diagramText = ''
  export let layoutJson = '{}'
  /** @type {string[]} */
  export let compileErrors = []
  /** @type {((detail: { diagramText: string, layoutJson: string }) => void) | null} */
  export let onDiagramChange = null

  const dispatch = createEventDispatcher()

  const NODE_TYPES = [
    { id: 'edge', label: 'edge' },
    { id: 'service', label: 'service' },
    { id: 'cache', label: 'cache' },
    { id: 'database', label: 'database' },
    { id: 'queue', label: 'queue' },
    { id: 'worker', label: 'worker' }
  ]

  const NODE_WIDTH = 150
  const NODE_HEIGHT = 56

  /** @type {'select' | 'connect' | 'pan'} */
  let mode = 'select'
  let selectedNodeId = ''
  let selectedLinkKey = ''
  let connectSourceId = ''
  let pendingNodeType = ''
  let panX = 0
  let panY = 0
  let zoom = 1
  let draggingNodeId = ''
  let dragOffsetX = 0
  let dragOffsetY = 0
  let panning = false
  let panStartX = 0
  let panStartY = 0
  let panOriginX = 0
  let panOriginY = 0
  let propertiesOpen = true
  let canvasEl
  let lastDiagramText = diagramText

  $: compiled = compileFlowGraph(diagramText || '')
  $: parsedLayout = parseLayoutJson(layoutJson)
  $: layout = mergeLayouts(parsedLayout, compiled)
  $: graph = applyLayout(compiled.errors.length ? lastValidGraph : compiled, layout)
  $: nodes = graph.nodes ?? []
  $: links = graph.links ?? []
  $: selectedNode = nodes.find((node) => node.id === selectedNodeId) ?? null
  $: displayErrors = compileErrors.length ? compileErrors : compiled.errors

  /** @type {{ nodes: any[], links: any[] }} */
  let lastValidGraph = { nodes: [], links: [] }

  $: if (!compiled.errors.length && compiled.nodes.length) {
    lastValidGraph = compiled
    lastDiagramText = diagramText
  }

  /** @param {string} value */
  function parseLayoutJson(value) {
    try {
      const parsed = JSON.parse(value || '{}')
      return parsed && typeof parsed === 'object' ? parsed : {}
    } catch {
      return {}
    }
  }

  /** @param {Record<string, { x?: number, y?: number }>} saved @param {any} graphResult */
  function mergeLayouts(saved, graphResult) {
    const auto = autoLayout(graphResult)
    return { ...auto, ...saved }
  }

  /** @param {{ diagramText?: string, layoutJson?: string }} patch */
  function emitChange(patch = {}) {
    const detail = {
      diagramText: patch.diagramText ?? diagramText,
      layoutJson: patch.layoutJson ?? layoutJson
    }
    dispatch('change', detail)
    onDiagramChange?.(detail)
  }

  /** @param {string} type */
  function armNodeType(type) {
    pendingNodeType = pendingNodeType === type ? '' : type
    mode = 'select'
  }

  /** @param {MouseEvent} event */
  function handleCanvasClick(event) {
    if (mode !== 'select' || !pendingNodeType) return
    const point = clientToCanvas(event.clientX, event.clientY)
    addNode(pendingNodeType, point.x, point.y)
    pendingNodeType = ''
  }

  /** @param {string} type @param {number} x @param {number} y */
  function addNode(type, x, y) {
    const baseId = type === 'edge' ? 'entry' : type
    let index = 1
    let id = baseId
    const ids = new Set(nodes.map((node) => node.id))
    while (ids.has(id)) {
      id = `${baseId}-${index}`
      index += 1
    }
    const nextGraph = {
      nodes: [...nodes, {
        id,
        type,
        label: id.split(/[-_]/g).map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(' '),
        latencyMs: 12,
        capacityRps: 20000,
        queueCapacity: 2000,
        errorRate: 0,
        extraLatencyMs: 0
      }],
      links
    }
    const nextLayout = { ...layout, [id]: { x: snap(x - NODE_WIDTH / 2), y: snap(y - NODE_HEIGHT / 2) } }
    emitChange({
      diagramText: serializeFlowGraph(nextGraph),
      layoutJson: JSON.stringify(nextLayout, null, 2)
    })
    selectedNodeId = id
  }

  /** @param {number} value */
  function snap(value) {
    return Math.round(value / 10) * 10
  }

  /** @param {number} clientX @param {number} clientY */
  function clientToCanvas(clientX, clientY) {
    const rect = canvasEl?.getBoundingClientRect()
    if (!rect) return { x: 0, y: 0 }
    return {
      x: (clientX - rect.left - panX) / zoom,
      y: (clientY - rect.top - panY) / zoom
    }
  }

  /** @param {string} nodeId @param {MouseEvent} event */
  function handleNodePointerDown(nodeId, event) {
    event.stopPropagation()
    if (mode === 'connect') {
      if (!connectSourceId) {
        connectSourceId = nodeId
        return
      }
      if (connectSourceId !== nodeId) {
        connectNodes(connectSourceId, nodeId)
      }
      connectSourceId = ''
      return
    }
    if (mode === 'pan') return
    selectedNodeId = nodeId
    selectedLinkKey = ''
    draggingNodeId = nodeId
    const point = clientToCanvas(event.clientX, event.clientY)
    const nodeLayout = layout[nodeId] ?? { x: 0, y: 0 }
    dragOffsetX = point.x - nodeLayout.x
    dragOffsetY = point.y - nodeLayout.y
  }

  /** @param {string} from @param {string} to */
  function connectNodes(from, to) {
    const exists = links.some((link) => link.from === from && link.to === to)
    if (exists) return
    const nextGraph = {
      nodes,
      links: [...links, { from, to, async: false, label: '' }]
    }
    emitChange({ diagramText: serializeFlowGraph(nextGraph) })
  }

  /** @param {PointerEvent} event */
  function handlePointerMove(event) {
    if (draggingNodeId && mode === 'select') {
      const point = clientToCanvas(event.clientX, event.clientY)
      const nextLayout = {
        ...layout,
        [draggingNodeId]: {
          x: snap(point.x - dragOffsetX),
          y: snap(point.y - dragOffsetY)
        }
      }
      layoutJson = JSON.stringify(nextLayout, null, 2)
      return
    }
    if (panning) {
      panX = panOriginX + (event.clientX - panStartX)
      panY = panOriginY + (event.clientY - panStartY)
    }
  }

  function handlePointerUp() {
    if (draggingNodeId) {
      emitChange({ layoutJson })
      draggingNodeId = ''
      return
    }
    panning = false
  }

  /** @param {MouseEvent} event */
  function handleCanvasPointerDown(event) {
    if (mode === 'pan' || event.button === 1) {
      panning = true
      panStartX = event.clientX
      panStartY = event.clientY
      panOriginX = panX
      panOriginY = panY
      return
    }
    if (mode === 'select') {
      selectedNodeId = ''
      selectedLinkKey = ''
    }
  }

  /** @param {WheelEvent} event */
  function handleWheel(event) {
    event.preventDefault()
    const delta = event.deltaY > 0 ? 0.92 : 1.08
    zoom = Math.min(2, Math.max(0.45, zoom * delta))
  }

  function deleteSelection() {
    if (selectedLinkKey) {
      const [from, to] = selectedLinkKey.split('->')
      const nextGraph = {
        nodes,
        links: links.filter((link) => !(link.from === from && link.to === to))
      }
      emitChange({ diagramText: serializeFlowGraph(nextGraph) })
      selectedLinkKey = ''
      return
    }
    if (!selectedNodeId) return
    const nextGraph = {
      nodes: nodes.filter((node) => node.id !== selectedNodeId),
      links: links.filter((link) => link.from !== selectedNodeId && link.to !== selectedNodeId)
    }
    const nextLayout = { ...layout }
    delete nextLayout[selectedNodeId]
    selectedNodeId = ''
    emitChange({
      diagramText: serializeFlowGraph(nextGraph),
      layoutJson: JSON.stringify(nextLayout, null, 2)
    })
  }

  /** @param {string} field @param {string | number | boolean} value */
  function updateSelectedNode(field, value) {
    if (!selectedNode) return
    const nextGraph = {
      nodes: nodes.map((node) => (
        node.id === selectedNode.id ? { ...node, [field]: value } : node
      )),
      links
    }
    emitChange({ diagramText: serializeFlowGraph(nextGraph) })
  }

  /** @param {string} from @param {string} to @param {MouseEvent} event */
  function handleLinkClick(from, to, event) {
    event.stopPropagation()
    selectedLinkKey = `${from}->${to}`
    selectedNodeId = ''
  }

  /** @param {KeyboardEvent} event */
  function handleKeydown(event) {
    if (event.key === 'Delete' || event.key === 'Backspace') {
      if (/** @type {HTMLElement} */ (event.target)?.closest?.('input, select, textarea')) return
      event.preventDefault()
      deleteSelection()
    }
  }

  onMount(() => {
    window.addEventListener('pointermove', handlePointerMove)
    window.addEventListener('pointerup', handlePointerUp)
    return () => {
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('pointerup', handlePointerUp)
    }
  })
</script>

<svelte:window onkeydown={handleKeydown} />

<div class="topology-builder">
  <div class="topology-toolbar">
    <div class="topology-modes">
      <button class="topology-mode" class:active={mode === 'select'} type="button" title="Select" onclick={() => (mode = 'select')}>
        {@html codiconSvg('files')}
      </button>
      <button class="topology-mode" class:active={mode === 'connect'} type="button" title="Connect" onclick={() => { mode = 'connect'; connectSourceId = '' }}>
        {@html codiconSvg('link')}
      </button>
      <button class="topology-mode" class:active={mode === 'pan'} type="button" title="Pan" onclick={() => (mode = 'pan')}>
        {@html codiconSvg('grabber')}
      </button>
      <button class="topology-mode" type="button" title="Delete selection" onclick={deleteSelection}>
        {@html codiconSvg('trash')}
      </button>
    </div>
    <div class="topology-palette">
      {#each NODE_TYPES as nodeType}
        <button
          class="topology-chip"
          class:active={pendingNodeType === nodeType.id}
          type="button"
          onclick={() => armNodeType(nodeType.id)}
        >{nodeType.label}</button>
      {/each}
    </div>
  </div>

  {#if displayErrors.length}
    <div class="topology-problems">
      <span class="topology-problems-badge">{displayErrors.length}</span>
      <span>{displayErrors[0]}</span>
    </div>
  {/if}

  <div
    class="topology-canvas-wrap"
    bind:this={canvasEl}
    onpointerdown={handleCanvasPointerDown}
    onclick={handleCanvasClick}
    onwheel={handleWheel}
  >
    <svg class="topology-canvas" style={`transform: translate(${panX}px, ${panY}px) scale(${zoom});`}>
      <defs>
        <pattern id="topology-grid" width="20" height="20" patternUnits="userSpaceOnUse">
          <circle cx="1" cy="1" r="1" fill="#3c3c3c" />
        </pattern>
        <marker id="arrow" markerWidth="8" markerHeight="8" refX="7" refY="3" orient="auto">
          <path d="M0,0 L8,3 L0,6 Z" fill="#858585" />
        </marker>
      </defs>
      <rect width="4000" height="2400" fill="url(#topology-grid)" />

      {#each links as link}
        {@const from = layout[link.from]}
        {@const to = layout[link.to]}
        {#if from && to}
          {@const x1 = from.x + NODE_WIDTH}
          {@const y1 = from.y + NODE_HEIGHT / 2}
          {@const x2 = to.x}
          {@const y2 = to.y + NODE_HEIGHT / 2}
          <line
            class="topology-link"
            class:selected={selectedLinkKey === `${link.from}->${link.to}`}
            class:async={link.async}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            marker-end="url(#arrow)"
            onclick={(event) => handleLinkClick(link.from, link.to, event)}
          />
        {/if}
      {/each}

      {#each nodes as node}
        {@const pos = layout[node.id] ?? { x: 40, y: 40 }}
        <g
          class="topology-node"
          class:selected={selectedNodeId === node.id}
          class:connect-source={connectSourceId === node.id}
          transform={`translate(${pos.x}, ${pos.y})`}
          onpointerdown={(event) => handleNodePointerDown(node.id, event)}
        >
          <rect width={NODE_WIDTH} height={NODE_HEIGHT} rx="4" />
          <text x="10" y="22" class="topology-node-label">{node.label}</text>
          <text x="10" y="42" class="topology-node-type">{node.type}</text>
        </g>
      {/each}
    </svg>
  </div>

  {#if selectedNode}
    <div class="topology-properties">
      <button class="topology-properties-toggle" type="button" onclick={() => (propertiesOpen = !propertiesOpen)}>
        PROPERTIES
        <span>{propertiesOpen ? '▾' : '▸'}</span>
      </button>
      {#if propertiesOpen}
        <div class="topology-properties-grid">
          <label>
            <span>Label</span>
            <input value={selectedNode.label} oninput={(event) => updateSelectedNode('label', event.currentTarget.value)} />
          </label>
          <label>
            <span>Type</span>
            <select value={selectedNode.type} onchange={(event) => updateSelectedNode('type', event.currentTarget.value)}>
              {#each NODE_TYPES as nodeType}
                <option value={nodeType.id}>{nodeType.label}</option>
              {/each}
            </select>
          </label>
          <label>
            <span>Latency (ms)</span>
            <input type="number" min="1" value={selectedNode.latencyMs} oninput={(event) => updateSelectedNode('latencyMs', Number(event.currentTarget.value))} />
          </label>
          <label>
            <span>Capacity (rps)</span>
            <input type="number" min="1" value={selectedNode.capacityRps} oninput={(event) => updateSelectedNode('capacityRps', Number(event.currentTarget.value))} />
          </label>
          <label>
            <span>Queue</span>
            <input type="number" min="0" value={selectedNode.queueCapacity} oninput={(event) => updateSelectedNode('queueCapacity', Number(event.currentTarget.value))} />
          </label>
          {#if selectedNode.type === 'cache'}
            <label>
              <span>Hit rate</span>
              <input type="number" min="0" max="1" step="0.01" value={selectedNode.hitRate ?? 0.85} oninput={(event) => updateSelectedNode('hitRate', Number(event.currentTarget.value))} />
            </label>
          {/if}
        </div>
      {/if}
    </div>
  {/if}
</div>

<style>
  .topology-builder {
    display: flex;
    flex-direction: column;
    height: 100%;
    min-height: 18rem;
    background: var(--vscode-editor-bg, #1e1e1e);
    color: var(--vscode-foreground, #cccccc);
  }

  .topology-toolbar {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    align-items: center;
    padding: 0.45rem 0.55rem;
    border-bottom: 1px solid var(--vscode-border, #2b2b2b);
    background: var(--vscode-sideBar-bg, #252526);
  }

  .topology-modes {
    display: flex;
    gap: 0.15rem;
  }

  .topology-mode {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    border: none;
    background: transparent;
    color: var(--vscode-descriptionForeground, #858585);
    border-bottom: 2px solid transparent;
    cursor: pointer;
  }

  .topology-mode.active {
    color: var(--vscode-foreground, #cccccc);
    border-bottom-color: var(--vscode-focusBorder, #007acc);
  }

  .topology-palette {
    display: flex;
    flex-wrap: wrap;
    gap: 0.25rem;
  }

  .topology-chip {
    border: 1px solid var(--vscode-border, #2b2b2b);
    background: #2d2d2d;
    color: var(--vscode-foreground, #cccccc);
    border-radius: 2px;
    padding: 0.15rem 0.45rem;
    font-size: 0.68rem;
    cursor: pointer;
  }

  .topology-chip.active {
    border-color: var(--vscode-focusBorder, #007acc);
    background: rgba(0, 122, 204, 0.15);
  }

  .topology-problems {
    display: flex;
    align-items: center;
    gap: 0.45rem;
    padding: 0.35rem 0.55rem;
    background: rgba(255, 76, 81, 0.12);
    border-bottom: 1px solid rgba(255, 76, 81, 0.35);
    font-size: 0.72rem;
  }

  .topology-problems-badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 1.1rem;
    height: 1.1rem;
    border-radius: 999px;
    background: #ff4c51;
    color: #fff;
    font-size: 0.65rem;
    font-weight: 700;
  }

  .topology-canvas-wrap {
    flex: 1;
    overflow: hidden;
    position: relative;
    cursor: crosshair;
  }

  .topology-canvas {
    width: 100%;
    height: 100%;
    transform-origin: 0 0;
  }

  .topology-node rect {
    fill: #2d2d30;
    stroke: #3c3c3c;
    stroke-width: 1;
  }

  .topology-node.selected rect {
    stroke: var(--vscode-focusBorder, #007acc);
    stroke-width: 2;
  }

  .topology-node.connect-source rect {
    stroke: #73c991;
  }

  .topology-node-label {
    fill: #cccccc;
    font-size: 12px;
    font-weight: 600;
  }

  .topology-node-type {
    fill: #858585;
    font-size: 10px;
    text-transform: uppercase;
  }

  .topology-link {
    stroke: #858585;
    stroke-width: 1.5;
    fill: none;
    pointer-events: stroke;
  }

  .topology-link.async {
    stroke-dasharray: 6 4;
  }

  .topology-link.selected {
    stroke: var(--vscode-focusBorder, #007acc);
    stroke-width: 2.5;
  }

  .topology-properties {
    border-top: 1px solid var(--vscode-border, #2b2b2b);
    background: var(--vscode-sideBar-bg, #252526);
  }

  .topology-properties-toggle {
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border: none;
    background: transparent;
    color: var(--vscode-descriptionForeground, #858585);
    font-size: 0.68rem;
    letter-spacing: 0.08em;
    padding: 0.45rem 0.55rem;
    cursor: pointer;
  }

  .topology-properties-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0.45rem;
    padding: 0 0.55rem 0.55rem;
  }

  .topology-properties-grid label {
    display: grid;
    gap: 0.2rem;
    font-size: 0.68rem;
    color: var(--vscode-descriptionForeground, #858585);
  }

  .topology-properties-grid input,
  .topology-properties-grid select {
    border: 1px solid var(--vscode-border, #2b2b2b);
    background: #1e1e1e;
    color: var(--vscode-foreground, #cccccc);
    border-radius: 2px;
    padding: 0.25rem 0.35rem;
    font-size: 0.72rem;
  }
</style>
