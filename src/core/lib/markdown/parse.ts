import { parseInline } from '@/core/lib/markdown/inline'
import type { BlockNode, InlineNode } from '@/core/lib/markdown/types'

// Opening or closing fence of a code block
const FENCE_PATTERN = /^```(\w+)?\s*$/
const HEADING_PATTERN = /^(#{1,3})\s+(.*)$/
const QUOTE_PATTERN = /^>\s?(.*)$/
const BULLET_PATTERN = /^[-*]\s+(.*)$/
const ORDERED_PATTERN = /^\d+[.)]\s+(.*)$/
const RULE_PATTERN = /^(-{3,}|\*{3,}|_{3,})\s*$/

/**
 * Join paragraph lines with explicit breaks
 * @param {string[]} lines - Buffered lines
 * @return {InlineNode[]} - Inline nodes
 */

const joinLines = (lines: string[]): InlineNode[] =>
  lines.flatMap((line, index) =>
    index === 0 ? parseInline(line) : [{ type: 'break' as const }, ...parseInline(line)]
  )

/**
 * Turn a markdown document into blocks
 * @param {string} source - Raw markdown
 * @return {BlockNode[]} - Block nodes
 */

export const parseMarkdown = (source: string): BlockNode[] => {
  const lines = source.replace(/\r\n/g, '\n').split('\n')
  const blocks: BlockNode[] = []

  let paragraph: string[] = []

  // Flush whatever paragraph is being accumulated
  const flush = () => {
    if (paragraph.length === 0) return
    blocks.push({ type: 'paragraph', children: joinLines(paragraph) })
    paragraph = []
  }

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index]

    // Fenced code swallows every line until its closing fence
    const fence = FENCE_PATTERN.exec(line)
    if (fence) {
      flush()
      const body: string[] = []
      index += 1
      while (index < lines.length && !FENCE_PATTERN.test(lines[index])) {
        body.push(lines[index])
        index += 1
      }
      blocks.push({ type: 'code', language: fence[1] ?? null, value: body.join('\n') })
      continue
    }

    if (line.trim().length === 0) {
      flush()
      continue
    }

    if (RULE_PATTERN.test(line)) {
      flush()
      blocks.push({ type: 'rule' })
      continue
    }

    const heading = HEADING_PATTERN.exec(line)
    if (heading) {
      flush()
      blocks.push({
        type: 'heading',
        level: heading[1].length as 1 | 2 | 3,
        children: parseInline(heading[2]),
      })
      continue
    }

    // Consecutive quote lines merge into one block
    const quote = QUOTE_PATTERN.exec(line)
    if (quote) {
      flush()
      const body = [quote[1]]
      while (index + 1 < lines.length && QUOTE_PATTERN.test(lines[index + 1])) {
        index += 1
        body.push(QUOTE_PATTERN.exec(lines[index])?.[1] ?? '')
      }
      blocks.push({ type: 'quote', children: joinLines(body) })
      continue
    }

    // Consecutive list items merge into one block
    const bullet = BULLET_PATTERN.exec(line)
    const ordered = ORDERED_PATTERN.exec(line)
    if (bullet || ordered) {
      flush()
      const isOrdered = ordered !== null
      const pattern = isOrdered ? ORDERED_PATTERN : BULLET_PATTERN
      const items: InlineNode[][] = [parseInline((ordered ?? bullet)![1])]

      while (index + 1 < lines.length && pattern.test(lines[index + 1])) {
        index += 1
        items.push(parseInline(pattern.exec(lines[index])![1]))
      }

      blocks.push({ type: 'list', ordered: isOrdered, items })
      continue
    }

    paragraph.push(line)
  }

  flush()

  return blocks
}

/**
 * Strip markdown down to plain text
 * @param {string} source - Raw markdown
 * @param {number} [limit] - Longest result
 * @return {string} - Plain text
 */

export const markdownToText = (source: string, limit?: number): string => {
  const text = source
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/[*_~`>#|]/g, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/\s+/g, ' ')
    .trim()

  return limit !== undefined && text.length > limit ? `${text.slice(0, limit)}…` : text
}
