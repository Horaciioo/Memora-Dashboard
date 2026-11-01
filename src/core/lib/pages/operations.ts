import type { Node as ProseNode } from '@tiptap/pm/model'
import type { EditorState, Transaction } from '@tiptap/pm/state'

import { BLOCK_ID_ATTRIBUTE, BLOCK_NODE_TYPES } from '@/core/lib/pages/schema'

const BLOCK_TYPES = new Set(BLOCK_NODE_TYPES)

/**
 * Block found in a document
 * @typedef {Object} BlockAt
 * @property {ProseNode} node - Block node
 * @property {number} pos - Position before it
 */

export interface BlockAt {
  node: ProseNode
  pos: number
}

/**
 * Block standing at a position
 * @param {ProseNode} doc - Document
 * @param {number} pos - Position before the block
 * @return {BlockAt | null} - Block
 */

export const blockAt = (doc: ProseNode, pos: number): BlockAt | null => {
  const node = pos >= 0 && pos < doc.content.size ? doc.nodeAt(pos) : null

  return node && BLOCK_TYPES.has(node.type.name) ? { node, pos } : null
}

/**
 * Find a block by its id
 * @param {ProseNode} doc - Document
 * @param {string} id - Block id
 * @return {BlockAt | null} - Block
 */

export const findBlock = (doc: ProseNode, id: string): BlockAt | null => {
  let found: BlockAt | null = null

  doc.descendants((node, pos) => {
    if (found) return false
    if (node.attrs[BLOCK_ID_ATTRIBUTE] === id) found = { node, pos }

    return !found
  })

  return found
}

/**
 * Copy of a block with fresh ids
 * @param {ProseNode} node - Block
 * @param {() => string} newId - Id factory
 * @return {ProseNode} - Copy
 */

const cloneWithIds = (node: ProseNode, newId: () => string): ProseNode => {
  const json = node.toJSON() as { attrs?: Record<string, unknown>; content?: unknown[] }

  // Every nested block gets its own id
  const renew = (entry: { type?: string; attrs?: Record<string, unknown>; content?: unknown[] }): unknown => ({
    ...entry,
    ...(entry.type && BLOCK_TYPES.has(entry.type)
      ? { attrs: { ...entry.attrs, [BLOCK_ID_ATTRIBUTE]: newId() } }
      : {}),
    ...(entry.content ? { content: entry.content.map((child) => renew(child as typeof entry)) } : {}),
  })

  return node.type.schema.nodeFromJSON(renew(json as Parameters<typeof renew>[0]))
}

/**
 * Insert a copy right after a block
 * @param {EditorState} state - Editor state
 * @param {number} pos - Position before the block
 * @param {() => string} newId - Id factory
 * @return {Transaction | null} - Change
 */

export const duplicateBlock = (state: EditorState, pos: number, newId: () => string): Transaction | null => {
  const block = blockAt(state.doc, pos)
  if (!block) return null

  return state.tr.insert(pos + block.node.nodeSize, cloneWithIds(block.node, newId))
}

/**
 * Remove a block, keeping one line in an empty parent
 * @param {EditorState} state - Editor state
 * @param {number} pos - Position before the block
 * @return {Transaction | null} - Change
 */

export const removeBlock = (state: EditorState, pos: number): Transaction | null => {
  const block = blockAt(state.doc, pos)
  if (!block) return null

  const parent = state.doc.resolve(pos).parent
  // An only child leaves an empty paragraph behind
  if (parent.childCount === 1 && parent.type.name === 'doc') {
    return state.tr.replaceWith(pos, pos + block.node.nodeSize, state.schema.nodes.paragraph!.create())
  }

  return state.tr.delete(pos, pos + block.node.nodeSize)
}

/**
 * Swap a block with its sibling
 * @param {EditorState} state - Editor state
 * @param {number} pos - Position before the block
 * @param {-1 | 1} direction - Up or down
 * @return {Transaction | null} - Change, null at an edge
 */

export const moveBlock = (state: EditorState, pos: number, direction: -1 | 1): Transaction | null => {
  const block = blockAt(state.doc, pos)
  if (!block) return null

  const $pos = state.doc.resolve(pos)
  const index = $pos.index()
  const sibling = $pos.parent.maybeChild(index + direction)
  if (!sibling) return null

  // Remove then reinsert past the sibling
  const tr = state.tr.delete(pos, pos + block.node.nodeSize)
  const target = direction === 1 ? pos + sibling.nodeSize : pos - sibling.nodeSize

  return tr.insert(target, block.node)
}

/**
 * Ids of the blocks in reading order
 * @param {ProseNode} doc - Document
 * @return {string[]} - Block ids
 */

export const blockIds = (doc: ProseNode): string[] => {
  const ids: string[] = []

  doc.descendants((node) => {
    const id = node.attrs[BLOCK_ID_ATTRIBUTE]
    if (typeof id === 'string') ids.push(id)
  })

  return ids
}
