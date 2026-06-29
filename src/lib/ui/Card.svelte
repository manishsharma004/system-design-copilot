<svelte:options runes={false} />
<script>
  /** @type {'default' | 'muted'} */
  export let variant = 'default';
  /** @type {0 | 2 | 3 | 4 | 5 | 6} */
  export let padding = 4;
  export let tag = 'div';
</script>

<svelte:element
  this={tag}
  class="xds-card xds-card--{variant === 'muted' ? 'muted' : 'default'} xds-card--padding-{padding}"
>
  <slot />
</svelte:element>
