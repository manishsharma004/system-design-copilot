const HTML_ENTITIES = {
  '&nbsp;': ' ',
  '&amp;': '&',
  '&lt;': '<',
  '&gt;': '>',
  '&quot;': '"',
  '&#39;': "'"
}

const SUPPORTED_SCALAR_TYPES = new Set(['integer', 'string', 'boolean'])

export const practiceLanguageCatalog = [
  {
    id: 'python3',
    label: 'Python',
    monacoLanguage: 'python',
    runtimeId: 'wasm-python',
    available: true,
    helperText: 'Runs in-browser with the bundled Pyodide WebAssembly runtime.',
    filename: 'solution.py'
  },
  {
    id: 'cpp',
    label: 'C++',
    monacoLanguage: 'cpp',
    runtimeId: 'wasm-cpp',
    available: true,
    helperText: 'Runs in-browser by compiling the current C++ file to WebAssembly with YoWASP Clang and executing it through a WASI runtime.',
    filename: 'solution.cpp'
  },
  {
    id: 'java',
    label: 'Java',
    monacoLanguage: 'java',
    runtimeId: 'wasm-java',
    available: false,
    helperText: 'Select and edit the Java template now. Running requires a bundled Java WASM toolchain.',
    filename: 'Solution.java'
  }
]

export function parseQuestionMeta(rawMeta) {
  if (!rawMeta) return null
  try {
    return JSON.parse(rawMeta)
  } catch {
    return null
  }
}

export function parseLanguageTemplates(rawDefinitions) {
  if (!rawDefinitions) return {}

  try {
    const definitions = JSON.parse(rawDefinitions)
    return definitions.reduce((templates, definition) => {
      if (!['python3', 'python', 'cpp', 'java'].includes(definition.value)) return templates

      const normalizedId = definition.value === 'python' ? 'python3' : definition.value
      const priority = definition.value === 'python3' ? 2 : 1
      if (!templates[normalizedId] || (templates[normalizedId].priority ?? 0) < priority) {
        templates[normalizedId] = {
          id: normalizedId,
          label: definition.text,
          defaultCode: definition.defaultCode ?? '',
          priority
        }
      }
      return templates
    }, {})
  } catch {
    return {}
  }
}

export function normalizePracticeType(rawType) {
  if (!rawType) return null
  const type = rawType.toLowerCase().replace(/\s+/g, '')
  if (type === 'void') {
    return { kind: 'void', base: 'void', depth: 0, raw: rawType }
  }

  let depth = 0
  let base = type

  while (base.endsWith('[]')) {
    depth += 1
    base = base.slice(0, -2)
  }

  while (base.startsWith('list<') && base.endsWith('>')) {
    depth += 1
    base = base.slice(5, -1)
  }

  return {
    kind: depth ? 'array' : 'scalar',
    base,
    depth,
    raw: rawType
  }
}

export function isSupportedPracticeMeta(meta) {
  if (!meta || meta.manual || !meta.name || !Array.isArray(meta.params) || !meta.params.length) return false

  const parameterTypes = meta.params.map((param) => normalizePracticeType(param.type))
  if (parameterTypes.some((paramType) => !isSupportedType(paramType))) return false

  const returnType = normalizePracticeType(meta.return?.type ?? 'void')
  if (returnType.kind === 'void') {
    const outputIndex = meta.output?.paramindex
    return Number.isInteger(outputIndex) && outputIndex >= 0 && outputIndex < parameterTypes.length
  }

  return isSupportedType(returnType)
}

export function supportsLocalWasmPractice({ practiceMeta, languageTemplates }) {
  return Boolean(
    practiceMeta
      && isSupportedPracticeMeta(practiceMeta)
      && (languageTemplates.python3?.defaultCode || languageTemplates.cpp?.defaultCode)
  )
}

function isSupportedType(typeInfo) {
  if (!typeInfo) return false
  return typeInfo.depth <= 2 && SUPPORTED_SCALAR_TYPES.has(typeInfo.base)
}

export function extractPracticeCases(contentHtml, sampleTestCase) {
  const cases = []
  const preBlocks = [...String(contentHtml ?? '').matchAll(/<pre[^>]*>([\s\S]*?)<\/pre>/gi)]

  for (const [index, match] of preBlocks.entries()) {
    const blockText = decodeHtmlEntities(stripHtml(match[1])).trim()
    if (!/input\s*:/i.test(blockText) || !/output\s*:/i.test(blockText)) continue

    const inputMatch = blockText.match(/input\s*:\s*([\s\S]*?)\s*output\s*:/i)
    const outputMatch = blockText.match(/output\s*:\s*([\s\S]*?)(?:\s*explanation\s*:|$)/i)
    const normalizedInput = normalizeExampleInput(inputMatch?.[1] ?? '')
    const normalizedOutput = normalizeExampleOutput(outputMatch?.[1] ?? '')

    if (!normalizedInput) continue
    cases.push({
      id: `example-${index + 1}`,
      label: `Example ${index + 1}`,
      inputRaw: normalizedInput,
      expectedRaw: normalizedOutput,
      source: 'example'
    })
  }

  if (!cases.length && sampleTestCase?.trim()) {
    cases.push({
      id: 'sample',
      label: 'Sample',
      inputRaw: sampleTestCase.trim(),
      expectedRaw: '',
      source: 'sample'
    })
  }

  return cases.slice(0, 3)
}

