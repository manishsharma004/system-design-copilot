<svelte:options runes={false} />
<script>
  import { base } from '$app/paths';
  import { getFlowResumeLesson, getModuleProgress } from '$lib/data/courseData';
  import { aiModulePhases, aiStudyPaths, aiRagPrerequisiteModuleSlug } from '$lib/data/aiStudyPaths';
  import { progress } from '$lib/stores/progress';
  import { aiStudyPath } from '$lib/stores/aiStudyPath';

  export let data;

  $: totalLessons = data.flow.modules.reduce((sum, module) => sum + module.lessons.length, 0);
  $: completedLessons = data.flow.modules.reduce(
    (sum, module) => sum + getModuleProgress($progress.completedLessonIds, module.slug).completed,
    0
  );
  $: isAiFlow = data.flow.slug === 'ai-engineer';
  $: resumeLesson = isAiFlow
    ? getFlowResumeLesson(data.flow.slug, $progress.completedLessonIds, { aiStudyPathId: $aiStudyPath })
    : getFlowResumeLesson(data.flow.slug, $progress.completedLessonIds);
  $: nextModule =
    data.flow.modules.find((module) => module.slug === resumeLesson?.moduleSlug) ??
    data.flow.modules.find(
      (module) => getModuleProgress($progress.completedLessonIds, module.slug).completed < module.lessons.length
    ) ??
    data.flow.modules[0];

  const aiPhaseOrder = ['foundations', 'models', 'applications', 'production'];

  /** @param {string} moduleSlug */
  function modulePhaseLabel(moduleSlug) {
    return aiModulePhases[moduleSlug]?.label ?? '';
  }

  const aiPhaseLabels = {
    foundations: 'Foundations',
    models: 'Models',
    applications: 'Applications',
    production: 'Production'
  };

  /** Group modules by phase for AI flow runway */
  $: aiPhaseGroups = isAiFlow
    ? aiPhaseOrder.map((phase) => ({
        phase,
        label: aiPhaseLabels[phase] ?? phase,
        modules: data.flow.modules.filter((m) => aiModulePhases[m.slug]?.phase === phase)
      })).filter((g) => g.modules.length)
    : [];
</script>

<svelte:head>
  <title>{data.flow.title} · System Design Copilot</title>
  <meta name="description" content={data.flow.description} />
</svelte:head>

