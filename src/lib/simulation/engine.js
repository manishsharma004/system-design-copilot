import { diagnoseSimulation } from './diagnostics.js'
import { compileFlowGraph } from './graphCompiler.js'
import { parseSimulationScript } from './scriptApi.js'

/** @param {number} value */
function clamp01(value) {
  return Math.min(1, Math.max(0, value))
}

/** @param {number} value */
function round(value) {
  return Math.round(value * 100) / 100
}

/**
 * @param {ReturnType<typeof compileFlowGraph>} graph
 * @param {any} api
 */
function validateApiAgainstGraph(graph, api) {
  const errors = []
  const nodesById = new Map(graph.nodes.map((node) => [node.id, node]))
  const linkKeys = new Set(graph.links.map((link) => `${link.from}->${link.to}`))

  for (const stage of api?.stages ?? []) {
    if (!nodesById.has(stage.nodeId)) {
      errors.push(`API stage "${stage.nodeId}" does not exist in the current diagram`)
    }
    if (stage.sourceNodeId && !linkKeys.has(`${stage.sourceNodeId}->${stage.nodeId}`)) {
      errors.push(`Missing link ${stage.sourceNodeId} -> ${stage.nodeId} for API stage "${stage.nodeId}"`)
    }
  }

  return errors
}

/**
 * @param {ReturnType<typeof compileFlowGraph>['nodes']} nodes
 * @param {Record<string, Record<string, string | number | boolean>>} nodeOverrides
 * @param {Record<string, Record<string, string | number | boolean>>} failureOverrides
 */
function buildRuntimeNodes(nodes, nodeOverrides, failureOverrides) {
  return nodes.map((node) => {
    const override = nodeOverrides[node.id] ?? {}
    const failure = failureOverrides[node.id] ?? {}
    return {
      ...node,
      ...override,
      hitRate: override.hitRate === undefined ? node.hitRate : Number(override.hitRate),
      errorRate: Number(node.errorRate ?? 0) + Number(failure.errorRate ?? 0),
      extraLatencyMs: Number(node.extraLatencyMs ?? 0) + Number(failure.extraLatencyMs ?? 0),
      capacityRps: Number(override.capacityRps ?? node.capacityRps),
      latencyMs: Number(override.latencyMs ?? node.latencyMs),
      queueCapacity: Number(override.queueCapacity ?? node.queueCapacity),
      failureHitRate: failure.hitRate === undefined ? undefined : Number(failure.hitRate)
    }
  })
}

/**
 * @param {Map<string, any>} nodesById
 * @param {any} api
 * @param {any} workload
 * @param {number} requestAmplification
 */
function calculatePass(nodesById, api, workload, requestAmplification) {
  const baseRps = (Number(workload.rpm ?? 0) / 60) * requestAmplification
  const timeoutMs = Number(workload.timeoutMs ?? api.timeoutMs ?? 250)
  const concurrency = Number(workload.concurrency ?? 0)
  const payloadKb = Number(workload.payloadKb ?? api.payloadKb ?? 1)
  let latestCache = { hitRps: 0, missRps: 0, hitRate: 1 }
  const nodeAccumulator = new Map()
  let averageLatencyMs = 0
  let aggregateErrorRate = 0
  let asyncQueueRps = 0
  let totalDroppedRps = 0

  for (const stage of api.stages) {
    const node = nodesById.get(stage.nodeId)
    if (!node) continue

    const callsPerRequest = Number(stage.callsPerRequest ?? 1)
    let stageRps = baseRps * callsPerRequest
    if (stage.mode === 'cache-hit') {
      stageRps = latestCache.hitRps * callsPerRequest
    } else if (stage.mode === 'cache-miss') {
      stageRps = latestCache.missRps * callsPerRequest
    }

    const capacityRps = Math.max(1, Number(node.capacityRps ?? 1))
    const concurrencyPressure = concurrency > 0 ? concurrency / capacityRps : 0
    const utilization = stageRps / capacityRps + concurrencyPressure * 0.08 + Math.max(0, payloadKb - 1) * 0.015
    const overloadRatio = Math.max(0, utilization - 1)
    const baseLatencyMs = Number(node.latencyMs ?? 0) + Number(node.extraLatencyMs ?? 0)
    const queueDepth = round(Math.max(0, stageRps - capacityRps) * Math.max(1, timeoutMs / 40))
    const queuePenaltyMs = overloadRatio > 0 ? baseLatencyMs * overloadRatio * 4.5 : baseLatencyMs * utilization * 0.18
    const effectiveLatencyMs = round(baseLatencyMs + queuePenaltyMs)
    const droppedRps = round(Math.max(0, stageRps - capacityRps))
    const overloadError = clamp01(utilization > 1 ? (utilization - 1) / utilization : 0)
    const stageErrorRate = clamp01(Number(node.errorRate ?? 0) + overloadError * 0.85)

    if (stage.kind === 'cache' || node.type === 'cache') {
      const hitRate = clamp01(Number(node.failureHitRate ?? stage.hitRate ?? node.hitRate ?? 0.8))
      latestCache = {
        hitRate,
        hitRps: stageRps * hitRate,
        missRps: stageRps * (1 - hitRate)
      }
    }

    const participationRatio = baseRps > 0 ? Math.min(1, stageRps / baseRps) : 0
    if (stage.mode === 'async') {
      asyncQueueRps += stageRps
    } else {
      averageLatencyMs += effectiveLatencyMs * participationRatio
      aggregateErrorRate += stageErrorRate * participationRatio
    }
    totalDroppedRps += droppedRps

    const current = nodeAccumulator.get(node.id) ?? {
      id: node.id,
      label: node.label,
      type: node.type,
      requestsRps: 0,
      capacityRps,
      utilization: 0,
      avgLatencyMs: 0,
      errorRate: 0,
      queueDepth: 0,
      droppedRps: 0,
      hitRate: undefined
    }

    current.requestsRps += stageRps
    current.utilization = round(current.requestsRps / capacityRps)
    current.avgLatencyMs = round(Math.max(current.avgLatencyMs, effectiveLatencyMs))
    current.errorRate = round(Math.max(current.errorRate, stageErrorRate))
    current.queueDepth = round(Math.max(current.queueDepth, queueDepth))
    current.droppedRps = round(current.droppedRps + droppedRps)
    if (stage.kind === 'cache' || node.type === 'cache') {
      current.hitRate = round(latestCache.hitRate)
    }
    nodeAccumulator.set(node.id, current)
  }

  const peakUtilization = Math.max(0, ...[...nodeAccumulator.values()].map((node) => node.utilization))
  const p95LatencyMs = round(averageLatencyMs * (1.2 + peakUtilization * 0.12))
  const p99LatencyMs = round(averageLatencyMs * (1.55 + peakUtilization * 0.28))
  const timeoutPressure = timeoutMs ? clamp01(p99LatencyMs / timeoutMs - 1) : 0
  const overallErrorRate = clamp01(aggregateErrorRate + timeoutPressure * 0.18)

  return {
    overall: {
      requestRps: round(baseRps),
      averageLatencyMs: round(averageLatencyMs),
      p95LatencyMs,
      p99LatencyMs,
      errorRate: round(overallErrorRate),
      droppedRps: round(totalDroppedRps),
      timeoutMs,
      asyncQueueRps: round(asyncQueueRps)
    },
    nodeMetrics: [...nodeAccumulator.values()].sort((left, right) => right.utilization - left.utilization)
  }
}

