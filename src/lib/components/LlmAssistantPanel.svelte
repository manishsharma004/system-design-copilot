<svelte:options runes={false} />
<script>
  // @ts-nocheck
  import MarkdownIt from 'markdown-it'
  import { buildSearchEngineUrls, getLlmProvider, getLlmProviders, requestLlmCompletion } from '$lib/llm/providers'
  import { llmSettings } from '$lib/stores/llm'

  export let title = 'AI copilot'
  export let objective = ''
  export let draft = ''
  export let contextSections = []

  const providers = getLlmProviders()
  let settingsOpen = false
  let loading = false
  let responseText = ''
  let responseHtml = ''
  let errorText = ''
  let extraPrompt = ''

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
  $: responseHtml = renderResponseMarkdown(responseText)

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

  /**
   * @param {'outline' | 'review'} mode
   */
  async function runAssistant(mode) {
    errorText = ''
    responseText = ''
    loading = true
    try {
      const basePrompt = [
        objective ? `Objective: ${objective}` : '',
        ...contextSections.map((section) => `Context: ${section}`),
        draft ? `Current draft:\n${draft}` : '',
        extraPrompt ? `Specific request: ${extraPrompt}` : ''
      ].filter(Boolean).join('\n\n')

      const modePrompt = mode === 'outline'
        ? 'Produce a tighter system-design answer outline with concrete sections, missing considerations, and one suggested next edit.'
        : 'Review the draft, highlight missing trade-offs, missing APIs/data model details, and suggest the next three improvements.'

      const userPrompt = `${basePrompt}\n\n${modePrompt}`

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

      responseText = await requestLlmCompletion($llmSettings, [
        { role: 'system', content: $llmSettings.systemPrompt || 'You are a concise system design interview coach.' },
        { role: 'user', content: userPrompt }
      ])
    } catch (error) {
      errorText = error instanceof Error ? error.message : 'Unable to contact the configured model.'
    } finally {
      loading = false
    }
  }
</script>

<section class="panel hero-card llm-panel">
  <div class="practice-card-header">
    <div>
      <p class="eyebrow">Bring your own model</p>
      <h3>{title}</h3>
      <p class="practice-copy">{activeProvider?.note}</p>
    </div>
    <div class="llm-header-actions">
      <span class="pill">{activeProvider?.label}</span>
      <button class="action-link" type="button" onclick={() => (settingsOpen = !settingsOpen)}>
        {settingsOpen ? 'Hide model settings' : 'Configure model'}
      </button>
    </div>
  </div>

  {#if settingsOpen}
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
        <textarea rows="4" value={$llmSettings.systemPrompt} oninput={(event) => updateField('systemPrompt', event)}></textarea>
      </label>

      {#if providerSupportsTemplates && !isSearchEngineProvider}
        <label class="llm-full">
          <span class="eyebrow">Headers JSON</span>
          <textarea rows="4" value={$llmSettings.headersText} oninput={(event) => updateField('headersText', event)}></textarea>
        </label>
        <label class="llm-full">
          <span class="eyebrow">Request body template</span>
          <textarea rows="6" value={$llmSettings.bodyTemplate} oninput={(event) => updateField('bodyTemplate', event)}></textarea>
        </label>
        <label class="llm-full">
          <span class="eyebrow">Response text path</span>
          <input value={$llmSettings.responsePath} oninput={(event) => updateField('responsePath', event)} placeholder="choices[0].message.content" />
        </label>
      {/if}
    </div>
    <p class="muted">
      {#if isSearchEngineProvider}
        Search links are generated locally in your browser from the composed prompt.
      {:else}
        Keys and custom request templates are stored only in this browser. To add another adapter in TypeScript, extend <code>src/lib/llm/providers.js</code>.
      {/if}
    </p>
  {/if}

  <label>
    <span class="eyebrow">Specific guidance request</span>
    <textarea rows="3" bind:value={extraPrompt} placeholder="Ask for missing trade-offs, sharper APIs, or a better scaling plan."></textarea>
  </label>

  <div class="action-row">
    <button class="action-link primary" type="button" onclick={() => runAssistant('outline')} disabled={loading}>
      {loading ? 'Generating…' : 'Generate outline'}
    </button>
    <button class="action-link" type="button" onclick={() => runAssistant('review')} disabled={loading || !draft.trim()}>
      Review current draft
    </button>
  </div>

  {#if errorText}
    <div class="simulation-note danger">
      <p class="eyebrow">Model request failed</p>
      <p>{errorText}</p>
    </div>
  {/if}

  {#if responseText}
    <article class="content-card llm-response-card">
      <p class="eyebrow">Model response</p>
      <div class="llm-markdown">{@html responseHtml}</div>
    </article>
  {/if}
</section>

<style>
  .llm-response-card {
    overflow: hidden;
  }

  .llm-markdown {
    font-size: 0.96rem;
    line-height: 1.72;
    color: #cfd7ea;
    overflow-wrap: anywhere;
  }

  .llm-markdown :global(h1),
  .llm-markdown :global(h2),
  .llm-markdown :global(h3),
  .llm-markdown :global(h4) {
    margin: 1.1rem 0 0.55rem;
    line-height: 1.32;
    color: #f8fbff;
  }

  .llm-markdown :global(h1) {
    font-size: 1.35rem;
  }

  .llm-markdown :global(h2) {
    font-size: 1.18rem;
  }

  .llm-markdown :global(h3) {
    font-size: 1.05rem;
  }

  .llm-markdown :global(p),
  .llm-markdown :global(ul),
  .llm-markdown :global(ol),
  .llm-markdown :global(blockquote),
  .llm-markdown :global(table),
  .llm-markdown :global(pre) {
    margin: 0.6rem 0;
  }

  .llm-markdown :global(ul),
  .llm-markdown :global(ol) {
    padding-left: 1.3rem;
  }

  .llm-markdown :global(li) {
    margin: 0.2rem 0;
  }

  .llm-markdown :global(blockquote) {
    padding: 0.45rem 0.75rem;
    border-left: 3px solid rgba(123, 145, 255, 0.7);
    border-radius: 0.35rem;
    background: rgba(91, 104, 190, 0.12);
    color: #d9e2ff;
  }

  .llm-markdown :global(code) {
    font-family: 'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace;
    font-size: 0.88em;
    padding: 0.1rem 0.3rem;
    border-radius: 0.3rem;
    background: rgba(76, 89, 141, 0.35);
    color: #f2f7ff;
  }

  .llm-markdown :global(pre) {
    padding: 0.85rem 0.95rem;
    border-radius: 0.65rem;
    background: #101522;
    border: 1px solid rgba(140, 157, 214, 0.28);
    overflow: auto;
  }

  .llm-markdown :global(pre code) {
    padding: 0;
    border-radius: 0;
    background: transparent;
  }

  .llm-markdown :global(table) {
    width: 100%;
    border-collapse: collapse;
    display: block;
    overflow: auto;
  }

  .llm-markdown :global(th),
  .llm-markdown :global(td) {
    border: 1px solid rgba(146, 162, 204, 0.35);
    padding: 0.48rem 0.6rem;
    text-align: left;
    vertical-align: top;
  }

  .llm-markdown :global(th) {
    background: rgba(80, 100, 173, 0.22);
  }

  .llm-markdown :global(a) {
    color: #9dbdff;
    text-decoration: underline;
    text-underline-offset: 0.13rem;
  }

  @media (max-width: 760px) {
    .llm-markdown {
      font-size: 0.92rem;
      line-height: 1.64;
    }
  }
</style>
