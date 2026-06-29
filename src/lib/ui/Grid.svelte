<svelte:options runes={false} />
<script>
  /** @type {'auto' | '2' | '3'} */
  export let columns = 'auto';
  /** @type {1 | 2 | 3 | 4 | 5 | 6} */
  export let gap = 4;
</script>

<div class="xds-grid xds-grid--{columns}" style:gap="var(--spacing-{gap})">
  <slot />
</div>
