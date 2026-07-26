/**
 * Architecture-diagram SVG icons for HLD simulation components.
 * Flat, recognizable shapes inspired by classic system-design diagrams
 * (clients, cloud/CDN, load balancer fan-out, server racks, cylinders, queues).
 */

/**
 * @typedef {{
 *   viewBox?: string,
 *   paths: Array<{
 *     d?: string,
 *     tag?: 'path' | 'rect' | 'circle' | 'ellipse' | 'line' | 'polyline' | 'polygon',
 *     x?: number, y?: number, width?: number, height?: number, rx?: number, ry?: number,
 *     cx?: number, cy?: number, r?: number,
 *     x1?: number, y1?: number, x2?: number, y2?: number,
 *     points?: string,
 *     fill?: 'none' | 'solid' | 'soft',
 *     stroke?: boolean,
 *     strokeWidth?: number
 *   }>
 * }} IconDef
 */

/** @type {Record<string, IconDef>} */
export const COMPONENT_ICONS = {
  clients: {
    paths: [
      // monitor
      { tag: 'rect', x: 6, y: 8, width: 22, height: 16, rx: 2, fill: 'soft', stroke: true },
      { tag: 'rect', x: 14, y: 24, width: 6, height: 3, fill: 'solid' },
      { tag: 'rect', x: 10, y: 27, width: 14, height: 2, rx: 1, fill: 'solid' },
      // phone
      { tag: 'rect', x: 32, y: 10, width: 10, height: 20, rx: 2, fill: 'soft', stroke: true },
      { tag: 'circle', cx: 37, cy: 26, r: 1.2, fill: 'solid' }
    ]
  },
  edge: {
    paths: [
      { tag: 'rect', x: 8, y: 10, width: 32, height: 22, rx: 3, fill: 'soft', stroke: true },
      { tag: 'rect', x: 8, y: 10, width: 32, height: 5, rx: 3, fill: 'solid' },
      { tag: 'circle', cx: 24, cy: 26, r: 6, fill: 'none', stroke: true, strokeWidth: 1.6 },
      { tag: 'path', d: 'M18 26h12 M24 20c2 2 2 10 0 12 M24 20c-2 2-2 10 0 12', fill: 'none', stroke: true, strokeWidth: 1.4 }
    ]
  },
  dns: {
    paths: [
      { tag: 'circle', cx: 24, cy: 24, r: 14, fill: 'soft', stroke: true },
      { tag: 'path', d: 'M10 24h28 M24 10c4 4 4 20 0 28 M24 10c-4 4-4 20 0 28', fill: 'none', stroke: true, strokeWidth: 1.5 },
      { tag: 'ellipse', cx: 24, cy: 24, rx: 7, ry: 14, fill: 'none', stroke: true, strokeWidth: 1.3 }
    ]
  },
  cdn: {
    paths: [
      { tag: 'path', d: 'M14 30c-5 0-8-3.2-8-7.2S9 16 14 16c1.2-4.5 5.2-7.5 10-7.5 6 0 10.5 4.2 11 9.5 3.8.4 7 3.2 7 7.2 0 4-3.5 7.3-8 7.3H14z', fill: 'soft', stroke: true },
      { tag: 'circle', cx: 22, cy: 24, r: 2, fill: 'solid' },
      { tag: 'circle', cx: 30, cy: 22, r: 2, fill: 'solid' },
      { tag: 'circle', cx: 26, cy: 28, r: 1.6, fill: 'solid' }
    ]
  },
  'load-balancer': {
    paths: [
      // classic fan-out: one box in, three out
      { tag: 'rect', x: 6, y: 20, width: 10, height: 8, rx: 1.5, fill: 'soft', stroke: true },
      { tag: 'path', d: 'M16 24h8 M24 24V12 M24 24v12 M24 12h8 M24 24h8 M24 36h8', fill: 'none', stroke: true, strokeWidth: 1.8 },
      { tag: 'rect', x: 32, y: 8, width: 10, height: 8, rx: 1.5, fill: 'solid' },
      { tag: 'rect', x: 32, y: 20, width: 10, height: 8, rx: 1.5, fill: 'solid' },
      { tag: 'rect', x: 32, y: 32, width: 10, height: 8, rx: 1.5, fill: 'solid' }
    ]
  },
  'api-gateway': {
    paths: [
      { tag: 'rect', x: 8, y: 8, width: 32, height: 32, rx: 4, fill: 'soft', stroke: true },
      { tag: 'path', d: 'M16 18h16 M16 24h12 M16 30h14', fill: 'none', stroke: true, strokeWidth: 2 },
      { tag: 'circle', cx: 34, cy: 24, r: 3, fill: 'solid' }
    ]
  },
  service: {
    paths: [
      // server rack
      { tag: 'rect', x: 12, y: 6, width: 24, height: 36, rx: 3, fill: 'soft', stroke: true },
      { tag: 'rect', x: 16, y: 11, width: 16, height: 6, rx: 1.5, fill: 'solid' },
      { tag: 'rect', x: 16, y: 21, width: 16, height: 6, rx: 1.5, fill: 'solid' },
      { tag: 'rect', x: 16, y: 31, width: 16, height: 6, rx: 1.5, fill: 'solid' },
      { tag: 'circle', cx: 19, cy: 14, r: 1, fill: 'none', stroke: true, strokeWidth: 1 },
      { tag: 'circle', cx: 19, cy: 24, r: 1, fill: 'none', stroke: true, strokeWidth: 1 },
      { tag: 'circle', cx: 19, cy: 34, r: 1, fill: 'none', stroke: true, strokeWidth: 1 }
    ]
  },
  'auth-service': {
    paths: [
      { tag: 'rect', x: 14, y: 20, width: 20, height: 16, rx: 2, fill: 'soft', stroke: true },
      { tag: 'path', d: 'M18 20v-4a6 6 0 0 1 12 0v4', fill: 'none', stroke: true, strokeWidth: 2 },
      { tag: 'circle', cx: 24, cy: 28, r: 2.2, fill: 'solid' }
    ]
  },
  'rate-limiter': {
    paths: [
      { tag: 'rect', x: 8, y: 14, width: 32, height: 20, rx: 4, fill: 'soft', stroke: true },
      { tag: 'path', d: 'M16 24h6l3-8 4 16 3-8h6', fill: 'none', stroke: true, strokeWidth: 2 }
    ]
  },
  waf: {
    paths: [
      { tag: 'path', d: 'M24 6l14 6v10c0 9-6 16-14 20-8-4-14-11-14-20V12l14-6z', fill: 'soft', stroke: true },
      { tag: 'path', d: 'M18 24l4 4 8-10', fill: 'none', stroke: true, strokeWidth: 2.2 }
    ]
  },
  realtime: {
    paths: [
      { tag: 'rect', x: 8, y: 12, width: 32, height: 24, rx: 4, fill: 'soft', stroke: true },
      { tag: 'path', d: 'M16 28c2-6 4-6 6 0s4 6 6 0 4-6 6 0', fill: 'none', stroke: true, strokeWidth: 2 },
      { tag: 'circle', cx: 24, cy: 18, r: 2, fill: 'solid' }
    ]
  },
  cache: {
    paths: [
      // memory chip / cylinder hybrid
      { tag: 'rect', x: 10, y: 12, width: 28, height: 24, rx: 3, fill: 'soft', stroke: true },
      { tag: 'path', d: 'M10 18h28 M10 24h28 M10 30h28', fill: 'none', stroke: true, strokeWidth: 1.4 },
      { tag: 'rect', x: 6, y: 16, width: 4, height: 4, fill: 'solid' },
      { tag: 'rect', x: 6, y: 24, width: 4, height: 4, fill: 'solid' },
      { tag: 'rect', x: 38, y: 16, width: 4, height: 4, fill: 'solid' },
      { tag: 'rect', x: 38, y: 24, width: 4, height: 4, fill: 'solid' }
    ]
  },
  'kv-store': {
    paths: [
      { tag: 'rect', x: 8, y: 10, width: 32, height: 28, rx: 3, fill: 'soft', stroke: true },
      { tag: 'path', d: 'M14 18h8 M14 24h20 M14 30h14', fill: 'none', stroke: true, strokeWidth: 2 },
      { tag: 'circle', cx: 34, cy: 18, r: 2.5, fill: 'solid' }
    ]
  },
  database: {
    paths: [
      // classic cylinder
      { tag: 'ellipse', cx: 24, cy: 12, rx: 14, ry: 5, fill: 'soft', stroke: true },
      { tag: 'path', d: 'M10 12v24c0 2.8 6.3 5 14 5s14-2.2 14-5V12', fill: 'soft', stroke: true },
      { tag: 'ellipse', cx: 24, cy: 20, rx: 14, ry: 5, fill: 'none', stroke: true },
      { tag: 'ellipse', cx: 24, cy: 28, rx: 14, ry: 5, fill: 'none', stroke: true }
    ]
  },
  'read-replica': {
    paths: [
      { tag: 'ellipse', cx: 18, cy: 14, rx: 10, ry: 4, fill: 'soft', stroke: true },
      { tag: 'path', d: 'M8 14v16c0 2.2 4.5 4 10 4s10-1.8 10-4V14', fill: 'soft', stroke: true },
      { tag: 'ellipse', cx: 18, cy: 22, rx: 10, ry: 4, fill: 'none', stroke: true },
      { tag: 'path', d: 'M30 18h8 M34 14v16', fill: 'none', stroke: true, strokeWidth: 2 }
    ]
  },
  'object-storage': {
    paths: [
      { tag: 'path', d: 'M24 8l14 8v16l-14 8-14-8V16l14-8z', fill: 'soft', stroke: true },
      { tag: 'path', d: 'M10 16l14 8 14-8 M24 24v16', fill: 'none', stroke: true, strokeWidth: 1.6 }
    ]
  },
  'search-index': {
    paths: [
      { tag: 'circle', cx: 20, cy: 20, r: 11, fill: 'soft', stroke: true },
      { tag: 'path', d: 'M28 28l10 10', fill: 'none', stroke: true, strokeWidth: 3 },
      { tag: 'path', d: 'M15 20h10 M20 15v10', fill: 'none', stroke: true, strokeWidth: 1.6 }
    ]
  },
  shard: {
    paths: [
      { tag: 'rect', x: 6, y: 10, width: 10, height: 28, rx: 2, fill: 'soft', stroke: true },
      { tag: 'rect', x: 19, y: 10, width: 10, height: 28, rx: 2, fill: 'soft', stroke: true },
      { tag: 'rect', x: 32, y: 10, width: 10, height: 28, rx: 2, fill: 'solid' },
      { tag: 'path', d: 'M16 18h3 M29 24h3', fill: 'none', stroke: true, strokeWidth: 1.5 }
    ]
  },
  queue: {
    paths: [
      // message queue: stacked envelopes / bars
      { tag: 'rect', x: 8, y: 10, width: 32, height: 8, rx: 2, fill: 'soft', stroke: true },
      { tag: 'rect', x: 8, y: 20, width: 32, height: 8, rx: 2, fill: 'soft', stroke: true },
      { tag: 'rect', x: 8, y: 30, width: 32, height: 8, rx: 2, fill: 'solid' },
      { tag: 'path', d: 'M12 14l12 3 12-3 M12 24l12 3 12-3', fill: 'none', stroke: true, strokeWidth: 1.4 }
    ]
  },
  stream: {
    paths: [
      { tag: 'path', d: 'M6 16c6 0 6 8 12 8s6-8 12-8 6 8 12 8', fill: 'none', stroke: true, strokeWidth: 2.2 },
      { tag: 'path', d: 'M6 28c6 0 6 8 12 8s6-8 12-8 6 8 12 8', fill: 'none', stroke: true, strokeWidth: 2.2 }
    ]
  },
  pubsub: {
    paths: [
      { tag: 'circle', cx: 14, cy: 24, r: 5, fill: 'solid' },
      { tag: 'path', d: 'M19 24h8', fill: 'none', stroke: true, strokeWidth: 2 },
      { tag: 'circle', cx: 30, cy: 14, r: 4, fill: 'soft', stroke: true },
      { tag: 'circle', cx: 30, cy: 24, r: 4, fill: 'soft', stroke: true },
      { tag: 'circle', cx: 30, cy: 34, r: 4, fill: 'soft', stroke: true },
      { tag: 'path', d: 'M27 24h-0.1 M27 24c0-6 0-10 3-10 M27 24c0 6 0 10 3 10', fill: 'none', stroke: true, strokeWidth: 1.6 }
    ]
  },
  worker: {
    paths: [
      { tag: 'circle', cx: 24, cy: 24, r: 14, fill: 'soft', stroke: true },
      { tag: 'path', d: 'M24 14v8l6 4', fill: 'none', stroke: true, strokeWidth: 2.2 },
      { tag: 'path', d: 'M16 34h16', fill: 'none', stroke: true, strokeWidth: 2 }
    ]
  }
}

