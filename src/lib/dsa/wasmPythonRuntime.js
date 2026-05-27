const PYODIDE_VERSION = '0.29.4'
const PYODIDE_INDEX_URL = `https://cdn.jsdelivr.net/pyodide/v${PYODIDE_VERSION}/full/`

let runtimePromise = null

function appendPyodideScript() {
  if (typeof window === 'undefined') {
    throw new Error('Pyodide can only load in a browser environment.')
  }

  if (window.loadPyodide) return Promise.resolve()

  return new Promise((resolve, reject) => {
    const existingScript = document.querySelector('script[data-pyodide-loader="true"]')
    if (existingScript) {
      existingScript.addEventListener('load', () => resolve(), { once: true })
      existingScript.addEventListener('error', () => reject(new Error('Failed to load the Pyodide runtime bundle.')), { once: true })
      return
    }

    const script = document.createElement('script')
    script.src = `${PYODIDE_INDEX_URL}pyodide.js`
    script.async = true
    script.dataset.pyodideLoader = 'true'
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('Failed to load the Pyodide runtime bundle.'))
    document.head.append(script)
  })
}

export async function ensurePythonRuntime() {
  if (!runtimePromise) {
    runtimePromise = (async () => {
      await appendPyodideScript()
      return window.loadPyodide({ indexURL: PYODIDE_INDEX_URL })
    })()
  }

  return runtimePromise
}

export async function runPythonSource(source) {
  const pyodide = await ensurePythonRuntime()
  /** @type {string[]} */
  const stdout = []
  /** @type {string[]} */
  const stderr = []

  pyodide.setStdout({ batched: (value) => stdout.push(value) })
  pyodide.setStderr({ batched: (value) => stderr.push(value) })

  try {
    await pyodide.runPythonAsync(source)
    return {
      ok: true,
      stdout: stdout.join('\n').trim(),
      stderr: stderr.join('\n').trim()
    }
  } catch (error) {
    return {
      ok: false,
      stdout: stdout.join('\n').trim(),
      stderr: stderr.join('\n').trim(),
      error: error instanceof Error ? error.message : 'Python execution failed.'
    }
  }
}
