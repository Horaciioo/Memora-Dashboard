'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'

/**
 * Selection of a board
 * @typedef {Object} BoardSelection
 * @property {string[]} ids - Selected ids still on screen
 * @property {(id: string) => void} toggle - Add or drop one id
 * @property {(ids: string[], additive: boolean) => void} pick - Replace or extend the selection
 * @property {() => void} clear - Drop everything
 */

export interface BoardSelection {
  ids: string[]
  toggle: (id: string) => void
  pick: (ids: string[], additive: boolean) => void
  clear: () => void
}

/**
 * Track the cards picked on a board
 * @param {{ id: string }[]} cards - Cards on screen
 * @return {BoardSelection} - Selection and its gestures
 */

export const useBoardSelection = (cards: { id: string }[]): BoardSelection => {
  const [picked, setPicked] = useState<string[]>([])

  // A card leaving the screen leaves the selection
  const ids = useMemo(() => {
    const shown = new Set(cards.map((card) => card.id))

    return picked.filter((id) => shown.has(id))
  }, [picked, cards])

  const toggle = useCallback(
    (id: string) =>
      setPicked((current) =>
        current.includes(id) ? current.filter((entry) => entry !== id) : [...current, id]
      ),
    []
  )

  const pick = useCallback(
    (next: string[], additive: boolean) =>
      setPicked((current) => (additive ? [...new Set([...current, ...next])] : next)),
    []
  )

  const clear = useCallback(() => setPicked([]), [])

  // Escape drops the selection
  useEffect(() => {
    if (ids.length === 0) return

    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') clear()
    }
    window.addEventListener('keydown', onKey)

    return () => window.removeEventListener('keydown', onKey)
  }, [ids.length, clear])

  return { ids, toggle, pick, clear }
}
