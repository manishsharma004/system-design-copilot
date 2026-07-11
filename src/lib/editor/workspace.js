/**
 * Shared virtual-filesystem convention for IDEWorkspace consumers.
 *
 * Usage:
 *   const workspaceId = buildWorkspaceId('simulation', lesson.id)
 *   const seedFiles = [...]
 *   <IDEWorkspace workspaceId={workspaceId} files={seedFiles} ... />
 */

import { clearWorkspaceSnapshot, loadWorkspaceSnapshot, saveWorkspaceSnapshot } from './indexedDbWorkspace.js'
import {
  buildWorkspaceId,
  collectFoldersFromFiles,
  createSeedFile,
  findFileByPath,
  SIMULATION_PATHS
} from './workspaceCore.js'

export {
  buildWorkspaceId,
  collectFoldersFromFiles,
  createSeedFile,
  findFileByPath,
  SIMULATION_PATHS
}

/** @param {string} value */
function normalizePath(value) {
  return (value ?? '').replace(/\\/g, '/').replace(/^\/+|\/+$/g, '')
}

/**
 * @param {string} workspaceId
 * @param {any[]} seedFiles
 * @param {any[]} legacyFiles Files with { path, value } from localStorage migration
 */
export async function migrateLegacySession(workspaceId, seedFiles, legacyFiles = []) {
  const snapshot = await loadWorkspaceSnapshot(workspaceId)
  const hasPersistedContent = (snapshot.files ?? []).some((file) => {
    const seed = seedFiles.find((entry) => entry.id === file.id || entry.path === file.path)
    if (!seed) return true
    if (seed.persistContent === false) return false
    return Boolean(file.value)
  })

  if (hasPersistedContent) {
    return snapshot
  }

  const merged = seedFiles.map((seed) => {
    const legacy = legacyFiles.find((entry) => normalizePath(entry.path) === normalizePath(seed.path))
    if (!legacy || seed.persistContent === false) {
      return seed
    }
    return { ...seed, value: legacy.value ?? seed.value ?? '' }
  })

  const nextSnapshot = {
    files: merged,
    folders: collectFoldersFromFiles(merged),
    activeFileId: merged[0]?.id ?? ''
  }
  await saveWorkspaceSnapshot(workspaceId, nextSnapshot)
  return nextSnapshot
}

/**
 * @param {string} workspaceId
 * @param {any[]} seedFiles
 */
export async function resetWorkspace(workspaceId, seedFiles) {
  await clearWorkspaceSnapshot(workspaceId)
  const nextSnapshot = {
    files: seedFiles.map((file) => ({ ...file })),
    folders: collectFoldersFromFiles(seedFiles),
    activeFileId: seedFiles[0]?.id ?? ''
  }
  await saveWorkspaceSnapshot(workspaceId, nextSnapshot)
  return nextSnapshot
}
