import test from 'node:test'
import assert from 'node:assert/strict'

import {
  buildMarkdownMetadata,
  buildFlowGraphMetadata,
  buildSimulationScriptMetadata
} from '../src/lib/editor/exerciseMetadata.js'
import {
  buildSearchEngineUrls,
  buildRequest,
  readResponsePath,
  renderTemplate
} from '../src/lib/llm/providers.js'
import {
  buildAnswerCheckPrompt,
  getCheckPromptFlowIds,
  getModeInstruction,
  plainTextFromHtml
} from '../src/lib/llm/checkPrompts.js'

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

test('search engine URL builder includes google, duckduckgo, and perplexity', () => {
  const urls = buildSearchEngineUrls('System: test\nUser: explain ml math')

  assert.equal(urls.google.startsWith('https://www.google.com/search?'), true)
  assert.equal(urls.duckduckgo.startsWith('https://duck.ai/?'), true)
  assert.equal(urls.perplexity.startsWith('https://www.perplexity.ai/?'), true)
  assert.equal(urls.google.includes('udm=50'), true)
  assert.equal(urls.google.includes('q='), true)
})

test('answer check prompts include Question and User answer for every flow', () => {
  const flowIds = getCheckPromptFlowIds()
  assert.deepEqual(flowIds.sort(), [
    'ai-engineer',
    'data-structures-and-algorithms',
    'high-level-design',
    'interview-questions',
    'low-level-design',
    'simulation'
  ].sort())

  for (const flowId of flowIds) {
    const prompt = buildAnswerCheckPrompt({
      flowId,
      mode: 'check',
      question: `Sample question for ${flowId}`,
      answer: `Sample answer for ${flowId}`,
      contextSections: [`Lesson: ${flowId}`],
      extraRequest: 'Be brief'
    })

    assert.match(prompt, /Question:\nSample question/)
    assert.match(prompt, /User answer:\nSample answer/)
    assert.match(prompt, /Context: Lesson:/)
    assert.match(prompt, /Specific request: Be brief/)
  }

  assert.match(
    buildAnswerCheckPrompt({ flowId: 'high-level-design', question: 'Q', answer: 'A' }),
    /capacity|APIs|bottlenecks|trade-offs/i
  )
  assert.match(
    buildAnswerCheckPrompt({ flowId: 'low-level-design', question: 'Q', answer: 'A' }),
    /classes|interfaces|responsibilities|invariants/i
  )
  assert.match(
    buildAnswerCheckPrompt({ flowId: 'data-structures-and-algorithms', question: 'Q', answer: 'A' }),
    /complexity|edge cases|correctness/i
  )
  assert.match(
    buildAnswerCheckPrompt({ flowId: 'ai-engineer', question: 'Q', answer: 'A' }),
    /evaluation metrics|failure modes|production/i
  )
  assert.match(
    buildAnswerCheckPrompt({ flowId: 'interview-questions', question: 'Q', answer: 'A' }),
    /interview communication|technical depth/i
  )
  assert.match(
    buildAnswerCheckPrompt({ flowId: 'simulation', question: 'Q', answer: 'A' }),
    /topology|findings|concrete fix/i
  )
})

test('outline mode and review alias share prompt shape with labeled question and answer', () => {
  const outline = buildAnswerCheckPrompt({
    mode: 'outline',
    question: 'Design a cache',
    answer: 'Use Redis'
  })
  assert.match(outline, /Question:\nDesign a cache/)
  assert.match(outline, /User answer:\nUse Redis/)
  assert.match(outline, /tighter system-design answer outline/i)

  const review = buildAnswerCheckPrompt({
    mode: 'review',
    flowId: 'high-level-design',
    question: 'Design a cache',
    answer: 'Use Redis'
  })
  assert.match(review, /trade-offs/i)
  assert.equal(getModeInstruction('check', 'high-level-design'), getModeInstruction('review', 'high-level-design'))
})

test('plainTextFromHtml strips tags for prompt text', () => {
  assert.equal(plainTextFromHtml('<p>Hello <strong>world</strong></p>'), 'Hello world')
  assert.equal(plainTextFromHtml(''), '')
})
