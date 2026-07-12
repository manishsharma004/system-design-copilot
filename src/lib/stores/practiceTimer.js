const IDLE_TIMER = Object.freeze({
  status: /** @type {'idle'} */ ('idle'),
  elapsedMs: 0,
  startedAt: null,
  lastCompletedMs: 0,
  attemptCount: 0,
  updatedAt: null
})

function toFiniteMs(value) {
  return Number.isFinite(value) && value > 0 ? Math.floor(value) : 0
}

function toIsoTimestamp(value) {
  if (typeof value !== 'string') return null
  const parsed = Date.parse(value)
  return Number.isFinite(parsed) ? new Date(parsed).toISOString() : null
}

function toNowIso(now) {
  const safeNow = Number.isFinite(now) ? now : Date.now()
  return new Date(safeNow).toISOString()
}

/** @typedef {'idle' | 'running' | 'paused'} AttemptTimerStatus */

/** @typedef {{
 *   status: AttemptTimerStatus,
 *   elapsedMs: number,
 *   startedAt: string | null,
 *   lastCompletedMs: number,
 *   attemptCount: number,
 *   updatedAt: string | null
 * }} ResolvedAttemptTimer */

/** @returns {ResolvedAttemptTimer} */
export function resolveAttemptTimer(timer) {
  if (!timer || typeof timer !== 'object' || Array.isArray(timer)) {
    return { ...IDLE_TIMER }
  }

  const elapsedMs = toFiniteMs(timer.elapsedMs)
  const lastCompletedMs = toFiniteMs(timer.lastCompletedMs)
  const attemptCount = Number.isInteger(timer.attemptCount) && timer.attemptCount > 0 ? timer.attemptCount : 0
  const startedAt = toIsoTimestamp(timer.startedAt)
  const updatedAt = toIsoTimestamp(timer.updatedAt)

  /** @type {AttemptTimerStatus} */
  let status = timer.status === 'running' || timer.status === 'paused' ? timer.status : 'idle'
  if (status === 'running' && !startedAt) {
    status = elapsedMs > 0 ? 'paused' : 'idle'
  }

  return {
    status,
    elapsedMs,
    startedAt: status === 'running' ? startedAt : null,
    lastCompletedMs,
    attemptCount,
    updatedAt
  }
}

export function getAttemptTimerElapsed(timer, now = Date.now()) {
  const resolved = resolveAttemptTimer(timer)
  if (resolved.status !== 'running' || !resolved.startedAt) {
    return resolved.elapsedMs
  }

  const startedAtMs = Date.parse(resolved.startedAt)
  const safeNow = Number.isFinite(now) ? now : Date.now()
  return resolved.elapsedMs + Math.max(0, safeNow - startedAtMs)
}

/** @returns {ResolvedAttemptTimer} */
export function startAttemptTimer(timer, now = Date.now()) {
  const resolved = resolveAttemptTimer(timer)
  const isoNow = toNowIso(now)

  if (resolved.status === 'running') {
    return {
      ...resolved,
      updatedAt: isoNow
    }
  }

  return {
    ...resolved,
    status: 'running',
    elapsedMs: resolved.status === 'paused' ? resolved.elapsedMs : 0,
    startedAt: isoNow,
    updatedAt: isoNow
  }
}

/** @returns {ResolvedAttemptTimer} */
export function pauseAttemptTimer(timer, now = Date.now()) {
  const resolved = resolveAttemptTimer(timer)
  if (resolved.status !== 'running') {
    return resolved
  }

  return {
    ...resolved,
    status: 'paused',
    elapsedMs: getAttemptTimerElapsed(resolved, now),
    startedAt: null,
    updatedAt: toNowIso(now)
  }
}

/** @returns {ResolvedAttemptTimer} */
export function stopAttemptTimer(timer, now = Date.now()) {
  const resolved = resolveAttemptTimer(timer)
  const totalElapsedMs = getAttemptTimerElapsed(resolved, now)
  const hasCompletedAttempt = totalElapsedMs > 0
  const isoNow = toNowIso(now)

  return {
    ...resolved,
    status: 'idle',
    elapsedMs: 0,
    startedAt: null,
    lastCompletedMs: hasCompletedAttempt ? totalElapsedMs : resolved.lastCompletedMs,
    attemptCount: hasCompletedAttempt ? resolved.attemptCount + 1 : resolved.attemptCount,
    updatedAt: isoNow
  }
}