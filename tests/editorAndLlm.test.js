import test from 'node:test'
import assert from 'node:assert/strict'

import {
  buildMarkdownMetadata,
  buildFlowGraphMetadata,
  buildSimulationScriptMetadata
} from '../src/lib/editor/exerciseMetadata.js'
import {
  buildRequest,
  readResponsePath,
  renderTemplate
} from '../src/lib/llm/providers.js'

test('flow graph metadata exposes summaries and inline previews', () => {
  const metadata = buildFlowGraphMetadata(`
    node edge type=edge latencyMs=4 capacityRps=60000 queueCapacity=0
    node app type=service latencyMs=12 capacityRps=20000 queueCapacity=2000
    link edge -> app label="sync"
  `)

  assert.equal(metadata.summary, '2 nodes · 1 links')
  assert.equal(metadata.previewItems.some((item) => item.text.includes('60000 rps')), true)
  assert.equal(metadata.markers.length, 0)
})

test('simulation script metadata surfaces overrides and errors', () => {
  const metadata = buildSimulationScriptMetadata(`
    workload('redirect', { rpm: 1200000, concurrency: 5000 })
    invalid syntax
  `)

  assert.equal(metadata.previewItems.length, 1)
  assert.equal(metadata.markers.some((marker) => marker.message.includes('Unsupported script line')), true)
})

test('markdown metadata surfaces structure and unfinished code fences', () => {
  const metadata = buildMarkdownMetadata(`
## Requirements
- read path

\`\`\`ts
const answer = true
`)

  assert.equal(metadata.summary.includes('1 headings'), true)
  assert.equal(metadata.previewItems[0].text, 'Requirements')
  assert.equal(metadata.markers.some((marker) => marker.message.includes('Close the unfinished fenced code block.')), true)
})

test('llm request builders cover openai and templated custom providers', () => {
  const openAiRequest = buildRequest({
    providerId: 'openai',
    endpoint: 'https://api.openai.com/v1/chat/completions',
    model: 'gpt-4.1-mini',
    apiKey: 'test-key',
    deployment: '',
    temperature: 0.3,
    headersText: '',
    bodyTemplate: '',
    responsePath: ''
  }, [
    { role: 'system', content: 'Coach clearly.' },
    { role: 'user', content: 'Review this design.' }
  ])

  assert.equal(openAiRequest.url, 'https://api.openai.com/v1/chat/completions')
  assert.equal(openAiRequest.init.method, 'POST')
  assert.equal(openAiRequest.init.headers.Authorization, 'Bearer test-key')

  const customRequest = buildRequest({
    providerId: 'custom',
    endpoint: 'https://example.com/chat',
    model: 'custom-model',
    apiKey: 'secret',
    deployment: '',
    temperature: 0.2,
    headersText: '{ "Authorization": "Bearer {{apiKey}}", "Content-Type": "application/json" }',
    bodyTemplate: '{ "messages": {{messages}}, "input": "{{input}}" }',
    responsePath: 'data.answer'
  }, [
    { role: 'user', content: 'Hello model' }
  ])

  assert.match(String(customRequest.init.body), /Hello model/)
  assert.equal(customRequest.parse({ data: { answer: 'ok' } }), 'ok')
})

test('template rendering and response path extraction handle nested arrays', () => {
  assert.equal(renderTemplate('Bearer {{apiKey}}', { apiKey: 'abc' }), 'Bearer abc')
  assert.equal(
    readResponsePath({ choices: [{ message: { content: 'ready' } }] }, 'choices[0].message.content'),
    'ready'
  )
})
