import { createElement, Fragment } from 'react'
import type { ReactNode } from 'react'

import { isSafeHref } from '@/core/lib/pages'
import { PAGE_EDITOR_COPY, PAGES_COPY } from '@/declarations/pages/copy'
import type { PageDocument } from '@/types/pages'

// Mark to wrapping tag
const MARK_TAGS: Record<string, string> = {
  bold: 'strong',
  italic: 'em',
  underline: 'u',
  strike: 's',
  code: 'code',
}

/**
 * Text node with its marks
 * @param {PageDocument} node - Text node
 * @param {string} key - React key
 * @return {ReactNode} - Rendered text
 */

const renderText = (node: PageDocument, key: string): ReactNode =>
  (node.marks ?? []).reduce<ReactNode>((inner, mark, index) => {
    if (mark.type === 'link') {
      const href = String(mark.attrs?.href ?? '')
      return isSafeHref(href)
        ? createElement('a', { key: `${key}-${index}`, href, rel: 'noopener noreferrer' }, inner)
        : inner
    }
    const tag = MARK_TAGS[mark.type]

    return tag ? createElement(tag, { key: `${key}-${index}` }, inner) : inner
  }, node.text ?? '')

// Block to element, children rendered inside
const BLOCKS: Record<string, (node: PageDocument, children: ReactNode) => ReactNode> = {
  doc: (_node, children) => children,
  paragraph: (_node, children) => createElement('p', null, children),
  heading: (node, children) => createElement(`h${Number(node.attrs?.level ?? 1)}`, null, children),
  bulletList: (_node, children) => createElement('ul', null, children),
  orderedList: (_node, children) => createElement('ol', null, children),
  listItem: (_node, children) => createElement('li', null, children),
  taskList: (_node, children) => createElement('ul', { 'data-type': 'taskList' }, children),
  taskItem: (node, children) =>
    createElement(
      'li',
      { 'data-type': 'taskItem', 'data-checked': String(Boolean(node.attrs?.checked)) },
      createElement(
        'label',
        null,
        createElement('input', {
          type: 'checkbox',
          checked: Boolean(node.attrs?.checked),
          readOnly: true,
          disabled: true,
        })
      ),
      createElement('div', null, children)
    ),
  blockquote: (_node, children) => createElement('blockquote', null, children),
  codeBlock: (_node, children) => createElement('pre', null, createElement('code', null, children)),
  horizontalRule: () => createElement('hr'),
  hardBreak: () => createElement('br'),
  image: (node) =>
    createElement('img', { src: String(node.attrs?.src ?? ''), alt: PAGE_EDITOR_COPY.imageAlt }),
  callout: (node, children) =>
    createElement('aside', { 'data-callout': '' }, `${String(node.attrs?.icon ?? '')} `, children),
  subpage: () => createElement('p', null, createElement('em', null, PAGES_COPY.subpagesTitle)),
}

/**
 * Render one node
 * @param {PageDocument} node - Node
 * @param {string} key - React key
 * @return {ReactNode} - Rendered node
 */

const renderNode = (node: PageDocument, key: string): ReactNode => {
  if (node.type === 'text') return renderText(node, key)

  const children = node.content?.map((child, index) => renderNode(child, `${key}-${index}`))
  const block = BLOCKS[node.type]

  return createElement(Fragment, { key }, block ? block(node, children) : children)
}

export interface PageDocumentViewProps {
  content: PageDocument
}

/**
 * Read-only render of a stored document, no editor needed
 * @param {PageDocument} content - Document
 * @return {JSX.Element}
 */

export const PageDocumentView = ({ content }: PageDocumentViewProps) => (
  <div className="page-editor">
    <div className="ProseMirror">{renderNode(content, 'doc')}</div>
  </div>
)
