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
- Chapter bodies: `src/lib/data/learnChapters/*.js` (one file per module)
- Lesson load attaches `learnChapter` in `src/routes/module/[module]/lesson/[lesson]/+page.js`
- Dedicated researched long-form chapters ship for **AI/ML (41)**, **HLD (63)**, **LLD (26)**, and **DSA (27)** — separate from short on-page lesson summaries
- Module overview cards and the lesson runway show a **Learn chapter** deep link (`?learn=1`) when a dedicated chapter exists
- The reader shows **Part X of Y** progress, highlights the active outline item while scrolling, marks visited sections, and resumes the last section from `localStorage`
- Worked-example Python snippets are **runnable in place** (Run / Reset) through the shared ML Pyodide worker (`numpy` and friends)

### Schema

Each chapter has `title`, `readingTime`, `premise`, `parts[]`, and `wrapUp`.

A part may include:

- `paragraphs` — long-form teaching prose
- `keyTerms` — term / definition chips
- `workedExample` — optional narration + code
- `checkYourself` — interactive prompt / reveal pairs
- `callout` — `tip` | `warning` | `interview`

### Coverage

- **AI Engineer, HLD, LLD, DSA:** dedicated detailed chapters for all modules / lessons
- **Question-bank flow:** Learn still opens; the reader falls back to framing, lesson sections, deep knowledge, checklist, and pitfalls

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