/**
 * @param {{ scenario: any, diagramText: string, apiId: string, profileId: string, scriptText: string }} input
 */
export function runSimulation(input) {
  const graph = compileFlowGraph(input.diagramText)
  const script = parseSimulationScript(input.scriptText)
  const api = input.scenario.apis.find((/** @type {any} */ entry) => entry.id === input.apiId) ?? null
  const profile = input.scenario.workloadProfiles.find((/** @type {any} */ entry) => entry.id === input.profileId) ?? null
  const errors = [...graph.errors, ...script.errors]

  if (!api) {
    errors.push(`Unknown API "${input.apiId}"`)
  }
  if (!profile) {
    errors.push(`Unknown workload profile "${input.profileId}"`)
  }
  if (api && profile && profile.endpointId !== api.id) {
    errors.push(`Workload profile "${profile.id}" does not match API "${api.id}"`)
  }

  if (api) {
    errors.push(...validateApiAgainstGraph(graph, api))
  }

  const mergedWorkload = {
    timeoutMs: Number(api?.timeoutMs ?? 250),
    retries: Number(api?.retries ?? 0),
    payloadKb: Number(api?.payloadKb ?? 1),
    ...profile?.workload,
    ...(api ? script.workloadOverrides[api.id] ?? {} : {}),
    ...(profile ? script.workloadOverrides[profile.id] ?? {} : {})
  }

  if (!Number(mergedWorkload.rpm ?? 0) || Number(mergedWorkload.rpm) <= 0) {
    errors.push('The active workload must declare a positive rpm value')
  }

  const runtimeNodes = buildRuntimeNodes(graph.nodes, script.nodeOverrides, script.failureOverrides)
  const runtimeNodesById = new Map(runtimeNodes.map((node) => [node.id, node]))

  if (errors.length || !api || !profile) {
    return {
      ok: false,
      errors,
      warnings: graph.warnings,
      mermaid: graph.mermaid,
      graph,
      api,
      profile
    }
  }

  const baseline = calculatePass(runtimeNodesById, api, mergedWorkload, 1)
  const retryAmplification = round(1 + Number(mergedWorkload.retries ?? 0) * Math.min(0.5, baseline.overall.errorRate + baseline.overall.p99LatencyMs / baseline.overall.timeoutMs * 0.12))
  const finalPass = calculatePass(runtimeNodesById, api, mergedWorkload, retryAmplification)
  const findings = diagnoseSimulation({
    overall: {
      ...finalPass.overall,
      retryAmplification
    },
    nodeMetrics: finalPass.nodeMetrics
  })

  return {
    ok: true,
    warnings: graph.warnings,
    errors: [],
    mermaid: graph.mermaid,
    api,
    profile,
    workload: {
      ...mergedWorkload,
      retryAmplification
    },
    overall: {
      ...finalPass.overall,
      retryAmplification
    },
    nodeMetrics: finalPass.nodeMetrics,
    findings
  }
}
