import { compileFlowGraph } from '../simulation/graphCompiler.js'
import { parseSimulationScript } from '../simulation/scriptApi.js'

export const FLOW_GRAPH_LANGUAGE = 'flow-graph'

export const markdownCompletions = [
  {
    label: 'Requirements outline',
    documentation: 'Insert a structured system-design answer outline.',
    insertText: ['## Requirements', '- Functional', '- Non-functional', '', '## Core components', '- ', '', '## Data model', '- ', '', '## APIs', '- ', '', '## Scaling decisions', '- ', '', '## Risks and trade-offs', '- '].join('\n')
  },
  {
    label: 'Latency budget',
    documentation: 'Insert a short latency and throughput planning section.',
    insertText: ['## SLOs and capacity', '- Target p95 latency:', '- Peak RPS / QPS:', '- Availability target:', '- Storage growth:'].join('\n')
  },
  {
    label: 'Failure plan',
    documentation: 'Insert a failure-mode review checklist.',
    insertText: ['## Failure handling', '- Retries / backoff', '- Idempotency', '- Degraded mode', '- Monitoring and alerts'].join('\n')
  }
]

export const flowGraphCompletions = [
  {
    label: 'Node: service',
    documentation: 'Add a service node with capacity and latency defaults.',
    insertText: 'node ${1:service_name} type=service label="${2:Service}" latencyMs=${3:12} capacityRps=${4:20000} queueCapacity=${5:2000}'
  },
  {
    label: 'Node: cache',
    documentation: 'Add a cache node with hit-rate controls.',
    insertText: 'node ${1:cache_name} type=cache label="${2:Cache}" latencyMs=${3:3} capacityRps=${4:90000} queueCapacity=${5:40000} hitRate=${6:0.85}'
  },
  {
    label: 'Node: database',
    documentation: 'Add a database node.',
    insertText: 'node ${1:database_name} type=database label="${2:Primary DB}" latencyMs=${3:18} capacityRps=${4:7000} queueCapacity=${5:8000}'
  },
  {
    label: 'Link',
    documentation: 'Connect two nodes.',
    insertText: 'link ${1:from} -> ${2:to} label="${3:sync path}"'
  },
  {
    label: 'Async link',
    documentation: 'Connect two nodes asynchronously.',
    insertText: 'link ${1:from} -> ${2:to} async=true label="${3:async path}"'
  }
]

export const simulationScriptCompletions = [
  {
    label: 'workload()',
    documentation: 'Override a workload profile for the current API path.',
    insertText: "workload('${1:redirect}', { rpm: ${2:1200000}, concurrency: ${3:5000}, retries: ${4:2} })"
  },
  {
    label: 'node()',
    documentation: 'Override a node capacity or latency.',
    insertText: "node('${1:primary}', { capacityRps: ${2:6400}, latencyMs: ${3:26} })"
  },
  {
    label: 'failure()',
    documentation: 'Inject a failure or slowdown into a node.',
    insertText: "failure('${1:cache}', { hitRate: ${2:0.68}, extraLatencyMs: ${3:10} })"
  }
]

/**
 * @param {'hint' | 'warning' | 'error'} severity
 */
function normalizeSeverity(severity) {
  if (severity === 'error') return 'error'
  if (severity === 'warning') return 'warning'
  return 'hint'
}

/**
 * @param {string} source
 */
function splitLines(source) {
  return source.split('\n').map((text, index) => ({
    line: index + 1,
    text
  }))
}

/**
 * @param {string} source
 * @param {RegExp} pattern
 */
function matchLineMap(source, pattern) {
  /** @type {[string, number][]} */
  const entries = []
  for (const { line, text } of splitLines(source)) {
    const match = text.trim().match(pattern)
    if (match?.[1]) {
      entries.push([String(match[1]), line])
    }
  }

  return new Map(entries)
}

/**
 * @param {string} message
 * @param {Map<string, number>} nodeLines
 * @param {Map<string, number>} linkLines
 */
function mapFlowGraphMessageToLine(message, nodeLines, linkLines) {
  const nodeMatch = message.match(/"(.*?)"/)
  if (nodeMatch?.[1] && nodeLines.has(nodeMatch[1])) {
    return nodeLines.get(nodeMatch[1]) ?? 1
  }

  const linkMatch = message.match(/"(.*?) -> (.*?)"/)
  if (linkMatch) {
    const key = `${linkMatch[1]}->${linkMatch[2]}`
    return linkLines.get(key) ?? 1
  }

  const linkEndpointMatch = message.match(/source "(.*?)"|target "(.*?)"/)
  if (linkEndpointMatch) {
    const endpoint = linkEndpointMatch[1] ?? linkEndpointMatch[2]
    return nodeLines.get(endpoint) ?? 1
  }

  return 1
}

/**
 * @param {string} diagramText
 */
