import { isSafeHref } from '@/core/lib/pages/links'
import type { PageDocument } from '@/types/pages'
import { parseBlocks } from '@/utils/editor/markdownBlocks'
import type { EditorBlock, EditorBlockKind } from '@/utils/editor/markdownBlocks'

// Inline markers, longest first
const INLINE_PATTERN = /(\*\*[^*]+\*\*|~~[^~]+~~|`[^`]+`|\[[^\]]+\]\([^)\s]+\)|\*[^*]+\*|_[^_]+_)/g

// Marker to mark type
const WRAPPERS: { open: string; close: string; mark: string }[] = [
  { open: '**', close: '**', mark: 'bold' },
  { open: '~~', close: '~~', mark: 'strike' },
  { open: '`', close: '`', mark: 'code' },
  { open: '*', close: '*', mark: 'italic' },
  { open: '_', close: '_', mark: 'italic' },
]

// Task item prefix
const TASK_PATTERN = /^\[( |x|X)\]\s+(.*)$/

/**
 * Text nodes of one markdown line
 * @param {string} line - Markdown text
 * @return {PageDocument[]} - Inline nodes
 */

export const inlineNodes = (line: string): PageDocument[] =>
  line
    .split(INLINE_PATTERN)
    .filter((part) => part.length > 0)
    .map((part): PageDocument => {
      // Link
      const link = /^\[([^\]]+)\]\(([^)\s]+)\)$/.exec(part)
      if (link?.[1] && link[2]) {
        return isSafeHref(link[2])
          ? { type: 'text', text: link[1], marks: [{ type: 'link', attrs: { href: link[2] } }] }
          : { type: 'text', text: link[1] }
      }

      // Wrapped mark
      const wrapper = WRAPPERS.find(
        (entry) => part.length > entry.open.length * 2 && part.startsWith(entry.open) && part.endsWith(entry.close)
      )
      if (wrapper) {
        return { type: 'text', text: part.slice(wrapper.open.length, -wrapper.close.length), marks: [{ type: wrapper.mark }] }
      }

      return { type: 'text', text: part }
    })

/**
 * Paragraph holding inline text
 * @param {string} text - Markdown text
 * @param {string} [type] - Textblock type
 * @param {Record<string, unknown>} [attrs] - Attributes
 * @return {PageDocument} - Textblock
 */

const textblock = (text: string, type = 'paragraph', attrs?: Record<string, unknown>): PageDocument => {
  const content = inlineNodes(text)

  return { type, ...(attrs ? { attrs } : {}), ...(content.length > 0 ? { content } : {}) }
}

// Single line blocks
const SINGLE: Partial<Record<EditorBlockKind, (block: EditorBlock) => PageDocument>> = {
  paragraph: (block) => textblock(block.text),
  heading1: (block) => textblock(block.text, 'heading', { level: 1 }),
  heading2: (block) => textblock(block.text, 'heading', { level: 2 }),
  heading3: (block) => textblock(block.text, 'heading', { level: 3 }),
  code: (block) => ({ type: 'codeBlock', ...(block.text ? { content: [{ type: 'text', text: block.text }] } : {}) }),
  rule: () => ({ type: 'horizontalRule' }),
}

/**
 * List item of a bullet line, task when it starts with a box
 * @param {EditorBlock} block - Bullet line
 * @return {{ list: string, item: PageDocument }} - List kind and item
 */

const listEntry = (block: EditorBlock): { list: string; item: PageDocument } => {
  const task = block.kind === 'bullet' ? TASK_PATTERN.exec(block.text) : null
  if (task) {
    return {
      list: 'taskList',
      item: { type: 'taskItem', attrs: { checked: task[1] !== ' ' }, content: [textblock(task[2] ?? '')] },
    }
  }

  const list = { bullet: 'bulletList', numbered: 'orderedList', quote: 'blockquote' }[block.kind as 'bullet']

  return {
    list,
    item: list === 'blockquote' ? textblock(block.text) : { type: 'listItem', content: [textblock(block.text)] },
  }
}

/**
 * Blocks of pasted markdown
 * @param {string} source - Plain text
 * @return {PageDocument[]} - Block nodes
 */

export const markdownToBlocks = (source: string): PageDocument[] =>
  parseBlocks(source).reduce<PageDocument[]>((nodes, block) => {
    const single = SINGLE[block.kind]
    if (single) return [...nodes, single(block)]

    // Consecutive items share their list
    const { list, item } = listEntry(block)
    const last = nodes.at(-1)
    if (last?.type === list) return [...nodes.slice(0, -1), { ...last, content: [...(last.content ?? []), item] }]

    return [...nodes, { type: list, content: [item] }]
  }, [])

/**
 * Text holds markdown structure
 * @param {string} text - Pasted text
 * @return {boolean} - Worth converting
 */

export const looksLikeMarkdown = (text: string): boolean =>
  /^(#{1,3}\s|[-*]\s|\d+[.)]\s|>\s|```|---\s*$)/m.test(text) || /\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\)/.test(text)