/** Map catalog / physics ids onto icon keys. */
const ICON_ALIASES = {
  edge: 'clients',
  client: 'clients',
  clients: 'clients',
  dns: 'dns',
  cdn: 'cdn',
  'load-balancer': 'load-balancer',
  'api-gateway': 'api-gateway',
  service: 'service',
  'auth-service': 'auth-service',
  'rate-limiter': 'rate-limiter',
  waf: 'waf',
  realtime: 'realtime',
  cache: 'cache',
  'kv-store': 'kv-store',
  database: 'database',
  'read-replica': 'read-replica',
  'object-storage': 'object-storage',
  'search-index': 'search-index',
  shard: 'shard',
  queue: 'queue',
  stream: 'stream',
  pubsub: 'pubsub',
  worker: 'worker'
}

/**
 * @param {string} type
 * @returns {string}
 */
export function resolveIconId(type) {
  return ICON_ALIASES[type] ?? 'service'
}

/**
 * @param {string} type
 * @returns {IconDef}
 */
export function getIconDef(type) {
  return COMPONENT_ICONS[resolveIconId(type)] ?? COMPONENT_ICONS.service
}

/**
 * Build inline SVG markup for HTML contexts (palette, inspector).
 * @param {string} type
 * @param {{ size?: number, color?: string, className?: string }} [options]
 */
