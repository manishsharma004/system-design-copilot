<svelte:options runes={false} />
<script>
  import { THEME_GROUPS, getThemeOption } from '$lib/themes.js';
  import { theme } from '$lib/stores/theme.js';

  $: activeTheme = getThemeOption($theme);

  /** @param {Event} event */
  function handleChange(event) {
    const target = /** @type {HTMLSelectElement} */ (event.currentTarget);
    theme.set(target.value);
  }
</script>

<div class="theme-picker">
  <label class="theme-picker-label" for="theme-select">Theme</label>
  <span class="theme-picker-swatch" style="--swatch-color: {activeTheme.swatch}" aria-hidden="true"></span>
  <select
    id="theme-select"
    class="theme-picker-select"
    value={$theme}
    aria-label="Color theme"
    onchange={handleChange}
  >
    {#each THEME_GROUPS as group}
      <optgroup label={group.label}>
        {#each group.themes as option}
          <option value={option.id}>{option.label}</option>
        {/each}
      </optgroup>
    {/each}
  </select>
</div>

<style>
  .theme-picker {
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    min-width: 0;
  }

  .theme-picker-label {
    font-size: 0.68rem;
    font-weight: 700;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--muted);
    display: none;
  }

  .theme-picker-swatch {
    width: 0.85rem;
    height: 0.85rem;
    border-radius: 999px;
    background: var(--swatch-color);
    box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.08);
    flex-shrink: 0;
  }

  .theme-picker-select {
    max-width: 8.5rem;
    min-height: 34px;
    padding: 0.3rem 1.6rem 0.3rem 0.45rem;
    border-radius: 0.4rem;
    border: 1px solid var(--border);
    background: var(--surface) url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%238b8fa7' d='M3 4.5 6 7.5 9 4.5'/%3E%3C/svg%3E") no-repeat right 0.45rem center;
    color: var(--text);
    font-size: 0.78rem;
    font-weight: 600;
    appearance: none;
    cursor: pointer;
  }

  .theme-picker-select:focus-visible {
    outline: 2px solid var(--accent);
    outline-offset: 2px;
  }

  @media (min-width: 900px) {
    .theme-picker-label {
      display: inline;
    }

    .theme-picker-select {
      max-width: 9.5rem;
    }
  }
</style>
