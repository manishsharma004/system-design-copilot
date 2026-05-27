import { error } from '@sveltejs/kit';
import { courseFlows, getFlowBySlug } from '$lib/data/courseData';

export const prerender = true;

export function entries() {
  return courseFlows.map((flow) => ({ flow: flow.slug }));
}

export function load({ params }) {
  const flow = getFlowBySlug(params.flow);
  if (!flow) {
    throw error(404, 'Course flow not found');
  }
  return { flow };
}
