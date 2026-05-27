import { browser } from '$app/environment'

const DB_NAME = 'system-design-copilot-workspaces'
const STORE_NAME = 'workspaces'
const DB_VERSION = 1

let databasePromise

function emptySnapshot() {
  return {
    files: [],
    folders: [],
    activeFileId: ''
  }
}

function canUseIndexedDb() {
  return browser && typeof window !== 'undefined' && 'indexedDB' in window
}

function openDatabase() {
  if (!canUseIndexedDb()) {
    return Promise.resolve(null)
  }
  if (databasePromise) {
    return databasePromise
  }

  databasePromise = new Promise((resolve, reject) => {
    const request = window.indexedDB.open(DB_NAME, DB_VERSION)

    request.onupgradeneeded = () => {
      const db = request.result
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME)
      }
    }

    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error ?? new Error('Unable to open IndexedDB workspace store.'))
  }).catch((error) => {
    databasePromise = null
    throw error
  })

  return databasePromise
}

function runTransaction(mode, handler) {
  return openDatabase().then((db) => {
    if (!db) {
      return null
    }
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, mode)
      const store = transaction.objectStore(STORE_NAME)
      const request = handler(store)

      request.onsuccess = () => resolve(request.result ?? null)
      request.onerror = () => reject(request.error ?? new Error('IndexedDB workspace transaction failed.'))
    })
  })
}

export async function loadWorkspaceSnapshot(workspaceId) {
  if (!workspaceId) {
    return emptySnapshot()
  }
  try {
    const snapshot = await runTransaction('readonly', (store) => store.get(workspaceId))
    if (!snapshot || typeof snapshot !== 'object') {
      return emptySnapshot()
    }
    return {
      ...emptySnapshot(),
      ...snapshot,
      files: Array.isArray(snapshot.files) ? snapshot.files : [],
      folders: Array.isArray(snapshot.folders) ? snapshot.folders : []
    }
  } catch {
    return emptySnapshot()
  }
}

export async function saveWorkspaceSnapshot(workspaceId, snapshot) {
  if (!workspaceId) {
    return
  }
  try {
    await runTransaction('readwrite', (store) => store.put({
      ...emptySnapshot(),
      ...snapshot,
      updatedAt: new Date().toISOString()
    }, workspaceId))
  } catch {
    // Ignore persistence failures and keep the in-memory workspace usable.
  }
}

export async function clearWorkspaceSnapshot(workspaceId) {
  if (!workspaceId) {
    return
  }
  try {
    await runTransaction('readwrite', (store) => store.delete(workspaceId))
  } catch {
    // Ignore persistence failures and keep the in-memory workspace usable.
  }
}
