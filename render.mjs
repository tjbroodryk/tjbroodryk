// Renders terminal.svg from repos.json using live GitHub stats.
// Usage: GITHUB_TOKEN=... node render.mjs
import { readFile, writeFile } from 'node:fs/promises'
import { loadTokens, themes } from './design/tokens-css.mjs'

const FRESH_DAYS = 7
const STALE_DAYS = 365
const FONT = 14
const CHAR_W = FONT * 0.6
const LINE_H = 24
const PAD_X = 32
const BAR_H = 40
const CHART_DAYS = 90
const CHART_H = 96
const AXIS_W = 40
const BAR_GAP = 2

// Barrio (design/tokens.json), paper and night.
const TOKENS = await loadTokens()
const { light: LIGHT, dark: DARK } = themes(TOKENS)

// Segment colours are token names, emitted as classes so the SVG follows the viewer's theme.
const C = {
  text: 'ink',
  dim: 'ink-muted',
  rule: 'ink-faint',
  name: 'accent',
  group: 'ink',
  role: 'ink-muted',
  prompt: 'accent',
  fresh: 'cilantro',
}

const vars = (tokens) => Object.entries(tokens).map(([k, v]) => `--${k}:${v};`).join('')
const STYLE = `
    svg { ${vars(LIGHT)} }
    @media (prefers-color-scheme: dark) { svg { ${vars(DARK)} } }
    ${Object.keys(LIGHT).map((k) => `.${k} { fill: var(--${k}) }`).join('\n    ')}
    .window { fill: var(--bg); stroke: var(--ink) }
    .bar { fill: var(--wash) }
    .edge { stroke: var(--ink) }
    .label { font-size: 11px; font-weight: 500; letter-spacing: 0.14em }
    .group { font-weight: 600 }
    .tick { font-size: 11px }
    .value { font-size: 11px; font-weight: 600 }
    .grid { stroke: var(--chart-grid) }
    .baseline { stroke: var(--ink-faint) }
    .mark { fill: var(--cat-1) }`

class GitHub {
  constructor(token, fetchFn = fetch) {
    this.token = token
    this.fetch = fetchFn
  }

  async get(path) {
    const res = await this.fetch(`https://api.github.com/${path}`, {
      headers: {
        Accept: 'application/vnd.github+json',
        ...(this.token ? { Authorization: `Bearer ${this.token}` } : {}),
      },
    })
    if (!res.ok) {
      throw new Error(`GET ${path}: ${res.status} ${await res.text()}`)
    }
    return res
  }

  // The user's commits per UTC weekday across `repos` for the last `days` calendar
  // days, oldest first, as [date, count] pairs. Default branches only.
  async commitsPerWeekday(repos, user, days) {
    const from = new Date(Date.now() - days * 86_400_000)
    const counts = new Map()
    await Promise.all(
      repos.map(async (repo) => {
        for (let page = 1; ; page++) {
          const res = await this.get(
            `repos/${repo}/commits?author=${user}&since=${from.toISOString()}&per_page=100&page=${page}`,
          )
          const commits = await res.json()
          for (const { commit } of commits) {
            const day = commit.author.date.slice(0, 10)
            counts.set(day, (counts.get(day) ?? 0) + 1)
          }
          if (commits.length < 100) {
            break
          }
        }
      }),
    )
    return Array.from({ length: days }, (_, i) => new Date(from.getTime() + (i + 1) * 86_400_000))
      .filter((date) => date.getUTCDay() !== 0 && date.getUTCDay() !== 6)
      .map((date) => {
        const day = date.toISOString().slice(0, 10)
        return [day, counts.get(day) ?? 0]
      })
  }

  // Counts commits by asking for one per page and reading the last page number.
  async commitCount(repo, author) {
    const query = author ? `&author=${author}` : ''
    const res = await this.get(`repos/${repo}/commits?per_page=1${query}`)
    const last = res.headers.get('link')?.match(/[?&]page=(\d+)>; rel="last"/)
    if (last) {
      return Number(last[1])
    }
    return (await res.json()).length
  }

  async stats(repo, user) {
    const info = await (await this.get(`repos/${repo}`)).json()
    const [mine, total] = await Promise.all([
      this.commitCount(repo, user),
      this.commitCount(repo),
    ])
    return { info, mine, total }
  }
}

