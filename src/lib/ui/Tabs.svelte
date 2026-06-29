<svelte:options runes={false} />
<script>
  /** @type {Array<{ id: string, label: string }>} */
  export let tabs = [];
  export let activeTab = '';
</script>

<div class="xds-tabs" role="tablist">
  {#each tabs as tab (tab.id)}
    <button
      class="xds-tab{activeTab === tab.id ? ' xds-tab--active' : ''}"
      type="button"
      role="tab"
      aria-selected={activeTab === tab.id}
      on:click={() => activeTab = tab.id}
    >
      {tab.label}
    </button>
  {/each}
</div>
