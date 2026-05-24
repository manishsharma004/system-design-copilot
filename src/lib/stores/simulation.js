import { browser } from '$app/environment'
import { writable } from 'svelte/store'

const STORAGE_KEY = 'system-design-copilot-simulation-v1'
/** @typedef {Record<string, any>} SimulationState */

function createSimulationStore() {
  /** @type {SimulationState} */
  const initial = {}
  const { subscribe, set, update } = writable(initial)

  if (browser) {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw)
        if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
          set(parsed)
        }
      }
    } catch {
      set(initial)
    }
  }

  /** @param {SimulationState} value */
  const persist = (value) => {
    if (browser) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(value))
    }
    return value
  }

  return {
    subscribe,
    /**
     * @param {string} lessonId
     * @param {Record<string, any>} session
     */
    saveSession(lessonId, session) {
      update((state) => persist({
        ...state,
        [lessonId]: {
          ...(state[lessonId] ?? {}),
          ...session,
          savedAt: new Date().toISOString()
        }
      }))
    },
    /** @param {string} lessonId */
    clearSession(lessonId) {
      update((state) => {
        const next = { ...state }
        delete next[lessonId]
        return persist(next)
      })
    }
  }
}

export const simulationSessions = createSimulationStore()
