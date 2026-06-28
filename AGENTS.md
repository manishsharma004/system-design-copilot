# system-design-copilot

Mobile-friendly interview-prep web app built with SvelteKit and exported as a fully static site (deployed to GitHub Pages). It is a browser-only app with no backend or database; persistence is via browser IndexedDB and all code execution runs in-browser via WebAssembly (Pyodide for Python, YoWASP clang + Wasmer WASI for C/C++, CheerpJ for Java).

## Cursor Cloud specific instructions

- Package manager: use `npm` (Node v22 works; `npm install` is the install step). A `bun.lock` is also present but Bun is not installed in this environment, so prefer npm. The update script already runs `npm install` on startup.
- Standard commands live in `package.json` (`dev`/`start`, `build`, `preview`, `check`, `test`) and `README.md`; reference those rather than duplicating.
- Run/dev: `npm run dev` (alias `npm start`) serves on `0.0.0.0:4173`. The app is mounted under the base path `/system-design-copilot`, so the URL is `http://localhost:4173/system-design-copilot/` (the bare `/` 404s — this is expected, not a bug).
- Tests: `npm test` runs the Node native test runner over `tests/*.test.js` (32 tests, all pass).
- Lint/type-check: `npm run check` (svelte-check). NOTE: this currently reports a large number of pre-existing TypeScript/JSDoc errors that exist on a clean checkout; they are not caused by environment setup. Do not treat a non-zero `check` result as an environment failure.
- WASM runtimes (Pyodide/clang/Java) are loaded lazily in the browser on first code run and can take 10-30s the first time; no server-side setup is required. `vite.config.js` intentionally excludes `@yowasp/clang` and `@wasmer/wasi` from dep optimization.
- The optional in-app LLM assistant is configured at runtime in the browser (user supplies their own provider/key); no setup needed to run the rest of the app.
