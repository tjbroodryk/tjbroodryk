---
name: barrio-design
description: TJ's design system, Barrio, for anything visual — charts, graphs, diagrams (architecture, flow, sequence, Mermaid), dashboards, Artifacts, HTML pages, SVGs, slides, matplotlib or plotly output. Load before writing any of them, alongside dataviz, artifact-design or artifact-diagramming; Barrio's tokens, type and rules replace their palettes, fonts and radii.
---

# Barrio

A terminal-first system: monospace everywhere, square corners, 1px ink rules,
bracketed labels, salsa/indigo colours on paper (light) and night (dark).

The source of truth is the Barrio design-system Artifact in TJ's Claude account
(https://claude.ai/artifact/3J59v7gydXhboDPbakDWKS), which also has live
component previews. This folder is a copy of it:

- `README.md`: Barrio's own guide: principles, colour jobs, type, layout,
  chart rules, voice. Read it before designing anything non-trivial.
- `tokens.json`: every token with its light and dark values and its usage note.
- `tokens.css`: CSS variables generated from `tokens.json`
  (`node tokens-css.mjs`), with dark mode as a redefinition of the same names.

If the Artifact has changed, pull its `project/tokens.json` and
`project/README.md` into this folder, regenerate `tokens.css`, and commit.

## Pages and artifacts

Paste `tokens.css` into the page's `<style>`, load the fonts
(`<link>` in `README.md`), and use `var(--…)` for every colour, size and gap.
No raw hex in component styles, and no per-component theme branches.

The rules people notice when they're missing:

- Every word in a mono face: `--font-display` (Martian Mono) for headings and
  big numbers, `--font-mono` (JetBrains Mono) for everything else. Tabular
  figures for numbers; ligatures off in code.
- Square: `--radius-0` everywhere. Panes are separated by 1px `--ink` rules,
  not shadows; `--shadow-pop` is only for floating layers.
- Section labels: 11px uppercase, 0.14em tracking, `--salsa` brackets and a
  muted count, e.g. `[ CHANGES ] 8`.
- Each colour has one job. Green (`--cilantro` text, `--cilantro-bright` fills;
  aliases `--live`, `--success`) is live, running, passing or done, and the `$`
  prompt. Orange (`--salsa` fills and 24px+ type, `--salsa-deep` small text,
  `--salsa-tint` rows; alias `--attention`) is needs-you and active. Red
  (`--chile`, `--chile-deep` on `--chile-tint`; alias `--error`) is errors and
  destructive actions only. Indigo (`--accent`) is links, focus and selection.
  `--ochre` is warning, always with a word or icon.
- `--ink-faint` is never text. `--pine` is a highlight, never a text colour.
- Voice is short, literal and lowercase where a terminal would be.

## Charts

`README.md` has the full chart rules; the short version:

- One series: `--cat-1` (jade green). Categories: `--cat-1` to `--cat-5` in
  fixed order, never cycled; a sixth folds into "other". Magnitude and
  heatmaps: the green `--seqg-1` to `--seqg-5`, or the indigo `--seq-1` to
  `--seq-5` when green would wrongly read as good (errors, latency). Polarity:
  the `--div-*` ramp.
- Never use a status colour (cilantro, chile, ochre, salsa as a state) as a
  series.
- Gridlines `--chart-grid`, baseline `--ink-faint`, axis text `--chart-axis`
  at 11px, values and legend text `--ink`. Series colour goes on marks, never
  on text.
- Bars start at zero with 2px `--radius-1` tops and a 2px gap; label only the
  value that matters (the latest or the peak). Lines are 2px.
- Titles in `--font-display`, the unit in a subtitle. A single big number is a
  stat tile, not a chart.
- One y-axis per chart; two series get a legend.

## Diagrams

`artifact-diagramming` decides what to draw and how to lay it out; Barrio
decides how it looks.

- Nodes: square boxes (`--radius-0`), `--surface` fill, 1px `--ink` border.
  Group frames and swimlanes: `--wash` fill with a 1px `--rule` border and a
  bracketed `label` title, e.g. `[ WORKER ]`.
- Text: `--font-mono`, `--ink` for node names, `--ink-muted` for notes and
  edge labels. Edge labels sit on a `--bg` knockout so lines don't cross text.
- Edges: 1px `--ink-muted` with small solid arrowheads; dashed for async or
  optional paths. The path being explained gets 2px `--accent`.
- Colour only for meaning, using the UI jobs: `--cilantro` live or healthy,
  `--salsa` needs attention, `--chile` failure, `--ochre` warning. Everything
  else stays ink on surface.
- Mermaid: set `theme: 'base'` and map `themeVariables` to the tokens
  (`primaryColor` surface, `primaryBorderColor` and `lineColor` ink/ink-muted,
  `fontFamily` the mono stack), and redefine them for night, rather than using
  Mermaid's built-in themes.
- No drop shadows, gradients or rounded nodes.

## Other tools

For tools that can't read CSS (matplotlib, pptx), take hex values from
`tokens.json`: `light` for paper, `dark` for night.

An SVG shown through `<img>`, such as one in a GitHub README, can still follow
the viewer's theme: put the variables and a `prefers-color-scheme` block in a
`<style>` inside the SVG. External fonts don't load there, so it falls back to
the next face in the mono stack. `render.mjs` in `tjbroodryk/tjbroodryk` does
this.