const daysAgo = (iso) => Math.floor((Date.now() - Date.parse(iso)) / 86_400_000)
const pad = (s, n, right = false) => (right ? s.padStart(n) : s.padEnd(n)).slice(0, n)
// Non-breaking spaces, because some renderers ignore xml:space and collapse the padding.
const esc = (s) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/ /g, '&#160;')

const COLS = [
  { head: 'REPO', w: 24 },
  { head: 'WHAT', w: 21 },
  { head: 'UPDATED', w: 9 },
  { head: 'COMMITS', w: 11, right: true },
  { head: 'ROLE', w: 12 },
]

// A line is a list of [text, colour] segments.
function row(cells) {
  const line = [['| ', C.rule]]
  COLS.forEach((col, i) => {
    const [text, colour] = cells[i] ?? ['', C.text]
    line.push([pad(text, col.w, col.right), colour], [i === COLS.length - 1 ? ' |' : ' | ', C.rule])
  })
  return line
}

const rule = () => [['+' + COLS.map((c) => '-'.repeat(c.w + 2)).join('+') + '+', C.rule]]

function role(info, user) {
  if (info.fork) {
    return 'fork'
  }
  if (info.owner.login === user) {
    return 'owner'
  }
  return info.permissions?.admin || info.permissions?.maintain ? 'maintainer' : 'contributor'
}

// Groups with repos pushed in the last STALE_DAYS; empty groups are dropped.
function visibleGroups(config, stats) {
  return config.groups
    .map((group) => ({
      name: group.name,
      repos: group.repos.filter((r) => daysAgo(stats.get(r.repo).info.pushed_at) < STALE_DAYS),
    }))
    .filter((group) => group.repos.length > 0)
}

function tableLines(config, groups, stats) {
  const lines = [rule(), row(COLS.map((c) => [c.head, C.text])), rule()]
  for (const group of groups) {
    if (group.name) {
      lines.push(row([[group.name, `${C.group} group`]]))
    }
    for (const entry of group.repos) {
      const { info, mine, total } = stats.get(entry.repo)
      const age = daysAgo(info.pushed_at)
      lines.push(
        row([
          [info.name, C.name],
          [entry.what, C.text],
          [age === 0 ? 'today' : `${age}d ago`, age < FRESH_DAYS ? C.fresh : C.text],
          [`${mine}/${total}`, C.text],
          [role(info, config.user), C.role],
        ]),
      )
    }
    lines.push(rule())
  }
  return lines
}

const shortDate = (day) =>
  new Date(day).toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' })

// Rounds the y-axis top up to a value whose half is a whole, readable number.
function axisMax(max) {
  const unit = max <= 10 ? 2 : max <= 50 ? 10 : max <= 200 ? 20 : 100
  return Math.ceil(max / unit) * unit
}

// A bar from the baseline with 2px-rounded top corners (Barrio's radius-1).
function barPath(x, w, top, bottom) {
  const r = Math.min(2, w / 2, bottom - top)
  const f = (n) => n.toFixed(1)
  return `M${f(x)} ${f(bottom)}V${f(top + r)}Q${f(x)} ${f(top)} ${f(x + r)} ${f(top)}H${f(x + w - r)}Q${f(x + w)} ${f(top)} ${f(x + w)} ${f(top + r)}V${f(bottom)}Z`
}

