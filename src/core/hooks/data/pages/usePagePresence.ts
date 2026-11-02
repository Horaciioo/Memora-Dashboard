'use client'

import { useCallback, useEffect, useState } from 'react'
import type { Editor } from '@tiptap/core'

import { usePresence } from '@/core/hooks/data/realtime'
import type { PresenceView } from '@/core/hooks/data/realtime'
import { BLOCK_ID_ATTRIBUTE } from '@/core/lib/pages/schema/extensions'
import { revealElement } from '@/core/lib/realtime/reveal'
import { PAGE_TOPICS } from '@/declarations/pages/topics'
import { PRESENCE_COPY } from '@/declarations/system/presence'
import { REALTIME_SETTINGS } from '@/declarations/system/realtime'

/**
 * Page presence with block positions
 * @typedef {Object} PagePresence
 */

export interface PagePresence extends PresenceView {
  // Block in words, null when gone
  describe: (place: string) => string | null
  jump: (place: string) => void
}

/**
 * Top block holding the caret
 * @param {Editor} editor - Editor
 * @return {string | null} - Block id
 */

const caretBlockOf = (editor: Editor): string | null => {
  const { $from } = editor.state.selection
  const id: unknown = $from.depth >= 1 ? $from.node(1).attrs[BLOCK_ID_ATTRIBUTE] : null

  return typeof id === 'string' ? id : null
}

/**
 * Rendered block of an id
 * @param {Editor | null} editor - Editor
 * @param {string} blockId - Block id
 * @return {HTMLElement | null} - Element
 */

const blockElementOf = (editor: Editor | null, blockId: string): HTMLElement | null =>
  editor?.view.dom.querySelector<HTMLElement>(
    `[data-${BLOCK_ID_ATTRIBUTE}="${CSS.escape(blockId)}"]`
  ) ?? null

/**
 * Who reads the page and where
 * @param {string} pageId - Page id
 * @param {Editor | null} editor - Editor once ready
 * @return {PagePresence} - Presence and gestures
 */

export const usePagePresence = (pageId: string, editor: Editor | null): PagePresence => {
  const [blockId, setBlockId] = useState<string | null>(null)
  const presence = usePresence(PAGE_TOPICS.page(pageId), blockId)

  // Follow the caret
  useEffect(() => {
    if (!editor) return
    const follow = () => setBlockId(caretBlockOf(editor))
    editor.on('selectionUpdate', follow)
    editor.on('focus', follow)

    return () => {
      editor.off('selectionUpdate', follow)
      editor.off('focus', follow)
    }
  }, [editor])

  const describe = useCallback(
    (id: string) => {
      const element = blockElementOf(editor, id)
      if (!element) return null

      const preview = (element.textContent ?? '')
        .trim()
        .slice(0, REALTIME_SETTINGS.presencePreviewLength)

      return preview
        ? PRESENCE_COPY.position.replace('{block}', preview)
        : PRESENCE_COPY.positionEmpty
    },
    [editor]
  )

  const jump = useCallback((id: string) => void revealElement(blockElementOf(editor, id)), [editor])

  return { ...presence, describe, jump }
}
