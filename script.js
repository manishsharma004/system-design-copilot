import { learnerModes, primerTopics, siteOverview } from "./courseData.js";

const STORAGE_KEY = "system-design-copilot-progress-v3";

const state = {
  query: "",
  activeMode: learnerModes[0].id,
  selectedTopicId: primerTopics[0].id,
  completedTopics: new Set(),
  exerciseState: {},
};

const heroTitle = document.querySelector("#hero-title");
const heroSubtitle = document.querySelector("#hero-subtitle");
const studyLoop = document.querySelector("#study-loop");
const overviewGrid = document.querySelector("#overview-grid");
const modeSelector = document.querySelector("#mode-selector");
const modeDescription = document.querySelector("#mode-description");
const topicSearch = document.querySelector("#topic-search");
const topicList = document.querySelector("#topic-list");
const lessonDetail = document.querySelector("#lesson-detail");
const progressCopy = document.querySelector("#progress-copy");
const jumpToNextButton = document.querySelector("#jump-to-next");
const markCurrentTopicButton = document.querySelector("#mark-current-topic");

function buildTopicSearchText(topic) {
  const childText = topic.children
    .map((child) => `${child.title} ${child.summary} ${child.impact} ${child.quickCheck.question} ${child.quickCheck.answer}`)
    .join(" ");

  return `${topic.title} ${topic.summary} ${topic.sections
    .map((section) => `${section.heading} ${section.body}`)
    .join(" ")} ${topic.modeFocus.beginner} ${topic.modeFocus.intermediate} ${topic.modeFocus.advanced} ${childText}`.toLowerCase();
}

const searchableTopics = primerTopics.map((topic) => ({
  ...topic,
  searchText: buildTopicSearchText(topic),
}));

function loadProgress() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return;
    }

    const parsed = JSON.parse(raw);
    if (learnerModes.some((mode) => mode.id === parsed.activeMode)) {
      state.activeMode = parsed.activeMode;
    }

    if (searchableTopics.some((topic) => topic.id === parsed.selectedTopicId)) {
      state.selectedTopicId = parsed.selectedTopicId;
    }

    state.completedTopics = new Set(parsed.completedTopics ?? []);
    state.exerciseState = parsed.exerciseState ?? {};
  } catch {
    state.activeMode = learnerModes[0].id;
    state.selectedTopicId = searchableTopics[0].id;
    state.completedTopics = new Set();
    state.exerciseState = {};
  }
}

function saveProgress() {
  window.localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      activeMode: state.activeMode,
      selectedTopicId: state.selectedTopicId,
      completedTopics: [...state.completedTopics],
      exerciseState: state.exerciseState,
    })
  );
}

function getFilteredTopics() {
  if (!state.query) {
    return searchableTopics;
  }

  return searchableTopics.filter((topic) => topic.searchText.includes(state.query));
}

function getSelectedTopic() {
  return searchableTopics.find((topic) => topic.id === state.selectedTopicId) ?? searchableTopics[0];
}

function getMode() {
  return learnerModes.find((mode) => mode.id === state.activeMode) ?? learnerModes[0];
}

function getTopicExerciseKey(topicId, exerciseId) {
  return `${topicId}:${exerciseId}`;
}

function getCompletedExerciseCount() {
  return Object.values(state.exerciseState).filter((entry) => entry.completed).length;
}

function getTotalExerciseCount() {
  return searchableTopics.reduce((total, topic) => total + topic.exercises.length, 0);
}

function renderHero() {
  heroTitle.textContent = siteOverview.title;
  heroSubtitle.textContent = siteOverview.subtitle;
  studyLoop.innerHTML = siteOverview.studyLoop.map((step) => `<li>${step}</li>`).join("");

  const completedTopics = state.completedTopics.size;
  const totalTopics = searchableTopics.length;
  const completedExercises = getCompletedExerciseCount();
  const totalExercises = getTotalExerciseCount();
  const currentMode = getMode();

  overviewGrid.innerHTML = [
    { label: "Lessons", value: `${completedTopics}/${totalTopics}` },
    { label: "Exercises", value: `${completedExercises}/${totalExercises}` },
    { label: "Mode", value: currentMode.label },
    { label: "Audience", value: currentMode.audience },
  ]
    .map((item) => `<article class="stat-card"><p>${item.label}</p><strong>${item.value}</strong></article>`)
    .join("");
}

function renderModes() {
  const currentMode = getMode();
  modeSelector.innerHTML = "";

  learnerModes.forEach((mode) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `mode-chip ${mode.id === state.activeMode ? "active" : ""}`;
    button.innerHTML = `<span>${mode.label}</span><small>${mode.audience}</small>`;
    button.addEventListener("click", () => {
      state.activeMode = mode.id;
      saveProgress();
      renderApp();
    });
    modeSelector.appendChild(button);
  });

  modeDescription.textContent = currentMode.description;
}

