/** @typedef {{ label: string, shortLabel: string, flowSlug: string | null, kind: 'home' | 'flow' }} HeaderNavItem */

/** @type {HeaderNavItem[]} */
export const headerNavItems = [
  {
    label: 'Home',
    shortLabel: 'Home',
    flowSlug: null,
    kind: 'home'
  },
  {
    label: 'System Design (High Level)',
    shortLabel: 'SD (HL)',
    flowSlug: 'high-level-design',
    kind: 'flow'
  },
  {
    label: 'System Design (Low Level)',
    shortLabel: 'SD (LL)',
    flowSlug: 'low-level-design',
    kind: 'flow'
  },
  {
    label: 'DSA',
    shortLabel: 'DSA',
    flowSlug: 'data-structures-and-algorithms',
    kind: 'flow'
  },
  {
    label: 'AI Engineer',
    shortLabel: 'AI',
    flowSlug: 'ai-engineer',
    kind: 'flow'
  },
  {
    label: 'DSA (Practice)',
    shortLabel: 'DSA Practice',
    flowSlug: 'interview-questions',
    kind: 'flow'
  }
];

/**
 * @param {HeaderNavItem} item
 * @param {string} base
 */
export function headerNavHref(item, base) {
  if (item.kind === 'home') {
    return `${base}/`;
  }

  return `${base}/flow/${item.flowSlug}`;
}

/**
 * @param {HeaderNavItem} item
 * @param {{
 *   pathname: string,
 *   homeHref: string,
 *   activeFlowSlug?: string | null,
 *   sidebarFlowSlug?: string | null
 * }} context
 */
export function isHeaderNavActive(item, { pathname, homeHref, activeFlowSlug }) {
  const normalizedHome = homeHref.endsWith('/') ? homeHref.slice(0, -1) : homeHref;
  const isHome = pathname === homeHref || pathname === normalizedHome;

  if (item.kind === 'home') {
    return isHome;
  }

  return item.flowSlug === activeFlowSlug;
}
