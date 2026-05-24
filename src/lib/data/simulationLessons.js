import { lessonIndex } from './courseData.js'

/** @type {Record<string, any>} */
const authoredSimulationLessons = {
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

/** @type {Record<string, any>} */
const moduleBlueprints = {
  foundations: {
    title: 'Foundations under pressure',
    summary: 'Turn estimation and baseline trade-offs into an actual workload so you can see which assumption breaks first.',
    diagram: `node client type=edge label="Client entry" latencyMs=4 capacityRps=90000
node gateway type=service label="Gateway" latencyMs=8 capacityRps=48000
node app type=service label="Core app" latencyMs=14 capacityRps=26000
node cache type=cache label="Hot cache" latencyMs=3 capacityRps=110000 queueCapacity=50000 hitRate=0.88
node primary type=database label="Primary store" latencyMs=22 capacityRps=9000 queueCapacity=9000
node replica type=database label="Read replica" latencyMs=16 capacityRps=18000 queueCapacity=9000
node queue type=queue label="Async queue" latencyMs=12 capacityRps=36000 queueCapacity=140000
node workers type=worker label="Background workers" latencyMs=24 capacityRps=22000
link client -> gateway
link gateway -> app
link app -> cache
link app -> primary
link app -> replica
link app -> queue async=true
link queue -> workers async=true`,
    apis: [
      {
        id: 'read-path',
        label: 'Read-heavy request',
        summary: 'Hot reads use cache first, then fall back to the replica when needed.',
        timeoutMs: 260,
        retries: 1,
        payloadKb: 1,
        stages: [
          { nodeId: 'client', mode: 'always' },
          { nodeId: 'gateway', sourceNodeId: 'client', mode: 'always' },
          { nodeId: 'app', sourceNodeId: 'gateway', mode: 'always' },
          { nodeId: 'cache', sourceNodeId: 'app', mode: 'always', kind: 'cache', hitRate: 0.88 },
          { nodeId: 'replica', sourceNodeId: 'app', mode: 'cache-miss' },
          { nodeId: 'queue', sourceNodeId: 'app', mode: 'async', callsPerRequest: 0.35 },
          { nodeId: 'workers', sourceNodeId: 'queue', mode: 'async', callsPerRequest: 0.35 }
        ],
        focusMetrics: ['p95 latency', 'cache hit ratio', 'replica utilization', 'retry amplification']
      },
      {
        id: 'write-path',
        label: 'Write / state change',
        summary: 'A synchronous write path that persists state and publishes async follow-up work.',
        timeoutMs: 460,
        retries: 2,
        payloadKb: 2,
        stages: [
          { nodeId: 'client', mode: 'always' },
          { nodeId: 'gateway', sourceNodeId: 'client', mode: 'always' },
          { nodeId: 'app', sourceNodeId: 'gateway', mode: 'always' },
          { nodeId: 'primary', sourceNodeId: 'app', mode: 'always' },
          { nodeId: 'queue', sourceNodeId: 'app', mode: 'async', callsPerRequest: 0.8 },
          { nodeId: 'workers', sourceNodeId: 'queue', mode: 'async', callsPerRequest: 0.8 }
        ],
        focusMetrics: ['write p95', 'primary utilization', 'queue depth', 'dropped traffic']
      }
    ],
    workloadProfiles: [
      { id: 'steady-read', label: 'Steady reads', endpointId: 'read-path', description: 'Normal usage with healthy cache behavior.', workload: { rpm: 520000, concurrency: 1800, retries: 0 } },
      { id: 'spiky-read', label: 'Sudden spike', endpointId: 'read-path', description: 'A burst that exposes hidden latency headroom issues.', workload: { rpm: 1500000, concurrency: 7000, retries: 1 } },
      { id: 'write-burst', label: 'Write burst', endpointId: 'write-path', description: 'Traffic shifts toward synchronous state changes.', workload: { rpm: 240000, concurrency: 1200, retries: 2 } }
    ],
    scriptTemplate: `workload('read-path', { rpm: 1650000, concurrency: 7800, retries: 2 })
failure('cache', { hitRate: 0.7, extraLatencyMs: 8 })
node('primary', { capacityRps: 7600, latencyMs: 28 })`
  },
  'edge-and-routing': {
    title: 'Edge routing simulator',
    summary: 'Watch the edge, cache, and origin layers react as traffic shape changes across regions and protection controls.',
    diagram: `node client type=edge label="Client traffic" latencyMs=5 capacityRps=120000
node dns type=edge label="DNS / anycast" latencyMs=8 capacityRps=95000
node cdn type=cache label="CDN edge cache" latencyMs=3 capacityRps=140000 queueCapacity=50000 hitRate=0.9
node gateway type=service label="Gateway / proxy" latencyMs=10 capacityRps=42000
node origin type=service label="Origin service" latencyMs=18 capacityRps=22000
node limiter type=service label="Policy / rate limit" latencyMs=6 capacityRps=50000
node queue type=queue label="Async logs" latencyMs=9 capacityRps=28000 queueCapacity=120000
node workers type=worker label="Analytics workers" latencyMs=20 capacityRps=20000
link client -> dns
link dns -> cdn
link cdn -> gateway
link gateway -> limiter
link limiter -> origin
link gateway -> queue async=true
link queue -> workers async=true`,
    apis: [
      {
        id: 'cached-request',
        label: 'Cached edge request',
        summary: 'DNS and CDN keep the hot path fast while the origin remains protected.',
        timeoutMs: 220,
        retries: 1,
        payloadKb: 1,
        stages: [
          { nodeId: 'client', mode: 'always' },
          { nodeId: 'dns', sourceNodeId: 'client', mode: 'always' },
          { nodeId: 'cdn', sourceNodeId: 'dns', mode: 'always', kind: 'cache', hitRate: 0.9 },
          { nodeId: 'gateway', sourceNodeId: 'cdn', mode: 'cache-miss' },
          { nodeId: 'limiter', sourceNodeId: 'gateway', mode: 'cache-miss' },
          { nodeId: 'origin', sourceNodeId: 'limiter', mode: 'cache-miss' },
          { nodeId: 'queue', sourceNodeId: 'gateway', mode: 'async', callsPerRequest: 0.5 },
          { nodeId: 'workers', sourceNodeId: 'queue', mode: 'async', callsPerRequest: 0.5 }
        ],
        focusMetrics: ['CDN hit ratio', 'origin utilization', 'edge p95', 'policy saturation']
      },
      {
        id: 'protected-origin',
        label: 'Origin-bound request',
        summary: 'Requests miss cache and exercise gateway policy plus origin capacity.',
        timeoutMs: 320,
        retries: 1,
        payloadKb: 2,
        stages: [
          { nodeId: 'client', mode: 'always' },
          { nodeId: 'dns', sourceNodeId: 'client', mode: 'always' },
          { nodeId: 'cdn', sourceNodeId: 'dns', mode: 'always', kind: 'cache', hitRate: 0.25 },
          { nodeId: 'gateway', sourceNodeId: 'cdn', mode: 'cache-miss' },
          { nodeId: 'limiter', sourceNodeId: 'gateway', mode: 'always' },
          { nodeId: 'origin', sourceNodeId: 'limiter', mode: 'always' },
          { nodeId: 'queue', sourceNodeId: 'gateway', mode: 'async', callsPerRequest: 0.4 },
          { nodeId: 'workers', sourceNodeId: 'queue', mode: 'async', callsPerRequest: 0.4 }
        ],
        focusMetrics: ['gateway p95', 'origin dropped rps', 'rate-limit effectiveness', 'queue backlog']
      }
    ],
    workloadProfiles: [
      { id: 'global-steady', label: 'Global steady traffic', endpointId: 'cached-request', description: 'Healthy cache distribution with normal regional mix.', workload: { rpm: 960000, concurrency: 2600, retries: 0 } },
      { id: 'regional-failover', label: 'Regional failover', endpointId: 'protected-origin', description: 'A region fails and origin-bound traffic surges elsewhere.', workload: { rpm: 1320000, concurrency: 5600, retries: 1 } },
      { id: 'abuse-burst', label: 'Abuse burst', endpointId: 'protected-origin', description: 'Malicious or bursty traffic stresses policy and origin layers.', workload: { rpm: 1800000, concurrency: 7800, retries: 2 } }
    ],
    scriptTemplate: `workload('protected-origin', { rpm: 1950000, concurrency: 8400, retries: 2 })
failure('cdn', { hitRate: 0.45, extraLatencyMs: 6 })
node('origin', { capacityRps: 17000, latencyMs: 26 })`
  },
  'application-architecture': {
    title: 'Application architecture simulator',
    summary: 'Compare synchronous service hops against queued fan-out so you can explain where coupling shows up in production.',
    diagram: `node client type=edge label="Client entry" latencyMs=4 capacityRps=100000
node gateway type=service label="API gateway" latencyMs=7 capacityRps=60000
node app type=service label="Application service" latencyMs=13 capacityRps=26000
node discovery type=service label="Discovery / coordination" latencyMs=9 capacityRps=32000
node primary type=database label="Primary data store" latencyMs=20 capacityRps=9000 queueCapacity=9000
node queue type=queue label="Event queue" latencyMs=10 capacityRps=36000 queueCapacity=140000
node workers type=worker label="Async workers" latencyMs=22 capacityRps=22000
node realtime type=service label="Realtime delivery" latencyMs=11 capacityRps=26000
link client -> gateway
link gateway -> app
link app -> discovery
link app -> primary
link app -> queue async=true
link queue -> workers async=true
link app -> realtime`,
    apis: [
      {
        id: 'sync-api',
        label: 'Synchronous API call',
        summary: 'User-facing request that coordinates discovery, app logic, and storage.',
        timeoutMs: 340,
        retries: 1,
        payloadKb: 2,
        stages: [
          { nodeId: 'client', mode: 'always' },
          { nodeId: 'gateway', sourceNodeId: 'client', mode: 'always' },
          { nodeId: 'app', sourceNodeId: 'gateway', mode: 'always' },
          { nodeId: 'discovery', sourceNodeId: 'app', mode: 'always', callsPerRequest: 0.6 },
          { nodeId: 'primary', sourceNodeId: 'app', mode: 'always' },
          { nodeId: 'realtime', sourceNodeId: 'app', mode: 'always', callsPerRequest: 0.4 }
        ],
        focusMetrics: ['sync p95', 'discovery load', 'primary write pressure', 'realtime latency']
      },
      {
        id: 'event-fanout',
        label: 'Async event fan-out',
        summary: 'Work shifts behind the queue so downstream consumers can scale independently.',
        timeoutMs: 420,
        retries: 2,
        payloadKb: 2,
        stages: [
          { nodeId: 'client', mode: 'always' },
          { nodeId: 'gateway', sourceNodeId: 'client', mode: 'always' },
          { nodeId: 'app', sourceNodeId: 'gateway', mode: 'always' },
          { nodeId: 'primary', sourceNodeId: 'app', mode: 'always' },
          { nodeId: 'queue', sourceNodeId: 'app', mode: 'async' },
          { nodeId: 'workers', sourceNodeId: 'queue', mode: 'async' },
          { nodeId: 'realtime', sourceNodeId: 'app', mode: 'async', callsPerRequest: 0.6 }
        ],
        focusMetrics: ['queue depth', 'worker utilization', 'dropped async traffic', 'retry amplification']
      }
    ],
    workloadProfiles: [
      { id: 'interactive-traffic', label: 'Interactive traffic', endpointId: 'sync-api', description: 'Normal request/response behavior with moderate coordination.', workload: { rpm: 480000, concurrency: 2200, retries: 0 } },
      { id: 'chatty-service-mesh', label: 'Chatty service mesh', endpointId: 'sync-api', description: 'Extra downstream coordination magnifies latency.', workload: { rpm: 780000, concurrency: 4200, retries: 1 } },
      { id: 'fanout-burst', label: 'Fan-out burst', endpointId: 'event-fanout', description: 'Events pile up behind the queue while user traffic stays live.', workload: { rpm: 360000, concurrency: 1600, retries: 2 } }
    ],
    scriptTemplate: `workload('sync-api', { rpm: 900000, concurrency: 5000, retries: 1 })
node('discovery', { latencyMs: 16, capacityRps: 22000 })
failure('queue', { extraLatencyMs: 12 })`
  },
  'data-storage': {
    title: 'Storage topology lab',
    summary: 'Use the simulator to see when primary, replica, shard, or queue pressure should change your storage story.',
    diagram: `node client type=edge label="Client traffic" latencyMs=4 capacityRps=100000
node api type=service label="Storage API" latencyMs=10 capacityRps=38000
node cache type=cache label="Read cache" latencyMs=3 capacityRps=120000 queueCapacity=50000 hitRate=0.84
node primary type=database label="Primary store" latencyMs=20 capacityRps=8500 queueCapacity=9000
node replica type=database label="Replica / secondary" latencyMs=16 capacityRps=17000 queueCapacity=9000
node shard type=database label="Partitioned shard group" latencyMs=18 capacityRps=21000 queueCapacity=10000
node queue type=queue label="CDC / replication queue" latencyMs=11 capacityRps=30000 queueCapacity=160000
node workers type=worker label="Replication workers" latencyMs=24 capacityRps=18000
link client -> api
link api -> cache
link api -> primary
link api -> replica
link api -> shard
link primary -> queue async=true
link queue -> workers async=true`,
    apis: [
      {
        id: 'read-path',
        label: 'Read path',
        summary: 'Cache-first reads fall back to replicas or shards depending on topology.',
        timeoutMs: 280,
        retries: 1,
        payloadKb: 1,
        stages: [
          { nodeId: 'client', mode: 'always' },
          { nodeId: 'api', sourceNodeId: 'client', mode: 'always' },
          { nodeId: 'cache', sourceNodeId: 'api', mode: 'always', kind: 'cache', hitRate: 0.84 },
          { nodeId: 'replica', sourceNodeId: 'api', mode: 'cache-miss' },
          { nodeId: 'shard', sourceNodeId: 'api', mode: 'cache-miss', callsPerRequest: 0.45 },
          { nodeId: 'queue', sourceNodeId: 'primary', mode: 'async', callsPerRequest: 0.2 },
          { nodeId: 'workers', sourceNodeId: 'queue', mode: 'async', callsPerRequest: 0.2 }
        ],
        focusMetrics: ['read p95', 'replica utilization', 'shard pressure', 'cache hit ratio']
      },
      {
        id: 'write-path',
        label: 'Write path',
        summary: 'Synchronous writes persist on the primary and trigger replication work.',
        timeoutMs: 500,
        retries: 2,
        payloadKb: 2,
        stages: [
          { nodeId: 'client', mode: 'always' },
          { nodeId: 'api', sourceNodeId: 'client', mode: 'always' },
          { nodeId: 'primary', sourceNodeId: 'api', mode: 'always' },
          { nodeId: 'queue', sourceNodeId: 'primary', mode: 'async' },
          { nodeId: 'workers', sourceNodeId: 'queue', mode: 'async' }
        ],
        focusMetrics: ['write p95', 'primary utilization', 'replication queue depth', 'retry amplification']
      }
    ],
    workloadProfiles: [
      { id: 'cache-warm', label: 'Warm read traffic', endpointId: 'read-path', description: 'Most reads stay near cache and replicas.', workload: { rpm: 720000, concurrency: 2600, retries: 0 } },
      { id: 'replica-lag', label: 'Replica lag event', endpointId: 'read-path', description: 'Reads miss cache and replicas struggle to keep up.', workload: { rpm: 1180000, concurrency: 4800, retries: 1 } },
      { id: 'write-heavy-migration', label: 'Write-heavy migration', endpointId: 'write-path', description: 'Writes surge while replication stays asynchronous.', workload: { rpm: 260000, concurrency: 1400, retries: 2 } }
    ],
    scriptTemplate: `workload('read-path', { rpm: 1260000, concurrency: 5200, retries: 1 })
node('replica', { capacityRps: 11500, latencyMs: 24 })
failure('cache', { hitRate: 0.62, extraLatencyMs: 10 })`
  },
  'performance-and-resilience': {
    title: 'Resilience under load',
    summary: 'Push retries, queues, and cache behavior until the resilience pattern becomes visible in the metrics.',
    diagram: `node client type=edge label="Client traffic" latencyMs=4 capacityRps=100000
node api type=service label="Public API" latencyMs=9 capacityRps=42000
node cache type=cache label="Response cache" latencyMs=3 capacityRps=110000 queueCapacity=50000 hitRate=0.82
node primary type=database label="Primary dependency" latencyMs=20 capacityRps=9000 queueCapacity=9000
node secondary type=service label="Fallback service" latencyMs=15 capacityRps=18000
node queue type=queue label="Work queue" latencyMs=11 capacityRps=32000 queueCapacity=150000
node workers type=worker label="Async workers" latencyMs=24 capacityRps=20000
link client -> api
link api -> cache
link api -> primary
link api -> secondary
link api -> queue async=true
link queue -> workers async=true`,
    apis: [
      {
        id: 'interactive-call',
        label: 'Interactive request',
        summary: 'User-facing request balances cache, dependency latency, and degraded-mode options.',
        timeoutMs: 280,
        retries: 1,
        payloadKb: 1,
        stages: [
          { nodeId: 'client', mode: 'always' },
          { nodeId: 'api', sourceNodeId: 'client', mode: 'always' },
          { nodeId: 'cache', sourceNodeId: 'api', mode: 'always', kind: 'cache', hitRate: 0.82 },
          { nodeId: 'primary', sourceNodeId: 'api', mode: 'cache-miss' },
          { nodeId: 'secondary', sourceNodeId: 'api', mode: 'cache-miss', callsPerRequest: 0.5 },
          { nodeId: 'queue', sourceNodeId: 'api', mode: 'async', callsPerRequest: 0.3 },
          { nodeId: 'workers', sourceNodeId: 'queue', mode: 'async', callsPerRequest: 0.3 }
        ],
        focusMetrics: ['p95 latency', 'error rate', 'degraded-mode load', 'cache hit ratio']
      },
      {
        id: 'background-work',
        label: 'Background work',
        summary: 'Async work keeps running even while the primary path sheds load.',
        timeoutMs: 460,
        retries: 2,
        payloadKb: 2,
        stages: [
          { nodeId: 'client', mode: 'always' },
          { nodeId: 'api', sourceNodeId: 'client', mode: 'always' },
          { nodeId: 'queue', sourceNodeId: 'api', mode: 'async' },
          { nodeId: 'workers', sourceNodeId: 'queue', mode: 'async' },
          { nodeId: 'primary', sourceNodeId: 'api', mode: 'always', callsPerRequest: 0.6 }
        ],
        focusMetrics: ['queue depth', 'worker saturation', 'retry amplification', 'dropped async traffic']
      }
    ],
    workloadProfiles: [
      { id: 'healthy-steady', label: 'Healthy steady state', endpointId: 'interactive-call', description: 'A calm day with normal cache and retry behavior.', workload: { rpm: 560000, concurrency: 2200, retries: 0 } },
      { id: 'cache-degradation', label: 'Cache degradation', endpointId: 'interactive-call', description: 'Cache effectiveness falls and downstream pressure rises.', workload: { rpm: 1120000, concurrency: 4600, retries: 1 } },
      { id: 'retry-storm', label: 'Retry storm', endpointId: 'background-work', description: 'Failures drive more retries into the queue path.', workload: { rpm: 420000, concurrency: 2200, retries: 3 } }
    ],
    scriptTemplate: `failure('cache', { hitRate: 0.58, extraLatencyMs: 10 })
workload('interactive-call', { rpm: 1280000, concurrency: 5200, retries: 2 })
node('primary', { latencyMs: 30, capacityRps: 7200 })`
  },
  'security-and-operations': {
    title: 'Security and operations simulator',
    summary: 'Model how auth, audit, failover, and cost controls affect the request path instead of treating them as afterthoughts.',
    diagram: `node client type=edge label="Client traffic" latencyMs=4 capacityRps=100000
node edge type=edge label="Edge policy" latencyMs=6 capacityRps=85000
node auth type=service label="Auth / policy service" latencyMs=10 capacityRps=34000
node api type=service label="Core API" latencyMs=13 capacityRps=24000
node primary type=database label="Primary region" latencyMs=22 capacityRps=8500 queueCapacity=9000
node replica type=database label="Secondary region" latencyMs=18 capacityRps=16000 queueCapacity=9000
node audit type=queue label="Audit queue" latencyMs=10 capacityRps=26000 queueCapacity=150000
node workers type=worker label="Audit workers" latencyMs=24 capacityRps=18000
link client -> edge
link edge -> auth
link auth -> api
link api -> primary
link api -> replica
link api -> audit async=true
link audit -> workers async=true`,
    apis: [
      {
        id: 'authenticated-read',
        label: 'Authenticated request',
        summary: 'Auth and edge policy stay on the critical path for user-facing traffic.',
        timeoutMs: 320,
        retries: 1,
        payloadKb: 1,
        stages: [
          { nodeId: 'client', mode: 'always' },
          { nodeId: 'edge', sourceNodeId: 'client', mode: 'always' },
          { nodeId: 'auth', sourceNodeId: 'edge', mode: 'always' },
          { nodeId: 'api', sourceNodeId: 'auth', mode: 'always' },
          { nodeId: 'replica', sourceNodeId: 'api', mode: 'always' },
          { nodeId: 'audit', sourceNodeId: 'api', mode: 'async', callsPerRequest: 0.5 },
          { nodeId: 'workers', sourceNodeId: 'audit', mode: 'async', callsPerRequest: 0.5 }
        ],
        focusMetrics: ['auth latency', 'replica utilization', 'edge load', 'audit backlog']
      },
      {
        id: 'protected-write',
        label: 'Protected write',
        summary: 'Writes require policy checks, durable persistence, and audit fan-out.',
        timeoutMs: 520,
        retries: 2,
        payloadKb: 2,
        stages: [
          { nodeId: 'client', mode: 'always' },
          { nodeId: 'edge', sourceNodeId: 'client', mode: 'always' },
          { nodeId: 'auth', sourceNodeId: 'edge', mode: 'always' },
          { nodeId: 'api', sourceNodeId: 'auth', mode: 'always' },
          { nodeId: 'primary', sourceNodeId: 'api', mode: 'always' },
          { nodeId: 'audit', sourceNodeId: 'api', mode: 'async' },
          { nodeId: 'workers', sourceNodeId: 'audit', mode: 'async' }
        ],
        focusMetrics: ['write p95', 'primary utilization', 'auth saturation', 'audit queue depth']
      }
    ],
    workloadProfiles: [
      { id: 'steady-operations', label: 'Steady operations', endpointId: 'authenticated-read', description: 'Healthy regional traffic with auth and audit behaving normally.', workload: { rpm: 460000, concurrency: 2100, retries: 0 } },
      { id: 'regional-cutover', label: 'Regional cutover', endpointId: 'authenticated-read', description: 'Traffic shifts to the secondary path during a failover.', workload: { rpm: 980000, concurrency: 4700, retries: 1 } },
      { id: 'security-incident', label: 'Security incident', endpointId: 'protected-write', description: 'Stronger policy checks and heavier auditing increase latency.', workload: { rpm: 240000, concurrency: 1400, retries: 2 } }
    ],
    scriptTemplate: `workload('protected-write', { rpm: 320000, concurrency: 1800, retries: 2 })
node('auth', { latencyMs: 18, capacityRps: 22000 })
failure('replica', { extraLatencyMs: 14 })`
  },
  'distributed-systems': {
    title: 'Distributed systems simulator',
    summary: 'See coordination, quorum pressure, and hot partitions surface as measurable bottlenecks.',
    diagram: `node client type=edge label="Client traffic" latencyMs=4 capacityRps=90000
node coordinator type=service label="Coordinator" latencyMs=12 capacityRps=26000
node leader type=service label="Leader / owner" latencyMs=16 capacityRps=18000
node replicas type=database label="Replica set" latencyMs=18 capacityRps=24000 queueCapacity=10000
node cache type=cache label="Hot-key cache" latencyMs=3 capacityRps=120000 queueCapacity=50000 hitRate=0.8
node queue type=queue label="Replication queue" latencyMs=10 capacityRps=30000 queueCapacity=160000
node workers type=worker label="Background repair" latencyMs=22 capacityRps=18000
link client -> coordinator
link coordinator -> cache
link coordinator -> leader
link leader -> replicas
link leader -> queue async=true
link queue -> workers async=true`,
    apis: [
      {
        id: 'coordinated-read',
        label: 'Coordinated read',
        summary: 'Reads hit hot-key caches first and then fall back to the coordinated replica path.',
        timeoutMs: 300,
        retries: 1,
        payloadKb: 1,
        stages: [
          { nodeId: 'client', mode: 'always' },
          { nodeId: 'coordinator', sourceNodeId: 'client', mode: 'always' },
          { nodeId: 'cache', sourceNodeId: 'coordinator', mode: 'always', kind: 'cache', hitRate: 0.8 },
          { nodeId: 'leader', sourceNodeId: 'coordinator', mode: 'cache-miss', callsPerRequest: 0.5 },
          { nodeId: 'replicas', sourceNodeId: 'leader', mode: 'cache-miss' },
          { nodeId: 'queue', sourceNodeId: 'leader', mode: 'async', callsPerRequest: 0.25 },
          { nodeId: 'workers', sourceNodeId: 'queue', mode: 'async', callsPerRequest: 0.25 }
        ],
        focusMetrics: ['coordinator p95', 'leader utilization', 'cache hit ratio', 'repair backlog']
      },
      {
        id: 'coordinated-write',
        label: 'Coordinated write',
        summary: 'Writes go through the coordinator and leader before replication completes.',
        timeoutMs: 520,
        retries: 2,
        payloadKb: 2,
        stages: [
          { nodeId: 'client', mode: 'always' },
          { nodeId: 'coordinator', sourceNodeId: 'client', mode: 'always' },
          { nodeId: 'leader', sourceNodeId: 'coordinator', mode: 'always' },
          { nodeId: 'replicas', sourceNodeId: 'leader', mode: 'always' },
          { nodeId: 'queue', sourceNodeId: 'leader', mode: 'async' },
          { nodeId: 'workers', sourceNodeId: 'queue', mode: 'async' }
        ],
        focusMetrics: ['write p95', 'leader saturation', 'replica pressure', 'retry amplification']
      }
    ],
    workloadProfiles: [
      { id: 'balanced-quorum', label: 'Balanced quorum traffic', endpointId: 'coordinated-read', description: 'Healthy routing with moderate coordination cost.', workload: { rpm: 520000, concurrency: 2400, retries: 0 } },
      { id: 'hot-partition', label: 'Hot partition', endpointId: 'coordinated-read', description: 'A few keys become much hotter than the rest.', workload: { rpm: 1180000, concurrency: 5600, retries: 1 } },
      { id: 'leader-election-window', label: 'Leader election window', endpointId: 'coordinated-write', description: 'Writes spike while coordination gets more expensive.', workload: { rpm: 220000, concurrency: 1300, retries: 3 } }
    ],
    scriptTemplate: `workload('coordinated-read', { rpm: 1300000, concurrency: 6200, retries: 2 })
failure('cache', { hitRate: 0.55, extraLatencyMs: 8 })
node('leader', { capacityRps: 12500, latencyMs: 26 })`
  },
  'product-patterns': {
    title: 'Product workload simulator',
    summary: 'Use product-shaped traffic to explain where feeds, search, uploads, or messaging systems really bend.',
    diagram: `node client type=edge label="User traffic" latencyMs=4 capacityRps=110000
node api type=service label="Product API" latencyMs=10 capacityRps=32000
node cache type=cache label="User-facing cache" latencyMs=3 capacityRps=130000 queueCapacity=50000 hitRate=0.86
node primary type=database label="Primary store" latencyMs=22 capacityRps=9000 queueCapacity=9000
node index type=database label="Search / derived index" latencyMs=18 capacityRps=18000 queueCapacity=9000
node queue type=queue label="Fan-out queue" latencyMs=11 capacityRps=32000 queueCapacity=160000
node workers type=worker label="Processing workers" latencyMs=24 capacityRps=20000
node delivery type=service label="Delivery / notification edge" latencyMs=12 capacityRps=26000
link client -> api
link api -> cache
link api -> primary
link api -> index
link api -> queue async=true
link queue -> workers async=true
link workers -> delivery`,
    apis: [
      {
        id: 'read-path',
        label: 'User read path',
        summary: 'A user-facing read path that mixes cache hits with derived-index lookups.',
        timeoutMs: 280,
        retries: 1,
        payloadKb: 1,
        stages: [
          { nodeId: 'client', mode: 'always' },
          { nodeId: 'api', sourceNodeId: 'client', mode: 'always' },
          { nodeId: 'cache', sourceNodeId: 'api', mode: 'always', kind: 'cache', hitRate: 0.86 },
          { nodeId: 'index', sourceNodeId: 'api', mode: 'cache-miss' },
          { nodeId: 'delivery', sourceNodeId: 'workers', mode: 'async', callsPerRequest: 0.2 }
        ],
        focusMetrics: ['read p95', 'cache hit ratio', 'index utilization', 'delivery lag']
      },
      {
        id: 'write-fanout',
        label: 'Write with fan-out',
        summary: 'Writes persist to the primary store and then fan out through workers.',
        timeoutMs: 520,
        retries: 2,
        payloadKb: 2,
        stages: [
          { nodeId: 'client', mode: 'always' },
          { nodeId: 'api', sourceNodeId: 'client', mode: 'always' },
          { nodeId: 'primary', sourceNodeId: 'api', mode: 'always' },
          { nodeId: 'queue', sourceNodeId: 'api', mode: 'async' },
          { nodeId: 'workers', sourceNodeId: 'queue', mode: 'async' },
          { nodeId: 'delivery', sourceNodeId: 'workers', mode: 'async' }
        ],
        focusMetrics: ['write p95', 'queue depth', 'worker utilization', 'fan-out dropped rps']
      }
    ],
    workloadProfiles: [
      { id: 'steady-engagement', label: 'Steady engagement', endpointId: 'read-path', description: 'Normal product usage with warm cache and moderate fan-out.', workload: { rpm: 740000, concurrency: 3000, retries: 0 } },
      { id: 'viral-spike', label: 'Viral spike', endpointId: 'read-path', description: 'A few entities go viral and shift pressure to derived systems.', workload: { rpm: 1820000, concurrency: 7200, retries: 1 } },
      { id: 'creator-burst', label: 'Creator / write burst', endpointId: 'write-fanout', description: 'Heavy publishing or upload activity drives async fan-out.', workload: { rpm: 300000, concurrency: 1600, retries: 2 } }
    ],
    scriptTemplate: `workload('write-fanout', { rpm: 360000, concurrency: 2000, retries: 2 })
node('workers', { capacityRps: 15000, latencyMs: 30 })
failure('cache', { hitRate: 0.6, extraLatencyMs: 8 })`
  },
  'case-studies': {
    title: 'Case-study scenario lab',
    summary: 'Take the product shape from the case study and test one read path plus one write or ingestion path under pressure.',
    diagram: `node edge type=edge label="Edge entry" latencyMs=4 capacityRps=90000
node api type=service label="Case-study API" latencyMs=12 capacityRps=26000
node cache type=cache label="Hot path cache" latencyMs=3 capacityRps=110000 queueCapacity=50000 hitRate=0.84
node primary type=database label="Primary store" latencyMs=20 capacityRps=8500 queueCapacity=9000
node derived type=database label="Derived / read index" latencyMs=18 capacityRps=18000 queueCapacity=9000
node queue type=queue label="Async processing" latencyMs=10 capacityRps=32000 queueCapacity=160000
node workers type=worker label="Async workers" latencyMs=24 capacityRps=20000
link edge -> api
link api -> cache
link api -> primary
link api -> derived
link api -> queue async=true
link queue -> workers async=true`,
    apis: [
      {
        id: 'user-read',
        label: 'User-facing read',
        summary: 'A latency-sensitive read path with cache and derived index support.',
        timeoutMs: 260,
        retries: 1,
        payloadKb: 1,
        stages: [
          { nodeId: 'edge', mode: 'always' },
          { nodeId: 'api', sourceNodeId: 'edge', mode: 'always' },
          { nodeId: 'cache', sourceNodeId: 'api', mode: 'always', kind: 'cache', hitRate: 0.84 },
          { nodeId: 'derived', sourceNodeId: 'api', mode: 'cache-miss' },
          { nodeId: 'queue', sourceNodeId: 'api', mode: 'async', callsPerRequest: 0.3 },
          { nodeId: 'workers', sourceNodeId: 'queue', mode: 'async', callsPerRequest: 0.3 }
        ],
        focusMetrics: ['read p95', 'cache hit ratio', 'derived store utilization', 'queue backlog']
      },
      {
        id: 'ingest-path',
        label: 'Write / ingest path',
        summary: 'A durable write path that also triggers async processing or indexing.',
        timeoutMs: 520,
        retries: 2,
        payloadKb: 2,
        stages: [
          { nodeId: 'edge', mode: 'always' },
          { nodeId: 'api', sourceNodeId: 'edge', mode: 'always' },
          { nodeId: 'primary', sourceNodeId: 'api', mode: 'always' },
          { nodeId: 'queue', sourceNodeId: 'api', mode: 'async' },
          { nodeId: 'workers', sourceNodeId: 'queue', mode: 'async' }
        ],
        focusMetrics: ['write p95', 'primary utilization', 'worker saturation', 'retry amplification']
      }
    ],
    workloadProfiles: [
      { id: 'steady-product', label: 'Steady product traffic', endpointId: 'user-read', description: 'Normal user behavior across the case-study system.', workload: { rpm: 620000, concurrency: 2600, retries: 0 } },
      { id: 'hot-feature-launch', label: 'Hot feature launch', endpointId: 'user-read', description: 'User traffic spikes and derived systems become critical.', workload: { rpm: 1450000, concurrency: 6200, retries: 1 } },
      { id: 'ingestion-burst', label: 'Ingestion burst', endpointId: 'ingest-path', description: 'Writes or crawls surge while async work trails behind.', workload: { rpm: 280000, concurrency: 1500, retries: 2 } }
    ],
    scriptTemplate: `workload('user-read', { rpm: 1680000, concurrency: 7000, retries: 2 })
failure('cache', { hitRate: 0.66, extraLatencyMs: 8 })
node('primary', { capacityRps: 7000, latencyMs: 26 })`
  }
}

/** @type {Map<string, any>} */
const generatedSimulationCache = new Map()

/** @param {string} value */
function slugToLabel(value) {
  return value
    .split(/[-/]/g)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

/** @param {string} title */
function normalizeLessonTitle(title) {
  return title.replace(/^Case study:\s*/i, '')
}

/** @param {any} lesson */
function buildWhyItMatters(lesson) {
  const sectionA = lesson.sections?.[0]?.heading ?? lesson.title
  const sectionB = lesson.sections?.[1]?.heading ?? lesson.moduleTitle
  return [
    `Use this lab to turn "${normalizeLessonTitle(lesson.title)}" into a measurable system instead of a static definition.`,
    `Pressure the path around ${sectionA.toLowerCase()} and watch how it interacts with ${sectionB.toLowerCase()}.`,
    lesson.whyItMatters
  ]
}

/** @param {any} lesson */
function buildApiNotes(lesson) {
  return [
    `Start with the critical path from ${lesson.sections?.[0]?.heading ?? 'the first section'} and use the metrics to explain where latency or capacity moves.`,
    `Use the simulator to justify checklist items like ${lesson.checklist?.[0] ?? 'cache placement'} before you propose scaling changes.`,
    `Treat the async queue and worker path as the escape hatch for ideas from ${lesson.sections?.[1]?.heading ?? 'your second section'}.`
  ]
}

/** @param {any} lesson */
function buildRecommendationThemes(lesson) {
  const checklist = lesson.checklist?.slice(0, 3) ?? []
  if (checklist.length === 3) return checklist
  return [
    `Explain the trade-off behind ${lesson.title}.`,
    `Call out the first bottleneck you would expect in ${lesson.moduleTitle}.`,
    'State which work must stay synchronous and which work can move off the critical path.'
  ]
}

/** @param {any} lesson */
function buildGeneratedSimulationLesson(lesson) {
  const blueprint = /** @type {any} */ (moduleBlueprints[lesson.moduleSlug] ?? moduleBlueprints.foundations)
  const firstApi = blueprint.apis[0]
  const firstProfile = blueprint.workloadProfiles[1] ?? blueprint.workloadProfiles[0]
  const primaryNodeId = /primary/.test(blueprint.diagram)
    ? 'primary'
    : /origin/.test(blueprint.diagram)
      ? 'origin'
      : /leader/.test(blueprint.diagram)
        ? 'leader'
        : 'api'

  return {
    title: `Simulation lab: ${normalizeLessonTitle(lesson.title)}`,
    summary: `${blueprint.summary} Apply it to ${lesson.title.toLowerCase()} so the trade-offs feel concrete.`,
    whyItMatters: buildWhyItMatters(lesson),
    starterDiagram: blueprint.diagram,
    apiNotes: buildApiNotes(lesson),
    apis: blueprint.apis.map((/** @type {any} */ api) => ({
      ...api,
      summary: `${api.summary} Frame it around ${lesson.title.toLowerCase()}.`
    })),
    workloadProfiles: blueprint.workloadProfiles.map((/** @type {any} */ profile) => ({
      ...profile,
      description: `${profile.description} Use it to stress ${slugToLabel(lesson.slug).toLowerCase()}.`
    })),
    scriptTemplate: blueprint.scriptTemplate
      .replace(firstApi.id, firstProfile.endpointId)
      .replace(primaryNodeId, primaryNodeId),
    recommendationThemes: buildRecommendationThemes(lesson)
  }
}

/** @param {string} lessonId */
export function getSimulationLesson(lessonId) {
  if (authoredSimulationLessons[lessonId]) {
    return authoredSimulationLessons[lessonId]
  }

  if (generatedSimulationCache.has(lessonId)) {
    return generatedSimulationCache.get(lessonId) ?? null
  }

  const lesson = lessonIndex[lessonId]
  if (!lesson) {
    return null
  }

  const generated = buildGeneratedSimulationLesson(lesson)
  generatedSimulationCache.set(lessonId, generated)
  return generated
}
