/**
 * System-design component catalog for the HLD simulation lab.
 * Each entry is a first-class palette type; `physics` maps onto the capacity engine.
 */

/** @typedef {'edge' | 'service' | 'cache' | 'database' | 'queue' | 'worker'} PhysicsType */

/**
 * @typedef {{
 *   id: string,
 *   label: string,
 *   category: string,
 *   physics: PhysicsType,
 *   short: string,
 *   whenToUse: string[],
 *   pitfalls: string[],
 *   defaults: { latencyMs: number, capacityRps: number, queueCapacity: number, hitRate?: number },
 *   color: string,
 *   accent: string,
 *   icon: string,
 *   diagram?: { kind: 'primer', src: string, alt: string, caption?: string } | { kind: 'svg', caption?: string }
 * }} ComponentDef
 */

/** @type {{ id: string, label: string, hint: string }[]} */
export const COMPONENT_CATEGORIES = [
  { id: 'edge', label: 'Edge & traffic', hint: 'How requests enter and are steered' },
  { id: 'compute', label: 'Compute & APIs', hint: 'Services that own request logic' },
  { id: 'data', label: 'Data & storage', hint: 'Caches, databases, and derived stores' },
  { id: 'messaging', label: 'Messaging & async', hint: 'Queues, streams, and workers' },
  { id: 'security', label: 'Security & policy', hint: 'Auth, limits, and edge controls' }
]

/** @type {Record<PhysicsType, { latencyMs: number, capacityRps: number, queueCapacity: number, hitRate?: number }>} */
export const PHYSICS_DEFAULTS = {
  edge: { latencyMs: 4, capacityRps: 60000, queueCapacity: 0 },
  service: { latencyMs: 12, capacityRps: 20000, queueCapacity: 2000 },
  cache: { latencyMs: 3, capacityRps: 90000, queueCapacity: 40000, hitRate: 0.85 },
  database: { latencyMs: 18, capacityRps: 7000, queueCapacity: 8000 },
  queue: { latencyMs: 10, capacityRps: 30000, queueCapacity: 120000 },
  worker: { latencyMs: 20, capacityRps: 20000, queueCapacity: 20000 }
}

