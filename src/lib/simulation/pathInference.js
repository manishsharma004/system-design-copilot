import { resolvePhysics } from './componentCatalog.js'

/**
 * Infer a runnable request path from the topology graph.
 * Sync links form the critical path; cache + database siblings use cache-miss;
 * async links become background stages.
 *
 * @param {{ nodes: any[], links: any[] }} graph
 * @returns {{ stages: any[], entryIds: string[], warnings: string[] }}
 */
export function inferStagesFromGraph(graph) {
  const nodes = graph.nodes ?? []
  const links = graph.links ?? []
  const warnings = []

  if (!nodes.length) {
    return { stages: [], entryIds: [], warnings: ['Topology has no nodes to simulate'] }
  }

  const nodesById = new Map(nodes.map((node) => [node.id, node]))
  /** @type {Map<string, any[]>} */
  const syncOut = new Map()
  /** @type {Map<string, any[]>} */
  const asyncOut = new Map()
  const incomingAny = new Map(nodes.map((node) => [node.id, 0]))

  for (const link of links) {
    if (!nodesById.has(link.from) || !nodesById.has(link.to)) continue
    const bucket = link.async ? asyncOut : syncOut
    const list = bucket.get(link.from) ?? []
    list.push(link)
    bucket.set(link.from, list)
    incomingAny.set(link.to, (incomingAny.get(link.to) ?? 0) + 1)
  }

  // Prefer explicit edge/client nodes. Never treat async-only queue/worker roots as entries.
  const edgeEntries = nodes.filter((node) => resolvePhysics(node.type) === 'edge')
  const orphanEntries = nodes.filter((node) => (incomingAny.get(node.id) ?? 0) === 0)
  const entries = edgeEntries.length ? edgeEntries : orphanEntries.length ? orphanEntries : [nodes[0]]
  const entryIds = entries.map((node) => node.id)

  /** @type {any[]} */
  const stages = []
  const visited = new Set()
  /** @type {{ nodeId: string, sourceNodeId?: string, mode: string }[]} */
  const queue = entryIds.map((nodeId) => ({ nodeId, mode: 'always' }))

  while (queue.length) {
    const current = queue.shift()
    if (!current || visited.has(current.nodeId)) continue
    const node = nodesById.get(current.nodeId)
    if (!node) continue
    visited.add(current.nodeId)

    const physics = resolvePhysics(node.type)
    /** @type {Record<string, any>} */
    const stage = {
      nodeId: node.id,
      mode: current.mode
    }
    if (current.sourceNodeId) stage.sourceNodeId = current.sourceNodeId
    if (physics === 'cache') {
      stage.kind = 'cache'
      stage.hitRate = Number(node.hitRate ?? 0.85)
    }
    stages.push(stage)

    const syncChildren = syncOut.get(node.id) ?? []
    const childNodes = syncChildren
      .map((link) => nodesById.get(link.to))
      .filter(Boolean)
    const hasCacheChild = childNodes.some((child) => resolvePhysics(child.type) === 'cache')
    const currentIsCache = physics === 'cache'
    const inheritMiss = current.mode === 'cache-miss' || currentIsCache

    for (const link of syncChildren) {
      if (visited.has(link.to)) continue
      const child = nodesById.get(link.to)
      if (!child) continue
      let mode = 'always'
      // Propagate miss traffic after a cache/CDN, and treat DB siblings of a cache as miss path.
      if (inheritMiss && resolvePhysics(child.type) !== 'cache') {
        mode = 'cache-miss'
      } else if (hasCacheChild && resolvePhysics(child.type) === 'database') {
        mode = 'cache-miss'
      }
      queue.push({ nodeId: child.id, sourceNodeId: node.id, mode })
    }

    for (const link of asyncOut.get(node.id) ?? []) {
      if (visited.has(link.to)) continue
      queue.push({ nodeId: link.to, sourceNodeId: node.id, mode: 'async' })
    }
  }

  const disconnected = nodes.filter((node) => !visited.has(node.id))
  if (disconnected.length) {
    warnings.push(`Not on simulated path: ${disconnected.map((node) => node.id).join(', ')}`)
  }

  if (!stages.length) {
    warnings.push('Could not infer a request path from the topology')
  }

  return { stages, entryIds, warnings }
}

/**
 * Build a synthetic API that always follows the live diagram.
 * @param {{ nodes: any[], links: any[] }} graph
 * @param {{ timeoutMs?: number, retries?: number, payloadKb?: number }} [options]
 */
export function buildTopologyPathApi(graph, options = {}) {
  const inferred = inferStagesFromGraph(graph)
  return {
    id: 'topology-path',
    label: 'Topology path (from diagram)',
    summary: 'Simulate the request path inferred from your visual architecture — sync links are critical path, async links are background.',
    timeoutMs: Number(options.timeoutMs ?? 300),
    retries: Number(options.retries ?? 1),
    payloadKb: Number(options.payloadKb ?? 1),
    deriveFromTopology: true,
    stages: inferred.stages,
    focusMetrics: ['path p95', 'hottest hop', 'async backlog', 'error rate'],
    inferenceWarnings: inferred.warnings
  }
}
