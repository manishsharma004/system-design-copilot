<svelte:options runes={false} />
<script>
  import { useRegisterSW } from 'virtual:pwa-register/svelte';

  const { needRefresh, updateServiceWorker, offlineReady } = useRegisterSW({
    immediate: false,
    onRegisterError(error) {
      console.warn('Service worker registration failed', error);
    }
  });

  $: visible = $offlineReady || $needRefresh;

  function close() {
    offlineReady.set(false);
    needRefresh.set(false);
  }

  function reload() {
    updateServiceWorker(true);
  }
</script>

{#if visible}
  <div class="pwa-banner panel" role="status" aria-live="polite">
    <p class="pwa-banner-copy">
      {#if $offlineReady}
        Lessons are cached — you can keep reading offline on this device.
      {:else}
        A newer version is available.
      {/if}
    </p>
    <div class="pwa-banner-actions">
      {#if $needRefresh}
        <button class="action-link primary" type="button" onclick={reload}>Reload</button>
      {/if}
      <button class="action-link" type="button" onclick={close}>Dismiss</button>
    </div>
  </div>
{/if}

<style>
  .pwa-banner {
    position: fixed;
    right: 1rem;
    bottom: 1rem;
    z-index: 60;
    display: grid;
    gap: 0.65rem;
    max-width: min(22rem, calc(100vw - 2rem));
    padding: 0.85rem 1rem;
    border-radius: 0.85rem;
    border: 1px solid rgba(105, 108, 255, 0.35);
    background: linear-gradient(180deg, rgba(105, 108, 255, 0.12), rgba(35, 35, 51, 0.98));
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.45);
  }

  .pwa-banner-copy {
    margin: 0;
    color: #dde4f5;
    font-size: 0.88rem;
    line-height: 1.55;
  }

  .pwa-banner-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }
</style>
