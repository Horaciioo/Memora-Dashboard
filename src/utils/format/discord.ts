/**
 * One run of Discord inline markdown
 * @typedef {Object} DiscordInline
 */

export type DiscordInline =
  | { type: 'text'; text: string }
  | { type: 'code'; text: string }
  | { type: 'link'; text: string; href: string }
  | { type: 'mention'; kind: 'user' | 'role' | 'channel' | 'broadcast'; token: string }
  | {
      type: 'bold' | 'italic' | 'underline' | 'strike' | 'spoiler'
      children: DiscordInline[]
    }

/**
 * One block of a Discord message
 * @typedef {Object} DiscordBlock
 */

export type DiscordBlock =
  | { type: 'line'; children: DiscordInline[] }
  | { type: 'blank' }
  | { type: 'heading'; level: 1 | 2 | 3; children: DiscordInline[] }
  | { type: 'subtext'; children: DiscordInline[] }
  | { type: 'quote'; blocks: DiscordBlock[] }
  | { type: 'list'; ordered: boolean; items: DiscordInline[][] }
  | { type: 'codeBlock'; text: string }

// Wrapping marks
const WRAPS: { pattern: RegExp; type: 'bold' | 'italic' | 'underline' | 'strike' | 'spoiler' }[] = [
  { pattern: /^\*\*([\s\S]+?)\*\*(?!\*)/, type: 'bold' },
  { pattern: /^__([\s\S]+?)__(?!_)/, type: 'underline' },
  { pattern: /^~~([\s\S]+?)~~/, type: 'strike' },
  { pattern: /^\|\|([\s\S]+?)\|\|/, type: 'spoiler' },
  { pattern: /^\*(?!\s)([\s\S]+?)\*(?!\*)/, type: 'italic' },
  { pattern: /^_(?!\s)([\s\S]+?)_(?!_)/, type: 'italic' },
]

// Mentions
const MENTIONS: { pattern: RegExp; kind: 'user' | 'role' | 'channel' | 'broadcast' }[] = [
  { pattern: /^<@&\d+>/, kind: 'role' },
  { pattern: /^<@!?\d+>/, kind: 'user' },
  { pattern: /^<#\d+>/, kind: 'channel' },
  { pattern: /^@(everyone|here)\b/, kind: 'broadcast' },
]

const CODE = /^`([^`\n]+)`/
const LINK = /^\[([^\]\n]+)\]\((https?:\/\/[^\s)]+)\)/
const URL_PATTERN = /^https?:\/\/[^\s<]+[^\s<.,:;"')\]]/

/**
 * Parse inline Discord markdown
 * @param {string} source - One line or run of text
 * @return {DiscordInline[]} - Runs
 */

export const parseInline = (source: string): DiscordInline[] => {
  const runs: DiscordInline[] = []
  let text = ''
  let index = 0

  // Plain text piles up until a mark interrupts it
  const flush = () => {
    if (text) runs.push({ type: 'text', text })
    text = ''
  }

  while (index < source.length) {
    const rest = source.slice(index)

    const code = CODE.exec(rest)
    if (code) {
      flush()
      runs.push({ type: 'code', text: code[1] ?? '' })
      index += code[0].length
      continue
    }

    const mention = MENTIONS.map((entry) => ({ entry, match: entry.pattern.exec(rest) })).find(
      (candidate) => candidate.match
    )
    if (mention?.match) {
      flush()
      runs.push({ type: 'mention', kind: mention.entry.kind, token: mention.match[0] })
      index += mention.match[0].length
      continue
    }

    const link = LINK.exec(rest)
    if (link) {
      flush()
      runs.push({ type: 'link', text: link[1] ?? '', href: link[2] ?? '' })
      index += link[0].length
      continue
    }

    const wrap = WRAPS.map((entry) => ({ entry, match: entry.pattern.exec(rest) })).find(
      (candidate) => candidate.match
    )
    if (wrap?.match) {
      flush()
      runs.push({ type: wrap.entry.type, children: parseInline(wrap.match[1] ?? '') })
      index += wrap.match[0].length
      continue
    }

    const url = URL_PATTERN.exec(rest)
    if (url) {
      flush()
      runs.push({ type: 'link', text: url[0], href: url[0] })
      index += url[0].length
      continue
    }

    text += source[index]
    index += 1
  }

  flush()

  return runs
}

// Line-level markers
const HEADING = /^(#{1,3}) (.+)$/
const SUBTEXT = /^-# (.+)$/
const QUOTE = /^> ?(.*)$/
const QUOTE_REST = /^>>> ?([\s\S]*)$/
const BULLET = /^\s*[-*] (.+)$/
const NUMBERED = /^\s*\d+\. (.+)$/
const FENCE = /^```/

