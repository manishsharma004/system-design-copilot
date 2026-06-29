<svelte:options runes={false} />
<script>
  /** @type {'section' | 'muted'} */
  export let variant = 'section';
  export let tag = 'section';
</script>

<svelte:element this={tag} class="xds-section{variant === 'muted' ? ' xds-section--muted' : ''}">
  <slot />
</svelte:element>