function renderTopicList() {
  const filteredTopics = getFilteredTopics();

  if (!filteredTopics.some((topic) => topic.id === state.selectedTopicId) && filteredTopics.length) {
    state.selectedTopicId = filteredTopics[0].id;
    saveProgress();
  }

  progressCopy.textContent = `${state.completedTopics.size} of ${searchableTopics.length} lessons completed`;

  if (!filteredTopics.length) {
    topicList.innerHTML = '<p class="empty-state">No matching lessons. Try a broader search.</p>';
    return;
  }

  topicList.innerHTML = "";
  filteredTopics.forEach((topic, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `topic-item ${topic.id === state.selectedTopicId ? "active" : ""}`;
    button.innerHTML = `
      <span class="topic-item-index">${String(index + 1).padStart(2, "0")}</span>
      <span class="topic-item-copy">
        <strong>${topic.title}</strong>
        <small>${topic.summary}</small>
        <span class="topic-item-meta">${topic.children.length} subtopics · ${topic.exercises.length} exercises</span>
      </span>
      <span class="topic-status ${state.completedTopics.has(topic.id) ? "done" : ""}">${state.completedTopics.has(topic.id) ? "Done" : "Open"}</span>
    `;

    button.addEventListener("click", () => {
      state.selectedTopicId = topic.id;
      saveProgress();
      renderLessonDetail();
      renderTopicList();
    });

    topicList.appendChild(button);
  });
}

function createExerciseNode(topic, exercise) {
  const exerciseKey = getTopicExerciseKey(topic.id, exercise.id);
  const storedState = state.exerciseState[exerciseKey] ?? {};
  const wrapper = document.createElement("article");
  wrapper.className = "exercise-card";

  const modeNote = topic.modeFocus[state.activeMode];

  if (exercise.type === "multiple-choice") {
    const options = exercise.options
      .map((option, index) => {
        const selected = storedState.selectedIndex === index;
        const isCorrect = exercise.answer === index;
        const showResult = storedState.completed;
        const classNames = ["exercise-option"];

        if (selected) {
          classNames.push("selected");
        }

        if (showResult && isCorrect) {
          classNames.push("correct");
        }

        if (showResult && selected && !isCorrect) {
          classNames.push("incorrect");
        }

        return `<button type="button" class="${classNames.join(" ")}" data-option-index="${index}">${option}</button>`;
      })
      .join("");

    wrapper.innerHTML = `
      <div class="exercise-header">
        <p class="eyebrow">Quick check</p>
        <span class="exercise-status ${storedState.completed ? "done" : ""}">${storedState.completed ? "Answered" : "Try it"}</span>
      </div>
      <h3>${exercise.prompt}</h3>
      <p class="exercise-coach">Mode focus: ${modeNote}</p>
      <div class="exercise-options">${options}</div>
      <div class="exercise-feedback ${storedState.completed ? "visible" : ""}">
        <strong>${storedState.correct ? "Correct" : "Keep refining"}</strong>
        <p>${exercise.explanation}</p>
      </div>
    `;

    wrapper.querySelectorAll("[data-option-index]").forEach((optionButton) => {
      optionButton.addEventListener("click", () => {
        const selectedIndex = Number(optionButton.dataset.optionIndex);
        state.exerciseState[exerciseKey] = {
          selectedIndex,
          correct: selectedIndex === exercise.answer,
          completed: true,
        };
        saveProgress();
        renderHero();
        renderLessonDetail();
      });
    });

    return wrapper;
  }

  wrapper.innerHTML = `
    <div class="exercise-header">
      <p class="eyebrow">Short exercise</p>
      <span class="exercise-status ${storedState.completed ? "done" : ""}">${storedState.completed ? "Saved" : "Write a response"}</span>
    </div>
    <h3>${exercise.prompt}</h3>
    <p class="exercise-coach">Mode focus: ${modeNote}</p>
    <textarea class="exercise-textarea" rows="5" placeholder="Type your answer here...">${storedState.response ?? ""}</textarea>
    <div class="exercise-actions">
      <button type="button" class="primary-button reveal-guidance">Reveal coaching</button>
    </div>
    <div class="exercise-feedback ${storedState.revealed ? "visible" : ""}">
      <strong>Coaching</strong>
      <p>${exercise.guidance}</p>
    </div>
  `;

  const textarea = wrapper.querySelector("textarea");
  textarea.addEventListener("input", () => {
    state.exerciseState[exerciseKey] = {
      ...storedState,
      response: textarea.value,
      completed: textarea.value.trim().length > 0,
      revealed: state.exerciseState[exerciseKey]?.revealed ?? false,
    };
    saveProgress();
    renderHero();
  });

  wrapper.querySelector(".reveal-guidance").addEventListener("click", () => {
    const nextState = {
      ...(state.exerciseState[exerciseKey] ?? {}),
      response: textarea.value,
      completed: textarea.value.trim().length > 0,
      revealed: true,
    };
    state.exerciseState[exerciseKey] = nextState;
    saveProgress();
    renderHero();
    renderLessonDetail();
  });

  return wrapper;
}