/** @type {ComponentDef[]} */
export const COMPONENT_CATALOG = [
  {
    id: 'edge',
    label: 'Client / edge entry',
    category: 'edge',
    physics: 'edge',
    short: 'Traffic origin or front-door entry point for the request path.',
    whenToUse: ['Start every design with where users or devices enter.', 'Model DNS/client fan-in before deeper hops.'],
    pitfalls: ['Skipping the edge makes capacity math ignore real ingress limits.'],
    defaults: { ...PHYSICS_DEFAULTS.edge },
    color: '#1b3a4b',
    accent: '#5ec8f0',
    icon: 'clients',
    diagram: {
      kind: 'primer',
      src: '/primer-images/IOyLj4i.jpg',
      alt: 'DNS and traffic steering diagram',
      caption: 'Clients resolve names and enter through edge routing.'
    }
  },
  {
    id: 'dns',
    label: 'DNS',
    category: 'edge',
    physics: 'edge',
    short: 'Name resolution and coarse traffic steering (geo, weighted, failover).',
    whenToUse: ['Multi-region entry', 'Blue/green or canary shifts at coarse granularity'],
    pitfalls: ['DNS is cached — never treat it as instant failover.'],
    defaults: { latencyMs: 5, capacityRps: 120000, queueCapacity: 0 },
    color: '#1b3a4b',
    accent: '#5ec8f0',
    icon: 'dns',
    diagram: {
      kind: 'primer',
      src: '/primer-images/IOyLj4i.jpg',
      alt: 'DNS fundamentals diagram',
      caption: 'DNS steers traffic before load balancers see a request.'
    }
  },
  {
    id: 'cdn',
    label: 'CDN',
    category: 'edge',
    physics: 'cache',
    short: 'Edge cache for static and cacheable responses near users.',
    whenToUse: ['Static assets', 'Public cacheable API responses', 'Origin offload'],
    pitfalls: ['Do not cache personalized or authenticated content without careful keys.'],
    defaults: { latencyMs: 2, capacityRps: 150000, queueCapacity: 80000, hitRate: 0.92 },
    color: '#243b55',
    accent: '#7dd3fc',
    icon: 'cdn',
    diagram: {
      kind: 'primer',
      src: '/primer-images/h9TAuGI.jpg',
      alt: 'CDN architecture diagram',
      caption: 'CDN PoPs absorb hits and shield origin capacity.'
    }
  },
  {
    id: 'load-balancer',
    label: 'Load balancer',
    category: 'edge',
    physics: 'service',
    short: 'Distributes traffic across instances (L4/L7) with health checks.',
    whenToUse: ['Horizontal scale', 'TLS termination', 'Canary / blue-green routing'],
    pitfalls: ['Sticky sessions hide statefulness and weaken elasticity.'],
    defaults: { latencyMs: 3, capacityRps: 80000, queueCapacity: 5000 },
    color: '#2a3344',
    accent: '#93c5fd',
    icon: 'load-balancer',
    diagram: {
      kind: 'primer',
      src: '/primer-images/h81n9iK.png',
      alt: 'Load balancer diagram',
      caption: 'Balancers spread load and gate unhealthy backends.'
    }
  },
  {
    id: 'api-gateway',
    label: 'API gateway',
    category: 'edge',
    physics: 'service',
    short: 'Thin edge for auth, routing, rate limits, and request shaping.',
    whenToUse: ['Many clients sharing cross-cutting policy', 'Path-based service routing'],
    pitfalls: ['Do not put product orchestration or domain rules in the gateway.'],
    defaults: { latencyMs: 6, capacityRps: 45000, queueCapacity: 4000 },
    color: '#2a3344',
    accent: '#a5b4fc',
    icon: 'api-gateway',
    diagram: {
      kind: 'primer',
      src: '/primer-images/n41Azff.png',
      alt: 'API gateway and reverse proxy diagram',
      caption: 'Gateways own policy; services own business logic.'
    }
  },
  {
    id: 'service',
    label: 'Application service',
    category: 'compute',
    physics: 'service',
    short: 'Stateless app tier that owns business logic and orchestration.',
    whenToUse: ['Core request handling', 'Domain workflows', 'BFF / API servers'],
    pitfalls: ['Hidden local state breaks horizontal scale.'],
    defaults: { ...PHYSICS_DEFAULTS.service },
    color: '#2b2c40',
    accent: '#696cff',
    icon: 'service',
    diagram: {
      kind: 'primer',
      src: '/primer-images/yB5SYwm.png',
      alt: 'Application layer diagram',
      caption: 'Services own invariants and call data / async dependencies.'
    }
  },
  {
    id: 'auth-service',
    label: 'Auth service',
    category: 'security',
    physics: 'service',
    short: 'Authentication and token/session validation for protected paths.',
    whenToUse: ['Login, token issue/refresh', 'Central authn for many APIs'],
    pitfalls: ['Auth on every hop without caching JWKS/sessions becomes a hotspot.'],
    defaults: { latencyMs: 10, capacityRps: 28000, queueCapacity: 3000 },
    color: '#3b2f45',
    accent: '#e879f9',
    icon: 'auth-service',
    diagram: {
      kind: 'svg',
      caption: 'Keep auth checks fast with cached keys and short-lived tokens.'
    }
  },
  {
    id: 'rate-limiter',
    label: 'Rate limiter',
    category: 'security',
    physics: 'service',
    short: 'Protects backends by shedding or delaying excess traffic.',
    whenToUse: ['Abuse protection', 'Fairness across tenants', 'Launch-day spikes'],
    pitfalls: ['Limit too late in the path — place it at the edge when possible.'],
    defaults: { latencyMs: 2, capacityRps: 90000, queueCapacity: 1000 },
    color: '#3b2f45',
    accent: '#f0abfc',
    icon: 'rate-limiter',
    diagram: {
      kind: 'svg',
      caption: 'Shed low-value traffic before expensive hops.'
    }
  },
  {
    id: 'waf',
    label: 'WAF / edge policy',
    category: 'security',
    physics: 'edge',
    short: 'Blocks common exploits and enforces edge security policy.',
    whenToUse: ['Public internet entry', 'Bot / OWASP-style filtering'],
    pitfalls: ['Overly strict rules can break legitimate clients — stage rollouts.'],
    defaults: { latencyMs: 3, capacityRps: 100000, queueCapacity: 0 },
    color: '#3b2f45',
    accent: '#d946ef',
    icon: 'waf',
    diagram: {
      kind: 'svg',
      caption: 'Filter bad traffic before it consumes origin capacity.'
    }
  },
  {
    id: 'realtime',
    label: 'Realtime / WebSocket',
    category: 'compute',
    physics: 'service',
    short: 'Long-lived connections for push, presence, or streaming UX.',
    whenToUse: ['Chat, notifications, live boards', 'Presence and typing indicators'],
    pitfalls: ['Connection fan-out and sticky routing need explicit capacity planning.'],
    defaults: { latencyMs: 8, capacityRps: 15000, queueCapacity: 8000 },
    color: '#2b2c40',
    accent: '#818cf8',
    icon: 'realtime',
    diagram: {
      kind: 'svg',
      caption: 'Separate connection tier from fan-out and persistence.'
    }
  },
  {
    id: 'cache',
    label: 'Cache (Redis / Memcached)',
    category: 'data',
    physics: 'cache',
    short: 'In-memory hot-key store to cut latency and protect the database.',
    whenToUse: ['Read-heavy paths', 'Session / hot entity caching', 'Stampede protection'],
    pitfalls: ['Weak keys and missing negative caching cause miss storms.'],
    defaults: { ...PHYSICS_DEFAULTS.cache },
    color: '#1f3d2f',
    accent: '#4ade80',
    icon: 'cache',
    diagram: {
      kind: 'primer',
      src: '/primer-images/Q6z24La.png',
      alt: 'Caching layers diagram',
      caption: 'Caches sit on the hot path; misses fall through to source of truth.'
    }
  },
  {
    id: 'database',
    label: 'Primary database',
    category: 'data',
    physics: 'database',
    short: 'Source of truth for durable reads and writes.',
    whenToUse: ['Transactional state', 'Strong consistency needs', 'Canonical entities'],
    pitfalls: ['Putting every read on the primary without cache or replicas.'],
    defaults: { ...PHYSICS_DEFAULTS.database },
    color: '#3a2e1f',
    accent: '#fbbf24',
    icon: 'database',
    diagram: {
      kind: 'primer',
      src: '/primer-images/C9ioGtn.png',
      alt: 'Replication and primary store diagram',
      caption: 'Primaries own writes; plan failover and lag explicitly.'
    }
  },
  {
    id: 'read-replica',
    label: 'Read replica',
    category: 'data',
    physics: 'database',
    short: 'Async replica that offloads read traffic with bounded lag.',
    whenToUse: ['Read scale-out', 'Reporting / feed queries that tolerate lag'],
    pitfalls: ['Read-your-writes bugs if you ignore replica lag.'],
    defaults: { latencyMs: 16, capacityRps: 12000, queueCapacity: 10000 },
    color: '#3a2e1f',
    accent: '#f59e0b',
    icon: 'read-replica',
    diagram: {
      kind: 'primer',
      src: '/primer-images/C9ioGtn.png',
      alt: 'Read replica diagram',
      caption: 'Replicas trade freshness for read throughput.'
    }
  },
  {
    id: 'object-storage',
    label: 'Object storage',
    category: 'data',
    physics: 'database',
    short: 'Blob store for media, backups, and large immutable objects.',
    whenToUse: ['Images, video, exports', 'Data lake landing zones'],
    pitfalls: ['Using object storage as a low-latency primary index.'],
    defaults: { latencyMs: 40, capacityRps: 25000, queueCapacity: 20000 },
    color: '#3a2e1f',
    accent: '#d97706',
    icon: 'object-storage',
    diagram: {
      kind: 'primer',
      src: '/primer-images/wXGqG5f.png',
      alt: 'Polyglot storage diagram',
      caption: 'Object storage holds blobs; metadata stays in a primary store.'
    }
  },
  {
    id: 'search-index',
    label: 'Search index',
    category: 'data',
    physics: 'database',
    short: 'Derived inverted index for full-text and faceted search.',
    whenToUse: ['Product search', 'Log exploration', 'Typeahead'],
    pitfalls: ['Never treat search as the sole source of truth.'],
    defaults: { latencyMs: 22, capacityRps: 14000, queueCapacity: 12000 },
    color: '#3a2e1f',
    accent: '#ea580c',
    icon: 'search-index',
    diagram: {
      kind: 'primer',
      src: '/primer-images/n16iOGk.png',
      alt: 'Search and specialized store diagram',
      caption: 'Indexes are derived — sync them from the primary write path.'
    }
  },
  {
    id: 'kv-store',
    label: 'Key-value store',
    category: 'data',
    physics: 'cache',
    short: 'Fast key lookups for sessions, feature flags, or simple entities.',
    whenToUse: ['Session stores', 'Feature flags', 'Hot ID → value maps'],
    pitfalls: ['Overloading a KV store with relational queries.'],
    defaults: { latencyMs: 2, capacityRps: 100000, queueCapacity: 50000, hitRate: 0.95 },
    color: '#1f3d2f',
    accent: '#34d399',
    icon: 'kv-store',
    diagram: {
      kind: 'svg',
      caption: 'KV stores excel at simple, hot key access patterns.'
    }
  },
  {
    id: 'shard',
    label: 'Shard / partition',
    category: 'data',
    physics: 'database',
    short: 'Horizontal partition of data by a well-chosen key.',
    whenToUse: ['Single primary cannot absorb write/read load', 'Tenant or key-range isolation'],
    pitfalls: ['Bad shard keys create hot partitions that negate the split.'],
    defaults: { latencyMs: 18, capacityRps: 9000, queueCapacity: 9000 },
    color: '#3a2e1f',
    accent: '#fcd34d',
    icon: 'shard',
    diagram: {
      kind: 'primer',
      src: '/primer-images/wU8x5Id.png',
      alt: 'Sharding diagram',
      caption: 'Partition by access pattern; plan rebalancing early.'
    }
  },
  {
    id: 'queue',
    label: 'Message queue',
    category: 'messaging',
    physics: 'queue',
    short: 'Durable buffer that decouples producers from consumers.',
    whenToUse: ['Async side effects', 'Absorb write bursts', 'Retryable work'],
    pitfalls: ['Unbounded queues hide outages until lag becomes user-visible.'],
    defaults: { ...PHYSICS_DEFAULTS.queue },
    color: '#1f2f3a',
    accent: '#38bdf8',
    icon: 'queue',
    diagram: {
      kind: 'primer',
      src: '/primer-images/ONjORqk.png',
      alt: 'Message queue diagram',
      caption: 'Queues isolate latency-sensitive paths from background work.'
    }
  },
  {
    id: 'stream',
    label: 'Event stream',
    category: 'messaging',
    physics: 'queue',
    short: 'Ordered log for event-driven and replayable processing.',
    whenToUse: ['CDC / event sourcing', 'Multiple consumers', 'Replay and audit'],
    pitfalls: ['Treating a stream like a simple RPC bus without offsets and retention.'],
    defaults: { latencyMs: 8, capacityRps: 40000, queueCapacity: 200000 },
    color: '#1f2f3a',
    accent: '#22d3ee',
    icon: 'stream',
    diagram: {
      kind: 'svg',
      caption: 'Streams support fan-out and replay with consumer offsets.'
    }
  },
  {
    id: 'pubsub',
    label: 'Pub/Sub',
    category: 'messaging',
    physics: 'queue',
    short: 'Fan-out messaging where many subscribers react to topics.',
    whenToUse: ['Notifications', 'Cache invalidation fan-out', 'Domain events'],
    pitfalls: ['At-least-once delivery needs idempotent subscribers.'],
    defaults: { latencyMs: 9, capacityRps: 35000, queueCapacity: 150000 },
    color: '#1f2f3a',
    accent: '#67e8f9',
    icon: 'pubsub',
    diagram: {
      kind: 'svg',
      caption: 'Pub/Sub fans events out without coupling producers to consumers.'
    }
  },
  {
    id: 'worker',
    label: 'Worker / consumer',
    category: 'messaging',
    physics: 'worker',
    short: 'Background processor that drains queues or streams.',
    whenToUse: ['Analytics, email, encoding', 'Retry and repair jobs'],
    pitfalls: ['Under-scaled workers turn async decoupling into silent backlog.'],
    defaults: { ...PHYSICS_DEFAULTS.worker },
    color: '#243044',
    accent: '#60a5fa',
    icon: 'worker',
    diagram: {
      kind: 'primer',
      src: '/primer-images/54GYsSx.png',
      alt: 'Async workers diagram',
      caption: 'Workers must drain faster than producers fill under peak load.'
    }
  }
]

