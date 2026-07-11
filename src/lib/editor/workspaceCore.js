/** Pure workspace helpers (no IndexedDB / SvelteKit imports). */

/** @param {string} kind @param {string} id */
export function buildWorkspaceId(kind, id) {
  return `${kind}:${id}`
}

/** @param {string} value */
function normalizePath(value) {
  return (value ?? '').replace(/\\/g, '/').replace(/^\/+|\/+$/g, '')
}

/** @param {string} path */
export function isValidWorkspacePath(path) {
  const normalized = normalizePath(path)
  if (!normalized) return false
  return !normalized.split('/').some((part) => part === '..' || part === '.')
}

/** @param {string} path */
export function getParentPath(path) {
  const parts = normalizePath(path).split('/').filter(Boolean)
  return parts.slice(0, -1).join('/')
}

/** @param {string} path */
function getBaseName(path) {
  const parts = normalizePath(path).split('/').filter(Boolean)
  return parts[parts.length - 1] ?? path
}

/** @param {string} name */
function inferLanguage(name) {
  if (name.endsWith('.ts')) return 'typescript'
  if (name.endsWith('.js')) return 'javascript'
  if (name.endsWith('.json')) return 'json'
  if (name.endsWith('.md')) return 'markdown'
  if (name.endsWith('.flow')) return 'flow-graph'
  return 'plaintext'
}

/**
 * @param {{ path: string, value?: string, readOnly?: boolean, id?: string, label?: string, language?: string, icon?: string }} input
 */
export function createSeedFile(input) {
  const path = normalizePath(input.path)
  const filename = getBaseName(path)
  const language = input.language ?? inferLanguage(filename)
  return {
    id: input.id ?? path,
    path,
    filename,
    label: input.label ?? filename,
    language,
    icon: input.icon,
    value: input.value ?? '',
    persistContent: input.readOnly ? false : true,
    isUserCreated: false
  }
}

/** @param {any[]} files @param {string} path */
export function findFileByPath(files, path) {
  const normalized = normalizePath(path)
  return files.find((file) => normalizePath(file.path) === normalized) ?? null
}

/** @param {any[]} files */
export function collectFoldersFromFiles(files) {
  /** @type {Set<string>} */
  const folders = new Set()
  for (const file of files) {
    const parts = normalizePath(file.path).split('/').filter(Boolean)
    let current = ''
    for (const part of parts.slice(0, -1)) {
      current = current ? `${current}/${part}` : part
      folders.add(current)
    }
  }
  return [...folders].sort((left, right) => left.localeCompare(right))
}

export const SIMULATION_PATHS = {
  topology: 'src/topology.flow',
  overrides: 'src/overrides.ts',
  layout: 'src/topology.layout.json'
}
