import { buildDefaultNodeByType, getTypeDefaults, resolvePhysics } from './componentCatalog.js'

/** @type {Record<string, { latencyMs: number, capacityRps: number, queueCapacity: number, hitRate?: number }>} */
const DEFAULT_NODE_BY_TYPE = buildDefaultNodeByType()

export { DEFAULT_NODE_BY_TYPE, getTypeDefaults, resolvePhysics }

const VALUE_PATTERN = /"[^"]*"|'[^']*'|[^\s]+/g
const ATTRIBUTE_PATTERN = /([A-Za-z][\w-]*)=(".*?"|'.*?'|[^\s]+)/g

/** @param {string} value */
function parseValue(value) {
  if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
    return value.slice(1, -1)
  }
  if (value === 'true') return true
  if (value === 'false') return false
  if (/^-?\d+(?:\.\d+)?$/.test(value)) {
    return Number(value)
  }
  return value
}

/** @param {string} source */
function tokenize(source) {
  return source.match(VALUE_PATTERN) ?? []
}

/** @param {string} id */
function formatLabel(id) {
  return id
    .split(/[-_]/g)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

/** @param {string} source */
function parseAttributes(source) {
  /** @type {Record<string, string | number | boolean>} */
  const attributes = {}
  const trimmed = source.trim()
  if (!trimmed) {
    return { attributes, error: '' }
  }

  let matchedText = ''
  for (const match of trimmed.matchAll(ATTRIBUTE_PATTERN)) {
    const [, key, rawValue] = match
    attributes[key] = parseValue(rawValue)
    matchedText += match[0]
  }

  const normalizedSource = trimmed.replace(/\s+/g, '')
  if (matchedText.replace(/\s+/g, '') !== normalizedSource) {
    const invalid = trimmed.replace(ATTRIBUTE_PATTERN, '').trim()
    return { attributes, error: `Expected key=value pairs in "${invalid || trimmed}"` }
  }
  return { attributes, error: '' }
}

/** @param {string} diagramText */
export function compileFlowGraph(diagramText) {
  const lines = diagramText
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith('//') && !line.startsWith('#'))

  /** @type {{ id: string, type: string, physics: string, label: string, latencyMs: number, capacityRps: number, queueCapacity: number, hitRate?: number, errorRate: number, extraLatencyMs: number }[]} */
  const nodes = []
  /** @type {{ from: string, to: string, async: boolean, label: string }[]} */
  const links = []
  const errors = []
  const warnings = []
  const nodeIds = new Set()

  for (const line of lines) {
    const tokens = tokenize(line)
    if (!tokens.length) continue

    if (tokens[0] === 'node') {
      const match = line.match(/^node\s+([^\s]+)\s*(.*)$/)
      const id = match?.[1]
      const attributeSource = match?.[2] ?? ''
      if (!id) {
        errors.push(`Node declaration is missing an id: "${line}"`)
        continue
      }
      if (nodeIds.has(id)) {
        errors.push(`Duplicate node id "${id}"`)
        continue
      }
      const { attributes, error } = parseAttributes(attributeSource)
      if (error) {
        errors.push(`Invalid node "${id}": ${error}`)
        continue
      }
      const type = String(attributes.type ?? 'service')
      const defaults = getTypeDefaults(type)
      const physics = resolvePhysics(type)
      nodes.push({
        id,
        type,
        physics,
        label: String(attributes.label ?? formatLabel(id)),
        latencyMs: Number(attributes.latencyMs ?? defaults.latencyMs),
        capacityRps: Number(attributes.capacityRps ?? defaults.capacityRps),
        queueCapacity: Number(attributes.queueCapacity ?? defaults.queueCapacity),
        hitRate: attributes.hitRate === undefined ? defaults.hitRate : Number(attributes.hitRate),
        errorRate: Number(attributes.errorRate ?? 0),
        extraLatencyMs: Number(attributes.extraLatencyMs ?? 0)
      })
      nodeIds.add(id)
      continue
    }

    if (tokens[0] === 'link') {
      const match = line.match(/^link\s+([^\s]+)\s+(?:->\s+)?([^\s]+)\s*(.*)$/)
      const from = match?.[1]
      const to = match?.[2]
      const attributeSource = match?.[3] ?? ''
      if (!from || !to) {
        errors.push(`Link declaration is invalid: "${line}"`)
        continue
      }
      const { attributes, error } = parseAttributes(attributeSource)
      if (error) {
        errors.push(`Invalid link "${from} -> ${to}": ${error}`)
        continue
      }
      links.push({
        from,
        to,
        async: Boolean(attributes.async),
        label: String(attributes.label ?? '')
      })
      continue
    }

    warnings.push(`Ignored unsupported line "${line}"`)
  }

  for (const node of nodes) {
    if (!node.capacityRps || node.capacityRps <= 0) {
      errors.push(`Node "${node.id}" must declare a positive capacityRps`)
    }
    if (!node.latencyMs || node.latencyMs <= 0) {
      errors.push(`Node "${node.id}" must declare a positive latencyMs`)
    }
  }

  const neighborMap = new Map(nodes.map((node) => [node.id, new Set()]))
  for (const link of links) {
    if (!nodeIds.has(link.from)) {
      errors.push(`Link source "${link.from}" does not exist`)
      continue
    }
    if (!nodeIds.has(link.to)) {
      errors.push(`Link target "${link.to}" does not exist`)
      continue
    }
    neighborMap.get(link.from)?.add(link.to)
    neighborMap.get(link.to)?.add(link.from)
  }

  if (nodes.length && !errors.length) {
    const visited = new Set()
    const queue = [nodes[0].id]
    while (queue.length) {
      const current = queue.shift()
      if (!current || visited.has(current)) continue
      visited.add(current)
      neighborMap.get(current)?.forEach((neighbor) => {
        if (!visited.has(neighbor)) {
          queue.push(neighbor)
        }
      })
    }
    const disconnected = nodes.filter((node) => !visited.has(node.id))
    if (disconnected.length) {
      warnings.push(`Disconnected nodes: ${disconnected.map((node) => node.id).join(', ')}`)
    }
  }

  const mermaid = `flowchart LR
${nodes.map((node) => `  ${node.id}["${node.label}\\n${node.type}"]`).join('\n')}
${links.map((link) => `  ${link.from} ${link.async ? '-.->' : '-->'} ${link.to}${link.label ? `|${link.label}|` : ''}`).join('\n')}`.trim()

  return {
    nodes,
    links,
    errors,
    warnings,
    mermaid
  }
}

