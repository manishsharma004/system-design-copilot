<svelte:options runes={false} />
<script>
  /** @type {'primary' | 'secondary' | 'accent' | 'eyebrow'} */
  export let variant = 'primary';
  export let tag = 'span';
</script>

<svelte:element this={tag} class="xds-text xds-text--{variant}">
  <slot />
</svelte:element>
