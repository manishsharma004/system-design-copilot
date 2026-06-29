<svelte:options runes={false} />
<script>
  /** @type {'button' | 'submit' | 'reset'} */
  export let type = 'button';
  /** @type {'primary' | 'secondary' | 'ghost' | 'destructive'} */
  export let variant = 'secondary';
  /** @type {'sm' | 'md' | 'lg'} */
  export let size = 'md';
  export let label = '';
  export let disabled = false;
  export let href = '';
  export let target = '';
  export let rel = '';
  export let ariaExpanded = undefined;
</script>

{#if href}
  <a
    class="xds-btn xds-btn--{variant}{size !== 'md' ? ` xds-btn--${size}` : ''}"
    {href}
    {target}
    {rel}
    aria-disabled={disabled ? 'true' : undefined}
    aria-expanded={ariaExpanded}
    on:click
  >
    <slot>{label}</slot>
  </a>
{:else}
  <button
    class="xds-btn xds-btn--{variant}{size !== 'md' ? ` xds-btn--${size}` : ''}"
    {type}
    {disabled}
    aria-expanded={ariaExpanded}
    on:click
  >
    <slot>{label}</slot>
  </button>
{/if}
