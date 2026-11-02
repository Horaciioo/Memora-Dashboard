'use client'

import { useCallback, useRef, useState } from 'react'
import type { Editor } from '@tiptap/core'

import { BLOCK_COMMANDS } from '@/composites/pages/editor/commands'
import type { BlockCommandContext } from '@/composites/pages/editor/commands'
import { readSlash } from '@/composites/pages/editor/slash'
import type { SlashMatch } from '@/composites/pages/editor/slash'
import { filterBlocks } from '@/declarations/pages/blocks'
import type { PageBlockKind } from '@/declarations/pages/blocks'

/**
 * Open slash menu
 * @typedef {Object} SlashMenuState
 * @property {SlashMatch} match - Typed command
 * @property {{ left: number, top: number, bottom: number }} rect - Caret box
 * @property {number} index - Lit row
 */

export interface SlashMenuState {
  match: SlashMatch
  rect: { left: number; top: number; bottom: number }
  index: number
}

/**
 * Slash menu following the caret
 * @param {Editor | null} editor - Editor
 * @param {BlockCommandContext} context - Command gestures
 * @return {Object} - Menu state and handlers
 */

export const useSlashMenu = (editor: Editor | null, context: BlockCommandContext) => {
  const [menu, setMenu] = useState<SlashMenuState | null>(null)
  // Escape closes until the slash moves
  const dismissedAt = useRef<number | null>(null)

  const refresh = useCallback((current: Editor) => {
    const match = current.isEditable && current.isFocused ? readSlash(current) : null
    if (!match || dismissedAt.current === match.from) return setMenu((open) => (open ? null : open))

    const caret = current.view.coordsAtPos(match.to)
    setMenu((current) => ({
      match,
      rect: { left: caret.left, top: caret.top, bottom: caret.bottom },
      index: current?.match.query === match.query ? current.index : 0,
    }))
  }, [])

  const pick = useCallback(
    (kind: PageBlockKind) => {
      if (!editor || !menu) return
      // The typed command goes away first
      editor.chain().focus().deleteRange({ from: menu.match.from, to: menu.match.to }).run()
      setMenu(null)
      BLOCK_COMMANDS[kind](editor, context)
    },
    [context, editor, menu]
  )

  // Arrows, Enter and Escape while open
  const onKey = useCallback(
    (event: KeyboardEvent): boolean => {
      if (!menu) return false
      const kinds = filterBlocks(menu.match.query)
      const count = Math.max(kinds.length, 1)

      if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
        setMenu({
          ...menu,
          index: (menu.index + (event.key === 'ArrowDown' ? 1 : -1) + count) % count,
        })
        return true
      }
      if (event.key === 'Enter' && kinds[menu.index]) {
        pick(kinds[menu.index]!)
        return true
      }
      if (event.key === 'Escape') {
        dismissedAt.current = menu.match.from
        setMenu(null)
        return true
      }

      return false
    },
    [menu, pick]
  )

  const hover = useCallback(
    (index: number) => setMenu((current) => (current ? { ...current, index } : current)),
    []
  )

  return { menu, refresh, pick, onKey, hover }
}
