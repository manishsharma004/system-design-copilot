// @ts-nocheck
import {
  FLOW_GRAPH_LANGUAGE,
  flowGraphCompletions,
  markdownCompletions,
  simulationScriptCompletions
} from '$lib/editor/exerciseMetadata'

let initialized = false
let monacoPromise

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
    /** @type {any} */
    const monaco = await import('monaco-editor/esm/vs/editor/editor.api.js')
    ensureWorkerEnvironment(monaco)
    if (!initialized) {
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
