import test from "node:test";
import assert from "node:assert/strict";

import { courseOverview, courseWeeks, tracks, toolkitPrompts } from "../courseData.js";

test("course overview exposes an 8-week advanced plan", () => {
  assert.equal(courseOverview.duration, "8 weeks");
  assert.match(courseOverview.cadence, /5 guided sessions/i);
  assert.equal(courseWeeks.length, 8);
});

test("every week includes five complete lessons", () => {
  courseWeeks.forEach((week) => {
    assert.equal(week.lessons.length, 5);
    week.lessons.forEach((lesson) => {
      assert.ok(lesson.title);
      assert.ok(lesson.outcome);
      assert.ok(lesson.depth);
      assert.ok(lesson.advancedNote);
      assert.ok(Array.isArray(lesson.drills));
      assert.ok(lesson.drills.length >= 2);
      assert.ok(lesson.checkpoint);
    });
  });
});

test("track filters and toolkit prompts cover the major study areas", () => {
  assert.equal(new Set(tracks).size, tracks.length);
  assert.ok(tracks.includes("Reliability"));
  assert.ok(tracks.includes("Case study"));
  assert.equal(toolkitPrompts.length, 4);
});
