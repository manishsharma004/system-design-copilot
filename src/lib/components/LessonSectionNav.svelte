<svelte:options runes={false} />
<script>
  import { onMount } from 'svelte';

  /** @type {{ id: string, label: string }[]} */
  export let sections = [];

  let activeId = sections[0]?.id ?? '';

  onMount(() => {
    const ids = sections.map((section) => section.id);
    const elements = ids
      .map((id) => document.getElementById(id))
      .filter((element) => element instanceof HTMLElement);

    if (!elements.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]?.target?.id) {
          activeId = visible[0].target.id;
        }
      },
      { rootMargin: '-30% 0px -55% 0px', threshold: [0, 0.15, 0.4, 0.7] }
    );

    for (const element of elements) {
      observer.observe(element);
    }

    return () => observer.disconnect();
  });
</script>

{#if sections.length > 1}
  <nav class="lesson-section-nav" aria-label="Jump to lesson section">
    {#each sections as section}
      <a
        class:active={activeId === section.id}
        class="lesson-section-nav-link"
        href={`#${section.id}`}
      >
        {section.label}
      </a>
    {/each}
  </nav>
{/if}

<style>
  .lesson-section-nav {
    position: sticky;
    top: 5.75rem;
    z-index: 5;
    display: flex;
    flex-wrap: wrap;
    gap: 0.35rem;
    margin: 0 0 0.75rem;
    padding: 0.45rem;
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    background: var(--surface-strong);
    box-shadow: var(--shadow-soft);
  }

  .lesson-section-nav-link {
    padding: 0.35rem 0.65rem;
    border-radius: 999px;
    border: 1px solid transparent;
    color: var(--muted);
    font-size: 0.82rem;
    font-weight: 600;
    text-decoration: none;
    transition: color 0.15s ease, border-color 0.15s ease, background 0.15s ease;
  }

  .lesson-section-nav-link:hover {
    color: var(--text);
    border-color: var(--border);
    background: rgba(105, 108, 255, 0.08);
  }

  .lesson-section-nav-link.active {
    color: var(--text);
    border-color: var(--border-strong);
    background: rgba(105, 108, 255, 0.14);
  }

  @media (max-width: 719px) {
    .lesson-section-nav {
      top: 0.35rem;
      overflow-x: auto;
      flex-wrap: nowrap;
      -webkit-overflow-scrolling: touch;
    }

    .lesson-section-nav-link {
      white-space: nowrap;
    }
  }
</style>
