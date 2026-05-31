<svelte:options runes={false} />
<script>
  /** @type {any} */
  export let lesson;

  $: codingExercises = lesson?.exercises?.filter((exercise) => exercise.type === 'coding') ?? [];
  $: designExercises = lesson?.exercises?.filter((exercise) => exercise.type === 'design') ?? [];
  $: studyHighlights = lesson?.checklist?.slice(0, 4) ?? [];
  $: productionPitfalls = lesson?.pitfalls?.slice(0, 3) ?? [];
  $: practicePrompts = lesson?.interviewPrompts?.slice(0, 3) ?? [];
</script>

{#if lesson}
  <section class="panel hero-card ai-study-guide">
    <div class="practice-card-header">
      <div>
        <p class="eyebrow">AI study companion</p>
        <h2>Go beyond the overview with practical examples</h2>
        <p class="practice-copy">Use the highlights below to study the lesson more deeply, then walk through runnable examples and system-design drills.</p>
      </div>
      <div class="practice-status-group">
        <span class="pill">{codingExercises.length} code example{codingExercises.length === 1 ? '' : 's'}</span>
        <span class="pill">{designExercises.length} design drill{designExercises.length === 1 ? '' : 's'}</span>
      </div>
    </div>

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
        <ul>
          {#each practicePrompts as item}
            <li>{item}</li>
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
              <ul>
                {#each exercise.promptQuestions as question}
                  <li>{question}</li>
                {/each}
              </ul>
            </div>
          </article>
        {/each}
      </div>
    {/if}
  </section>
{/if}

<style>
  .ai-study-guide,
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
