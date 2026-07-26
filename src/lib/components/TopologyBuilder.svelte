<svelte:options runes={false} />
<script>
  import { onMount } from 'svelte'
  import { base } from '$app/paths'
  import MermaidDiagram from '$lib/components/MermaidDiagram.svelte'
  import { codiconSvg } from '$lib/editor/codicons'
  import {
    COMPONENT_CATEGORIES,
    getComponent,
    getTypeDefaults,
    getTypeLabel,
    getTypeStyle,
    listComponentsByCategory,
    resolvePhysics
  } from '$lib/simulation/componentCatalog'
  import {
    applyLayout,
    autoLayout,
    compileFlowGraph,
    serializeFlowGraph
  } from '$lib/simulation/graphCompiler'

  export let diagramText = ''
  export let layoutJson = '{}'
  /** @type {string[]} */
  export let compileErrors = []
  /** @type {any[]} */
  export let nodeMetrics = []
  /** @type {((detail: { diagramText: string, layoutJson: string }) => void) | null} */
  export let onDiagramChange = null

  const NODE_WIDTH = 168
  const NODE_HEIGHT = 64

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
  let inspectorOpen = true
  let canvasEl
  let lastDiagramText = diagramText
  let paletteFilter = ''
  let activeCategory = 'edge'
  /** @type {string} */
  let hoveredType = ''
  let dragPaletteType = ''
  let connectAsync = false

  $: compiled = compileFlowGraph(diagramText || '')
  $: parsedLayout = parseLayoutJson(layoutJson)
  $: layout = mergeLayouts(parsedLayout, compiled)
  $: graph = applyLayout(compiled.errors.length ? lastValidGraph : compiled, layout)
  $: nodes = graph.nodes ?? []
  $: links = graph.links ?? []
  $: selectedNode = nodes.find((node) => node.id === selectedNodeId) ?? null
  $: selectedLink = links.find((link) => `${link.from}->${link.to}` === selectedLinkKey) ?? null
  $: displayErrors = compileErrors.length ? compileErrors : compiled.errors
  $: metricsById = Object.fromEntries((nodeMetrics ?? []).map((entry) => [entry.id, entry]))
  $: filteredComponents = listComponentsByCategory(activeCategory).filter((entry) => {
    if (!paletteFilter.trim()) return true
    const q = paletteFilter.trim().toLowerCase()
    return entry.label.toLowerCase().includes(q) || entry.id.includes(q) || entry.short.toLowerCase().includes(q)
  })
  $: inspectorComponent = selectedNode
    ? getComponent(selectedNode.type) ?? syntheticComponent(selectedNode.type)
    : pendingNodeType || hoveredType
      ? getComponent(pendingNodeType || hoveredType)
      : null
  $: modeHint = mode === 'connect'
    ? connectSourceId
      ? `Click a target to connect from ${connectSourceId}${connectAsync ? ' (async)' : ''}`
      : `Click a source node, then a target${connectAsync ? ' — async link' : ''}`
    : pendingNodeType
      ? `Click the canvas to place ${getTypeLabel(pendingNodeType)}`
      : 'Drag a component onto the canvas, or select a node to inspect it'

  /** @type {{ nodes: any[], links: any[] }} */
  let lastValidGraph = { nodes: [], links: [] }

  $: if (!compiled.errors.length && compiled.nodes.length) {
    lastValidGraph = compiled
    lastDiagramText = diagramText
  }

  /** @param {string} type */
  function syntheticComponent(type) {
    const style = getTypeStyle(type)
    const defaults = getTypeDefaults(type)
    return {
      id: type,
      label: getTypeLabel(type),
      category: 'compute',
      physics: resolvePhysics(type),
      short: `Custom ${type} component on the request path.`,
      whenToUse: ['Use when your design needs this hop explicitly.'],
      pitfalls: ['Confirm capacity and latency defaults match the real workload.'],
      defaults,
      color: style.fill,
      accent: style.accent,
      icon: style.icon
    }
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
    onDiagramChange?.(detail)
  }

  /** @param {string} type */
  function armNodeType(type) {
    pendingNodeType = pendingNodeType === type ? '' : type
    mode = 'select'
    selectedNodeId = ''
    selectedLinkKey = ''
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
    const defaults = getTypeDefaults(type)
    const baseId = type === 'edge' || type === 'dns' ? 'entry' : type.replace(/[^a-z0-9]+/gi, '-').toLowerCase()
    let index = 1
    let id = baseId
    const ids = new Set(nodes.map((node) => node.id))
    while (ids.has(id)) {
      id = `${baseId}-${index}`
      index += 1
    }
    const component = getComponent(type)
    const nextGraph = {
      nodes: [...nodes, {
        id,
        type,
        physics: resolvePhysics(type),
        label: component?.label ?? id.split(/[-_]/g).map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(' '),
        latencyMs: defaults.latencyMs,
        capacityRps: defaults.capacityRps,
        queueCapacity: defaults.queueCapacity,
        hitRate: defaults.hitRate,
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
    selectedLinkKey = ''
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
        connectNodes(connectSourceId, nodeId, connectAsync)
      }
      connectSourceId = ''
      return
    }
    if (mode === 'pan') return
    selectedNodeId = nodeId
    selectedLinkKey = ''
    pendingNodeType = ''
    draggingNodeId = nodeId
    const point = clientToCanvas(event.clientX, event.clientY)
    const nodeLayout = layout[nodeId] ?? { x: 0, y: 0 }
    dragOffsetX = point.x - (nodeLayout.x ?? 0)
    dragOffsetY = point.y - (nodeLayout.y ?? 0)
  }

  /** @param {string} from @param {string} to @param {boolean} isAsync */
  function connectNodes(from, to, isAsync = false) {
    const exists = links.some((link) => link.from === from && link.to === to)
    if (exists) return
    const nextGraph = {
      nodes,
      links: [...links, { from, to, async: isAsync, label: isAsync ? 'async' : '' }]
    }
    emitChange({ diagramText: serializeFlowGraph(nextGraph) })
    selectedLinkKey = `${from}->${to}`
    selectedNodeId = ''
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
    if (mode === 'select' && !pendingNodeType) {
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
    let nextNodes = nodes.map((node) => (
      node.id === selectedNode.id ? { ...node, [field]: value } : node
    ))
    if (field === 'type') {
      const defaults = getTypeDefaults(String(value))
      nextNodes = nextNodes.map((node) => {
        if (node.id !== selectedNode.id) return node
        return {
          ...node,
          type: String(value),
          physics: resolvePhysics(String(value)),
          latencyMs: defaults.latencyMs,
          capacityRps: defaults.capacityRps,
          queueCapacity: defaults.queueCapacity,
          hitRate: defaults.hitRate
        }
      })
    }
    emitChange({ diagramText: serializeFlowGraph({ nodes: nextNodes, links }) })
  }

  /** @param {string} field @param {string | number | boolean} value */
  function updateSelectedLink(field, value) {
    if (!selectedLink) return
    const nextLinks = links.map((link) => (
      link.from === selectedLink.from && link.to === selectedLink.to
        ? { ...link, [field]: value }
        : link
    ))
    emitChange({ diagramText: serializeFlowGraph({ nodes, links: nextLinks }) })
  }

  /** @param {string} from @param {string} to @param {MouseEvent} event */
  function handleLinkClick(from, to, event) {
    event.stopPropagation()
    selectedLinkKey = `${from}->${to}`
    selectedNodeId = ''
    pendingNodeType = ''
  }

  /** @param {KeyboardEvent} event */
  function handleKeydown(event) {
    if (event.key === 'Delete' || event.key === 'Backspace') {
      if (/** @type {HTMLElement} */ (event.target)?.closest?.('input, select, textarea')) return
      event.preventDefault()
      deleteSelection()
    }
    if (event.key === 'Escape') {
      pendingNodeType = ''
      connectSourceId = ''
      mode = 'select'
    }
  }

  /** @param {DragEvent} event @param {string} type */
  function handlePaletteDragStart(event, type) {
    dragPaletteType = type
    pendingNodeType = type
    event.dataTransfer?.setData('text/plain', type)
    if (event.dataTransfer) event.dataTransfer.effectAllowed = 'copy'
  }

  /** @param {DragEvent} event */
  function handleCanvasDragOver(event) {
    if (!dragPaletteType && !event.dataTransfer?.types?.includes('text/plain')) return
    event.preventDefault()
    if (event.dataTransfer) event.dataTransfer.dropEffect = 'copy'
  }

  /** @param {DragEvent} event */
  function handleCanvasDrop(event) {
    event.preventDefault()
    const type = dragPaletteType || event.dataTransfer?.getData('text/plain') || pendingNodeType
    if (!type) return
    const point = clientToCanvas(event.clientX, event.clientY)
    addNode(type, point.x, point.y)
    pendingNodeType = ''
    dragPaletteType = ''
  }

  /** @param {number | undefined} value */
  function formatUtil(value) {
    if (value === undefined || value === null) return ''
    return `${Math.round(value * 100)}%`
  }

  /** @param {any} node */
  function utilClass(node) {
    const metric = metricsById[node.id]
    if (!metric) return ''
    if (metric.utilization >= 0.9) return 'hot'
    if (metric.utilization >= 0.7) return 'warm'
    return 'cool'
  }

  function fitView() {
    panX = 24
    panY = 24
    zoom = 1
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
  <aside class="topology-palette-pane">
    <div class="topology-palette-head">
      <strong>Components</strong>
      <input
        class="topology-filter"
        type="search"
        placeholder="Search catalog…"
        bind:value={paletteFilter}
      />
    </div>
    <div class="topology-categories" role="tablist">
      {#each COMPONENT_CATEGORIES as category}
        <button
          type="button"
          class="topology-category"
          class:active={activeCategory === category.id}
          onclick={() => (activeCategory = category.id)}
          title={category.hint}
        >{category.label}</button>
      {/each}
    </div>
    <div class="topology-palette-list">
      {#each filteredComponents as component}
        <button
          type="button"
          class="topology-palette-item"
          class:active={pendingNodeType === component.id}
          style={`--chip-accent:${component.accent}; --chip-fill:${component.color}`}
          draggable="true"
          ondragstart={(event) => handlePaletteDragStart(event, component.id)}
          ondragend={() => (dragPaletteType = '')}
          onmouseenter={() => (hoveredType = component.id)}
          onmouseleave={() => (hoveredType = '')}
          onclick={() => armNodeType(component.id)}
        >
          <span class="topology-palette-icon">{component.icon}</span>
          <span class="topology-palette-copy">
            <span class="topology-palette-label">{component.label}</span>
            <span class="topology-palette-short">{component.short}</span>
          </span>
        </button>
      {/each}
      {#if !filteredComponents.length}
        <p class="topology-empty">No components match that search.</p>
      {/if}
    </div>
  </aside>

  <div class="topology-main">
    <div class="topology-toolbar">
      <div class="topology-modes">
        <button class="topology-mode" class:active={mode === 'select'} type="button" title="Select / move" onclick={() => { mode = 'select'; connectSourceId = '' }}>
          {@html codiconSvg('files')}
        </button>
        <button class="topology-mode" class:active={mode === 'connect'} type="button" title="Connect nodes" onclick={() => { mode = 'connect'; connectSourceId = ''; pendingNodeType = '' }}>
          {@html codiconSvg('link')}
        </button>
        <button class="topology-mode" class:active={mode === 'pan'} type="button" title="Pan canvas" onclick={() => (mode = 'pan')}>
          {@html codiconSvg('grabber')}
        </button>
        <button class="topology-mode" type="button" title="Delete selection" onclick={deleteSelection}>
          {@html codiconSvg('trash')}
        </button>
        <button class="topology-mode" type="button" title="Reset view" onclick={fitView}>
          {@html codiconSvg('fullscreen')}
        </button>
      </div>
      <label class="topology-async-toggle" title="New connections are asynchronous">
        <input type="checkbox" bind:checked={connectAsync} />
        <span>Async links</span>
      </label>
      <p class="topology-hint">{modeHint}</p>
    </div>

    {#if displayErrors.length}
      <div class="topology-problems">
        <span class="topology-problems-badge">{displayErrors.length}</span>
        <span>{displayErrors[0]}</span>
      </div>
    {/if}

    <div
      class="topology-canvas-wrap"
      class:placing={Boolean(pendingNodeType)}
      class:connecting={mode === 'connect'}
      bind:this={canvasEl}
      onpointerdown={handleCanvasPointerDown}
      onclick={handleCanvasClick}
      onwheel={handleWheel}
      ondragover={handleCanvasDragOver}
      ondrop={handleCanvasDrop}
    >
      <svg class="topology-canvas" style={`transform: translate(${panX}px, ${panY}px) scale(${zoom});`}>
        <defs>
          <pattern id="topology-grid" width="20" height="20" patternUnits="userSpaceOnUse">
            <circle cx="1" cy="1" r="1" class="topology-grid-dot" />
          </pattern>
          <marker id="arrow" markerWidth="8" markerHeight="8" refX="7" refY="3" orient="auto">
            <path d="M0,0 L8,3 L0,6 Z" class="topology-link-arrow" />
          </marker>
          <marker id="arrow-async" markerWidth="8" markerHeight="8" refX="7" refY="3" orient="auto">
            <path d="M0,0 L8,3 L0,6 Z" class="topology-link-arrow async" />
          </marker>
        </defs>
        <rect width="4000" height="2400" fill="url(#topology-grid)" />

        {#each links as link}
          {@const from = layout[link.from]}
          {@const to = layout[link.to]}
          {#if from && to}
            {@const x1 = (from.x ?? 0) + NODE_WIDTH}
            {@const y1 = (from.y ?? 0) + NODE_HEIGHT / 2}
            {@const x2 = to.x ?? 0}
            {@const y2 = (to.y ?? 0) + NODE_HEIGHT / 2}
            {@const mx = (x1 + x2) / 2}
            {@const my = (y1 + y2) / 2}
            <path
              class="topology-link"
              class:selected={selectedLinkKey === `${link.from}->${link.to}`}
              class:async={link.async}
              d={`M ${x1} ${y1} C ${mx} ${y1}, ${mx} ${y2}, ${x2} ${y2}`}
              marker-end={link.async ? 'url(#arrow-async)' : 'url(#arrow)'}
              onclick={(event) => handleLinkClick(link.from, link.to, event)}
            />
            {#if link.label || link.async}
              <text class="topology-link-label" x={mx} y={my - 6}>{link.label || (link.async ? 'async' : '')}</text>
            {/if}
          {/if}
        {/each}

        {#each nodes as node}
          {@const pos = layout[node.id] ?? { x: 40, y: 40 }}
          {@const style = getTypeStyle(node.type)}
          {@const metric = metricsById[node.id]}
          <g
            class="topology-node"
            class:selected={selectedNodeId === node.id}
            class:connect-source={connectSourceId === node.id}
            class:hot={utilClass(node) === 'hot'}
            class:warm={utilClass(node) === 'warm'}
            transform={`translate(${pos.x}, ${pos.y})`}
            onpointerdown={(event) => handleNodePointerDown(node.id, event)}
          >
            <rect width={NODE_WIDTH} height={NODE_HEIGHT} rx="8" style={`fill:${style.fill}; stroke:${style.accent}`} />
            <rect class="topology-node-accent" x="0" y="0" width="4" height={NODE_HEIGHT} rx="2" style={`fill:${style.accent}`} />
            <text x="14" y="18" class="topology-node-icon" style={`fill:${style.accent}`}>{style.icon}</text>
            <text x="14" y="38" class="topology-node-label">{node.label}</text>
            <text x="14" y="54" class="topology-node-type">{getTypeLabel(node.type)}</text>
            {#if metric}
              <g transform={`translate(${NODE_WIDTH - 46}, 8)`}>
                <rect class="topology-util-badge" width="40" height="16" rx="8" />
                <text class="topology-util-text" x="20" y="12" text-anchor="middle">{formatUtil(metric.utilization)}</text>
              </g>
            {/if}
          </g>
        {/each}
      </svg>
    </div>
  </div>

  <aside class="topology-inspector" class:collapsed={!inspectorOpen}>
    <button class="topology-inspector-toggle" type="button" onclick={() => (inspectorOpen = !inspectorOpen)}>
      <span>{inspectorOpen ? 'Inspector' : 'Info'}</span>
      <span>{inspectorOpen ? '▾' : '▸'}</span>
    </button>

    {#if inspectorOpen}
      {#if selectedLink}
        <div class="topology-inspector-body">
          <p class="eyebrow">Connection</p>
          <h3>{selectedLink.from} → {selectedLink.to}</h3>
          <p class="topology-inspector-short">
            {selectedLink.async
              ? 'Async edge — work leaves the critical path (queues, events, workers).'
              : 'Sync edge — this hop counts toward request latency.'}
          </p>
          <div class="topology-properties-grid">
            <label class="topology-check">
              <input
                type="checkbox"
                checked={Boolean(selectedLink.async)}
                onchange={(event) => updateSelectedLink('async', event.currentTarget.checked)}
              />
              <span>Async</span>
            </label>
            <label>
              <span>Label</span>
              <input value={selectedLink.label ?? ''} oninput={(event) => updateSelectedLink('label', event.currentTarget.value)} />
            </label>
          </div>
        </div>
      {:else if selectedNode}
        <div class="topology-inspector-body">
          <p class="eyebrow">Node</p>
          <h3>{selectedNode.label}</h3>
          {#if inspectorComponent}
            <p class="topology-inspector-short">{inspectorComponent.short}</p>
          {/if}
          <div class="topology-properties-grid">
            <label>
              <span>Label</span>
              <input value={selectedNode.label} oninput={(event) => updateSelectedNode('label', event.currentTarget.value)} />
            </label>
            <label>
              <span>Type</span>
              <select value={selectedNode.type} onchange={(event) => updateSelectedNode('type', event.currentTarget.value)}>
                {#each COMPONENT_CATEGORIES as category}
                  <optgroup label={category.label}>
                    {#each listComponentsByCategory(category.id) as component}
                      <option value={component.id}>{component.label}</option>
                    {/each}
                  </optgroup>
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
            {#if resolvePhysics(selectedNode.type) === 'cache'}
              <label>
                <span>Hit rate</span>
                <input type="number" min="0" max="1" step="0.01" value={selectedNode.hitRate ?? 0.85} oninput={(event) => updateSelectedNode('hitRate', Number(event.currentTarget.value))} />
              </label>
            {/if}
          </div>
          {#if metricsById[selectedNode.id]}
            {@const metric = metricsById[selectedNode.id]}
            <div class="topology-metric-card">
              <strong>Last run</strong>
              <p>Util {formatUtil(metric.utilization)} · {Math.round(metric.requestsRps)} rps · {metric.avgLatencyMs} ms</p>
            </div>
          {/if}
        </div>
      {:else if inspectorComponent}
        <div class="topology-inspector-body">
          <p class="eyebrow">Component</p>
          <h3>{inspectorComponent.label}</h3>
          <p class="topology-inspector-short">{inspectorComponent.short}</p>
          {#if inspectorComponent.diagram?.kind === 'primer'}
            <figure class="topology-diagram">
              <img src={`${base}${inspectorComponent.diagram.src}`} alt={inspectorComponent.diagram.alt} loading="lazy" />
              {#if inspectorComponent.diagram.caption}
                <figcaption>{inspectorComponent.diagram.caption}</figcaption>
              {/if}
            </figure>
          {:else if inspectorComponent.diagram?.kind === 'mermaid'}
            <div class="topology-diagram mermaid">
              <MermaidDiagram
                variant="extension"
                diagram={{
                  title: inspectorComponent.label,
                  caption: inspectorComponent.diagram.caption,
                  code: inspectorComponent.diagram.code
                }}
              />
            </div>
          {/if}
          <div class="topology-facts">
            <div>
              <strong>When to use</strong>
              <ul>
                {#each inspectorComponent.whenToUse as item}
                  <li>{item}</li>
                {/each}
              </ul>
            </div>
            <div>
              <strong>Watch outs</strong>
              <ul>
                {#each inspectorComponent.pitfalls as item}
                  <li>{item}</li>
                {/each}
              </ul>
            </div>
          </div>
          <p class="topology-defaults">
            Defaults · {inspectorComponent.defaults.latencyMs} ms · {inspectorComponent.defaults.capacityRps.toLocaleString()} rps
            {#if inspectorComponent.defaults.hitRate !== undefined}
              · hit {(inspectorComponent.defaults.hitRate * 100).toFixed(0)}%
            {/if}
          </p>
          {#if !pendingNodeType}
            <button class="topology-place-btn" type="button" onclick={() => armNodeType(inspectorComponent.id)}>
              Place on canvas
            </button>
          {/if}
        </div>
      {:else}
        <div class="topology-inspector-body">
          <p class="eyebrow">Architecture canvas</p>
          <h3>Design the system</h3>
          <p class="topology-inspector-short">
            Drag components from the catalog, connect the critical path with sync links, and mark background work as async.
            Run against <strong>Topology path</strong> to simulate the diagram you drew.
          </p>
          <ul class="topology-tips">
            <li>Start at the edge (client / DNS / CDN / LB).</li>
            <li>Keep the sync path short; push analytics behind queues.</li>
            <li>After Run, utilization badges highlight the hottest hops.</li>
          </ul>
        </div>
      {/if}
    {/if}
  </aside>
</div>

<style>
  .topology-builder {
    display: grid;
    grid-template-columns: minmax(11rem, 14rem) minmax(0, 1fr) minmax(12rem, 16rem);
    height: 100%;
    min-height: 22rem;
    background: var(--vscode-editor-bg, #1e1e1e);
    color: var(--vscode-foreground, #cccccc);
  }

  .topology-palette-pane,
  .topology-inspector {
    display: flex;
    flex-direction: column;
    border-right: 1px solid var(--vscode-border, #2b2b2b);
    background: var(--vscode-sideBar-bg, #252526);
    min-height: 0;
  }

  .topology-inspector {
    border-right: none;
    border-left: 1px solid var(--vscode-border, #2b2b2b);
  }

  .topology-palette-head {
    display: grid;
    gap: 0.4rem;
    padding: 0.55rem;
    border-bottom: 1px solid var(--vscode-border, #2b2b2b);
  }

  .topology-palette-head strong {
    font-size: 0.72rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--vscode-descriptionForeground, #858585);
  }

  .topology-filter {
    border: 1px solid var(--ide-border, var(--vscode-border));
    background: var(--ide-input-bg, var(--vscode-editor-bg));
    color: inherit;
    border-radius: 4px;
    padding: 0.3rem 0.45rem;
    font-size: 0.72rem;
  }

  .topology-categories {
    display: flex;
    flex-wrap: wrap;
    gap: 0.25rem;
    padding: 0.45rem;
    border-bottom: 1px solid var(--vscode-border, #2b2b2b);
  }

  .topology-category {
    border: 1px solid transparent;
    background: transparent;
    color: var(--vscode-descriptionForeground, #858585);
    border-radius: 999px;
    padding: 0.15rem 0.45rem;
    font-size: 0.65rem;
    cursor: pointer;
  }

  .topology-category.active {
    border-color: var(--vscode-focusBorder, #007acc);
    color: var(--vscode-foreground, #cccccc);
    background: rgba(0, 122, 204, 0.12);
  }

  .topology-palette-list {
    display: grid;
    gap: 0.35rem;
    padding: 0.45rem;
    overflow: auto;
  }

  .topology-palette-item {
    display: grid;
    grid-template-columns: auto 1fr;
    gap: 0.45rem;
    align-items: start;
    text-align: left;
    border: 1px solid var(--ide-border, var(--vscode-border));
    background: var(--chip-fill, #2d2d2d);
    color: inherit;
    border-radius: 6px;
    padding: 0.4rem;
    cursor: grab;
  }

  .topology-palette-item.active,
  .topology-palette-item:hover {
    border-color: var(--chip-accent, var(--vscode-focusBorder, #007acc));
    box-shadow: inset 3px 0 0 var(--chip-accent, #007acc);
  }

  .topology-palette-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 2.1rem;
    height: 1.5rem;
    border-radius: 4px;
    background: rgba(0, 0, 0, 0.25);
    color: var(--chip-accent, #696cff);
    font-size: 0.58rem;
    font-weight: 700;
    letter-spacing: 0.04em;
  }

  .topology-palette-copy {
    display: grid;
    gap: 0.1rem;
  }

  .topology-palette-label {
    font-size: 0.72rem;
    font-weight: 600;
  }

  .topology-palette-short {
    font-size: 0.62rem;
    color: var(--vscode-descriptionForeground, #858585);
    line-height: 1.35;
  }

  .topology-empty {
    margin: 0;
    font-size: 0.72rem;
    color: var(--vscode-descriptionForeground, #858585);
  }

  .topology-main {
    display: flex;
    flex-direction: column;
    min-width: 0;
    min-height: 0;
  }

  .topology-toolbar {
    display: flex;
    flex-wrap: wrap;
    gap: 0.55rem;
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

  .topology-async-toggle {
    display: inline-flex;
    align-items: center;
    gap: 0.3rem;
    font-size: 0.68rem;
    color: var(--vscode-descriptionForeground, #858585);
  }

  .topology-hint {
    margin: 0;
    flex: 1;
    font-size: 0.68rem;
    color: var(--vscode-descriptionForeground, #858585);
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
    cursor: default;
    background:
      radial-gradient(ellipse at top, rgba(105, 108, 255, 0.08), transparent 55%),
      var(--ide-topology-canvas-bg, var(--vscode-editor-bg));
  }

  .topology-canvas-wrap.placing {
    cursor: crosshair;
  }

  .topology-canvas-wrap.connecting {
    cursor: cell;
  }

  .topology-grid-dot {
    fill: var(--ide-topology-grid);
  }

  :global(.topology-link-arrow) {
    fill: var(--ide-topology-link);
  }

  :global(.topology-link-arrow.async) {
    fill: #38bdf8;
  }

  .topology-canvas {
    width: 100%;
    height: 100%;
    transform-origin: 0 0;
  }

  .topology-node rect {
    stroke-width: 1.5;
  }

  .topology-node.selected rect {
    stroke-width: 2.5;
    filter: drop-shadow(0 0 6px rgba(0, 122, 204, 0.45));
  }

  .topology-node.connect-source rect {
    stroke: #73c991 !important;
  }

  .topology-node.hot .topology-util-badge {
    fill: rgba(255, 76, 81, 0.9);
  }

  .topology-node.warm .topology-util-badge {
    fill: rgba(251, 191, 36, 0.9);
  }

  .topology-node:not(.hot):not(.warm) .topology-util-badge {
    fill: rgba(52, 211, 153, 0.85);
  }

  .topology-node-icon {
    font-size: 9px;
    font-weight: 700;
    letter-spacing: 0.04em;
  }

  .topology-node-label {
    fill: var(--ide-topology-label, #f3f4f6);
    font-size: 12px;
    font-weight: 600;
  }

  .topology-node-type {
    fill: var(--ide-topology-type, #9ca3af);
    font-size: 9px;
  }

  .topology-util-text {
    fill: #111;
    font-size: 9px;
    font-weight: 700;
  }

  .topology-link {
    stroke: var(--ide-topology-link, #858585);
    stroke-width: 1.8;
    fill: none;
    pointer-events: stroke;
  }

  .topology-link.async {
    stroke: #38bdf8;
    stroke-dasharray: 7 5;
  }

  .topology-link.selected {
    stroke: var(--vscode-focusBorder, #007acc);
    stroke-width: 2.8;
  }

  .topology-link-label {
    fill: #9ca3af;
    font-size: 10px;
    pointer-events: none;
  }

  .topology-inspector-toggle {
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border: none;
    border-bottom: 1px solid var(--vscode-border, #2b2b2b);
    background: transparent;
    color: var(--vscode-descriptionForeground, #858585);
    font-size: 0.68rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    padding: 0.45rem 0.55rem;
    cursor: pointer;
  }

  .topology-inspector-body {
    display: grid;
    gap: 0.65rem;
    padding: 0.65rem;
    overflow: auto;
  }

  .topology-inspector-body h3 {
    margin: 0;
    font-size: 0.95rem;
  }

  .topology-inspector-short {
    margin: 0;
    font-size: 0.72rem;
    line-height: 1.45;
    color: var(--vscode-descriptionForeground, #858585);
  }

  .topology-properties-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0.45rem;
  }

  .topology-properties-grid label,
  .topology-check {
    display: grid;
    gap: 0.2rem;
    font-size: 0.68rem;
    color: var(--vscode-descriptionForeground, #858585);
  }

  .topology-check {
    grid-template-columns: auto 1fr;
    align-items: center;
  }

  .topology-properties-grid input,
  .topology-properties-grid select {
    border: 1px solid var(--ide-border, var(--vscode-border));
    background: var(--ide-input-bg, var(--vscode-editor-bg));
    color: var(--vscode-foreground, #cccccc);
    border-radius: 4px;
    padding: 0.25rem 0.35rem;
    font-size: 0.72rem;
  }

  .topology-diagram {
    margin: 0;
    border: 1px solid var(--vscode-border, #2b2b2b);
    border-radius: 6px;
    overflow: hidden;
    background: #111;
  }

  .topology-diagram img {
    display: block;
    width: 100%;
    height: auto;
  }

  .topology-diagram figcaption,
  .topology-defaults {
    margin: 0;
    padding: 0.4rem 0.5rem;
    font-size: 0.65rem;
    color: var(--vscode-descriptionForeground, #858585);
  }

  .topology-diagram.mermaid {
    padding: 0.35rem;
  }

  .topology-facts {
    display: grid;
    gap: 0.55rem;
    font-size: 0.68rem;
  }

  .topology-facts ul,
  .topology-tips {
    margin: 0.25rem 0 0;
    padding-left: 1rem;
    color: var(--vscode-descriptionForeground, #858585);
  }

  .topology-tips {
    font-size: 0.72rem;
  }

  .topology-place-btn,
  .topology-metric-card {
    border: 1px solid var(--vscode-focusBorder, #007acc);
    background: rgba(0, 122, 204, 0.12);
    color: inherit;
    border-radius: 6px;
    padding: 0.45rem 0.55rem;
    font-size: 0.72rem;
  }

  .topology-place-btn {
    cursor: pointer;
  }

  .topology-metric-card p {
    margin: 0.2rem 0 0;
    color: var(--vscode-descriptionForeground, #858585);
  }

  @media (max-width: 960px) {
    .topology-builder {
      grid-template-columns: 1fr;
      grid-template-rows: auto minmax(14rem, 1fr) auto;
    }

    .topology-palette-pane,
    .topology-inspector {
      border-right: none;
      border-left: none;
      border-bottom: 1px solid var(--vscode-border, #2b2b2b);
      max-height: 12rem;
    }
  }
</style>
