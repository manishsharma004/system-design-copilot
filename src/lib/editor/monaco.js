// @ts-nocheck
import {
  FLOW_GRAPH_LANGUAGE,
  flowGraphCompletions,
  markdownCompletions,
  simulationScriptCompletions
} from '$lib/editor/exerciseMetadata'

let initialized = false
let monacoPromise
export const MONACO_THEME = 'system-design-copilot-dark'

/**
 * @param {any} monaco
 */
function ensureWorkerEnvironment(monaco) {
  if (globalThis.MonacoEnvironment) return
  globalThis.MonacoEnvironment = {
    getWorker(_, label) {
      if (label === 'typescript' || label === 'javascript') {
        return new Worker(new URL('monaco-editor/esm/vs/language/typescript/ts.worker.js', import.meta.url), {
          type: 'module'
        })
      }
      return new Worker(new URL('monaco-editor/esm/vs/editor/editor.worker.js', import.meta.url), {
        type: 'module'
      })
    }
  }
}

/**
 * @param {{ label: string, documentation: string, insertText: string }[]} items
 * @param {any} monacoRef
 */
function toSnippetSuggestions(items, monacoRef) {
  return items.map((item) => ({
    label: item.label,
    documentation: item.documentation,
    insertText: item.insertText,
    kind: monacoRef.languages.CompletionItemKind.Snippet,
    insertTextRules: monacoRef.languages.CompletionItemInsertTextRule.InsertAsSnippet
  }))
}

/**
 * @param {any} monaco
 */
function registerMarkdownSupport(monaco) {
  monaco.languages.registerCompletionItemProvider('markdown', {
    provideCompletionItems() {
      return {
        suggestions: toSnippetSuggestions(markdownCompletions, monaco)
      }
    }
  })
}

/**
 * @param {any} monaco
 */
function registerTheme(monaco) {
  monaco.editor.defineTheme(MONACO_THEME, {
    base: 'vs-dark',
    inherit: true,
    rules: [
      { token: 'keyword', foreground: 'C586C0' },
      { token: 'attribute.name', foreground: '9CDCFE' },
      { token: 'type.identifier', foreground: '4EC9B0' },
      { token: 'string', foreground: 'CE9178' },
      { token: 'number', foreground: 'B5CEA8' },
      { token: 'comment', foreground: '6A9955' }
    ],
    colors: {
      'editor.background': '#11131A',
      'editor.foreground': '#E6EDF7',
      'editorGutter.background': '#11131A',
      'editorLineNumber.foreground': '#5E677D',
      'editorLineNumber.activeForeground': '#C9D4EE',
      'editorLineNumber.dimmedForeground': '#4B5368',
      'editorCursor.foreground': '#89B4FA',
      'editor.selectionBackground': '#264F78',
      'editor.inactiveSelectionBackground': '#20324C',
      'editor.lineHighlightBackground': '#171B25',
      'editor.lineHighlightBorder': '#00000000',
      'editorIndentGuide.background1': '#242A37',
      'editorIndentGuide.activeBackground1': '#384058',
      'editorBracketMatch.background': '#2A3346',
      'editorBracketMatch.border': '#4C6FFF',
      'editorBracketHighlight.foreground1': '#D7BA7D',
      'editorBracketHighlight.foreground2': '#89DCEB',
      'editorBracketHighlight.foreground3': '#C586C0',
      'editorBracketHighlight.foreground4': '#B5CEA8',
      'editorBracketHighlight.foreground5': '#CE9178',
      'editorBracketHighlight.foreground6': '#9CDCFE',
      'editorSuggestWidget.background': '#161922',
      'editorSuggestWidget.border': '#31384A',
      'editorSuggestWidget.selectedBackground': '#252D3C',
      'editorHoverWidget.background': '#161922',
      'editorHoverWidget.border': '#31384A',
      'editorWidget.background': '#161922',
      'editorWidget.border': '#31384A',
      'scrollbar.shadow': '#00000000',
      'scrollbarSlider.background': '#3A4252AA',
      'scrollbarSlider.hoverBackground': '#4B5568CC',
      'scrollbarSlider.activeBackground': '#677285DD',
      'quickInput.background': '#161922',
      'quickInput.foreground': '#E6EDF7',
      'quickInputList.focusBackground': '#252D3C',
      'quickInputTitle.background': '#1C2230',
      'statusBar.background': '#007ACC',
      'statusBar.foreground': '#FFFFFF'
    }
  })
}

