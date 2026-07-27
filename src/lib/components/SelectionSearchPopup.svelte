<svelte:options runes={false} />
<script>
  import { buildSearchEngineUrls } from '$lib/llm/providers.js';

  /** @type {HTMLElement | undefined} */
  export let rootEl;

  const STORAGE_KEY = 'system-design-copilot-learn-search-engine';
  const engines = [
    { id: 'perplexity', label: 'Perplexity' },
    { id: 'google', label: 'Google' },
    { id: 'duckduckgo', label: 'DuckDuckGo' }
  ];

  let open = false;
  let selectedText = '';
  let engine = 'perplexity';
  let left = 0;
  let top = 0;

  if (typeof localStorage !== 'undefined') {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && engines.some((item) => item.id === saved)) {
      engine = saved;
    }
  }

  /** @param {MouseEvent} event */
  function handleMouseUp(event) {
    if (!rootEl) return;
    const target = event.target;
    if (target instanceof Element && target.closest('.learn-selection-popup')) {
      return;
    }

    const selection = window.getSelection();
    const text = selection?.toString().trim() ?? '';
    if (!text || text.length < 2) {
      open = false;
      return;
    }

    if (!selection || selection.rangeCount === 0) {
      open = false;
      return;
    }

    const range = selection.getRangeAt(0);
    const common = range.commonAncestorContainer;
    const node = common.nodeType === Node.ELEMENT_NODE ? common : common.parentElement;
    if (!(node instanceof Element) || !rootEl.contains(node)) {
      open = false;
      return;
    }

    const rect = range.getBoundingClientRect();
    if (!rect || (rect.width === 0 && rect.height === 0)) {
      open = false;
      return;
    }

    selectedText = text;
    const popupWidth = 280;
    const popupHeight = 96;
    left = Math.min(Math.max(12, rect.left + rect.width / 2 - popupWidth / 2), window.innerWidth - popupWidth - 12);
    top = Math.min(Math.max(12, rect.bottom + 8), window.innerHeight - popupHeight - 12);
    open = true;
  }

  function handleSelectionChange() {
    const selection = window.getSelection();
    const text = selection?.toString().trim() ?? '';
    if (!text) {
      open = false;
    }
  }

  /** @param {KeyboardEvent} event */
  function handleKeydown(event) {
    if (event.key === 'Escape') {
      open = false;
    }
  }

  /** @param {MouseEvent} event */
  function handlePointerDown(event) {
    const target = event.target;
    if (target instanceof Element && target.closest('.learn-selection-popup')) {
      return;
    }
    // Delay clear so Search button click can fire first when popup is open.
    if (open && !(target instanceof Element && rootEl?.contains(target))) {
      open = false;
    }
  }

  function persistEngine() {
    try {
      localStorage.setItem(STORAGE_KEY, engine);
    } catch {
      // Ignore quota / private-mode failures.
    }
  }

  /** @param {Event} event */
  function onEngineChange(event) {
    const target = event.currentTarget;
    if (!(target instanceof HTMLSelectElement)) return;
    engine = target.value;
    persistEngine();
  }

  function searchSelection() {
    if (!selectedText.trim()) return;
    const urls = buildSearchEngineUrls(selectedText.trim());
    const url = urls[engine] || urls.perplexity;
    window.open(url, '_blank', 'noopener,noreferrer');
    open = false;
  }
</script>

<svelte:window
  onmouseup={handleMouseUp}
  onselectionchange={handleSelectionChange}
  onkeydown={handleKeydown}
  onpointerdown={handlePointerDown}
/>

{#if open}
  <div
    class="learn-selection-popup"
    style={`left:${left}px;top:${top}px;`}
    role="dialog"
    aria-label="Search with AI"
  >
    <p class="learn-selection-label">Search with AI</p>
    <div class="learn-selection-row">
      <label class="learn-selection-select-wrap">
        <span class="visually-hidden">Search provider</span>
        <select value={engine} onchange={onEngineChange}>
          {#each engines as item}
            <option value={item.id}>{item.label}</option>
          {/each}
        </select>
      </label>
      <button class="action-link primary learn-selection-search" type="button" onclick={searchSelection}>
        Search
      </button>
    </div>
    <p class="learn-selection-snippet">{selectedText}</p>
  </div>
{/if}

<style>
  .learn-selection-popup {
    position: fixed;
    z-index: 80;
    width: min(18rem, calc(100vw - 1.5rem));
    display: grid;
    gap: 0.45rem;
    padding: 0.65rem 0.75rem;
    border: 1px solid var(--border);
    border-radius: 0.75rem;
    background: var(--panel);
    box-shadow: var(--shadow, 0 12px 40px rgba(0, 0, 0, 0.35));
  }

  .learn-selection-label {
    margin: 0;
    font-size: 0.72rem;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: var(--muted, #a1a1aa);
  }

  .learn-selection-row {
    display: grid;
    grid-template-columns: 1fr auto;
    gap: 0.45rem;
    align-items: center;
  }

  .learn-selection-select-wrap select {
    width: 100%;
    border: 1px solid var(--border);
    border-radius: 0.5rem;
    background: var(--surface, #2b2c40);
    color: var(--text);
    padding: 0.35rem 0.5rem;
    font: inherit;
  }

  .learn-selection-search {
    white-space: nowrap;
  }

  .learn-selection-snippet {
    margin: 0;
    max-height: 2.6rem;
    overflow: hidden;
    font-size: 0.75rem;
    color: var(--muted, #a1a1aa);
    line-height: 1.3;
  }

  .visually-hidden {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }
</style>
