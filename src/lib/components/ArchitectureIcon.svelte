<svelte:options runes={false} />
<script>
  import { getIconDef } from '$lib/simulation/componentIcons.js'

  /** Catalog / physics type id */
  export let type = 'service'
  /** Stroke / accent color */
  export let color = 'currentColor'
  export let size = 32
  /** When true, render as an SVG <g> for nesting inside a parent <svg> */
  export let nested = false
  export let title = ''

  $: def = getIconDef(type)
  $: viewBox = def.viewBox ?? '0 0 48 48'
  $: scale = size / 48

  /**
   * @param {any} part
   */
  function fillFor(part) {
    if (part.fill === 'solid') return color
    if (part.fill === 'soft') return color.startsWith('#') && color.length === 7 ? `${color}33` : 'rgba(255,255,255,0.12)'
    return 'none'
  }
</script>

{#if nested}
  <g transform={`scale(${scale})`} class="architecture-icon">
    {#if title}
      <title>{title}</title>
    {/if}
    {#each def.paths as part}
      {@const stroke = part.stroke === false ? 'none' : color}
      {@const strokeWidth = part.strokeWidth ?? (part.stroke === false ? 0 : 1.8)}
      {#if (part.tag ?? 'path') === 'rect'}
        <rect
          x={part.x}
          y={part.y}
          width={part.width}
          height={part.height}
          rx={part.rx ?? 0}
          ry={part.ry ?? part.rx ?? 0}
          fill={fillFor(part)}
          {stroke}
          stroke-width={strokeWidth}
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      {:else if part.tag === 'circle'}
        <circle
          cx={part.cx}
          cy={part.cy}
          r={part.r}
          fill={fillFor(part)}
          {stroke}
          stroke-width={strokeWidth}
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      {:else if part.tag === 'ellipse'}
        <ellipse
          cx={part.cx}
          cy={part.cy}
          rx={part.rx ?? part.r ?? 0}
          ry={part.ry ?? part.r ?? 0}
          fill={fillFor(part)}
          {stroke}
          stroke-width={strokeWidth}
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      {:else if part.tag === 'line'}
        <line
          x1={part.x1}
          y1={part.y1}
          x2={part.x2}
          y2={part.y2}
          fill="none"
          {stroke}
          stroke-width={strokeWidth}
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      {:else}
        <path
          d={part.d ?? ''}
          fill={fillFor(part)}
          {stroke}
          stroke-width={strokeWidth}
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      {/if}
    {/each}
  </g>
{:else}
  <svg
    class="architecture-icon"
    width={size}
    height={size}
    viewBox={viewBox}
    aria-hidden={title ? undefined : 'true'}
    role={title ? 'img' : undefined}
  >
    {#if title}
      <title>{title}</title>
    {/if}
    {#each def.paths as part}
      {@const stroke = part.stroke === false ? 'none' : color}
      {@const strokeWidth = part.strokeWidth ?? (part.stroke === false ? 0 : 1.8)}
      {#if (part.tag ?? 'path') === 'rect'}
        <rect
          x={part.x}
          y={part.y}
          width={part.width}
          height={part.height}
          rx={part.rx ?? 0}
          ry={part.ry ?? part.rx ?? 0}
          fill={fillFor(part)}
          {stroke}
          stroke-width={strokeWidth}
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      {:else if part.tag === 'circle'}
        <circle
          cx={part.cx}
          cy={part.cy}
          r={part.r}
          fill={fillFor(part)}
          {stroke}
          stroke-width={strokeWidth}
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      {:else if part.tag === 'ellipse'}
        <ellipse
          cx={part.cx}
          cy={part.cy}
          rx={part.rx ?? part.r ?? 0}
          ry={part.ry ?? part.r ?? 0}
          fill={fillFor(part)}
          {stroke}
          stroke-width={strokeWidth}
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      {:else if part.tag === 'line'}
        <line
          x1={part.x1}
          y1={part.y1}
          x2={part.x2}
          y2={part.y2}
          fill="none"
          {stroke}
          stroke-width={strokeWidth}
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      {:else}
        <path
          d={part.d ?? ''}
          fill={fillFor(part)}
          {stroke}
          stroke-width={strokeWidth}
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      {/if}
    {/each}
  </svg>
{/if}

<style>
  .architecture-icon {
    display: block;
    flex-shrink: 0;
  }
</style>
