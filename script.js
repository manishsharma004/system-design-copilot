import { courseOverview, courseWeeks, toolkitPrompts, tracks } from "./courseData.js";

const STORAGE_KEY = "system-design-copilot-progress";

const state = {
  query: "",
  activeTrack: "All",
  deepMode: true,
  completedLessons: new Set(),
};

const overviewGrid = document.querySelector("#overview-grid");
const studyRhythm = document.querySelector("#study-rhythm");
const trackFilters = document.querySelector("#track-filters");
const weeksContainer = document.querySelector("#weeks-container");
const toolkitGrid = document.querySelector("#toolkit-grid");
const progressCopy = document.querySelector("#progress-copy");
const lessonSearch = document.querySelector("#lesson-search");
const deepModeButton = document.querySelector("#toggle-deep-mode");
const jumpToNextButton = document.querySelector("#jump-to-next");
const lessonTemplate = document.querySelector("#lesson-template");

function generateLessonId(weekNumber, dayLabel) {
  return `${weekNumber}-${dayLabel.toLowerCase().replace(/\s+/g, "-")}`;
}

const allLessons = courseWeeks.flatMap((week) =>
  week.lessons.map((lesson) => ({
    ...lesson,
    week: week.week,
    track: week.track,
    weekTitle: week.title,
    id: generateLessonId(week.week, lesson.day),
    searchText: `${lesson.title} ${lesson.outcome} ${lesson.depth} ${lesson.advancedNote} ${lesson.checkpoint}`.toLowerCase(),
  }))
);

function loadProgress() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return;
    }

    const parsed = JSON.parse(raw);
    state.deepMode = parsed.deepMode ?? true;
    state.completedLessons = new Set(parsed.completedLessons ?? []);
  } catch {
    state.deepMode = true;
    state.completedLessons = new Set();
  }
}

function saveProgress() {
  window.localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      deepMode: state.deepMode,
      completedLessons: [...state.completedLessons],
    })
  );
}

function renderOverview() {
  const totalLessons = allLessons.length;
  const completedCount = state.completedLessons.size;

  overviewGrid.innerHTML = "";
  [
    { label: "Weeks", value: courseOverview.duration },
    { label: "Lessons", value: `${totalLessons} guided sessions` },
    { label: "Cadence", value: courseOverview.cadence },
    { label: "Completed", value: `${completedCount}/${totalLessons}` },
  ].forEach((item) => {
    const card = document.createElement("article");
    card.className = "stat-card";
    card.innerHTML = `<p>${item.label}</p><strong>${item.value}</strong>`;
    overviewGrid.appendChild(card);
  });

  studyRhythm.innerHTML = `
    <p class="study-rhythm-title">Recommended daily rhythm</p>
    <ol>
      ${courseOverview.dailyFlow.map((step) => `<li>${step}</li>`).join("")}
    </ol>
  `;
}

function renderTrackFilters() {
  const filterOptions = ["All", ...tracks];
  trackFilters.innerHTML = "";

  filterOptions.forEach((track) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `chip ${state.activeTrack === track ? "active" : ""}`;
    button.textContent = track;
    button.addEventListener("click", () => {
      state.activeTrack = track;
      renderWeeks();
      renderTrackFilters();
    });
    trackFilters.appendChild(button);
  });
}

function lessonMatches(lesson, weekTrack) {
  const matchesTrack = state.activeTrack === "All" || state.activeTrack === weekTrack;
  const matchesQuery = !state.query || lesson.searchText.includes(state.query);
  return matchesTrack && matchesQuery;
}

function toggleLesson(id) {
  if (state.completedLessons.has(id)) {
    state.completedLessons.delete(id);
  } else {
    state.completedLessons.add(id);
  }

  saveProgress();
  renderOverview();
  renderWeeks();
}

