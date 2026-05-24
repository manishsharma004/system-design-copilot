const CALL_PATTERN = /^(\w+)\(\s*(['"])([^'"]+)\2\s*,\s*(\{.*\})\s*\)\s*;?$/

/** @param {string} value */
function parseScalar(value) {
  const trimmed = value.trim()
  if ((trimmed.startsWith('"') && trimmed.endsWith('"')) || (trimmed.startsWith("'") && trimmed.endsWith("'"))) {
    return trimmed.slice(1, -1)
  }
  if (trimmed === 'true') return true
  if (trimmed === 'false') return false
  if (/^-?\d+(?:\.\d+)?$/.test(trimmed)) {
    return Number(trimmed)
  }
  return trimmed
}

/** @param {string} body */
function splitPairs(body) {
  const parts = []
  let current = ''
  let quote = ''

  for (const character of body) {
    if ((character === '"' || character === "'") && (!quote || quote === character)) {
      quote = quote ? '' : character
      current += character
      continue
    }
    if (character === ',' && !quote) {
      parts.push(current)
      current = ''
      continue
    }
    current += character
  }

  if (current.trim()) {
    parts.push(current)
  }

  return parts
}

/** @param {string} objectLiteral */
function parseObjectLiteral(objectLiteral) {
  const trimmed = objectLiteral.trim()
  if (!trimmed.startsWith('{') || !trimmed.endsWith('}')) {
    return { value: {}, error: 'Expected an object literal' }
  }

  const inner = trimmed.slice(1, -1).trim()
  if (!inner) {
    return { value: {}, error: '' }
  }

  /** @type {Record<string, string | number | boolean>} */
  const value = {}
  for (const pair of splitPairs(inner)) {
    const separatorIndex = pair.indexOf(':')
    if (separatorIndex === -1) {
      return { value, error: `Expected key: value pair in "${pair.trim()}"` }
    }
    const rawKey = pair.slice(0, separatorIndex).trim()
    const rawValue = pair.slice(separatorIndex + 1)
    const key = rawKey.replace(/^['"]|['"]$/g, '')
    if (!key) {
      return { value, error: `Missing key in "${pair.trim()}"` }
    }
    value[key] = parseScalar(rawValue)
  }

  return { value, error: '' }
}

/** @param {string} scriptText */
export function parseSimulationScript(scriptText) {
  /** @type {Record<string, Record<string, string | number | boolean>>} */
  const nodeOverrides = {}
  /** @type {Record<string, Record<string, string | number | boolean>>} */
  const workloadOverrides = {}
  /** @type {Record<string, Record<string, string | number | boolean>>} */
  const failureOverrides = {}
  const errors = []

  const lines = scriptText
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith('//') && !line.startsWith('#'))

  for (const line of lines) {
    const match = line.match(CALL_PATTERN)
    if (!match) {
      errors.push(`Unsupported script line: "${line}"`)
      continue
    }
    const [, command, , target, objectLiteral] = match
    const { value, error } = parseObjectLiteral(objectLiteral)
    if (error) {
      errors.push(`Invalid ${command}("${target}") call: ${error}`)
      continue
    }
    if (command === 'node') {
      nodeOverrides[target] = { ...(nodeOverrides[target] ?? {}), ...value }
      continue
    }
    if (command === 'workload') {
      workloadOverrides[target] = { ...(workloadOverrides[target] ?? {}), ...value }
      continue
    }
    if (command === 'failure') {
      failureOverrides[target] = { ...(failureOverrides[target] ?? {}), ...value }
      continue
    }
    errors.push(`Unsupported command "${command}"`)
  }

  return {
    nodeOverrides,
    workloadOverrides,
    failureOverrides,
    errors
  }
}
