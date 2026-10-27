---
name: crucible-design
description: TJ's design system (Crucible's) for anything visual — charts, graphs, dashboards, Artifacts, HTML pages, SVGs, slides, matplotlib or plotly output. Load before writing any of them, alongside dataviz or artifact-design; its tokens replace their palettes, fonts and radii.
---

# Crucible design system

`tokens.css` next to this file is copied from Crucible
(`coterahq/crucible`, `packages/ui/src/styles/tokens.css`). `charts.css` adds
series colours Crucible doesn't have. Both live in `tjbroodryk/tjbroodryk`
under `design/`; change them there, not in a page.

## Pages and artifacts

Paste `tokens.css` at the top of the page's `<style>` and use `var(--…)` for
every colour, radius and gap. No raw hex in component styles. Dark mode is
already in the file as a redefinition of the same names; never branch a
component on theme.

- Body: `--ground` background, `--ink` text, `--font` at 14px, line-height 1.5.
  Numbers, code and IDs in `--mono`.
- Secondary text `--ink-muted`; hints, timestamps and axis labels `--ink-faint`.
- Panels: `--surface`, 1px `--line` border, `--radius`. Optional header row with
  10px 14px padding, weight 600 and a `--line` bottom border; body padding 14px.
  Wells and code blocks use `--surface-sunk`.
- Controls: `--radius-sm`, 6px 12px padding, weight 500. Default button is
  `--surface`/`--ink`/`--line`; the primary one is `--accent` with
  `--accent-ink` text; destructive is `--danger` with white text.
- Pills and badges: 999px radius, 1px border and text in the tone colour, a
  6px dot before the label.
- Spacing comes from `--gap` (12px) and `--gap-lg` (20px).
- Flat: borders, not shadows or gradients.
- Wide content scrolls inside its own panel; the page never scrolls sideways.

Colour carries meaning: `--accent` is running, selected or a link; `--ok` is
success; `--warn` is waiting or needs attention; `--danger` is an error;
`--ink-faint` is cancelled or disabled.

## Charts

Follow the dataviz skill for chart form, marks and interaction, with these
colours instead of its palette:

- One series: `--accent`. Categories: `--series-1` to `--series-5` in order;
  fold anything past five into "other" in `--ink-faint`.
- Use `--ok`/`--warn`/`--danger` only when colour encodes good/bad or status,
  and never in the same chart as series colours.
- Gridlines, axes and zero or empty marks: `--line`. Tick labels: `--ink-faint`
  at 12px in `--mono`. Titles: `--ink`, weight 600.
- Trend or average lines: `--ink-muted`, 1.5px, over the bars or points.

For tools that can't read CSS (matplotlib, plotly images, pptx), take hex
values from the light block of `tokens.css` and `charts.css`, or the dark
blocks if the output only ever shows on a dark background.

An SVG embedded with `<img>`, such as one in a GitHub README, can still follow
the viewer's theme: put the variables and a `prefers-color-scheme` block in a
`<style>` inside the SVG. `render.mjs` in `tjbroodryk/tjbroodryk` does this.
