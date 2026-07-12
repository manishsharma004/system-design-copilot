<svelte:options runes={false} />
<script>
  import { exportFullLocalData, downloadBackup, importFullLocalData } from '$lib/backup';
  import { progress } from '$lib/stores/progress';

  let importMessage = '';
  let importError = '';

  async function handleExport() {
    importMessage = '';
    importError = '';
    downloadBackup(await exportFullLocalData());
    importMessage = 'Backup downloaded.';
  }

  /** @param {Event} event */
  function handleImport(event) {
    importMessage = '';
    importError = '';
    const target = event.currentTarget;
    if (!(target instanceof HTMLInputElement)) return;
    const input = target;
    const file = input.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const parsed = JSON.parse(String(reader.result ?? ''));
        const result = await importFullLocalData(parsed);
        if (!result.ok) {
          importError = result.error;
          return;
        }
        importMessage = 'Backup restored. Reloading…';
        window.setTimeout(() => window.location.reload(), 600);
      } catch {
        importError = 'Could not parse backup file.';
      } finally {
        input.value = '';
      }
    };
    reader.readAsText(file);
  }

  function handleReset() {
    if (!window.confirm('Reset all lesson completion progress? Practice drafts and simulation sessions are kept unless you import a backup without them.')) {
      return;
    }
    progress.reset();
    importMessage = 'Progress reset.';
    importError = '';
  }
</script>

<div class="progress-controls">
  <button class="reset-link" type="button" onclick={handleExport}>Export backup</button>
  <label class="reset-link progress-import-label">
    Import backup
    <input accept="application/json,.json" type="file" onchange={handleImport} />
  </label>
  <button class="reset-link" type="button" onclick={handleReset}>Reset progress</button>
</div>
{#if importMessage}
  <p class="progress-controls-note success">{importMessage}</p>
{/if}
{#if importError}
  <p class="progress-controls-note error">{importError}</p>
{/if}

<style>
  .progress-controls {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem 0.75rem;
    align-items: center;
  }

  .progress-import-label {
    position: relative;
    cursor: pointer;
  }

  .progress-import-label input {
    position: absolute;
    width: 0.1px;
    height: 0.1px;
    opacity: 0;
    overflow: hidden;
  }

  .progress-controls-note {
    margin: 0.35rem 0 0;
    font-size: 0.85rem;
  }

  .progress-controls-note.success {
    color: var(--success);
  }

  .progress-controls-note.error {
    color: var(--danger);
  }
</style>
