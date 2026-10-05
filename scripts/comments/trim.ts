import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import { extname, join } from 'node:path'
import ts from 'typescript'

// Usage: trim.ts [--write] [--shrink] [--audit] [--diff] [--max-text=8] [--max-tag=6] [paths...]
const args = process.argv.slice(2)
const flag = (name: string): boolean => args.includes(`--${name}`)
const option = (name: string, fallback: number): number => {
  const hit = args.find((arg) => arg.startsWith(`--${name}=`))
  return hit ? Number(hit.split('=')[1]) : fallback
}

const WRITE = flag('write')
const SHRINK = flag('shrink')
const AUDIT = flag('audit')
const DIFF = flag('diff')
const MAX_TEXT = option('max-text', 8)
const MAX_TAG = option('max-tag', 6)

const DEFAULT_ROOTS = ['src', 'scripts', 'fixtures', 'prisma', 'eslint-rules', '.']
const EXTENSIONS = new Set(['.ts', '.tsx', '.mts', '.mjs'])
const SKIPPED_DIRS = new Set(['node_modules', 'generated', 'migrations', 'tests'])

// Comments the tooling reads
const DIRECTIVE =
  /^(eslint|prettier|istanbul|c8|v8|webpack|turbopack|biome|@ts-|@jsx|@vitest|@license|@preserve|@refresh|!|#|\/)/i
const CODE_LINE =
  /^(const|let|var|return|import|export|if|else|for|while|await|function|type|interface|class)\b|^<\/?[A-Za-z]|^[\w.]+\(.*\)|^[\w.]+\s*=\s|=>|[;{}]\s*$/
const TAG_WITH_DESC = /^@(param|returns?|property|prop|arg|argument|throws|template)\b/
const NAMED_TAG = /^@(param|property|prop|arg|argument|template)\b/
const CLAUSE_STARTERS = new Set([
  'when',
  'where',
  'once',
  'until',
  'so',
  'while',
  'that',
  'which',
  'because',
  'but',
  'and',
  'or',
  'if',
  'unless',
  'since',
  'before',
  'after',
  'instead',
  'then',
  'whose',
  'whether',
  '—',
  '–',
])
const FRENCH = /[éèàùçêâîôû]|\b(le|la|les|des|une|pour|avec|dans|sans|quand|chaque)\b/i

type Range = { pos: number; end: number; block: boolean }
type Edit = { pos: number; end: number; text: string }

// Cut position at the first prose comma
const commaIndex = (text: string): number => {
  let depth = 0
  let tick = false
  let quote = false

  for (let i = 0; i < text.length; i++) {
    const ch = text[i]
    if (ch === '`') tick = !tick
    else if (ch === '"') quote = !quote
    else if (tick || quote) continue
    else if ('([{'.includes(ch)) depth++
    else if (')]}'.includes(ch)) depth = Math.max(0, depth - 1)
    else if (
      ch === '<' &&
      /[A-Za-z]/.test(text[i - 1] ?? '') &&
      /[A-Za-z{]/.test(text[i + 1] ?? '')
    )
      depth++
    else if (ch === '>' && depth > 0 && /[A-Za-z\]}]/.test(text[i - 1] ?? '')) depth--
    else if (ch === ',' && depth === 0 && (i === text.length - 1 || text[i + 1] === ' ')) return i
  }

  return -1
}

// Words that cannot end a comment
const DANGLING = new Set([
  'a',
  'an',
  'the',
  'of',
  'to',
  'in',
  'on',
  'at',
  'by',
  'for',
  'with',
  'from',
  'into',
  'onto',
  'above',
  'below',
  'only',
  'most',
  'than',
  'as',
  'its',
  'their',
  'this',
  'that',
  'is',
  'are',
  'be',
  'not',
])

