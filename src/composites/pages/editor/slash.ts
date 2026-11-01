import type { Editor } from '@tiptap/core'

/**
 * Slash typed before the caret
 * @typedef {Object} SlashMatch
 * @property {string} query - Words after the slash
 * @property {number} from - Slash position
 * @property {number} to - Caret position
 */

export interface SlashMatch {
  query: string
  from: number
  to: number
}

// Slash at line start or after a space
const SLASH_PATTERN = /(?:^|\s)\/([^\s/]{0,24})$/

/**
 * Read a slash command being typed
 * @param {Editor} editor - Editor
 * @return {SlashMatch | null} - Match
 */

export const readSlash = (editor: Editor): SlashMatch | null => {
  const { $from, empty } = editor.state.selection
  if (!empty || $from.parent.type.spec.code || !$from.parent.isTextblock) return null

  const before = $from.parent.textBetween(0, $from.parentOffset, undefined, '￼')
  const match = SLASH_PATTERN.exec(before)
  if (!match) return null

  const query = match[1] ?? ''

  return { query, from: $from.pos - query.length - 1, to: $from.pos }
}
