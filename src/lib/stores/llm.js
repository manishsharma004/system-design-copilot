import { browser } from '$app/environment'
import { writable } from 'svelte/store'

import { getLlmProvider } from '$lib/llm/providers'

const STORAGE_KEY = 'system-design-copilot-llm-v1'

function getInitialState() {
  const provider = getLlmProvider('openai')
  return {
    providerId: provider.id,
    endpoint: provider.defaultEndpoint,
    model: provider.defaultModel,
    apiKey: '',
    deployment: '',
    temperature: 0.3,
    headersText: provider.defaultHeaders ?? '{\n  "Content-Type": "application/json"\n}',
    bodyTemplate: provider.defaultBodyTemplate ?? '',
    responsePath: provider.defaultResponsePath ?? '',
    systemPrompt: 'You are a concise system design interview coach.',
    savedAt: ''
  }
}

function createLlmStore() {
  const initial = getInitialState()
  const { subscribe, set, update } = writable(initial)

  if (browser) {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw)
        if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
          set({ ...initial, ...parsed })
        }
      }
    } catch {
      set(initial)
    }
  }

  /**
   * @param {ReturnType<typeof getInitialState>} value
   */
  const persist = (value) => {
    const next = {
      ...value,
      savedAt: new Date().toISOString()
    }
    if (browser) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    }
    return next
  }

  return {
    subscribe,
    /**
     * @param {string} providerId
     */
    applyProvider(providerId) {
      const provider = getLlmProvider(providerId)
      update((state) => persist({
        ...state,
        providerId: provider.id,
        endpoint: provider.defaultEndpoint,
        model: provider.defaultModel,
        deployment: '',
        headersText: provider.defaultHeaders ?? '{\n  "Content-Type": "application/json"\n}',
        bodyTemplate: provider.defaultBodyTemplate ?? '',
        responsePath: provider.defaultResponsePath ?? ''
      }))
    },
    /**
     * @param {keyof ReturnType<typeof getInitialState>} field
     * @param {string | number} value
     */
    updateField(field, value) {
      update((state) => persist({
        ...state,
        [field]: value
      }))
    },
    reset() {
      const next = getInitialState()
      set(next)
      if (browser) {
        window.localStorage.removeItem(STORAGE_KEY)
      }
    }
  }
}

export const llmSettings = createLlmStore()