// Prefix ending on a clause boundary
const clip = (text: string, max: number): string => {
  const words = text.split(/\s+/).filter(Boolean)
  if (words.length <= max) return text

  // Last boundary inside the budget
  for (let i = Math.min(max, words.length - 1); i >= 3; i--) {
    const colon = words[i - 1].endsWith(':')
    const open = DANGLING.has(words[i - 1].toLowerCase())
    if (!open && (colon || CLAUSE_STARTERS.has(words[i].toLowerCase()))) {
      return words
        .slice(0, i)
        .join(' ')
        .replace(/[\s,;:.\-—(]+$/, '')
    }
  }

  return text
}

// Shorter body
const reduce = (body: string, max: number): string => {
  let out = body
  const at = commaIndex(out)
  const head = at > 0 ? out.slice(0, at) : ''

  // Colon lists stay whole
  if (
    at > 0 &&
    head.trim().length > 0 &&
    !(head.includes(':') && commaIndex(out.slice(at + 1)) > 0)
  )
    out = head.trim()
  if (SHRINK && !/https?:|`/.test(out)) out = clip(out, max)

  return out.trim()
}

// Tag head and description split
const splitTag = (line: string): { head: string; body: string } | null => {
  const tag = TAG_WITH_DESC.exec(line)
  if (!tag) return null

  let pos = tag[0].length
  const skipSpaces = (): void => {
    while (line[pos] === ' ') pos++
  }
  const skipBalanced = (open: string, close: string): void => {
    let depth = 0
    do {
      if (line[pos] === open) depth++
      else if (line[pos] === close) depth--
      pos++
    } while (depth > 0 && pos < line.length)
  }

  skipSpaces()
  if (line[pos] === '{') skipBalanced('{', '}')
  skipSpaces()
  if (NAMED_TAG.test(line)) {
    if (line[pos] === '[') skipBalanced('[', ']')
    else while (pos < line.length && line[pos] !== ' ') pos++
    skipSpaces()
  }
  if (line[pos] === '-') {
    pos++
    skipSpaces()
  }

  return { head: line.slice(0, pos), body: line.slice(pos) }
}

// Block comment rewritten
const rewriteBlock = (raw: string): string => {
  const opener = raw.startsWith('/**') ? '/**' : '/*'
  const inner = raw.slice(opener.length, -2)
  if (DIRECTIVE.test(inner.trim())) return raw

  // Single line
  if (!raw.includes('\n')) {
    const [, lead, text, trail] = /^(\s*)([\s\S]*?)(\s*)$/.exec(inner) ?? []
    if (!text || CODE_LINE.test(text)) return raw
    const tag = splitTag(text)
    if (text.startsWith('@') && !tag) return raw
    const next = tag ? tag.head + reduce(tag.body, MAX_TAG) : reduce(text, MAX_TEXT)

    return next === (tag ? tag.head + tag.body : text) ? raw : `${opener}${lead}${next}${trail}*/`
  }

  // Multi line
  const lines = raw.split('\n')
  if (lines[0].trim() !== opener || lines[lines.length - 1].trim() !== '*/') return raw

  const middle = lines.slice(1, -1).map((line) => {
    const [, prefix, body] = /^(\s*\*?[ \t]?)(.*)$/.exec(line) ?? ['', '', line]
    return { prefix, body }
  })
  const drop = new Set<number>()
  const replace = new Map<number, string>()
  let start = -1
  let kind: 'text' | 'tag' | 'other' = 'text'

  // One logical comment per unit
  const flush = (end: number): void => {
    if (start < 0 || kind === 'other') return
    const first = middle[start]
    const tag = kind === 'tag' ? splitTag(first.body) : null
    const parts = [tag ? tag.body : first.body, ...middle.slice(start + 1, end).map((m) => m.body)]
    const body = parts
      .map((part) => part.trim())
      .filter(Boolean)
      .join(' ')
    if (!body || middle.slice(start, end).some((m) => CODE_LINE.test(m.body.trim()))) return

    const next = reduce(body, tag ? MAX_TAG : MAX_TEXT)
    if (next === body) return
    replace.set(start, `${first.prefix}${tag ? tag.head : ''}${next}`)
    for (let i = start + 1; i < end; i++) drop.add(i)
  }

  middle.forEach((line, index) => {
    const body = line.body.trim()
    const startsUnit = body.startsWith('@') || (body !== '' && start < 0)
    if (body === '' || body.startsWith('@')) {
      flush(index)
      start = -1
    }
    if (startsUnit && start < 0) {
      start = index
      kind = body.startsWith('@') ? (TAG_WITH_DESC.test(body) ? 'tag' : 'other') : 'text'
    }
  })
  flush(middle.length)

  const out = middle.flatMap((line, index) =>
    drop.has(index) ? [] : [replace.get(index) ?? `${line.prefix}${line.body}`]
  )

  return [lines[0], ...out, lines[lines.length - 1]].join('\n')
}

// Collapsed run of // lines
const rewriteLines = (bodies: string[]): string[] | null => {
  const joined = bodies.join(' ')
  if (DIRECTIVE.test(joined) || bodies.some((body) => CODE_LINE.test(body))) return null

  const at = commaIndex(joined)
  let kept = bodies
  if (at > 0) {
    let offset = 0
    const cutLine = bodies.findIndex((body) => {
      offset += body.length + 1
      return at < offset
    })
    const lineAt = at - (offset - bodies[cutLine].length - 1)
    const head = bodies[cutLine].slice(0, lineAt).trim()
    const before = bodies.slice(0, cutLine).join(' ')
    const enumeration = `${before} ${head}`.includes(':') && commaIndex(joined.slice(at + 1)) > 0
    if (!enumeration) kept = [...bodies.slice(0, cutLine), head]
    if (!head) kept = bodies.slice(0, cutLine)
    if (kept.length === 0) kept = bodies
  }

  if (SHRINK) {
    const text = kept.join(' ')
    if (!/https?:|`/.test(text) && text.split(/\s+/).length > MAX_TEXT)
      kept = [clip(text, MAX_TEXT)]
  }

  return kept.join('\n') === bodies.join('\n') ? null : kept
}

