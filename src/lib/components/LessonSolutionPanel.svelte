<svelte:options runes={false} />
<script>
  import { loadLessonSolution, solutionLessonIds } from '$lib/data/solutionLoader';

  /** @type {{ id?: string }} */
  export let lesson;

  /** @type {any} */
  let solution = null;
  let loading = false;
  let loadError = '';
  let showWalkthrough = false;
  let showSampleAnswer = false;
  let showInterviewCode = false;

  $: canReveal = Boolean(lesson?.id && solutionLessonIds.has(lesson.id));

  /** @param {'walkthrough' | 'sample' | 'code'} section */
  async function toggleSection(section) {
    if (!lesson?.id) return;

    if (!solution && !loading) {
      loading = true;
      loadError = '';
      try {
        solution = await loadLessonSolution(lesson.id);
      } catch {
        loadError = 'Unable to load the enhanced solution right now.';
      } finally {
        loading = false;
      }
    }

    if (!solution) return;

    if (section === 'walkthrough') {
      showWalkthrough = !showWalkthrough;
    }

    if (section === 'sample') {
      showSampleAnswer = !showSampleAnswer;
    }

    if (section === 'code') {
      showInterviewCode = !showInterviewCode;
    }
  }
</script>

{#if canReveal}
  <section class="panel hero-card solution-lab">
    <div class="action-row" style="justify-content: space-between; align-items: end;">
      <div>
        <p class="eyebrow">Solution reveal</p>
        <h2>Compare your draft only when you are ready</h2>
        <p class="practice-copy">These notes extend the original primer solution with a fuller interview walkthrough, a sample answer outline, and code you can discuss if the interviewer asks for implementation detail.</p>
      </div>
      {#if solution?.referenceSource}
        <a class="action-link" href={solution.referenceSource.url} target="_blank" rel="noreferrer">{solution.referenceSource.label}</a>
      {/if}
    </div>

    <div class="action-row">
      <button class="action-link" type="button" onclick={() => toggleSection('walkthrough')}>
        {showWalkthrough ? 'Hide walkthrough' : 'Reveal walkthrough'}
      </button>
      <button class="action-link" type="button" onclick={() => toggleSection('sample')}>
        {showSampleAnswer ? 'Hide sample answer' : 'Reveal sample answer'}
      </button>
      <button class="action-link" type="button" onclick={() => toggleSection('code')}>
        {showInterviewCode ? 'Hide interview code' : 'Reveal interview code'}
      </button>
    </div>

    {#if loading}
      <p class="muted">Loading the expanded solution…</p>
    {/if}

    {#if loadError}
      <p class="muted">{loadError}</p>
    {/if}

    {#if solution?.solutionOverview && showWalkthrough}
      <div class="solution-overview-grid">
        <article class="list-card">
          <p class="eyebrow">Interview stance</p>
          <h3>What to lead with</h3>
          <p>{solution.solutionOverview.summary}</p>
        </article>
        <article class="list-card">
          <p class="eyebrow">Requirements</p>
          <h3>What must be true</h3>
          <ul>
            {#each solution.solutionOverview.requirements as item}
              <li>{item}</li>
            {/each}
          </ul>
        </article>
        <article class="list-card">
          <p class="eyebrow">Estimates and decisions</p>
          <h3>What to quantify</h3>
          <ul>
            {#each [...solution.solutionOverview.estimates, ...solution.solutionOverview.keyDecisions] as item}
              <li>{item}</li>
            {/each}
          </ul>
        </article>
      </div>
    {/if}

    {#if solution?.detailedSolution?.length && showWalkthrough}
      <div class="content-grid">
        {#each solution.detailedSolution as section}
          <article class="content-card">
            <p class="eyebrow">Detailed walkthrough</p>
            <h3>{section.heading}</h3>
            <p>{section.body}</p>
            <ul>
              {#each section.bullets as bullet}
                <li>{bullet}</li>
              {/each}
            </ul>
          </article>
        {/each}
      </div>
    {/if}

    {#if solution?.sampleAnswer?.length && showSampleAnswer}
      <div class="solution-answer-grid">
        {#each solution.sampleAnswer as section, index}
          <article class="list-card">
            <p class="eyebrow">Sample answer {index + 1}</p>
            <h3>{section.heading}</h3>
            <ul>
              {#each section.bullets as bullet}
                <li>{bullet}</li>
              {/each}
            </ul>
          </article>
        {/each}
      </div>
    {/if}

    {#if solution?.interviewCode?.length && showInterviewCode}
      <div class="solution-code-list">
        {#each solution.interviewCode as snippet}
          <article class="content-card solution-code-card">
            <div class="practice-card-header">
              <div>
                <p class="eyebrow">Interview-ready code</p>
                <h3>{snippet.title}</h3>
              </div>
              <div class="practice-status-group">
                <span class="pill">{snippet.filename}</span>
                <span class="pill">{snippet.language}</span>
              </div>
            </div>
            <p>{snippet.description}</p>
            <pre><code>{snippet.code}</code></pre>
          </article>
        {/each}
      </div>
    {/if}
  </section>
{/if}
