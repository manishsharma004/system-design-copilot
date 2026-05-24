
import { error } from '@sveltejs/kit';
import { getLessonBySlug, getModuleBySlug, modules } from '$lib/data/courseData';
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
  const lessonIndex = module.lessons.findIndex((entry) => entry.slug === lesson.slug);
  return {
    module,
    lesson: {
      ...lesson,
      interactive: getInteractiveLesson(lesson.id)
    },
    previousLesson: lessonIndex > 0 ? module.lessons[lessonIndex - 1] : null,
    nextLesson: lessonIndex < module.lessons.length - 1 ? module.lessons[lessonIndex + 1] : null
  };
}
