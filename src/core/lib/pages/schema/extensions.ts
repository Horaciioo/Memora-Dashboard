import type { AnyExtension } from '@tiptap/core'
import Image from '@tiptap/extension-image'
import { TaskItem, TaskList } from '@tiptap/extension-list'
import UniqueID from '@tiptap/extension-unique-id'
import StarterKit from '@tiptap/starter-kit'

import { Callout } from '@/core/lib/pages/schema/callout'
import { Subpage } from '@/core/lib/pages/schema/subpage'
import { isSafeHref } from '@/core/lib/pages/links'
import { PAGE_EDITOR_COPY } from '@/declarations/pages/copy'

/**
 * Heading levels a page offers
 * @type {(1 | 2 | 3 | 4 | 5)[]}
 */

export const PAGE_HEADING_LEVELS: (1 | 2 | 3 | 4 | 5)[] = [1, 2, 3, 4, 5]

/**
 * Node types carrying a block id
 * @type {string[]}
 */

export const BLOCK_NODE_TYPES = [
  'paragraph',
  'heading',
  'blockquote',
  'bulletList',
  'orderedList',
  'listItem',
  'taskList',
  'taskItem',
  'codeBlock',
  'horizontalRule',
  'image',
  'callout',
  'subpage',
]

/**
 * Attribute holding a block id
 * @type {string}
 */

export const BLOCK_ID_ATTRIBUTE = 'id'

/**
 * Extensions shaping the page schema, browser and server alike
 * @param {() => string} [generateId] - Block id factory
 * @return {AnyExtension[]} - Schema extensions
 */

export const pageSchemaExtensions = (generateId?: () => string): AnyExtension[] => [
  StarterKit.configure({
    heading: { levels: PAGE_HEADING_LEVELS },
    link: {
      openOnClick: false,
      autolink: true,
      defaultProtocol: 'https',
      isAllowedUri: (url) => isSafeHref(url),
    },
  }),
  TaskList,
  TaskItem.configure({
    nested: true,
    a11y: {
      checkboxLabel: (node, checked) =>
        (checked ? PAGE_EDITOR_COPY.taskChecked : PAGE_EDITOR_COPY.taskOpen).replace('{task}', node.textContent || PAGE_EDITOR_COPY.taskEmpty),
    },
  }),
  Image.configure({ inline: false, allowBase64: false }),
  Callout,
  Subpage,
  UniqueID.configure({
    types: BLOCK_NODE_TYPES,
    attributeName: BLOCK_ID_ATTRIBUTE,
    ...(generateId ? { generateID: generateId } : {}),
  }),
]
