<svelte:options runes={false} />
<script>
  import { onMount } from 'svelte';

  /** @type {{ title?: string, caption?: string, code?: string } | null} */
  export let diagram = null;
  export let variant = 'card';

  let mounted = false;
  let renderedSvg = '';
  let errorMessage = '';
  let renderedCode = '';
  const baseId = `mermaid-${Math.random().toString(36).slice(2)}`;

  async function renderDiagram() {
    if (!diagram?.code) return;
    renderedSvg = '';
    errorMessage = '';
    try {
      const mermaid = (await import('mermaid')).default;
      mermaid.initialize({
        startOnLoad: false,
        securityLevel: 'strict',
        theme: 'dark',
        fontFamily: 'Segoe WPC, Segoe UI, system-ui, sans-serif'
      });
      const { svg } = await mermaid.render(`${baseId}-${Date.now()}`, diagram.code);
      renderedSvg = svg;
    } catch (error) {
      errorMessage = error instanceof Error ? error.message : 'Unable to render the diagram right now.';
    }
  }

  onMount(() => {
    mounted = true;
    if (diagram?.code) {
      renderedCode = diagram.code;
      renderDiagram();
    }
  });

  $: if (mounted && diagram?.code && diagram.code !== renderedCode) {
    renderedCode = diagram.code;
    renderDiagram();
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
    border: 1px solid #252a35;
    border-radius: 0.45rem;
    background: #11131a;
  }

  .mermaid-card.extension .mermaid-output :global(svg) {
    width: 100%;
    height: auto;
  }
</style>
