// Builds tokens.css from tokens.json. Run after pulling a new tokens.json:
//   node design/tokens-css.mjs
import { readFile, writeFile } from 'node:fs/promises'
import { pathToFileURL } from 'node:url'

export async function loadTokens() {
  return JSON.parse(await readFile(new URL('./tokens.json', import.meta.url), 'utf8'))
}

// Colour tokens per theme, with `{name}` references resolved: { light: { ink: '#262440', … }, dark: … }.
export function themes(tokens) {
  const byName = new Map(tokens.color.tokens.map((t) => [t.name, t.value]))
  const resolve = (value, theme) => {
    if (typeof value !== 'string') {
      return value[theme]
    }
    const ref = value.match(/^\{(.+)\}$/)
    return ref ? resolve(byName.get(ref[1]), theme) : value
  }
  const pick = (theme) => Object.fromEntries(tokens.color.tokens.map((t) => [t.name, resolve(t.value, theme)]))
  return { light: pick('light'), dark: pick('dark') }
}

function css(tokens) {
  const { light, dark } = themes(tokens)
  const shadows = (theme) => Object.fromEntries(tokens.shadow.tokens.map((t) => [t.name, t.value[theme]]))
  const fixed = {
    'font-display': tokens.type.families.display,
    'font-mono': tokens.type.families.mono,
    ...Object.fromEntries(
      ['spacing', 'radius', 'stroke'].flatMap((group) => tokens[group].tokens.map((t) => [t.name, t.value])),
    ),
  }
  const block = (vars) =>
    Object.entries(vars)
      .map(([k, v]) => `  --${k}: ${v};`)
      .join('\n')
  const darkVars = block({ ...dark, ...shadows('dark') }).replace(/^/gm, '  ')
  return `/* Generated from tokens.json by tokens-css.mjs. Edit tokens.json, not this file. */
:root {
  color-scheme: light dark;
${block({ ...fixed, ...light, ...shadows('light') })}
}

@media (prefers-color-scheme: dark) {
  :root:not([data-theme='light']) {
${darkVars}
  }
}

:root[data-theme='dark'] {
${block({ ...dark, ...shadows('dark') })}
}
`
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  await writeFile(new URL('./tokens.css', import.meta.url), css(await loadTokens()))
  console.log('wrote design/tokens.css')
}
