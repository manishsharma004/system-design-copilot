/** @param {number} value */
function percent(value) {
  return `${Math.round(value * 100)}%`
}

/**
 * @param {{
 *   overall: { p99LatencyMs: number, timeoutMs: number, errorRate: number, droppedRps: number, retryAmplification: number },
 *   nodeMetrics: { id: string, label: string, type: string, utilization: number, queueDepth: number, hitRate?: number, errorRate: number }[]
 * }} result
 */
export function diagnoseSimulation(result) {
  const findings = []

  if (result.overall.p99LatencyMs > result.overall.timeoutMs * 0.9) {
    findings.push({
      severity: 'high',
      title: 'Tail latency is too close to the API timeout',
      summary: 'Requests are spending most of the timeout budget inside the current synchronous path.',
      fixes: [
        'Shorten the synchronous hot path with caching or precomputation.',
        'Move analytics, enrichment, or non-critical writes behind a queue.',
        'Add capacity only after you name which hop is consuming the budget.'
      ]
    })
  }

  if (result.overall.retryAmplification > 1.15) {
    findings.push({
      severity: 'medium',
      title: 'Retries are amplifying load',
      summary: `The current retry policy is inflating request volume by about ${percent(result.overall.retryAmplification - 1)}.`,
      fixes: [
        'Use exponential backoff with jitter instead of immediate retries.',
        'Add idempotency and circuit breaking around stressed dependencies.',
        'Prefer load shedding or graceful degradation when the system is already saturated.'
      ]
    })
  }

  if (result.overall.errorRate > 0.03 || result.overall.droppedRps > 0) {
    findings.push({
      severity: 'high',
      title: 'The system is dropping or failing meaningful traffic',
      summary: 'At least one node is past its effective throughput ceiling, so user-visible errors are starting to leak out.',
      fixes: [
        'Rate limit or shed the least valuable traffic first.',
        'Increase headroom on the first saturated hop, not every component.',
        'Reduce fan-out and retries before simply scaling out downstream dependencies.'
      ]
    })
  }

  for (const node of result.nodeMetrics) {
    if (node.type === 'cache' && node.hitRate !== undefined && node.hitRate < 0.85) {
      findings.push({
        severity: 'medium',
        title: `${node.label} is missing too often`,
        summary: `The cache hit rate is only ${percent(node.hitRate)}, which pushes too much traffic into the source of truth.`,
        fixes: [
          'Warm hot keys before launches and consider negative caching for misses.',
          'Tune TTLs or cache key design so hot lookups stay resident longer.',
          'Keep cache invalidation predictable so misses do not cluster during spikes.'
        ]
      })
    }

    if (node.type === 'database' && node.utilization > 0.85) {
      findings.push({
        severity: 'high',
        title: `${node.label} is becoming the bottleneck`,
        summary: `Database utilization is around ${percent(node.utilization)}, so synchronous misses and writes are driving risk.`,
        fixes: [
          'Reduce synchronous database reads with a hotter cache or read replica strategy.',
          'Batch or defer secondary writes instead of expanding the hot path.',
          'Partition only after you can name the access pattern that is saturating the primary.'
        ]
      })
    }

    if (node.type === 'queue' && (node.utilization > 0.85 || node.queueDepth > 5000)) {
      findings.push({
        severity: 'medium',
        title: `${node.label} is building backlog`,
        summary: 'Async work is piling up faster than consumers can drain it, which will eventually leak into stale analytics or delayed side effects.',
        fixes: [
          'Scale workers or batch consumers so the queue drains faster than it fills.',
          'Drop or sample low-value analytics before critical events.',
          'Add backpressure so queue lag does not silently grow during spikes.'
        ]
      })
    }

    if ((node.type === 'service' || node.type === 'edge' || node.type === 'worker') && node.utilization > 0.88) {
      findings.push({
        severity: 'medium',
        title: `${node.label} is running too hot`,
        summary: `Utilization is about ${percent(node.utilization)}, leaving very little room for burst or retry traffic.`,
        fixes: [
          'Scale the stateless tier horizontally or reduce per-request work.',
          'Protect the service with caching, rate limits, or load shedding.',
          'Remove non-essential fan-out from the synchronous path.'
        ]
      })
    }
  }

  return findings
}
