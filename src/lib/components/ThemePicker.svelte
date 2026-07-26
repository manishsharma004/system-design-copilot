<svelte:options runes={false} />
<script>
  import { THEME_OPTIONS } from '$lib/themes.js';
  import { theme } from '$lib/stores/theme.js';

  /** @param {string} themeId */
  function selectTheme(themeId) {
    theme.set(themeId);
  }
</script>

<div class="theme-picker" role="group" aria-label="Color theme">
  <span class="theme-picker-label">Theme</span>
  <div class="theme-picker-swatches">
    {#each THEME_OPTIONS as option}
      <button
        type="button"
        class="theme-swatch"
        class:active={$theme === option.id}
        title="{option.label} theme"
        aria-label="{option.label} theme"
        aria-pressed={$theme === option.id}
        style="--swatch-color: {option.swatch}"
        onclick={() => selectTheme(option.id)}
      >
        <span class="theme-swatch-dot" aria-hidden="true"></span>
      </button>
    {/each}
  </div>
</div>

<style>
  .theme-picker {
    display: flex;
    align-items: center;
    gap: 0.35rem;
  }

  .theme-picker-label {
    font-size: 0.68rem;
    font-weight: 700;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--muted);
    display: none;
  }

  .theme-picker-swatches {
    display: flex;
    align-items: center;
    gap: 0.3rem;
    padding: 0.2rem;
    border-radius: 0.45rem;
    border: 1px solid var(--border);
    background: var(--surface);
  }

  .theme-swatch {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 1.55rem;
    height: 1.55rem;
    padding: 0;
    border: 2px solid transparent;
    border-radius: 999px;
    background: transparent;
    cursor: pointer;
    transition: border-color 0.16s ease, transform 0.16s ease, box-shadow 0.16s ease;
  }

  .theme-swatch:hover {
    transform: scale(1.08);
  }

  .theme-swatch.active {
    border-color: var(--accent);
    box-shadow: 0 0 0 2px var(--accent-subtle);
  }

  .theme-swatch-dot {
    width: 0.85rem;
    height: 0.85rem;
    border-radius: 999px;
    background: var(--swatch-color);
    box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.12);
  }

  @media (min-width: 900px) {
    .theme-picker-label {
      display: inline;
    }
  }
</style>