/**
 * Parse a whole Discord message into blocks
 * @param {string} source - Message markdown
 * @return {DiscordBlock[]} - Blocks
 */

export const parseMessage = (source: string): DiscordBlock[] => {
  const lines = source.replace(/\r\n/g, '\n').split('\n')
  const blocks: DiscordBlock[] = []
  let index = 0

  while (index < lines.length) {
    const line = lines[index] ?? ''

    // A fence swallows everything up to its closing twin
    if (FENCE.test(line)) {
      const body: string[] = []
      index += 1
      while (index < lines.length && !FENCE.test(lines[index] ?? '')) {
        body.push(lines[index] ?? '')
        index += 1
      }
      blocks.push({ type: 'codeBlock', text: body.join('\n') })
      index += 1
      continue
    }

    // Three chevrons quote the rest of the message
    const rest = QUOTE_REST.exec(line)
    if (rest) {
      blocks.push({
        type: 'quote',
        blocks: parseMessage([rest[1] ?? '', ...lines.slice(index + 1)].join('\n')),
      })
      break
    }

    // Consecutive quoted lines form one quote
    if (QUOTE.test(line) && line.startsWith('>')) {
      const quoted: string[] = []
      while (index < lines.length && (lines[index] ?? '').startsWith('>')) {
        quoted.push(QUOTE.exec(lines[index] ?? '')?.[1] ?? '')
        index += 1
      }
      blocks.push({ type: 'quote', blocks: parseMessage(quoted.join('\n')) })
      continue
    }

    // Consecutive items of one kind form one list
    const ordered = NUMBERED.test(line)
    if (ordered || BULLET.test(line)) {
      const pattern = ordered ? NUMBERED : BULLET
      const items: DiscordInline[][] = []
      while (index < lines.length && pattern.test(lines[index] ?? '')) {
        items.push(parseInline(pattern.exec(lines[index] ?? '')?.[1] ?? ''))
        index += 1
      }
      blocks.push({ type: 'list', ordered, items })
      continue
    }

    const heading = HEADING.exec(line)
    const subtext = SUBTEXT.exec(line)

    if (heading) {
      blocks.push({
        type: 'heading',
        level: (heading[1]?.length ?? 1) as 1 | 2 | 3,
        children: parseInline(heading[2] ?? ''),
      })
    } else if (subtext) {
      blocks.push({ type: 'subtext', children: parseInline(subtext[1] ?? '') })
    } else if (line.trim() === '') {
      blocks.push({ type: 'blank' })
    } else {
      blocks.push({ type: 'line', children: parseInline(line) })
    }

    index += 1
  }

  return blocks
}

/**
 * Mention read both ways
 * @typedef {Object} MentionEntry
 * @property {string} token - Token Discord reads
 * @property {string} display - What the writer sees and types
 */

export interface MentionEntry {
  token: string
  display: string
}

// A mention name ends where a word does
const escapeRegExp = (value: string): string => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

/**
 * Turn stored markdown into what the writer sees
 * @param {string} raw - Stored markdown
 * @param {MentionEntry[]} entries - Known mentions
 * @return {string} - Text as typed
 */

export const toDisplay = (raw: string, entries: MentionEntry[]): string => {
  const byToken = new Map(entries.map((entry) => [entry.token, entry.display]))

  return raw.replace(
    /<@&\d+>|<@!?\d+>|<#\d+>/g,
    (token) => byToken.get(token.replace('<@!', '<@')) ?? token
  )
}

/**
 * Turn what the writer typed back into stored markdown
 * @param {string} display - Text as typed
 * @param {MentionEntry[]} entries - Known mentions
 * @return {string} - Markdown Discord reads
 */

export const toRaw = (display: string, entries: MentionEntry[]): string => {
  // Longest names first
  const sorted = [...entries].sort((left, right) => right.display.length - left.display.length)
  if (sorted.length === 0) return display

  const pattern = new RegExp(
    `(${sorted.map((entry) => escapeRegExp(entry.display)).join('|')})(?![\\p{L}\\p{N}_])`,
    'gu'
  )
  const byDisplay = new Map(sorted.map((entry) => [entry.display, entry.token]))

  return display.replace(pattern, (name) => byDisplay.get(name) ?? name)
}
