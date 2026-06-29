<svelte:options runes={false} />
<script>
  export let open = false;
  export let summary = '';
</script>

<details class="xds-collapsible" bind:open>
  <summary>{summary}</summary>
  <div class="xds-collapsible-content">
    <slot />
  </div>
</details>

<style>
  .xds-collapsible-content {
    margin-top: var(--spacing-3);
  }
</style>
