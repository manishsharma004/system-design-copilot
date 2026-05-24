<svelte:options runes={false} />
<script>
  import { onMount } from 'svelte';

  export let value = '';
  export let readOnly = false;
  export let minHeight = '18rem';

  /** @type {HTMLDivElement | undefined} */
  let host;
  /** @type {import('codemirror').EditorView | undefined} */
  let editor;
  let ready = false;
  let syncingFromEditor = false;

  onMount(() => {
    let disposed = false;

    (async () => {
      const [{ EditorState }, { EditorView, basicSetup }, { markdown }, { oneDark }] = await Promise.all([
        import('@codemirror/state'),
        import('codemirror'),
        import('@codemirror/lang-markdown'),
        import('@codemirror/theme-one-dark')
      ]);

      if (disposed || !host) return;

      editor = new EditorView({
        state: EditorState.create({
          doc: value,
          extensions: [
            basicSetup,
            markdown(),
            oneDark,
            EditorView.lineWrapping,
            EditorState.readOnly.of(readOnly),
            EditorView.theme({
              '&': {
                fontSize: '0.95rem',
                borderRadius: '1rem',
                border: '1px solid var(--border)',
                background: 'rgba(15, 23, 42, 0.95)'
              },
              '.cm-gutters': {
                borderRight: '1px solid var(--border)',
                background: 'rgba(8, 17, 31, 0.92)',
                color: 'var(--muted)'
              },
              '.cm-content, .cm-gutter': {
                minHeight
              },
              '.cm-scroller': {
                minHeight
              },
              '.cm-focused': {
                outline: 'none'
              }
            }),
            EditorView.updateListener.of((update) => {
              if (!update.docChanged) return;
              syncingFromEditor = true;
              value = update.state.doc.toString();
              syncingFromEditor = false;
            })
          ]
        }),
        parent: host
      });

      ready = true;
    })();

    return () => {
      disposed = true;
      editor?.destroy();
    };
  });

  $: if (editor && !syncingFromEditor) {
    const current = editor.state.doc.toString();
    if (value !== current) {
      editor.dispatch({
        changes: {
          from: 0,
          to: current.length,
          insert: value
        }
      });
    }
  }
</script>

<div class="code-editor-shell">
  {#if !ready}
    <textarea bind:value rows="12"></textarea>
  {/if}
  <div class:editor-hidden={!ready} bind:this={host}></div>
</div>
