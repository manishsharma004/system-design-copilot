const builtInProviders = [
  {
    id: 'openai',
    label: 'OpenAI',
    family: 'cloud',
    defaultModel: 'gpt-4.1-mini',
    defaultEndpoint: 'https://api.openai.com/v1/chat/completions',
    endpointLabel: 'Chat endpoint',
    apiKeyLabel: 'OpenAI API key',
    supportsCustomTemplate: false,
    note: 'Direct browser call to the Chat Completions API.'
  },
  {
    id: 'azure-openai',
    label: 'Azure OpenAI',
    family: 'cloud',
    defaultModel: 'gpt-4.1-mini',
    defaultEndpoint: 'https://YOUR_RESOURCE_NAME.openai.azure.com',
    endpointLabel: 'Azure resource URL',
    apiKeyLabel: 'Azure API key',
    requiresDeployment: true,
    supportsCustomTemplate: false,
    note: 'Uses an Azure deployment name plus the Azure OpenAI chat completions route.'
  },
  {
    id: 'gemini',
    label: 'Gemini',
    family: 'cloud',
    defaultModel: 'gemini-2.5-flash',
    defaultEndpoint: 'https://generativelanguage.googleapis.com/v1beta',
    endpointLabel: 'Gemini API base URL',
    apiKeyLabel: 'Gemini API key',
    supportsCustomTemplate: false,
    note: 'Calls the Gemini generateContent API directly from the browser.'
  },
  {
    id: 'anthropic',
    label: 'Anthropic',
    family: 'cloud',
    defaultModel: 'claude-3-5-sonnet-latest',
    defaultEndpoint: 'https://api.anthropic.com/v1/messages',
    endpointLabel: 'Anthropic messages endpoint',
    apiKeyLabel: 'Anthropic API key',
    supportsCustomTemplate: false,
    note: 'Uses the Anthropic messages API.'
  },
  {
    id: 'ollama',
    label: 'Ollama',
    family: 'local',
    defaultModel: 'llama3.1',
    defaultEndpoint: 'http://127.0.0.1:11434/api/chat',
    endpointLabel: 'Ollama chat endpoint',
    apiKeyLabel: 'Optional API key',
    supportsCustomTemplate: false,
    note: 'Uses the local Ollama chat API. API keys are optional for proxied setups.'
  },
  {
    id: 'lm-studio',
    label: 'LM Studio',
    family: 'local',
    defaultModel: 'local-model',
    defaultEndpoint: 'http://127.0.0.1:1234/v1/chat/completions',
    endpointLabel: 'LM Studio OpenAI-compatible endpoint',
    apiKeyLabel: 'Optional API key',
    supportsCustomTemplate: false,
    note: 'LM Studio exposes an OpenAI-compatible local endpoint.'
  },
  {
    id: 'comfyui',
    label: 'ComfyUI',
    family: 'local',
    defaultModel: 'workflow-driven',
    defaultEndpoint: 'http://127.0.0.1:8188/prompt',
    endpointLabel: 'ComfyUI or proxy endpoint',
    apiKeyLabel: 'Optional API key',
    supportsCustomTemplate: true,
    defaultHeaders: '{\n  "Content-Type": "application/json"\n}',
    defaultBodyTemplate: '{\n  "prompt": {{messages}},\n  "model": "{{model}}",\n  "apiKey": "{{apiKey}}"\n}',
    defaultResponsePath: 'prompt_id',
    note: 'ComfyUI payloads vary by workflow, so this preset exposes custom request and response templates.'
  },
  {
    id: 'custom',
    label: 'Custom HTTP / TypeScript adapter',
    family: 'custom',
    defaultModel: 'custom-model',
    defaultEndpoint: 'https://your-api.example.com/chat',
    endpointLabel: 'Custom endpoint',
    apiKeyLabel: 'Custom API key',
    supportsCustomTemplate: true,
    defaultHeaders: '{\n  "Content-Type": "application/json",\n  "Authorization": "Bearer {{apiKey}}"\n}',
    defaultBodyTemplate: '{\n  "model": "{{model}}",\n  "messages": {{messages}},\n  "input": "{{input}}"\n}',
    defaultResponsePath: 'choices[0].message.content',
    note: 'Use this preset for arbitrary HTTP APIs or register a new adapter in src/lib/llm/providers.js.'
  }
]