export function buildFlowGraphMetadata(diagramText) {
  const graph = compileFlowGraph(diagramText)
  const lines = splitLines(diagramText)
  const nodeLines = matchLineMap(diagramText, /^node\s+([^\s]+)/)
  /** @type {[string, number][]} */
  const linkEntries = []
  for (const { line, text } of lines) {
    const match = text.trim().match(/^link\s+([^\s]+)\s+(?:->\s+)?([^\s]+)/)
    if (match) {
      linkEntries.push([`${match[1]}->${match[2]}`, line])
    }
  }
  const linkLines = new Map(linkEntries)

  const previewItems = []
  for (const { line, text } of lines) {
    const trimmed = text.trim()
    const nodeMatch = trimmed.match(/^node\s+([^\s]+)\s+(.*)$/)
    if (nodeMatch) {
      const [, nodeId, attributeSource] = nodeMatch
      const node = graph.nodes.find((entry) => entry.id === nodeId)
      const typeMatch = attributeSource.match(/type=([^\s]+)/)
      const typeLabel = node?.type ?? typeMatch?.[1] ?? 'service'
      if (node) {
        previewItems.push({
          line,
          text: `${typeLabel} · ${node.capacityRps} rps · ${node.latencyMs} ms`,
          hover: `${node.label} (${node.type})\nQueue ${node.queueCapacity}${node.hitRate === undefined ? '' : ` · hit rate ${Math.round(node.hitRate * 100)}%`}`
        })
      } else {
        previewItems.push({
          line,
          text: `${typeLabel} node`,
          hover: 'Define latencyMs, capacityRps, and queueCapacity to tune the simulator.'
        })
      }
      continue
    }

    const linkMatch = trimmed.match(/^link\s+([^\s]+)\s+(?:->\s+)?([^\s]+)\s*(.*)$/)
    if (linkMatch) {
      const [, from, to, attributeSource] = linkMatch
      previewItems.push({
        line,
        text: `${/async=true/.test(attributeSource) ? 'async' : 'sync'} path ${from} → ${to}`,
        hover: 'Use async=true to model queues, fan-out, or background processing.'
      })
    }
  }

  /** @type {{ line: number, message: string, severity: 'error' | 'warning' }[]} */
  const markers = [
    ...graph.errors.map((message) => ({
      line: mapFlowGraphMessageToLine(message, nodeLines, linkLines),
      message,
      severity: /** @type {'error'} */ ('error')
    })),
    ...graph.warnings.map((message) => ({
      line: mapFlowGraphMessageToLine(message, nodeLines, linkLines),
      message,
      severity: /** @type {'warning'} */ ('warning')
    }))
  ]

  return {
    summary: `${graph.nodes.length} nodes · ${graph.links.length} links`,
    previewItems,
    markers: markers.map((entry) => ({
      ...entry,
      severity: normalizeSeverity(entry.severity)
    }))
  }
}

/**
 * @param {string} scriptText
 */
export function buildSimulationScriptMetadata(scriptText) {
  const script = parseSimulationScript(scriptText)
  const lines = splitLines(scriptText)
  const previewItems = []
  /** @type {{ line: number, message: string, severity: 'error' }[]} */
  const markers = []

  for (const { line, text } of lines) {
    const trimmed = text.trim()
    if (!trimmed || trimmed.startsWith('//') || trimmed.startsWith('#')) continue

    const match = trimmed.match(/^(\w+)\(\s*(['"])([^'"]+)\2\s*,\s*(\{.*\})\s*\)\s*;?$/)
    if (!match) {
      markers.push({
        line,
        message: `Unsupported script line: "${trimmed}"`,
        severity: 'error'
      })
      continue
    }

    const [, command, , target, overrides] = match
    previewItems.push({
      line,
      text: `${command} · ${target}`,
      hover: overrides
    })
  }

  for (const message of script.errors) {
    const line = lines.find((entry) => message.includes(entry.text.trim()))?.line ?? 1
    markers.push({
      line,
      message,
      severity: 'error'
    })
  }

  return {
    summary: `${Object.keys(script.workloadOverrides).length} workload overrides · ${Object.keys(script.nodeOverrides).length} node overrides · ${Object.keys(script.failureOverrides).length} failures`,
    previewItems,
    markers: markers.map((entry) => ({
      ...entry,
      severity: normalizeSeverity(entry.severity)
    }))
  }
}

/**
 * @param {string} markdownText
 */
export function buildMarkdownMetadata(markdownText) {
  const lines = splitLines(markdownText)
  const previewItems = []
  /** @type {{ line: number, message: string, severity: 'warning' | 'hint' }[]} */
  const markers = []
  let headingCount = 0
  let bulletCount = 0
  let fencedBlocks = 0

  for (const { line, text } of lines) {
    const trimmed = text.trim()
    if (/^#{1,6}\s+/.test(trimmed)) {
      headingCount += 1
      previewItems.push({
        line,
        text: trimmed.replace(/^#+\s+/, ''),
        hover: 'Section heading'
      })
    }
    if (/^[-*]\s+/.test(trimmed)) {
      bulletCount += 1
    }
    if (/^```/.test(trimmed)) {
      fencedBlocks += 1
    }
  }

  if (!markdownText.trim()) {
    markers.push({
      line: 1,
      message: 'Start by adding at least one heading so the answer has a visible structure.',
      severity: 'hint'
    })
  } else if (!headingCount) {
    markers.push({
      line: 1,
      message: 'Add markdown headings to break the answer into interviewer-friendly sections.',
      severity: 'warning'
    })
  }

  if (fencedBlocks % 2 === 1) {
    const lastFenceLine = [...lines].reverse().find((entry) => /^```/.test(entry.text.trim()))?.line ?? 1
    markers.push({
      line: lastFenceLine,
      message: 'Close the unfinished fenced code block.',
      severity: 'warning'
    })
  }

  const wordCount = markdownText.trim() ? markdownText.trim().split(/\s+/).filter(Boolean).length : 0

  return {
    summary: `${headingCount} headings · ${bulletCount} bullets · ${wordCount} words`,
    previewItems,
    markers: markers.map((entry) => ({
      ...entry,
      severity: normalizeSeverity(entry.severity)
    }))
  }
}
