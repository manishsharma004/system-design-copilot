import test from "node:test";
import assert from "node:assert/strict";

import { learnerModes, primerTopics, siteOverview } from "../courseData.js";

function flattenTopicTitles(topics) {
  return topics.flatMap((topic) => [topic.title, ...topic.children.map((child) => child.title)]);
}

test("site overview and learner modes describe the interactive primer", () => {
  assert.match(siteOverview.title, /interactive/i);
  assert.equal(learnerModes.length, 3);
  assert.deepEqual(
    learnerModes.map((mode) => mode.id),
    ["beginner", "intermediate", "advanced"]
  );
  learnerModes.forEach((mode) => {
    assert.ok(mode.label);
    assert.ok(mode.audience);
    assert.ok(mode.description);
  });
});

test("primer topics cover the requested topic map", () => {
  const titles = new Set(flattenTopicTitles(primerTopics));
  const expectedTitles = [
    "System design topics: start here",
    "Step 1: Review the scalability video lecture",
    "Step 2: Review the scalability article",
    "Next steps",
    "Performance vs scalability",
    "Latency vs throughput",
    "Availability vs consistency",
    "CAP theorem",
    "CP - consistency and partition tolerance",
    "AP - availability and partition tolerance",
    "Consistency patterns",
    "Weak consistency",
    "Eventual consistency",
    "Strong consistency",
    "Availability patterns",
    "Fail-over",
    "Replication",
    "Availability in numbers",
    "Domain name system",
    "Content delivery network",
    "Push CDNs",
    "Pull CDNs",
    "Load balancer",
    "Active-passive",
    "Active-active",
    "Layer 4 load balancing",
    "Layer 7 load balancing",
    "Horizontal scaling",
    "Reverse proxy (web server)",
    "Load balancer vs reverse proxy",
    "Application layer",
    "Microservices",
    "Service discovery",
    "Database",
    "Relational database management system (RDBMS)",
    "Master-slave replication",
    "Master-master replication",
    "Federation",
    "Sharding",
    "Denormalization",
    "SQL tuning",
    "NoSQL",
    "Key-value store",
    "Document store",
    "Wide column store",
    "Graph Database",
    "SQL or NoSQL",
    "Cache",
    "Client caching",
    "CDN caching",
    "Web server caching",
    "Database caching",
    "Application caching",
    "Caching at the database query level",
    "Caching at the object level",
    "When to update the cache",
    "Cache-aside",
    "Write-through",
    "Write-behind (write-back)",
    "Refresh-ahead",
    "Asynchronism",
    "Message queues",
    "Task queues",
    "Back pressure",
    "Communication",
    "Transmission control protocol (TCP)",
    "User datagram protocol (UDP)",
    "Remote procedure call (RPC)",
    "Representational state transfer (REST)",
    "Security",
  ];

  expectedTitles.forEach((title) => {
    assert.ok(titles.has(title), `missing topic: ${title}`);
  });
});

test("every top-level lesson has sections, exercises, and mode-specific coaching", () => {
  assert.ok(primerTopics.length >= 10);

  primerTopics.forEach((topic) => {
    assert.ok(topic.summary);
    assert.equal(topic.sections.length, 3);
    topic.sections.forEach((section) => {
      assert.ok(section.heading);
      assert.ok(section.body);
    });

    assert.equal(topic.exercises.length, 2);
    topic.exercises.forEach((exercise) => {
      assert.ok(exercise.id);
      assert.ok(exercise.prompt);
      assert.match(exercise.type, /multiple-choice|reflection/);
      if (exercise.type === "multiple-choice") {
        assert.ok(Array.isArray(exercise.options));
        assert.ok(exercise.options.length >= 4);
        assert.equal(typeof exercise.answer, "number");
        assert.ok(exercise.explanation);
      } else {
        assert.ok(exercise.guidance);
      }
    });

    ["beginner", "intermediate", "advanced"].forEach((modeId) => {
      assert.ok(topic.modeFocus[modeId]);
    });

    topic.children.forEach((child) => {
      assert.ok(child.summary);
      assert.ok(child.impact);
      assert.ok(child.quickCheck.question);
      assert.ok(child.quickCheck.answer);
    });
  });
});
