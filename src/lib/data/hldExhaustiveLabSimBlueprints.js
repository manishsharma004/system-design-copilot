/** Simulation blueprints for exhaustive HLD lab modules.
 * Source of truth: scripts/hld_lab_content.py — regenerate with
 * `python3 scripts/build_hld_exhaustive_labs.py`.
 */
export const hldExhaustiveLabSimBlueprints = {
  "data-storage-lab": {
    "title": "Data storage lab simulator",
    "summary": "Stress read-path indexing, replica freshness, and projection lag across a storage topology with one authoritative write path and several derived consumers.",
    "diagram": "node client type=edge label=\"Client traffic\" latencyMs=5 capacityRps=90000\nnode api type=service label=\"Storage API\" latencyMs=10 capacityRps=32000\nnode cache type=cache label=\"Hot query cache\" latencyMs=3 capacityRps=120000 queueCapacity=50000 hitRate=0.9\nnode primary type=database label=\"Primary relational store\" latencyMs=24 capacityRps=9500 queueCapacity=9000\nnode replica type=database label=\"Read replica\" latencyMs=18 capacityRps=18000 queueCapacity=9000\nnode queue type=queue label=\"Projection queue\" latencyMs=11 capacityRps=30000 queueCapacity=140000\nnode workers type=worker label=\"Projection workers\" latencyMs=24 capacityRps=21000\nlink client -> api\nlink api -> cache\nlink api -> primary\nlink api -> replica\nlink api -> queue async=true\nlink queue -> workers async=true",
    "apis": [
      {
        "id": "indexed-read",
        "label": "GET /orders",
        "summary": "Tenant-scoped read path that uses cache first, then a replica or primary depending on freshness needs.",
        "timeoutMs": 260,
        "retries": 1,
        "payloadKb": 2,
        "stages": [
          {
            "nodeId": "client",
            "mode": "always"
          },
          {
            "nodeId": "api",
            "sourceNodeId": "client",
            "mode": "always"
          },
          {
            "nodeId": "cache",
            "sourceNodeId": "api",
            "mode": "always",
            "kind": "cache",
            "hitRate": 0.9
          },
          {
            "nodeId": "replica",
            "sourceNodeId": "api",
            "mode": "cache-miss"
          },
          {
            "nodeId": "primary",
            "sourceNodeId": "api",
            "mode": "conditional",
            "callsPerRequest": 0.2
          },
          {
            "nodeId": "queue",
            "sourceNodeId": "api",
            "mode": "async",
            "callsPerRequest": 0.25
          },
          {
            "nodeId": "workers",
            "sourceNodeId": "queue",
            "mode": "async",
            "callsPerRequest": 0.25
          }
        ],
        "focusMetrics": [
          "read p95",
          "cache hit ratio",
          "replica utilization",
          "projection lag"
        ]
      },
      {
        "id": "authoritative-write",
        "label": "POST /orders",
        "summary": "Write path that persists authoritative state then emits async projection work.",
        "timeoutMs": 480,
        "retries": 2,
        "payloadKb": 3,
        "stages": [
          {
            "nodeId": "client",
            "mode": "always"
          },
          {
            "nodeId": "api",
            "sourceNodeId": "client",
            "mode": "always"
          },
          {
            "nodeId": "primary",
            "sourceNodeId": "api",
            "mode": "always"
          },
          {
            "nodeId": "queue",
            "sourceNodeId": "api",
            "mode": "async",
            "callsPerRequest": 0.9
          },
          {
            "nodeId": "workers",
            "sourceNodeId": "queue",
            "mode": "async",
            "callsPerRequest": 0.9
          }
        ],
        "focusMetrics": [
          "write p95",
          "primary write utilization",
          "retry amplification",
          "queue depth"
        ]
      }
    ],
    "workloadProfiles": [
      {
        "id": "steady-dashboard",
        "label": "Steady dashboard reads",
        "endpointId": "indexed-read",
        "description": "Healthy cache behavior and mostly tolerant freshness requirements.",
        "workload": {
          "rpm": 540000,
          "concurrency": 1800,
          "retries": 0
        }
      },
      {
        "id": "search-like-creep",
        "label": "Broader query creep",
        "endpointId": "indexed-read",
        "description": "Cache hit rate falls and replica pressure rises as users ask for less index-friendly filters.",
        "workload": {
          "rpm": 780000,
          "concurrency": 2600,
          "retries": 1
        }
      },
      {
        "id": "write-surge",
        "label": "Write-heavy burst",
        "endpointId": "authoritative-write",
        "description": "A promotion event increases writes and downstream projection lag.",
        "workload": {
          "rpm": 240000,
          "concurrency": 950,
          "retries": 2
        }
      }
    ],
    "scriptTemplate": "workload('indexed-read', { rpm: 820000, concurrency: 2900, retries: 1 })\nfailure('cache', { hitRate: 0.62, extraLatencyMs: 8 })\nnode('primary', { capacityRps: 7800, latencyMs: 31 })"
  },
  "security-operations-lab": {
    "title": "Security and operations lab simulator",
    "summary": "Model identity checks, tenant-safe storage, and degraded-mode choices while auth, primary data, and audit paths compete under stress.",
    "diagram": "node client type=edge label=\"Client traffic\" latencyMs=5 capacityRps=95000\nnode edge type=edge label=\"Edge / gateway\" latencyMs=8 capacityRps=52000\nnode auth type=service label=\"Auth service\" latencyMs=12 capacityRps=28000\nnode api type=service label=\"Core API\" latencyMs=14 capacityRps=24000\nnode primary type=database label=\"Primary store\" latencyMs=22 capacityRps=8500 queueCapacity=9000\nnode replica type=database label=\"Read replica\" latencyMs=18 capacityRps=16000 queueCapacity=9000\nnode audit-queue type=queue label=\"Audit queue\" latencyMs=10 capacityRps=34000 queueCapacity=150000\nnode workers type=worker label=\"Audit / notification workers\" latencyMs=23 capacityRps=21000\nlink client -> edge\nlink edge -> auth\nlink auth -> api\nlink api -> primary\nlink api -> replica\nlink api -> audit-queue async=true\nlink audit-queue -> workers async=true",
    "apis": [
      {
        "id": "privileged-read",
        "label": "GET /tenant/invoices",
        "summary": "Authenticated tenant-scoped read that may use a replica only when freshness and auth context permit.",
        "timeoutMs": 300,
        "retries": 1,
        "payloadKb": 2,
        "stages": [
          {
            "nodeId": "client",
            "mode": "always"
          },
          {
            "nodeId": "edge",
            "sourceNodeId": "client",
            "mode": "always"
          },
          {
            "nodeId": "auth",
            "sourceNodeId": "edge",
            "mode": "always"
          },
          {
            "nodeId": "api",
            "sourceNodeId": "auth",
            "mode": "always"
          },
          {
            "nodeId": "replica",
            "sourceNodeId": "api",
            "mode": "always"
          },
          {
            "nodeId": "audit-queue",
            "sourceNodeId": "api",
            "mode": "async",
            "callsPerRequest": 0.35
          },
          {
            "nodeId": "workers",
            "sourceNodeId": "audit-queue",
            "mode": "async",
            "callsPerRequest": 0.35
          }
        ],
        "focusMetrics": [
          "auth p95",
          "tenant read latency",
          "replica lag",
          "audit queue depth"
        ]
      },
      {
        "id": "privileged-write",
        "label": "POST /admin/break-glass",
        "summary": "Sensitive write path that must authenticate strongly, persist authoritative state, and emit audit events reliably.",
        "timeoutMs": 420,
        "retries": 1,
        "payloadKb": 1,
        "stages": [
          {
            "nodeId": "client",
            "mode": "always"
          },
          {
            "nodeId": "edge",
            "sourceNodeId": "client",
            "mode": "always"
          },
          {
            "nodeId": "auth",
            "sourceNodeId": "edge",
            "mode": "always"
          },
          {
            "nodeId": "api",
            "sourceNodeId": "auth",
            "mode": "always"
          },
          {
            "nodeId": "primary",
            "sourceNodeId": "api",
            "mode": "always"
          },
          {
            "nodeId": "audit-queue",
            "sourceNodeId": "api",
            "mode": "async",
            "callsPerRequest": 1
          },
          {
            "nodeId": "workers",
            "sourceNodeId": "audit-queue",
            "mode": "async",
            "callsPerRequest": 1
          }
        ],
        "focusMetrics": [
          "break-glass write latency",
          "audit durability lag",
          "auth failure rate",
          "primary utilization"
        ]
      }
    ],
    "workloadProfiles": [
      {
        "id": "normal-ops",
        "label": "Normal tenant traffic",
        "endpointId": "privileged-read",
        "description": "Mostly healthy auth and read paths with routine audit fan-out.",
        "workload": {
          "rpm": 420000,
          "concurrency": 1700,
          "retries": 0
        }
      },
      {
        "id": "auth-abuse",
        "label": "Auth abuse burst",
        "endpointId": "privileged-write",
        "description": "Credential and admin-surface pressure increases auth load and audit events.",
        "workload": {
          "rpm": 90000,
          "concurrency": 650,
          "retries": 1
        }
      },
      {
        "id": "degraded-audit",
        "label": "Audit consumer slowdown",
        "endpointId": "privileged-read",
        "description": "Core reads continue while audit lag grows and operators must decide when to degrade.",
        "workload": {
          "rpm": 500000,
          "concurrency": 2000,
          "retries": 1
        }
      }
    ],
    "scriptTemplate": "workload('privileged-read', { rpm: 560000, concurrency: 2300, retries: 1 })\nfailure('auth', { extraLatencyMs: 18 })\nnode('audit-queue', { queueCapacity: 90000, capacityRps: 22000 })"
  },
  "distributed-systems-lab": {
    "title": "Distributed systems lab simulator",
    "summary": "Exercise partition ownership, leadership movement, and workflow retries across a coordinated but still throughput-conscious topology.",
    "diagram": "node client type=edge label=\"Client requests\" latencyMs=5 capacityRps=98000\nnode coordinator type=service label=\"Coordinator\" latencyMs=10 capacityRps=26000\nnode cache type=cache label=\"Hot-owner cache\" latencyMs=3 capacityRps=105000 queueCapacity=45000 hitRate=0.86\nnode leader type=service label=\"Current leader\" latencyMs=16 capacityRps=9000\nnode replicas type=database label=\"Replicated followers\" latencyMs=19 capacityRps=17000 queueCapacity=9000\nnode replication-queue type=queue label=\"Replication / workflow queue\" latencyMs=11 capacityRps=30000 queueCapacity=150000\nnode workers type=worker label=\"Workflow workers\" latencyMs=24 capacityRps=20000\nlink client -> coordinator\nlink coordinator -> cache\nlink coordinator -> leader\nlink leader -> replicas\nlink leader -> replication-queue async=true\nlink replication-queue -> workers async=true",
    "apis": [
      {
        "id": "owned-read-write",
        "label": "POST /partitioned-resource",
        "summary": "Ownership-aware write path that resolves leader, applies a fenced write, and emits async workflow work.",
        "timeoutMs": 450,
        "retries": 2,
        "payloadKb": 2,
        "stages": [
          {
            "nodeId": "client",
            "mode": "always"
          },
          {
            "nodeId": "coordinator",
            "sourceNodeId": "client",
            "mode": "always"
          },
          {
            "nodeId": "cache",
            "sourceNodeId": "coordinator",
            "mode": "always",
            "kind": "cache",
            "hitRate": 0.86
          },
          {
            "nodeId": "leader",
            "sourceNodeId": "coordinator",
            "mode": "always"
          },
          {
            "nodeId": "replicas",
            "sourceNodeId": "leader",
            "mode": "always"
          },
          {
            "nodeId": "replication-queue",
            "sourceNodeId": "leader",
            "mode": "async",
            "callsPerRequest": 0.8
          },
          {
            "nodeId": "workers",
            "sourceNodeId": "replication-queue",
            "mode": "async",
            "callsPerRequest": 0.8
          }
        ],
        "focusMetrics": [
          "leader write p95",
          "stale-owner retries",
          "replica lag",
          "workflow backlog"
        ]
      },
      {
        "id": "ownership-refresh",
        "label": "GET /owner-map",
        "summary": "Control-plane read path that serves cached ownership metadata but falls back to the coordinator during churn.",
        "timeoutMs": 220,
        "retries": 1,
        "payloadKb": 1,
        "stages": [
          {
            "nodeId": "client",
            "mode": "always"
          },
          {
            "nodeId": "coordinator",
            "sourceNodeId": "client",
            "mode": "always"
          },
          {
            "nodeId": "cache",
            "sourceNodeId": "coordinator",
            "mode": "always",
            "kind": "cache",
            "hitRate": 0.92
          },
          {
            "nodeId": "leader",
            "sourceNodeId": "coordinator",
            "mode": "cache-miss"
          }
        ],
        "focusMetrics": [
          "ownership lookup p95",
          "cache hit ratio",
          "leader saturation",
          "metadata freshness"
        ]
      }
    ],
    "workloadProfiles": [
      {
        "id": "steady-owned-writes",
        "label": "Steady owned writes",
        "endpointId": "owned-read-write",
        "description": "Healthy ownership resolution and moderate async follow-up work.",
        "workload": {
          "rpm": 210000,
          "concurrency": 900,
          "retries": 1
        }
      },
      {
        "id": "leader-churn",
        "label": "Leader churn",
        "endpointId": "ownership-refresh",
        "description": "Frequent owner changes stress cached metadata and stale-owner handling.",
        "workload": {
          "rpm": 600000,
          "concurrency": 2600,
          "retries": 1
        }
      },
      {
        "id": "retrying-workflow",
        "label": "Workflow retry storm",
        "endpointId": "owned-read-write",
        "description": "A downstream issue causes retries and a growing workflow backlog.",
        "workload": {
          "rpm": 260000,
          "concurrency": 1200,
          "retries": 2
        }
      }
    ],
    "scriptTemplate": "workload('owned-read-write', { rpm: 300000, concurrency: 1400, retries: 2 })\nfailure('leader', { extraLatencyMs: 14 })\nnode('cache', { hitRate: 0.68 })"
  }
};
