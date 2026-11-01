import type { Editor } from '@tiptap/core'
import { NodeSelection, TextSelection } from '@tiptap/pm/state'
import type { Transaction } from '@tiptap/pm/state'

import { BLOCK_COMMANDS } from '@/composites/pages/editor/commands'
import type { BlockCommandContext } from '@/composites/pages/editor/commands'
import { duplicateBlock, findBlock, moveBlock, removeBlock } from '@/core/lib/pages/operations'
import { PAGE_BLOCKS } from '@/declarations/pages/blocks'
import { PAGE_EDITOR_COPY } from '@/declarations/pages/copy'
import { TURN_INTO_BLOCKS } from '@/declarations/pages/editor'
import type { MenuItem } from '@/managers/front-end/MenuManager'

/**
 * What the block menu acts on
 * @typedef {Object} BlockMenuInput
 * @property {Editor} editor - Editor
 * @property {string} blockId - Block id
 * @property {BlockCommandContext} context - Command gestures
 * @property {(blockId: string) => void} copyLink - Copies the deep link
 */

export interface BlockMenuInput {
  editor: Editor
  blockId: string
  context: BlockCommandContext
  copyLink: (blockId: string) => void
}

/**
 * Run a block transaction found by id
 * @param {Editor} editor - Editor
 * @param {string} blockId - Block id
 * @param {(pos: number) => Transaction | null} build - Change
 * @return {void}
 */

const onBlock = (
  editor: Editor,
  blockId: string,
  build: (pos: number) => Transaction | null
): void => {
  const block = findBlock(editor.state.doc, blockId)
  const tr = block ? build(block.pos) : null
  if (tr) editor.view.dispatch(tr.scrollIntoView())
  editor.commands.focus()
}

/**
 * Place the caret inside a block
 * @param {Editor} editor - Editor
 * @param {string} blockId - Block id
 * @return {void}
 */

const focusBlock = (editor: Editor, blockId: string): void => {
  const block = findBlock(editor.state.doc, blockId)
  if (!block) return

  const inside = Math.min(block.pos + 1, editor.state.doc.content.size)
  editor.view.dispatch(
    editor.state.tr.setSelection(TextSelection.near(editor.state.doc.resolve(inside)))
  )
}

/**
 * Entries of the block handle menu
 * @param {BlockMenuInput} input - Block and gestures
 * @return {MenuItem[]} - Menu entries
 */

export const blockMenuItems = ({
  editor,
  blockId,
  context,
  copyLink,
}: BlockMenuInput): MenuItem[] => [
  {
    id: 'turn',
    label: PAGE_EDITOR_COPY.turnIntoMenu,
    icon: 'refresh',
    section: PAGE_EDITOR_COPY.sectionBlock,
    submenu: TURN_INTO_BLOCKS.map<MenuItem>((kind) => ({
      id: `turn-${kind}`,
      label: PAGE_BLOCKS.get(kind).label,
      icon: PAGE_BLOCKS.get(kind).icon,
      onSelect: () => {
        focusBlock(editor, blockId)
        BLOCK_COMMANDS[kind](editor, context)
      },
    })),
  },
  {
    id: 'duplicate',
    label: PAGE_EDITOR_COPY.duplicate,
    icon: 'duplicate',
    separatorBefore: true,
    onSelect: () =>
      onBlock(editor, blockId, (pos) =>
        duplicateBlock(editor.state, pos, () => crypto.randomUUID())
      ),
  },
  {
    id: 'up',
    label: PAGE_EDITOR_COPY.moveUp,
    icon: 'moveUp',
    onSelect: () => onBlock(editor, blockId, (pos) => moveBlock(editor.state, pos, -1)),
  },
  {
    id: 'down',
    label: PAGE_EDITOR_COPY.moveDown,
    icon: 'moveDown',
    onSelect: () => onBlock(editor, blockId, (pos) => moveBlock(editor.state, pos, 1)),
  },
  {
    id: 'link',
    label: PAGE_EDITOR_COPY.copyBlockLink,
    icon: 'link',
    separatorBefore: true,
    onSelect: () => copyLink(blockId),
  },
  {
    id: 'remove',
    label: PAGE_EDITOR_COPY.remove,
    icon: 'remove',
    danger: true,
    separatorBefore: true,
    onSelect: () => onBlock(editor, blockId, (pos) => removeBlock(editor.state, pos)),
  },
]

// Entries a divider keeps
const DIVIDER_ENTRIES = new Set(['duplicate', 'up', 'down', 'remove'])

/**
 * Entries of the divider menu
 * @param {BlockMenuInput} input - Block and gestures
 * @return {MenuItem[]} - Menu entries
 */

export const dividerMenuItems = (input: BlockMenuInput): MenuItem[] =>
  blockMenuItems(input).filter((item) => DIVIDER_ENTRIES.has(item.id))

// Item kinds that take a sibling item
const ITEM_TYPES = new Set(['listItem', 'taskItem'])

/**
 * Open a slash line right after a block
 * @param {Editor} editor - Editor
 * @param {string} blockId - Block id
 * @return {void}
 */

export const insertSlashLineAfter = (editor: Editor, blockId: string): void => {
  const block = findBlock(editor.state.doc, blockId)
  if (!block) return

  const after = block.pos + block.node.nodeSize
  const line = { type: 'paragraph', content: [{ type: 'text', text: '/' }] }
  const isItem = ITEM_TYPES.has(block.node.type.name)
  // An item gets a sibling item
  const node = isItem ? { type: block.node.type.name, content: [line] } : line

  editor
    .chain()
    .focus()
    .insertContentAt(after, node)
    .setTextSelection(after + (isItem ? 3 : 2))
    .run()
}

/**
 * Hand a whole block to the native drag, dropped where the cursor lands
 * @param {Editor} editor - Editor
 * @param {string} blockId - Block id
 * @param {DragEvent} event - Drag start
 * @return {void}
 */

export const startBlockDrag = (editor: Editor, blockId: string, event: DragEvent): void => {
  const block = findBlock(editor.state.doc, blockId)
  if (!block || !event.dataTransfer) return

  const { view } = editor
  const selection = NodeSelection.create(view.state.doc, block.pos)
  view.dispatch(view.state.tr.setSelection(selection))

  // The block itself is the drag picture
  const element = view.nodeDOM(block.pos)
  if (element instanceof HTMLElement) event.dataTransfer.setDragImage(element, 0, 0)
  event.dataTransfer.effectAllowed = 'move'
  event.dataTransfer.setData('text/plain', block.node.textContent)
  // The node removes itself on drop, whatever the selection became
  const dragging = { slice: selection.content(), move: true, node: selection }
  view.dragging = dragging
}
