<svelte:options runes={false} />
<script>
  // @ts-nocheck
  import { getLlmProvider, getLlmProviders, requestLlmCompletion } from '$lib/llm/providers'
  import { llmSettings } from '$lib/stores/llm'

  export let title = 'AI copilot'
  export let objective = ''
  export let draft = ''
  export let contextSections = []

  const providers = getLlmProviders()
  let settingsOpen = false
  let loading = false
  let responseText = ''
  let errorText = ''
  let extraPrompt = ''

  $: activeProvider = getLlmProvider($llmSettings.providerId)
  $: providerSupportsTemplates = Boolean(activeProvider?.supportsCustomTemplate)

  function updateField(field, event) {
    llmSettings.updateField(field, event.currentTarget.value)
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

      responseText = await requestLlmCompletion($llmSettings, [
        { role: 'system', content: $llmSettings.systemPrompt || 'You are a concise system design interview coach.' },
        { role: 'user', content: `${basePrompt}\n\n${modePrompt}` }
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
        <input value={$llmSettings.model} oninput={(event) => updateField('model', event)} />
      </label>

      <label>
        <span class="eyebrow">{activeProvider?.endpointLabel}</span>
        <input value={$llmSettings.endpoint} oninput={(event) => updateField('endpoint', event)} />
      </label>

      <label>
        <span class="eyebrow">{activeProvider?.apiKeyLabel}</span>
        <input type="password" autocomplete="off" value={$llmSettings.apiKey} oninput={(event) => updateField('apiKey', event)} />
      </label>

      {#if activeProvider?.requiresDeployment}
        <label>
          <span class="eyebrow">Deployment</span>
          <input value={$llmSettings.deployment} oninput={(event) => updateField('deployment', event)} />
        </label>
      {/if}

      <label>
        <span class="eyebrow">Temperature</span>
        <input type="number" min="0" max="2" step="0.1" value={$llmSettings.temperature} oninput={(event) => updateField('temperature', Number(event.currentTarget.value))} />
      </label>

      <label class="llm-full">
        <span class="eyebrow">System prompt</span>
        <textarea rows="4" value={$llmSettings.systemPrompt} oninput={(event) => updateField('systemPrompt', event)}></textarea>
      </label>

      {#if providerSupportsTemplates}
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
    <p class="muted">Keys and custom request templates are stored only in this browser. To add another adapter in TypeScript, extend <code>src/lib/llm/providers.js</code>.</p>
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
      <pre>{responseText}</pre>
    </article>
  {/if}
</section>
