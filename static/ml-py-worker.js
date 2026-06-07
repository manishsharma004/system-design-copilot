// Pyodide ML Web Worker
// Runs Python/ML scripts off the main thread to keep the UI responsive.
// Uses importScripts to load Pyodide from CDN (classic worker, no bundler interference).

const PYODIDE_VERSION = '0.29.4'
const PYODIDE_INDEX_URL = `https://cdn.jsdelivr.net/pyodide/v${PYODIDE_VERSION}/full/`

importScripts(`${PYODIDE_INDEX_URL}pyodide.js`)

/** @type {Promise<any> | null} */
let pyodidePromise = null

/** @type {boolean} */
let packagesReady = false

const ML_PACKAGES = ['numpy', 'pandas', 'matplotlib', 'scikit-learn']

// Python bootstrap: patches plt.show() to capture figures as base64 PNGs.
const PLOT_CAPTURE_SETUP = `
import io as _io
import base64 as _base64
import sys as _sys

import matplotlib as _matplotlib
_matplotlib.use('Agg')
import matplotlib.pyplot as _plt

_ml_worker_images = []

def _capture_show(*args, **kwargs):
    buf = _io.BytesIO()
    _plt.savefig(buf, format='png', bbox_inches='tight', dpi=120)
    buf.seek(0)
    img_b64 = _base64.b64encode(buf.read()).decode('utf-8')
    _ml_worker_images.append(img_b64)
    _plt.clf()
    _plt.close('all')

_plt.show = _capture_show
import matplotlib.pyplot as plt
`

async function getPyodide() {
  if (!pyodidePromise) {
    // loadPyodide is injected globally by the CDN script loaded above.
    pyodidePromise = loadPyodide({ indexURL: PYODIDE_INDEX_URL }) // eslint-disable-line no-undef
  }
  return pyodidePromise
}

async function ensurePackages(pyodide) {
  if (!packagesReady) {
    await pyodide.loadPackage(ML_PACKAGES)
    await pyodide.runPythonAsync(PLOT_CAPTURE_SETUP)
    packagesReady = true
  }
}

self.onmessage = async (event) => {
  const { id, code } = event.data

  const send = (msg) => self.postMessage({ id, ...msg })

  try {
    send({ type: 'STATUS', message: 'Loading Pyodide runtime…' })
    const pyodide = await getPyodide()

    send({ type: 'STATUS', message: 'Installing numpy, pandas, matplotlib, scikit-learn…' })
    await ensurePackages(pyodide)

    // Reset image list and capture stdio for this run.
    await pyodide.runPythonAsync('_ml_worker_images.clear()')

    const stdout = []
    const stderr = []
    pyodide.setStdout({ batched: (line) => stdout.push(line) })
    pyodide.setStderr({ batched: (line) => stderr.push(line) })

    send({ type: 'STATUS', message: 'Running script…' })
    await pyodide.runPythonAsync(code)

    // Collect matplotlib images captured via patched plt.show().
    const pyImages = pyodide.globals.get('_ml_worker_images')
    const images = pyImages ? pyImages.toJs() : []

    send({
      type: 'SUCCESS',
      stdout: stdout.join('\n').trim(),
      stderr: stderr.join('\n').trim(),
      images: Array.isArray(images) ? images : []
    })
  } catch (error) {
    send({
      type: 'ERROR',
      message: error instanceof Error ? error.message : String(error)
    })
  }
}