// Every comment of the source
const collect = (sf: ts.SourceFile): Range[] => {
  const seen = new Map<number, Range>()
  const text = sf.text
  const add = (ranges: ts.CommentRange[] | undefined): void => {
    for (const r of ranges ?? []) {
      seen.set(r.pos, {
        pos: r.pos,
        end: r.end,
        block: r.kind === ts.SyntaxKind.MultiLineCommentTrivia,
      })
    }
  }
  const walk = (node: ts.Node): void => {
    if (node.kind !== ts.SyntaxKind.JsxText)
      add(ts.getLeadingCommentRanges(text, node.getFullStart()))
    add(ts.getTrailingCommentRanges(text, node.getEnd()))
    node.getChildren(sf).forEach(walk)
  }
  walk(sf)

  return [...seen.values()].sort((a, b) => a.pos - b.pos)
}

// Edits for one file
const plan = (text: string, ranges: Range[]): Edit[] => {
  const edits: Edit[] = []

  // Block comments
  for (const r of ranges.filter((range) => range.block)) {
    const raw = text.slice(r.pos, r.end)
    const next = rewriteBlock(raw)
    if (next !== raw) edits.push({ pos: r.pos, end: r.end, text: next })
  }

  // Line comment runs
  const lines = ranges.filter((range) => !range.block)
  let index = 0
  while (index < lines.length) {
    const run = [lines[index]]
    const alone = (r: Range): boolean =>
      /^[ \t]*$/.test(text.slice(text.lastIndexOf('\n', r.pos - 1) + 1, r.pos))
    while (
      index + run.length < lines.length &&
      alone(run[0]) &&
      alone(lines[index + run.length]) &&
      /^\n[ \t]*$/.test(text.slice(run[run.length - 1].end, lines[index + run.length].pos))
    ) {
      run.push(lines[index + run.length])
    }
    index += run.length

    const parsed = run.map((r) => /^(\/\/[ \t]?)(.*)$/.exec(text.slice(r.pos, r.end)))
    if (parsed.some((match) => !match)) continue
    const prefixes = parsed.map((match) => match![1])
    const bodies = parsed.map((match) => match![2].trimEnd())
    const kept = rewriteLines(bodies)
    if (!kept) continue

    // Kept lines rebuilt with their own prefix and indent
    const indent = text.slice(text.lastIndexOf('\n', run[0].pos - 1) + 1, run[0].pos)
    const rebuilt = kept.map(
      (body, i) => `${i === 0 ? '' : indent}${prefixes[Math.min(i, prefixes.length - 1)]}${body}`
    )
    edits.push({ pos: run[0].pos, end: run[run.length - 1].end, text: rebuilt.join('\n') })
  }

  return edits
}

// Edits applied back to front
const apply = (text: string, edits: Edit[]): string =>
  [...edits]
    .sort((a, b) => b.pos - a.pos)
    .reduce((out, edit) => out.slice(0, edit.pos) + edit.text + out.slice(edit.end), text)

const parse = (name: string, text: string): ts.SourceFile =>
  ts.createSourceFile(
    name,
    text,
    ts.ScriptTarget.ESNext,
    true,
    name.endsWith('x') ? ts.ScriptKind.TSX : ts.ScriptKind.TS
  )

