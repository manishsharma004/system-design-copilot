<svelte:options runes={false} />
<script>
  import MermaidDiagram from '$lib/components/MermaidDiagram.svelte';
  import { buildLessonAnswerContext, getLikelyAnswerPoints } from '$lib/interviewAnswers';

  /** @type {any} */
  export let lesson;

  let activeTab = 'study';
  let activeExampleId = '';
  let activeOptionId = '';

  /** @param {any} exercise */
  function isCodingExercise(exercise) {
    return exercise.type === 'coding';
  }

  /** @param {any} exercise */
  function isDesignExercise(exercise) {
    return exercise.type === 'design';
  }

  $: interactive = lesson?.interactive ?? null;
  $: codingExercises = lesson?.exercises?.filter(isCodingExercise) ?? [];
  $: designExercises = lesson?.exercises?.filter(isDesignExercise) ?? [];
  $: studyHighlights = lesson?.checklist?.slice(0, 4) ?? [];
  $: productionPitfalls = lesson?.pitfalls?.slice(0, 3) ?? [];
  $: practicePrompts = lesson?.interviewPrompts?.slice(0, 3) ?? [];
  $: lessonAnswerContext = buildLessonAnswerContext(lesson);

  $: tabs = [
    { id: 'study', label: 'Study companion', show: true },
    { id: 'scenarios', label: 'Worked scenarios', show: Boolean(interactive?.examples?.length) },
    { id: 'decisions', label: 'Design choices', show: Boolean(interactive?.decisionGuide?.options?.length) },
    { id: 'case-study', label: 'Case path', show: Boolean(interactive?.caseStudy?.steps?.length) }
  ].filter((tab) => tab.show);

  $: if (tabs.length && !tabs.some((tab) => tab.id === activeTab)) {
    activeTab = tabs[0].id;
  }

  $: if (interactive?.examples?.length && !interactive.examples.some((/** @type {{ id: string }} */ e) => e.id === activeExampleId)) {
    activeExampleId = interactive.examples[0].id;
  }
  $: if (
    interactive?.decisionGuide?.options?.length &&
    !interactive.decisionGuide.options.some((/** @type {{ id: string }} */ o) => o.id === activeOptionId)
  ) {
    activeOptionId = interactive.decisionGuide.options[0].id;
  }

  $: activeExample =
    interactive?.examples?.find((/** @type {{ id: string }} */ e) => e.id === activeExampleId) ?? null;
  $: activeOption =
    interactive?.decisionGuide?.options?.find((/** @type {{ id: string }} */ o) => o.id === activeOptionId) ?? null;

  /** @param {any} exercise */
  function exerciseAnswerContext(exercise) {
    return [exercise?.description, ...(exercise?.hints ?? []), ...lessonAnswerContext]
      .filter(Boolean)
      .map((entry) => String(entry).trim())
      .filter((entry) => entry.length > 0);
  }
</script>

