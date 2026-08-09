const isBrowser = typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';

export const BACKUP_VERSION = 2;

/** Keys persisted in the browser for this app. */
export const BACKUP_STORAGE_KEYS = {
  progress: 'system-design-copilot-progress-v4',
  practice: 'system-design-copilot-practice-v1',
  simulation: 'system-design-copilot-simulation-v1',
  llm: 'system-design-copilot-llm-v1',
  sidebar: 'system-design-copilot-sidebar-v4',
  aiStudyPath: 'system-design-copilot-ai-study-path-v1',
  reviewQueue: 'system-design-copilot-review-queue-v1'
};

const LEARN_POSITION_PREFIX = 'system-design-copilot-learn-position-v1:';
const ML_PRACTICE_PREFIX = 'ml-practice:';

/**
 * @param {string} prefix
 */
function exportPrefixedLocalStorage(prefix) {
  if (!isBrowser) return {};
  /** @type {Record<string, string>} */
  const out = {};
  for (let i = 0; i < window.localStorage.length; i++) {
    const key = window.localStorage.key(i);
    if (key?.startsWith(prefix)) {
      const raw = window.localStorage.getItem(key);
      if (raw != null) out[key] = raw;
    }
  }
  return out;
}

/**
 * @returns {BackupPayload}
 */
export function exportLocalData() {
  if (!isBrowser) {
    return { version: BACKUP_VERSION, exportedAt: new Date().toISOString(), data: {} };
  }

  /** @type {Record<string, unknown>} */
  const data = {};
  for (const [name, key] of Object.entries(BACKUP_STORAGE_KEYS)) {
    try {
      const raw = window.localStorage.getItem(key);
      if (raw != null) {
        data[name] = JSON.parse(raw);
      }
    } catch {
      const raw = window.localStorage.getItem(key);
      if (raw != null) {
        data[name] = raw;
      }
    }
  }

  data.learnPositions = exportPrefixedLocalStorage(LEARN_POSITION_PREFIX);
  data.mlPracticeDrafts = exportPrefixedLocalStorage(ML_PRACTICE_PREFIX);

  return {
    version: BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
    data
  };
}

/**
 * @returns {Promise<BackupPayload>}
 */
export async function exportFullLocalData() {
  const payload = exportLocalData();
  if (!isBrowser) {
    return payload;
  }
  const { listWorkspaceSnapshots } = await import('./editor/indexedDbWorkspace.js');
  payload.data.workspaces = await listWorkspaceSnapshots();
  return payload;
}

/**
 * @param {unknown} payload
 * @returns {{ ok: true } | { ok: false, error: string }}
 */
export function importLocalData(payload) {
  if (!isBrowser) {
    return { ok: false, error: 'Import is only available in the browser.' };
  }

  if (!payload || typeof payload !== 'object') {
    return { ok: false, error: 'Invalid backup file.' };
  }

  const record = /** @type {BackupPayload} */ (payload);
  if (!record.data || typeof record.data !== 'object' || Array.isArray(record.data)) {
    return { ok: false, error: 'Backup is missing a data object.' };
  }

  for (const [name, key] of Object.entries(BACKUP_STORAGE_KEYS)) {
    if (!(name in record.data)) continue;
    try {
      const value = record.data[name];
      if (name === 'aiStudyPath' && typeof value === 'string') {
        window.localStorage.setItem(key, value);
      } else {
        window.localStorage.setItem(key, JSON.stringify(value));
      }
    } catch {
      return { ok: false, error: `Could not restore ${name}. Storage may be full.` };
    }
  }

  const learnPositions = record.data.learnPositions;
  if (learnPositions && typeof learnPositions === 'object' && !Array.isArray(learnPositions)) {
    for (const [key, value] of Object.entries(learnPositions)) {
      if (typeof key === 'string' && typeof value === 'string') {
        try {
          window.localStorage.setItem(key, value);
        } catch {
          return { ok: false, error: 'Could not restore learn reader positions.' };
        }
      }
    }
  }

  const mlPracticeDrafts = record.data.mlPracticeDrafts;
  if (mlPracticeDrafts && typeof mlPracticeDrafts === 'object' && !Array.isArray(mlPracticeDrafts)) {
    for (const [key, value] of Object.entries(mlPracticeDrafts)) {
      if (typeof key === 'string' && typeof value === 'string') {
        try {
          window.localStorage.setItem(key, value);
        } catch {
          return { ok: false, error: 'Could not restore ML practice drafts.' };
        }
      }
    }
  }

  return { ok: true };
}

/**
 * @param {unknown} payload
 * @returns {Promise<{ ok: true } | { ok: false, error: string }>}
 */
export async function importFullLocalData(payload) {
  const localResult = importLocalData(payload);
  if (!localResult.ok || !isBrowser) {
    return localResult;
  }

  const record = /** @type {BackupPayload} */ (payload);
  const workspaces = record.data?.workspaces;
  if (!workspaces || typeof workspaces !== 'object' || Array.isArray(workspaces)) {
    return { ok: true };
  }

  try {
    const { saveWorkspaceSnapshot } = await import('./editor/indexedDbWorkspace.js');
    for (const [workspaceId, snapshot] of Object.entries(workspaces)) {
      if (snapshot && typeof snapshot === 'object') {
        await saveWorkspaceSnapshot(workspaceId, /** @type {any} */ (snapshot));
      }
    }
  } catch {
    return { ok: false, error: 'Could not restore IDE workspaces.' };
  }

  return { ok: true };
}

/**
 * @param {BackupPayload} payload
 */
export function downloadBackup(payload) {
  if (!isBrowser) return;
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `system-design-copilot-backup-${new Date().toISOString().slice(0, 10)}.json`;
  anchor.click();
  URL.revokeObjectURL(url);
}
