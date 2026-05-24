export const simulationLessons = {
  'case-studies/url-shortener': {
    title: 'Simulation lab: URL shortener under load',
    summary:
      'Edit the topology, switch API workloads, inject failures, and see how redirect latency, write pressure, and queue lag evolve before you propose fixes.',
    whyItMatters: [
      'A system design answer gets stronger when you can connect traffic shape to concrete bottlenecks.',
      'Hot redirect traffic and asynchronous analytics stress a URL shortener in very different ways.',
      'The right fix depends on which node saturates first, not on the fanciest architecture.'
    ],
    starterDiagram: `node edge type=edge label="Edge redirect gateway" latencyMs=4 capacityRps=60000
node shortener type=service label="Shortener API" latencyMs=12 capacityRps=22000
node cache type=cache label="Redis hot-link cache" latencyMs=2 capacityRps=85000 hitRate=0.92 queueCapacity=45000
node primary type=database label="Primary link store" latencyMs=18 capacityRps=7500 queueCapacity=8000
node analytics type=queue label="Analytics queue" latencyMs=10 capacityRps=30000 queueCapacity=120000
node workers type=worker label="Analytics workers" latencyMs=22 capacityRps=20000
link edge -> shortener
link shortener -> cache
link shortener -> primary
link shortener -> analytics async=true
link analytics -> workers async=true`,
    apiNotes: [
      'The redirect API reads hot keys from cache and only hits the database on cache miss.',
      'The create API is write-heavy and should keep collision checks and persistence on the colder path.',
      'Analytics should stay asynchronous so a hot campaign does not make every click slower.'
    ],
    apis: [
      {
        id: 'redirect',
        label: 'GET /:code',
        summary: 'Latency-sensitive redirect path with cache lookup, miss fallback, and asynchronous analytics.',
        timeoutMs: 220,
        retries: 1,
        payloadKb: 1,
        stages: [
          { nodeId: 'edge', mode: 'always' },
          { nodeId: 'shortener', sourceNodeId: 'edge', mode: 'always' },
          { nodeId: 'cache', sourceNodeId: 'shortener', mode: 'always', kind: 'cache', hitRate: 0.92 },
          { nodeId: 'primary', sourceNodeId: 'shortener', mode: 'cache-miss' },
          { nodeId: 'analytics', sourceNodeId: 'shortener', mode: 'async' },
          { nodeId: 'workers', sourceNodeId: 'analytics', mode: 'async' }
        ],
        focusMetrics: ['redirect p95', 'cache hit ratio', 'database utilization', 'analytics queue depth']
      },
      {
        id: 'create-link',
        label: 'POST /links',
        summary: 'Create path that validates aliases, persists canonical mappings, and emits metadata asynchronously.',
        timeoutMs: 450,
        retries: 2,
        payloadKb: 2,
        stages: [
          { nodeId: 'edge', mode: 'always' },
          { nodeId: 'shortener', sourceNodeId: 'edge', mode: 'always', callsPerRequest: 1.1 },
          { nodeId: 'primary', sourceNodeId: 'shortener', mode: 'always' },
          { nodeId: 'analytics', sourceNodeId: 'shortener', mode: 'async', callsPerRequest: 0.6 },
          { nodeId: 'workers', sourceNodeId: 'analytics', mode: 'async', callsPerRequest: 0.6 }
        ],
        focusMetrics: ['create p95', 'primary write utilization', 'retry amplification', 'queue backlog']
      }
    ],
    workloadProfiles: [
      {
        id: 'steady-read',
        label: 'Steady redirect traffic',
        endpointId: 'redirect',
        description: 'Healthy day-to-day traffic with a warm cache and moderate concurrency.',
        workload: {
          rpm: 420000,
          concurrency: 1600,
          retries: 0
        }
      },
      {
        id: 'hot-campaign',
        label: 'Hot campaign launch',
        endpointId: 'redirect',
        description: 'A few redirect keys become globally hot and retry pressure appears once latency spikes.',
        workload: {
          rpm: 1500000,
          concurrency: 6400,
          retries: 1
        }
      },
      {
        id: 'alias-burst',
        label: 'Alias creation burst',
        endpointId: 'create-link',
        description: 'Writers hammer custom alias creation while abuse checks and metadata fan-out keep running.',
        workload: {
          rpm: 180000,
          concurrency: 900,
          retries: 2
        }
      }
    ],
    scriptTemplate: `// TypeScript-friendly simulation overrides
workload('redirect', { rpm: 1800000, concurrency: 7200, retries: 2 })
failure('cache', { hitRate: 0.74, extraLatencyMs: 10 })
node('primary', { capacityRps: 6200, latencyMs: 24 })`,
    recommendationThemes: [
      'Protect the hot redirect path before optimizing secondary analytics.',
      'Say what should stay synchronous and what should move behind queues.',
      'Choose fixes that match the measured bottleneck: cache, replica, queue, shard, or rate limit.'
    ]
  }
}

/** @param {string} lessonId */
export function getSimulationLesson(lessonId) {
  return simulationLessons[lessonId] ?? null
}
