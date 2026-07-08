import test from 'node:test';
import assert from 'node:assert/strict';
import { allLessons, getResumeLesson } from '../src/lib/data/courseData.js';
import { BACKUP_STORAGE_KEYS, BACKUP_VERSION, exportLocalData, importLocalData } from '../src/lib/backup.js';

const isBrowser = typeof window !== 'undefined';

test('getResumeLesson returns the first incomplete lesson', () => {
  const first = allLessons[0];
  const second = allLessons[1];
  assert.ok(first && second);

  const resume = getResumeLesson([first.id]);
  assert.equal(resume?.id, second.id);
});

test('getResumeLesson falls back to the first lesson when everything is complete', () => {
  const resume = getResumeLesson(allLessons.map((lesson) => lesson.id));
  assert.equal(resume?.id, allLessons[0]?.id);
});

test('backup payload includes version metadata and storage keys', () => {
  const payload = exportLocalData();
  assert.equal(payload.version, BACKUP_VERSION);
  assert.ok(typeof payload.exportedAt === 'string');
  assert.deepEqual(Object.keys(BACKUP_STORAGE_KEYS).sort(), ['llm', 'practice', 'progress', 'sidebar', 'simulation']);
});

test('importLocalData rejects invalid payloads in the browser', () => {
  if (!isBrowser) {
    assert.deepEqual(importLocalData(null), { ok: false, error: 'Import is only available in the browser.' });
    return;
  }

  assert.deepEqual(importLocalData(null), { ok: false, error: 'Invalid backup file.' });
  assert.deepEqual(importLocalData({ version: 1 }), { ok: false, error: 'Backup is missing a data object.' });
});
