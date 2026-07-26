#!/usr/bin/env python3
"""Emit JS modules from scripts/hld_lab_content.py for the SvelteKit app."""
from __future__ import annotations

import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "scripts"))

from hld_lab_content import build_all  # noqa: E402

OUT = ROOT / "src/lib/data"
OUT.mkdir(parents=True, exist_ok=True)


def emit_js_modules(modules: list) -> str:
    return (
        "/** Exhaustive HLD learning expansion labs (data storage, security, distributed systems).\n"
        " * Source of truth: scripts/hld_lab_content.py — regenerate with\n"
        " * `python3 scripts/build_hld_exhaustive_labs.py`.\n"
        " */\n"
        f"export const rawHldExhaustiveLabModules = {json.dumps(modules, indent=2)};\n"
    )


def emit_js_interactive(interactive: dict) -> str:
    return (
        "/** Interactive topic labs for exhaustive HLD labs.\n"
        " * Source of truth: scripts/hld_lab_content.py — regenerate with\n"
        " * `python3 scripts/build_hld_exhaustive_labs.py`.\n"
        " */\n"
        "function caseStudy(input) {\n"
        "  const { title, prompt, steps, metrics } = input;\n"
        "  return {\n"
        "    title,\n"
        "    prompt,\n"
        "    context: prompt,\n"
        "    steps: steps.map((step, index) => ({\n"
        "      title: step.title,\n"
        "      detail: step.detail,\n"
        "      phase: `${index + 1}. ${step.title}`,\n"
        "      decision: step.title,\n"
        "      why: step.detail,\n"
        "      whatIf:\n"
        "        step.whatIf ??\n"
        "        'Skipping this step makes the design harder to defend because the trade-off stays implicit.'\n"
        "    })),\n"
        "    metrics: metrics ?? []\n"
        "  };\n"
        "}\n"
        "\n"
        f"const raw = {json.dumps(interactive, indent=2)};\n"
        "\n"
        "/** @type {Record<string, any>} */\n"
        "export const hldExhaustiveLabInteractive = Object.fromEntries(\n"
        "  Object.entries(raw).map(([id, lab]) => [\n"
        "    id,\n"
        "    {\n"
        "      ...lab,\n"
        "      caseStudy: caseStudy(lab.caseStudy)\n"
        "    }\n"
        "  ])\n"
        ");\n"
    )


def emit_js_deep(deep_map: dict) -> str:
    return (
        "/** Deep knowledge essays for exhaustive HLD labs.\n"
        " * Source of truth: scripts/hld_lab_content.py — regenerate with\n"
        " * `python3 scripts/build_hld_exhaustive_labs.py`.\n"
        " */\n"
        "const teachingBody = (...paragraphs) => paragraphs.join('\\n\\n');\n"
        "\n"
        "function revive(entry) {\n"
        "  return {\n"
        "    insights: entry.insights.map((insight) => ({\n"
        "      heading: insight.heading,\n"
        "      body: teachingBody(...insight.bodyParagraphs)\n"
        "    })),\n"
        "    references: entry.references\n"
        "  };\n"
        "}\n"
        "\n"
        f"const raw = {json.dumps(deep_map, indent=2)};\n"
        "\n"
        "/** @type {Record<string, any>} */\n"
        "export const hldExhaustiveLabDeepKnowledge = Object.fromEntries(\n"
        "  Object.entries(raw).map(([id, entry]) => [id, revive(entry)])\n"
        ");\n"
    )


def emit_js_sims(sims: dict) -> str:
    return (
        "/** Simulation blueprints for exhaustive HLD lab modules.\n"
        " * Source of truth: scripts/hld_lab_content.py — regenerate with\n"
        " * `python3 scripts/build_hld_exhaustive_labs.py`.\n"
        " */\n"
        f"export const hldExhaustiveLabSimBlueprints = {json.dumps(sims, indent=2)};\n"
    )


def main() -> None:
    modules, interactive, deep_map, sims = build_all()
    (OUT / "hldExhaustiveLabModules.js").write_text(emit_js_modules(modules))
    (OUT / "hldExhaustiveLabInteractive.js").write_text(emit_js_interactive(interactive))
    (OUT / "hldExhaustiveLabDeepKnowledge.js").write_text(emit_js_deep(deep_map))
    (OUT / "hldExhaustiveLabSimBlueprints.js").write_text(emit_js_sims(sims))
    lesson_count = sum(len(module["lessons"]) for module in modules)
    print(
        "generated",
        {
            "modules": len(modules),
            "lessons": lesson_count,
            "interactive": len(interactive),
            "deep": len(deep_map),
            "sims": len(sims),
        },
    )


if __name__ == "__main__":
    main()
