
import { error } from '@sveltejs/kit';
import { getModuleBySlug, modules } from '$lib/data/courseData';

export const prerender = true;

export function entries() {
  return modules.map((module) => ({ module: module.slug }));
}

export function load({ params }) {
  const module = getModuleBySlug(params.module);
  if (!module) {
    throw error(404, 'Module not found');
  }
  return { module };
}
