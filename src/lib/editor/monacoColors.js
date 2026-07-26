/**
 * Monaco token themes only accept #RRGGBB / #RRGGBBAA (optional #).
 * Vite/lightningcss minifies CSS custom properties like #cccccc → #ccc, which
 * then breaks defineTheme when those values are used as editor.foreground/background.
 * @param {string} value
 * @param {string} [fallback]
 */
export function normalizeMonacoHexColor(value, fallback = '#000000') {
  const raw = String(value ?? '').trim()
  if (!raw) return fallback

  const hex = raw.startsWith('#') ? raw.slice(1) : raw
  if (/^[0-9A-Fa-f]{3}$/.test(hex)) {
    return `#${hex[0]}${hex[0]}${hex[1]}${hex[1]}${hex[2]}${hex[2]}`.toLowerCase()
  }
  if (/^[0-9A-Fa-f]{4}$/.test(hex)) {
    return `#${hex[0]}${hex[0]}${hex[1]}${hex[1]}${hex[2]}${hex[2]}${hex[3]}${hex[3]}`.toLowerCase()
  }
  if (/^[0-9A-Fa-f]{6}([0-9A-Fa-f]{2})?$/.test(hex)) {
    return `#${hex.toLowerCase()}`
  }

  // rgb()/rgba() from computed styles — convert when possible
  const rgb = raw.match(/^rgba?\(\s*([0-9.]+)\s*,\s*([0-9.]+)\s*,\s*([0-9.]+)(?:\s*,\s*([0-9.]+))?\s*\)$/i)
  if (rgb) {
    const channel = (/** @type {string} */ part) =>
      Math.max(0, Math.min(255, Math.round(Number(part))))
        .toString(16)
        .padStart(2, '0')
    const alpha =
      rgb[4] === undefined
        ? ''
        : Math.round(Math.max(0, Math.min(1, Number(rgb[4]))) * 255)
            .toString(16)
            .padStart(2, '0')
    return `#${channel(rgb[1])}${channel(rgb[2])}${channel(rgb[3])}${alpha}`
  }

  return fallback
}
