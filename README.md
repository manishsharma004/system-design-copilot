
# system-design-copilot

Mobile-friendly system design interview prep material built with SvelteKit and exported as a static site. The lesson workspace includes a structured in-browser editor, reveal-on-demand sample answers, Mermaid-powered interactive diagrams, decision labs, and a browser-only simulation lab.

See [IMPROVEMENTS_PLAN.md](./IMPROVEMENTS_PLAN.md) for the active product roadmap.

## Run locally

Requires **Node.js 20.19+** (see `.nvmrc`).

```bash
npm install
npm start
```

Then open **http://localhost:4173/system-design-copilot/** in a browser.

(`npm` or `bun` both work; CI uses `npm ci`.)

## Build static output

```bash
npm run build
```

The generated static site is written to `dist/` for GitHub Pages (base path `/system-design-copilot`).

## Validate

```bash
npm run check
npm test
```

## Attribution

This project adapts selected diagrams and topic framing from [The System Design Primer](https://github.com/donnemartin/system-design-primer) by Donne Martin under [CC BY 4.0](http://creativecommons.org/licenses/by/4.0/).
