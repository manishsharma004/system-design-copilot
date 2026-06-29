<svelte:options runes={false} />
<script>
  export let label = '';
  export let description = '';
  export let isLabelHidden = false;
  export let inputID = `xds-field-${Math.random().toString(36).slice(2, 9)}`;
</script>

<div class="xds-field">
  {#if label && !isLabelHidden}
    <label class="xds-field-label" for={inputID}>{label}</label>
  {/if}
  <slot {inputID} />
  {#if description}
    <span class="xds-field-description">{description}</span>
  {/if}
</div>
