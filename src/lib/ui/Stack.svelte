<svelte:options runes={false} />
<script>
  /** @type {1 | 2 | 3 | 4 | 5 | 6} */
  export let gap = 4;
</script>

<div class="xds-stack xds-stack--gap-{gap}">
  <slot />
</div>
