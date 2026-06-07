/**
 * @param {{
 *   modules: Array<{ slug: string, title: string, summary: string, lessons: Array<{ title: string, summary: string }> }>,
 *   activeFlow?: { modules?: Array<{ slug: string, title: string, summary: string, lessons: Array<{ title: string, summary: string }> }> } | null,
 *   query?: string
 * }} options
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
