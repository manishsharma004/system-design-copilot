# system-design-copilot

Mobile-friendly interview-prep web app built with SvelteKit and exported as a fully static site (deployed to GitHub Pages). It is a browser-only app with no backend or database; persistence is via browser IndexedDB and all code execution runs in-browser via WebAssembly (Pyodide for Python, YoWASP clang + Wasmer WASI for C/C++, CheerpJ for Java).

## Project principles

Keep this repo **light and small**:

- **Minimize dependencies.** Do not add packages unless they clearly earn their weight. Prefer built-in browser APIs, existing project utilities, and `app.css` over new libraries.
- **Minimize custom code.** Prefer plain HTML in Svelte templates plus semantic CSS classes (`pill`, `action-link`, `panel`, etc.) defined in `app.css`. Do **not** add Svelte UI wrapper components around a design system — that creates tech debt without reducing markup.
- **Minimize user-facing code paths.** One obvious way to do things; avoid parallel abstractions for the same UI pattern.
- **Preserve the dark theme.** The app uses a fixed dark palette (purple accent `#696cff`, surfaces `#232333` / `#2b2c40`). Do not switch to light mode or replace these colors without an explicit request.

## Docs

Product and feature docs live in the root [`docs/`](docs/) folder. Start there before inventing parallel notes.

| Doc | Topic |
|-----|--------|
| [`docs/learn-chapter-reader.md`](docs/learn-chapter-reader.md) | Learn button, book-style chapter modal, AI/ML chapter data, selection Search with AI |
| [`docs/ai-engineer-update-plan.md`](docs/ai-engineer-update-plan.md) | Phased AI Engineer UX, content, and interactive learning roadmap |
| [`docs/cursor/`](docs/cursor/) | Agent-maintained architecture snapshots (routes, data, components, LLM, etc.) |

Update the matching root doc when you change user-facing Learn / chapter behavior. Prefer documenting durable product behavior in `docs/` over adding narrow unit tests for UI chrome.

## Cursor Cloud specific instructions

- Package manager: use `npm` (Node v22 works; `npm install` is the install step). A `bun.lock` is also present but Bun is not installed in this environment, so prefer npm. The update script already runs `npm install` on startup.
- Standard commands live in `package.json` (`dev`/`start`, `build`, `preview`, `check`, `test`) and `README.md`; reference those rather than duplicating.
- Run/dev: `npm run dev` (alias `npm start`) serves on `0.0.0.0:4173`. The app is mounted under the base path `/system-design-copilot`, so the URL is `http://localhost:4173/system-design-copilot/` (the bare `/` 404s — this is expected, not a bug).
- Tests: `npm test` runs the Node native test runner over `tests/*.test.js` (32 tests, all pass).
- Lint/type-check: `npm run check` (or `bun run check`) runs svelte-check with `checkJs: true` and `noImplicitAny: false`. It should exit 0; remaining output is mostly a11y/unused-CSS warnings in IDE components.
- WASM runtimes (Pyodide/clang/Java) are loaded lazily in the browser on first code run and can take 10-30s the first time; no server-side setup is required. `vite.config.js` intentionally excludes `@yowasp/clang` and `@wasmer/wasi` from dep optimization.
- The optional in-app LLM assistant is configured at runtime in the browser (user supplies their own provider/key); no setup needed to run the rest of the app.

<!-- ASTRYX:START -->
## Astryx (reference only — SvelteKit)

This project is **SvelteKit**, not React. Astryx (`@astryxdesign/core`) ships React components; **do not** add React, runtime Astryx packages, or custom Svelte wrappers that mirror Astryx components.

Use Astryx as a **design reference** via the CLI (dev dependency):

```bash
npx astryx component Button    # props, patterns, accessibility
npx astryx docs tokens         # spacing, color, radius naming
npx astryx search "<query>"    # find relevant guidance
```

When building or changing UI:

1. Check `npx astryx component <Name>` for the intended pattern.
2. Implement with **plain markup** and existing classes in `src/app.css` (`pill`, `action-link`, `hero-card`, `eyebrow`, etc.).
3. Reuse CSS variables from `:root` in `app.css` (`--accent`, `--panel`, `--border`, …) — do not introduce parallel token systems.
4. IDE-specific chrome (Monaco, practice panes) may keep scoped component CSS; still use the shared dark palette.

Do **not** install `@astryxdesign/core` or theme packages unless there is a deliberate, approved reason. Keep bloat out of `dependencies`.
<!-- ASTRYX:END -->