const providerRegistry = new Map(builtInProviders.map((provider) => [provider.id, provider]))

/**
 * @param {{
 *   id: string,
 *   label: string,
 *   family: string,
 *   defaultModel: string,
 *   defaultEndpoint: string,
 *   endpointLabel: string,
 *   apiKeyLabel: string,
 *   supportsCustomTemplate: boolean,
 *   note: string
 * }} provider
 */
export function registerLlmProvider(provider) {
  providerRegistry.set(provider.id, provider)
}

export function getLlmProviders() {
  return [...providerRegistry.values()]
}

/**
 * @param {string} providerId
 */
export function getLlmProvider(providerId) {
  return providerRegistry.get(providerId) ?? builtInProviders[0]
}

/**
 * @param {string} template
 * @param {Record<string, string>} replacements
 */
export function renderTemplate(template, replacements) {
  return Object.entries(replacements).reduce(
    (result, [key, value]) => result.replaceAll(`{{${key}}}`, value),
    template
  )
}

/**
 * @param {string} path
 */
function splitPath(path) {
  return path
    .split('.')
    .flatMap((segment) => segment.split(/\[(\d+)\]/).filter(Boolean))
}

/**
 * @param {unknown} data
 * @param {string} path
 */
export function readResponsePath(data, path) {
  if (!path.trim()) return ''
  /** @type {any} */
  let current = data
  for (const segment of splitPath(path)) {
    if (current === null || current === undefined) return ''
    current = /^\d+$/.test(segment)
      ? current?.[Number(segment)]
      : current?.[segment]
  }
  if (typeof current === 'string') return current
  if (Array.isArray(current)) {
    return current.map((entry) => (typeof entry === 'string' ? entry : JSON.stringify(entry))).join('\n')
  }
  if (current && typeof current === 'object') {
    return JSON.stringify(current, null, 2)
  }
  return current === undefined || current === null ? '' : String(current)
}

/**
 * @param {{ role: string, content: string }[]} messages
 */
function flattenMessages(messages) {
  return messages.map((message) => `${message.role.toUpperCase()}: ${message.content}`).join('\n\n')
}

/**
 * @param {{ providerId: string, endpoint: string, model: string, apiKey: string, deployment: string, temperature: number, headersText: string, bodyTemplate: string, responsePath: string }} config
 * @param {{ role: string, content: string }[]} messages
 */
