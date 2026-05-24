import test from 'node:test'
import assert from 'node:assert/strict'
import { getSimulationLesson } from '../src/lib/data/simulationLessons.js'
import { compileFlowGraph } from '../src/lib/simulation/graphCompiler.js'
import { runSimulation } from '../src/lib/simulation/engine.js'
import { parseSimulationScript } from '../src/lib/simulation/scriptApi.js'

test('url shortener lesson exposes an authored simulation scenario', () => {
  const simulation = getSimulationLesson('case-studies/url-shortener')
  assert.ok(simulation)
  assert.match(simulation.title, /Simulation lab/)
  assert.equal(simulation.apis.length >= 2, true)
  assert.equal(simulation.workloadProfiles.length >= 3, true)
  assert.match(simulation.starterDiagram, /node edge/)
})

test('flow graph compiler parses nodes, links, and warnings', () => {
  const simulation = getSimulationLesson('case-studies/url-shortener')
  const graph = compileFlowGraph(`${simulation.starterDiagram}\nnode stray type=service latencyMs=8 capacityRps=1200`)
  assert.equal(graph.nodes.length, 7)
  assert.equal(graph.links.length, 5)
  assert.equal(graph.errors.length, 0)
  assert.equal(graph.warnings.some((warning) => warning.includes('Disconnected nodes')), true)
})

test('script api parses workload, node, and failure overrides', () => {
  const script = parseSimulationScript(`
    workload('redirect', { rpm: 1200000, concurrency: 5000, retries: 2 })
    node('primary', { capacityRps: 6400, latencyMs: 26 })
    failure('cache', { hitRate: 0.71, extraLatencyMs: 8 })
  `)

  assert.deepEqual(script.errors, [])
  assert.equal(script.workloadOverrides.redirect.rpm, 1200000)
  assert.equal(script.nodeOverrides.primary.capacityRps, 6400)
  assert.equal(script.failureOverrides.cache.hitRate, 0.71)
})

test('simulation engine returns metrics and recommendations for hot redirect traffic', () => {
  const simulation = getSimulationLesson('case-studies/url-shortener')
  const result = runSimulation({
    scenario: simulation,
    diagramText: simulation.starterDiagram,
    apiId: 'redirect',
    profileId: 'hot-campaign',
    scriptText: `failure('cache', { hitRate: 0.68, extraLatencyMs: 10 })`
  })

  assert.equal(result.ok, true)
  assert.equal(result.nodeMetrics.length >= 4, true)
  assert.equal(result.overall.requestRps > 20000, true)
  assert.equal(result.findings.length >= 1, true)
  assert.equal(result.nodeMetrics.some((node) => node.id === 'primary' && node.utilization > 0.85), true)
})

test('simulation engine blocks runs when the topology no longer supports the API path', () => {
  const simulation = getSimulationLesson('case-studies/url-shortener')
  const brokenDiagram = simulation.starterDiagram.replace('link shortener -> primary', '')
  const result = runSimulation({
    scenario: simulation,
    diagramText: brokenDiagram,
    apiId: 'create-link',
    profileId: 'alias-burst',
    scriptText: ''
  })

  assert.equal(result.ok, false)
  assert.equal(result.errors.some((message) => message.includes('Missing link shortener -> primary')), true)
})
