<svelte:options runes={false} />
<script>
  export let label = '';
  export let value = '';
  export let type = 'text';
  export let placeholder = '';
  export let description = '';
  export let isLabelHidden = false;
  export let id = `xds-input-${Math.random().toString(36).slice(2, 9)}`;
  export let disabled = false;
  let className = '';
  export { className as class };
</script>

<label class="xds-field" for={id}>
  {#if label && !isLabelHidden}
    <span class="xds-field-label">{label}</span>
  {/if}
  <input
    class="xds-input{className ? ` ${className}` : ''}"
    {id}
    {type}
    {placeholder}
    {disabled}
    bind:value
    on:input
    on:change
    on:focus
    on:blur
  />
  {#if description}
    <span class="xds-field-description">{description}</span>
  {/if}
</label>