export function buildRequest(config, messages) {
  const provider = getLlmProvider(config.providerId)
  const endpoint = (config.endpoint || provider.defaultEndpoint).trim()
  const model = (config.model || provider.defaultModel).trim()
  const input = messages[messages.length - 1]?.content ?? ''
  const systemPrompt = messages.find((message) => message.role === 'system')?.content ?? ''

  if (!endpoint) {
    throw new Error('Add an endpoint URL before requesting the model.')
  }

  if (provider.id === 'openai' || provider.id === 'lm-studio') {
    return {
      url: endpoint,
      init: {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(config.apiKey ? { Authorization: `Bearer ${config.apiKey}` } : {})
        },
        body: JSON.stringify({
          model,
          temperature: config.temperature,
          messages
        })
      },
      parse(/** @type {any} */ data) {
        return readResponsePath(data, 'choices[0].message.content')
      }
    }
  }

  if (provider.id === 'azure-openai') {
    const resource = endpoint.replace(/\/$/, '')
    if (!config.deployment.trim()) {
      throw new Error('Azure OpenAI needs a deployment name.')
    }
    return {
      url: `${resource}/openai/deployments/${config.deployment.trim()}/chat/completions?api-version=2024-06-01`,
      init: {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api-key': config.apiKey
        },
        body: JSON.stringify({
          temperature: config.temperature,
          messages
        })
      },
      parse(/** @type {any} */ data) {
        return readResponsePath(data, 'choices[0].message.content')
      }
    }
  }

  if (provider.id === 'gemini') {
    const base = endpoint.replace(/\/$/, '')
    return {
      url: `${base}/models/${model}:generateContent?key=${encodeURIComponent(config.apiKey)}`,
      init: {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          generationConfig: {
            temperature: config.temperature
          },
          contents: messages
            .filter((message) => message.role !== 'system')
            .map((message) => ({
              role: message.role === 'assistant' ? 'model' : 'user',
              parts: [{ text: message.content }]
            })),
          systemInstruction: systemPrompt
            ? {
                parts: [{ text: systemPrompt }]
              }
            : undefined
        })
      },
      parse(/** @type {any} */ data) {
        return readResponsePath(data, 'candidates[0].content.parts[0].text')
      }
    }
  }

  if (provider.id === 'anthropic') {
    return {
      url: endpoint,
      init: {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': config.apiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model,
          max_tokens: 1024,
          temperature: config.temperature,
          system: systemPrompt || undefined,
          messages: messages.filter((message) => message.role !== 'system')
        })
      },
      parse(/** @type {any} */ data) {
        return readResponsePath(data, 'content[0].text')
      }
    }
  }

  if (provider.id === 'ollama') {
    return {
      url: endpoint,
      init: {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(config.apiKey ? { Authorization: `Bearer ${config.apiKey}` } : {})
        },
        body: JSON.stringify({
          model,
          stream: false,
          options: {
            temperature: config.temperature
          },
          messages
        })
      },
      parse(/** @type {any} */ data) {
        return readResponsePath(data, 'message.content')
      }
    }
  }

  const headersTemplate = config.headersText || provider.defaultHeaders || '{\n  "Content-Type": "application/json"\n}'
  const bodyTemplate = config.bodyTemplate || provider.defaultBodyTemplate || '{\n  "messages": {{messages}}\n}'
  const responsePath = config.responsePath || provider.defaultResponsePath || ''

  const replacements = {
    apiKey: config.apiKey,
    endpoint,
    model,
    input: input.replaceAll('"', '\\"'),
    systemPrompt: systemPrompt.replaceAll('"', '\\"'),
    messages: JSON.stringify(messages),
    transcript: flattenMessages(messages).replaceAll('"', '\\"')
  }

  const rawHeaders = renderTemplate(headersTemplate, replacements)
  const rawBody = renderTemplate(bodyTemplate, replacements)
  /** @type {Record<string, string>} */
  const parsedHeaders = JSON.parse(rawHeaders)

  if (config.apiKey && !Object.keys(parsedHeaders).some((key) => key.toLowerCase() === 'authorization')) {
    parsedHeaders.Authorization = `Bearer ${config.apiKey}`
  }

  return {
    url: endpoint,
    init: {
      method: 'POST',
      headers: parsedHeaders,
      body: rawBody
    },
    parse(/** @type {any} */ data) {
      return readResponsePath(data, responsePath)
    }
  }
}

/**
 * @param {{ providerId: string, endpoint: string, model: string, apiKey: string, deployment: string, temperature: number, headersText: string, bodyTemplate: string, responsePath: string }} config
 * @param {{ role: string, content: string }[]} messages
 * @param {typeof fetch} fetchImpl
 */
export async function requestLlmCompletion(config, messages, fetchImpl = fetch) {
  const request = buildRequest(config, messages)
  const response = await fetchImpl(request.url, request.init)
  const data = await response.json().catch(() => ({}))
  if (!response.ok) {
    const details = readResponsePath(data, 'error.message') || readResponsePath(data, 'message') || response.statusText
    throw new Error(details || `Model request failed with status ${response.status}`)
  }
  const content = request.parse(data)
  if (!content) {
    throw new Error('The configured provider returned a response, but no text could be extracted from it.')
  }
  return content
}
