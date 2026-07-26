// @ts-nocheck
import {
  FLOW_GRAPH_LANGUAGE,
  flowGraphCompletions,
  markdownCompletions,
  simulationScriptCompletions
} from '$lib/editor/exerciseMetadata'
import { getThemeOption } from '$lib/themes.js'

let initialized = false
let monacoPromise
export const MONACO_THEME_DARK = 'system-design-copilot-dark'
export const MONACO_THEME_LIGHT = 'system-design-copilot-light'
export const MONACO_THEME = MONACO_THEME_DARK

/** @param {string} themeId */
export function getMonacoThemeId(themeId) {
  return getThemeOption(themeId).mode === 'light' ? MONACO_THEME_LIGHT : MONACO_THEME_DARK
}

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
  monaco.editor.defineTheme(MONACO_THEME_DARK, {
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

  monaco.editor.defineTheme(MONACO_THEME_LIGHT, {
    base: 'vs',
    inherit: true,
    rules: [
      { token: 'keyword', foreground: 'AF00DB' },
      { token: 'attribute.name', foreground: '0451A5' },
      { token: 'type.identifier', foreground: '267F99' },
      { token: 'string', foreground: 'A31515' },
      { token: 'number', foreground: '098658' },
      { token: 'comment', foreground: '6A9955' }
    ],
    colors: {
      'editor.background': '#FFFFFF',
      'editor.foreground': '#1E293B',
      'editorGutter.background': '#F8FAFC',
      'editorLineNumber.foreground': '#94A3B8',
      'editorLineNumber.activeForeground': '#334155',
      'editorLineNumber.dimmedForeground': '#CBD5E1',
      'editorCursor.foreground': '#4F46E5',
      'editor.selectionBackground': '#DBEAFE',
      'editor.inactiveSelectionBackground': '#E2E8F0',
      'editor.lineHighlightBackground': '#F8FAFC',
      'editor.lineHighlightBorder': '#00000000',
      'editorIndentGuide.background1': '#E2E8F0',
      'editorIndentGuide.activeBackground1': '#CBD5E1',
      'editorBracketMatch.background': '#E0E7FF',
      'editorBracketMatch.border': '#6366F1',
      'editorSuggestWidget.background': '#FFFFFF',
      'editorSuggestWidget.border': '#E2E8F0',
      'editorSuggestWidget.selectedBackground': '#EEF2FF',
      'editorHoverWidget.background': '#FFFFFF',
      'editorHoverWidget.border': '#E2E8F0',
      'editorWidget.background': '#FFFFFF',
      'editorWidget.border': '#E2E8F0',
      'scrollbar.shadow': '#00000000',
      'scrollbarSlider.background': '#CBD5E188',
      'scrollbarSlider.hoverBackground': '#94A3B8AA',
      'scrollbarSlider.activeBackground': '#64748BCC',
      'quickInput.background': '#FFFFFF',
      'quickInput.foreground': '#1E293B',
      'quickInputList.focusBackground': '#EEF2FF',
      'quickInputTitle.background': '#F8FAFC',
      'statusBar.background': '#4F46E5',
      'statusBar.foreground': '#FFFFFF'
    }
  })
}

/** @param {string} name @param {string} [fallback] */
function cssVar(name, fallback = '') {
  if (typeof document === 'undefined') return fallback
  const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim()
  return value || fallback
}

const DARK_TOKEN_RULES = [
  { token: 'keyword', foreground: 'C586C0' },
  { token: 'attribute.name', foreground: '9CDCFE' },
  { token: 'type.identifier', foreground: '4EC9B0' },
  { token: 'string', foreground: 'CE9178' },
  { token: 'number', foreground: 'B5CEA8' },
  { token: 'comment', foreground: '6A9955' }
]

const LIGHT_TOKEN_RULES = [
  { token: 'keyword', foreground: 'AF00DB' },
  { token: 'attribute.name', foreground: '0451A5' },
  { token: 'type.identifier', foreground: '267F99' },
  { token: 'string', foreground: 'A31515' },
  { token: 'number', foreground: '098658' },
  { token: 'comment', foreground: '6A9955' }
]

/** @param {any} monaco @param {string} themeId */
export function applyMonacoTheme(monaco, themeId) {
  const isLight = getThemeOption(themeId).mode === 'light'
  const themeName = getMonacoThemeId(themeId)
  const editorBg = cssVar('--vscode-editor-bg', isLight ? '#ffffff' : '#1e1e1e')
  const editorFg = cssVar('--vscode-foreground', isLight ? '#1e293b' : '#cccccc')
  const gutterBg = cssVar('--vscode-sideBar-bg', editorBg)
  const muted = cssVar('--vscode-descriptionForeground', isLight ? '#64748b' : '#858585')
  const focusBorder = cssVar('--vscode-focusBorder', '#696cff')
  const hoverBg = cssVar('--ide-hover-bg', isLight ? '#f1f5f9' : '#2a2d2e')
  const activeBg = cssVar('--ide-active-bg', isLight ? '#e2e8f0' : '#37373d')
  const widgetBg = cssVar('--vscode-sideBar-bg', isLight ? '#ffffff' : '#252526')
  const widgetBorder = cssVar('--vscode-border', isLight ? '#e2e8f0' : '#2b2b2b')
  const statusBarBg = cssVar('--vscode-statusBar-bg', focusBorder)

  monaco.editor.defineTheme(themeName, {
    base: isLight ? 'vs' : 'vs-dark',
    inherit: true,
    rules: isLight ? LIGHT_TOKEN_RULES : DARK_TOKEN_RULES,
    colors: {
      'editor.background': editorBg,
      'editor.foreground': editorFg,
      'editorGutter.background': gutterBg,
      'editorLineNumber.foreground': muted,
      'editorLineNumber.activeForeground': editorFg,
      'editorLineNumber.dimmedForeground': muted,
      'editorCursor.foreground': focusBorder,
      'editor.selectionBackground': activeBg,
      'editor.inactiveSelectionBackground': hoverBg,
      'editor.lineHighlightBackground': hoverBg,
      'editor.lineHighlightBorder': '#00000000',
      'editorIndentGuide.background1': widgetBorder,
      'editorIndentGuide.activeBackground1': muted,
      'editorBracketMatch.background': hoverBg,
      'editorBracketMatch.border': focusBorder,
      'editorSuggestWidget.background': widgetBg,
      'editorSuggestWidget.border': widgetBorder,
      'editorSuggestWidget.selectedBackground': activeBg,
      'editorHoverWidget.background': widgetBg,
      'editorHoverWidget.border': widgetBorder,
      'editorWidget.background': widgetBg,
      'editorWidget.border': widgetBorder,
      'scrollbar.shadow': '#00000000',
      'scrollbarSlider.background': isLight ? '#cbd5e188' : '#3a4252aa',
      'scrollbarSlider.hoverBackground': isLight ? '#94a3b8aa' : '#4b5568cc',
      'scrollbarSlider.activeBackground': isLight ? '#64748bcc' : '#677285dd',
      'minimap.background': editorBg,
      'minimap.selectionHighlight': focusBorder,
      'minimapSlider.background': isLight ? '#cbd5e188' : '#3a425288',
      'minimapSlider.hoverBackground': isLight ? '#94a3b8aa' : '#4b5568aa',
      'minimapSlider.activeBackground': isLight ? '#64748bcc' : '#677285cc',
      'quickInput.background': widgetBg,
      'quickInput.foreground': editorFg,
      'quickInputList.focusBackground': activeBg,
      'quickInputTitle.background': gutterBg,
      'statusBar.background': statusBarBg,
      'statusBar.foreground': '#ffffff'
    }
  })
  monaco.editor.setTheme(themeName)
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
      import('monaco-editor/esm/vs/basic-languages/cpp/cpp.contribution.js'),
      import('monaco-editor/esm/vs/basic-languages/java/java.contribution.js'),
      import('monaco-editor/esm/vs/basic-languages/markdown/markdown.contribution.js'),
      import('monaco-editor/esm/vs/basic-languages/python/python.contribution.js'),
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
