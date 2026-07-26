<svelte:options runes={false} />
<script>
  // @ts-nocheck
  import MarkdownIt from 'markdown-it'
  import { buildAnswerCheckPrompt } from '$lib/llm/checkPrompts'
  import { buildSearchEngineUrls, getLlmProvider, getLlmProviders, requestLlmCompletion } from '$lib/llm/providers'
  import { llmSettings } from '$lib/stores/llm'

  export let title = 'AI copilot'
  /** Question / objective text shown to the model as "Question:" */
  export let objective = ''
  /** User's answer / draft shown as "User answer:" */
  export let draft = ''
  export let contextSections = []
  /** Curriculum flow slug or "simulation" for check rubrics */
  export let flowId = ''
  /** When false, hide Generate outline (coding / simulation check-only surfaces) */
  export let showOutline = true

  const providers = getLlmProviders()
  let settingsOpen = false
  let feedbackOpen = false
  let loading = false
  let responseText = ''
  let responseHtml = ''
  let errorText = ''
  let extraPrompt = ''
  /** @type {HTMLElement | null} */
  let responseRegion = null

  $: hasFeedback = Boolean(errorText?.trim() || responseText?.trim())

  const markdown = new MarkdownIt({
    html: false,
    linkify: true,
    breaks: true,
    typographer: true
  })

  const defaultLinkRenderer = markdown.renderer.rules.link_open || function renderLink(tokens, idx, options, _env, self) {
    return self.renderToken(tokens, idx, options)
  }

  markdown.renderer.rules.link_open = function renderSafeLink(tokens, idx, options, env, self) {
    const targetIndex = tokens[idx].attrIndex('target')
    const relIndex = tokens[idx].attrIndex('rel')

    if (targetIndex < 0) {
      tokens[idx].attrPush(['target', '_blank'])
    } else {
      tokens[idx].attrs[targetIndex][1] = '_blank'
    }

    if (relIndex < 0) {
      tokens[idx].attrPush(['rel', 'noopener noreferrer nofollow'])
    } else {
      tokens[idx].attrs[relIndex][1] = 'noopener noreferrer nofollow'
    }

    return defaultLinkRenderer(tokens, idx, options, env, self)
  }

  $: activeProvider = getLlmProvider($llmSettings.providerId)
  $: isSearchEngineProvider = activeProvider?.id === 'search-engine'
  $: providerSupportsTemplates = Boolean(activeProvider?.supportsCustomTemplate)
  $: isCloudProvider = activeProvider?.family === 'cloud'
  $: needsApiKeyHint = !isSearchEngineProvider
    && activeProvider?.family === 'cloud'
    && !$llmSettings.apiKey?.trim()
  $: responseHtml = renderResponseMarkdown(responseText)
  $: providerShortLabel = isSearchEngineProvider
    ? 'Search'
    : (activeProvider?.label?.split(' ')[0] ?? 'Model')

  const searchEngineOptions = [
    { id: 'all', label: 'All engines' },
    { id: 'google', label: 'Google' },
    { id: 'duckduckgo', label: 'DuckDuckGo' },
    { id: 'perplexity', label: 'Perplexity' }
  ]

  function updateField(field, event) {
    llmSettings.updateField(field, event.currentTarget.value)
  }

  function escapeHtml(value) {
    return String(value)
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#39;')
  }

  function renderResponseMarkdown(value) {
    if (!value?.trim()) return ''
    try {
      return markdown.render(value)
    } catch {
      return `<pre>${escapeHtml(value)}</pre>`
    }
  }

  function focusResponseRegion() {
    queueMicrotask(() => {
      responseRegion?.focus?.()
      responseRegion?.scrollIntoView?.({ behavior: 'smooth', block: 'nearest' })
    })
  }

  function dismissFeedback() {
    errorText = ''
    responseText = ''
    feedbackOpen = false
  }

  /**
   * @param {'outline' | 'check' | 'review'} mode
   */
  async function runAssistant(mode) {
    errorText = ''
    responseText = ''
    feedbackOpen = true
    loading = true
    try {
      const userPrompt = buildAnswerCheckPrompt({
        flowId,
        mode,
        question: objective,
        answer: draft,
        contextSections,
        extraRequest: extraPrompt
      })

      if (isSearchEngineProvider) {
        const systemPrompt = $llmSettings.systemPrompt || 'You are a concise system design interview coach.'
        const prompt = `System: ${systemPrompt}\nUser: ${userPrompt}`
        const urls = buildSearchEngineUrls(prompt)
        const selectedEngine = ($llmSettings.model || 'all').trim().toLowerCase()

        if (selectedEngine === 'google') {
          responseText = `Open in Google:\n\n[${urls.google}](${urls.google})`
          return
        }

        if (selectedEngine === 'duckduckgo') {
          responseText = `Open in DuckDuckGo:\n\n[${urls.duckduckgo}](${urls.duckduckgo})`
          return
        }

        if (selectedEngine === 'perplexity') {
          responseText = `Open in Perplexity:\n\n[${urls.perplexity}](${urls.perplexity})`
          return
        }

        responseText = [
          'Open this prompt in search engines:',
          '',
          `- Google: [${urls.google}](${urls.google})`,
          `- DuckDuckGo: [${urls.duckduckgo}](${urls.duckduckgo})`,
          `- Perplexity: [${urls.perplexity}](${urls.perplexity})`
        ].join('\n')
        return
      }

      if (needsApiKeyHint) {
        errorText = 'Add an API key in model settings, or switch the provider to Search Engine (no key required).'
        settingsOpen = true
        return
      }

      responseText = await requestLlmCompletion($llmSettings, [
        { role: 'system', content: $llmSettings.systemPrompt || 'You are a concise system design interview coach.' },
        { role: 'user', content: userPrompt }
      ])
    } catch (error) {
      errorText = error instanceof Error ? error.message : 'Unable to contact the configured model.'
    } finally {
      loading = false
      if (responseText || errorText) {
        focusResponseRegion()
      }
    }
  }
