/** Target duration per mock-interview practice phase (ms). */
export const PRACTICE_PHASE_LIMITS_MS = Object.freeze({
  opening: 25 * 60 * 1000,
  design: 35 * 60 * 1000,
  tradeoffs: 45 * 60 * 1000
});

/**
 * @param {string | undefined} stepId
 * @returns {number | null}
 */
export function getPracticePhaseLimitMs(stepId) {
  if (!stepId) return null;
  return PRACTICE_PHASE_LIMITS_MS[/** @type {keyof typeof PRACTICE_PHASE_LIMITS_MS} */ (stepId)] ?? null;
}

/** @param {number} totalMs */
export function formatPracticeDuration(totalMs) {
  const totalSeconds = Math.max(0, Math.floor(totalMs / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }

  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

/** @param {number} limitMs */
export function formatPhaseTargetLabel(limitMs) {
  const minutes = Math.round(limitMs / 60_000);
  return `${minutes} min target`;
}
