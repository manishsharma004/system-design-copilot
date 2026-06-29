<svelte:options runes={false} />
<script>
  /** @type {'neutral' | 'info' | 'success' | 'warning' | 'error'} */
  export let variant = 'neutral';
  export let label = '';
  let className = '';
  export { className as class };
</script>

<span class="xds-badge xds-badge--{variant}{className ? ` ${className}` : ''}">
  <slot>{label}</slot>
</span>
