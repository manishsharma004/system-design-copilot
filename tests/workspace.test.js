import test from 'node:test'
import assert from 'node:assert/strict'
import {
  buildWorkspaceId,
  collectFoldersFromFiles,
  createSeedFile,
  findFileByPath,
  isValidWorkspacePath
} from '../src/lib/editor/workspaceCore.js'
import {
  applyLayout,
  autoLayout,
  compileFlowGraph,
  extractLayout,
  serializeFlowGraph
} from '../src/lib/simulation/graphCompiler.js'

test('buildWorkspaceId namespaces simulation and practice workspaces', () => {
  assert.equal(buildWorkspaceId('simulation', 'foundations/problem-framing'), 'simulation:foundations/problem-framing')
  assert.equal(buildWorkspaceId('practice', 'foundations/problem-framing'), 'practice:foundations/problem-framing')
})

test('createSeedFile normalizes path, language, and read-only flag', () => {
  const file = createSeedFile({
    path: 'src/topology.flow',
    value: 'node edge type=edge',
    language: 'flow-graph'
  })
  assert.equal(file.path, 'src/topology.flow')
  assert.equal(file.id, 'src/topology.flow')
  assert.equal(file.language, 'flow-graph')
  assert.equal(file.persistContent, true)

  const readonly = createSeedFile({ path: 'README.md', value: '# Hi', readOnly: true })
  assert.equal(readonly.persistContent, false)
})

test('collectFoldersFromFiles derives parent folders', () => {
  const folders = collectFoldersFromFiles([
    createSeedFile({ path: 'src/topology.flow', value: '' }),
    createSeedFile({ path: 'config/api.json', value: '{}' })
  ])
  assert.deepEqual(folders, ['config', 'src'])
})

test('findFileByPath resolves workspace entries', () => {
  const files = [createSeedFile({ path: 'steps/step-1-answer.md', value: 'draft' })]
  assert.equal(findFileByPath(files, 'steps/step-1-answer.md')?.value, 'draft')
})

test('isValidWorkspacePath rejects parent-directory segments', () => {
  assert.equal(isValidWorkspacePath('steps/step-1-answer.md'), true)
  assert.equal(isValidWorkspacePath('steps/..'), false)
  assert.equal(isValidWorkspacePath('steps/./notes.md'), false)
})

test('serializeFlowGraph round-trips starter diagrams', () => {
  const source = `node edge type=edge label="Entry" latencyMs=4 capacityRps=60000
node cache type=cache label="Cache" latencyMs=2 capacityRps=90000 queueCapacity=40000 hitRate=0.85
link edge -> cache`
  const compiled = compileFlowGraph(source)
  assert.equal(compiled.errors.length, 0)
  const serialized = serializeFlowGraph(compiled)
  const again = compileFlowGraph(serialized)
  assert.equal(again.errors.length, 0)
  assert.equal(again.nodes.length, compiled.nodes.length)
  assert.equal(again.links.length, compiled.links.length)
  assert.equal(again.nodes.find((node) => node.id === 'cache')?.hitRate, 0.85)
})

test('layout helpers merge and extract node coordinates', () => {
  const graph = compileFlowGraph('node a type=service latencyMs=10 capacityRps=1000\nnode b type=service latencyMs=10 capacityRps=1000\nlink a -> b')
  const layout = { a: { x: 10, y: 20 }, b: { x: 200, y: 20 } }
  const merged = applyLayout(graph, layout)
  assert.deepEqual(extractLayout(merged), layout)
  assert.equal(Object.keys(autoLayout(graph)).length, 2)
})