/** @param {typeof DEFAULT_NODE_BY_TYPE[string]} defaults @param {Record<string, string | number | boolean>} attrs */
function formatNodeAttributes(type, defaults, attrs) {
  const parts = [`type=${type}`]
  const label = String(attrs.label ?? '')
  if (label) parts.push(`label="${label.replace(/"/g, '\\"')}"`)
  const latencyMs = Number(attrs.latencyMs ?? defaults.latencyMs)
  if (latencyMs !== defaults.latencyMs) parts.push(`latencyMs=${latencyMs}`)
  const capacityRps = Number(attrs.capacityRps ?? defaults.capacityRps)
  if (capacityRps !== defaults.capacityRps) parts.push(`capacityRps=${capacityRps}`)
  const queueCapacity = Number(attrs.queueCapacity ?? defaults.queueCapacity)
  if (queueCapacity !== defaults.queueCapacity) parts.push(`queueCapacity=${queueCapacity}`)
  if (attrs.hitRate !== undefined && defaults.hitRate !== undefined && Number(attrs.hitRate) !== defaults.hitRate) {
    parts.push(`hitRate=${attrs.hitRate}`)
  }
  if (Number(attrs.errorRate ?? 0) > 0) parts.push(`errorRate=${attrs.errorRate}`)
  if (Number(attrs.extraLatencyMs ?? 0) > 0) parts.push(`extraLatencyMs=${attrs.extraLatencyMs}`)
  return parts.join(' ')
}

