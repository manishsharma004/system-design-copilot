import test from 'node:test'
import assert from 'node:assert/strict'
import { allLessons } from '../src/lib/data/courseData.js'
import { getSimulationLesson } from '../src/lib/data/simulationLessons.js'
import { compileFlowGraph, serializeFlowGraph } from '../src/lib/simulation/graphCompiler.js'
import { runSimulation } from '../src/lib/simulation/engine.js'
import { parseSimulationScript } from '../src/lib/simulation/scriptApi.js'

test('every lesson exposes a simulation scenario', () => {
  allLessons.forEach((lesson) => {
    const simulation = getSimulationLesson(lesson.id)
    assert.ok(simulation, `missing simulation lesson data for ${lesson.id}`)
    assert.match(simulation.title, /Simulation lab:/)
    assert.equal(simulation.apis.length >= 2, true)
    assert.equal(simulation.workloadProfiles.length >= 3, true)
    assert.equal(simulation.recommendationThemes.length >= 3, true)
    assert.match(simulation.starterDiagram, /node /)
  })
})

test('url shortener lesson exposes an authored simulation scenario', () => {
  const simulation = getSimulationLesson('case-studies/url-shortener')
  assert.ok(simulation)
  assert.match(simulation.title, /Simulation lab/)
  assert.equal(simulation.apis.length >= 2, true)
  assert.equal(simulation.workloadProfiles.length >= 3, true)
  assert.match(simulation.starterDiagram, /node edge/)
})

test('exhaustive HLD labs use dedicated simulation blueprints', () => {
  /** @type {Array<[string, RegExp, RegExp]>} */
  const cases = [
    ['data-storage-lab/polyglot-storage-selection', /replica freshness|authoritative write|projection lag/i, /primary/],
    ['security-operations-lab/auth-threat-modeling-for-hld', /identity checks|tenant-safe|audit paths/i, /auth/],
    ['distributed-systems-lab/consensus-quorums-and-leadership', /partition ownership|leadership|workflow retries/i, /leader|coordinator/]
  ]

  for (const [lessonId, summaryPattern, diagramPattern] of cases) {
    const simulation = getSimulationLesson(lessonId)
    assert.ok(simulation, `missing simulation for ${lessonId}`)
    assert.match(simulation.title, /Simulation lab:/)
    assert.match(simulation.summary, summaryPattern)
    assert.match(simulation.starterDiagram, diagramPattern)
    assert.equal(simulation.apis.length >= 2, true)
    assert.equal(simulation.workloadProfiles.length >= 3, true)
  }
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

  if (!result.ok) {
    assert.fail(result.errors.join(', '))
  }
  const successResult = /** @type {any} */ (result)
  assert.equal(successResult.nodeMetrics.length >= 4, true)
  assert.equal(successResult.overall.requestRps > 20000, true)
  assert.equal(successResult.findings.length >= 1, true)
  assert.equal(successResult.nodeMetrics.some((/** @type {any} */ node) => node.id === 'primary' && node.utilization > 0.85), true)
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

test('serialized topology remains runnable by the simulation engine', () => {
  const simulation = getSimulationLesson('case-studies/url-shortener')
  const compiled = compileFlowGraph(simulation.starterDiagram)
  const serialized = serializeFlowGraph(compiled)
  const result = runSimulation({
    scenario: simulation,
    diagramText: serialized,
    apiId: simulation.apis[0].id,
    profileId: simulation.workloadProfiles[0].id,
    scriptText: ''
  })
  assert.equal(result.ok, true)
})
