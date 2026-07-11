const isBrowser = typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';

export const BACKUP_VERSION = 2;

/** Keys persisted in the browser for this app. */
export const BACKUP_STORAGE_KEYS = {
  progress: 'system-design-copilot-progress-v4',
  practice: 'system-design-copilot-practice-v1',
  simulation: 'system-design-copilot-simulation-v1',
  llm: 'system-design-copilot-llm-v1',
  sidebar: 'system-design-copilot-sidebar-v3'
};

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
      window.localStorage.setItem(key, JSON.stringify(record.data[name]));
    } catch {
      return { ok: false, error: `Could not restore ${name}. Storage may be full.` };
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
