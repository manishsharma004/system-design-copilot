<svelte:options runes={false} />
<script>
  import { onMount } from 'svelte';

  /** @type {{ id: string, label: string, action?: string }[]} */
  export let sections = [];
  /** When set, renders a Learn pill that calls this instead of scrolling. */
  /** @type {(() => void) | null} */
  export let onLearnOpen = null;

  let activeId = sections[0]?.id ?? '';

  onMount(() => {
    const ids = sections.map((section) => section.id).filter((id) => id !== 'learn-chapter');
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

  /** @param {string} sectionId */
  function jumpToSection(sectionId) {
    if (sectionId === 'learn' && onLearnOpen) {
      onLearnOpen();
      return;
    }
    const target = document.getElementById(sectionId);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  /** @param {Event} event */
  function handleJumpSelect(event) {
    const select = event.currentTarget;
    if (!(select instanceof HTMLSelectElement)) return;
    const value = select.value;
    if (value) jumpToSection(value);
    select.value = '';
  }
</script>

{#if sections.length > 1 || onLearnOpen}
  <label class="lesson-section-jump-label">
    <span class="lesson-section-jump-text">Jump to</span>
    <select class="lesson-section-jump" aria-label="Jump to lesson section" onchange={handleJumpSelect}>
      <option value="">Section…</option>
      {#if onLearnOpen}
        <option value="learn">Learn</option>
      {/if}
      {#each sections as section}
        {#if section.action !== 'learn'}
          <option value={section.id}>{section.label}</option>
        {/if}
      {/each}
    </select>
  </label>
  <nav class="lesson-section-nav" aria-label="Jump to lesson section">
    {#if onLearnOpen}
      <button
        class="lesson-section-nav-link learn-nav-button"
        type="button"
        onclick={() => onLearnOpen?.()}
      >
        Learn
      </button>
    {/if}
    {#each sections as section}
      {#if section.action === 'learn'}
        <!-- learn handled by button above when onLearnOpen set -->
      {:else}
        <a
          class:active={activeId === section.id}
          class="lesson-section-nav-link"
          href={`#${section.id}`}
        >
          {section.label}
        </a>
      {/if}
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

  .learn-nav-button {
    background: rgba(105, 108, 255, 0.14);
    border-color: var(--border-strong);
    color: var(--text);
    cursor: pointer;
    font-family: inherit;
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

  .lesson-section-jump-label {
    display: none;
    margin: 0 0 0.75rem;
  }

  .lesson-section-jump-text {
    display: block;
    margin-bottom: 0.35rem;
    font-size: 0.75rem;
    font-weight: 600;
    color: var(--muted);
  }

  .lesson-section-jump {
    width: 100%;
    padding: 0.5rem 0.65rem;
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    background: var(--surface-strong);
    color: var(--text);
    font-family: inherit;
    font-size: 0.9rem;
  }

  @media (max-width: 719px) {
    .lesson-section-jump-label {
      display: block;
      position: sticky;
      top: 0.35rem;
      z-index: 6;
    }

    .lesson-section-nav {
      display: none;
    }
  }

  @media (min-width: 720px) {
    .lesson-section-nav {
      top: 5.75rem;
    }
  }
</style>
