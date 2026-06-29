<svelte:options runes={false} />
<script>
  export let href = '';
  export let target = '';
  export let rel = '';
</script>

<a class="xds-link" {href} {target} {rel} on:click>
  <slot />
</a>
