'use client'

import { useCallback, useRef, useState } from 'react'
import type { PointerEvent } from 'react'

import { orderKeys } from '@/utils/format/calendar'

/**
 * Stretch of the grid the pointer is drawing
 * @typedef {Object} SlotDraft
 * @property {string} from - Key the pointer went down on
 * @property {string} to - Key the pointer is currently over
 */

export interface SlotDraft {
  from: string
  to: string
}

/**
 * Handlers wiring one grid to click-and-slide creation
 * @typedef {Object} SlotDrafting
 * @property {SlotDraft | null} draft - Stretch being drawn
 * @property {(key: string) => boolean} covers - Key sits inside the stretch
 * @property {(key: string) => object} slotProps - Props of one draftable cell
 */

export interface SlotDrafting {
  draft: SlotDraft | null
  covers: (key: string) => boolean
  slotProps: (key: string) => {
    onPointerDown: (event: PointerEvent<HTMLElement>) => void
    onPointerEnter: () => void
  }
}

/**
 * Draw a stretch of the grid with the pointer, the release opening a prefilled form
 * @param {(from: string, to: string) => void} onDrawn - Handler of the released stretch
 * @param {boolean} enabled - Drafting is allowed
 * @return {SlotDrafting} - Draft state and props
 */

export const useSlotDraft = (
  onDrawn: (from: string, to: string) => void,
  enabled: boolean
): SlotDrafting => {
  const [draft, setDraft] = useState<SlotDraft | null>(null)

  // The gesture is mirrored outside React state, so the release never fires twice
  const pending = useRef<SlotDraft | null>(null)

  const slotProps = useCallback(
    (key: string) => ({
      onPointerDown: (event: PointerEvent<HTMLElement>) => {
        // A press on a card, a button or a link is never a draft
        if (!enabled || event.button !== 0) return
        if ((event.target as HTMLElement).closest('button, a')) return

        pending.current = { from: key, to: key }
        setDraft(pending.current)

        // The release can land anywhere, so the window owns the end of the gesture
        const finish = () => {
          window.removeEventListener('pointerup', finish)

          const drawn = pending.current
          pending.current = null
          setDraft(null)

          if (drawn) onDrawn(...orderKeys(drawn.from, drawn.to))
        }

        window.addEventListener('pointerup', finish)
      },
      onPointerEnter: () => {
        if (!pending.current) return

        pending.current = { ...pending.current, to: key }
        setDraft(pending.current)
      },
    }),
    [enabled, onDrawn]
  )

  const covers = useCallback(
    (key: string) => {
      if (!draft) return false

      const [from, to] = orderKeys(draft.from, draft.to)

      return key >= from && key <= to
    },
    [draft]
  )

  return { draft, covers, slotProps }
}