<section class="module-hero-grid learning-hero-grid">
  <article class="panel hero-card module-hero-card">
    <div class="module-hero-header">
      <div class="module-hero-copy">
        <div class="breadcrumb">
          <a href={`${base}/`}>Curriculum</a>
          <span>→</span>
          <span>{data.flow.title}</span>
        </div>
        <p class="eyebrow">{data.flow.shortTitle} interview flow</p>
        <h1>{data.flow.title}</h1>
        <p class="hero-subtitle">{data.flow.description}</p>
        <p>{data.flow.heroGuidance}</p>
      </div>
      <article class="module-status-card">
        <span class="eyebrow">Flow progress</span>
        <strong>{completedLessons}/{totalLessons}</strong>
        <p>Lessons complete across {data.flow.modules.length} modules</p>
        <div aria-hidden="true" class="module-progress-meter">
          <span style={`width: ${totalLessons ? Math.round((completedLessons / totalLessons) * 100) : 0}%`}></span>
        </div>
      </article>
    </div>

    <div class="module-focus-strip">
      <article class="module-focus-card module-focus-card-accent">
        <span class="eyebrow">Start here</span>
        <strong>{resumeLesson ? resumeLesson.title : nextModule.title}</strong>
        <p>{resumeLesson?.summary ?? nextModule.summary}</p>
        {#if isAiFlow && resumeLesson}
          <p class="muted" style="margin-top: 0.5rem; font-size: 0.85rem;">
            Path: {aiStudyPaths.find((p) => p.id === $aiStudyPath)?.title ?? 'AI application engineer'}
          </p>
        {/if}
      </article>
      <article class="module-focus-card">
        <span class="eyebrow">Best for</span>
        <strong>{data.flow.audience}</strong>
        <p>{data.flow.cadence}</p>
      </article>
      <article class="module-focus-card">
        <span class="eyebrow">Target outcome</span>
        <strong>{data.flow.outcome}</strong>
        <p>Move through the modules in order so each later interview answer inherits a stable mental model.</p>
      </article>
    </div>

    {#if isAiFlow}
      <div class="ai-path-picker panel" style="margin-top: 1rem; padding: 1rem; border: 1px solid var(--border); border-radius: var(--radius-lg);">
        <p class="eyebrow">Study path</p>
        <p class="practice-copy" style="margin-bottom: 0.75rem;">
          Builder-first is the default. Switch paths to emphasize theory or platform/LLMOps.
        </p>
        <div class="action-row">
          {#each aiStudyPaths as path}
            <button
              class:primary={$aiStudyPath === path.id}
              class="action-link"
              type="button"
              onclick={() => aiStudyPath.select(path.id)}
            >
              {path.title}
            </button>
          {/each}
        </div>
        <p class="muted" style="margin-top: 0.75rem; font-size: 0.85rem;">
          {aiStudyPaths.find((p) => p.id === $aiStudyPath)?.summary}
        </p>
      </div>
    {/if}

    <div class="action-row">
      <span class="pill">{data.flow.modules.length} modules</span>
      <span class="pill">{totalLessons} lessons</span>
      <span class="pill">{data.flow.shortTitle} roadmap</span>
      {#if resumeLesson}
        <a
          class="action-link primary"
          href={`${base}/module/${resumeLesson.moduleSlug}/lesson/${resumeLesson.slug}`}
        >
          Resume lesson
        </a>
      {:else}
        <a class="action-link primary" href={`${base}/module/${nextModule.slug}`}>Open next module</a>
      {/if}
      <a class="action-link" href="#flow-modules">Browse modules</a>
    </div>
  </article>

  <article class="list-card module-sidebar-card module-rhythm-card">
    <p class="eyebrow">Core focus</p>
    <h3>What this flow trains</h3>
    <ol class="module-rhythm-list">
      {#each data.flow.focusAreas as focusArea}
        <li><strong>{focusArea}</strong> Keep tying the design back to the constraint or follow-up that makes this area matter in interviews.</li>
      {/each}
    </ol>
    <div class="module-rhythm-meta">
      <span class="pill">{data.flow.shortTitle} specific</span>
      <span class="pill">Reusable module sequence</span>
    </div>
  </article>
</section>

<section class="list-grid">
  <article class="list-card">
    <p class="eyebrow">How to use it</p>
    <h3>Study rhythm</h3>
    <ul>
      {#if isAiFlow}
        <li>Open <strong>Learn chapter</strong> for depth, then <strong>Topic lab</strong>, <strong>Python lab</strong>, and <strong>Interview practice</strong>.</li>
        <li>Runnable exercises use Pyodide — load solution if starters show TODO.</li>
      {:else}
        <li>Open the next incomplete module and finish one lesson end to end.</li>
      {/if}
      <li>Explain the main trade-off or object-model decision out loud before moving on.</li>
      <li>Use the lesson practice lab to save a draft answer when the prompt calls for it.</li>
    </ul>
  </article>
  <article class="list-card">
    <p class="eyebrow">Signals to build</p>
    <h3>What interviewers usually reward</h3>
    <ul>
      <li>Clear scoping and explicit assumptions before detailed design.</li>
      <li>Clean boundaries between responsibilities, data, and side effects.</li>
      <li>Trade-off awareness when requirements or follow-up constraints change.</li>
    </ul>
  </article>
  <article class="list-card">
    <p class="eyebrow">Navigation</p>
    <h3>Keep the path obvious</h3>
    <ul>
      <li>Use the module runway below when you want the full sequence.</li>
      <li>Use the global sidebar to jump between flows at any time.</li>
      <li>Track completion locally so interrupted practice sessions resume cleanly.</li>
    </ul>
  </article>
</section>

<section class="panel module-runway-card" id="flow-modules">
  <div class="curriculum-map-header">
    <div>
      <p class="eyebrow">Module runway</p>
      <h2>Follow the {data.flow.shortTitle} sequence from first module to capstone</h2>
      <p class="hero-subtitle">Each module builds one interview muscle before the next one adds more complexity.</p>
    </div>
    <span class="pill">{completedLessons}/{totalLessons} complete</span>
  </div>

  {#if isAiFlow}
    {#each aiPhaseGroups as group}
      <div class="ai-phase-runway" style="margin-bottom: 1.5rem;">
        <p class="eyebrow">{group.label}</p>
        <div class="module-grid">
          {#each group.modules as module}
            <article class="module-card">
              <a class="topic-card-link" href={`${base}/module/${module.slug}`}>
                <div>
                  <p class="eyebrow">Module · {modulePhaseLabel(module.slug)}</p>
                  <h3>{module.title}</h3>
                </div>
                <p>{module.summary}</p>
                <div class="card-meta">
                  <span class="pill">{module.lessons.length} lessons</span>
                  {#if module.slug === aiRagPrerequisiteModuleSlug}
                    <span class="pill">Recommended before deep RAG</span>
                  {/if}
                  {#if module.slug === 'prompt-engineering-and-rag'}
                    <span class="pill">Prereq: data pipelines</span>
                  {/if}
                  <span class="pill"
                    >{getModuleProgress($progress.completedLessonIds, module.slug).completed}/{module.lessons.length}
                    complete</span>
                </div>
              </a>
            </article>
          {/each}
        </div>
      </div>
    {/each}
  {:else}
    <div class="module-grid">
      {#each data.flow.modules as module}
        <article class="module-card">
          <a class="topic-card-link" href={`${base}/module/${module.slug}`}>
            <div>
              <p class="eyebrow">Module</p>
              <h3>{module.title}</h3>
            </div>
            <p>{module.summary}</p>
            <ul>
              {#each module.objectives as objective}
                <li>{objective}</li>
              {/each}
            </ul>
            <div class="card-meta">
              <span class="pill">{module.lessons.length} lessons</span>
              <span class="pill"
                >{getModuleProgress($progress.completedLessonIds, module.slug).completed}/{module.lessons.length}
                complete</span>
            </div>
          </a>
        </article>
      {/each}
    </div>
  {/if}
</section>
