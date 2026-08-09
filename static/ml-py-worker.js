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

# --- Fixture helpers for agent / RAG lesson exercises ---
_MOCK_SEARCH_INDEX = {
    "password reset": [
        {"id": "doc-reset", "title": "Password reset policy", "snippet": "Users can reset via email link within 15 minutes."}
    ],
    "sso": [
        {"id": "doc-sso", "title": "SSO setup", "snippet": "Enable SAML SSO in admin console under Security."}
    ],
    "refund": [
        {"id": "doc-refund", "title": "Refund policy", "snippet": "Refunds within 30 days for unused subscriptions."}
    ],
}

def mock_search(query: str, top_k: int = 3):
    """Return deterministic search hits for lesson demos (no network)."""
    q = (query or "").lower()
    for key, hits in _MOCK_SEARCH_INDEX.items():
        if key in q:
            return hits[:top_k]
    return [{"id": "doc-none", "title": "No match", "snippet": "No documents matched the query."}]

_MOCK_SQL_ROWS = {
    "orders": [
        {"order_id": 101, "status": "shipped", "total": 54.0},
        {"order_id": 102, "status": "pending", "total": 12.5},
    ],
    "users": [
        {"user_id": 1, "plan": "pro", "region": "us-east"},
        {"user_id": 2, "plan": "free", "region": "eu-west"},
    ],
}

def mock_sql(table: str, where: str = ""):
    """Tiny in-memory SQL fixture for tool-calling exercises."""
    rows = list(_MOCK_SQL_ROWS.get(table, []))
    token = (where or "").lower()
    if "shipped" in token:
        rows = [r for r in rows if r.get("status") == "shipped"]
    if "pro" in token:
        rows = [r for r in rows if r.get("plan") == "pro"]
    return rows

def score_rag(answer: str, gold: str, retrieved_ids=None):
    """Lightweight RAG eval helper: overlap + optional recall@ids."""
    answer_tokens = set((answer or "").lower().split())
    gold_tokens = set((gold or "").lower().split())
    if not gold_tokens:
        return {"overlap": 0.0, "pass": False}
    overlap = len(answer_tokens & gold_tokens) / len(gold_tokens)
    recall = None
    if retrieved_ids is not None:
        gold_ids = set(gold_tokens)
        recall = len(set(retrieved_ids) & gold_ids) / max(1, len(gold_ids))
    passed = overlap >= 0.35
    return {"overlap": round(overlap, 3), "recall": recall, "pass": passed}
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
