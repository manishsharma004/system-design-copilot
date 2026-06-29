<svelte:options runes={false} />
<script>
  export let label = '';
  export let value = '';
  export let placeholder = '';
  export let description = '';
  export let isLabelHidden = false;
  export let rows = 6;
  export let id = `xds-textarea-${Math.random().toString(36).slice(2, 9)}`;
  export let disabled = false;
</script>

<label class="xds-field" for={id}>
  {#if label && !isLabelHidden}
    <span class="xds-field-label">{label}</span>
  {/if}
  <textarea
    class="xds-textarea"
    {id}
    {placeholder}
    {rows}
    {disabled}
    bind:value
    on:input
    on:change
    on:focus
    on:blur
  ></textarea>
  {#if description}
    <span class="xds-field-description">{description}</span>
  {/if}
</label>
