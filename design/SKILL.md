---
name: barrio-design
description: TJ's design system, Barrio, for anything visual — charts, graphs, diagrams (architecture, flow, sequence, Mermaid), dashboards, Artifacts, HTML pages, SVGs, slides, matplotlib or plotly output. Load before writing any of them, alongside dataviz, artifact-design or artifact-diagramming; Barrio's tokens, type and rules replace their palettes, fonts and radii.
---

# Barrio

A terminal-first system with soft edges: monospace everywhere, bracketed
labels and a `$` prompt, inside rounded cards with warm borders and light
shadows. Salsa/indigo colours on paper (light) and night (dark).

The source of truth is the Barrio design-system Artifact in TJ's Claude account
(https://claude.ai/artifact/3J59v7gydXhboDPbakDWKS), which also has live
component previews. This folder is a copy of it:

- `README.md`: Barrio's own guide: principles, colour jobs, type, layout,
  chart rules, voice. Read it before designing anything non-trivial.
- `tokens.json`: every token with its light and dark values and its usage note.
- `tokens.css`: CSS variables generated from `tokens.json`
  (`node tokens-css.mjs`), with dark mode as a redefinition of the same names.

The Diagrams section below copies the Artifact's Diagram component
(`project/components/Diagram/README.md`); its live preview is the example to
match.

If the Artifact has changed, pull its `project/tokens.json`,
`project/README.md` and the Diagram component's README into this folder and
this file, regenerate `tokens.css`, and commit.

## Pages and artifacts

Paste `tokens.css` into the page's `<style>`, load the fonts
(`<link>` in `README.md`), and use `var(--…)` for every colour, size and gap.
No raw hex in component styles, and no per-component theme branches.

The rules people notice when they're missing:

- Every word in a mono face: `--font-display` (Martian Mono) for headings and
  big numbers, `--font-mono` (JetBrains Mono) for everything else. Tabular
  figures for numbers; ligatures off in code.
- Soft corners: `--radius-sm` (4px) for badges, chips, inputs and bar tops;
  `--radius-md` (6px) for buttons, list rows, tooltips and diagram nodes;
  `--radius-lg` (10px) for cards, panes and dialogs. Nothing is square.
- Borders are 1px warm `--edge`, never hard `--ink`; `--edge-strong` on hover,
  selection and dashed groups; `--rule` for hairlines inside a card.
- Cards: `--surface`, 1px `--edge`, `--radius-lg`, `--shadow-sm`, `--space-4`
  padding. Hover and selection step up to `--shadow-md`; only floating layers
  (palette, dialogs, tooltips) get `--shadow-pop`.
- Tint, then outline: what needs to stand out gets a tinted fill with a
  `--stroke-node` (1.5px) border in the same hue (`--accent-tint` +
  `--accent`, `--cilantro-tint` + `--cilantro`). Dashed means outside or
  optional.
- The selected list row is a `--radius-md` box with `--accent-tint` fill and an
  `--accent` border; the hovered row gets `--wash`.
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
- Bars start at zero with `--radius-sm` (4px) tops and a 2px gap; label only
  the value that matters (the latest or the peak). Lines are 2px.
- Chart cards are standard cards (`--radius-lg`, `--edge`, `--shadow-sm`).
  Tooltips: `--surface`, `--radius-md`, `--edge`, `--shadow-pop`, 12px text.
- Titles in `--font-display`, the unit in a subtitle. A single big number is a
  stat tile, not a chart.
- One y-axis per chart; two series get a legend.

## Diagrams

`artifact-diagramming` decides what to draw and how to lay it out; Barrio
decides how it looks.

Architecture and sequence diagrams: soft rounded nodes, mono labels, three
kinds of arrow, and a legend underneath. Draw them as SVG on the tokens; the
Diagram preview in the Artifact is the reference.

- **Nodes** are `--radius-md` boxes, about 60px tall: a 13px semibold name over
  an 11px `--ink-muted` detail line (fields, methods, paths). Nothing else goes
  in a box.
  - Plain (existing code): `--surface` fill, 1px `--edge`, a faint drop shadow.
  - New or changed (the subject): `--accent-tint` fill, `--stroke-node`
    `--accent` border, detail line in `--accent`.
  - Data (tables, caches, stores): `--cilantro-tint` fill, `--stroke-node`
    `--cilantro` border.
  - Outside the app (another package, service or vendor): `--surface` fill,
    `--stroke-node` dashed `--accent`, name in `--accent`.
- **Groups** are dashed `--edge-strong` boxes at `--radius-lg`, no fill, with a
  small `--ink-muted` label above the top-left corner ("Unchanged for a new
  driver").
- **Arrows** are 1.5px with small filled heads: solid `--ink` = calls, dashed
  `--ink-muted` = returns, solid `--cilantro` = reads or writes the database.
  Route at right angles. Labels sit beside the line in 11px mono, `--ink`,
  except `--cilantro` on the green arrows. A constraint is written on its
  edge verbatim (`ON DELETE SET NULL`).
- Notes that aren't nodes (`defined in code, no rows`) are 11–12px
  `--ink-muted` text near the node, never boxed.
- **Legend**: every diagram ends with one, under a 1px dashed `--rule`, naming
  each arrow and node style it uses with a small swatch of the real thing.
- **Sequence diagrams**: participants are nodes across the top, outside
  systems last; lifelines are dashed `--rule`; steps are numbered in `--accent`
  600 at the start of the call; alternative branches sit in dashed
  `--edge-strong` boxes split by a dashed `--rule`, each part labelled with its
  condition ("tools_schema_cache set" / "no cache").
- Mermaid can't draw all of this. If you must use it, set `theme: 'base'`,
  map `themeVariables` to the tokens (`fontFamily` the mono stack), add a
  `classDef` per node kind (`fill`, `stroke`, `stroke-width`,
  `stroke-dasharray`, `rx:6,ry:6`), and redefine the variables for night.
- No gradients, and no colour without a legend entry.

## Other tools

For tools that can't read CSS (matplotlib, pptx), take hex values from
`tokens.json`: `light` for paper, `dark` for night.

An SVG shown through `<img>`, such as one in a GitHub README, can still follow
the viewer's theme: put the variables and a `prefers-color-scheme` block in a
`<style>` inside the SVG. External fonts don't load there, so it falls back to
the next face in the mono stack. `render.mjs` in `tjbroodryk/tjbroodryk` does
this.
