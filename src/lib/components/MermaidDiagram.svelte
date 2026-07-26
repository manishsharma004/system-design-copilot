<svelte:options runes={false} />
<script>
  import { onMount } from 'svelte';
  import { getThemeOption } from '$lib/themes.js';
  import { theme } from '$lib/stores/theme.js';

  /** @type {{ title?: string, caption?: string, code?: string } | null} */
  export let diagram = null;
  export let variant = 'card';

  let mounted = false;
  let renderedSvg = '';
  let errorMessage = '';
  let renderedCode = '';
  let renderedTheme = '';
  const baseId = `mermaid-${Math.random().toString(36).slice(2)}`;

  /** @param {string} themeName */
  async function renderDiagram(themeName) {
    if (!diagram?.code) return;
    renderedSvg = '';
    errorMessage = '';
    try {
      const mermaid = (await import('mermaid')).default;
      mermaid.initialize({
        startOnLoad: false,
        securityLevel: 'strict',
        theme: /** @type {'dark' | 'default'} */ (themeName),
        fontFamily: 'Segoe WPC, Segoe UI, system-ui, sans-serif'
      });
      const { svg } = await mermaid.render(`${baseId}-${Date.now()}`, diagram.code);
      renderedSvg = svg;
      renderedTheme = themeName;
    } catch (error) {
      errorMessage = error instanceof Error ? error.message : 'Unable to render the diagram right now.';
    }
  }

  $: mermaidTheme = getThemeOption($theme).mode === 'light' ? 'default' : 'dark';

  onMount(() => {
    mounted = true;
    if (diagram?.code) {
      renderedCode = diagram.code;
      renderDiagram(mermaidTheme);
    }
  });

  $: if (mounted && diagram?.code && (diagram.code !== renderedCode || mermaidTheme !== renderedTheme)) {
    renderedCode = diagram.code;
    renderDiagram(mermaidTheme);
  }
</script>

{#if diagram?.code}
  <article class:diagram-card={variant !== 'extension'} class="mermaid-card" class:extension={variant === 'extension'}>
    {#if variant !== 'extension'}
      <p class="eyebrow">Interactive diagram</p>
      <h3>{diagram.title ?? 'Mermaid diagram'}</h3>
    {/if}
    {#if renderedSvg}
      <div class="mermaid-output">{@html renderedSvg}</div>
    {:else if errorMessage}
      <div class="mermaid-fallback">
        <p>{errorMessage}</p>
        <pre>{diagram.code}</pre>
      </div>
    {:else}
      <p class="muted">Rendering diagram…</p>
    {/if}
    {#if diagram.caption && variant !== 'extension'}
      <p>{diagram.caption}</p>
    {/if}
  </article>
{/if}

<style>
  .mermaid-card.extension {
    display: grid;
    gap: 0.8rem;
    padding: 0;
    border: none;
    background: transparent;
    box-shadow: none;
  }

  .mermaid-card.extension h3,
  .mermaid-card.extension p {
    margin: 0;
  }

  .mermaid-card.extension .mermaid-output,
  .mermaid-card.extension .mermaid-fallback {
    padding: 0.9rem;
    border: 1px solid var(--border);
    border-radius: 0.45rem;
    background: var(--code-bg);
  }

  .mermaid-card.extension .mermaid-output :global(svg) {
    width: 100%;
    height: auto;
  }
</style>