export function parseInputLines(rawInput) {
  const lines = String(rawInput ?? '')
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)

  return lines.map((line) => parseLiteral(line)).filter((value) => value !== undefined)
}

export function parseExpectedValue(rawExpected) {
  const trimmed = String(rawExpected ?? '').trim()
  if (!trimmed) return null
  return parseLiteral(trimmed)
}

export function formatComparableValue(value) {
  if (value === undefined) return ''
  if (value === null) return 'null'
  if (typeof value === 'string') return JSON.stringify(value)
  return JSON.stringify(value)
}

export function buildPythonPracticeSource({ practiceMeta, userCode, inputValues }) {
  const parameterLines = practiceMeta.params
    .map((param, index) => `${param.name} = ${toPythonLiteral(inputValues[index])}`)
    .join('\n')

  const callArguments = practiceMeta.params.map((param) => param.name).join(', ')
  const outputExpression = normalizePracticeType(practiceMeta.return?.type ?? 'void').kind === 'void'
    ? practiceMeta.params[practiceMeta.output.paramindex]?.name ?? 'None'
    : 'result'

  return [
    'from typing import *',
    'import json',
    '',
    userCode.trimEnd(),
    '',
    'solver = Solution()',
    parameterLines,
    `result = solver.${practiceMeta.name}(${callArguments})`,
    `print(json.dumps(${outputExpression}))`
  ].join('\n').replace(/\n\n\n+/g, '\n\n')
}

export function buildCppPracticeSource({ practiceMeta, userCode, inputValues }) {
  const parameterLines = practiceMeta.params
    .map((param, index) => {
      const typeInfo = normalizePracticeType(param.type)
      return `${toCppType(typeInfo)} ${param.name} = ${toCppLiteral(inputValues[index], typeInfo)};`
    })
    .join('\n')

  const returnType = normalizePracticeType(practiceMeta.return?.type ?? 'void')
  const callArguments = practiceMeta.params.map((param) => param.name).join(', ')
  const invocationLine = returnType.kind === 'void'
    ? `solver.${practiceMeta.name}(${callArguments});`
    : `auto result = solver.${practiceMeta.name}(${callArguments});`
  const outputExpression = returnType.kind === 'void'
    ? practiceMeta.params[practiceMeta.output.paramindex]?.name ?? '0'
    : 'result'

  return [
    '#include <bits/stdc++.h>',
    'using namespace std;',
    '',
    'static string escape_json_string(const string& value) {',
    '  string escaped;',
    '  escaped.reserve(value.size() + 8);',
    '  for (char ch : value) {',
    "    if (ch == '\\') escaped += \"\\\\\";",
    "    else if (ch == '\"') escaped += \"\\\"\";",
    "    else if (ch == '\n') escaped += \"\\n\";",
    "    else if (ch == '\r') escaped += \"\\r\";",
    "    else if (ch == '\t') escaped += \"\\t\";",
    '    else escaped += ch;',
    '  }',
    '  return escaped;',
    '}',
    '',
    'static string to_json_value(const string& value) {',
    '  return "\"" + escape_json_string(value) + "\"";',
    '}',
    '',
    'static string to_json_value(const char* value) {',
    '  return to_json_value(string(value));',
    '}',
    '',
    'static string to_json_value(bool value) {',
    '  return value ? "true" : "false";',
    '}',
    '',
    'template <typename T>',
    'static string to_json_value(const vector<T>& values) {',
    '  string output = "[";',
    '  for (size_t index = 0; index < values.size(); ++index) {',
    '    if (index) output += ", ";',
    '    output += to_json_value(values[index]);',
    '  }',
    '  output += "]";',
    '  return output;',
    '}',
    '',
    'template <typename T, typename enable_if<is_arithmetic<T>::value && !is_same<T, bool>::value, int>::type = 0>',
    'static string to_json_value(T value) {',
    '  return to_string(value);',
    '}',
    '',
    userCode.trimEnd(),
    '',
    'int main() {',
    ...indentCppLines(parameterLines),
    '  Solution solver;',
    `  ${invocationLine}`,
    `  cout << to_json_value(${outputExpression});`,
    '  return 0;',
    '}'
  ].join('\n').replace(/\n\n\n+/g, '\n\n')
}

