import type { Editor } from '@tiptap/core'
import { relativePositionToAbsolutePosition, ySyncPluginKey } from '@tiptap/y-tiptap'
import * as Y from 'yjs'
import type { Awareness } from 'y-protocols/awareness'

// Portraits served by Memora or over https
const SAFE_IMAGE = /^(\/|https:\/\/)/

/**
 * Collaborator caret, in pixels from the frame
 * @typedef {Object} PeerCaret
 */

export interface PeerCaret {
  id: number
  x: number
  y: number
  height: number
  name: string
  image: string | null
  tint: unknown
}

/**
 * Where every other member's caret stands
 * @param {Editor} editor - Editor
 * @param {Awareness} awareness - Carets
 * @param {HTMLElement} frame - Positioning frame
 * @return {PeerCaret[]} - Carets on screen
 */

export const peerCaretsOf = (
  editor: Editor,
  awareness: Awareness,
  frame: HTMLElement
): PeerCaret[] => {
  const sync = ySyncPluginKey.getState(editor.state)
  if (!sync?.binding || !sync.doc) return []
  const origin = frame.getBoundingClientRect()
  const last = Math.max(editor.state.doc.content.size - 1, 0)
  const carets: PeerCaret[] = []

  for (const [id, state] of awareness.getStates()) {
    const cursor = state.cursor as { head?: unknown } | undefined
    if (id === awareness.clientID || !cursor?.head) continue
    const head = relativePositionToAbsolutePosition(
      sync.doc,
      sync.type,
      Y.createRelativePositionFromJSON(cursor.head),
      sync.binding.mapping
    )
    if (head === null) continue

    const box = editor.view.coordsAtPos(Math.min(head, last))
    const user = (state.user ?? {}) as Record<string, unknown>
    carets.push({
      id,
      x: box.left - origin.left,
      y: box.top - origin.top,
      height: box.bottom - box.top,
      name: typeof user.name === 'string' ? user.name : '',
      image: typeof user.image === 'string' && SAFE_IMAGE.test(user.image) ? user.image : null,
      tint: user.tint,
    })
  }

  return carets
}
