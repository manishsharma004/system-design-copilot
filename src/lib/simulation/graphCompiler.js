/** @type {Record<string, { latencyMs: number, capacityRps: number, queueCapacity: number, hitRate?: number }>} */
const DEFAULT_NODE_BY_TYPE = {
  edge: { latencyMs: 4, capacityRps: 60000, queueCapacity: 0 },
  service: { latencyMs: 12, capacityRps: 20000, queueCapacity: 2000 },
  cache: { latencyMs: 3, capacityRps: 90000, queueCapacity: 40000, hitRate: 0.85 },
  database: { latencyMs: 18, capacityRps: 7000, queueCapacity: 8000 },
  queue: { latencyMs: 10, capacityRps: 30000, queueCapacity: 120000 },
  worker: { latencyMs: 20, capacityRps: 20000, queueCapacity: 20000 }
}

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

  /** @type {{ id: string, type: string, label: string, latencyMs: number, capacityRps: number, queueCapacity: number, hitRate?: number, errorRate: number, extraLatencyMs: number }[]} */
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
      const defaults = DEFAULT_NODE_BY_TYPE[type] ?? DEFAULT_NODE_BY_TYPE.service
      nodes.push({
        id,
        type,
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
${links.map((link) => `  ${link.from} ${link.async ? '-.->' : '-->'} ${link.to}${link.label ? `|${link.label}|` : ''}`).join('\n')}`

  return {
    nodes,
    links,
    errors,
    warnings,
    mermaid
  }
}
