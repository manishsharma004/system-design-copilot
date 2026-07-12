/** @typedef {{ slug: string, title: string, summary: string, id: string, order: number }} SidebarLesson */

/** @typedef {{
 *   slug: string,
 *   title: string,
 *   summary: string,
 *   flowSlug?: string,
 *   lessons: SidebarLesson[]
 * }} SidebarModule */

/**
 * @param {{
 *   modules: SidebarModule[],
 *   activeFlow?: { modules?: SidebarModule[] } | null,
 *   query?: string
 * }} options
 * @returns {SidebarModule[]}
 */
export function getVisibleSidebarModules({ modules, activeFlow = null, query = '' }) {
  const normalizedQuery = query.trim().toLowerCase();
  const scopedModules = activeFlow?.modules?.length ? activeFlow.modules : modules;

  return scopedModules
    .map((module) => ({
      ...module,
      lessons: module.lessons.filter((lesson) => {
        const haystack = `${module.title} ${module.summary} ${lesson.title} ${lesson.summary}`.toLowerCase();
        return haystack.includes(normalizedQuery);
      })
    }))
    .filter((module) => (
      normalizedQuery
        ? module.lessons.length > 0 || `${module.title} ${module.summary}`.toLowerCase().includes(normalizedQuery)
        : true
    ));
}
