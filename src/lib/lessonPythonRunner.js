import { base } from '$app/paths'

/**
 * Shared Pyodide ML worker for in-lesson / Learn-reader code snippets.
 * Reuses one worker across snippets so pages with many examples stay light.
 */

/** @type {Worker | null} */
let worker = null
let nextId = 0

/** @type {Map<number, {
 *   onStatus?: (message: string) => void,
 *   resolve: (result: {
 *     ok: boolean,
 *     stdout: string,
 *     stderr: string,
 *     images: string[],
 *     error?: string
 *   }) => void
 * }>} */
const pending = new Map()

function ensureWorker() {
  if (typeof window === 'undefined') {
    throw new Error('Lesson Python runner is browser-only.')
  }
  if (worker) return worker

  worker = new Worker(`${base}/ml-py-worker.js`)
  worker.onmessage = (event) => {
    const msg = event.data
    const entry = pending.get(msg.id)
    if (!entry) return

    if (msg.type === 'STATUS') {
      entry.onStatus?.(msg.message ?? '')
      return
    }

    pending.delete(msg.id)
    if (msg.type === 'SUCCESS') {
      entry.resolve({
        ok: true,
        stdout: msg.stdout ?? '',
        stderr: msg.stderr ?? '',
        images: Array.isArray(msg.images) ? msg.images : []
      })
      return
    }

    entry.resolve({
      ok: false,
      stdout: '',
      stderr: '',
      images: [],
      error: msg.message ?? 'Python execution failed.'
    })
  }

  worker.onerror = (event) => {
    const message = event.message || 'Python worker failed to load.'
    for (const [id, entry] of pending.entries()) {
      pending.delete(id)
      entry.resolve({
        ok: false,
        stdout: '',
        stderr: '',
        images: [],
        error: message
      })
    }
  }

  return worker
}

/**
 * Run Python source with the ML Pyodide worker (numpy/pandas/matplotlib/sklearn).
 *
 * @param {string} code
 * @param {{ onStatus?: (message: string) => void }} [options]
 */
export function runLessonPython(code, options = {}) {
  const id = ++nextId
  const active = ensureWorker()

  return new Promise((resolve) => {
    pending.set(id, {
      onStatus: options.onStatus,
      resolve
    })
    active.postMessage({ id, code })
  })
}

export function isLessonPythonLanguage(language) {
  const normalized = String(language || '').trim().toLowerCase()
  return normalized === 'python' || normalized === 'python3' || normalized === 'py'
}
