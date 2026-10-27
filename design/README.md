# Barrio

A terminal-first design system for developer tools and the charts they produce. The colours come from three hand-drawn taco posters: salsa-red lettering on cream paper in pale pine frames, with the line work in indigo, chile and cilantro. Everything else comes from the terminal: monospaced type, square corners, 1px ink rules, bracketed labels.

Barrio is used by **Worker** (code review and worktrees for Claude) and by anything that charts data next to it.

## Principles

- **Mono all the way down.** Every word is set in a monospace face. Martian Mono for display, JetBrains Mono for everything else. Numbers line up because every glyph is the same width.
- **Square.** Corners are `radius-0`. The only rounding is on chart data-ends (`radius-1`) and line markers (`radius-dot`).
- **Ruled, not raised.** Panes are separated by 1px `ink` rules. Shadows (`shadow-pop`) are only for things that float: the command palette, menus, dialogs, tooltips.
- **Each colour has one job.** Green (`cilantro`) means alive or done: Claude working, passing checks, resolved threads, the terminal prompt. Orange (`salsa`) means look here: needs-you, inbox counts, the active tab, label brackets, big display type. Red (`chile`) means something broke or is about to be destroyed, and nothing else. Indigo (`accent`) is the interaction colour: links, focus, selection.
- **Labels in brackets.** Section labels are uppercase `label` style with `salsa` brackets and a muted count: `[ CHANGES ] 8`.
- **Two themes, same ink.** Paper (light) is the default. Night (dark) swaps the ground for the poster ink and lifts every hue so it still reads.

## Colour

| Job | Token | Notes |
|---|---|---|
| Ground | `bg` | Paper `#F4EEE4` / Night `#16152A` |
| Panes, cards, plot areas | `surface` | One step up from the ground |
| Toolbars, headers, hover | `wash` | Text on wash is `ink` or `ink-muted` only |
| Highlight | `pine` | The frames. Current line, search hit. Never text |
| Text and rules | `ink`, `ink-muted` | 4.5:1 or better on bg, surface and wash in both themes |
| Links, focus, selection | `accent`, `accent-tint` | Indigo |
| Live, success, done | `cilantro` text, `cilantro-bright` fills, `cilantro-tint` | Green. Claude working, passing checks, resolved, the `$` prompt (`live`, `success`) |
| Needs you, active | `salsa` fills, `salsa-deep` text, `salsa-tint` rows | Orange. Inbox counts, active tab underline, label brackets. Salsa is 3.5:1 on paper: large type and fills only (`attention`) |
| Errors only | `chile`, `chile-deep` text on `chile-tint` | Red. Failing checks, error banners, deleted lines, destructive buttons (`error`) |
| Warning | `ochre` | With an icon or a word, never colour alone |

**Do:** show live and done in green; put small orange text in `salsa-deep`; use `ink` for the solid primary button; give every focusable element a 2px `focus` ring.
**Don't:** use red for anything but errors and destruction; put body text on `pine`; use `salsa` for small text; use a status colour as a chart series.

## Type

Load both faces from Google Fonts:

```html
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:ital,wght@0,400;0,500;0,600;0,700;1,400&family=Martian+Mono:wght@400;600;700;800&display=swap">
```

- **Martian Mono** (`--font-display`): headings, stat numbers, the name on a cover. 600–800 weight. Use with restraint: one display line per screen region.
- **JetBrains Mono** (`--font-mono`): body, UI, code, labels. Turn ligatures off in code (`font-variant-ligatures: none`) so `!=` and `=>` show as typed.
- Numbers in tables and charts: `font-variant-numeric: tabular-nums`.
- Labels: `label` style, uppercase, `letter-spacing: .14em`, wrapped in brackets.

## Layout

- 4px base. Pane padding `space-4`, section gaps `space-6`, chart card gaps `space-8`.
- Work screens are three columns: navigator (left), work (centre), context (right). The right column holds supporting navigation for the current view: file tree, thread, artifact list.
- Lists are rows separated by `rule` hairlines; the selected row gets a 1px `ink` box on `surface`.

## Components

Previews in the Components view: **Button**, **Badge**, **Tabs**, **Kbd**, **Terminal**, **Diff**, **CommandPalette**, and the chart set: **LineChart**, **BarChart**, **StatTile**, **Heatmap**, **DivergingBar**. The previews are plain HTML on the tokens; there is no JavaScript bundle, so copy the markup and classes.

## Charts

Charts use their own validated palette, separate from the UI hues so a series is never mistaken for a state.

**Categorical** (identity), fixed order, never cycled:

| Slot | Paper | Night |
|---|---|---|
| `cat-1` jade | `#2E9B7A` | `#2FA882` |
| `cat-2` salsa | `#D9513F` | `#E5654C` |
| `cat-3` indigo | `#4D4F9E` | `#7A7DDA` |
| `cat-4` ochre | `#8E6418` | `#B98A33` |
| `cat-5` plum | `#B0539A` | `#C467B2` |

Green leads, so a single-series chart is green. Both themes pass lightness band, chroma floor, colourblind separation (worst adjacent ΔE 8.5, jade↔salsa), normal-vision floor and 3:1 contrast against `surface`. A sixth series folds into "Other" or becomes small multiples.

**Sequential** (magnitude): `seqg-1` → `seqg-5`, one green hue, light to dark on Paper and dark to light on Night. Use the indigo ramp `seq-1` → `seq-5` when green would wrongly read as “good” (error counts, latency).
**Diverging** (polarity): `div-neg` (salsa) ← `div-mid` (neutral) → `div-pos` (indigo). Blue/orange-type poles, so they survive red-green colourblindness.

Chart rules:

1. One y-axis. Two measures with different units get two charts.
2. Lines are `stroke-mark` (2px); markers 8px with a 2px `surface` ring; bars get a `stroke-gap` (2px) surface gap and `radius-1` tops anchored to the baseline.
3. Gridlines in `chart-grid`, axis text in `chart-axis`, values and legend text in `ink`. Series colour goes on the mark, never on the text.
4. Two or more series always get a legend; up to four are also labelled directly at the line end.
5. Every chart has a hover layer: a crosshair and tooltip on lines, a per-mark tooltip on bars and cells. Tooltips are `surface` with `shadow-pop` and `small` text.
6. Titles are `heading` in Martian Mono; the unit goes in the subtitle (`ms`, `lines`, `runs / day`).
7. A big single number is a **StatTile**, not a chart.

## Voice

Short, literal, lowercase where a terminal would be: `3 uncommitted`, `waiting on you`, `no worktree yet`. Buttons say what they do: `Push and open PR`, `Delete worktree`.
