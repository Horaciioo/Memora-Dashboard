import type { Editor } from '@tiptap/core'

import type { PageBlockKind } from '@/declarations/pages/blocks'

/**
 * Gestures a block command may need
 * @typedef {Object} BlockCommandContext
 * @property {() => void} pickImage - Opens the file picker
 * @property {() => void} askLink - Asks for an address
 * @property {() => void} createSubpage - Creates a child page
 */

export interface BlockCommandContext {
  pickImage: () => void
  askLink: () => void
  createSubpage: () => void
}

type BlockCommand = (editor: Editor, context: BlockCommandContext) => void

/**
 * Heading command of one level
 * @param {1 | 2 | 3 | 4 | 5} level - Heading level
 * @return {BlockCommand} - Command
 */

const heading =
  (level: 1 | 2 | 3 | 4 | 5): BlockCommand =>
  (editor) =>
    editor.chain().focus().clearNodes().setHeading({ level }).run()

/**
 * Insert or turn the current block, one entry per block kind
 * @type {Record<PageBlockKind, BlockCommand>}
 */

export const BLOCK_COMMANDS: Record<PageBlockKind, BlockCommand> = {
  paragraph: (editor) => editor.chain().focus().clearNodes().setParagraph().run(),
  heading1: heading(1),
  heading2: heading(2),
  heading3: heading(3),
  heading4: heading(4),
  heading5: heading(5),
  bulletList: (editor) => editor.chain().focus().clearNodes().toggleBulletList().run(),
  orderedList: (editor) => editor.chain().focus().clearNodes().toggleOrderedList().run(),
  taskList: (editor) => editor.chain().focus().clearNodes().toggleTaskList().run(),
  blockquote: (editor) => editor.chain().focus().clearNodes().setBlockquote().run(),
  callout: (editor) => editor.chain().focus().clearNodes().setCallout().run(),
  codeBlock: (editor) => editor.chain().focus().clearNodes().setCodeBlock().run(),
  horizontalRule: (editor) => editor.chain().focus().setHorizontalRule().run(),
  image: (_editor, context) => context.pickImage(),
  link: (_editor, context) => context.askLink(),
  subpage: (_editor, context) => context.createSubpage(),
}
