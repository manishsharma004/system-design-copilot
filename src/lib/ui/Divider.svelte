<svelte:options runes={false} />
<script>
  /** @type {'horizontal' | 'vertical'} */
  export let orientation = 'horizontal';
  /** @type {'subtle' | 'strong'} */
  export let variant = 'subtle';
</script>

{#if orientation === 'horizontal'}
  <hr class="xds-divider{variant === 'strong' ? ' xds-divider--strong' : ''}" />
{:else}
  <div class="xds-divider xds-divider--vertical" role="separator" aria-orientation="vertical"></div>
{/if}

<style>
  .xds-divider--vertical {
    width: 1px;
    height: 100%;
    min-height: 1rem;
    border: none;
    border-left: 1px solid var(--color-border);
    align-self: stretch;
  }
</style>
