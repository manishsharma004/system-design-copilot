<svelte:options runes={false} />
<script>
  import { onMount } from 'svelte';

  /** @type {{ title?: string, caption?: string, code?: string } | null} */
  export let diagram = null;

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
        fontFamily: 'Inter, system-ui, sans-serif'
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
  <article class="diagram-card mermaid-card">
    <p class="eyebrow">Interactive diagram</p>
    <h3>{diagram.title ?? 'Mermaid diagram'}</h3>
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
    {#if diagram.caption}
      <p>{diagram.caption}</p>
    {/if}
  </article>
{/if}
