// Writes this machine's daily Claude Code token totals to usage/<hostname>.json.
// Usage: node usage.mjs (sync-usage.sh also commits and pushes)
import { readdir, readFile, writeFile, mkdir } from 'node:fs/promises'
import { homedir, hostname } from 'node:os'
import { join } from 'node:path'

const PROJECTS = join(homedir(), '.claude', 'projects')
const OUT = new URL(`./usage/${hostname().split('.')[0]}.json`, import.meta.url)

const total = (d) => d.input + d.cacheWrite + d.cacheRead + d.output

// Streamed messages repeat their usage on several lines, so each message id counts once.
async function transcriptDays() {
  const seen = new Set()
  const days = {}
  const files = (await readdir(PROJECTS, { recursive: true })).filter((f) => f.endsWith('.jsonl'))
  for (const file of files) {
    for (const line of (await readFile(join(PROJECTS, file), 'utf8')).split('\n')) {
      if (!line.includes('"usage"')) {
        continue
      }
      let entry
      try {
        entry = JSON.parse(line)
      } catch {
        continue
      }
      const { message, timestamp } = entry
      if (!message?.usage || !message.id || !timestamp || seen.has(message.id)) {
        continue
      }
      seen.add(message.id)
      const u = message.usage
      const day = (days[timestamp.slice(0, 10)] ??= { input: 0, cacheWrite: 0, cacheRead: 0, output: 0 })
      day.input += u.input_tokens ?? 0
      day.cacheWrite += u.cache_creation_input_tokens ?? 0
      day.cacheRead += u.cache_read_input_tokens ?? 0
      day.output += u.output_tokens ?? 0
    }
  }
  return days
}

// Claude Code deletes old transcripts, so a day already recorded keeps its larger total.
const saved = JSON.parse(await readFile(OUT, 'utf8').catch(() => '{}'))
for (const [day, counts] of Object.entries(await transcriptDays())) {
  if (!saved[day] || total(counts) >= total(saved[day])) {
    saved[day] = counts
  }
}
await mkdir(new URL('./usage/', import.meta.url), { recursive: true })
const sorted = Object.fromEntries(Object.entries(saved).sort(([a], [b]) => a.localeCompare(b)))
await writeFile(OUT, JSON.stringify(sorted, null, 2) + '\n')
console.log(`wrote ${Object.keys(sorted).length} days to ${OUT.pathname}`)