// Source without comments or spaces
const skeleton = (name: string, text: string): string => {
  const sf = parse(name, text)
  const ranges = collect(sf)
  let out = ''
  let cursor = 0
  for (const r of ranges) {
    out += text.slice(cursor, r.pos)
    cursor = r.end
  }

  return (out + text.slice(cursor)).replace(/\s+/g, '')
}

// Emitted JS without comments
const emitted = (name: string, text: string): string =>
  ts.transpileModule(text, {
    fileName: name,
    reportDiagnostics: false,
    compilerOptions: {
      removeComments: true,
      target: ts.ScriptTarget.ESNext,
      jsx: ts.JsxEmit.Preserve,
      module: ts.ModuleKind.ESNext,
    },
  }).outputText

// Code identical before and after
const identical = (name: string, before: string, after: string): boolean =>
  skeleton(name, before) === skeleton(name, after) && emitted(name, before) === emitted(name, after)

// Leftover anomalies of one file
const audit = (name: string, text: string): string[] => {
  const found: string[] = []
  const sf = parse(name, text)

  for (const r of collect(sf)) {
    const raw = text.slice(r.pos, r.end)
    const line = sf.getLineAndCharacterOfPosition(r.pos).line + 1
    const body = raw.replace(/^\/\*+|\*+\/$|^\/\/ ?/g, '').replace(/^\s*\* ?/gm, ' ')
    if (DIRECTIVE.test(body.trim())) continue

    const prose = body
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l && !l.startsWith('@'))
    const tags = body
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l.startsWith('@'))
    if (
      prose.some((l) => l.split(/\s+/).length > MAX_TEXT) ||
      prose.join(' ').split(/\s+/).length > MAX_TEXT * 2
    )
      found.push(`${name}:${line} too long: ${prose.join(' ').slice(0, 90)}`)
    if (prose.some((l) => commaIndex(l) > 0 && !CODE_LINE.test(l)))
      found.push(`${name}:${line} comma left: ${prose.join(' ').slice(0, 90)}`)
    if (
      tags.some((tag) => {
        const split = splitTag(tag)
        return split ? commaIndex(split.body) > 0 : false
      })
    )
      found.push(`${name}:${line} comma in tag: ${tags[0].slice(0, 90)}`)
    if (FRENCH.test(prose.join(' ')))
      found.push(`${name}:${line} french: ${prose.join(' ').slice(0, 90)}`)
  }

  return found
}

// Files under the given roots
const walkFiles = (root: string, depth = 0): string[] => {
  if (!statSync(root, { throwIfNoEntry: false })) return []
  if (statSync(root).isFile())
    return EXTENSIONS.has(extname(root)) && !root.endsWith('.d.ts') ? [root] : []

  return readdirSync(root).flatMap((entry) => {
    const path = root === '.' ? entry : join(root, entry)
    const isDir = statSync(path).isDirectory()
    if (
      isDir &&
      (SKIPPED_DIRS.has(entry) || entry.startsWith('.') || (root === '.' && depth === 0))
    )
      return []

    return isDir
      ? walkFiles(path, depth + 1)
      : EXTENSIONS.has(extname(path)) && !path.endsWith('.d.ts')
        ? [path]
        : []
  })
}

// Run
const roots = args.filter((arg) => !arg.startsWith('--'))
const files = [
  ...new Set((roots.length ? roots : DEFAULT_ROOTS).flatMap((root) => walkFiles(root))),
]
let changed = 0
let broken = 0
let edited = 0
const anomalies: string[] = []

for (const file of files) {
  const before = readFileSync(file, 'utf8')
  const edits = plan(before, collect(parse(file, before)))
  const after = apply(before, edits)

  if (edits.length > 0) {
    if (!identical(file, before, after)) {
      broken++
      console.error(`REFUSED ${file}: code differs after the edit`)
      continue
    }
    changed++
    edited += edits.length
    if (DIFF) {
      for (const edit of edits.slice(0, 3))
        console.log(
          `${file}\n- ${before.slice(edit.pos, edit.end).split('\n').join('\n- ')}\n+ ${edit.text.split('\n').join('\n+ ')}\n`
        )
    }
    if (WRITE) writeFileSync(file, after)
  }
  if (AUDIT) anomalies.push(...audit(file, WRITE ? after : before))
}

if (AUDIT) console.log(anomalies.join('\n'))
console.log(
  `${WRITE ? 'written' : 'dry run'}: ${files.length} files scanned, ${changed} changed, ${edited} comments, ${broken} refused`
)
process.exit(broken > 0 ? 1 : 0)