{#if lesson}
  <section id="topic-lab" class="panel hero-card ai-topic-lab">
    <div class="practice-card-header">
      <div>
        <p class="eyebrow">AI topic lab</p>
        <h2>{interactive?.title ?? 'Go beyond the overview with practical examples'}</h2>
        <p class="practice-copy">
          Study the checklist and drills, then walk scenarios and design choices before running code in the Python lab below.
        </p>
      </div>
      <div class="practice-status-group">
        <span class="pill">{codingExercises.length} code example{codingExercises.length === 1 ? '' : 's'}</span>
        <span class="pill">{designExercises.length} design drill{designExercises.length === 1 ? '' : 's'}</span>
        {#if interactive}
          <span class="pill">Interactive lab</span>
        {/if}
      </div>
    </div>

    {#if tabs.length > 1}
      <div class="topic-tab-list" role="tablist" aria-label="AI topic lab panels">
        {#each tabs as tab}
          <button
            class:active={activeTab === tab.id}
            class="topic-tab"
            type="button"
            role="tab"
            aria-selected={activeTab === tab.id}
            onclick={() => (activeTab = tab.id)}
          >
            {tab.label}
          </button>
        {/each}
      </div>
    {/if}

    {#if interactive?.mermaid && activeTab !== 'study'}
      <div class="topic-lab-layout">
        <MermaidDiagram diagram={interactive.mermaid} />
      </div>
    {/if}

    {#if activeTab === 'study'}
      <div class="ai-study-guide-grid">
        <article class="list-card">
          <p class="eyebrow">What to master</p>
          <h3>Study this in your own words</h3>
          <ul>
            {#each studyHighlights as item}
              <li>{item}</li>
            {/each}
          </ul>
        </article>

        <article class="list-card">
          <p class="eyebrow">Production lens</p>
          <h3>Failure modes to call out</h3>
          <ul>
            {#each productionPitfalls as item}
              <li>{item}</li>
            {/each}
          </ul>
        </article>

        <article class="list-card">
          <p class="eyebrow">Practice aloud</p>
          <h3>Questions worth rehearsing</h3>
          <ul class="prompt-answer-list">
            {#each practicePrompts as item}
              <li>
                <p>{item}</p>
                <details class="prompt-answer-toggle">
                  <summary>Show likely answer</summary>
                  <ul>
                    {#each getLikelyAnswerPoints(item, lessonAnswerContext, lesson?.checklist ?? []) as answerPoint}
                      <li>{answerPoint}</li>
                    {/each}
                  </ul>
                </details>
              </li>
            {/each}
          </ul>
        </article>
      </div>

      {#if codingExercises.length}
        <div class="solution-code-list">
          {#each codingExercises as exercise}
            <article class="content-card solution-code-card ai-study-card">
              <div class="practice-card-header">
                <div>
                  <p class="eyebrow">Code example</p>
                  <h3>{exercise.title}</h3>
                </div>
                <div class="practice-status-group">
                  <span class="pill">{exercise.difficulty}</span>
                  <span class="pill">coding</span>
                </div>
              </div>
              <p>{exercise.description}</p>
              {#if exercise.hints?.length}
                <div class="topic-detail-section">
                  <h4>What to notice</h4>
                  <ul>
                    {#each exercise.hints as hint}
                      <li>{hint}</li>
                    {/each}
                  </ul>
                </div>
              {/if}
              {#if exercise.expectedOutput}
                <div class="topic-detail-section">
                  <h4>Expected outcome</h4>
                  <p>{exercise.expectedOutput}</p>
                </div>
              {/if}
              <p class="muted practice-copy">
                Run this in the <a href="#ml-practice-lab">Python lab</a> below — load the matching exercise from the dropdown.
              </p>
              <div class="ai-study-code-grid">
                <details class="ai-study-code-block" open>
                  <summary>Starter code</summary>
                  <pre><code>{exercise.starterCode}</code></pre>
                </details>
                <details class="ai-study-code-block">
                  <summary>Reference solution</summary>
                  <pre><code>{exercise.solution}</code></pre>
                </details>
              </div>
            </article>
          {/each}
        </div>
      {/if}

      {#if designExercises.length}
        <div class="ai-study-design-grid">
          {#each designExercises as exercise}
            <article class="list-card ai-study-card">
              <div class="practice-card-header">
                <div>
                  <p class="eyebrow">Design drill</p>
                  <h3>{exercise.title}</h3>
                </div>
                <span class="pill">{exercise.difficulty}</span>
              </div>
              <p>{exercise.description}</p>
              <div class="topic-detail-section">
                <h4>Use these prompts to deepen the study pass</h4>
                <ul class="prompt-answer-list">
                  {#each exercise.promptQuestions as question}
                    <li>
                      <p>{question}</p>
                      <details class="prompt-answer-toggle">
                        <summary>Show likely answer</summary>
                        <ul>
                          {#each getLikelyAnswerPoints(question, exerciseAnswerContext(exercise), exercise?.hints ?? studyHighlights) as answerPoint}
                            <li>{answerPoint}</li>
                          {/each}
                        </ul>
                      </details>
                    </li>
                  {/each}
                </ul>
              </div>
            </article>
          {/each}
        </div>
      {/if}
    {/if}

    {#if activeTab === 'scenarios' && interactive?.examples?.length}
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
            <p class="eyebrow">Worked scenario</p>
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

    {#if activeTab === 'decisions' && interactive?.decisionGuide?.options?.length}
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

    {#if activeTab === 'case-study' && interactive?.caseStudy?.steps?.length}
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

<style>
  .ai-topic-lab,
  .ai-study-guide-grid,
  .ai-study-code-grid,
  .ai-study-design-grid,
  .ai-study-card,
  .ai-study-code-block {
    display: grid;
    gap: 1rem;
  }

  .ai-study-guide-grid,
  .ai-study-design-grid {
    grid-template-columns: repeat(auto-fit, minmax(15rem, 1fr));
  }

  .ai-study-code-grid {
    grid-template-columns: repeat(auto-fit, minmax(18rem, 1fr));
  }

  .ai-study-code-block summary {
    cursor: pointer;
    font-weight: 700;
    color: var(--text);
  }

  .ai-study-code-block pre {
    margin: 0.75rem 0 0;
    overflow: auto;
    border-radius: 0.375rem;
    border: 1px solid var(--border);
    background: #1e1e2e;
    padding: 0.85rem;
  }

  .ai-study-code-block code {
    font-family: 'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
    font-size: 0.85rem;
    line-height: 1.6;
    color: #cdd6f4;
    white-space: pre-wrap;
  }
</style>
