# Learn chapter reader

Book-style lesson study UI opened from the lesson hero **Learn** button.

## Entry points

- Lesson page hero: primary **Learn** button
  - Route: `src/routes/module/[module]/lesson/[lesson]/+page.svelte`
- Deep link: append `?learn=1` to any lesson URL to auto-open the reader

## Components

| Component | Role |
|-----------|------|
| `src/lib/components/LessonLearnReader.svelte` | Full-viewport modal reader with outline, scroll lock, focus trap, Esc to close |
| `src/lib/components/SelectionSearchPopup.svelte` | Text-selection popup inside the reader |

## Chapter content

- Hub: `src/lib/data/learnChapters.js` → `getLessonLearnChapter(lessonId)`
- AI/ML bodies: `src/lib/data/learnChapters/*.js` (one file per AI module)
- Lesson load attaches `learnChapter` in `src/routes/module/[module]/lesson/[lesson]/+page.js`
- **All 41 AI Engineer lessons** ship researched long-form chapters (math/ML foundations, DL, LLMs, RAG production patterns, agents, MLOps, safety, labs). Content is authored for the Learn reader and is separate from the short on-page lesson summaries.
- Module overview cards show a **Learn chapter** deep link (`?learn=1`) when a dedicated chapter exists

### Schema

Each chapter has `title`, `readingTime`, `premise`, `parts[]`, and `wrapUp`.

A part may include:

- `paragraphs` — long-form teaching prose
- `keyTerms` — term / definition chips
- `workedExample` — optional narration + code
- `checkYourself` — interactive prompt / reveal pairs
- `callout` — `tip` | `warning` | `interview`

### Coverage

- **AI Engineer flow:** dedicated detailed chapters for all modules / lessons
- **Other flows:** Learn still opens; the reader falls back to framing, lesson sections, deep knowledge, checklist, and pitfalls

## Search with AI (selection popup)

1. Select text inside the Learn reader content
2. A small popup appears near the selection
3. Choose a provider and click **Search**

Providers:

- **Perplexity** (default)
- Google
- DuckDuckGo

URLs are built with `buildSearchEngineUrls()` from `src/lib/llm/providers.js` and opened in a new tab. The last-chosen provider is stored in `localStorage` under `system-design-copilot-learn-search-engine`.

## Design notes

- No backend; static export friendly
- No cloud LLM call from the selection popup (link-out only)
- Prefer theme tokens (`--panel`, `--backdrop`, `--accent`, `--border`, `--shadow`)
- Keep Learn as the reading CTA; practice / labs stay as secondary lesson actions