function renderWeeks() {
  weeksContainer.innerHTML = "";

  courseWeeks.forEach((week) => {
    const visibleLessons = week.lessons.filter((lesson) => lessonMatches(lesson, week.track));

    if (!visibleLessons.length) {
      return;
    }

    const completedInWeek = visibleLessons.filter((lesson) =>
      state.completedLessons.has(generateLessonId(week.week, lesson.day))
    ).length;

    const weekCard = document.createElement("section");
    weekCard.className = "week-card";
    weekCard.innerHTML = `
      <div class="week-card-header">
        <div>
          <p class="week-kicker">Week ${week.week} · ${week.track}</p>
          <h3>${week.title}</h3>
          <p class="week-focus">${week.focus}</p>
        </div>
        <div class="week-progress">
          <strong>${completedInWeek}/${visibleLessons.length}</strong>
          <span>done</span>
        </div>
      </div>
      <div class="lesson-list"></div>
    `;

    const lessonList = weekCard.querySelector(".lesson-list");

    visibleLessons.forEach((lesson) => {
      const lessonNode = lessonTemplate.content.firstElementChild.cloneNode(true);
      const lessonId = generateLessonId(week.week, lesson.day);
      const completed = state.completedLessons.has(lessonId);
      lessonNode.dataset.lessonId = lessonId;
      lessonNode.classList.toggle("done", completed);

      lessonNode.querySelector(".lesson-day").textContent = lesson.day;
      lessonNode.querySelector(".lesson-title").textContent = lesson.title;
      lessonNode.querySelector(".lesson-outcome").textContent = lesson.outcome;
      lessonNode.querySelector(".lesson-depth").textContent = lesson.depth;
      lessonNode.querySelector(".lesson-advanced").textContent = lesson.advancedNote;
      lessonNode.querySelector(".lesson-checkpoint").textContent = lesson.checkpoint;

      const tags = lessonNode.querySelector(".lesson-tags");
      [week.track, `Week ${week.week}`, completed ? "Complete" : "In progress"].forEach((tag) => {
        const pill = document.createElement("span");
        pill.className = "tag";
        pill.textContent = tag;
        tags.appendChild(pill);
      });

      const drillList = lessonNode.querySelector(".lesson-drills");
      lesson.drills.forEach((drill) => {
        const item = document.createElement("li");
        item.textContent = drill;
        drillList.appendChild(item);
      });

      const toggle = lessonNode.querySelector(".lesson-toggle");
      toggle.textContent = completed ? "Completed" : "Mark done";
      toggle.addEventListener("click", () => toggleLesson(lessonId));

      lessonList.appendChild(lessonNode);
    });

    weeksContainer.appendChild(weekCard);
  });

  const completedCount = state.completedLessons.size;
  progressCopy.textContent = `${completedCount} of ${allLessons.length} lessons completed`;
  document.body.classList.toggle("deep-mode-off", !state.deepMode);
  deepModeButton.textContent = `Deep mode: ${state.deepMode ? "On" : "Off"}`;
}

function renderToolkit() {
  toolkitGrid.innerHTML = "";
  toolkitPrompts.forEach((prompt) => {
    const card = document.createElement("article");
    card.className = "toolkit-card";
    card.innerHTML = `<h3>${prompt.title}</h3><p>${prompt.body}</p>`;
    toolkitGrid.appendChild(card);
  });
}

function jumpToNextLesson() {
  const nextLesson = allLessons.find((lesson) => !state.completedLessons.has(lesson.id));
  if (!nextLesson) {
    window.scrollTo({ top: 0, behavior: "smooth" });
    return;
  }

  const selector = `[data-lesson-id="${nextLesson.id}"]`;
  let lessonElement = document.querySelector(selector);
  if (!lessonElement && (state.activeTrack !== "All" || state.query)) {
    state.activeTrack = "All";
    state.query = "";
    lessonSearch.value = "";
    renderTrackFilters();
    renderWeeks();
    lessonElement = document.querySelector(selector);
  }

  if (lessonElement) {
    lessonElement.scrollIntoView({ behavior: "smooth", block: "center" });
  }
}

lessonSearch.addEventListener("input", (event) => {
  state.query = event.target.value.trim().toLowerCase();
  renderWeeks();
});

deepModeButton.addEventListener("click", () => {
  state.deepMode = !state.deepMode;
  saveProgress();
  renderWeeks();
});

jumpToNextButton.addEventListener("click", () => {
  jumpToNextLesson();
});

loadProgress();
renderOverview();
renderTrackFilters();
renderWeeks();
renderToolkit();