/**
 * @param {any} monaco
 */
function registerFlowGraphLanguage(monaco) {
  monaco.languages.register({ id: FLOW_GRAPH_LANGUAGE })
  monaco.languages.setLanguageConfiguration(FLOW_GRAPH_LANGUAGE, {
    comments: {
      lineComment: '//'
    },
    brackets: [['{', '}'], ['(', ')']]
  })
  monaco.languages.setMonarchTokensProvider(FLOW_GRAPH_LANGUAGE, {
    tokenizer: {
      root: [
        [/^\s*(node|link)\b/, 'keyword'],
        [/\b(type|label|latencyMs|capacityRps|queueCapacity|hitRate|errorRate|extraLatencyMs|async)\b/, 'attribute.name'],
        [/"[^"]*"/, 'string'],
        [/'[^']*'/, 'string'],
        [/\b(edge|service|cache|database|queue|worker)\b/, 'type.identifier'],
        [/\b\d+(?:\.\d+)?\b/, 'number'],
        [/#.*$/, 'comment'],
        [/\/\/.*$/, 'comment']
      ]
    }
  })
  monaco.languages.registerCompletionItemProvider(FLOW_GRAPH_LANGUAGE, {
    provideCompletionItems() {
      return {
        suggestions: toSnippetSuggestions(flowGraphCompletions, monaco)
      }
    }
  })
}

/**
 * @param {any} monaco
 */
function registerTypeScriptSupport(monaco) {
  monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
    allowJs: true,
    checkJs: true,
    noEmit: true,
    strict: true,
    target: monaco.languages.typescript.ScriptTarget.ES2022
  })
  monaco.languages.typescript.typescriptDefaults.addExtraLib(
    [
      'declare function workload(target: string, overrides: Record<string, string | number | boolean>): void;',
      'declare function node(target: string, overrides: Record<string, string | number | boolean>): void;',
      'declare function failure(target: string, overrides: Record<string, string | number | boolean>): void;'
    ].join('\n'),
    'ts:simulation-helpers.d.ts'
  )

  const provider = {
    provideCompletionItems() {
      return {
        suggestions: toSnippetSuggestions(simulationScriptCompletions, monaco)
      }
    }
  }
  monaco.languages.registerCompletionItemProvider('typescript', provider)
  monaco.languages.registerCompletionItemProvider('javascript', provider)
}

async function initialize() {
  if (initialized && monacoPromise) return monacoPromise

  monacoPromise = (async () => {
    const [monaco] = await Promise.all([
      import('monaco-editor/esm/vs/editor/editor.api.js'),
      import('monaco-editor/esm/vs/basic-languages/markdown/markdown.contribution.js'),
      import('monaco-editor/esm/vs/language/typescript/monaco.contribution.js'),
      import('monaco-editor/esm/vs/editor/standalone/browser/quickAccess/standaloneCommandsQuickAccess.js'),
      import('monaco-editor/esm/vs/editor/standalone/browser/quickAccess/standaloneHelpQuickAccess.js')
    ])
    ensureWorkerEnvironment(monaco)
    if (!initialized) {
      registerTheme(monaco)
      registerMarkdownSupport(monaco)
      registerFlowGraphLanguage(monaco)
      registerTypeScriptSupport(monaco)
      initialized = true
    }
    return monaco
  })()

  return monacoPromise
}

export function getMonaco() {
  return initialize()
}