/**
 * @param {{ nodes: any[], links: any[] }} graph
 * @returns {string}
 */
export function serializeFlowGraph(graph) {
  const lines = []
  const sortedNodes = [...(graph.nodes ?? [])].sort((left, right) => left.id.localeCompare(right.id))
  for (const node of sortedNodes) {
    const defaults = getTypeDefaults(node.type)
    lines.push(`node ${node.id} ${formatNodeAttributes(node.type, defaults, node)}`)
  }
  const sortedLinks = [...(graph.links ?? [])].sort((left, right) => {
    const from = left.from.localeCompare(right.from)
    return from !== 0 ? from : left.to.localeCompare(right.to)
  })
  for (const link of sortedLinks) {
    const attrs = []
    if (link.async) attrs.push('async=true')
    if (link.label) attrs.push(`label="${String(link.label).replace(/"/g, '\\"')}"`)
    const suffix = attrs.length ? ` ${attrs.join(' ')}` : ''
    lines.push(`link ${link.from} -> ${link.to}${suffix}`)
  }
  return `${lines.join('\n')}\n`
}

/**
 * @param {{ nodes: any[], links: any[] }} graph
 * @param {Record<string, { x?: number, y?: number }>} layoutByNodeId
 */
export function applyLayout(graph, layoutByNodeId = {}) {
  return {
    ...graph,
    nodes: (graph.nodes ?? []).map((node) => {
      const layout = layoutByNodeId[node.id]
      if (!layout) return { ...node }
      return { ...node, x: layout.x ?? node.x, y: layout.y ?? node.y }
    })
  }
}

/**
 * @param {{ nodes: any[] }} graph
 * @returns {Record<string, { x: number, y: number }>}
 */
export function extractLayout(graph) {
  /** @type {Record<string, { x: number, y: number }>} */
  const layout = {}
  for (const node of graph.nodes ?? []) {
    if (typeof node.x === 'number' && typeof node.y === 'number') {
      layout[node.id] = { x: node.x, y: node.y }
    }
  }
  return layout
}

/**
 * Auto-layout nodes left-to-right when positions are missing.
 * @param {{ nodes: any[], links: any[] }} graph
 * @returns {Record<string, { x: number, y: number }>}
 */
export function autoLayout(graph) {
  const nodes = graph.nodes ?? []
  const links = graph.links ?? []
  if (!nodes.length) return {}

  const incoming = new Map(nodes.map((node) => [node.id, 0]))
  for (const link of links) {
    incoming.set(link.to, (incoming.get(link.to) ?? 0) + 1)
  }

  const roots = nodes.filter((node) => (incoming.get(node.id) ?? 0) === 0 || resolvePhysics(node.type) === 'edge')
  const queue = [...(roots.length ? roots : [nodes[0]])]
  const depth = new Map()
  const visited = new Set()

  while (queue.length) {
    const current = queue.shift()
    if (!current || visited.has(current.id)) continue
    visited.add(current.id)
    const currentDepth = depth.get(current.id) ?? 0
    for (const link of links.filter((entry) => entry.from === current.id)) {
      const nextDepth = Math.max(depth.get(link.to) ?? 0, currentDepth + 1)
      depth.set(link.to, nextDepth)
      const target = nodes.find((node) => node.id === link.to)
      if (target && !visited.has(target.id)) queue.push(target)
    }
  }

  for (const node of nodes) {
    if (!depth.has(node.id)) depth.set(node.id, 0)
  }

  const columns = new Map()
  for (const node of nodes) {
    const column = depth.get(node.id) ?? 0
    const rows = columns.get(column) ?? []
    rows.push(node.id)
    columns.set(column, rows)
  }

  /** @type {Record<string, { x: number, y: number }>} */
  const layout = {}
  const columnWidth = 180
  const rowHeight = 140
  for (const [column, ids] of [...columns.entries()].sort((left, right) => left[0] - right[0])) {
    ids.forEach((id, index) => {
      layout[id] = {
        x: 80 + column * columnWidth,
        y: 60 + index * rowHeight
      }
    })
  }
  return layout
}