function renderLessonDetail() {
  const topic = getSelectedTopic();
  state.selectedTopicId = topic.id;
  const currentMode = getMode();
  const isComplete = state.completedTopics.has(topic.id);
  const emptySubtopicsMarkup = topic.children.length
    ? ""
    : '<p class="empty-state">This lesson stands on its own, so move to the exercises below.</p>';

  lessonDetail.innerHTML = `
    <div class="lesson-header">
      <div>
        <p class="eyebrow">Current lesson</p>
        <h2>${topic.title}</h2>
        <p class="lesson-summary">${topic.summary}</p>
      </div>
      <div class="lesson-badges">
        <span class="badge">${topic.children.length} subtopics</span>
        <span class="badge">${topic.exercises.length} exercises</span>
        <span class="badge ${isComplete ? "badge-done" : ""}">${isComplete ? "Completed" : "In progress"}</span>
      </div>
    </div>

    <section class="mode-panel">
      <p class="eyebrow">${currentMode.label} focus</p>
      <p>${topic.modeFocus[state.activeMode]}</p>
    </section>

    <section class="section-grid">
      ${topic.sections
        .map(
          (section) => `
            <article class="content-card">
              <h3>${section.heading}</h3>
              <p>${section.body}</p>
            </article>
          `
        )
        .join("")}
    </section>

    <section class="subtopic-panel">
      <div class="section-title-row">
        <div>
          <p class="eyebrow">Related topics</p>
          <h3>Expand the nested concepts</h3>
        </div>
      </div>
      <div class="subtopic-grid ${topic.children.length ? "" : "empty"}">
        ${emptySubtopicsMarkup}
      </div>
    </section>

    <section class="exercise-panel">
      <div class="section-title-row">
        <div>
          <p class="eyebrow">Interactive practice</p>
          <h3>Answer before revealing the coaching</h3>
        </div>
      </div>
      <div id="exercise-list" class="exercise-list"></div>
    </section>
  `;

  const subtopicGrid = lessonDetail.querySelector(".subtopic-grid");
  topic.children.forEach((child) => {
    const details = document.createElement("details");
    details.className = "subtopic-card";
    details.innerHTML = `
      <summary>
        <span>${child.title}</span>
        <span class="summary-hint">Open</span>
      </summary>
      <p>${child.summary}</p>
      <p class="subtopic-impact"><strong>Design impact:</strong> ${child.impact}</p>
      <div class="subtopic-quick-check">
        <p><strong>Quick check:</strong> ${child.quickCheck.question}</p>
        <p class="subtopic-answer">${child.quickCheck.answer}</p>
      </div>
    `;
    subtopicGrid.appendChild(details);
  });

  const exerciseList = lessonDetail.querySelector("#exercise-list");
  topic.exercises.forEach((exercise) => {
    exerciseList.appendChild(createExerciseNode(topic, exercise));
  });

  markCurrentTopicButton.textContent = isComplete ? "Mark lesson incomplete" : "Mark lesson complete";
}

function toggleCurrentTopic() {
  const topic = getSelectedTopic();
  if (state.completedTopics.has(topic.id)) {
    state.completedTopics.delete(topic.id);
  } else {
    state.completedTopics.add(topic.id);
  }

  saveProgress();
  renderApp();
}

function jumpToNextLesson() {
  const filteredTopics = getFilteredTopics();
  const nextTopic = filteredTopics.find((topic) => !state.completedTopics.has(topic.id)) ?? filteredTopics[0] ?? searchableTopics[0];

  state.selectedTopicId = nextTopic.id;
  saveProgress();
  renderApp();
  document.querySelector(".lesson-panel")?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function renderApp() {
  renderHero();
  renderModes();
  renderTopicList();
  renderLessonDetail();
}

topicSearch.addEventListener("input", (event) => {
  state.query = event.target.value.trim().toLowerCase();
  renderTopicList();
});

markCurrentTopicButton.addEventListener("click", () => {
  toggleCurrentTopic();
});

jumpToNextButton.addEventListener("click", () => {
  jumpToNextLesson();
});

loadProgress();
renderApp();
