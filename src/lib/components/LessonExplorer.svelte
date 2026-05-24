<svelte:options runes={false} />
<script>
  import MermaidDiagram from '$lib/components/MermaidDiagram.svelte';

  /** @type {any} */
  export let lesson;

  let activePanel = 'examples';
  let activeExampleId = '';
  let activeOptionId = '';

  /** @type {{ id: string, label: string }[]} */
  let panels = [];
  /** @type {any} */
  let activeExample = null;
  /** @type {any} */
  let activeOption = null;

  $: interactive = lesson?.interactive ?? null;
  $: {
    panels = [];
    if (interactive?.examples?.length) {
      panels = [...panels, { id: 'examples', label: 'Worked examples' }];
    }
    if (interactive?.decisionGuide?.options?.length) {
      panels = [...panels, { id: 'decisions', label: 'Design choices' }];
    }
    if (interactive?.caseStudy?.steps?.length) {
      panels = [...panels, { id: 'case-study', label: 'Case-study path' }];
    }
  }
  $: if (panels.length && !panels.some((panel) => panel.id === activePanel)) {
    activePanel = panels[0].id;
  }
  $: if (interactive?.examples?.length && !interactive.examples.some((/** @type {{ id: string }} */ example) => example.id === activeExampleId)) {
    activeExampleId = interactive.examples[0].id;
  }
  $: if (
    interactive?.decisionGuide?.options?.length &&
    !interactive.decisionGuide.options.some((/** @type {{ id: string }} */ option) => option.id === activeOptionId)
  ) {
    activeOptionId = interactive.decisionGuide.options[0].id;
  }
  $: activeExample = interactive?.examples?.find((/** @type {{ id: string }} */ example) => example.id === activeExampleId) ?? null;
  $: activeOption = interactive?.decisionGuide?.options?.find((/** @type {{ id: string }} */ option) => option.id === activeOptionId) ?? null;
</script>

{#if interactive}
  <section class="panel hero-card topic-lab">
    <div class="topic-lab-header">
      <div>
        <p class="eyebrow">Interactive topic lab</p>
        <h2>{interactive.title}</h2>
        <p class="practice-copy">{interactive.summary}</p>
      </div>
      <div class="topic-pill-group">
        {#each interactive.takeaways ?? [] as takeaway}
          <span class="pill">{takeaway}</span>
        {/each}
      </div>
    </div>

    <div class="topic-lab-layout">
      <article class="content-card">
        <p class="eyebrow">How to explain it</p>
        <h3>High-signal talking points</h3>
        <ul>
          {#each interactive.takeaways ?? [] as takeaway}
            <li>{takeaway}</li>
          {/each}
        </ul>
      </article>
      <MermaidDiagram diagram={interactive.mermaid} />
    </div>

    {#if panels.length}
      <div class="topic-tab-list" role="tablist" aria-label="Interactive lesson panels">
        {#each panels as panel}
          <button
            class:active={activePanel === panel.id}
            class="topic-tab"
            type="button"
            role="tab"
            aria-selected={activePanel === panel.id}
            onclick={() => (activePanel = panel.id)}
          >
            {panel.label}
          </button>
        {/each}
      </div>
    {/if}

    {#if activePanel === 'examples' && interactive.examples?.length}
      <div class="topic-panel-grid">
        <div class="topic-option-list">
          {#each interactive.examples as example}
            <button
              class:active={activeExampleId === example.id}
              class="topic-option"
              type="button"
              onclick={() => (activeExampleId = example.id)}
            >
              <strong>{example.label}</strong>
              <span>{example.title}</span>
            </button>
          {/each}
        </div>
        {#if activeExample}
          <article class="content-card topic-detail-card">
            <p class="eyebrow">Worked example</p>
            <h3>{activeExample.title}</h3>
            <p>{activeExample.scenario}</p>
            <div class="topic-detail-section">
              <h4>Recommended choice</h4>
              <p>{activeExample.decision}</p>
            </div>
            <div class="topic-detail-section">
              <h4>Why it fits</h4>
              <ul>
                {#each activeExample.why as item}
                  <li>{item}</li>
                {/each}
              </ul>
            </div>
            <div class="topic-detail-section">
              <h4>If you chose differently</h4>
              <p>{activeExample.alternative}</p>
            </div>
            <div class="topic-detail-section">
              <h4>Interview-ready takeaway</h4>
              <p>{activeExample.outcome}</p>
            </div>
          </article>
        {/if}
      </div>
    {/if}

    {#if activePanel === 'decisions' && interactive.decisionGuide?.options?.length}
      <div class="topic-panel-grid">
        <div class="topic-option-list">
          <p class="eyebrow">Decision prompt</p>
          <p class="muted">{interactive.decisionGuide.prompt}</p>
          {#each interactive.decisionGuide.options as option}
            <button
              class:active={activeOptionId === option.id}
              class="topic-option"
              type="button"
              onclick={() => (activeOptionId = option.id)}
            >
              <strong>{option.label}</strong>
              <span>{option.bestFor}</span>
            </button>
          {/each}
        </div>
        {#if activeOption}
          <article class="content-card topic-detail-card">
            <p class="eyebrow">Design choice</p>
            <h3>{activeOption.label}</h3>
            <p>{activeOption.bestFor}</p>
            <div class="topic-detail-section">
              <h4>Choose it when</h4>
              <ul>
                {#each activeOption.chooseWhen as item}
                  <li>{item}</li>
                {/each}
              </ul>
            </div>
            <div class="topic-detail-section">
              <h4>Trade-offs you should say out loud</h4>
              <ul>
                {#each activeOption.tradeOffs as item}
                  <li>{item}</li>
                {/each}
              </ul>
            </div>
            <div class="topic-detail-section">
              <h4>What the alternative leads to</h4>
              <p>{activeOption.alternativeOutcome}</p>
            </div>
          </article>
        {/if}
      </div>
    {/if}

    {#if activePanel === 'case-study' && interactive.caseStudy?.steps?.length}
      <div class="topic-case-study">
        <article class="content-card topic-detail-card">
          <p class="eyebrow">Case-study walkthrough</p>
          <h3>{interactive.caseStudy.title}</h3>
          <p>{interactive.caseStudy.context}</p>
          <div class="topic-step-grid">
            {#each interactive.caseStudy.steps as step}
              <article class="list-card topic-step-card">
                <p class="eyebrow">{step.phase}</p>
                <h3>{step.decision}</h3>
                <p>{step.why}</p>
                <div class="topic-detail-section">
                  <h4>If you picked another path</h4>
                  <p>{step.whatIf}</p>
                </div>
              </article>
            {/each}
          </div>
        </article>
        {#if interactive.caseStudy.metrics?.length}
          <article class="list-card">
            <p class="eyebrow">What to measure</p>
            <h3>Metrics that validate the design</h3>
            <ul>
              {#each interactive.caseStudy.metrics as metric}
                <li>{metric}</li>
              {/each}
            </ul>
          </article>
        {/if}
      </div>
    {/if}
  </section>
{/if}