// One bar per day with a y-axis, spanning `width` from `x`. Only the peak gets a value label.
function chart(days, x, top, width) {
  const counts = days.map(([, n]) => n)
  const max = Math.max(1, ...counts)
  const yMax = axisMax(max)
  const total = counts.reduce((a, b) => a + b, 0)
  const plotX = x + AXIS_W
  const slot = (width - AXIS_W) / days.length
  const bottom = top + CHART_H
  const y = (n) => bottom - (n / yMax) * CHART_H

  const axis = [0, yMax / 2, yMax].flatMap((tick) => [
    `<line class="${tick ? 'grid' : 'baseline'}" x1="${plotX}" x2="${x + width}" y1="${y(tick)}" y2="${y(tick)}"/>`,
    `<text class="${C.dim} tick" x="${plotX - 8}" y="${y(tick) + 4}" text-anchor="end">${tick}</text>`,
  ])
  const peak = counts.indexOf(max)
  const bars = counts.flatMap((n, i) => {
    if (!n) {
      return []
    }
    const bx = plotX + i * slot + BAR_GAP / 2
    const marks = [`<path class="mark" d="${barPath(bx, slot - BAR_GAP, y(n), bottom)}"/>`]
    if (i === peak) {
      marks.push(`<text class="ink value" x="${(bx + (slot - BAR_GAP) / 2).toFixed(1)}" y="${y(n) - 5}" text-anchor="middle">${n}</text>`)
    }
    return marks
  })
  const labelY = bottom + 20
  const summary = `${total} commits · peak ${max}/day`
  const labels = [
    `<text x="${plotX}" y="${labelY}" class="${C.dim}">${esc(shortDate(days[0][0]))}</text>`,
    `<text x="${plotX + (width - AXIS_W) / 2}" y="${labelY}" text-anchor="middle" class="${C.dim}">${esc(summary)}</text>`,
    `<text x="${x + width}" y="${labelY}" text-anchor="end" class="${C.dim}">today</text>`,
  ]
  return { markup: [...axis, ...bars, ...labels].join('\n  '), bottom: labelY }
}

function svg(config, groups, table, days) {
  const repoCount = groups.reduce((n, g) => n + g.repos.length, 0)
  const lines = [
    [['$ ', C.prompt], [config.command, C.text]],
    [[`resolving suite ... ${repoCount} repos in ${groups.length} groups`, C.dim]],
    [],
    ...table,
    [],
    [['$ ', C.prompt], [`probe log --commits --per weekday --since ${CHART_DAYS}d`, C.text]],
  ]
  const tableW = table[0][0][0].length * CHAR_W
  const width = Math.ceil(PAD_X * 2 + tableW)
  const graph = chart(days, PAD_X, BAR_H + 36 + (lines.length - 1) * LINE_H + 28, tableW)
  const height = Math.ceil(graph.bottom + 24)
  const text = lines
    .map((segs, i) => {
      const spans = segs.map(([t, c]) => `<tspan class="${c}">${esc(t)}</tspan>`).join('')
      return `<text x="${PAD_X}" y="${BAR_H + 36 + i * LINE_H}">${spans}</text>`
    })
    .join('\n  ')
  // Square pane, wash header with a bracketed label and a muted count: [ ~/PROJECTS ] 10.
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" font-family="${TOKENS.type.families.mono.replace(/"/g, "'")}" font-size="${FONT}" xml:space="preserve">
  <style>${STYLE}
  </style>
  <rect class="window" x="0.5" y="0.5" width="${width - 1}" height="${height - 1}"/>
  <rect class="bar" x="1" y="1" width="${width - 2}" height="${BAR_H - 1}"/>
  <line class="edge" x1="0" x2="${width}" y1="${BAR_H + 0.5}" y2="${BAR_H + 0.5}"/>
  <text x="${PAD_X}" y="${BAR_H / 2 + 4}"><tspan class="ink label">${esc(`[ ${config.title.toUpperCase()} ]`)}</tspan><tspan class="${C.dim} label">${esc(` ${repoCount}`)}</tspan></text>
  ${text}
  ${graph.markup}
</svg>
`
}

const config = JSON.parse(await readFile(new URL('./repos.json', import.meta.url), 'utf8'))
const github = new GitHub(process.env.GITHUB_TOKEN)
const repos = config.groups.flatMap((g) => g.repos.map((r) => r.repo))
const [stats, days] = await Promise.all([
  Promise.all(repos.map(async (r) => [r, await github.stats(r, config.user)])).then((s) => new Map(s)),
  github.commitsPerWeekday(repos, config.user, CHART_DAYS),
])
const groups = visibleGroups(config, stats)
await writeFile(
  new URL('./terminal.svg', import.meta.url),
  svg(config, groups, tableLines(config, groups, stats), days),
)
console.log(`rendered ${groups.reduce((n, g) => n + g.repos.length, 0)} of ${repos.length} repos`)
