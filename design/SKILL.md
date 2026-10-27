---
name: barrio-design
description: TJ's design system, Barrio, for anything visual — charts, graphs, dashboards, Artifacts, HTML pages, SVGs, slides, matplotlib or plotly output. Load before writing any of them, alongside dataviz or artifact-design; Barrio's tokens, type and chart rules replace their palettes, fonts and radii.
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
- Section labels: 11px uppercase, 0.14em tracking, in brackets with a muted
  count, e.g. `[ CHANGES ] 8`.
- `--accent` (indigo) is interaction and live state. `--salsa` is for what needs
  a person, and only as fills or 24px+ type; small red text is `--salsa-deep`.
- `--ink-faint` is never text. `--pine` is a highlight, never a text colour.
- Voice is short, literal and lowercase where a terminal would be.

## Charts

`README.md` has the full chart rules; the short version:

- One series: `--cat-1`. Categories: `--cat-1` to `--cat-5` in fixed order,
  never cycled; a sixth folds into "other". Magnitude: `--seq-1` to `--seq-5`.
  Polarity: the `--div-*` ramp.
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

For tools that can't read CSS (matplotlib, pptx), take hex values from
`tokens.json`: `light` for paper, `dark` for night.

An SVG shown through `<img>`, such as one in a GitHub README, can still follow
the viewer's theme: put the variables and a `prefers-color-scheme` block in a
`<style>` inside the SVG. External fonts don't load there, so it falls back to
the next face in the mono stack. `render.mjs` in `tjbroodryk/tjbroodryk` does
this.