function decodeHtmlEntities(value) {
  return Object.entries(HTML_ENTITIES).reduce((text, [entity, replacement]) => text.replaceAll(entity, replacement), String(value ?? ''))
}

function stripHtml(value) {
  return String(value ?? '')
    .replace(/<br\s*\/?\s*>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<[^>]+>/g, '')
}

function normalizeExampleInput(rawInput) {
  const trimmed = String(rawInput ?? '').trim()
  if (!trimmed) return ''
  const assignmentValues = extractAssignmentValues(trimmed)
  return assignmentValues.join('\n').trim()
}

function normalizeExampleOutput(rawOutput) {
  return String(rawOutput ?? '')
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)[0] ?? ''
}

function extractAssignmentValues(inputText) {
  if (!inputText.includes('=')) {
    return inputText.split(/\r?\n/).map((line) => line.trim()).filter(Boolean)
  }

  const values = []
  let cursor = 0

  while (cursor < inputText.length) {
    while (cursor < inputText.length && /[\s,]/.test(inputText[cursor])) cursor += 1
    const equalsIndex = inputText.indexOf('=', cursor)
    if (equalsIndex === -1) break

    let valueStart = equalsIndex + 1
    while (valueStart < inputText.length && /\s/.test(inputText[valueStart])) valueStart += 1

    let depth = 0
    let quote = ''
    let index = valueStart
    while (index < inputText.length) {
      const char = inputText[index]
      const previous = inputText[index - 1]

      if (quote) {
        if (char === quote && previous !== '\\') quote = ''
        index += 1
        continue
      }

      if (char === '"' || char === "'") {
        quote = char
      } else if (char === '[' || char === '{' || char === '(') {
        depth += 1
      } else if (char === ']' || char === '}' || char === ')') {
        depth = Math.max(0, depth - 1)
      } else if (depth === 0 && isAssignmentSeparator(inputText, index)) {
        break
      }
      index += 1
    }

    values.push(inputText.slice(valueStart, index).trim())
    cursor = index + 1
  }

  return values.filter(Boolean)
}

function isAssignmentSeparator(text, index) {
  if (!/[\n,]/.test(text[index])) return false
  const remainder = text.slice(index + 1)
  return /^\s*[A-Za-z_][A-Za-z0-9_]*\s*=/.test(remainder)
}

function parseLiteral(rawValue) {
  const trimmed = String(rawValue ?? '').trim()
  if (!trimmed) return undefined

  try {
    return JSON.parse(trimmed)
  } catch {
    if (/^-?\d+$/.test(trimmed)) return Number.parseInt(trimmed, 10)
    if (/^-?\d+\.\d+$/.test(trimmed)) return Number.parseFloat(trimmed)
    if (/^(true|false)$/i.test(trimmed)) return trimmed.toLowerCase() === 'true'
    if ((trimmed.startsWith('"') && trimmed.endsWith('"')) || (trimmed.startsWith("'") && trimmed.endsWith("'"))) {
      return trimmed.slice(1, -1)
    }
    return trimmed
  }
}

function toPythonLiteral(value) {
  if (Array.isArray(value)) {
    return `[${value.map((entry) => toPythonLiteral(entry)).join(', ')}]`
  }
  if (typeof value === 'string') {
    return JSON.stringify(value)
  }
  if (typeof value === 'boolean') {
    return value ? 'True' : 'False'
  }
  if (value === null) {
    return 'None'
  }
  return String(value)
}

function toCppType(typeInfo) {
  if (!typeInfo || typeInfo.kind === 'void') return 'void'

  const baseType = typeInfo.base === 'integer'
    ? 'int'
    : typeInfo.base === 'string'
      ? 'string'
      : 'bool'

  return Array.from({ length: typeInfo.depth }).reduce((current) => `vector<${current}>`, baseType)
}

function toCppLiteral(value, typeInfo) {
  if (Array.isArray(value)) {
    const nextType = typeInfo && typeInfo.depth > 0
      ? { ...typeInfo, depth: typeInfo.depth - 1, kind: typeInfo.depth - 1 ? 'array' : 'scalar' }
      : null
    return `{${value.map((entry) => toCppLiteral(entry, nextType)).join(', ')}}`
  }
  if (typeof value === 'string') {
    return JSON.stringify(value)
  }
  if (typeof value === 'boolean') {
    return value ? 'true' : 'false'
  }
  if (value === null || value === undefined) {
    return 'nullptr'
  }
  return String(value)
}

function indentCppLines(source) {
  if (!source.trim()) return []
  return source.split('\n').map((line) => `  ${line}`)
}
