<svelte:options runes={false} />
<script>
  // @ts-nocheck
  import { onMount } from 'svelte'
  import { getMonaco, MONACO_THEME } from '$lib/editor/monaco'

  export let code = ''
  export let language = 'python'
  export let title = 'Code example'
  export let languageLabel = 'Python'

  /** @type {HTMLDivElement | undefined} */
  let host
  let editor
  let model
  let monaco
  let ready = false

  onMount(() => {
    let disposed = false

    ;(async () => {
      monaco = await getMonaco()
      if (disposed || !host) return

      model = monaco.editor.createModel(code, language)
      editor = monaco.editor.create(host, {
        model,
        readOnly: true,
        domReadOnly: true,
        minimap: { enabled: false },
        lineNumbers: 'on',
        renderLineHighlight: 'none',
        overviewRulerLanes: 0,
        glyphMargin: false,
        folding: false,
        scrollBeyondLastLine: false,
        wordWrap: 'on',
        automaticLayout: true,
        contextmenu: false,
        theme: MONACO_THEME,
        fontSize: 13,
        fontFamily: 'JetBrains Mono, ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
        tabSize: 4,
        renderWhitespace: 'selection'
      })
      ready = true
    })()

    return () => {
      disposed = true
      editor?.dispose()
      model?.dispose()
    }
  })

  $: if (model) {
    if (model.getValue() !== code) {
      model.setValue(code)
    }
    if (monaco && model.getLanguageId() !== language) {
      monaco.editor.setModelLanguage(model, language)
    }
  }
</script>

<div class="lesson-code-example">
  <div class="lesson-code-example-header">
    <div>
      <p class="eyebrow">{title}</p>
      <h4>{languageLabel}</h4>
    </div>
  </div>
  <div class:lesson-code-host-ready={ready} class="lesson-code-host" bind:this={host}></div>
</div>

<style>
  .lesson-code-example {
    margin-top: 1rem;
    border-top: 1px solid var(--border);
    padding-top: 1rem;
  }

  .lesson-code-example-header {
    margin-bottom: 0.5rem;
  }

  .lesson-code-example-header h4 {
    margin: 0.25rem 0 0;
    font-size: 1rem;
  }

  .lesson-code-host {
    min-height: 12rem;
    overflow: hidden;
    border-radius: 0.375rem;
    border: 1px solid var(--border);
    background: #1e1e2e;
  }

  .lesson-code-host:not(.lesson-code-host-ready) {
    background-image: linear-gradient(180deg, rgba(148, 163, 184, 0.06), rgba(148, 163, 184, 0));
  }
</style>