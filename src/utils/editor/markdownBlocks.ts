/**
 * Block kind of the editor
 * @type {string}
 */

export type EditorBlockKind =
  | 'paragraph'
  | 'heading1'
  | 'heading2'
  | 'heading3'
  | 'bullet'
  | 'numbered'
  | 'quote'
  | 'code'
  | 'rule'

/**
 * One editor block
 * @typedef {Object} EditorBlock
 * @property {string} id - Local key
 * @property {EditorBlockKind} kind - Block kind
 * @property {string} text - Inline markdown
 */

export interface EditorBlock {
  id: string
  kind: EditorBlockKind
  text: string
}

// Line prefix per kind
const PREFIXES: Partial<Record<EditorBlockKind, string>> = {
  heading1: '# ',
  heading2: '## ',
  heading3: '### ',
  bullet: '- ',
  quote: '> ',
}

// List kinds
const LIST_KINDS: EditorBlockKind[] = ['bullet', 'numbered', 'quote']

const FENCE = '```'

let counter = 0

/**
 * Fresh block
 * @param {EditorBlockKind} kind - Block kind
 * @param {string} [text] - Starting text
 * @return {EditorBlock} - New block
 */

export const createBlock = (kind: EditorBlockKind, text = ''): EditorBlock => {
  counter += 1

  return { id: `block-${Date.now().toString(36)}-${counter}`, kind, text }
}

/**
 * Kind and text of a line
 * @param {string} line - Markdown line
 * @return {{ kind: EditorBlockKind, text: string }} - Parsed line
 */

export const readShortcut = (line: string): { kind: EditorBlockKind; text: string } => {
  if (/^(-{3,}|\*{3,}|_{3,})\s*$/.test(line)) return { kind: 'rule', text: '' }

  const heading = /^(#{1,3})\s+(.*)$/.exec(line)
  if (heading) {
    const level = heading[1]?.length ?? 1

    return { kind: `heading${level}` as EditorBlockKind, text: heading[2] ?? '' }
  }

  const bullet = /^[-*]\s+(.*)$/.exec(line)
  if (bullet) return { kind: 'bullet', text: bullet[1] ?? '' }

  const numbered = /^\d+[.)]\s+(.*)$/.exec(line)
  if (numbered) return { kind: 'numbered', text: numbered[1] ?? '' }

  const quote = /^>\s?(.*)$/.exec(line)
  if (quote) return { kind: 'quote', text: quote[1] ?? '' }

  return { kind: 'paragraph', text: line }
}

/**
 * Markdown into blocks
 * @param {string} source - Stored markdown
 * @return {EditorBlock[]} - Never empty
 */

export const parseBlocks = (source: string): EditorBlock[] => {
  const lines = source.replace(/\r\n/g, '\n').split('\n')
  const blocks: EditorBlock[] = []

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index] ?? ''

    // Fenced code
    if (line.startsWith(FENCE)) {
      const body: string[] = []
      index += 1
      while (index < lines.length && !(lines[index] ?? '').startsWith(FENCE)) {
        body.push(lines[index] ?? '')
        index += 1
      }
      blocks.push(createBlock('code', body.join('\n')))
      continue
    }

    if (line.trim().length === 0) continue

    const { kind, text } = readShortcut(line)
    blocks.push(createBlock(kind, text))
  }

  return blocks.length > 0 ? blocks : [createBlock('paragraph')]
}

/**
 * Blocks into markdown
 * @param {EditorBlock[]} blocks - Editor blocks
 * @return {string} - Stored markdown
 */

export const serializeBlocks = (blocks: EditorBlock[]): string => {
  const lines: string[] = []
  let number = 0

  blocks.forEach((block, index) => {
    const previous = blocks[index - 1]
    number = block.kind === 'numbered' ? (previous?.kind === 'numbered' ? number + 1 : 1) : 0

    // Same list kinds stay glued
    if (previous && !(previous.kind === block.kind && LIST_KINDS.includes(block.kind))) {
      lines.push('')
    }

    if (block.kind === 'rule') lines.push('---')
    else if (block.kind === 'code') lines.push(FENCE, block.text, FENCE)
    else if (block.kind === 'numbered') lines.push(`${number}. ${block.text}`)
    else lines.push(`${PREFIXES[block.kind] ?? ''}${block.text}`)
  })

  // Empty trailing paragraphs drop
  return lines.join('\n').replace(/\n+$/, '').trimEnd()
}
