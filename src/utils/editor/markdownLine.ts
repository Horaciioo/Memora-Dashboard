import { parseInline } from '@/core/lib/markdown'
import type { InlineNode } from '@/core/lib/markdown'

// Spoiler run marker
export const SPOILER_ATTRIBUTE = 'data-spoiler'

/**
 * Escaped HTML text
 * @param {string} text - Raw text
 * @return {string} - Safe text
 */

const escapeHtml = (text: string): string =>
  text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

// Tag per inline mark
const MARK_TAGS: Record<'bold' | 'italic' | 'underline' | 'strike', string> = {
  bold: 'strong',
  italic: 'em',
  underline: 'u',
  strike: 's',
}

/**
 * Inline nodes as HTML
 * @param {InlineNode[]} nodes - Parsed line
 * @return {string} - Editable HTML
 */

const nodesToHtml = (nodes: InlineNode[]): string =>
  nodes
    .map((node) => {
      switch (node.type) {
        case 'text':
          return escapeHtml(node.value)
        case 'code':
          return `<code>${escapeHtml(node.value)}</code>`
        case 'break':
          return '<br>'
        case 'link':
          return `<a href="${escapeHtml(node.href)}">${nodesToHtml(node.children)}</a>`
        case 'spoiler':
          return `<span ${SPOILER_ATTRIBUTE}>${nodesToHtml(node.children)}</span>`
        default: {
          const tag = MARK_TAGS[node.type]

          return `<${tag}>${nodesToHtml(node.children)}</${tag}>`
        }
      }
    })
    .join('')

/**
 * Markdown line as HTML
 * @param {string} markdown - Stored line
 * @return {string} - Editable HTML
 */

export const lineToHtml = (markdown: string): string => nodesToHtml(parseInline(markdown))

// Markers per browser tag
const TAG_MARKERS: Record<string, [string, string]> = {
  B: ['**', '**'],
  STRONG: ['**', '**'],
  I: ['*', '*'],
  EM: ['*', '*'],
  U: ['__', '__'],
  S: ['~~', '~~'],
  STRIKE: ['~~', '~~'],
  DEL: ['~~', '~~'],
  CODE: ['`', '`'],
}

/**
 * Node back to markdown
 * @param {Node} node - DOM node
 * @return {string} - Markdown run
 */

const nodeToMarkdown = (node: Node): string => {
  if (node.nodeType === Node.TEXT_NODE) return (node.textContent ?? '').replace(/ /g, ' ')
  if (!(node instanceof HTMLElement) || node.tagName === 'BR') return ''

  const inner = Array.from(node.childNodes).map(nodeToMarkdown).join('')
  if (inner.length === 0) return ''

  // Code keeps its raw text
  if (node.tagName === 'CODE') return `\`${node.textContent ?? ''}\``
  if (node.tagName === 'A' && node.getAttribute('href')) {
    return `[${inner}](${node.getAttribute('href')})`
  }
  if (node.hasAttribute(SPOILER_ATTRIBUTE)) return `||${inner}||`

  const markers = TAG_MARKERS[node.tagName]
  if (!markers) return inner

  // Spaces stay outside markers
  const lead = inner.match(/^\s*/)?.[0] ?? ''
  const trail = inner.match(/\s*$/)?.[0] ?? ''
  const core = inner.trim()

  return core ? `${lead}${markers[0]}${core}${markers[1]}${trail}` : inner
}

/**
 * Editable line as markdown
 * @param {Node} root - Line or fragment
 * @return {string} - Markdown line
 */

export const htmlToLine = (root: Node): string =>
  Array.from(root.childNodes).map(nodeToMarkdown).join('')

/**
 * Text before the caret
 * @param {HTMLElement} line - Editable line
 * @return {string | null} - Null off the line
 */

export const textBeforeCaret = (line: HTMLElement): string | null => {
  const selection = window.getSelection()
  if (!selection || selection.rangeCount === 0 || !selection.isCollapsed) return null

  const range = selection.getRangeAt(0)
  if (!line.contains(range.startContainer)) return null

  const before = document.createRange()
  before.selectNodeContents(line)
  before.setEnd(range.startContainer, range.startOffset)

  return before.toString()
}

/**
 * Caret at a line edge
 * @param {HTMLElement} line - Editable line
 * @param {'start' | 'end'} edge - Edge checked
 * @return {boolean}
 */

export const isCaretAt = (line: HTMLElement, edge: 'start' | 'end'): boolean => {
  const before = textBeforeCaret(line)
  if (before === null) return false

  return edge === 'start' ? before.length === 0 : before.length === (line.textContent ?? '').length
}

/**
 * Line cut at the caret
 * @param {HTMLElement} line - Editable line
 * @param {boolean} isRich - Keeps marks
 * @return {[string, string]} - Before and after
 */

export const splitAtCaret = (line: HTMLElement, isRich: boolean): [string, string] => {
  const selection = window.getSelection()
  const whole = isRich ? htmlToLine(line) : (line.textContent ?? '')
  if (!selection || selection.rangeCount === 0) return [whole, '']

  const range = selection.getRangeAt(0)
  if (!line.contains(range.startContainer)) return [whole, '']

  const tail = document.createRange()
  tail.selectNodeContents(line)
  tail.setStart(range.endContainer, range.endOffset)

  const head = document.createRange()
  head.selectNodeContents(line)
  head.setEnd(range.startContainer, range.startOffset)

  // Piece back to text
  const read = (piece: Range): string => {
    const holder = document.createElement('div')
    holder.appendChild(piece.cloneContents())

    return isRich ? htmlToLine(holder) : (holder.textContent ?? '')
  }

  return [read(head), read(tail)]
}

/**
 * Caret at a line edge
 * @param {HTMLElement} line - Editable line
 * @param {'start' | 'end'} edge - Landing edge
 * @return {void}
 */

export const placeCaret = (line: HTMLElement, edge: 'start' | 'end'): void => {
  line.focus()

  const selection = window.getSelection()
  if (!selection) return

  const range = document.createRange()
  range.selectNodeContents(line)
  range.collapse(edge === 'start')
  selection.removeAllRanges()
  selection.addRange(range)
}

/**
 * Caret after some characters
 * @param {HTMLElement} line - Editable line
 * @param {number} offset - Characters before
 * @return {void}
 */

export const placeCaretAt = (line: HTMLElement, offset: number): void => {
  line.focus()

  const selection = window.getSelection()
  if (!selection) return

  const walker = document.createTreeWalker(line, NodeFilter.SHOW_TEXT)
  let left = offset
  let node = walker.nextNode()

  while (node) {
    const length = node.textContent?.length ?? 0

    if (left <= length) {
      const range = document.createRange()
      range.setStart(node, left)
      range.collapse(true)
      selection.removeAllRanges()
      selection.addRange(range)
      return
    }

    left -= length
    node = walker.nextNode()
  }

  placeCaret(line, 'end')
}

/**
 * Caret screen box
 * @return {DOMRect | null} - Box or null
 */

export const caretRect = (): DOMRect | null => {
  const selection = window.getSelection()
  if (!selection || selection.rangeCount === 0) return null

  const range = selection.getRangeAt(0).cloneRange()
  const rects = range.getClientRects()
  if (rects.length > 0) return rects[rects.length - 1] ?? null

  // Empty line uses its holder
  const holder = range.startContainer
  return holder instanceof HTMLElement ? holder.getBoundingClientRect() : null
}