/** @type {Map<string, ComponentDef>} */
const catalogById = new Map(COMPONENT_CATALOG.map((entry) => [entry.id, entry]))

/** Legacy physics ids remain valid DSL types. */
const PHYSICS_AS_COMPONENTS = new Set(Object.keys(PHYSICS_DEFAULTS))

/**
 * @param {string} type
 * @returns {ComponentDef | null}
 */
export function getComponent(type) {
  return catalogById.get(type) ?? null
}

/**
 * @param {string} type
 * @returns {PhysicsType}
 */
export function resolvePhysics(type) {
  const component = catalogById.get(type)
  if (component) return component.physics
  if (PHYSICS_AS_COMPONENTS.has(type)) return /** @type {PhysicsType} */ (type)
  return 'service'
}

/**
 * @param {string} type
 * @returns {{ latencyMs: number, capacityRps: number, queueCapacity: number, hitRate?: number }}
 */
export function getTypeDefaults(type) {
  const component = catalogById.get(type)
  if (component) return { ...component.defaults }
  const physics = resolvePhysics(type)
  return { ...PHYSICS_DEFAULTS[physics] }
}

/** @returns {ComponentDef[]} */
export function listComponents() {
  return COMPONENT_CATALOG
}

/**
 * @param {string} categoryId
 * @returns {ComponentDef[]}
 */