</script>

<div class="llm-editor-chrome" aria-busy={loading ? 'true' : 'false'} aria-label={title}>
  <div class="llm-editor-toolbar">
    <span class="llm-toolbar-label" title={activeProvider?.label ?? title}>{providerShortLabel}</span>
    <button
      class="llm-toolbar-btn"
      type="button"
      onclick={() => (settingsOpen = !settingsOpen)}
      aria-expanded={settingsOpen}
      title="Configure model provider and API key"
    >
      {settingsOpen ? 'Hide model' : 'Configure model'}
    </button>
    {#if showOutline}
      <button class="llm-toolbar-btn" type="button" onclick={() => runAssistant('outline')} disabled={loading}>
        Outline
      </button>
    {/if}
    <button
      class="llm-toolbar-btn llm-toolbar-btn-primary"
      type="button"
      onclick={() => runAssistant('check')}
      disabled={loading || !draft.trim()}
      aria-label="Check answer with AI"
      title="Check your answer with the configured AI provider"
    >
      {loading ? 'Checking…' : 'Check (AI)'}
    </button>
    {#if hasFeedback}
      <button
        class="llm-toolbar-btn"
        type="button"
        onclick={() => (feedbackOpen = !feedbackOpen)}
        aria-expanded={feedbackOpen}
        aria-label={feedbackOpen ? 'Hide AI feedback' : 'Show AI feedback'}
        title={feedbackOpen ? 'Hide AI feedback' : 'Show AI feedback'}
      >
        {feedbackOpen ? 'Hide feedback' : 'Show feedback'}
      </button>
      <button
        class="llm-toolbar-btn"
        type="button"
        onclick={dismissFeedback}
        aria-label="Clear AI feedback"
        title="Clear AI feedback"
      >
        Clear
      </button>
    {/if}
  </div>

  {#if settingsOpen}
    <div class="llm-editor-settings">
      <div class="llm-settings-grid">
        <label>
          <span class="eyebrow">Provider</span>
          <select value={$llmSettings.providerId} onchange={(event) => llmSettings.applyProvider(event.currentTarget.value)}>
            {#each providers as provider}
              <option value={provider.id}>{provider.label}</option>
            {/each}
          </select>
        </label>

        <label>
          <span class="eyebrow">Model</span>
          {#if isSearchEngineProvider}
            <select value={$llmSettings.model} onchange={(event) => llmSettings.updateField('model', event.currentTarget.value)}>
              {#each searchEngineOptions as engine}
                <option value={engine.id}>{engine.label}</option>
              {/each}
            </select>
          {:else}
            <input value={$llmSettings.model} oninput={(event) => updateField('model', event)} />
          {/if}
        </label>

        {#if !isSearchEngineProvider}
          <label>
            <span class="eyebrow">{activeProvider?.endpointLabel}</span>
            <input value={$llmSettings.endpoint} oninput={(event) => updateField('endpoint', event)} />
          </label>

          <label>
            <span class="eyebrow">{activeProvider?.apiKeyLabel}</span>
            <input type="password" autocomplete="off" value={$llmSettings.apiKey} oninput={(event) => updateField('apiKey', event)} />
          </label>
        {/if}

        {#if activeProvider?.requiresDeployment && !isSearchEngineProvider}
          <label>
            <span class="eyebrow">Deployment</span>
            <input value={$llmSettings.deployment} oninput={(event) => updateField('deployment', event)} />
          </label>
        {/if}

        {#if !isSearchEngineProvider}
          <label>
            <span class="eyebrow">Temperature</span>
            <input type="number" min="0" max="2" step="0.1" value={$llmSettings.temperature} oninput={(event) => updateField('temperature', Number(event.currentTarget.value))} />
          </label>
        {/if}

        <label class="llm-full">
          <span class="eyebrow">System prompt</span>
          <textarea rows="3" value={$llmSettings.systemPrompt} oninput={(event) => updateField('systemPrompt', event)}></textarea>
        </label>

        <label class="llm-full">
          <span class="eyebrow">Specific guidance request</span>
          <textarea rows="2" bind:value={extraPrompt} placeholder="Ask for missing trade-offs, sharper APIs, or a better scaling plan."></textarea>
        </label>

        {#if providerSupportsTemplates && !isSearchEngineProvider}
          <label class="llm-full">
            <span class="eyebrow">Headers JSON</span>
            <textarea rows="3" value={$llmSettings.headersText} oninput={(event) => updateField('headersText', event)}></textarea>
          </label>
          <label class="llm-full">
            <span class="eyebrow">Request body template</span>
            <textarea rows="4" value={$llmSettings.bodyTemplate} oninput={(event) => updateField('bodyTemplate', event)}></textarea>
          </label>
          <label class="llm-full">
            <span class="eyebrow">Response text path</span>
            <input value={$llmSettings.responsePath} oninput={(event) => updateField('responsePath', event)} placeholder="choices[0].message.content" />
          </label>
        {/if}
      </div>
      <p class="muted llm-settings-note">
        {#if isSearchEngineProvider}
          Search links are generated locally from the composed prompt (no API key).
        {:else if isCloudProvider}
          Warning: cloud API keys are stored only in this browser’s localStorage. Prefer Search Engine or a local provider if you do not want keys on this device.
        {:else}
          Keys and templates stay in this browser only.
        {/if}
      </p>
    </div>
  {:else if needsApiKeyHint}
    <p class="muted llm-config-hint">
      Cloud providers need an API key.
      <button class="llm-inline-link" type="button" onclick={() => (settingsOpen = true)}>Configure model</button>
      or switch to Search Engine.
    </p>
  {/if}

  {#if errorText && feedbackOpen}
    <div class="llm-editor-feedback danger" tabindex="-1" role="alert" bind:this={responseRegion}>
      <div class="llm-feedback-header">
        <p class="eyebrow">Model request failed</p>
        <button class="llm-feedback-dismiss" type="button" onclick={dismissFeedback} aria-label="Dismiss feedback">×</button>
      </div>
      <p>{errorText}</p>
    </div>
  {:else if responseText && feedbackOpen}
    <article class="llm-editor-feedback" tabindex="-1" aria-live="polite" bind:this={responseRegion}>
      <div class="llm-feedback-header">
        <p class="eyebrow">Model response</p>
        <button class="llm-feedback-dismiss" type="button" onclick={dismissFeedback} aria-label="Dismiss feedback">×</button>
      </div>
      <div class="llm-markdown">{@html responseHtml}</div>
    </article>
  {/if}
</div>

<style>
  .llm-editor-chrome {
    display: grid;
    gap: 0;
    background: var(--ide-tab-bar, var(--bg-soft));
    border-bottom: 1px solid var(--ide-border, var(--border));
    color: var(--ide-fg, var(--text));
    min-width: 0;
    max-width: 100%;
  }

  .llm-editor-toolbar {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.35rem;
    padding: 0.35rem 0.55rem;
    min-height: 2.15rem;
  }

  .llm-toolbar-label {
    font-size: 0.68rem;
    font-weight: 700;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--ide-muted, var(--muted));
    margin-right: 0.25rem;
  }

  .llm-toolbar-btn {
    border-radius: 3px;
    border: none;
    background: transparent;
    color: var(--ide-muted, var(--muted));
    min-height: 1.85rem;
    padding: 0 0.55rem;
    font-size: 0.72rem;
    font-weight: 600;
    cursor: pointer;
  }

  .llm-toolbar-btn:hover:not(:disabled) {
    color: var(--ide-strong-fg, var(--text));
    background: var(--ide-button-hover, var(--bg-soft));
  }

  .llm-toolbar-btn:disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }

  .llm-toolbar-btn-primary {
    background: var(--ide-accent-btn-bg, var(--accent-muted));
    color: var(--ide-accent-btn-fg, var(--accent-strong));
  }

  .llm-toolbar-btn-primary:hover:not(:disabled) {
    background: var(--ide-accent-btn-hover, var(--accent-hover));
    color: var(--ide-strong-fg, var(--text));
  }

  .llm-editor-settings {
    display: grid;
    gap: 0.55rem;
    padding: 0.65rem 0.75rem 0.75rem;
    border-top: 1px solid var(--ide-border, var(--border));
    background: var(--ide-panel, var(--panel));
  }

  .llm-settings-grid {
    display: grid;
    gap: 0.65rem;
    grid-template-columns: repeat(auto-fit, minmax(11rem, 1fr));
  }

  .llm-settings-grid label {
    display: grid;
    gap: 0.3rem;
    color: var(--ide-fg, var(--text));
  }

  .llm-settings-grid .llm-full {
    grid-column: 1 / -1;
  }

  .llm-settings-grid input,
  .llm-settings-grid select,
  .llm-settings-grid textarea {
    width: 100%;
    border-radius: 0.4rem;
    border: 1px solid var(--ide-border, var(--border));
    background: var(--ide-input-bg, var(--panel));
    color: var(--ide-input-fg, var(--text));
    padding: 0.4rem 0.55rem;
    font: inherit;
    font-size: 0.85rem;
  }

  .llm-settings-note,
  .llm-config-hint {
    margin: 0;
    font-size: 0.78rem;
    padding: 0 0.75rem 0.65rem;
    color: var(--ide-muted, var(--muted));
  }

  .llm-config-hint {
    padding-top: 0.45rem;
    border-top: 1px solid var(--ide-border, var(--border));
  }

  .llm-inline-link {
    border: none;
    background: none;
    color: var(--accent);
    text-decoration: underline;
    text-underline-offset: 0.12rem;
    cursor: pointer;
    font: inherit;
    padding: 0;
  }

  .llm-editor-feedback {
    max-height: 16rem;
    overflow: auto;
    padding: 0.65rem 0.75rem 0.8rem;
    border-top: 1px solid var(--ide-border, var(--border));
    background: var(--ide-panel, var(--panel));
  }

  .llm-editor-feedback.danger {
    background: var(--ide-warning-bg);
  }

  .llm-editor-feedback:focus {
    outline: 2px solid var(--accent-border, var(--accent));
    outline-offset: -2px;
  }

  .llm-editor-feedback .eyebrow {
    margin: 0;
  }

  .llm-feedback-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;
    margin-bottom: 0.35rem;
  }

  .llm-feedback-dismiss {
    border: none;
    background: transparent;
    color: var(--ide-muted, var(--muted));
    font-size: 1.15rem;
    line-height: 1;
    min-width: 1.75rem;
    min-height: 1.75rem;
    border-radius: 0.35rem;
    cursor: pointer;
    padding: 0;
  }

  .llm-feedback-dismiss:hover {
    color: var(--ide-strong-fg, var(--text));
    background: var(--ide-button-hover, var(--bg-soft));
  }

  .llm-markdown {
    font-size: 0.9rem;
    line-height: 1.65;
    color: var(--ide-fg, var(--text));
    overflow-wrap: anywhere;
  }

  .llm-markdown :global(h1),
  .llm-markdown :global(h2),
  .llm-markdown :global(h3),
  .llm-markdown :global(h4) {
    margin: 0.85rem 0 0.4rem;
    line-height: 1.3;
    color: var(--ide-strong-fg, var(--text));
  }

  .llm-markdown :global(h1) { font-size: 1.2rem; }
  .llm-markdown :global(h2) { font-size: 1.08rem; }
  .llm-markdown :global(h3) { font-size: 1rem; }

  .llm-markdown :global(p),
  .llm-markdown :global(ul),
  .llm-markdown :global(ol),
  .llm-markdown :global(blockquote),
  .llm-markdown :global(pre) {
    margin: 0.45rem 0;
  }

  .llm-markdown :global(ul),
  .llm-markdown :global(ol) {
    padding-left: 1.2rem;
  }

  .llm-markdown :global(code) {
    font-family: 'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace;
    font-size: 0.88em;
    padding: 0.1rem 0.3rem;
    border-radius: 0.3rem;
    background: var(--code-bg, var(--bg-soft));
    color: var(--code-fg, var(--text));
  }

  .llm-markdown :global(pre) {
    padding: 0.7rem 0.8rem;
    border-radius: 0.5rem;
    background: var(--code-bg, var(--bg-soft));
    border: 1px solid var(--ide-border, var(--border));
    overflow: auto;
  }

  .llm-markdown :global(pre code) {
    padding: 0;
    background: transparent;
  }

  .llm-markdown :global(a) {
    color: var(--accent);
    text-decoration: underline;
    text-underline-offset: 0.13rem;
  }
</style>
