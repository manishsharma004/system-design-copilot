/** @typedef {{ label: string, shortLabel: string, flowSlug: string | null, kind: 'home' | 'flow' }} HeaderNavItem */

/** @typedef {{
 *   slug: string,
 *   title: string,
 *   shortTitle?: string,
 *   modules: Array<{ lessons: unknown[] }>
 * }} TrackFlow */

/** @type {HeaderNavItem[]} */
export const headerNavItems = [
  {
    label: 'Home',
    shortLabel: 'Home',
    flowSlug: null,
    kind: 'home'
  },
  {
    label: 'HLD',
    shortLabel: 'HLD',
    flowSlug: 'high-level-design',
    kind: 'flow'
  },
  {
    label: 'LLD',
    shortLabel: 'LLD',
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
    label: 'AI / ML',
    shortLabel: 'AI',
    flowSlug: 'ai-engineer',
    kind: 'flow'
  },
  {
    label: 'Questions',
    shortLabel: 'Questions',
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
 *   activeFlowSlug?: string | null
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

/**
 * Build Home-sidebar track list from course flows + completion counts.
 *
 * @param {TrackFlow[]} courseFlows
 * @param {string} base
 * @param {Record<string, { completed: number, total: number }>} progressByFlow
 */
export function getTrackNavItems(courseFlows, base, progressByFlow = {}) {
  return courseFlows.map((flow) => {
    const lessonTotal = flow.modules.reduce((sum, module) => sum + module.lessons.length, 0);
    const progress = progressByFlow[flow.slug];
    const completed = progress?.completed ?? 0;
    const total = progress?.total ?? lessonTotal;

    return {
      slug: flow.slug,
      title: flow.title,
      shortTitle: flow.shortTitle ?? flow.title,
      href: `${base}/flow/${flow.slug}`,
      completed,
      total
    };
  });
}
