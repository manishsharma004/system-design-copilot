<svelte:options runes={false} />
<script>
  export let title = '';
  export let description = '';
  export let compact = false;
</script>

<div class="xds-empty{compact ? ' xds-empty--compact' : ''}">
  <slot name="icon" />
  {#if title}
    <h3 class="xds-empty-title">{title}</h3>
  {/if}
  {#if description}
    <p>{description}</p>
  {/if}
  <slot />
</div>

<style>
  .xds-empty--compact {
    padding: var(--spacing-4);
  }
</style>