export function iconSvgMarkup(type, options = {}) {
  const size = options.size ?? 32
  const color = options.color ?? 'currentColor'
  const className = options.className ?? ''
  const def = getIconDef(type)
  const viewBox = def.viewBox ?? '0 0 48 48'
  const body = def.paths.map((part) => serializeIconPart(part, color)).join('')
  return `<svg class="${className}" width="${size}" height="${size}" viewBox="${viewBox}" aria-hidden="true" focusable="false">${body}</svg>`
}

/**
 * @param {IconDef['paths'][number]} part
 * @param {string} color
 */
function serializeIconPart(part, color) {
  const fill = part.fill === 'solid'
    ? color
    : part.fill === 'soft'
      ? (color.startsWith('#') && color.length === 7 ? `${color}33` : 'rgba(255,255,255,0.12)')
      : 'none'
  const stroke = part.stroke === false ? 'none' : color
  const strokeWidth = part.strokeWidth ?? (part.stroke === false ? 0 : 1.8)
  const common = `fill="${fill}" stroke="${stroke}" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round"`
  const tag = part.tag ?? 'path'

  if (tag === 'rect') {
    return `<rect x="${part.x}" y="${part.y}" width="${part.width}" height="${part.height}" rx="${part.rx ?? 0}" ry="${part.ry ?? part.rx ?? 0}" ${common} />`
  }
  if (tag === 'circle') {
    return `<circle cx="${part.cx}" cy="${part.cy}" r="${part.r}" ${common} />`
  }
  if (tag === 'ellipse') {
    return `<ellipse cx="${part.cx}" cy="${part.cy}" rx="${part.rx ?? part.r ?? 0}" ry="${part.ry ?? part.r ?? 0}" ${common} />`
  }
  if (tag === 'line') {
    return `<line x1="${part.x1}" y1="${part.y1}" x2="${part.x2}" y2="${part.y2}" ${common} />`
  }
  if (tag === 'polyline') {
    return `<polyline points="${part.points}" ${common} />`
  }
  if (tag === 'polygon') {
    return `<polygon points="${part.points}" ${common} />`
  }
  return `<path d="${part.d ?? ''}" ${common} />`
}
