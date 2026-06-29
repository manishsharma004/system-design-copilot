<svelte:options runes={false} />
<script>
  /** @type {'sm' | 'md' | 'lg'} */
  export let size = 'md';
  export let label = 'Loading';
</script>

<div class="xds-spinner xds-spinner--{size}" role="status" aria-label={label}></div>
