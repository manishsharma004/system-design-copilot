
import { error } from '@sveltejs/kit';
import { allLessons, getLessonBySlug, getModuleBySlug, lessonIndex, modules } from '$lib/data/courseData';
import { getInteractiveLesson } from '$lib/data/interactiveLessons';

export const prerender = true;

export function entries() {
  return modules.flatMap((module) => module.lessons.map((lesson) => ({ module: module.slug, lesson: lesson.slug })));
}

export function load({ params }) {
  const module = getModuleBySlug(params.module);
  const lesson = getLessonBySlug(params.module, params.lesson);
  if (!module || !lesson) {
    throw error(404, 'Lesson not found');
  }
  const lessonPosition = module.lessons.findIndex((entry) => entry.slug === lesson.slug);
  /** @type {typeof allLessons} */
  const relatedLessons = (lesson.related ?? [])
    .map((lessonId) => lessonIndex[lessonId] ?? allLessons.find((entry) => entry.slug === lessonId))
    .filter(Boolean);
  return {
    module,
    lesson: {
      ...lesson,
      relatedLessons,
      interactive: getInteractiveLesson(lesson.id)
    },
    previousLesson: lessonPosition > 0 ? module.lessons[lessonPosition - 1] : null,
    nextLesson: lessonPosition < module.lessons.length - 1 ? module.lessons[lessonPosition + 1] : null
  };
}