export function listComponentsByCategory(categoryId) {
  return COMPONENT_CATALOG.filter((entry) => entry.category === categoryId)
}

/**
 * Defaults keyed by every known type id (physics + catalog).
 * @returns {Record<string, { latencyMs: number, capacityRps: number, queueCapacity: number, hitRate?: number }>}
 */
export function buildDefaultNodeByType() {
  /** @type {Record<string, { latencyMs: number, capacityRps: number, queueCapacity: number, hitRate?: number }>} */
  const defaults = { ...PHYSICS_DEFAULTS }
  for (const component of COMPONENT_CATALOG) {
    defaults[component.id] = { ...component.defaults }
  }
  return defaults
}

/**
 * Human label for a type id.
 * @param {string} type
 */
export function getTypeLabel(type) {
  return catalogById.get(type)?.label ?? type
}

/**
 * Color accents for canvas rendering.
 * @param {string} type
 */
export function getTypeStyle(type) {
  const component = catalogById.get(type)
  if (component) {
    return { fill: component.color, accent: component.accent, icon: component.icon }
  }
  const physics = resolvePhysics(type)
  const fallback = catalogById.get(physics)
  return {
    fill: fallback?.color ?? '#2b2c40',
    accent: fallback?.accent ?? '#696cff',
    icon: fallback?.icon ?? physics
  }
}
